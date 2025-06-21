// ==UserScript==
// @name         mlb
// @namespace    http://tampermonkey.net/
// @version      2025-06-11
// @description  try to take over the world!
// @author       Yongxin Wang
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
  function replaceEnvironment(root) {
    let children = root.querySelectorAll(".fazIkQ");
    for (let p of children) {
      if (p.attributes["__tag"]) {
        continue;
      }
      p.attributes["__tag"] = "1";
      if (p.childNodes[0].textContent == "Weather") {
        let m = p.childNodes[2].textContent.match(/^(\d+) degrees(.*)$/);
        if (!m) {
          continue;
        }
        let deg = ((parseInt(m[1]) - 32) / 1.8).toFixed(1);
        p.childNodes[2].textContent = deg + " ℃" + m[2];
      }
      if (p.childNodes[0].textContent == "Wind") {
        console.log(p.childNodes[2].textContent);
        let m = p.childNodes[2].textContent.match(/^(\d+) mph(.*)$/);
        if (!m) {
          continue;
        }
        let mph = parseFloat(m[1]);
        let mps = mph_to_mps(mph);
        p.childNodes[2].textContent = mps + " m/s" + m[2];
      }
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
  observer.observe(document.body, { subtree: true, childList: true });
})();
