// ==UserScript==
// @name         TickerWrapper Overlay (Ligaportal)
// @namespace    https://forsti37.github.io/tickerwrapper
// @version      1.0.0
// @description  Handy-Overlay: Events direkt in Ligaportal speichern
// @author       Forsti37
// @match        https://ticker.ligaportal.at/liveGame/edit/*
// @match        http://ticker.ligaportal.at/liveGame/edit/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
  var s = document.createElement("script");
  s.src = "https://forsti37.github.io/tickerwrapper/overlay.js?v=1";
  document.documentElement.appendChild(s);
})();
