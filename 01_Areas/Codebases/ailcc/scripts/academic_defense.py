import os
import sys
import json

def deconstruct_content(text):
    """
    Simulates the 'Structural Deconstruction' stage.
    Identifies core arguments and structural markers.
    """
    lines = text.split('\n')
    structure = {
        "header": [],
        "body": [],
        "footer": []
    }
    
    # Simple logic for simulation
    for line in lines:
        if line.startswith('#'):
            structure["header"].append(line)
        elif line.strip() == "":
            continue
        else:
            structure["body"].append(line)
            
    return structure

def apply_voice_injection(structure):
    """
    Simulates 'Voice Injection' using Valentine's arbiter tone.
    """
    refined_body = []
    for p in structure["body"]:
        # Prepend a 'Valentine' marker to demonstrate transformation
        refined_body.append(f"Arbiter Note: {p}")
    structure["body"] = refined_body
    return structure

def process_defense(input_path, output_path):
    if not os.path.exists(input_path):
        print(f"❌ Input not found: {input_path}")
        return
        
    with open(input_path, 'r') as f:
        content = f.read()
        
    print(f"🔄 Deconstructing {input_path}...")
    deconstructed = deconstruct_content(content)
    
    print(f"🔄 Injecting Arbiter Voice...")
    refined = apply_voice_injection(deconstructed)
    
    with open(output_path, 'w') as f:
        for part in ["header", "body", "footer"]:
            for line in refined[part]:
                f.write(line + "\n")
                
    print(f"✅ Academic Defense refined and saved to {output_path}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python3 academic_defense.py <input.md> <output.md>")
        sys.exit(1)
    
    process_defense(sys.argv[1], sys.argv[2])
