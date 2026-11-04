"""Refresh the static Artist gallery catalog from assets/3D."""

from hashlib import sha256
import json
from pathlib import Path
import re
from urllib.parse import quote

ROOT = Path(__file__).resolve().parents[2]
SOURCE_IMAGE = re.compile(r"source\d*\.(png|jpg)", re.IGNORECASE)
CATALOG = re.compile(r"^const artworks = \[(?:\]|.*?^\]);", re.MULTILINE | re.DOTALL)


def read_credit(path):
    try:
        return path.read_text(encoding="utf-8-sig").strip()
    except FileNotFoundError:
        return None


def main():
    artworks = []
    for folder in sorted((ROOT / "assets" / "3D").iterdir(), key=lambda path: path.name):
        if not (folder / "3D.png").is_file():
            continue

        design = read_credit(folder / "design.txt")
        category = ""
        designer = read_credit(folder / "designer.txt")
        filter_credit = design if design is not None else designer
        if filter_credit is not None:
            category = "mine" if filter_credit == "shirin404" else "commissions"

        artworks.append({
            "name": folder.name,
            "path": f"assets/3D/{quote(folder.name, safe='')}/",
            "sources": sorted(
                file.name for file in folder.iterdir()
                if file.is_file() and SOURCE_IMAGE.fullmatch(file.name)
            ),
            "credit": designer or design or "",
            "category": category,
        })

    script = ROOT / "js" / "carousel.js"
    original = script.read_text(encoding="utf-8")
    catalog = "const artworks = " + json.dumps(artworks, ensure_ascii=False, indent=2) + ";"
    matches = list(CATALOG.finditer(original))
    if len(matches) != 1:
        raise SystemExit("Expected exactly one artwork catalog in carousel.js.")

    match = matches[0]
    updated = original[:match.start()] + catalog + original[match.end():]
    if updated != original:
        script.write_text(updated, encoding="utf-8", newline="\n")
    # Change the browser cache key whenever the generated script changes.
    version = sha256(script.read_bytes()).hexdigest()[:16]
    page = ROOT / "index.html"
    html = page.read_text(encoding="utf-8")
    refreshed, count = re.subn(
        r'src="js/carousel\.js(?:\?v=[a-f0-9]+)?"',
        f'src="js/carousel.js?v={version}"',
        html,
    )
    if count != 1:
        raise SystemExit("Expected exactly one carousel script reference in index.html.")
    if refreshed != html:
        page.write_text(refreshed, encoding="utf-8", newline="\n")

    print(f"Indexed {len(artworks)} artworks.")


if __name__ == "__main__":
    main()

