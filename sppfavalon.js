
var xpathmypage = "//*[@id=\"main_header_menu\"]/ul/li[1]/a";
var xpathquest = "//*[@id=\"main_header_menu\"]/ul/li[2]/a";

//http://sp.pf.mbga.jp/12010455?url=http%3A%2F%2Fmguildbattle.croozsocial.jp%2Fmission%2FMissionResult%2F%3FareaId%3D34%26exeCount%3D4%26historyGroupId%3D14333829%26rewardId%3D%26isFirstStaminaLess%3D%26isFirstDailyQuest%3D%26isFirstLevelUp%3D%26isFirstFriendUp%3D%26isFirstTreasureCard%3D%26isFirstTreasureEP%3D%26isFirstTreasureMoney%3D%26isGateOpenFlg%3D%26newRecordFlg%3D
//http://sp.pf.mbga.jp/12010455?url=http%3A%2F%2Fmguildbattle.croozsocial.jp%2Fsubjugation%2FSubjugationSelectAttackType%2F%3Funix%3D1373684628
//http://sp.pf.mbga.jp/12010455?url=http%3A%2F%2Fmguildbattle.croozsocial.jp%2Fgacha%2FGachaTop%2F
//http://sp.pf.mbga.jp/12010455?url=http%3A%2F%2Fmguildbattle.croozsocial.jp%2Fguildbattle%2FGuildbattleResult%2F%3FhistoryId%3D259250156%26addSummonGage%3D%26addGuildbattlePoint%3D%26getExp%3D%26totalDamage%3D5%26comboCnt%3D1%26targetCnt%3D1%26formerUserId%3D0%26evolutionString%3D%26skillId%3D18%26beforeLevel%3D%26afterLevel%3D0%26beforeExp%3D%26afterExp%3D%26collabolateUserId%3D0
//http://sp.pf.mbga.jp/12010455?url=http%3A%2F%2Fmguildbattle.croozsocial.jp%2FtowerRaid%2FTowerRaidRaidbossTop%2F%3FhistoryId%3D1523346
function handleMissionResult() {
    //debugger;
    //*[@id="contents"]/div[2]/div[1]
    //*[@id="contents"]/div[2]/div[1]
    var sub = getXPATH("//*[@id=\"contents\"]/div/div[@class='subtitle']");
    //alert(sub.innerText);
	var succ = false;
	succ = succ || clickA('//*[@id="#towerraid_announce"]/div/div[2]/a');
    //var canvas = getXPATH("//*[@id=\"resultMovie\"]/canvas");
    succ = succ || clickA("//*[@id=\"contents\"]/div[@class='btn_main_large margin_top_10']/a");//*[@id="contents"]/div[5]/a //*[@id="contents"]/div[5]/a
    succ = succ || clickA('//a[text()="レイドボス出現中"]');
    succ = succ || clickA('//a[text()="さらにクエストする"]');
    succ = succ || clickA('//a[text()="次のエリアへ"]');
    succ = succ || clickA(xpathmypage);
}
///raidboss%2FRaidbossTop%2F/
//function handleRaidBoss() {
//    var succ = false;
//    succ = succ || clickForm("//*[@id=\"contents\"]/form");
//    alert("oo");
//    succ = succ || clickA('//a[text()="レイドボス応援一覧に戻る"]');
//    succ = succ || clickA("//*[@id=\"raid_help\"]/a");
//    succ = succ || clickA("//*[@id=\"attack_btn\"]/div/a");
//    succ = succ || clickA('//*[@id="bp_recovery_popup"]//a[text()="使用する"]');
//    succ = succ || clickA(xpathmypage);
//}

function handleStoryMission() {
    var ap_status = getXPATH('//div[div[contains(text(),"のステータス")]]/div[2]/table/tbody/tr[2]/td[1]'), ap_c = 0, ap_full = 1, res;
    if (ap_status) {
        res = ap_status.innerText.match(/([0-9]+)\/([0-9]+)/);
        if (res) {
            ap_c = parseInt(res[1], 10);
            ap_full = parseInt(res[2], 10);
        }
    }
    if (ap_c > ap_full * 0.5) {
        clickA(xpathquest);
        return;
    }
    if (!clickA("//*[@id=\"contents\"]/div[2]/a")) {
        var text = getXPATH("//*[@id=\"progress_area\"]/div");
        if (text && text.innerText.match(/レベル[\S]*上がった/)) {
            clickA(xpathquest);
        }
    }
}

function handleEllGacha() {
    clickA("//div[@class='btn_base block_flex']/a");
}
//gacha%2FGachaResult%2F%3FthemeId%3D1/
function handleEllGachaRes() {
    //*[@id="contents"]/div[1]/ul/li[1]/div[2]/div/a
    clickA("(//div[@class='btn_base block_flex']/a)[last()]");
}

function handleGiftBox() {
    var succ = false;
    succ = succ || clickForm("//*[@id=\"contents\"]/form");
    succ = succ || clickA('//*[@id="contents"]/ul[@class="btn_tabs margin_top_10"]/li/a[not(contains(text(), "(0)"))]');
    if (getXPATH('//div[@class="txt_block_center" and text()="所持武具が上限数に達しています"]')) {
        setCookie("__ava_no_gift", 1, 3600);
    }
    succ = succ || clickA(xpathmypage);
}

function handleRaidGacha() {
    var succ = false;
    succ = succ || clickA('(//div[@class="btn_base block_flex"]/a[img])[last()]');
    //succ = succ || clickA("(//*/div[@id='wrap' or @id='contents']/div[@class='section_sub section_margin'])[2]/div[2]/div[2]/div[2]/div[1]/a");
    //succ = succ || clickA("(//*/div[@id='wrap' or @id='contents']/div[@class='section_sub section_margin'])[2]/div[2]/div[2]/div[1]/div[1]/a");
    //*[@id="contents"]/div[5]/ul/li[1]/div[4]/div/a
    //succ = succ || clickA("(//*/div[@id='wrap' or @id='contents']/div[@class='section_sub section_margin'])[1]/ul/li[1]/div[4]/div/a");
    //succ = succ || clickA("(//*/div[@id='wrap' or @id='contents']/div[@class='section_sub section_margin'])[1]/ul/li[1]/div[2]/div/a");
}
//http://sp.pf.mbga.jp/12010455?url=http%3A%2F%2Fmguildbattle.croozsocial.jp%2Fmypage%2FIndex%2F#
function handleMypage() {
    var new_raid = getXPATH("//*[@id=\"boss_appear_btn\"]/span");
    var ap = getXPATH("//*[@id=\"gauge_ap\"]/div[1]").dataset.value;
    var bp = getXPATH("//*[@id=\"gauge_bp\"]/div[1]").dataset.value;
    var guild_battle = getXPATH('//a[span[@id="battle_name"]]');
    var succ = false;
    succ = succ || clickA('//a[span[@id="battle_name"]]');
    succ = succ || clickA("//*[@id=\"boss_appear_btn\" and span]/div/a");
    if (ap > 10) {
        succ = succ || clickA('//a[@href="http://sp.pf.mbga.jp/12010455?url=http%3A%2F%2Fmguildbattle.croozsocial.jp%2Fisland%2FIslandTop%2F"]');
        //succ = succ || clickA('//a[contains(@href, "TowerRaidTop")]');
        //succ = succ || clickA("//*[@id=\"quest_btn\"]/a");
    }
    if (bp > 20) {
        succ = succ || clickA('//*[@id="battle_btn"]/a');
    }
    succ = succ || clickA("//a[text()='無料ガチャが回せます']");
    succ = succ || clickA("//a[text()='振り分けポイントがあります']");
    //succ = succ || clickA("//a[text()='バトル結果がでています']");
    succ = succ || clickA("//a[text()='ストーリーモードを進められます']");
    succ = succ || clickA("//a[text()='戦友上限が増えました']");
    succ = succ || clickA("//a[text()='戦友候補が見つかりました']");
    succ = succ || clickA("//a[text()='完全討伐報酬が受け取れます']");
    succ = succ || clickA("//a[text()='ビンゴチケットが届いています']");
    succ = succ || clickA("//a[contains(text(), 'を討伐してくれました')]");
    if (!getCookie("__ava_no_gift")) {
        succ = succ || clickA("//a[text()='贈り物が届いています']");
    }
    succ = succ || setTimeout(function () {location.reload(true); }, 60000);
}
function handleRaidAssist() {
    //*[@id="contents"]/div[1]/div[2]/ul/li/div[1]/span/span
    if (!clickA("//div[@class='section_main']/ul/li[div[1]/span/span[@class=\"icon_new\"]]/div[3]/div/div/div[2]/div/a")) {
        clickA(xpathmypage);
    }
}

function handleRaidbossBattleResult() {
    var succ = false;
    if (document.referrer.match(/raidboss%2FRaidbossBattleResultList%2F/)) {
        window.location.href = document.referrer;
        return;
    }
    //alert("oo");
    succ = succ || clickA("//div[@class='btn_main_large']/a");
    succ = succ || clickA("//a[text()='応援一覧へ戻る']");
    succ = succ || clickA(xpathmypage);
}

function handleBattleTowerTop() {
    if (getXPATH('//div[contains(@class, "last_free_cnt")]') || getXPATH('//div[@id="gauge_bp"]').dataset.value > 0) {
        clickA('//*[@id="entaku_main"]/div[2]/div[3]/div[1]/a');
    } else {
        clickA(xpathmypage);
    }
}

function handleBattleTowerEnemyList() {
    var min = 10000, i, minid = 0;
    //if (getXPATH('//div[@class="fnt_emphasis blink" and text()="BPが不足しています"]')) {
    //    clickA(xpathevent);
    //    return;
    //}
    for (i = 1; i <= 5; i++) {
        var t = getXPATH('//*[@id="contents"]/div[2]/div[3]/ul/li[' + i + ']/div[1]/div[2]/table/tbody/tr/td');
        if (t && parseInt(t.innerText, 10) < min) {
            min = parseInt(t.innerText, 10);
            minid = i;
        }
    }
    if (minid > 0) {
        clickA('//*[@id="contents"]/div[2]/div[3]/ul/li[' + minid + ']/div[2]/div[2]/a');
    }
}

function handleBattleTowerResult() {
    clickA('//a[contains(text(),"対戦相手選択")]');
}

function handleArrangement() {
    clickForm('//*[@id="contents"]/div/div[2]/ul/li[3]/form');
}

function handleMissionError() {
    var succ = false;
    if (succ && document.referrer.match(/island%2F/)) {
        succ = clickA('//a[text()="使用する"]');
    }
    succ = succ || clickA(xpathmypage);
}

//http://sp.pf.mbga.jp/12010455?url=http%3A%2F%2Fmguildbattle.croozsocial.jp%2Fmypage%2FLoginBonusResult%2F%3FhistoryId%3D27931745%26loginBonusCategoryId%3D27%26registCampaignSr%3D0%26registCampaignSrMax%3D0%26jobPegasus%3D0%26jobDancer%3D0
var actions = [
    [/arrangement%2FArrangementEdit%2F/, 'form', '//*[@id="contents"]/div/div[2]/ul/li[3]/form'],
    [/arrangement%2FArrangementEnd%2F/, 'a', xpathmypage],
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
    [/battleTower%2FBattleTowerTop%2F/, 'func', handleBattleTowerTop],
    [/battleTower%2FBattleTowerEnemyList/, 'minmax', '//div[div[text()="対戦相手選択"]]/ul/li[', ']//table/tbody/tr[1]/td', ']//a[text()="バトルする"]'],
    [/battleTower%2FBattleTowerResult%2F/, 'a', '//a[contains(text(),"対戦相手選択")]'],
    [/campaign%2FcmStory%2FCmStoryTop%2F/, 'a', '//a[text()="最新ストーリーを進める"]'],
    [/companion%2FCompanionApplicationEnd%2F/, 'a', '//a[text()="さらに探す"]'],
    [/companion%2FCompanionMultiApplication%2F/, 'form',  '//*[@id="contents"]/div[1]/form'],
    [/companion%2FSearchCompanion%2F/, 'form', '//*[@id="contents"]/form'],
    [/evolution%2FEvolutionConfirm%2F/, 'form', '//*[@id="contents"]/form'],
    [/evolution%2FEvolutionEnd%2F/, 'a', '//a[text()="限界突破TOPへ"]'],
    [/fusion%2FFusionSwfStart%2F/, 'flash', '//*[@id="container"]'],
    [/gacha%2FGachaTop%2F$/, 'list', [
        ["sth", "//form[@name='gacha']//input[@class='btn_base']"],
        ['sth', '//form//input[@value="ガチャをする" and @onclick="submit()"]']]],
    [/gacha%2FGachaTop(%2F)?%3FthemeId%3D1\b/, "func", handleEllGacha],
    //[/gacha%2FGachaTop%2F%3FthemeId%3D2/,
    [/gacha%2FGachaTop(%2F)?%3FthemeId%3D7\b/, "a", "(//div[contains(@class, 'btn_base block_flex')]//a)[last()]"],
    [/gacha%2FGachaTop%2F%3FthemeId%3D154/, 'sth', '//form//input[@value="ガチャをする" and @onclick="submit()"]'],
    [/gacha%2FGachaResult%2F%3FthemeId%3D1\b/, "a", "(//div[@class='btn_base block_flex']/a)[last()]"],
    [/gacha%2FGachaResult%2F%3FthemeId%3D2/, "formN", '//form[@name="gacha"]'],
    [/gacha%2FGachaResult%2F%3FthemeId%3D3/, 'formN', '//form[@name="gacha"]'],
    [/gacha%2FGachaResult%2F%3FthemeId%3D4/, 'formN', '//form[@name="gacha"]'],
    [/gacha%2FGachaResult%2F%3FthemeId%3D7/, "a", '(//div[@class="btn_base block_flex"]/a[img])[last()]'],
    [/gacha%2FGachaResult%2F%3FthemeId%3D8/, "a", '(//div[@class="btn_base block_flex"]/a[img])[last()]'],
    [/gacha%2FGachaResult%2F%3FthemeId%3D15[567]/, 'sth', '//form//input[@value="ガチャをする" and @onclick="submit()"]'],
    [/giftBingo%2FGiftBingoDetail%2F/, 'a', '//a[text()="カムバックビンゴTOPへ"]'],
    [/giftBingo%2FGiftBingoTop%2F/, 'a', '(//a[contains(text(), "引く")])[last()]'],
    [/giftBingo%2FGiftBingoHitResult%2F/, 'a', '(//a[contains(text(), "引く")])[last()]'],
    [/guildbattle%2FGuildbattleSelectAttackType%2F/, 'list', [
        ['a', '//*[@id="btn_start"]/a'],
        ['a', '//*[@id="btn_force"]/a'],
        //['a', '//*[@id="btn_command"]/a'],
        ['a', '//*[@id="use_bp_gp_recovery"]/a'],
        ['hold']]],
    [/guildbattle%2FGuildbattleResult%2F/, 'list', [
        ['a', '//*[@id="btn_force"]/a'],
        //['a', '//*[@id="btn_command"]/a'],
        ['a', '//div[@id="command_list"]//div[@class="btn_sub_medium"]/a'],
        ['a', '//*[@id="use_bp_gp_recovery"]/a'],
        ['reload', 1000 * 60],
        ['hold']]],
    [/guildbattle%2FGuildbattleSelectTarget%2F/, 'list', [
        ['minmax', '//*[@id="contents"]/div[@class="section_sub"]/ul/li[', ']/div[1]/div[2]/div/table/tbody/tr[4]/td', ']//a[text()="攻撃する"]'],
        ['reload', 60 * 1000]]],
    [/guildbattle%2FGuildbattleTeamAnalytics%2F/, 'a', xpathmypage],
    [/hugeRaidboss%2FHugeRaidbossEventTop%2F/, 'a', '//a[text()="巨龍と戦う"]'],
    [/info%2FInformation%2F%3Ffile%3DInfoHolyWar/, 'a', '//a[text()="探索へ"]'],
    [/island%2FIslandBossBattleFlash%2F/, 'flash', "//*[@id=\"container\"]", 161, 293],
    [/island%2FIslandBossBattleResult%2F/, 'list', [
        ['a', '//a[img[contains(@src, "casino_on.png")]]'],
        ['a', '//a[img[@alt="エクストラステージを探索"]]'],
        ['a', '//a[img[@alt="イベントクエストを探索"]]']]],
    [/island%2FIslandBossAppear%2F/, 'a',  '//a[text()="ボスと戦う"]'],
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
    [/island%2FIslandRaidbossAssistList%2F/, 'a', '//ul/li[div[1]/span/span[@class="icon_new"]]//a[text()="助けに行く"]'],
    [/island%2FIslandRaidbossBattleResult%2F/, 'list', [
        ['a', '//a[img[@alt="エクストラステージを探索"]]'],
        ['a', '//a[img[@alt="イベントクエストを探索"]]']]],
    [/island%2FIslandRaidbossHelpResult%2F/, 'a', '//*[@id="contents"]/div/a[img]'],
    [/island%2FIslandRaidbossTop%2F/, 'list', [
        ['form', '//*[@id="contents"]/form'],
        ['a', '//*[@id="raid_help"]/a'],
        ['a', '//a[text()="イベントレイドボス応援一覧に戻る"]'],
        ['a', '//*[@id="attack_btn"]/div/a']]],
    [/island%2FIslandTop%2F/, 'list', [
        ['funcR', function () {
            var hasmedal = false;
            $('li.medal>div>div:nth-child(2)').each(
                function (index, ele) {
                    if (!$(this).text().match(/\b0枚/)) {
                        hasmedal = true;
                        return false;
                    }
                }
            );
            return hasmedal && clickA('//a[img[contains(@src, "casino_on.png")]]');
        }],
        //['a', '//a[img[contains(@src, "casino_on.png")]]'],
        ['a', '//a[img[@alt="エクストラステージを探索"]]'],
        ['a', '//a[img[@alt="イベントクエストを探索"]]']]],
    [/island%2FMissionResult%2F/, 'list', [
        ['a', '//a[img[@alt="エクストラステージを探索"]]'],
        ['a', '//a[img[@alt="イベントクエストを探索"]]'],
        ['a', '//a[text()="使用する"]']]],
    [/mypage%2FIndex%2F/, "func", handleMypage],
    [/mypage%2FLoginBonusResult%2F/, 'a', '//a[text()="贈り物BOXへ"]'],
    [/mypage%2FLoginBonusSpecial%2F/, 'a', '//a[text()="今日のログボを受け取る"]'],
    [/mission%2FRegionList%2F/, "a", "//div[@class='section_main']/div[2]/div[2]/div/a"],//*[@id="contents"]/div[3]/div[2]/div[2]/div/a
    [/mission%2FMissionActionLot%2F/, "flash", "//*[@id=\"container\"]"],
    [/mission%2FBossAppear%2F/, "a", "//*[@id=\"contents\"]/div[2]/a"],
    [/mission%2FBossBattleFlash%2F/, "flash", "//*[@id=\"container\"]", 161, 293],
    [/mission%2FMissionResult%2F/, "func", handleMissionResult],
    [/mission%2FBossBattleResult%2F/, "a", "//*[@id=\"contents\"]/div[4]/a"],
    [/mission%2FMissionError%2F/, 'func', handleMissionError], //"a",  "//*[@id=\"global_menu\"]/ul/li[1]/div[5]/a"],
    [/mission%2FMissionListSwf%2F/, "link", "http://sp.pf.mbga.jp/12010455?url=http%3A%2F%2Fmguildbattle.croozsocial.jp%2Fmypage%2FIndex%2F"],
    [/multiguildbattle%2FMultiGuildbattleResult%2F/, 'a', '//*[@id="btn_magic"]/a'],
    [/multiguildbattle%2FMultiGuildbattleSelectAttackType%2F/, 'list', [
        ['a', '//*[@id="btn_start"]/a'],
        ['a', '//*[@id="btn_magic"]/a']]
        ],
    [/multiguildbattle%2FMultiGuildbattleSelectTarget%2F/, 'a', '//div[div[text()="ターゲット選択"]]/ul/li[1]//a'],
    [/multiguildbattle%2FMultiGuildbattleTop%2F/, 'a', xpathmypage],
    [/prizeReceive%2FPrizeReceiveTop%2F/, "func", handleGiftBox],
    [/raidboss%2FRaidbossCollectionDetail%2F/, "a", '//a[text()="受け取る"]'],
    [/raidboss%2FRaidbossTop%2F/, 'list', [
        //['dbg'],
        ['form', '//*[@id="contents"]/form'],
        ['a', '//a[contains(@href, "raidboss%2FRaidbossAssistList")]'], //text()="レイドボス応援一覧に戻る"]'],
        ['a', "//*[@id=\"raid_help\"]/a"],
        ['a', "//*[@id=\"attack_btn\"]/div/a"],
        ['a', '//*[@id="bp_recovery_popup"]//a[text()="使用する"]'],
        ['hold']]],
    [/raidboss%2FRaidbossHelpResult%2F/, "a", "//*[@id=\"contents\"]/div[2]/a"],
    [/raidboss%2FRaidbossAssistList%2F/, "func", handleRaidAssist],
    [/raidboss%2FRaidbossBattleResult%2F/, "func", handleRaidbossBattleResult],
    [/raidboss%2FRaidbossBattleResultList%2F/, 'a', '//*[@id="contents"]/div[1]/ul/li/a'],
    [/shop%2FItemUseEnd%/, 'a', '//a[contains(@href, "island%2FMissionActionLot")]'],
    [/story%2FDoStoryEpisodeSwf2%2F/, "flash", "//*[@id=\"container\"]"],
    [/story%2FDoStoryEpisodeSwfClear%2F/, "flash", "//*[@id=\"container\"]"],
    [/story%2FDoStoryEpisodeSwfEd%2F/, "flash", "//*[@id=\"container\"]"],
    [/story%2FDoStoryEpisodeSwfOp%2F/, "flash", "//*[@id=\"container\"]"],
    [/story%2FMissionResult%2F/, "func", handleStoryMission],
    [/story%2FStoryAreaResult%2F/, "a", "//*[@id=\"contents\"]/div[3]/a"],
    [/story%2FStoryBossAppear%2F/, "a", "//*[@id=\"contents\"]/div[3]/a"],
    [/story%2FStoryBossBattleFlash%2F/, "flash", "//*[@id=\"container\"]", 160, 290],
    [/story%2FStoryMain%2F/, "a", "//*[@id=\"contents\"]/div[3]/a"],
    [/story%2FStoryTop%2F/, "flash", "//*[@id=\"main_view\"]/div[2]/div/div[1]/a/div"],
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
    [/Swf%2F/, "flash", "//*[@id=\"container\"]"],
    [/xxxxxxxxxxxxxxxxx/]
];

