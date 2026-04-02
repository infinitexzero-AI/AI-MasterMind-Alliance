import console
import requests
import json
import speech

# Task #10: iPad Agent (Pythonista)
# Configure with your Mac's Local IP
MAC_IP = "http://192.168.1.X:3000" # UPDATE THIS

def main():
    console.clear()
    console.set_font('Menlo', 14)
    print("📱 Valentine Mobile Node (iPad)")
    print("-" * 30)
    
    while True:
        cmd = console.input_alert("Command", "Enter command or 'voice'", "Send")
        
        if cmd.lower() == 'voice':
            # Pythonista Speech
            text = speech.input("Speak to Valentine", "en-US")
            cmd = text
            
        print(f"Sending: {cmd}...")
        
        try:
            # Send to Siri Bridge (Universal Handshake)
            payload = {
                "intent": "OPTIMIZE_VAULT" if "optimize" in cmd.lower() else "EXECUTE_COMMAND",
                "target": cmd
            }
            
            res = requests.post(f"{MAC_IP}/api/dispatch/siri", json=payload, timeout=5)
            
            print(f"✅ Status: {res.status_code}")
            print(f"📄 {res.text[:100]}")
            
            if res.status_code == 200:
                speech.say("Command sent.")
                
        except Exception as e:
            print(f"❌ Error: {e}")
            speech.say("Connection failed.")

if __name__ == "__main__":
    main()
