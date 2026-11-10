(function () {
  "use strict";

  const EVENT_TYPES = [
    { id: "7", label: "Tor", needsTeam: true, needsPlayer: true },
    { id: "12", label: "Gelb", needsTeam: true, needsPlayer: true },
    { id: "13", label: "Rot", needsTeam: true, needsPlayer: true },
    { id: "21", label: "Gelb/Rot", needsTeam: true, needsPlayer: true },
    { id: "17", label: "Wechsel", needsTeam: true, needsPlayer: true, needsPlayer2: true },
    { id: "14", label: "Eigentor", needsTeam: true, needsPlayer: true },
    { id: "1", label: "Kommentar", needsTeam: false, needsPlayer: false },
  ];

  const NICK_KEY = "tickerwrapper.nicknames.v1";
  const PREFS_KEY = "tickerwrapper.prefs.v1";

  function loadJson(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key) || "null") ?? fallback;
    } catch {
      return fallback;
    }
  }

  function saveJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function qs(sel, root = document) {
    return root.querySelector(sel);
  }

  function qsa(sel, root = document) {
    return [...root.querySelectorAll(sel)];
  }

  function parseGameId() {
    const m = location.pathname.match(/\/liveGame\/edit\/(\d+)/);
    return m ? m[1] : qs("#id")?.value || "";
  }

  function scrapeGame() {
    const gameId = parseGameId();
    const title = qs("h1")?.textContent?.trim() || document.title;
    const scoreLink = qsa("a").find((a) => /^\d+:\d+$/.test(a.textContent.trim()));
    const score = scoreLink?.textContent.trim() || "-:-";

    const teams = qsa('input[name="eventTeam"]').map((el) => ({
      id: el.value,
      label: (el.closest("label")?.textContent || el.nextSibling?.textContent || el.id)
        .toString()
        .replace(/\s+/g, " ")
        .trim(),
    }));

    const players = [];
    qsa("#eventPlayer1 optgroup").forEach((group) => {
      const teamLabel = group.label.replace(/^---\s*|\s*---$/g, "").trim();
      qsa("option", group).forEach((opt) => {
        if (!opt.value) return;
        players.push({
          id: opt.value,
          name: opt.textContent.trim(),
          teamLabel,
        });
      });
    });

    // Map team label â†’ team id via radio labels
    const teamByLabel = Object.fromEntries(
      teams.filter((t) => t.id !== "0").map((t) => [normalize(t.label), t.id])
    );
    players.forEach((p) => {
      const key = Object.keys(teamByLabel).find((k) => normalize(p.teamLabel).includes(k) || k.includes(normalize(p.teamLabel)));
      p.teamId = key ? teamByLabel[key] : "";
    });

    const quickTexts = qsa("#quickTextBlocks option")
      .filter((o) => o.value && o.value !== "0")
      .map((o) => ({ id: o.id, label: o.textContent.trim(), text: o.value }));

    const statusActions = qsa('a[href*="/liveGame/"]')
      .map((a) => ({
        href: a.getAttribute("href"),
        label: a.textContent.replace(/\s+/g, " ").trim(),
      }))
      .filter((a) => a.label && /starten|Halbzeit|2\.|zweite|beenden|rÃ¼ckgÃ¤ngig|abbruch|anpfeifen/i.test(a.label));

    const minuteField = qs("#liveGameEventMinute");
    const suggestedMinute = minuteField?.value || "";

    let gameData = null;
    try {
      const raw = [...document.scripts]
        .map((s) => s.textContent)
        .find((t) => t.includes("var gameData"));
      const m = raw && raw.match(/var gameData\s*=\s*(\{[\s\S]*?\n\t\t\t\})/);
      if (m) gameData = Function(`"use strict"; return (${m[1]})`)();
    } catch {
      /* ignore */
    }

    return {
      gameId,
      title,
      score,
      teams,
      players,
      quickTexts,
      statusActions,
      suggestedMinute,
      gameData,
    };
  }

  function normalize(s) {
    return String(s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  function displayName(player, nicks) {
    const nick = nicks[player.id];
    return nick ? `${nick} (${player.name})` : player.name;
  }

  function css() {
    return `
#tw-root{all:initial;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;position:fixed;inset:auto 0 0 0;z-index:2147483646;color:#0f172a}
#tw-panel{background:#f8fafc;border-top:1px solid #cbd5e1;box-shadow:0 -8px 30px rgba(15,23,42,.18);max-height:92vh;overflow:auto;padding:12px 12px calc(12px + env(safe-area-inset-bottom))}
#tw-bar{display:flex;gap:8px;align-items:center;justify-content:space-between;margin-bottom:10px}
#tw-title{font-weight:700;font-size:14px;line-height:1.2}
#tw-score{font-variant-numeric:tabular-nums;font-weight:800;font-size:20px}
#tw-toggle{border:0;background:#0f172a;color:#fff;border-radius:999px;padding:8px 12px;font-weight:600}
#tw-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:10px 0}
#tw-grid button,#tw-actions button,#tw-players button,#tw-teams button{appearance:none;border:1px solid #cbd5e1;background:#fff;border-radius:14px;padding:14px 8px;font-weight:700;font-size:14px;min-height:48px}
#tw-grid button.active,#tw-teams button.active{background:#0f172a;color:#fff;border-color:#0f172a}
#tw-actions{display:flex;flex-wrap:wrap;gap:8px;margin:8px 0}
#tw-actions a,#tw-actions button{text-decoration:none;color:inherit;display:inline-flex;align-items:center;justify-content:center;padding:10px 12px;border-radius:12px;border:1px solid #94a3b8;background:#e2e8f0;font-weight:600;font-size:13px}
#tw-row{display:flex;gap:8px;margin:8px 0;align-items:center}
#tw-row input,#tw-row select,#tw-row textarea{flex:1;border:1px solid #cbd5e1;border-radius:12px;padding:12px;font-size:16px;background:#fff}
#tw-row textarea{min-height:72px;resize:vertical}
#tw-teams,#tw-players{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:8px 0}
#tw-players{grid-template-columns:1fr;max-height:40vh;overflow:auto}
#tw-players button{text-align:left;padding:12px}
#tw-save{width:100%;border:0;background:#16a34a;color:#fff;border-radius:14px;padding:16px;font-size:16px;font-weight:800;margin-top:8px}
#tw-save:disabled{opacity:.5}
#tw-status{font-size:12px;color:#475569;margin-top:6px;min-height:1.2em}
#tw-nick{display:flex;gap:8px;margin-top:8px}
#tw-nick input{flex:1;border:1px solid #cbd5e1;border-radius:12px;padding:10px;font-size:15px}
#tw-fab{position:fixed;right:14px;bottom:14px;z-index:2147483647;border:0;border-radius:999px;background:#0f172a;color:#fff;padding:14px 16px;font-weight:800;box-shadow:0 8px 24px rgba(0,0,0,.25)}
body.tw-compact #header,body.tw-compact #nav,body.tw-compact #footer,body.tw-compact .bs_top{display:none!important}
@media (min-width:900px){#tw-root{inset:12px 12px auto auto;width:380px}#tw-panel{border:1px solid #cbd5e1;border-radius:18px;max-height:85vh}}
`;
  }

  function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      if (k === "className") node.className = v;
      else if (k === "text") node.textContent = v;
      else if (k === "html") node.innerHTML = v;
      else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2).toLowerCase(), v);
      else if (v !== false && v != null) node.setAttribute(k, v === true ? "" : v);
    });
    children.forEach((c) => node.append(c));
    return node;
  }

  async function postEvent(payload) {
    const fd = new FormData();
    Object.entries(payload).forEach(([k, v]) => fd.set(k, v ?? ""));
    fd.set("_action_addEvent", "Speichern");
    const res = await fetch("/liveGame/index", {
      method: "POST",
      body: fd,
      credentials: "include",
      redirect: "follow",
    });
    return res;
  }

  function mount() {
    if (qs("#tw-root")) return;
    const game = scrapeGame();
    if (!game.gameId) return;

    const nicks = loadJson(NICK_KEY, {});
    const prefs = loadJson(PREFS_KEY, { compact: true, open: true });
    if (prefs.compact) document.body.classList.add("tw-compact");

    const state = {
      type: "7",
      teamId: game.teams.find((t) => t.id !== "0")?.id || "0",
      player1: "",
      player2: "",
      minute: game.suggestedMinute || "",
      text: "",
      query: "",
      busy: false,
      step: "type",
    };

    const style = el("style", { text: css() });
    const root = el("div", { id: "tw-root" });
    const fab = el("button", {
      id: "tw-fab",
      type: "button",
      text: "TW",
      onClick: () => {
        prefs.open = !prefs.open;
        saveJson(PREFS_KEY, prefs);
        panel.style.display = prefs.open ? "" : "none";
        fab.style.display = prefs.open ? "none" : "";
      },
    });

    const panel = el("div", { id: "tw-panel" });
    if (!prefs.open) panel.style.display = "none";
    else fab.style.display = "none";

    const status = el("div", { id: "tw-status" });

    function setStatus(msg, ok) {
      status.textContent = msg || "";
      status.style.color = ok === false ? "#b91c1c" : ok === true ? "#15803d" : "#475569";
    }

    function filteredPlayers() {
      const q = normalize(state.query);
      return game.players
        .filter((p) => !state.teamId || state.teamId === "0" || p.teamId === state.teamId || !p.teamId)
        .filter((p) => {
          if (!q) return true;
          const hay = normalize(`${p.name} ${nicks[p.id] || ""}`);
          return hay.includes(q);
        })
        .slice(0, 40);
    }

    function render() {
      panel.replaceChildren();
      const typeMeta = EVENT_TYPES.find((t) => t.id === state.type);

      panel.append(
        el("div", { id: "tw-bar" }, [
          el("div", {}, [
            el("div", { id: "tw-title", text: game.title }),
            el("div", { id: "tw-score", text: game.score }),
          ]),
          el("button", {
            id: "tw-toggle",
            type: "button",
            text: "Einklappen",
            onClick: () => {
              prefs.open = false;
              saveJson(PREFS_KEY, prefs);
              panel.style.display = "none";
              fab.style.display = "";
            },
          }),
        ])
      );

      if (game.statusActions.length) {
        const actions = el("div", { id: "tw-actions" });
        game.statusActions.forEach((a) => {
          actions.append(
            el("a", {
              href: a.href,
              text: a.label,
            })
          );
        });
        panel.append(actions);
      }

      const grid = el("div", { id: "tw-grid" });
      EVENT_TYPES.forEach((t) => {
        grid.append(
          el("button", {
            type: "button",
            className: state.type === t.id ? "active" : "",
            text: t.label,
            onClick: () => {
              state.type = t.id;
              state.player1 = "";
              state.player2 = "";
              if (t.id === "7") {
                const tor = game.quickTexts.find((q) => /tor/i.test(q.label));
                if (tor && !state.text) state.text = tor.text;
              }
              render();
            },
          })
        );
      });
      panel.append(grid);

      panel.append(
        el("div", { id: "tw-row" }, [
          el("input", {
            type: "number",
            inputmode: "numeric",
            placeholder: "Minute",
            value: state.minute,
            onInput: (e) => {
              state.minute = e.target.value;
            },
          }),
        ])
      );

      if (typeMeta?.needsTeam !== false) {
        const teams = el("div", { id: "tw-teams" });
        game.teams
          .filter((t) => t.id !== "0" || state.type === "1")
          .forEach((t) => {
            teams.append(
              el("button", {
                type: "button",
                className: state.teamId === t.id ? "active" : "",
                text: t.label || t.id,
                onClick: () => {
                  state.teamId = t.id;
                  state.player1 = "";
                  state.player2 = "";
                  render();
                },
              })
            );
          });
        panel.append(teams);
      }

      if (typeMeta?.needsPlayer) {
        panel.append(
          el("div", { id: "tw-row" }, [
            el("input", {
              type: "search",
              placeholder: typeMeta.needsPlayer2 ? "Spieler raus suchenâ€¦" : "Spieler suchen / Spitznameâ€¦",
              value: state.query,
              onInput: (e) => {
                state.query = e.target.value;
                render();
              },
            }),
          ])
        );

        const list = el("div", { id: "tw-players" });
        filteredPlayers().forEach((p) => {
          const selected = state.player1 === p.id || state.player2 === p.id;
          list.append(
            el("button", {
              type: "button",
              className: selected ? "active" : "",
              text: displayName(p, nicks),
              onClick: () => {
                if (typeMeta.needsPlayer2) {
                  if (!state.player1) state.player1 = p.id;
                  else if (!state.player2 && p.id !== state.player1) state.player2 = p.id;
                  else {
                    state.player1 = p.id;
                    state.player2 = "";
                  }
                } else {
                  state.player1 = p.id;
                }
                render();
              },
            })
          );
        });
        panel.append(list);

        if (state.player1) {
          const p = game.players.find((x) => x.id === state.player1);
          panel.append(
            el("div", { id: "tw-nick" }, [
              el("input", {
                type: "text",
                placeholder: `Spitzname fÃ¼r ${p?.name || "Spieler"}`,
                value: nicks[state.player1] || "",
                onChange: (e) => {
                  const v = e.target.value.trim();
                  if (v) nicks[state.player1] = v;
                  else delete nicks[state.player1];
                  saveJson(NICK_KEY, nicks);
                  setStatus(v ? `Spitzname gespeichert: ${v}` : "Spitzname entfernt", true);
                },
              }),
            ])
          );
        }
      }

      if (game.quickTexts.length) {
        const sel = el("select", {
          onChange: (e) => {
            const qt = game.quickTexts.find((q) => q.id === e.target.value || q.label === e.target.value);
            const opt = e.target.selectedOptions[0];
            if (opt && opt.value) state.text = opt.value;
            render();
          },
        });
        sel.append(el("option", { value: "", text: "Templateâ€¦" }));
        game.quickTexts.forEach((q) => sel.append(el("option", { value: q.text, text: q.label })));
        panel.append(el("div", { id: "tw-row" }, [sel]));
      }

      panel.append(
        el("div", { id: "tw-row" }, [
          el("textarea", {
            placeholder: "Kommentar (optional bei Tor/Karte, nÃ¶tig bei Kommentar)",
            text: state.text,
            onInput: (e) => {
              state.text = e.target.value;
            },
          }),
        ])
      );

      const canSave =
        !state.busy &&
        state.minute !== "" &&
        (!typeMeta?.needsPlayer || state.player1) &&
        (!typeMeta?.needsPlayer2 || state.player2) &&
        (state.type !== "1" || state.text.trim());

      panel.append(
        el("button", {
          id: "tw-save",
          type: "button",
          text: state.busy ? "Sendeâ€¦" : "Speichern",
          disabled: !canSave,
          onClick: async () => {
            state.busy = true;
            render();
            setStatus("Sende Eventâ€¦");
            try {
              await postEvent({
                id: game.gameId,
                editEventId: "",
                liveGameEventMinute: state.minute,
                liveGameEventType: state.type,
                eventTeam: typeMeta?.needsTeam === false ? "0" : state.teamId || "0",
                eventPlayer1: state.player1 || "",
                eventPlayer2: state.player2 || "",
                eventText: state.text || "",
                eventImageName: "",
                eventImageThumbnailName: "",
              });
              setStatus("Gespeichert â€“ lade neuâ€¦", true);
              location.href = `/liveGame/edit/${game.gameId}`;
            } catch (err) {
              state.busy = false;
              setStatus(`Fehler: ${err.message || err}`, false);
              render();
            }
          },
        })
      );

      panel.append(status);
    }

    render();
    root.append(panel);
    document.documentElement.append(style, root, fab);
  }

  mount();
})();

