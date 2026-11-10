/*! TickerWrapper Overlay – läuft AUF Ligaportal (gleiche Session → direkt posten) */
(function () {
  "use strict";
  if (window.__TW_OVERLAY__) {
    window.__TW_OVERLAY__.open();
    return;
  }
  if (!/ligaportal\.at$/i.test(location.hostname)) {
    alert("TickerWrapper-Overlay nur auf ticker.ligaportal.at (Live-Editor).");
    return;
  }
  if (!/\/liveGame\/edit\/\d+/i.test(location.pathname)) {
    alert("Bitte zuerst ein Spiel im Ligaportal-Editor öffnen (…/liveGame/edit/…).");
    return;
  }

  const HOME_CLUB = "Loosdorf";
  const STORAGE = "tw.overlay.v1";

  const TYPES = [
    { id: "7", label: "Tor", player: 1 },
    { id: "12", label: "Gelb", player: 1 },
    { id: "13", label: "Rot", player: 1 },
    { id: "21", label: "G/R", player: 1 },
    { id: "17", label: "Wechsel", player: 2 },
    { id: "14", label: "ET", player: 1 },
    { id: "1", label: "Text", player: 0 },
  ];

  const DEMO_NUMS = {
    "stefan kranabetter": "1",
    "tomas salata": "4",
    "constantin scharner": "5",
    "matthias biber": "6",
    "david lechner": "7",
    "patrik chrenko": "8",
    "daniel rapavy": "9",
    "moritz mayr": "11",
    "valentin rulling": "12",
    "gabriel kerschbaummeier": "13",
    "marco moser": "14",
    "patrick dallinger": "1",
    "amir rulani": "3",
    "hemad akbari": "10",
    "paul mayr": "16",
    "egzon rullani": "17",
    "nedim salihovic": "18",
  };

  function norm(s) {
    return String(s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  function loadPrefs() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE) || "{}");
    } catch {
      return {};
    }
  }
  function savePrefs(p) {
    localStorage.setItem(STORAGE, JSON.stringify(p));
  }

  const prefs = loadPrefs();
  prefs.nicks = prefs.nicks || {};
  prefs.nums = prefs.nums || {};
  Object.assign(prefs.nums, DEMO_NUMS);

  function qs(s, r = document) {
    return r.querySelector(s);
  }
  function qsa(s, r = document) {
    return [...r.querySelectorAll(s)];
  }

  function scrape() {
    const m = location.pathname.match(/\/liveGame\/edit\/(\d+)/);
    const gameId = m ? m[1] : qs("#id")?.value || "";
    const title = qs("h1")?.textContent?.trim() || document.title;
    const scoreLink = qsa("a").find((a) => /^\d+:\d+$/.test(a.textContent.trim()));
    const score = scoreLink?.textContent.trim() || "0:0";
    const teams = qsa('input[name="eventTeam"]').map((el) => ({
      id: el.value,
      label: (el.closest("label")?.textContent || el.id || "")
        .toString()
        .replace(/\s+/g, " ")
        .trim(),
    }));
    const players = [];
    qsa("#eventPlayer1 optgroup").forEach((g) => {
      const teamLabel = g.label.replace(/^---\s*|\s*---$/g, "").trim();
      qsa("option", g).forEach((opt) => {
        if (!opt.value) return;
        players.push({ id: opt.value, name: opt.textContent.trim(), teamLabel });
      });
    });
    const byLabel = Object.fromEntries(
      teams.filter((t) => t.id !== "0").map((t) => [norm(t.label), t.id])
    );
    players.forEach((p) => {
      const key = Object.keys(byLabel).find(
        (k) => norm(p.teamLabel).includes(k) || k.includes(norm(p.teamLabel))
      );
      p.teamId = key ? byLabel[key] : "";
    });
    const homeTeamId =
      teams.find((t) => norm(t.label).includes(norm(HOME_CLUB)))?.id ||
      teams.find((t) => t.id !== "0")?.id ||
      "0";
    const awayTeamId = teams.find((t) => t.id !== "0" && t.id !== homeTeamId)?.id || "";
    const parts = title.split(/\s+-\s+/);
    return {
      gameId,
      title,
      score,
      teams,
      players,
      homeTeamId,
      awayTeamId,
      homeName: (parts[0] || "").trim(),
      awayName: (parts[1] || "").trim(),
      minute: qs("#liveGameEventMinute")?.value || "",
      statusActions: qsa('a[href*="/liveGame/"]')
        .map((a) => ({
          href: a.getAttribute("href"),
          label: a.textContent.replace(/\s+/g, " ").trim(),
        }))
        .filter((a) =>
          /starten|Halbzeit|2\.|zweite|beenden|rückgängig|abbruch|anpfeifen/i.test(a.label)
        ),
    };
  }

  function shortName(p) {
    if (!p) return "";
    return prefs.nicks[p.id] || p.name.split(/\s+/).at(-1) || p.name;
  }

  function numOf(p) {
    return prefs.nums[p.id] || prefs.nums[norm(p.name)] || "";
  }

  function labelOf(p) {
    const n = numOf(p);
    const nick = prefs.nicks[p.id];
    const base = nick ? `${nick} (${p.name})` : p.name;
    return n ? `#${n} ${base}` : base;
  }

  function nextScore(score, teamId, homeId, awayId, ownGoal) {
    const m = String(score).match(/(\d+)\s*:\s*(\d+)/);
    let h = m ? +m[1] : 0;
    let a = m ? +m[2] : 0;
    const homeScores = ownGoal ? teamId === awayId : teamId === homeId;
    if (homeScores) h += 1;
    else a += 1;
    return `${h}:${a}`;
  }

  async function postEvent(payload) {
    const fd = new FormData();
    Object.entries(payload).forEach(([k, v]) => fd.set(k, v ?? ""));
    fd.set("_action_addEvent", "Speichern");
    return fetch("/liveGame/index", {
      method: "POST",
      body: fd,
      credentials: "include",
      redirect: "follow",
    });
  }

  const style = document.createElement("style");
  style.textContent = `
#tw-ov{all:initial;font-family:system-ui,-apple-system,sans-serif;position:fixed;inset:auto 0 0 0;z-index:2147483646;color:#0f172a}
#tw-ov *{box-sizing:border-box}
#tw-ov-panel{background:#f8fafc;border-top:1px solid #cbd5e1;box-shadow:0 -10px 40px rgba(0,0,0,.25);max-height:90vh;overflow:auto;padding:12px 12px calc(14px + env(safe-area-inset-bottom))}
#tw-ov-bar{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:8px}
#tw-ov-title{font-weight:800;font-size:14px}
#tw-ov-score{font-weight:900;font-size:22px}
#tw-ov-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:8px 0}
#tw-ov button,#tw-ov a.twb{appearance:none;border:1px solid #cbd5e1;background:#fff;border-radius:14px;padding:12px 8px;font-weight:700;font-size:13px;min-height:44px;color:inherit;text-decoration:none;display:inline-flex;align-items:center;justify-content:center}
#tw-ov button.on{background:#0b1f14;color:#b8f26e;border-color:#0b1f14}
#tw-ov-teams{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:8px 0}
#tw-ov-list{display:grid;gap:6px;max-height:34vh;overflow:auto;margin:8px 0}
#tw-ov-list button{justify-content:flex-start;text-align:left;padding:12px}
#tw-ov input,#tw-ov textarea{width:100%;border:1px solid #cbd5e1;border-radius:12px;padding:12px;font-size:16px;margin:6px 0;background:#fff}
#tw-ov-save{width:100%;border:0!important;background:#16a34a!important;color:#fff!important;border-radius:14px;padding:16px;font-size:16px;font-weight:800;margin-top:8px}
#tw-ov-save:disabled{opacity:.45}
#tw-ov-fab{position:fixed;right:14px;bottom:14px;z-index:2147483647;border:0;border-radius:999px;background:#0b1f14;color:#b8f26e;padding:14px 16px;font-weight:800;box-shadow:0 8px 24px rgba(0,0,0,.3)}
#tw-ov-status{font-size:12px;color:#475569;min-height:1.2em;margin-top:6px}
#tw-ov-actions{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0}
#tw-ov .muted{font-size:12px;color:#64748b}
@media(min-width:900px){#tw-ov{inset:12px 12px auto auto;width:400px}#tw-ov-panel{border:1px solid #cbd5e1;border-radius:18px;max-height:85vh}}
`;
  document.documentElement.append(style);

  const root = document.createElement("div");
  root.id = "tw-ov";
  const fab = document.createElement("button");
  fab.id = "tw-ov-fab";
  fab.type = "button";
  fab.textContent = "TW";
  const panel = document.createElement("div");
  panel.id = "tw-ov-panel";
  root.append(panel);
  document.documentElement.append(root, fab);

  let open = true;
  fab.style.display = "none";
  fab.onclick = () => {
    open = true;
    panel.style.display = "";
    fab.style.display = "none";
    render();
  };

  const state = {
    type: "7",
    teamId: "",
    p1: "",
    p2: "",
    minute: "",
    text: "",
    q: "",
    busy: false,
  };

  let game = scrape();
  state.teamId = game.homeTeamId;
  state.minute = game.minute || "";

  function teamLabel(id) {
    return game.teams.find((t) => t.id === id)?.label || "";
  }
  function player(id) {
    return game.players.find((p) => p.id === id);
  }

  function buildText() {
    const p = player(state.p1);
    const p2 = player(state.p2);
    if (state.type === "7") {
      const stand = nextScore(game.score, state.teamId, game.homeTeamId, game.awayTeamId, false);
      return `Tor ${shortName(p)} (${state.minute || "?"}') – ${stand}`;
    }
    if (state.type === "14") {
      const stand = nextScore(game.score, state.teamId, game.homeTeamId, game.awayTeamId, true);
      return `Eigentor ${shortName(p)} (${state.minute || "?"}') – ${stand}`;
    }
    if (state.type === "12") return `Gelbe Karte (${teamLabel(state.teamId)}) für: ${shortName(p)}`;
    if (state.type === "13") return `Rote Karte (${teamLabel(state.teamId)}) für: ${shortName(p)}`;
    if (state.type === "21") return `Gelb-Rote Karte (${teamLabel(state.teamId)}) für: ${shortName(p)}`;
    if (state.type === "17")
      return `Wechsel bei ${teamLabel(state.teamId)}. Aus dem Spiel: ${shortName(p)} Neu im Spiel: ${shortName(p2)}`;
    return state.text;
  }

  function filtered() {
    const qq = norm(state.q);
    return game.players
      .filter((p) => !state.teamId || state.teamId === "0" || p.teamId === state.teamId || !p.teamId)
      .filter((p) => {
        if (!qq) return true;
        return norm(`${p.name} ${prefs.nicks[p.id] || ""} ${numOf(p)}`).includes(qq) || qq === numOf(p);
      })
      .sort((a, b) => (+numOf(a) || 99) - (+numOf(b) || 99) || a.name.localeCompare(b.name))
      .slice(0, 40);
  }

  function setStatus(msg, ok) {
    const el = qs("#tw-ov-status", panel);
    if (!el) return;
    el.textContent = msg || "";
    el.style.color = ok === false ? "#b91c1c" : ok === true ? "#15803d" : "#475569";
  }

  function render() {
    game = scrape();
    panel.replaceChildren();
    const meta = TYPES.find((t) => t.id === state.type);

    const bar = document.createElement("div");
    bar.id = "tw-ov-bar";
    bar.innerHTML = `<div><div id="tw-ov-title"></div><div id="tw-ov-score"></div></div>`;
    bar.querySelector("#tw-ov-title").textContent = game.title;
    bar.querySelector("#tw-ov-score").textContent = game.score;
    const close = document.createElement("button");
    close.type = "button";
    close.textContent = "×";
    close.onclick = () => {
      open = false;
      panel.style.display = "none";
      fab.style.display = "";
    };
    bar.append(close);
    panel.append(bar);

    const hint = document.createElement("p");
    hint.className = "muted";
    hint.textContent = "Speichern schreibt direkt in Ligaportal (dein Login). Kein Kopieren.";
    panel.append(hint);

    if (game.statusActions.length) {
      const actions = document.createElement("div");
      actions.id = "tw-ov-actions";
      game.statusActions.forEach((a) => {
        const link = document.createElement("a");
        link.className = "twb";
        link.href = a.href;
        link.textContent = a.label;
        actions.append(link);
      });
      panel.append(actions);
    }

    const grid = document.createElement("div");
    grid.id = "tw-ov-grid";
    TYPES.forEach((t) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = t.label;
      if (state.type === t.id) b.classList.add("on");
      b.onclick = () => {
        state.type = t.id;
        state.p1 = "";
        state.p2 = "";
        state.text = "";
        render();
      };
      grid.append(b);
    });
    panel.append(grid);

    const min = document.createElement("input");
    min.type = "number";
    min.inputMode = "numeric";
    min.placeholder = "Minute";
    min.value = state.minute;
    min.oninput = () => {
      state.minute = min.value;
      if (meta.player) {
        state.text = buildText();
        const ta = qs("textarea", panel);
        if (ta) ta.value = state.text;
      }
    };
    panel.append(min);

    const teams = document.createElement("div");
    teams.id = "tw-ov-teams";
    game.teams
      .filter((t) => t.id !== "0" || state.type === "1")
      .forEach((t) => {
        const b = document.createElement("button");
        b.type = "button";
        b.textContent = t.label || t.id;
        if (state.teamId === t.id) b.classList.add("on");
        b.onclick = () => {
          state.teamId = t.id;
          state.p1 = "";
          state.p2 = "";
          render();
        };
        teams.append(b);
      });
    panel.append(teams);

    if (meta.player > 0) {
      const search = document.createElement("input");
      search.type = "search";
      search.placeholder = meta.player === 2 ? (state.p1 ? "Rein…" : "Raus…") : "Spieler…";
      search.value = state.q;
      search.oninput = () => {
        state.q = search.value;
        render();
      };
      panel.append(search);

      if (meta.player === 2) {
        const info = document.createElement("p");
        info.className = "muted";
        info.textContent = state.p1
          ? `Raus: ${shortName(player(state.p1))} → Rein: ${state.p2 ? shortName(player(state.p2)) : "…"}`
          : "Zuerst raus, dann rein";
        panel.append(info);
      }

      const list = document.createElement("div");
      list.id = "tw-ov-list";
      filtered().forEach((p) => {
        const b = document.createElement("button");
        b.type = "button";
        b.textContent = labelOf(p);
        if (p.id === state.p1 || p.id === state.p2) b.classList.add("on");
        b.onclick = () => {
          if (meta.player === 2) {
            if (!state.p1) state.p1 = p.id;
            else if (!state.p2 && p.id !== state.p1) state.p2 = p.id;
            else {
              state.p1 = p.id;
              state.p2 = "";
            }
          } else state.p1 = p.id;
          state.text = buildText();
          state.q = "";
          render();
        };
        list.append(b);
      });
      panel.append(list);
    }

    const ta = document.createElement("textarea");
    ta.placeholder = "Kommentar…";
    ta.value = state.text || (meta.player ? buildText() : "");
    ta.oninput = () => {
      state.text = ta.value;
    };
    panel.append(ta);

    const can =
      !state.busy &&
      state.minute !== "" &&
      (meta.player < 1 || state.p1) &&
      (meta.player < 2 || state.p2) &&
      (state.type !== "1" || ta.value.trim());

    const save = document.createElement("button");
    save.id = "tw-ov-save";
    save.type = "button";
    save.textContent = state.busy ? "Sende an Ligaportal…" : "In Ligaportal speichern";
    save.disabled = !can;
    save.onclick = async () => {
      state.text = ta.value || buildText();
      state.busy = true;
      render();
      setStatus("Sende…");
      try {
        await postEvent({
          id: game.gameId,
          editEventId: "",
          liveGameEventMinute: state.minute,
          liveGameEventType: state.type,
          eventTeam: state.teamId || "0",
          eventPlayer1: state.p1 || "",
          eventPlayer2: state.p2 || "",
          eventText: state.text || "",
          eventImageName: "",
          eventImageThumbnailName: "",
        });
        setStatus("Gespeichert – lade neu…", true);
        location.href = `/liveGame/edit/${game.gameId}`;
      } catch (e) {
        state.busy = false;
        setStatus("Fehler: " + (e.message || e), false);
        render();
      }
    };
    panel.append(save);

    const st = document.createElement("div");
    st.id = "tw-ov-status";
    panel.append(st);

    savePrefs(prefs);
  }

  window.__TW_OVERLAY__ = {
    open() {
      open = true;
      panel.style.display = "";
      fab.style.display = "none";
      render();
    },
  };

  render();
})();
