"""
ANTIGRAVITY NAVIGATOR v1.0
Powered by browser-use
"""
import os
import asyncio
from langchain_google_genai import ChatGoogleGenerativeAI
from browser_use import Agent
from dotenv import load_dotenv

load_dotenv()

# Initialize Gemini
llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-pro",
    google_api_key=os.getenv("GEMINI_API_KEY")
)

async def run_navigator(task_description: str):
    """
    Spawns a browser agent to execute the task.
    """
    print(f"🧭 NAVIGATOR: Starting task -> {task_description}")
    
    agent = Agent(
        task=task_description,
        llm=llm,
    )
    
    result = await agent.run()
    print(f"✅ NAVIGATOR: Task Complete. Result: {result}")
    return result

if __name__ == "__main__":
    # Test
    asyncio.run(run_navigator("Go to google.com and search for 'Antigravity SDK'"))
