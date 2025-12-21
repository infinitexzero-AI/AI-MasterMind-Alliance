import requests
import json
import time

OLLAMA_API_URL = "http://localhost:11434/api/generate"

def query_ollama(prompt, model="llama3", stream=False):
    """
    Sends a prompt to the local Ollama instance and returns the response.
    """
    payload = {
        "model": model,
        "prompt": prompt,
        "stream": stream
    }
    
    try:
        if stream:
            # Stream handling would go here
            pass
        else:
            response = requests.post(OLLAMA_API_URL, json=payload)
            response.raise_for_status()
            return response.json()
            
    except requests.exceptions.ConnectionError:
        return {"error": "Ollama server is not accessible at " + OLLAMA_API_URL}
    except Exception as e:
        return {"error": str(e)}

def check_status():
    """Checks if Ollama model is available"""
    try:
        # Check tags
        response = requests.get("http://localhost:11434/api/tags")
        if response.status_code == 200:
            models = [m['name'] for m in response.json().get('models', [])]
            return {"status": "online", "models": models}
        return {"status": "offline_error"}
    except:
        return {"status": "offline"}

if __name__ == "__main__":
    print("Checking Ollama Status...")
    status = check_status()
    print(f"Status: {status}")
    
    if status['status'] == 'online':
        print("\nTesting Llama3 Generation...")
        # Fallback to whatever model is installed if llama3 isn't there yet
        target_model = "llama3" if "llama3" in str(status['models']) else status['models'][0] if status['models'] else "llama3"
        
        print(f"Targeting Model: {target_model}")
        res = query_ollama("Hello, are you ready to assist the Mastermind Alliance?", model=target_model)
        
        if 'response' in res:
            print(f"\nResponse:\n{res['response']}")
        else:
            print(f"Error: {res}")
