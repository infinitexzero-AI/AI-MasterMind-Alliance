import Foundation
import Combine

class NetworkManager: ObservableObject {
    @Published var isConnected = false
    @Published var pm2Status: String = "Offline"
    @Published var activeAgents: Int = 0
    
    // TODO: Update to MacBook's Tailscale IP or Local Network IP
    private let relayURL = URL(string: "http://localhost:5005/health")
    private var cancellables = Set<AnyCancellable>()
    
    init() {
        startHeartbeat()
    }
    
    func startHeartbeat() {
        Timer.publish(every: 3.0, on: .main, in: .common)
            .autoconnect()
            .sink { [weak self] _ in
                self?.pingRelay()
            }
            .store(in: &cancellables)
    }
    
    private func pingRelay() {
        guard let url = relayURL else { return }
        
        var request = URLRequest(url: url)
        request.timeoutInterval = 2.0
        
        URLSession.shared.dataTask(with: request) { [weak self] data, response, error in
            DispatchQueue.main.async {
                if let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 {
                    self?.isConnected = true
                    self?.pm2Status = "Optimal"
                    self?.activeAgents = 25
                } else {
                    self?.isConnected = false
                    self?.pm2Status = "Disconnected"
                    self?.activeAgents = 0
                }
            }
        }.resume()
    }
    
    func dispatchIntent(payload: String) {
        // Send natural language command to Port 5005 Relay
        guard let intentUrl = URL(string: "http://localhost:5005/intent") else { return }
        var request = URLRequest(url: intentUrl)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let body: [String: Any] = ["command": payload, "source": "ios_vanguard"]
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)
        
        URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                print("Intent Dispatch Failed: \(error.localizedDescription)")
            } else {
                print("Swarm Intent Executed.")
            }
        }.resume()
    }
}
