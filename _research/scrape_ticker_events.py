"""Scrape ticker event texts from a Ligaportal live-ticker page HTML via stdin or saved CDP dump."""
import json
import re
import sys
from pathlib import Path


def extract_from_page_text(text: str) -> list[str]:
    # Prefer lines that look like minute-prefixed ticker entries
    lines = []
    for raw in text.splitlines():
        s = re.sub(r"\s+", " ", raw).strip()
        if re.match(r"^(\d{1,3}(\.\+\d+)?\.|\d{1,3}')\s", s) or re.match(
            r"^\d{1,3}(\.\+\d+)?\s", s
        ):
            if 8 < len(s) < 500:
                lines.append(s)
    return lines


def main() -> None:
    out = Path(__file__).with_name("forsti37-templates-analysis.md")
    # From Leonhofen scrape already observed in browser (pasted manually from prior CDP):
    leonhofen = [
        "90.+5 Tor, Toor, Tooor für ASK Loosdorf zum 3:3. Martin Wetzel Fußballgott!!!!!! Freistoß wird von der Mauer abgefälscht und landet im Tor!!!!",
        "90.+4 Gute Position für den letzten Freistoß, 18m vor dem Tor leicht links seitlich",
        "90.+1 Tor, Toor, Tooor für FC Leonhofen zum 2:3. Gansberger verwandelt einen Stangler im 5er ohne Mühe",
        "90. Wechsel bei ASK Loosdorf . Aus dem Spiel: Rapavy Neu im Spiel: Haberl",
        "87. Wechsel bei FC Leonhofen . Aus dem Spiel: Schiller Neu im Spiel: Funiak",
        "86. Schiller aus 20m mit dem Flachschuss, abwr er trifft nur Krana's Trinkflasche knapp neben dem Tor.",
        "81. Wechsel bei ASK Loosdorf . Aus dem Spiel: Moser Neu im Spiel: Köh",
    ]

    patterns = {
        "Tor-Jubel": r"Tor,? Toor,? Tooor",
        "Wechsel": r"Wechsel bei|Aus dem Spiel|Neu im Spiel",
        "Freistoß": r"Freisto[sß]",
        "Schuss/Chance": r"Schuss|Chance|knapp neben|Latte|Pfosten|pariert|gehalten",
        "Karte": r"[Gg]elbe|[Rr]ote Karte|Gelb/Rot",
        "Anpfiff/Halbzeit": r"Anpfiff|Halbzeit|Abpfiff|endet",
        "Strafstoß/Elfmeter": r"Strafsto[sß]|Elfmeter|11m",
        "Ecke": r"Ecke|Eckball",
    }

    counts = {k: 0 for k in patterns}
    examples = {k: [] for k in patterns}
    for e in leonhofen:
        for k, pat in patterns.items():
            if re.search(pat, e, re.I):
                counts[k] += 1
                if len(examples[k]) < 3:
                    examples[k].append(e)

    md = [
        "# Forsti37 Ticker-Stil Analyse",
        "",
        "Quellen: ASK Loosdorf Spiele (Gebietsliga West), Reporter Forsti37.",
        "",
        "## Beobachteter Stil (Leonhofen 3:3)",
        "",
    ]
    for e in leonhofen:
        md.append(f"- {e}")
    md += [
        "",
        "## Muster-Häufigkeit (Stichprobe)",
        "",
    ]
    for k, c in counts.items():
        md.append(f"- **{k}**: {c}")
        for ex in examples[k]:
            md.append(f"  - _{ex}_")

    md += [
        "",
        "## Empfohlene Schnell-Bausteine",
        "",
        "| Key | Template |",
        "|---|---|",
        "| tor | `Tor {Spieler} ({Minute}') – {Stand}` |",
        "| tor_jubel | `Tor, Toor, Tooor für {Team} zum {Stand}. {Spieler}` |",
        "| wechsel | `Wechsel bei {Team}. Aus: {SpielerOut} · Rein: {SpielerIn}` |",
        "| chance | `Chance für {Team}: {Spieler}` |",
        "| schuss_daneben | `{Spieler} zieht ab – knapp vorbei` |",
        "| freistoss | `Freistoß für {Team}, {Meter}m vor dem Tor` |",
        "| latte | `{Spieler} knallt's an die Latte!` |",
        "| pariert | `Riesenchance – {Keeper/Abwehr} klärt/pariert` |",
        "| gelb | `Gelbe Karte: {Spieler} ({Team})` |",
        "| rot | `Rote Karte: {Spieler} ({Team})` |",
        "| anpfiff | `Anpfiff! {Heim} – {Gast}` |",
        "| halbzeit | `Halbzeit: {Stand}` |",
        "| abpfiff | `Abpfiff: {Stand}` |",
        "",
        "## Heimverein",
        "",
        "- Favorit / Nickname-Default: **ASK Loosdorf** (Ligaportal Mannschafts-ID 1374)",
        "",
    ]
    out.write_text("\n".join(md), encoding="utf-8")
    print(out)


if __name__ == "__main__":
    main()
