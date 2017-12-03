// ==UserScript==
// @name         dbb_world
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        http://w13.d-bb.com/cgi-bin/*
// @match        http://k13.d-bb.com/cgi-bin/*
// @grant        GM_log
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function () {
    'use strict';
    
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
    var path = location.pathname.split('/').pop();
    var param = location.search.substring(1);
    param = param ? JSON.parse('{"' + param.replace(/^&/, '').replace(/&/g, '","').replace(/=/g, '":"') + '"}', function (key, value) {
            return key === "" ? value : decodeURIComponent(value);
        }) : {};
    GM_log(path);
    GM_log(param);
    switch (path) {
    case 'dbb_card_gacha.cgi':
        // gacha, get next card
        var gacha = jQuery('#retrial > a');
        GM_log(gacha);
        setTimeout(function () {
            jQuery('#retrial > a').attr('onclick', 'return true;')[0].click();
        }, 1000);
        break;
    case 'dbb_level_up.cgi':
        var grade = jQuery('#levelup_gr').text().match(/\d+/);
        if (grade)
            grade = +grade[0];
        var level = jQuery('#levelup_levv').text().match(/\d+/);
        if (level)
            level = +level[0];
        GM_log(grade);
        GM_log(level);
        //if (grade !== 1)
        //    break;
        var card_type = jQuery('#card_type').text();
        GM_log(card_type);
        var add_time = jQuery('#remain_point').text();
        var halt = false;
        for (var i = 1; i <= 8; ++i) {
            var row = jQuery('#data' + i + '_row');
            var add_five_button = row.find('td:nth-child(5) > input[type="button"]');
            var bonus = +add_five_button[0].getAttribute('onclick').split(',')[4];
            GM_log(bonus);
            var current = +row.find('td:nth-child(9)').text();
            var cur_row = current / 5.0;
            if (bonus > 0) {
                cur_row = Math.ceil(cur_row * bonus / (bonus + 1));
            }
            GM_log("current: " + current + " bonus: " + bonus + " cur_row: " + cur_row);
            add_time += cur_row;
        }
        for (var i = 1; i <= 8; ++i) {
            var row = jQuery('#data' + i + '_row');
            var add_five_button = row.find('td:nth-child(5) > input[type="button"]');
            GM_log(add_five_button);
            var bonus = +add_five_button[0].getAttribute('onclick').split(',')[4];
            GM_log(bonus);
            var current = +row.find('td:nth-child(9)').text();
            var add_row = (Math.floor(add_time / 8) + (i <= add_time % 8 ? 1 : 0)) * 5;
            GM_log(add_row);
            if (bonus > 0) {
                add_row += Math.floor(add_row / bonus);
            }
            GM_log(add_row);
            if (current < add_row) {
                add_five_button.click();
            } else if (current > add_row) {
                //halt = true;
            }
        }
        if (!halt) {
            jQuery('#levelup_btnbox > ul > li.last > input').attr('onclick', 'return true;').click();
        }
        break;
    case 'dbb_regist_team_player.fcgi':
    case 'dbb_regist_real_team_player.cgi':
        var lvup = jQuery('td.lvup > a:first');
        if (lvup.length > 0) {
            lvup[0].click();
            return;
        }
        if (path === 'dbb_regist_team_player.fcgi') break;
        
        var date = new Date(Date.now() + 3600 * 1000 * 7);
        date = (date.getMonth() + 1) + "-" + date.getDate();
        GM_log("date_check", GM_getValue('npb_start_update_date', ""), date);
        //GM_deleteValue('npb_start_update_date')
        if (GM_getValue('npb_start_update_date', "") !== date) {
            if (jQuery('#kantokuore > a').size() == 0) {
                var ret = GM_xmlhttpRequest({
                    method: "GET",
                    url: "http://npb.jp/announcement/starter/",
                    onload: function(res) {
                       var npb_starter = jQuery(new DOMParser().parseFromString(res.responseText, "text/html"));
                       GM_log(npb_starter);
                       var infoarea = npb_starter.find('.team_left, .team_right');
                       GM_log(infoarea);
                       var starter = [];
                       infoarea.each(function () {
                           GM_log(this);
                           var team = jQuery(this).children('img').attr('src').match(/logo_(.+)_m.gif/)[1].toUpperCase();
                           var player = jQuery(this).find('a > span').text().split(/　/);
                           player[0] = player[0].replace(/[A-ZＡ-Ｚ]．/, '');
                           GM_log([team, ...player]);
                           starter.push([team, ...player]);
                       });
                       GM_log(starter);
                       GM_setValue('npb_starters', starter);
                       GM_setValue('npb_start_update_date', date);
                    }
                });
            } else {
                GM_log('offseason');
                var ret = GM_xmlhttpRequest({
                    method: "GET",
                    url: "/cgi-bin/dbb_manager_confirm.cgi",
                    onload: function(res) {
                        var npb_starter = jQuery(new DOMParser().parseFromString(res.responseText, "text/html"));
                        npb_starter.find('#stovearea > div > div > div.stove_dispresult > table > tbody > tr:has(td.stove_kantoku_td)').each(function () {
                            starters.push([teams_i[jQuery(this).children('td:nth-child(3)').children('img:nth-child(1)').attr('src').match(/logo_team(\d+).gif/)[1]], jQuery(this).children('td:nth-child(2)').text()]);
                            starters.push([teams_i[jQuery(this).children('td:nth-child(3)').children('img:nth-child(3)').attr('src').match(/logo_team(\d+).gif/)[1]], jQuery(this).children('td:nth-child(4)').text()]);
                        });
                        GM_log(starters);
                        GM_setValue('npb_starters', starters);
                        GM_setValue('npb_start_update_date', date);
                        GM_log("date", GM_getValue('npb_start_update_date', ""), date);
                    }
                });
            }
        }
        
        GM_log(GM_getValue('npb_starters'));
        var players = GM_getValue('npb_starters');
        GM_log(typeof players);
        if (typeof players === "string") {
            players = JSON.parse(players);
        }
        GM_log(typeof players);
        GM_log(players);

        var num_p = 0;
        players.forEach(function (v) {
            GM_log(v);
            if (v[1] === "") {
                return;
            }
            num_p += jQuery('tr:contains("' + v[1] + '"):has(img[src*="icon_col_team' + teams[v[0]][0] + '.gif"]) td:not(.co1):not(.co1)').css('background', 'yellow').length;
        });
        GM_log(num_p);
        if (jQuery('#realteamarea > div.konbase.clear > div.temoti_search > form > table > tbody > tr:nth-child(1) > td:nth-child(4) > div > span').text().match(/投手/)) {
            if (num_p === 0) {
                var pl = jQuery('.page_fixed + li.page_link > a');
                GM_log(pl);
                if (pl.length > 0) {
                    pl[0].click();
                }
            }
        }
        break;
    case 'dbb_card_list.cgi':
        GM_log("in");
        lvup = jQuery('a[href*="dbb_level_up.cgi"]');
        GM_log(lvup);
        if (lvup.length > 0) {
            lvup[0].click();
        }
        break;
    case 'dbb_training.cgi':
        if (!('detail' in param)) {
            if (jQuery('#downchoice > ul > li:nth-child(6) > select > option:contains("レベル")').attr('selected') === true &&
                jQuery('#downchoice > ul > li:nth-child(7) > select > option:contains("降順")').attr('selected') === true) {
                GM_log("good");
                jQuery('#shoji_cardarea > div.card_tr > div.cardwaku').each(function () {
                    GM_log("hi");
                    var grade = +jQuery(this).find('div.senshucard > div > div > div > span.card_grade > img').attr("src").match(/grade(\d)/)[1];
                    var lvl = +jQuery(this).find('div.senshucard > div > div > div > span.card_level').text();
                    GM_log(grade);
                    GM_log(lvl);
                    if (grade === 1 && lvl < 30) {
                        jQuery(this).find('ul > li > a')[0].click();
                        GM_log(jQuery(this).find('ul > li > a'));
                        return false;
                    }
                    //jQuery('#shoji_cardarea > div.card_tr > div > ul > li > a').click();
                });
            } else {
                jQuery('#downchoice > ul > li:nth-child(6) > select > option:contains("レベル")').attr('selected', true);
                jQuery('#downchoice > ul > li:nth-child(7) > select > option:contains("降順")').attr('selected', true);
                jQuery('#downchoice > ul > li:nth-child(8) > input').click();
            }
        } else {
            jQuery('#park_contents > div:nth-child(2) > div > table > tbody > tr > th > input[type="radio"]:last').attr('checked', 'true');
            jQuery('#park_contents > div:nth-child(2) > p > input').attr('onclick', 'return true').click();
        }
        break;
    case 'dbb_spa.cgi':
    case 'dbb_rehabilitation.cgi':
    case 'dbb_hospital.cgi':
        if (jQuery('#downchoice > ul > li:nth-child(1) > a').length > 0) {
            jQuery('#downchoice > ul > li:nth-child(1) > a').attr('onclick', 'return true;')[0].click();
            break;
        }
        if (jQuery('#sasikae_cardarea ul > li > a').length > 0) {
            jQuery('#sasikae_cardarea ul > li > a').attr('onclick', 'return true')[0].click();
        }
        break;
    case 'dbb_road_game_entry_normal.fcgi':
        jQuery('#entrygame_cenbox02 > div > p:nth-child(2) > a')[0].click();
        break;
    case 'dbb_regist_club_team_player.fcgi':
        if (jQuery('#leveluparea > div > div.temoti_search > form > div').length > 0) {
            GM_log(GM_getValue('dbb_world_auto_club_team', 0));
            if (GM_getValue('dbb_world_auto_club_team', 0) !== 1)
                return;
            if (jQuery('#hakihyo > tbody > tr > td.center > a:first').length > 0) {
                jQuery('#hakihyo > tbody > tr > td.center > a:first')[0].click();
                GM_log(jQuery('#hakihyo > tbody > tr > td.center > a:first')[0]);
            }
        } else if (document.insert !== undefined) {
            document.insert.submit();
        } else {
            var owner = jQuery('#hakihyo > tbody > tr').find('td:first:not(:has(input))'); //#hakihyo > tbody > tr:nth-child(16) > td:nth-child(4)
            GM_log(owner);
            if (owner.length === 0) {
                jQuery('#hakihyo > tbody > tr:has(input[value="監督"]) > td > input[type="image"]').click();
                GM_setValue('dbb_world_auto_club_team', 1);
            } else {
                if (jQuery('#hakihyo > tbody > tr:not(:has(td > input[type="image"])) > td:not(.co2)').length === 0) {
                    GM_setValue('dbb_world_auto_club_team', 1);
                    jQuery('#hakihyo > tbody > tr > td > input[type="image"]:first').click();
                } else {
                    GM_deleteValue('dbb_world_auto_club_team');
                }
            }
        }
        break;
    case 'dbb_road_game_entry_decisive.fcgi':
        if (param.exe_entry === undefined) {
            var entry = jQuery('#entrygame_cenbox02 > table.timetable > tbody > tr > td > a:has(img[src*="btn_entrytime.gif"]):first');
            if (entry.length > 0) {
                entry.attr('onclick', 'return true')[0].click();
            }
        }
        break;
    case 'dbb_manager_confirm.cgi':
        jQuery('#stovearea > div > div > div.stove_dispresult > table > tbody > tr:has(td.stove_kantoku_td)').each(function () {
            starters.push([teams_i[jQuery(this).children('td:nth-child(3)').children('img:nth-child(1)').attr('src').match(/logo_team(\d+).gif/)[1]], jQuery(this).children('td:nth-child(2)').text()]);
            starters.push([teams_i[jQuery(this).children('td:nth-child(3)').children('img:nth-child(3)').attr('src').match(/logo_team(\d+).gif/)[1]], jQuery(this).children('td:nth-child(4)').text()]);
        });
        GM_log(starters);
        GM_setValue('npb_starters', starters);
        break;
    case 'dbb_goods.cgi':
        if (jQuery('#park_whole > div:nth-child(2) > img').length > 0) {
            GM_deleteValue('dbb_world_build_goods');
            break;
        }
        if (jQuery('#product_form').length > 0) {
            jQuery('#product_form > div > p > input[type="image"]:nth-child(1)').click();
            break;
        }
        function build_goods() {
            GM_log(GM_getValue('dbb_world_build_goods', 0));
            if (GM_getValue('dbb_world_build_goods', 0) !== 1) {
                return;
            }
            var time = jQuery('#park_contents > div:nth-child(3) > div.builddata_goods:last > table > tbody > tr:nth-child(3) > td');
            //if (time.length === 0) {
            //    return;
            //}
            //GM_log(Date.parse(time.text()) - Date.now());
            if (time.length > 0 && Date.parse(time.text()) - Date.now() > 2 * 24 * 3600 * 1000) {
                GM_deleteValue('dbb_world_build_goods');
                return;
            }
            jQuery('#park_contents > div:nth-child(2) > div.builddata_goods:last > table:first > tbody > tr:nth-child(3) > td:nth-child(4) > form  #count')[0].value = 1000;
            jQuery('#park_contents > div:nth-child(2) > div.builddata_goods:last > table:first > tbody > tr:nth-child(3) > td:nth-child(4) > form > input[type="image"]:nth-child(7)').click();
        }
        jQuery('#park_contents > div:nth-child(2) > div.builddata_goods:last > table > tbody > tr > th:contains("製造数")').click(function (){
            GM_log('in click');
            GM_setValue('dbb_world_build_goods', 1);
            build_goods();
        });
        build_goods();
        break;
    case 'dbb_conflate_card.cgi':
        if (param.conflate_type === '2') {
            GM_log('conflate, card add ability');
            if (jQuery('#slotwaku > div.le > p.naosu').length === 0) {
                GM_log('add base');
                if (jQuery('#narabikae > ul > li > select:nth-child(1) > option:contains("平均BBR")').attr('selected') === 'selected' &&
                jQuery('#narabikae > ul > li > select:nth-child(3) > option:contains("降順")').attr('selected') === 'selected') {
                    jQuery('#shoji_cardarea > div:nth-child(1) > div:nth-child(1) > ul > li > a')[0].click();
                } else {
                    jQuery('#narabikae > ul > li > select:nth-child(1) > option:contains("平均BBR")').attr('selected', 'selected');
                    jQuery('#narabikae > ul > li > select:nth-child(3) > option:contains("降順")').attr('selected', 'selected');
                    jQuery('#gosei_cardsearch > div.kensaku_op > p > input[type="image"]')[0].click();
                }
            } else if (jQuery('#slotwaku > div.ri > p.naosu').length === 0) {	
                GM_log('add material');
                GM_log(jQuery('#narabikae > ul > li > select:nth-child(1) > option:contains("平均BBR")').attr('selected'));
                GM_log(jQuery('#narabikae > ul > li > select:nth-child(3) > option:contains("昇順")').attr('selected'));
                if (jQuery('#narabikae > ul > li > select:nth-child(1) > option:contains("平均BBR")').attr('selected') === 'selected' &&
                jQuery('#narabikae > ul > li > select:nth-child(3) > option:contains("昇順")').attr('selected') === 'selected') {
                    //jQuery('#shoji_cardarea > div:nth-child(1) > div:nth-child(1) > ul > li > a')[0].click();
                } else {
                    jQuery('#narabikae > ul > li > select:nth-child(1) > option:contains("平均BBR")').attr('selected', 'selected');
                    jQuery('#narabikae > ul > li > select:nth-child(3) > option:contains("昇順")').attr('selected', 'selected');
                    jQuery('#gosei_cardsearch > div.kensaku_op > p > input[type="image"]')[0].click();
                }
            }
        } else if (param.conflate_type === '4') {
            GM_log('conflate, card ability upgrade');
            if (jQuery('#slotwaku > div.le > p.naosu').length === 0) {
                GM_log('add base');
                if (jQuery('#narabikae > ul > li > select:nth-child(1) > option:contains("グレード")').attr('selected') === 'selected' &&
                jQuery('#narabikae > ul > li > select:nth-child(3) > option:contains("降順")').attr('selected') === 'selected') {
                    jQuery('#shoji_cardarea > div:nth-child(1) > div:nth-child(1) > ul > li > a')[0].click();
                } else {
                    jQuery('#narabikae > ul > li > select:nth-child(1) > option:contains("グレード")').attr('selected', 'selected');
                    jQuery('#narabikae > ul > li > select:nth-child(3) > option:contains("降順")').attr('selected', 'selected');
                    jQuery('#gosei_cardsearch > div.kensaku_op > p > input[type="image"]')[0].click();
                }
            } else if (jQuery('#slotwaku > div.ri > p.naosu').length === 0) {	
                GM_log('add material');
                GM_log(jQuery('#narabikae > ul > li > select:nth-child(1) > option:contains("平均BBR")').attr('selected'));
                GM_log(jQuery('#narabikae > ul > li > select:nth-child(3) > option:contains("昇順")').attr('selected'));
                if (jQuery('#narabikae > ul > li > select:nth-child(1) > option:contains("平均BBR")').attr('selected') === 'selected' &&
                jQuery('#narabikae > ul > li > select:nth-child(3) > option:contains("昇順")').attr('selected') === 'selected') {
                    var items = jQuery('#shoji_cardarea > div > div');
                    for (var i = 0; i < items.length; ++i) {
                      var item = jQuery(items[i]);
                      var grade = +item.find('span.card_grade > img').attr('src').match(/grade([0-9])/)[1];
                      var lvl = +item.find('span.card_level').text();
                      var season = +item.find('span.card_season > img').attr('src').match(/season([0-9]*)/)[1];
                      var recentBBR = item.find('span.card_saisinbbr').text();
                      var avgBBR = item.find('span.card_avebbr').text();
                      if (( recentBBR === '' && avgBBR === '') || (season < 13 && lvl === 1 && (avgBBR === '' || (+avgBBR) < 60))) {
                        item.find('ul > li > a')[0].click();
                        break;
                      }
                    }
                    //jQuery('#shoji_cardarea > div > div > ul > li > a')[0].click();
                    //
                } else {
                    jQuery('#narabikae > ul > li > select:nth-child(1) > option:contains("平均BBR")').attr('selected', 'selected');
                    jQuery('#narabikae > ul > li > select:nth-child(3) > option:contains("昇順")').attr('selected', 'selected');
                    jQuery('#gosei_cardsearch > div.kensaku_op > p > input[type="image"]')[0].click();
                }
            }
        }
        break;
    case 'dbb_conflate_confirm.cgi':
        if (param.conflate_type === '2') {
            jQuery('#slotwaku > div.lein > input').attr('onclick', 'return true')[0].click();
        } else if (param.conflate_type === '4') {
            var itm = jQuery('#goseiitiran > tbody > tr > td:nth-child(1) > label > span');
            itm[Math.floor(Math.random() * itm.size())].click();
            jQuery('#w660 > div.lein > input').attr('onclick', 'return true')[0].click();
        }
        break;
    case 'dbb_conflate_finish.cgi':
        jQuery('#slotwaku > p.btn_regosei > a:last')[0].click();
        break;
    case 'dbb_card_employ.cgi':
        location.assign("javascript:SetChecked(true);");
        if (jQuery('#alartwrap > table > tbody > tr > td:contains("登録ができません")').size() > 0) {
            break;
        }
        setTimeout(()=>{
          jQuery('#levelup_btnbox > ul > li.last > input[type="image"]').attr('onclick', 'return true')[0].click();
        }, 1000);
        break;
    }
})();
