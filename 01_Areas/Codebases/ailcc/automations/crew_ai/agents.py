from crewai import Agent
from langchain.llms import OpenAI

# Mock LLM for now if no API key is present, or assume env is set
# real implementation would need OAI/Antrophic keys
# For this "skeleton" phase, we'll define them standard.

def get_agents():
    orchestrator = Agent(
        role='Orchestrator',
        goal='Manage the overall task execution and delegate subtotals.',
        backstory='You are the central nervous system of the AILCC. You break down complex user requests into smaller tasks.',
        verbose=True,
        allow_delegation=True
    )

    researcher = Agent(
        role='Researcher',
        goal='Find accurate information to support the task.',
        backstory='You are an expert researcher with access to the entire internet and local knowledge bases.',
        verbose=True,
        allow_delegation=False
    )

    coder = Agent(
        role='Senior Engineer',
        goal='Implement code based on specifications.',
        backstory='You are a rigorous software engineer who writes clean, tested TypeScript and Python code.',
        verbose=True,
        allow_delegation=False
    )

    return {
        "orchestrator": orchestrator,
        "researcher": researcher,
        "coder": coder
    }
