import SwiftUI

struct HippocampusFeed: View {
    var body: some View {
        VStack(alignment: .leading) {
            Text("Qdrant Data Stream")
                .font(.headline)
                .foregroundColor(.gray)
                .padding(.horizontal)
            
            ScrollView {
                VStack(spacing: 10) {
                    FeedItem(title: "Strategic Blueprint Synchronized", time: "2m ago")
                    FeedItem(title: "Sovereign Framework Vectorized", time: "14m ago")
                    FeedItem(title: "Epoch 50 Phase Shift Logged", time: "1h ago")
                }
                .padding(.horizontal)
            }
        }
        .padding(.top, 10)
    }
}

struct FeedItem: View {
    var title: String
    var time: String
    
    var body: some View {
        HStack {
            Image(systemName: "network")
                .foregroundColor(.purple)
            VStack(alignment: .leading) {
                Text(title)
                    .foregroundColor(.white)
                    .font(.subheadline)
                Text(time)
                    .foregroundColor(.gray)
                    .font(.caption2)
            }
            Spacer()
        }
        .padding()
        .background(Color.white.opacity(0.05))
        .cornerRadius(10)
    }
}
