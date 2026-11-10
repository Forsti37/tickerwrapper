(() => {
  "use strict";

  const STORAGE = {
    match: "tw.v1.match",
    queue: "tw.v1.queue",
    prefs: "tw.v1.prefs",
    nicks: "tw.v1.nicks",
  };

  const POSITIONS = [
    "TW", "LV", "IV", "RV", "LWB", "RWB", "DM", "ZM", "OM", "LM", "RM", "LW", "RW", "ST",
  ];

  const FORMATIONS = {
    "4-4-2": ["TW", "LV", "IV", "IV", "RV", "LM", "ZM", "ZM", "RM", "ST", "ST"],
    "4-3-3": ["TW", "LV", "IV", "IV", "RV", "DM", "ZM", "DM", "LW", "ST", "RW"],
    "4-2-3-1": ["TW", "LV", "IV", "IV", "RV", "DM", "DM", "LM", "OM", "RM", "ST"],
    "3-5-2": ["TW", "IV", "IV", "IV", "LWB", "ZM", "DM", "ZM", "RWB", "ST", "ST"],
    "5-3-2": ["TW", "LV", "IV", "IV", "IV", "RV", "ZM", "DM", "ZM", "ST", "ST"],
    "4-1-4-1": ["TW", "LV", "IV", "IV", "RV", "DM", "LM", "ZM", "ZM", "RM", "ST"],
  };

  const EVENT_TYPES = [
    { id: "7", label: "Tor" },
    { id: "12", label: "Gelb" },
    { id: "13", label: "Rot" },
    { id: "21", label: "Gelb/Rot" },
    { id: "17", label: "Wechsel" },
    { id: "14", label: "Eigentor" },
    { id: "1", label: "Kommentar" },
  ];

  /** Eingebettetes Demo-Spiel – Handy-Test ohne ÖFB/Ligaportal/Tampermonkey */
  const DEMO_MATCH = {
    demo: true,
    oefbUrl: "https://vereine.oefb.at/LoosdorfAsk/Spielbericht/?Loosdorf-vs-Oberndorf&:s=4078161",
    ligaportalId: "demo",
    title: "ASK Loosdorf - SC Oberndorf (Demo)",
    score: "0:0",
    home: {
      name: "ASK Loosdorf",
      formation: "4-4-2",
      start: [
        { nr: "1", name: "Stefan Kranabetter", pos: "TW", on: true },
        { nr: "4", name: "Tomas Salata", pos: "LV", on: true },
        { nr: "5", name: "Constantin Scharner", pos: "IV", on: true },
        { nr: "13", name: "Gabriel Kerschbaummeier", pos: "IV", on: true },
        { nr: "14", name: "Marco Moser", pos: "RV", on: true },
        { nr: "6", name: "Matthias Biber", pos: "LM", on: true },
        { nr: "8", name: "Patrik Chrenko", pos: "ZM", on: true },
        { nr: "12", name: "Valentin Rülling", pos: "ZM", on: true },
        { nr: "7", name: "David Lechner", pos: "RM", on: true },
        { nr: "9", name: "Daniel Rapavý", pos: "ST", on: true },
        { nr: "11", name: "Moritz Mayr", pos: "ST", on: true },
      ],
      bench: [
        { nr: "1", name: "Patrick Dallinger", pos: "", on: false },
        { nr: "3", name: "Amir Rulani", pos: "", on: false },
        { nr: "10", name: "Hemad Akbari", pos: "", on: false },
        { nr: "16", name: "Paul Mayr", pos: "", on: false },
        { nr: "17", name: "Egzon Rullani", pos: "", on: false },
        { nr: "18", name: "Nedim Salihovic", pos: "", on: false },
      ],
    },
    away: {
      name: "SC Oberndorf",
      formation: "4-4-2",
      start: [
        { nr: "1", name: "Simon Teufl", pos: "TW", on: true },
        { nr: "7", name: "Daniel Eder", pos: "LV", on: true },
        { nr: "8", name: "Benjamin Hayden", pos: "IV", on: true },
        { nr: "13", name: "Dominik Hasala", pos: "IV", on: true },
        { nr: "14", name: "Fabian Hebenstreit", pos: "RV", on: true },
        { nr: "11", name: "Martin Glinz", pos: "LM", on: true },
        { nr: "10", name: "Jan Kozisnik", pos: "ZM", on: true },
        { nr: "12", name: "Jonas Biber", pos: "ZM", on: true },
        { nr: "9", name: "Elias Schragl", pos: "RM", on: true },
        { nr: "16", name: "David Kopatz", pos: "ST", on: true },
        { nr: "17", name: "Julian Tanzer", pos: "ST", on: true },
      ],
      bench: [
        { nr: "1", name: "Fabian Kendler", pos: "", on: false },
        { nr: "2", name: "Julian Schagerl", pos: "", on: false },
        { nr: "6", name: "Jonas Möser", pos: "", on: false },
        { nr: "15", name: "Philipp Penzenauer", pos: "", on: false },
        { nr: "18", name: "Julian Hayden", pos: "", on: false },
        { nr: "21", name: "Blaz Udovcic", pos: "", on: false },
      ],
    },
    ts: Date.now(),
  };

  /** Bausteine – editierbar, keine festen Skizzen-Sätze */
  const DEFAULT_PREFS = {
    homeClub: "Loosdorf",
    templates: {
      goal: "Tor {Spieler} ({Minute}') – {Stand}",
      yellow: "Gelbe Karte ({Team}) für: {Spieler}",
      red: "Rote Karte ({Team}) für: {Spieler}",
      yellowRed: "Gelb-Rote Karte ({Team}) für: {Spieler}",
      ownGoal: "Eigentor {Spieler} ({Minute}') – {Stand}",
      sub: "Wechsel bei {Team}: {Out} raus, {In} rein{InPosPart}{ReshufflePart}.",
      subInPos: " als {PosIn}",
      reshuffleJoin: ", ",
      reshuffleItem: "{Name} auf {Pos}",
      chance: "Beste Chance für {Team}: {Spieler}",
      held: "Chance durch {Spieler} – gut gehalten vom Keeper",
      post: "{Spieler} knallt's an die Latte!",
      kickoff: "Das Spiel {Heim} gegen {Gast} wurde soeben angepfiffen.",
      ht: "Die erste Halbzeit endet mit einem Pausenstand von {Stand}.",
      ft: "Das Spiel endet mit {Stand}.",
    },
  };

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  function load(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key) || "null") ?? fallback;
    } catch {
      return fallback;
    }
  }

  function save(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent("tw-storage", { detail: { key, value } }));
  }

  function normalize(s) {
    return String(s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  function shortName(name, nick) {
    if (nick) return nick;
    const parts = String(name || "").trim().split(/\s+/);
    return parts.at(-1) || name || "";
  }

  function emptySide(name) {
    return { name: name || "", formation: "4-4-2", start: [], bench: [] };
  }

  function emptyMatch() {
    return {
      oefbUrl: "",
      ligaportalId: "",
      title: "",
      score: "0:0",
      home: emptySide("Loosdorf"),
      away: emptySide("Gast"),
      ts: Date.now(),
    };
  }

  function applyFormation(side, key) {
    const slots = FORMATIONS[key] || FORMATIONS["4-4-2"];
    side.formation = key;
    side.start = (side.start || []).slice(0, 11);
    while (side.start.length < 11) {
      side.start.push({ name: "", nr: "", pos: slots[side.start.length], on: true });
    }
    side.start.forEach((p, i) => {
      p.pos = slots[i] || p.pos || "ST";
      p.on = true;
    });
    (side.bench || []).forEach((p) => {
      p.on = false;
    });
  }

  function fill(tpl, ctx) {
    let out = String(tpl || "");
    Object.entries(ctx).forEach(([k, v]) => {
      out = out.replaceAll(`{${k}}`, v == null ? "" : String(v));
    });
    return out.replace(/\s{2,}/g, " ").trim();
  }

  function nextScore(score, forHome) {
    const m = String(score || "0:0").match(/(\d+)\s*:\s*(\d+)/);
    let h = m ? +m[1] : 0;
    let a = m ? +m[2] : 0;
    if (forHome) h += 1;
    else a += 1;
    return `${h}:${a}`;
  }

  function parseLineupPaste(text) {
    const lines = String(text || "")
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    const players = [];
    for (const line of lines) {
      if (/^(heim|gast|start|bank|xi)/i.test(line) && !/\d/.test(line)) continue;
      let m = line.match(/^#?\s*(\d{1,2}|T|ET)\s+(.+)$/i);
      if (m) {
        players.push({ nr: m[1].replace(/^0+/, "") || m[1], name: m[2].trim(), on: true, pos: "" });
        continue;
      }
      m = line.match(/^(.+?)\s+#?\s*(\d{1,2})$/);
      if (m) players.push({ nr: m[2], name: m[1].trim(), on: true, pos: "" });
      else players.push({ nr: "", name: line, on: true, pos: "" });
    }
    return players;
  }

  // —— state ——
  let match = load(STORAGE.match, emptyMatch());
  let queue = load(STORAGE.queue, []);
  let prefs = { ...DEFAULT_PREFS, ...load(STORAGE.prefs, {}), templates: { ...DEFAULT_PREFS.templates, ...(load(STORAGE.prefs, {}).templates || {}) } };
  let nicks = load(STORAGE.nicks, {});
  let tab = "match";
  let editSide = "home";
  let draft = {
    type: "7",
    team: "home",
    minute: "",
    playerOut: null,
    playerIn: null,
    player: null,
    subInPos: "",
    reshuffles: [],
    text: "",
    query: "",
    pick: "player",
  };

  function persistMatch() {
    match.ts = Date.now();
    save(STORAGE.match, match);
  }

  function persistQueue() {
    save(STORAGE.queue, queue);
  }

  function persistPrefs() {
    save(STORAGE.prefs, prefs);
  }

  function bridgeStatus() {
    return !!(window.__TW_BRIDGE__ && window.__TW_BRIDGE__.ok);
  }

  async function copyText(text) {
    const t = String(text || "");
    if (!t) return false;
    try {
      await navigator.clipboard.writeText(t);
      return true;
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = t;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.append(ta);
        ta.select();
        const ok = document.execCommand("copy");
        ta.remove();
        return ok;
      } catch {
        return false;
      }
    }
  }

  function loadDemoMatch() {
    match = JSON.parse(JSON.stringify(DEMO_MATCH));
    match.ts = Date.now();
    queue = [];
    persistMatch();
    persistQueue();
    draft = {
      type: "7",
      team: "home",
      minute: "12",
      playerOut: null,
      playerIn: null,
      player: null,
      subInPos: "",
      reshuffles: [],
      text: "",
      query: "",
      pick: "player",
    };
  }

  function setStatus(msg, kind) {
    const el = $("#status");
    if (!el) return;
    el.textContent = msg || "";
    el.className = "status" + (kind ? " " + kind : "");
  }

  function sideOf(teamKey) {
    return teamKey === "away" ? match.away : match.home;
  }

  function allPlayers(side) {
    return [...(side.start || []), ...(side.bench || [])].filter((p) => p.name);
  }

  function buildEventText() {
    const t = prefs.templates;
    const teamName = sideOf(draft.team).name || (draft.team === "home" ? match.home.name : match.away.name);
    const nick = (name) => shortName(name, nicks[normalize(name)]);

    if (draft.type === "7") {
      const projected = nextScore(match.score, draft.team === "home");
      return fill(t.goal, {
        Spieler: nick(draft.player?.name),
        Minute: draft.minute || "?",
        Stand: projected,
        Team: teamName,
      });
    }
    if (draft.type === "14") {
      const projected = nextScore(match.score, draft.team !== "home");
      return fill(t.ownGoal, {
        Spieler: nick(draft.player?.name),
        Minute: draft.minute || "?",
        Stand: projected,
        Team: teamName,
      });
    }
    if (draft.type === "12") {
      return fill(t.yellow, { Spieler: nick(draft.player?.name), Team: teamName, Minute: draft.minute });
    }
    if (draft.type === "13") {
      return fill(t.red, { Spieler: nick(draft.player?.name), Team: teamName, Minute: draft.minute });
    }
    if (draft.type === "21") {
      return fill(t.yellowRed, { Spieler: nick(draft.player?.name), Team: teamName, Minute: draft.minute });
    }
    if (draft.type === "17") {
      const inPosPart = draft.subInPos
        ? fill(t.subInPos, { PosIn: draft.subInPos })
        : "";
      const reshufflePart = draft.reshuffles.length
        ? (t.reshuffleJoin || ", ") +
          draft.reshuffles
            .map((r) => fill(t.reshuffleItem, { Name: nick(r.name), Pos: r.pos }))
            .join(t.reshuffleJoin || ", ")
        : "";
      return fill(t.sub, {
        Team: teamName,
        Out: nick(draft.playerOut?.name),
        In: nick(draft.playerIn?.name),
        PosIn: draft.subInPos || "",
        InPosPart: inPosPart,
        ReshufflePart: reshufflePart,
        Minute: draft.minute,
      });
    }
    return draft.text || "";
  }

  function commitSubToMatch() {
    const side = sideOf(draft.team);
    const outP = draft.playerOut;
    const inP = draft.playerIn;
    if (!outP || !inP) return;
    const taken = draft.subInPos || outP.pos || "";

    side.start = side.start.filter((p) => normalize(p.name) !== normalize(outP.name));
    const outCopy = { ...outP, on: false, pos: "" };
    if (!side.bench.some((p) => normalize(p.name) === normalize(outCopy.name))) side.bench.push(outCopy);

    side.bench = side.bench.filter((p) => normalize(p.name) !== normalize(inP.name));
    const inCopy = { ...inP, on: true, pos: taken };
    side.start.push(inCopy);

    draft.reshuffles.forEach((r) => {
      const mp = side.start.find((p) => normalize(p.name) === normalize(r.name));
      if (mp) mp.pos = r.pos;
    });
    persistMatch();
  }

  function enqueue() {
    // Freitext aus dem Feld hat Vorrang vor Baustein-Generierung
    const text = (draft.text && draft.text.trim()) || buildEventText();
    draft.text = text;

    const item = {
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      ligaportalId: match.ligaportalId || "",
      minute: draft.minute,
      type: draft.type,
      team: draft.team,
      teamName: sideOf(draft.team).name,
      player1Name: draft.type === "17" ? draft.playerOut?.name : draft.player?.name,
      player2Name: draft.type === "17" ? draft.playerIn?.name : "",
      text,
      status: "queued",
    };

    if (draft.type === "17") commitSubToMatch();
    if (draft.type === "7") match.score = nextScore(match.score, draft.team === "home");
    if (draft.type === "14") match.score = nextScore(match.score, draft.team !== "home");
    persistMatch();

    queue.unshift(item);
    persistQueue();

    // Optional Desktop-Bridge
    if (window.__TW_BRIDGE__?.pushQueue) {
      window.__TW_BRIDGE__.pushQueue(queue);
    }

    draft.player = null;
    draft.playerOut = null;
    draft.playerIn = null;
    draft.subInPos = "";
    draft.reshuffles = [];
    draft.text = "";
    draft.query = "";
    draft.pick = draft.type === "17" ? "out" : "player";

    copyText(formatQueueItem(item)).then((ok) => {
      setStatus(
        ok
          ? "Event gespeichert & in Zwischenablage (für Ligaportal einfügen)"
          : "Event in Warteschlange – unten kopieren",
        "ok"
      );
    });
    render();
  }

  function formatQueueItem(item) {
    const label = EVENT_TYPES.find((t) => t.id === item.type)?.label || item.type;
    return `${item.minute || "–"}' ${label}\n${item.text || ""}`.trim();
  }

  function formatFullQueue() {
    return queue
      .filter((q) => q.status === "queued" || q.status === "copied")
      .map(formatQueueItem)
      .join("\n\n---\n\n");
  }

  function importOefbPayload(data) {
    if (!data) return false;
    if (data.home?.start) {
      match.home = data.home;
      match.away = data.away;
      match.oefbUrl = data.oefbUrl || data.url || match.oefbUrl;
      match.title = data.title || match.title;
      if (data.ligaportalId) match.ligaportalId = String(data.ligaportalId);
      if (!match.home.formation) applyFormation(match.home, "4-4-2");
      if (!match.away.formation) applyFormation(match.away, "4-4-2");
      persistMatch();
      return true;
    }
    return false;
  }

  /** ID oder komplette Ligaportal-URL → reine Ziffern-ID */
  function parseLigaportalId(raw) {
    const s = String(raw || "").trim();
    if (!s) return "";
    const fromUrl = s.match(/\/liveGame\/edit\/(\d+)/i) || s.match(/[?&](?:id|gameId)=(\d+)/i);
    if (fromUrl) return fromUrl[1];
    if (/^\d+$/.test(s)) return s;
    const any = s.match(/(\d{5,})/);
    return any ? any[1] : "";
  }

  function applyLigaportalSession(data) {
    if (!data?.ligaportalId && !data?.ligaportalUrl) return false;
    const id = String(data.ligaportalId || parseLigaportalId(data.ligaportalUrl) || "");
    if (!id) return false;
    match.ligaportalId = id;
    if (data.title) match.title = data.title;
    if (data.score) match.score = data.score;
    if (data.home?.name && !match.home.start?.length) match.home.name = data.home.name;
    if (data.away?.name && !match.away.start?.length) match.away.name = data.away.name;
    // Namen auch aktualisieren wenn Startelf schon da ist
    if (data.home?.name) match.home.name = data.home.name;
    if (data.away?.name) match.away.name = data.away.name;
    persistMatch();
    return true;
  }

  function pullLigaportalFromBridge() {
    const fromBridge = window.__TW_BRIDGE__?.pullMatch?.();
    const fromLs = load("tw.v1.ligaportalSession", null);
    return applyLigaportalSession(fromBridge || fromLs);
  }

  // —— render ——
  function renderBridgePill() {
    const el = $("#bridge-pill");
    if (!el) return;
    if (match.demo) {
      el.className = "bridge-pill on";
      el.textContent = "Demo-Modus";
      return;
    }
    const on = bridgeStatus();
    el.className = "bridge-pill " + (on ? "on" : "off");
    el.textContent = on ? "Bridge aktiv" : "Standalone (ohne Tampermonkey)";
  }

  function renderMatch() {
    const root = $("#view");
    root.innerHTML = "";

    const panel = document.createElement("section");
    panel.className = "panel stack";
    panel.innerHTML = `<h2>Match</h2>`;

    const demoBox = document.createElement("div");
    demoBox.className = "stack";
    const demoIntro = document.createElement("p");
    demoIntro.className = "muted";
    demoIntro.textContent =
      "Handy-Test ohne echtes Spiel: Demo lädt Loosdorf–Oberndorf inkl. Bank & Positionen. Alles lokal in der App – kein Tampermonkey nötig.";
    const demoBtn = document.createElement("button");
    demoBtn.type = "button";
    demoBtn.className = "primary";
    demoBtn.textContent = match.demo ? "Demo neu laden" : "Demo-Spiel laden";
    demoBtn.addEventListener("click", () => {
      loadDemoMatch();
      setStatus("Demo geladen – XI & Ticker ausprobieren", "ok");
      tab = "lineup";
      render();
    });
    demoBox.append(demoIntro, demoBtn);
    panel.append(demoBox);

    const urlField = document.createElement("label");
    urlField.className = "field";
    urlField.textContent = "ÖFB Spielbericht-Link";
    const urlInput = document.createElement("input");
    urlInput.type = "url";
    urlInput.placeholder = "https://vereine.oefb.at/.../Spielbericht/...";
    urlInput.value = match.oefbUrl || "";
    urlInput.addEventListener("change", () => {
      match.oefbUrl = urlInput.value.trim();
      persistMatch();
    });
    urlField.append(urlInput);
    panel.append(urlField);

    const lpField = document.createElement("label");
    lpField.className = "field";
    lpField.textContent = "Ligaportal (ID oder Editor-Link)";
    const lpInput = document.createElement("input");
    lpInput.placeholder = "…/liveGame/edit/1349470  oder nur 1349470";
    lpInput.value = match.ligaportalId || "";
    lpInput.addEventListener("change", () => {
      match.ligaportalId = parseLigaportalId(lpInput.value);
      lpInput.value = match.ligaportalId;
      persistMatch();
      setStatus(match.ligaportalId ? `Ligaportal-ID ${match.ligaportalId}` : "Keine ID erkannt", match.ligaportalId ? "ok" : "err");
    });
    lpField.append(lpInput);
    const lpHint = document.createElement("p");
    lpHint.className = "muted";
    lpHint.textContent =
      "Steckt in der URL nach edit/. Oder Ligaportal-Editor öffnen – Bridge übernimmt die ID automatisch.";
    panel.append(lpField, lpHint);

    const lpRow = document.createElement("div");
    lpRow.className = "row";
    const pullLp = document.createElement("button");
    pullLp.type = "button";
    pullLp.textContent = "ID von Bridge holen";
    pullLp.addEventListener("click", () => {
      if (pullLigaportalFromBridge()) {
        setStatus(`Ligaportal-ID ${match.ligaportalId} übernommen`, "ok");
        render();
      } else {
        setStatus("Noch keine Session – zuerst Ligaportal-Editor öffnen (mit Bridge)", "err");
      }
    });
    lpRow.append(pullLp);
    panel.append(lpRow);

    const scoreField = document.createElement("label");
    scoreField.className = "field";
    scoreField.textContent = "Aktueller Stand";
    const scoreInput = document.createElement("input");
    scoreInput.value = match.score || "0:0";
    scoreInput.addEventListener("change", () => {
      match.score = scoreInput.value.trim() || "0:0";
      persistMatch();
      renderHeader();
    });
    scoreField.append(scoreInput);
    panel.append(scoreField);

    const actions = document.createElement("div");
    actions.className = "row";
    const openBtn = document.createElement("button");
    openBtn.type = "button";
    openBtn.textContent = "ÖFB öffnen";
    openBtn.addEventListener("click", () => {
      if (!match.oefbUrl) {
        setStatus("Zuerst Link einfügen", "err");
        return;
      }
      window.open(match.oefbUrl, "_blank");
      setStatus("Auf ÖFB: „TW: An TickerWrapper“ tippen, dann hier aktualisieren", "ok");
    });
    const pullBtn = document.createElement("button");
    pullBtn.type = "button";
    pullBtn.className = "primary";
    pullBtn.textContent = "Aufstellung übernehmen";
    pullBtn.addEventListener("click", () => {
      const fromBridge = window.__TW_BRIDGE__?.pullLineup?.();
      const fromLs = load("tw.v1.oefbImport", null);
      if (importOefbPayload(fromBridge || fromLs)) {
        setStatus("Beide Teams geladen", "ok");
        tab = "lineup";
        render();
      } else {
        setStatus("Noch kein Export – ÖFB öffnen und Button tippen", "err");
      }
    });
    actions.append(openBtn, pullBtn);
    panel.append(actions);

    const paste = document.createElement("label");
    paste.className = "field";
    paste.textContent = "Fallback: XI+Bank als Text (eine Mannschaft)";
    const ta = document.createElement("textarea");
    ta.placeholder = "1 Stefan Kranabetter\n4 Tomas Salata\n…";
    paste.append(ta);
    const pasteRow = document.createElement("div");
    pasteRow.className = "row";
    ["home", "away"].forEach((sideKey) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = sideKey === "home" ? "→ Heim" : "→ Gast";
      b.addEventListener("click", () => {
        const players = parseLineupPaste(ta.value);
        if (!players.length) return;
        const side = sideOf(sideKey);
        side.start = players.slice(0, 11).map((p) => ({ ...p, on: true }));
        side.bench = players.slice(11).map((p) => ({ ...p, on: false }));
        applyFormation(side, side.formation || "4-4-2");
        persistMatch();
        setStatus(`${sideKey === "home" ? "Heim" : "Gast"} gesetzt`, "ok");
        tab = "lineup";
        render();
      });
      pasteRow.append(b);
    });
    panel.append(paste, pasteRow);

    const hint = document.createElement("p");
    hint.className = "muted";
    hint.textContent =
      "Produktion am Handy: Aufstellung manuell pasten oder (am Desktop optional) Bridge. Events kopierst du in Ligaportal – die App braucht keinen Server und kein Tampermonkey.";
    panel.append(hint);

    root.append(panel);
  }

  function renderLineup() {
    const root = $("#view");
    root.innerHTML = "";
    const panel = document.createElement("section");
    panel.className = "panel stack";
    panel.innerHTML = `<h2>Formation & Positionen</h2>`;

    const tabs = document.createElement("div");
    tabs.className = "chips";
    ["home", "away"].forEach((key) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "chip" + (editSide === key ? " active" : "");
      b.textContent = sideOf(key).name || (key === "home" ? "Heim" : "Gast");
      b.addEventListener("click", () => {
        editSide = key;
        render();
      });
      tabs.append(b);
    });
    panel.append(tabs);

    const side = sideOf(editSide);
    if (!side.start?.length) {
      const empty = document.createElement("p");
      empty.className = "muted";
      empty.textContent = "Noch keine Spieler – unter Match laden oder pasten.";
      panel.append(empty);
      root.append(panel);
      return;
    }

    const nameField = document.createElement("label");
    nameField.className = "field";
    nameField.textContent = "Teamname";
    const nameInp = document.createElement("input");
    nameInp.value = side.name || "";
    nameInp.addEventListener("change", () => {
      side.name = nameInp.value.trim();
      persistMatch();
      renderHeader();
      render();
    });
    nameField.append(nameInp);
    panel.append(nameField);

    const formField = document.createElement("label");
    formField.className = "field";
    formField.textContent = "Formation";
    const sel = document.createElement("select");
    Object.keys(FORMATIONS).forEach((f) => {
      const o = document.createElement("option");
      o.value = f;
      o.textContent = f;
      if (f === (side.formation || "4-4-2")) o.selected = true;
      sel.append(o);
    });
    sel.addEventListener("change", () => {
      applyFormation(side, sel.value);
      persistMatch();
      render();
    });
    formField.append(sel);
    panel.append(formField);

    const pitch = document.createElement("div");
    pitch.className = "pitch";
    side.start.forEach((p) => {
      const slot = document.createElement("div");
      slot.className = "slot";
      const pos = document.createElement("select");
      POSITIONS.forEach((posName) => {
        const o = document.createElement("option");
        o.value = posName;
        o.textContent = posName;
        if (posName === p.pos) o.selected = true;
        pos.append(o);
      });
      pos.addEventListener("change", () => {
        p.pos = pos.value;
        persistMatch();
      });
      const name = document.createElement("input");
      name.value = p.name || "";
      name.placeholder = "Spieler";
      name.addEventListener("change", () => {
        p.name = name.value.trim();
        persistMatch();
      });
      const nr = document.createElement("input");
      nr.value = p.nr || "";
      nr.placeholder = "Nr";
      nr.addEventListener("change", () => {
        p.nr = nr.value.trim();
        persistMatch();
      });
      slot.append(pos, name, nr);
      pitch.append(slot);
    });
    panel.append(pitch);

    const benchTitle = document.createElement("p");
    benchTitle.className = "muted";
    benchTitle.textContent = "Bank";
    panel.append(benchTitle);
    const bench = document.createElement("div");
    bench.className = "bench-list";
    (side.bench || []).forEach((p) => {
      const row = document.createElement("div");
      row.className = "bench-item";
      row.innerHTML = `<span>${p.nr ? "#" + p.nr + " " : ""}${p.name}</span><span class="muted">Bank</span>`;
      bench.append(row);
    });
    panel.append(bench);
    root.append(panel);
  }

  function renderTicker() {
    const root = $("#view");
    root.innerHTML = "";
    const panel = document.createElement("section");
    panel.className = "panel stack";
    panel.innerHTML = `<h2>Ticker</h2>`;

    const types = document.createElement("div");
    types.className = "chips";
    EVENT_TYPES.forEach((t) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "chip" + (draft.type === t.id ? " active" : "");
      b.textContent = t.label;
      b.addEventListener("click", () => {
        draft.type = t.id;
        draft.player = null;
        draft.playerOut = null;
        draft.playerIn = null;
        draft.reshuffles = [];
        draft.subInPos = "";
        draft.text = "";
        draft.pick = t.id === "17" ? "out" : "player";
        render();
      });
      types.append(b);
    });
    panel.append(types);

    const teams = document.createElement("div");
    teams.className = "chips";
    ["home", "away"].forEach((key) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "chip" + (draft.team === key ? " active" : "");
      b.textContent = sideOf(key).name || key;
      b.addEventListener("click", () => {
        draft.team = key;
        draft.player = null;
        draft.playerOut = null;
        draft.playerIn = null;
        render();
      });
      teams.append(b);
    });
    panel.append(teams);

    const minute = document.createElement("label");
    minute.className = "field";
    minute.textContent = "Minute";
    const minuteInp = document.createElement("input");
    minuteInp.inputMode = "numeric";
    minuteInp.value = draft.minute;
    minuteInp.addEventListener("input", () => {
      draft.minute = minuteInp.value;
      if (draft.type !== "1") {
        draft.text = buildEventText();
        const ta = $("#draft-text");
        if (ta) ta.value = draft.text;
      }
    });
    minute.append(minuteInp);
    panel.append(minute);

    if (draft.type === "17") {
      const info = document.createElement("p");
      info.className = "muted";
      const outN = draft.playerOut ? shortName(draft.playerOut.name, nicks[normalize(draft.playerOut.name)]) : "—";
      const inN = draft.playerIn ? shortName(draft.playerIn.name, nicks[normalize(draft.playerIn.name)]) : "—";
      info.textContent =
        draft.pick === "reshuffle"
          ? "Bleiber tippen für Positionswechsel"
          : `Raus: ${outN} → Rein: ${inN}`;
      panel.append(info);
    }

    if (draft.type !== "1") {
      const search = document.createElement("label");
      search.className = "field";
      search.textContent =
        draft.type === "17"
          ? draft.pick === "out" || !draft.playerOut
            ? "Spieler raus"
            : draft.pick === "in" || !draft.playerIn
              ? "Spieler rein"
              : "Suche"
          : "Spieler";
      const q = document.createElement("input");
      q.type = "search";
      q.value = draft.query;
      q.placeholder = "Name / Nr";
      q.addEventListener("input", () => {
        draft.query = q.value;
        render();
      });
      search.append(q);
      panel.append(search);

      const list = document.createElement("div");
      list.className = "player-list";
      const side = sideOf(draft.team);
      let pool = [];
      if (draft.type === "17") {
        if (draft.pick === "reshuffle") {
          pool = (side.start || []).filter(
            (p) =>
              p.name &&
              normalize(p.name) !== normalize(draft.playerOut?.name || "") &&
              normalize(p.name) !== normalize(draft.playerIn?.name || "")
          );
        } else if (!draft.playerOut || draft.pick === "out") {
          pool = (side.start || []).filter((p) => p.name);
        } else {
          pool = (side.bench || []).filter((p) => p.name);
        }
      } else {
        pool = allPlayers(side);
      }
      const qq = normalize(draft.query);
      pool
        .filter((p) => !qq || normalize(`${p.name} ${p.nr} ${p.pos}`).includes(qq))
        .forEach((p) => {
          const b = document.createElement("button");
          b.type = "button";
          const selected =
            normalize(p.name) === normalize(draft.player?.name || "") ||
            normalize(p.name) === normalize(draft.playerOut?.name || "") ||
            normalize(p.name) === normalize(draft.playerIn?.name || "");
          if (selected) b.classList.add("active");
          b.textContent = `${p.nr ? "#" + p.nr + " " : ""}${p.name}${p.pos ? " · " + p.pos : ""}`;
          b.addEventListener("click", () => {
            if (draft.type === "17") {
              if (draft.pick === "reshuffle") {
                draft.reshuffles.push({
                  name: p.name,
                  pos: POSITIONS.find((x) => x !== draft.subInPos) || "ZM",
                });
                draft.pick = "in";
                draft.text = buildEventText();
              } else if (!draft.playerOut) {
                draft.playerOut = p;
                draft.subInPos = p.pos || "";
                draft.pick = "in";
              } else if (!draft.playerIn) {
                draft.playerIn = p;
                draft.text = buildEventText();
              } else {
                draft.playerOut = p;
                draft.playerIn = null;
                draft.reshuffles = [];
                draft.subInPos = p.pos || "";
                draft.pick = "in";
                draft.text = "";
              }
            } else {
              draft.player = p;
              draft.text = buildEventText();
            }
            draft.query = "";
            render();
          });
          list.append(b);
        });
      panel.append(list);
    }

    if (draft.type === "17" && draft.playerOut && draft.playerIn) {
      const subBox = document.createElement("div");
      subBox.className = "stack";
      const lab = document.createElement("p");
      lab.className = "muted";
      lab.textContent = "Position Hereinkommender";
      subBox.append(lab);
      const posChips = document.createElement("div");
      posChips.className = "chips";
      POSITIONS.forEach((pos) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "chip" + (draft.subInPos === pos ? " active" : "");
        b.textContent = pos;
        b.addEventListener("click", () => {
          draft.subInPos = pos;
          draft.text = buildEventText();
          render();
        });
        posChips.append(b);
      });
      subBox.append(posChips);

      draft.reshuffles.forEach((r, i) => {
        const row = document.createElement("div");
        row.className = "row";
        const name = document.createElement("input");
        name.value = r.name;
        name.disabled = true;
        const pos = document.createElement("select");
        POSITIONS.forEach((pn) => {
          const o = document.createElement("option");
          o.value = pn;
          o.textContent = pn;
          if (pn === r.pos) o.selected = true;
          pos.append(o);
        });
        pos.addEventListener("change", () => {
          r.pos = pos.value;
          draft.text = buildEventText();
          render();
        });
        const del = document.createElement("button");
        del.type = "button";
        del.textContent = "×";
        del.addEventListener("click", () => {
          draft.reshuffles.splice(i, 1);
          draft.text = buildEventText();
          render();
        });
        row.append(name, pos, del);
        subBox.append(row);
      });

      const addResh = document.createElement("button");
      addResh.type = "button";
      addResh.textContent = draft.pick === "reshuffle" ? "Spieler wählen…" : "+ Positionswechsel Bleiber";
      if (draft.pick === "reshuffle") addResh.classList.add("active");
      addResh.addEventListener("click", () => {
        draft.pick = draft.pick === "reshuffle" ? "in" : "reshuffle";
        render();
      });
      subBox.append(addResh);
      panel.append(subBox);
    }

    if (draft.type === "1") {
      const tpl = document.createElement("div");
      tpl.className = "chips";
      [
        ["chance", "Chance"],
        ["held", "Gehalten"],
        ["post", "Latte"],
        ["kickoff", "Anpfiff"],
        ["ht", "HZ"],
        ["ft", "Ende"],
      ].forEach(([key, label]) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "chip";
        b.textContent = label;
        b.addEventListener("click", () => {
          draft.text = fill(prefs.templates[key], {
            Team: sideOf(draft.team).name,
            Spieler: shortName(draft.player?.name || "", ""),
            Heim: match.home.name,
            Gast: match.away.name,
            Stand: match.score,
            Minute: draft.minute,
          });
          render();
        });
        tpl.append(b);
      });
      panel.append(tpl);
    }

    const textField = document.createElement("label");
    textField.className = "field";
    textField.textContent = "Text (frei editierbar)";
    const ta = document.createElement("textarea");
    ta.id = "draft-text";
    ta.value = draft.type === "1" ? draft.text : draft.text || buildEventText();
    ta.addEventListener("input", () => {
      draft.text = ta.value;
    });
    textField.append(ta);
    panel.append(textField);

    const send = document.createElement("button");
    send.type = "button";
    send.className = "primary";
    send.textContent = "Übernehmen & kopieren";
    send.addEventListener("click", () => {
      if (!draft.minute && draft.type !== "1") {
        setStatus("Minute fehlt", "err");
        return;
      }
      if (draft.type === "17" && (!draft.playerOut || !draft.playerIn)) {
        setStatus("Raus und Rein wählen", "err");
        return;
      }
      if (["7", "12", "13", "21", "14"].includes(draft.type) && !draft.player) {
        setStatus("Spieler wählen", "err");
        return;
      }
      if (draft.type === "1") draft.text = ta.value;
      else draft.text = ta.value || buildEventText();
      enqueue();
    });
    panel.append(send);

    if (queue.length) {
      const qh = document.createElement("h2");
      qh.textContent = `Protokoll (${queue.length})`;
      panel.append(qh);
      queue.slice(0, 8).forEach((item) => {
        const card = document.createElement("div");
        card.className = "queue-item";
        const head = document.createElement("div");
        head.className = "kv";
        head.innerHTML = `<strong>${item.minute || "–"}'</strong><span>${EVENT_TYPES.find((t) => t.id === item.type)?.label || item.type}</span>`;
        const body = document.createElement("div");
        body.textContent = item.text || "";
        const meta = document.createElement("div");
        meta.className = "muted";
        meta.textContent = item.status + (match.demo ? " · Demo" : "");
        const copyBtn = document.createElement("button");
        copyBtn.type = "button";
        copyBtn.textContent = "Kopieren";
        copyBtn.addEventListener("click", async () => {
          const ok = await copyText(formatQueueItem(item));
          item.status = ok ? "copied" : item.status;
          persistQueue();
          setStatus(ok ? "Kopiert" : "Kopieren fehlgeschlagen", ok ? "ok" : "err");
        });
        card.append(head, body, meta, copyBtn);
        panel.append(card);
      });
      const qActions = document.createElement("div");
      qActions.className = "row";
      const copyAll = document.createElement("button");
      copyAll.type = "button";
      copyAll.className = "primary";
      copyAll.textContent = "Alles kopieren";
      copyAll.addEventListener("click", async () => {
        const ok = await copyText(formatFullQueue());
        setStatus(ok ? "Protokoll in Zwischenablage" : "Kopieren fehlgeschlagen", ok ? "ok" : "err");
      });
      qActions.append(copyAll);
      if (match.ligaportalId && match.ligaportalId !== "demo") {
        const openLp = document.createElement("button");
        openLp.type = "button";
        openLp.textContent = "Ligaportal öffnen";
        openLp.addEventListener("click", () => {
          window.open(`https://ticker.ligaportal.at/liveGame/edit/${match.ligaportalId}`, "_blank");
        });
        qActions.append(openLp);
      }
      panel.append(qActions);
    }

    root.append(panel);
  }

  function renderSettings() {
    const root = $("#view");
    root.innerHTML = "";
    const panel = document.createElement("section");
    panel.className = "panel stack";
    panel.innerHTML = `<h2>Bausteine</h2>
      <p class="muted">Platzhalter: {Spieler} {Out} {In} {PosIn} {InPosPart} {ReshufflePart} {Team} {Heim} {Gast} {Minute} {Stand}</p>`;

    const keys = [
      ["goal", "Tor"],
      ["sub", "Wechsel"],
      ["subInPos", "Wechsel · Pos-Teil"],
      ["reshuffleItem", "Wechsel · Bleiber"],
      ["reshuffleJoin", "Wechsel · Trenner"],
      ["yellow", "Gelb"],
      ["red", "Rot"],
    ];
    keys.forEach(([key, label]) => {
      const lab = document.createElement("label");
      lab.className = "field";
      lab.textContent = label;
      const inp = key.includes("Join") ? document.createElement("input") : document.createElement("textarea");
      inp.value = prefs.templates[key] || "";
      inp.addEventListener("change", () => {
        prefs.templates[key] = inp.value;
        persistPrefs();
        setStatus("Baustein gespeichert", "ok");
      });
      lab.append(inp);
      panel.append(lab);
    });

    const reset = document.createElement("button");
    reset.type = "button";
    reset.className = "danger";
    reset.textContent = "Bausteine zurücksetzen";
    reset.addEventListener("click", () => {
      prefs.templates = { ...DEFAULT_PREFS.templates };
      persistPrefs();
      render();
    });
    panel.append(reset);

    const clearQ = document.createElement("button");
    clearQ.type = "button";
    clearQ.textContent = "Warteschlange leeren";
    clearQ.addEventListener("click", () => {
      queue = [];
      persistQueue();
      setStatus("Warteschlange leer", "ok");
    });
    panel.append(clearQ);

    root.append(panel);
  }

  function renderHeader() {
    $("#match-title").textContent = match.title || `${match.home.name || "Heim"} – ${match.away.name || "Gast"}`;
    $("#match-score").textContent = match.score || "0:0";
    renderBridgePill();
    const demoHeaderBtn = $("#demo-load");
    if (demoHeaderBtn) {
      demoHeaderBtn.textContent = match.demo ? "Demo neu laden" : "Demo-Spiel laden";
    }
  }

  function render() {
    renderHeader();
    $$(".tabs button").forEach((b) => {
      b.classList.toggle("active", b.dataset.tab === tab);
    });
    if (tab === "match") renderMatch();
    else if (tab === "lineup") renderLineup();
    else if (tab === "ticker") renderTicker();
    else renderSettings();
  }

  function init() {
    const demoHeaderBtn = $("#demo-load");
    if (demoHeaderBtn) {
      demoHeaderBtn.addEventListener("click", () => {
        loadDemoMatch();
        setStatus("Demo geladen – jetzt XI oder Ticker tippen", "ok");
        tab = "lineup";
        render();
        demoHeaderBtn.textContent = "Demo neu laden";
      });
    }

    $$(".tabs button").forEach((b) => {
      b.addEventListener("click", () => {
        tab = b.dataset.tab;
        render();
      });
    });

    // Bridge may inject lineup after load
    window.addEventListener("tw-bridge-ready", () => {
      renderBridgePill();
      const payload = window.__TW_BRIDGE__?.pullLineup?.();
      if (payload && !match.home?.start?.length) {
        importOefbPayload(payload);
      }
      if (!match.ligaportalId) pullLigaportalFromBridge();
      render();
    });
    window.addEventListener("tw-lineup-imported", (e) => {
      if (importOefbPayload(e.detail)) {
        setStatus("ÖFB-Aufstellung empfangen", "ok");
        render();
      }
    });
    window.addEventListener("tw-ligaportal-detected", (e) => {
      if (applyLigaportalSession(e.detail)) {
        setStatus(`Ligaportal-ID ${match.ligaportalId} erkannt`, "ok");
        render();
      }
    });

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    }

    render();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
