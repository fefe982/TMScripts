// ==UserScript==
// @name         dbb_world
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        http://w13.d-bb.com/cgi-bin/*
// @match        http://k13.d-bb.com/cgi-bin/*
// @grant        GM_log
// ==/UserScript==

(function() {
    'use strict';
    var path = location.pathname.split('/').pop();
    var param = location.search.substring(1);
    param = param?JSON.parse('{"' + param.replace(/^&/, '').replace(/&/g, '","').replace(/=/g,'":"') + '"}', function(key, value) { return key===""?value:decodeURIComponent(value); }):{};
    GM_log(path);
    GM_log(param);
    switch (path) {
        case 'dbb_card_gacha.cgi':
            // gacha, get next card
            var gacha = jQuery('#retrial > a');
            GM_log(gacha);
            gacha.attr('onclick', 'return true;');
            gacha[0].click();
            break;
        case 'dbb_level_up.cgi':
            var grade = jQuery('#levelup_gr').text().match(/\d+/);
            if (grade) grade = +grade[0];
            var level = jQuery('#levelup_levv').text().match(/\d+/);
            if (level) level = +level[0];
            GM_log(grade);
            GM_log(level);
            if (grade !== 1) break;
            var card_type = jQuery('#card_type').text();
            GM_log(card_type);
            var add_time = (level-1) * 3;
            var halt = false;
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
                    halt = true;
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
    }
})();