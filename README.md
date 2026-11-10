# TickerWrapper

**Ziel:** Eine Handy-App, in der du Ligaportal nutzt und Events **automatisch** speicherst – ohne Kopieren, ohne Tampermonkey, ohne Bookmarklet-Kram.

## Der Weg, der dazu passt

Ordner **`wrapper-android/`** – Android-WebView-Wrapper:

1. App öffnen → bei Ligaportal einloggen (Session bleibt in der App)
2. Live-Editor öffnen (Button **Demo** = Testspiel ohne echtes Match)
3. Overlay erscheint → **In Ligaportal speichern** = direkt im Ticker

Bauen: Android Studio → `wrapper-android/` öffnen → Run. Details in [`wrapper-android/README.md`](wrapper-android/README.md).

## Warum nicht „nur GitHub Pages“?

Eine Website auf `github.io` darf die Ligaportal-Login-Session nicht mitbenutzen. Deshalb können Bookmarklets/Firefox-Addons nur Notlösungen sein – und genau das wolltest du nicht.

## Rest im Repo

| Pfad | Rolle |
|------|--------|
| `wrapper-android/` | **Produkt:** Auto-Ticker-App |
| `docs/overlay.js` | UI, die in Ligaportal postet (von der App injiziert) |
| `docs/` | optionale Planungs-PWA / Demo-XI |
| `userscript/` | Legacy / Desktop |

Repo: https://github.com/Forsti37/tickerwrapper
