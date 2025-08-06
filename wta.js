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
  while (loadmore?.checkVisibility()) {
    loadmore.click();
    window.scroll({ top: document.body.scrollHeight, behavior: "smooth" });
    await new Promise((resolve) => setTimeout(resolve, 2000));
    loadmore = document.querySelector(".rankings__show-more");
  }
  console.log("loaded");
  const section_rankings = document.querySelector("section.rankings");
  const date = new Date(section_rankings.dataset["date"]);
  const metric = section_rankings.dataset["metric"];
  for (const player of document.querySelectorAll("tr.player-row")) {
    const player_id = player.dataset.playerId;
    const name = player.dataset.playerName;
    const rank = parseInt(player.querySelector(".player-row__rank").innerText);
    console.log(date, metric, player_id, rank, name);
  }
  // Your code here...
})();
