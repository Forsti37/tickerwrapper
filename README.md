# TickerWrapper

Matchday-App für den Ligaportal-Ticker (ASK Loosdorf): Aufstellung, Formation, Positionen, schnelle Events – **als PWA auf GitHub Pages**, nutzbar vom Homescreen und am Laptop.

Kein eigener Server. Ligaportal bleibt die Schreib-Session; eine kleine Tampermonkey-**Bridge** koppelt die drei Origins.

## Architektur

| Teil | Rolle |
|------|--------|
| **PWA** (`docs/`) | UI: Match-Link, XI/Bank, Formation, Ticker-Bausteine, Warteschlange |
| **Bridge-Userscript** | ÖFB auslesen → PWA; Queue aus PWA → Ligaportal-POST |
| **ÖFB Vereins-Spielbericht** | öffentliche Aufstellung (kein fussballoesterreich-Login) |

```
vereine.oefb.at  --export-->  Bridge (GM)  --import-->  GitHub Pages PWA
                                                          |
                                                     Warteschlange
                                                          |
ticker.ligaportal.at  <--POST--  Bridge (Queue senden)
```

## GitHub Pages

1. Repo auf GitHub pushen
2. Settings → Pages → Source: **Deploy from a branch** → Branch `main`, Folder **`/docs`**
3. App-URL z.B. `https://<user>.github.io/tickerwrapper/`
4. Handy: Safari/Chrome → Teilen / Menü → **Zum Home-Bildschirm**

Lokal testen: beliebigen Static-Server auf `docs/` (z.B. `npx serve docs`).

## Bridge installieren

1. [Tampermonkey](https://www.tampermonkey.net/)
2. Script: [`userscript/tickerwrapper-bridge.user.js`](userscript/tickerwrapper-bridge.user.js)
3. Falls deine Pages-URL nicht unter `*.github.io/tickerwrapper` liegt: `@match` im Script ergänzen

Das ältere Overlay-Script (`tickerwrapper.user.js`) ist optional / Legacy.

## Spieltag

1. PWA öffnen → **Match**: ÖFB-Link + Ligaportal-Spiel-ID
2. **ÖFB öffnen** → Button **TW: An TickerWrapper**
3. Zurück in die PWA → **Aufstellung übernehmen** → unter **XI** Formation/Positionen setzen
4. **Ticker**: Event tippen → Text bei Bedarf anpassen → **In Warteschlange**
5. Ligaportal-Editor (eingeloggt) öffnen → **TW: Queue senden**

Bausteine (Tor, Wechsel, …) sind unter **Bausteine** frei editierbar – kein fester Skizzen-Satz.

## Hinweise

- Öffentliche `vereine.oefb.at`-Spielberichte nutzen; **kein** Scraping von fussballoesterreich mit Login
- Anubis-Botcheck auf ÖFB einmalig im Browser abwarten
- Recherche/API-Notizen liegen unter `_research/`
