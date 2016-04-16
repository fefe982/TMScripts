
var xpathmypage = "//*[@id=\"main_header_menu\"]/ul/li[1]/a";
var cssmypage = "#main_header_menu > ul > li:nth-child(1) > a";
var xpathquest = "//*[@id=\"main_header_menu\"]/ul/li[2]/a";
var no_gift_delay = 10 * 60;

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
    [/battleTower%2FBattleTowerTop%2F/, 'list', [
        ['funcR', function () {
            if ($('div.last_free_cnt').length > 0 || $('div#gauge_bp')[0].dataset.value > 0) {
                return $("a[href*='battleTower%2FBattleTowerEnemyList']").clickJ().length > 0;
            }
        }],
        ['aJ', cssmypage]]],
    [/battleTower%2FBattleTowerEnemyList/, 'list', [
        ['minmax', '//div[div[text()="対戦相手選択"]]/ul/li[', ']//table/tbody/tr[1]/td', ']//a[text()="バトルする"]'],
        ['aJ', cssmypage]]],
    [/battleTower%2FBattleTowerResult%2F/, 'list', [
		['a', '//a[contains(text(),"対戦相手選択")]'],
		['aJ', cssmypage]]],
	[/comebackContinuation%2FComebackGacha%2F/, 'aJ', 'a:contains("贈り物ボックスへ")'],
    [/campaign%2FcmStory%2FCmStoryTop%2F/, 'a', '//a[text()="最新ストーリーを進める"]'],
    [/companion%2FCompanionApplicationEnd%2F/, 'a', '//a[text()="さらに探す"]'],
    [/companion%2FCompanionMultiApplication%2F/, 'form',  '//*[@id="contents"]/div[1]/form'],
    [/companion%2FSearchCompanion%2F/, 'form', '//*[@id="contents"]/form'],
    [/eventRaidboss%2FRaidbossBattleResult/, 'list', [
        ['aJ', '#contents > div > a[href*="mission%2FMissionActionLot"]']]],
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
    [/gacha%2FGacha(?:Result|Top)(?:%2F)?(?:%3FthemeId%3D[0-9]+.*)?$/, 'list', [
        ['aJ', 'form[name="gacha"] input[name="isMaxValue"]'],
        ['formJ', 'form[name="gacha"]'],
        ['aJ', 'div.btn_base > a:regex(href, gacha%2FDoGachaExec%2F%3FthemeId%3D([0-8]|9[0-9])):last'],
        //['hold'],
        ['aJ', cssmypage]]],
    [/gacha%2FGachaResult%2F%3FthemeId%3D7/, "a", '(//div[@class="btn_base block_flex"]/a[img])[last()]'],
    [/gacha%2FGachaResult%2F%3FthemeId%3D8/, "a", '(//div[@class="btn_base block_flex"]/a[img])[last()]'],
	[/gacha%2FitemBox%2FGachaBoxResetConf/, 'aJ', 'a[href*="gacha%2FitemBox%2FDoGachaBoxReset%2F"]'],
	[/gacha%2FitemBox%2FGachaBoxResetEnd/, 'aJ', 'a[href*="gacha%2FitemBox%2FGachaTop%2F"'],
	[/gacha%2FitemBox%2FGachaResult/, 'list', [
	    ['formJ', 'div.top_main>form'],
		['aJ', 'a[href*="gacha%2FitemBox%2FGachaBoxResetConf"]'],
		['aJ', 'a[href*="island%2FIslandTop%2F"']]],
	[/gacha%2FitemBox%2FGachaTop/, 'list', [
	    ['formJ', 'div.top_main>form'],
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
    [/guildbattle%2FGuildbattleRecordList%2F/, 'aJ', cssmypage],
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
    [/island%2FIslandRaidbossAssistList%2F/, 'list', [
		['a', '//ul/li[div[1]/span/span[@class="icon_new"]]//a[text()="助けに行く"]'],
		['aJ', cssmypage]]],
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
			return $('div.medal_num > span > span.number_island_gold_2_0').length == 0
            && $('a.link_casino').clickJ().length > 0;
        }],
        //['a', '//a[img[contains(@src, "casino_on.png")]]'],
        ['a', '//a[img[@alt="エクストラステージを探索"]]'],
        ['aJ', 'a.link_quest']]],
    [/island%2FMissionResult%2F/, 'list', [
        ['a', '//a[img[@alt="エクストラステージを探索"]]'],
        ['a', '//a[img[@alt="イベントクエストを探索"]]'],
        ['a', '//a[text()="使用する"]']]],
    [/mypage%2FIndex%2F/, 'list', [
        ['aJ', '#header > a:not(:contains("ギルドバトルまで"))'],
        ['aJ', 'a:has(span#battle_name)'], //succ = succ || clickA('//a[span[@id="battle_name"]]');
        ['aJ', '#boss_appear_btn:has(span) > div > a'],//succ = succ || clickA("//*[@id=\"boss_appear_btn\" and span]/div/a");
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
        ['funcR', function () {
            if (GM_getValue("__ava_no_gift", 0) + no_gift_delay * 1000 < Date.now()) {
                return $('a:contains("贈り物が届いています")').clickJ().length > 0;
            }
            return false;
        }],
        ["func", function () {
            //var new_raid = getXPATH("//*[@id=\"boss_appear_btn\"]/span");
            var ap = getXPATH("//*[@id=\"gauge_ap\"]/div[1]").dataset.value;
            //var bp = getXPATH("//*[@id=\"gauge_bp\"]/div[1]").dataset.value;
            //var guild_battle = getXPATH('//a[span[@id="battle_name"]]');
            var succ = false;
            // with more points for free gacha, we can do a premium gacha.
            //succ = succ || clickA("//a[text()='無料ガチャが回せます']");

            if (ap > 10) {
                //succ = succ || $('a[href*="summonHunt%2FSummonHuntTop"]').clickJ().length > 0;
                return $('#index > div > a[href*="unitBattle%2FUnitBattleTop"]').clickJ().length > 0
                    || $('#index > div > a[href*="island%2FIslandTop"]').clickJ().length > 0
                    //|| clickA('//a[contains(@href, "TowerRaidTop")]');
                    || clickA("//*[@id=\"quest_btn\"]/a");
            }
        }]]],
    [/mypage%2FLoginBonusResult%2F/, 'a', '//a[text()="贈り物BOXへ"]'],
    [/mypage%2FLoginBonusSpecial%2F/, 'aJ', 'a[href*="prizeReceive%2FPrizeReceiveTop"]'],
    [/mission%2FRegionList%2F/, "a", "//div[@class='section_main']/div[2]/div[2]/div/a"],//*[@id="contents"]/div[3]/div[2]/div[2]/div/a
    [/mission%2FMissionActionLot%2F/, "flash", "//*[@id=\"container\"]"],
    [/mission%2FBossAppear%2F/, "a", "//*[@id=\"contents\"]/div[2]/a"],
    [/mission%2FBossBattleFlash%2F/, "flash", "//*[@id=\"container\"]", 161, 293],
    [/mission%2FMissionResult%2F/, 'list', [
        ['aJ', '#towerraid_announce > div > div:nth-child(2) > a'],//'//*[@id="#towerraid_announce"]/div/div[2]/a');
        ['aJ', '#contents > div.btn_main_large.margin_top_10 > a'],//succ = succ || clickA("//*[@id=\"contents\"]/div[@class='btn_main_large margin_top_10']/a");//*[@id="contents"]/div[5]/a //*[@id="contents"]/div[5]/a
        ['aJ', 'a:contains("レイドボス出現中")'],//succ = succ || clickA('//a[text()="レイドボス出現中"]');
        ['aJ', 'a:contains("さらにクエストする")'], //succ = succ || clickA('//a[text()="さらにクエストする"]');
        ['aJ', 'a:contains("次のエリアへ")'], //('//a[text()="次のエリアへ"]');
        ['aJ', cssmypage]]],//(xpathmypage);]]],
    [/mission%2FBossBattleResult%2F/, 'aJ', 'a:contains("次のエリアへ進む"):first()'],
    [/mission%2FMissionError%2F/, 'list', [
        ['funcR', function () {
            if (document.referrer.match(/island%2F/)) {
                return $('a:contains("使用する")').clickJ().length > 0;
        }
        }],
        ['aJ', cssmypage]]], //"a",  "//*[@id=\"global_menu\"]/ul/li[1]/div[5]/a"],
    [/mission%2FMissionListSwf%2F/, "link", "http://sp.pf.mbga.jp/12010455?url=http%3A%2F%2Fmguildbattle.croozsocial.jp%2Fmypage%2FIndex%2F"],
    [/multiguildbattle%2FMultiGuildbattleResult%2F/, 'a', '//*[@id="btn_force"]/a'],
    [/multiguildbattle%2FMultiGuildbattleSelectAttackType%2F/, 'list', [
        ['a', '//*[@id="btn_start"]/a'],
        ['a', '//*[@id="btn_force"]/a']]
        ],
    [/multiguildbattle%2FMultiGuildbattleSelectTarget%2F/, 'a', '//div[div[text()="ターゲット選択"]]/ul/li[1]//a'],
    [/multiguildbattle%2FMultiGuildbattleTop%2F/, 'a', xpathmypage],
    [/prizeReceive%2FPrizeReceiveTop%2F/, 'list', [
        ['formJ', '#contents > form'], //succ = succ || clickForm("//*[@id=\"contents\"]/form");
        ['aJ', '#contents > ul.btn_tabs.margin_top_10 > li > a:not(:contains("(0)"))'],//    succ = succ || clickA('//*[@id="contents"]/ul[@class="btn_tabs margin_top_10"]/li/a[not(contains(text(), "(0)"))]');
        ['funcR', function () {
            if ($('div.txt_block_center:contains("所持武具が上限数に達しています")').length > 0) {
                GM_setValue("__ava_no_gift", Date.now());
                return true;
            }
            return false;
        }],
        ['aJ', cssmypage]]],
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
        ['aJ', cssmypage]]],
    [/raidboss%2FRaidbossBattleResult%2F/, 'list', [
        ['funcR', function () {
            if (document.referrer.match(/raidboss%2FRaidbossBattleResultList%2F/)) {
                window.location.href = document.referrer;
            return true;
            }
        }],
        ['aJ', 'div.btn_main_large > a'],
        ['aJ', 'a:contains("応援一覧へ戻る")'],
        ['aJ', cssmypage]]],
    [/raidboss%2FRaidbossBattleResultList%2F/, 'a', '//*[@id="contents"]/div[1]/ul/li/a'],
    [/shop%2FItemUseEnd%/, 'a', '//a[contains(@href, "MissionActionLot")]'],
    [/story(ex)?%2FDoStoryEpisodeSwf2%2F/, 'flashJT', '#container > canvas'],
    [/story(ex)?%2FDoStoryEpisodeSwfClear%2F/, 'flashJT', '#container > canvas'],
    [/story(ex)?%2FDoStoryEpisodeSwfEd%2F/, "flash", "//*[@id=\"container\"]"],
    [/story(ex)?%2FDoStoryEpisodeSwfOp%2F/, "flash", "//*[@id=\"container\"]"],
    [/story(ex)?%2FMissionResult%2F/, 'func', function () {
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
		["flash", "//*[@id=\"main_view\"]//div[contains(@class, 'on')]/a/div"]
		]],
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
    [/Swf%2F/, "flashJT", '#container > canvas'],
	[/SwfOp%2F/, 'flash', '//*[@id="container"]'],
    [/xxxxxxxxxxxxxxxxx/]
];

