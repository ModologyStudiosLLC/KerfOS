"""KerfOS assistant: a CopilotKit/LangGraph agent that answers with real KerfOS quote data."""
import os

from ag_ui_langgraph import add_langgraph_fastapi_endpoint
from copilotkit import CopilotKitMiddleware, LangGraphAGUIAgent
from deepagents import create_deep_agent
from dotenv import load_dotenv
from fastapi import FastAPI
from langchain_anthropic import ChatAnthropic
from langgraph.checkpoint.memory import MemorySaver

from tools import list_materials, quote_base_cabinet

load_dotenv()

SYSTEM_PROMPT = """You are the KerfOS assistant for cabinet makers and woodworkers.
Use list_materials and quote_base_cabinet for every price, sheet count and material question; never guess a number.
State the assumptions behind a quote (3/4 inch material, standard carcass). When comparing materials, quote each one
and show the results in a table. Keep answers short and in inches and US dollars."""

agent = create_deep_agent(
    model=ChatAnthropic(model=os.environ.get("LLM_MODEL", "claude-sonnet-5-5")),
    tools=[list_materials, quote_base_cabinet],
    middleware=[CopilotKitMiddleware()],
    # In-memory conversation state: fine for local use, resets on restart. Use a persistent saver in production.
    checkpointer=MemorySaver(),
    system_prompt=SYSTEM_PROMPT,
)

app = FastAPI()


@app.get("/health")
def health():
    return {"status": "ok"}


add_langgraph_fastapi_endpoint(
    app=app,
    agent=LangGraphAGUIAgent(name="kerfos_assistant", description="KerfOS cabinet quoting assistant", graph=agent),
    path="/",
)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8123, reload=True)
