#!/usr/bin/env python3
"""Local dev server for 速成查碼.

Serves the static files, plus /speak?t=我 which returns a WAV of the text read
by the macOS Cantonese voice (Sinji). Chrome's own speechSynthesis goes silent
when triggered from IME typing, so the page plays this audio instead.

Run:  python3 serve.py   then open http://127.0.0.1:8741/
"""
import hashlib
import http.server
import os
import subprocess
import tempfile
from urllib.parse import parse_qs, urlparse

PORT = 8741
VOICE = "Sinji"
CACHE = os.path.join(tempfile.gettempdir(), "quick-lookup-speech")
os.makedirs(CACHE, exist_ok=True)


class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        url = urlparse(self.path)
        if url.path != "/speak":
            return super().do_GET()
        text = parse_qs(url.query).get("t", [""])[0].strip()[:40]
        if not text:
            return self.send_error(400, "missing t")
        path = os.path.join(CACHE, hashlib.sha1(text.encode()).hexdigest() + ".wav")
        if not os.path.exists(path):
            try:
                # Arguments passed as a list (no shell), so the text can't inject commands
                subprocess.run(
                    ["say", "-v", VOICE, "-o", path, "--file-format=WAVE", "--data-format=LEI16@22050", "--", text],
                    check=True, timeout=15,
                )
            except (subprocess.SubprocessError, OSError) as e:
                return self.send_error(500, f"say failed: {e}")
        with open(path, "rb") as f:
            data = f.read()
        self.send_response(200)
        self.send_header("Content-Type", "audio/wav")
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "max-age=86400")
        self.end_headers()
        self.wfile.write(data)


if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    print(f"Serving on http://127.0.0.1:{PORT}/")
    http.server.ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
