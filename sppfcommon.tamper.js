// ==UserScript==
// @name       sp.pf.mbga.jp_local
// @namespace  http://tampermonkey.net/
// @version    0.1
// @description  enter something useful
// @match      http://*.sp.pf.mbga.jp/*
// @match      http://*.sp.mbga.jp/*
// @require    http://ajax.googleapis.com/ajax/libs/jquery/1.12.2/jquery.min.js
// @require    file:///D:/fefe/sppfragnarok_local.js
// @noframes
// @grant      GM_log
// @grant      GM_getValue
// @grant      GM_setValue
// @grant      GM_deleteValue
// @copyright  2012+, Yongxin Wang
// ==/UserScript==

(function () {
  'use strict';
  function decodeURLSearchParam(p) {
    var ret = {};
    for (var key of p.keys()) {
      ret[key] = p.get(key);
    }
    return ret;
  }

  var url = document.URL,
    decodeURL,
    path = location.pathname,
    param = decodeURLSearchParam(new URLSearchParams(location.search)),
    decodeParam,
    handler,
    //match_app_id,
    app_id,
    action_handler,
    un_loading = false;
  $(window).bind('beforeunload', function () {
    un_loading = true;
    GM_log("set unload");
  });

  GM_log('-start----------------------------------------- ' + Date());

  function getXPATH(xpath) {
    return document.evaluate(xpath, document, null, XPathResult.ANY_TYPE, null).iterateNext();
  }

  function clickSth(obj, eventname, xoff, yoff) {
    var rect,
      x,
      y,
      event;
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
      var event = document.createEvent("MouseEvents"),
        cancelled;
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
    (function local_func() {
      if (!func()) {
        setTimeout(local_func, 1000);
      }
    }
      ());
  }

  $.expr[':'].regex = function (elem, index, match) {
    //GM_log("regex");
    //GM_log(match);
    var matchParams = match[3].split(','),
      validLabels = /^(data|css):/,
      attr = {
        method: matchParams[0].match(validLabels) ? matchParams[0].split(':')[0] : 'attr',
        property: matchParams.shift().replace(validLabels, '')
      },
      regexFlags = 'ig',
      regex = new RegExp(matchParams.join('').replace(/^\s+|\s+$/g, ''), regexFlags);
    return regex.test(jQuery(elem)[attr.method](attr.property));
  };
  $.expr[':'].regexText = function (elem, index, match) {
    return (new RegExp(match[3])).test(elem.innerText);
  };
  $.fn.simMouseEvent = function (eveName, xoff, yoff) {
    var rect,
      x,
      y,
      eve;
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
  $.fn.getZoomLvl = function () {
    var zoom_lvl = 1;
    var zoomcheck = this;
    while (zoomcheck.prop('tagName')) {
      zoom_lvl = zoom_lvl * zoomcheck.css('zoom');
      zoomcheck = zoomcheck.parent();
    }
    return zoom_lvl;
  };
  $.fn.getBoundRectZoom = function () {
    var brect = this[0].getBoundingClientRect();
    var rect = { x: brect.left, y: brect.top, w: brect.width, h: brect.height };
    var zoomcheck = this, zoom_lvl = 1;
    while (zoomcheck.prop('tagName')) {
      brect = zoomcheck[0].getBoundingClientRect();
      zoom_lvl = + zoomcheck.css('zoom');
      rect.w *= zoom_lvl;
      rect.h *= zoom_lvl;
      rect.x = brect.left + (rect.x - brect.left) * zoom_lvl;
      rect.y = brect.top + (rect.y - brect.top) * zoom_lvl;
      if (zoom_lvl != 1) {
        GM_log("zoom lvl", zoom_lvl, rect.y, brect.top, rect.y - brect.top);
      }
      zoomcheck = zoomcheck.parent();
    }
    return rect;
  };
  $.fn.simTouchEvent = function (eveName, xoff, yoff) {
    var customEvent,
      rect,
      x,
      y,
      touchinfo;
    if (this.length === 0) {
      return this;
    }
    if (this[0].getBoundingClientRect) {
      rect = this[0].getBoundingClientRect();
      var zoom_lvl = this.getZoomLvl();

      //GM_log(zoom_lvl);
      if (xoff !== undefined && xoff < 1) {
        xoff = rect.width * zoom_lvl * xoff;
      }
      if (yoff !== undefined && yoff < 1) {
        yoff = rect.height * zoom_lvl * yoff;
      }
      x = rect.left * zoom_lvl + (xoff ? xoff : rect.width * zoom_lvl * 0.5);
      y = rect.top * zoom_lvl + (yoff ? yoff : rect.height * zoom_lvl * 0.5);
    } else {
      x = 0;
      y = 0;
    }
    customEvent = document.createEvent("MouseEvent");
    touchinfo = {
      clientX: x,
      clientY: y,
      pageX: x + window.scrollX,
      pageY: y + window.scrollY,
      screenX: x,
      screenY: y,
      target: this[0]
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
    var minmax = 1000000,
      id = -1,
      ele,
      nres,
      num,
      p = this,
      p1,
      i;
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
      if (un_loading) {
        GM_log("unloading ....");
        return;
      }
      GM_log("click flash ....");
      flash.simMouseEvent("mousemove", xoff, yoff);
      flash.simMouseEvent("mousedown", xoff, yoff);
      flash.simMouseEvent("mouseup", xoff, yoff);
      flash.simMouseEvent("click", xoff, yoff);
    }, 150);
    return this;
  };

  $.fn.touchFlash = function (xoff, yoff, interval) {
    if (this.length === 0) {
      return this;
    }
    var flash = $(this);
    GM_log("touchFlash: ");
    //GM_log(this);
    //flash.css("zoom", "1");
    //GM_log(flash);
    //flash.parent().css("zoom", "1");
    //GM_log(flash.parent());
    //alert(flash.text());
    if (interval === undefined || interval < 150) {
      interval = 150;
    }
    setInterval(function () {
      if (un_loading) {
        GM_log("unloading ....");
        return;
      }
      //flash.css("zoom", "1");
      //flash.parent().css("zoom", "1");
      //GM_log("touch flash ....");
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
    }, interval);
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
    var w = getXPATH(xpathw),
      a = getXPATH(xpatha);
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
      if (un_loading) {
        GM_log("unloading ....");
        return;
      }
      //GM_log("click Flash XPath");
      var canvas = getXPATH(xpath);
      if (canvas) {
        //clickSth(canvas,"mousemove",xoff,yoff);
        clickSth(canvas, "mousedown", xoff, yoff);
        //clickSth(canvas,"click",xoff,yoff);
        clickSth(canvas, "mouseup", xoff, yoff);
        clickSth(canvas, "click", xoff, yoff);
      }
    }, 150);
    return true;
    //}
    //else
    //{
    //    return false;
    //}
  }

  function clickMinMax(xpath1, xpath2, xpath3, minmaxflag) {
    var minmax = 1000000,
      id = 0,
      i = 1,
      ele,
      nres,
      num;
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
  function getCookie(c_name) {
    GM_log("get cookie : " + c_name);
    var c_value = document.cookie,
      c_start = c_value.indexOf(" " + c_name + "="),
      c_end;
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
    "12010455": { // avalon
      mypage_url: "http://sp.pf.mbga.jp/12010455",
      rotation_time: 5,
      xpathmypage: "//*[@id=\"main_header_menu\"]/ul/li[1]/a",
      cssmypage: "#mypage_btn > a",
      xpathquest: "//*[@id=\"main_header_menu\"]/ul/li[2]/a",
      no_gift_delay: 10 * 60,
      get_actions: function () {
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
          [['eventRaidboss/RaidbossAssistList'], 'list', [
            ['a', '//ul/li[div[1]/span/span[@class="icon_new"]]//a[text()="助けに行く"]'],
            ['aJ', '#contents > div > a:contains("マイページへ")']]],
          [/bossguildbattle%2FRaidbossBattleResult%2F/, 'list', [
            //['a', '//a[text()="イベントレイドボス応援一覧へ"]'],
            ['aJ', '#contents > div.raidboss_module a[href*="bossguildbattle%2FMissionActionLot"]']]],
          [/bossguildbattle%2FRaidbossHelpResult%2F/, 'a', '//a[text()="レイドボスバトルへ"]'],
          [['eventRaidBossLoop/RaidBossLoopTop'], 'list', [
            ['aJ', '#loopBossBtn > div > div.btn_5 > a']]],
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
            }
            ],
            ['aJ', this.cssmypage]]],
          [/battleTower%2FBattleTowerEnemyList/, 'list', [
            ['minmax', '//div[div[text()="対戦相手選択"]]/ul/li[', ']//table/tbody/tr[1]/td', ']//a[text()="バトルする"]'],
            ['aJ', this.cssmypage]]],
          [/battleTower%2FBattleTowerResult%2F/, 'list', [
            ['a', '//a[contains(text(),"対戦相手選択")]'],
            ['aJ', this.cssmypage]]],
          [/comebackContinuation%2FComebackGacha%2F/, 'aJ', 'a:contains("贈り物ボックスへ")'],
          [/campaign%2FcmStory%2FCmStoryTop%2F/, 'a', '//a[text()="最新ストーリーを進める"]'],
          [/companion%2FCompanionApplicationEnd%2F/, 'aJ', this.cssmypage],
          [/companion%2FCompanionMultiApplication%2F/, 'form', '//*[@id="contents"]/div[1]/form'],
          [/companion%2FSearchCompanion%2F/, 'form', '//*[@id="contents"]/form'],
          [['dungeon/MissionBossTop'], 'list', [
            ['hold'],
            ['aJ', '#mission_boss_battle_boss_info > div.battle_btn > a']]],
          [['dungeon/MissionList'], 'aJ', '#contents > div.user_mission_list > ul > li > a:regexText("クエスト\\d"):first'],
          [['dungeon/MissionResult'], 'aJ', '#dungeon_mission_main > div.mission_btn > div > a'],
          [['dungeon/DungeonTop'], 'aJ', '#dungeon_main_btn > div.button_area > a.btn_top_quest.btn_base'],
          [['dungeon/RaidbossBattleResult'], 'aJ', '#contents > div > a[href*="%2Fdungeon%2FMissionActionLot%2"]'],
          [['dungeon/RaidbossTop'], 'aJ', '#contents > div.relative.margin_top_20 > div.box_horizontal.box_spaced.padding_x_10 > a:nth-child(2)'],
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
          [['gacha/DoPlaySwfGachaResult'], 'flashJT', '#container > convas'],
          [/gacha%2FGacha(?:Result|Top)(?:%2F)?(?:%3FthemeId%3D[0-9]+\S*)?$/, 'list', [
            ['aJ', 'form[name="gacha"] input[name="isMaxValue"]'],
            ['formJ', 'form[name="gacha"]'],
            //['aJ', 'div.btn_base > a:regex(href, gacha%2FDoGachaExec%2F%3FthemeId%3D([0-8]|9[0-9])):last'],
            ['aJ', 'div.btn_base > a:regex(href, gacha%2FDoGachaExec%2F%3FthemeId):last'],
            //['hold'],
            ['aJ', this.cssmypage]]],
          [/gacha%2FGachaResult%2F%3FthemeId%3D7/, "a", '(//div[@class="btn_base block_flex"]/a[img])[last()]'],
          [/gacha%2FGachaResult%2F%3FthemeId%3D8/, "a", '(//div[@class="btn_base block_flex"]/a[img])[last()]'],
          [['gacha/GachaTop', { gacha_theme_id: 1 }], 'list', [
            ['aJ', '#yell_gacha_button_section a:last()']]],
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
          [['island/DoBackNumberMovie'], 'flashJT', '#container > canvas'],
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
            }
            ],
            ['a', '//*[@id="attack_btn"]/div/a'],
            ['aJ', '#contents > div > a[href*="island%2FMissionActionLot"]']]],
          [/island%2FIslandTop%2F/, 'list', [
            ['funcR', function () {
              return $('div.medal_num > span > span.number_island_gold_2_0').length === 0
                && $('a.link_casino').clickJ().length > 0;
            }
            ],
            //['a', '//a[img[contains(@src, "casino_on.png")]]'],
            ['a', '//a[img[@alt="エクストラステージを探索"]]'],
            ['aJ', 'a.link_quest']]],
          [/island%2FMissionResult%2F/, 'list', [
            ['a', '//a[img[@alt="エクストラステージを探索"]]'],
            ['a', '//a[img[@alt="イベントクエストを探索"]]'],
            ['a', '//a[text()="使用する"]']]],
          [['mix'], 'list', [
            //['hold'],
            ['aJ', '#mix > a:contains("おまかせ強化")']
          ]],
          [/^mypage%2FIndex/, 'list', [
            // ギルドバトル開戦まで
            ['aJ', '#header > a:not(:contains("まで")):not([href*="team%2FTeamDetail"]):regexText(.)'],
            ['aJ', 'a:has(span#battle_name)'], /// ????
            ['aJ', '#boss_appear_btn:has(span) > div > a'], //succ = succ || clickA("//*[@id=\"boss_appear_btn\" and span]/div/a");
            ['funcR', function () {
              //var bp = getXPATH("//*[@id=\"gauge_bp\"]/div[1]").dataset.value;
              var bp = $('#gauge_bp > div:nth-child(1)')[0].dataset.value;
              GM_log(bp);
              if (bp > 20) {
                return $('a[href*="battleTower%2FBattleTowerTop%"]').clickJ().length > 0; //clickA('//a[contains(@href, "battleTower%2FBattleTowerTop%")]');
              }
              return false;
            }
            ],
            ['aJ', 'a:contains("振り分けポイントがあります")'],
            ['aJ', 'a:contains("バトル結果がでています")'],
            ['aJ', 'a:contains("ストーリーモードを進められます")'],
            ['aJ', '#button > a[href*="storyex%2FStoryBackNumberIndex"]'],
            ['aJ', 'a:contains("戦友上限が増えました")'],
            ['aJ', 'a:contains("戦友候補が見つかりました")'],
            ['aJ', 'a:contains("完全討伐報酬が受け取れます")'],
            ['aJ', 'a:contains("ビンゴチケットが届いています")'],
            ['aJ', 'a:contains("を討伐してくれました")'],
            ['aJ', 'a:contains("オールスターガチャが回せます")'],
            ['funcR', () => {
              if (GM_getValue("__ava_no_gift", 0) + this.no_gift_delay * 1000 < Date.now()) {
                return $('a:contains("贈り物が届いています")').clickJ().length > 0;
              }
              return false;
            }
            ],
            ["funcR", function () {
              var ap = getXPATH("//*[@id=\"gauge_ap\"]/div[1]").dataset.value;

              if (ap > 10) {
                return false
                  || $('a[href*="dungeon%2FDungeonTop%2F"]').clickJ().length > 0
                  //|| $('a[href*="summonHunt%2FSummonHuntTop"]').clickJ().length > 0
                  || (GM_getValue('avalon_unit_battle_start', 0) < Date.now() && $('#index > div > a[href*="unitBattle%2FUnitBattleTop"]').clickJ().length > 0)
                  || $('#index > div > a[href*="island%2FIslandTop"]').clickJ().length > 0
                  //|| clickA('//a[contains(@href, "TowerRaidTop")]');
                  || $("#btn_quest > a").clickJ().length > 0;
              }
            }
            ],
            //['switch'],
            ['hold']]],
          [/mypage%2FLoginBonusResult%2F/, 'list', [
            ['a', '//a[text()="贈り物BOXへ"]'],
            ['aJ', this.cssmypage]]],
          [/mypage%2FLoginBonusSpecial%2F/, 'aJ', 'a[href*="prizeReceive%2FPrizeReceiveTop"]'],
          [/mission%2FRegionList%2F/, "aJ", '#contents > div.section_main a[href*="%2Fmission%2FMissionActionLot%2F"]'], //*[@id="contents"]/div[3]/div[2]/div[2]/div/a
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
            }
            ],
            ['aJ', this.cssmypage]]], //"a",  "//*[@id=\"global_menu\"]/ul/li[1]/div[5]/a"],
          [/mission%2FMissionListSwf%2F/, "link", "http://sp.pf.mbga.jp/12010455?url=http%3A%2F%2Fmguildbattle.croozsocial.jp%2Fmypage%2FIndex%2F"],
          [/multiguildbattle%2FMultiGuildbattleResult%2F/, 'a', '//*[@id="btn_force"]/a'],
          [/multiguildbattle%2FMultiGuildbattleSelectAttackType%2F/, 'list', [
            ['a', '//*[@id="btn_start"]/a'],
            ['a', '//*[@id="btn_force"]/a']]],
          [/multiguildbattle%2FMultiGuildbattleSelectTarget%2F/, 'a', '//div[div[text()="ターゲット選択"]]/ul/li[1]//a'],
          [/multiguildbattle%2FMultiGuildbattleTop%2F/, 'a', this.xpathmypage],
          [/prizeReceive%2FPrizeReceiveTop%2F/, 'list', [
            ['formJ', '#contents > form:first:has(input[type="submit"])'], //succ = succ || clickForm("//*[@id=\"contents\"]/form");
            ['aJ', '#contents > ul.btn_tabs.margin_top_10 > li > a:not(:contains("(0)"))'], //    succ = succ || clickA('//*[@id="contents"]/ul[@class="btn_tabs margin_top_10"]/li/a[not(contains(text(), "(0)"))]');
            ['funcR', function () {
              GM_log($('div.txt_block_center:contains("所持武具が上限数に達しています")'));
              if ($('div.txt_block_center:contains("所持武具が上限数に達しています")').length > 0) {
                GM_setValue("__ava_no_gift", Date.now());
              }
            }
            ],
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
            }
            ],
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
          }
          ],
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
            ['aJ', 'a[href*="unitBattle%2FMissionActionLot"]'],
            ['func', () => {
              var date_time = $('div:contains("次のラウンド開始日時"):not(:has(div)) + div > div').text();
              var now = new Date(Date.now() + 60 * 1000);
              now = new Date(date_time.replace(' ', '/' + now.getFullYear() + ' ') + ' GMT+9');
              GM_setValue('avalon_unit_battle_start', now.getTime());
              $(this.cssmypage).clickJ();
            }
            ]]],
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
    "12011538": { // hunter
      mypage_url: 'http://sp.pf.mbga.jp/12011538',
      rotation_time: 5,
      xpathmypage: "//header/div[@class='sprite btn_base header_left']/a",
      cssmypage: '#main_container > header > div.sprite.btn_base.header_left > a',
      xpathevent: '//a[contains(@href, "EventTop")]',
      xpatheventnext: '//*[@id="mainCommand_quest"]/a',
      xpathgiftbox: '//a[.//i[@class="sprite_menu3 menu_btn_prize"]]',
      handleBattleResult: function () {
        if (GM_getValue("__mybattle_free") > 0 || GM_getValue("__mybattle_bp") > 0) {
          clickA("//*[@id=\"main\"]/nav[1]//a");
        } else {
          clickA(this.xpathmypage);
        }
      },
      handleBattleTower: function () {
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
      handleERBBattle: function () {
        // player battle, BP1 only
        var wait = 2000,
          bp_need = 1,
          i,
          attacked = false,
          reload;
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
          var ele = $('div#do_battle_btn'),
            recharge = false,
            ele_s,
            ok;
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
      eventName: "GiDimension",
      get_actions: function () {
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
            var free_text = getXPATH("//*[@id=\"btn_entry\"]/a/div"),
              res,
              succ;
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
          }
          ],
          [/battleTower%2FBattleTowerBossConf%2F/, "func", this.handleBattleTower],
          [/battleTower%2FBattleTowerBossResult%2F/, "func", this.handleBattleResult],
          [['campaignSummary/Top'], 'aJ', this.cssmypage],
          [/card%2FBulkCardSell\b/, 'a', this.xpathmypage],
          [/card%2FBulkCardSellConfirm%2F/, 'form', '//*[@id="main"]/div/form'],
          [/card%2FBulkCardSellList%2F/, 'a', '//a[text()="Nカードを一括で売却"]'],
          [/cave%2FAreaSelect/, "func", function () {
            var l = $('a:contains("選択")'),
              areaID = Math.floor(Math.random() * l.length);
            l.eq(areaID).clickJ();
          }
          ],
          [/cave%2FCardSelect/, "func", function () {
            var select_sort = getXPATH("//form/div[2]/div/select");
            if (select_sort && select_sort.selectedIndex !== 8) {
              select_sort.selectedIndex = 8;
              getXPATH("//form").submit();
            }

            setInterval(function () {
              clickA('//li[//td[@class="aura"]]/div[2]/a');
            }, 2000);
          }
          ],
          [/cave%2FIndex/, "a", "//*[@id=\"main_btn_area\"]/a"],
          [/cave%2FItemSelect/, "form", "//*[@id=\"main\"]/form"],
          [/cave%2FQuestConfirm/, "a", "//*[@id=\"main\"]/div[3]/a"],
          [/cave%2FQuestResult%2F/, 'aJ', 'a[href*="cave%2FIndex"]:last()'],
          [['comebackLogin/RewardHistory'], 'aJ', this.cssmypage],
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
          }
          ],
          [['eventRaidBossLoop/RaidBossLoopBattleResult'], 'aJ', '#loopBossBtn > div > div.btn_5 > a'],
          [['eventRaidBossLoop/RaidbossLoopBattleSwf'], 'flashJT', '#stage'],
          [/^eventBigRaidBoss%2FBigRaidBossTop/, 'list', [
            ['aJ', '#bigRaidBtn > div:nth-child(2) > a'],
            ['aJ', '#bigRaidBtn > div:nth-child(1) > a']]],
          [['eventRaidBossLoop/RaidBossLoopTop'], 'list', [
            ['aJ', '#loopBossBtn > div > div.btn_5 > a'],
            ['aJ', '#loopBossBtn > div > a']]],
          [/^eventStageRaidBoss%2FEventRule%2F%3FfirstAccess%3D1/, 'aJ', '#main > a'], //'a[href*="event%2FDoSetClickCount"]'],
          [/^eventStageRaidBoss%2FWishComplyTop/, 'aJ', 'a[href*="eventStageRaidBoss%2FDoMissionExecutionCheck"]'],
          [/^eventTower%2FEventQuestResult%2F/, 'list', [
            ['aJ', '#main > div > a[href*="eventTower%2FRaidBossTop"]'],
            ['aJ', 'a[href*="DoEventQuestExecutionCheck"]'],
            ['aJ', 'a:regex(href, event[a-zA-Z0-9]*%2FMissionList)']]],
          [/^event[a-zA-Z0-9]*%2FEventTop/, 'list', [
            ['funcR', () => {
              if ($('#raid_boss_top > div > div > div.btn_battle > a > div').text().match(/(\d+)/)[1] >= 5) {
                return $('#raid_boss_top > div > div > div.btn_battle > a').clickJ().length > 0
              }
              return false;
            }],
            ['funcR', () => { $('#chengeApproval2 > div.relative > div.skip_off').clickJ(); }],
            ['funcR', function () {
              //#eventDeck > ul.event_chara > li > div
              //#eventTop > div > div.margin_bottom_10 > a > span
              //#eventDeck > ul > li:nth-child(1) > div	
              //#eventTop > div > div.txt_frame_2.margin_x_10.padding_bottom_10 > div:nth-child(1) > div:nth-child(2)                  
              var items = $('#main > div.raid_boss_container.section_margin_top > div.section_main:has(div:contains("キャラを強化")) > div.padding_top div.txt_frame_2.margin_x_10.padding_bottom_10 > div > div');
              //#main > div.raid_boss_container.section_margin_top > div:nth-child(5) > div.padding_top > div.txt_frame_2.margin_x_10.padding_bottom_10 > div:nth-child(2) > div:nth-child(1)
              var has_item = false;
              GM_log(items);
              items.each(function () {
                if (this.innerText.match(/(\d+)/) &&
                  +this.innerText.match(/(\d+)/)[0] > 0) {
                  has_item = true;
                }
              });
              if (has_item !== true) {
                return false;
              }
              var lvls = $('#eventDeck > ul.event_chara > li > div');
              var i = -1,
                lvl = 99999;
              lvls.each(function (index) {
                if (this.innerText.match(/(\d+)/) &&
                  +this.innerText.match(/(\d+)/)[0] < lvl) {
                  i = index;
                  lvl = +this.innerText.match(/(\d+)/)[0];
                }
              });
              if (i >= 0) {
                return $('#eventDeck > ul > li:eq(' + i + ') a').clickJ().length > 0;
              }
            }
            ],
            //['hold'],
            ['funcR', function () {
              var medal = $('#raid_boss_top > div > div.event_command_section > div > div > div > div.btn_battle > a > div');
              if (medal.length === 1
                && medal.text().match(/(\d+)/)
                && +medal.text().match(/(\d+)/)[1] > 0) {
                return $('#raid_boss_top > div > div.event_command_section > div > div > div > div.btn_battle > a').clickJ().length > 0;
              }
            }
            ],
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
                  && +item.text().match(/(\d+)/)[1] >= 5) {
                  if ($('a.medal_box').clickJ().length > 0) {
                    result = true;
                    return false;
                  }
                }
                return false;
              });
              return result;
            }
            ],
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
            }
            ],
            //['hold'],
            ['aJNC', '__ht_myboss_wait', 'a:regex(href, event[a-zA-Z0-9]*%2FRaidBossTop)'],
            ['funcR', function () {
              var raid_clear = GM_getValue('__ht_myraid_clear');
              if (raid_clear + 60 * 1000 > Date.now()) {
                return $('a[href*="RaidBossAssistList"]').clickJ().length > 0;
              }
              return false;
            }
            ],
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
            }
            ],
            ['aJ', 'a[href*="%2FDoMissionExecution"]'],
            ['aJ', 'a:regex(href, event[a-zA-Z0-9]*%2FMissionList)'],
            ['aJ', '#world_select_wrap > div > ul > li.stage_icon > div:has(span.count_num:regexText("^(.|..)$")) > div.btn.relative > a:first'],
            //['aJ', '#world_select_wrap > div.inner > div > div.door_1 > a'],
            ['aJ', '#world_select_wrap > div > ul > li.stage_icon.extra.clear > div > div > a'],
            //['func', function () {alert("need intervene");}],
            ['funcR', function () {
              var stg = $('#world_select_wrap > div > div.stage_icon > a');
              if (stg.length > 0) {
                return stg.eq(Math.floor(Math.random() * stg.length)).clickJ().length > 0;
              }
            }
            ],
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
            }
            ],
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
            }
            ],
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
            }
            ], //help
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
            var boss_info = $('#main > div.subtitle').first,
              boss_n,
              boss_lvl,
              wait = 2000,
              back_xpath,
              res,
              hp_gauge,
              hp_full,
              USERNAME,
              help_record,
              last_attack,
              bp_need = 1,
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
                  //return $('#main a:contains("イベントTOPへ")').clickJ().length > 0;#quest_go_btn > div > a
                  return $('#main > div.margin_bottom.go_mission_button.margin_top_20 > div > a').clickJ().length > 0; // go on with mission
                }
              } else {
                add_bp.first().clickJ();
              }
              return false;
            });
            setInterval(function () {
              $('#stage_front').clickJ();
            }, wait);
          }
          ],
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
          [/^event%2FeventFusion%2FMaterialFusionTop%2F/, 'list', [
            ['aJ', 'a:contains("全ての秘伝書を使う")']]],
          [/event%2FeventFusion%2FFusionEnd/, 'list', [
            ['aJ', 'a:contains("イベントTOP")'],
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
            }
            ],
            ['aJ', '#main > a']]],
          [/^eventGuildHideAndSeek%2FPanelTop/, 'list', [
            ['func', function () {
              $('div#panel > form > ul.select > li:nth-child(5) input[type="checkbox"]').clickJ();
              tryUntil(function () {
                if ($('#panel > form > div > div.btn_main_large.submit:not([style*="none"])').length > 0) {
                  $('#panel > form > div > div.btn_main_large.submit:not([style*="none"]) > input[type="submit"]').clickJ();
                  return true;
                } else {
                  return false;
                }
              });
            }
            ]]],
          [/^eventGuildHideAndSeek%2FPanelResult%2F/, 'list', [
            ['aJ', '#panel > div.button a']]], //#panel > div > p > a
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
          }
          ],
          // [/fusion%2FFusionTop/, 'func', function () {
          // return;
          // if (document.referrer.match(/fusion%2FMaterialFusionTop/)) {
          // $('a[href*="mypage%2FIndex"]').clickJ();
          // } else {
          // $('a[href*="fusion%2FMaterialFusionTop"]').clickJ();
          // }
          // }
          // ],
          // [/fusion%2FMaterialFusionTop/, "func", function () {
          // return;
          // var form = getXPATH("(//ul[@class='lst_sub']/li/form)[last()]"),
          // succ = false;
          // if (form) {
          // form.elements[1].selectedIndex = form.elements[1].options.length - 1;
          // form.submit();
          // succ = true;
          // }
          // succ = succ || clickA('//a[text()="Nカード一括強化"]');
          // succ = succ || clickA(this.xpathmypage);
          // }
          // ],
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
              //GM_log(eventL);
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
          }
          ],
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
          }
          ],
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
    "12008490": { // ragranok
      mypage_url: 'http://sp.pf.mbga.jp/12008490',
      rotation_time: 5,
      xpathmypage: '//*[@id="header_left_button"]/a',
      cssmypage: '#header_left_button > a',
      xpathquest: '//*[@id="global_menu"]//a[i[@class="menu_sprite menu_quest_image"]]',
      xpathevent: '//*[@id="global_menu"]//a[i[@class="menu_sprite menu_event_image"]]',
      KILLBOSS: false,
      rankArr: ['N', 'NN', 'R', 'RR', 'SR', 'SSR', 'LR', 'GR'],
      handleStrongBossTop: function () {
        var succ = false,
          attack,
          USERID = GM_getValue("__rg_USERID", ""),
          ownerbox,
          owner,
          attacked;
        succ = succ || clickA('//*[@id="requestChain"]/a');
        succ = succ || $('#advantage_itembox_img_tutorial > a').clickJ().length > 0;
        succ = succ || $('#popup_content > div > div.section:has(div.section_title:contains("全界の神水")) > div > div > a:contains("はい")').clickJ().length > 0;
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

      handleGachaFlashResult: function () {
        if (getXPATH('//div[@id="gamecanvas"]/canvas|//*[@id="container"]')) {
          clickFlash('//div[@id="gamecanvas"]/canvas|//*[@id="container"]');
        } else {
          //return;
          var succ = false;
          //gacha%2FGachaFlash%2F%3FthemaId%3D4748
          //#containerBox > div.txt_center.fnt_medium > div > div > div > a
          succ = succ || $('#containerBox > div.txt_center.fnt_medium > div > div  a[href*="gacha%2FGachaFlash%2F%3FthemaId%3D4"]').clickJ().length > 0;
          succ = succ || clickA('(//a[contains(text(), "エールガチャ")])[last()]');
          //succ = succ || clickA('//a[text()="エールガチャ"]');
          succ = succ || clickA('//a[text()="ガチャTOPへ戻る"]');
          //succ = succ || clickA(this.xpathmypage);
        }
      },
      handleMissionError: function () {
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

      get_actions: function () {
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
            }
            ],
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
                var text,
                  excBtn,
                  excBossBtn,
                  t,
                  addAp;
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
            }
            ]]],
          [/arena%2FMissionError%2F/, 'func', this.handleMissionError],
          [/arena%2FMissionResult%2F%/, 'list', [
            //['aJ', '#arenaOpenButton a'],
            ['aJ', 'a[href*="arena%2FDoMissionExecutionCheck"]']]],
          //'func', handleArenaMissionRes],
          [/arena%2FTop/, 'list', [
            //['hold'],//#containerBox > div.switchs > div > div:nth-child(2) > div:nth-child(1) > a
            ['aJ', '#containerBox > div.switchs > div.switch_body > div.switch_content > div > a[href*="arena%2FChoiceCoinItemTop"]:regexText(\\s?0*[1-9][0-9]*\\s?)'],
            //['hold'],
            ['a', '//div[@id="bgbox_wrapper"]//a[contains(@href, "Arena' + (Math.random() < 0.5 ? '' : 'Sub') + 'BattleTop")]'],
            ['a', "//div[@class='event_btn']/a"],
            ['flash', '//*[@id="container"]']]],
          [/arrangement%2FArrangementEdit%2F/, 'func', function () {
            return true;
            //clickS('//div[text()="自動割り振り"]');
            clickS('//*[@id="reminderPointData"]/div/div[1]/div[2]/div[2]');
            setInterval(function () {
              if (getXPATH('//div[@id="overrayArea" and not(@class="hide")]')) {
                clickForm('//*[@id="containerBox"]/form');
              }
            }, 5000);
          }
          ],
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
            var atk = $('#containerBox > div.img_section.margin_bottom_10 > div.card.box_horizontal.box_center.margin_x_20.padding_x_10.margin_bottom_20 > div.box_extend.txt_left > div.fnt_xsmall.no_line_space > div > div.box_extend.margin_left.fnt_emphasis').text(),
              idxmin,
              minatk = -1,
              rare = -1,
              i;
            for (i = 1; i <= 5; i++) {
              var catk = +$('#cardList > ul > li:nth-child(' + i + ') > ul > li:nth-child(3) > div > div.fnt_emphasis').text(),
                cmem = +$('#cardList > ul > li:nth-child(' + i + ') > ul > li:nth-child(2) > div:nth-child(1) > div.fnt_emphasis').text().match(/(\d+)/)[1],
                cp = +$('#cardList > ul > li:nth-child(' + i + ') > ul > li:nth-child(2) > div:nth-child(2) > div.fnt_emphasis').text().match(/(\d+)/)[1],
                coatk = catk / (1 + cp / 100) - cmem;
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
          }
          ],
          [/caravan%2FDiceEventTop%2F/, 'list', [
            ['aJ', '#diceEventHeader > a'],
            ['func', () => {
              var maxatk = 0,
                maxid = -1,
                i;
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
                  coatk = catk / (1 + cp / 100) - cmem; // * (rar - 1) / 2;
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
            }
            ]]],
          [/caravan%2FGoalBossAttackResult/, 'aJ', 'a[href*="caravan%2FDoResetDeck%2F%3Froute%3Dtop"]'],
          [/^caravan%2FGoalBossTop%2F/, 'func', () => {
            var cnt = 0;
            $('#cardList > ul > li > ul > li:nth-child(2) > div:nth-child(1) > div.fnt_emphasis').each(function (idx, ele) {
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
          }
          ],
          [/caravan%2FMapTop/, 'list', [
            //['hold'],
            ['func', () => {
              tryUntil(() => {
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
                    coatk = catk / (1 + cp / 100) - cmem * (rar - 1) / 2;
                  GM_log(i + " " + this.rankArr[rar] + " " + ((rar - 1) / 2) + " cmem " + cmem + " coatk " + coatk);
                }

                if ($('#worker_cnt').text() > 0) {
                  $('#mapFooter > div.btn_dice > a').clickJ();
                  return true;
                }
              });
            }
            ]]],
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
            }
            ],
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
          }
          ],
          [/caravan%2FTop/, 'list', [
            ['aJ', '#eventHeader > a']]],
          [/^card%2FCardList/, 'list', [
            ['func', function () {
              $('#containerBox > div > p:contains("カテゴリ選択")').click(function () {
                GM_deleteValue('rag_card_best_ten_flag');
                location.reload();
              });
              //GM_deleteValue('rag_card_best_ten_flag');
              if (GM_getValue('rag_card_best_ten_flag', 0) + 24 * 60 * 60 * 1000 > Date.now()) {
                GM_log(JSON.stringify(GM_getValue("rag_card_best_ten")));
                GM_log(JSON.stringify(GM_getValue("rag_card_best_ten_sell_limit")));
                var sel_limit = GM_getValue("rag_card_best_ten_sell_limit");
                $('#containerBox > div.cardItems.section').each(function () {
                  var type = $(this).find('div > div > div.sp-cp:first');
                  type = type.attr('class').match(/ sp-cp-(\S+)/)[1];
                  var atk = +$(this).find('td.txt_right.cardAttack').text();
                  var def = +$(this).find('td.txt_right.cardDefense').text();
                  var name = $(this).find('div > div > div > a').text();
                  GM_log(name, type, atk, def);
                  if (sel_limit[type] !== undefined && atk < sel_limit[type].atk && def < sel_limit[type].def) {
                    $(this).css('background', 'olive');
                  }
                });
                return;
              }
              var best_array = {};
              if ($('#containerBox > div.margin_y > div > div.page_number.box_horizontal.box_extend.box_x_center > div.current').text() === "1") {
                best_array = {};
              } else {
                best_array = GM_getValue("rag_card_best_ten");
              }
              GM_log(best_array);
              $('#containerBox > div.cardItems.section').each(function () {
                var type = $(this).find('div > div > div.sp-cp:first');
                type = type.attr('class').match(/ sp-cp-(\S+)/)[1];
                var atk = +$(this).find('td.txt_right.cardAttack').text();
                var def = +$(this).find('td.txt_right.cardDefense').text();
                var name = $(this).find('div > div > div > a').text();
                GM_log(name, type, atk, def);
                if (best_array[type] === undefined) {
                  best_array[type] = {};
                  best_array[type].atk = [];
                  best_array[type].def = [];
                }
                best_array[type].atk.push(atk);
                best_array[type].def.push(def);
                //GM_log(best_array);
              });
              for (var key in best_array) {
                best_array[key].atk.sort(function (a, b) {
                  return b - a;
                });
                best_array[key].def.sort(function (a, b) {
                  return b - a;
                });
                if (best_array[key].atk.length > 10) {
                  best_array[key].atk.splice(10);
                  best_array[key].def.splice(10);
                }
              }
              GM_setValue('rag_card_best_ten', best_array);
              if ($('#containerBox > div.margin_y > div > div.page_number.box_horizontal.box_extend.box_x_center > div.current + div > a').clickJ().length > 0) {
                return;
              } else {
                var best_low = {};
                for (key in best_array) {
                  best_low[key] = {};
                  if (best_array[key].atk.length >= 10) {
                    best_low[key].atk = best_array[key].atk[9];
                    best_low[key].def = best_array[key].def[9];
                  } else {
                    best_low[key].atk = 0;
                    best_low[key].def = 0;
                  }
                }
                GM_setValue('rag_card_best_ten_flag', Date.now());
                GM_setValue('rag_card_best_ten_sell_limit', best_low);
                $('#containerBox > div.margin_y > div > div.page_prev > a').clickJ();
              }
            }
            ]]],
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
            }
            ],
            ['hold']]],
          [/^card%2FCardList%2F%3FbulkFusion%3D1/, 'func', function () {
            var baselvl = $('#base_card_area > div.deckInfoTop > div:nth-child(1) > div:nth-child(2)').text();
            var splitlvl = baselvl.match(/(\d+)\/(\d+)/);
            GM_log(splitlvl);
            if (!splitlvl)
              return;

            if (splitlvl[2] !== '20')
              return;

            if ($('#containerBox > ul.btn_switch.margin_top_10.fnt_medium > li:not(.current) > a:contains("クジャタで合成")').clickJ().length > 0) {
              return;
            }
          }
          ],
          [/card%2FMaterialCardList%2F%3FbulkFusion%3D1/, 'func', function () {
            var baselvl = $('#base_card_area > div.deckInfoTop > div:nth-child(1) > div:nth-child(2)').text();
            var splitlvl = baselvl.match(/(\d+)\/(\d+)/);
            GM_log(splitlvl);
            if (!splitlvl)
              return;

            if (splitlvl[2] !== '20')
              return;

            var firstKujata = $('#containerBox > form > div.section.margin_top_10.padding_botoom_10');
            if (firstKujata.length === 0 || firstKujata.length > 1)
              return;

            var KujataRare = firstKujata.find('div.section_title.box_horizontal > div:nth-child(2)').text();
            GM_log(KujataRare);
            if (KujataRare !== 'N')
              return;

            firstKujata.find('select option:last').prop('selected', true);
            $('#containerBox > form > div.btn_base.btn_large.block_center.margin_top_10 > input[type="submit"]').clickJ();
          }
          ],
          [/companion%2FCompanionApplicationAccept%2F/, 'form', '//form[.//input[@value="承認する"]]'],
          [/companion%2FCompanionApprovalList%2F/, 'list', [
            ['a', '//a[text()="承認する"]'],
            ['aJ', this.cssmypage]]],
          ['campaign/loginBonus/LoginBonusTop', 'aJ', '#contents > div.received_bonus > a'],
          [/^evolution%2FEvolutionConfirm/, 'aJ', '#containerBox > div.section.margin_top_10.padding_bottom_10 > div:nth-child(2) > div.box_horizontal.margin_x_10.box_spaced.margin_top_10 > div:nth-child(2) > form > div > input[type="submit"]'],
          [/^evolution%2FEvolutionCardList%2F/, 'list', [
            ['hold'],
            ['func', function () {
              var baselvl = $('#base_card_area > div.deckInfoTop > div:nth-child(1) > div:nth-child(2)').text();
              var splitlvl = baselvl.match(/(\d+)\/(\d+)/);
              GM_log(splitlvl);
              if (!splitlvl)
                return;
              if (splitlvl[2] !== '20')
                return;

              var firstSlot = $('#containerBox > div:contains("▼ 画像タッチで選択 ▼") + div.section.margin_top_10:first');
              var slotlvl = firstSlot.find('div:nth-child(2) > table > tbody > tr > td.padding_top.padding_left > table > tbody > tr:nth-child(1) > td.txt_right.padding_right_10').text();
              GM_log(slotlvl);
              var slotsplitlvl = slotlvl.match(/(\d+)\/(\d+)/);
              if (!slotsplitlvl)
                return;
              GM_log(slotsplitlvl);
              if (splitlvl[2] !== slotsplitlvl[2])
                return;

              GM_log(splitlvl);
              if (splitlvl[1] !== splitlvl[2]) {
                GM_log('move');
                $('#containerBox > div:nth-child(8) > div.ragna_selector.margin_bottom_10 > div > ul > li.cur > div > div > div:nth-child(1) > a').clickJ();
                return;
              }

              firstSlot.find('div:nth-child(2) > table > tbody > tr > td.padding_top.padding_bottom_10 > a').clickJ();
            }
            ]]],
          [/^evolution%2FEvolutionEnd/, 'list', [
            ['aJ', '#containerBox > div:nth-child(21) > div:nth-child(2) > div > a'],
            ['aJ', '#containerBox > div:nth-child(8) > div.ragna_selector.margin_bottom_10 > div > ul > li.cur > div > div > div:nth-child(1) > a']]],
          // [/^evolution%2FSelectBaseCard/, 'func', function () {
          // return;
          // var bases = $('#containerBox > div.section.margin_top_10');
          // bases.each(function () {
          // var item = $(this);
          // var title = item.children('div.section_title.box_horizontal');
          // var rare = title.children('div:nth-child(2)').text();
          // var name = title.children('div:nth-child(3)').text();
          // if (rare === 'N' || rare === 'N+' || rare === 'N++') {
          // var a = item.find('div:nth-child(2) > table > tbody > tr > td.padding_top.padding_bottom_10 > a');
          // GM_log(a);
          // a.clickJ();
          // return false;
          // }
          // });
          // }
          // ],
          [/deck%2FDeckEditTop%2F/, 'a', this.xpathmypage],
          [/^fusion%2FFusionEnd/, 'func', function () {
            var baselvl = $('#base_card_area > div.deckInfoTop > div:nth-child(1) > div:nth-child(2)').text();
            var splitlvl = baselvl.match(/(\d+)\/(\d+)/);
            GM_log(splitlvl);
            if (!splitlvl)
              return;
            if (splitlvl[1] === splitlvl[2]) {
              $('#containerBox > div:nth-child(8) > div.ragna_selector.margin_bottom_10 > div > ul > li.cur > div > div > div:nth-child(2) > a').clickJ(); // evolution
            }
          }
          ],
          [/fusion%2FFusionSwfStart%2F/, 'flash', '//*[@id="canvas"]'],
          [/fusion%2FBulkMaterialCardFusionConfirm%2F/, 'form', '//*[@id="containerBox"]/form'],
          [[/fusion\/SelectBaseCard\/?/], 'func', function () {
            $('#containerBox > div.section.margin_top_10').each(function () {
              var lvl = $(this).find('div:nth-child(2) > table > tbody > tr > td.padding_top.padding_left > table > tbody > tr:nth-child(1) > td.txt_right.padding_right_10').text().match(/(\d+)\/(\d+)/);
              if (lvl && lvl[1] !== lvl[2]) {
                $(this).css('background', 'olive');
              }
            });
          }],
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
            //['hold'],
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
              var btns,
                hasBtn = false,
                i,
                btn;
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
            }
            ],
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
                var excBtn,
                  addAp;
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
            }
            ]]],
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
            }
            ],
            ['a', '//a[contains(@href, "island%2FDoMissionExecutionCheck")]'],
            ['aJ', 'a[href*="island%2FMissionDetail%2F"]'],
            //div[contains(@class,"sprites-event-top-quest")]/a'],
            ['flash', '//*[@id="container"]']]],
          [['mapQuest/AreaClearResult'], 'aJ', 'a:contains("イベントTOP")'],
          [['mapQuest/ChangeCardList'], 'func', function () {
            return;
            var atk = $('#getNewCard > div.box_horizontal.margin_x_20.margin_bottom_10 > div.box_extend.txt_left.no_line_space > div:nth-child(4) > div.attack.box_extend.txt_right.margin_right_10').text(),
              idxmin,
              minatk = -1, //debug
              minatk_max = -1,
              minlvl = -1, //debug
              minlvl_max = -1, //debug
              rare = -1,
              i;
            var lvl_max = +$('#getNewCard > div.box_horizontal.margin_x_20.margin_bottom_10 > div.box_extend.txt_left.no_line_space > div:nth-child(2) > div.box_extend.txt_right').text().match(/\/(\d+)/)[1];
            var atk_max = atk * (1 + lvl_max / 100);
            for (i = 1; i <= 6; i++) {
              if (i === 3) continue;
              var catk = +$('#partyMemberList > ul > li:nth-child(' + i + ') > ul > li.status1 > div.attack.box_horizontal.box_y_center > div.box_extend.txt_right').text();//,
              //cmem = +$('#partyMemberList > ul > li:nth-child(' + i + ') > ul > li:nth-child(2) > div:nth-child(1) > div.fnt_emphasis').text().match(/(\d+)/)[1],
              var cp = $('#partyMemberList > ul > li:nth-child(' + i + ') > ul > li.status2 > div.level.box_horizontal.box_y_center > div.box_extend.txt_right').text().match(/(\d+)\/(\d+)/);
              var clvl = +cp[1];
              var clvl_max = +cp[2];
              //#cardId_3621937 > ul > li.status2 > div.level.box_horizontal.box_y_center > div.box_extend.txt_right
              var catk_max = catk / (1 + clvl / 100) * (1 + clvl_max / 100);
              //GM_log(i + " : coatk : " + coatk);
              if (minlvl_max < 0 || clvl_max <= minlvl_max) {
                idxmin = i;
                minatk = catk;
                minatk_max = catk_max;
                minlvl = clvl;
                minlvl_max = clvl_max;
              }
              GM_log("loop", catk, catk / (1 + clvl / 100), clvl, clvl_max, catk_max);
            }
            GM_log(minlvl_max, lvl_max);
            if (minlvl_max < lvl_max) {
              if (idxmin > 3) idxmin--;
              $('#popup_content > div:nth-child(' + idxmin + ') > div > div.box_horizontal.box_center.margin_bottom_10 > div:nth-child(2) > a').clickJ();
            } else if (minlvl_max > lvl_max) {
              $('a:contains("交換しないで進む")').clickJ();
            }
          }],
          [['mapQuest/RaidBattleResult'], 'aJ', 'a:contains("ダンジョンを進める")'],
          [['mapQuest/RaidBattleTop'], 'aJ', 'a.sprites-common-btn_attack'],
          [['mapQuest/Top'], 'list', [
            ['aJ', '#eventTop > div.sprites-event-top.sprites-event-top-btn_quest > a'],
            //['hold'],
            ['aJ', '#selectArea > div.area > a:last']]],

          [/materiaSkill%2FMateriaSkillAutoSet/, 'func', function () {
            GM_log(JSON.stringify(GM_getValue("rag_card_best_ten")));
            GM_log(JSON.stringify(GM_getValue("rag_card_best_ten_sell_limit")));
          }
          ],

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
              var title_ele = getXPATH('//p[@class="section_title"]'),
                title,
                succ;
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
            }
            ]]],
          [/mypage%2FCollectionComp%2F/, 'form', '//form[.//input[@value="報酬を受け取る"]]'],
          [/mypage%2FCollectionCompEnd%2F/, 'aJ', 'a:contains("図鑑報酬へ")'],
          [/mypage%2FGreetList%2F/, 'a', this.xpathmypage],
          [/mypage%2FIndex/, 'list', [
            ['a', '//a[contains(text(),"戦友申請が")]'],
            ['a', '//a[text()="カード図鑑報酬が受け取れます"]'],
            ['a', '//a[text()="マテリアル図鑑報酬が受け取れます"]'],
            ['a', '//a[text()="トレジャーに出発できます"]'],
            //['a', '//a[text()="MPが割り振れます"]'],
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
            }
            ],
            ['switch']]],
          [/newMission%2FAreaList%2F/, 'aJ', $('a[href*="newMission%2FMissionList%2F"]').last()],
          [/newMission%2FBossAppear/, 'aJ', 'a[href*="newMission%2FBossBattleFlash%2F"]'],
          [['newMission/BossBattleFlash'], 'flashJT', '#container > canvas', 93, 344],
          [['newMission/BossBattleResult'], 'aJ', '#js_StoryTalkNaviSkip'],
          [/newMission%2FMissionDetail%2F/, 'flashJT', '#execBtn'],
          [/newMission%2FMissionList%2F/, 'aJ', 'a[href*="newMission%2FMissionDetail%2F"]'],
          [/mypage%2FMaterialCollection%2F/, 'list', [
            ['a', '//a[text()="図鑑報酬を受け取る"]'],
            ['aJ', this.cssmypage]]],
          [/mypage%2FMaterialCollectionCompEnd%2F/, 'aJ', 'a:contains("コンプマテリアル図鑑")'],
          [/prizeReceive%2FPrizeReceiveAllEnd%2F/, 'list', [
            ['setGMV', 'rag_present_timer', Date.now()],
            ['a', /*'//a[text()="贈り物BOX TOP"]'], */ this.xpathmypage]]],
          [/prizeReceive%2FPrizeReceiveTop%2F%3FreceiveCategory%3D[13]/, 'list', [
            ['formJ', '#containerBox > form:has(div > input[type="submit"][value*="一括で受け取る"])'],
            ['aJ', 'li:not(.current) a[href*="prizeReceive%2FPrizeReceiveTop%2F%3FreceiveCategory%3D3"]'],
            ['hold'],
            ['setGMV', 'rag_present_timer', Date.now()],
            ['aJ', this.cssmypage]]],
          [/prizeReceive%2FPrizeReceiveTop%2F%3F(receiveCategory%3D2%26bulkSellFlg%3D1|bulkSellFlg%3D1%26sortKey%3D1%26receiveCategory%3D2)/, 'list', [
            ['funcR', () => {
              var sell = false,
                name,
                cardname;
              GM_log("selling");
              $("#containerBox > div.section > ul.lst_info > li").each(function (index) {
                var name = $(this).children("div.section_header.fnt_emphasis.txt_center").text(),
                  mres,
                  setSellCard;
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
            }
            ],
            ['aJ', '#containerBox > div > div.page_number:first > div.current + div > a'],
            ['funcR', function () {
              GM_log("fall through");
              return 0;
            }
            ],
            ['aJ', 'a[href*="FprizeReceive%2FPrizeReceiveTop%2F%3FreceiveCategory%3D1"]'],
            ['hold']]],
          [/prizeReceive%2FPrizeReceiveTop%2F%3F(receiveCategory%3D2|bulkSellFlg%3D0%26sortKey%3D1%26receiveCategory%3D2%26page|receiveId%3D)/, 'list', [
            ['funcR', function () {
              var get = false;
              var card_names = [];
              GM_log('getting');
              $("#containerBox > div.section > ul > li").each(function (index) {
                var name = $(this).children("div.section_header.fnt_emphasis.txt_center").text(),
                  mres,
                  cardname,
                  setGetCard;
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
            }
            ],
            //['aJ', 'a[href*="prizeReceive%2FPrizeReceiveTop%2F%3FreceiveCategory%3D2%26bulkSellFlg%3D1"]'],
            //['aJ', 'a[href*="prizeReceive%2FPrizeReceiveTop%2F%3FreceiveCategory%3D1"]'],
            ['hold']]],
          [/prizeReceive%2FPrizeReceiveTop\b/, 'list', [
            //['hold'],
            //['formJ', '#containerBox > form:nth-child(7)'],
            //['aJ', 'a[href*="prizeReceive%2FPrizeReceiveTop%2F%3FreceiveCategory%3D1"]'], // go to item tab
            ['form', '//*[@id="containerBox"]/form[div/input[contains(@value,"一括で受け取る")]]'],
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
            //['aJ', '#containerBox > a:has(div.sprites-event_result-btn_history)'],
            ['aJ', '#header_left_button > a']]],
          [/supernova%2FSupernovaBattleHistoryDetail%/, 'list', [
            ['aJ', '#containerBox > div > a[href*="supernova%2FSupernovaTop"]']]],
          [["supernova/SupernovaDeckEditTop/"], 'func', () => {
            GM_log(JSON.stringify(GM_getValue("rag_card_best_ten")));
            GM_log(JSON.stringify(GM_getValue("rag_card_best_ten_sell_limit")));
          }
          ],
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
    "12024505": { // furyou yuugi
      mypage_url: "http://g12024505.sp.pf.mbga.jp/",
      rotation_time: 10,
      cssmypage: "#global_header > li.btn-mypage > a",
      get_actions() {
        return [
          [/^:::$/, "aJ", "#all > div.main_visual > div > a"],
          [['arena'], 'aJ', '#arena a[href*="2Farena%2Fbattle%3F"]'],
          [['duel/duel_result'], 'aJ', '#duel > a'],
          [[/^duel\/duel_conf/], 'aJ', '#all > div.o-talign-c.o-mt-10 > a'],
          [['duel/duelists'], 'aJ', '#all > div > div.child.o-w-60.o-fs-xsmall > div > a[href*="duel%2Fduel_conf%2F"]'],
          [[/^evo\/confirm\//], 'aJ', '#mix > a'],
          [['evo/result'], 'aJ', '#mix > a:contains("続けて限界突破する")'],
          //[["gacha"], 'list', [
          //  ['formJ', 'form[name="normal_gacha_id_6"]']]],
          [[/^gacha(?:$|\/(?:gacha_draw_result|index)\/)/], 'list', [
            ['aJ', 'a[href*="%2Fgacha%2Fgacha_draw%2F"]:last'],
            ['aJ', '#gacha > a:contains("ガチャチケットはこちら")'],
            ['aJ', 'a:contains("ガチャトップへ")']]],
          [['login_bonus/campaign/13'], 'aJ', this.cssmypage],
          [['mafia/login_bonus_exec/18/quest'], 'flashJT', 'canvas'],
          [[/^mix(\/index|$)/], 'list', [
            ['hold'],
            ['aJ', '#mix > a:contains("おまかせ強化")'],
          ]],
          [[/^mix\/confirm(?:_item)?\//], 'aJ', '#mix > a'], // 強化する
          [['mix/result'], 'aJ', '#mix > a:contains("続けて強化する")'],
          [/^mypage/, "list", [
            ['aJ', 'div.js-popup > div > ul > li > a:contains("未受け取りレイド報酬があります")'],
            ['aJ', 'div.js-popup > div > ul > li > a:contains("チームに新しいメンバーが加わりました")'],
            ['aJ', 'div.js-popup > div > ul > li > a:contains("戦闘力ボーナスがあります")'],
            //['hold'],
            ['aJ', '#all > div.main_screen > div.btn-arenaWrap > div > a:contains("抗争中")'],
            ["aJ", "#all > div.main_screen > div.btn-bottomWrap > div.btn-quest > a"]]],
          [['power_bonus'], 'aJ', this.cssmypage],
          [[/present($|\/index)/], 'list', [
            ['aJ', '#gift > a:contains("一括受け取り")']]],
          [['present/batch_receive'], 'list', [
            ['aJ', '#gift > a:contains("一括受け取り")'],
            ['aJ', this.cssmypage]]],
          [['quest'], 'list', [
            ['aJ', '#quest > ul > li > a:contains("期間限定")'],
            ['aJ', '#quest > div.quest_list > a:first']]],
          [['quest/index/1'], 'list', [
            ['aJ', '#quest > div.quest_list > a:first']]],
          [['quest/boss_battle_result/0'], 'list', [
            ['aJ', '#quest > a:contains("次のエリアへ進む")'],
            ['aJ', '#quest > a:contains("クエストを進める")']]],
          [/^quest%2Fquest_flash%2F/, 'funcR', () => {
            tryUntil(() => {
              return $('canvas').touchFlash().length > 0
            })
          }],
          [/^quest%2Fresult%2F/, 'list', [
            //['hold'],
            //['aJ', ''],
            ['aJ', '#quest > div.raid_rescue > a.new'],
            ['aJ', '#quest > a:contains("クエストを続ける")'],
            ['aJ', '#quest > a:contains("次のエリアへ進む")'],
            ['aJ', '#quest > a:contains("クエストを進める")'],
            ['hold', '#quest > a:first()']]],
          [[/^quest\/result_empty_ap\//], 'list', [
            ['aJ', 'div.raid_rescue > a.btn-resque.new']]],
          [/^quest%2Fboss_appear%2F/, 'aJ', '#quest > div > a:has(img[src*="attack_0bp_long_on.png"])'],
          [['raid'], 'list', [
            ['aJ', '#raid > div > a:contains("レイド結果あり")'],
            ['aJ', '#raid > a:contains("クエストで探す")']]],
          [['raid/get_reward_all'], 'list', [
            ['aJ', '#raid > a:contains("ギフトを確認")']]],
          [/^raid%2Fbattle_top%2F/, 'list', [
            ['aJ', '#raid > div > a:has(img[src*="attack_0bp_long_on.png"])'],
            ['aJ', '#raid > div > a:has(img[src*="rescue_02.png"])'],
            ['aJ', '#raid > div.raid_rescue > a.btn-resque.new'],
            ['aJ', '#raid > a:contains("レイドボスを探しに行く")'],
            ['aJ', '#raid > a:contains("今はクエストに行く")']]],
          [['raid/index'], 'list', [
            ['aJ', '#raid > div > a:contains("レイド結果あり")'],
            ['aJ', '#raid > a:contains("クエストで探す")']]],
          [['raid/request_list'], 'list', [
            ['aJ', '#raid > h3:contains("New") + div.o-col-free.o-w-95.o-matb-10 > div.child.o-w-70.o-pr-5 > div.o-float-c > a']]],
          [/^raid%2Fboss_appear_flash%/, 'flashJT', 'canvas'],
          [/^raid%2Fhelp_request%2F/, 'aJ', '#raid > ul > li.child.right > a[href*="quest_exec"]'],
          [/^raid%2Fresult%2F/, 'aJ', '#raid > a:contains("レイドボスを探しに行く")'],
          [/_(flash|swf)%/, 'flashJT', 'canvas'],
          [/xxxxxxxxxxxxxxxxxxxxx/]
        ];
      }
    }
  };

  function msgloop(action_handler) {
    var i,
      j,
      list_action,
      succ,
      siteI,
      siteT,
      ele,
      sites = Object.keys(handler),
      siteStatic = new Set();
    GM_log('-msgloop--------------------------------------- ' + Date());
    var actions = action_handler.get_actions();
    function switch_site() {
      var new_app_id,
        now = Date.now(),
        switch_flag;
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
          } while (siteStatic.has(new_app_id));
          GM_setValue("site_loop_index", siteI);
          GM_setValue("site_switch_flag", 0);
          GM_log("switch-site " + siteI + " " + siteT);
        }
        siteT = now + 60 * 1000 * handler[new_app_id].rotation_time;
        if (siteT != siteT /*NaN*/) {
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
    if (typeof rotateSite_local === "undefined" || rotateSite_local === true) {
      succ = switch_site();
    }
    function time_wait_flashJT(action) {
      //var cnt = 0;
      tryUntil(() => {
        var canvas = $(action[1]),
          x = action[2],
          y = action[3],
          interval = action[4] ? action[4] : 150;
        if (canvas.length > 0) {
          //canvas.clickFlash(x, y);
          canvas.touchFlash(x, y, interval);
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
    $(document).on('touchstart', (eve) => {
      //GM_log(eve.originalEvent.touches[0]);
      //GM_log("clientXY", eve.originalEvent.touches[0])
      if (eve.originalEvent.touches[0].target.getBoundingClientRect == undefined) {
        GM_log("no bcr; touch", eve.originalEvent.touches[0].target.nodeName, "client", eve.originalEvent.touches[0].clientX, eve.originalEvent.touches[0].clientY);
        return;
      }
      var rect = eve.originalEvent.touches[0].target.getBoundingClientRect();
      var zoom_lvl = $(eve.originalEvent.touches[0].target).getZoomLvl();
      //GM_log(eve.originalEvent.touches[0].clientX, eve.originalEvent.touches[0].clientY);
      GM_log("touch", zoom_lvl, eve.originalEvent.touches[0].target.nodeName, "offset", eve.originalEvent.touches[0].clientX - rect.left, eve.originalEvent.touches[0].clientY - rect.top, "offsetP", (eve.originalEvent.touches[0].clientX / zoom_lvl - rect.left) / rect.width, (eve.originalEvent.touches[0].clientY / zoom_lvl - rect.top) / rect.height);
      //GM_log("bound", rect.left, rect.top, "scroll", window.scrollX, window.scrollY);
      //rect = $(eve.originalEvent.touches[0].target).getBoundRectZoom();
      //GM_log("bound", rect.x, rect.y, "scroll", window.scrollX, window.scrollY);
      //GM_log("touch zoom", rect, (eve.originalEvent.touches[0].clientX - rect.x)/rect.w, (eve.originalEvent.touches[0].clientY - rect.y)/rect.h);

    });
    //$(document).on('click', (eve) => {GM_log(eve.originalEvent);});
    var pre_action = action_handler.pre_action;
    if (pre_action != undefined) {
      pre_action();
    }
    for (i = 0; i < actions.length; i += 1) {
      if ((actions[i][0] instanceof RegExp && url !== undefined && url.match(actions[i][0])) ||
        (actions[i][0] instanceof Array &&
          (actions[i][0][0] === decodeURL || (actions[i][0][0] instanceof RegExp && decodeURL.match(actions[i][0][0]))) &&
          (actions[i][0][1] === undefined ||
            (typeof actions[i][0][1] === 'function' && actions[i][0][1](param)) ||
            typeof actions[i][0][1] === 'object' && (function (k, p) {
              for (var key in k) {
                if (k[key] !== p[key])
                  return false;
              }
              return true;
            }
              (actions[i][0][1], decodeParam))))) {
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
            case 'setCookie':
            case 'setGMV':
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

  if (location.hostname === 'sp.pf.mbga.jp') {
    app_id = path.match(/(\d+)/)[1];
  } else if (location.hostname.match(/^g(\d+)\.sp\.pf\.mbga\.jp$/)) {
    app_id = location.hostname.match(/^g(\d+)\.sp\.pf\.mbga\.jp$/)[1];
  } else if (location.hostname.match(/^(\S+)\.sp\.mbga\.jp$/)) {
    app_id = location.hostname.match(/^(\S+)\.sp\.mbga\.jp$/)[1];
    decodeURL = location.pathname.substring(1);
    decodeParam = param;
  } else if (location.hostname.match(/^mobage.(\S+).jp$/)) {
    app_id = location.hostname.match(/^mobage.(\S+).jp$/)[1];
  }
  GM_log(location.hostname);
  GM_log("REF:", document.referrer);
  if (app_id !== undefined) {
    GM_log(app_id);
    GM_log(param);
    if (decodeURL === undefined) {
      if (param.url === undefined) {
        url = ":::";
        decodeURL = ":::";
        decodeParam = {};
      } else {
        var urlhelper = new URL(param.url);
        decodeURL = urlhelper.pathname.substring(1);
        decodeParam = decodeURLSearchParam(urlhelper.searchParams);
        url = encodeURIComponent(urlhelper.pathname.substring(1) + urlhelper.search);
      }
    }
    GM_log(url);
    if (decodeURL.endsWith('/')) {
      decodeURL = decodeURL.slice(0, -1);
    }
    GM_log("decodeURL", decodeURL);
    GM_log("decodeParam", decodeParam);
    if (typeof setStopSite_local !== "undefined" && setStopSite_local.has(app_id)) {
      return;
    }
    action_handler = handler[app_id];
    if (action_handler) {
      msgloop(action_handler);
    }
  }
}
  ());
