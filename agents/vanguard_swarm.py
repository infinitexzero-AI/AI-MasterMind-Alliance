import asyncio
from google.antigravity import Agent, LocalAgentConfig, types

# Vanguard Swarm - Core Orchestrator
# Powered by Google Antigravity SDK

async def main():
    print("🚀 Initializing Vanguard Swarm Core Orchestrator...")
    
    # Configure the base agent with subagent delegation capabilities
    config = LocalAgentConfig(
        capabilities=types.CapabilitiesConfig(
            enable_subagents=True,
            enable_write_tools=True
        )
    )

    async with Agent(config) as agent:
        print("✅ Antigravity Agent Swarm Online.")
        print("This is the core execution node for the Vanguard Command Center.")
        print("Awaiting operations...")
        
        # Start the interactive loop for Joel to issue commands to the swarm
        await agent.run_interactive_loop()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n🛑 Vanguard Swarm Core offline.")
