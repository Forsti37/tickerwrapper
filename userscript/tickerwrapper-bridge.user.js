// ==UserScript==
// @name         TickerWrapper Bridge
// @namespace    https://github.com/local/tickerwrapper
// @version      1.1.0
// @description  Verbindet GitHub-Pages-PWA ↔ ÖFB-Spielbericht ↔ Ligaportal (ohne eigenen Server)
// @author       local
// @match        https://ticker.ligaportal.at/liveGame/edit/*
// @match        http://ticker.ligaportal.at/liveGame/edit/*
// @match        https://vereine.oefb.at/*/Spielbericht*
// @match        https://vereine.oefb.at/*/spielbericht*
// @match        https://*.github.io/tickerwrapper/*
// @match        https://*.github.io/tickerwrapper
// @match        http://localhost/*
// @match        http://127.0.0.1/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addValueChangeListener
// @run-at       document-idle
// ==/UserScript==

(function () {
  "use strict";

  const KEY_LINEUP = "tw.bridge.lineup.v1";
  const KEY_QUEUE = "tw.bridge.queue.v1";
  const KEY_MATCH = "tw.bridge.match.v1";

  function gmSet(key, value) {
    try {
      GM_setValue(key, value);
    } catch {
      /* ignore */
    }
  }

  function gmGet(key, fallback) {
    try {
      const v = GM_getValue(key, null);
      return v == null ? fallback : v;
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

  function shirtNr(nr) {
    if (nr === "T" || nr === "ET") return "1";
    return String(nr || "").replace(/^0+/, "") || String(nr || "");
  }

  function applyFormation(side, key) {
    const FORMATIONS = {
      "4-4-2": ["TW", "LV", "IV", "IV", "RV", "LM", "ZM", "ZM", "RM", "ST", "ST"],
      "4-3-3": ["TW", "LV", "IV", "IV", "RV", "DM", "ZM", "DM", "LW", "ST", "RW"],
    };
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
  }

  function scrapeOefb() {
    const rows = [...document.querySelectorAll(".widget-list_container")]
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
    const homeBench = benches.slice(0, benchSplit);
    const awayBench = benches.slice(benchSplit);
    const title = document.title || "";
    const bits = (title.split("|")[0] || title).split(/\s+-\s+|\s+vs\.?\s+/i);
    const toPlayers = (list, on) =>
      list.map((r) => ({ name: r.name, nr: shirtNr(r.nr), pos: "", on }));

    const home = {
      name: (bits[0] || "Heim").trim(),
      formation: "4-4-2",
      start: toPlayers(homeStart, true),
      bench: toPlayers(homeBench, false),
    };
    const away = {
      name: (bits[1] || "Gast").trim(),
      formation: "4-4-2",
      start: toPlayers(awayStart, true),
      bench: toPlayers(awayBench, false),
    };
    applyFormation(home, "4-4-2");
    applyFormation(away, "4-4-2");

    return {
      oefbUrl: location.href,
      url: location.href,
      title,
      home,
      away,
      ts: Date.now(),
    };
  }

  function fab(label, onClick) {
    if (document.querySelector("#tw-bridge-fab")) return;
    const btn = document.createElement("button");
    btn.id = "tw-bridge-fab";
    btn.textContent = label;
    Object.assign(btn.style, {
      position: "fixed",
      right: "12px",
      bottom: "12px",
      zIndex: "2147483647",
      padding: "14px 16px",
      borderRadius: "999px",
      border: "0",
      background: "#0b1f14",
      color: "#b8f26e",
      fontWeight: "800",
      fontSize: "14px",
      boxShadow: "0 8px 24px rgba(0,0,0,.35)",
      fontFamily: "system-ui,sans-serif",
    });
    btn.addEventListener("click", onClick);
    document.documentElement.append(btn);
    return btn;
  }

  // —— ÖFB ——
  if (location.hostname.includes("vereine.oefb.at")) {
    const tryMount = () => {
      if (![...document.querySelectorAll(".widget-list_container")].length) return false;
      fab("TW: An TickerWrapper", () => {
        const data = scrapeOefb();
        gmSet(KEY_LINEUP, data);
        gmSet(KEY_MATCH, data);
        const btn = document.querySelector("#tw-bridge-fab");
        if (btn) {
          btn.textContent = "Gespeichert ✓";
          setTimeout(() => {
            btn.textContent = "TW: An TickerWrapper";
          }, 2200);
        }
      });
      return true;
    };
    if (!tryMount()) {
      let n = 0;
      const t = setInterval(() => {
        n += 1;
        if (tryMount() || n > 40) clearInterval(t);
      }, 500);
    }
    return;
  }

  // —— PWA (GitHub Pages / localhost) ——
  if (
    location.hostname.endsWith("github.io") ||
    location.hostname === "localhost" ||
    location.hostname === "127.0.0.1"
  ) {
    function pushToPage() {
      const lineup = gmGet(KEY_LINEUP, null);
      const queue = gmGet(KEY_QUEUE, []);
      const bridgeMatch = gmGet(KEY_MATCH, null);
      try {
        if (lineup) localStorage.setItem("tw.v1.oefbImport", JSON.stringify(lineup));
        if (queue) localStorage.setItem("tw.v1.queue", JSON.stringify(queue));
        if (bridgeMatch?.ligaportalId) {
          localStorage.setItem("tw.v1.ligaportalSession", JSON.stringify(bridgeMatch));
        }
      } catch {
        /* ignore */
      }
      window.__TW_BRIDGE__ = {
        ok: true,
        pullLineup: () => gmGet(KEY_LINEUP, null),
        pullMatch: () => gmGet(KEY_MATCH, null),
        pushQueue: (q) => gmSet(KEY_QUEUE, q),
        pullQueue: () => gmGet(KEY_QUEUE, []),
      };
      window.dispatchEvent(new CustomEvent("tw-bridge-ready"));
      if (lineup) {
        window.dispatchEvent(new CustomEvent("tw-lineup-imported", { detail: lineup }));
      }
      if (bridgeMatch?.ligaportalId) {
        window.dispatchEvent(new CustomEvent("tw-ligaportal-detected", { detail: bridgeMatch }));
      }
    }

    pushToPage();
    try {
      GM_addValueChangeListener(KEY_LINEUP, () => pushToPage());
      GM_addValueChangeListener(KEY_QUEUE, () => pushToPage());
      GM_addValueChangeListener(KEY_MATCH, () => pushToPage());
    } catch {
      /* older TM */
    }

    function mergeMatchFromPage(pageMatch) {
      if (!pageMatch) return;
      const prev = gmGet(KEY_MATCH, {}) || {};
      const homeHasXi = (pageMatch.home?.start || []).some((p) => p?.name);
      const prevHomeXi = (prev.home?.start || []).some((p) => p?.name);
      gmSet(KEY_MATCH, {
        ...prev,
        ...pageMatch,
        ligaportalId: pageMatch.ligaportalId || prev.ligaportalId || "",
        ligaportalUrl: pageMatch.ligaportalUrl || prev.ligaportalUrl || "",
        home: homeHasXi ? pageMatch.home : prev.home || pageMatch.home,
        away: (pageMatch.away?.start || []).some((p) => p?.name)
          ? pageMatch.away
          : prev.away || pageMatch.away,
        // falls PWA noch keine XI hat, ÖFB/LP-Daten behalten
        ...(homeHasXi || !prevHomeXi ? {} : { home: prev.home, away: prev.away }),
      });
    }

    // Page → GM when PWA writes queue
    window.addEventListener("tw-storage", (e) => {
      if (e.detail?.key === "tw.v1.queue") gmSet(KEY_QUEUE, e.detail.value);
      if (e.detail?.key === "tw.v1.match") mergeMatchFromPage(e.detail.value);
    });

    // Also poll localStorage queue written by app
    setInterval(() => {
      try {
        const q = JSON.parse(localStorage.getItem("tw.v1.queue") || "[]");
        const prev = gmGet(KEY_QUEUE, []);
        if (JSON.stringify(q) !== JSON.stringify(prev)) gmSet(KEY_QUEUE, q);
        const m = JSON.parse(localStorage.getItem("tw.v1.match") || "null");
        mergeMatchFromPage(m);
      } catch {
        /* ignore */
      }
    }, 1500);
    return;
  }

  // —— Ligaportal ——
  if (!location.hostname.includes("ligaportal.at")) return;

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

  function playerOptions() {
    const out = [];
    qsa("#eventPlayer1 optgroup").forEach((group) => {
      qsa("option", group).forEach((opt) => {
        if (!opt.value) return;
        out.push({ id: opt.value, name: opt.textContent.trim(), team: group.label });
      });
    });
    return out;
  }

  function findPlayerId(name, teamHint) {
    if (!name) return "";
    const opts = playerOptions();
    const n = normalize(name);
    const last = n.split(" ").at(-1);
    const scored = opts
      .map((o) => {
        const on = normalize(o.name);
        let score = 0;
        if (on === n) score += 10;
        if (on.includes(n) || n.includes(on)) score += 5;
        if (last && on.includes(last)) score += 3;
        if (teamHint && normalize(o.team).includes(normalize(teamHint))) score += 2;
        return { o, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score);
    return scored[0]?.o.id || "";
  }

  function teamIdByName(name) {
    const teams = qsa('input[name="eventTeam"]').map((el) => ({
      id: el.value,
      label: (el.closest("label")?.textContent || "").replace(/\s+/g, " ").trim(),
    }));
    const n = normalize(name);
    const hit = teams.find((t) => normalize(t.label).includes(n) || n.includes(normalize(t.label)));
    return hit?.id || teams.find((t) => t.id !== "0")?.id || "0";
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

  async function flushQueue() {
    const gameId = parseGameId();
    let queue = gmGet(KEY_QUEUE, []) || [];
    const pending = queue.filter(
      (q) => q.status === "queued" && (!q.ligaportalId || String(q.ligaportalId) === String(gameId))
    );
    if (!pending.length) return 0;

    let sent = 0;
    for (const item of pending) {
      const teamId = teamIdByName(item.teamName);
      const p1 = findPlayerId(item.player1Name, item.teamName);
      const p2 = findPlayerId(item.player2Name, item.teamName);
      try {
        await postEvent({
          id: gameId,
          editEventId: "",
          liveGameEventMinute: item.minute || "0",
          liveGameEventType: item.type,
          eventTeam: teamId,
          eventPlayer1: p1,
          eventPlayer2: p2,
          eventText: item.text || "",
          eventImageName: "",
          eventImageThumbnailName: "",
        });
        item.status = "sent";
        item.sentAt = Date.now();
        sent += 1;
      } catch (err) {
        item.status = "error";
        item.error = String(err?.message || err);
        break;
      }
    }
    gmSet(KEY_QUEUE, queue);
    try {
      localStorage.setItem("tw.v1.queue", JSON.stringify(queue));
    } catch {
      /* ignore */
    }
    return sent;
  }

  function publishLigaportalSession() {
    const gameId = parseGameId();
    if (!gameId) return;
    const title = qs("h1")?.textContent?.trim() || document.title || "";
    const scoreLink = qsa("a").find((a) => /^\d+:\d+$/.test(a.textContent.trim()));
    const score = scoreLink?.textContent.trim() || "";
    const parts = title.split(/\s+-\s+/);
    const prev = gmGet(KEY_MATCH, {}) || {};
    const next = {
      ...prev,
      ligaportalId: String(gameId),
      ligaportalUrl: location.href,
      title: title || prev.title || "",
      score: score || prev.score || "0:0",
      home: prev.home || { name: (parts[0] || "").trim(), formation: "4-4-2", start: [], bench: [] },
      away: prev.away || { name: (parts[1] || "").trim(), formation: "4-4-2", start: [], bench: [] },
      ts: Date.now(),
      source: "ligaportal",
    };
    // Teamnamen aus H1 übernehmen, wenn noch leer / Default
    if (parts[0] && (!next.home.name || next.home.name === "Loosdorf" || next.source === "ligaportal")) {
      next.home = { ...next.home, name: parts[0].trim() };
    }
    if (parts[1]) next.away = { ...next.away, name: parts[1].trim() };
    gmSet(KEY_MATCH, next);
    return next;
  }

  publishLigaportalSession();

  const btn = fab("TW: Queue senden", async () => {
    publishLigaportalSession();
    btn.textContent = "Sende…";
    const n = await flushQueue();
    btn.textContent = n ? `${n} gesendet – reload` : "Nichts in Queue";
    if (n) {
      setTimeout(() => {
        location.reload();
      }, 600);
    } else {
      setTimeout(() => {
        btn.textContent = "TW: Queue senden";
      }, 1800);
    }
  });
})();
