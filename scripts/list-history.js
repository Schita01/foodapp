const fs = require("fs");
const path = require("path");

const histRoot = "C:/Users/Nitro/AppData/Roaming/Cursor/User/History";
const out = [];

for (const dir of fs.readdirSync(histRoot)) {
  const entriesPath = path.join(histRoot, dir, "entries.json");
  if (!fs.existsSync(entriesPath)) continue;
  let json;
  try {
    json = JSON.parse(fs.readFileSync(entriesPath, "utf8"));
  } catch {
    continue;
  }
  if (!json.resource || !json.resource.includes("ds/New%20folder/app/")) continue;
  const resource = decodeURIComponent(json.resource.replace(/^file:\/\//, ""));
  const marker = "New folder/";
  const idx = resource.indexOf(marker);
  const rel = (idx >= 0 ? resource.slice(idx + marker.length) : resource).replace(/\\/g, "/");
  const entries = [...json.entries].sort((a, b) => a.timestamp - b.timestamp);
  const last = entries[entries.length - 1];
  const src = path.join(histRoot, dir, last.id);
  out.push({ rel, src, size: fs.statSync(src).size });
}

console.log(JSON.stringify(out, null, 2));
console.log("COUNT", out.length);
