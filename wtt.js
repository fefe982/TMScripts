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

(async function () {
  "use strict";
  const endpoint = "http://localhost:5173";
  // if (unsafeWindow.XMLHttpRequest.prototype.send.saved_send) {
  //   console.log("restoring send ..........");
  //   unsafeWindow.XMLHttpRequest.prototype.send = unsafeWindow.XMLHttpRequest.prototype.send.saved_send;
  // }
  const send = unsafeWindow.XMLHttpRequest.prototype.send;
  const pages = [];
  const collected = [];
  const clickNextPage = () => {
    console.log("clicking next page");
    document.querySelector(".rankings_container  button:nth-child(2)").click();
  };
  const clickFirstPage = () => {
    console.log("clicking first page");
    const item = document.querySelector(".mat-option[value='1']");
    if (item) {
      item.click();
      return;
    }
    const sel = document.querySelector("[placeholder='-- All Ranking --'] > div > div.mat-select-value");
    if (sel) {
      sel.click();
      setTimeout(clickFirstPage, 1000);
    }
  };
  const sport_id_resp = await GM.xmlHttpRequest({
    method: "GET",
    url: endpoint + "/api/sport?sport=table-tennis",
  });
  const sport_id = sport_id_resp.response;
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
  const save_doubles_data = async () => {
    console.log("saving collected");
    for (const item of collected) {
      const player1 = {
        key: item.IttfId1,
        display: item.PlayerName1,
        sport: sport_id,
        region: item.CountryCode1,
      };
      const player2 = {
        key: item.IttfId1d,
        display: item.PlayerName1d,
        sport: sport_id,
        region: item.CountryCode1d,
      };
      await save_doubles_player(player1, player2, parseInt(item.RankingPosition), new Date(item.PublishDate).getTime());
    }
  };
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
  const save_singles_data = async () => {
    console.log("saving collected");
    for (const item of collected) {
      const player = {
        key: item.IttfId,
        display: item.PlayerName,
        sport: sport_id,
        rank: item.CurrentRank,
        rank_time: new Date(item.PublishDate).getTime(),
        region: item.CountryCode,
      };
      await save_singles_player(player);
    }
  };
  // unsafeWindow.XMLHttpRequest.prototype.send = function (data) {
  //   this.addEventListener(
  //     "readystatechange",
  //     function () {
  //       "https://wttcmsapigateway-new.azure-api.net/internalttu/RankingsCurrentWeek/CurrentWeek/GetRankingPairs?SubEventCode=XD&CategoryCode=SEN&StartRank=101&EndRank=200";
  //       "https://wttcmsapigateway-new.azure-api.net/internalttu/RankingsCurrentWeek/CurrentWeek/GetRankingIndividuals?CategoryCode=SEN&SubEventCode=MS&StartRank=1&EndRank=100";
  //       if (this.readyState === 4) {
  //         const url = new URL(this.responseURL);
  //         if (url.pathname === "/internalttu/RankingsCurrentWeek/CurrentWeek/GetRankingPairs") {
  //           // if (pages.includes(url.searchParams.get("StartRank"))) {
  //           //   unsafeWindow.XMLHttpRequest.prototype.send = send;
  //           //   console.log(collected);
  //           //   setTimeout(save_doubles_data, 1000);
  //           //   return;
  //           // }
  //           if (
  //             url.searchParams.get("CategoryCode") === "SEN" &&
  //             ["XD", "MD", "WD"].includes(url.searchParams.get("SubEventCode"))
  //           ) {
  //             const res = JSON.parse(this.response).Result;
  //             collected.push(...res);
  //             pages.push(url.searchParams.get("StartRank"));
  //             if (res.length > 0) {
  //               clickNextPage();
  //             } else {
  //               unsafeWindow.XMLHttpRequest.prototype.send = send;
  //               console.log(collected);
  //               setTimeout(save_doubles_data, 1000);
  //               return;
  //               // clickFirstPage();
  //             }
  //           }
  //         } else if (url.pathname === "/internalttu/RankingsCurrentWeek/CurrentWeek/GetRankingIndividuals") {
  //           // if (pages.includes(url.searchParams.get("StartRank"))) {
  //           //   unsafeWindow.XMLHttpRequest.prototype.send = send;
  //           //   console.log("saving collected");
  //           //   setTimeout(save_singles_data, 1000);
  //           //   return;
  //           // }
  //           if (
  //             url.searchParams.get("CategoryCode") === "SEN" &&
  //             ["MS", "WS"].includes(url.searchParams.get("SubEventCode"))
  //           ) {
  //             const res = JSON.parse(this.response).Result;
  //             collected.push(...res);
  //             pages.push(url.searchParams.get("StartRank"));
  //             if (res.length > 0) {
  //               clickNextPage();
  //             } else {
  //               unsafeWindow.XMLHttpRequest.prototype.send = send;
  //               console.log("saving collected");
  //               setTimeout(save_singles_data, 1000);
  //               return;
  //               // clickFirstPage();
  //             }
  //           }
  //         }
  //         console.log("replaced send", {
  //           url: this.responseURL,
  //           type: this.responseType,
  //           res: this.response,
  //           req: data,
  //         });
  //       }
  //     },
  //     false
  //   );
  //   send.apply(this, arguments);
  // };
  // unsafeWindow.XMLHttpRequest.prototype.send.saved_send = send;
  const lastupdated_text = document.querySelector(".ranking_last_updated_text").childNodes[0].textContent;
  const lastupdated_match = lastupdated_text.match(/(\d+)\/(\d+)\/(\d+)/);
  const updateDate = new Date(
    parseInt(lastupdated_match[3]),
    parseInt(lastupdated_match[2]) - 1,
    parseInt(lastupdated_match[1])
  );
  const single = new URL(window.location.href).searchParams.get("selectedTab").indexOf("SINGLE") >= 0;
  let last_fname = null;

  for (;;) {
    let rows = document.querySelectorAll("tr.ng-star-inserted");
    if (rows.length === 0) {
      break;
    }
    for (;;) {
      const fname = rows[0].querySelector("td.player_name").textContent.trim();
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
        const rank = parseInt(tr.querySelector("td.player-rank").textContent);
        const name = tr.querySelector("td.player_name").textContent.trim();
        const key = tr.querySelector("td.player_name a").href.match(/playerId=(\d+)/)[1];
        const region = tr.querySelector("td.country_name").textContent.trim();
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
        const rank = parseInt(tr.querySelector("td.player-rank").textContent);
        const player_eles = tr.querySelectorAll("td.player_name div.p0");
        const name1 = player_eles[0].textContent.trim();
        const name2 = player_eles[1].textContent.trim();
        const key1 = player_eles[0].querySelector("a").href.match(/playerId=(\d+)/)[1];
        const key2 = player_eles[1].querySelector("a").href.match(/playerId=(\d+)/)[1];
        const region_eles = tr.querySelectorAll("td.country_name div.p0");
        const region1 = region_eles[0].textContent.trim();
        const region2 = region_eles[1].textContent.trim();
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
