"""Builds "AI academia.html", the presentation view of this folder, from view/template.html and the .md files.

Run it again after editing any topic file:   py -3 view/build.py
The page is one file with no downloads, so it opens offline. The full text of every .md file is embedded for the
reader panel; the charts' numbers are written by hand in the template, from the topic files.
"""
import datetime
import json
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
OUT = ROOT / "AI academia.html"


def table_rows(text):
    """Rows of every markdown table in the text, without header and separator lines."""
    rows, lines = [], text.splitlines()
    for i, line in enumerate(lines):
        if not line.strip().startswith("|"):
            continue
        prev, nxt = (lines[i - 1] if i else ""), (lines[i + 1] if i + 1 < len(lines) else "")
        is_sep = bool(re.fullmatch(r"\s*\|[\s:|-]+\|\s*", line))
        is_head = bool(re.fullmatch(r"\s*\|[\s:|-]+\|\s*", nxt)) and not prev.strip().startswith("|")
        if not is_sep and not is_head:
            rows.append([c.strip() for c in re.split(r"(?<!\\)\|", line.strip().strip("|"))])
    return rows


def main():
    files = sorted(p for p in ROOT.glob("*.md"))
    order = lambda p: (0 if p.name == "README.md" else 1 if p.name[:2].isdigit() else 2 if p.name.startswith("GrindPilot") else 3, p.name)
    docs = {p.name: p.read_text(encoding="utf-8") for p in sorted(files, key=order)}
    topics = [n for n in docs if n[:2].isdigit()]
    leads_file = next((n for n in topics if n.startswith("10")), None)
    leads = [r[:3] for r in table_rows(docs[leads_file]) if len(r) >= 3] if leads_file else []
    sources = len(table_rows(docs.get("References.md", "")))
    data = {"docs": docs, "leads": leads, "built": datetime.date.today().strftime("%d %b %Y").lstrip("0"),
            "stats": {"topics": len(topics), "sources": sources, "leads": len(leads)}}
    blob = json.dumps(data, ensure_ascii=False).replace("</", "<\\/")
    page = (HERE / "template.html").read_text(encoding="utf-8")
    start, end = page.index("/*DATA*/"), page.index("/*END*/")
    OUT.write_text(page[:start] + blob + page[end + len("/*END*/"):], encoding="utf-8")
    print(f"wrote {OUT.name}: {len(docs)} files, {len(topics)} topics, {len(leads)} leads, {sources} sources, {OUT.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
