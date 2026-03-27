import SwiftUI

struct WarRoomView: View {
    @EnvironmentObject var relaySocket: RelaySocketManager
    @State private var showingDispatch = false
    
    var body: some View {
        NavigationView {
            ZStack {
                // Glassmorphic dark background
                Color.black.edgesIgnoringSafeArea(.all)
                LinearGradient(gradient: Gradient(colors: [Color.blue.opacity(0.2), Color.purple.opacity(0.1)]), startPoint: .topLeading, endPoint: .bottomTrailing)
                    .edgesIgnoringSafeArea(.all)
                
                VStack(spacing: 20) {
                    // Header
                    HStack {
                        VStack(alignment: .leading) {
                            Text("AILCC Vanguard")
                                .font(.system(size: 28, weight: .bold, design: .monospaced))
                                .foregroundColor(.white)
                            Text("Command Bridge Active")
                                .font(.caption)
                                .foregroundColor(.green)
                        }
                        Spacer()
                        Circle()
                            .fill(relaySocket.isConnected ? Color.green : Color.red)
                            .frame(width: 12, height: 12)
                            .shadow(color: relaySocket.isConnected ? .green : .red, radius: 5)
                    }
                    .padding()
                    
                    // Telemetry Core
                    VStack(alignment: .leading, spacing: 15) {
                        Text("Sovereign Telemetry")
                            .font(.headline)
                            .foregroundColor(.gray)
                        
                        HStack {
                            TelemetryBox(title: "Active Nodes", value: "24", icon: "server.rack")
                            TelemetryBox(title: "Bio Pulse", value: "Optimal", icon: "heart.text.square")
                        }
                    }
                    .padding(.horizontal)
                    
                    // Recent Intel
                    HippocampusFeed()
                    
                    Spacer()
                    
                    // Dispatch Button
                    Button(action: {
                        showingDispatch = true
                    }) {
                        HStack {
                            Image(systemName: "mic.fill")
                            Text("Spawn Neural Directive")
                                .bold()
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.blue.opacity(0.3))
                        .overlay(
                            RoundedRectangle(cornerRadius: 15)
                                .stroke(Color.blue, lineWidth: 1)
                        )
                        .foregroundColor(.blue)
                        .cornerRadius(15)
                        .padding(.horizontal)
                    }
                    .sheet(isPresented: $showingDispatch) {
                        DispatchConsole()
                    }
                }
            }
            .navigationBarHidden(true)
        }
    }
}

struct TelemetryBox: View {
    var title: String
    var value: String
    var icon: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Image(systemName: icon)
                .foregroundColor(.blue)
                .font(.title2)
            Text(value)
                .font(.title3)
                .bold()
                .foregroundColor(.white)
            Text(title)
                .font(.caption)
                .foregroundColor(.gray)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(Color.white.opacity(0.05))
        .cornerRadius(12)
        .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.white.opacity(0.1), lineWidth: 1))
    }
}
