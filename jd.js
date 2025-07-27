// ==UserScript==
// @name         jd
// @namespace    http://tampermonkey.net/
// @version      2025-07-26
// @description  try to take over the world!
// @author       You
// @match        https://order.jd.com/center/list.action
// @icon         https://www.google.com/s2/favicons?sz=64&domain=jd.com
// @grant        none
// @run-at context-menu
// ==/UserScript==

(function () {
  "use strict";
  const full_data = {};
  for (const body of document.querySelectorAll("tbody")) {
    const data = {};
    data.time = body.querySelector(".dealtime").innerText;
    data.shop = body.querySelector(".shop-txt").innerText;
    data.order = body.querySelector(".number a").innerText;
    data.amount = body.querySelector(".amount span:first-child").innerText;
    full_data[data.order] = data;
  }
  const date = new Date();
  const metas = JSON.stringify(full_data);
  const blob = new Blob([metas], { type: "application/json" });
  const bloburl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = bloburl;
  a.download = `jd-${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}.json`;
  a.click();
})();
