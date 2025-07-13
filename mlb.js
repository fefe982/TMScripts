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
  let mph_to_kmph = (mph) => (mph * 1.609344).toFixed(2);
  let mph_to_mps = (mph) => (mph * 0.447037).toFixed(1);
  function replaceBallSpeed(root) {
    let children = root.querySelectorAll(".ptNqa");
    for (let p of children) {
      console.log(p);
      console.log(p.childNodes[0]);
      if (p.childNodes.length == 1) {
        continue;
      }
      let mph = parseFloat(p.childNodes[0].textContent);
      if (!mph) {
        continue;
      }
      let kmph = mph_to_kmph(mph);
      p.textContent = p.textContent + " / " + kmph + " kmph";
    }
  }
  function replacePitchSpeed(root) {
    let children = root.querySelectorAll(".data-point");
    for (let p of children) {
      if (p.childNodes.length != 1) {
        continue;
      }
      let m = p.childNodes[0].textContent.match(/^([\d.]+) mph$/);
      if (!m) {
        continue;
      }
      let mph = parseFloat(m[1]);
      if (!mph) {
        continue;
      }
      let kmph = mph_to_kmph(mph);
      p.textContent = kmph + " kmph";
    }
  }
  function replace_fazIkQ(p) {
    if (p.childNodes[0].textContent == "Weather") {
      let m = p.childNodes[2].textContent.match(/^(\d+) degrees(.*)$/);
      if (!m) {
        return;
      }
      let deg = ((parseInt(m[1]) - 32) / 1.8).toFixed(1);
      p.childNodes[2].textContent = deg + " ℃" + m[2];
    }
    if (p.childNodes[0].textContent == "Wind") {
      let m = p.childNodes[2].textContent.match(/^(\d+) mph(.*)$/);
      if (!m) {
        return;
      }
      let mph = parseFloat(m[1]);
      let mps = mph_to_mps(mph);
      p.childNodes[2].textContent = mps + " m/s" + m[2];
    }
  }
  function replaceEnvironment(root) {
    let children = root.querySelectorAll(".fazIkQ");
    for (let p of children) {
      replace_fazIkQ(p);
    }
  }
  function replaceContent(root) {
    replaceBallSpeed(root);
    replacePitchSpeed(root);
    replaceEnvironment(root);
  }
  replaceContent(document.body);
  const observer = new MutationObserver((mutations) => {
    for (let mutation of mutations) {
      if (mutation.type != "childList") {
        if (mutation.target.parentElement.classList.contains("fazIkQ")) {
          replace_fazIkQ(mutation.target.parentElement);
        }
        continue;
      }
      for (let node of mutation.addedNodes) {
        if (node.nodeType != 1) {
          continue;
        }
        replaceContent(node);
      }
    }
  });
  observer.observe(document.body, {
    subtree: true,
    childList: true,
    characterData: true,
  });
})();
