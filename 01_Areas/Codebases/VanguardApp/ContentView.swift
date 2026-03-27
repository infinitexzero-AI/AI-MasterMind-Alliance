import SwiftUI

struct ContentView: View {
    @EnvironmentObject var network: NetworkManager
    @State private var commandText: String = ""
    
    var body: some View {
        VStack(spacing: 20) {
            
            // Header
            VStack {
                Text("VANGUARD SECURE EDGE")
                    .font(.caption)
                    .fontWeight(.bold)
                    .foregroundColor(.gray)
                
                HStack {
                    Circle()
                        .fill(network.isConnected ? Color.green : Color.red)
                        .frame(width: 12, height: 12)
                    Text(network.pm2Status.uppercased())
                        .font(.headline)
                        .foregroundColor(network.isConnected ? .green : .red)
                }
            }
            .padding(.top, 40)
            
            Spacer()
            
            // Telemetry Orb
            ZStack {
                Circle()
                    .stroke(network.isConnected ? Color.blue.opacity(0.3) : Color.gray.opacity(0.3), lineWidth: 2)
                    .frame(width: 200, height: 200)
                
                VStack {
                    Text("\(network.activeAgents)")
                        .font(.system(size: 48, weight: .bold, design: .monospaced))
                        .foregroundColor(.blue)
                    Text("ACTIVE AGENTS")
                        .font(.caption)
                        .foregroundColor(.gray)
                }
            }
            
            Spacer()
            
            // Intent Input
            HStack {
                TextField("Transmit to Swarm...", text: $commandText)
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(10)
                    .foregroundColor(.white)
                
                Button(action: {
                    if !commandText.isEmpty {
                        network.dispatchIntent(payload: commandText)
                        commandText = ""
                    }
                }) {
                    Image(systemName: "paperplane.fill")
                        .padding()
                        .background(network.isConnected ? Color.blue : Color.gray)
                        .foregroundColor(.white)
                        .clipShape(Circle())
                }
                .disabled(!network.isConnected)
            }
            .padding(.horizontal)
            .padding(.bottom, 30)
        }
        .background(Color.black.edgesIgnoringSafeArea(.all))
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
            .environmentObject(NetworkManager())
            .preferredColorScheme(.dark)
    }
}
