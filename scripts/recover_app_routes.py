#!/usr/bin/env python3
"""Recover deleted app/ routes from agent transcripts and Cursor local history."""

from __future__ import annotations

import json
import os
import re
import urllib.parse
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Set, Tuple

PROJECT_ROOT = Path(r"C:\Users\Nitro\Desktop\ds\New folder")
TRANSCRIPTS_DIR = Path(
    r"C:\Users\Nitro\.cursor\projects\c-Users-Nitro-Desktop-ds-New-folder\agent-transcripts"
)
HISTORY_DIR = Path(r"C:\Users\Nitro\AppData\Roaming\Cursor\User\History")
RECOVERED_ROOT = PROJECT_ROOT / "_recovered"
SUMMARY_PATH = RECOVERED_ROOT / "RECOVERY_SUMMARY.md"

APP_MENTION_RE = re.compile(
    r"app[/\\](?:\([^)]+\)[/\\])?[\w\[\]\-\./]+\.(?:tsx|ts|jsx|js)",
    re.IGNORECASE,
)


def normalize_rel_path(raw: str) -> Optional[str]:
    if not raw:
        return None
    s = urllib.parse.unquote(raw.strip().strip('"').strip("'"))
    s = s.replace("\\", "/")
    # file:///c:/Users/.../New folder/app/...
    lower = s.lower()
    marker = "/new folder/app/"
    idx = lower.find(marker)
    if idx >= 0:
        rel = s[idx + len(marker) :]
    elif lower.startswith("app/"):
        rel = s[4:]
    else:
        m = re.search(r"[/\\]app[/\\](.+)$", s, re.IGNORECASE)
        if not m:
            return None
        rel = m.group(1)
    rel = rel.lstrip("/").replace("\\", "/")
    if not rel:
        return "app/index.tsx"
    return f"app/{rel}"


def is_under_app(rel: str) -> bool:
    return rel.replace("\\", "/").startswith("app/")


@dataclass
class Recovery:
    rel_path: str
    contents: str
    source: str
    priority: int  # higher wins


def load_history_files() -> Dict[str, Recovery]:
    """Load latest on-disk version per app file from Cursor User History."""
    out: Dict[str, Recovery] = {}
    if not HISTORY_DIR.is_dir():
        return out

    for entries_path in HISTORY_DIR.rglob("entries.json"):
        try:
            data = json.loads(entries_path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            continue
        resource = data.get("resource", "")
        if "new%20folder/app/" not in resource.lower() and "new folder/app/" not in urllib.parse.unquote(
            resource
        ).lower():
            continue
        rel = normalize_rel_path(urllib.parse.unquote(resource))
        if not rel or not is_under_app(rel):
            continue
        entries = data.get("entries") or []
        if not entries:
            continue
        latest = max(entries, key=lambda e: e.get("timestamp", 0))
        blob_name = latest.get("id")
        if not blob_name:
            continue
        blob_path = entries_path.parent / blob_name
        if not blob_path.is_file():
            continue
        try:
            contents = blob_path.read_text(encoding="utf-8")
        except OSError:
            continue
        ts = latest.get("timestamp", 0)
        out[rel.replace("\\", "/")] = Recovery(
            rel_path=rel.replace("\\", "/"),
            contents=contents,
            source=f"cursor_history:{entries_path.parent.name}@{ts}",
            priority=100,
        )
    return out


def iter_transcript_writes() -> Iterable[Tuple[str, str, str, int]]:
    """Yield (rel_path, contents, source_label, line_no) for each Write to app/."""
    if not TRANSCRIPTS_DIR.is_dir():
        return
    for jsonl in sorted(TRANSCRIPTS_DIR.rglob("*.jsonl")):
        with jsonl.open(encoding="utf-8", errors="replace") as fh:
            for line_no, line in enumerate(fh, start=1):
                line = line.strip()
                if not line:
                    continue
                try:
                    obj = json.loads(line)
                except json.JSONDecodeError:
                    continue
                content = obj.get("message", {}).get("content")
                if not isinstance(content, list):
                    continue
                for part in content:
                    if not isinstance(part, dict):
                        continue
                    if part.get("type") != "tool_use" or part.get("name") != "Write":
                        continue
                    inp = part.get("input") or {}
                    path = inp.get("path") or inp.get("file_path")
                    contents = inp.get("contents")
                    if contents is None:
                        contents = inp.get("content")
                    if path is None or contents is None:
                        continue
                    rel = normalize_rel_path(str(path))
                    if not rel or not is_under_app(rel):
                        continue
                    rel = rel.replace("\\", "/")
                    yield rel, contents, f"transcript:{jsonl.name}:L{line_no}", line_no


def load_transcript_writes() -> Dict[str, Recovery]:
    """Keep the latest Write per file (last occurrence in all transcripts)."""
    out: Dict[str, Recovery] = {}
    order = 0
    for rel, contents, source, _line_no in iter_transcript_writes():
        order += 1
        out[rel] = Recovery(
            rel_path=rel,
            contents=contents,
            source=source,
            priority=50 + order,  # later writes beat earlier within transcript tier
        )
    return out


def collect_mentioned_app_files() -> Set[str]:
    """App route paths referenced in agent transcripts (tool paths + prose)."""
    mentioned: Set[str] = set()
    if not TRANSCRIPTS_DIR.is_dir():
        return mentioned
    for jsonl in TRANSCRIPTS_DIR.rglob("*.jsonl"):
        text = jsonl.read_text(encoding="utf-8", errors="replace")
        for m in re.finditer(r"New folder\\app\\([^\"\\]+)", text, re.IGNORECASE):
            p = "app/" + m.group(1).replace("\\", "/")
            if re.search(r"\.(tsx|ts|jsx|js)$", p, re.IGNORECASE):
                mentioned.add(p)
        for m in re.finditer(
            r'"path":\s*"[^"]*?New folder\\\\app\\\\([^"]+)"', text, re.IGNORECASE
        ):
            p = "app/" + m.group(1).replace("\\\\", "/")
            if re.search(r"\.(tsx|ts|jsx|js)$", p, re.IGNORECASE):
                mentioned.add(p)
    mentioned.discard("")
    return {p.replace("\\", "/") for p in mentioned}


def collect_routes_from_src() -> Set[str]:
    """Infer likely `app/` files from navigation strings in src/."""
    routes: Set[str] = set()
    src = PROJECT_ROOT / "src"
    if not src.is_dir():
        return routes
    route_re = re.compile(
        r"router\.(?:push|replace)\(\s*[`'](/[^`'\"?]+)",
        re.MULTILINE,
    )
    deep_link_re = re.compile(r'deepLink:\s*[`\'](/[^`\'"?]+)')
    for f in list(src.rglob("*.tsx")) + list(src.rglob("*.ts")):
        try:
            text = f.read_text(encoding="utf-8", errors="replace")
        except OSError:
            continue
        for m in list(route_re.finditer(text)) + list(deep_link_re.finditer(text)):
            route = m.group(1).split("?")[0].rstrip("/")
            if route and "${" not in route and "`" not in route:
                routes.add(route_to_app_file(route))
    return routes


def route_to_app_file(route: str) -> str:
    """Map an Expo Router path to a conventional file path."""
    route = route.strip("/")
    if not route:
        return "app/index.tsx"
    parts = route.split("/")
    # Dynamic segments: listings/abc -> listings/[id].tsx
    file_parts: List[str] = []
    for i, part in enumerate(parts):
        if part.startswith(":"):
            file_parts.append(f"[{part[1:]}]")
        elif re.match(r"^\[.+\]$", part):
            file_parts.append(part)
        elif i == len(parts) - 1 and "." not in part:
            # Could be a folder with index
            file_parts.append(part)
        else:
            file_parts.append(part)
    # Heuristic: if last segment looks like id placeholder in templates
    last = file_parts[-1]
    if last in ("discover", "browse", "profile", "orders", "favourites"):
        return f"app/(tabs)/{last}.tsx"
    if len(file_parts) >= 2 and file_parts[0] == "orders" and last not in (
        "cancel",
        "pickup",
        "refund",
        "index",
    ):
        return f"app/orders/[id]/{last}.tsx"
    if len(file_parts) == 2 and file_parts[0] == "orders":
        return "app/orders/[id]/index.tsx"
    if len(file_parts) == 2 and file_parts[0] == "listings":
        return "app/listings/[id].tsx"
    if len(file_parts) == 2 and file_parts[0] == "restaurants":
        return "app/restaurants/[id].tsx"
    if len(file_parts) == 2 and file_parts[0] == "checkout":
        return "app/checkout/[listingId].tsx"
    if len(file_parts) == 2 and file_parts[0] == "legal":
        return "app/legal/[doc].tsx"
    if len(file_parts) == 2 and file_parts[0] == "payment" and file_parts[1] == "success":
        return "app/payment/success/[orderId].tsx"
    if len(file_parts) == 1:
        return f"app/{last}.tsx"
    return "app/" + "/".join(file_parts) + ".tsx"


def collect_live_app_files() -> Set[str]:
    live: Set[str] = set()
    app_dir = PROJECT_ROOT / "app"
    if not app_dir.is_dir():
        return live
    for f in app_dir.rglob("*"):
        if f.is_file():
            rel = f.relative_to(PROJECT_ROOT).as_posix()
            live.add(rel)
    return live


def write_recovered(merged: Dict[str, Recovery]) -> List[str]:
    written: List[str] = []
    for rel, rec in sorted(merged.items()):
        dest = RECOVERED_ROOT / rel.replace("/", os.sep)
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(rec.contents, encoding="utf-8", newline="\n")
        meta = dest.with_suffix(dest.suffix + ".recovery.json")
        meta.write_text(
            json.dumps({"source": rec.source, "priority": rec.priority}, indent=2),
            encoding="utf-8",
        )
        written.append(rel)
    return written


def clean_app_path(p: str) -> str:
    p = p.replace("\\", "/")
    while "//" in p:
        p = p.replace("//", "/")
    return p


def build_summary(
    recovered: Dict[str, Recovery],
    mentioned: Set[str],
    live: Set[str],
    history_count: int,
    transcript_only: Set[str],
) -> str:
    lines: List[str] = [
        "# RescueBite `app/` recovery summary",
        "",
        f"Recovered files written under `{RECOVERED_ROOT.as_posix()}`.",
        "Live `app/` was not modified.",
        "",
        "## Recovered files",
        "",
    ]
    if not recovered:
        lines.append("_None._")
    else:
        lines.append("| File | Source |")
        lines.append("|------|--------|")
        for rel in sorted(recovered):
            lines.append(f"| `{rel}` | {recovered[rel].source} |")

    lines.extend(["", "## Source breakdown", ""])
    lines.append(f"- From **Cursor History** (preferred): {history_count} file(s)")
    lines.append(
        f"- From **transcripts only** (latest Write, no history): {len(transcript_only)} file(s)"
    )

    all_expected = {
        clean_app_path(p)
        for p in (set(mentioned) | live | set(recovered.keys()))
        if p and (p.endswith((".tsx", ".ts")) or "/" in p)
    }
    all_expected = {p for p in all_expected if re.search(r"\.(tsx|ts)$", p)}
    missing = sorted(all_expected - set(recovered.keys()))
    lines.extend(["", "## Still missing (no history or Write recovery)", ""])
    if not missing:
        lines.append("_None identified — all referenced routes were recovered._")
    else:
        for m in missing:
            lines.append(f"- `{m}`")

    lines.extend(
        [
            "",
            "## Transcript Write coverage",
            "",
            "Only full-file **Write** tool calls are recovered from transcripts.",
            "Files that were created once and only edited via **StrReplace** may be missing unless present in Cursor History.",
            "",
            f"- App paths mentioned in transcripts: **{len(mentioned)}**",
            f"- Files currently on disk under `app/`: **{len(live)}**",
            "",
        ]
    )
    if live:
        lines.append("### Live `app/` files (not copied to `_recovered` unless recovered above)")
        for f in sorted(live):
            lines.append(f"- `{f}`")
    return "\n".join(lines) + "\n"


def main() -> None:
    RECOVERED_ROOT.mkdir(parents=True, exist_ok=True)

    history = load_history_files()
    transcripts = load_transcript_writes()

    merged: Dict[str, Recovery] = {}
    for rel, rec in transcripts.items():
        merged[rel] = rec
    for rel, rec in history.items():
        if rel in merged:
            # History wins over transcript
            merged[rel] = rec
        else:
            merged[rel] = rec

    history_keys = set(history.keys())
    transcript_keys = set(transcripts.keys())
    history_only = history_keys - transcript_keys
    transcript_only = transcript_keys - history_keys

    written = write_recovered(merged)
    mentioned = collect_mentioned_app_files()
    from_src = collect_routes_from_src()
    live = collect_live_app_files()

    summary = build_summary(
        merged, mentioned | from_src, live, len(history_keys), transcript_only
    )
    SUMMARY_PATH.write_text(summary, encoding="utf-8")

    print(f"Wrote {len(written)} recovered file(s) to {RECOVERED_ROOT}")
    print(f"Summary: {SUMMARY_PATH}")
    for rel in written:
        print(f"  {rel} <- {merged[rel].source}")


if __name__ == "__main__":
    main()
