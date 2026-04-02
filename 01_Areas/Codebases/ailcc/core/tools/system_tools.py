
import os
import glob
import subprocess
from typing import List, Optional
from core.tool_manager import tool_manager

@tool_manager.register_tool("read_file", "Read the contents of a file at the given path.")
def read_file(path: str) -> str:
    """Read text from a file."""
    try:
        with open(path, 'r') as f:
            return f.read()
    except Exception as e:
        return f"Error reading file {path}: {e}"

@tool_manager.register_tool("write_file", "Write content to a file at the given path.")
def write_file(path: str, content: str) -> str:
    """Write text to a file. Overwrites if exists."""
    try:
        dirname = os.path.dirname(path)
        if dirname:
            os.makedirs(dirname, exist_ok=True)
        with open(path, 'w') as f:
            f.write(content)
        return f"Successfully wrote to {path}"
    except Exception as e:
        return f"Error writing to file {path}: {e}"

@tool_manager.register_tool("list_directory", "List files in a directory.")
def list_directory(path: str) -> str:
    """List files and directories at path."""
    try:
        items = os.listdir(path)
        return "\n".join(items)
    except Exception as e:
        return f"Error listing directory {path}: {e}"

@tool_manager.register_tool("find_file", "Deep search for a file by name across the system.")
def find_file(filename_pattern: str, search_depth: str = "deep") -> str:
    """
    Search for files matching the pattern.
    Levels:
    - 'fast': Spotlight (mdfind)
    - 'deep': 'find' command in Home Directory (slow)
    """
    results = []
    
    # Level 1: Spotlight (Fast)
    try:
        # Searching for Name matches
        cmd = ["mdfind", f"kMDItemDisplayName == '*{filename_pattern}*'c"]
        process = subprocess.run(cmd, capture_output=True, text=True)
        if process.returncode == 0 and process.stdout:
            results.extend(process.stdout.strip().split('\n'))
    except Exception as e:
        pass # Ignore spotlight errors
        
    if search_depth == "deep" or not results:
        # Level 2: Find command (slower, but covers unindexed spots)
        # Limiting to home dir to not scan entire root /
        home = os.path.expanduser("~")
        cmd = ["find", home, "-maxdepth", "5", "-name", f"*{filename_pattern}*"]
        try:
            process = subprocess.run(cmd, capture_output=True, text=True)
            if process.returncode == 0 and process.stdout:
                found = process.stdout.strip().split('\n')
                # Deduplicate
                for f in found:
                    if f not in results:
                        results.append(f)
        except Exception:
            pass

    if not results:
        return f"No files found matching '{filename_pattern}'"
    
    return "Found files:\n" + "\n".join(results[:20]) # Limit output
