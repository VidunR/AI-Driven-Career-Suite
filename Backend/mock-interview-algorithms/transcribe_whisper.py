#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys, os, json
import requests

GROQ_API_KEY = os.environ.get("GROQ_API_KEY")  # ← read from env
API_URL = "https://api.groq.com/openai/v1/audio/transcriptions"
MODEL   = "whisper-large-v3"

def fail(error, detail=""):
    print(json.dumps({"error": error, "detail": detail}), end="")
    sys.exit(0)

def main():
    try:
        payload = json.loads(sys.stdin.read() or "{}")
    except Exception as e:
        return fail("bad_input", str(e))

    audio_path = payload.get("audio_path")
    language   = payload.get("language") or "en"

    if not audio_path or not os.path.isfile(audio_path):
        return fail("file_not_found", f"audio_path missing or not found: {audio_path}")

    if not GROQ_API_KEY:
        return fail("missing_api_key", "Set GROQ_API_KEY in your environment")

    try:
        with open(audio_path, "rb") as f:
            files = { "file": (os.path.basename(audio_path), f, "application/octet-stream") }
            data  = { "model": MODEL, "language": language }
            headers = { "Authorization": f"Bearer {GROQ_API_KEY}" }

            r = requests.post(API_URL, headers=headers, data=data, files=files, timeout=120)
            r.raise_for_status()
            resp = r.json()
            text = resp.get("text") or ""
            if not text:
                return fail("empty_transcript", f"raw={resp}")
            print(json.dumps({"text": text, "language": language}), end="")
    except requests.HTTPError as e:
        return fail("http_error", f"{e} :: {e.response.text if e.response is not None else ''}")
    except Exception as e:
        return fail("request_failed", str(e))

if __name__ == "__main__":
    main()