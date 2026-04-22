import Foundation
import Vision
import AppKit

func performOCR(on imagePath: String) {
    let url = URL(fileURLWithPath: imagePath)
    guard let imageData = try? Data(contentsOf: url),
          let image = NSImage(data: imageData),
          let cgImage = image.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
        print("Error: Could not load image at \(imagePath)")
        exit(1)
    }

    let requestHandler = VNImageRequestHandler(cgImage: cgImage, options: [:])
    let request = VNRecognizeTextRequest { (request, error) in
        if let error = error {
            print("Error: \(error.localizedDescription)")
            return
        }
        
        guard let observations = request.results as? [VNRecognizedTextObservation] else { return }
        
        let recognizedStrings = observations.compactMap { observation in
            observation.topCandidates(1).first?.string
        }
        
        print(recognizedStrings.joined(separator: "\n"))
    }
    
    // Set recognition level to accurate for technical text/code
    request.recognitionLevel = .accurate
    
    do {
        try requestHandler.perform([request])
    } catch {
        print("Error: \(error.localizedDescription)")
    }
}

let arguments = CommandLine.arguments
if arguments.count < 2 {
    print("Usage: swift ocr-bridge.swift <path-to-image>")
    exit(1)
}

performOCR(on: arguments[1])
