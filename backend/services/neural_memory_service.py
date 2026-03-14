import chromadb
from chromadb.config import Settings
import os

class NeuralMemoryService:
    def __init__(self):
        self.chroma_host = os.getenv("CHROMA_HOST", "chroma")
        self.chroma_port = int(os.getenv("CHROMA_PORT", 8000))
        self.client = chromadb.HttpClient(host=self.chroma_host, port=self.chroma_port)
        self.collection = self.client.get_or_create_collection(name="ailcc_intelligence_vault")

    def upsert_knowledge(self, id: str, content: str, metadata: dict = None):
        """
        Add or update a knowledge fragment with enriched metadata.
        """
        # Ensure context_type exists for Multi-Vector support
        if metadata is None:
            metadata = {}
        if "context_type" not in metadata:
            metadata["context_type"] = "General"

        self.collection.upsert(
            documents=[content],
            metadatas=[metadata],
            ids=[id]
        )
        return {"id": id, "status": "indexed", "context_type": metadata["context_type"]}

    def query_knowledge(self, query: str, n_results: int = 5, context_filter: str = None):
        """
        Retrieve relevant fragments with optional context filtering.
        """
        where_filter = {"context_type": context_filter} if context_filter else None
        
        results = self.collection.query(
            query_texts=[query],
            n_results=n_results,
            where=where_filter
        )
        
        formatted = []
        if results['documents']:
            for i in range(len(results['documents'][0])):
                formatted.append({
                    "id": results['ids'][0][i],
                    "content": results['documents'][0][i],
                    "metadata": results['metadatas'][0][i] if results['metadatas'] else {},
                    "distance": results['distances'][0][i] if results['distances'] else None
                })
        return formatted

# Singleton instance
memory_service = NeuralMemoryService()
