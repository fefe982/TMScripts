// ==UserScript==
// @name         wtt
// @namespace    http://tampermonkey.net/
// @version      2025-08-02
// @description  try to take over the world!
// @author       You
// @match        https://www.worldtabletennis.com/allplayersranking*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=worldtabletennis.com
// @grant        unsafeWindow
// @grant        GM_xmlhttpRequest
// @connect      localhost
// ==/UserScript==
/// <reference path="./tampermonkey.d.ts" />

(async function () {
  "use strict";
  const endpoint = "http://localhost:5173";
  /**
   * @typedef {object} PlayerBase
   * @property {string} key
   * @property {string} display
   * @property {string} sport
   * @property {string} region
   */

  /**
   * @typedef {PlayerBase & { rank: number, rank_time: number }} SinglesPlayer
   */

  /** @param {ParentNode} root @param {string} selector */
  const getText = (root, selector) => {
    const el = root.querySelector(selector);
    return el?.textContent?.trim() ?? "";
  };

  /** @param {string} href */
  const getPlayerIdFromHref = (href) => {
    const match = /playerId=(\d+)/.exec(href);
    return match?.[1] ?? "";
  };

  const clickNextPage = () => {
    console.log("clicking next page");
    const nextButton = /** @type {HTMLButtonElement | null} */ (
      document.querySelector(".rankings_container  button:nth-child(2)")
    );
    nextButton?.click();
  };
  const sport_id_resp = await GM.xmlHttpRequest({
    method: "GET",
    url: endpoint + "/api/sport?sport=table-tennis",
  });
  const sport_id = String(sport_id_resp.response);
  /** @param {PlayerBase} player1 @param {PlayerBase} player2 @param {number} rank @param {number} rank_time */
  const save_doubles_player = async (player1, player2, rank, rank_time) => {
    await GM.xmlHttpRequest({
      method: "POST",
      url: endpoint + "/api/doubles_rank",
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify({
        player1,
        player2,
        rank: rank,
        rank_time: rank_time,
      }),
    });
  };
  /** @param {SinglesPlayer} player */
  const save_singles_player = async (player) => {
    await GM.xmlHttpRequest({
      method: "POST",
      url: endpoint + "/api/player_info",
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify(player),
    });
  };
  const lastUpdatedEl = document.querySelector(".ranking_last_updated_text");
  const lastupdated_text = lastUpdatedEl?.childNodes[0]?.textContent ?? "";
  const lastupdated_match = /(\d+)\/(\d+)\/(\d+)/.exec(lastupdated_text);
  if (!lastupdated_match) {
    throw new Error("Unable to parse ranking last updated date");
  }
  const updateDate = new Date(
    Number.parseInt(lastupdated_match[3]),
    Number.parseInt(lastupdated_match[2]) - 1,
    Number.parseInt(lastupdated_match[1])
  );
  const selectedTab = new URL(globalThis.location.href).searchParams.get("selectedTab") ?? "";
  const single = selectedTab.includes("SINGLE");
  /** @type {string | null} */
  let last_fname = null;

  for (;;) {
    let rows = document.querySelectorAll("tr.ng-star-inserted");
    if (rows.length === 0) {
      break;
    }
    for (;;) {
      const fname = getText(rows[0], "td.player_name");
      if (fname != last_fname) {
        console.log("processing", last_fname, fname);
        last_fname = fname;
        break;
      }
      await new Promise((r) => setTimeout(r, 1000));
      rows = document.querySelectorAll("tr.ng-star-inserted");
      if (rows.length === 0) {
        break;
      }
    }
    if (rows.length === 0) {
      break;
    }
    if (single) {
      for (const tr of rows) {
        const rank = Number.parseInt(getText(tr, "td.player-rank"));
        const name = getText(tr, "td.player_name");
        const playerLink = /** @type {HTMLAnchorElement | null} */ (tr.querySelector("td.player_name a"));
        const key = playerLink ? getPlayerIdFromHref(playerLink.href) : "";
        const region = getText(tr, "td.country_name");
        const player = {
          key: key,
          display: name,
          sport: sport_id,
          rank: rank,
          rank_time: updateDate.getTime(),
          region: region,
        };
        console.log(player);
        await save_singles_player(player);
      }
    } else {
      console.log("doubles", rows.length);
      for (const tr of rows) {
        const rank = Number.parseInt(getText(tr, "td.player-rank"));
        const player_eles = tr.querySelectorAll("td.player_name div.p0");
        const name1 = player_eles[0]?.textContent?.trim() ?? "";
        const name2 = player_eles[1]?.textContent?.trim() ?? "";
        const key1Link = /** @type {HTMLAnchorElement | null} */ (player_eles[0]?.querySelector("a") ?? null);
        const key2Link = /** @type {HTMLAnchorElement | null} */ (player_eles[1]?.querySelector("a") ?? null);
        const key1 = key1Link ? getPlayerIdFromHref(key1Link.href) : "";
        const key2 = key2Link ? getPlayerIdFromHref(key2Link.href) : "";
        const region_eles = tr.querySelectorAll("td.country_name div.p0");
        const region1 = region_eles[0]?.textContent?.trim() ?? "";
        const region2 = region_eles[1]?.textContent?.trim() ?? "";
        const player1 = {
          key: key1,
          display: name1,
          sport: sport_id,
          region: region1,
        };
        const player2 = {
          key: key2,
          display: name2,
          sport: sport_id,
          region: region2,
        };
        console.log(player1, player2, rank);
        await save_doubles_player(player1, player2, rank, updateDate.getTime());
      }
    }
    clickNextPage();
  }
  // Your code here...
})();
