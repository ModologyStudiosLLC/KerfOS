"""Main FastAPI application for Modology Cabinet Designer

Includes routers for:
- Cabinets, Materials, Hardware (core cabinet design)
- Cut Lists (optimization)
- Auth (user authentication)
- Collaboration (project sharing)
- Projects (project management)
- GCode (CNC export)
- Chat (AI assistant)
- Wizard (guided design)
- Stripe (payments)
- Templates (Phase 4 - project templates)
- Price Feeds (Phase 4 - live supplier pricing)
- Advanced Nesting (Phase 4 - non-guillotine algorithms)
- Edge Banding (Phase 4 - edge banding optimization)
- Hardware Recommendations (Phase 4 - design-based suggestions)
"""
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from pydantic import BaseModel
from typing import Dict, Any, Optional, List

from app.routers import (
    cabinets, materials, hardware, cutlists, auth, collaboration,
    projects, gcode, stripe, price_feeds, advanced_nesting,
    edge_banding, hardware_recommendations
)
from app.templates import router as templates_router
from app.database import engine, get_db
from app.models import Base
from app.gcode_generator import generate_gcode, GCodeConfig
from app.exporters import export_cabinet, MaterialInfo
from app.chat import ChatRequest, ChatResponse, call_llm, generate_conversation_id
from app.wizard import WizardRequest, WizardResponse, start_wizard, update_wizard_state, generate_cabinet_summary

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create database tables
    Base.metadata.create_all(bind=engine)
    yield
    # Shutdown
    pass

app = FastAPI(
    title="Modology Cabinet Designer API",
    description="""
API for AI-powered cabinet design tool with:
- Cabinet design and management
- Material selection and pricing
- Hardware inventory
- Cut list optimization with waste reduction
- CNC G-code export (GRBL, ShopBot, Shapeoko, X-Carve)
- 3D exports (OBJ, STL, 3MF, DXF)
- User authentication
- Project collaboration and sharing
- AI chat assistant
- Guided wizard mode
- Stripe subscription payments
- Project templates (kitchen, vanity, bookshelf)
- Live supplier price feeds
- Advanced nesting algorithms
- Edge banding optimization
- Hardware recommendations
    """,
    version="2.0.0",
    lifespan=lifespan
)

# CORS - Allow Vercel, Fly.io, and local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:4173",
        "https://modologystudios.com",
        "*.vercel.app",  # Vercel frontend
        "*.fly.dev",   # Fly.io backend
        "*.onrender.com",  # Render backend (if used)
        "*.pages.dev",  # Cloudflare Pages preview (if used)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "Modology Cabinet Designer API",
        "version": "2.0.0",
        "status": "running",
        "features": [
            "Cabinet design and management",
            "Material selection and pricing",
            "Hardware inventory",
            "Cut list optimization",
            "G-code generation (GRBL, ShopBot, Shapeoko, X-Carve)",
            "3D exports (OBJ, STL, 3MF, DXF)",
            "User authentication (JWT)",
            "Project collaboration and sharing",
            "AI chat assistant",
            "Guided wizard mode",
            "Stripe subscription payments",
            "Project templates (kitchen, vanity, bookshelf)",
            "Live supplier price feeds",
            "Advanced nesting algorithms",
            "Edge banding optimization",
            "Hardware recommendations"
        ],
        "endpoints": {
            "cabinets": "/api/cabinets",
            "materials": "/api/materials",
            "hardware": "/api/hardware",
            "cutlists": "/api/cutlists",
            "auth": "/api/auth",
            "projects": "/api/projects",
            "collaboration": "/api/collaboration",
            "gcode": "/api/gcode",
            "chat": "/api/chat",
            "wizard": "/api/wizard",
            "stripe": "/api/stripe",
            "templates": "/api/templates",
            "price_feeds": "/api/price-feeds",
            "advanced_nesting": "/api/advanced-nesting",
            "edge_banding": "/api/edge-banding",
            "hardware_recommendations": "/api/hardware-recommendations"
        }
    }

@app.get("/health")
async def health():
    return {"status": "healthy", "version": "2.0.0"}

@app.get("/init-db")
async def init_database():
    """
    Initialize database tables.
    This endpoint can be used to manually trigger table creation.
    """
    try:
        Base.metadata.create_all(bind=engine)
        tables = list(Base.metadata.tables.keys())
        return {
            "status": "success",
            "message": "Database tables created/verified",
            "tables": tables
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Chat endpoint
@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    AI chat endpoint for cabinet design assistance.
    
    Supports both free-form chat and wizard-guided flows.
    """
    try:
        # Generate conversation ID if not provided
        conversation_id = request.conversation_id or generate_conversation_id()
        
        # Build context from request
        context = request.context or {}
        
        # Add current cabinet count to context
        context["cabinet_count"] = context.get("cabinet_count", 0)
        
        # Call LLM
        from app.chat import ChatMessage
        messages = [ChatMessage(role="system", content="You are a helpful cabinet designer assistant.")]
        if request.message:
            messages.append(ChatMessage(role="user", content=request.message))
        
        response_text = await call_llm(messages, context)
        
        # Parse suggested actions
        from app.chat import parse_suggested_actions, extract_cabinet_commands
        suggested_actions = parse_suggested_actions(response_text)
        cabinet_commands = extract_cabinet_commands(response_text)
        
        return ChatResponse(
            message=response_text,
            conversation_id=conversation_id,
            suggested_actions=suggested_actions,
            wizard_next_step=None  # Will be filled by wizard if active
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")

# Wizard endpoints
@app.post("/api/wizard/start")
async def start_wizard_endpoint():
    """
    Start a new wizard session for guided cabinet design.
    """
    state = start_wizard(generate_conversation_id())
    return WizardResponse(
        current_step=state.current_step,
        prompt="What type of cabinet would you like to create?",
        options=[
            {"value": "base", "label": "Base Cabinet (for under countertops)", "description": "Standard base cabinet ~34.5\" high"},
            {"value": "wall", "label": "Wall Cabinet (above countertops)", "description": "Standard wall cabinet ~12\"-30\" high"},
            {"value": "tall", "label": "Tall Cabinet (pantry/utility)", "description": "Full-height cabinet ~84\""},
        ],
        state=state
    )

@app.post("/api/wizard/next")
async def wizard_next_endpoint(request: WizardRequest):
    """
    Advance wizard to next step.
    """
    state = update_wizard_state(request.conversation_id, "next")
    
    if state.current_step.value == "dimensions":
        cabinet_type = state.cabinet_type.value if state.cabinet_type else "base"
        from app.wizard import PRESETS, CabinetType
        presets = PRESETS.get(CabinetType(cabinet_type), [])
        return WizardResponse(
            current_step=state.current_step,
            prompt="Choose dimensions or use presets",
            options=[
                {"value": "preset", "label": "Use Preset", "description": "Select from standard cabinet sizes"},
                {"value": "custom", "label": "Custom Dimensions", "description": "Enter custom width, height, depth"},
            ],
            state=state
        )
    
    elif state.current_step.value == "components":
        from app.wizard import COMPONENT_PRESETS
        return WizardResponse(
            current_step=state.current_step,
            prompt="What components do you want to add?",
            options=[
                {"value": comp.name, "label": comp.name, "description": comp.description}
                for comp in COMPONENT_PRESETS[:6]  # First 6 components
            ],
            state=state
        )
    
    elif state.current_step.value == "material":
        from app.wizard import MATERIAL_PRESETS
        return WizardResponse(
            current_step=state.current_step,
            prompt="Choose a material",
            options=[
                {"value": mat.name, "label": mat.name, "description": f"{mat.type} - ${mat.price_per_sqft}/sqft"}
                for mat in MATERIAL_PRESETS
            ],
            state=state
        )
    
    elif state.current_step.value == "review":
        summary = generate_cabinet_summary(state)
        return WizardResponse(
            current_step=state.current_step,
            prompt="Review your cabinet design",
            options=[
                {"value": "finish", "label": "Create Cabinet", "description": "Finalize and create cabinet"},
                {"value": "back", "label": "Go Back", "description": "Make changes"},
            ],
            state=state,
            cabinet_summary=summary
        )
    
    return WizardResponse(
        current_step=state.current_step,
        prompt="Continue to next step",
        options=[],
        state=state
    )

@app.post("/api/wizard/select")
async def wizard_select_endpoint(request: WizardRequest):
    """
    Make a selection in current wizard step.
    """
    state = update_wizard_state(request.conversation_id, "select", request.data)
    
    # Check if wizard is complete
    from app.wizard import WizardStep
    if state.current_step == WizardStep.REVIEW:
        summary = generate_cabinet_summary(state)
        return WizardResponse(
            current_step=state.current_step,
            prompt="Cabinet created successfully!",
            options=[
                {"value": "new", "label": "Create Another", "description": "Start a new cabinet"},
                {"value": "exit", "label": "Return to Designer", "description": "Go to advanced cabinet builder"},
            ],
            state=state,
            cabinet_summary=summary
        )
    
    # Move to next step automatically
    next_state = update_wizard_state(request.conversation_id, "next")
    return WizardResponse(
        current_step=next_state.current_step,
        prompt="Continue",
        options=[],
        state=next_state
    )

# 3D Export endpoints
@app.post("/api/export/{format}")
async def export_endpoint(format: str, cabinet_data: Dict[str, Any]):
    """
    Export cabinet to 3D format (obj, stl, 3mf, dxf)
    """
    try:
        # Create material info from cabinet data
        material_info = MaterialInfo(
            name=cabinet_data.get("material", {}).get("name", "Birch Plywood"),
            type=cabinet_data.get("material", {}).get("type", "plywood"),
            thickness=cabinet_data.get("material", {}).get("thickness", 18.0)
        )
        
        # Export to specified format
        exported_content = export_cabinet(cabinet_data, material_info, format)
        
        return {
            "status": "success",
            "format": format,
            "content": exported_content if isinstance(exported_content, str) else exported_content.hex(),
            "filename": f"{cabinet_data.get('name', 'cabinet')}.{format}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")

# Include all routers
app.include_router(cabinets.router)
app.include_router(materials.router)
app.include_router(hardware.router)
app.include_router(cutlists.router)
app.include_router(auth.router)
app.include_router(collaboration.router)
app.include_router(projects.router)
app.include_router(gcode.router)
app.include_router(stripe.router)

# Phase 4 routers
app.include_router(templates_router)
app.include_router(price_feeds.router)
app.include_router(advanced_nesting.router)
app.include_router(edge_banding.router)
app.include_router(hardware_recommendations.router)
