from crewai import Task

def create_tasks(query, agents):
    # Dynamic task generation based on query
    
    analysis_task = Task(
        description=f"Analyze the request: '{query}'. Break it down into technical steps.",
        agent=agents['orchestrator']
    )

    research_task = Task(
        description=f"Research necessary libraries or patterns for: '{query}'. Provide a summary.",
        agent=agents['researcher']
    )

    coding_task = Task(
        description=f"Write the initial code structure for: '{query}' based on research.",
        agent=agents['coder']
    )

    return [analysis_task, research_task, coding_task]
