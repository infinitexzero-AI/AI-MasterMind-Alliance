import sys
import json
import os
from datetime import datetime
from vault_rag import query_vault

def generate_strategic_insight(date_context=None):
    if not date_context:
        date_context = datetime.now().strftime("%B %d, %Y")
    
    # Query vault for recent high-impact documents or project state
    query = f"project updates and strategic priorities for {date_context}"
    results = query_vault(query)
    
    # Extract Habits
    habits_path = "/Users/infinite27/AILCC_PRIME/02_Resources/Habits/DAILY_HABITS.md"
    top_habits = []
    if os.path.exists(habits_path):
        try:
            with open(habits_path, 'r') as f:
                habit_lines = f.readlines()
                for line in habit_lines:
                    if "[ ]" in line:
                        habit_name = line.split('|')[1].strip().replace('**', '')
                        top_habits.append(habit_name)
                    if len(top_habits) >= 3: break
        except Exception as e:
            print(f"Error reading habits: {e}")

    # Synthesize results into a concise brief
    insight = "### 🧠 S5-081 Strategic Insight\n"
    insight += f"Based on the Intelligence Vault analysis for {date_context}:\n\n"
    
    if results:
        for res in results[:2]: # Top 2 results
            insight += f"- **{res['filename']}**: {res['preview'][:150]}...\n"
    else:
        insight += "- No significant strategic shifts detected in the last 24 hours.\n"

    if top_habits:
        insight += "\n**🔥 Focus Habits Today**:\n"
        for h in top_habits:
            insight += f"- {h}\n"
    
    insight += "\n**Directive**: Maintain cross-platform sync and verify Watchdog autonomy."
    return insight

if __name__ == "__main__":
    context = sys.argv[1] if len(sys.argv) > 1 else None
    print(generate_strategic_insight(context))
