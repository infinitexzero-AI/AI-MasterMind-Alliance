import os
import json
import logging
import networkx as nx

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] [%(levelname)s] %(message)s")
logger = logging.getLogger("GraphRAG")

GRAPH_FILE = os.path.expanduser("~/.ailcc/graph_rag.gml")

class GraphRAGDaemon:
    """
    Epoch IX Phase 67: The Infinite Context Engine (GraphRAG Overlay).
    Maintains a 3D directed graph of relationships between components,
    running in parallel to ChromaDB's flat vector similarity matching.
    """
    def __init__(self):
        self.graph = nx.DiGraph()
        self._load_graph()

    def _load_graph(self):
        if os.path.exists(GRAPH_FILE):
            try:
                self.graph = nx.read_gml(GRAPH_FILE)
                logger.info(f"Knowledge Graph loaded: {len(self.graph.nodes)} nodes, {len(self.graph.edges)} edges.")
            except Exception as e:
                logger.error(f"Failed to load GraphRAG file: {e}. Starting fresh.")
                self.graph = nx.DiGraph()
        else:
            logger.info("Initializing fresh Knowledge Graph.")

    def _save_graph(self):
        os.makedirs(os.path.dirname(GRAPH_FILE), exist_ok=True)
        try:
            nx.write_gml(self.graph, GRAPH_FILE)
        except Exception as e:
            logger.error(f"Failed to save GraphRAG file: {e}")

    def add_relationship(self, source: str, target: str, relationship: str, metadata: dict = None):
        """
        Injects a logical edge into the graph memory.
        Example: add_relationship('orchestration_engine.py', 'relay.js', 'SENDS_JSON_TO')
        """
        source = source.strip().lower()
        target = target.strip().lower()
        
        if not self.graph.has_node(source):
            self.graph.add_node(source)
        if not self.graph.has_node(target):
            self.graph.add_node(target)
            
        self.graph.add_edge(source, target, relation=relationship, **(metadata or {}))
        self._save_graph()
        logger.info(f"Graph Edge Added: ({source}) -[{relationship}]-> ({target})")

    def retrieve_logical_chain(self, start_node: str, depth: int = 2) -> list:
        """
        Deduces logic by walking the graph from a starting entity.
        Useful when an Orchestrator encounters an error in one file, to find what caused it 2 steps away.
        """
        start_node = start_node.strip().lower()
        
        if not self.graph.has_node(start_node):
            return [f"Node '{start_node}' not found in Knowledge Graph."]

        edges_found = []
        try:
            # Get the neighborhood up to 'depth' edges away
            subgraph = nx.ego_graph(self.graph, start_node, radius=depth)
            
            for u, v, data in subgraph.edges(data=True):
                relation = data.get('relation', 'INTERACTS_WITH')
                edges_found.append(f"({u}) -[{relation}]-> ({v})")
                
            return edges_found
        except Exception as e:
            logger.error(f"Error traversing GraphRAG: {e}")
            return []

    def clear_graph(self):
        """Purges the entire Knowledge Graph."""
        self.graph.clear()
        self._save_graph()
        logger.info("Knowledge Graph purged.")

if __name__ == "__main__":
    # Internal Verification Sandbox
    grag = GraphRAGDaemon()
    grag.add_relationship("orchestration_engine.py", "blackboard_daemon.py", "DELEGATES_CODE_REVIEW_TO")
    grag.add_relationship("blackboard_daemon.py", "llm_gateway.py", "MAKES_API_CALLS_VIA")
    
    print("\n--- Traversing Graph from 'orchestration_engine.py' ---")
    chain = grag.retrieve_logical_chain("orchestration_engine.py", depth=2)
    for link in chain:
        print(link)
