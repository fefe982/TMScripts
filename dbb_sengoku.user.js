// ==UserScript==
// @name         dbb_sengoku
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  try to take over the world!
// @author       You
// @match        http://s01.d-bb.com/cgi-bin/*
// @noframes
// @grant        GM_log
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_xmlhttpRequest
// @connect      cl01.d-bb.com
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
    var teams = {
        H  : [14],
        F  : [9],
        M  : [10],
        L  : [18],
        Bs : [15],
        BS : [15],
        E  : [13],
        Ys : [17],
        S  : [17],
        G  : [1],
        T  : [4],
        C  : [6],
        D  : [2],
        DB : [19]
    };
    var starters = [];
    var teams_i = {
        14 : 'H',
        9  : 'F',
        10 : 'M',
        18 : 'L',
        15 : 'BS',
        13 : 'E',
        17 : 'S',
        1  : 'G',
        4  : 'T',
        6  : 'C',
        2  : 'D',
        19 : 'DB',
    };
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
            if ($('#main > form > p > input[type="image"]').length > 0 ) {
                $('#main > form > p > input[type="image"]')[0].click();
                break;
            } else if ($('#main > div.quest > div > p.syutujin > a > img').length > 0) {
                GM_log('error');
                GM_deleteValue('sengoku_quest_ttl');
                return;
            }
        } else if (param.stage !== undefined) { 
            GM_log("syutujin");
            if ($('#main > div > div > p.levelbtns > a').length > 0) {
                var hard = $('#main > div > div > p.difficulty').text().length;
                GM_log('hard', hard);
                if (hard > 3 && param.stage !== "1") {
                    GM_setValue('sengoku_quest_stage', param.stage);
                    $('#main > div > div > p.levelbtns > a:nth-child(' + (param.stage - 1) + ')')[0].click();
                    break;
                } else if (hard < 3 && (GM_getValue('sengoku_quest_stage') === undefined || GM_getValue('sengoku_quest_stage') < param.stage) && param.stage < 3) {
                    GM_setValue('sengoku_quest_stage', param.stage);
                    $('#main > div > div > p.levelbtns > a:nth-child(' + ((+param.stage) + 1) + ')')[0].click();
                    break;
                }
            }
            GM_log($('#main > div > div > p.syutujin > a'));
            $('#main > div > div > p.syutujin > a')[0].click();
        } else {
            var pg = GM_getValue('sengoku_quest_pg');
            var idx = GM_getValue('sengoku_quest_idx');
            GM_log("pg_check", pg, idx);
            if (pg === undefined || idx === undefined) {
                var ttl = GM_getValue('sengoku_quest_ttl');
                GM_log("ttl_check", ttl);
                if (ttl === undefined) {
                    if ($('#main > div > ol.paging > li > a:contains(">>")').length > 0) {
                        GM_log($('#main > div > ol.paging > li > a:contains(">>")'));
                        $('#main > div > ol.paging > li > a:contains(">>")')[0].click();
                        return;
                    } else {
                        pg = +$('#main > div > ol.paging > li.here').text();
                        ttl = (pg - 1) * 10 + $('#main > div > div > ul.event_top > li.event_part').length;
                        GM_setValue('sengoku_quest_ttl', ttl);
                    }
                }
                GM_log("ttl", ttl);
                idx = getRandomIntInclusive(0, ttl - 1);
                pg = Math.floor(idx / 10);
                idx  = idx - pg * 10;
                pg = pg + 1;
                GM_setValue('sengoku_quest_pg', pg);
                GM_setValue('sengoku_quest_idx', idx);
                GM_deleteValue('sengoku_quest_stage');
            }
            GM_log("pg exec", pg, idx);
            if (pg !== +$('#main > div > ol.paging > li.here').text()) {
                $('#main > div > ol.paging > li > a:contains("' + pg + '")')[0].click();
                return;
            }
            GM_deleteValue('sengoku_quest_pg');
            GM_deleteValue('sengoku_quest_idx');
            GM_log($('#main > div > div > ul.event_top > li.event_part'), idx);
            $('#main > div > div > ul.event_top > li.event_part > a')[idx].click();
            return;
            
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
    case 'sdb_regist_team_player_real.cgi':
        $('#main > div.formationarea > div.formation_list > table > tbody > tr:nth-child(1) > th.th_stts').click(function (){
            GM_deleteValue('npb_start_update_date');
            location.reload();
        });
        var date = new Date(Date.now() + 3600 * 1000 * 7);
        date = (date.getMonth() + 1) + "-" + date.getDate();
        GM_log("date_check", GM_getValue('npb_start_update_date', ""), date);
        if (GM_getValue('npb_start_update_date', "") !== date) {
            GM_log ("xmlhttprequest");
            var ret = GM_xmlhttpRequest({
                method: "GET",
                //url: "http://npb.jp/announcement/starter/",
                //onload: function(res) {
                //    var npb_starter = $(new DOMParser().parseFromString(res.responseText, "text/html"));
                //    var infoarea = npb_starter.find('.team_left, .team_right');
                //    GM_log(infoarea);
                //    var starter = [];
                //    infoarea.each(function () {
                //        GM_log(this);
                //        var team = $(this).children('img').attr('src').match(/logo_(.+)_m.gif/)[1].toUpperCase();
                //        var player = $(this).find('a > span').text().split(/　/);
                //        player[0] = player[0].replace(/[A-ZＡ-Ｚ]．/, '');
                //        GM_log([team, ...player]);
                //        starter.push([team, ...player]);
                //    });
                //    GM_log(starter);
                //    GM_setValue('npb_starters', starter);
                //    GM_setValue('npb_start_update_date', date);
                //}
                url: "http://cl01.d-bb.com/cgi-bin/dbb_manager_confirm.cgi",
                onload: function(res) {
                    GM_log("on_load");
                    var npb_starter = $(new DOMParser().parseFromString(res.responseText, "text/html"));
                    npb_starter.find('#ore_mainarea > div.ore_dispbox > div.ore_dispresult > table > tbody > tr:has(td.ore_kantoku_td)').each(function () {
                        starters.push([teams_i[$(this).children('td:nth-child(3)').children('img:nth-child(1)').attr('src').match(/teamicon_(\d+).gif/)[1]], $(this).children('td:nth-child(2)').text()]);
                        starters.push([teams_i[$(this).children('td:nth-child(3)').children('img:nth-child(3)').attr('src').match(/teamicon_(\d+).gif/)[1]], $(this).children('td:nth-child(4)').text()]);
                    });
                    GM_log(starters);
                    GM_setValue('npb_starters', starters);
                    GM_setValue('npb_start_update_date', date);
                    GM_log("date", GM_getValue('npb_start_update_date', ""), date);
                }
            });
        }
        
        GM_log(GM_getValue('npb_starters'));
        var players = GM_getValue('npb_starters');
        GM_log(typeof players);
        if (typeof players === "string") {
            players = JSON.parse(players);
        }
        GM_log(typeof players);
        GM_log(players);
        if (players === undefined) {
            break;
        }
        players.forEach(function (v) {
            GM_log(v);
            if (v[1] === "") {
                return;
            }
            $('tr:contains("' + v[1] + '"):has(img[src*="icon_col_team' + teams[v[0]][0] + '.gif"])').css('background', "rgba(70,209,140,0.5)");
        });
        break;
    }
    // Your code here...
})();
