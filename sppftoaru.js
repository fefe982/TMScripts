var xpathmypage = '//*[@id="top_btn"]/a';
//http://sp.pf.mbga.jp/12011562?guid=ON&url=http%3A%2F%2Ftoaru-index.heroz.jp%2FAs4%2FeventTop
var actions = [
    [/battleAnimation/, 'flashJT', '#canvas'],
    [/battle_animation/, 'flashJT', '#canvas', 20, 440],
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
    [/*da2%2F*//useItemComplete/, 'aJ', '#bg > section > article > div > div > a'],
    [/da2%2FuseItem\b/, 'aJ', 'a[href*="da2%2FuseItem"]'],
    [/friend%2FacceptList/, 'aJ', 'a[href*="friend%2FacceptOrderConfirm"]'],
    [/friend%2FacceptOrderConfirm/, 'aJ', 'input[name="yes"]'],
    [/friend%2FcompleteFriendOrder/, 'a', xpathmypage],
    [/friend%2FsearchFriends/, 'formJ', 'form'],

    //fusion
    [/fusion%2Fconfirm%/, 'aJ', 'a[href*="fusion%2Ffusion%"]'],
    [/fusion%2Fevolution_confirm%/, 'aJ', 'a[href*="fusion%2Fevolution%"]'],
    [/fusion%2Fevolution_result%/, 'aJ', "a[href*='fusion%2Fevolution_select']"],
    [/fusion%2Fevolution%/, 'flashJ', "#container"],
    [/fusion%2Ffusion%/, 'flashJ', '#container'],
    [/fusion%2Flimit_result%/, 'aJ', "a[href*='fusion%2Flimit_select']"],
    [/fusion%2Flimit%/, 'flashJ', "#container"],
    [/item%2FpresentList/, 'formJ', 'form'],
	[/judge%2ForderHelpSelect/, 'aJ', '#bg > section > ul > li > dl > dd:nth-child(3) > div > div > a'],
    [/login%2Fperiod/, 'flashJT', '#canvas'],
    [/mypage%2FsetParameter/, 'func', function () {
        $("#auto_select").clickJ();
        $("form").submitJ(2000);
        $("a[href*='friend%2FsearchFriends%2Frand']").clickJ(3000);
    }],
    [/mypage/, 'list', [
        //['dbg'],
        //['aJ', 'div.contents_info a[href*="pick%2Ftop%2Ffree"]'], // free gacha
        //['dbg'],
        ['aJ', 'section.eventArea > article a[href*="mypage%2FsetParameter"]'], // status point
        ['aJ', $('.present_number > a').filter(function(){return this.innerHTML!='0';})],   // present
        ['aJ', 'div.contents_info a[href*="cardBook%2Fbonus"]'], // card book
        ['aJ', 'div.contents_info a[href*="friend%2FacceptList"]'],
        //['aJ', 'div.contents_info a[href*="shortStory%2Findex"]'], // story
        //['aJ', 'div.contents_info a[href*="mission%2Fbeginner"]'], // story
        ['aJ', 'div.contents_info a[href*="pick%2Ftop%2Fpremium"]'], // story
        //['aJ', 'div.contents_info a[href*="quiz%2Findex"]'], // story
        ['func', function () {
            var res = $('div#graph_hp div.graph_text_detail').text().match(/([0-9]*)\s*\/\s*[0-9]*/);
            var hp = res ? +res[1] : 0;
            res = $('div#graph_atk div.graph_text_detail').text().match(/([0-9]*)\s*\/\s*([0-9]*)/);
            var ap = res ? +res[1] : 0;
            var apall = res ? +res[2] : 0;
            GM_log("hp = " + hp);
			GM_log("ap = " + ap + "/" + apall);
            if (hp > 10) {
                return $('#bg > section.eventArea > div > a[href*="%2FeventTop"]').clickJ().length > 0 || $('a[href*="quest"]').clickJ().length > 0;
            }
            if (ap === apall) {
                return $('a[href*="playerBattle%2Fbattle"]').clickJ() > 0;
            }
        }]
    ]],
	
	[/Partner%2Findex/, 'list', [
		['aJ', '#partnerCommand > li:nth-child(' + (Math.floor(Math.random() * 4) + 1) + ') > div > div > a']]],
	[/partner%2Findex/, 'list', [
		['aJ', '#top_btn > a']]],

    //pick
    [/pick%2Fresult%2Ffree/, 'list', [
		//['aJ', $('a[href*="pick%2Frun%2Ffree%2F"]').filter(':last')],
		['aJ', '#bg > article > section:nth-child(1) > article > div > div > a']]],
    [/pick%2Frun/, 'flashJT', '#canvas', 40, 410],
    [/pick%2Ftop%2Ffree/, 'list', [
        ['aJ', 'a[href*="pick%2Frun%2Ffree%"]'],
        ['flashJ', 'canvas']]],
    [/pick%2F[a-zA-Z]*%2Fpremium/, 'list', [
        //['aJ', 'a[href*="pick%2Frun%2Fpremium%2F"]'],
		// ['hold'],
        ['flashJ', '#container']]],

    //player_battle
    [/playerBattle%2Fbattle\b/, 'aJ', 'a[href*="player_battle%2Fbattle_confirm"]'],
    [/player_battle%2Fbattle_confirm%/, 'aJ', 'a[href*="battle_animation"]'],
    [/player_battle%2Fbattle_result%/, 'aJ', 'a[href*="mypage"]'],
    [/player_battle%2Fcomplete%/, 'flashJ', "#canvas"],
	[/present%2Fconfirm%2F[01]%2F/, 'list', [
		['formJ', '#bg > section > article > div > form'],
		['aJ', '#top_btn > a']]],
	[/present%2Findex/, 'list', [
		['aJ', '#bg > section > article > form > div > div > input[type="submit"]'],
		//['sth', '//*[@id="bg"]/section/article/form/div/div/input'],
		['aJ', '#bg > section > ul > li:nth-child(2) > a:not(.selected)'],
		['aJ', '#top_btn > a']]],

    //quest
    [/quest%2FbossSuccess/, 'aJ', 'a[href*="scenario%2Fquest"]'],
    [/*quest%2F*//clearAreaFlash/, 'flashJT', '#canvas'],
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
    [/*quest%2F*//levelUp/, 'flashJT', '#canvas'],
    [/*quest%2F*//noAction/, 'list', [
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
    [/quest%2FwinRare/, 'aJ', 'a[href*="quest%2Findex"]'],
	[/quest_story%2Fquest%2Fop/, 'flashJT', document],
    [/scenario%2Fquest/, 'flashJT', document],
	[/scenario2%2Fs%2Fmorinaga_end/, 'flashJT', document],
    [/shortStory%2Fstory/, 'list', [
        ['flashJT', document]
    ]],
	
	//[/Flash\b/, 'flashJ', 
	[/(soge|FrSkill)Flash/, 'flashJ', '#canvas'],
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
	[/[xX]mas2%2Fquest/, 'func', function(){
		setInterval(function(){
			GM_log($('#but4.on').length);
			if ($('#but4.on').clickJ().length == 0) {
				$('#but3.on').clickJ();
			}
		}, 2000);
	}],
	[/%2FeventTop/, 'list', [
		['aJ', 'div.questAction > a'],
		['aJ', 'div.questAction ul > li a[href*="%2Fraid%2F"]'],
		['aJ', 'div.questAction ul > li a[href*="%2Fjudge%2Findex%2F1"]']]],
	[/%2Findex%2F/, 'func', function () {
        setInterval(function () {
            //debugger;
            return $('input#do_quest[disabled!="disabled"]').clickJ(0).length > 0 ||
                $('button#card_ok').clickJ(0).length > 0 ||
                $('input#go_next').clickJ(0).length > 0 ||
				$('button#friend_order_button:visible()').clickJ(0).length > 0 ||
				$('#bg > div.footer_menu > ul > li:nth-child(1) > a').clickJ(0).length > 0;
        }, 1000);
    }],
	[/%2FraidBoss%2F/, 'list', [
		['flashJT', '#canvas']]],
	[/%2Fraid%2F/, 'list', [
		['aJ', 'a[href*="battle_animation%2F"]:last()'],
		['aJ', '#bg > div.btn_blue > a'],
		['aJ', 'a[href*="eventTop"]']]],
	[/%2Fattack_result/, 'aJ', '#bg > div > div.btn_blue > a'],
    [/[\s\S]*/, 'hold'],
    [/xxxxxxxxxxxxxxxxxxx/]
];
