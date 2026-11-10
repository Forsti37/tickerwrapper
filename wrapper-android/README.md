# TickerWrapper Android (der eigentliche Wrapper)

Eine App mit Ligaportal-WebView. Du loggst dich **in der App** ein – unser Overlay wird auf dem Live-Editor injiziert und speichert **direkt** in Ligaportal.

Kein Tampermonkey, kein Bookmarklet, kein Kopieren.

## Bedienung

1. App starten → Ligaportal laden → einloggen  
2. Spiel-Editor öffnen (oder **Demo** in der Leiste)  
3. Overlay erscheint automatisch (sonst **TW** tippen)  
4. Event → **In Ligaportal speichern**

## Bauen

Voraussetzung: [Android Studio](https://developer.android.com/studio) (mit Android SDK).

```text
File → Open → Ordner wrapper-android/
Run ▶ auf dem Handy (USB-Debugging) oder Emulator
```

Release-APK später: `Build → Build Bundle(s) / APK(s) → Build APK(s)`.

`overlay.js` liegt unter `app/src/main/assets/` (Kopie aus `docs/overlay.js` – nach Overlay-Änderungen neu kopieren).
