// ==UserScript==
// @name         TickerWrapper – Ligaportal Overlay
// @namespace    https://github.com/local/tickerwrapper
// @version      0.4.0
// @description  Handy-first Overlay: Ligaportal + ÖFB-Aufstellung, Formation, Positionswechsel – rein lokal
// @author       local
// @match        https://ticker.ligaportal.at/liveGame/edit/*
// @match        http://ticker.ligaportal.at/liveGame/edit/*
// @match        https://vereine.oefb.at/*/Spielbericht*
// @match        https://vereine.oefb.at/*/spielbericht*
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-idle
// ==/UserScript==

(function () {
  "use strict";

  const HOME_CLUB = "Loosdorf";
  const OEFB_LINEUP_KEY = "tickerwrapper.oefbLineup.v1";
  const MATCH_KEY_PREFIX = "tickerwrapper.match.v1.";

  const POSITIONS = [
    "TW",
    "LV",
    "IV",
    "RV",
    "LWB",
    "RWB",
    "DM",
    "ZM",
    "OM",
    "LM",
    "RM",
    "LW",
    "RW",
    "ST",
  ];

  /** Slot-Reihenfolge je Formation (11 Positionen) */
  const FORMATIONS = {
    "4-4-2": ["TW", "LV", "IV", "IV", "RV", "LM", "ZM", "ZM", "RM", "ST", "ST"],
    "4-3-3": ["TW", "LV", "IV", "IV", "RV", "DM", "ZM", "DM", "LW", "ST", "RW"],
    "4-2-3-1": ["TW", "LV", "IV", "IV", "RV", "DM", "DM", "LM", "OM", "RM", "ST"],
    "3-5-2": ["TW", "IV", "IV", "IV", "LWB", "ZM", "DM", "ZM", "RWB", "ST", "ST"],
    "5-3-2": ["TW", "LV", "IV", "IV", "IV", "RV", "ZM", "DM", "ZM", "ST", "ST"],
    "4-1-4-1": ["TW", "LV", "IV", "IV", "RV", "DM", "LM", "ZM", "ZM", "RM", "ST"],
  };

  function gmSet(key, value) {
    try {
      if (typeof GM_setValue === "function") GM_setValue(key, value);
    } catch {
      /* ignore */
    }
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore */
    }
  }

  function gmGet(key, fallback) {
    try {
      if (typeof GM_getValue === "function") {
        const v = GM_getValue(key, null);
        if (v != null) return v;
      }
    } catch {
      /* ignore */
    }
    try {
      return JSON.parse(localStorage.getItem(key) || "null") ?? fallback;
    } catch {
      return fallback;
    }
  }

  function normalize(s) {
    return String(s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  function playerKey(p) {
    return normalize(p?.name || "") + "|" + String(p?.nr || "");
  }

  function shirtNr(nr) {
    if (nr === "T" || nr === "ET") return "1";
    return String(nr || "").replace(/^0+/, "") || String(nr || "");
  }

  function shortName(name, nick) {
    if (nick) return nick;
    const parts = String(name || "").trim().split(/\s+/);
    return parts.slice(-1)[0] || name || "";
  }

  function emptySide(name) {
    return { name: name || "", start: [], bench: [], formation: "4-4-2" };
  }

  function emptyMatch(meta = {}) {
    return {
      oefbUrl: meta.oefbUrl || "",
      title: meta.title || "",
      home: emptySide(meta.homeName || HOME_CLUB),
      away: emptySide(meta.awayName || "Gast"),
      ts: Date.now(),
    };
  }

  function applyFormationSlots(side, formationKey) {
    const slots = FORMATIONS[formationKey] || FORMATIONS["4-4-2"];
    side.formation = formationKey;
    side.start = side.start.slice(0, 11);
    while (side.start.length < 11) {
      side.start.push({ name: "", nr: "", pos: slots[side.start.length] || "ST", on: true });
    }
    side.start.forEach((p, i) => {
      p.pos = slots[i] || p.pos || "ST";
      p.on = true;
    });
    side.bench.forEach((p) => {
      p.pos = p.pos || "";
      p.on = false;
    });
  }

  function rowsFromOefbDom(root = document) {
    return [...root.querySelectorAll(".widget-list_container")]
      .map((c) => {
        const nrRaw = c.querySelector(".widget-player_nr")?.textContent.trim() || "";
        const name =
          c.querySelector(".widget-player_name")?.textContent.trim() ||
          c.querySelector("img")?.alt ||
          "";
        const nr = nrRaw === "T" || nrRaw === "ET" ? nrRaw : nrRaw.replace(/^0+/, "") || nrRaw;
        return { nr, name };
      })
      .filter((r) => r.name);
  }

  function splitOefbRows(rows) {
    let split = -1;
    let seenT = 0;
    for (let i = 0; i < rows.length; i++) {
      if (rows[i].nr === "T") {
        seenT += 1;
        if (seenT === 2) {
          split = i;
          break;
        }
      }
    }
    const homeStart = split > 0 ? rows.slice(0, split) : rows.slice(0, 11);
    const rest = split > 0 ? rows.slice(split) : rows.slice(11);
    const splitEt = rest.findIndex((r) => r.nr === "ET");
    const awayStart = splitEt > 0 ? rest.slice(0, splitEt) : rest.slice(0, 11);
    const benches = splitEt > 0 ? rest.slice(splitEt) : rest.slice(11);
    let etCount = 0;
    let benchSplit = benches.length;
    for (let i = 0; i < benches.length; i++) {
      if (benches[i].nr === "ET") {
        etCount += 1;
        if (etCount === 2) {
          benchSplit = i;
          break;
        }
      }
    }
    return {
      homeStart,
      awayStart,
      homeBench: benches.slice(0, benchSplit),
      awayBench: benches.slice(benchSplit),
    };
  }

  function toMatchPlayers(list, onPitch) {
    return list.map((r) => ({
      name: r.name,
      nr: shirtNr(r.nr),
      pos: "",
      on: !!onPitch,
    }));
  }

  /** Öffentliche ÖFB-Vereins-Spielberichtseite → beide Teams */
  function scrapeOefbLineup(root = document) {
    const rows = rowsFromOefbDom(root);
    const parts = splitOefbRows(rows);
    const title = (root.title || document.title || "").trim();
    const titleBits = title.split("|")[0] || title;
    const vs = titleBits.split(/\s+-\s+|\s+vs\.?\s+/i);
    const homeName = (vs[0] || HOME_CLUB).trim();
    const awayName = (vs[1] || "Gast").trim();

    const match = emptyMatch({
      oefbUrl: location.href,
      title,
      homeName,
      awayName,
    });
    match.home.start = toMatchPlayers(parts.homeStart, true);
    match.home.bench = toMatchPlayers(parts.homeBench, false);
    match.away.start = toMatchPlayers(parts.awayStart, true);
    match.away.bench = toMatchPlayers(parts.awayBench, false);
    applyFormationSlots(match.home, "4-4-2");
    applyFormationSlots(match.away, "4-4-2");

    const toPaste = (list) =>
      list.map((p) => `${p.nr || "?"} ${p.name}`).join("\n");

    return {
      ...match,
      pasteHome: toPaste([...match.home.start, ...match.home.bench]),
      pasteAway: toPaste([...match.away.start, ...match.away.bench]),
      paste: toPaste([...match.home.start, ...match.home.bench]),
      homeStart: parts.homeStart,
      awayStart: parts.awayStart,
      homeBench: parts.homeBench,
      awayBench: parts.awayBench,
    };
  }

  function mountOefbExporter() {
    if (document.querySelector("#tw-oefb-btn")) return;
    const tryMount = () => {
      if (![...document.querySelectorAll(".widget-list_container")].length) return false;
      const btn = document.createElement("button");
      btn.id = "tw-oefb-btn";
      btn.textContent = "TW: Beide Teams → Ligaportal";
      Object.assign(btn.style, {
        position: "fixed",
        right: "12px",
        bottom: "12px",
        zIndex: "2147483647",
        padding: "14px 16px",
        borderRadius: "999px",
        border: "0",
        background: "#0f172a",
        color: "#fff",
        fontWeight: "800",
        fontSize: "14px",
        boxShadow: "0 8px 24px rgba(0,0,0,.3)",
        fontFamily: "system-ui,sans-serif",
      });
      btn.addEventListener("click", async () => {
        const data = scrapeOefbLineup();
        gmSet(OEFB_LINEUP_KEY, data);
        try {
          await navigator.clipboard.writeText(
            `Heim\n${data.pasteHome}\n\nGast\n${data.pasteAway}`
          );
          btn.textContent = "Gespeichert ✓ → Ligaportal XI";
        } catch {
          btn.textContent = "Gespeichert ✓ → Ligaportal XI";
        }
        setTimeout(() => {
          btn.textContent = "TW: Beide Teams → Ligaportal";
        }, 2800);
      });
      document.documentElement.append(btn);
      return true;
    };
    if (!tryMount()) {
      let n = 0;
      const t = setInterval(() => {
        n += 1;
        if (tryMount() || n > 40) clearInterval(t);
      }, 500);
    }
  }

  if (location.hostname.includes("vereine.oefb.at")) {
    mountOefbExporter();
    return;
  }

  const EVENT_TYPES = [
    { id: "7", label: "Tor", needsTeam: true, needsPlayer: true },
    { id: "12", label: "Gelb", needsTeam: true, needsPlayer: true },
    { id: "13", label: "Rot", needsTeam: true, needsPlayer: true },
    { id: "21", label: "Gelb/Rot", needsTeam: true, needsPlayer: true },
    { id: "17", label: "Wechsel", needsTeam: true, needsPlayer: true, needsPlayer2: true },
    { id: "14", label: "Eigentor", needsTeam: true, needsPlayer: true },
    { id: "1", label: "Kommentar", needsTeam: false, needsPlayer: false },
  ];

  const COMMENT_TEMPLATES = [
    { id: "chance", label: "Chance", text: "Beste Chance für {Team}: {Spieler}" },
    { id: "schuss_daneben", label: "Schuss vorbei", text: "{Spieler} zieht ab – knapp vorbei" },
    { id: "gehalten", label: "Gehalten", text: "Chance durch {Spieler} – gut gehalten vom Keeper" },
    { id: "latte", label: "Latte/Pfosten", text: "{Spieler} knallt's an die Latte!" },
    { id: "freistoss", label: "Freistoß", text: "Freistoß für {Team}, gut 18m vor dem Tor" },
    { id: "ecke", label: "Ecke", text: "Ecke für {Team}" },
    { id: "behandlung", label: "Behandlung", text: "{Spieler} wird behandelt" },
    { id: "abseitstor", label: "Abseitstor", text: "Abseitstor {Spieler}" },
    { id: "druck", label: "Druckphase", text: "{Team} jetzt mit klarem Übergewicht" },
    { id: "anpfiff", label: "Anpfiff", text: "Das Spiel {Heim} gegen {Gast} wurde soeben angepfiffen." },
    { id: "hz2", label: "2. HZ", text: "Anpfiff zur 2. Halbzeit!" },
    { id: "hz_ende", label: "HZ-Ende", text: "Die erste Halbzeit endet mit einem Pausenstand von {Stand}." },
    { id: "abpfiff", label: "Abpfiff", text: "Das Spiel endet mit {Stand}." },
  ];

  const NICK_KEY = "tickerwrapper.nicknames.v1";
  const NUM_KEY = "tickerwrapper.shirtNumbers.v1";
  const PREFS_KEY = "tickerwrapper.prefs.v1";
  const SQUAD_KEY = "tickerwrapper.homeSquad.v1";

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

  function pickHomeTeamId(teams) {
    const hit = teams.find((t) => normalize(t.label).includes(normalize(HOME_CLUB)));
    return hit?.id || teams.find((t) => t.id !== "0")?.id || "0";
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

    const teamByLabel = Object.fromEntries(
      teams.filter((t) => t.id !== "0").map((t) => [normalize(t.label), t.id])
    );
    players.forEach((p) => {
      const key = Object.keys(teamByLabel).find(
        (k) => normalize(p.teamLabel).includes(k) || k.includes(normalize(p.teamLabel))
      );
      p.teamId = key ? teamByLabel[key] : "";
    });

    const statusActions = qsa('a[href*="/liveGame/"]')
      .map((a) => ({
        href: a.getAttribute("href"),
        label: a.textContent.replace(/\s+/g, " ").trim(),
      }))
      .filter((a) =>
        a.label && /starten|Halbzeit|2\.|zweite|beenden|rückgängig|abbruch|anpfeifen/i.test(a.label)
      );

    const parts = title.split(/\s+-\s+/);
    return {
      gameId,
      title,
      score,
      teams,
      players,
      statusActions,
      suggestedMinute: qs("#liveGameEventMinute")?.value || "",
      homeName: (parts[0] || "").trim(),
      awayName: (parts[1] || "").trim(),
      homeTeamId: pickHomeTeamId(teams),
    };
  }

  function displayName(player, nicks, nums) {
    const nick = nicks[player.id];
    const num =
      nums[player.id] ||
      nums[normalize(player.name)] ||
      (nick && nums[normalize(nick)]) ||
      "";
    const base = nick ? `${nick} (${player.name})` : player.name;
    return num ? `#${num} ${base}` : base;
  }

  function fillTemplate(tpl, ctx) {
    return tpl
      .replaceAll("{Spieler}", ctx.player || "")
      .replaceAll("{SpielerOut}", ctx.playerOut || "")
      .replaceAll("{SpielerIn}", ctx.playerIn || "")
      .replaceAll("{Team}", ctx.team || "")
      .replaceAll("{Heim}", ctx.home || "")
      .replaceAll("{Gast}", ctx.away || "")
      .replaceAll("{Minute}", ctx.minute || "")
      .replaceAll("{Stand}", ctx.score || "");
  }

  function nextScore(current, teamId, homeTeamId, awayTeamId, isOwnGoal) {
    const m = String(current || "0:0").match(/(\d+)\s*:\s*(\d+)/);
    let h = m ? +m[1] : 0;
    let a = m ? +m[2] : 0;
    const scoringHome = isOwnGoal ? teamId === awayTeamId : teamId === homeTeamId;
    if (scoringHome) h += 1;
    else a += 1;
    return `${h}:${a}`;
  }

  /** Wechsel-Kommentar inkl. Positionswechseln auf dem Platz */
  function buildSubComment({ outName, inName, inPos, reshuffles }) {
    const parts = [];
    if (inPos) {
      parts.push(`Neu im Spiel ${inName} als ${inPos} für ${outName}`);
    } else {
      parts.push(`Neu im Spiel ${inName} für ${outName}`);
    }
    (reshuffles || []).forEach((r) => {
      if (r.name && r.pos) parts.push(`${r.name} wechselt dafür auf ${r.pos}`);
    });
    return parts.join(", ") + ".";
  }

  function css() {
    return `
#tw-root{all:initial;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;position:fixed;inset:auto 0 0 0;z-index:2147483646;color:#0f172a}
#tw-panel{background:#f8fafc;border-top:1px solid #cbd5e1;box-shadow:0 -8px 30px rgba(15,23,42,.18);max-height:92vh;overflow:auto;padding:12px 12px calc(12px + env(safe-area-inset-bottom))}
#tw-bar{display:flex;gap:8px;align-items:center;justify-content:space-between;margin-bottom:10px}
#tw-title{font-weight:700;font-size:14px;line-height:1.2}
#tw-score{font-variant-numeric:tabular-nums;font-weight:800;font-size:20px}
#tw-toggle,#tw-tools{border:0;background:#0f172a;color:#fff;border-radius:999px;padding:8px 12px;font-weight:600}
#tw-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:10px 0}
#tw-grid button,#tw-actions a,#tw-actions button,#tw-players button,#tw-teams button,#tw-templates button,.tw-chip{appearance:none;border:1px solid #cbd5e1;background:#fff;border-radius:14px;padding:12px 8px;font-weight:700;font-size:13px;min-height:44px;color:inherit;text-decoration:none;display:inline-flex;align-items:center;justify-content:center}
#tw-grid button.active,#tw-teams button.active,#tw-players button.active,.tw-chip.active{background:#0f172a;color:#fff;border-color:#0f172a}
#tw-actions,#tw-templates{display:flex;flex-wrap:wrap;gap:8px;margin:8px 0}
#tw-row{display:flex;gap:8px;margin:8px 0;align-items:center}
#tw-row input,#tw-row select,#tw-row textarea{flex:1;border:1px solid #cbd5e1;border-radius:12px;padding:12px;font-size:16px;background:#fff}
#tw-row textarea{min-height:72px;resize:vertical}
#tw-teams{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:8px 0}
#tw-players{display:grid;grid-template-columns:1fr;gap:8px;margin:8px 0;max-height:36vh;overflow:auto}
#tw-players button{text-align:left;padding:12px;justify-content:flex-start}
#tw-save{width:100%;border:0;background:#16a34a;color:#fff;border-radius:14px;padding:16px;font-size:16px;font-weight:800;margin-top:8px}
#tw-save:disabled{opacity:.5}
#tw-status{font-size:12px;color:#475569;margin-top:6px;min-height:1.2em}
#tw-nick{display:flex;gap:8px;margin-top:8px}
#tw-nick input{flex:1;border:1px solid #cbd5e1;border-radius:12px;padding:10px;font-size:15px}
#tw-fab{position:fixed;right:14px;bottom:14px;z-index:2147483647;border:0;border-radius:999px;background:#0f172a;color:#fff;padding:14px 16px;font-weight:800;box-shadow:0 8px 24px rgba(0,0,0,.25)}
#tw-modal{position:fixed;inset:0;background:rgba(15,23,42,.55);z-index:2147483647;display:flex;align-items:flex-end;justify-content:center}
#tw-modal > div{background:#fff;width:100%;max-width:560px;border-radius:18px 18px 0 0;padding:16px;max-height:88vh;overflow:auto}
#tw-modal h3{margin:0 0 8px;font-size:18px}
#tw-modal p{margin:0 0 10px;font-size:13px;color:#475569;line-height:1.35}
.tw-side-tabs{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:8px 0}
.tw-pitch{display:flex;flex-direction:column;gap:6px;margin:10px 0;background:linear-gradient(180deg,#166534,#15803d);border-radius:16px;padding:10px}
.tw-slot{display:grid;grid-template-columns:52px 1fr 88px;gap:6px;align-items:center;background:rgba(255,255,255,.92);border-radius:12px;padding:6px 8px}
.tw-slot select,.tw-slot input{border:1px solid #cbd5e1;border-radius:10px;padding:8px;font-size:14px;width:100%;background:#fff}
.tw-slot .pos{font-weight:800;font-size:13px;text-align:center}
.tw-bench{display:flex;flex-direction:column;gap:6px;margin-top:8px}
.tw-bench-row{display:grid;grid-template-columns:1fr auto;gap:6px;align-items:center;border:1px solid #e2e8f0;border-radius:12px;padding:8px 10px;font-size:14px}
.tw-muted{font-size:12px;color:#64748b}
.tw-subbox{border:1px solid #cbd5e1;border-radius:14px;padding:10px;margin:8px 0;background:#fff}
.tw-subbox label{display:block;font-size:12px;font-weight:700;margin:6px 0 4px;color:#334155}
body.tw-compact #header,body.tw-compact #nav,body.tw-compact #footer,body.tw-compact .bs_top{display:none!important}
@media (min-width:900px){#tw-root{inset:12px 12px auto auto;width:420px}#tw-panel{border:1px solid #cbd5e1;border-radius:18px;max-height:85vh}#tw-modal{align-items:center}#tw-modal > div{border-radius:18px}}
`;
  }

  function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      if (k === "className") node.className = v;
      else if (k === "text") node.textContent = v;
      else if (k === "html") node.innerHTML = v;
      else if (k.startsWith("on") && typeof v === "function")
        node.addEventListener(k.slice(2).toLowerCase(), v);
      else if (v !== false && v != null) node.setAttribute(k, v === true ? "" : v);
    });
    children.forEach((c) => c != null && node.append(c));
    return node;
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

  function parseSquadPaste(text) {
    const map = {};
    String(text || "")
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
      .forEach((line) => {
        let m = line.match(/^#?\s*(\d{1,2})\s+(.+)$/);
        if (m) {
          map[normalize(m[2])] = m[1];
          return;
        }
        m = line.match(/^(.+?)\s+#?\s*(\d{1,2})$/);
        if (m) map[normalize(m[1])] = m[2];
      });
    return map;
  }

  function findMatchPlayer(side, nameOrKey) {
    const n = normalize(nameOrKey);
    const all = [...(side.start || []), ...(side.bench || [])];
    return (
      all.find((p) => normalize(p.name) === n) ||
      all.find((p) => normalize(p.name).endsWith(n) || n.endsWith(normalize(p.name))) ||
      all.find((p) => normalize(p.name).includes(n))
    );
  }

  function syncNumsFromMatch(match, nums, gamePlayers) {
    const applyList = (list) => {
      list.forEach((mp) => {
        if (!mp?.name) return;
        const nr = shirtNr(mp.nr);
        if (nr) nums[normalize(mp.name)] = nr;
        const lp = gamePlayers.find(
          (p) =>
            normalize(p.name) === normalize(mp.name) ||
            normalize(p.name).includes(normalize(mp.name.split(/\s+/).slice(-1)[0]))
        );
        if (lp && nr) nums[lp.id] = nr;
      });
    };
    applyList(match.home?.start || []);
    applyList(match.home?.bench || []);
    applyList(match.away?.start || []);
    applyList(match.away?.bench || []);
  }

  function mount() {
    if (qs("#tw-root")) return;
    const game = scrapeGame();
    if (!game.gameId) return;

    const nicks = loadJson(NICK_KEY, {});
    const nums = loadJson(NUM_KEY, {});
    const prefs = loadJson(PREFS_KEY, { compact: true, open: true });
    const squadPaste = loadJson(SQUAD_KEY, { text: "" });
    Object.assign(nums, parseSquadPaste(squadPaste.text));

    const matchKey = MATCH_KEY_PREFIX + game.gameId;
    let match = gmGet(matchKey, null) || loadJson(matchKey, null);
    if (!match || !match.home) {
      match = emptyMatch({
        homeName: game.homeName || HOME_CLUB,
        awayName: game.awayName || "Gast",
      });
      const oefb = gmGet(OEFB_LINEUP_KEY, null);
      if (oefb?.home?.start?.length) {
        match = {
          oefbUrl: oefb.oefbUrl || oefb.url || "",
          title: oefb.title || "",
          home: oefb.home,
          away: oefb.away,
          ts: oefb.ts || Date.now(),
        };
        // ältere Exporte ohne home-Objekt
        if (!match.home?.start && oefb.homeStart) {
          match.home = emptySide(HOME_CLUB);
          match.away = emptySide("Gast");
          match.home.start = toMatchPlayers(oefb.homeStart, true);
          match.home.bench = toMatchPlayers(oefb.homeBench || [], false);
          match.away.start = toMatchPlayers(oefb.awayStart || [], true);
          match.away.bench = toMatchPlayers(oefb.awayBench || [], false);
          applyFormationSlots(match.home, "4-4-2");
          applyFormationSlots(match.away, "4-4-2");
        }
        syncNumsFromMatch(match, nums, game.players);
        saveJson(NUM_KEY, nums);
      }
    }

    function persistMatch() {
      match.ts = Date.now();
      gmSet(matchKey, match);
      saveJson(matchKey, match);
      gmSet(OEFB_LINEUP_KEY, match);
    }

    if (prefs.compact) document.body.classList.add("tw-compact");

    const awayTeamId =
      game.teams.find((t) => t.id !== "0" && t.id !== game.homeTeamId)?.id || "";

    const state = {
      type: "7",
      teamId: game.homeTeamId,
      player1: "",
      player2: "",
      minute: game.suggestedMinute || "",
      text: "",
      query: "",
      busy: false,
      // Wechsel: Positionswechsel der Bleiber
      subInPos: "",
      reshuffles: [], // [{ playerKey, name, pos }]
      pickMode: "out", // out | in | reshuffle
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

    function teamLabel(id) {
      return game.teams.find((t) => t.id === id)?.label || "";
    }

    function playerById(id) {
      return game.players.find((p) => p.id === id);
    }

    function shortPlayerName(p) {
      if (!p) return "";
      return nicks[p.id] || shortName(p.name);
    }

    function sideForTeamId(teamId) {
      if (!teamId || teamId === "0") return null;
      if (teamId === game.homeTeamId) return match.home;
      if (teamId === awayTeamId) return match.away;
      // Fallback: Favorit = home
      if (normalize(teamLabel(teamId)).includes(normalize(HOME_CLUB))) return match.home;
      return match.away;
    }

    function matchPosForLigaportalPlayer(teamId, lp) {
      const side = sideForTeamId(teamId);
      if (!side || !lp) return "";
      const mp = findMatchPlayer(side, lp.name);
      return mp?.pos || "";
    }

    function applyGoalText() {
      const p = playerById(state.player1);
      const projected = nextScore(
        game.score,
        state.teamId,
        game.homeTeamId,
        awayTeamId,
        state.type === "14"
      );
      state.text = fillTemplate("Tor {Spieler} ({Minute}') – {Stand}", {
        player: shortPlayerName(p),
        minute: state.minute || "?",
        score: projected,
      });
    }

    function applyCardText() {
      const p = playerById(state.player1);
      const kind =
        state.type === "12" ? "Gelbe Karte" : state.type === "13" ? "Rote Karte" : "Gelb-Rote Karte";
      state.text = `${kind} (${teamLabel(state.teamId)}) für: ${shortPlayerName(p)}`;
    }

    function applySubText() {
      const outP = playerById(state.player1);
      const inP = playerById(state.player2);
      if (!outP || !inP) {
        state.text = "";
        return;
      }
      const outName = shortPlayerName(outP);
      const inName = shortPlayerName(inP);
      const side = sideForTeamId(state.teamId);
      const outMp = side ? findMatchPlayer(side, outP.name) : null;
      const inPos = state.subInPos || outMp?.pos || "";
      state.subInPos = inPos;
      state.text = buildSubComment({
        outName,
        inName,
        inPos,
        reshuffles: state.reshuffles.map((r) => ({
          name: r.name,
          pos: r.pos,
        })),
      });
    }

    function filteredPlayers() {
      const q = normalize(state.query);
      const side = sideForTeamId(state.teamId);
      let list = game.players.filter(
        (p) => !state.teamId || state.teamId === "0" || p.teamId === state.teamId || !p.teamId
      );

      // Bei Wechsel: Raus = auf dem Platz, Rein = Bank (wenn Match-State da)
      if (state.type === "17" && side?.start?.length) {
        const onNames = new Set(side.start.filter((p) => p.on !== false).map((p) => normalize(p.name)));
        const benchNames = new Set(side.bench.map((p) => normalize(p.name)));
        if (state.pickMode === "out" || !state.player1) {
          list = list.filter((p) => onNames.has(normalize(p.name)) || [...onNames].some((n) => normalize(p.name).includes(n.split(" ").slice(-1)[0])));
        } else if (state.pickMode === "in" || (state.player1 && !state.player2)) {
          list = list.filter(
            (p) =>
              benchNames.has(normalize(p.name)) ||
              [...benchNames].some((n) => normalize(p.name).includes(n.split(" ").slice(-1)[0]))
          );
        } else if (state.pickMode === "reshuffle") {
          list = list.filter((p) => {
            const n = normalize(p.name);
            if (n === normalize(playerById(state.player1)?.name || "")) return false;
            if (n === normalize(playerById(state.player2)?.name || "")) return false;
            return onNames.has(n) || [...onNames].some((x) => n.includes(x.split(" ").slice(-1)[0]));
          });
        }
      }

      return list
        .filter((p) => {
          if (!q) return true;
          const num = nums[p.id] || nums[normalize(p.name)] || "";
          const pos = matchPosForLigaportalPlayer(state.teamId, p);
          const hay = normalize(`${p.name} ${nicks[p.id] || ""} ${num} ${pos}`);
          return hay.includes(q) || q === num;
        })
        .sort((a, b) => {
          const na = +(nums[a.id] || nums[normalize(a.name)] || 99);
          const nb = +(nums[b.id] || nums[normalize(b.name)] || 99);
          return na - nb || a.name.localeCompare(b.name);
        })
        .slice(0, 50);
    }

    function applySquadText(text) {
      squadPaste.text = text;
      saveJson(SQUAD_KEY, squadPaste);
      const parsed = parseSquadPaste(text);
      Object.keys(nums).forEach((k) => delete nums[k]);
      Object.assign(nums, parsed);
      game.players.forEach((p) => {
        const n = parsed[normalize(p.name)];
        if (n) nums[p.id] = n;
        const last = parsed[normalize(p.name.split(/\s+/).slice(-1)[0])];
        if (!nums[p.id] && last) nums[p.id] = last;
      });
      saveJson(NUM_KEY, nums);
    }

    function importOefbIntoMatch() {
      const oefb = gmGet(OEFB_LINEUP_KEY, null);
      if (!oefb) return false;
      if (oefb.home?.start?.length) {
        match.home = oefb.home;
        match.away = oefb.away;
        match.oefbUrl = oefb.oefbUrl || oefb.url || match.oefbUrl;
        match.title = oefb.title || match.title;
      } else if (oefb.homeStart?.length) {
        match.home.start = toMatchPlayers(oefb.homeStart, true);
        match.home.bench = toMatchPlayers(oefb.homeBench || [], false);
        match.away.start = toMatchPlayers(oefb.awayStart || [], true);
        match.away.bench = toMatchPlayers(oefb.awayBench || [], false);
        applyFormationSlots(match.home, match.home.formation || "4-4-2");
        applyFormationSlots(match.away, match.away.formation || "4-4-2");
        match.oefbUrl = oefb.url || match.oefbUrl;
      } else return false;
      syncNumsFromMatch(match, nums, game.players);
      saveJson(NUM_KEY, nums);
      applySquadText(
        [...match.home.start, ...match.home.bench].map((p) => `${p.nr} ${p.name}`).join("\n")
      );
      persistMatch();
      return true;
    }

    function commitSubstitutionToMatch() {
      const side = sideForTeamId(state.teamId);
      const outP = playerById(state.player1);
      const inP = playerById(state.player2);
      if (!side || !outP || !inP) return;

      const outMp = findMatchPlayer(side, outP.name);
      const inMp = findMatchPlayer(side, inP.name);
      if (!outMp || !inMp) return;

      const takenPos = state.subInPos || outMp.pos;
      // Out → Bank
      side.start = side.start.filter((p) => playerKey(p) !== playerKey(outMp));
      outMp.on = false;
      outMp.pos = "";
      if (!side.bench.some((p) => playerKey(p) === playerKey(outMp))) side.bench.push(outMp);

      // In → Start
      side.bench = side.bench.filter((p) => playerKey(p) !== playerKey(inMp));
      inMp.on = true;
      inMp.pos = takenPos;
      side.start.push(inMp);

      // Reshuffles
      state.reshuffles.forEach((r) => {
        const mp = findMatchPlayer(side, r.name);
        if (mp && mp.on !== false) mp.pos = r.pos;
      });

      persistMatch();
    }

    function openLineupModal() {
      let editSide = "home";
      const backdrop = el("div", {
        id: "tw-modal",
        onClick: (e) => {
          if (e.target === backdrop) backdrop.remove();
        },
      });

      function paint() {
        backdrop.replaceChildren();
        const side = match[editSide];
        const box = el("div", {});
        box.append(
          el("h3", { text: "Aufstellung & Formation" }),
          el("p", {
            text: match.home?.start?.length
              ? `Lokal gespeichert${match.oefbUrl ? " · ÖFB-Link hinterlegt" : ""}. Kein Server.`
              : "ÖFB-Spielbericht öffnen → „Beide Teams → Ligaportal“, oder Link speichern und dort exportieren.",
          })
        );

        box.append(
          el("div", { id: "tw-row" }, [
            el("input", {
              type: "url",
              placeholder: "ÖFB Spielbericht-Link (vereine.oefb.at/…)",
              value: match.oefbUrl || "",
              onChange: (e) => {
                match.oefbUrl = e.target.value.trim();
                persistMatch();
              },
            }),
          ])
        );

        box.append(
          el("div", { id: "tw-row" }, [
            el("button", {
              id: "tw-tools",
              type: "button",
              text: "ÖFB-Export laden",
              onClick: () => {
                if (importOefbIntoMatch()) {
                  setStatus("Beide Teams aus ÖFB übernommen", true);
                  paint();
                } else if (match.oefbUrl) {
                  window.open(match.oefbUrl, "_blank");
                  setStatus("Spielbericht geöffnet – dort exportieren, dann hier laden", true);
                } else {
                  setStatus("Zuerst Link einfügen oder auf ÖFB exportieren", false);
                }
              },
            }),
            el("button", {
              type: "button",
              text: "Link öffnen",
              onClick: () => {
                if (match.oefbUrl) window.open(match.oefbUrl, "_blank");
              },
            }),
          ])
        );

        const tabs = el("div", { className: "tw-side-tabs" }, [
          el("button", {
            type: "button",
            className: editSide === "home" ? "active tw-chip" : "tw-chip",
            text: match.home.name || "Heim",
            onClick: () => {
              editSide = "home";
              paint();
            },
          }),
          el("button", {
            type: "button",
            className: editSide === "away" ? "active tw-chip" : "tw-chip",
            text: match.away.name || "Gast",
            onClick: () => {
              editSide = "away";
              paint();
            },
          }),
        ]);
        box.append(tabs);

        const formRow = el("div", { id: "tw-row" }, [
          el("select", {
            onChange: (e) => {
              applyFormationSlots(side, e.target.value);
              persistMatch();
              paint();
            },
          }),
        ]);
        const sel = formRow.querySelector("select");
        Object.keys(FORMATIONS).forEach((f) => {
          const opt = el("option", { value: f, text: `Formation ${f}` });
          if (f === (side.formation || "4-4-2")) opt.selected = true;
          sel.append(opt);
        });
        box.append(formRow);

        const pitch = el("div", { className: "tw-pitch" });
        (side.start || []).forEach((p, idx) => {
          const slot = el("div", { className: "tw-slot" });
          const posSel = el("select", {
            onChange: (e) => {
              p.pos = e.target.value;
              persistMatch();
            },
          });
          POSITIONS.forEach((pos) => {
            const o = el("option", { value: pos, text: pos });
            if (pos === p.pos) o.selected = true;
            posSel.append(o);
          });
          const nameInp = el("input", {
            type: "text",
            value: p.name || "",
            placeholder: "Spieler",
            onChange: (e) => {
              p.name = e.target.value.trim();
              persistMatch();
            },
          });
          const nrInp = el("input", {
            type: "text",
            value: p.nr || "",
            placeholder: "Nr",
            onChange: (e) => {
              p.nr = e.target.value.trim();
              persistMatch();
            },
          });
          slot.append(posSel, nameInp, nrInp);
          pitch.append(slot);
          void idx;
        });
        box.append(el("div", { className: "tw-muted", text: "Startelf – Position tippen/wählen" }), pitch);

        const bench = el("div", { className: "tw-bench" });
        (side.bench || []).forEach((p) => {
          bench.append(
            el("div", { className: "tw-bench-row" }, [
              el("span", { text: `${p.nr ? "#" + p.nr + " " : ""}${p.name}` }),
              el("span", { className: "tw-muted", text: "Bank" }),
            ])
          );
        });
        box.append(el("div", { className: "tw-muted", text: "Bank" }), bench);

        box.append(
          el("div", { id: "tw-row" }, [
            el("button", {
              id: "tw-tools",
              type: "button",
              text: "Nummern → Ligaportal",
              onClick: () => {
                syncNumsFromMatch(match, nums, game.players);
                saveJson(NUM_KEY, nums);
                applySquadText(
                  [...match.home.start, ...match.home.bench]
                    .map((p) => `${p.nr} ${p.name}`)
                    .join("\n")
                );
                setStatus("Rückennummern übernommen", true);
              },
            }),
            el("button", {
              type: "button",
              text: "Fertig",
              onClick: () => {
                persistMatch();
                backdrop.remove();
                render();
              },
            }),
          ])
        );

        backdrop.append(box);
        document.documentElement.append(backdrop);
      }

      paint();
    }

    function renderSubExtras() {
      if (state.type !== "17" || !state.player1 || !state.player2) return null;
      const outP = playerById(state.player1);
      const side = sideForTeamId(state.teamId);
      const outMp = side && outP ? findMatchPlayer(side, outP.name) : null;
      if (!state.subInPos && outMp?.pos) state.subInPos = outMp.pos;

      const box = el("div", { className: "tw-subbox" });
      box.append(el("label", { text: "Position des Hereinkommenden" }));
      const posRow = el("div", { id: "tw-templates" });
      POSITIONS.forEach((pos) => {
        posRow.append(
          el("button", {
            type: "button",
            className: state.subInPos === pos ? "active" : "",
            text: pos,
            onClick: () => {
              state.subInPos = pos;
              applySubText();
              render();
            },
          })
        );
      });
      box.append(posRow);

      box.append(el("label", { text: "Positionswechsel auf dem Platz (Bleiber)" }));
      state.reshuffles.forEach((r, i) => {
        box.append(
          el("div", { id: "tw-row" }, [
            el("input", { type: "text", value: r.name, disabled: true }),
            el("select", {
              onChange: (e) => {
                r.pos = e.target.value;
                applySubText();
                render();
              },
            }),
            el("button", {
              type: "button",
              text: "×",
              onClick: () => {
                state.reshuffles.splice(i, 1);
                applySubText();
                render();
              },
            }),
          ])
        );
        const sel = box.querySelectorAll("select")[box.querySelectorAll("select").length - 1];
        POSITIONS.forEach((pos) => {
          const o = el("option", { value: pos, text: pos });
          if (pos === r.pos) o.selected = true;
          sel.append(o);
        });
      });

      box.append(
        el("button", {
          type: "button",
          className: state.pickMode === "reshuffle" ? "active tw-chip" : "tw-chip",
          text: state.pickMode === "reshuffle" ? "Spieler tippen…" : "+ Positionswechsel",
          onClick: () => {
            state.pickMode = state.pickMode === "reshuffle" ? "in" : "reshuffle";
            state.query = "";
            render();
          },
        })
      );
      return box;
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
          el("div", { style: "display:flex;gap:6px" }, [
            el("button", {
              id: "tw-tools",
              type: "button",
              text: "XI",
              title: "Aufstellung / Formation",
              onClick: openLineupModal,
            }),
            el("button", {
              id: "tw-toggle",
              type: "button",
              text: "×",
              onClick: () => {
                prefs.open = false;
                saveJson(PREFS_KEY, prefs);
                panel.style.display = "none";
                fab.style.display = "";
              },
            }),
          ]),
        ])
      );

      if (game.statusActions.length) {
        const actions = el("div", { id: "tw-actions" });
        game.statusActions.forEach((a) => actions.append(el("a", { href: a.href, text: a.label })));
        panel.append(actions);
      }

      if (!match.home?.start?.length) {
        panel.append(
          el("p", {
            className: "tw-muted",
            text: "Noch keine ÖFB-Aufstellung – XI tippen oder Spielbericht-Link nutzen.",
          })
        );
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
              state.text = "";
              state.subInPos = "";
              state.reshuffles = [];
              state.pickMode = "out";
              if (t.id !== "1") state.teamId = game.homeTeamId;
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
              if (state.type === "7" || state.type === "14") applyGoalText();
              if (state.type === "17") applySubText();
            },
          }),
        ])
      );

      if (typeMeta?.needsTeam !== false || state.type === "1") {
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
                  state.subInPos = "";
                  state.reshuffles = [];
                  state.pickMode = "out";
                  render();
                },
              })
            );
          });
        panel.append(teams);
      }

      if (typeMeta?.needsPlayer) {
        let placeholder = "Spieler: Name / Nr / Spitzname…";
        if (typeMeta.needsPlayer2) {
          if (state.pickMode === "reshuffle") placeholder = "Bleiber für Positionswechsel…";
          else if (!state.player1) placeholder = "Raus (auf dem Platz)…";
          else if (!state.player2) placeholder = "Rein (von der Bank)…";
          else placeholder = "Suche…";
        }
        panel.append(
          el("div", { id: "tw-row" }, [
            el("input", {
              type: "search",
              placeholder,
              value: state.query,
              onInput: (e) => {
                state.query = e.target.value;
                render();
              },
            }),
          ])
        );

        if (state.type === "17") {
          panel.append(
            el("div", { className: "tw-muted", text:
              state.player1 && state.player2
                ? `Raus: ${shortPlayerName(playerById(state.player1))} → Rein: ${shortPlayerName(playerById(state.player2))}`
                : state.player1
                  ? `Raus: ${shortPlayerName(playerById(state.player1))} – jetzt Rein wählen`
                  : "Zuerst Spieler raus, dann rein",
            })
          );
        }

        const list = el("div", { id: "tw-players" });
        filteredPlayers().forEach((p) => {
          const selected = state.player1 === p.id || state.player2 === p.id;
          const pos = matchPosForLigaportalPlayer(state.teamId, p);
          const label = pos ? `${displayName(p, nicks, nums)} · ${pos}` : displayName(p, nicks, nums);
          list.append(
            el("button", {
              type: "button",
              className: selected ? "active" : "",
              text: label,
              onClick: () => {
                if (typeMeta.needsPlayer2) {
                  if (state.pickMode === "reshuffle") {
                    const name = shortPlayerName(p);
                    if (!state.reshuffles.some((r) => normalize(r.name) === normalize(name))) {
                      state.reshuffles.push({
                        name,
                        pos: POSITIONS.find((x) => x !== (state.subInPos || "")) || "ZM",
                        fullName: p.name,
                      });
                    }
                    state.pickMode = "in";
                    applySubText();
                  } else if (!state.player1) {
                    state.player1 = p.id;
                    state.pickMode = "in";
                    state.subInPos = matchPosForLigaportalPlayer(state.teamId, p) || "";
                  } else if (!state.player2 && p.id !== state.player1) {
                    state.player2 = p.id;
                    applySubText();
                  } else {
                    state.player1 = p.id;
                    state.player2 = "";
                    state.reshuffles = [];
                    state.pickMode = "in";
                    state.subInPos = matchPosForLigaportalPlayer(state.teamId, p) || "";
                    state.text = "";
                  }
                } else {
                  state.player1 = p.id;
                  if (state.type === "7" || state.type === "14") applyGoalText();
                  if (["12", "13", "21"].includes(state.type)) applyCardText();
                }
                render();
              },
            })
          );
        });
        panel.append(list);

        const extras = renderSubExtras();
        if (extras) panel.append(extras);

        if (state.player1 && state.type !== "17") {
          const p = playerById(state.player1);
          panel.append(
            el("div", { id: "tw-nick" }, [
              el("input", {
                type: "text",
                placeholder: `Spitzname ${p?.name || ""}`,
                value: nicks[state.player1] || "",
                onChange: (e) => {
                  const v = e.target.value.trim();
                  if (v) nicks[state.player1] = v;
                  else delete nicks[state.player1];
                  saveJson(NICK_KEY, nicks);
                  setStatus(v ? `Spitzname: ${v}` : "Spitzname entfernt", true);
                  render();
                },
              }),
              el("input", {
                type: "number",
                inputmode: "numeric",
                placeholder: "Nr",
                style: "width:72px",
                value: nums[state.player1] || "",
                onChange: (e) => {
                  const v = e.target.value.trim();
                  if (v) nums[state.player1] = v;
                  else delete nums[state.player1];
                  saveJson(NUM_KEY, nums);
                  render();
                },
              }),
            ])
          );
        }
      }

      if (state.type === "1") {
        const tplRow = el("div", { id: "tw-templates" });
        COMMENT_TEMPLATES.forEach((t) => {
          tplRow.append(
            el("button", {
              type: "button",
              text: t.label,
              onClick: () => {
                const p = playerById(state.player1);
                state.text = fillTemplate(t.text, {
                  player: shortPlayerName(p),
                  team: teamLabel(state.teamId) || HOME_CLUB,
                  home: game.homeName,
                  away: game.awayName,
                  minute: state.minute,
                  score: game.score,
                });
                render();
              },
            })
          );
        });
        panel.append(tplRow);
      }

      panel.append(
        el("div", { id: "tw-row" }, [
          el("textarea", {
            placeholder: "Kommentar…",
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
          text: state.busy ? "Sende…" : "Speichern",
          disabled: !canSave,
          onClick: async () => {
            state.busy = true;
            render();
            setStatus("Sende Event…");
            try {
              if (state.type === "17") commitSubstitutionToMatch();
              await postEvent({
                id: game.gameId,
                editEventId: "",
                liveGameEventMinute: state.minute,
                liveGameEventType: state.type,
                eventTeam:
                  typeMeta?.needsTeam === false && state.type === "1"
                    ? state.teamId || "0"
                    : state.teamId || "0",
                eventPlayer1: state.player1 || "",
                eventPlayer2: state.player2 || "",
                eventText: state.text || "",
                eventImageName: "",
                eventImageThumbnailName: "",
              });
              setStatus("Gespeichert – lade neu…", true);
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

    // Frischen ÖFB-Export automatisch übernehmen, wenn Match noch leer
    if (!match.home?.start?.length) importOefbIntoMatch();

    render();
    root.append(panel);
    document.documentElement.append(style, root, fab);
  }

  mount();
})();
