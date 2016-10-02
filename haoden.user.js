// ==UserScript==
// @name         haoden
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  try to take over the world!
// @author       You
// @match        http://www.haoden.jp/w07/*
// @grant        GM_log
// ==/UserScript==

(function () {
    'use strict';
    var path = location.pathname.split('/').pop();
    var param = location.search.substring(1);
    param = param ? JSON.parse('{"' + param.replace(/^&/, '').replace(/&/g, '","').replace(/=/g, '":"') + '"}', function (key, value) {
            return key === "" ? value : decodeURIComponent(value);
        }) : {};
    GM_log(path);
    switch (path) {
        case 'ht_level_up.fcgi':
            var cur_idx = 0;
            var cur_max = 0;
            jQuery('#level02 > tbody > tr > td:nth-child(2)').text().trim().split(/\s+/).map(function (v) {
                return +v;
            }).forEach(function (val, idx) {
                if (val > cur_max) {
                    cur_max = val;
                    cur_idx = idx;
                }
            });
            if (cur_idx < 1 || cur_idx > 3) { // 0 4 5
                var cur_min = -1;
                jQuery('#level02 > tbody > tr > td:nth-child(9)').text().trim().split(/\s+/).map(function (v) {
                    return +v;
                }).forEach(function (val, idx) {
                    if (idx < 1) {
                        cur_min = val;
                        cur_idx = idx;
                    } else if (idx > 3 && val < cur_min) {
                        cur_min = val;
                        cur_idx = idx;
                    }
                });
            }
            jQuery('#level02 > tbody > tr > td:nth-child(4) > input[type="button"]:nth-child(2)').eq(cur_idx).click();
            jQuery('#lvuparea_btnarea > input[type="image"]').attr('onclick', 'return true').click();
            break;
        case 'ht_card_list.fcgi':
            var lvlup = jQuery('#militarylist > tbody > tr > td:nth-child(6) > a');
            if (lvlup.length > 0) {
                lvlup.click();
            }
            break;
        case 'ht_deck_list.fcgi':
            if (jQuery('span.card_lvup > a').length > 0) {
                jQuery('span.card_lvup > a')[0].click();
            } else if (jQuery('div.search_carddataname > p.eiyulv > a:first').length > 0) {
                jQuery('div.search_carddataname > p.eiyulv > a')[0].click();
            }
            break;
        case 'ht_spa.fcgi':
            if (jQuery('#below_contents > div:nth-child(2) > div:nth-child(1) > div.search_carddata_btn > a').length > 0) {
                jQuery('#below_contents > div:nth-child(2) > div:nth-child(1) > div.search_carddata_btn > a')[0].click();
            }
            break;
    }
    // Your code here...
})();
