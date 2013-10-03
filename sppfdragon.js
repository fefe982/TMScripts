var xpathmypage = '//*[@id="header"]/ul/li[1]/a';

var actions = [
    //mypage
    [/mypage%2FIndex/, 'func', function () {
        if ($("ul.lst_main li.lst_btn a[href*='campaign%2FBoardCampaign%2F']").clickJ().length > 1 ||
                $("ul.lst_main li.lst_btn a[href*='prizeReceive%2FPrizeReceiveTop%2F']").clickJ().length > 1) {
            return;
        }
        $('a[href*="story%2FStoryStateList%2F"]').clickJ();
    }],

    //prizeReceive
    [/prizeReceive%2FPrizeReceiveTop%/, 'list', [
        ["formJ", "form"],
        ['hold']]],

    //story
    [/story%2FStoryActionHistorySwf%/, 'flashJT', 'canvas'],
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
    [/story%2FStoryRegionList/, 'aJ', 'a[href*="story%2FStoryAreaList%2F"]'],
    //http://sp.pf.mbga.jp/12012329?url=http%3A%2F%2Fmdrabre.croozsocial.jp%2Fstory%2FStoryActionHistorySwf%2F%3FhistoryId%3D4985531%26hitStoryBossFlg%3D0%26storyOrderId%3D2958326%26hitRaidbossId%3D%26bossExecFlg%3D1%26afterSwfFlg%3D1%26boardType%3D0

    //Swf
    [/Swf\b/, 'flashJ', '#container'],
    [/xxxxxxxxxxxxxxxxxx/]
];
