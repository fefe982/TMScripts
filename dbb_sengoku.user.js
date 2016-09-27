// ==UserScript==
// @name         dbb_sengoku
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  try to take over the world!
// @author       You
// @match        http://s01.d-bb.com/cgi-bin/*
// @grant        GM_log
// ==/UserScript==

(function() {
    'use strict';
    var url = document.URL;
    var path = url.match(/http:\/\/s01\.d-bb\.com\/cgi-bin\/(.*)/);
    if (!path) {
        return;
    }
    path = path[1];
    GM_log(path);

    // Returns a random integer between min (included) and max (included)
    // Using Math.round() will give you a non-uniform distribution!
    function getRandomIntInclusive(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    if (path.match(/sdb_into_battle_event.cgi(?:\?event=\d+)?$/)) {
        var links = $('#main > div > div > ul > li > a:has(img[src*="quest_icon_sensyu.png"])');
        if (links.length !== 0) {
            links[getRandomIntInclusive(0, links.length-1)].click();
        }
    } else if (path.match(/sdb_into_battle_event\.cgi\?detail=on&event=.*&stage=2&list_page=.*/)) {
        $('#main > div > div > p.syutujin > a')[0].click();
    } else if (path.match(/sdb_into_battle_event\.cgi\?detail=on&event=.*&stage=.&list_page=.*/)) {
        $('#main > div > div > p.levelbtns > a:nth-child(2)')[0].click();
    } else if (path.match(/sdb_into_battle_event.cgi\?.*team_select=on.*|sdb_into_battle_another.cgi\?another_team=\d+/)) {
        $('#main > form > p > input[type="image"]')[0].click();
    } else if (path.match(/sdb_npc_game_play.fcgi\?game=\d+$/)) {
            GM_log($('#wrap > div.btn_play_retry > a[href*="surrender=on"]').length > 0);
        if ($('#finish').length > 0) {
            $('#finish')[0].click();
        } else if ($('#wrap > div.btn_play_retry > a[href*="surrender=on"]').length > 0) {
            GM_log("XXXXXXXXX");
            //GM_log($('#wrap > div.btn_play_retry > a[href*="surrender=on"]'));//.attr('onclick'));
            $('#wrap > div.btn_play_retry > a[href*="surrender=on"]').attr('onclick', 'return true');
            $('#wrap > div.btn_play_retry > a[href*="surrender=on"]')[0].click();
        } else if ($('#wrap > div.btn_play_retry > a').length > 0) {
            $('#wrap > div.btn_play_retry > a')[0].click();
        } else if ($('#wrap > div.btn_back2top > a').length > 0) {
            $('#wrap > div.btn_back2top > a')[0].click();
        }
        //GM_log($('#wrap > div.btn_play_retry > a[href*="surrender=on"]'));
    } else if (path.match(/sdb_npc_game_play.fcgi\?game=\d+&result=on/)) {
        GM_log($('#wrap > div.mark > div.lastbtn > a'));
        $('#wrap > div.mark > div.lastbtn > a')[0].click();
    } else if (path.match(/sdb_castle.cgi\?npc_game=\d+/)) {
        if ($('#main > div > div > div > ul > li.register > a').length > 0) {
            $('#main > div > div > div > ul > li.register > a')[0].click();
        }
    } else if (path.match(/sdb_trader\.cgi/)) {
        var wood = +$('#wood').text();
        var leather = +$('#hide').text();
        var iron = +$('#iron').text();
        if ($('#main > div > form').length ===0) {
            return;
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
    }
    // Your code here...
})();