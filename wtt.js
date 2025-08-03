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
// ==/UserScript==

(async function () {
  "use strict";
  const endpoint = "http://localhost:5173";
  console.log("fffffffffffffffffffffffffffffffffffffffffffff");
  if (unsafeWindow.XMLHttpRequest.prototype.send.saved_send) {
    console.log("restoring send ..........");
    unsafeWindow.XMLHttpRequest.prototype.send = unsafeWindow.XMLHttpRequest.prototype.send.saved_send;
  }
  const send = unsafeWindow.XMLHttpRequest.prototype.send;
  const pages = [];
  const collected = [];
  const clickNextPage = () => {
    document.querySelector(".rankings_container  button:nth-child(2)").click();
  };
  const clickFirstPage = () => {
    const item = document.querySelector("#mat-option-0 > span");
    if (item) {
      item.click();
      //   console.log(item, "clicked");
      return;
    }
    const sel = document.querySelector("#mat-select-0 > div > div.mat-select-value");
    if (sel) {
      sel.click();
      //   console.log(sel, "clicked");
      setTimeout(clickFirstPage, 1000);
      //   return;
    }
    // console.log("first page failed");
  };
  const save_data = async () => {
    console.log("saving collected");
    const sport_id_resp = await GM.xmlHttpRequest({
      method: "GET",
      url: endpoint + "/api/sport?sport=table-tennis",
    });
    const sport_id = sport_id_resp.response;
    for (const item of collected) {
      const player1 = {
        key: item.IttfId1,
        display: item.PlayerName1,
        sport: sport_id,
      };
      const player2 = {
        key: item.IttfId1d,
        display: item.PlayerName1d,
        sport: sport_id,
      };
      await GM.xmlHttpRequest({
        method: "POST",
        url: endpoint + "/api/doubles_rank",
        headers: {
          "Content-Type": "application/json",
        },
        data: JSON.stringify({
          player1,
          player2,
          rank: parseInt(item.RankingPosition),
          rank_time: new Date(item.PublishDate).getTime(),
        }),
      });
      break;
    }
  };
  unsafeWindow.XMLHttpRequest.prototype.send = function (data) {
    this.addEventListener(
      "readystatechange",
      function () {
        "https://wttcmsapigateway-new.azure-api.net/internalttu/RankingsCurrentWeek/CurrentWeek/GetRankingPairs?SubEventCode=XD&CategoryCode=SEN&StartRank=101&EndRank=200";

        if (this.readyState === 4) {
          const url = new URL(this.responseURL);
          if (url.pathname === "/internalttu/RankingsCurrentWeek/CurrentWeek/GetRankingPairs") {
            if (pages.includes(url.searchParams.get("StartRank"))) {
              unsafeWindow.XMLHttpRequest.prototype.send = send;
              console.log(collected);
              setTimeout(save_data, 1000);
              return;
            }
            if (
              url.searchParams.get("CategoryCode") === "SEN" &&
              ["XD"].includes(url.searchParams.get("SubEventCode"))
            ) {
              const res = JSON.parse(this.response).Result;
              //   console.log(res);
              collected.push(...res);
              //   console.log(collected);
              pages.push(url.searchParams.get("StartRank"));
              if (res.length > 0) {
                // console.log("next page");
                clickNextPage();
              } else {
                clickFirstPage();
              }
            }
          }
          console.log({
            url: this.responseURL,
            type: this.responseType,
            res: this.response,
            req: data,
          });
        }
      },
      false
    );
    send.apply(this, arguments);
  };
  unsafeWindow.XMLHttpRequest.prototype.send.saved_send = send;
  clickNextPage();
  // Your code here...
})();
