// ==UserScript==
// @name         mlb
// @namespace    http://tampermonkey.net/
// @version      2025-07-14
// @description  try to take over the world!
// @author       Yongxin Wang
// @downloadURL  https://gitee.com/yongxinwang82/TMScripts/raw/master/mlb.js
// @updateURL    https://gitee.com/yongxinwang82/TMScripts/raw/master/mlb.js
// @match        https://www.mlb.com/gameday/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=mlb.com
// @grant        none
// ==/UserScript==

(function () {
  "use strict";
  console.log("tampermonkey");
  const mph_to_kmph = (/** @type {number} */ mph) => (mph * 1.609344).toFixed(2);
  const mph_to_mps = (/** @type {number} */ mph) => (mph * 0.447037).toFixed(1);
  const ft_to_m = (/** @type {number} */ ft) => (ft * 0.3048).toFixed(1);
  /**
   * @param {HTMLElement} root
   */
  function replaceBallSpeed(root) {
    const children = root.querySelectorAll(".fcPMBB, .iacVON");
    for (const p of children) {
      console.log(p, p.childNodes.length);
      console.log(p.childNodes[0]);
      if (p.childNodes.length != 2) {
        continue;
      }
      const src = Number.parseFloat(p.childNodes[0].textContent || "");
      if (!src) {
        continue;
      }
      if (p.childNodes[1].textContent?.endsWith("mph")) {
        const kmph = mph_to_kmph(src);
        const new_unit = p.childNodes[1].cloneNode(true);
        if (new_unit instanceof HTMLElement) {
          new_unit.textContent = "kmph";
        } else {
          new_unit.textContent = " kmph";
        }
        p.appendChild(document.createTextNode(" / "));
        p.appendChild(document.createTextNode(kmph));
        p.appendChild(new_unit);
      }
      if (p.childNodes[1].textContent?.endsWith("ft")) {
        const m = ft_to_m(src);
        const new_unit = p.childNodes[1].cloneNode(true);
        new_unit.textContent = "m";
        if (new_unit instanceof HTMLElement) {
          new_unit.textContent = "m";
        } else {
          new_unit.textContent = " m";
        }
        p.appendChild(document.createTextNode(" / "));
        p.appendChild(document.createTextNode(m));
        p.appendChild(new_unit);
      }
    }
  }
  /**
   * @param {HTMLElement} root
   */
  function replacePitchSpeed(root) {
    const children = root.querySelectorAll(".data-point");
    for (const p of children) {
      if (p.childNodes.length != 1) {
        continue;
      }
      const m = p.childNodes[0].textContent?.match(/^([\d.]+) mph$/);
      if (!m) {
        continue;
      }
      const mph = Number.parseFloat(m[1]);
      if (!mph) {
        continue;
      }
      const kmph = mph_to_kmph(mph);
      p.textContent = kmph + " kmph";
    }
  }
  /**
   * @param {HTMLElement} p
   */
  function replace_overall_list(p) {
    if (p.childNodes[0].textContent == "Weather") {
      const m = new RegExp(/^(\d+) degrees(.*)$/).exec(p.childNodes[2].textContent || "");
      if (!m) {
        return;
      }
      const deg = ((Number.parseInt(m[1]) - 32) / 1.8).toFixed(1);
      p.childNodes[2].textContent = deg + " ℃" + m[2];
    }
    if (p.childNodes[0].textContent == "Wind") {
      const m = new RegExp(/^(\d+) mph(.*)$/).exec(p.childNodes[2].textContent || "");
      if (!m) {
        return;
      }
      const mph = Number.parseFloat(m[1]);
      const mps = mph_to_mps(mph);
      p.childNodes[2].textContent = mps + " m/s" + m[2];
    }
  }
  /**
   * @param {HTMLElement} root
   */
  function replaceEnvironment(root) {
    const children = root.querySelectorAll(".cwAX");
    for (const p of children) {
      replace_overall_list(/** @type {HTMLElement} */ (p));
    }
  }
  /**
   * @param {HTMLElement} root
   */
  function replaceContent(root) {
    replaceBallSpeed(root);
    replacePitchSpeed(root);
    replaceEnvironment(root);
  }
  replaceContent(document.body);
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type != "childList") {
        if (mutation.target.parentElement?.classList.contains("cwAX")) {
          replace_overall_list(mutation.target.parentElement);
        }
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.nodeType !== 1) {
          continue;
        }
        // Only call replaceContent if node is an HTMLElement
        if (node instanceof HTMLElement) {
          replaceContent(node);
        }
      }
    }
  });
  observer.observe(document.body, {
    subtree: true,
    childList: true,
    characterData: true,
  });
})();
