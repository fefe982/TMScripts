var xpathmypage = "//header/div[@class='sprite btn_base header_left']/a";
var cssmypage = '#main_container > header > div.sprite.btn_base.header_left > a'
//var xpathevent = '//a[text()="oopserr"]';
var xpathevent = '//a[contains(@href, "EventTop")]';
var xpatheventnext = '//*[@id="mainCommand_quest"]/a';
var xpathgiftbox = '//a[.//i[@class="sprite_menu3 menu_btn_prize"]]';

function handleMissionResult() {
    var succ = false;
    succ = succ || clickA("//*[@id=\"go\"]/a");
    succ = succ || clickA("//*[@id=\"next\"]/a");
    succ = succ || clickA(xpathmypage);
}

function handleMissionList() {
    var succ = false;
    succ = succ || clickA("//*[@id=\"current_priority\"]/a");
    succ = succ || clickA("//*[@id=\"to_latest_mission\"]/a");
    succ = succ || clickA("//div[@class='boss_btn ']/div/a");
}

function handleRaidGacha() {
    //if (!clickA("//*[@id=\"main\"]/section[1]/div[3]/div[2]/a")){
    //    clickA("//*[@id=\"main\"]/section[1]/div[2]/div/p/a");
    //}
}
function handleFriendGachaTop() {
    var free_gacha = getXPATH("//*[@id=\"main\"]/div[4]/div/ul/li/div/a");
    if (free_gacha) {
        clickLink(free_gacha);
    } else {
        for (i = 3; i >= 2; i--) {
            var gacha = getXPATH("//*[@id=\"main\"]/div[4]/div/ul/li/div[" + i + "]/div/a");
            if (gacha) {setTimeout(clickLink(gacha), 1000); break; }
        }
    }
}
function handleFriendGachaRes() {
    var i;
    //for (i = 3; i>=2; i--) {
    //    if (clickA("//*[@id=\"main\"]/aside/div/div/ul/li/div["+i+"]/div/a")){return;}
    //}
    //clickA(xpathmypage);
}

function handleCoinGacha() {
    var lvl = 512;
    //alert("coin");
    for (lvl = 512; lvl >= 510; lvl--) {
        for (i = 2; i >= 1; i--) {
            var button = getXPATH("//*[@id=\"item_" + lvl + "\"]/div/div" + (i === 1 ? "" : ("[" + i + "]")) + "/a");
            if (button) {clickLink(button); return; }
        }
    }
    clickA(xpathmypage);
}

function handlemypage() {
    //alert("mypage");
    var ap_gauge = $('div.gauge.stamina > div.bar'),
        raid_help_clear = getCookie("__myraid_clear"),
        no_bp_candy = getCookie("__ht_no_bp"),
        battle_olympia_over = getCookie("__ht_bo_over"),
		raid_my_boss_wait = getCookie("__ht_myboss_wait"),
        succ = false;
    if (!raid_help_clear && !no_bp_candy) {
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
    succ = succ || clickA('//div[@class="badge_present_wrap"]/a');
	GM_log(ap_gauge.css('width'));
    if (!succ && ap_gauge && ap_gauge.css("width").match(/[1-9].px|[89]px/)) {
        var eventL = $('#main > div > a[href*="event%2FDoSetClickCount%3F"]:first()');
		//alert(eventL.length);
		//alert(eventL.text());
        if (eventL.length > 0 && !$(eventL[0]).text().match(/\[終了\]/)) {
            succ = eventL.last().clickJ().length > 0;
        }
        //succ = succ || clickA(xpathevent);
        succ = succ || ($('a[href*="MissionList"]').last().clickJ().length > 0);
    }
    if (!succ) {
        if (getXPATH('//div[@class="battle"]/a/div[@class="mypage_battleOlympia"]')) {
            if (!battle_olympia_over) {
                succ = clickA('//div[@class="battle"]/a');
            }
        } else if (getXPATH("//div[@class='battle']/div/div[@class='badge']") || getXPATH("//div[@class='sprite gauge_bp bp1']")) {
            setCookie("__mybattle_bp", "1", 60);
            succ = clickA("//div[@class='battle']/a");
        }
    }
    if (!succ) {
        setTimeout(function () {location.reload(true); },  60000);
    }
}

function handleBattleTop() {
    var free_text = getXPATH("//*[@id=\"btn_entry\"]/a/div");
    //alert(free_text);
	if ($('a[href*="battleTower%2FDoEntryChallenge"]').clickJ().length > 0) {
        return;
    }
    if (free_text) {
        //alert(free_text.innerText);
        var res  = free_text.innerText.match(/ [\s\S]*残り([0-9]*)回/);
        //alert(res[1]);
        setCookie("__mybattle_free", res[1], 60);
        clickA("//*[@id=\"btn_entry\"]/a");
    } else if (getCookie("__mybattle_bp")  > 0) {
        var succ = false;
        succ = succ || clickA("//*[@id=\"btn_entry\"]/a");
        succ = succ || clickA("//*[@id=\"main\"]/div/div[1]/div[3]/div[2]/ul/li[3]/div/a");
        succ = succ || clickA(xpathmypage);
    } else {
        clickA(xpathmypage);
    }
}

function handleBattleResult() {
    if (getCookie("__mybattle_free") > 0 || getCookie("__mybattle_bp") > 0) {
        clickA("//*[@id=\"main\"]/nav[1]//a");
    } else {
        clickA(xpathmypage);
    }
}

function handleBattleTower() {
    // "//*[@id=\"first_action_box\"]/div[1]/div[3]/a"
    //alert("battletower");
    var free = getCookie("__mybattle_free");
    var bp = 0;
    var n_use_bp = 1;
    var bp_use = getXPATH("//*[@id=\"do_battle_btn\"]/div[2]");
    if (bp_use) {
        var res = bp_use.innerText.match(/BP([0-9])/);
        if (res) { n_use_bp = res[1]; }
    }
    if (n_use_bp > 0) {
        free = 0;
    } else if (n_use_bp === 0) {
        if (!free) {free = 1; }
    }
    if (free) {
        setCookie("__mybattle_free", free > 0 ? free - 1 : 0, 60);
    }
    var bp_gauge;// = getXPATH("//div[@class='sprite gauge_bp bp_gauge3']");
    var style;// = getComputedStyle(bp_gauge);
    var disp;// = style.getPropertyValue("display");
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
        setCookie("__mybattle_bp", bp, 60);
    } else {
        setCookie("__mybattle_bp", bp - 1, 60);
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
        clickA(xpathmypage);
    }
}

function handleFusionEnd() {
    var lvl = getXPATH("//div[div[@class='sprite_deck heading_level']]").innerText;
    var res = lvl.match(/([0-9]+)\/([0-9]+)/);
    if (res[1] === res[2]) {
        clickA("//a[contains(text(),'他のカードを強化')]");
    } else {
        clickA("//a[contains(text(),'さらに強化')]");
    }
}

function handleFusionResult() {
    var form = getXPATH("(//ul[@class='lst_sub']/li/form)[last()]"),
        succ = false;
    if (form) {
        form.elements[1].selectedIndex = form.elements[1].options.length - 1;
        form.submit();
        succ = true;
    }
    succ = succ || clickA('//a[text()="Nカード一括強化"]');
    succ = succ || clickA(xpathmypage);
}

function handlePrizeTop() {
    var succ = false;
    succ = succ || clickForm("//*[@id=\"main\"]/div[2]/div/form");
    succ = succ || clickA("//a[span[@class='badge fnt_normal']]");
    succ = succ || clickA(xpathmypage);
}

function handleCaveAreaSelect() {
	var l = $('a:contains("選択")');
    var areaID = Math.floor(Math.random() * l.length);
	l.eq(areaID).clickJ();
}

function handleCardSelect() {
    var select_sort = getXPATH("//form/div[2]/div/select");
    if (select_sort && select_sort.selectedIndex !== 8) {
        select_sort.selectedIndex = 8;
        getXPATH("//form").submit();
    }

    setInterval(function () {
        clickA('//li[//td[@class="aura"]]/div[2]/a');
    }, 2000);
}

function handleRaidBossAssistList() {
    if (!clickA('//a[.//span[@class="sprite txt_new"]]')) {
        setCookie("__myraid_clear", 1, 60);
        clickA(xpathmypage);
    }
}

function handleEventRes() {
    var min = 1000000, minid = 0, i;
    for (i = 1; i <= 3; i++) {
        var att_e = getXPATH('//*[@id="main"]/section[2]/ul/li[' + i + ']/a/div/div[2]/table/tbody/tr[3]/td');
        var res = att_e.innerText.match(/([0-9]+)/);
        var att = parseInt(res[1], 10);
        var def_e = getXPATH('//*[@id="main"]/section[2]/ul/li[' + i + ']/a/div/div[2]/table/tbody/tr[4]/td');
        res = def_e.innerText.match(/([0-9]+)/);
        var def = parseInt(res[1], 10);
        if (att + def < min) {
            min = att + def;
            minid = i;
        }
    }
    if (minid > 0) {
        clickA('//*[@id="main"]/section[2]/ul/li[' + minid + ']/a');
    } else {
        clickA(xpathmypage);
    }
}

function handleEventBattle() {
    var i;
    setInterval(function () {
        var battle_btn_wrapper = getXPATH('//*[@id="first_action_box"]');
        if (battle_btn_wrapper) {
            if (getComputedStyle(battle_btn_wrapper).getPropertyValue("display") !== "none") {
                var battle_btn = getXPATH('//*[@id="do_battle_btn"]');
                if (getComputedStyle(battle_btn).getPropertyValue("display") !== "none") {
                    clickSth(battle_btn, "click");
                } else {
                    var ok = getXPATH("//*[@id=\"bp_recovery\"]/div/div[2]");
                    var ele = getXPATH("//*[@id=\"bp_recovery\"]/ul/li[2]/div[1]");
                    if (!ele || ele.dataset.life === 0) {
                        ele = getXPATH("//*[@id=\"bp_recovery\"]/ul/li[1]/div[1]");
                    }
                    if (ele && ele.dataset.life >= 1) {
                        clickSth(ele, "click");
                        setTimeout(function () {clickSth(ok, "click"); }, 1000);
                    }
                }
            }
        }
    }, 2000);

    setInterval(function () {
        var res_wrapper = getXPATH("//*[@id=\"second_action_box\"]");
        if (res_wrapper && getComputedStyle(res_wrapper).getPropertyValue("display") !== "none") {
            var result = getXPATH("//*[@id=\"battle_result_btn\"]/a");
            if (result) {clickSth(result, "click"); }
        }
    }, 1000);

    setInterval(function () {
        var ff = getXPATH("//*[@id=\"stage_front\"]");
        if (ff && getComputedStyle(ff).getPropertyValue("display") !== "none") {clickSth(ff, "click"); }
    }, 1000);
}
//http://sp.pf.mbga.jp/12011538?url=http%3A%2F%2Fmhunter.forgroove.com%2FeventRaidBoss%2FRaidBossTop%2F%3FuserRaidbossId%3D141239245%26isHelpUser%3D1
//http://sp.pf.mbga.jp/12011538?url=http%3A%2F%2Fmhunter.forgroove.com%2FitemBox%2FGachaItemList%2F%3FitemManageId%3D3
//http://sp.pf.mbga.jp/12011538?url=http%3A%2F%2Fmhunter.forgroove.com%2FeventCollection%2FRaidBossTop%2F%3FmissionId%3D1
//http://sp.pf.mbga.jp/12011538?url=http%3A%2F%2Fmhunter.forgroove.com%2FeventCollection%2FRaidBossBattleResult%2F%3F
//historyId%3D132067221%26userRaidbossDefeatLogId%3D158357577%26userRaidbossId%3D165736712%26sentHelpFlg%3D0%26addEventPoint%3D2940%26winEventPoint%3D240%26itemEventPoint%3D1500%26attackEventPoint%3D1200%26getEventItem%3D663%26isEventPointOnly%3D1%26specialRewardHistory%3D%26winFlg%3D1%26isFever%3D0%26isMultiRaid%3D0
//http://sp.pf.mbga.jp/12011538?url=http%3A%2F%2Fmhunter.forgroove.com%2FeventCollection%2FRaidBossBattleResult%2F%3FuserRaidbossDefeatLogId%3D158351315
//http://sp.pf.mbga.jp/12011538?url=http%3A%2F%2Fmhunter.forgroove.com%2FeventRaidBoss%2FEventTop
function handleEvent() {
    var succ = false;
    var raid_clear = getCookie("__myraid_clear");
    var no_bp_candy = getCookie("__ht_no_bp");
    if (!no_bp_candy || no_bp_candy < 5) {
        succ = succ || clickA('//a[.//p[contains(text(), "逃亡まで")]]');
        //if (!raid_clear){
        //    succ = succ || clickA('//div[@class="event_help_button"]//div[contains(@class, "icon_raidboss_help")]//a');
        //}
    }
    //succ = succ || clickA('//a[.//span[contains(text(), "逃亡まで")]]');
    succ = succ || clickA(xpatheventnext);
    succ = succ || clickA('//*[@id="go"]/a');
    succ = succ || clickA(xpathmypage);
}
function handleEventRaid() {
    var boss_info = $('#main > div.subtitle').first();
    var boss_n, boss_lvl;
    var wait = 2000;
    var back_xpath;
    //debugger;
    if (url.match(/%2FraidBoss%2F/)) {
        back_xpath = '//a[text()="クエストに戻る"]';
    } else {
        back_xpath = '//*[@id="main"]/div[9]/div[1]/div/p/a';//xpatheventnext;
    }
    if (boss_info.length > 0) {
        //alert(boss_info.innerText);
        var res = boss_info.text().match(/(\S+)[\s\S]*Lv([0-9]+)/);
        if (res) {
            boss_n = res[1];
            boss_lvl = res[2];
        } else {
            boss_n = boss_info.innerText;
            boss_lvl = 0;
        }
    }
	//debugger;
    var hp_gauge = $('div.gauge.bosshp.box_extend.margin_x > div.bar').first();
	GM_log("hp_gauge : " + hp_gauge.attr('style'));
	var hp_full = hp_gauge.attr('style').match(/100/);
	var help_record = $('div.tactical_situation_detail:contains("' + USERNAME + '")').length > 0;
	GM_log("help_record : " + help_record);
    var last_attack = $('div.tactical_situation_detail').first();
    var bp_need = 1;
	GM_log("discover : " + $('#main > div.raidboss_module div.margin_top_10 > ul.lst_sub > li:last() > div a').first().text());
	//"#main > div:nth-child(14) > div:nth-child(1) > div > ul > li:nth-child(2) > div > dl > dd.fnt_emphasis.padding_left > a"
	//#main > div.raidboss_module  div > ul > li:nth-child(2) > div > dl > dd.fnt_emphasis.padding_left > a
    if (!hp_full &&
		$('#main > div.raidboss_module div.margin_top_10 > ul.lst_sub > li:last() > div a').first().text() != USERNAME &&
		help_record &&
		!url.match(/GiDimension/)) {
		$('a[href*="DoMissionExecutionCheck"]').clickJ();
        //clickA(back_xpath);
        return;
    }

	var attack_num = 0;
    setInterval(function () {
		//if (url.match(/GiDimension/)) {
		//	return;
		//}
        var attack = $('#do_battle_btn_' + bp_need).filter(':visible');
        if (attack.length > 0 && !attack.hasClass('btn_main_off_small')) {
			if (attack_num == 0) {
				attack.clickJ();
			}
			attack_num ++;
			attack_num = attack_num % 5;
			return;
		}
		if (attack.length == 0) {
			$('#stage_front').clickJ();
			return;
		}
		add_bp = $('#bp_recovery > div.flexslider.small > div > ul > li > ul > li > div > span:nth-child(1)');
		GM_log("bp_candy : " + add_bp.length);
		if (add_bp.length == 0) {
		    var no_bp_candy = getCookie("__ht_no_bp");
            if (no_bp_candy) {
				no_bp_candy++;
			} else {
				no_bp_candy = 1;
			}
			setCookie("__ht_no_bp", no_bp_candy, 60 * 10);
			$('a[href*="%2FDoMissionExecutionCheck"]').last().clickJ();
		} else {
			add_bp.first().clickJ();
		}
    }, wait);
}

function handleFusionCard() {
    if (getXPATH('//div[contains(text(), "選択可能なカードがありません")]')) {
        clickA(xpathmypage);
    } else {
        clickA('//a[text()="Nカード一括強化"]');
    }
}

function handleTeamBattle() {
    var wait = 2000,
        bp_need = 1,
        i,
        attacked = false;
    setInterval(function () {
        attacked = attacked || clickA('//*[@id="do_battle_btn" and not(@style="display:none")]/a');
    }, wait);

    setInterval(function () {
        if (getXPATH('//*[@id="do_battle_btn" and @style="display:none"]')) {
            var ele, ele_s;
            var ok = getXPATH('//*[@id="bp_recovery"]/div/div[2]');//"//*[@id=\"bp_recovery\"]/div/div[2]");
            ele_s = getXPATH("//*[@id=\"bp_recovery\"]/ul/li[2]/di/v[contains(@class, 'btn_main_small')]");
            ele = getXPATH("//*[@id=\"bp_recovery\"]/ul/li[1]/div[contains(@class, 'btn_main_small')]");
            if (ele_s && ele_s.dataset.life > 0) {
                clickSth(ele_s, "click");
                setTimeout(function () {clickSth(ok, "click"); }, 1000);
            } else if (ele && ele.dataset.life > 0) {
                clickSth(ele, "click");
                setTimeout(function () {clickSth(ok, "click"); }, 1000);
            } else {
                clickA(xpathgiftbox);
            }
        }
    }, 2000);
}
function handleERBBattle() {
    // player battle, BP1 only
    var wait = 2000,
        bp_need = 1,
        i,
        attacked = false;
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
        if (ff && getComputedStyle(ff).getPropertyValue("display") !== "none") {clickSth(ff, "click"); }
    }, 5000);

    var reload = false;
    setInterval(function () {
		var ele = $('div#do_battle_btn');
		var recharge = false;
		if (ele.length > 0) {
			if (ele.filter(':visible').length == 0) {
				recharge = true;
			}
		} else {
			recharge = $('div.btn_main_off_small.ui_attack1').length > 0;
		}
		//alert(ele.length);
        if (reload === false && recharge === true) {//getXPATH('//*[@id="do_battle_btn" and @style="display:none"]')) {
            //debugger;
            var ele, ele_s;//*[@id="bp_recovery"]/div/div[2]
            var ok = getXPATH('//*[@id="bp_recovery"]/div/div[text()="OK"]');//"//*[@id=\"bp_recovery\"]/div/div[2]");
            ele_s = getXPATH("//*[@id=\"bp_recovery\"]//ul/li[2]/div/div[contains(@class, 'bp_recovery_btn')]");
            ele = getXPATH("//*[@id=\"bp_recovery\"]//ul/li[1]/div/div[contains(@class, 'bp_recovery_btn')]");
            if (ele_s && ele_s.dataset.life > 0) {
                clickSth(ele_s, "click");
                setTimeout(function () {clickSth(ok, "click"); }, 1000);
            } else if (ele && ele.dataset.life > 0) {
                clickSth(ele, "click");
                setTimeout(function () {clickSth(ok, "click"); }, 1000);
            } else {
                //clickA(xpathgiftbox);
                //setTimeout(function(){location.reload(true);},  600000);
                //default reload at msgloop
                reload = true;
            }
        }
    }, 2000);
}
var eventName = "Anniversary";
var actions = [
    [/apology%2FApologyList%2F/, 'form', '//*[@id="main"]/div[1]/ul/li/form'],
	[/arena%2FArenaBattleConf%2F/, 'list', [
		//['aJV', '#do_battle_btn'],
		['aJ', 'a:contains("対戦結果を見る")']]],
	[/arena%2FArenaBattleResult%2F/, 'aJ', 'a:contains("次の相手")'],
	[/arena%2FArenaTop/, 'aJ', '#btn_entry > a'],
    [/battleOlympia%2FBattleConf%2F/, 'a', '//a[contains(text(), "対戦結果を見る")]'],
    [/battleOlympia%2FBattleResult%2F%/, 'a', '//a[text()="次の相手"]'],
    [/battleOlympia%2FTargetSelect%2F/, 'minmax', '//*[@id="main"]/section/ul/li[', ']/a/div/div[2]/table/tbody/tr[2]/td', ']/a'],
    [/battleOlympia%2FTop/, 'list', [
        ['a', '//div[@class="battle_entry"]/a'],
        ['setCookie', '__ht_bo_over', 1, 3600 * 24]]],
    [/battleTower%2FBattleConf%2F/, "func", handleBattleTower],
    [/battleTower%2FBattleResult%2F/, "func", handleBattleResult],
    [/battleTower%2FBattleTop/, "func", handleBattleTop],
    [/battleTower%2FBattleTowerBossConf%2F/, "func", handleBattleTower],
    [/battleTower%2FBattleTowerBossResult%2F/, "func", handleBattleResult],
    [/card%2FBulkCardSell\b/, 'a', xpathmypage],
    [/card%2FBulkCardSellConfirm%2F/, 'form', '//*[@id="main"]/div/form'],
    [/card%2FBulkCardSellList%2F/, 'a', '//a[text()="Nカードを一括で売却"]'],
    [/cave%2FAreaSelect/, "func", handleCaveAreaSelect],
    [/cave%2FCardSelect/, "func", handleCardSelect],
    [/cave%2FIndex/, "a", "//*[@id=\"main_btn_area\"]/a"],
    [/cave%2FItemSelect/, "form", "//*[@id=\"main\"]/form"],
    [/cave%2FQuestConfirm/, "a", "//*[@id=\"main\"]/div[3]/a"],
    [/cave%2FQuestResult%2F/, 'aJ', 'a[href*="cave%2FIndex"]:last()'],
    [/companion%2FCompanionApprovalList%2F/, "form", "//*[@id=\"wrap_object\"]/div[1]/div/form"],
    [/CompanionApplicationAccept$/, "form", "//*[@id=\"main\"]/section/div/form"],
    [new RegExp("event" + eventName + "%2FEventTop"), 'list', [
		//['hold'],
		['aJ', 'a[href*="eventAnniversary%2FEventQuestEntryConfirm"]'],
		['aJ', 'a[href*="eventAnniversary%2FEventQuestEntryList"]'],
        ['aNC', '__ht_myboss_wait', '//a[contains(@href, "event' + eventName + '%2FRaidBossTop")]'],
        ['aNC', '__myraid_clear', '//a[contains(@href, "RaidBossAssistList")]'],
        ['a', '//a[contains(@href,"' + "event" + eventName + "%2FDoMissionExecutionCheck" + '")]'],
		['aJ', 'a[href*="event' + eventName  + '%2FMissionList"]'],
        ['hold']]],
    [new RegExp("event" + eventName + "%2FMissionList"), 'list', [
        ['a', '//a[contains(@href, "event' + eventName + '%2FDoMissionExecutionCheck")]'],
        ['hold']]],
    [new RegExp("event" + eventName + "%2FMissionResult%2F"), 'list', [
        //['dbg'],
        //['aNC', '__ht_myboss_wait', '//a[contains(@href, "event' + eventName + '%2FRaidBossTop")]'],
		//['hold'],
		['aJ', 'a[href*="%2FDoGetMissionReward%2F"]'],
		['aJ', 'a[href*="eventCapture2%2FCaptureBossTop%2F"]'],
		['aJ', 'a[href*="%2FDoMissionExecutionCheck%3"]:contains("使う")'],
		['a', '//a[contains(@href, "event' + eventName + '%2FRaidBossTop")]'],
        ['aNC', '__myraid_clear', '//a[contains(@href, "RaidBossAssistList")]'],
        ['a', '//a[contains(@href,"' + "event" + eventName + "%2FDoMissionExecutionCheck" + '")]'],
		['aJ', 'a[href*="event' + eventName + '%2FMissionList"]'],
        ['hold']]],
    [new RegExp("event" + eventName + "%2FRaidBossBattleResult"), 'list', [
        ['a', '//a[contains(@href,"' + "event" + eventName + "%2FDoMissionExecutionCheck" + '")]'],
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
        ['aNC', '__myraid_clear', '//a[contains(@href, "RaidBossAssistList")]'],
        ['a', '//a[contains(@href,"eventCollection%2FDoMissionExecutionCheck")]'],
        ['hold']]], //@class="block_flex btn_base radius"]/a'],
    [/eventCollection%2FMissionResult%2F/, 'list', [
        ['aNC', '__ht_myboss_wait', '//a[contains(@href, "eventCollection%2FRaidBossTop")]'],
        ['a', '//a[contains(@href,"eventCollection%2FDoMissionExecutionCheck")]'],
        ['hold']]],
    [/eventCollection%2FRaidBossBattleResult/, 'list', [
        ['a', '//a[contains(@href,"eventCollection%2FDoMissionExecutionCheck")]'],
        ['hold']]],
        //'func', handleEvent], //'//p[@class="block_flex btn_base radius"]/a'],
    [/eventStoryMission%2FEventBattleConf/, 'list', [
        ['a', '//*[@id="skip_battle_btn"]/div/a'],
        ['func', handleERBBattle],
        ['hold']]],
    [/eventStoryMission%2FEventBattleResult/, 'list', [
        ['a', '//a[contains(@href, "eventStoryMission%2FMissionList")]'],
        ['a', '//a[contains(@href, "eventStoryMission%2FDoMissionExecutionCheck")]'],
        ['hold']]],
    [/eventStoryMission%2FMissionList/, 'list', [
        ['a', '//a[contains(@href, "eventStoryMission%2FDoMissionExecutionCheck")]'],
        ['hold']]],
    [/eventStoryMission%2FEventTop/, 'list', [
        ['aNC', '__myraid_clear', '//a[contains(@href, "RaidBossAssistList")]'],
        ['a', '//a[contains(@href, "eventStoryMission%2FMissionList")]'],
        ['a', '//*[@id="eventstorymission_top"]/div/div[2]/a'],
        ['a', '//a[contains(@href, "eventStoryMission%2FRaidBossTop")]'],
        ['a', '//a[contains(@href, "eventStoryMission%2FDoMissionExecutionCheck")]']
    ]],
    [/eventStoryMission%2FMissionResult/, 'list', [
        ['a', '//a[contains(@href, "eventStoryMission%2FEventBattleConf")]'],
        ['a', '//*[@id="mission_wrap"]/div/div/p/a'], //go
        ['a', '//*[@id="mission_wrap"]/div[2]/div/a'], //feebar
        ['a', '//*[@id="mission_wrap"]/div[1]/a'], //reorio
        ['aNC', '__myraid_clear', '//*[@id="main"]/div[2]/div/a'], //help
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
    //[/eventTeamBattle%2FMissionResult%2F/, 'a', xpathmypage],
	[/eventSurvival%2FBattleConf/, 'func', handleERBBattle],
	[/eventSurvival%2FBattleResult/, 'list', [
		['a', '//a[@href="http://sp.pf.mbga.jp/12011538?url=http%3A%2F%2Fmhunter.forgroove.com%2FeventSurvival%2FDoMissionExecutionCheck"]'],
		['hold']]],
	[/eventSurvival%2FEventTop/, 'list', [
		['a', '//a[@href="http://sp.pf.mbga.jp/12011538?url=http%3A%2F%2Fmhunter.forgroove.com%2FeventSurvival%2FDoMissionExecutionCheck"]'],
        ['a', '//a[@href="http://sp.pf.mbga.jp/12011538?url=http%3A%2F%2Fmhunter.forgroove.com%2FeventSurvival%2FBattleConf"]'],
		['hold']]],
	[/eventSurvival%2FMissionResult/, 'a', '//*[@id="go"]/a'],
    [/event[a-zA-Z0-9]*%2FRaidBossTop/, 'func', handleEventRaid],
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
    [/fusion%2FBulkFusionConfirm%2F/, 'form', '//*[@id="main"]/div[@class="section_sub"]/form'],
    [/fusion%2FFusionEnd%2F/, "func", handleFusionEnd],
    //[/fusion%2FFusionTop/, 'func', handleFusionCard], //],
	[/fusion%2FFusionTop/, 'func', function () {
		if (document.referrer.match(/fusion%2FMaterialFusionTop/)) {
			$('a[href*="mypage%2FIndex"]').clickJ();
		} else {
			$('a[href*="fusion%2FMaterialFusionTop"]').clickJ();
		}
	}],
    [/fusion%2FMaterialFusionTop/, "func", handleFusionResult],
    [/fusion%2FMaterialFusionConfirm%2F/, "form", '//*[@id=\"main\"]/div[@class="section_sub"]/form'],
    [/gacha%2FGachaCharacterCoinTop/, 'a', '//a[contains(text(),"ガチャをする")]'],
    [/gacha%2FGachaCoinTop%2F/, 'a',  '(//a[contains(text(), "ガチャをする")])[last()]'],
    [/gacha%2FGachaFlash%2F/, 'a', '//a[text()="マイページへ"]'],
    //[/gacha%2FGachaResult%2F/, "func", handleCoinGacha],
    [/gacha%2FGachaResult%2F%3FgachaThemeId%3D3%26themeId%3D3/, 'list', [
        ['a', '//a[contains(@href, "FGachaFlash%2F")]'], //''//a[text()="バトルをスキップしてガチャをする"]'],
        ['a', '//a[contains(@href, "prizeReceive%2FPrizeReceiveTop%2F")]']]], //text()="贈り物BOX"]']]],
    [/gacha%2FGachaResult%2F%3FgachaId%3D/, 'list', [
		["a", '(//a[@class="btn_main_large" and contains(text(), "ガチャ")])[last()]'],
		['aJ', cssmypage]]],
    [/gacha%2FGachaSwf%2F/, 'flash', "//*[@id=\"container\"]"],// 372, 62],
    //[/gacha%2FGachaTop%2F%3FthemeId%3D2/, 'a', '(//a[contains(text(), "ガチャをする")])[last()]'],
    [/gacha%2FGachaTop(%2F)?%3FthemeId%3D2/, 'a', '(//a[@class="btn_main_large" and contains(text(), "ガチャ")])[last()]'],
    [/gacha%2FGachaTop(%2F)?%3FthemeId%3D3/, 'a', '//a[contains(@href, "FGachaFlash%2F")]'], //text(), "ガチャをする")])[last()]'],
    //[/gacha%2FGachaTop(%2F)?%3FthemeId%3D3/, "a", "//*[@id=\"main\"]/section[1]/div[2]/div/ul/li[2]/a"],
    [/itemBox%2FGachaItemList%2F/, 'a', '//a[text()="ガチャをする"]'],
    [/mission%2FQuestResult/, "a", "//*[@id=\"main\"]/div[6]/a"],
    [/mission%2FMissionResult%2F/, 'list', [
		['a', '//a[contains(@href,"' + "event" + eventName + "%2FDoMissionExecutionCheck" + '")]'],
		['a', "//*[@id=\"go\"]/a"],
		['a', "//*[@id=\"next\"]/a"]]],
    [/mission%2FMissionList/, "func", handleMissionList],
    //[/mission%2FMissionSwf%2F/, 'flash', "//*[@id=\"container\"]"],//, 372, 62],
    [/mission%2FBossAppear/, "form", "//*[@id=\"main\"]/div[3]/form"],
    [/mission%2FBossBattleResult%2F/, "a", "//*[@id=\"to_latest_mission\"]/a"],
    [/mypage%2FGreetEnd%2F/, 'a', xpathmypage],
    [/mypage%2FIndex/,  "func", handlemypage],
    [/mypage%2FLoginBonusSpecial%2F/, 'a', "//div[contains(@class, 'btn_present')]/a"],
    [/prizeReceive%2FPrizeReceiveTop/, 'list', [
        //['a', '//a[text()="強化する"]'],
        ['form', "//*[@id=\"main\"]/div[2]/div/form"],
        ['a', "//a[span[@class='badge fnt_normal']]"],
		['aJ', cssmypage]]],
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
    [/raidBoss%2FRaidBossAssistList/, 'func', handleRaidBossAssistList],
    [/raidBoss%2FRaidBossBattleResult/, "a", "//*[@id=\"main\"]/div[3]/a"],
    [/raidBoss%2FRaidBossTop/, "func", handleEventRaid],
    [/QuestEnd/, "a", "//*[@id=\"main_container\"]/header/div[2]/a"],
    [/CompanionApplicationAcceptEnd/, "a", "//*[@id=\"main_container\"]/header/div[2]/a"],
    [/EvolutionConfirm/, "form", "//*[@id=\"main\"]/div[2]/div[4]/div/form"],
    //[/eventBattle%2FEventBattleConf%3F/, 'func', handleEventBattle],
    //[/eventBattle%2FEventBattleResult%3F/, 'a', '//a[contains(text(), "相手を探す")]'],
    //[/eventBattle%2FMissionResult%2F/, 'func', handleEventRes],
    //[/eventBattle%2FMissionSwf%2F/, 'flash', "//*[@id=\"container\"]", 372,62],
    [/FusionFlash/, "flash", "//*[@id=\"container\"]"],
    [/%2FMissionSwf%2F/, 'flashJT', '#container'],// 372, 62],
    [/Swf\b/, 'list', [
		["flash", "//*[@id=\"container\"]|//*[@id='stage']"],
		['flashJT', '#container > canvas']]],
    [/xxxxxxxxxxxxxxxxx/]
];

