import os
import json
import logging
import asyncio
from dotenv import load_dotenv

from core.graph_rag_daemon import GraphRAGDaemon
from comet_framework.llm_gateway import LLMGateway

logger = logging.getLogger("HippocampusBridge")

class HippocampusBridge:
    def __init__(self):
        self.load_config()
        self.graph = GraphRAGDaemon()
        try:
            import chromadb
            self.chroma_client = chromadb.HttpClient(
                host=os.getenv("CHROMA_HOST", "localhost"),
                port=int(os.getenv("CHROMA_PORT", 8001))
            )
        except Exception as e:
            logger.warning(f"ChromaDB connection unavailable in Hippocampus: {e}")
            self.chroma_client = None

    def load_config(self):
        root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        creds_path = os.path.join(os.path.expanduser("~"), ".ailcc", "credentials.env")
        load_dotenv(creds_path)
        
        self.gemini_key = os.getenv("GEMINI_API_KEY")
        self.grok_key = os.getenv("XAI_API_KEY")

    async def prune_ancient_vectors(self, max_age_days: int = 90):
        """Drops raw vectors from ChromaDB that are older than the threshold to save disk space."""
        if not self.chroma_client:
            return "Chroma unavailable."
            
        from datetime import datetime, timedelta
        
        cutoff_date = datetime.now() - timedelta(days=max_age_days)
        pruned_total = 0
        
        try:
            collection_names = ["skill_vault", "academic_vault", "personal_vault"]
            for cat in collection_names:
                try:
                    col = self.chroma_client.get_collection(cat)
                    results = col.get(include=["metadatas"])
                    if not results or not results.get("metadatas"):
                        continue
                        
                    ids_to_delete = []
                    for doc_id, meta in zip(results["ids"], results["metadatas"]):
                        if meta and "timestamp" in meta:
                            try:
                                doc_date = datetime.fromisoformat(meta["timestamp"].replace("Z", "+00:00"))
                                if doc_date.replace(tzinfo=None) < cutoff_date:
                                    ids_to_delete.append(doc_id)
                            except:
                                pass
                                
                    if ids_to_delete:
                        col.delete(ids=ids_to_delete)
                        pruned_total += len(ids_to_delete)
                        logger.info(f"Pruned {len(ids_to_delete)} ancient vectors from {cat}")
                except Exception as e:
                    logger.debug(f"Could not prune {cat}: {e}")
                    
            return f"Pruned {pruned_total} ancient vectors globally."
        except Exception as e:
            logger.error(f"Vector Pruning Failed: {e}")
            return f"Error: {str(e)}"
        
    async def query_all_domains(self, prompt: str, top_k: int = 3) -> dict:
        """
        Pulls massive context across Vector (Chroma) and Graph (NetworkX) databases.
        """
        logger.info(f"Hippocampus Bridge: Querying all memory domains for '{prompt}'")
        consolidated_data = {
            "vector_context": [],
            "graph_context": []
        }
        
        # 1. Pull from Chroma Collections (Vector Search)
        if self.chroma_client:
            try:
                # Iterate across possible specific life-OS collections if they exist
                # Or just fallback to the main 'skill_vault' for now
                collection_names = ["skill_vault", "academic_vault", "personal_vault"]
                for cat in collection_names:
                    try:
                        col = self.chroma_client.get_collection(cat)
                        results = col.query(query_texts=[prompt], n_results=top_k)
                        if results and results.get('documents'):
                            for doc_list in results['documents']:
                                consolidated_data["vector_context"].extend(doc_list)
                    except Exception as e:
                        logger.debug(f"Collection {cat} empty or missing: {e}")
            except Exception as e:
                logger.error(f"Vector search failed: {e}")

        # 2. Pull from NetworkX (Graph Search)
        try:
            # Extract keywords crudely
            keywords = [w.strip("'\",.;:()") for w in prompt.split() if len(w) > 4]
            for kw in keywords:
                chain = self.graph.retrieve_logical_chain(kw, depth=2)
                if chain and not chain[0].startswith("Node '"):
                    consolidated_data["graph_context"].extend(chain)
        except Exception as e:
            logger.error(f"Graph search failed: {e}")
            
        # Deduplicate
        consolidated_data["vector_context"] = list(set(consolidated_data["vector_context"]))
        consolidated_data["graph_context"] = list(set(consolidated_data["graph_context"]))
        
        return consolidated_data

    async def run_sync_workflow(self, prompt: str, ws_callback=None) -> str:
        """
        Executes the full pipeline for the dynamic JSON SKILL_HIPPOCAMPUS_SYNC workflow.
        """
        def update(status, msg):
            if ws_callback:
                asyncio.create_task(ws_callback("HIPPOCAMPUS_SYNC", status, msg))
            else:
                logger.info(f"[HIPPOCAMPUS] {msg}")

        try:
            # 1. CONSOLIDATION
            update("IN_PROGRESS", "Step 1: Extrapolating Vector and Graph Contexts...")
            raw_data = await self.query_all_domains(prompt)
            
            raw_text = "VECTOR DATA:\n" + "\n".join(raw_data["vector_context"]) + "\n\nGRAPH DATA:\n" + "\n".join(raw_data["graph_context"])
            
            if len(raw_text.strip()) < 30:
                raw_text = "No extensive historical context found. Analyzing direct prompt."

            # 2. CONDENSATION
            update("IN_PROGRESS", f"Step 2: Token Compression via Gemma. Compressing {len(raw_text)} chars...")
            compression_prompt = f"Condense this massive web of data into the core strategic axioms relevant to answering: '{prompt}'. Extract only the dense signal.\n\nDATA:\n{raw_text}"
            
            # Using specific model mapping assuming Gemini API is configured for local LLM routing or direct Gemini Pro usage
            compressed_insight = await LLMGateway.ask_agent(
                provider="gemini",
                api_key=self.gemini_key,
                model="gemini-pro",
                system_prompt="You are a data compression algorithm. Output dense, highly concentrated facts without conversational filler.",
                prompt=compression_prompt
            )

            # 3. EMPATHY LAYER / VALENTINE
            update("IN_PROGRESS", "Step 3: Routing compressed data through Valentine Empathetic Filter...")
            valentine_prompt = f"The user is focusing on: '{prompt}'. Based on this dense data:\n{compressed_insight}\n\nProvide an empathetic, humanized, and highly strategic recommendation that factors in their professional and holistic well-being."
            
            final_output = await LLMGateway.ask_agent(
                provider="grok",
                api_key=self.grok_key,
                model="grok-beta",
                system_prompt="You are Valentine, the empathetic and deeply perceptive persona of the AILCC system. Your tone is warm, supportive, but highly analytical.",
                prompt=valentine_prompt
            )
            
            update("COMPLETED", f"Sync Complete.\n\n{final_output}")
            return f"Success:\n{final_output}"

        except Exception as e:
            err = f"Pipeline failed: {e}"
            update("FAILED", err)
            logger.error(err)
            return err
