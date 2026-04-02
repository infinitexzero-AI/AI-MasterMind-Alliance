#!/usr/bin/env python3
"""
stateful_scholar.py — Phase VI: LangGraph Stateful Execution
============================================================
Unlike linear Python daemons which crash when they hit a wall, this script uses
LangGraph to construct a stateful cycle. 

If the Scholar agent hits a blocker (like a paywall for a research paper), it
pauses its node execution, saves its state to Memory, and effectively waits
for user intervention via the OmniTracker before resuming.

Usage:
    python3 stateful_scholar.py --research "Arxiv Paper Abstract"
"""

import logging
import argparse
from typing import TypedDict, Annotated, Sequence
import operator

try:
    from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
    from langgraph.graph import StateGraph, END
    from langgraph.checkpoint.sqlite import SqliteSaver
except ImportError:
    print("LangGraph / LangChain not installed. Run: pip install langgraph langchain-core")
    exit(1)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [StatefulScholar] %(message)s")
logger = logging.getLogger(__name__)

# 1. Define the State Structure
class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], operator.add]
    blocked_reason: str
    status: str

# 2. Define the Nodes
def research_node(state: AgentState):
    logger.info("🔬 Node: Initiating Research...")
    messages = state['messages']
    last_msg = messages[-1].content
    
    # Mock capability check: "If paper needs login, block state"
    if "paywall" in last_msg.lower() or "login" in last_msg.lower():
        logger.warning("Paywall detected. State blocked.")
        return {"blocked_reason": "Needs User Credentials", "status": "BLOCKED"}
    
    return {"blocked_reason": "", "status": "COMPLETED"}

def omnitracker_block_node(state: AgentState):
    logger.info(f"🛑 Node: Halted. Sent alert to Tycoon: {state.get('blocked_reason')}")
    # In reality, this node would write to /api/omnitracker API payload
    # to alert the Commander in the dashboard.
    return {"status": "AWAITING_USER"}

def summarize_node(state: AgentState):
    logger.info("✅ Node: Research Successful. Writing to Hippocampus...")
    return {"status": "SUCCESS"}

# 3. Define the Edges (Routing Logic)
def router(state: AgentState) -> str:
    status = state.get("status", "")
    if status == "BLOCKED":
        return "omnitracker_block_node"
    return "summarize_node"

def build_graph():
    # Construct the state machine graph
    workflow = StateGraph(AgentState)
    
    workflow.add_node("research", research_node)
    workflow.add_node("omnitracker_block_node", omnitracker_block_node)
    workflow.add_node("summarize", summarize_node)
    
    workflow.set_entry_point("research")
    workflow.add_conditional_edges("research", router)
    workflow.add_edge("omnitracker_block_node", END)  # Pauses until user acts
    workflow.add_edge("summarize", END)
    
    return workflow

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--research", type=str, required=True, help="Topic to research")
    args = parser.parse_args()

    graph = build_graph()
    
    # In-memory checkpointing (would save to sqlite/postgres in prod)
    memory = SqliteSaver.from_conn_string(":memory:")
    app = graph.compile(checkpointer=memory)
    
    config = {"configurable": {"thread_id": "scholar_research_1"}}

    # Initial Input
    initial_state = {"messages": [HumanMessage(content=args.research)]}
    
    print(f"\\n🚀 Dispatching Stateful Scholar for: '{args.research}'")
    for event in app.stream(initial_state, config=config):
        for node, data in event.items():
            print(f"--> Triggered Node: [{node}] | Status: {data.get('status')}")
    
    print("\\nWorkflow Execution Paused/Finished.\\n")
