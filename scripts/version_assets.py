"""Add a content hash to every image, font and script reference at deploy time.

img/hero.webp -> img/hero.webp?v=1a2b3c4d

Browsers can then keep these files for a year (see public/_headers), and a
changed file gets a new hash, so visitors always see the newest version.
Runs in GitHub Actions before the deploy; the files in the repo stay unchanged.
"""
import hashlib
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent / "public"
PAGES = ["index.html", "404.html", "offline.html", "sw.js"]

hashes = {}
for folder in ("img", "fonts", "js"):
    for f in (ROOT / folder).iterdir():
        if f.is_file():
            hashes[f"{folder}/{f.name}"] = hashlib.md5(f.read_bytes()).hexdigest()[:8]

total = 0
for page in PAGES:
    path = ROOT / page
    if not path.exists():
        continue
    text = path.read_text(encoding="utf-8")
    for rel, h in hashes.items():
        # exact file name only, not already versioned, and never the keys of the
        # inline blur-preview map ("img/x.webp": "data:...")
        pattern = re.compile(r"(?<![\w-])" + re.escape(rel) + r"(?![\w.?-])(?!\": \"data)")
        text, n = pattern.subn(f"{rel}?v={h}", text)
        total += n
    path.write_text(text, encoding="utf-8")

print(f"versioned {total} references across {len(PAGES)} files")
