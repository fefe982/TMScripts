var xpathmypage = '//*[@id="header"]/ul/li[1]/a';

var actions = [
    [/battleAnimation/, 'flashJ', '#container'],
    [/battle_animation/, 'flashJ', '#container'],
    [/cardBook%2Fbonus/, 'aJ', 'a[href*="card_book%2FgetBonus%"]'],
    [/card_book%2Fbonus/, 'aJ', 'a[href*="card_book%2FgetBonus%"]'],
    [/Da2%2FeventTop/, 'aJ', 'a[href*="Da2%2Findex"]'],
    [/[dD]a2%2Findex/, 'func', function () {
        setInterval(function () {
            //debugger;
            return $('input#do_quest[disabled!="disabled"]').clickJ(0).length > 0 ||
                $('button#card_ok').clickJ(0).length > 0 ||
                $('input#go_next').clickJ(0).length > 0 ||
                $('button#friend_order_button').clickJ(0);
        }, 1000);
    }],
    [/da2%2FloseRare/, 'aJ', 'a[href*="da2%2Findex"]'],
    //[/da2%2FnoAction/, 'aJ', 'a[href*="da2%2FuseItem"]'],
    [/da2%2FrAreaResult/, 'aJ', 'a[href*="da2%2Findex"]'],
    [/da2%2FrArea\b/, 'list', [
        ['aJ', 'a[href*="da2%2FrArea%2F4"]'],
        ['aJ', 'a[href*="da2%2FrArea%2F' + Math.floor(Math.random() * 3 + 1) + '"]']]],
    [/da2%2FrSkill/, 'aJ', 'a[href*="da2%2FrSkill%2Fdefeat"]'],
    [/*da2%2F*//useItemComplete/, 'aJ', 'a[href*="%2Findex"]'],
    [/da2%2FuseItem\b/, 'aJ', 'a[href*="da2%2FuseItem"]'],
    [/friend%2FacceptList/, 'aJ', 'a[href*="friend%2FacceptOrderConfirm"]'],
    [/friend%2FacceptOrderConfirm/, 'aJ', 'input[name="yes"]'],
    [/friend%2FcompleteFriendOrder/, 'a', xpathmypage],
    [/friend%2FsearchFriends/, 'formJ', 'form'],

    //fusion
    [/fusion%2Fevolution_confirm%/, 'aJ', 'a[href*="fusion%2Fevolution%"]'],
    [/fusion%2Fevolution_result%/, 'aJ', "a[href*='fusion%2Fevolution_select']"],
    [/fusion%2Fevolution%/, 'flashJ', "#container"],
    [/fusion%2Flimit_result%/, 'aJ', "a[href*='fusion%2Flimit_select']"],
    [/fusion%2Flimit%/, 'flashJ', "#container"],
    [/item%2FpresentList/, 'formJ', 'form'],
    [/login%2Fperiod/, 'flashJ', '#container'],
    [/mypage%2FsetParameter/, 'func', function () {
        $("#auto_select").clickJ();
        $("form").submitJ(2000);
        $("a[href*='friend%2FsearchFriends%2Frand']").clickJ(3000);
    }],
    [/mypage/, 'list', [
        //['dbg'],
        ['aJ', 'div.contents_info a[href*="pick%2Ftop%2Ffree"]'], // free gacha
        //['dbg'],
        ['aJ', 'div.contents_info a[href*="mypage%2FsetParameter"]'], // status point
        ['aJ', 'div.contents_info a[href*="item%2FpresentList"]'],   // present
        ['aJ', 'div.contents_info a[href*="cardBook%2Fbonus"]'], // card book
        ['aJ', 'div.contents_info a[href*="friend%2FacceptList"]'],
        //['aJ', 'div.contents_info a[href*="shortStory%2Findex"]'], // story
        //['aJ', 'div.contents_info a[href*="mission%2Fbeginner"]'], // story
        ['aJ', 'div.contents_info a[href*="pick%2Ftop%2Fpremium"]'], // story
        //['aJ', 'div.contents_info a[href*="quiz%2Findex"]'], // story
        ['func', function () {
            var res = $('div#graph_hp div.graph_text_detail').text().match(/([0-9]*)\/[0-9]*/);
            var hp = res ? +res[1] : 0;
            res = $('div#graph_atk div.graph_text_detail').text().match(/([0-9]*)\/([0-9]*)/);
            var ap = res ? +res[1] : 0;
            var apall = res ? +res[2] : 0;
            GM_log("hp = " + hp);
            if (hp > 10) {
                return $('a[href*="Da2%2FeventTop"]').clickJ().length > 0 || $('a[href*="quest"]').clickJ().length > 0;
            }
            if (ap === apall) {
                return $('a[href*="playerBattle%2Fbattle"]').clickJ() > 0;
            }
        }]
    ]],

    //pick
    [/pick%2Fresult%2Ffree/, 'aJ', $('a[href*="pick%2Frun%2Ffree%2F"]').filter(':last')],
    [/pick%2Frun/, 'flashJ', '#container', 20, 2500],
    [/pick%2Ftop%2Ffree/, 'list', [
        ['aJ', 'a[href*="pick%2Frun%2Ffree%"]'],
        ['flashJ', 'canvas']]],
    [/pick%2F[a-zA-Z]*%2Fpremium/, 'list', [
        ['aJ', 'a[href*="pick%2Frun%2Fpremium%2Fmedal"]'],
        ['flashJ', '#container']]],

    //player_battle
    [/playerBattle%2Fbattle\b/, 'aJ', 'a[href*="player_battle%2Fbattle_confirm"]'],
    [/player_battle%2Fbattle_confirm%/, 'aJ', 'a[href*="battle_animation"]'],
    [/player_battle%2Fbattle_result%/, 'aJ', 'a[href*="mypage"]'],
    [/player_battle%2Fcomplete%/, 'flashJ', "#container"],

    //quest
    [/quest%2FbossSuccess/, 'aJ', 'a[href*="scenario%2Fquest"]'],
    [/*quest%2F*//clearAreaFlash/, 'flashJ', '#container'],
    [/quest%2Findex/, 'func', function () {
        setInterval(function () {
            //debugger;
            return $('input#do_quest[disabled!="disabled"]').clickJ(0).length > 0 ||
                $('button#card_ok').clickJ(0).length > 0 ||
                $('input#go_next').clickJ(0).length > 0 ||
                $('button#friend_order_button').clickJ(0);
        }, 1000);
    }],
    [/quest%2Fed/, 'list', [
        ['aJ', 'a[href*="quest%2Findex"]'],
        ['flashJT', document]]],
    [/*quest%2F*//levelUp/, 'flashJ', '#container'],
    [/*quest%2F*//noAction/, 'aJ', 'a[href*="%2FuseItem"]'],
    [/quest%2FrSkill/, 'list', [
        ['aJ', 'a[href*="quest%2FrSkill%2Fdefeat"]'],
        ['aJ', 'a[href*="quest%2FrSkill%2Fbattle"]']]],
    [/quest%2FshowBoss/, 'list', [
        ['aJ', 'a[href*="battleAnimation"]'],
        ['flashJT', document]]],
    [/quest%2FsogeFlash/, 'flashJ', '#container'],
    [/quest%2Ftop/, 'list', [
        ['aJ', 'a[href*="quest%2FshowBoss"]'],
        ['aJ', 'a[href*="quest%2Findex"]']]],
    [/quest%2Ftreasure/, 'flashJ', '#container'],
    [/quest%2FuseItem\b/, 'aJ', 'a[href*="quest%2FuseItem"]'],
    [/quest%2FwinRare/, 'aJ', 'a[href*="quest%2Findex"]'],
    [/scenario%2Fquest/, 'flashJT', document],
    [/shortStory%2Fstory/, 'list', [
        ['flashJT', document]
    ]],
    [/[\s\S]*/, 'hold'],
    [/xxxxxxxxxxxxxxxxxxx/]
];
