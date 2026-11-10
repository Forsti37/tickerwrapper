# Forsti37 Ticker-Stil Analyse

Quellen: ASK Loosdorf Spiele (Gebietsliga West), Reporter Forsti37.

## Beobachteter Stil (Leonhofen 3:3)

- 90.+5 Tor, Toor, Tooor für ASK Loosdorf zum 3:3. Martin Wetzel Fußballgott!!!!!! Freistoß wird von der Mauer abgefälscht und landet im Tor!!!!
- 90.+4 Gute Position für den letzten Freistoß, 18m vor dem Tor leicht links seitlich
- 90.+1 Tor, Toor, Tooor für FC Leonhofen zum 2:3. Gansberger verwandelt einen Stangler im 5er ohne Mühe
- 90. Wechsel bei ASK Loosdorf . Aus dem Spiel: Rapavy Neu im Spiel: Haberl
- 87. Wechsel bei FC Leonhofen . Aus dem Spiel: Schiller Neu im Spiel: Funiak
- 86. Schiller aus 20m mit dem Flachschuss, abwr er trifft nur Krana's Trinkflasche knapp neben dem Tor.
- 81. Wechsel bei ASK Loosdorf . Aus dem Spiel: Moser Neu im Spiel: Köh

## Muster-Häufigkeit (Stichprobe)

- **Tor-Jubel**: 2
  - _90.+5 Tor, Toor, Tooor für ASK Loosdorf zum 3:3. Martin Wetzel Fußballgott!!!!!! Freistoß wird von der Mauer abgefälscht und landet im Tor!!!!_
  - _90.+1 Tor, Toor, Tooor für FC Leonhofen zum 2:3. Gansberger verwandelt einen Stangler im 5er ohne Mühe_
- **Wechsel**: 3
  - _90. Wechsel bei ASK Loosdorf . Aus dem Spiel: Rapavy Neu im Spiel: Haberl_
  - _87. Wechsel bei FC Leonhofen . Aus dem Spiel: Schiller Neu im Spiel: Funiak_
  - _81. Wechsel bei ASK Loosdorf . Aus dem Spiel: Moser Neu im Spiel: Köh_
- **Freistoß**: 2
  - _90.+5 Tor, Toor, Tooor für ASK Loosdorf zum 3:3. Martin Wetzel Fußballgott!!!!!! Freistoß wird von der Mauer abgefälscht und landet im Tor!!!!_
  - _90.+4 Gute Position für den letzten Freistoß, 18m vor dem Tor leicht links seitlich_
- **Schuss/Chance**: 1
  - _86. Schiller aus 20m mit dem Flachschuss, abwr er trifft nur Krana's Trinkflasche knapp neben dem Tor._
- **Karte**: 0
- **Anpfiff/Halbzeit**: 0
- **Strafstoß/Elfmeter**: 0
- **Ecke**: 0

## Empfohlene Schnell-Bausteine

| Key | Template |
|---|---|
| tor | `Tor {Spieler} ({Minute}') – {Stand}` |
| tor_jubel | `Tor, Toor, Tooor für {Team} zum {Stand}. {Spieler}` |
| wechsel | `Wechsel bei {Team}. Aus: {SpielerOut} · Rein: {SpielerIn}` |
| chance | `Chance für {Team}: {Spieler}` |
| schuss_daneben | `{Spieler} zieht ab – knapp vorbei` |
| freistoss | `Freistoß für {Team}, {Meter}m vor dem Tor` |
| latte | `{Spieler} knallt's an die Latte!` |
| pariert | `Riesenchance – {Keeper/Abwehr} klärt/pariert` |
| gelb | `Gelbe Karte: {Spieler} ({Team})` |
| rot | `Rote Karte: {Spieler} ({Team})` |
| anpfiff | `Anpfiff! {Heim} – {Gast}` |
| halbzeit | `Halbzeit: {Stand}` |
| abpfiff | `Abpfiff: {Stand}` |

## Heimverein

- Favorit / Nickname-Default: **ASK Loosdorf** (Ligaportal Mannschafts-ID 1374)
