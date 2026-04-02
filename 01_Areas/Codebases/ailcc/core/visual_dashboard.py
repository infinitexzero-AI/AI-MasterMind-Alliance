import time
import json
import os
try:
    import psutil
    PSUTIL_AVAILABLE = True
except ImportError:
    PSUTIL_AVAILABLE = False
from rich.layout import Layout
from rich.live import Live
from rich.panel import Panel
from rich.table import Table
from rich.console import Console
from rich import box
from datetime import datetime
import random

# Configuration
AGENTS_REGISTRY_PATH = "../../ailcc-framework/ailcc-framework/registries/agents_registry.json"
MEMORY_PATH = "../../ailcc-framework/ailcc-framework/mission_memory.json"

console = Console()

def load_json(path):
    if os.path.exists(path):
        with open(path, 'r') as f:
            return json.load(f)
    return {}

def make_header():
    grid = Table.grid(expand=True)
    grid.add_column(justify="left", ratio=1)
    grid.add_column(justify="right")
    grid.add_row(
        "[b magenta]ANTIGRAVITY COMMAND CENTER[/b magenta] | [cyan]v2.0.1[/cyan]",
        f"[bold]{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}[/bold]"
    )
    return Panel(grid, style="white on blue", box=box.SQUARE)

def make_agents_table():
    registry = load_json(AGENTS_REGISTRY_PATH)
    table = Table(title="[b green]ACTIVE AGENTS MATRIX[/b green]", expand=True, box=box.ROUNDED)
    table.add_column("Agent ID", style="cyan")
    table.add_column("Role", style="magenta")
    table.add_column("Status", style="green")

    if not registry:
        table.add_row("WARN", "Registry Not Found", "OFFLINE")
    else:
        # Handle list of agents (standard format)
        if isinstance(registry, list):
             for agent in registry[:5]:
                name = agent.get("name", "Unknown")
                role = agent.get("role", "Worker") 
                table.add_row(name, role, "IDLE")
        # Handle dict of agents (legacy/alternative format)
        elif isinstance(registry, dict):
             # check if it wraps a list under "agents" key
             if "agents" in registry and isinstance(registry["agents"], list):
                 for agent in registry["agents"][:5]:
                    name = agent.get("name", "Unknown")
                    role = agent.get("role", "Worker")
                    table.add_row(name, role, "IDLE")
             else:
                 for name, details in list(registry.items())[:5]:
                    # If details is just a string (e.g. description), handle it
                    if isinstance(details, str):
                        table.add_row(name, details[:20], "IDLE") # Truncate description as role
                    elif isinstance(details, dict):
                        table.add_row(name, details.get("role", "Worker"), "IDLE")
                    else:
                         table.add_row(str(name), "Unknown", "IDLE")
            
    return table

def make_system_status():
    if PSUTIL_AVAILABLE:
        mem = psutil.virtual_memory()
        cpu = psutil.cpu_percent()
        ram_usage = f"{mem.percent}%"
    else:
        # Simulation Mode
        cpu = random.randint(10, 45)
        ram_usage = f"{random.randint(30, 60)}% (SIM)"

    table = Table(title="[b red]SYSTEM VITALS[/b red]", expand=True, box=box.ROUNDED)
    table.add_column("Metric", style="yellow")
    table.add_column("Value", style="white")
    
    table.add_row("CPU Load", f"{cpu}%")
    table.add_row("RAM Usage", ram_usage)
    table.add_row("Disk Space", "OK")
    table.add_row("Neural Link", "[green]CONNECTED[/green]")
    
    return table

def make_mission_log():
    memory = load_json(MEMORY_PATH)
    table = Table(title="[b yellow]LATEST MISSIONS[/b yellow]", expand=True, box=box.MINIMAL)
    table.add_column("Mission ID", style="dim")
    table.add_column("Objective", style="white")
    
    if memory and "missions" in memory:
        for mission in memory["missions"][-4:]:
            table.add_row(mission.get("id", "N/A")[:8], mission.get("objective", "Unknown")[:40]+"...")
    else:
        table.add_row("-", "No active missions")
        
    return table

def make_layout():
    layout = Layout()
    layout.split(
        Layout(name="header", size=3),
        Layout(name="main", ratio=1),
        Layout(name="footer", size=3)
    )
    layout["main"].split_row(
        Layout(name="left"),
        Layout(name="right"),
    )
    layout["left"].split_column(
        Layout(name="agents"),
        Layout(name="system")
    )
    layout["right"].update(make_mission_log())
    layout["agents"].update(make_agents_table())
    layout["system"].update(make_system_status())
    layout["header"].update(make_header())
    layout["footer"].update(Panel("[i]Press Ctrl+C to Exit Command Center[/i]", style="blue"))
    return layout

if __name__ == "__main__":
    console.clear()
    try:
        with Live(make_layout(), refresh_per_second=1, screen=True) as live:
            while True:
                live.update(make_layout())
                time.sleep(1)
    except KeyboardInterrupt:
        print("\n[red]Command Center Terminated.[/red]")
