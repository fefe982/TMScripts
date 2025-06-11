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
    function replaceContent(root) {
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
            let kmph = (mph * 1.609344).toFixed(2);
            p.textContent = p.textContent + " / " + kmph + " kmph";
        }
        children = root.querySelectorAll(".data-point");
        for (let p of children) {
            console.log(p);
            console.log(p.childNodes[0]);
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
            let kmph = (mph * 1.609344).toFixed(2);
            p.textContent = kmph + " kmph";
        }
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