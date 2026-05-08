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

  /**
   * Remove accidental spaces inside CJK names caused by wrapped text nodes.
   * @param {string} value
   */
  function tightenCjkSpacing(value) {
    let current = normalizeText(value);
    let prev = "";
    while (current !== prev) {
      prev = current;
      current = current.replaceAll(/([\u4e00-\u9fa5])\s+([\u4e00-\u9fa5])/g, "$1$2");
    }
    return current;
  }

  /**
   * Extract ordered text fragments from leaf elements under the match link.
   * This avoids parsing merged text from the whole <a> node.
   * @param {Element} link
   */
  function extractMatchTextFromElements(link) {
    const fragments = [];

    for (const child of link.childNodes) {
      if (child.nodeType !== Node.TEXT_NODE) {
        continue;
      }
      const text = normalizeText(child.textContent);
      if (text) {
        fragments.push(text);
      }
    }

    for (const el of link.querySelectorAll("*")) {
      if (el.children.length > 0) {
        continue;
      }

      let text = "";
      if (el instanceof HTMLImageElement) {
        text = normalizeText(el.alt || el.title || "");
      } else {
        text = normalizeText(el.textContent);
      }

      if (!text) {
        continue;
      }
      if (/^[\ue000-\uf8ff]+$/.test(text)) {
        continue;
      }
      fragments.push(text);
    }

    const filtered = fragments
      .map((item) => tightenCjkSpacing(item))
      .filter(Boolean)
      .filter((item) => !/^(详细数据|集锦\/?回放|回放|集锦|视频直播|图文直播)$/.test(item));

    /** @type {string[]} */
    const deduped = [];
    for (const item of filtered) {
      if (deduped.at(-1) !== item) {
        deduped.push(item);
      }
    }

    return normalizeText(deduped.join(" "));
  }

  /**
   * Extract structured match fields by dedicated classes/order under the link.
   * @param {Element} link
   */
  function extractMatchDataFromLink(link) {
    const time = normalizeText(link.querySelector(".date")?.textContent);
    const teams = Array.from(link.querySelectorAll(".team"));
    const leftTeamEl = teams.at(0)?.querySelector(".team-name") || teams.at(0);
    const rightTeamEl = teams.at(-1)?.querySelector(".team-name") || teams.at(-1);

    const leftTeamText = normalizeText(leftTeamEl?.textContent);
    const rightTeamText = normalizeText(rightTeamEl?.textContent);

    const tournament = normalizeText(link.querySelector(".status .game-type")?.textContent);
    const stage = normalizeText(link.querySelector(".status .game-stage")?.textContent);

    const scoreValues = Array.from(link.querySelectorAll(".score"))
      .map((el) => normalizeText(el.textContent))
      .filter(Boolean);

    if (!time || !leftTeamText || !rightTeamText || !tournament) {
      return null;
    }

    const left = parseParticipantSide(leftTeamText);
    const right = parseParticipantSide(rightTeamText);

    return {
      time,
      tournament,
      left,
      right,
      stage,
      leftScore: scoreValues.at(0) || "",
      rightScore: scoreValues.at(-1) || "",
    };
  }

  /**
   * @param {string} text
   */
  function extractDateToken(text) {
    const normalized = normalizeText(text);
    const m = /(\d{2}-\d{2})(?:\s*(?:周[一二三四五六日天]|今天|星期[一二三四五六日天]))?/.exec(normalized);
    return m ? m[1] : "";
  }

  /**
   * Read date from the date div under the same .schedule-block as the match link.
   * @param {Element} link
   */
  function getDateFromScheduleBlock(link) {
    const block = link.closest(".schedule-block");
    if (!block) {
      return "";
    }

    // Typical header text is like: "05-05 星期二".
    for (const node of block.querySelectorAll(":scope > div")) {
      const text = normalizeText(node.textContent);
      if (!text) {
        continue;
      }
      if (!/(\d{2}-\d{2})\s*(?:周[一二三四五六日天]|今天|星期[一二三四五六日天])/.test(text)) {
        continue;
      }
      const date = extractDateToken(text);
      if (date) {
        return date;
      }
    }

    // Fallback for minor structure/class changes inside the same block.
    for (const node of block.querySelectorAll("[class*='date'], [class*='day'], [class*='week']")) {
      const date = extractDateToken(node.textContent || "");
      if (date) {
        return date;
      }
    }

    return "";
  }

  function getActiveDateText() {
    const candidates = [".active", "li.active", "[class*='active']", "[class*='current']", "[class*='selected']"];

    for (const selector of candidates) {
      for (const node of document.querySelectorAll(selector)) {
        const date = extractDateToken(node.textContent || "");
        if (date) {
          return date;
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
    const side = normalizeText(sideText)
      .replaceAll(/[（(]\d+[)）]/g, "")
      .replaceAll(/^(?:用券|付费|会员|免费)\s+/g, "")
      .trim();
    if (!side) {
      return { participant: "", nationality: "" };
    }

    const doubledWhole = /^(.+?)\s+\1$/.exec(side);
    if (doubledWhole) {
      return { participant: tightenCjkSpacing(doubledWhole[1]), nationality: "" };
    }

    const tokens = side.split(" ").filter(Boolean);
    if (tokens.length >= 2) {
      if (tokens[0] === tokens[1]) {
        return { participant: tightenCjkSpacing(tokens[0]), nationality: "" };
      }
    }

    const bracketNation = /[（(]([A-Za-z]{2,3}|[\u4e00-\u9fa5]{2,10})[)）]/.exec(side);
    if (bracketNation) {
      return {
        participant: normalizeText(side.replace(bracketNation[0], "")),
        nationality: bracketNation[1],
      };
    }

    return { participant: tightenCjkSpacing(side), nationality: "" };
  }

  /**
   * @param {string} text
   */
  function parseMatchText(text) {
    const clean = normalizeText(text)
      .replaceAll(/详细数据|集锦\/?回放|回放|集锦|视频直播|图文直播/g, "")
      .replaceAll(/^(?:用券|付费|会员|免费)\s+/g, "")
      .trim();

    const timeMatch = /\b(?:([01]?\d|2[0-3]):[0-5]\d|待定)\b/.exec(clean);
    if (!timeMatch) {
      return null;
    }

    const time = timeMatch[0];
    const start = clean.indexOf(time) + time.length;
    const afterTime = normalizeText(clean.slice(start))
      .replaceAll(/^(?:用券|付费|会员|免费)\s+/g, "")
      .trim();

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

      const direct = extractMatchDataFromLink(link);
      const text = extractMatchTextFromElements(link);
      const parsed = direct || parseMatchText(text);
      if (!parsed) {
        continue;
      }

      if (parsed.left.participant === "待定" || parsed.right.participant === "待定") {
        continue;
      }

      const domTournament = findTournamentFromDom(link);
      const tournament = parsed.tournament || domTournament || "unknown";
      const blockDate = getDateFromScheduleBlock(link);
      const date = blockDate || selectedDate;
      const datetime = normalizeText(`${date} ${parsed.time}`).trim();

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
