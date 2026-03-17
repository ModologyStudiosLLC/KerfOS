"""LLM Chat Integration for Cabinet Designer


Provides a conversational interface for cabinet design assistance.
"""
from fastapi import HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
from datetime import datetime
import httpx
import os

# LLM Provider Configuration
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "openrouter")
LLM_API_KEY = os.getenv("LLM_API_KEY", "")
LLM_MODEL = os.getenv("LLM_MODEL", "z-ai/glm-5-turbo")
LLM_BASE_URL = {
    "openrouter": "https://openrouter.ai/api/v1/chat/completions",
    "anthropic": "https://api.anthropic.com/v1/messages",
    "openai": "https://api.openai.com/v1/chat/completions",
}

# Conversation state
conversations: Dict[str, List[Dict[str, Any]]] = {}

class ChatMessage(BaseModel):
    """Message in conversation"""
    role: str  # 'user', 'assistant', 'system'
    content: str
    timestamp: datetime = datetime.utcnow()

class ChatRequest(BaseModel):
    """Request model for chat endpoint"""
    message: str
    conversation_id: Optional[str] = None
    context: Optional[Dict[str, Any]] = None
    wizard_mode: bool = False

class ChatResponse(BaseModel):
    """Response model for chat endpoint"""
    message: str
    conversation_id: str
    suggested_actions: List[str] = []
    wizard_next_step: Optional[str] = None

def build_system_prompt(context: Optional[Dict[str, Any]] = None) -> str:
    """Build system prompt for LLM"""
    base_prompt = """You are an expert cabinet designer assistant for Modology Cabinet Designer.

Your role is to help users design custom cabinets efficiently and professionally.


Key information about cabinet design:
- Standard cabinet heights: Base cabinets ~34.5", Wall cabinets ~12"-30", Tall cabinets ~84"
- Standard depths: Base cabinets ~24", Wall cabinets ~12"
- Standard materials: Plywood (18mm, 3/4"), MDF (18mm), Hardwood (19mm)
- Common components: Shelves, doors, drawers, hinges, slides
- Waste optimization: Aim for <15% waste on sheet goods


Always be helpful, specific, and practical. Suggest dimensions and materials based on standard practices.
When users are unclear, ask clarifying questions.
"""
    
    if context:
        context_str = f"""

Current context:
- Cabinet count: {context.get('cabinet_count', 0)}
- Selected material: {context.get('selected_material', 'None')}
- Current components: {len(context.get('components', []))}
"""
        return base_prompt + context_str
    
    return base_prompt

def parse_suggested_actions(response_text: str) -> List[str]:
    """Parse suggested actions from LLM response"""
    actions = []
    
    # Common action patterns
    action_patterns = [
        ("add", ["add shelf", "add door", "add drawer", "add component"]),
        ("change", ["change material", "change width", "change height", "change depth", "update", "modify"]),
        ("create", ["create cabinet", "new cabinet", "design cabinet"]),
        ("export", ["export", "download", "save as"]),
        ("wizard", ["start wizard", "use wizard", "guided flow"]),
    ]
    
    lower_response = response_text.lower()
    for action_type, keywords in action_patterns:
        if any(keyword in lower_response for keyword in keywords):
            actions.append(action_type.capitalize())
            break
    
    # Add default suggestions
    if not actions:
        actions = ["Add Component", "Change Material", "Export Design"]
    
    return actions

def call_llm(messages: List[ChatMessage], context: Optional[Dict[str, Any]] = None) -> str:
    """Call LLM API to get response"""
    if not LLM_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="LLM API key not configured. Set LLM_API_KEY environment variable."
        )
    
    headers = {
        "Authorization": f"Bearer {LLM_API_KEY}",
        "Content-Type": "application/json",
    }
    
    if LLM_PROVIDER == "anthropic":
        headers["anthropic-version"] = "2023-06-01"
        # Anthropic format
        api_messages = [{
            "role": msg.role,
            "content": msg.content
        } for msg in messages]
        payload = {
            "model": LLM_MODEL,
            "max_tokens": 1024,
            "messages": api_messages,
        }
    else:
        # OpenRouter/OpenAI format
        api_messages = [{
            "role": msg.role,
            "content": msg.content
        } for msg in messages]
        payload = {
            "model": LLM_MODEL,
            "messages": api_messages,
            "max_tokens": 1024,
        }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                LLM_BASE_URL[LLM_PROVIDER],
                headers=headers,
                json=payload,
                timeout=30.0
            )
            response.raise_for_status()
            result = response.json()
            
            # Parse response based on provider
            if LLM_PROVIDER == "anthropic":
                content = result["content"][0]["text"]
            else:
                content = result["choices"][0]["message"]["content"]
            
            return content
        except httpx.HTTPError as e:
            raise HTTPException(
                status_code=500,
                detail=f"LLM API error: {str(e)}"
            )
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to call LLM: {str(e)}"
            )

def get_conversation(conversation_id: str) -> List[ChatMessage]:
    """Get conversation history by ID"""
    return conversations.get(conversation_id, [])

def save_conversation(conversation_id: str, messages: List[ChatMessage]):
    """Save conversation to state"""
    conversations[conversation_id] = messages

def generate_conversation_id() -> str:
    """Generate new conversation ID"""
    return datetime.utcnow().strftime("%Y%m%d_%H%M%S")

def extract_cabinet_commands(response_text: str) -> List[Dict[str, Any]]:
    """Extract cabinet design commands from LLM response
    
    Returns structured commands that the frontend can execute.
    """
    commands = []
    
    # Pattern for creating cabinets
    import re
    
    # Extract dimension patterns (e.g., "36 inches wide", "42" width")
    dimension_patterns = [
        r"(?P<width>\d+(?:\.\d+)?\s*(?:inches)?\s*wide|width)",
        r"(?P<height>\d+(?:\.\d+)?\s*(?:inches)?\s*tall|high)",
        r"(?P<depth>\d+(?:\.\d+)?\s*(?:inches)?\s*deep|depth)",
    ]
    
    for pattern in dimension_patterns:
        matches = re.findall(pattern, response_text, re.IGNORECASE)
        for match in matches:
            for name, value in match.nameditems():
                if value:
                    commands.append({
                        "type": "set_dimension",
                        "dimension": name.lower(),
                        "value": float(value)
                    })
    
    # Extract component patterns
    component_patterns = [
        r"(?:add|create)\s*(?P<quantity>\d+)\s*(?:more)?\s*(?P<component>shelves?|drawers?|doors?)",
        r"(?:add|create)\s*(?P<component>shelves?|drawers?|doors?)",
    ]
    
    for pattern in component_patterns:
        matches = re.findall(pattern, response_text, re.IGNORECASE)
        for match in matches:
            for name, value in match.nameditems():
                if name == "component":
                    commands.append({
                        "type": "add_component",
                        "component": value.lower(),
                        "quantity": match.get("quantity", 1)
                    })
                else:
                    commands.append({
                        "type": "add_component",
                        "component": name.lower(),
                        "quantity": value or 1
                    })
    
    return commands
