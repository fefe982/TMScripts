// ==UserScript==
// @name         atp
// @namespace    http://tampermonkey.net/
// @version      2025-08-07
// @description  try to take over the world!
// @author       You
// @match        https://www.atptour.com/en/rankings/singles?rankRange=0-5000
// @icon         https://www.google.com/s2/favicons?sz=64&domain=atptour.com
// @grant        unsafeWindow
// @grant        GM_xmlhttpRequest
// @connect      localhost
// @run-at       context-menu
// ==/UserScript==

(async function () {
  "use strict";
  const endpoint = "http://localhost:5173";
  const save_doubles_data = async (key, display, sport_id, rank, rank_time, region) => {
    const player = {
      key,
      display,
      sport: sport_id,
      drank: rank,
      drank_time: rank_time,
      region,
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
  const save_singles_data = async (key, display, sport_id, rank, rank_time, region) => {
    const player = {
      key,
      display,
      sport: sport_id,
      rank,
      rank_time,
      region,
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
  let date_ele = document.querySelector("#dateWeek-filter > [selected]");
  if (!date_ele) {
    date_ele = document.querySelector("#dateWeek-filter > option:first-child");
  }
  const date = new Date(date_ele.textContent);
  const metric = document.querySelector("div.switcher > a.active.switcher-link").textContent;
  const sport_id_resp = await GM.xmlHttpRequest({
    method: "GET",
    url: endpoint + "/api/sport?sport=tennis",
  });
  const sport_id = sport_id_resp.response;
  for (const player of document.querySelectorAll("table.desktop-table tr.lower-row")) {
    // player.scrollIntoView();
    const name_ele = player.querySelector("li.name > a");
    // console.log(name_ele);
    const player_id = name_ele.href.match(/\/players\/([^/]*\/[^/]*)\//)[1];
    const name = name_ele.innerText;
    const rank = parseInt(player.querySelector("td.rank").innerText.replace("T", ""));
    const region = player
      .querySelector("li > svg > use")
      .href.baseVal.match(/#flag-([^"]*)/)[1]
      .toUpperCase();
    console.log(date, metric, player_id, rank, name, region);
    if (metric == "Doubles") {
      await save_doubles_data(player_id, name, sport_id, rank, date.getTime(), region);
    } else if (metric == "Singles") {
      await save_singles_data(player_id, name, sport_id, rank, date.getTime(), region);
    }
  }
  alert("finished");
  // Your code here...
})();
