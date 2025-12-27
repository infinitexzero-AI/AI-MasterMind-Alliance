import http.server
import socketserver
import os

PORT = 8000
ROOT = "/Users/infinite27/AILCC_PRIME"
NEXUS_DIR = f"{ROOT}/06_System/AILCC/nexus"
STATE_DIR = f"{ROOT}/06_System/State"

class NexusHandler(http.server.SimpleHTTPRequestHandler):
    def translate_path(self, path):
        # Serve status and sync state from the State directory
        if path in ["/status.json", "/sync_state.json"]:
            return os.path.join(STATE_DIR, path.lstrip("/"))
        # Default to NEXUS_DIR for other files
        return os.path.join(NEXUS_DIR, path.lstrip("/"))

    def do_GET(self):
        # Disable caching so dashboard is always live
        self.send_response(200)
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().do_GET()

if __name__ == "__main__":
    os.chdir(NEXUS_DIR)
    print(f"AILCC NEXUS SERVER ONLINE: http://localhost:{PORT}")
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), NexusHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down NEXUS server.")
