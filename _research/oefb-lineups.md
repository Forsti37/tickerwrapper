# ÖFB Aufstellungen (Spieler + Nummer)

Ziel: Vor dem Tickern XI inkl. Rückennummer laden, weil Ligaportal Unterhaus-Kader oft ohne Nummern/Aufstellung kommt.

## Befund (Stand 2026-11)

| Quelle | Login | Nutzbar? | Hinweis |
|--------|-------|----------|---------|
| `vereine.oefb.at/.../Spielbericht/` | nein (öffentlich) | **ja** | nach Anubis-Botcheck; DOM `.widget-list_container` |
| `fussballoesterreich.at` Spielbetrieb | ja | **nicht scrapen** | AGB / Zugang geschützt – bewusst vermeiden |
| ÖFB Fan-App Community-Ticker | App-Session | später | Netzwerk/HAR nur lesend, wenn nötig |
| `.../datenservice/besetzung/...` | — | nein | nur Schiri-Besetzung |

### Öffentlicher Spielbericht – Selektor

```js
document.querySelectorAll(".widget-list_container")
// .widget-player_nr  → "T" | "04" | "ET" | …
// .widget-player_name → "Stefan Kranabetter"
```

Reihenfolge auf der Seite: Heim-Start → Gast-Start → Heim-Bank → Gast-Bank  
(zweiter `T` trennt Heim/Gast; zweiter `ET` trennt die Bänke.)

Beispiel: Loosdorf–Oberndorf `s=4078161` → 34 Spieler, siehe  
`_research/oefb-lineups-loosdorf-oberndorf-2026-11-07.txt`

## Userscript v0.4 (serverlos)

1. Optional ÖFB-Link im Overlay unter **XI** speichern
2. Spielbericht auf `vereine.oefb.at` öffnen → **TW: Beide Teams → Ligaportal**  
   → `GM_setValue` (`tickerwrapper.oefbLineup.v1`) inkl. Heim/Gast Start+Bank
3. Ligaportal → **XI** → Formation + Positionen je Team → Fertig
4. Wechsel: Raus/Rein → Position des Hereinkommenden → optional Bleiber-Positionswechsel  
   → Kommentar wird automatisch gebaut; Match-State lokal aktualisiert

Alles in Tampermonkey/`localStorage`, kein eigener Server.

## Noch offen

- Gegner-Vereinsseite (wenn Loosdorf Auswärts auf fremdem Club-Slug): Paste-Seite wählen
- Optional: Fan-App-Endpunkt dokumentieren (nur falls öffentliche Seite fehlt)
