// ==UserScript==
// @name       sp.pf.mbga.jp
// @namespace  http://tampermonkey.net/
// @version    0.1
// @description  enter something useful
// @match      http://sp.pf.mbga.jp/*
// @require    http://ajax.googleapis.com/ajax/libs/jquery/1.12.2/jquery.min.js
// @noframes
// @grant      GM_log
// @grant      GM_getValue
// @grant      GM_setValue
// @grant      GM_deleteValue
// @copyright  2012+, Yongxin Wang
// ==/UserScript==
(function () {
    'use strict';

    var url = document.URL, handler, match_app_id, action_handler;

    function getXPATH(xpath) {
        return document.evaluate(xpath, document, null, XPathResult.ANY_TYPE, null).iterateNext();
    }

    function getXPATHAll(xpath) {
        return document.evaluate(xpath, document, null, XPathResult.ANY_TYPE, null);
    }

    function extend(destination, source) {
        var property;
        for (property in source) {
            if (source.hasOwnProperty(property)) {
                destination[property] = source[property];
            }
        }
        return destination;
    }

    function simulate(element, eventName, config) {
        var eventMatchers = {
            'HTMLEvents' : /^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/,
            'MouseEvents' : /^(?:click|dblclick|mouse(?:down|up|over|move|out))$/
        }, defaultOptions = {
            pointerX : 0,
            pointerY : 0,
            button : 0,
            ctrlKey : false,
            altKey : false,
            shiftKey : false,
            metaKey : false,
            bubbles : true,
            cancelable : true
        }, options = extend(defaultOptions, config || {}), oEvent, eventType = null, name;
        for (name in eventMatchers) {
            if (eventMatchers.hasOwnProperty(name)) {
                if (eventMatchers[name].test(eventName)) {
                    eventType = name;
                    break;
                }
            }
        }

        if (!eventType) {
            throw new SyntaxError('Only HTMLEvents and MouseEvents interfaces are supported');
        }

        if (document.createEvent) {
            oEvent = document.createEvent(eventType);
            if (eventType === 'HTMLEvents') {
                oEvent.initEvent(eventName, options.bubbles, options.cancelable);
            } else {
                oEvent.initMouseEvent(eventName, options.bubbles, options.cancelable, document.defaultView,
                    options.button, options.pointerX, options.pointerY, options.pointerX, options.pointerY,
                    options.ctrlKey, options.altKey, options.shiftKey, options.metaKey, options.button, element);
            }
            element.dispatchEvent(oEvent);
        } else {
            options.clientX = options.pointerX;
            options.clientY = options.pointerY;
            oEvent = extend(document.createEventObject(), options);
            element.fireEvent('on' + eventName, oEvent);
        }
        return element;
    }

    function clickSth(obj, eventname, xoff, yoff) {
        var rect, x, y, event;
        if (!obj) {
            //debugger;
            return false;
        }
        if (obj.getBoundingClientRect) {
            rect = obj.getBoundingClientRect();
            x = xoff ? rect.left + xoff : (rect.left + rect.right) / 2;
            y = yoff ? rect.top + yoff : (rect.top + rect.bottom) / 2;
        } else {
            x = 0;
            y = 0;
        }
        if (document.createEvent && obj.dispatchEvent) {
            event = document.createEvent("MouseEvents");
            event.initMouseEvent(eventname, true, true, unsafeWindow,
                0, x, y, x, y,
                false, false, false, false,
                0, obj);
            obj.dispatchEvent(event);
        } else if (obj.fireEvent) {
            obj.fireEvent("onclick");
        }
        return true;
    }

    function clickLink(link) {
        setTimeout(function () {
            var event = document.createEvent("MouseEvents"), cancelled;
            event.initMouseEvent("click", true, true, unsafeWindow,
                0, 0, 0, 0, 0,
                false, false, false, false,
                0, null);
            cancelled = !link.dispatchEvent(event);
            if (cancelled) {
                unsafeWindow.location.href = link.href;
            }
        }, 2000);
    }
    $.expr[':'].regex = function (elem, index, match) {
        var matchParams = match[3].split(','),
            validLabels = /^(data|css):/,
            attr = {
                method : matchParams[0].match(validLabels) ? matchParams[0].split(':')[0] : 'attr',
                property : matchParams.shift().replace(validLabels, '')
            },
            regexFlags = 'ig',
            regex = new RegExp(matchParams.join('').replace(/^\s+|\s+$/g, ''), regexFlags);
        return regex.test(jQuery(elem)[attr.method](attr.property));
    };
    $.expr[':'].regexText = function (elem, index, match) {
        //GM_log(":" + elem.innerText + ":");
        //GM_log(elem.innerText.match(match[3]));
        //GM_log(match[3]);
        //GM_log((new RegExp(match[3])).test(elem.innerText));
        return (new RegExp(match[3])).test(elem.innerText);
    };
    $.fn.simMouseEvent = function (eveName, xoff, yoff) {
        var rect, x, y, eve;
        if (this.length === 0) {
            return this;
        }
        if (this[0].getBoundingClientRect) {
            rect = this[0].getBoundingClientRect();
            x = xoff ? rect.left + xoff : (rect.left + rect.right) / 2;
            y = yoff ? rect.top + yoff : (rect.top + rect.bottom) / 2;
        } else {
            x = 0;
            y = 0;
        }
        eve = document.createEvent("MouseEvents");
        eve.initMouseEvent(eveName, true, true, unsafeWindow,
            0, x, y, x, y,
            false, false, false, false,
            0, this[0]);
        //GM_log("sim mouse " + eveName);
        if (!this[0].dispatchEvent(eve) && eveName === "click" && this[0].tagName === 'A') {
            GM_log("click : " + this[0].href);
            //unsafeWindow.location.href = this[0].href;
        }
        return this;
    };
    $.fn.simTouchEvent = function (eveName, xoff, yoff) {
        var customEvent, rect, x, y;
        if (this.length === 0) {
            return this;
        }
        if (this[0].getBoundingClientRect) {
            rect = this[0].getBoundingClientRect();
            x = xoff ? rect.left + xoff : (rect.left + rect.right) / 2;
            y = yoff ? rect.top + yoff : (rect.top + rect.bottom) / 2;
        } else {
            x = 0;
            y = 0;
        }
        customEvent = document.createEvent("MouseEvent");
        customEvent.touches = [{
            clientX : x,
            clientY : y,
            pageX : x,
            pageY : y,
            screenX : x,
            screenY : y
        }];

        // Available iOS 2.0 and later
        customEvent.initMouseEvent(eveName, /*bubbles*/ true, /*cancelable*/ true, /*view*/ unsafeWindow, /*detail*/ 1,
            x, y, x, y,
            false, false, false, false);

        this[0].dispatchEvent(customEvent);
        return this;
    };

    $.fn.clickJ = function (timeout) {
        var jq;
        GM_log("clickJ : ");
        GM_log(this);
        if (this.length === 0) {
            return this;
        }
        if (timeout === 0) {
            this.simMouseEvent("mousedown");
            this.simMouseEvent("mouseup");
            this.simMouseEvent("click");
        } else {
            jq = $(this);
            GM_log(Date() + ' wait clickJ ' + (timeout || 1000));
            setTimeout(function () {
                GM_log(Date() + ' click func ');
                jq.simMouseEvent("mousedown");
                jq.simMouseEvent("mouseup");
                jq.simMouseEvent("click");
            }, timeout || 500);
        }
        return this;
    };

    $.fn.touchJ = function (timeout) {
        var jq;
        GM_log("touchJ : " + this.length);
        GM_log(this);
        if (this.length === 0) {
            return this;
        }
        if (timeout === 0) {
            this.simTouchEvent("touchstart");
            this.simMouseEvent("touchend");
        } else {
            jq = $(this);
            GM_log(Date() + ' wait clickJ ' + (timeout || 1000));
            setTimeout(function () {
                GM_log(Date() + ' touch func ');
                jq.simTouchEvent("touchstart");
                jq.simTouchEvent("touchend");
            }, timeout || 500);
        }
        return this;
    };

    $.fn.submitJ = function (timeout, nocheck) {
        GM_log("submitJ");
        GM_log(this);
        if (this.length === 0) {
            return this;
        }
        var jq = nocheck ? this : this.filter(':has(input)');
        if (jq.length === 0) {
            return jq;
        }
        setTimeout(function () {
            jq.submit();
        }, timeout || 1000);
        return jq;
    };

    $.fn.minmaxJ = function (compare, target, minmaxflag) {
        var minmax = 1000000, id = -1, ele, nres, num, p = this, p1, i;
        if (minmaxflag) {
            minmax = -minmax;
        }
        if (p.length === 0) {
            return p;
        }
        for (i = 0; i < p.length; i += 1) {
            p1 = $(p[i]);
            GM_log(i + ", " + id + ", " + p.length + ", " + compare + ", " + target);
            if (p1.find(compare).length > 0 && p1.find(target).length > 0) {
                nres = p1.find(compare).text().match(/([0-9]+)/);
                num = parseInt(nres[1], 10);
                if ((minmaxflag && num > minmax) || (!minmaxflag && num < minmax)) {
                    minmax = num;
                    id = i;
                }
            }
        }
        if (id >= 0) {
            return $(p[id]).find(target).clickJ();
        }
        return $();
    };

    $.fn.clickFlash = function (xoff, yoff) {
        //debugger;
        GM_log("clickFlash: ");
        GM_log(this);
        if (this.length === 0) {
            return this;
        }
        var flash = $(this);
        setInterval(function () {
            flash.simMouseEvent("mousemove", xoff, yoff);
            flash.simMouseEvent("mousedown", xoff, yoff);
            flash.simMouseEvent("mouseup", xoff, yoff);
            flash.simMouseEvent("click", xoff, yoff);
        }, 1000);
        return this;
    };

    $.fn.touchFlash = function (xoff, yoff) {
        if (this.length === 0) {
            return this;
        }
        var flash = $(this);
        GM_log("touchFlash: ");
        GM_log(this);
        //alert(flash.text());
        setInterval(function () {
            setTimeout(function () {
                flash.simTouchEvent("touchstart", xoff, yoff);
            }, 10);
            setTimeout(function () {
                flash.simTouchEvent("touchend", xoff, yoff);
            }, 20);
            setTimeout(function () {
                flash.simMouseEvent("mousedown", xoff, yoff);
            }, 30);
            setTimeout(function () {
                flash.simMouseEvent("mousemove", xoff, yoff);
            }, 40);
            setTimeout(function () {
                flash.simMouseEvent("mouseup", xoff, yoff);
            }, 50);
            setTimeout(function () {
                flash.simMouseEvent("click", xoff, yoff);
            }, 60);
        }, 1000);
        return this;
    };


    function clickA(xpath) {
        GM_log("clickA : " + xpath);
        var a = getXPATH(xpath);
        if (a) {
            clickLink(a);
            GM_log("clickA : success");
            return true;
        } //else {
        GM_log("clickA : fail");
        return false;
        //}
    }

    function clickAV(xpathw, xpatha) {
        var w = getXPATH(xpathw), a = getXPATH(xpatha);
        //debugger;
        if (w && a && getComputedStyle(w).getPropertyValue("display") !== "none") {
            clickLink(a, "click");
            return true;
        }
        //else { return false;}
        return false;
    }

    function clickForm(xpath, nocheck) {
        var a = getXPATH(xpath);
        if (a && (nocheck || a.querySelectorAll("input").length > 0)) {
            setTimeout(function () {
                a.submit();
            }, 2000);
            return true;
        } //else {
        return false;
        //}
    }
    function clickS(xpath) {
        setInterval(function () {
            var a = getXPATH(xpath);
            if (a) {
                clickSth(a, "click");
            }
        }, 1000);
    }

    function clickFlash(xpath, xoff, yoff) {
        GM_log('clickFlash : ' + xpath);
        setInterval(function () {
            var canvas = getXPATH(xpath);
            if (canvas) {
                //clickSth(canvas,"mousemove",xoff,yoff);
                clickSth(canvas, "mousedown", xoff, yoff);
                //clickSth(canvas,"click",xoff,yoff);
                clickSth(canvas, "mouseup", xoff, yoff);
                clickSth(canvas, "click", xoff, yoff);
            }
        }, 1000);
        return true;
        //}
        //else
        //{
        //    return false;
        //}
    }

    function clickMinMax(xpath1, xpath2, xpath3, minmaxflag) {
        var minmax = 1000000, id = 0, i = 1, ele, nres, num;
        if (minmaxflag) {
            minmax = -minmax;
        }
        while (((ele = getXPATH(xpath1 + i + xpath2)) !== null) && getXPATH(xpath1 + i + xpath3)) {
            nres = ele.innerText.match(/([0-9]+)/);
            num = parseInt(nres[1], 10);
            if ((minmaxflag && num > minmax) || (!minmaxflag && num < minmax)) {
                minmax = num;
                id = i;
            }
            i += 1;
        }
        if (id > 0) {
            return clickA(xpath1 + id + xpath3);
        } //else {
        return false;
        //}
    }

    ////////////
    function setCookie(c_name, value, exsecs) {
        var exdate = new Date(), c_value = escape(value) + ((exsecs === null) ? "" : "; expires=" + exdate.toUTCString());
        exdate.setSeconds(exdate.getSeconds() + exsecs);
        document.cookie = c_name + "=" + c_value;
    }
    function getCookie(c_name) {
        GM_log("get cookie : " + c_name);
        var c_value = document.cookie, c_start = c_value.indexOf(" " + c_name + "="), c_end;
        if (c_start === -1) {
            c_start = c_value.indexOf(c_name + "=");
        }
        if (c_start === -1) {
            c_value = null;
        } else {
            c_start = c_value.indexOf("=", c_start) + 1;
            c_end = c_value.indexOf(";", c_start);
            if (c_end === -1) {
                c_end = c_value.length;
            }
            c_value = unescape(c_value.substring(c_start, c_end));
        }
        GM_log("get cookie res : " + c_name + " : " + c_value);
        return c_value;
    }

    function reload_page(timeout) {
        setTimeout(function () {
            location.reload(true);
        }, timeout);
    }
    ///////////

    handler = {
        "12010455" : {
            xpathmypage : "//*[@id=\"main_header_menu\"]/ul/li[1]/a",
            cssmypage : "#main_header_menu > ul > li:nth-child(1) > a",
            xpathquest : "//*[@id=\"main_header_menu\"]/ul/li[2]/a",
            no_gift_delay : 10 * 60,
            get_actions : function () {
                return [
                    [/arrangement%2FArrangementEdit%2F/, 'form', '//*[@id="contents"]/div/div[2]/ul/li[3]/form'],
                    [/arrangement%2FArrangementEnd%2F/, 'a', this.xpathmypage],
                    [/bossguildbattle%2FBossGuildbattleResult/, 'list', [
                        ['a', '//*[@id="btn_force"]/a'],
                        ['a', '//*[@id="command_list"]/ul/li//a'],
                        ['hold']]],
                    [/bossguildbattle%2FMissionResult%2F/, 'a', '//a[text()="さらに探索する"]'],
                    [/bossguildbattle%2FMissionTop%2F/, 'list', [
                        ['a', '//*[@id="raid_announce" and span]/div/a'],
                        ['a', '//*[@id="contents"]//a[contains(@href,"MissionActionLot")]'],
                        ['hold']]],
                    [/bossguildbattle%2FRaidbossAssistList%2F/, 'a', '//ul/li[div[1]/span/span[@class="icon_new"]]//a[text()="助けに行く"]'],
                    [/bossguildbattle%2FRaidbossBattleResult%2F/, 'a', '//a[text()="イベントレイドボス応援一覧へ"]'],
                    [/bossguildbattle%2FRaidbossHelpResult%2F/, 'a', '//a[text()="レイドボスバトルへ"]'],
                    [/bossguildbattle%2FRaidbossTop%2F/, 'list', [
                        ['form', '//*[@id="contents"]/form'],
                        ['a', '//*[@id="raid_help"]/a'],
                        ['a', '//a[text()="イベントレイドボス応援一覧に戻る"]'],
                        ['a', '//*[@id="high_attack_btn"]/div/a'],
                        ['a', '//a[text()="探索TOPへ"]'],
                        ['hold']]],
                    [/battleTower%2FBattleTowerTop%2F/, 'list', [
                        ['funcR', function () {
                            if ($('div.last_free_cnt').length > 0 || $('div#gauge_bp')[0].dataset.value > 0) {
                                return $("a[href*='battleTower%2FBattleTowerEnemyList']").clickJ().length > 0;
                            }
                        }],
                        ['aJ', this.cssmypage]]],
                    [/battleTower%2FBattleTowerEnemyList/, 'list', [
                        ['minmax', '//div[div[text()="対戦相手選択"]]/ul/li[', ']//table/tbody/tr[1]/td', ']//a[text()="バトルする"]'],
                        ['aJ', this.cssmypage]]],
                    [/battleTower%2FBattleTowerResult%2F/, 'list', [
                        ['a', '//a[contains(text(),"対戦相手選択")]'],
                        ['aJ', this.cssmypage]]],
                    [/comebackContinuation%2FComebackGacha%2F/, 'aJ', 'a:contains("贈り物ボックスへ")'],
                    [/campaign%2FcmStory%2FCmStoryTop%2F/, 'a', '//a[text()="最新ストーリーを進める"]'],
                    [/companion%2FCompanionApplicationEnd%2F/, 'a', '//a[text()="さらに探す"]'],
                    [/companion%2FCompanionMultiApplication%2F/, 'form', '//*[@id="contents"]/div[1]/form'],
                    [/companion%2FSearchCompanion%2F/, 'form', '//*[@id="contents"]/form'],
                    [/eventRaidboss%2FRaidbossBattleResult/, 'list', [
                        ['aJ', '#contents a[href*="worldRaidboss%2FRaidbossTop"]'],
                        ['aJ', '#contents a[href*="mission%2FMissionActionLot"]']]],
                    [/eventRaidboss%2FRaidbossCollectionDetail/, 'list', [
                        ['aJ', '#contents > div > a[href*="eventRaidboss%2FRaidbossTop"]']]],
                    [/eventRaidboss%2FRaidbossHelpResult/, 'list', [
                        ['aJ', '#contents a[href*="mission%2FMissionActionLot%"]']]],
                    [/eventRaidboss%2FRaidbossTop/, 'list', [
                        ['aJ', '#raid_help > a'],
                        ['aJ', '#small_btn_raid_free_item > div > a'],
                        ['aJ', '#small_btn_raid_hight_attack > div > a'],
                        ['aJ', '#small_btn_raid_attack > div > a'],
                        ['aJ', '#small_btn_raid_high_attack_recovery > div > a'],
                        ['aJ', '#small_btn_raid_attack_recovery > div > a'],
                        ['hold']]],
                    [/evolution%2FEvolutionConfirm%2F/, 'form', '//*[@id="contents"]/form'],
                    [/evolution%2FEvolutionEnd%2F/, 'a', '//a[text()="限界突破TOPへ"]'],
                    [/fusion%2FFusionSwfStart%2F/, 'flash', '//*[@id="container"]'],
                    // gacha theme id
                    // 1 エールガチャ
                    // 2 レジェンドガチャ
                    // 7 レイドガチャ
                    // 8 レアレイドガチャ
                    // 9 無料ガチャ
                    //[/gacha%2FGachaTop%2F$/, 'list', [ // default, 2, legend
                    //    ["sth", "//form[@name='gacha']//input[@class='btn_base']"],
                    //    ['sth', '//form//input[@value="ガチャをする" and @onclick="submit()"]']]],
                    //[/gacha%2FGachaTop(%2F)?%3FthemeId%3D1\b/, 'list', [
                    //    ['hold'],
                    //    ['aJ', 'a[href*="gacha%2FDoGachaExec%2F%3FthemeId%3D9"]']]],
                    //[/gacha%2FGachaTop%2F%3FthemeId%3D2/,
                    //[/gacha%2FGachaTop(%2F)?%3FthemeId%3D7\b/, "a", "(//div[contains(@class, 'btn_base block_flex')]//a)[last()]"],
                    //[/gacha%2FGachaTop%2F%3FthemeId%3D[0-9]/, 'sth', '//form//input[@value="ガチャをする" and @onclick="submit()"]'],
                    [/gacha%2FGacha(?:Result|Top)(?:%2F)?(?:%3FthemeId%3D[0-9]+\S*)?$/, 'list', [
                        ['aJ', 'form[name="gacha"] input[name="isMaxValue"]'],
                        ['formJ', 'form[name="gacha"]'],
                        //['aJ', 'div.btn_base > a:regex(href, gacha%2FDoGachaExec%2F%3FthemeId%3D([0-8]|9[0-9])):last'],
                        ['aJ', 'div.btn_base > a:regex(href, gacha%2FDoGachaExec%2F%3FthemeId):last'],
                        //['hold'],
                        ['aJ', this.cssmypage]]],
                    [/gacha%2FGachaResult%2F%3FthemeId%3D7/, "a", '(//div[@class="btn_base block_flex"]/a[img])[last()]'],
                    [/gacha%2FGachaResult%2F%3FthemeId%3D8/, "a", '(//div[@class="btn_base block_flex"]/a[img])[last()]'],
                    [/gacha%2FitemBox%2FGachaBoxResetConf/, 'aJ', 'a[href*="gacha%2FitemBox%2FDoGachaBoxReset%2F"]'],
                    [/gacha%2FitemBox%2FGachaBoxResetEnd/, 'aJ', 'a[href*="gacha%2FitemBox%2FGachaTop%2F"'],
                    [/gacha%2FitemBox%2FGachaResult/, 'list', [
                        ['formJ', '#bg_box_gacha_info > form'],
                        ['aJ', 'a[href*="gacha%2FitemBox%2FGachaBoxResetConf"]'],
                        ['aJ', 'a[href*="island%2FIslandTop%2F"'],
                        ['aJ', '#contents > div.btn_main_large.margin_top_10 > a']]],
                    [/^gacha%2FitemBox%2FGachaTop/, 'list', [
                        ['formJ', '#bg_box_gacha_info > form'],
                        //['aJ', 'a[href*="gacha%2FitemBox%2FGachaBoxResetConf"]'],
                        ['aJ', 'a[href*="island%2FIslandTop%2F"']]],
                    [/giftBingo%2FGiftBingoDetail%2F/, 'a', '//a[text()="カムバックビンゴTOPへ"]'],
                    [/giftBingo%2FGiftBingoTop%2F/, 'a', '(//a[contains(text(), "引く")])[last()]'],
                    [/giftBingo%2FGiftBingoHitResult%2F/, 'a', '(//a[contains(text(), "引く")])[last()]'],
                    [/guildbattle%2FGuildbattleSelectAttackType%2F/, 'list', [
                        ['aJ', 'div#btn_magic a'],
                        ['a', '//*[@id="btn_start"]/a'],
                        ['a', '//*[@id="btn_force"]/a'],
                        //['a', '//*[@id="btn_command"]/a'],
                        ['a', '//*[@id="use_bp_gp_recovery"]/a'],
                        ['hold']]],
                    [/guildbattle%2FGuildbattleRecordList%2F/, 'aJ', this.cssmypage],
                    [/guildbattle%2FGuildbattleResult%2F/, 'list', [
                        ['aJ', 'div#btn_magic a'],
                        ['a', '//*[@id="btn_force"]/a'],
                        //['a', '//*[@id="btn_command"]/a'],
                        ['a', '//div[@id="command_list"]//div[@class="btn_sub_medium"]/a'],
                        ['a', '//*[@id="use_bp_gp_recovery"]/a'],
                        ['reload', 1000 * 60],
                        ['hold']]],
                    [/guildbattle%2FGuildbattleSelectTarget%2F/, 'list', [
                        ['minmax', '//*[@id="contents"]/div[@class="section_sub"]/ul/li[', ']/div[1]/div[2]/div/table/tbody/tr[4]/td', ']//a[text()="攻撃する"]'],
                        ['reload', 60 * 1000]]],
                    [/guildbattle%2FGuildbattleTeamAnalytics%2F/, 'a', this.xpathmypage],
                    [/guildbattle%2FGuildbattleTop%2F/, 'aJ', '#contents > div.btn_main_large.margin_top_10 > a'],
                    [/hugeRaidboss%2FHugeRaidbossEventTop%2F/, 'a', '//a[text()="巨龍と戦う"]'],
                    [/info%2FInformation%2F%3Ffile%3DInfoHolyWar/, 'a', '//a[text()="探索へ"]'],
                    [/island%2FIslandBossBattleFlash%2F/, 'flash', "//*[@id=\"container\"]", 161, 293],
                    [/island%2FIslandBossBattleResult%2F/, 'list', [
                        ['a', '//a[img[contains(@src, "casino_on.png")]]'],
                        ['a', '//a[img[@alt="エクストラステージを探索"]]'],
                        ['a', '//a[img[@alt="イベントクエストを探索"]]']]],
                    [/island%2FIslandBossAppear%2F/, 'a', '//a[text()="ボスと戦う"]'],
                    [/island%2FCasinoResult%2F/, 'list', [
                        ['form', '//div[div[text()="プラチナスロット"]]//form'],
                        ['form', '//div[div[text()="もう1回チャレンジ！"]]//form'],
                        ['a', '//a[text()="シルバースロット"]'],
                        ['a', '//a[text()="カジノTOPへ"]'],
                        ['hold']]],
                    [/island%2FCasinoTop%2F/, 'list', [
                        ['form', '//div[div[text()="プラチナスロット"]]//form'],
                        ['form', '//div[div[text()="スロットを回して豪華景品をGET！"]]//form'],
                        ['a', '//a[text()="シルバースロット"]'],
                        ['a', '//*[@id="global_menu"]/ul/li[4]/div[4]/a']]], //giftbox
                    //['hold']]],
                    [/island%2FIslandRaidbossAssistList%2F/, 'list', [
                        ['a', '//ul/li[div[1]/span/span[@class="icon_new"]]//a[text()="助けに行く"]'],
                        ['aJ', this.cssmypage]]],
                    [/island%2FIslandRaidbossBattleResult%2F/, 'list', [
                        ['a', '//a[img[@alt="エクストラステージを探索"]]'],
                        ['a', '//a[img[@alt="イベントクエストを探索"]]']]],
                    [/island%2FIslandRaidbossHelpResult%2F/, 'a', '//*[@id="contents"]/div/a[img]'],
                    [/island%2FIslandRaidbossTop%2F/, 'list', [
                        ['form', '//*[@id="contents"]/form'],
                        ['a', '//*[@id="raid_help"]/a'],
                        ['a', '//a[text()="イベントレイドボス応援一覧に戻る"]'],
                        ['funcR', function () {
                            var magic = $('div#summon_btn a').clickJ();
                            if (magic.length === 0) {
                                return false;
                            }
                            return $('#summon_popup a').filter(':contains("召喚する")').clickJ(2000).length > 0;
                        }],
                        ['a', '//*[@id="attack_btn"]/div/a']]],
                    [/island%2FIslandTop%2F/, 'list', [
                        ['funcR', function () {
                            return $('div.medal_num > span > span.number_island_gold_2_0').length === 0
                                && $('a.link_casino').clickJ().length > 0;
                        }],
                        //['a', '//a[img[contains(@src, "casino_on.png")]]'],
                        ['a', '//a[img[@alt="エクストラステージを探索"]]'],
                        ['aJ', 'a.link_quest']]],
                    [/island%2FMissionResult%2F/, 'list', [
                        ['a', '//a[img[@alt="エクストラステージを探索"]]'],
                        ['a', '//a[img[@alt="イベントクエストを探索"]]'],
                        ['a', '//a[text()="使用する"]']]],
                    [/^mypage%2FIndex%2F/, 'list', [
                        ['aJ', '#header > a:not(:contains("まで"))'],
                        ['aJ', 'a:has(span#battle_name)'], //succ = succ || clickA('//a[span[@id="battle_name"]]');
                        ['aJ', '#boss_appear_btn:has(span) > div > a'], //succ = succ || clickA("//*[@id=\"boss_appear_btn\" and span]/div/a");
                        ['funcR', function () {
                            //var bp = getXPATH("//*[@id=\"gauge_bp\"]/div[1]").dataset.value;
                            var bp = $('#gauge_bp > div:nth-child(1)')[0].dataset.value;
                            GM_log(bp);
                            if (bp > 20) {
                                return $('a[href*="battleTower%2FBattleTowerTop%"]').clickJ().length > 0; //clickA('//a[contains(@href, "battleTower%2FBattleTowerTop%")]');
                            }
                            return false;
                        }],
                        ['aJ', 'a:contains("振り分けポイントがあります")'],
                        ['aJ', 'a:contains("バトル結果がでています")'],
                        ['aJ', 'a:contains("ストーリーモードを進められます")'],
                        ['aJ', '#button > a[href*="storyex%2FStoryBackNumberIndex"]'],
                        ['aJ', 'a:contains("戦友上限が増えました")'],
                        ['aJ', 'a:contains("戦友候補が見つかりました")'],
                        ['aJ', 'a:contains("完全討伐報酬が受け取れます")'],
                        ['aJ', 'a:contains("ビンゴチケットが届いています")'],
                        ['aJ', 'a:contains("を討伐してくれました")'],
                        ['funcR', () => {
                            if (GM_getValue("__ava_no_gift", 0) + this.no_gift_delay * 1000 < Date.now()) {
                                return $('a:contains("贈り物が届いています")').clickJ().length > 0;
                            }
                            return false;
                        }],
                        ["func", function () {
                            var ap = getXPATH("//*[@id=\"gauge_ap\"]/div[1]").dataset.value;

                            if (ap > 10) {
                                return  $('a[href*="summonHunt%2FSummonHuntTop"]').clickJ().length > 0
                                    || $('#index > div > a[href*="unitBattle%2FUnitBattleTop"]').clickJ().length > 0
                                    || $('#index > div > a[href*="island%2FIslandTop"]').clickJ().length > 0
                                    //|| clickA('//a[contains(@href, "TowerRaidTop")]');
                                    || clickA("//*[@id=\"quest_btn\"]/a");
                            }
                        }]]],
                    [/mypage%2FLoginBonusResult%2F/, 'a', '//a[text()="贈り物BOXへ"]'],
                    [/mypage%2FLoginBonusSpecial%2F/, 'aJ', 'a[href*="prizeReceive%2FPrizeReceiveTop"]'],
                    [/mission%2FRegionList%2F/, "a", "//div[@class='section_main']/div[2]/div[2]/div/a"], //*[@id="contents"]/div[3]/div[2]/div[2]/div/a
                    [/mission%2FMissionActionLot%2F/, "flash", "//*[@id=\"container\"]"],
                    [/mission%2FBossAppear%2F/, "a", "//*[@id=\"contents\"]/div[2]/a"],
                    [/mission%2FBossBattleFlash%2F/, "flash", "//*[@id=\"container\"]", 161, 293],
                    [/mission%2FMissionResult%2F/, 'list', [
                        ['aJ', '#towerraid_announce > div > div:nth-child(2) > a'], //'//*[@id="#towerraid_announce"]/div/div[2]/a');
                        ['aJ', '#contents > div.btn_main_large.margin_top_10 > a'], //succ = succ || clickA("//*[@id=\"contents\"]/div[@class='btn_main_large margin_top_10']/a");//*[@id="contents"]/div[5]/a //*[@id="contents"]/div[5]/a
                        ['aJ', 'a:contains("レイドボス出現中")'], //succ = succ || clickA('//a[text()="レイドボス出現中"]');
                        ['aJ', 'a:contains("さらにクエストする")'], //succ = succ || clickA('//a[text()="さらにクエストする"]');
                        ['aJ', 'a:contains("次のエリアへ")'], //('//a[text()="次のエリアへ"]');
                        ['aJ', this.cssmypage]]], //(this.xpathmypage);]]],
                    [/mission%2FBossBattleResult%2F/, 'aJ', 'a:contains("次のエリアへ進む"):first()'],
                    [/mission%2FMissionError%2F/, 'list', [
                        ['funcR', function () {
                            if (document.referrer.match(/island%2F/)) {
                                return $('a:contains("使用する")').clickJ().length > 0;
                            }
                        }],
                        ['aJ', this.cssmypage]]], //"a",  "//*[@id=\"global_menu\"]/ul/li[1]/div[5]/a"],
                    [/mission%2FMissionListSwf%2F/, "link", "http://sp.pf.mbga.jp/12010455?url=http%3A%2F%2Fmguildbattle.croozsocial.jp%2Fmypage%2FIndex%2F"],
                    [/multiguildbattle%2FMultiGuildbattleResult%2F/, 'a', '//*[@id="btn_force"]/a'],
                    [/multiguildbattle%2FMultiGuildbattleSelectAttackType%2F/, 'list', [
                        ['a', '//*[@id="btn_start"]/a'],
                        ['a', '//*[@id="btn_force"]/a']]],
                    [/multiguildbattle%2FMultiGuildbattleSelectTarget%2F/, 'a', '//div[div[text()="ターゲット選択"]]/ul/li[1]//a'],
                    [/multiguildbattle%2FMultiGuildbattleTop%2F/, 'a', this.xpathmypage],
                    [/prizeReceive%2FPrizeReceiveTop%2F/, 'list', [
                        ['formJ', '#contents > form:first'], //succ = succ || clickForm("//*[@id=\"contents\"]/form");
                        ['aJ', '#contents > ul.btn_tabs.margin_top_10 > li > a:not(:contains("(0)"))'], //    succ = succ || clickA('//*[@id="contents"]/ul[@class="btn_tabs margin_top_10"]/li/a[not(contains(text(), "(0)"))]');
                        ['funcR', function () {
                            GM_log($('div.txt_block_center:contains("所持武具が上限数に達しています")'));
                            if ($('div.txt_block_center:contains("所持武具が上限数に達しています")').length > 0) {
                                GM_setValue("__ava_no_gift", Date.now());
                            }
                        }],
                        ['aJ', this.cssmypage]]],
                    [/raidboss%2FRaidbossCollectionDetail%2F/, "a", '//a[text()="受け取る"]'],
                    [/raidboss%2FRaidbossTop%2F/, 'list', [
                        //['hold'],
                        ['form', '//*[@id="contents"]/form'],
                        ['a', '//a[contains(@href, "raidboss%2FRaidbossAssistList")]'], //text()="レイドボス応援一覧に戻る"]'],
                        ['aJ', '#summon_btn > div > a'],
                        ['a', "//*[@id=\"raid_help\"]/a"],
                        ['a', "//*[@id=\"attack_btn\"]/div/a"],
                        ['aJV', '#bp_recovery_popup > a:contains("使用する")'],
                        ['aJ', 'a[href*="%2FMissionActionLot"]'],
                        ['hold']]],
                    [/raidboss%2FRaidbossHelpResult%2F/, "a", "//*[@id=\"contents\"]/div[2]/a"],
                    [/raidboss%2FRaidbossAssistList%2F/, 'list', [
                        ['aJ', 'div.section_main > ul > li:has(div:nth-child(1) > span > span.icon_new) > div:nth-child(3) > div > div > div:nth-child(2) > div > a'], // //div[@class='section_main']/ul/li[div[1]/span/span[@class=\"icon_new\"]]/div[3]/div/div/div[2]/div/a
                        ['aJ', this.cssmypage]]],
                    [/raidboss%2FRaidbossBattleResult%2F/, 'list', [
                        ['funcR', function () {
                            if (document.referrer.match(/raidboss%2FRaidbossBattleResultList%2F/)) {
                                window.location.href = document.referrer;
                                return true;
                            }
                        }],
                        ['aJ', 'div.btn_main_large > a'],
                        ['aJ', 'a:contains("応援一覧へ戻る")'],
                        ['aJ', this.cssmypage]]],
                    [/raidboss%2FRaidbossBattleResultList%2F/, 'a', '//*[@id="contents"]/div[1]/ul/li/a'],
                    [/shop%2FItemUseEnd%/, 'a', '//a[contains(@href, "MissionActionLot")]'],
                    [/story(ex)?%2FDoStoryEpisodeSwf2%2F/, 'flashJT', '#container > canvas'],
                    [/story(ex)?%2FDoStoryEpisodeSwfClear%2F/, 'flashJT', '#container > canvas'],
                    [/story(ex)?%2FDoStoryEpisodeSwfEd%2F/, "flash", "//*[@id=\"container\"]"],
                    [/story(ex)?%2FDoStoryEpisodeSwfOp%2F/, "flash", "//*[@id=\"container\"]"],
                    [/story(ex)?%2FMissionResult%2F/, 'func', function () {
                        var ap_status = getXPATH('//div[div[contains(text(),"のステータス")]]/div[2]/table/tbody/tr[2]/td[1]'),
                            ap_c = 0,
                            ap_full = 1,
                            res,
                            text;
                        if (ap_status) {
                            res = ap_status.innerText.match(/([0-9]+)\/([0-9]+)/);
                            if (res) {
                                ap_c = parseInt(res[1], 10);
                                ap_full = parseInt(res[2], 10);
                            }
                        }
                        if (ap_c > ap_full * 0.5) {
                            clickA(this.xpathquest);
                            return;
                        }
                        if (!clickA("//*[@id=\"contents\"]/div[2]/a")) {
                            text = getXPATH("//*[@id=\"progress_area\"]/div");
                            if (text && text.innerText.match(/レベル[\S]*上がった/)) {
                                clickA(this.xpathquest);
                            }
                        }
                    }],
                    [/story(ex)?%2FStoryAreaResult%2F/, "a", "//*[@id=\"contents\"]/div[3]/a"],
                    [/story(ex)?%2FStoryBackNumberIndex/, 'aJ', '#story_backnum_bg > div > div > div > div.padding_x_10 > a'],
                    [/story(ex)?%2FStoryBossAppear%2F/, "a", "//*[@id=\"contents\"]/div[3]/a"],
                    [/story(ex)?%2FStoryBossBattleFlash%2F/, "flash", "//*[@id=\"container\"]", 160, 290],
                    [/story(ex)?%2FStoryMain%2F/, "a", "//*[@id=\"contents\"]/div[3]/a"],
                    [/story(ex)?%2FStoryTop%2F/, 'list', [
                        //['dbg'],
                        ['aJ', '#main_view > div > div > div.floor_base.on.btn_base > a'],
                        ['flashJT', 'div.area_list.portrait div.floor_base.on.btn_base a div'],
                        ["flash", "//*[@id=\"main_view\"]//div[contains(@class, 'on')]/a/div"]]],
                    [/subjugation%2FMissionResult%2F/, 'a', '//a[text()="討伐戦TOPへ"]'],
                    [/subjugation%2FSubjugationSelectHelpTarget/, 'list', [
                        ['a', '//a[text()="救助する"]'],
                        ['a', '//a[text()="討伐戦TOPへ"]']]],
                    [/subjugation%2FSubjugationSelectAttackType%2F/, 'list', [
                        ['a', '//div[@class="btn_base goto_war"]/a'],
                        ['a', '//div[@class="btn_base help_on"]/a'],
                        ['a', '//div[@class="btn_base attack_normal_on"]/a'],
                        ['a', '//div[@class="btn_base attack_cannon_on"]/a'],
                        ['a', '//*[@id="use_bp_gp_recovery"]/a'],
                        ['a', '//div[@class="btn_base do_mission_on"]/a'],
                        ['a', '//div[@class="btn_base recover_swoon"]/a'],
                        ['a', '//a[contains(@href, "subjugation%2FMissionActionLot")]'],
                        ['a', '//a[text()="討伐戦報酬を受け取る"]'],
                        ['hold']]],
                    [/summonHunt%2FMissionResult%2F/, 'list', [
                        ['aJ', 'a[href*="summonHunt%2FMissionActionLot"]'],
                        ['aJ', 'a[href*="summonHunt%2FSummonHuntTop"]'],
                        ['hold']]],
                    [/summonHunt%2FSummonHuntTop%2F/, 'aJ', 'a[href*="summonHunt%2FMissionActionLot"]'],

                    [/summonHunt%2FSummonCaptureTop%2F/, 'list', [
                        ['aJ', 'a[href*="summonHunt%2FDoSummonCaptureResult%2F"]']]],
                    [/summonHunt%2FSummonCaptureResult%2F/, 'list', [
                        ['aJ', 'a[href*="summonHunt%2FMissionActionLot"]'],
                        ['aJ', 'a[href*="summonHunt%2FSummonHuntTop%2F"]']]],
                    [/^summonHunt%2FSummonHuntHowToPlay%2F%3FfirstAccessFlg%3D1/, 'aJ' ,'#contents a[href*="deck%2FDoDeckEditNumChangeAll%2F"]'],
                    [/summonHunt%2FSummonHuntRaidbossAssistList%2F/, 'aJ', 'li:has(span[class="icon_new"]) a'], //'//ul/li[div[1]/span/span[@class="icon_new"]]//a[text()="助けに行く"]'],
                    [/summonHunt%2FRaidbossBattleResult%2F/, 'aJ', 'a[href*="summonHunt%2FMissionActionLot"]'],
                    [/summonHunt%2FRaidbossTop/, 'list', [
                        ['formJ', '#contents form:has(#assist_btn)'],
                        ['aJ', 'a[href*="summonHunt%2FDoRequestRaidbossHelp%2F"]'],
                        ['aJ', 'a[href*="summonHunt%2FDoRaidbossBattleResult%2F"]'],
                        ['aJ', 'a[href*="summonHunt%2FMissionActionLot%2F"]']]],
                    [/summonHunt%2FRaidbossHelpResult%2F/, 'aJ', 'a[href*="summonHunt%2FMissionActionLot"]'],
                    [/subjugation%2FSubjugationTeamAnalytics%2F/, 'a', '//a[text()="討伐戦報酬を受け取る"]'],
                    [/towerRaid%2FTowerRaidRaidbossBattleResult%2F/, 'a', '//a[text()="再びボーグを探しに行く"]'],
                    [/towerRaid%2FTowerRaidTop%2F/, 'list', [
                        ['form', '//*[@id="contents"]/form'],
                        ['a', '//*[@id="contents"]/div[3]/ul/li[1]/div[1]/a']]],
                    [/towerRaid%2FTowerRaidRaidbossTop%2F/, 'list', [
                        ['form', '//*[@id="contents"]//form[div[@id="high_attack_btn"]]'],
                        ['a', '//*[@id="bp_recovery_popup"]//a[text()="使用する"]'],
                        ['hold']]],
                    [/towerRaid%2FMissionResult/, 'list', [
                        ['a', '//*[@id="contents"]/div[contains(@class, "section_main") and .//div[@id="towerraid_remainder"]]/div[2]/div/a'],
                        ['hold']]],
                    [/unitBattle%2FMissionResult/, 'list', [
                        ['aJ', 'a[href*="unitBattle%2FUnitBattleRaidbossTop"]'],
                        ['aJ', 'a[href*="unitBattle%2FMissionActionLot"]'],
                        ['a', '//a[text()="使用する"]']]],
                    [/unitBattle%2FRaidbossBattleResult/, 'list', [
                        ['aJ', 'a[href*="unitBattle%2FUnitBattleRaidbossTop"]']]],
                    [/unitBattle%2FRaidbossTop/, 'list', [
                        ['aJ', 'div.ub_inBattleButtons > div > div > a[href*="unitBattle%2FDoRaidbossBattleResult"]:last()'],
                        ['aJ', 'a[href*="unitBattle%2FMissionActionLot"]']]],
                    [/unitBattle%2FUnitBattleTop/, 'list', [
                        ['aJ', 'a[href*="unitBattle%2FMissionActionLot"]']]],
                    [/unitBattle%2FUnitBattleRaidbossTop/, 'list', [
                        ['aJ', 'a[href*="unitBattle%2FRaidbossTop"]'],
                        ['aJ', 'a[href*="unitBattle%2FMissionActionLot"]']]],
                    [/worldRaidboss%2FRaidbossTop/, 'list', [
                        ['aJ', 'a[href*="worldRaidboss%2FDoRaidbossBattleResult"]'],
                        ['aJ', 'a[href*="mission%2FMissionActionLot"]']]],
                    [/Swf%2F/, "flashJT", '#container > canvas'],
                    [/SwfOp%2F/, 'flash', '//*[@id="container"]'],
                    [/xxxxxxxxxxxxxxxxx/]
                ];
            }
        },
        "12011562" : { //toaru
            xpathmypage : '//*[@id="top_btn"]/a',
            selector_mypage : '#top_btn > a',
            get_actions : function () {
                return [
                    [/battleAnimation/, 'flashJT', '#canvas'],
                    [/battle_animation/, 'flashJT', '#canvas', 20, 440],
                    [/cardBook%2Fbonus/, 'aJ', 'a[href*="card_book%2FgetBonus%"]'],
                    [/card_book%2Fbonus/, 'list', [
                        ['aJ', 'a[href*="card_book%2FgetBonus%"]'],
                        ['aJ', this.selector_mypage]]],
                    [/Da2%2FeventTop/, 'aJ', 'a[href*="Da2%2Findex"]'],
                    [/[dD]a2%2Findex/, 'func', function () {
                        setInterval(function () {
                            //debugger;
                            return $('input#do_quest[disabled!="disabled"]').clickJ(0).length > 0
                                || $('button#card_ok').clickJ(0).length > 0
                                || $('input#go_next').clickJ(0).length > 0
                                || $('button#friend_order_button').clickJ(0).length > 0;
                        }, 1000);
                    }],
                    [/da2%2FloseRare/, 'aJ', 'a[href*="da2%2Findex"]'],
                    //[/da2%2FnoAction/, 'aJ', 'a[href*="da2%2FuseItem"]'],
                    [/da2%2FrAreaResult/, 'aJ', 'a[href*="da2%2Findex"]'],
                    [/da2%2FrArea\b/, 'list', [
                        ['aJ', 'a[href*="da2%2FrArea%2F4"]'],
                        ['aJ', 'a[href*="da2%2FrArea%2F' + Math.floor(Math.random() * 3 + 1) + '"]']]],
                    [/da2%2FrSkill/, 'aJ', 'a[href*="da2%2FrSkill%2Fdefeat"]'],
                    [/*da2%2F*/ / useItemComplete /, 'aJ', '#bg > section > article > div > div > a'],
                    [/da2%2FuseItem\b/, 'aJ', 'a[href*="da2%2FuseItem"]'],
                    [/friend%2FacceptList/, 'aJ', 'a[href*="friend%2FacceptOrderConfirm"]'],
                    [/friend%2FacceptOrderConfirm/, 'aJ', 'input[name="yes"]'],
                    [/friend%2FcompleteFriendOrder/, 'a', this.xpathmypage],
                    [/friend%2FsearchFriends/, 'formJ', 'form'],

                    //fusion
                    [/fusion%2Fconfirm%/, 'aJ', 'a[href*="fusion%2Ffusion%"]'],
                    [/fusion%2Fevolution_confirm%/, 'aJ', 'a[href*="fusion%2Fevolution%"]'],
                    [/fusion%2Fevolution_result%/, 'aJ', "a[href*='fusion%2Fevolution_select']"],
                    [/fusion%2Fevolution%/, 'flashJT', "#canvas"],
                    [/fusion%2Ffusion%/, 'flashJT', '#canvas'],
                    [/fusion%2Flimit_result%/, 'aJ', "a[href*='fusion%2Flimit_select']"],
                    [/fusion%2Flimit%/, 'flashJT', "#canvas"],
                    [/item%2FpresentList/, 'formJ', 'form'],
                    [/judge%2ForderHelpSelect/, 'aJ', '#bg > section > ul > li > dl > dd:nth-child(3) > div > div > a'],
                    [/^login%2Fgacha%2Fdx/, 'flashJT', '#canvas'],
                    [/login%2Fperiod/, 'flashJT', '#canvas'],
                    [/mypage%2FsetParameter/, 'func', function () {
                        $("#auto_select").clickJ();
                        $("form").submitJ(2000);
                        $("a[href*='friend%2FsearchFriends%2Frand']").clickJ(3000);
                    }],
                    [/mypage/, 'list', [
                        //['dbg'],
                        ['aJ', 'div.contents_info a[href*="pick%2Ftop%2Ffree"]'], // free gacha
                        //['dbg'],
                        ['aJ', 'section.eventArea > article a[href*="mypage%2FsetParameter"]'], // status point
                        ['aJ', $('.present_number > a').filter(function () {
                            return this.innerHTML !== '0';
                        })], // present
                        ['aJ', 'div.contents_info a[href*="cardBook%2Fbonus"]'], // card book
                        ['aJ', 'div.contents_info a[href*="friend%2FacceptList"]'],
                        //['aJ', 'div.contents_info a[href*="shortStory%2Findex"]'], // story
                        //['aJ', 'div.contents_info a[href*="mission%2Fbeginner"]'], // story
                        ['aJ', 'div.contents_info a[href*="pick%2Ftop%2Fpremium"]'], // story
                        //['aJ', 'div.contents_info a[href*="quiz%2Findex"]'], // story
                        ['func', function () {
                            var res, hp, ap, apall;
                            res = $('div#graph_hp div.graph_text_detail').text().match(/([0-9]*)\s*\/\s*[0-9]*/);
                            hp = res ? +res[1] : 0;
                            res = $('div#graph_atk div.graph_text_detail').text().match(/([0-9]*)\s*\/\s*([0-9]*)/);
                            ap = res ? +res[1] : 0;
                            apall = res ? +res[2] : 0;
                            GM_log("hp = " + hp);
                            GM_log("ap = " + ap + "/" + apall);
                            if (hp > 10) {
                                return $('#bg > section.eventArea > div.mypage_banner > a[href*="%2FeventTop"]').clickJ().length > 0 || $('a[href*="quest"]').clickJ().length > 0;
                            }
                            if (ap === apall) {
                                return $('a[href*="playerBattle%2Fbattle"]').clickJ() > 0;
                            }
                        }]]],

                    [/Partner%2Findex/, 'list', [
                        ['aJ', '#partnerCommand > li:nth-child(' + (Math.floor(Math.random() * 4) + 1) + ') > div > div > a']]],
                    [/partner%2Findex/, 'list', [
                        ['aJ', '#top_btn > a']]],

                    //pick
                    [/pick%2Fresult%2Ffree/, 'list', [
                        //['aJ', $('a[href*="pick%2Frun%2Ffree%2F"]').filter(':last')],
                        ['aJ', this.selector_mypage]]], //['aJ', '#bg > article > section:nth-child(1) > article > div > div > a']
                    [/pick%2Frun/, 'flashJT', '#canvas', 40, 410],
                    [/pick%2Ftop%2Ffree/, 'list', [
                        //['hold'],
                        ['aJ', 'a[href*="pick%2Frun%2Ffree%2Fdaily%3F"]'],
                        ['aJ', 'a[href*="pick%2Frun%2Ffree%2Flunch%3F"]'],
                        ['flashJT', 'canvas']]],
                    [/pick%2F(top|result)%2Fpremium2/, 'list', [
                        ['aJ', 'a[href*="pick%2Frun%2Fpremium2%2Fmedal"]'],
                        ['aJ', this.selector_mypage]]],
                    [/pick%2F[a-zA-Z]*%2Fpremium/, 'list', [
                        //['aJ', 'a[href*="pick%2Frun%2Fpremium%2F"]'],
                        // ['hold'],
                        ['flashJ', '#container']]],

                    //player_battle
                    [/playerBattle%2Fbattle\b/, 'aJ', 'a[href*="player_battle%2Fbattle_confirm"]'],
                    [/player_battle%2Fbattle_confirm%/, 'aJ', 'a[href*="battle_animation"]'],
                    [/player_battle%2Fbattle_result%/, 'aJ', 'a[href*="mypage"]'],
                    [/player_battle%2Fcomplete%/, 'flashJ', "#canvas"],
                    [/present%2Fconfirm%2F[01]%2F/, 'list', [
                        ['formJ', '#bg > section > article > div > form'],
                        ['aJ', '#top_btn > a']]],
                    [/present%2Findex/, 'list', [
                        ['aJ', '#bg > section > article > form > div > div > input[type="submit"]'],
                        //['sth', '//*[@id="bg"]/section/article/form/div/div/input'],
                        ['aJ', '#bg > section > ul > li:nth-child(2) > a:not(.selected)'],
                        ['aJ', '#top_btn > a']]],

                    //quest
                    [/quest%2FbossSuccess/, 'aJ', 'a[href*="scenario%2Fquest"]'],
                    [/*quest%2F*/ /clearAreaFlash/, 'flashJT', '#canvas'],
                    [/quest%2Findex/, 'func', function () {
                        setInterval(function () {
                            //debugger;
                            return $('input#do_quest[disabled!="disabled"]').clickJ(0).length > 0
                                || $('button#card_ok').clickJ(0).length > 0
                                || $('input#go_next').clickJ(0).length > 0
                                || $('button#friend_order_button').clickJ(0);
                        }, 1000);
                    }],
                    [/quest%2Fed/, 'list', [
                        ['aJ', 'a[href*="quest%2Findex"]'],
                        ['flashJT', document]]],
                    [/*quest%2F*/ /levelUp/, 'flashJT', '#canvas'],
                    [/*quest%2F*/ /noAction/, 'list', [
                        ['aJ', 'a[href*="%2FuseItem"]'],
                        ['aJ', '#top_btn > a']]],
                    [/quest%2FrSkill/, 'list', [
                        ['aJ', 'a[href*="quest%2FrSkill%2Fdefeat"]'],
                        ['aJ', 'a[href*="quest%2FrSkill%2Fbattle"]']]],
                    [/quest%2FshowBoss/, 'list', [
                        ['aJ', 'a[href*="battleAnimation"]'],
                        ['flashJT', document]]],

                    [/quest%2Ftop/, 'list', [
                        ['aJ', 'a[href*="quest%2FshowBoss"]'],
                        ['aJ', 'a[href*="quest%2Findex"]']]],
                    [/quest%2Ftreasure/, 'list', [
                        ['aJ', 'a[href*="quest%2Fevent"]'],
                        ['flashJT', document]]],
                    [/quest%2FuseItem\b/, 'aJ', 'a[href*="quest%2FuseItem"]'],
                    [/^quest%2FuseItemComplete/, 'aJ', 'a[href*="quest%2Findex"]'],
                    [/quest%2FwinRare/, 'aJ', 'a[href*="quest%2Findex"]'],
                    [/quest_story%2Fquest%2Fop/, 'flashJT', document],
                    [/^QuestStory%2Fquest_s%2/, 'flashJT', '#cv0'],
                    [/scenario%2Fquest/, 'flashJT', document],
                    [/scenario2%2Fs%2Fmorinaga_end/, 'flashJT', document],
                    [/scenario3%2F/, 'flashJT', '#skip'],
                    [/shortStory%2Fstory/, 'list', [
                        ['flashJT', document]]],

                    [/(soge|FrSkill)Flash/, 'flashJT', '#canvas'],
                    [/%2FuseItem%2F/, 'aJ', 'a[href*="%2FuseItem%2F"]'],
                    //wd2014%2FuseItem%2F1%2F1%2F6%2F3%2Fconfirm
                    //event Wd2014
                    [/Wd2014%2FeventTop/, 'aJ', 'a[href*="Wd2014%2Findex%2F' + Math.floor((Math.random() * 2 + 1)) + '"]'],
                    [/Wd2014%2FwinRare/, 'list', [
                        ['aJ', 'a[href*="%2Fdefeat%2F"]'],
                        ['aJ', 'a[href*="%2Fbattle%2F"]']]],
                    [/Wd2014%2FrSkill/, 'list', [
                        ['aJ', '#bg > div.bg_event2 > div.bg_detail > div:nth-child(3) > ul > li:nth-child(1) > a'],
                        ['aJ', '#bg > div.bg_event2 > div.bg_detail > div:nth-child(3) > ul > li:nth-child(2) > a']]],
                    [/Xmas2%2FeventTop/, 'aJ', 'a[href*="xmas2%2Fquest"]'],
                    [/[xX]mas2%2Fquest/, 'func', function () {
                        setInterval(function () {
                            GM_log($('#but4.on').length);
                            if ($('#but4.on').clickJ().length === 0) {
                                $('#but3.on').clickJ();
                            }
                        }, 2000);
                    }],
                    [/%2Fbox_flash%2F/, 'flashJT', '#canvas'],
                    [/%2Fbox_reset_confirm/, 'aJ', '#bg > div.window > div.pt5 > form'],
                    [/%2Fbox_reset_result/, 'aJ', '#bg > ul > li > a[href*="eventTop"]'],
                    [/%2Fbox_result%2F/, 'list', [
                        ['aJ', '#bg > section > div.btn_blue > a']]],
                    [/%2Fbox_select/, 'list', [
                        ['aJ', '#bg > section a[href*="box_reset_confirm"]'],
                        ['aJ', 'a[href*="%2Fbox%2F"]:last()'],
                        ['aJ', this.selector_mypage]]],
                    [/%2FclearArea%/, 'aJ', 'div.eventStageResultButton > div > a'],
                    [/%2FeventTop/, 'list', [
                        ['funcR', function () {
                            var res = $('#bg > section.py5 > article:visible() dd').text().match(/([0-9]+)/);
                            if (res === undefined) {
                                return false;
                            }
                            res = +res[1];
                            if (res > 10) {
                                return $('div.btn_blue > a[href*="box_select"]').clickJ().length > 0;
                            }
                            return false;
                        }],
                        //['aJ', 'div.btn_blue > a[href*="box_select"]'],
                        ['aJ', 'div.questAction a[href*="%2ForderHelpSelect"]'],
                        ['aJ', 'div.questAction a[href*="%2Fraid%2F"]:last'],
                        ['aJ', 'div.questAction a:regex(href, %2F[a-zA-Z]+%2Findex%2F1)']]],
                    [/%2Findex%2F/, 'list', [
                        ['aJ', 'div.bossEncountNow > a'],
                        ['func', function () {
                            setInterval(function () {
                                //debugger;
                                return $('input#do_quest[disabled!="disabled"]').clickJ(0).length > 0
                                    || $('button#card_ok').clickJ(0).length > 0
                                    || $('input#go_next').clickJ(0).length > 0
                                    || $('button#friend_order_button:visible()').clickJ(0).length > 0
                                    || $('#bg > div.footer_menu > ul > li:nth-child(1) > a').clickJ(0).length > 0;
                            }, 1000);
                        }]]],
                    [/%2FraidBoss%2F/, 'list', [
                        ['flashJT', '#canvas']]],
                    [/%2Fraid%2F/, 'list', [
                        ['aJ', 'a[href*="battle_animation%2F"]:visible():last()'],
                        ['aJ', 'div.btn_blue > a[href*="%2Findex%2F"]'],
                        ['aJ', 'ul.contentLink > li > aa[href*="eventTop"]']]],
                    [/%2Fattack_result/, 'aJ', '#bg > div > div.btn_blue > a'],
                    [/%2FrSkill%2F/, 'aJ', 'a[href*="%2FrSkillProc%2F"]'],
                    [/%2FrSkillResult/, 'aJ', 'a[href*="%2Findex%2F"]'],
                    [/[\s\S]*/, 'hold'],
                    [/xxxxxxxxxxxxxxxxxxx/]
                ];
            }
        },
        "12011538" : {
            xpathmypage : "//header/div[@class='sprite btn_base header_left']/a",
            cssmypage : '#main_container > header > div.sprite.btn_base.header_left > a',
            xpathevent : '//a[contains(@href, "EventTop")]',
            xpatheventnext : '//*[@id="mainCommand_quest"]/a',
            xpathgiftbox : '//a[.//i[@class="sprite_menu3 menu_btn_prize"]]',
            handleBattleResult : function () {
                if (GM_getValue("__mybattle_free") > 0 || GM_getValue("__mybattle_bp") > 0) {
                    clickA("//*[@id=\"main\"]/nav[1]//a");
                } else {
                    clickA(this.xpathmypage);
                }
            },
            handleBattleTower : function () {
                // "//*[@id=\"first_action_box\"]/div[1]/div[3]/a"
                //alert("battletower");
                var free = GM_getValue("__mybattle_free"),
                    bp = 0,
                    n_use_bp = 1,
                    bp_use = getXPATH("//*[@id=\"do_battle_btn\"]/div[2]"),
                    res;
                if (bp_use) {
                    res = bp_use.innerText.match(/BP([0-9])/);
                    if (res) {
                        n_use_bp = res[1];
                    }
                }
                if (n_use_bp > 0) {
                    free = 0;
                } else if (n_use_bp === 0) {
                    if (!free) {
                        free = 1;
                    }
                }
                if (free) {
                    GM_setValue("__mybattle_free", free > 0 ? free - 1 : 0);
                }

                if (getXPATH("//div[@class='sprite gauge_bp bp_gauge3' and not(contains(@style,'display: none'))]")) {
                    bp = 3;
                } else if (getXPATH("//div[@class='sprite gauge_bp bp_gauge2' and not(contains(@style,'display: none'))]")) {
                    bp = 2;
                } else if (getXPATH("//div[@class='sprite gauge_bp bp_gauge1' and not(contains(@style,'display: none'))]")) {
                    bp = 1;
                } else {
                    bp = 0;
                }
                //alert(bp);
                if (free > 0) {
                    GM_setValue("__mybattle_bp", bp);
                } else {
                    GM_setValue("__mybattle_bp", bp - 1);
                }
                //alert(free);
                //alert(bp);
                if (free > 0 || bp > 0) {
                    if (!clickAV("//*[@id=\"first_action_box\"]/div[1]/div[3]/a", "//*[@id=\"first_action_box\"]/div[1]/div[3]/a")) {
                        setInterval(function () {
                            var res_wrapper = getXPATH("//*[@id=\"first_action_box\"]");
                            if (res_wrapper && getComputedStyle(res_wrapper).getPropertyValue("display") !== "none") {
                                clickSth(getXPATH("//*[@id=\"do_battle_btn\"]"), "click");
                            }
                        }, 1000);

                        //setInterval(function(){clickAV("//*[@id=\"stage\"]");}, 5000);
                        clickFlash('//*[@id="stage"]');

                        //setInterval(function(){
                        //    var res_wrapper = getXPATH("//*[@id=\"second_action_box\"]");
                        //    if (res_wrapper && getComputedStyle(res_wrapper) .getPropertyValue("display")!="none"){
                        //        clickA("//*[@id=\"battle_result_btn\"]/a");
                        //    }
                        //}, 1000);
                    }
                } else {
                    clickA(this.xpathmypage);
                }
            },
            handleERBBattle : function () {
                // player battle, BP1 only
                var wait = 2000, bp_need = 1, i, attacked = false, reload;
                setInterval(function () {
                    //debugger;
                    $('div#do_battle_btn').filter(":visible").click();
                    $('div.btn_main_small.bp_select_button').filter(':visible').click();
                }, wait);

                //setInterval(function(){
                //    var res_wrapper = getXPATH("//*[@id=\"second_action_box\"]");
                //    if (res_wrapper && getComputedStyle(res_wrapper) .getPropertyValue("display")!="none"){
                //        var result = getXPATH("//*[@id=\"battle_result_btn\"]/a");
                //        if (result) {clickSth(result, "click");}
                //    }
                //}, 1000);

                setInterval(function () {
                    var ff = getXPATH("//*[@id=\"stage_front\"]");
                    if (ff && getComputedStyle(ff).getPropertyValue("display") !== "none") {
                        clickSth(ff, "click");
                    }
                }, 5000);

                reload = false;
                setInterval(function () {
                    var ele = $('div#do_battle_btn'), recharge = false, ele_s, ok;
                    if (ele.length > 0) {
                        if (ele.filter(':visible').length === 0) {
                            recharge = true;
                        }
                    } else {
                        recharge = $('div.btn_main_off_small.ui_attack1').length > 0;
                    }
                    //alert(ele.length);
                    if (reload === false && recharge === true) { //getXPATH('//*[@id="do_battle_btn" and @style="display:none"]')) {
                        //debugger;
                        //*[@id="bp_recovery"]/div/div[2]
                        ok = getXPATH('//*[@id="bp_recovery"]/div/div[text()="OK"]'); //"//*[@id=\"bp_recovery\"]/div/div[2]");
                        ele_s = getXPATH("//*[@id=\"bp_recovery\"]//ul/li[2]/div/div[contains(@class, 'bp_recovery_btn')]");
                        ele = getXPATH("//*[@id=\"bp_recovery\"]//ul/li[1]/div/div[contains(@class, 'bp_recovery_btn')]");
                        if (ele_s && ele_s.dataset.life > 0) {
                            clickSth(ele_s, "click");
                            setTimeout(function () {
                                clickSth(ok, "click");
                            }, 1000);
                        } else if (ele && ele.dataset.life > 0) {
                            clickSth(ele, "click");
                            setTimeout(function () {
                                clickSth(ok, "click");
                            }, 1000);
                        } else {
                            //clickA(this.xpathgiftbox);
                            //setTimeout(function(){location.reload(true);},  600000);
                            //default reload at msgloop
                            reload = true;
                        }
                    }
                }, 2000);
            },
            eventName : "GiDimension",
            get_actions : function () {
                return [
                    [/apology%2FApologyList%2F/, 'list', [
                        ['formJ', '#main > div:nth-child(1) > ul > li:nth-child(1) > form'],
                        ['aJ', '#main > div.btn_sub_medium.margin_top_20 > a']]],
                    [/arena%2FArenaBattleConf%2F/, 'list', [
                        //['aJV', '#do_battle_btn'],
                        ['aJ', 'a:contains("対戦結果を見る")'],
                        ['aJ', this.cssmypage]]],
                    [/arena%2FArenaBattleResult%2F/, 'aJ', 'a:contains("次の相手")'],
                    [/arena%2FArenaTop/, 'aJ', '#btn_entry > a'],
                    [/battleOlympia%2FBattleConf%2F/, 'a', '//a[contains(text(), "対戦結果を見る")]'],
                    [/battleOlympia%2FBattleResult%2F%/, 'a', '//a[text()="次の相手"]'],
                    [/battleOlympia%2FTargetSelect%2F/, 'minmax', '//*[@id="main"]/section/ul/li[', ']/a/div/div[2]/table/tbody/tr[2]/td', ']/a'],
                    [/battleOlympia%2FTop/, 'list', [
                        ['a', '//div[@class="battle_entry"]/a'],
                        ['GM_setValue', '__ht_bo_over', 1, 3600 * 24]]],
                    [/battleTower%2FBattleConf%2F/, "func", this.handleBattleTower],
                    [/battleTower%2FBattleResult%2F/, "func", this.handleBattleResult],
                    [/battleTower%2FBattleTop/, "func", function () {
                        var free_text = getXPATH("//*[@id=\"btn_entry\"]/a/div"), res, succ;
                        //alert(free_text);
                        if ($('a[href*="battleTower%2FDoEntryChallenge"]').clickJ().length > 0) {
                            return;
                        }
                        if (free_text) {
                            //alert(free_text.innerText);
                            res = free_text.innerText.match(/ [\s\S]*残り([0-9]*)回/);
                            //alert(res[1]);
                            GM_setValue("__mybattle_free", res[1]);
                            clickA("//*[@id=\"btn_entry\"]/a");
                        } else if (GM_getValue("__mybattle_bp") > 0) {
                            succ = false;
                            succ = succ || clickA("//*[@id=\"btn_entry\"]/a");
                            succ = succ || clickA("//*[@id=\"main\"]/div/div[1]/div[3]/div[2]/ul/li[3]/div/a");
                            succ = succ || clickA(this.xpathmypage);
                        } else {
                            clickA(this.xpathmypage);
                        }
                    }],
                    [/battleTower%2FBattleTowerBossConf%2F/, "func", this.handleBattleTower],
                    [/battleTower%2FBattleTowerBossResult%2F/, "func", this.handleBattleResult],
                    [/card%2FBulkCardSell\b/, 'a', this.xpathmypage],
                    [/card%2FBulkCardSellConfirm%2F/, 'form', '//*[@id="main"]/div/form'],
                    [/card%2FBulkCardSellList%2F/, 'a', '//a[text()="Nカードを一括で売却"]'],
                    [/cave%2FAreaSelect/, "func", function () {
                        var l = $('a:contains("選択")'), areaID = Math.floor(Math.random() * l.length);
                        l.eq(areaID).clickJ();
                    }],
                    [/cave%2FCardSelect/, "func", function () {
                        var select_sort = getXPATH("//form/div[2]/div/select");
                        if (select_sort && select_sort.selectedIndex !== 8) {
                            select_sort.selectedIndex = 8;
                            getXPATH("//form").submit();
                        }

                        setInterval(function () {
                            clickA('//li[//td[@class="aura"]]/div[2]/a');
                        }, 2000);
                    }],
                    [/cave%2FIndex/, "a", "//*[@id=\"main_btn_area\"]/a"],
                    [/cave%2FItemSelect/, "form", "//*[@id=\"main\"]/form"],
                    [/cave%2FQuestConfirm/, "a", "//*[@id=\"main\"]/div[3]/a"],
                    [/cave%2FQuestResult%2F/, 'aJ', 'a[href*="cave%2FIndex"]:last()'],
                    [/companion%2FCompanionApprovalList%2F/, "form", "//*[@id=\"wrap_object\"]/div[1]/div/form"],
                    [/CompanionApplicationAccept$/, "form", "//*[@id=\"main\"]/section/div/form"],
                    [/^eventStageRaidBoss%2FEventRule%2F%3FfirstAccess%3D1/, 'aJ', '#main > a'], //'a[href*="event%2FDoSetClickCount"]'],
                    [/^eventStageRaidBoss%2FWishComplyTop/, 'aJ', 'a[href*="eventStageRaidBoss%2FDoMissionExecutionCheck"]'],
                    [/^event[a-zA-Z0-9]*%2FEventTop/, 'list', [
                        //['hold'],
                        ['aJ', 'a[href*="eventAnniversary%2FEventQuestEntryConfirm"]'],
                        ['aJ', 'a[href*="eventAnniversary%2FEventQuestEntryList"]'],
                        ['aJNC', '__ht_myboss_wait', 'a:regex(href, event[a-zA-Z0-9]*%2FRaidBossTop)'],
                        ['funcR', function () {
                            var raid_clear = GM_getValue('__ht_myraid_clear');
                            if (raid_clear + 60 * 1000 > Date.now()) {
                                return $('a[href*="RaidBossAssistList"]').clickJ().length > 0;
                            }
                            return false;
                        }],
                        ['aJ', 'a:regex(href, event[a-zA-Z0-9]*%2FDoMissionExecution)'],
                        ['aJ', 'a:regex(href, event[a-zA-Z0-9]*%2FMissionList)'],
                        ['hold']]],
                    [new RegExp("event" + this.eventName + "%2FMissionList"), 'list', [
                        ['a', '//a[contains(@href, "event' + this.eventName + '%2FDoMissionExecutionCheck")]'],
                        ['hold']]],
                    ["event[a-zA-Z0-9]*%2FMissionResult%2F", 'list', [
                        //['dbg'],
                        //['aNC', '__ht_myboss_wait', '//a[contains(@href, "event' + this.eventName + '%2FRaidBossTop")]'],
                        //['hold'],
                        ['aJ', 'a[href*="%2FDoGetMissionReward%2F"]'],
                        ['aJ', 'a[href*="eventCapture2%2FCaptureBossTop%2F"]'],
                        ['aJ', 'a[href*="%2FDoMissionExecutionCheck%3"]:contains("使う")'],
                        ['aJ', 'a[href*="%2FRaidBossTop"]'],
                        ['funcR', function () {
                            var raid_clear = GM_getValue('__ht_myraid_clear');
                            if (raid_clear + 60 * 1000 > Date.now()) {
                                return $('a[href*="RaidBossAssistList"]').clickJ().length > 0;
                            }
                            return false;
                        }],
                        ['aJ', 'a[href*="%2FDoMissionExecution"]'],
                        ['aJ', 'a:regex(href, event[a-zA-Z0-9]*%2FMissionList)'],
                        //['aJ', '#world_select_wrap > div.inner > div > div.door_1 > a'],
                        ['func', function () {alert("need invervene");}],
                        ['hold']]],
                    ["event[a-zA-Z0-9]*%2FRaidBossBattleResult", 'list', [
                        ['aJ', 'a:regex(href, event[a-zA-Z0-9]*%2FDoMissionExecution)'],
                        ['hold']]],
                    [/eventGiDimension%2FEventQuestResult%2F/, 'aJ', 'a[href*="%2Fmission%2FMissionList"]:last()'],
                    [/eventQuestRaidBoss%2FEventQuestResult%/, 'aJ', 'a[href*="FeventQuestRaidBoss%2FDoEventQuestExecution%2F"]'],
                    [/eventQuestRaidBoss%2FEventQuestRaidBossTop/, 'aJ', 'a[href*="eventQuestRaidBoss%2FDoEventQuestRaidBossBattleResult%"]'],
                    [/eventQuestRaidBoss%2FEventQuestRaidBossBattleResult%/, 'aJ', 'a[href*="FeventQuestRaidBoss%2FDoEventQuestExecution%2F"]'],
                    [/eventStageRaidBoss%2FRaidBossBattleLose/, 'a', '//a[contains(@href,"eventStageRaidBoss%2FDoMissionExecutionCheck")]'],

                    //[/eventCollection%2FRaidBossBattleResult\b/, 'list', [
                    //    ['a', '//a[contains(text(), "撃破者にあいさつする")]'],
                    //    ['a', '//p[@class="block_flex btn_base radius"]/a']]],
                    [/eventCollection%2FEventTop/, 'list', [
                        ['funcR', function () {
                            var raid_clear = GM_getValue('__ht_myraid_clear');
                            if (raid_clear + 60 * 1000 > Date.now()) {
                                return $('a[href*="RaidBossAssistList"]').clickJ().length > 0;
                            }
                            return false;
                        }],
                        ['a', '//a[contains(@href,"eventCollection%2FDoMissionExecutionCheck")]'],
                        ['hold']]], //@class="block_flex btn_base radius"]/a'],
                    [/eventCollection%2FMissionResult%2F/, 'list', [
                        ['aNC', '__ht_myboss_wait', '//a[contains(@href, "eventCollection%2FRaidBossTop")]'],
                        ['a', '//a[contains(@href,"eventCollection%2FDoMissionExecutionCheck")]'],
                        ['hold']]],
                    [/eventCollection%2FRaidBossBattleResult/, 'list', [
                        ['a', '//a[contains(@href,"eventCollection%2FDoMissionExecutionCheck")]'],
                        ['hold']]],
                    [/eventStoryMission%2FEventBattleConf/, 'list', [
                        ['a', '//*[@id="skip_battle_btn"]/div/a'],
                        ['func', this.handleERBBattle],
                        ['hold']]],
                    [/eventStoryMission%2FEventBattleResult/, 'list', [
                        ['a', '//a[contains(@href, "eventStoryMission%2FMissionList")]'],
                        ['a', '//a[contains(@href, "eventStoryMission%2FDoMissionExecutionCheck")]'],
                        ['hold']]],
                    [/eventStoryMission%2FMissionList/, 'list', [
                        ['a', '//a[contains(@href, "eventStoryMission%2FDoMissionExecutionCheck")]'],
                        ['hold']]],
                    [/eventStoryMission%2FEventTop/, 'list', [
                        ['funcR', function () {
                            var raid_clear = GM_getValue('__ht_myraid_clear');
                            if (raid_clear + 60 * 1000 > Date.now()) {
                                return $('a[href*="RaidBossAssistList"]').clickJ().length > 0;
                            }
                            return false;
                        }],
                        ['a', '//a[contains(@href, "eventStoryMission%2FMissionList")]'],
                        ['a', '//*[@id="eventstorymission_top"]/div/div[2]/a'],
                        ['a', '//a[contains(@href, "eventStoryMission%2FRaidBossTop")]'],
                        ['a', '//a[contains(@href, "eventStoryMission%2FDoMissionExecutionCheck")]']]],
                    [/eventStoryMission%2FMissionResult/, 'list', [
                        ['a', '//a[contains(@href, "eventStoryMission%2FEventBattleConf")]'],
                        ['a', '//*[@id="mission_wrap"]/div/div/p/a'], //go
                        ['a', '//*[@id="mission_wrap"]/div[2]/div/a'], //feebar
                        ['a', '//*[@id="mission_wrap"]/div[1]/a'], //reorio
                        ['funcR', function () {
                            var raid_clear = GM_getValue('__ht_myraid_clear');
                            if (raid_clear + 60 * 1000 > Date.now()) {
                                return clickA('//*[@id="main"]/div[2]/div/a');
                            }
                            return false;
                        }], //help
                        ['a', '//*[@id="mission_wrap"]/a'],
                        //['a', '//*[@id="mission_wrap"]/div/div/p/a'],
                        //['a', '//a[contains(@href, "eventStoryMission%2FDoMissionExecutionCheck")]'],
                        //['a', '//a[contains(@href, "eventStoryMission%2FMissionList")]'],
                        ['hold']]],
                    [/eventStoryMission%2FRaidBossBattleResult%2F/, 'list', [
                        ['a', '//a[contains(@href, "eventStoryMission%2FMissionList")]'],
                        ['hold']]],
                    [/eventStoryMission%2FRescueList%2F/, 'a', '//a[text()="応援"]'],

                    //[/eventTeamBattle%2FEventBattleConf%2F/, 'func', handleTeamBattle],
                    //[/eventTeamBattle%2FEventBattleResult%2F/, 'list', [
                    //    ['a', '//a[img[contains(@src, "btn_quest.png")]]'],
                    //    ['a', '//*[@id="go"]/a']]],
                    //[/eventTeamBattle%2FEventBattleSwf%2F/, 'flash', '//*[@id="stage"]'],
                    //[/eventTeamBattle%2FEventTop/, 'a', '//div[@class="btn_mission"]/a'],
                    //[/eventTeamBattle%2FMissionResult%2F/, 'a', this.xpathmypage],
                    [/eventSurvival%2FBattleConf/, 'func', this.handleERBBattle],
                    [/eventSurvival%2FBattleResult/, 'list', [
                        ['a', '//a[@href="http://sp.pf.mbga.jp/12011538?url=http%3A%2F%2Fmhunter.forgroove.com%2FeventSurvival%2FDoMissionExecutionCheck"]'],
                        ['hold']]],
                    [/eventSurvival%2FEventTop/, 'list', [
                        ['a', '//a[@href="http://sp.pf.mbga.jp/12011538?url=http%3A%2F%2Fmhunter.forgroove.com%2FeventSurvival%2FDoMissionExecutionCheck"]'],
                        ['a', '//a[@href="http://sp.pf.mbga.jp/12011538?url=http%3A%2F%2Fmhunter.forgroove.com%2FeventSurvival%2FBattleConf"]'],
                        ['hold']]],
                    [/eventSurvival%2FMissionResult/, 'a', '//*[@id="go"]/a'],
                    [/^(event[a-zA-Z0-9]*|raidBoss)%2FRaidBossTop/, 'func', function () {
                        var boss_info = $('#main > div.subtitle').first(), boss_n, boss_lvl, wait = 2000, back_xpath, res,
                            hp_gauge, hp_full, USERNAME, help_record, last_attack, bp_need = 1,
                            attack_num;
                        //debugger;
                        if (url.match(/%2FraidBoss%2F/)) {
                            back_xpath = '//a[text()="クエストに戻る"]';
                        } else {
                            back_xpath = '//*[@id="main"]/div[9]/div[1]/div/p/a'; //this.xpatheventnext;
                        }
                        if (boss_info.length > 0) {
                            //alert(boss_info.innerText);
                            res = boss_info.text().match(/(\S+)[\s\S]*Lv([0-9]+)/);
                            if (res) {
                                boss_n = res[1];
                                boss_lvl = res[2];
                            } else {
                                boss_n = boss_info.innerText;
                                boss_lvl = 0;
                            }
                        }
                        //debugger;
                        hp_gauge = $('div.gauge.bosshp.box_extend.margin_x > div.bar').first();
                        hp_full = hp_gauge.attr('style').match(/100/);
                        USERNAME = GM_getValue('__ht_USERNAME', "");
                        help_record = USERNAME !== "" && $('div.tactical_situation_detail:contains("' + USERNAME + '")').length > 0;
                        last_attack = $('div.tactical_situation_detail').first();
                        bp_need = 1;
                        GM_log("hp_gauge : " + hp_gauge.attr('style'));
                        GM_log(USERNAME);
                        GM_log("help_record : " + help_record);
                        GM_log("discover : " + $('#main > div.raidboss_module div.margin_top_10 > ul.lst_sub > li:last() > div a').first().text());
                        //"#main > div:nth-child(14) > div:nth-child(1) > div > ul > li:nth-child(2) > div > dl > dd.fnt_emphasis.padding_left > a"
                        //#main > div.raidboss_module  div > ul > li:nth-child(2) > div > dl > dd.fnt_emphasis.padding_left > a
                        if (!hp_full &&
                                USERNAME !== "" &&
                                $('#main > div.raidboss_module div.margin_top_10 > ul.lst_sub > li:last() > div a').first().text() !== USERNAME &&
                                help_record &&
                                !url.match(/GiDimension/)) {
                            $('a[href*="DoMissionExecutionCheck"]').clickJ();
                            //clickA(back_xpath);
                            return;
                        }

                        attack_num = 0;
                        setInterval(function () {
                            //if (url.match(/GiDimension/)) {
                            //	return;
                            //}
                            GM_log(bp_need);
                            GM_log($('#do_battle_btn_' + bp_need));
                            var attack = $('#do_battle_btn_' + bp_need + ':not([style*="none"])'), add_bp;
                            GM_log(attack);
                            if (attack.length > 0 && !attack.hasClass('btn_main_off_small') && !attack.hasClass('btn_select_' + bp_need + '_off')) {
                                if (attack_num === 0) {
                                    attack.clickJ();
                                }
                                attack_num += 1;
                                attack_num = attack_num % 5;
                                return;
                            }
                            GM_log("yyyyyyyyyy");
                            if (attack.length === 0) {
                                $('#stage_front').clickJ();
                                return;
                            }
                            GM_log("zzzzzzzzzz");
                            add_bp = $('#bp_recovery > div.flexslider.small > div > ul > li > ul > li > div > span:nth-child(1)');
                            GM_log("bp_candy : " + add_bp.length);
                            if (add_bp.length === 0) {
                                GM_log("empty");
                                //var no_bp_candy = GM_getValue("__ht_no_bp");
                                //if (no_bp_candy) {
                                //	no_bp_candy++;
                                //} else {
                                //	no_bp_candy = 1;
                                //}
                                //GM_setValue("__ht_no_bp", no_bp_candy, 60 * 10);
                                //$('a[href*="%2FDoMissionExecutionCheck"]').last().clickJ();
                            } else {
                                add_bp.first().clickJ();
                            }
                        }, wait);
                    }],
                    [/eventCapture2%2FCaptureBossTop%2F/, 'aJ', $('#bp_attack > div > div > div > div > a').last()],
                    [/eventCapture2%2FCaptureBossBattleResult%2F/, 'list', [
                        ['aJ', 'a[href*="eventCapture2%2FCaptureBossTop%2F"]'],
                        ['a', '//a[contains(@href,"eventCapture2%2FDoMissionExecutionCheck")]']]],
                    [/eventAnniversary%2FEventQuestEntryList/, 'list', [
                        ['aJ', '#main > section.section_main > div > div.btn_main_large > a:nth(' + Math.floor(Math.random() * 4 + 4) + ')'],
                        ['hold']]],
                    [/eventAnniversary%2FEventQuestEntryConfirm/, 'list', [
                        ['aJ', 'a:contains("出発する")'],
                        ['aJ', 'a:contains("エピソードエリア")'],
                        ['hold']]],
                    [/eventAnniversary%2FEventQuestRaidBossTop/, 'list', [
                        ['aJ', 'a:contains("対戦結果を見る")'],
                        ['hold']]],
                    [/eventAnniversary%2FEventQuestRaidBossBattleResult/, 'list', [
                        ['aJ', 'a:contains("先へ進む")'],
                        //['aJ', 'a:contains("キャラ育成")'],
                        ['aJ', 'a:contains("もう一度挑戦!")'],
                        ['hold']]],
                    [/eventAnniversary%2FEventQuestResult/, 'list', [
                        ['aJ', 'a:contains("先へ進む")'],
                        ['hold']]],
                    [/eventAnniversary%2FMaterialFusionTop/, 'list', [
                        ['aJ', 'a:contains("全ての秘伝書を使う")'],
                        ['aJ', 'a:contains("エピソードエリア")'],
                        ['hold']]],
                    [/event%2FeventFusion%2FFusionEnd/, 'list', [
                        ['aJ', 'a:contains("エピソードエリア")'],
                        ['hold']]],
                    [/eventAnniversary%2FEventDeckTop/, 'list', [
                        ['aJ', 'a:contains("選択する"):last()'],
                        ['aJ', 'a:contains("エピソードエリア")'],
                        ['hold']]],

                    [/eventGiDimension%2FGiftMemoryCardEnd/, 'list', [
                        ['aJ', 'a[href*="eventGiDimension%2FDoMissionExecutionCheck"]'],
                        ['hold']]],
                    [/eventGiDimension%2FMemoryCardUserList/, 'list', [
                        ['aJ', 'a:contains("プレゼントする"):first()'],
                        ['aJ', 'a[href*="eventGiDimension%2FDoMissionExecutionCheck"]'],
                        ['hold']]],
                    [/eventRaidBossLoop%2FEventRule%2F%3FfirstAccess%3D1/, 'aJ', '#main > div.txt_center.margin_y_10 > a'],
                    [/fusion%2FBulkFusionConfirm%2F/, 'form', '//*[@id="main"]/div[@class="section_sub"]/form'],
                    [/fusion%2FFusionEnd%2F/, "func", function () {
                        var lvl = getXPATH("//div[div[@class='sprite_deck heading_level']]").innerText,
                            res = lvl.match(/([0-9]+)\/([0-9]+)/);
                        if (res[1] === res[2]) {
                            clickA("//a[contains(text(),'他のカードを強化')]");
                        } else {
                            clickA("//a[contains(text(),'さらに強化')]");
                        }
                    }],
                    //[/fusion%2FFusionTop/, 'func', handleFusionCard], //],
                    [/fusion%2FFusionTop/, 'func', function () {
                        if (document.referrer.match(/fusion%2FMaterialFusionTop/)) {
                            $('a[href*="mypage%2FIndex"]').clickJ();
                        } else {
                            $('a[href*="fusion%2FMaterialFusionTop"]').clickJ();
                        }
                    }],
                    [/fusion%2FMaterialFusionTop/, "func", function () {
                        var form = getXPATH("(//ul[@class='lst_sub']/li/form)[last()]"),
                            succ = false;
                        if (form) {
                            form.elements[1].selectedIndex = form.elements[1].options.length - 1;
                            form.submit();
                            succ = true;
                        }
                        succ = succ || clickA('//a[text()="Nカード一括強化"]');
                        succ = succ || clickA(this.xpathmypage);
                    }],
                    [/fusion%2FMaterialFusionConfirm%2F/, "form", '//*[@id=\"main\"]/div[@class="section_sub"]/form'],
                    [/gacha%2FGachaCharacterCoinTop/, 'a', '//a[contains(text(),"ガチャをする")]'],
                    [/gacha%2FGachaCoinTop%2F/, 'a', '(//a[contains(text(), "ガチャをする")])[last()]'],
                    [/gacha%2FGachaFlash%2F/, 'a', '//a[text()="マイページへ"]'],
                    [/gacha%2FGachaResult%2F%3FgachaThemeId%3D3%26themeId%3D3/, 'list', [
                        ['aJ', 'a[href*="gacha%2FGachaFlash%2F%3FgachaId%3D5%26themeId%3D3"]'], //''//a[text()="バトルをスキップしてガチャをする"]'],
                        ['a', '//a[contains(@href, "prizeReceive%2FPrizeReceiveTop%2F")]']]], //text()="贈り物BOX"]']]],
                    [/gacha%2FGachaResult%2F%3FgachaId%3D/, 'list', [
                        ["a", '(//a[@class="btn_main_large" and contains(text(), "ガチャ")])[last()]'],
                        ['aJ', this.cssmypage]]],
                    [/gacha%2FGachaSwf%2F/, 'flash', "//*[@id=\"container\"]"], // 372, 62],
                    //[/gacha%2FGachaTop%2F%3FthemeId%3D2/, 'a', '(//a[contains(text(), "ガチャをする")])[last()]'],
                    [/gacha%2FGachaTop(%2F)?%3FthemeId%3D2/, 'a', '(//a[@class="btn_main_large" and contains(text(), "ガチャ")])[last()]'],
                    [/gacha%2FGachaTop(%2F)?%3FthemeId%3D3/, 'aJ', 'a[href*="gacha%2FGachaFlash%2F%3FgachaId%3D5%26themeId%3D3"]'], //text(), "ガチャをする")])[last()]'],
                    [/itemBox%2FGachaItemList%2F/, 'a', '//a[text()="ガチャをする"]'],
                    [/mission%2FQuestResult/, "a", "//*[@id=\"main\"]/div[6]/a"],
                    [/mission%2FMissionResult%2F/, 'list', [
                        ['aJ', 'a[href*="eventGiDimension%2FMemoryCardUserList"]'],
                        ['aJNC', '__ht_no_bp', 'a[href*="raidBoss%2FRaidBossTop"]'],
                        ['a', '//a[contains(@href,"' + "event" + this.eventName + "%2FDoMissionExecutionCheck" + '")]'],
                        ['aJ', 'a[href*="eventGiDimension%2FMemoryCardUserList"]'],
                        ['a', "//*[@id=\"go\"]/a"],
                        ['a', "//*[@id=\"next\"]/a"]]],
                    [/mission%2FMissionList/, 'list', [
                        ['aJ', '#current_priority > a'],
                        ['aJ', '#to_latest_mission > a'],
                        ['aJ', 'div.boss_btn > div > a']]],
                    //[/mission%2FMissionSwf%2F/, 'flash', "//*[@id=\"container\"]"],//, 372, 62],
                    [/mission%2FBossAppear/, "form", "//*[@id=\"main\"]/div[3]/form"],
                    [/mission%2FBossBattleResult%2F/, "a", "//*[@id=\"to_latest_mission\"]/a"],
                    [/mypage%2FGreetEnd%2F/, 'a', this.xpathmypage],
                    [/mypage%2FIndex/, "func", function () {
                        //alert("mypage");
                        var ap_gauge = $('#main > div.apbp > div.inner.box_horizontal.box_center > div.gauge.stamina > div.bar'), //$('div.status_gauge > div > div'),
                            raid_help_clear = GM_getValue("__myraid_clear"),
                            no_bp_candy = GM_getValue("__ht_no_bp"),
                            battle_olympia_over = GM_getValue("__ht_bo_over"),
                            raid_my_boss_wait = GM_getValue("__ht_myboss_wait"),
                            succ = false,
                            user_name = $('#mypage_user_data > div > ul > li:nth-child(1) > div.sprite.sub_title > a').text(),
                            eventL;
                        GM_setValue('__ht_USERNAME', user_name);
                        if (raid_help_clear + 60 * 1000 > Date.now() && !no_bp_candy) {
                            succ = succ || clickA("//a[div[@class='sprite_mypage2 btn_help']]");
                        }
                        if (!no_bp_candy && !raid_my_boss_wait) {
                            succ = succ || clickA('//div[@class="btn_boss_wrap"]/a');
                        }
                        //succ = succ || clickA('//a[text()="未使用のガチャアイテムがあります"]');
                        succ = succ || clickA('//a[text()="無料で友達ガチャが引けます"]');
                        succ = succ || clickA("//a[contains(text(), '冒険から帰って来ました')]");
                        succ = succ || clickA("//a[contains(text(), '冒険に行けます')]");
                        succ = succ || clickA('//a[text()="運営からのお詫び"]');
                        succ = succ || clickA("//a[contains(text(), '仲間申請が')]");
                        succ = succ || $('#mypage_news > ul > li > a[href*="arena%2FArenaTop"]').clickJ().length > 0;
                        succ = succ || clickA('//div[@class="badge_present_wrap"]/a');
                        GM_log(ap_gauge.css('width'));
                        if (!succ && ap_gauge && ap_gauge.css("width").match(/[1-9][0-9]px|[89]px/)) {
                            eventL = $('#main > div > a:regex(href, event%2FDoSetClickCount|event[a-zA-Z0-9]*%2FEventTop):first()');
                            //alert(eventL.length);
                            //alert(eventL.text());
                            //GM_log(eventL.text());
                            if (eventL.length > 0 && !$(eventL[0]).text().match(/終了しました/)) {
                                succ = eventL.last().clickJ().length > 0;
                            }
                            //succ = succ || clickA(this.xpathevent);
                            succ = succ || ($('a[href*="MissionList"]').last().clickJ().length > 0);
                        }
                        if (!succ) {
                            if (getXPATH('//div[@class="battle"]/a/div[@class="mypage_battleOlympia"]')) {
                                if (!battle_olympia_over) {
                                    succ = clickA('//div[@class="battle"]/a');
                                }
                            } else if (getXPATH("//div[@class='battle']/div/div[@class='badge']") || getXPATH("//div[@class='sprite gauge_bp bp1']")) {
                                GM_setValue("__mybattle_bp", 1);
                                succ = clickA("//div[@class='battle']/a");
                            }
                        }
                        if (!succ) {
                            setTimeout(function () {
                                location.reload(true);
                            }, 60000);
                        }
                    }],
                    [/mypage%2FLoginBonusSpecial%2F/, 'a', "//div[contains(@class, 'btn_present')]/a"],
                    [/prizeReceive%2FPrizeReceiveTop/, 'list', [
                        //['a', '//a[text()="強化する"]'],
                        ['form', "//*[@id=\"main\"]/div[3]/div/form"],
                        ['a', "//a[span[@class='badge fnt_normal']]"],
                        ['aJ', this.cssmypage]]],
                    [/questRaidBoss%2FQuestDeck%2F/, 'list', [
                        ['form', '//*[@id="deck_box"]//form'],
                        ['a', '//a[contains(text(),"敵と戦う")]'],
                        ['a', '//a[contains(text(),"ステージへ進む")]'],
                        ['hold']]],
                    [/questRaidBoss%2FQuestDetail/, 'a', '//a[text()="このステージをはじめる！"]'],
                    [/questRaidBoss%2FQuestEvent/, 'a', '//a[text()="先へ進む"]'],
                    [/questRaidBoss%2FQuestList/, 'a', '(//a[text()="ステージ詳細を見る"])[last()]'],
                    [/questRaidBoss%2FQuestRaidBossTop/, 'a', '//div[@class="quest_btn"]/a'],
                    [/questRaidBoss%2FRaidBossBattleResult%2F/, 'list', [
                        ['a', '//*[@id="quest_attack"]/a'],
                        //['a', '//*[@id="main"]/div[3]/a'],
                        ['form', '//*[@id="main"]/form'], // Get next deck
                        ['hold']]],
                    [/questRaidBoss%2FRaidBossTop/, 'a', '//*[@id="bp_attack"]/a'],
                    [/questRaidBoss%2FStageTop%2F/, 'a', '//*[@id="go"]/a'],
                    [/raidBoss%2FRaidBossAssistList/, 'func', function () {
                        if (!clickA('//a[.//span[@class="sprite txt_new"]]')) {
                            GM_setValue("__ht_myraid_clear", Date.now());
                            clickA(this.xpathmypage);
                        }
                    }],
                    [/raidBoss%2FRaidBossBattleResult/, "a", "//*[@id=\"main\"]/div[3]/a"],
                    [/QuestEnd/, "a", "//*[@id=\"main_container\"]/header/div[2]/a"],
                    [/CompanionApplicationAcceptEnd/, "a", "//*[@id=\"main_container\"]/header/div[2]/a"],
                    [/EvolutionConfirm/, "form", "//*[@id=\"main\"]/div[2]/div[4]/div/form"],
                    //[/eventBattle%2FEventBattleConf%3F/, 'func', handleEventBattle],
                    //[/eventBattle%2FEventBattleResult%3F/, 'a', '//a[contains(text(), "相手を探す")]'],
                    //[/eventBattle%2FMissionResult%2F/, 'func', handleEventRes],
                    //[/eventBattle%2FMissionSwf%2F/, 'flash', "//*[@id=\"container\"]", 372,62],
                    [/FusionFlash/, "flash", "//*[@id=\"container\"]"],
                    [/%2FMissionSwf%2F/, 'flashJT', '#container'], // 372, 62],
                    [/Swf(Ed)?\b/, 'list', [
                        ['flashJT', '#container > canvas']]],
                    [/xxxxxxxxxxxxxxxxx/]
                ];
            }
        },
        "12008490" : {
            xpathmypage : '//*[@id="header_left_button"]/a',
            cssmypage : '#header_left_button > a',
            xpathquest : '//*[@id="global_menu"]//a[i[@class="menu_sprite menu_quest_image"]]',
            xpathevent : '//*[@id="global_menu"]//a[i[@class="menu_sprite menu_event_image"]]',
            KILLBOSS : false,
            handleStrongBossTop : function () {
                var succ = false, attack, USERID = GM_getValue("__rg_USERID", ""),
                    ownerbox, owner, attacked;
                succ = succ || clickA('//*[@id="requestChain"]/a');
                GM_log(USERID);
                if (!succ) {
                    ownerbox = $('#popup_content > div:nth-child(1) > div.section > div > div.no_flex > img');
                    owner = false;
                    if (USERID !== "" && ownerbox.attr('src') && ownerbox.attr('src').match(new RegExp(USERID))) {
                        owner = true;
                    }
                    attacked = USERID !== "" && $('#popup_content > div:nth-child(1) > div.section > ul > li > a[href$=' + USERID + ']').length > 0;
                    //debugger;
                    GM_log(url);
                    if ((!owner || !this.KILLBOSS) && attacked && !url.match(/island%2FPunchingBossTop/)) {
                        succ = succ || clickA('//a[contains(text(),"ボス一覧へ戻る")]');
                        succ = succ || clickA(this.xpathmypage);
                        return;
                    }
                    setInterval(function () {
                        var attack = $('#rcv_submit_btns > ul > li > a.enabled');
                        if (attack.length < 2) {
                            $('#rcv_items > ul > li > a.enabled').last().clickJ();
                        } else {
                            attack.last().clickJ();
                        }
                    }, 1000);
                }
            },

            handleGachaFlashResult : function () {
                if (getXPATH('//div[@id="gamecanvas"]/canvas|//*[@id="container"]')) {
                    clickFlash('//div[@id="gamecanvas"]/canvas|//*[@id="container"]');
                } else {
                    var succ = false;
                    succ = succ || $('#containerBox > div.txt_center.fnt_medium > div > div > a[href$="gacha%2FGachaFlash%2F%3FthemaId%3D4"]').clickJ().length > 0;
                    succ = succ || clickA('(//a[contains(text(), "エールガチャ")])[last()]');
                    //succ = succ || clickA('//a[text()="エールガチャ"]');
                    succ = succ || clickA('//a[text()="ガチャTOPへ戻る"]');
                    //succ = succ || clickA(this.xpathmypage);
                }
            },
            handleMissionError : function () {
                var succ = false;
                succ = clickA('(//*[@id="rcv_items"]/ul/li/a[@class="enabled"])[last()]');
                if (succ) {
                    setTimeout(function () {
                        clickForm('//*[@id="recovery_form"]');
                    }, 2000);
                }
                setTimeout(function () {
                    clickA(this.xpathmypage);
                }, 5000);
            },

            get_actions : function () {
                return [
                    [/apology%2FApologyList%2F/, 'form', '//*[@id="containerBox"]//form'],
                    [/arena%2FArenaBattleEntry%2F/, 'aJ', '#containerBox > div > a[href*="arena%2FDoArenaBattleEntry%2F"]'],
                    [/Farena%2FArenaBattleEntryEnd%2F/, 'aJ', '#containerBox > div > a:contains("イベントを進める")'],
                    [/arena%2FArena(Sub)?BattleResult%2F/, 'list', [
                        ["a", '//a[contains(@href, "UserSelectList")]'], //text()="戦いを続ける"]'],
                        ['flashJT', '#container > canvas']]], //*[@id="container"]']]],
                    //[/arena%2FArenaBattleSwf%2F/, 'flash', ''],
                    [/arena%2FArena(Sub)?BattleTop/, 'list', [
                        ['func', function () {
                            if ($("#header_bp_gauge").data('value') >= 20 || $('.battle_btn:contains("BP消費0")').length > 0) {
                                $(".battle_btn > a").clickJ();
                            } else {
                                $('a[href*="arena%2FMissionDetail"]').clickJ();
                            }
                        }],
                        ['aJ', 'a[href*="arena%2FMissionDetail"]'],
                        ['aJ', 'a[href*="Farena%2FDoMissionExecutionCheck%2F"]'],
                        ['a', '//div[@class="battle_btn"]/a'],
                        ['flash', '//div[@id="gamecanvas"]/canvas']]],
                    [/arena%2FArenaBossBattle%2F/, 'func', this.handleStrongBossTop],
                    [/arena%2FArenaBossBattleHelpRequestEnd%2F/, 'aJ', 'a[href*="arena%2FArenaBossBattleList"]'],
                    [/arena%2FArenaBossBattleList\b/, 'list', [
                        //['hold'],
                        //['a', '//*[@id="containerBox"]/div[5]/ul/li[.//img[contains(@src, "new3.gif")]]/div[2]/div/a'],
                        ['a', '//ul[@class="lst_info"]/li[.//img[contains(@src, "new3.gif")] or .//img[contains(@src,"g_s_raid_100.png")]]//a[text()="バトル"]'],
                        //['aJ', 'a:contains("バトル")'],
                        ['setCookie', '__my_r_boss_clear', 1, 60],
                        ['a', '//a[contains(text(),"一括で受け取る")]'],
                        ['a', '//a[contains(text(),"討伐完了")]'],
                        ['aJ', 'a[href*="arena%2FTop"]']]],
                    [/arena%2FArenaBossBattleResult%2F/, 'list', [
                        ['a', '//a[text()="ボス一覧へ戻る"]'],
                        ['a', '//a[text()="報酬を受け取る"]'],
                        ['a', '//a[text()="イベントを進める"]']]],
                    [/arena%2FArenaBossRewardAllGetEnd%2F/, 'list', [
                        ['a', '//a[text()="ボス一覧へ戻る"]'],
                        ['a', '//a[text()="イベントを進める"]']]],
                    [/arena%2FArenaBossRewardEnd%2F/, 'list', [
                        ['a', '//a[text()="ボス一覧へ戻る"]'],
                        ['a', '//a[text()="イベントを進める"]']]],
                    [/arena%2FArenaError%2F/, 'a', '//a[text()="イベントTOP"]'],
                    [/arena%2FArena(Sub)?UserSelectList/, 'list', [
                        //['dbg'],
                        ['minmaxJ', '#rcv_submit_btns > ul > li', 'table > tbody > tr > td:nth-child(3) > div > span:last()', 'table > tbody > tr > td:nth-child(3) > div > div > a.enabled'],
                        //['minmax', '//*[@id="rcv_submit_btns"]/ul/li[', ']/table/tbody/tr/td[3]/div/span[2]', ']/table/tbody/tr/td[3]/div/div/a'],
                        ['aJ', 'a[href*="arena%2FTop%2F"]'],
                        ['hold']]],
                    [/arena%2FBossAppear%2F/, 'a', "//a[text()='ボスと戦う']"],
                    [/arena%2FBossBattleResult%2F/, 'list', [
                        ['aJ', 'a[href*="arena%2FMissionDetail%2F"]'],
                        ['a', '//a[contains(@href, "arena%2FDoMissionExecutionCheck%2F")]'],
                        ['flashJT', '#container > canvas']]], //"//a[text()='次のエリアへ進む']"]]],
                    [/arena%2FBossBattleFlash%2F/, 'flash', '//*[@id="container"]/canvas', 79, 346],
                    [/arena%2FContinuousParticipation%2F/, 'aJ', 'a[href*="arena%2FTop"]'],
                    [/arena%2FChoiceCoinItemTop/, 'list', [
                        ['aJ', 'a[href*="arena%2FDoChoiceCoinSetCheck"]:last()'],
                        ['aJ', 'a[href*="arena%2FTop"]']]],
                    [/arena%2FChoiceCoinSetResult%2F/, 'list', [
                        ['aJ', 'a[href*="arena%2FDoChoiceCoinSetCheck"]:last()'],
                        ['aJ', 'a[href*="arena%2FTop"]']]],
                    [/arena%2FDoMissionExecution%2F/, 'aJ', 'a[href*="mypage%2FIndex"]'],
                    [/arena%2FMissionDetail%2F/, 'list', [
                        ['func', function () {
                            var click = 0;
                            setInterval(function () {
                                var text, excBtn, excBossBtn, t, addAp;
                                text = $('#containerBox > div > div.eventPopupWrap.js_eventPopup > div > div > div.margin_left_10').text();
                                click += 1;
                                GM_log(text);
                                //BPが100→100に回復しました
                                if (text.match(/BPが[0-9]*→(100|[2-9][0-9])に回復しました/) && $('#battleBtn:visible').length > 0) {
                                    if ($('#battleBtn > a:visible').clickJ().length === 0) {
                                        $('#popup_content > div > div.section > div.box_horizontal.box_center.margin_10 > div.img_btn_m.btn_base.box_extend > a[href*="ArenaBattleTop"]').clickJ();
                                    }
                                } else if (text.match(/BPが[0-9]*→100に回復しました/) && $('#raidBossBtn > a').filter(':visible').length > 0) {
                                    $('#raidBossBtn > a').clickJ();
                                } else if ($('#excBtnOff').filter(':visible').length === 0) {
                                    excBtn = $('#execBtn');
                                    excBossBtn = $('#raidBossBtn > a');
                                    t = excBossBtn.text().match(/[0-9]+/);
                                    if (excBtn.length === 0 || (click >= 20 && t >= 5)) {
                                        click = 0;
                                        excBtn = excBossBtn;
                                    }
                                    if (excBtn.length === 0) {
                                        excBtn = $('#execClear');
                                    }
                                    excBtn.clickJ().touchJ();
                                } else if ($('#recoveryContainer > div > div.box_extend.js_recovery_btn > div:nth-child(1) > img').filter(':visible').length > 0) {
                                    addAp = $('#recoveryContainer > div > div.box_extend.js_recovery_btn > div:nth-child(1) > img').filter(':visible').filter(':first');
                                    addAp.clickJ().touchJ();
                                }
                            }, 1000);
                        }]]],
                    [/arena%2FMissionError%2F/, 'func', this.handleMissionError],
                    [/arena%2FMissionResult%2F%/, 'list', [
                        //['aJ', '#arenaOpenButton a'],
                        ['aJ', 'a[href*="arena%2FDoMissionExecutionCheck"]']]],
                    //'func', handleArenaMissionRes],
                    [/arena%2FTop/, 'list', [
                        //['hold'],
                        ['aJ', '#containerBox > div > a[href*="arena%2FChoiceCoinItemTop"]:regexText(\\s?0*[1-9][0-9]*\\s?)'],
                        //['a', '//div[@id="bgbox_wrapper"]//a[contains(@href, "ArenaSubBattleTop")]'],
                        ['a', '//div[@id="bgbox_wrapper"]//a[contains(@href, "ArenaBattleTop")]'],
                        ['a', "//div[@class='event_btn']/a"],
                        ['flash', '//*[@id="container"]']]],
                    [/arrangement%2FArrangementEdit%2F/, 'func', function () {
                        //clickS('//div[text()="自動割り振り"]');
                        clickS('//*[@id="reminderPointData"]/div/div[1]/div[2]/div[2]');
                        setInterval(function () {
                            if (getXPATH('//div[@id="overrayArea" and not(@class="hide")]')) {
                                clickForm('//*[@id="containerBox"]/form');
                            }
                        }, 5000);
                    }],
                    [/beatdown%2FBigRaidTop%2F/, 'aJ', 'a[href*="beatdown%2FDoMissionExecutionCheck%2F"]'],
                    [/beatdown%2FBossAppear%2F/, 'a', '//a[text()="ボスと戦う"]'],
                    [/beatdown%2FBossBattle%2F/, 'list', [
                        ['a', '//a[text()="BP消費なしで攻撃"]'],
                        ['func', this.handleStrongBossTop]]],
                    [/beatdown%2FBossBattleHelpRequestEnd%2F/, 'a', '//a[text()="イベントTOP"]'],
                    [/beatdown%2FBossBattleList/, 'list', [
                        ['a', '//a[text()="報酬を一括で受け取る"]'],
                        ['a', '//li[.//img[contains(@src, "new3.gif")]]//a[text()="バトル"]'],
                        ['setCookie', '__my_r_boss_clear', 1, 60]]],
                        //['hold'],
                    [/beatdown%2FBossBattleFlash%2F/, 'flash', '//div[@id="gamecanvas"]/canvas', 79, 346],
                    [/beatdown%2FBossBattleResult%2F/, 'a', '//a[text()="イベントを進める"]'],
                    [/beatdown%2FBossRewardAllGetEnd%2F/, 'a', '//a[text()="ボス一覧へ戻る"]'],
                    [/beatdown%2FMissionBossBattleResult%2F/, 'a', '//a[text()="イベントを進める"]'],
                    [/beatdown%2FMissionError%2F/, 'func', this.handleMissionError],
                    [/beatdown%2FMissionResult%2F/, 'list', [
                        ['a', '//*[@id="containerBox"]/div[div[@class="section_title"]]/div[2]/a'],
                        ['hold']]],
                    [/beatdown%2FTop%2F/, 'list', [
                        ['a', '//a[text()="イベントを進める"]'],
                        ['aJ', 'a[href*="beatdown%2FBigRaidTop%2F"]'],
                        ['aJ', 'a[href*="beatdown%2FDoMissionExecutionCheck%2F"]'],
                        ['flash', '//div[@id="gamecanvas"]/canvas'],
                        ['hold']]],
                    [/caravan%2FDiceEventTop%2F/, 'list', [
                        ['aJ', '#diceEventHeader > a']]],
                    [/caravan%2FGoalBossAttackResult/, 'aJ', 'a[href*="caravan%2FDoResetDeck%2F%3Froute%3Dtop"]'],
                    [/caravan%2FMapTop/, 'list', [
                        ['aJ', '#mapFooter > div.btn_dice > a']]],
                    [/caravan%2FRaidBattleResult%2F/, 'list', [
                        ['aJ', 'a[href*="caravan%2FMapTop"]']]],
                    [/caravan%2FRaidBattleTop%2F/, 'list', [
                        ['func', function () {
                            setInterval(function () {
                                var attack = $('#rcv_submit_btns > ul > li > a.enabled');
                                if (attack.length < 2) {
                                    if ($('#rcv_items > ul > li > a.enabled').last().clickJ() === 0) {
                                        attack.last().clickJ();
                                    }
                                } else {
                                    attack.last().clickJ();
                                }
                            }, 1000);
                        }],
                        ['aJ', '#rcv_submit_btns > ul > li:nth-child(1) > a.enabled']]],
                    [/caravan%2FTop/, 'list', [
                        ['aJ', '#eventHeader > a']]],
                    [/card%2FBulkCardSell\b/, 'list', [
                        ['aJ', 'a:contains("さらに売却する")'],
                        ['hold']]],
                    [/card%2FBulkCardSellConfirm%2F/, 'list', [
                        //['hold'],
                        ['funcR', function () {
                            if (document.referrer.match(/prizeReceive%2FPrizeReceiveTop%2F%3F(receiveCategory%3D2%26bulkSellFlg%3D1|bulkSellFlg%3D1%26sortKey%3D1%26receiveCategory%3D2)/)) {
                                $('#containerBox > div > div > form').submitJ();
                            }
                            return 1;
                        }],
                        ['hold']]],
                    [/card%2FMaterialCardList%2F%3FbulkFusion%3D1/, 'func', function () {
                        var xp_select = getXPATHAll('//*[@id="containerBox"]/form//select'), select;
                        while ((select = xp_select.iterateNext()) !== null) {
                            select.selectedIndex = select.options.length - 1;
                        }
                        clickForm('//*[@id="containerBox"]/form');
                    }],
                    [/companion%2FCompanionApplicationAccept%2F/, 'form', '//form[.//input[@value="承認する"]]'],
                    [/companion%2FCompanionApprovalList%2F/, 'list', [
                        ['a', '//a[text()="承認する"]'],
                        ['aJ', this.cssmypage]]],
                    [/deck%2FDeckEditTop%2F/, 'a', this.xpathmypage],
                    [/fusion%2FFusionSwfStart%2F/, 'flash', '//*[@id="canvas"]'],
                    [/fusion%2FBulkMaterialCardFusionConfirm%2F/, 'form', '//*[@id="containerBox"]/form'],
                    [/gacha%2FSetFreeGachaFlashResult%2F/, 'list', [
                        ['flash', '//div[@id="gamecanvas"]/canvas|//*[@id="container"]', 100, 366],
                        ['func', this.handleGachaFlashResult]]],
                    [/gacha%2FSetGachaResult%2F/, 'list', [
                        ['a', '(//a[contains(text(), "エールガチャ")])[last()]'],
                        ['a', '(//a[contains(text(), "ガチャをする")])[last()]'], //'func', this.handleGachaFlashResult],
                        ['a', '//a[text()="贈り物BOXから受け取る"]'],
                        ['hold']]],
                    [/gacha%2FGachaFlashResult%2F/, 'list', [
                        //['flash', '//div[@id="gamecanvas"]/canvas'],
                        ['func', this.handleGachaFlashResult]]],
                    [/gacha%2FGachaTop%2F%3FpageNum%3D2/, 'list', [//エールガチャ
                        ['a', '(//a[contains(text(), "ガチャ")])[last()]'],
                        ['aJ', this.cssmypage]]],
                    [/gacha%2FGachaTop%2F%3FpageNum%3D3/, 'list', [// レイドガチャ
                        ['a', '(//a[contains(text(), "ガチャ")])[last()]'],
                        ['aJ', this.cssmypage]]],
                    [/gacha%2FGachaTop%2F%3FpageNum%3D4%26thema%3Dregend/, 'aJ', 'a[href$="gacha%2FGachaTop%2F%3FpageNum%3D4"]'],
                    [/gacha%2FGachaTop%2F%3FpageNum%3D4$/, 'list', [
                        ['aJ', '#containerBox > div > div.txt_center > div > a[href*="gacha%2FGachaFlash%2F%3FthemaId%3D4"]'],
                        //['a', '(//a[.//span[text()="ガチャをする"]])[last()]'],
                        ['aJ', 'a[href*="gacha%2FGachaTop%2F%3FpageNum%3D3"]']]],
                    [/gacha%2FGachaTop%2F/, 'list', [
                        ['a', '//*[@id="info"]/div[3]/a'],
                        ['aJ', 'a[href$="gacha%2FGachaTop%2F%3FpageNum%3D4"]'],
                        ['hold']]],
                    [/guildbattle%2FGuildbattleMenu%2F/, 'list', [
                        ['flash', '//*[@id="gamecanvas"]/canvas'],
                        ['hold']]],
                    [/info%2FInformation/, 'aJ', '#header_left_button > a'],
                    [/island%2FBossAppear%2F/, 'a', '//a[text()="ボスと戦う"]'],
                    [/island%2FBeatdownBossBattle%2F/, 'func', this.handleStrongBossTop],
                    [/island%2FBeatdownBossBattleList/, 'list', [
                        //['hold'],
                        ['a', '//a[contains(text(),"一括受け取り")]'],
                        ['aJ', 'a:contains("討伐完了")'],
                        this.KILLBOSS ? ['aJ', 'a:contains("戦う")'] :
                                ['a', '//ul[@class="lst_info"]/li[.//div[@class="relative"]/div or .//img[contains(@src,"g_s_raid_2_100.png")]]//a[text()="戦う"]'],
                        //['aJ', 'a[href*="island%2FBeatdownBossBattle%2F"'],
                        ['setCookie', '__my_r_boss_clear', 1, 60],
                        ['a', '//a[contains(text(),"一括受け取り")]'],
                        ['a', '//a[contains(text(),"討伐完了")]'],
                        ['aJ', 'a:contains("イベントTOP")']]],
                    [/island%2FBeatdownBossBattleResult%2F/, 'list', [
                        ['a', '//a[text()="報酬を受け取る"]'],
                        ['aJ', 'a:contains("ボス一覧へ戻る")'],
                        ['a', '//a[text()="イベントを進める"]'],
                        ['flashJT', '#container > canvas']]],
                    [/island%2FBeatdownBossBattleHelpRequestEnd%2F/, 'aJ', 'a:contains("ボス一覧へ戻る")'],
                    [/island%2FBeatdownBossRewardAllGetEnd%2F/, 'a', '//a[text()="イベントを進める"]'],
                    [/island%2FBeatdownBossRewardEnd%2F/, 'list', [
                        ['aJ', 'a:contains("ボス一覧へ戻る")'],
                        ['a', '//a[text()="イベントを進める"]']]],
                    [/island%2FBeatdownError%2F/, 'aJ', 'a[href*="island%2FTop"]'],
                    [/island%2FBeatdownPunchingBossBattleResult%2F/, 'list', [
                        ['aJ', 'a:contains("イベントを進める")']]],
                    [/island%2FBigRaidBattle%2F/, 'list', [
                        ['func', function () {
                            var btns, hasBtn = false, i, btn;
                            btns = [$('#recovery > div.attack_patterns > div.sprites-bigraid-btn_1_1'),
                                $('#recovery > div.attack_patterns > div.sprites-bigraid-btn_2_1'),
                                $('#recovery > div.attack_patterns > div.sprites-bigraid-btn_3_1')];
                            for (i = 0; i < 3; i += 1) {
                                btn = btns[i];
                                if (btn.length > 0) {
                                    btn.clickJ();
                                    hasBtn = true;
                                    break;
                                }
                            }
                            if (!hasBtn) {
                                $('#recovery > div.attack_patterns > div.sprites-bigraid-btn_' + Math.floor(Math.random() * 3 + 1) + '_2').clickJ();
                            }
                            setInterval(function () {
                                var attack = $('#rcv_submit_btns > ul > li > div > a.enabled');
                                if (attack.length === 0) {
                                    if ($('#rcv_items > ul > li > a.enabled').last().clickJ() === 0) {
                                        attack.last().clickJ();
                                    }
                                } else {
                                    attack.last().clickJ();
                                }
                            }, 1000);
                        }],
                        ['aJ', '#rcv_submit_btns > ul > li:nth-child(1) > a.enabled']]],
                    [/island%2FBossBattleFlash%2F/, 'flash', '//div[@id="gamecanvas"]/canvas|//*[@id="container"]', 79, 346],
                    [/island%2FBossBattleResult%2F/, 'list', [
                        ['aJ', 'a[href*="island%2FPunchingBossTop"]'],
                        ['a', '//a[text()="報酬を受け取る"]'],
                        ['a', '//a[text()="次のエリアへ進む"]'],
                        ['flash', '//*[@id="container"]']]],
                    [/island%2FChoiceSpAreaSelect%2F/, 'list', [
                        ['a', '//*[@id="choiceArea"]/div[1]/div[4]/a'],
                        ['a', '//*[@id="choiceArea"]/div[1]/div[' + Math.floor(Math.random() * 3 + 1) + ']/a']]],
                    [/island%2FChoiceSpAreaSelectEnd%2F/, 'list', [
                        ['aJ', '#containerBox > div.section > div.box_center > a'],
                        ['flashJT', '#container > canvas']]],
                    [/island%2FIslandSlotResult/, 'list', [
                        ['a', '(//a[contains(@href, "DoIslandSlot")])[last()]'],
                        ['aJ', 'a:contains("イベントTOP"):last()']]],
                    [/island%2FIslandSlotTop%2F/, 'list', [
                        ['a', '(//a[contains(@href, "DoIslandSlot")])[last()]']]],
                    [/island%2FMissionError%2F/, 'func', this.handleMissionError], //'list', [
                    //['setCookie', '__my_rg_m_error', 1, 600],
                    //['a', this.xpathmypage]]],
                    [/island%2[Ff]MissionResult%2[Ff]/, 'list', [
                        ['a', '//a[div[@id="MissionAreaMap"]]'],
                        ['a', '//a[div[@id="area_map_image_in"]]'],
                        ['a', '//a[contains(@href, "island%2FDoMissionExecutionCheck")]'], //text()="七夕ツアーズに行く"]'],
                        ['flashJT', '#container > canvas']]],
                    [/island%2FIslandMissionStoryResult%2F/, 'a', '//a[text()="イベントを進める"]'],
                    [/island%2FMissionDetail/, 'list', [
                        ['func', function () {
                            setInterval(function () {
                                var excBtn, addAp;
                                GM_log('island MissionDetail');
                                //GM_log($('#execBtnOff.sprites-common-btn_nomal').length);
                                //GM_log('' + $('#excBtnOff').filter(':visible').length);
                                //GM_log('' + $('#execBtn').filter(':visible').length);
                                //GM_log($('#raidBossBtn:not([style])'));
                                if (this.KILLBOSS && $('#raidBossBtn:not([style]) > a').length > 0) {
                                    $('#raidBossBtn > a').clickJ();
                                } else if ($('#excBtnOff[style*="block"]').length === 0) {
                                    excBtn = $('#execBtn');
                                    if (excBtn.length === 0) {
                                        excBtn = $('#execClear');
                                    }
                                    //GM_log("==========");
                                    //GM_log(excBtn);
                                    excBtn.clickJ();
                                    excBtn.touchJ();
                                } else if ($('#recoveryContainer > div > div.box_extend.js_recovery_btn > div > img.js_on[style*="block"]').length > 0) {
                                    //GM_log("++++++++++");
                                    addAp = $('#recoveryContainer > div > div.box_extend.js_recovery_btn > div > img.js_on[style*="block"]:first');
                                    GM_log(addAp);
                                    addAp.clickJ();
                                    addAp.touchJ();
                                }
                                //GM_log("__________");
                                //GM_log($('#recoveryContainer > div > div.box_extend.js_recovery_btn > div > img.js_on[style*="block"]').length);
                            }, 3000);
                        }]]],
                    [/island%2FPunchingBossTop/, 'func', this.handleStrongBossTop],
                    [/island%2FTeamCompItemTop/, 'a', '//*[@id="navigate_comp"]/div[@class="tour_btns"]/a[last()]'],
                    [/island%2FTop/, 'list', [
                        ['a', '//a[contains(@href, "island%2FTeamCompItemTop") and .//*[@id="TourLastTime"]]'],
                        ['aJ', 'a[href*="island%2FPunchingBossTop"'],
                        ['funcR', function () {
                            var slot = $('a[href*="island%2FIslandSlotTop%2F"]');
                            if (slot.length === 0) {
                                return false;
                            }
                            if (slot.find('div:not(:has(*))').text() === "00") {
                                return false;
                            }
                            slot.clickJ();
                            return true;
                            //debugger;
                        }],
                        ['a', '//a[contains(@href, "island%2FDoMissionExecutionCheck")]'],
                        ['aJ', 'a[href*="island%2FMissionDetail%2F"]'],
                        //div[contains(@class,"sprites-event-top-quest")]/a'],
                        ['flash', '//*[@id="container"]']]],
                    [/mission%2FBossAppear%2F/, 'a', '//a[text()="ボスと戦う"]'],
                    [/mission%2FBossBattleFlash/, 'flash', '//div[@id="gamecanvas"]/canvas|//*[@id="container"]', 79, 346],
                    [/mission%2FBossBattleResult%2F/, 'a', '//a[text()="次に進む"]'],
                    [/mission%2FMissionError%2F/, 'a', '//*[@id="global_menu"]/ul/li[2]/ul/li[2]/a'],
                    [/mission%2FMissionList%2F/, 'list', [
                        ['form', '//*[@id="containerBox"]/div[4]/form'],
                        ['form', "//*[@id=\"containerBox\"]/div[@class='txt_center']/div/ul/li/div/form"],
                        ['a', this.xpathmypage]]],
                    [/mission%2FMissionResult%2F/, 'list', [
                        ['func', function () {
                            var title_ele = getXPATH('//p[@class="section_title"]'), title, succ;
                            if (title_ele) {
                                title = title_ele.innerText;
                            } else {
                                title = "";
                            } //
                            if (title === "入手した秘宝") {
                                clickA('//*[@id="containerBox"]/div[5]/a');
                            } else if (title.match(/N$/)) {
                                if (!clickA('//a[text()="売却し進む"]')) { //
                                    clickA('//a[text()="さらに進む"]');
                                }
                            } else if (title.match(/R$/)) {
                                clickA('//a[text()="さらに進む"]');
                                //} else if (title.match(/MP割り振り/)) {
                                //    clickA('//div[text()="自動割り振り"]');
                            } else if (title === "") {
                                succ = false;
                                succ = succ || clickA('//a[text()="クエストをさらに進む"]');
                                if (!succ && getXPATH('//*[@id="swfArea"]')) {
                                    clickA('//*[@id="containerBox"]/div[@class="margin_top txt_center"]/div/a');
                                }
                            } else {
                                alert(title);
                            }
                        }]]],
                    [/mypage%2FCollectionComp%2F/, 'form', '//form[.//input[@value="報酬を受け取る"]]'],
                    [/mypage%2FCollectionCompEnd%2F/, 'a', '//a[text()="図鑑報酬へ"]'],
                    [/mypage%2FGreetList%2F/, 'a', this.xpathmypage],
                    [/mypage%2FIndex/, "func", () => {
                        var txt = $('input[name="keUrl"][type="text"]'),
                            ap_gauge = getXPATH('//*[@id="header_ap_gauge"]'),
                            ap = 0,
                            mission_error = getCookie('__my_rg_m_error'),
                            succ = false,
                            matchres = txt[0].defaultValue.match(/%3D(\d+)$/),
                            boss_clear;
                        if (matchres) {
                            //GM_log(matchres[1]);
                            GM_setValue("__rg_USERID", matchres[1]);
                        }
                        if (ap_gauge) {
                            ap = ap_gauge.dataset.value;
                        } else {
                            if (getXPATH('//*[@id="container"]')) {
                                clickFlash('//*[@id="container"]');
                                return;
                            }
                        }
                        succ = succ || clickA('//a[contains(text(),"戦友申請が")]');
                        succ = succ || clickA('//a[text()="カード図鑑報酬が受け取れます"]');
                        succ = succ || clickA('//a[text()="マテリアル図鑑報酬が受け取れます"]');
                        succ = succ || clickA('//a[text()="トレジャーに出発できます"]');
                        succ = succ || clickA('//a[text()="MPが割り振れます"]');
                        succ = succ || clickA('//a[text()="無料ガチャが出来ます"]');
                        succ = succ || clickA('//a[text()="トレジャーの結果が出ています"]');
                        //succ = succ || clickA('//a[text()="贈り物が届いてます"]');
                        succ = succ || clickA('//a[text()="運営からのお詫び"]');
                        succ = succ || clickA('//a[text()="新しいメッセージがございます"]');
                        succ = succ || $('a:contains("スーパーノヴァの結果が届いています")').clickJ().length > 0;
                        boss_clear = getCookie("__my_r_boss_clear");
                        if (!boss_clear) {
                            succ = succ || clickA('//*[@id="mypage_boss_icon"]/a');
                        }
                        succ = succ || clickA(this.xpathevent);
                        if (ap > 10 && !mission_error) {
                            succ = succ || clickA(this.xpathquest);
                        }
                        //succ = succ || clickA(this.xpathevent);
                        //succ = succ || setTimeout(function () {location.reload(true); },  60000);
                    }],
                    [/newMission%2FAreaList%2F/, 'aJ', $('a[href*="newMission%2FMissionList%2F"]').last()],
                    [/newMission%2FBossAppear/, 'aJ', 'a[href*="newMission%2FBossBattleFlash%2F"]'],
                    [/newMission%2FMissionDetail%2F/, 'flashJT', '#execBtn'],
                    [/newMission%2FMissionList%2F/, 'aJ', 'a[href*="newMission%2FMissionDetail%2F"]'],
                    [/mypage%2FMaterialCollection%2F/, 'a', '//a[text()="図鑑報酬を受け取る"]'],
                    [/mypage%2FMaterialCollectionCompEnd%2F/, 'a', '//a[text()="コンプマテリアル図鑑"]'],
                    [/prizeReceive%2FPrizeReceiveAllEnd%2F/, 'a', '//a[text()="贈り物BOX TOP"]'], //this.xpathmypage],
                    [/prizeReceive%2FPrizeReceiveTop%2F%3FreceiveCategory%3D[13]/, 'list', [
                        ['formJ', '#containerBox > form:has(div > input[type="submit"][value*="一括で受け取る"])']]],
                    [/prizeReceive%2FPrizeReceiveTop%2F%3F(receiveCategory%3D2%26bulkSellFlg%3D1|bulkSellFlg%3D1%26sortKey%3D1%26receiveCategory%3D2)/, 'list', [
                        ['funcR', () => {
                            var sell = false, name, cardname;
                            GM_log("selling");
                            $("#containerBox > div.section > ul.lst_info > li").each(function (index) {
                                var name = $(this).children("div.section_header.fnt_emphasis.txt_center").text(), mres, setSellCard;
                                if (typeof setSellCard_local === 'undefined') {
                                    GM_log("setSellCard_local undefined");
                                    return false;
                                }
                                setSellCard = setSellCard_local;
                                if ((mres = name.match(/^\S\s(\S*)\s1\S*/)) !== undefined) {
                                    cardname = mres[1];
                                    if (setSellCard.has(cardname)) {
                                        GM_log(cardname + " sell");
                                        $(this).find("form").submitJ();
                                        sell = true;
                                        return false;
                                    }
                                    GM_log(cardname + " keep");
                                } else {
                                    GM_log("bad name " + name);
                                }
                                return true;
                            });
                            return sell;
                        }],
                        ['aJ', '#containerBox > div > div.page_number:first() > div.current + div > a'],
                        ['funcR', function () {
                            GM_log("fall through");
                            return 0;
                        }],
                        ['hold']]],
                    [/prizeReceive%2FPrizeReceiveTop%2F%3F(receiveCategory%3D2|bulkSellFlg%3D0%26sortKey%3D1%26receiveCategory%3D2%26page|receiveId%3D)/, 'list', [
                        ['funcR', function () {
                            var get = false;
                            GM_log('getting');
                            $("#containerBox > div.section > ul > li").each(function (index) {
                                var name = $(this).children("div.section_header.fnt_emphasis.txt_center").text(), mres, cardname, setGetCard;
                                if (typeof setGetCard_local === 'undefined') {
                                    return;
                                }
                                setGetCard = setGetCard_local;
                                if ((mres = name.match(/\S\s(\S*)\s\S*/)) !== undefined) {
                                    cardname = mres[1];
                                    if (setGetCard.has(cardname)) {
                                        GM_log(cardname + " get");
                                        $(this).find("form").submitJ();
                                        get = true;
                                        return false;
                                    }
                                    GM_log(cardname + " pass");
                                } else {
                                    GM_log("bad name " + name);
                                }
                                return true;
                            });
                            if (!get) {
                                $('#containerBox > div > div.page_number:first() > div.current + div > a').clickJ();
                            }
                            return true;
                        }],
                        ['aJ', 'a[href*="prizeReceive%2FPrizeReceiveTop%2F%3FreceiveCategory%3D2%26bulkSellFlg%3D1"]'],
                        ['hold']]],
                    [/prizeReceive%2FPrizeReceiveTop\b/, 'list', [
                        //['hold'],
                        //['formJ', '#containerBox > form:nth-child(7)'],
                        ['aJ', 'a[href*="prizeReceive%2FPrizeReceiveTop%2F%3FreceiveCategory%3D2"]'],
                        ['form', '//*[@id="containerBox"]/form[div/input[contains(@value,"一括で受け取る")]]']]], //'func',handlePrizeTop],
                    [/strongBoss%2FStrongBossBattleResult%2F/, 'a', '//a[text()="クエストを進める"]'],
                    [/strongBoss%2FStrongBossHelpResult%2F/, 'a', this.xpathquest],
                    [/strongBoss%2FStrongBossTop%2F/, 'func', this.handleStrongBossTop],
                    [/strongBoss%2FStrongBossNoWinList%2F/, 'list', [
                        ['setCookie', '__my_r_boss_clear', 1, 60],
                        ['a', this.xpathmypage]]],
                    [/supernova%2FSupernovaBattleHistory%/, 'list', [
                        ['aJ', 'a.sprites-event_result-btn_result:last()'],
                        ['aJ', '#header_left_button > a']]],
                    [/supernova%2FSupernovaBattleHistoryDetail%/, 'list', [
                        ['aJ', '#containerBox > div > a[href*="supernova%2FSupernovaTop"]']]],
                    [/supernova%2FSupernovaTop/, 'list', [
                        ['aJ', '#navi > div > a']]],
                    [/treasure%2FCardList%2F/, 'list', [
                        ['a', '//a[text()="メンバーに追加"]'],
                        ['aJ', 'a:contains("マップ選択画面へ")']]],
                    [/treasure%2FTreasureConf%2F/, 'a', '//a[text()="出発させる"]'],
                    [/treasure%2FTreasureEnd%2F/, 'a', '//a[text()="スカウトする" or text()="マップ選択に戻る"]'],
                    [/Ftreasure%2FFriendTreasureBoxList%/, 'aJ', 'a[href*="treasure%2FDoOpenTreasureBox"]'],
                    [/treasure%2FTreasureMapList%2F/, 'list', [
                        //['aJ', 'a[href*="treasure%2FFriendTreasureBoxList%2F"]'],
                        ['a', '//*[@id="area_progress_status"]/div[4]/a'],
                        ['a', '//*[@id="area_progress_status"]/div[' + Math.floor(Math.random() * 3 + 1) + ']/a']]],
                    [/treasure%2FTreasureStatus%2F/, 'list', [
                        ['a', '//a[text()="探索結果確認"]'],
                        ['aJ', this.cssmypage]]],
                    [/treasure%2FTreasureTop%2F/, 'a', '//a[text()="探索先を選ぶ"]'],
                    [/Swf\b/, 'flash', '//*[@id="btn_exec"]|//canvas|//*[@id="container"]|//*[@id="canvas"]'],
                    [/Flash\b/, 'flash', "//div[@id='gamecanvas']/canvas|//*[@id='btn_exec']|//*[@id='container']"],
                    [/xxxxxxxxxxxxxxxxx/]
                ];
                //alert("oops");
            }
        },
        "12007686" : { // dream_nine
            selector_mypage : '#naviheader > ul > li:nth-child(1) > a',
            get_actions : function () {
                return [
                    [/%2Fflash%2F/, 'flashJT', '#tween_b_root'],
                    [/(swf|flash)%3F/, 'flashJT', '#tween_b_root'],
                    [/main%2Farena%2Fmain%2Fmatch_result_flash%3F/, 'flashJT', '#tween_b_root'],
                    [/main%2Farena%2Fmain%2Fselect_tactics%3F/, 'formJ', 'form[action*="main%2Farena%2Fmain%2Fplayball_exe%3F"]'],
                    [/main%2Fcampaign%2Flogin(challenge|rally)%2Fmain/, 'aJ', this.selector_mypage],
                    [/main%2Fscout%2Fmain%2Fboss%3F/, 'aJ', 'a#shortCut'],
                    [/main%2Fscout%2Fmain%2Fboss_result%3/, 'list', [
                        ['aJ', 'a#shortCut']]],
                    [/main%2Fscout%2Fmain%2Fconfirm%3F/, 'aJ', '#bg_scout a:contains("決定する")'],
                    [/main%2Fscout%2Fmain%2Ffield%3F/, 'list', [
                        ['aJ', 'a#shortCut'],
                        ['aJ', this.selector_mypage]]],
                    [/main%2Farena%2Fmain%2Fgame_detail%3F/, 'list', [
                        ['aJ', '#arena_body a:contains("次の試合へ")'],
                        ['aJ', this.selector_mypage]]],
                    [/main%2Farena%2Fmain/, 'aJ', '#arena_back > div.arena_btn_only > a'],
                    [/main%2Fscout%2Fmain%2Fscout_flash/, 'flashJT', '#tween_b_root'],
                    [/main%2Fscout%2Fmain%2Fspecial%3/, 'list', [
                        ['aJ', '#bg_scout a:contains("挑戦する")']]],
                    [/main%2Fscout%2Fmain%2Fspecial_result%3/, 'list', [
                        ['aJ', 'a#shortCut']]],
                    [/main%2Fscout%2Fmain%3F/, 'list', [
                        ['aJ', 'a#shortCut'],
                        ['aJ', '#bg_scout a:contains("最新エリア")']]],
                    [/^akr%2Fmain%2Fevent%2Fbox%2Fmain%2F(dtraining_list|result)/, 'list', [
                        ['aJ', 'a[href*="main%2Fevent%2Fbox%2Fmain%2Fexe%2F%3Ftimes"]'],
                        ['aJ', 'a[href*="main%2Fevent%2Fbox%2Fmain%2Fexe%2F"]'],
                        ['aJ', 'a[href*="main%2Fevent%2Fdtraining%2Finfo"]']]],
                    [/^akr%2Fmain%2Fevent%2Fdtraining%2Finfo/, 'list', [
                        ['aJ', '#content_body a[href*="main%2Fevent%2Fdtraining%2Fmain"]']]],
                    [/^akr%2Fmain%2Fevent%2Fdtraining%2Fmain/, 'list', [
                        ['funcR', function () {
                            var item, matchres;
                            item = $('a[href*="main%2Fevent%2Fbox%2Fmain%2Fdtraining_list"] + div');
                            if (item.length === 0) {
                                return false;
                            }
                            matchres = item.text().match(/所持チケット:([0-9]+)枚/);
                            if (matchres && (+matchres[1]) >= 3) {
                                return $('a[href*="main%2Fevent%2Fbox%2Fmain%2Fdtraining_list"]').clickJ().length > 0;
                            }
                            return false;
                        }],
                        ['aJ', 'form[action*="main%2Fevent%2Fdtraining%2Fmain%2Fone_more_training_exe"] > input[type="submit"]:nth-child(2)'],
                        ['aJ', 'a[href*="main%2Fevent%2Farea%2Fdtraining%2Fexe"]'],
                        ['aJ', this.selector_mypage]]],
                    [/main%2Fgacha%2Fmain%2F%3Faction_eventgacha/, 'formJ', 'form[action*="main%2Ffree_gacha_exe%3"]:last()'],
                    [/main%2Fgacha%2Fmain%2Findex%2F/, 'list', [
                        ['aJ', '#howto_icon_back_gacha > a.enable']]],
                    [/main%2Fgacha%2Fmain%2Fmulti_result%3/, 'aJ', '#naviheader > ul > li:nth-child(1) > a'],
                    [/main%2Fgacha%2Fmain%2Fresult%3F/, 'list', [
                        ['aJ', '#shortCutForm > input.btnLM.blue'],
                        ['aJ', 'div.gacha_frame:first() form:last()'],
                        ['aJ', this.selector_mypage]]],
                    [/main%2Fmission2016%2Fmain/, 'aJ', '#naviheader > ul > li:nth-child(1) > a'],
                    [/main%2Fmypage/, 'list', [
                        ['aJ', '#news_user_info_area a:contains("プレゼントが来ています")'],
                        ['aJ', '#news_user_info_area a:contains("達成しているミッションがあります")'],
                        ['aJ', '#news_user_info_area a:contains("開けていない金箱が")'],
                        ['aJ', '#news_user_info_area a:contains("いま無料ガチャが引けます")'],
                        ['aJ', '#news_user_info_area a:contains("新しく獲得した称号があります")'],
                        ['funcR', function () {
                            var match_res = $('div.scout_cost_area').text().match(/([0-9]*)\s*\/\s*([0-9]*)/),
                                ap = match_res ? +match_res[1] : 0;
                            if (ap > 10) {
                                return $('#gacha_link_area a[href*="main%2Fevent%2Fdtraining%2Finfo"]').clickJ().length > 0
                                    || $('#basic_menu_area a[href*="main%2Fscout%2Fmain"]').clickJ().length > 0;
                            }
                            return false;
                        }],
                        ['funcR', function () {
                            if ($('div.arena_cost_area > img[src*="icon_playcost.png"]').length > 0) {
                                return $('#basic_menu_area a[href*="main%2Farena%2Fmain"]').clickJ().length > 0;
                            }
                            return false;
                        }],
                        ['hold']]],
                    [/main%2Fpresent%2Fevent%2Freceive%2Fmain/, 'list', [
                        ['formJ', '#shortCutForm'],
                        ['aJ', this.selector_mypage]]],
                    [/main%2Fpresent%2Freceive%2Fmain%2Fbulk_list/, 'list', [
                        ['aJ', '#shortCutForm a[href*="main%2Fpresent%2Freceive%2Fmain%2Freceive_exe"]'],
                        ['formJ', '#shortCutForm'],
                        ['aJ', this.selector_mypage]]],
                    [/main%2Fpresent%2Freceive%2Fmain%2Fgacha_result/, 'aJ', '#shortCut'],
                    [/main%2Fpresent%2Freceive%2Fmain(%2Findex|%3F)/, 'list', [
                        ['funcR', function () {
                            if ($('#d9-main > div > table > tbody > tr > td > div > div:contains("プレゼントを受け取れませんでした")').length > 0) {
                                alert("cardbox full");
                                return true;
                            }
                        }],
                        ['aJ', '#shortCutForm a[href*="main%2Fpresent%2Freceive%2Fmain%2Freceive_exe"]'],
                        ['formJ', '#shortCutForm'],
                        ['aJ', '#d9-main a:regexText(期限あり(.*[^0].*))'],
                        ['aJ', '#d9-main a:regexText(期限なし(.*[^0].*))']]],
                    [/akr%2Fmain%2Fpresent%2Freceive%2Fmain%2Ftactics_result/, 'aJ', 'a[href*="main%2Fpresent%2Freceive%2Fmain"]'],
                    [/main%2Freinforce%2Fmain%3Ferror_no/, 'list', [
                        ['aJ', this.selector_mypage]]],
                    [/main%2Freinforce%2Fmain%2Findex%2F/, 'aJ', 'a[href*="main%2Freinforce%2Fmain%2Frecommendexe"]'],
                    [/main%2Freinforce%2Fmain%2Fwith_item%3F/, 'aJ', 'a[href*="main%2Freinforce%2Fmain%2Frecommendexe"]'],
                    [/main%2Freinforce%2Fmain%2Fitem_use_confirm/, 'formJ', 'form[action*="main%2Freinforce%2Fmain%2Fitem_use_execute"]'],
                    [/main%2Freward%2Fmain%2Freward_swf%3F/, 'flashJT', '#tween_b_root'],
                    [/^akr%2Fmain%2Freward%2Fmain/, 'list', [
                        ['funcR', function () {
                            var check = $('#shortCutForm > div.gold_back > div > input[type="checkbox"]');
                            if (check.length > 0) {
                                check[0].checked = true;
                            }
                            return $('#shortCutForm input[type="submit"]:last()').clickJ().length > 0;
                        }],
                        //['func', function () {alert("xxxx");}],
                        //['aJ', '#shortCutForm input[type="submit"]:last()'],
                        ['aJ', this.selector_mypage]]],
                    [/main%2Fscout%2Fmain%2Ffriend/, 'aJ', '#bg_scout > div > div > a[href*="main%2Fscout%2Fmain%2Ffriend_exe"]'],
                    [/main%2Ftitle%2Fmain/, 'aJ', this.selector_mypage],
                    [/[\s\S]*/, 'hold'],
                    [/XXXXXXXXXXXXX/]
                ];
            }
        },
        "12006884" : {
            selector_mypage : '#ctl00_HeaderNavi_hl_top',
            get_actions : function () {
                return [
                    [/^duty%2Fseries_success%2Fseries_success_season_start_or_end\.aspx/, 'aJ', '#ctl00_body_hl_series_success_start'],
                    [/^duty%2Fseries_success%2Fseries_success_top\.aspx/, 'list', [
                        ['funcR', () => {
                            var ap = $('#ctl00_body_DutyStaminaEmptyControl_divDutyStaminaEmpty > div.kadomaru > div.kadomaru_alltop:contains("体力が足りない")');
                            GM_log(ap);
                            GM_log(ap.length);
                            if (ap.length > 0) {
                                GM_log(this.selector_mypage);
                                return $(this.selector_mypage).clickJ().length > 0;
                            }
                        }],
                        ['aJ', '#ctl00_body_hl_chapter_progress']]],
                    [/^gacha%2Fgacha_new_result\.aspx/, 'list', [
                        ['hold'],
                        ['aJ', '']]],
                    [/^gift%2Freceive_list\.aspx/, 'list', [
                        ['aJ', '#ctl00_body_rp_navi_ctl00_btn_receive'],
                        ['aJ', '#ctl00_HeaderNavi_hl_top']]],
                    [/^login_bonus%2Flogin_bonus_stamp\.aspx/, 'aJ', '#ctl00_body_hl_gift_top_sp'],
                    [/^top\.aspx/, 'list', [
                        ['funcR', function (){
                            if ($('dd.mypowergage > div').attr('style').match(/width:(?:100|[1-9][0-9])%/)) {
                                return $('#ctl00_body_hl_series_success').clickJ().length > 0;
                            }
                        }],
                        ['hold']]],
                    [/^user_battle%2Ftraining_battle_confirm\.aspx/, 'func', () => {
                        var disable = $('li.bppos-1:not(.disable)').clickJ().length === 0;
                        if (disable) {
                            $(this.selector_mypage).clickJ();
                            return;
                        }
                        (function time_wait() {
                            var bp_button = $('#bpsubmit[value*="BP1"]');
                            if (bp_button.length === 0) {
                                setTimeout(time_wait, 2000);
                            } else {
                                bp_button.clickJ();
                            }
                        }());
                    }],
                    [/^user_battle%2Ftraining_battle_result\.aspx/, 'aJ', '#wrapper > div.txt-center-pos.mg-tb-15 > a'],
                    [/^user_battle%2Ftraining_battle_turningpoint\.aspx/, 'aJ', '#ctl00_body_btn_choice_1'],
                    [/^swf/, 'flashJT', '#container > canvas', 100, 100],
                    [/[\s\S]*/, 'hold'],
                    [/XXXXXXXXXXXXXXXXXX/]
                ];
            }
        }
    };

    function msgloop(actions) {
        var i, j, list_action, succ, siteI, siteT, ele;
        GM_log('--------------------------------------------');
        GM_log(Date() + url);
        GM_log("REF: " + document.referrer);
        succ = (function () {
            var sites = [
                ["http://sp.pf.mbga.jp/12010455?url=http%3A%2F%2Fmguildbattle.croozsocial.jp%2Fmypage%2FIndex%2F", 5], // avalon
                ["http://sp.pf.mbga.jp/12011538?url=http%3A%2F%2Fmhunter.forgroove.com%2Fmypage%2FIndex", 5], // hunter
                ["http://sp.pf.mbga.jp/12008490?url=http%3A%2F%2Fmragnarok.croozsocial.jp%2Fmypage%2FIndex", 5], //ragnarok
                ["http://sp.pf.mbga.jp/12011562?guid=ON&url=http%3A%2F%2Ftoaru-index.heroz.jp%2Fmypage", 5], // to aru
                ["http://sp.pf.mbga.jp/12007686/?guid=ON&url=http%3A%2F%2Fakr.konaminet.jp%2Fakr%2Fmain%2Fmypage%2Fmain%2F%3Fu%3D146021083384%26i%3D63358373", 5]// dream_nine
            ];
            return false;
            siteI = GM_getValue("site_loop_index", 0);
            siteT = GM_getValue("site_timeout");
            if (Date.now() > siteT) {
                siteI = (siteI + 1) % sites.length;
                siteT = Date.now() + 60 * 1000 * sites[siteI][1];
                window.location.href = sites[siteI][0];
                return true;
            }
            return false;
        }());
        function time_wait_flashJT(action) {
            (function time_wait() {
                var canvas = $(action[1]),
                    x = action[2],
                    y = action[3];
                if (canvas.length > 0) {
                    canvas.touchFlash(x, y);
                } else {
                    GM_log('flashJT, wait flash');
                    setTimeout(time_wait, 1000);
                }
            }());
        }
        for (i = 0; i < actions.length; i += 1) {
            if (url !== undefined && url.match(actions[i][0])) {
                GM_log(actions[i][0]);
                if (actions[i][1] === 'list') {
                    list_action = actions[i][2];
                } else {
                    list_action = [actions[i].slice(1, actions[i].length)];
                }
                for (j = 0; j < list_action.length; j += 1) {
                    if (succ) {
                        break;
                    }
                    GM_log("action: " + list_action[j][0]);
                    switch (list_action[j][0]) {
                    case "a":
                        succ = succ || clickA(list_action[j][1]);
                        break;
                    case 'av':
                        succ = succ || clickAV(list_action[j][1], list_action[j][2]);
                        break;
                    case 'aNC':
                        if (!succ) {
                            if (!GM_getValue(list_action[j][1])) {
                                succ = clickA(list_action[j][2]);
                            }
                        }
                        break;
                    case 'sth':
                        if (!succ) {
                            clickS(list_action[j][1]);
                        }
                        succ = true;
                        break;
                    case 'flash':
                        succ = succ || clickFlash(list_action[j][1], list_action[j][2], list_action[j][3]);
                        break;
                    case 'func':
                        if (!succ) {
                            list_action[j][1]();
                        }
                        succ = true;
                        break;
                    case 'funcR':
                        succ = succ || list_action[j][1]();
                        break;
                    case 'form':
                        succ = succ || clickForm(list_action[j][1]);
                        break;
                    case 'formN':
                        succ = succ || clickForm(list_action[j][1], true);
                        break;
                    case 'setCookie':
                        if (!succ) {
                            GM_setValue(list_action[j][1], list_action[j][2]);
                        }
                        break;
                    case 'hold':
                        succ = true;
                        break;
                    case 'minmax':
                        succ = succ || clickMinMax(list_action[j][1], list_action[j][2], list_action[j][3], list_action[j][4]);
                        break;
                    case 'minmaxJ':
                        succ = $(list_action[j][1]).minmaxJ(list_action[j][2], list_action[j][3], list_action[j][4]).length;
                        break;
                    case 'link':
                        if (!succ) {
                            window.location.href = list_action[j][1];
                        }
                        succ = true;
                        break;
                    case 'aJ':
                        succ = $(list_action[j][1]).clickJ().length > 0;
                        break;
                    case 'aJP':
                        $(list_action[j][1]).clickJ();
                        break;
                    case 'aJV':
                        succ = $(list_action[j][1]).filter(':first').filter(':visible').clickJ().length > 0;
                        GM_log('aJV ' + list_action[j][1] + ' ' + succ);
                        break;
                    case 'aJNC':
                        if (!succ) {
                            if (!GM_getValue(list_action[j][1])) {
                                succ = $(list_action[j][2]).clickJ().length > 0;
                            }
                        }
                        break;
                    case 'formJ':
                        succ = $(list_action[j][1]).submitJ().length > 0;
                        break;
                    case 'flashJ':
                        succ = $(list_action[j][1]).clickFlash().length > 0;
                        break;
                    case 'flashJT':
                        time_wait_flashJT(list_action[j]);
                        succ = true;
                        break;
                    case 'dbg':
                        if (!succ) {
                            debugger;
                        }
                        break;
                    case 'reload':
                        if (!succ) {
                            reload_page(list_action[j][1]);
                            /*setTimeout(function () {location.reload(true); }, list_action[j][1]);*/
                        }
                        succ = true;
                        break;
                    default:
                        unsafeWindow.alert("msgloop - unknown msg - " + list_action[j][0]);
                        break;
                    }
                    GM_log("succ : " + succ);
                }
                if (!succ) {
                    unsafeWindow.alert('no action');
                }
                break;
            }
        }

        if (i === actions.length) {
            unsafeWindow.alert('no match:' + url);
            GM_log('no match:' + url);
        }

        //setTimeout(function () {location.reload(true); }, 600000);
        reload_page(120000);
    }

    match_app_id = url.match(/http:\/\/sp\.pf\.mbga\.jp\/(\d+)\S*[?&]url=http%3A%2F%2F[-_a-zA-Z0-9.]+%2F([-_a-zA-Z%0-9.]+)\S*/);
    if (match_app_id) {
        if (typeof setStopSite_local !== "undefined" && setStopSite_local.has (match_app_id[1])) {
            return;
        }
        url = match_app_id[2];
        GM_log("short_url: " + url);
        action_handler = handler[match_app_id[1]];
        if (action_handler) {
            msgloop(action_handler.get_actions());
        }
    }
}());