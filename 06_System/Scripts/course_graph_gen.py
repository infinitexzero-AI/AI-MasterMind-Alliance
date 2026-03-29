#!/usr/bin/env python3
"""
Step 54: course_graph_gen.py
Generates a JSON graph of the BSc Biopsychology degree path and prerequisites.
"""

import json
import os

ROOT = "/Users/infinite27/AILCC_PRIME"
OUTPUT_FILE = f"{ROOT}/06_System/State/degree_graph.json"

def generate_graph():
    graph = {
        "nodes": [
            {"id": "BIOL 1001", "name": "Foundations of Biology", "type": "CORE", "status": "COMPLETED"},
            {"id": "CHEM 1001", "name": "Intro Chemistry I", "type": "CORE", "status": "COMPLETED"},
            {"id": "BIOL 2811", "name": "Genetics & Evolution", "type": "CORE", "status": "COMPLETED"},
            {"id": "PSYC 1001", "name": "Intro Psychology", "type": "CORE", "status": "COMPLETED"},
            {"id": "MATH 1111", "name": "Pre-Calculus", "type": "CORE", "status": "COMPLETED"},
            {"id": "MATH 1311", "name": "Calculus I", "type": "GOAL", "status": "PENDING"},
            {"id": "HLTH 1011", "name": "Health Studies", "type": "ELECTIVE", "status": "PENDING"},
            {"id": "DEGREE", "name": "BSc Biopsychology", "type": "ROOT", "status": "95%"}
        ],
        "links": [
            {"source": "MATH 1111", "target": "MATH 1311", "label": "Prerequisite"},
            {"source": "BIOL 1001", "target": "BIOL 2811", "label": "Prerequisite"},
            {"source": "MATH 1311", "target": "DEGREE", "label": "Fulfillment"},
            {"source": "HLTH 1011", "target": "DEGREE", "label": "Fulfillment"},
            {"source": "BIOL 2811", "target": "DEGREE", "label": "Fulfillment"},
            {"source": "PSYC 1001", "target": "DEGREE", "label": "Fulfillment"}
        ]
    }

    with open(OUTPUT_FILE, 'w') as f:
        json.dump(graph, f, indent=2)
    
    print(f"✅ Degree graph generated at {OUTPUT_FILE}")

if __name__ == "__main__":
    generate_graph()
