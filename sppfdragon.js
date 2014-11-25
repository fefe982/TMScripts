var xpathmypage = '//*[@id="header_menu"]/nav/a[2]';

function hdlswf() {
    var ld = $('.loading'), cvs = $('canvas');
    if (ld.length > 0) {
        setTimeout(hdlswf, 1000);
        return true;
    }
    if (cvs.length > 0) {
        cvs.clickFlash();
        return true;
    }
    return false;
}

var actions = [
    [/apology%2FApologyList%/, 'list', [
        ['formJ', 'form'],
        ['aJ', 'a[href*="mypage%2FIndex%2F"]']]],

    [/gacha%2FGachaTop%3FthemeId%3D4/, 'formJ', 'form:has(select)'],

    [/gacha%2FGachaResult%/, 'funcR', function () {
        var f = $('form').filter(':has(select)').filter(':first');
        if (f.length === 0) {
            return false;
        }
        var s = f.find('select')[0];
        s.selectedIndex = s.options.length - 1;
        f.submitJ();
        return true;
    }],
    [/gacha%2FGachaSwf%/, 'funcR', hdlswf],

    //mypage
    [/mypage%2FIndex/, 'func', function () {
		return;
        if ($("ul.lst_main a[href*='campaign%2FBoardCampaign%2F']").clickJ().length > 0 ||
                $("ul.lst_main a[href*='prizeReceive%2FPrizeReceiveTop%2F']").clickJ().length > 0 ||
                $("ul.lst_main a[href*='apology%2FApologyList%2F']").clickJ().length > 0) {
            return;
        }
        if ($('dd.ap_gauge').data('value') > 10) {
            $('a[href*="story%2FStoryStateList%2F"]').clickJ();
        }
    }],

    //prizeReceive
    [/prizeReceive%2FPrizeReceiveTop%/, 'list', [
        ["formJ", "form"],
        ['funcR', function () {
            return $('ul.btn_tabs a').filter(function () {
                return !$(this).text().match(/\(0\)/);
            }).clickJ().length > 0;
        }],
        ['aJ', 'a[href*="mypage%2FIndex"]']
        //['hold']
    ]],

    //story
    [/story%2FStoryActionHistorySwf%/, 'list', [
        ['funcR', hdlswf]]],
    [/story%2FStoryAreaList%2F/, 'aJ', 'a[href*="story%2FDoStoryOrder%2F"]'],
    [/story%2FStoryBossBattleResult%/, 'aJ', 'a[href*="story%2FDoStoryOrder%2F"]'],
    [/story%2FStoryBossConf%/, 'list', [
        ['funcR', function () {
            var qst = $('#questHelpBtn');
            //debugger;
            if (qst.length === 0) {
                return false;
            }
            qst.clickJ();
            $('a[href*="story%2FDoStoryActionHistory%"]').clickJ(2000);
            return true;
        }],
        ['funcR', function () {
            return $('button.bp_attack3').filter(':enabled').clickJ().length > 0;
        }],
        ['aJ', 'a[href*="story%2FDoStoryActionHistory%"]'],
        ['hold']
    ]],
    [/story%2FStoryHome%/, 'funcR', function () {
        if ($('a[href="#recover101"]').clickJ().length === 0) {
            return false;
        }
        setTimeout(function () {
            $('a[href*="story%2FDoStoryActionHistory"]').clickJ();
        }, 1000);
    }],
    [/story%2FStoryRegionList/, 'aJ', 'a[href*="story%2FStoryAreaList%2F"]'],
    [/story%2FStoryResult/, 'aJ', 'a[href*="story%2FStoryAreaList%2F"]'],
    [/unitfusion%2FBulkUnitFusionConfirm/, 'formJ', 'form[action*="unitfusion%2FUnitFusion"]'],
    [/unitfusion%2FUnitFusionEnd%2F/, 'aJ', 'a[href*="unit%2FUnitList%2F%3FbulkFusion%3D1"]'],
    [/unitfusion%2FUnitFusionSwfStart%2F/, 'funcR', hdlswf],
    //Swf
    [/Swf\b/, 'flashJ', '#container'],
    [/xxxxxxxxxxxxxxxxxx/]
];
