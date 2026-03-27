import SwiftUI

@main
struct VanguardApp: App {
    @StateObject private var networkManager = NetworkManager()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(networkManager)
                .preferredColorScheme(.dark)
        }
    }
}
