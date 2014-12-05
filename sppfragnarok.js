var xpathmypage = '//*[@id="header_left_button"]/a';
var xpathquest = '//*[@id="global_menu"]//a[i[@class="menu_sprite menu_quest_image"]]';
var xpathevent = '//*[@id="global_menu"]//a[i[@class="menu_sprite menu_event_image"]]';

function handleArenaTop() {
    var succ = false;
    var bp_gauge = getXPATH('//*[@id="header_bp_gauge"]'), bp;
    if (bp_gauge) {
        bp = bp_gauge.dataset.value;
    }
    //if (bp > 20) {
    succ = succ || clickA('//div[@id="bgbox_wrapper"]//a[contains(@href, "ArenaBattleTop")]');
    //}
    succ = succ || clickA("//div[@class='event_btn']/a");
    if (!succ && getXPATH('//*[@id="container"]')) {
        clickS('//*[@id="container"]');
    }
}
function handleMissionRes() {
    var title_ele = getXPATH('//p[@class="section_title"]'), title;
    if (title_ele) {
        title = title_ele.innerText;
    } else {
        title = "";
    }//
    if (title === "入手した秘宝") {
        clickA('//*[@id="containerBox"]/div[5]/a');
    } else if (title.match(/N$/)) {
        if (!clickA('//a[text()="' + decodeURIComponent("%E5%A3%B2%E5%8D%B4%E3%81%97%E9%80%B2%E3%82%80") + '"]')) { //売却し進む
            clickA('//a[text()="' + decodeURIComponent("%E3%81%95%E3%82%89%E3%81%AB%E9%80%B2%E3%82%80") + '"]');
        }
    } else if (title.match(/R$/)) {
        clickA('//a[text()="' + decodeURIComponent("%E3%81%95%E3%82%89%E3%81%AB%E9%80%B2%E3%82%80") + '"]');
    //} else if (title.match(/MP割り振り/)) {
    //    clickA('//div[text()="自動割り振り"]');
    } else if (title === "") {
        var succ = false;
        succ = succ || clickA('//a[text()="クエストをさらに進む"]');
        if (!succ && getXPATH('//*[@id="swfArea"]')) {
            clickA('//*[@id="containerBox"]/div[@class="margin_top txt_center"]/div/a');
        }
    } else {
        alert(title);
    }
}//'//*[@id="containerBox"]/div[4]/ul/li[1]/div[3]/div[2]/div/a'

function handleArenaUserList() {
    var min = 10000, i, minid = 0;
    for (i = 1; i <= 5; i++) {
        var t = getXPATH('//*[@id="rcv_submit_btns"]/ul/li[' + i + ']/table/tbody/tr/td[3]/div/span[2]');
        if (t && getXPATH('//*[@id="rcv_submit_btns"]/ul/li[' + i + ']/table/tbody/tr/td[3]/div/div/a') && parseInt(t.innerText, 10) < min) {
            min = parseInt(t.innerText, 10);
            //alert(min);
            minid = i;
        }
    }
    if (minid > 0) {
        setInterval(function () {clickA('//*[@id="rcv_submit_btns"]/ul/li[' + minid + ']/table/tbody/tr/td[3]/div/div/a'); }, 2000);
    }

    setTimeout(function () {clickA(xpathevent); }, 10000);
}

function handleStrongBossTop() {
    var succ = false, attack;
    succ = succ || clickA('//*[@id="requestChain"]/a');
    if (!succ) {
		var owner = $('#damage_box > div > div.no_flex > img').attr('src').match(new RegExp(USERID));
        var attacked = getXPATH('//*[@id="damage_box"]/ul/li/a/div/div[2]/div[text()="' + USERNAME +'"]');
        if (!owner && !attacked) {
            owner = getXPATH('//*[@id="popup_content"]/div[1]/div[2]/div//*[text()="' + USERNAME + '"]');
            attacked = getXPATH('//*[@id="popup_content"]/div[1]/div[2]/ul/li/a//span[text()="' + USERNAME +'"]');
        }
        //debugger;
        if (/*!owner &&*/ attacked && !url.match(/island%2FPunchingBossTop/)) {
            succ = succ || clickA('//a[text()="ボス一覧へ戻る"]');
            succ = succ || clickA(xpathmypage);
            return;
        }
		setInterval(function() {
			var attack = $('#rcv_submit_btns > ul > li > a.enabled');
			if (attack.length < 2) {
				$('#rcv_items > ul > li > a.enabled').last().clickJ();
			} else {
				attack.last().clickJ();
			}
		}, 1000);
    }
}

function handleMyPage() {
    var ap_gauge = getXPATH('//*[@id="header_ap_gauge"]');
    var ap = 0;
    var mission_error = getCookie('__my_rg_m_error');
    var succ = false;
    if (ap_gauge) {
        ap = ap_gauge.dataset.value;
    } else {
        if (getXPATH('//*[@id="container"]')) {
            clickFlash('//*[@id="container"]');
            return;
        }
    }
    var boss_clear = getCookie("__my_r_boss_clear");
    if (!boss_clear) {
        succ = succ || clickA('//*[@id="mypage_boss_icon"]/a');
    }
    succ = succ || clickA('//a[contains(text(),"戦友申請が")]');
    succ = succ || clickA('//a[text()="カード図鑑報酬が受け取れます"]');
    succ = succ || clickA('//a[text()="マテリアル図鑑報酬が受け取れます"]');
    succ = succ || clickA('//a[text()="トレジャーに出発できます"]');
    succ = succ || clickA('//a[text()="MPが割り振れます"]');
    succ = succ || clickA('//a[text()="無料ガチャが出来ます"]');
    succ = succ || clickA('//a[text()="トレジャーの結果が出ています"]');
    succ = succ || clickA('//a[text()="贈り物が届いてます"]');
    succ = succ || clickA('//a[text()="運営からのお詫び"]');
    succ = succ || clickA('//a[text()="新しいメッセージがございます"]');
    succ = succ || clickA(xpathevent);
    if (ap > 10 && !mission_error) {
        succ = succ || clickA(xpathquest);
    }
    //succ = succ || clickA(xpathevent);
    //succ = succ || setTimeout(function () {location.reload(true); },  60000);
}

function handleGachaFlashResult() {
    if (getXPATH('//div[@id="gamecanvas"]/canvas|//*[@id="container"]')) {
        clickFlash('//div[@id="gamecanvas"]/canvas|//*[@id="container"]');
    } else {
        var succ = false;
        succ = succ || clickA('(//a[contains(text(), "エールガチャ")])[last()]');
        //succ = succ || clickA('//a[text()="エールガチャ"]');
        succ = succ || clickA('//a[text()="ガチャTOPへ戻る"]');
        //succ = succ || clickA(xpathmypage);
    }
}

function handleMissionList() {
    var succ = false;
    succ = succ || clickForm('//*[@id="containerBox"]/div[4]/form');
    succ = succ || clickForm("//*[@id=\"containerBox\"]/div[@class='txt_center']/div/ul/li/div/form");
    succ = succ || clickA("xpathmypage");
}

function handlePrizeTop() {
    clickForm('//*[@id="containerBox"]/form[div/input[contains(@value,"一括で受け取る")]]');
}

function handleChoiceCoin() {
    //clickS('//div[@class="popup_btn symbol"]');
    //setTimeout(function () {
    //    var succ = false;
    //    succ = succ || clickA('(//div[@id="overrayArea" and not(@class="hide")]//div[contains(@class, "targetSymbolList") and @style="display: block;"]//a)[last()]');
    //},2000);
}

function handleArrangement() {
    clickS('//div[text()="自動割り振り"]');
    //clickS('//*[@id="reminderPointData"]/div/div[1]/div[2]/div[2]');
    setInterval(function () {
        if (getXPATH('//div[@id="overrayArea" and not(@class="hide")]')) {
            clickForm('//*[@id="containerBox"]/form');
        }
    }, 5000);
}

function handleBulkFusion() {
    var xp_select = getXPATHAll('//*[@id="containerBox"]/form//select');
    var select;
    while ((select = xp_select.iterateNext()) !== null) {
        select.selectedIndex = select.options.length - 1;
    }
    clickForm('//*[@id="containerBox"]/form');
}

function handleMissionError() {
    var succ = false;
    succ = clickA('(//*[@id="rcv_items"]/ul/li/a[@class="enabled"])[last()]');
    if (succ) {
        setTimeout(function () {
            clickForm('//*[@id="recovery_form"]');
        }, 2000);
    }
    setTimeout(function () {clickA(xpathmypage); }, 5000);
}

var actions = [
    [/apology%2FApologyList%2F/, 'form', '//*[@id="containerBox"]//form'],
    [/arena%2FArenaBattleResult%2F/, 'list', [
        ["a", '//a[contains(@href, "arena%2FArenaUserSelectList")]'],//text()="戦いを続ける"]'],
        ['flash', '//div[@id="gamecanvas"]/canvas']]], //*[@id="container"]']]],
    //[/arena%2FArenaBattleSwf%2F/, 'flash', ''],
    [/arena%2FArenaBattleTop%2F/,  'list', [
		['aJ', 'a[href*="Farena%2FDoMissionExecutionCheck%2F"]'],
        ['a', '//div[@class="battle_btn"]/a'],
        ['flash', '//div[@id="gamecanvas"]/canvas']]],
    [/arena%2FArenaBossBattle%2F/, 'func', handleStrongBossTop],
	[/arena%2FArenaBossBattleHelpRequestEnd%2F/, 'a', '//a[text()="イベントTOP"]'],
    [/arena%2FArenaBossBattleList\b/, 'list', [
        ['a', '//*[@id="containerBox"]/div[5]/ul/li[.//img[contains(@src, "new3.gif")]]/div[2]/div/a'],
        ['setCookie', '__my_r_boss_clear', 1, 60],
        ['a', '//a[contains(text(),"一括で受け取る")]'],
        ['a', '//a[contains(text(),"討伐完了")]']]],
    [/arena%2FArenaBossBattleResult%2F/, 'list', [
        ['a', '//a[text()="報酬を受け取る"]'],
        ['a', '//a[text()="イベントを進める"]']]],
    [/arena%2FArenaBossRewardAllGetEnd%2F/, 'list', [
        ['a', '//a[text()="ボス一覧へ戻る"]'],
        ['a', '//a[text()="イベントを進める"]']]],
    [/arena%2FArenaBossRewardEnd%2F/, 'list', [
        ['a', '//a[text()="ボス一覧へ戻る"]'],
        ['a', '//a[text()="イベントを進める"]']]],
    [/arena%2FArenaError%2F/, 'a', '//a[text()="イベントTOP"]'],
    [/arena%2FArenaUserSelectList/, 'list', [  // 'func', handleArenaUserList],
        //['dbg'],
        ['aJV', 'a[href*="arena%2FDoArenaUseAdvantageItem%2F"]'],
        //['minmax', '//*[@id="rcv_submit_btns"]/ul/li[', ']/table/tbody/tr/td[3]/div/span[2]', ']/table/tbody/tr/td[3]/div/div/a'],
        //['aJP', '#rcv_items a'],
        ['func', function () {
            setInterval(function () {
                if ($('#current_worker').text() < 20) {
                    clickLink($('#rcv_items a').filter(":first")[0]);
                }
            }, 1000);
            setInterval(function () {
                clickMinMax('//*[@id="rcv_submit_btns"]/ul/li[', ']/table/tbody/tr/td[3]/div/span[2]', ']/table/tbody/tr/td[3]/div/div/a');
            }, 1000);
            return false;
        }],
        //['minmax', '//*[@id="rcv_submit_btns"]/ul/li[', ']/table/tbody/tr/td[3]/div/span[2]', ']/table/tbody/tr/td[3]/div/div/a'],
        ['hold']]],
    [/arena%2FBossAppear%2F/, 'a',  "//a[text()='ボスと戦う']"],
    [/arena%2FBossBattleResult%2F/, 'list', [
        ['a', '//a[contains(@href, "arena%2FDoMissionExecutionCheck%2F")]'],
        ['flash', '//*[@id="gamecanvas"]/canvas']]],//"//a[text()='次のエリアに進む']"]]],
    [/arena%2FBossBattleFlash%2F/, 'flash', '//*[@id="gamecanvas"]/canvas', 79, 346],
	[/arena%2FContinuousParticipation%2F/, 'aJ', 'a[href*="arena%2FTop"]'],
    [/arena%2FChoiceCoinSetResult%2F/, 'func', handleChoiceCoin],
	[/arena%2FDoMissionExecution%2F/, 'aJ', 'a[href*="mypage%2FIndex"]'],
	[/arena%2FMissionDetail%2F/, 'list', [
		['aJV', '#raidBossBtn > a'],
		['flashJT', '#execBtn']
	]],
    [/arena%2FMissionError%2F/, 'func', handleMissionError],
    [/arena%2FMissionResult%2F%/, 'list', [
        //['aJ', '#arenaOpenButton a'],
        ['aJ', 'a[href*="arena%2FDoMissionExecutionCheck"]']]],
        //'func', handleArenaMissionRes],
    [/arena%2FTop/, 'func', handleArenaTop],
    [/arrangement%2FArrangementEdit%2F/, 'func', handleArrangement],
	[/beatdown%2FBigRaidTop%2F/, 'aJ', 'a[href*="beatdown%2FDoMissionExecutionCheck%2F"]'], 
    [/beatdown%2FBossAppear%2F/, 'a', '//a[text()="ボスと戦う"]'],
    [/beatdown%2FBossBattle%2F/, 'list', [
        ['a', '//a[text()="BP消費なしで攻撃"]'],
        ['func', handleStrongBossTop]]],
    [/beatdown%2FBossBattleHelpRequestEnd%2F/, 'a', '//a[text()="イベントTOP"]'],
    [/beatdown%2FBossBattleList/, 'list', [
        ['a', '//a[text()="報酬を一括で受け取る"]'],
        ['a', '//li[.//img[contains(@src, "new3.gif")]]//a[text()="バトル"]'],
        ['setCookie', '__my_r_boss_clear', 1, 60],
        //['hold'],
    ]],
    [/beatdown%2FBossBattleFlash%2F/, 'flash', '//div[@id="gamecanvas"]/canvas', 79, 346],
    [/beatdown%2FBossBattleResult%2F/, 'a', '//a[text()="イベントを進める"]'],
    [/beatdown%2FBossRewardAllGetEnd%2F/, 'a', '//a[text()="ボス一覧へ戻る"]'],
    [/beatdown%2FMissionBossBattleResult%2F/, 'a', '//a[text()="イベントを進める"]'],
    [/beatdown%2FMissionError%2F/, 'func', handleMissionError],
    [/beatdown%2FMissionResult%2F/, 'list', [
        ['a', '//*[@id="containerBox"]/div[div[@class="section_title"]]/div[2]/a'],
        ['hold']]],
    [/beatdown%2FTop%2F/, 'list', [
        ['a', '//a[text()="イベントを進める"]'],
		['aJ', 'a[href*="beatdown%2FBigRaidTop%2F"]'],
		['aJ', 'a[href*="beatdown%2FDoMissionExecutionCheck%2F"]'],
        ['flash', '//div[@id="gamecanvas"]/canvas'],
        ['hold']]],
    [/card%2FMaterialCardList%2F%3FbulkFusion%3D1/, 'func', handleBulkFusion],
    [/companion%2FCompanionApplicationAccept%2F/, 'form', '//form[.//input[@value="承認する"]]'],
    [/companion%2FCompanionApprovalList%2F/, 'a', '//a[text()="承認する"]'],
    [/deck%2FDeckEditTop%2F/, 'a', xpathmypage],
    [/fusion%2FFusionSwfStart%2F/, 'flash', '//*[@id="canvas"]'],
    [/fusion%2FBulkMaterialCardFusionConfirm%2F/, 'form', '//*[@id="containerBox"]/form'],
    [/gacha%2FSetFreeGachaFlashResult%2F/, 'list', [
        ['flash', '//div[@id="gamecanvas"]/canvas|//*[@id="container"]', 100, 366],
        ['func', handleGachaFlashResult]]],
    [/gacha%2FSetGachaResult%2F/, 'list', [
        ['a', '(//a[contains(text(), "エールガチャ")])[last()]'],
        ['a', '(//a[contains(text(), "ガチャをする")])[last()]'], //'func', handleGachaFlashResult],
        ['a', '//a[text()="贈り物BOXから受け取る"]'],
        ['hold']]],
    [/gacha%2FGachaFlashResult%2F/, 'list', [
        //['flash', '//div[@id="gamecanvas"]/canvas'],
        ['func', handleGachaFlashResult]]],
    [/gacha%2FGachaTop%2F%3FpageNum%3D2/, 'a', '(//a[contains(text(), "ガチャ")])[last()]'],
    [/gacha%2FGachaTop%2F%3FpageNum%3D3/, 'a', '(//a[contains(text(), "ガチャ")])[last()]'],
    [/gacha%2FGachaTop%2F%3FpageNum%3D4%26thema%3Dregend/, 'aJ', 'a[href$="gacha%2FGachaTop%2F%3FpageNum%3D4"]'],
	[/gacha%2FGachaTop%2F%3FpageNum%3D4$/, 'list', [
		['a', '(//a[.//span[text()="ガチャをする"]])[last()]'],
        ['aJ', 'a[href*="gacha%2FGachaTop%2F%3FpageNum%3D3"]']]],
    [/gacha%2FGachaTop%2F/, 'list', [
        ['a', '//*[@id="info"]/div[3]/a'],
		['aJ', 'a[href$="gacha%2FGachaTop%2F%3FpageNum%3D4"]'],
        ['hold']]],
    [/guildbattle%2FGuildbattleMenu%2F/, 'list', [
        ['flash', '//*[@id="gamecanvas"]/canvas'],
        ['hold']]],
    [/island%2FBossAppear%2F/, 'a', '//a[text()="ボスと戦う"]'],
    [/island%2FBeatdownBossBattle%2F/, 'func', handleStrongBossTop],
    [/island%2FBeatdownBossBattleList/, 'list', [
		['hold'],
        ['a', '//ul[@class="lst_info"]/li[.//div[@class="relative"]/div]//a[text()="バトル"]'],
		['aJ', 'a[href*="island%2FBeatdownBossBattle%2F"'],
        ['setCookie', '__my_r_boss_clear', 1, 60],
        ['a', '//a[contains(text(),"一括受け取り")]'],
        ['a', '//a[contains(text(),"討伐完了")]']]],
    [/island%2FBeatdownBossBattleResult%2F/, 'list', [
        ['a', '//a[text()="報酬を受け取る"]'],
        ['a', '//a[text()="イベントを進める"]']]],
    [/island%2FBeatdownBossBattleHelpRequestEnd%2F/, 'aJ', 'a:contains("ボス一覧へ戻る")'],
    [/island%2FBeatdownBossRewardAllGetEnd%2F/, 'a', '//a[text()="イベントを進める"]'],
    [/island%2FBeatdownBossRewardEnd%2F/, 'a', '//a[text()="イベントを進める"]'],
	[/island%2FBeatdownError%2F/, 'aJ', 'a[href*="island%2FTop"]'],
	[/island%2FBeatdownPunchingBossBattleResult%2F/, 'aJ', 'a:contains("イベントを進める")'],
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
        ['a', '//*[@id="containerBox"]/div[5]/a'],
        ['flash', '//div[@id="gamecanvas"]/canvas']]],
    [/island%2FIslandSlotResult/, 'a', '(//a[contains(@href, "DoIslandSlot")])[last()]'],
    [/island%2FIslandSlotTop%2F/, 'list', [
        ['a', '(//a[contains(@href, "DoIslandSlot")])[last()]']]],
    [/island%2FMissionError%2F/, 'func', handleMissionError], //'list', [
        //['setCookie', '__my_rg_m_error', 1, 600],
        //['a', xpathmypage]]],
    [/island%2FMissionResult%2F/, 'list', [
        ['a', '//a[div[@id="MissionAreaMap"]]'],
        ['a', '//a[div[@id="area_map_image_in"]]'],
        ['a', '//a[contains(@href, "island%2FDoMissionExecutionCheck")]'], //text()="七夕ツアーズに行く"]'],
        ['flash', '//div[@id="gamecanvas"]/canvas']]],
    [/island%2FIslandMissionStoryResult%2F/, 'a', '//a[text()="イベントを進める"]'],
	[/island%2FMissionDetail/, 'list', [
		['func', function(){
			setInterval(function(){
				GM_log('island MissionDetail');
				GM_log('' + $('#excBtnOff').filter(':visible').length);
				GM_log('' + $('#execBtn').filter(':visible').length);
				/*if ($('#raidBossBtn > a').filter(':visible').length > 0) {
					$('#raidBossBtn > a').clickJ();
				} else*/ if ($('#excBtnOff').filter(':visible').length === 0) {
					excBtn = $('#execBtn');
					if (excBtn.length == 0)
					{
						excBtn = $('#execClear');
					}
					setTimeout(function () {excBtn.simTouchEvent("touchstart");}, 10);
					setTimeout(function () {excBtn.simTouchEvent("touchend");}, 20);
					setTimeout(function () {excBtn.simMouseEvent("mousedown");}, 30);
					setTimeout(function () {excBtn.simMouseEvent("mousemove");}, 40);
					setTimeout(function () {excBtn.simMouseEvent("mouseup");}, 50);
					setTimeout(function () {excBtn.simMouseEvent("click");}, 60);
				} else if ($('#recoveryContainer > div > div.box_extend.js_recovery_btn > div:nth-child(1) > img').filter(':visible').length > 0) {
					var addAp = $('#recoveryContainer > div > div.box_extend.js_recovery_btn > div:nth-child(1) > img').filter(':visible').filter(':first');
					setTimeout(function () {addAp.simTouchEvent("touchstart");}, 10);
					setTimeout(function () {addAp.simTouchEvent("touchend");}, 20);
					setTimeout(function () {addAp.simMouseEvent("mousedown");}, 30);
					setTimeout(function () {addAp.simMouseEvent("mousemove");}, 40);
					setTimeout(function () {addAp.simMouseEvent("mouseup");}, 50);
					setTimeout(function () {addAp.simMouseEvent("click");}, 60);
				}
			}, 3000);
		}]]],
	[/island%2FPunchingBossTop/, 'func', handleStrongBossTop],
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
    [/mission%2FMissionError%2F/,  'a', '//*[@id="global_menu"]/ul/li[2]/ul/li[2]/a'],
    [/mission%2FMissionList%2F/, 'func', handleMissionList],
    [/mission%2FMissionResult%2F/, 'func', handleMissionRes],
    [/mypage%2FCollectionComp%2F/, 'form', '//form[.//input[@value="報酬を受け取る"]]'],
    [/mypage%2FCollectionCompEnd%2F/, 'a', '//a[text()="図鑑報酬へ"]'],
    [/mypage%2FGreetList%2F/, 'a', xpathmypage],
    [/mypage%2FIndex/, "func", handleMyPage],
	[/newMission%2FAreaList%2F/, 'aJ', $('a[href*="newMission%2FMissionList%2F"]').last()],
	[/newMission%2FBossAppear/, 'aJ', 'a[href*="newMission%2FBossBattleFlash%2F"]'],
	[/newMission%2FMissionDetail%2F/, 'flashJ', '#execBtn'],
	[/newMission%2FMissionList%2F/, 'aJ', 'a[href*="newMission%2FMissionDetail%2F"]'],
    [/mypage%2FMaterialCollection%2F/, 'a', '//a[text()="図鑑報酬を受け取る"]'],
    [/mypage%2FMaterialCollectionCompEnd%2F/, 'a', '//a[text()="コンプマテリアル図鑑"]'],
    [/prizeReceive%2FPrizeReceiveAllEnd%2F/, 'a', '//a[text()="贈り物BOX TOP"]'], //xpathmypage],
    [/prizeReceive%2FPrizeReceiveTop%2F/, 'form', '//*[@id="containerBox"]/form[div/input[contains(@value,"一括で受け取る")]]'], //'func',handlePrizeTop],
    [/strongBoss%2FStrongBossBattleResult%2F/, 'a', '//a[text()="クエストを進める"]'],
    [/strongBoss%2FStrongBossHelpResult%2F/, 'a', xpathquest],
    [/strongBoss%2FStrongBossTop%2F/, 'func', handleStrongBossTop],
    [/strongBoss%2FStrongBossNoWinList%2F/, 'list', [
        ['setCookie', '__my_r_boss_clear', 1, 60],
        ['a', xpathmypage]]],
    [/treasure%2FCardList%2F/, 'a', '//a[text()="メンバーに追加"]'],
    [/treasure%2FTreasureConf%2F/, 'a', '//a[text()="出発させる"]'],
    [/treasure%2FTreasureEnd%2F/, 'a', '//a[text()="スカウトする" or text()="マップ選択に戻る"]'],
    [/Ftreasure%2FFriendTreasureBoxList%/, 'aJ', 'a[href*="treasure%2FDoOpenTreasureBox"]'],
    [/treasure%2FTreasureMapList%2F/, 'list', [
        //['aJ', 'a[href*="treasure%2FFriendTreasureBoxList%2F"]'],
        ['a', '//*[@id="area_progress_status"]/div[4]/a'],
        ['a', '//*[@id="area_progress_status"]/div[' + Math.floor(Math.random() * 3 + 1) + ']/a'],
    ]],
    [/treasure%2FTreasureStatus%2F/, 'a', '//a[text()="探索結果確認"]'],
    [/treasure%2FTreasureTop%2F/, 'a', '//a[text()="探索先を選ぶ"]'],
    [/Swf\b/, 'flash',  '//*[@id="btn_exec"]|//canvas|//*[@id="container"]|//*[@id="canvas"]'],
    [/Flash\b/, 'flash',  "//div[@id='gamecanvas']/canvas|//*[@id='btn_exec']|//*[@id='container']"],
    [/xxxxxxxxxxxxxxxxx/]
];
//alert("oops");
