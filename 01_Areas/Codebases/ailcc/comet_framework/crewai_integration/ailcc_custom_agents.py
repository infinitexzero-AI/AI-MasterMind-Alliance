from crewai import Agent, Task, Crew, Process
from langchain.tools import tool
from dotenv import load_dotenv

load_dotenv()

class AILCCTools:
    @tool("Report to Dashboard")
    def report_status(message: str):
        """useful for reporting status or findings back to the AILCC Dashboard"""
        # In a real scenario, this would post to the dashboard API
        print(f"\n[AILCC DASHBOARD LINK] >> Reporting: {message}\n")
        return "Status Reported"

def create_ailcc_crew():
    print("Initializing AILCC Orchestration Crew...")

    # Define the AILCC Orchestrator Agent
    orchestrator = Agent(
        role='AILCC Orchestrator',
        goal='Ensure seamless integration between autonomy and user intent',
        backstory="""You are the central nervous system of the AI Lifecycle Command Center.
        Your job is to take high-level intent and delegate it to the right subsystems,
        while keeping the user informed via the dashboard.""",
        verbose=True,
        allow_delegation=True,
        tools=[AILCCTools.report_status]
    )

    # Define a task
    dashboard_sync_task = Task(
        description="""Analyze the current system status (simulated) and 
        report a summary to the dashboard using the tool.""",
        expected_output="Confirmation that status was reported",
        agent=orchestrator
    )

    crew = Crew(
        agents=[orchestrator],
        tasks=[dashboard_sync_task],
        verbose=True,
        process=Process.sequential
    )

    return crew.kickoff()

if __name__ == "__main__":
    result = create_ailcc_crew()
    print("Final Orchestration Result:", result)
