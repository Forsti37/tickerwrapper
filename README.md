# TickerWrapper

Matchday-PWA für den Ligaportal-Ticker (ASK Loosdorf): Aufstellung, Formation, Positionen, Events.

**Läuft standalone auf dem Handy** (GitHub Pages → Homescreen). Kein Server, kein Tampermonkey nötig für den Normalbetrieb.

App: **https://forsti37.github.io/tickerwrapper/**

## Handy testen (ohne echtes Spiel)

1. Seite auf dem Handy öffnen (Safari/Chrome)
2. Optional: Teilen → **Zum Home-Bildschirm**
3. **Demo-Spiel laden** → Loosdorf–Oberndorf mit XI, Bank, Positionen
4. **XI**: Formation/Positionen anfassen
5. **Ticker**: z.B. Tor/Wechsel → **Übernehmen & kopieren**

Events landen im Protokoll und in der Zwischenablage – zum Üben reicht das. Ligaportal brauchst du dafür nicht.

## Echtes Spiel (Handy)

1. Aufstellung als Text pasten (oder ÖFB-Link nur als Notiz)
2. Formation/Positionen setzen
3. Events tippen → Text liegt in der Zwischenablage → in Ligaportal (Handy-Browser, eingeloggt) einfügen

## Optional: Desktop-Bridge (Tampermonkey)

Nur Komfort am Laptop: ÖFB-Export + Queue an Ligaportal-POST.  
Script: [`userscript/tickerwrapper-bridge.user.js`](userscript/tickerwrapper-bridge.user.js)  
Am Handy irrelevant – die PWA ist abgeschlossen ohne Bridge.

## GitHub Pages

Repo: https://github.com/Forsti37/tickerwrapper  
Source: Branch `main`, Ordner `/docs`

## Hinweise

- Nur öffentliche `vereine.oefb.at`-Daten / manuelles Pasten – kein fussballoesterreich-Login-Scraping
- Bausteine (Tor-, Wechsel-Text, …) unter **Bausteine** frei editierbar
