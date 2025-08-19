// ==UserScript==
// @name         wta
// @namespace    http://tampermonkey.net/
// @version      2025-08-06
// @description  try to take over the world!
// @author       You
// @match        https://www.wtatennis.com/rankings/doubles
// @match        https://www.wtatennis.com/rankings/singles
// @icon         https://www.google.com/s2/favicons?sz=64&domain=wtatennis.com
// @grant        unsafeWindow
// @grant        GM_xmlhttpRequest
// @connect      localhost
// ==/UserScript==

(async function () {
  "use strict";
  let loadmore = document.querySelector(".rankings__show-more");
  let loading = document.querySelector(".rankings__loader");
  while (loadmore?.checkVisibility() || loading?.checkVisibility()) {
    if (loadmore?.checkVisibility()) {
      loadmore.click();
      console.log("load more");
    } else {
      console.log("loading");
    }
    window.scroll({ top: document.body.scrollHeight, behavior: "smooth" });
    await new Promise((resolve) => setTimeout(resolve, 2000));
    loadmore = document.querySelector(".rankings__show-more");
    loading = document.querySelector(".rankings__loader");
  }
  console.log("loaded");
  const endpoint = "http://localhost:5173";
  const save_doubles_data = async (key, display, sport_id, rank, rank_time) => {
    const player = {
      key,
      display,
      sport: sport_id,
      drank: rank,
      drank_time: rank_time,
    };
    await GM.xmlHttpRequest({
      method: "POST",
      url: endpoint + "/api/player_info",
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify(player),
    });
  };
  const save_singles_data = async (key, display, sport_id, rank, rank_time) => {
    const player = {
      key,
      display,
      sport: sport_id,
      rank,
      rank_time,
    };
    await GM.xmlHttpRequest({
      method: "POST",
      url: endpoint + "/api/player_info",
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify(player),
    });
  };
  const section_rankings = document.querySelector("section.rankings");
  const date = new Date(section_rankings.dataset["date"]);
  const metric = section_rankings.dataset["metric"];
  const sport_id_resp = await GM.xmlHttpRequest({
    method: "GET",
    url: endpoint + "/api/sport?sport=tennis",
  });
  const sport_id = sport_id_resp.response;
  for (const player of document.querySelectorAll("tr.player-row")) {
    const player_id = player.dataset.playerId;
    const name = player.dataset.playerName;
    const rank = parseInt(player.querySelector(".player-row__rank").innerText);
    console.log(date, metric, player_id, rank, name);
    if (metric == "DOUBLES") {
      await save_doubles_data(player_id, name, sport_id, rank, date.getTime());
      // await new Promise((resolve) => setTimeout(resolve, 10));
    } else if (metric == "SINGLES") {
      await save_singles_data(player_id, name, sport_id, rank, date.getTime());
      // await new Promise((resolve) => setTimeout(resolve, 10));
    }
  }
  // Your code here...
})();
