from services.neural_memory_service import memory_service
import time

def test_memory():
    print("🧠 Starting Memory Service Test...")
    try:
        print("🔍 Querying knowledge...")
        start = time.time()
        results = memory_service.query_knowledge("test", n_results=1)
        end = time.time()
        print(f"✅ Query successful in {end-start:.2f}s")
        print(f"📄 Results: {results}")
    except Exception as e:
        print(f"❌ Memory query failed: {e}")

if __name__ == "__main__":
    test_memory()
