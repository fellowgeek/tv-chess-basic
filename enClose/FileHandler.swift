import Foundation

class FileHandler {

    // Initializes a FileManager instance to interact with the file system.
    let fileManager = FileManager.default

    // Writes the given 'text' to a file with the specified 'fileName'.
    func writeTextToFile(text: String, fileName: String) {
        let filePath = getFilePath(fileName: fileName)

        do {
            try text.write(to: filePath, atomically: true, encoding: .utf8)
        } catch {
            print("Error writing text to file: \(error.localizedDescription)")
        }
    }

    // Reads the text content from a file with the specified 'fileName' and returns it as an optional String.
    func readTextFromFile(fileName: String) -> String? {
        let filePath = getFilePath(fileName: fileName)

        do {
            let text = try String(contentsOf: filePath, encoding: .utf8)
            return text
        } catch {
            print("Error reading text from file: \(error.localizedDescription)")
            return nil
        }
    }

    // Constructs and returns the full file path URL for the given 'fileName' within the document directory.
    private func getFilePath(fileName: String) -> URL {
        let documentsDirectory = fileManager.urls(for: .documentDirectory, in: .userDomainMask).first!
        let filePath = documentsDirectory.appendingPathComponent(fileName)
        return filePath
    }
}