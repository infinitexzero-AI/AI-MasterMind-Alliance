import os
from crewai import Agent, Task, Crew, Process
from dotenv import load_dotenv

load_dotenv()

# NOTE: Ensure OPENAI_API_KEY is set in your environment
# os.environ["OPENAI_API_KEY"] = "your-key"

def create_starter_crew():
    print("Initializing Starter Crew...")

    # 1. Define Agents
    researcher = Agent(
        role='Senior Research Analyst',
        goal='Uncover cutting-edge developments in AI agents',
        backstory="""You work at a leading tech think tank.
        Your expertise lies in identifying emerging trends.
        You have a knack for dissecting complex data and presenting actionable insights.""",
        verbose=True,
        allow_delegation=False
    )

    writer = Agent(
        role='Tech Content Strategist',
        goal='Craft compelling content on tech advancements',
        backstory="""You are a renowned Content Strategist, known for
        your insightful and engaging articles.
        You transform complex concepts into compelling narratives.""",
        verbose=True,
        allow_delegation=True
    )

    # 2. Define Tasks
    task1 = Task(
        description="""Conduct a comprehensive analysis of the latest advancements in AI agent frameworks in 2024.
        Identify key trends, breakthrough technologies, and potential industry impacts.""",
        expected_output="Full analysis report in bullet points",
        agent=researcher
    )

    task2 = Task(
        description="""Using the insights provided, develop an engaging blog post
        that highlights the most significant AI agent advancements.
        Your post should be informative yet accessible, catering to a tech-savvy audience.
        Make it sound cool, avoid complex jargon.""",
        expected_output="Full blog post of at least 4 paragraphs",
        agent=writer
    )

    # 3. Instantiate Crew
    crew = Crew(
        agents=[researcher, writer],
        tasks=[task1, task2],
        verbose=True, # Changed from 2 to True for strict boolean validation
        process=Process.sequential
    )

    # 4. Kickoff
    result = crew.kickoff()
    return result

if __name__ == "__main__":
    result = create_starter_crew()
    print("######################")
    print("## Final Result ##")
    print("######################")
    print(result)
