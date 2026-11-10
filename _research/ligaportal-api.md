# Ligaportal Live-Ticker Write API (mapped via Demospiel)

Session cookie required (same-origin overlay / userscript). No public API.

## Editor page
`GET /liveGame/edit/{gameId}`

Demo game example: `/liveGame/edit/1349470`

Inline `gameData` includes: `id`, `gameState`, `scoreHome`, `scoreAway`, `duration`, referees, …

## Add event
`POST /liveGame/index` (form `eventForm`, multipart/form-data or urlencoded)

| Field | Notes |
|---|---|
| `id` | game id |
| `editEventId` | empty for create |
| `liveGameEventMinute` | minute string |
| `liveGameEventType` | see types |
| `eventTeam` | `0` general, or team id (home/away) |
| `eventPlayer1` | player id (scorer / carded / player out) |
| `eventPlayer2` | player id (sub in) |
| `eventText` | comment, max ~1024 |
| `eventImageName` | optional |
| `eventImageThumbnailName` | optional |
| `image` | optional file |
| `_action_addEvent` | `Speichern` |

Verified: goal POST updates score (demo 1:0) and creates event id.

Redirects to `/liveGame/index` with flash "Neues Event hinzugefügt". Overlay should re-open `/liveGame/edit/{id}`.

### Event types
| value | label |
|---|---|
| 1 | Kommentar |
| 7 | Tor |
| 12 | Gelbe Karte |
| 13 | Rote Karte |
| 21 | Gelb/Rote Karte |
| 14 | Eigentor |
| 17 | Auswechslung |

## Game state actions (GET links on editor)
| Action | Path |
|---|---|
| Start | `/liveGame/startGame/{id}?addEvent=true` |
| Halbzeit | `/liveGame/pauseGame/{id}?addEvent=true` |
| Undo state | `/liveGame/undoState/{id}` |
| Abort | `/liveGame/cancelGame/{id}` |
| Edit event | `/liveGame/editEvent/{id}?eventId=` |
| Delete event | `/liveGame/deleteEvent/{id}?eventId=` |

Available buttons depend on `gameState`. Prefer scraping current links from the editor DOM.

## Other forms
- `POST /liveGame/updateVisitors` — `id`, `visitors`
- `POST /liveGame/updateResult` — `id`, `scoreHome`, `scoreAway`, `scoreHalftimeHome`, `scoreHalftimeAway`
- `POST /liveGame/toggleMultipleEvents`
- `GET /referee/ajaxSelectOptions`

## Built-in quick texts (`#quickTextBlocks`)
Willkommen, Schiedsrichter, Anpfiff, Besucher, Tor (literal "Tor! Tooor! Toooooor")

## Overlay strategy
Userscript on `ticker.ligaportal.at` while logged in; scrape roster from `#eventPlayer1` optgroups; POST same form fields; keep nicknames in `localStorage`.
