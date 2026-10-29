import json
import re
from pathlib import Path

T = Path(r"C:\Users\Nitro\.cursor\projects\c-Users-Nitro-Desktop-ds-New-folder\agent-transcripts")
paths = set()
for jf in T.rglob("*.jsonl"):
    text = jf.read_text(encoding="utf-8", errors="replace")
    for m in re.finditer(r"New folder\\app\\([^\"\\]+)", text, re.I):
        p = "app/" + m.group(1).replace("\\", "/")
        if re.search(r"\.(tsx|ts|jsx|js)$", p, re.I):
            paths.add(p)
    for m in re.finditer(r'"path":\s*"[^"]*?New folder\\\\app\\\\([^"]+)"', text, re.I):
        p = "app/" + m.group(1).replace("\\\\", "/")
        paths.add(p)

for p in sorted(paths, key=str.lower):
    print(p)
print("TOTAL", len(paths))
