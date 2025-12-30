import sqlite3
import subprocess
import sys
import os

DB_PATH = "/Users/infinite27/Antigravity/knowledge.db"

def cast_spell(spell_name):
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT command_string FROM command_library WHERE name = ?", (spell_name,))
        row = cursor.fetchone()
        
        if row:
            command = row[0]
            print(f"🔮 Casting Spell: {spell_name}...")
            # Use shell=True for complex commands
            subprocess.run(command, shell=True, check=True)
            print(f"✨ Spell Successful: {spell_name}")
            cursor.execute("UPDATE command_library SET usage_count = usage_count + 1 WHERE name = ?", (spell_name,))
            conn.commit()
        else:
            print(f"❌ Spell Not Found: {spell_name}")
            
        conn.close()
    except Exception as e:
        print(f"💥 Spell Backfired: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 cast_spell.py <spell_name>")
    else:
        cast_spell(sys.argv[1])
