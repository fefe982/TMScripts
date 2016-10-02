// ==UserScript==
// @name         dbb_sengoku
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  try to take over the world!
// @author       You
// @match        http://s01.d-bb.com/cgi-bin/*
// @noframes
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
    GM_log(param);
    // Returns a random integer between min (included) and max (included)
    // Using Math.round() will give you a non-uniform distribution!
    function getRandomIntInclusive(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    switch (path) {
    case 'sdb_into_battle_event.cgi':
        if (param.team_select === 'on') {
            $('#main > form > p > input[type="image"]')[0].click();
        } else if (param.stage === '2') {
            $('#main > div > div > p.syutujin > a')[0].click();
        } else if (param.stage !== undefined) {
            $('#main > div > div > p.levelbtns > a:nth-child(2)')[0].click();
        } else {
            //GM_log(Object.getOwnPropertyNames(param));
            var links = $('#main > div > div > ul > li > a:has(img[src*="quest_icon_sensyu.png"])');
            if (links.length !== 0) {
                links[getRandomIntInclusive(0, links.length - 1)].click();
            }
        }
        break;
    case 'sdb_into_battle_another.cgi':
        $('#main > form > p > input[type="image"]')[0].click();
        break;
    case 'sdb_npc_game_play.fcgi':
        GM_log($('#wrap > div.btn_play_retry > a[href*="surrender=on"]').length > 0);
        if (param.result === 'on') {
            $('#wrap > div.mark > div.lastbtn > a')[0].click();
        } else if ($('#finish').length > 0) {
            $('#finish')[0].click();
        } else if ($('#wrap > div.btn_play_retry > a[href*="surrender=on"]').length > 0) {
            GM_log("XXXXXXXXX");
            //GM_log($('#wrap > div.btn_play_retry > a[href*="surrender=on"]'));//.attr('onclick'));
            $('#wrap > div.btn_play_retry > a[href*="surrender=on"]').attr('onclick', 'return true')[0].click();
        } else if ($('#wrap > div.btn_play_retry > a').length > 0) {
            $('#wrap > div.btn_play_retry > a')[0].click();
        } else if ($('#wrap > div.btn_back2top > a').length > 0) {
            $('#wrap > div.btn_back2top > a')[0].click();
        }
        break;
    case 'sdb_castle.cgi':
        if ($('#main > div > div > div > ul > li.register > a').length > 0) {
            $('#main > div > div > div > ul > li.register > a')[0].click();
        }
        break;
    case 'sdb_trader.cgi':
        if ($('#main > div > div.akindo_select > div > p.redo > a').length > 0) {
            $('#main > div > div.akindo_select > div > p.redo > a')[0].click();
            break;
        }
        var wood = +$('#wood').text();
        var leather = +$('#hide').text();
        var iron = +$('#iron').text();
        if ($('#main > div > form').length === 0) {
            break;
        }
        if (wood <= leather && wood <= iron) {
            $('#main > div > form > div > div > ul:nth-child(2) > li.kinki > label')[0].click();
        } else if (leather <= wood && leather <= iron) {
            $('#main > div > form > div > div > ul:nth-child(2) > li.tokai > label')[0].click();
        } else {
            $('#main > div > form > div > div > ul:nth-child(2) > li.sansan > label')[0].click();
        }
        $('#main > div > form > div > div > ul:nth-child(4) > li.two_houres > label')[0].click();
        $('#disp > input[type="image"]:nth-child(2)').attr('onclick', 'return true').click();
        break;
    case 'sdb_artisan.cgi':
        //shokunin_dougubox
        if ($('.shokunin_makimonobox').length === 0) {
            $('#main > div.menu.shokunin_menu > ul.shokunin_mainmenu > li:nth-child(3) > a')[0].click();
        }
        break;
    case 'sdb_create_scroll.cgi':
        if (param.detail === "1") {
            $('#main > div.shokunin_seisan > div > form > p.item_buttonbox > input[type="image"]').click();
        } else if ($('#main > div.shokunin_seisan > ul.shokunin_categorylist > li').length > 0) {
            $('#main > div.shokunin_seisan > ul.shokunin_categorylist > li:nth-child(1) > div > p.item_dougu_button > a')[0].click();
        } else {
            if ($('#main > div.shokunin_seisan > ul.shokunin_categorybox > li:has(a.category_on) + li').length > 0) {
                $('#main > div.shokunin_seisan > ul.shokunin_categorybox > li:has(a.category_on) + li > a')[0].click();
            }
        }
        break;
    }
    // Your code here...
})();
