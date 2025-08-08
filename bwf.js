// ==UserScript==
// @name         bwf
// @namespace    http://tampermonkey.net/
// @version      2025-07-31
// @description  try to take over the world!
// @author       You
// @match        https://bwfbadminton.com/rankings*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bwfbadminton.com
// @run-at       context-menu
// @grant        unsafeWindow
// @grant        GM_xmlhttpRequest
// @connect      localhost
// ==/UserScript==

(async function () {
  "use strict";
  const date_sel_str = document.querySelectorAll(".v-select__selection")[1].textContent;
  const date_str = /\((.*)\)/.exec(date_sel_str)[1];
  const date = new Date(date_str);
  console.log(date);
  const metric = document.querySelector("ul.ranking-event-tabs > li.active span.ranking-tab-mobile").textContent;
  console.log(metric);
  const endpoint = "http://localhost:5173";
  const sport_id_resp = await GM.xmlHttpRequest({
    method: "GET",
    url: endpoint + "/api/sport?sport=badminton",
  });
  const sport_id = parseInt(sport_id_resp.response);
  const save_doubles_data = async (player1, player2, rank) => {
    await GM.xmlHttpRequest({
      method: "POST",
      url: endpoint + "/api/doubles_rank",
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify({
        player1,
        player2,
        rank,
        rank_time: date.getTime(),
      }),
    });
  };
  const save_singles_data = async (key, display, rank) => {
    const player = {
      key,
      display,
      sport: sport_id,
      rank,
      rank_time: date.getTime(),
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
  for (;;) {
    for (const tr of document.querySelectorAll(".tblRankingLanding tbody tr")) {
      const rank = parseInt(tr.querySelector(".rank-value").textContent);
      const p = [];
      for (const pa of tr.querySelectorAll(".player a")) {
        const pv = {};
        pv.display = pa.textContent;
        pv.key = /\/player\/(\d+)/.exec(pa.href)[1];
        pv.sport = sport_id;
        p.push(pv);
      }
      // . const points = tr.querySelector(".col-points").textContent;
      console.log(date, metric, rank, p, sport_id);
      if (p.length === 2) {
        if (metric != "MD" && metric != "WD" && metric != "XD") {
          throw new Error("Invalid metric");
        }
        await save_doubles_data(p[0], p[1], rank);
      } else if (p.length === 1) {
        if (metric != "MS" && metric != "WS") {
          throw new Error("Invalid metric");
        }
        await save_singles_data(p[0].key, p[0].display, rank);
      }
    }
    const next_page = document.querySelector("a:not(.disabled):has(.fa-chevron-right)");
    if (next_page) {
      console.log(next_page, "CLICK!!!");
      next_page.click();
      for (;;) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        if (document.querySelector(".tblRankingLanding.loading")) {
          continue;
        }
        break;
      }
    } else {
      break;
    }
  }

  // Your code here...
})();
