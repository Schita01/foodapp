import json
import re
from pathlib import Path

T = Path(r"C:\Users\Nitro\.cursor\projects\c-Users-Nitro-Desktop-ds-New-folder\agent-transcripts")
for jf in sorted(T.rglob("*.jsonl")):
    with jf.open(encoding="utf-8", errors="replace") as fh:
        for line_no, line in enumerate(fh, 1):
            if '"name":"Write"' not in line and '"name": "Write"' not in line:
                continue
            try:
                obj = json.loads(line)
            except json.JSONDecodeError:
                continue
            for part in obj.get("message", {}).get("content", []) or []:
                if part.get("name") != "Write":
                    continue
                inp = part.get("input") or {}
                path = inp.get("path") or inp.get("file_path") or ""
                if "app" in path.lower().replace("\\", "/"):
                    print(f"{jf.name}:{line_no} -> {path}")
