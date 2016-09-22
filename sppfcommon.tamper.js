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

    var url = document.URL, handler, match_app_id, app_id, action_handler;

    GM_log('-start----------------------------------------- ' + Date());

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
    
    function tryUntil(func) {
        (function local_func () {
            if (!func()) {
                setTimeout(local_func, 1000);
            }
        }());
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
        var customEvent, rect, x, y, touchinfo;
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
        touchinfo = {
            clientX : x,
            clientY : y,
            pageX : x,
            pageY : y,
            screenX : x,
            screenY : y,
            target : this[0]
        };
        customEvent.touches = [touchinfo];
        customEvent.changedTouches = [touchinfo];
        customEvent.targetTouches = [touchinfo];

        // Available iOS 2.0 and later
        customEvent.initMouseEvent(eveName, /*bubbles*/ true, /*cancelable*/ true, /*view*/ unsafeWindow, /*detail*/ 1,
            x, y, x, y,
            false, false, false, false);

        this[0].dispatchEvent(customEvent);
        return this;
    };

    $.fn.clickJ = function (timeout) {
        var jq;
        GM_log('clickJ : ' + this.length + ' : \'' + this.selector + '\'');
        //GM_log(this);
        if (this.length === 0) {
            return this;
        }
        if (timeout === 0) {
            this.simMouseEvent("mousedown");
            this.simMouseEvent("mouseup");
            this.simMouseEvent("click");
        } else {
            jq = $(this);
            GM_log(' wait clickJ ' + (timeout || 1000));
            setTimeout(function () {
                //GM_log(Date() + ' click func ');
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
                if (!nres) {
                    continue;
                }
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
        "12010455" : { // avalon
            mypage_url : "http://sp.pf.mbga.jp/12010455",
            rotation_time : 5,
            xpathmypage : "//*[@id=\"main_header_menu\"]/ul/li[1]/a",
            cssmypage : "#main_header_menu > ul > li:nth-child(1) > a",
            xpathquest : "//*[@id=\"main_header_menu\"]/ul/li[2]/a",
            no_gift_delay : 10 * 60,
            get_actions : function () {
                return [
                    [/^:::$/, 'aJ', 'a[href*="mypage%2FIndex"]'],
                    [/arrangement%2FArrangementEdit%2F/, 'form', '//*[@id="contents"]/div/div[2]/ul/li[3]/form'],
                    [/arrangement%2FArrangementEnd%2F/, 'a', this.xpathmypage],
                    [/bossguildbattle%2FBossGuildbattleResult/, 'list', [
                        ['a', '//*[@id="btn_force"]/a'],
                        ['a', '//*[@id="command_list"]/ul/li//a'],
                        ['hold']]],
                    [/^bossguildbattle%2FBossGuildbattleTop/, 'list', [
                        ['aJ', '#contents > div.relative > div.mainBtn.banner > a']]],
                    [/bossguildbattle%2FMissionResult%2F/, 'list', [
                        ['aJ', 'a[href*="bossguildbattle%2FMissionActionLot"]'],
                        ['aJ', 'a:contains("使用する")']]],
                    [/bossguildbattle%2FMissionTop%2F/, 'list', [
                        ['a', '//*[@id="raid_announce" and span]/div/a'],
                        ['a', '//*[@id="contents"]//a[contains(@href,"MissionActionLot")]'],
                        ['hold']]],
                    [/bossguildbattle%2FRaidbossAssistList%2F/, 'a', '//ul/li[div[1]/span/span[@class="icon_new"]]//a[text()="助けに行く"]'],
                    [/bossguildbattle%2FRaidbossBattleResult%2F/, 'list', [
                        //['a', '//a[text()="イベントレイドボス応援一覧へ"]'],
                        ['aJ', '#contents > div.raidboss_module a[href*="bossguildbattle%2FMissionActionLot"]']]],
                    [/bossguildbattle%2FRaidbossHelpResult%2F/, 'a', '//a[text()="レイドボスバトルへ"]'],
                    [/bossguildbattle%2FRaidbossTop%2F/, 'list', [
                        //['hold'],
                        ['form', '//*[@id="contents"]/form'],
                        ['a', '//*[@id="raid_help"]/a'],
                        ['aJ', '#summon_btn > div > a'],
                        //['a', '//a[text()="イベントレイドボス応援一覧に戻る"]'],
                        ['a', '//*[@id="high_attack_btn"]/div/a'],
                        ['a', '//a[text()="探索TOPへ"]'],
                        ['aJ', 'a:contains("聖戦TOPへ")'],
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
                        ['formJ', 'form[action*="gacha%2FitemBox%2FDoGachaExec"]'],
                        ['aJ', 'a[href*="gacha%2FitemBox%2FGachaBoxResetConf"]'],
                        ['aJ', 'a[href*="island%2FIslandTop%2F"'],
                        ['aJ', '#contents > div.btn_main_large.margin_top_10 > a']]],
                    [/^gacha%2FitemBox%2FGachaTop/, 'list', [
                        ['formJ', 'form[action*="gacha%2FitemBox%2FDoGachaExec"]'],
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
                        ['a', '//*[@id="attack_btn"]/div/a'],
                        ['aJ', '#contents > div > a[href*="island%2FMissionActionLot"]']]],
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
                        ['aJ', '#header > a:not(:contains("まで")):not([href*="team%2FTeamDetail"]):regexText(.)'],
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
                        ["funcR", function () {
                            var ap = getXPATH("//*[@id=\"gauge_ap\"]/div[1]").dataset.value;

                            if (ap > 10) {
                                return false
                                    //|| $('a[href*="summonHunt%2FSummonHuntTop"]').clickJ().length > 0
                                    || $('#index > div > a[href*="unitBattle%2FUnitBattleTop"]').clickJ().length > 0
                                    || $('#index > div > a[href*="island%2FIslandTop"]').clickJ().length > 0
                                    //|| clickA('//a[contains(@href, "TowerRaidTop")]');
                                    || clickA("//*[@id=\"quest_btn\"]/a");
                            }
                        }],
                        ['switch'],
                        ['hold']]],
                    [/mypage%2FLoginBonusResult%2F/, 'list', [
                        ['a', '//a[text()="贈り物BOXへ"]'],
                        ['aJ', this.cssmypage]]],
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
                    [/mission%2FBossBattleResult%2F/, 'list', [
                        ['aJ', 'a:contains("次のエリアへ進む"):first'],
                        ['aJ', 'a:contains("次のフィールドへ進む"):first']]],
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
                    [/story(ex)?%2FMissionResult%2F/, 'func', () => {
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
                    [/^summonHunt%2FSummonHuntHowToPlay%2F%3FfirstAccessFlg%3D1/, 'aJ', '#contents a[href*="deck%2FDoDeckEditNumChangeAll%2F"]'],
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
                    [/[\s\S]*/, 'hold'],
                    [/xxxxxxxxxxxxxxxxx/]
                ];
            }
        },
        "12011562" : { //toaru
            mypage_url : 'http://sp.pf.mbga.jp/12011562',
            rotation_time : 5,
            xpathmypage : '//*[@id="top_btn"]/a',
            cssmypage : '#top_btn > a',
            get_actions : function () {
                return [
                    [/^:::$/, 'aJ', '#bg_title > div.btn_start_area > a'],
                    [/battleAnimation/, 'flashJT', '#canvas'],
                    [/battle_animation/, 'flashJT', '#canvas', 20, 440],
                    [/cardBook%2Fbonus/, 'aJ', 'a[href*="card_book%2FgetBonus%"]'],
                    [/card_book%2Fbonus/, 'list', [
                        ['aJ', 'a[href*="card_book%2FgetBonus%"]'],
                        ['aJ', this.cssmypage]]],
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
                    [/%2ForderHelpSelect/, 'list', [
                        ['aJ', '#bg > section a:contains("参戦する"):first'],
                        ['aJ', '#bg > ul > li > a:contains("イベントTOP")']]],
                    //#bg > section > ul > li > dl > dd > div.p10.txR > div > a
                    [/^login%2Fgacha%2Fdx/, 'flashJT', '#canvas'],
                    [/login%2Fperiod/, 'flashJT', '#canvas'],
                    [/mypage%2FsetParameter/, 'func', function () {
                        $("#auto_select").clickJ();
                        $("form").submitJ(2000);
                        $("a[href*='friend%2FsearchFriends%2Frand']").clickJ(3000);
                    }],
                    [/mypage/, 'list', [
                        //['dbg'],
                        ['aJGMV_Time', 'toaru_card_full', 30 * 60 * 1000, 'div.contents_info a[href*="pick%2Ftop%2Ffree"]'], // free gacha
                        //['dbg'],
                        ['aJ', 'section.eventArea > article a[href*="mypage%2FsetParameter"]'], // status point
                        ['aJGMV_Time', 'toaru_card_full', 30 * 60 * 1000, $('.present_number > a').filter(function () {
                            return this.innerHTML !== '0';
                        })], // present
                        ['aJ', 'div.contents_info a[href*="cardBook%2Fbonus"]'], // card book
                        ['aJ', 'div.contents_info a[href*="friend%2FacceptList"]'],
                        //['aJ', 'div.contents_info a[href*="shortStory%2Findex"]'], // story
                        //['aJ', 'div.contents_info a[href*="mission%2Fbeginner"]'], // story
                        ['aJ', 'div.contents_info a[href*="pick%2Ftop%2Fpremium"]'], // story
                        //['aJ', 'div.contents_info a[href*="quiz%2Findex"]'], // story
                        ['aJ', '#info_area > div > div.partner_status.on > a'],
                        ['funcR', function () {
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
                                return false
                                    || $('#bg > section.eventArea > div:not(.banner_area_result) > a[href*="StruggleBattle%2Fselect"]').clickJ().length > 0
                                    || $('a[href*="playerBattle%2Fbattle"]').clickJ().length > 0;
                            }
                        }],
                        ['switch']]],
                    [/^[a-zA-Z0-9]+%2FcharaFlash/, 'flashJT', '#canvas'],
                    [/^[a-zA-Z0-9]+%2Fchara(%|$)/, 'list', [
                        ['aJ', '#bg > section > div.px20.py5 > ul > li:nth-child(1) > a']]],
                    [/^[a-zA-Z0-9]+%2FwinChara/, 'aJ', '#bg > div.px10.pb10.pt5 > div > a'],
                    [/[pP]artner(%2Findex|$)/, 'list', [
                        //['aJ', '#partnerCommand > li:nth-child(' + (Math.floor(Math.random() * 4) + 1) + ') > div > div > a']]],
                        ['formJ', '#questWindow > article > div:nth-child(1) > div.p10 > form'],
                        //['aJ', '#partnerCommand > li:nth-child(2) > div > div > a'],
                        //['hold'],
                        ['aJ', this.cssmypage]]],
                    [/partner%2Findex/, 'list', [
                        ['aJ', '#top_btn > a']]],
                    [/^[pP]artner%2FquestConfirm/, 'aJ', '#bg_room > div.partner_detail > div > form > input.btn_quest_partner'],
                    [/^partner%2FquestFlash/, 'flashJT', '#canvas'],
                    //pick
                    [/pick%2Fresult%2Ffree/, 'list', [
                        //['aJ', $('a[href*="pick%2Frun%2Ffree%2F"]').filter(':last')],
                        ['aJ', this.cssmypage]]], //['aJ', '#bg > article > section:nth-child(1) > article > div > div > a']
                    [/pick%2Frun/, 'flashJT', '#canvas', 40, 410],
                    [/pick%2Ftop%2Ffree/, 'list', [
                        //['hold'],
                        ['aJ', 'a[href*="pick%2Frun%2Ffree%2Fdaily%3F"]'],
                        ['aJ', 'a[href*="pick%2Frun%2Ffree%2Flunch%3F"]'],
                        ['setGMV', 'toaru_card_full', Date.now()],
                        ['aJ', this.cssmypage],
                        ['flashJT', 'canvas']]],
                    [/pick%2F(top|result)%2Fpremium2/, 'list', [
                        ['aJ', 'a[href*="pick%2Frun%2Fpremium2%2Fmedal"]'],
                        ['aJ', 'a[href*="pick%2Frun%2Fpremium2%2Fsr"]'],
                        ['aJ', 'a[href*="pick%2Frun%2Fpremium2%2Fssr"]'],
                        ['aJ', 'a[href*="pick%2Frun%2Fpremium2%2Ffree"]'],
                        ['aJ', this.cssmypage]]],
                    [/pick%2F[a-zA-Z]*%2Fpremium/, 'list', [
                        //['aJ', 'a[href*="pick%2Frun%2Fpremium%2F"]'],
                        // ['hold'],
                        ['flashJ', '#container']]],

                    //player_battle
                    [/playerBattle%2Fbattle\b/, 'aJ', 'a[href*="player_battle%2Fbattle_confirm"]'],
                    [/player_battle%2Fbattle_confirm%/, 'aJ', 'a[href*="battle_animation"]'],
                    [/player_battle%2Fbattle_result%/, 'aJ', 'a[href*="mypage"]'],
                    [/player_battle%2Fcomplete%/, 'flashJT', "#canvas"],
                    [/present%2Fconfirm%2F[01]%2F/, 'list', [
                        ['formJ', '#bg > section > article > div > form'],
                        ['setGMV', 'toaru_card_full', Date.now()],
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

                    [/^struggle_battle%2Fconfirm/, 'funcR', () => {
                        return ($('#bg > section > div.emph_blink_red2:contains("コスト不足")').length > 0 && $(this.cssmypage).clickJ().length > 0)                            
                            || $('#bg > section > div.p10 > div > a[href*="battle_animation%2Fplayer"]').clickJ().length > 0;
                    }],
                    [/^struggle_battle%2Fresult/, 'aJ', this.cssmypage],
                    [/^[Ss]truggle_?[Bb]attle%2Fselect/, 'minmaxJ', '#bg > section:nth-child(8) > article > div', 'div.player_waku_detail > div:nth-child(2)', 'a'],
                    [/(soge|FrSkill|raidBoss)Flash/, 'flashJT', '#canvas'],
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
                    [/%2Fattack_result/, 'list', [
                        ['funcR', function () {
                            if (!document.referrer.match(/orderHelpComplete/)) {
                                //return $('a:contains("ランダムに応援依頼")').clickJ().length > 0;
                            }
                        }],
                        ['aJ', '#btnBox1 > div > ul > li > div > div > a:visible'],
                        ['aJ', '#bg > div > div.btn_blue > a'],
                        ['switch']]],
                    [/%2Fbox_flash%2F/, 'flashJT', '#canvas'],
                    [/%2Fbox_reset_confirm/, 'formJ', '#bg > div.window > div.pt5 > form'],
                    [/%2Fbox_reset_result/, 'aJ', '#bg > ul > li > a[href*="eventTop"]'],
                    [/%2Fbox_result%2F/, 'list', [
                        ['aJ', '#bg > section > div.btn_blue > a']]],
                    [/%2Fbox_select/, 'list', [
                        ['aJ', '#bg > section a[href*="box_reset_confirm"]'],
                        ['aJ', 'a[href*="%2Fbox%2F"]:last()'],
                        ['aJ', this.cssmypage]]],
                    [/%2FclearArea%/, 'aJ', 'div.eventStageResultButton > div > a'],
                    [/%2FeventTop/, 'list', [
                        ['funcR', function () {
                            var res = $('#bg > section.py5 > article:visible() dd').text().match(/([0-9]+)/);
                            if (res === undefined || res === null) {
                                return false;
                            }
                            res = +res[1];
                            if (res > 10) {
                                return $('div.btn_blue > a[href*="box_select"]').clickJ().length > 0;
                            }
                            return false;
                        }],
                        //['aJ', 'div.btn_blue > a[href*="box_select"]'],
                        //['aJ', 'div.questAction a[href*="%2ForderHelpSelect"]'],
                        ['funcR', function () {
                            if ($('#difficultyPopup > div:contains("強敵と戦う!")').length > 0) {
                                return $('a[href*="%2Findex%2F"]:last()').clickJ().length > 0
                            }
                        }],
                        ['funcR', function () {
                            if ($('div.questAction a[href*="%2Fraid%2F"]:last').length > 0) {
                                tryUntil (() => {
                                    if ($('div.questAction a > div > dl > dd > img[src*="bp_g.png"]').length < 3) {
                                        return $('div.questAction a[href*="%2Fraid%2F"]:last').clickJ().length > 0;
                                    }
                                });
                                return true;
                            }
                        }],
                        //['aJ', 'div.questAction a[href*="%2Fraid%2F"]:last'],
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
                    [/^dangerous%2ForderHelpComplete/, 'aJ', '#bg > ul > li > a:contains("元のページに戻る")'],
                    [/%2FraidBoss%2F/, 'list', [
                        ['flashJT', '#canvas']]],
                    [/%2Fraid%2F/, 'list', [
                        ['aJ', 'a[href*="battle_animation%2F"]:visible():last()'],
                        ['aJ', 'div.btn_blue > a[href*="%2Findex%2F"]'],
                        ['aJ', 'ul.contentLink > li > a[href*="eventTop"]']]],

                    [/%2FrSkill%2F/, 'aJ', 'a[href*="%2FrSkillProc%2F"]'],
                    [/%2FrSkillResult/, 'aJ', 'div.btn_blue > a[href*="%2Findex%2F"]'],
                    [/[\s\S]*/, 'hold'],
                    [/xxxxxxxxxxxxxxxxxxx/]
                ];
            }
        },
        "12011538" : { // hunter
            mypage_url : 'http://sp.pf.mbga.jp/12011538',
            rotation_time : 5,
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
                    [/^:::$/, 'aJ', '#main a[href*="%2Fmypage%2F"]'],
                    [/apology%2FApologyList%2F/, 'list', [
                        ['formJ', '#main > div:nth-child(1) > ul > li:nth-child(1) > form'],
                        ['aJ', '#main > div.btn_sub_medium.margin_top_20 > a']]],
                    [/arena%2FArenaBattleConf%2F/, 'list', [
                        ['aJ', 'a:contains("対戦結果を見る"):visible()'],
                        ['aJ', '#do_battle_btn:visible()'],
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
                    [/errorCatch%2FError%2F%3Ferror%3D301/, 'aJ', this.cssmypage],
                    [/^eventBigRaidBoss%2FBigRaidBossBattleResult/, 'aJ', '#main > div.btn_mission > a'],
                    [/^eventBigRaidBoss%2FBigRaidbossBattleSwf/, 'func', () => {
                        setTimeout(function wait() {
                            if ($('#battle_result_btn > a:visible').clickJ(0).length === 0) {
                                setTimeout(wait, 1000);
                            }
                        }, 1000);
                    }],
                    [/^eventBigRaidBoss%2FBigRaidBossTop/, 'list', [
                        ['aJ', '#bigRaidBtn > div:nth-child(2) > a'],
                        ['aJ', '#bigRaidBtn > div:nth-child(1) > a']]],
                    [/^eventStageRaidBoss%2FEventRule%2F%3FfirstAccess%3D1/, 'aJ', '#main > a'], //'a[href*="event%2FDoSetClickCount"]'],
                    [/^eventStageRaidBoss%2FWishComplyTop/, 'aJ', 'a[href*="eventStageRaidBoss%2FDoMissionExecutionCheck"]'],
                    [/^eventTower%2FEventQuestResult%2F/, 'list', [
                        ['aJ', '#main > div > a[href*="eventTower%2FRaidBossTop"]'],
                        ['aJ', 'a[href*="DoEventQuestExecutionCheck"]'],
                        ['aJ', 'a:regex(href, event[a-zA-Z0-9]*%2FMissionList)']]],
                    [/^event[a-zA-Z0-9]*%2FEventTop/, 'list', [
                        ['funcR', function () {
                            //#eventDeck > ul.event_chara > li > div
                            var items = $('#main > div.raid_boss_container.section_margin_top > div.section_main:has(div:contains("イベキャラを強化しよう！")) > div.padding_top > div.txt_frame_2.margin_x_10.padding_bottom_10 > div > div');
                            var has_item = false;
                            items.each(function(){
                                if (this.innerText.match(/(\d+)/) && 
                                    +this.innerText.match(/(\d+)/)[0] > 0) {
                                    has_item = true;
                                }
                            });
                            if (has_item !== true) {
                                return false;
                            }
                            var lvls = $('#eventDeck > ul.event_chara > li > div');
                            var i = -1, lvl = 99999;
                            lvls.each(function(index) {
                                if (this.innerText.match(/(\d+)/) && 
                                    +this.innerText.match(/(\d+)/)[0] < lvl) {
                                    i = index;
                                    lvl = +this.innerText.match(/(\d+)/)[0];
                                }
                            });
                            if (i >= 0) {
                                return $('#eventDeck > ul > li:eq(' + i + ') > a').clickJ().length > 0;
                            }
                        }],
                        ['funcR', function() {
                            var medal = $('#raid_boss_top > div > div.event_command_section > div > div > div > div.btn_battle > a > div');
                            if (medal.length === 1
                                && medal.text().match(/(\d+)/)
                                && +medal.text().match(/(\d+)/)[1] > 0) {
                                return $('#raid_boss_top > div > div.event_command_section > div > div > div > div.btn_battle > a').clickJ().length > 0;
                            }
                        }],
                        //['hold'],
                        ['aJ', 'a[href*="%2FEventQuestEntryConfirm"]'],
                        ['aJ', 'a[href*="%2FEventQuestEntryList"]'],
                        ['aJ', 'a[href*="%2FeventGuildHideAndSeek%2FPanelTop"]'],
                        ['funcR', function () {
                            var medalCount = $('a.medal_box span.fnt_normal');
                            var result = false;
                            medalCount.each(function () {
                                var item = $(this);
                                if (item.text().match(/(\d+)/)
                                    && +item.text().match(/(\d+)/)[1] >=5) {
                                    if($('a.medal_box').clickJ().length > 0) {
                                        result = true;
                                        return false;
                                    }
                                }
                                return false;
                            });
                            return result;
                        }],
                        ['funcR', function () {
                            //'#main > div.event_wrap > div:nth-child(6) > div.padding_x_10 > div.txt_center.txt_frame_2.no_margin > span
                            //'#main > div.raid_boss_container > div.section_sub > div.padding_x_10 > div.txt_center.txt_frame_2.no_margin > span'
                            //'#main > div.raid_boss_container > div.section_sub > div.padding_x_10 > div.txt_center.txt_frame_2.no_margin > span'
                            var freeChallenge = $('div.section_sub:contains("本日BP消費なしであと") > div.padding_x_10 > div.txt_center.txt_frame_2.no_margin > span');
                            GM_log(freeChallenge);
                            if (freeChallenge.length > 0 && freeChallenge.text().match(/(\d+)/)
                                && +freeChallenge.text().match(/(\d+)/)[1] > 0) {
                                return $('a[href*="event%2FMaxDamageRaidBossTop"]').clickJ().length > 0;
                            }
                        }],
                        //['hold'],
                        ['aJNC', '__ht_myboss_wait', 'a:regex(href, event[a-zA-Z0-9]*%2FRaidBossTop)'],
                        ['funcR', function () {
                            var raid_clear = GM_getValue('__ht_myraid_clear');
                            if (raid_clear + 60 * 1000 > Date.now()) {
                                return $('a[href*="RaidBossAssistList"]').clickJ().length > 0;
                            }
                            return false;
                        }],
                        ['aJ', 'a[href*="eventLimitedRaidBoss%2FDoSuperHonkiAppear"]'],
                        ['aJ', 'a:regex(href, event[a-zA-Z0-9]*%2FDoMissionExecution)'],
                        ['aJ', 'a:regex(href, event[a-zA-Z0-9]*%2FMissionList)'],
                        ['aJ', 'a:regex(href, event[a-zA-Z0-9]*%2FDoEventQuestExecutionCheck)'],
                        ['aJ', 'a[href*="eventStageRaidBoss%2FMissionResult"]'],
                        ['hold']]],
                    [/^event[a-zA-Z0-9]*%2FMissionList/, 'list', [
                        ['a', '//a[contains(@href, "%2FDoMissionExecutionCheck")]'],
                        ['hold']]],
                    [/^event[a-zA-Z0-9]*%2FMissionResult%.F/, 'list', [
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
                        ['aJ', '#world_select_wrap > div > ul > li.stage_icon > div:has(span.count_num:regexText("^(.|..)$")) > div.btn.relative > a:first'],
                        //['aJ', '#world_select_wrap > div.inner > div > div.door_1 > a'],
                        ['aJ', '#world_select_wrap > div > ul > li.stage_icon.extra.clear > div > div > a'],
                        //['func', function () {alert("need intervene");}],
                        ['hold']]],
                    [/event[a-zA-Z0-9]*%2FRaidBossBattleResult/, 'list', [
                        ['aJ', '#boss_battle_gauge_wrap > div > div.btn_gauge_battle > a'],
                        ['aJ', 'a:regex(href, event[a-zA-Z0-9]*%2FDoMissionExecution)'],
                        ['aJ', 'a[href*="eventStageRaidBoss%2FMissionResult"]'],
                        ['aJ', 'a:regex(href, event[a-zA-Z0-9]*%2FRaidBossTop)'],
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
                        var boss_info = $('#main > div.subtitle').first, boss_n, boss_lvl, wait = 2000, back_xpath, res,
                            hp_gauge, hp_full, USERNAME, help_record, last_attack, bp_need = 1,
                            attack_num;
                        //return;
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
                        GM_log(hp_gauge);
                        hp_full = hp_gauge.attr('style').match(/100/);
                        USERNAME = GM_getValue('__ht_USERNAME', "");
                        help_record = USERNAME !== "" && $('div.tactical_situation_detail:contains("' + USERNAME + '")').length > 0;
                        last_attack = $('div.tactical_situation_detail').first();
                        bp_need = 1;
                        GM_log("hp_gauge : " + hp_gauge.attr('style'));
                        GM_log(USERNAME);
                        GM_log($('#main > div.raidboss_module div.margin_top_10 > ul.lst_sub > li:last() > div a').first().text());
                        GM_log("help_record : " + help_record);
                        GM_log("discover : " + $('#main > div.raidboss_module div.margin_top_10 > ul.lst_sub > li:last() > div a').first().text());
                        //"#main > div:nth-child(14) > div:nth-child(1) > div > ul > li:nth-child(2) > div > dl > dd.fnt_emphasis.padding_left > a"
                        //#main > div.raidboss_module  div > ul > li:nth-child(2) > div > dl > dd.fnt_emphasis.padding_left > a
                        //if (!hp_full &&
                        //        USERNAME !== "" &&
                        //        $('#main > div.raidboss_module div.margin_top_10 > ul.lst_sub > li:last() > div a').first().text() !== USERNAME &&
                        //        help_record &&
                        //        !url.match(/GiDimension/) &&
                        //        $('a[href*="DoMissionExecutionCheck"]').length > 0) {
                        //    //$('a[href*="DoMissionExecutionCheck"]').clickJ();
                        //    //clickA(back_xpath);
                        //    return;
                        //}
                        //return;

                        attack_num = 0;
                        var bp_check_count = 0;
                        tryUntil(function () {
                            GM_log(bp_need);
                            GM_log($('#do_battle_btn_' + bp_need));
                            var attack = $('#bp_attack > div.bonus_raid_bp');
                            var add_bp;
                            if (attack.length === 0) {
                                // bonus raid, bp 0.
                                attack = $('#do_battle_btn_' + bp_need + ':not([style*="none"])');
                            }
                            GM_log(attack);
                            if (attack.length > 0 && !attack.hasClass('btn_main_off_small') && !attack.hasClass('btn_select_' + bp_need + '_off')) {
                                //if (attack_num === 0) {
                                //    attack.clickJ();
                                //}
                                //attack_num += 1;
                                //attack_num = attack_num % 5;
                                //return;
                                $('#main > div.power_drink.relative.on > div.use_btn.show').clickJ();
                                return attack.clickJ().length > 0;
                            }
                            GM_log("zzzzzzzzzz");
                            add_bp = $('#bp_recovery > div.flexslider.small > div > ul > li > ul > li > div > span:nth-child(1)');
                            GM_log("bp_candy : " + add_bp.length);
                            //return true;
                            if (add_bp.length === 0) {
                                GM_log("empty");
                                // bp candy usually appear later
                                bp_check_count++;
                                if (bp_check_count > 3) {
                                    //return $('#main a:contains("イベントTOPへ")').clickJ().length > 0;
                                    return $('#main > div.go_mission_button a').clickJ().length > 0; // go on with mission
                                }
                            } else {
                                add_bp.first().clickJ();
                            }
                            return false;
                        });
                        setInterval(function () {
                            $('#stage_front').clickJ();
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
                    [/^event%2FeventFusion%2FMaterialFusionTop%2F%3FeventTypeId%3D34/, 'list', [
                        ['aJ', 'a:contains("全ての秘伝書を使う")']]],
                    [/event%2FeventFusion%2FFusionEnd/, 'list', [
                        ['aJ', 'a:contains("イベントTOPへ")'],
                        ['hold']]],
                    [/eventAnniversary%2FEventDeckTop/, 'list', [
                        ['aJ', 'a:contains("選択する"):last()'],
                        ['aJ', 'a:contains("エピソードエリア")'],
                        ['hold']]],

                    [/eventGiDimension%2FGiftMemoryCardEnd/, 'list', [
                        ['aJ', 'a[href*="eventGiDimension%2FDoMissionExecutionCheck"]'],
                        ['hold']]],
                    [/eventGiDimension%2FMemoryCardUserList/, 'list', [
                        ['aJ', 'a:contains("プレゼントする"):first'],
                        ['aJ', 'a[href*="eventGiDimension%2FDoMissionExecutionCheck"]'],
                        ['hold']]],
                    [/eventRaidBossLoop%2FEventRule%2F%3FfirstAccess%3D1/, 'aJ', '#main > div.txt_center.margin_y_10 > a'],
                    [/^event%2FMaxDamageRaidBossBattleResult/, 'aJ', 'a:contains("もう一度挑戦")'],
                    [/^event%2FMaxDamageRaidBossTop/, 'list', [
                        ['funcR', function () {
                            var fight = $('#do_battle_btn:contains("BP0消費") > div.txt_fight');
                            if (fight.length > 0) {
                                fight.clickJ();
                                $('#overlay_box').touchFlash();
                                return true;
                            }
                        }],
                        ['aJ', '#main > a']]],
                    [/^eventGuildHideAndSeek%2FPanelTop/, 'list', [
                        ['func', function(){
                            $('div#panel > form > ul.select > li:nth-child(5) input[type="checkbox"]').clickJ();
                            tryUntil(function() {
                                if ($('#panel > form > div > div.btn_main_large.submit:not([style*="none"])').length > 0) {
                                    $('#panel > form > div > div.btn_main_large.submit:not([style*="none"]) > input[type="submit"]').clickJ();
                                    return true;
                                } else {
                                    return false;
                                }
                            });
                        }]]],
                    [/^eventGuildHideAndSeek%2FPanelResult%2F/, 'list', [
                        ['aJ', '#panel > div.button a']]],//#panel > div > p > a
                    [/^eventTeamRaidBoss%2F(EventBattleConf|EventBattleResult)%2F/, 'list', [
                        ['aJ', 'a[href*="eventTeamRaidBoss%2FDoFeverStart%2F"]'],
                        ['aJ', '#loopBossBtn > div > div.btn_1 > a'],
                        ['aJ', 'a[href*="eventTeamRaidBoss%2FDoMissionExecutionCheck"]']]],
                    [/^eventTeamRaidBoss%2FEventBattleSwf/, 'flashJT', '#stage_front'],
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
                    [/^gacha%2FGachaBoxResetConf/, 'aJ', 'a:contains("リセットする")'],
                    [/^gacha%2FGachaBoxResetEnd/, 'aJ', '#main > nav > a'],
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
                    [/gacha%2FItemBox(Result|Top)/, 'list', [
                        ['aJ', 'a:contains("リセット")'],
                        ['aJ', 'a:contains("連で開ける")'],
                        ['aJ', 'a:contains("開ける")'],
                        //['aJ', '#main > ul > li:nth-child(2) > a'],
                        ['aJ', 'a:contains("イベントTOP")'],
                        ['aJ', 'a[href*="%2FDoMissionExecutionCheck"]']]],
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
                        succ = succ || ((GM_getValue('hunter_card_full', 0) + 30 * 60 * 1000 < Date.now()) && clickA('//div[@class="badge_present_wrap"]/a'));
                        //GM_log(ap_gauge.css('width'));
                        if (!succ && ap_gauge && ap_gauge.css("width").match(/[1-9][0-9]px|[89]px/)) {
                            //GM_log("yyyy");
                            eventL = $('#main > div > a:regex(href, event%2FDoSetClickCount|event[a-zA-Z0-9]*%2FEventTop):first');
                            //GM_log(eventL.length);
                            //GM_log(eventL.text());
                            //GM_log(eventL.text());
                            if (eventL.length > 0 && !$(eventL[0]).text().match(/終了しました/)) {
                                succ = eventL.last().clickJ().length > 0;
                            }
                            // do not so mission, change to GI quest
                            //succ = succ || ($('a[href*="MissionList"]').last().clickJ().length > 0);
                        }
                        //GM_log("xxxx");
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
                    }],
                    [/mypage%2FLoginBonusSpecial%2F/, 'a', "//div[contains(@class, 'btn_present')]/a"],
                    [/prizeReceive%2FPrizeReceiveTop/, 'list', [
                        //['a', '//a[text()="強化する"]'],
                        ['form', "//*[@id=\"main\"]/div[3]/div/form"],
                        ['aJ', 'li:not(.current) a:has(span.badge.fnt_normal)'],
                        ['setGMV', 'hunter_card_full', Date.now()],
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
        "12008490" : { // ragranok
            mypage_url : 'http://sp.pf.mbga.jp/12008490',
            rotation_time : 5,
            xpathmypage : '//*[@id="header_left_button"]/a',
            cssmypage : '#header_left_button > a',
            xpathquest : '//*[@id="global_menu"]//a[i[@class="menu_sprite menu_quest_image"]]',
            xpathevent : '//*[@id="global_menu"]//a[i[@class="menu_sprite menu_event_image"]]',
            KILLBOSS : false,
            rankArr: ['N', 'NN', 'R', 'RR', 'SR', 'SSR', 'LR', 'GR'],
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
                    [/^:::$/, 'aJ', 'a[href*="mypage%2FIndex"]'],
                    [/apology%2FApologyList%2F/, 'form', '//*[@id="containerBox"]//form'],
                    [/arena%2FArenaBattleEntry%2F/, 'aJ', '#containerBox > div > a[href*="arena%2FDoArenaBattleEntry%2F"]'],
                    [/^arena%2FArenaBattleEntryEnd%2F/, 'aJ', '#containerBox > div > a:contains("イベントを進める")'],
                    [/arena%2FArena(Sub)?BattleResult%2F/, 'list', [
                        ["a", '//a[contains(@href, "UserSelectList")]'], //text()="戦いを続ける"]'],
                        ['flashJT', '#container > canvas']]], //*[@id="container"]']]],
                    //[/arena%2FArenaBattleSwf%2F/, 'flash', ''],
                    [/arena%2FArena(?:Sub)?BattleTop/, 'list', [
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
                        ['a', '//a[text()="イベントを進める"]'],
                        ['a', '//a[text()="イベントTOP"]']]],
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
                                        $('#popup_content a[href*="Arena' + (Math.random() < 0.5 ? '' : 'Sub') + 'BattleTop"]').clickJ();
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
                        ['a', '//div[@id="bgbox_wrapper"]//a[contains(@href, "Arena' + (Math.random() < 0.5 ? '' : 'Sub') + 'BattleTop")]'],
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
                    [/^caravan%2FCardChangeTop%2F/, 'func', () => {
                        //return;
                        var atk = $('#containerBox > div.img_section.margin_bottom_10 > div.card.box_horizontal.box_center.margin_x_20.padding_x_10.margin_bottom_20 > div.box_extend.txt_left > div.fnt_xsmall.no_line_space > div > div.box_extend.margin_left.fnt_emphasis').text(), idxmin, minatk = -1, rare = -1, i;
                        for (i = 1; i <= 5; i++) {
                            var catk = +$('#cardList > ul > li:nth-child(' + i + ') > ul > li:nth-child(3) > div > div.fnt_emphasis').text(),
                                cmem = +$('#cardList > ul > li:nth-child(' + i + ') > ul > li:nth-child(2) > div:nth-child(1) > div.fnt_emphasis').text().match(/(\d+)/)[1],
                                cp = +$('#cardList > ul > li:nth-child(' + i + ') > ul > li:nth-child(2) > div:nth-child(2) > div.fnt_emphasis').text().match(/(\d+)/)[1],
                                coatk = catk / (1 + cp/100) - cmem;
                            GM_log(i + " : coatk : " + coatk);
                            if (minatk < 0 || coatk < minatk) {
                                idxmin = i;
                                minatk = catk;
                            }
                        }
                        GM_log(minatk);
                        GM_log(atk);
                        if (minatk < atk) {
                            $('#popup_content > div:nth-child(' + idxmin + ') > div > div.box_horizontal.box_center.margin_bottom_10 > div:nth-child(2) > div > a').clickJ();
                        } else {
                            $('a:contains("交換しないで進む")').clickJ();
                        }
                    }],
                    [/caravan%2FDiceEventTop%2F/, 'list', [
                        ['aJ', '#diceEventHeader > a'],
                        ['func', () => {
                            var maxatk = 0, maxid = -1, i;
                            for (i = 1; i <= $('#cardList > ul > li > ul > li:nth-child(2) > div:nth-child(2) > div.fnt_emphasis').length; i++) {
                                var rar = 0; //this.rankArr.indexOf($('#popup_content > div:nth-child(' + i + ') > div.section.cardlist_popup > div.margin_top_10 > span').text().match(/([A-Z]+)/)[1]);
                                GM_log(rar);
                                if (rar < 0) {
                                    return;
                                    //alert("Illegal rare: " + txt);
                                }
                                var catk = +$('#cardList > ul > li:nth-child(' + i + ') > ul > li:nth-child(3) > div > div.fnt_emphasis').text(),
                                    cmem = +$('#cardList > ul > li:nth-child(' + i + ') > ul > li:nth-child(2) > div:nth-child(1) > div.fnt_emphasis').text().match(/(\d+)/)[1],
                                    cp = +$('#cardList > ul > li:nth-child(' + i + ') > ul > li:nth-child(2) > div:nth-child(2) > div.fnt_emphasis').text().match(/(\d+)/)[1],
                                    coatk = catk / (1 + cp/100) - cmem;// * (rar - 1) / 2;
                                GM_log(i + " cmem " + cmem + " coatk " + coatk);
                                if (cmem <= 2500 && coatk > maxatk) {
                                    maxatk = coatk;
                                    maxid = i;
                                }
                            }
                            if (maxid == -1) {
                                maxid = Math.floor(Math.random() * 5) + 1; 
                            }
                            $('#popup_content > div:nth-child(' + maxid + ') > div > div.card.box_horizontal.box_y_center.margin_x_10.margin_bottom > div.box_extend.txt_left > div.dice > a').clickJ();
                        }]]],
                    [/caravan%2FGoalBossAttackResult/, 'aJ', 'a[href*="caravan%2FDoResetDeck%2F%3Froute%3Dtop"]'],
                    [/^caravan%2FGoalBossTop%2F/, 'func', () => {
                        var cnt = 0;
                        $('#cardList > ul > li > ul > li:nth-child(2) > div:nth-child(1) > div.fnt_emphasis').each(function(idx, ele) {
                            if (idx < 5) {
                                if (+$(ele).text().match(/(\d+)/)[1] > 2500) {
                                    cnt += 1;
                                }
                            }
                        });
                        if (cnt >= 5) {
                            $('#containerBox > div.box_horizontal.box_spaced.margin_bottom_10.padding_x_10 > div:nth-child(2) > div').clickJ();
                        } else {
                            $('#containerBox > div.box_horizontal.box_spaced.margin_bottom_10.padding_x_10 > div:nth-child(1) > div > a').clickJ();
                        }
                    }],
                    [/caravan%2FMapTop/, 'list', [
                        //['hold'],
                        ['func', () => {tryUntil(() => {
                            for (i = 1; i <= $('#cardList > ul > li > ul > li:nth-child(2) > div:nth-child(2) > div.fnt_emphasis').length; i++) {
                                var rar = this.rankArr.indexOf($('#popup_content > div:nth-child(' + i + ') > div.section.cardlist_popup > div.margin_top_10 > span').text().match(/([A-Z]+)/)[1]);
                                //GM_log(rar);
                                if (rar < 0) {
                                    return;
                                    //alert("Illegal rare: " + txt);
                                }
                                var catk = +$('#cardList > ul > li:nth-child(' + i + ') > ul > li:nth-child(3) > div > div.fnt_emphasis').text(),
                                    cmem = +$('#cardList > ul > li:nth-child(' + i + ') > ul > li:nth-child(2) > div:nth-child(1) > div.fnt_emphasis').text().match(/(\d+)/)[1],
                                    cp = +$('#cardList > ul > li:nth-child(' + i + ') > ul > li:nth-child(2) > div:nth-child(2) > div.fnt_emphasis').text().match(/(\d+)/)[1],
                                    coatk = catk / (1 + cp/100) - cmem * (rar - 1) / 2;
                                GM_log(i + " " + this.rankArr[rar] + " " + ((rar - 1) / 2) + " cmem " + cmem + " coatk " + coatk);
                            }

                            if ($('#worker_cnt').text() > 0) {
                                $('#mapFooter > div.btn_dice > a').clickJ();
                                return true;
                            }
                        })}]]],
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
                    [/^caravan%2FCardRentalTop%2F/, 'funcR', function () {
                        var candatk = +$('#exCardList > ul > li > div.box_horizontal > div.box_extend.box_vertical.padding_left.txt_left > div.card.excard_pt > div:nth-child(3) > div.fnt_emphasis.txt_right').text();
                        var exatk = +$('#cardList > ul > li:nth-child(6) > ul > li:nth-child(3) > div > div.fnt_emphasis').text();
                        if (exatk != exatk || candatk > exatk) {
                        //#exCardList > ul > li > div.box_horizontal > div.popup_btn.auto > img:nth-child(2)
                            return $('#popup_content > div:nth-child(1) > div > div.box_horizontal.box_center.margin_y_10 > div:nth-child(2) > div > a').clickJ().length > 0;
                        } else {
                            return $('#containerBox > div.btn_large.btn_base.box_center.margin_bottom_20 > a').clickJ().length > 0;
                        }
                    }],
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
                        return;
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
                        //['hold'],//gacha%2FGachaFlash%2F%3FthemaId%3D
                        ['aJ', 'a[href*="gacha%2FGachaFlash%2F%3FthemaId%3D"]:last()'],
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
                    [/^island%2FBigRaidBattleResult/, 'aJ', '#containerBox > div > a:contains("イベントTOP")'],
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
                                //alert(title);
                            }
                        }]]],
                    [/mypage%2FCollectionComp%2F/, 'form', '//form[.//input[@value="報酬を受け取る"]]'],
                    [/mypage%2FCollectionCompEnd%2F/, 'aJ', 'a:contains("図鑑報酬へ")'],
                    [/mypage%2FGreetList%2F/, 'a', this.xpathmypage],
                    [/mypage%2FIndex/, 'list', [
                        ['a', '//a[contains(text(),"戦友申請が")]'],
                        ['a', '//a[text()="カード図鑑報酬が受け取れます"]'],
                        ['a', '//a[text()="マテリアル図鑑報酬が受け取れます"]'],
                        ['a', '//a[text()="トレジャーに出発できます"]'],
                        ['a', '//a[text()="MPが割り振れます"]'],
                        ['a', '//a[text()="無料ガチャが出来ます"]'],
                        ['a', '//a[text()="トレジャーの結果が出ています"]'],
                        ['aJGMV_Time', 'rag_present_timer', 30 * 60 * 1000, 'a:contains("贈り物が届いてます")'],
                        ['a', '//a[text()="運営からのお詫び"]'],
                        ['a', '//a[text()="新しいメッセージがございます"]'],
                        ['aJ', 'a:contains("スーパーノヴァの結果が届いています")'],
                        ["funcR", () => {
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
                            return succ;
                        }],
                        ['switch']]],
                    [/newMission%2FAreaList%2F/, 'aJ', $('a[href*="newMission%2FMissionList%2F"]').last()],
                    [/newMission%2FBossAppear/, 'aJ', 'a[href*="newMission%2FBossBattleFlash%2F"]'],
                    [/newMission%2FMissionDetail%2F/, 'flashJT', '#execBtn'],
                    [/newMission%2FMissionList%2F/, 'aJ', 'a[href*="newMission%2FMissionDetail%2F"]'],
                    [/mypage%2FMaterialCollection%2F/, 'list', [
                        ['a', '//a[text()="図鑑報酬を受け取る"]'],
                        ['aJ', this.cssmypage]]],
                    [/mypage%2FMaterialCollectionCompEnd%2F/, 'aJ', 'a:contains("コンプマテリアル図鑑")'],
                    [/prizeReceive%2FPrizeReceiveAllEnd%2F/, 'a', '//a[text()="贈り物BOX TOP"]'], //this.xpathmypage],
                    [/prizeReceive%2FPrizeReceiveTop%2F%3FreceiveCategory%3D[13]/, 'list', [
                        ['formJ', '#containerBox > form:has(div > input[type="submit"][value*="一括で受け取る"])'],
                        ['aJ', 'li:not(.current) a[href*="prizeReceive%2FPrizeReceiveTop%2F%3FreceiveCategory%3D3"]'],
                        ['setGMV', 'rag_present_timer', Date.now()],
                        ['aJ', this.cssmypage]]],
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
                                if ((mres = name.match(/^\S\s([\S ]*)\s1\S*/)) !== null) {
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
                        ['aJ', '#containerBox > div > div.page_number:first > div.current + div > a'],
                        ['funcR', function () {
                            GM_log("fall through");
                            return 0;
                        }],
                        ['aJ', 'a[href*="FprizeReceive%2FPrizeReceiveTop%2F%3FreceiveCategory%3D1"]'],
                        ['hold']]],
                    [/prizeReceive%2FPrizeReceiveTop%2F%3F(receiveCategory%3D2|bulkSellFlg%3D0%26sortKey%3D1%26receiveCategory%3D2%26page|receiveId%3D)/, 'list', [
                        ['funcR', function () {
                            var get = false;
                            var card_names = [];
                            GM_log('getting');
                            $("#containerBox > div.section > ul > li").each(function (index) {
                                var name = $(this).children("div.section_header.fnt_emphasis.txt_center").text(), mres, cardname, setGetCard;
                                if (typeof setGetCard_local === 'undefined') {
                                    return;
                                }
                                setGetCard = setGetCard_local;
                                if ((mres = name.match(/\S\s([\S ]*)\s1\S*/)) !== undefined) {
                                    cardname = mres[1];
                                    if (setGetCard.has(cardname)) {
                                        GM_log(cardname + " get");
                                        $(this).find("form").submitJ();
                                        get = true;
                                        return false;
                                    }
                                    card_names.push(cardname);
                                    GM_log(cardname + " pass");
                                } else {
                                    GM_log("bad name " + name);
                                }
                                return true;
                            });
                            if (!get) {
                                var card_count = {};
                                if ($('#containerBox > div > div.page_number:first > div.current').text() !== "1") {
                                    var last_count = GM_getValue("rag_card_count", "{}");
                                    card_count = JSON.parse(last_count);
                                }
                                card_names.forEach(function (val) {
                                    card_count[val] = card_count[val] ? card_count[val] + 1 : 1;
                                });
                                var this_count = JSON.stringify(card_count);
                                GM_setValue("rag_card_count", this_count);
                                GM_log(this_count);
                                return $('#containerBox > div > div.page_number:first > div.current + div > a').clickJ().length > 0;
                            }
                            return true;
                        }],
                        ['aJ', 'a[href*="prizeReceive%2FPrizeReceiveTop%2F%3FreceiveCategory%3D2%26bulkSellFlg%3D1"]'],
                        ['aJ', 'a[href*="prizeReceive%2FPrizeReceiveTop%2F%3FreceiveCategory%3D1"]'],
                        ['hold']]],
                    [/prizeReceive%2FPrizeReceiveTop\b/, 'list', [
                        //['hold'],
                        //['formJ', '#containerBox > form:nth-child(7)'],
                        ['aJ', 'a[href*="prizeReceive%2FPrizeReceiveTop%2F%3FreceiveCategory%3D1"]'], // go to item tab
                        //['form', '//*[@id="containerBox"]/form[div/input[contains(@value,"一括で受け取る")]]'],
                        ['aJ', this.cssmypage]]], //'func',handlePrizeTop],
                    [/strongBoss%2FStrongBossBattleResult%2F/, 'aJ', 'a:contains("クエストを進める")'],
                    [/strongBoss%2FStrongBossHelpResult%2F/, 'a', this.xpathquest],
                    [/strongBoss%2FStrongBossTop%2F/, 'func', this.handleStrongBossTop],
                    [/strongBoss%2FStrongBossNoWinList%2F/, 'list', [
                        ['aJ', 'a:contains("戦いに行く")'],
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
                    [/[\s\S]*/, 'hold'],
                    [/xxxxxxxxxxxxxxxxx/]
                ];
                //alert("oops");
            }
        },
        "12007686" : { // dream_nine
            mypage_url : 'http://sp.pf.mbga.jp/12007686',
            rotation_time : 5,
            cssmypage : '#naviheader > ul > li:nth-child(1) > a',
            get_actions : function () {
                return [
                    [/%2Fflash%2F/, 'flashJT', '#tween_b_root'],
                    [/(swf|flash)%3F/, 'flashJT', '#tween_b_root'],
                    [/main%2Farena%2Fmain%2Fgame_detail%3F/, 'list', [
                        ['aJ', '#arena_body a:contains("次の試合へ")'],
                        ['aJ', this.cssmypage]]],
                    [/main%2Farena%2Fmain%2Fmatch_result_flash%3F/, 'flashJT', '#tween_b_root'],
                    [/main%2Farena%2Fmain%2Fselect_tactics%3F/, 'formJ', 'form[action*="main%2Farena%2Fmain%2Fplayball_exe%3F"]'],
                    [/main%2Farena%2Fmain/, 'aJ', '#arena_back > div.arena_btn_only > a'],
                    [/main%2Fcampaign%2Flogin(challenge|rally)%2Fmain/, 'aJ', this.cssmypage],
                    [/^akr%2Fmain%2Fevent%2Fbox%2Fmain/, 'list', [
                        //['hold'],
                        ['aJ', 'a[href*="akr%2Fmain%2Fevent%2Fbox%2Fmain%2Fexe%2F%3Fbox%3D2"]:not(.disable)'],
                        ['aJ', 'a[href*="akr%2Fmain%2Fevent%2Fbox%2Fmain%2Fexe%2F%3Fbox%3D4"]:not(.disable)'],
                        ['aJ', 'a[href*="akr%2Fmain%2Fevent%2Fbox%2Fmain%2Fexe%2F%3Fbox%3D6"]:not(.disable)'],
                        ['aJ', 'a[href*="akr%2Fmain%2Fevent%2Fbox%2Fmain%2Fexe%2F%3Fbox%3D11"]:not(.disable)'],
                        ['aJ', 'a[href*="akr%2Fmain%2Fevent%2Fbox%2Fmain%2Fexe%2F%3Fbox%3D12"]:not(.disable)'],
                        ['aJ', 'a[href*="akr%2Fmain%2Fevent%2Fbox%2Fmain%2Fexe%2F%3Fbox%3D13"]:not(.disable)'],
                        ['aJ', '#d9-main a:regex(href, akr%2Fmain%2Fevent%2F(.|..|[^b]..|.[^o].|..[^x]|.....*)%2Fmain)']]],
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
                        ['aJ', this.cssmypage]]],
                    [/^akr%2Fmain%2Fevent%2Fherosta%2Fmain%2F(menu|divide|vs_ready)/, 'list', [
                        //['hold'],
                        ['funcR', () => {
                            var hpt = $('div.frame_red_herosta > div:nth-child(1) > div:nth-child(2) > span:contains("ヒーローPt") + span').text().match(/([\d,]+)/),
                                hpack = $('div.frame_red_herosta > div:nth-child(1) > div:nth-child(2) > span:contains("Xヒーローパック") + span').text().match(/(\d+)/);
                            GM_log(hpt);
                            GM_log(hpack);
                            if ((hpt && hpt[1].replace(',', '') > 3000) || (hpack && hpack[1] > 0)) {
                                return $('a:contains("ヒーローBOXを開ける")').clickJ().length > 0;
                            }
                        }],
                        //['hold'],
                        ['aJ', '#shortCut'],
                        ['aJ', '#d9-main > div > a.btnS_SP_blue.fontS'],
                        ['aJ', 'a[href*="akr%2Fmain%2Fevent%2Fherosta%2Fbattle%2Fchange_battle_type"]:has(img[src*="btn_full_power_on"])'],
                        ['aJ', 'a[href*="event%2Fherosta%2Fbattle"]'],
                        ['aJ', 'a[href*="akr%2Fmain%2Fevent%2Farea%2Fherosta"]'],
                        ['aJ', 'input[value="金のバットを使って試合!"]'],
                        //['formJ', 'form[action*="akr.konaminet.jp%2Fakr%2Fmain%2Fevent%2Fcommon%2Fdirectpotion%2Fuse%"]'],
                        ['switch'],
                        ['aJ', this.cssmypage]]],
                    [/^akr%2Fmain%2Fevent%2Fherosta%2Fmain%2F/, 'list', [
                        ['aJ', '#d9-main > div.fontS.txtC.bg_main_herosta > div:nth-child(2) > a']]],
                    [/^akr%2Fmain%2Fevent%2Fvictoryroad%2Fmain%2Fresult/, 'aJ', '#shortCut'],
                    [/^akr%2Fmain%2Fevent%2Fvictoryroad%2Fmain%2Fuser_list/, 'list', [
                        ['aJ', 'form > input.btnMM.colorline.red.fontM'],
                        ['aJ', '#shortCutInputButton']]],
                    [/^akr%2Fmain%2Fevent%2Fvictoryroad%2Fmain/, 'list', [
                        ['aJ', '#shortCut'],
                        ['aJ', 'a[href*="akr%2Fmain%2Fevent%2Fvictoryroad%2Fmain%2Fuser_list"]'],
                        ['aJ', 'a[href*="akr%2Fmain%2Fevent%2Farea%2Fvictoryroad%2Fexe"]']]],

                    [/main%2Fgacha%2Fmain%2F%3Faction_eventgacha/, 'list', [
                        ['formJ', 'form[action*="main%2Ffree_gacha_exe%3"]:last()'],
                        ['setGMV', 'dream_nine_card_full', Date.now()],
                        ['aJ', this.cssmypage]]],
                    [/main%2Fgacha%2Fmain%2Findex%2F/, 'list', [
                        ['aJ', '#howto_icon_back_gacha > a.enable']]],
                    [/main%2Fgacha%2Fmain%2Fmulti_result%3/, 'aJ', '#naviheader > ul > li:nth-child(1) > a'],
                    [/main%2Fgacha%2Fmain%2Fresult%3F/, 'list', [
                        ['aJ', '#shortCutForm > input.btnLM.blue'],
                        ['aJ', 'div.gacha_frame:first form:last()'],
                        ['aJ', this.cssmypage]]],
                    [/^akr%2Fmain%2Fjpseries%2Floginbonus/, 'aJ', 'a:contains("ドリナイマイページへ")'],
                    [/main%2Fmission2016%2Fmain/, 'aJ', '#naviheader > ul > li:nth-child(1) > a'],
                    [/(main%2Fmypage|:::)/, 'list', [
                        //['aJ', '#news_user_info_area a:contains("プレゼントが来ています")'],
                        ['aJ', '#news_user_info_area a:contains("達成しているミッションがあります")'],
                        ['aJ', '#news_user_info_area a:contains("開けていない金箱が")'],
                        ['aJGMV_Time', 'dream_nine_card_full', 30 * 60 * 1000, '#news_user_info_area a:contains("いま無料ガチャが引けます")'],
                        ['aJ', '#news_user_info_area a:contains("新しく獲得した称号があります")'],
                        //['hold'],
                        ['funcR', function () {
                            var match_res = $('div.scout_cost_area').text().match(/([0-9]*)\s*\/\s*([0-9]*)/),
                                ap = match_res ? +match_res[1] : 0;
                            if (ap > 10) {
                                return $('#gacha_link_area a:regex(href, akr%2Fmain%2Fevent%2F(dtraining|herosta)%2F)').clickJ().length > 0
                                    || $('#basic_menu_area a[href*="main%2Fscout%2Fmain"]').clickJ().length > 0;
                            }
                            return false;
                        }],
                        ['funcR', function () {
                            if ($('div.arena_cost_area > img[src*="icon_playcost.png"]').length > 0) {
                                return $('#gacha_link_area a:regex(href, akr%2Fmain%2Fevent%2F(victoryroad)%2F)').clickJ().length > 0
                                    || $('#basic_menu_area a[href*="main%2Farena%2Fmain"]').clickJ().length > 0;
                            }
                            return false;
                        }],
                        ['switch'],
                        ['hold']]],
                    [/main%2Fpresent%2Fevent%2Freceive%2Fmain/, 'list', [
                        ['formJ', '#shortCutForm'],
                        ['aJ', this.cssmypage]]],
                    [/main%2Fpresent%2Freceive%2Fmain%2Fbulk_list/, 'list', [
                        ['aJ', '#shortCutForm a[href*="main%2Fpresent%2Freceive%2Fmain%2Freceive_exe"]'],
                        //['formJ', '#shortCutForm'],
                        ['aJ', this.cssmypage]]],
                    [/main%2Fpresent%2Freceive%2Fmain%2Fgacha_result/, 'aJ', '#shortCut'],
                    [/main%2Fpresent%2Freceive%2Fmain(%2Findex|%3F)/, 'list', [
                        ['funcR', function () {
                            if ($('#d9-main > div > table > tbody > tr > td > div:contains("プレゼントを受け取れませんでした")').length > 0) {
                                //alert("cardbox full");
                                return true;
                            }
                            GM_setValue("nine_reinforce_page", 1);
                            GM_setValue("nine_reinforce_idx", 0);
                        }],
                        ['aJ', '#shortCutForm a[href*="main%2Fpresent%2Freceive%2Fmain%2Freceive_exe"]'],
                        ['formJ', '#shortCutForm'],
                        ['aJ', '#d9-main a:regexText(期限あり(.*[^0].*))'],
                        ['aJ', '#d9-main a:regexText(期限なし(.*[^0].*))']]],
                    [/akr%2Fmain%2Fpresent%2Freceive%2Fmain%2Ftactics_result/, 'aJ', 'a[href*="main%2Fpresent%2Freceive%2Fmain"]'],
                    [/main%2Freinforce%2Fmain%3Ferror_no/, 'list', [
                        ['aJ', this.cssmypage]]],
                    [/main%2Freinforce%2Fmain%2Findex%2F/, 'aJ', 'a[href*="main%2Freinforce%2Fmain%2Frecommendexe"]'],
                    [/main%2Freinforce%2Fmain%2Fwith_item%3F/, 'aJ', 'a[href*="main%2Freinforce%2Fmain%2Frecommendexe"]'],
                    [/main%2Freinforce%2Fmain%2Fitem_use_confirm/, 'formJ', 'form[action*="main%2Freinforce%2Fmain%2Fitem_use_execute"]'],
                    [/^akr%2Fmain%2Freinforce%2Fmain%2Fselect_base_card/, 'func', () => {
                        var opt = $('#sort > option:contains("レア度高い順")');
                        GM_log(opt);
                        if (opt.length === 0) return;
                        if (opt.prop('selected') !== true) {
                            opt.prop('selected', true);
                            $('form > input.button_global.fontS.sizeM[value="表示"]')[0].click();
                            //GM_setValue("nine_reinforce_page", 6);
                            //GM_setValue("nine_reinforce_idx", 0);
                            return;
                        }
                        
                        var d_page = GM_getValue("nine_reinforce_page", 1);
                        var d_idx = GM_getValue("nine_reinforce_idx", 0);
                        GM_log(d_page);
                        GM_log(d_idx);
                        var c_page = $('#d9-main > div:nth-child(1) > div.pagination > span.active').text().match(/\d+/);
                        if (c_page) {
                            c_page = +c_page[0];
                        } else {
                            return;
                        }
                        GM_log(c_page);
                        if (c_page < d_page) {
                            if ($('#d9-main > div:nth-child(1) > div.pagination > span > a:contains("' + d_page + '")').clickJ().length > 0) return;
                            $('#d9-main > div:nth-child(1) > div.pagination > span:not(.next) > a:last').clickJ();
                            return;
                        } else if (c_page > d_page) {
                            return;
                        }
                        //return;
                        var cards = $('#d9-main > div:nth-child(1) > div.frame_2014_90:eq(' + d_idx + ')');
                        if (cards.length === 0) {
                            //GM_deleteValue("nine_reinforce_idx");
                            //GM_deleteValue("nine_reinforce_page");
                            GM_log("card_empty");
                            return;
                        }
                        var rare_map = {
                            'ノーマル': 1,
                            'レギュラー': 2,
                            'グレート': 3,
                            'パズル': 4,
                            'スター': 5,
                            'スター+': 6,
                            'スーパースター': 7,
                            'ドリームスター': 8,
                            'ドリームスーパースター': 9,
                            'ドリームダイヤモンドスター': 10
                            };
                        var rare_card = cards.find('div.tag_box_label > span:last').text().trim().split(/\s/).pop();
                        GM_log(rare_card);
                        if (rare_map[rare_card] >= 5) {
                            d_idx++;
                            if (d_idx >= 10) {
                                d_page ++;
                                d_idx -= 10;
                            }
                            GM_setValue("nine_reinforce_page", d_page);
                            GM_setValue("nine_reinforce_idx", d_idx);
                            //return;
                            return cards.find('div > a:contains("選手カードで強化")').clickJ().length > 0;
                        } else {
                            //GM_deleteValue("nine_reinforce_page");
                            //GM_deleteValue("nine_reinforce_idx");
                            //$(this.cssmypage).clickJ();
                        }
                        //GM_deleteValue("nine_reinforce_page");
                        //GM_deleteValue("nine_reinforce_idx");
                    }],
                    [/^akr%2Fmain%2Freinforce%2Fmain%2Fbulk_confirm/, 'aJ', '#d9-main > form > div > input[value="一括強化する"]'],
                    [/^akr%2Fmain%2Freinforce%2Fmain%2Fbulk/, 'func', function () {
                        var no_card = $('#content_body > div > span:contains("コーチ転身出来る選手がいません。")');
                        if (no_card.length > 0) {
                            $('#content_body > div.frame_2014_90 > div.tag_box_label > div > a:contains("別の選手にする")').clickJ();
                            return;
                        }
                        var rare_map = {
                            'ノーマル': 1,
                            'レギュラー': 2,
                            'グレート': 3,
                            'パズル': 4,
                            'スター': 5,
                            'スター+': 6,
                            'スーパースター': 7,
                            'ドリームスター': 8,
                            'ドリームスーパースター': 9,
                            'ドリームダイヤモンドスター': 10
                            };
                        
                        var card_base = $('#content_body > div.frame_2014_90');
                        
                        var fit = true;
                        var rare_card_base = card_base.find('div.tag_box_label > span:nth-child(2)').text().trim().split(/\s/).pop();
                        GM_log("base:" + rare_card_base);
                        rare_card_base = rare_map[rare_card_base];
                        
                        var cards = $('#content_body > form > div.frame_2014_90');
                        if (cards.length === 0) {
                            GM_log(cards);
                            return;
                        }
                        cards.each(function() {
                            var rare_m = $(this).find('div.tag_box_label > span:nth-child(2)').text().trim().split(/\s/).pop();
                            GM_log(rare_m);
                            if (rare_map[rare_m] > rare_card_base) {
                                fit = false;
                            }
                        });
                        if (fit) {
                            $('#all').clickJ(0);
                            $('#input').clickJ();
                        }
                    }],
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
                        ['aJ', this.cssmypage]]],
                    [/main%2Fscout%2Fmain%2Fboss%3F/, 'aJ', 'a#shortCut'],
                    [/main%2Fscout%2Fmain%2Fboss_result%3/, 'list', [
                        ['aJ', 'a#shortCut']]],
                    [/main%2Fscout%2Fmain%2Fconfirm%3F/, 'aJ', '#bg_scout a:contains("決定する")'],
                    [/main%2Fscout%2Fmain%2Ffield%3F/, 'list', [
                        ['aJ', 'a:contains("ヒロスタへ")'],
                        ['aJ', 'a#shortCut'],
                        ['aJ', this.cssmypage]]],
                    [/main%2Fscout%2Fmain%2Ffriend/, 'aJ', '#bg_scout > div > div > a[href*="main%2Fscout%2Fmain%2Ffriend_exe"]'],
                    [/main%2Fscout%2Fmain%2Fscout_flash/, 'flashJT', '#tween_b_root'],
                    [/main%2Fscout%2Fmain%2Fspecial%3/, 'list', [
                        ['aJ', '#bg_scout a:contains("挑戦する")']]],
                    [/main%2Fscout%2Fmain%2Fspecial_result%3/, 'list', [
                        ['aJ', 'a#shortCut']]],
                    [/main%2Fscout%2Fmain%3F/, 'list', [
                        ['aJ', 'a#shortCut'],
                        ['aJ', '#bg_scout a:contains("最新エリア")']]],
                    [/main%2Ftitle%2Fmain/, 'aJ', this.cssmypage],
                    [/[\s\S]*/, 'hold'],
                    [/XXXXXXXXXXXXX/]
                ];
            }
        },
        "12006884" : {
            mypage_url : "http://sp.pf.mbga.jp/12006884",
            rotation_time : 5,
            cssmypage : '#ctl00_HeaderNavi_hl_top',
            get_actions : function () {
                return [
                    [/^:::$/, 'aJ', '#ctl00_body_hl_mypage_sp'],
                    [/^duty%2Fseries_success%2Fseries_success_season_start_or_end\.aspx/, 'aJ', '#ctl00_body_hl_series_success_start'],
                    [/^duty%2Fseries_success%2Fseries_success_exe_complet\.aspx/, 'list', [
                        ['aJ', '#ctl00_body_hl_series_success_start'],
                        ['aJ', '#ctl00_body_hl_top']]],
                    [/^duty%2Fseries_success%2Fseries_success_exe_confirm\.aspx/, 'list', [
                        ['aJ', '#ctl00_body_Button1'],
                        ['aJ', '#ctl00_body_Button2']]],
                    [/^duty%2Fseries_success%2Fseries_success_order_regist\.aspx/, 'aJ', '#ctl00_body_hl_order_regist_top'],
                    [/^duty%2Fseries_success%2Fseries_success_top\.aspx/, 'list', [
                        ['funcR', () => {
                            var ap = $('#ctl00_body_DutyStaminaEmptyControl_divDutyStaminaEmpty > div.kadomaru > div.kadomaru_alltop:contains("体力が足りない")');
                            GM_log(ap);
                            GM_log(ap.length);
                            if (ap.length > 0) {
                                GM_log(this.cssmypage);
                                return $(this.cssmypage).clickJ().length > 0;
                            }
                        }],
                        ['aJ', '#ctl00_body_hl_chapter_progress'],
                        ['aJ', '#ctl00_body_hl_reset'],
                        ['aJ', '#ctl00_body_rp_chapter_list_ctl02_hl_chapter']]],
                    [/^gacha%2Fgacha_new_result\.aspx/, 'list', [
                        ['aJ', '#ctl00_body_hl_gift'],
                        ['hold']]],
                    [/^general%2Fnews_detail\.aspx/, 'aJ', this.cssmypage],
                    [/^gift%2Freceive_list\.aspx/, 'list', [
                        ['aJ', '#ctl00_body_rp_navi_ctl00_btn_receive'],
                        ['aJ', '#ctl00_HeaderNavi_hl_top']]],
                    [/^login_bonus%2Flogin_bonus_stamp\.aspx/, 'aJ', '#ctl00_body_hl_gift_top_sp'],
                    [/^mix%2Fmix_card_list_base_sp\.aspx/, 'func', function () {
                        if (document.URL.match(/rid%3D1/)) {
                            GM_log("sub_player");
                            var opt = $('#ddl_sort > option:contains("ｺｽﾄ高い順")');
                            GM_log(opt);
                            if (opt.prop('selected') !== true) {
                                opt.prop('selected', true);
                                $('#btn_condition')[0].click();
                                return;
                            }
                        }
                        var item = $('#regular_fielder, #regular_pitcher, #sub_player').find('div > div > div > dl:nth-child(2) > a:contains("限界突破可能!!")');// :contains("限界突破可能!!")
                        GM_log(item);
                        if (item.length > 0) {
                            item[0].click();
                            return;
                        }
                        $('#ctl00_body_hlSubPlayer')[0].click();
                        $('#BottomcarouselInner > ul > li:has(a:not(:has(div))) + li > a').clickJ();
                    }],
                    [/^mix%2Fmix_card_list_limit_sp\.aspx/, 'func', function () {
                        var check = $('#material_player > div > div > div > dl:nth-child(2) > a > div.mix_status_box_base');//'#ctl00_body_rp_ctl00_cardListSubPlayer_hlBaseSelect > div.mix_status_box_base > div');
                        //GM_log(check[0]);
                        //check[0].click();
                        check.each(function () { $(this)[0].click(); GM_log($(this));});
                        //check.prop('checked', true);
                        if (check.length > 0) {
                            $('#cfm_mix2')[0].click();
                            $('#exec_mix')[0].click();
                        }
                        tryUntil(function () {
                            var click = $('#enchant-stage > div > div:nth-child(35)');
                            return click.touchJ().length > 0;
                        });
                        //$('#enchant-stage > div > div:nth-child(34)')[0].click();
                    }],
                    [/^mix%2Fmix_card_list_plus_sp\.aspx/, 'func', function () {
                        $('body > div > div > div > a:contains("限界突破")').clickJ();
                    }],
                    [/^top\.aspx/, 'list', [
                        ['aJ', 'a:contains("選手名鑑に選手が追加されました")'],
                        ['aJ', 'a:contains("件届いてるよ！")'],
                        ['funcR', function (){
                            if ($('dd.mypowergage > div').attr('style').match(/width:(?:100|[1-9][0-9])%/)) {
                                return $('a[href*="%3Fbid%3D20160505_vic"]').clickJ().length > 0
                                    || $('#ctl00_body_hl_series_success').clickJ().length > 0;
                            }
                        }],
                        ['funcR', () => {
                            if ($('#ctl00_body_d_background > div.main-content > div.statusbox > dl.mybp > dd:nth-child(2) > span').text() > 0) {
                                return $('#ctl00_body_hl_battle_sp').clickJ().length > 0;
                            }
                        }],
                        ['switch'],
                        ['hold']]],
                    [/^tower%2Ftwr_battle_result\.aspx/, 'aJ', '#wrapper > div.txt-center-pos.mg-tb-15 > a[href*="tower%2Fapi%2Ftwr_select_user.ashx"]'],
                    [/^tower%2Ftwr_top\.aspx/, 'aJ', '#ctl00_ctl00_body_body_part_TwrTopInfo_sp_hl_button'],
                    [/^tower%2Ftwr_user_select\.aspx/, 'aJ', '#ctl00_ctl00_body_body_part_Repeater_ctl00_twrTargetUserInfo_hl_battle_confirm'],
                    [/^user%2Fplayers_nomal\.aspx/, 'aJ', this.cssmypage],
                    [/^(user_battle%2Ftraining|tower%2Ftwr)_battle_confirm\.aspx/, 'func', () => {
                        var disable = $('li.bppos-1:not(.disable)').clickJ().length === 0;
                        tryUntil(function () {
                            return $('#bpsubmit[value*="BP1"]').clickJ().length > 0;
                        });
                        if (disable) {
                            //if (!document.referrer.match(/duty%2Fseries_success%2Fseries_success_top\.aspx/)) {
                            if (document.referrer.match(/user_battle%2Ftraining_battle_select\.aspx/)) {
                                $(this.cssmypage).clickJ();
                            }
                            $('#ctl00_ctl00_body_body_part_img_item_1').clickJ();
                            return;
                        }
                    }],
                    [/^user_battle%2Ftraining_battle_result\.aspx/, 'aJ', '#wrapper > div.txt-center-pos.mg-tb-15 > a'],
                    [/^user_battle%2Ftraining_battle_select\.aspx/, 'aJ', '#ctl00_body_Repeater_ctl00_hl_battle_confirm_sp'],
                    [/^user_battle%2Ftraining_battle_turningpoint\.aspx/, 'aJ', '#ctl00_body_btn_choice_1'],
                    [/^victory_order%2Fvic_deck_change\.aspx/, 'func', function () {
                        if ($('#clay_content > div > div > div.order-status-box > div.change-ordernum-red').length > 0) {
                            $('#ctl00_ctl00_body_body_part_hl_exchange_order_hl_smart_link').clickJ();
                        } else {
                            $('#ctl00_ctl00_body_body_part_Button1').clickJ();
                        }
                    }],
                    [/^victory_order%2Fvic_deck_change_confirm\.aspx/, 'aJ', '#ctl00_ctl00_body_body_part_Button1'],
                    [/^victory_order%2Fvic_deck_change_result.aspx/, 'aJ', '#ctl00_ctl00_body_body_part_vicMissionLink_rp_ctl0' + Math.floor(Math.random(3)) + '_hl_duty'],
                    [/^victory_order%2Fvic_mission_result\.aspx/, 'list', [
                        ['aJ', '#ctl00_ctl00_body_body_part_hl_execute'],
                        ['aJ', '#ctl00_ctl00_HeaderNavi_hl_top']
                    ]],
                    [/^victory_order%2Fvic_top\.aspx/, 'list', [
                        //['hold'],
                        ['funcR', function () {
                            var ticket = $('#clay_content > div.vo-rankbox > dl.vo-ticket > dd').text().match(/(\d+)/);
                            if (ticket && +ticket[1] > 0) {
                                return $('#ctl00_ctl00_body_body_part_vicMissionLink_vic_ticket_btn').clickJ().length > 0;
                            }
                        }],
                        ['aJ', '#ctl00_ctl00_body_body_part_vicMissionLink_rp_ctl0' + Math.floor(Math.random(3)) + '_hl_duty'],
                    ]],
                    [/^swf/, 'flashJT', '#container > canvas'],//, 100, 350],
                    [/[\s\S]*/, 'hold'],
                    [/XXXXXXXXXXXXXXXXXX/]
                ];
            }
        },
        "12018608" : { // irregular
            mypage_url : "http://g12018608.sp.pf.mbga.jp",
            rotation_time : 5,
            cssmypage : '#bg > header > nav.buttonMypage > a',
            get_actions : function () {
                return [
                    [/^(:::|top)$/, 'aJ', '#bg a:contains("マイページ")'],
                    [/^battle2?%2Faction%2F/, 'flashJT', '#canvas'],
                    [/^battle2?%2Fbattle/, 'list', [
                        ['funcR', function () {
                            if ($('#but2[commandname="復活"]').clickJ().length > 0) {
                                return $('#useOK > div > a').clickJ().length > 0;
                            }
                        }],
                        ['funcR', function () {
                            $('#but3').clickJ();
                            $('#dear > ul > li:nth-child(1) > div > img').clickJ();
                            setTimeout(function f1() {
                                if ($('#cUse[href]').clickJ().length === 0) {
                                    setTimeout(f1, 1000);
                                }
                            }, 1000);
                        }],//#cUse
                        ['hold']]],
                    [/^event_story%2Fs%2Ftika_op/, 'flashJT', '#cv0'],
                    [/^fusion%2Ffusion/, 'flashJT', '#canvas'],
                    [/^login%2Findex%2F/, 'flashJT', '#canvas'],
                    [/^login_flash%2Findex%2F/, 'flashJT', '#canvas'],
                    [/^mypage/, 'list', [
                        //['hold'],
                        ['aJ', '#mypageMenu > div.mypageMenuBg > div.battle.open > a'],
                        ['aJ', '#newsDetail > article > ul > li > a[href*="pick%2Ftop%2Ffree"]'],
                        ['funcR', function () {
                            var last_present = GM_getValue('irregular_present_full', 0);
                            if (last_present + 30 * 6 * 1000 < Date.now()) {
                                return $('#present > a').clickJ().length > 0;
                            }
                        }],
                        ['funcR', function () {
                            var mp = $('#mypageMenu > div.mypageMenuBg > div.event.open > div.gaugeMpBox > dl');
                            if (mp.length === 0) return;
                            if (mp.hasClass("cost5") || mp.hasClass("cost6")) {
                                //return $('#mypageMenu > div.mypageMenuBg > div.event.open > a').clickJ().length > 0;
                            }
                        }],
                        ['funcR', function () {
                            var st = $('#mypageMenu > div.gaugeStBox > dl > dt').text().match(/(\d+)\//);
                            st = +st[1];
                            if (st > 10) {
                                return false
                                    || $('#mypageMenu > div.mypageMenuBg > div.event.open > a').clickJ().length > 0
                                    || $('#mypageMenu > div.mypageMenuBg > div.story > a').clickJ().length > 0;
                            }
                        }],
                        ['switch'],
                        ['hold']]],
                    [/^pick%2Fresult/, 'list', [
                        ['aJ', 'a[href*="pick%2Frun"]:last()'],
                        ['aJ', this.cssmypage]]],
                    [/^pick%2Frun/, 'flashJT', '#canvas'],
                    [/^pick%2Ftop%2Ffree/, 'aJ', '#gacha > div.p10.txC > div > a'],
                    [/^present%2Fconfirm%2F/, 'list', [
                        ['formJ', '#bg > section > article > div > form'],
                        ['setGMV', 'irregular_present_full', Date.now()],
                        ['aJ', this.cssmypage]]],
                    [/^present%2Findex%2F/, 'list',[
                        ['clearGMV', 'irregular_present_full'],
                        ['aJ', 'a.on:contains("一括で受け取る")'],
                        ['aJ', 'div.countBeing + a'],
                        ['aJ', this.cssmypage],
                        ['hold']]],
                    [/quest%2FbossSuccess/, 'aJ', 'a:contains("次のステージへ")'],
                    [/^quest%2Fboss/, 'aJ', 'a:contains(戦闘する)'],
                    [/^quest%2F(clearStage|get(Card|Social)|levelUp)/, 'aJ', 'div.questNextButton > a'],
                    [/^quest%2FclearStage/, 'aJ', 'div.questNextButton > a'],
                    [/^quest%2FnoAction%2F/, 'aJ', this.cssmypage],
                    [/^quest%2Fstep/, 'flashJT', '#canvas'],
                    [/^quest%2Ftop/, 'list', [
                        ['aJ', 'div.questListButton.newStage > a']]],
                    [/^questStory%2Fquest/, 'flashJT', '#cv0'],
                    [/^[a-zA-Z0-9]+%2FattackResult%2F/, 'list', [
                        ['aJ', '#bg > section.window.wide > div > div.helpCommand > div.helpCommandWindow > ul > li:nth-child(1) > div > div.p5 > div > a'],
                        ['aJ', '#bg > ul > li > a:contains("ステージを進行する")']]],
                    [/^[a-zA-Z0-9]+%2Fbattle_list/, 'list', [
                        ['aJ', 'a[href*="%2Fbattle"]:contains("結果")'],
                        ['aJ', 'a[href*="%2Fparty_select"]:contains("参戦")'],
                        ['aJ', '#bg > ul > li > a:contains("イベントTOP")'],
                        ['hold']]],
                    [/^[a-zA-Z0-9]+%2Fbattle%2F/, 'list', [
                        ['funcR', function () {
                            //$('body > section > article > div.coopMainCommand > div.magicButton > img#enabledMagic1').clickJ();
                            //return false;
                            setInterval(function () {
                                if ($('#supportForm > div:nth-child(3) > ul > li:nth-child(1) > div > input:visible()').clickJ().length > 0 || $('#dialogRoot > section > article > div.p10.txC > div > a:visible()').clickJ().length > 0) {
                                    return true;
                                }
                                $('#loseDialogRoot > section > article > div.px10.my10 > ul > li:nth-child(1) > div > a:visible():regex(href, [a-zA-Z]*%2Ftop)').clickJ(0).length > 0 ||
                                $('#loseDialogRoot:visible()').length > 0 ||
                                $('#resultButton > div > a:visible()').clickJ(0).length > 0 ||
                                $('div.magicButton[style*="z-index: 2001"]:has(img#enabledMagic0)').length > 0 ||
                                $('img#enabledMagic0:visible').clickJ(0).length > 0 ||
                                $('div.magicButton[style*="z-index: 2001"]:has(img#enabledMagic1)').length > 0 ||
                                $('img#enabledMagic1:visible').clickJ(0).length > 0 ||
                                $('div.magicButton[style*="z-index: 2001"]:has(img#enabledMagic2)').length > 0 ||
                                $('img#enabledMagic2:visible').clickJ(0).length > 0 ||
                                $('div.magicButton[style*="z-index: 2001"]:has(img#enabledMagic3)').length > 0 ||
                                $('img#enabledMagic3:visible').clickJ(0).length > 0 ||
                                $('div.magicButton[style*="z-index: 2001"]:has(img#enabledMagic4)').length > 0 ||
                                $('img#enabledMagic4:visible').clickJ(0).length > 0 ||
                                $('#actionButton > a.attackWait').clickJ(0).length > 0;
                            }, 1000);
                            return true;
                        }],
                        ['hold']]],
                    [/^[a-zA-Z0-9]+%2Fbox_reset/, 'formJ', 'form[action*="box_reset_result"]'],
                    [/^[a-zA-Z0-9]+%2Findex/, 'list', [
                        ['aJ', '#aNormal:not(.noMP)'],
                        ['aJ', '#bg > ul > li > a:contains("イベントTOP")']]],
                    [/^[a-zA-Z0-9]+%2Fjoin/, 'aJ', '#bg > ul > li > a:contains("イベントTOP")'],
                    [/^[a-zA-Z0-9]+%2Fparty_select/, 'list', [
                        ['funcR', () => {
                            if (document.referrer.match(/%2Fparty_select/)) {
                                if ($('#bg > section > article > div.whiteBand.py10.txC > div.button.main.middle > a').clickJ().length === 0) {
                                    $(this.cssmypage).clickJ();
                                }//a:contains("救援する")
                                return true;
                            }
                        }],
                        ['aJ', 'a:contains("オススメ編成")']]],
                    [/^[a-zA-Z0-9]+%2FpickResult%2F/, 'list', [
                        ['aJ', 'a:contains("ガチャる"):last()'],
                        //['hold'],
                        ['aJ', '#bg > ul > li > a:contains("イベントTOP")']]],
                    [/^[a-zA-Z0-9]+%2Fpresent_select/, 'list', [
                        ['aJ', '#bg a:regex(href, %2Fpresent%2F.%2F.):last()']]],
                    [/^[a-zA-Z0-9]+%2FpresentResult/, 'aJ', '#bg > section.window.wide > article > div > div > div > a'],
                    [/^[a-zA-Z0-9]+%2Fpresent/, 'flashJT', '#canvas'],
                    [/^[a-zA-Z0-9]+%2Fquest/, 'func', () => {
                        setInterval(() => {
                            $('#battleBoss:visible()').clickJ().length > 0 ||
                            $('#but4.commandButton.on').clickJ().length > 0 ||
                            $('#but3.commandButton.on').clickJ().length > 0 ||
                            $('#but2.commandButton.on').clickJ().length > 0 ||
                            $('#but1.commandButton.on').clickJ().length > 0 ||
                            ($('#mpLamp.cost0').length > 0 && $('#but3.questButton.active > a').length > 0) ||
                            $('#but3.questButton.active > a').clickJ().length > 0 ||
                            $('#but2.questButton.on').clickJ().length > 0 ||
                            $('#but1.questButton.on').clickJ().length > 0 ||
                            ($('#but1.questButton.off').length > 0 && $(this.cssmypage).clickJ().length > 0);
                        }, 2000);
                    }],
                    [/^[a-zA-Z0-9]+%2Fraid/, 'flashJT', '#canvas'],
                    [/^[a-zA-Z0-9]+%2Fresult/, 'aJ', 'a:contains("イベントTOP")'],
                    [/^[a-zA-Z0-9]+%2Fsupport/, 'list', [
                        ['aJ', '#bg > ul > li > a:contains("戦闘準備に戻る")'],
                        ['aJ', this.cssmypage]]],
                    [/^[a-zA-Z0-9]+%2Fticket/, 'list', [
                        ['aJ', 'a.on:contains("BOXをリセットする")'],
                        ['aJ', 'a[href*="%2Fpick"]:last()']]],
                    [/^[a-zA-Z0-9]+%2Ftop/, 'list', [
                        ['funcR', function () {
                            var count = $('dl.status.nameSelf > dt:contains("ガチャキューブ所持数") + dt').text().match(/\d+/);
                            if (count) {
                                count = +count[0];
                                if (count > 10) {
                                    return $('a[href*="%2Fticket"]').clickJ().length > 0;
                                }
                            }
                        }],
                        // tika
                        ['aJ', 'a[href*="%2Fparty_select%2F1%2F"]:last()'],
                        ['aJ', 'a[href*="battle_list"]'],
                        // 
                        ['aJ', '#bg > section > div > div.raidAction > div > ul > li:nth-child(2) > div > a:not(:has(dl.cost0))'],
                        ['aJ', '#bg > section > div > div.raidAction > div a'],
                        ['hold']]],
                    [/(Flash|battleAnimation)%2F/, 'flashJT', '#canvas'],
                    [/[\s\S]*/, 'hold'],
                    [/XXXXXXXXXXXX/]
                ];
            }
        },
        "12014627" : { // dragon tactics
            mypage_url : "http://g12014627.sp.pf.mbga.jp",
            rotation_time : 5,
            cssmypage : '#main > header > a.mypage',
            wait_confirm : function(csscheck, cssconfirmArr) {
                var idx = 0;
                function wait () {
                    if ($(cssconfirmArr[idx]).clickJ().length > 0) {
                        idx += 1;
                    }
                    if (idx < cssconfirmArr.length) {
                        setTimeout(wait, 1000);
                    }
                }
                if ($(csscheck).clickJ(0).length > 0) {
                    wait();
                    return true;
                }
            },
            get_actions : function () {
                return [
                    [/^:::$/, 'aJ', 'a:contains("マイページ")'],
                    [/^boss%2Fwin/, 'list', [
                        ['aJ', '#main > a.btn_type1_l']]],
                    [/^boss%3F/, 'aJ', '#main > a.btn_battle_start'],
                    //[/^campaign%2Findex/, 'func', () => {alert("campaign!!!");}],
                    [/^feature%2Ffloortreasurelist/, 'list', [
                        ['aJ', '#main > a'],
                        ['aJ', this.cssmypage]]],
                    [/^feature%2Fmodule%2F[0-9]+%2Farena%2Fconfirm/, 'list', [
                        ['aJ', '#head_module > a'],
                        ['aJ', this.cssmypage]]],
                    [/^feature%2Fmodule%2F[0-9]+%2Farena%2Fdone/, 'aJ', '#head_module > a'],
                    [/^feature%2Fmodule%2F[0-9]+%2Farena%2Findex/, 'list', [
                        ['aJ', '#main > div > div.bg > div > div.status_user > a:contains("召喚獣を呼び出す"):first'],
                        ['aJ', '#main > div > div.bg > div > div.status_user > a:contains("バトルを挑む"):first']]],
                    [/^feature%2Fmodule%2F[0-9]+%2Fraid%2Fdone/, 'list', [
                        ['aJ', '#main > div.list_sort > a.btn_type2_m:contains("進撃に戻る")'],
                        ['aJ', '#main > block_list2 > a:contains("宝箱を開ける")']]],
                    [/^feature%2Fmodule%2F[0-9]+%2Ftower%2Fmove%/, 'aJ', '#main > a.btn_quest_skip'],
                    [/^feature%2Fmodule%2F[0-9]+%2Ftower%2Frequest/, 'list', [
                        ['aJ', '#main > a:contains("盟友に援軍依頼を出す")'],
                        ['func', () => {
                        if (GM_getValue("dt_support_done", 0) > 0) {
                            GM_deleteValue("dt_support_done");
                            $('#main > a.btn_type3_l').clickJ();
                        } else {
                            GM_setValue("dt_support_done", 1);
                            $('#main > a:contains("おすすめ仲間に援軍依頼を出す")').clickJ();
                        }
                        }]]],
                    [/^feature%2Fmodule%2F183%2Farena%2Frequestdone/, 'aJ', '#main > a.btn_type2_l'],
                    [/^feature%2Fmodule%2F[0-9]+%2Ftowermonster%2Fdone/, 'aJ', '#main > a:contains("ダンジョンへ進む")'],
                    [/^feature%2Fmodule%2F[0-9]+%2Ftower%2Fdone/, 'list', [
                        ['aJ', '#main > a:contains("まとめて剣礼")'],
                        ['aJ', '#wrapper_list > footer > a.link3']]],
                    [/^feature%2Fmodule%2F[0-9]+%2Ftower%2Findex/, 'list', [
                        ['aJ', '#popup-navi > div > a'],
                        ['hold']]],
                    [/^feature%2Fmodule%2F[0-9]+%2Fteamduel%2Fconfirm/, 'list', [
                        ['aJ', '#head_module > a'],
                        ['aJ', '#main > div.table_div > div:nth-child(1) > a']]],
                    [/^feature%2Fmodule%2F189%2Fteamduel%2Fdone/, 'hold'],
                    [/^feature%2Fmodule%2F[0-9]+%2Fteamduel%2Findex/, 'aJ', 'div.bg > list_knight > a:first'],
                    [/^feature%2Fmodule%2F[0-9]+%2Fteamduel%2Frequest/, 'list', [
                        ['aJ', '#main > a'],
                        ['hold']]],
                    /*[/^feature%2Fmodule%2F182%2Ftowermonster%2Findex/, 'list', [
                        ['aJ', '#main a.btn_raid_type3'],
                        ['aJ', '#main > a.btn_type2_l'], //援軍
                        [
                        ]]],*/
                    //[/^feature%2Fmodule/, 'list', [
                    //    ['aJ', '#main > a.btn_quest_skip'],
                    //    ['hold']]],
                    [/^feature%2Ftowerlist%2F/, 'list', [
                        ['aJ', '#main > div.card_list_wrapper > div.bg > div > boss_status_raid > a']]],
                    [/^feature%2Ftreasurelist%2F/, 'aJ', '#main > a:contains("表示中の戦利品をまとめて受け取る")'],
                    [/^feature%2Ftreasuredone/, 'aJ', this.cssmypage],
                    [/^friend%2Faccept/, 'aJ', '#main > a'],
                    [/^friend%2Fconfirm/, 'aJ', '#main > a:contains("盟友になる")'],
                    [/^friend%2Fwaitfor/, 'list', [
                        ['aJ', 'div.status_user > a:first'],
                        ['aJ', this.cssmypage]]],
                    [/^gacha%2Fbronze/, 'list', [
                        ['funcR', () => {
                            return this.wait_confirm('a:contains("ガチャを引く"):last()', 
                                ['#wrapper_list > div.default_popup > div > div.list_sort > a:nth-child(1)']);
                        }],
                        ['aJ', this.cssmypage]]],
                    [/^gacha%2F(lump)?done/, 'list', [
                        ['funcR', () => {
                            return this.wait_confirm('a:contains("ガチャを引く"):last()',
                                ['#wrapper_list > div.default_popup > div > div.list_sort > a:nth-child(1)']);
                        }],
                        ['aJ', 'a:contains("ガチャTOPへ")']]],
                    [/^my%3F/, 'list', [
                        ['aJ', 'div.bg > ul > li > a:contains("未受け取り戦利品があります")'],
                        ['aJ', 'div.bg > ul > li > a:contains("未受け取り宝箱があります")'],
                        ['aJ', 'div.bg > ul > li > a:contains("盟友申請が")'],
                        ['aJ', 'div.bg > ul > li > a:contains("プレゼントが")'],
                        ['funcR', () => {
                            var hp = $('#mypage_bg_v2 > div.player_status > div.gauge_hp_mini > div').attr("style").match(/:(\d+)%/);
                            if (hp) {
                                hp = hp[1];
                                if (hp > 10) {
                                    return $('#mypage_bg_v2 > div.btn > a.btn_quest_boost,.btn_quest').clickJ().length > 0;
                                }
                            }
                        }],
                        ['switch'],
                        ['hold']]],
                    [/^packgacha%2Findex/, 'list', [
                        ['aJ', 'a:contains("ブロンズ")']]],
                    [/^present%2Flist/, 'list', [
                        ['aJ', '#main > div.tab3_v2 > ul > li > a:contains("全て")'],
                        ['funcR', () => {
                            return this.wait_confirm('#main > a:contains("一括受け取り")',
                                ['#wrapper_list > div.default_popup > div > div.list_sort > a:nth-child(1)']);}
                        ],
                        ['aJ', this.cssmypage]]],
                    [/^quest%2F(crystal|done)/, 'aJ', '#main > a.btn_quest_skip'],
                    [/^quest%2Ffriend/, 'list', [
                        ['funcR', () => {
                            return this.wait_confirm('#quest_dialog > div > a.btn_type1_m',
                                ['#wrapper_list > div:nth-child(2) > div > form > div > div:nth-child(2) > input']);
                        }],
                        ['aJ', '#main > a.btn_quest_skip']]],
                    [/^quest%2Fget_princess/, 'aJ', '#main > a:contains("次の章へ進む")'],
                    [/^quest%2Ftired/, 'list', [
                        ['funcR', () => {
                            return this.wait_confirm('#main > div > div.bg > a.btn_type2_l:contains("使用")',
                                ['#wrapper_list > div > div > a.btn_type2_m', '#wrapper_list > div:nth-child(2) > div > a.btn_type3_m']);
                        }],
                        ['aJ', this.cssmypage]]],
                    [/^quest(%3F|$)/, 'list', [
                        ['aJ', '#main > a.btn_type1_l'],
                        ['aJ', '#main > div.quest_list > a']]],
                    [/^(feature%2Fmodule%2F[0-9]+%2F)?raid%2Fdone/, 'list', [
                        ['aJ', '#main > a.btn_raid_boss_search'],
                        ['aJ', '#main > div.list_sort > a:contains("進撃に戻る")']]],
                    [/^(feature%2Fmodule%2F[0-9]+%2F)?raid%2Findex/, 'list', [
                        ['aJ', '#main > div.list_sort a.btn_raid_type0']]],
                    [/^(feature%2Fmodule%2F[0-9]+%2F)?raid%2Fmain/, 'list', [
                        ['aJ', '#main > div.list_sort > div > a.btn_raid_type2'],
                        ['aJ', '#main > div.list_sort > div > a.btn_raid_type1'],
                        ['aJ', '#main > a.btn_type2_l'],
                        ['aJ', '#main > div.list_sort > a'],
                        ['aJ', '#main > a[href*="%2Fquest%"]'],
                        ['aJ', '#main > header > a.mypage']]],
                    [/^(feature%2Fmodule%2F[0-9]+%2F)?raid%2Fsosconf/, 'list', [//
                        ['aJ', 'div.bg > a:contains("盟友に援軍依頼を出す")'],
                        ['func', () => {
                            if (GM_getValue("dt_support_done", 0) > 0) {
                                GM_deleteValue("dt_support_done");
                                $(this.cssmypage).clickJ();
                            } else {
                                GM_setValue("dt_support_done", 1);
                                $('div.bg > a:contains("オススメに援軍依頼を出す")').clickJ();
                            }
                        }]]],                    //[/^gimmick%2Fview%2F(?:get_card|area|chapter_start)%3Ftk/, 'flashJ', 'body > div > div:has(svg) g'/*'div > svg > g > g > g > g > g:nth-child(2) > g:nth-child(12) > g > use'*//*, 20, 20*/],
                    [/^gimmick%2Fview/, 'flashJT', '#canvas, #bg-white, #main'],//, body > div', 38, 104],
                    [/[\s\S*]/, 'hold'],
                    [/XXXXXXXXXX/]
                ];
            }
        }
    };

    function msgloop(action_handler) {
        var i, j, list_action, succ, siteI, siteT, ele, sites = Object.keys(handler), siteStatic = new Set()
        GM_log('-msgloop--------------------------------------- ' + Date());
        var actions = action_handler.get_actions();
        function switch_site() {
            var new_app_id, now = Date.now(), switch_flag;
            if (typeof setSiteStatic_local !== "undefined") {
                siteStatic = setSiteStatic_local;
            }
            if (typeof setStopSite_local != "undefined") {
                siteStatic = new Set([...siteStatic, ...setStopSite_local]);
            }
            siteI = GM_getValue("site_loop_index", 0);
            siteT = GM_getValue("site_timeout_" + app_id, 0);
            if (siteT != siteT) {
                siteT = 0;
            }
            switch_flag = GM_getValue("site_switch_flag", "");
            if (now > siteT || switch_flag === app_id) {
                if (switch_flag === app_id) {
                    GM_deleteValue("site_switch_flag");
                    if (now <= siteT && siteStatic.has(app_id)) {
                        return false;
                    }
                }
                if (siteStatic.has(app_id)) {
                    new_app_id = app_id;
                } else {
                    do {
                        siteI = (siteI + 1) % sites.length;
                        new_app_id = sites[siteI];
                    } while(siteStatic.has(new_app_id));
                    GM_setValue("site_loop_index", siteI);
                    GM_setValue("site_switch_flag", 0);
                    GM_log("switch-site " + siteI + " " + siteT);
                }
                siteT = now + 60 * 1000 * handler[new_app_id].rotation_time;
                if (siteT != siteT/*NaN*/) {
                    //alert("error, no rotation_time, " + new_app_id);
                    siteT = now + 60 * 1000 * 5;
                }
                GM_setValue("site_timeout_" + new_app_id, siteT);
                GM_log(app_id);
                GM_log(new_app_id);
                window.location.href = handler[new_app_id].mypage_url;
                return true;
            } else {
                GM_log(siteT);
                GM_log(now);
                GM_log("switch time left - " + (siteT - now) / 1000);
            }
            return false;
        }
        succ = switch_site();
        function time_wait_flashJT(action) {
            //var cnt = 0;
            tryUntil(() => {
                var canvas = $(action[1]),
                    x = action[2],
                    y = action[3];
                if (canvas.length > 0) {
                    //canvas.clickFlash(x, y);
                    canvas.touchFlash(x, y);
                    return true;
                } else {
                    //GM_log('flashJT, wait flash ' + cnt);
                    //cnt += 1;
                    //if (cnt > 10) {
                    //    alert("illegal flash");
                    //    return true;
                    //}
                }                
            });
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
                    case 'aJGMV_Time':
                        if (!succ) {
                            if (GM_getValue(list_action[j][1], 0) + list_action[j][2] < Date.now()) {
                                GM_deleteValue(list_action[j][1]);
                                succ = $(list_action[j][3]).clickJ().length > 0;
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
                    case 'setCookie':case 'setGMV':
                        if (!succ) {
                            GM_setValue(list_action[j][1], list_action[j][2]);
                        }
                        break;
                    case 'clearGMV':
                        if (!succ) {
                            GM_deleteValue(list_action[j][1]);
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
                    case 'switch':
                        if (!succ && !siteStatic.has(app_id)) {
                            GM_setValue("site_switch_flag", app_id);
                            switch_site();
                        }
                        succ = true;
                        break;
                    default:
                        alert("msgloop - unknown msg - " + list_action[j][0]);
                        break;
                    }
                    GM_log("succ : " + succ);
                }
                //if (!succ) {
                    //unsafeWindow.alert('no action');
                //}
                break;
            }
        }

        if (i === actions.length) {
            //alert('no match:' + url);
            GM_log('no match:' + url);
        }

        //setTimeout(function () {location.reload(true); }, 600000);
        reload_page(120000);
    }

    match_app_id = url.match(/^http:\/\/sp\.pf\.mbga\.jp\/(\d+)(?:\S*[?&]url=http(?:%3A%2F%2F|:\/\/)[-_a-zA-Z0-9.]+(?:%2F|\/)([-_a-zA-Z%0-9.]+)\S*)?$/);
    if (!match_app_id) {
        match_app_id = url.match(/^http:\/\/g(\d+)\.sp\.pf\.mbga\.jp(?:\/(?:\S*(?:[?&]|&amp;)url=http(?:%3A%2F%2F|:\/\/)[-_a-zA-Z0-9.]+(?:%2F|\/)([-_a-zA-Z%0-9.]+)\S*)?)?$/);
    }
    GM_log(match_app_id);
    if (match_app_id) {
        url = match_app_id[2];
        if (url === undefined) {
            url = ":::";
        }
        GM_log("sURL: " + url);
        GM_log("REF : " + document.referrer);
        
        app_id = match_app_id[1];
        if (typeof setStopSite_local !== "undefined" && setStopSite_local.has (app_id)) {
            return;
        }
        //GM_log("short_url: " + url);
        action_handler = handler[app_id];
        if (action_handler) {
            msgloop(action_handler);
        }
    }
}());