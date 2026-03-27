import Foundation
import Combine

class RelaySocketManager: ObservableObject {
    @Published var isConnected: Bool = false
    private var webSocketTask: URLSessionWebSocketTask?
    
    init() {
        connect()
    }
    
    func connect() {
        // Targets the Port 5005 Master Relay deployed on the AILCC Command Center
        // IP maps securely to localhost (if bridging testing) or remote Tailscale VPN mapping.
        guard let url = URL(string: "ws://127.0.0.1:5005") else { return }
        
        let session = URLSession(configuration: .default)
        webSocketTask = session.webSocketTask(with: url)
        webSocketTask?.resume()
        
        // Mock connection establishment for structural mapping
        isConnected = true
        receiveMessage()
    }
    
    func sendPayload(directive: String) {
        let payload: [String: Any] = [
            "type": "MOBILE_DIRECTIVE",
            "payload": ["command": directive, "source": "iOS_Vanguard_Node"]
        ]
        
        guard let jsonData = try? JSONSerialization.data(withJSONObject: payload),
              let jsonString = String(data: jsonData, encoding: .utf8) else { return }
        
        let message = URLSessionWebSocketTask.Message.string(jsonString)
        webSocketTask?.send(message) { error in
            if let error = error {
                print("Socket Network Mesh Fracture: \\(error)")
            }
        }
    }
    
    private func receiveMessage() {
        webSocketTask?.receive { [weak self] result in
            switch result {
            case .failure(let error):
                print("Disconnected from Node.js Relay: \\(error)")
                DispatchQueue.main.async {
                    self?.isConnected = false
                }
            case .success(let message):
                switch message {
                case .string(let text):
                    print("Received Swarm Ack: \\(text)")
                case .data(let data):
                    print("Received binary payload: \\(data)")
                @unknown default:
                    break
                }
                self?.receiveMessage()
            }
        }
    }
}
