# TickerWrapper

Handy-Ticker für Ligaportal: Events landen **automatisch** im Portal – kein Kopieren.

## So funktioniert Auto-Tickern

Ligaportal akzeptiert Schreibzugriffe nur mit Login-Session auf `ticker.ligaportal.at`.  
Deshalb: Overlay **auf der Ligaportal-Seite** (per Bookmark, ohne Tampermonkey).

1. Setup öffnen: **https://forsti37.github.io/tickerwrapper/setup.html**
2. Bookmark **TW** am Handy anlegen (Anleitung auf der Seite)
3. Bei Ligaportal einloggen → Live-Editor öffnen  
   **Test ohne echtes Spiel:** https://ticker.ligaportal.at/liveGame/edit/1349470
4. Bookmark **TW** tippen → Overlay → **In Ligaportal speichern**

## Planung (XI / Formation)

https://forsti37.github.io/tickerwrapper/  
Offline-Planung / Demo-Aufstellung – Tickern selbst immer über Ligaportal + TW.

## Dateien

| Datei | Zweck |
|-------|--------|
| `docs/overlay.js` | Overlay, postet direkt nach Ligaportal |
| `docs/setup.html` | Bookmark-Installation |
| `docs/index.html` | Planungs-PWA |
| `userscript/…` | Optional Desktop (Tampermonkey) |

## Repo

https://github.com/Forsti37/tickerwrapper · Pages aus `/docs`
