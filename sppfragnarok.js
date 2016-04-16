var handler = {
    "12008490": {
        xpathmypage : '//*[@id="header_left_button"]/a',
        cssmypage : '#header_left_button > a',
        xpathquest : '//*[@id="global_menu"]//a[i[@class="menu_sprite menu_quest_image"]]',
        xpathevent : '//*[@id="global_menu"]//a[i[@class="menu_sprite menu_event_image"]]',
        KILLBOSS : false,
        handleStrongBossTop : function () {
            var succ = false,
            attack;
            succ = succ || clickA('//*[@id="requestChain"]/a');
            if (!succ) {
                var ownerbox = $('#damage_box > div > div.no_flex > img');
                var owner = false;
                if (ownerbox.attr('src') && ownerbox.attr('src').match(new RegExp(USERID))) {
                    owner = true;
                }
                var attacked = getXPATH('//*[@id="damage_box"]/ul/li/a/div/div[2]/div[text()="' + USERNAME + '"]');
                if (!owner && !attacked) {
                    owner = getXPATH('//*[@id="popup_content"]/div[1]/div[2]/div//*[text()="' + USERNAME + '"]');
                    attacked = getXPATH('//*[@id="popup_content"]/div[1]/div[2]/ul/li/a//span[text()="' + USERNAME + '"]');
                }
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
                                    ++click;
                                    var text = $('#containerBox > div > div.eventPopupWrap.js_eventPopup > div > div > div.margin_left_10').text();
                                    GM_log(text);
                                    //BPが100→100に回復しました
                                    if (text.match(/BPが[0-9]*→(100|[2-9].)に回復しました/) && $('#battleBtn:visible').length > 0) {
                                        if ($('#battleBtn > a:visible').clickJ().length == 0) {
                                            $('#popup_content > div > div.section > div.box_horizontal.box_center.margin_10 > div.img_btn_m.btn_base.box_extend > a[href*="ArenaBattleTop"]').clickJ();
                                        }
                                    } else if (text.match(/BPが[0-9]*→100に回復しました/) && $('#raidBossBtn > a').filter(':visible').length > 0) {
                                        $('#raidBossBtn > a').clickJ();
                                    } else if ($('#excBtnOff').filter(':visible').length === 0) {
                                        var excBtn = $('#execBtn');
                                        var excBossBtn = $('#raidBossBtn > a');
                                        var t = excBossBtn.text().match(/[0-9]+/);
                                        if (excBtn.length == 0 || (click >= 20 && t >= 5)) {
                                            click = 0;
                                            excBtn = excBossBtn;
                                        }
                                        if (excBtn.length == 0) {
                                            excBtn = $('#execClear');
                                        }
                                        excBtn.clickJ().touchJ();
                                    } else if ($('#recoveryContainer > div > div.box_extend.js_recovery_btn > div:nth-child(1) > img').filter(':visible').length > 0) {
                                        var addAp = $('#recoveryContainer > div > div.box_extend.js_recovery_btn > div:nth-child(1) > img').filter(':visible').filter(':first');
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
                        //['hold'],
                        ['aJ', '#containerBox > div > a[href*="arena%2FChoiceCoinItemTop"]:regexText(\s?0*[1-9][0-9]*\s?)'],
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
                        ['setCookie', '__my_r_boss_clear', 1, 60],
                        //['hold'],
                    ]],
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
                            }
                        ],
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
                            }
                        ],
                        ['hold']]],
                [/card%2FMaterialCardList%2F%3FbulkFusion%3D1/, 'func', function () {
                        var xp_select = getXPATHAll('//*[@id="containerBox"]/form//select');
                        var select;
                        while ((select = xp_select.iterateNext()) !== null) {
                            select.selectedIndex = select.options.length - 1;
                        }
                        clickForm('//*[@id="containerBox"]/form');
                    }
                ],
                [/companion%2FCompanionApplicationAccept%2F/, 'form', '//form[.//input[@value="承認する"]]'],
                [/companion%2FCompanionApprovalList%2F/, 'a', '//a[text()="承認する"]'],
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
                                var btns = [$('#recovery > div.attack_patterns > div.sprites-bigraid-btn_1_1'),
                                    $('#recovery > div.attack_patterns > div.sprites-bigraid-btn_2_1'),
                                    $('#recovery > div.attack_patterns > div.sprites-bigraid-btn_3_1')];
                                GM_log(btns);
                                var hasBtn = false;
                                for (var i = 0; i < 3; i++) {
                                    var btn = btns[i];
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
                                    GM_log('island MissionDetail');
                                    //GM_log($('#execBtnOff.sprites-common-btn_nomal').length);
                                    //GM_log('' + $('#excBtnOff').filter(':visible').length);
                                    //GM_log('' + $('#execBtn').filter(':visible').length);
                                    //GM_log($('#raidBossBtn:not([style])'));
                                    if (this.KILLBOSS && $('#raidBossBtn:not([style]) > a').length > 0) {
                                        $('#raidBossBtn > a').clickJ();
                                    } else if ($('#excBtnOff[style*="block"]').length === 0) {
                                        excBtn = $('#execBtn');
                                        if (excBtn.length == 0) {
                                            excBtn = $('#execClear');
                                        }
                                        //GM_log("==========");
                                        //GM_log(excBtn);
                                        excBtn.clickJ();
                                        excBtn.touchJ();
                                    } else if ($('#recoveryContainer > div > div.box_extend.js_recovery_btn > div > img.js_on[style*="block"]').length > 0) {
                                        //GM_log("++++++++++");
                                        var addAp = $('#recoveryContainer > div > div.box_extend.js_recovery_btn > div > img.js_on[style*="block"]:first');
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
                                title;
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
                                    var succ = false;
                                    succ = succ || clickA('//a[text()="クエストをさらに進む"]');
                                    if (!succ && getXPATH('//*[@id="swfArea"]')) {
                                        clickA('//*[@id="containerBox"]/div[@class="margin_top txt_center"]/div/a');
                                    }
                                } else {
                                    alert(title);
                                }
                            }
                        ]]],
                [/mypage%2FCollectionComp%2F/, 'form', '//form[.//input[@value="報酬を受け取る"]]'],
                [/mypage%2FCollectionCompEnd%2F/, 'a', '//a[text()="図鑑報酬へ"]'],
                [/mypage%2FGreetList%2F/, 'a', this.xpathmypage],
                [/mypage%2FIndex/, "func", function () {
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
                        //succ = succ || clickA('//a[text()="贈り物が届いてます"]');
                        succ = succ || clickA('//a[text()="運営からのお詫び"]');
                        succ = succ || clickA('//a[text()="新しいメッセージがございます"]');
                        succ = succ || $('a:contains("スーパーノヴァの結果が届いています")').clickJ().length > 0;
                        succ = succ || clickA(this.xpathevent);
                        if (ap > 10 && !mission_error) {
                            succ = succ || clickA(this.xpathquest);
                        }
                        //succ = succ || clickA(this.xpathevent);
                        //succ = succ || setTimeout(function () {location.reload(true); },  60000);
                    }
                ],
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
                        ['funcR', function () {
                                var sell = false;
                                $("#containerBox > div:nth-child(12) > ul > li").each(function (index) {
                                    var name = $(this).children("div.section_header.fnt_emphasis.txt_center").text();
                                    if (mres = name.match(/^.\s(.*)\s1.*/)) {
                                        var cardname = mres[1];
                                        if (setSellCard.has(cardname)) {
                                            GM_log(cardname + " sell");
                                            $(this).find("form").submitJ();
                                            sell = true;
                                            return false;
                                        } else {
                                            GM_log(cardname + " keep");
                                        }
                                    } else {
                                        GM_log("bad name " + name);
                                    }
                                    return true;
                                });
                                if (sell) {
                                    return 1;
                                } else {
                                    return 0;
                                }
                            }
                        ],
                        ['aJ', '#containerBox > div > div.page_number:first() > div.current + div > a'],
                        ['funcR', function () {
                                GM_log("fall through");
                                return 0;
                            }
                        ],
                        ['hold']]],
                [/prizeReceive%2FPrizeReceiveTop%2F%3F(receiveCategory%3D2|bulkSellFlg%3D0%26sortKey%3D1%26receiveCategory%3D2%26page|receiveId%3D)/, 'list', [
                        ['funcR', function () {
                                var get = false;
                                $("#containerBox > div.section > ul > li").each(function (index) {
                                    var name = $(this).children("div.section_header.fnt_emphasis.txt_center").text();
                                    if (mres = name.match(/.\s(.*)\s.*/)) {
                                        var cardname = mres[1];
                                        if (!setGetCard.has(cardname)) {
                                            GM_log(cardname + " get");
                                            $(this).find("form").submitJ();
                                            get = true;
                                            return false;
                                        } else {
                                            GM_log(cardname + " pass");
                                        }
                                    } else {
                                        GM_log("bad name " + name);
                                    }
                                    return true;
                                });
                                if (!get) {
                                    $('#containerBox > div > div.page_number:first() > div.current + div > a').clickJ();
                                }
                                return 1;
                            }
                        ],
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
                        ['a', '//*[@id="area_progress_status"]/div[' + Math.floor(Math.random() * 3 + 1) + ']/a'],
                    ]],
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
    }
};