import SwiftUI

struct DispatchConsole: View {
    @Environment(\\.presentationMode) var presentationMode
    @EnvironmentObject var relaySocket: RelaySocketManager
    @State private var directiveText: String = ""
    
    var body: some View {
        ZStack {
            Color.black.edgesIgnoringSafeArea(.all)
            
            VStack {
                HStack {
                    Text("Initialize Payload")
                        .font(.title2)
                        .bold()
                        .foregroundColor(.white)
                    Spacer()
                    Button(action: {
                        presentationMode.wrappedValue.dismiss()
                    }) {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundColor(.gray)
                            .font(.title2)
                    }
                }
                .padding()
                
                TextEditor(text: $directiveText)
                    .padding()
                    .background(Color.white.opacity(0.1))
                    .cornerRadius(12)
                    .foregroundColor(.white)
                    .frame(height: 200)
                    .padding(.horizontal)
                
                Button(action: {
                    sendDirective()
                }) {
                    Text("Inject into Mode6")
                        .bold()
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(directiveText.isEmpty ? Color.gray.opacity(0.5) : Color.green)
                        .foregroundColor(.white)
                        .cornerRadius(12)
                        .padding()
                }
                .disabled(directiveText.isEmpty)
                
                Spacer()
            }
        }
    }
    
    private func sendDirective() {
        relaySocket.sendPayload(directive: directiveText)
        directiveText = ""
        presentationMode.wrappedValue.dismiss()
    }
}
