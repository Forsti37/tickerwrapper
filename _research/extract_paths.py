import re
from pathlib import Path

t = Path(__file__).with_name("liveTickerEditor.js").read_text(encoding="utf-8", errors="ignore")
paths = sorted(set(re.findall(r"liveGame/[a-zA-Z0-9_/]+", t)))
print("PATHS")
for p in paths:
    print(p)

for pat in [
    "halfTime",
    "endGame",
    "finishGame",
    "pauseGame",
    "secondHalf",
    "deleteEvent",
    "addEvent",
    "updateResult",
    "updateVisitors",
    "abortGame",
    "cancelGame",
    "startGame",
    "Textbaustein",
    "quickText",
    "template",
    "_action_",
    "referee",
]:
    hits = list(re.finditer(pat, t, re.I))
    print(f"\n{pat}: {len(hits)}")
    for h in hits[:8]:
        start = max(0, h.start() - 80)
        end = min(len(t), h.end() + 120)
        snippet = re.sub(r"\s+", " ", t[start:end])
        print(" ", snippet)
