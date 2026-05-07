// ==UserScript==
// @name         sports.qq.com kbs schedule extractor
// @namespace    http://tampermonkey.net/
// @version      2026-05-07
// @description  Extract tournament, datetime, participants, and nationality from schedule page.
// @author       Yongxin Wang
// @match        https://sports.qq.com/kbsweb/index.htm*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=sports.qq.com
// @grant        none
// @run-at       context-menu
// ==/UserScript==

(function () {
  "use strict";

  /**
   * @param {string | null | undefined} value
   */
  function normalizeText(value) {
    return (value || "").replaceAll(/\s+/g, " ").trim();
  }

  function getActiveDateText() {
    const candidates = [".active", "li.active", "[class*='active']", "[class*='current']", "[class*='selected']"];

    for (const selector of candidates) {
      for (const node of document.querySelectorAll(selector)) {
        const text = normalizeText(node.textContent);
        const m = /(\d{2}-\d{2})(?:\s*(?:周[一二三四五六日天]|今天|星期[一二三四五六日天]))?/.exec(text);
        if (m) {
          return m[1];
        }
      }
    }

    return "";
  }

  /**
   * Try to get tournament from nearby labels around current match item.
   * @param {Element} link
   */
  function findTournamentFromDom(link) {
    const labelSelectors = [
      "[class*='league']",
      "[class*='tournament']",
      "[class*='match-name']",
      "[class*='event-name']",
      "[class*='game-name']",
      "h2",
      "h3",
      "h4",
      ".title",
      ".name",
    ];

    let node = /** @type {Element | null} */ (link);
    for (let depth = 0; depth < 6 && node; depth++) {
      for (const selector of labelSelectors) {
        const candidate = node.querySelector(selector);
        if (!candidate) {
          continue;
        }
        const text = normalizeText(candidate.textContent);
        if (text && !/\d{1,2}:\d{2}/.test(text) && text.length <= 40) {
          return text;
        }
      }
      node = /** @type {Element | null} */ (node.parentElement);
    }
    return "";
  }

  /**
   * @param {string} sideText
   */
  function parseParticipantSide(sideText) {
    const side = normalizeText(sideText);
    if (!side) {
      return { participant: "", nationality: "" };
    }

    const tokens = side.split(" ").filter(Boolean);
    if (tokens.length >= 2 && tokens[0] === tokens[1]) {
      return { participant: tokens[0], nationality: tokens[0] };
    }

    const bracketNation = /[（(]([A-Za-z]{2,3}|[\u4e00-\u9fa5]{2,10})[)）]/.exec(side);
    if (bracketNation) {
      return {
        participant: normalizeText(side.replace(bracketNation[0], "")),
        nationality: bracketNation[1],
      };
    }

    return { participant: side, nationality: "" };
  }

  /**
   * @param {string} text
   */
  function parseMatchText(text) {
    const clean = normalizeText(text)
      .replaceAll(/详细数据|集锦\/?回放|回放|集锦|视频直播|图文直播/g, "")
      .trim();

    const timeMatch = /\b([01]?\d|2[0-3]):[0-5]\d\b/.exec(clean);
    if (!timeMatch) {
      return null;
    }

    const time = timeMatch[0];
    const start = clean.indexOf(time) + time.length;
    const afterTime = normalizeText(clean.slice(start));

    const withScore = /^(.*?)\s+\d+\s+(.*?)\s+(已结束|未开始|进行中|直播中|推迟|取消|中断)\s+\d+\s+(.*?)$/.exec(
      afterTime
    );
    if (withScore) {
      return {
        time,
        tournament: normalizeText(withScore[2]),
        left: parseParticipantSide(withScore[1]),
        right: parseParticipantSide(withScore[4]),
      };
    }

    const noScore = /^(.*?)\s+(.*?)\s+(已结束|未开始|进行中|直播中|推迟|取消|中断)\s+(.*?)$/.exec(afterTime);
    if (noScore) {
      return {
        time,
        tournament: normalizeText(noScore[2]),
        left: parseParticipantSide(noScore[1]),
        right: parseParticipantSide(noScore[4]),
      };
    }

    return {
      time,
      tournament: "",
      left: { participant: "", nationality: "" },
      right: { participant: afterTime, nationality: "" },
    };
  }

  function run() {
    const selectedDate = getActiveDateText();
    const links = Array.from(document.querySelectorAll("a[href*='kbsweb/game.htm']"));
    const seen = new Set();

    /** @type {Array<{tournament: string, datetime: string, p1: string, n1: string, p2: string, n2: string, href: string}>} */
    const rows = [];

    for (const link of links) {
      const href = /** @type {HTMLAnchorElement} */ (link).href || "";
      if (!href || seen.has(href)) {
        continue;
      }
      seen.add(href);

      const text = normalizeText(link.textContent);
      const parsed = parseMatchText(text);
      if (!parsed) {
        continue;
      }

      const domTournament = findTournamentFromDom(link);
      const tournament = parsed.tournament || domTournament || "unknown";
      const datetime = normalizeText(`${selectedDate} ${parsed.time}`).trim();

      rows.push({
        tournament,
        datetime,
        p1: parsed.left.participant || "unknown",
        n1: parsed.left.nationality || "unknown",
        p2: parsed.right.participant || "unknown",
        n2: parsed.right.nationality || "unknown",
        href,
      });
    }

    if (rows.length === 0) {
      console.log("[sports.qq schedule] No match rows found. Scroll page and retry from context menu.");
      return;
    }

    console.log(`[sports.qq schedule] Extracted ${rows.length} matches`);
    for (const item of rows) {
      console.log(
        `Tournament: ${item.tournament} | ${item.datetime} | ${item.p1} | ${item.n1} | ${item.p2} | ${item.n2}`
      );
    }
  }

  run();
})();
