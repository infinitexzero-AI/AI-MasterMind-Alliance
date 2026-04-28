import os
import sys
from pathlib import Path

def globalize():
    old_root = "c:/Users/infin/AILCC_PRIME/01_Areas/Codebases/ailcc"
    new_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    
    print(f"Globalizing project paths...")
    print(f"Old Root: {old_root}")
    print(f"New Root: {new_root}")
    
    # Files to ignore
    ignore_dirs = {'.git', 'node_modules', '.sync', 'tmp', 'logs'}
    
    for root, dirs, files in os.walk(new_root):
        dirs[:] = [d for d in dirs if d not in ignore_dirs]
        
        for file in files:
            if file.endswith(('.py', '.js', '.ts', '.tsx', '.sh', '.json', '.md')):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    if old_root in content:
                        print(f"Fixing: {file_path}")
                        # Special case for Python files: try to use Path(__file__) if possible, 
                        # but for now just replace with absolute path to keep it simple.
                        new_content = content.replace(old_root, new_root.replace('\\', '/'))
                        
                        with open(file_path, 'w', encoding='utf-8') as f:
                            f.write(new_content)
                except Exception as e:
                    # print(f"Could not process {file_path}: {e}")
                    pass

if __name__ == "__main__":
    globalize()
