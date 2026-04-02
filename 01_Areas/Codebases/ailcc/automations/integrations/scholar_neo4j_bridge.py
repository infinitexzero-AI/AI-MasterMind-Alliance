import os
import re
import json
import logging
import networkx as nx
from pathlib import Path

logging.basicConfig(level=logging.INFO, format='%(asctime)s - [SemanticBridge] - %(message)s')
logger = logging.getLogger("SemanticBridge")

AILCC_ROOT = Path(__file__).resolve().parent.parent.parent
NOTES_DIR = AILCC_ROOT / "hippocampus_storage" / "scholar_notes"
EXPORT_PATH = AILCC_ROOT / "hippocampus_storage" / "intelligence" / "scholar_graph.json"

class ScholarSemanticGraph:
    """
    Epoch 31 Core Logic: Validates flat directories of Markdown research notes 
    and synthesizes them into an absolute mathematical Relational Graph (Nodes & Edges).
    Outputs a lightweight D3.js compatible JSON payload to bypass heavy Neo4j JVM overhead.
    """
    def __init__(self):
        self.graph = nx.Graph()
        EXPORT_PATH.parent.mkdir(parents=True, exist_ok=True)

    def extract_yaml_frontmatter(self, text: str) -> dict:
        """Parses the Mastermind Markdown tags."""
        match = re.search(r'^---\\s*\\n(.*?)\\n---\\s*\\n', text, re.DOTALL | re.MULTILINE)
        meta = {}
        if match:
            for line in match.group(1).split('\\n'):
                if ':' in line:
                    key, val = line.split(':', 1)
                    val = val.strip().strip('"').strip("'")
                    
                    # Array extraction for 'tags: ["neuroscience", "ai"]'
                    if val.startswith('[') and val.endswith(']'):
                        val = [v.strip().strip('"').strip("'") for v in val[1:-1].split(',')]
                    meta[key.strip()] = val
        return meta

    def compile_matrix(self):
        logger.info("🧠 Compiling absolute Semantic Topology from Hippocampus Scholar Notes...")
        if not NOTES_DIR.exists():
            logger.error("Scholar Notes directory offline. Cannot trace topology.")
            return

        for md_path in NOTES_DIR.glob("*.md"):
            try:
                text = md_path.read_text(encoding='utf-8')
                meta = self.extract_yaml_frontmatter(text)
                
                node_id = meta.get('zotero_key', md_path.name)
                title = meta.get('title', md_path.name)
                
                # 1. Spawn Central Node for the Research Paper
                self.graph.add_node(node_id, label="paper", title=title[:40], classification=meta.get('data_classification', 'UNKNOWN'))
                
                # 2. Extract and Bind Tags mathematically
                tags = meta.get('tags', [])
                if isinstance(tags, str):
                    tags = [tags]
                    
                for tag in tags:
                    tag_id = f"tag_{tag.lower().replace(' ', '_')}"
                    self.graph.add_node(tag_id, label="tag", title=tag)
                    self.graph.add_edge(node_id, tag_id, relationship="TAGGED")

                # 3. Extract Explicit Mathematical Citations (e.g. [[arxiv_1234]])
                cites = re.findall(r'\\[\\[([^\\]]+)\\]\\]', text)
                for cite in cites:
                    self.graph.add_node(cite, label="citation", title=cite)
                    self.graph.add_edge(node_id, cite, relationship="CITES")
                    
            except Exception as e:
                logger.warning(f"Failed to ingest topological data from {md_path.name}: {e}")

    def export_d3_array(self):
        """Mathematically flattens the NetworkX array into a Next.js D3 compatible JSON blob."""
        logger.info(f"🕸️ Extracting Graph Array: {self.graph.number_of_nodes()} Nodes, {self.graph.number_of_edges()} Edges")
        
        data = nx.node_link_data(self.graph)
        
        with open(EXPORT_PATH, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
            
        logger.info(f"✅ Semantic Matrix successfully deposited at {EXPORT_PATH}")

if __name__ == "__main__":
    bridge = ScholarSemanticGraph()
    bridge.compile_matrix()
    bridge.export_d3_array()
