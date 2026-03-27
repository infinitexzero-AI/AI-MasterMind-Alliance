import SwiftUI

@main
struct VanguardApp: App {
    @StateObject private var relaySocket = RelaySocketManager()
    
    var body: some Scene {
        WindowGroup {
            WarRoomView()
                .environmentObject(relaySocket)
                .preferredColorScheme(.dark)
        }
    }
}
