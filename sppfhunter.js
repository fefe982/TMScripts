var xpathmypage = "//header/div[@class='sprite btn_base header_left']/a";
//var xpathevent = '//a[text()="oopserr"]';
var xpathevent = '//a[contains(@href, "EventTop")]';
var xpatheventnext = '//*[@id="mainCommand_quest"]/a';
var xpathgiftbox = '//a[.//i[@class="sprite_menu3 menu_btn_prize"]]';

function handleRaidBoss(){
    var boss_info = getXPATH("//*[@id=\"main\"]/p[@class='subtitle raidboss_status']");
    var boss_n, boss_lvl;
    if (boss_info) {
        var res = boss_info.innerText.match(/(\S+)[\s\S]*Lv([0-9]+)/);
        if (res && res.length >= 3) {
            boss_n =res[1];
            boss_lvl= res[2];
        } else {
            boss_n = boss_info.innerText;
            boss_lvl = 0;
        }
    }//*[@id="raidboss_hp"]/div/div/div[2]/div[2]
    var bp_need, bp_need_cookie;
    if (document.URL.match(/isHelpUser/)){
        bp_need = 1;
    } else {
        bp_need_cookie = getCookie("__my_boss_"+boss_n);
        if (!bp_need_cookie) {
            bp_need_cookie = 1;
            bp_need = 1;
        } else if (bp_need_cookie < 0) {
            bp_need = 1;
        } else {
            bp_need = bp_need_cookie;
        }
        
        if (document.URL.match(/sentHelpFlg%3D1/)){
            if (bp_need_cookie >0 && bp_need_cookie < 3) {
                bp_need_cookie ++;
            } else {
                bp_need_cookie = -1;
            }
            setCookie("__my_boss_"+boss_n, bp_need_cookie, 3600*24);
            clickA('//div[@class="event_help_button"]//a');
            return;
        }
    }
    var i;
    setInterval(function(){
        var attack = getXPATH("//*[@id=\"bp_attack\"]/div["+bp_need+"]/div[3]");
        if (attack && getComputedStyle(attack) .getPropertyValue("display")!="none") {
            clickSth(attack, "click");
            attack.style.display="none";
        }
    }, 2000);
    
    setInterval(function(){
        var res_wrapper = getXPATH("//*[@id=\"second_action_box\"]");
        if (res_wrapper && getComputedStyle(res_wrapper) .getPropertyValue("display")!="none"){
            var result = getXPATH("//*[@id=\"battle_result_btn\"]/a");
            if (result) {clickSth(result, "click");}
        }
    }, 1000);
    
    setInterval(function(){
        var ff = getXPATH("//*[@id=\"stage_front\"]");
        if (ff && getComputedStyle(ff) .getPropertyValue("display")!="none") {clickSth(ff, "click");}
    }, 1000);
    
    setInterval(function(){
        
        var bp_now = 0;
        var battle_bp = [];
        for ( i = 1; i <=3; i++) {
            battle_bp[i] = getXPATH("//*[@id=\"bp_attack\"]/div[" + i + "]/div[1]");
            if (battle_bp[i] && getComputedStyle(battle_bp[i]) .getPropertyValue("display")!= "none") {
                bp_now ++;
            }
        }
        if (bp_now < bp_need)
        {
            var gap = bp_need - bp_now;
            var ele;
            var ok = getXPATH("//*[@id=\"bp_recovery\"]/div/div[2]");
            if (gap >= 3) {
                ele = getXPATH("//*[@id=\"bp_recovery\"]/ul/li[1]/div[1]");
                if (ele &&  ele.dataset.life > 0) {
                    clickSth(ele,"click");
                    setTimeout(function(){clickSth(ok,"click");}, 1000);
                }
            }
            if (gap < 3 || !ele || ele.dataset.life == 0) {
                ele = getXPATH("//*[@id=\"bp_recovery\"]/ul/li[2]/div[1]");
                if (ele && ele.dataset.life >= gap){
                    for (i=0 ; i < gap; i++){
                        clickSth(ele,"click");
                    }
                    setTimeout(function(){clickSth(ok,"click");}, 1000);
                }
            }
        }
    }, 2000);
}

function handleMissionResult(){
    var succ = false;
    succ = succ || clickA("//*[@id=\"go\"]/a");
    succ = succ || clickA("//*[@id=\"next\"]/a");
    succ = succ || clickA(xpathmypage);
}

function handleMissionList(){
    var succ = false;
    succ = succ || clickA("//*[@id=\"current_priority\"]/a");
    succ = succ || clickA("//*[@id=\"to_latest_mission\"]/a");
    succ = succ || clickA("//div[@class='boss_btn ']/div/a");
}

function handleRaidGacha(){
    //if (!clickA("//*[@id=\"main\"]/section[1]/div[3]/div[2]/a")){
    //    clickA("//*[@id=\"main\"]/section[1]/div[2]/div/p/a");
    //}
}
function handleFriendGachaTop(){
    var free_gacha = getXPATH("//*[@id=\"main\"]/div[4]/div/ul/li/div/a");
    if (free_gacha) {
        clickLink(free_gacha);
    }
    else {
        for (i = 3; i>=2; i--) {
            var gacha = getXPATH("//*[@id=\"main\"]/div[4]/div/ul/li/div["+i+"]/div/a");
            if (gacha){setTimeout(clickLink(gacha),1000);break;}
        }
    }
}
function handleFriendGachaRes(){
    var i;
    //for (i = 3; i>=2; i--) {
    //    if (clickA("//*[@id=\"main\"]/aside/div/div/ul/li/div["+i+"]/div/a")){return;}
    //}
    //clickA(xpathmypage);
}

function handleCoinGacha(){
    var lvl = 512; 
    //alert("coin");
    for (lvl = 512; lvl >=510; lvl --){
        for (i = 2; i >=1; i--){
            var button = getXPATH("//*[@id=\"item_"+lvl+"\"]/div/div"+(i==1?"":("["+i+"]")) +"/a");
            if (button) {clickLink(button); return;}
        }
    }
    clickA(xpathmypage);
}

function handlemypage(){
    //alert("mypage");
    var ap_gauge = getXPATH("//div[@class=\"gauge stamina\"]/div"),
        raid_help_clear = getCookie("__myraid_clear"),
        no_bp_candy = getCookie("__ht_no_bp"),
        battle_olympia_over = getCookie("__ht_bo_over"),
		raid_my_boss_wait = getCookie("__ht_myboss_wait"),
        succ = false;
    if(!raid_help_clear && !no_bp_candy) {
        succ = succ || clickA("//a[div[@class='sprite_mypage2 btn_help']]");
    }
    if (!no_bp_candy && !raid_my_boss_wait) {
        succ = succ || clickA('//div[@class="btn_boss_wrap"]/a');
    }
    succ = succ || clickA('//a[text()="未使用のガチャアイテムがあります"]');
    succ = succ || clickA("//a[contains(text(), '冒険から帰って来ました')]");
    succ = succ || clickA("//a[contains(text(), '冒険に行けます')]");
    succ = succ || clickA('//a[text()="運営からのお詫び"]');
    succ = succ || clickA("//a[contains(text(), '仲間申請が')]");
    if (ap_gauge && ap_gauge.dataset.width > 10) {
        succ = succ || clickA(xpathevent);
        //succ = succ || clickA("//div[@class='mission']/a");
    }
    if (!succ) { 
        if (getXPATH('//div[@class="battle"]/a/div[@class="mypage_battleOlympia"]')) {
            if (!battle_olympia_over) {
                succ = clickA('//div[@class="battle"]/a');
            }
        } else if (getXPATH("//div[@class='battle']/div/div[@class='badge']") || getXPATH("//div[@class='sprite gauge_bp bp1']")) 
        {
            setCookie("__mybattle_bp", "1", 60);
            succ = clickA("//div[@class='battle']/a");
        }
    } 
    succ = succ || clickA('//div[@class="badge_present_wrap"]/a');
    //succ = succ || clickA('//*[@id="menus"]/a[1]');
    if (!succ) {
        //setTimeout(function(){
        //        if (ap_gauge && ap_gauge.dataset.width > 50) {
                //clickA("//div[@class='mission']/a");
        //        }
        //        }, 60000);
        setTimeout(function(){location.reload(true);},  60000);
    }
}

function handleBattleTop() {
    var free_text = getXPATH("//*[@id=\"btn_entry\"]/a/div");
    //alert(free_text);
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

function handleBattleTower(){
    // "//*[@id=\"first_action_box\"]/div[1]/div[3]/a"
    //alert("battletower");
    var free = getCookie("__mybattle_free");
    var bp = 0;
    var n_use_bp = 1;
    var bp_use = getXPATH("//*[@id=\"do_battle_btn\"]/div[2]");
    if (bp_use)
    {
        var res = bp_use.innerText.match(/BP([0-9])/);
        if (res) { n_use_bp = res[1];}
    }
    if (n_use_bp > 0) {
        free = 0;
    } else if (n_use_bp == 0) {
        if (!free){free = 1;}
    }
        if (free) {
            setCookie("__mybattle_free", free > 0 ? free-1 : 0,60);
        }
    var bp_gauge;// = getXPATH("//div[@class='sprite gauge_bp bp_gauge3']");
    var style;// = getComputedStyle(bp_gauge);
    var disp;// = style.getPropertyValue("display");
    if (getXPATH("//div[@class='sprite gauge_bp bp_gauge3' and not(contains(@style,'display: none'))]")) {
        bp =3;
    } else  if (getXPATH("//div[@class='sprite gauge_bp bp_gauge2' and not(contains(@style,'display: none'))]")) {
        bp =2;
    } else if (getXPATH("//div[@class='sprite gauge_bp bp_gauge1' and not(contains(@style,'display: none'))]")) {
        bp =1;
    } else{
        bp = 0;
    }
    //alert(bp);
    if (free > 0)
    {
        setCookie("__mybattle_bp", bp, 60);
    } else {
        setCookie("__mybattle_bp", bp-1, 60);
    }
    //alert(free);
    //alert(bp);
    if (free > 0 || bp > 0) {
        if (!clickAV("//*[@id=\"first_action_box\"]/div[1]/div[3]/a", "//*[@id=\"first_action_box\"]/div[1]/div[3]/a")) {
            
            setInterval(function(){                
                var res_wrapper = getXPATH("//*[@id=\"first_action_box\"]");
                if (res_wrapper && getComputedStyle(res_wrapper) .getPropertyValue("display")!="none"){
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
    if (res[1] == res[2]) {
        clickA("//a[contains(text(),'他のカードを強化')]");
    } else {
        clickA("//a[contains(text(),'さらに強化')]");
    }
}

function handleFusionResult(){
    var form = getXPATH("(//ul[@class='lst_sub']/li/form)[last()]"),
        succ = false;
    if (form) {
        form.elements[1].selectedIndex = form.elements[1].options.length - 1;
        form.submit();
        succ = true;
    }
    //succ = succ || clickA('//a[text()="Nカード一括強化"]');
    succ = succ || clickA(xpathmypage);
}

function handlePrizeTop() {
    var succ = false;
    succ = succ || clickForm("//*[@id=\"main\"]/div[2]/div/form");
    succ = succ || clickA("//a[span[@class='badge fnt_normal']]");
    succ = succ || clickA(xpathmypage);
}

function handleCaveAreaSelect() {
    var areaID = Math.floor(Math.random() * 5) + 1;
    clickA('(//a[text()="選択"])['+areaID+']');
}

function handleCardSelect() {
    var select_sort = getXPATH("//form/div[2]/div/select");
    if (select_sort && select_sort.selectedIndex != 8) {
        select_sort.selectedIndex = 8;
        getXPATH("//form").submit();
    }
    
    setInterval(function(){
        clickA('//li[//td[@class="aura" and contains(text(), 24)]]/div[2]/a');
    }, 2000);
}

function handleRaidBossAssistList() {
    if (!clickA('//a[.//span[@class="sprite txt_new"]]')){
        setCookie("__myraid_clear", 1, 60);
        clickA(xpathmypage);
    }
}

function handleEventRes() {
    var min = 1000000, minid = 0, i;
    for (i = 1; i<=3; i++){
        var att_e = getXPATH('//*[@id="main"]/section[2]/ul/li[' + i + ']/a/div/div[2]/table/tbody/tr[3]/td');
        var res = att_e.innerText.match(/([0-9]+)/);
        var att = parseInt(res[1],10);
        var def_e = getXPATH('//*[@id="main"]/section[2]/ul/li[' + i + ']/a/div/div[2]/table/tbody/tr[4]/td');
        res = def_e.innerText.match(/([0-9]+)/);
        var def = parseInt(res[1],10);
        if (att + def < min){
            min = att+def;
            minid= i;
        }
    }
    if (minid > 0){
        clickA('//*[@id="main"]/section[2]/ul/li[' + minid + ']/a');
    } else {
        clickA(xpathmypage);
    }
}

function handleEventBattle(){
    var i;
    setInterval(function(){
        var battle_btn_wrapper = getXPATH('//*[@id="first_action_box"]');
        if (battle_btn_wrapper){
            if (getComputedStyle(battle_btn_wrapper) .getPropertyValue("display")!="none"){
                var battle_btn = getXPATH('//*[@id="do_battle_btn"]');
                if (getComputedStyle(battle_btn) .getPropertyValue("display")!="none"){
                    clickSth(battle_btn, "click");
                } else          {
                    var ok = getXPATH("//*[@id=\"bp_recovery\"]/div/div[2]");
                    var ele = getXPATH("//*[@id=\"bp_recovery\"]/ul/li[2]/div[1]");
                    if (!ele || ele.dataset.life == 0) {
                        ele = getXPATH("//*[@id=\"bp_recovery\"]/ul/li[1]/div[1]");
                    }
                    if (ele && ele.dataset.life >= 1){
                        
                        clickSth(ele,"click");
                        setTimeout(function(){clickSth(ok,"click");}, 1000);
                    }
                }
            }
        } 
    }, 2000);
    
    setInterval(function(){
        var res_wrapper = getXPATH("//*[@id=\"second_action_box\"]");
        if (res_wrapper && getComputedStyle(res_wrapper) .getPropertyValue("display")!="none"){
            var result = getXPATH("//*[@id=\"battle_result_btn\"]/a");
            if (result) {clickSth(result, "click");}
        }
    }, 1000);
    
    setInterval(function(){
        var ff = getXPATH("//*[@id=\"stage_front\"]");
        if (ff && getComputedStyle(ff) .getPropertyValue("display")!="none") {clickSth(ff, "click");}
    }, 1000);
}
//http://sp.pf.mbga.jp/12011538?url=http%3A%2F%2Fmhunter.forgroove.com%2FeventRaidBoss%2FRaidBossTop%2F%3FuserRaidbossId%3D141239245%26isHelpUser%3D1
//http://sp.pf.mbga.jp/12011538?url=http%3A%2F%2Fmhunter.forgroove.com%2FitemBox%2FGachaItemList%2F%3FitemManageId%3D3
//http://sp.pf.mbga.jp/12011538?url=http%3A%2F%2Fmhunter.forgroove.com%2FeventCollection%2FRaidBossTop%2F%3FmissionId%3D1
//http://sp.pf.mbga.jp/12011538?url=http%3A%2F%2Fmhunter.forgroove.com%2FeventCollection%2FRaidBossBattleResult%2F%3F
//historyId%3D132067221%26userRaidbossDefeatLogId%3D158357577%26userRaidbossId%3D165736712%26sentHelpFlg%3D0%26addEventPoint%3D2940%26winEventPoint%3D240%26itemEventPoint%3D1500%26attackEventPoint%3D1200%26getEventItem%3D663%26isEventPointOnly%3D1%26specialRewardHistory%3D%26winFlg%3D1%26isFever%3D0%26isMultiRaid%3D0
//http://sp.pf.mbga.jp/12011538?url=http%3A%2F%2Fmhunter.forgroove.com%2FeventCollection%2FRaidBossBattleResult%2F%3FuserRaidbossDefeatLogId%3D158351315
//http://sp.pf.mbga.jp/12011538?url=http%3A%2F%2Fmhunter.forgroove.com%2FeventRaidBoss%2FEventTop
function handleEvent(){
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
function handleEventRaid(){
    var boss_info = getXPATH("//*[@id=\"main\"]/*[@class='subtitle raidboss_status']");
    var boss_n, boss_lvl;
    var wait = 2000;
    var back_xpath;
    //debugger;
    if (url.match(/%2FraidBoss%2F/)) {
        back_xpath = '//a[text()="クエストに戻る"]';
    } else {
        back_xpath = xpatheventnext;
    }
    if (boss_info) {
        //alert(boss_info.innerText);
        var res = boss_info.innerText.match(/(\S+)[\s\S]*Lv([0-9]+)/);
        if (res) {
            boss_n =res[1];
            boss_lvl= res[2];
        } else {
            boss_n = boss_info.innerText;
            boss_lvl = 0;
        }
    }//*[@id="raidboss_hp"]/div/div/div[2]/div[2]
    var hp_gauge=getXPATH('//div[contains(@class, "bosshp")]/div[contains(@style, "100")]');
    var help_record = getXPATH('//*[@id="user_conf_info"]/a//div[contains(@class,"tactical_situation_detail") and contains(text(), "ヴィルさんの攻撃")]');
    var last_attack = getXPATH('//*[@id="user_conf_info"]/a//div[contains(@class,"tactical_situation_detail")]');
    var bp_need, bp_need_cookie;
    if (!hp_gauge && !getXPATH('//dl/dd[1]/a[text()="ヴィル"]')) { //document.URL.match(/isHelpUser/) || document.URL.match(/sentHelpFlg%3D0/)){
        //alert("HELP!");
        bp_need = 1;
        if (help_record){
            //alert("FOUND");
            //clickA('//a[contains(text(), "他の仲間を助けよう！！")]');
            //clickA('//div[@class="event_help_button"]//a');
            clickA(xpathmypage);
            return;
        }
    } else {
        bp_need_cookie = getCookie("__my_boss_"+boss_n);
        if (!bp_need_cookie) {
            bp_need_cookie = 1;
            bp_need = 1;
        } else if (bp_need_cookie < 0) {
            if (hp_gauge) {
                bp_need = 3;
            } else {
                bp_need = 1;
            }
        } else {
            bp_need = bp_need_cookie;
        }
        bp_need = 1;
        
        if (!hp_gauge) {
            var metBoss = getCookie("__ht_event_boss_" + boss_n + "lv" + boss_lvl);
            if (!metBoss){
                if (bp_need_cookie >0 && bp_need_cookie < 3) {
                    bp_need_cookie ++;
                } else {
                    //alert(boss_n);
                    bp_need_cookie = -1;
                }
                setCookie("__my_boss_"+boss_n, bp_need_cookie, 3600*24);
            }
            setCookie("__ht_event_boss_" + boss_n + "lv" + boss_lvl, 1, 60*10);
            if (last_attack && last_attack.innerText.match(/ヴィルさんの攻撃/)){
                //clickA(back_xpath);
                var succ = false;
                succ = succ || clickA('//a[contains(text(), "他の仲間を助けよう！！")]');
                setCookie("__ht_myboss_wait", 1, 300);
                succ = succ || clickA(xpathmypage);
                //clickA('//div[@class="event_help_button"]//a'); // no bp for boss
            }
            bp_need = 1;
            //alert("long_wait");
            var countdown = getXPATH('//*[@id="stage"]//span[@class="countdown"]');
            var time_left;
            if (countdown) {
                time_left = countdown.dataset.end_unixtime - Date.now()/1000;
            }
            if (time_left > 60*10) {
                //wait = 5 * 60 * 1000;
                wait = 10000;
            } else {
                wait = 10000;
            }
        }//else {
        //   alert('hp gauge full');
        //}
    } 
    
    
    
    var i;
    setInterval(function(){
        //var countdown = getXPATH('//*[@id="stage"]//span[@class="countdown"]');
        //if (!countdown || Date.now()/1000 > countdown.dataset.end_unixtime)
        //{
        //    clickA(back_xpath);
        //    return;
        //}
        var attack = getXPATH("//*[@id=\"bp_attack\"]/div["+bp_need+"]/div[3]");
        //debugger;
        if (attack && getComputedStyle(attack) .getPropertyValue("display")!="none") {clickSth(attack, "click");}
    }, wait);
    
    //setInterval(function(){
    //    var res_wrapper = getXPATH("//*[@id=\"second_action_box\"]");
    //    if (res_wrapper && getComputedStyle(res_wrapper) .getPropertyValue("display")!="none"){
    //        var result = getXPATH("//*[@id=\"battle_result_btn\"]/a");
    //        if (result) {clickSth(result, "click");}
    //    }
    //}, 1000);
    
    setInterval(function(){
        var ff = getXPATH("//*[@id=\"stage_front\"]");
        if (ff && getComputedStyle(ff) .getPropertyValue("display")!="none") {clickSth(ff, "click");}
    }, 5000);
    
    setInterval(function(){
        //alert("restore");
        var bp_now = 0;
        var battle_bp = [];
        for ( i = 1; i <=3; i++) {
            battle_bp[i] = getXPATH("//*[@id=\"bp_attack\"]/div[" + i + ']/div[contains(@class, "btn_main_small")]');
            if (battle_bp[i] && getComputedStyle(battle_bp[i]) .getPropertyValue("display")!= "none") {
                bp_now ++;
            }
        }
        if (bp_now < bp_need)
        {
            //debugger;
            var gap = bp_need - bp_now;
            var ele, ele_s;
            var ok = getXPATH("//*[@id=\"bp_recovery\"]/div/div[text()=\"OK\"]");//*[@id="bp_recovery"]/div/div[2]
            if (gap >= 3) {
                ele = getXPATH("//*[@id=\"bp_recovery\"]//ul/li[1]/div/div[contains(@class, 'bp_recovery_btn')]");
                if (ele &&  ele.dataset.life > 0) {
                    clickSth(ele,"click");
                    setTimeout(function(){clickSth(ok,"click");}, 1000);
                }
            }
            if (gap < 3 || !ele || ele.dataset.life == 0) {
                ele_s = getXPATH("//*[@id=\"bp_recovery\"]//ul/li[2]/div/div[contains(@class, 'bp_recovery_btn')]");
                ele = getXPATH("//*[@id=\"bp_recovery\"]//ul/li[1]/div/div[contains(@class, 'bp_recovery_btn')]");
                if (ele_s && ele_s.dataset.life >= gap){
                    for (i=0 ; i < gap; i++){
                        clickSth(ele_s,"click");
                    }
                    setTimeout(function(){clickSth(ok,"click");}, 1000);
                } else if (ele && ele.dataset.life > 0) {
                    clickSth(ele,"click");
                    setTimeout(function(){clickSth(ok,"click");}, 1000);
                } else {
                    var no_bp_candy = getCookie("__ht_no_bp");
                    if (no_bp_candy) {
                        no_bp_candy ++;
                    } else {
                        no_bp_candy = 1;
                    }
                    setCookie("__ht_no_bp", no_bp_candy, 60*10);
                    //clickA(xpathgiftbox);
                }
                
            }
        }
    }, 2000);
}

//function handleBattleTargetSelect(){
//    var min = 10000, minid;
    //'//*[@id="main"]/section/ul/li[1]/a//table/tbody/tr[2]/td'
//}

function handleFusionCard(){
    if (getXPATH('//div[contains(text(), "選択可能なカードがありません")]')) {
        clickA(xpathmypage);
    } else {
        clickA('//a[text()="Nカード一括強化"]');
    }
}
function handleTeamBattle(){
    var wait = 2000,
        bp_need = 1,
        i,
        attacked = false;
    setInterval(function(){
        attacked = attacked || clickA('//*[@id="do_battle_btn" and not(@style="display:none")]/a');
    }, wait);
    
    //setInterval(function(){
    //    var res_wrapper = getXPATH("//*[@id=\"second_action_box\"]");
    //    if (res_wrapper && getComputedStyle(res_wrapper) .getPropertyValue("display")!="none"){
    //        var result = getXPATH("//*[@id=\"battle_result_btn\"]/a");
    //        if (result) {clickSth(result, "click");}
    //    }
    //}, 1000);
    
    //setInterval(function(){
    //    var ff = getXPATH("//*[@id=\"stage_front\"]");
    //    if (ff && getComputedStyle(ff) .getPropertyValue("display")!="none") {clickSth(ff, "click");}
    //}, 5000);
    setInterval(function(){
    if (getXPATH('//*[@id="do_battle_btn" and @style="display:none"]')) {
        var ele, ele_s;
        var ok = getXPATH('//*[@id="bp_recovery"]/div/div[2]');//"//*[@id=\"bp_recovery\"]/div/div[2]");
        ele_s = getXPATH("//*[@id=\"bp_recovery\"]/ul/li[2]/di/v[contains(@class, 'btn_main_small')]");
        ele = getXPATH("//*[@id=\"bp_recovery\"]/ul/li[1]/div[contains(@class, 'btn_main_small')]");
        if (ele_s && ele_s.dataset.life > 0){
            clickSth(ele_s,"click");
            setTimeout(function(){clickSth(ok,"click");}, 1000);
        } else if (ele && ele.dataset.life > 0) {
            clickSth(ele,"click");
            setTimeout(function(){clickSth(ok,"click");}, 1000);
        } else {
            clickA(xpathgiftbox);
        }
    }
    }, 2000);
}
function handleERBBattle(){
    var wait = 2000,
        bp_need = 1,
        i,
        attacked = false;
    //debugger;
    setInterval(function(){
        //attacked = attacked || clickAV('//*[@id="skip_battle_btn"]', '//*[@id="skip_battle_btn"]/div/a');
        //attacked = attacked || 
		clickSth(getXPATH('//*[@id="do_battle_btn" and not(@style="display:none")]'),"click");
    }, wait);
    
    //setInterval(function(){
    //    var res_wrapper = getXPATH("//*[@id=\"second_action_box\"]");
    //    if (res_wrapper && getComputedStyle(res_wrapper) .getPropertyValue("display")!="none"){
    //        var result = getXPATH("//*[@id=\"battle_result_btn\"]/a");
    //        if (result) {clickSth(result, "click");}
    //    }
    //}, 1000);
    
    setInterval(function(){
        var ff = getXPATH("//*[@id=\"stage_front\"]");
        if (ff && getComputedStyle(ff) .getPropertyValue("display")!="none") {clickSth(ff, "click");}
    }, 5000);
    setInterval(function(){
    if (getXPATH('//*[@id="do_battle_btn" and @style="display:none"]')) {
        //debugger;
        var ele, ele_s;//*[@id="bp_recovery"]/div/div[2]
        var ok = getXPATH('//*[@id="bp_recovery"]/div/div[text()="OK"]');//"//*[@id=\"bp_recovery\"]/div/div[2]");
        ele_s = getXPATH("//*[@id=\"bp_recovery\"]//ul/li[2]/div/div[contains(@class, 'bp_recovery_btn')]");
        ele = getXPATH("//*[@id=\"bp_recovery\"]//ul/li[1]/div/div[contains(@class, 'bp_recovery_btn')]");
        if (ele_s && ele_s.dataset.life > 0){
            clickSth(ele_s,"click");
            setTimeout(function(){clickSth(ok,"click");}, 1000);
        } else if (ele && ele.dataset.life > 0) {
            clickSth(ele,"click");
            setTimeout(function(){clickSth(ok,"click");}, 1000);
        } else {
            //clickA(xpathgiftbox);
        }
    }
    }, 2000);
}
//http://sp.pf.mbga.jp/12011538?url=http%3A%2F%2Fmhunter.forgroove.com%2FeventSurvival%2FBattleResult%3FhistoryId%3D1019502%26getMoney%3D2600%26addEventPoint%3D669%26_timestamp%3D1376098213654
//http://sp.pf.mbga.jp/12011538?url=http%3A%2F%2Fmhunter.forgroove.com%2FeventSurvival%2FMissionResult%3FhistoryId%3D2624521
//http://sp.pf.mbga.jp/12011538?url=http%3A%2F%2Fmhunter.forgroove.com%2FeventSurvival%2FBattleResult%3FhistoryId%3D1027476%26getMoney%3D2700%26addEventPoint%3D673%26_timestamp%3D1376098473724/
//http://sp.pf.mbga.jp/12011538?url=http%3A%2F%2Fmhunter.forgroove.com%2FeventSurvival%2FEventTop
//http://sp.pf.mbga.jp/12011538?url=http%3A%2F%2Fmhunter.forgroove.com%2FeventSurvival%2FBattleConf
//http://sp.pf.mbga.jp/12011538?url=http%3A%2F%2Fmhunter.forgroove.com%2FeventStoryMission%2FEventTop
//http://sp.pf.mbga.jp/12011538?url=http%3A%2F%2Fmhunter.forgroove.com%2FeventStoryMission%2FEventTop
//http://sp.pf.mbga.jp/12011538?url=http%3A%2F%2Fmhunter.forgroove.com%2FeventStoryMission%2FEventTop
//http://sp.pf.mbga.jp/12011538?url=http%3A%2F%2Fmhunter.forgroove.com%2FeventStoryMission%2FMissionResult%2F%3FautoSellFlg%3D0%26recoveryPoint%3D%26firstCardGetFlg%3D%26firstFairyHitFlg%3D%26firstBattleCostFlg%3D%26firstTreasureDropFlg%3D%26missionId%3D478%26attackBefore%3D0%26defenceBefore%3D0%26turnEndType%3D10%26recoverMaxFlg%3D%26recoveryPercent%3D%26firstTournamentFlg%3D%26addEventPoint%3D62
//http://sp.pf.mbga.jp/12011538?url=http%3A%2F%2Fmhunter.forgroove.com%2FeventStoryMission%2FRescueList%2F%3FrescueId%3D784510
var actions =[
    [/apology%2FApologyList%2F/, 'form', '//*[@id="main"]/div[1]/ul/li/form'],
    [/battleOlympia%2FBattleConf%2F/, 'a', '//a[contains(text(), "対戦結果を見る")]'],
    [/battleOlympia%2FBattleResult%2F%/, 'a', '//a[text()="次の相手"]'],
    [/battleOlympia%2FTargetSelect%2F/, 'minmax', '//*[@id="main"]/section/ul/li[', ']/a/div/div[2]/table/tbody/tr[2]/td', ']/a'],
    [/battleOlympia%2FTop/, 'list', [
        ['a', '//div[@class="battle_entry"]/a'],
        ['setCookie', '__ht_bo_over', 1, 3600*24]]],
    [/battleTower%2FBattleConf%2F/, "func", handleBattleTower],
    [/battleTower%2FBattleResult%2F/,"func", handleBattleResult],
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
    [/cave%2FQuestResult%2F/, 'a', '//a[@text="トレハンTOP"]'],
    [/companion%2FCompanionApprovalList%2F/, "form", "//*[@id=\"wrap_object\"]/div[1]/div/form"],
    [/CompanionApplicationAccept$/, "form", "//*[@id=\"main\"]/section/div/form"],
    //[/eventCollection%2FRaidBossBattleResult\b/, 'list', [
    //    ['a', '//a[contains(text(), "撃破者にあいさつする")]'],
    //    ['a', '//p[@class="block_flex btn_base radius"]/a']]],
    [/eventCollection%2FEventTop/, 'list', [
        ['aNC', '__myraid_clear', '//a[contains(@href, "RaidBossAssistList")]'],
        ['a', '//a[contains(@href,"eventCollection%2FDoMissionExecutionCheck")]'],
        ['hold']]], //@class="block_flex btn_base radius"]/a'],
    [/eventCollection%2FMissionResult%2F/, 'list', [
        ['aNC', '__ht_myboss_wait', '//a[contains(@href, "eventCollection%2FRaidbossTop")]'],
        ['a', '//a[contains(@href,"eventCollection%2FDoMissionExecutionCheck")]'],
        ['hold']]],
    [/eventCollection%2FRaidBossBattleResult/, 'list', [
        ['a', '//a[contains(@href,"eventCollection%2FDoMissionExecutionCheck")]'],
        ['hold']]],
        //'func', handleEvent], //'//p[@class="block_flex btn_base radius"]/a'],
    //[/eventRaidBoss%2FEventBattleConf/, 'list', [
    //    ['av', '//*[@id="skip_battle_btn"][div/a]', '//*[@id="skip_battle_btn"]/div/a'],
    //    //['dbg'],
    //    ['func', handleERBBattle]]],
    //[/eventRaidBoss%2FEventBattleResult/, 'list', [
    //    ['a', '//a[text()="餌を探す"]'],
    //    ['a', '//a[div[@id="btn_quest_fever"]]'],
    //    ['hold']]], 
    //[/eventRaidBoss%2FEventTop/, 'list', [
    //    ['a', '//*[@id="main"]/div[2]/p/a']]],
    //[/eventRaidBoss%2FMissionResult%2F/, 'list', [ //'func', handleEvent],
    //    ['a', '//div[@class="btn_help_wrap"]/a'],
    //    ['a', '//a[.//*[contains(text(), "逃亡まで")]]'],
    //    ['a', '//a[text()="餌を探す"]'],
    //    ['a', '//a[div[@id="btn_quest_fever"]]'],
    //    ['a', '//a[text()="対戦相手と戦う"]'],
    //    ['hold']]],
    //[/eventRaidBoss%2FRaidBossBattleResult/, 'list', [
    //    ['a', '//a[contains(text(), "撃破者にあいさつする")]'],
    //    ['a', '//a[contains(text(), "ヘルプ一覧")]'],
    //    ['a', '//a[text()="餌を探す"]'],
    //    ['a', '//a[div[@id="btn_quest_fever"]]'],
    //    ['hold']]],
    //    ['func', handleEvent]]],
    //[/eventSelection%2FBattleConf/, 'func', handleERBBattle],
    //[/eventSelection%2FEventTop/, 'list', [
    //    ['a', '//a[contains(@href, "eventSelection%2FDoMissionExecutionCheck")]'],
    //    ['a', '//a[contains(@href, "eventSelection%2FRaidBossTop")]'],
    //    ['hold']]],
    //[/eventSelection%2FMissionResult/, 'a', '//*[@id="go"]/a'],
    //[/eventSelection%2FSelectTarget/, 'minmax', 
    //    '//*[@id="main"]/section[1]/ul/li[', ']/a/div/div[2]/table/tbody/tr[3]/td',
    //    ']/a'],

    //http://sp.pf.mbga.jp/12011538?url=http%3A%2F%2Fmhunter.forgroove.com%2FeventStoryMission%2FEventBattleResult%2F%3FhistoryId%3D31544057%26matchingId%3D0%26getRewardItemId%3D%26addEventPoint%3D100
    //http://sp.pf.mbga.jp/12011538?url=http%3A%2F%2Fmhunter.forgroove.com%2FeventStoryMission%2FRaidBossBattleResult%2F%3FhistoryId%3D216333568%26userRaidbossDefeatLogId%3D200389035%26userRaidbossId%3D208829328%26sentHelpFlg%3D0%26addEventPoint%3D500%26isMultiRaid%3D0
    //http://sp.pf.mbga.jp/12011538?url=http%3A%2F%2Fmhunter.forgroove.com%2FeventSelection%2FRaidBossTop
    //http://sp.pf.mbga.jp/12011538?url=http%3A%2F%2Fmhunter.forgroove.com%2FeventStoryMission%2FMissionList
    [/eventStoryMission%2FEventBattleConf/, 'list', [
        ['a', '//*[@id="skip_battle_btn"]/div/a'],
        ['func', handleERBBattle],
        ['hold']]],
    [/eventStoryMission%2FEventBattleResult/, 'list', [
        ['a', '//a[contains(@href, "eventStoryMission%2FMissionList")]'],
        ['a', '//a[contains(@href, "eventStoryMission%2FDoMissionExecutionCheck")]'],
        ['hold']
        ]],
    [/eventStoryMission%2FMissionList/, 'list', [
        ['a', '//a[contains(@href, "eventStoryMission%2FDoMissionExecutionCheck")]'],
        ['hold']
        ]],
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
        ['hold']
        ]],
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
		['hold']]],
	[/eventSurvival%2FMissionResult/, 'a', '//*[@id="go"]/a'],
    [/event[a-zA-Z]*%2FRaidBossTop/, 'func', handleEventRaid],
    [/fusion%2FBulkFusionConfirm%2F/, 'form', '//*[@id="main"]/div[@class="section_sub"]/form'],
    [/fusion%2FFusionEnd%2F/, "func", handleFusionEnd],
    //[/fusion%2FFusionTop/, 'func', handleFusionCard], //],
    [/fusion%2FMaterialFusionTop/, "func", handleFusionResult],
    [/fusion%2FMaterialFusionConfirm%2F/, "form", '//*[@id=\"main\"]/div[@class="section_sub"]/form'],
    [/gacha%2FGachaCharacterCoinTop/, 'a', '//a[contains(text(),"ガチャをする")]'],
    [/gacha%2FGachaCoinTop%2F/, 'a',  '(//a[contains(text(), "ガチャをする")])[last()]'],
    [/gacha%2FGachaFlash%2F/, 'a', '//a[text()="マイページへ"]'],
    //[/gacha%2FGachaResult%2F/, "func", handleCoinGacha],
    [/gacha%2FGachaResult%2F%3FgachaThemeId%3D3%26themeId%3D3/, 'list', [
        ['a', '//a[contains(@href, "skipFlg%3D1")]'], //''//a[text()="バトルをスキップしてガチャをする"]'],
        ['a', '//a[contains(@href, "prizeReceive%2FPrizeReceiveTop%2F")]']]], //text()="贈り物BOX"]']]],
    [/gacha%2FGachaResult%2F%3FgachaId%3D/, "a", '(//a[@class="btn_main_large" and contains(text(), "ガチャ")])[last()]'],
    [/gacha%2FGachaSwf%2F/, 'flash', "//*[@id=\"container\"]", 372,62],
    //[/gacha%2FGachaTop%2F%3FthemeId%3D2/, 'a', '(//a[contains(text(), "ガチャをする")])[last()]'],
    [/gacha%2FGachaTop(%2F)?%3FthemeId%3D2/, 'a', '(//a[@class="btn_main_large" and contains(text(), "ガチャ")])[last()]'],
    [/gacha%2FGachaTop(%2F)?%3FthemeId%3D3/, 'a', '//a[contains(@href, "skipFlg%3D1")]'], //text(), "ガチャをする")])[last()]'],
    //[/gacha%2FGachaTop(%2F)?%3FthemeId%3D3/, "a", "//*[@id=\"main\"]/section[1]/div[2]/div/ul/li[2]/a"],
    [/itemBox%2FGachaItemList%2F/, 'a', '//a[text()="ガチャをする"]'],
    [/mission%2FQuestResult/, "a", "//*[@id=\"main\"]/div[6]/a"],
    [/mission%2FMissionResult%2F/, "func", handleMissionResult],
    [/mission%2FMissionList/, "func", handleMissionList],
    [/mission%2FMissionSwf%2F/, 'flash',"//*[@id=\"container\"]", 372,62],
    [/mission%2FBossAppear/, "form", "//*[@id=\"main\"]/div[3]/form"],
    [/mission%2FBossBattleResult%2F/, "a", "//*[@id=\"to_latest_mission\"]/a"],
    [/mypage%2FGreetEnd%2F/, 'a', xpathmypage],
    [/mypage%2FIndex/,  "func", handlemypage],
    [/mypage%2FLoginBonusSpecial%2F/, 'a', "//div[contains(@class, 'btn_present')]/a"],
    [/prizeReceive%2FPrizeReceiveTop/, 'list', [
        ['a', '//a[text()="売却する"]'],
        ['form', "//*[@id=\"main\"]/div[2]/div/form"],
        ['a', "//a[span[@class='badge fnt_normal']]"]]],
    [/questRaidBoss%2FQuestDeck%2F/, 'list', [
        ['form', '//*[@id="deck_box"]//form'],
        ['a', '//a[contains(text(),"敵と戦う")]'],
        ['a', '//a[contains(text(),"ステージへ進む")]'],
        ['hold']]],
    [/questRaidBoss%2FQuestDetail/, 'a', '//a[text()="このステージをはじめる！"]'],
    [/questRaidBoss%2FQuestEvent/, 'a','//a[text()="先へ進む"]'], 
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
    [/QuestEnd/ , "a", "//*[@id=\"main_container\"]/header/div[2]/a"],
    [/CompanionApplicationAcceptEnd/ , "a", "//*[@id=\"main_container\"]/header/div[2]/a"],
    [/EvolutionConfirm/,"form", "//*[@id=\"main\"]/div[2]/div[4]/div/form"],
    //[/eventBattle%2FEventBattleConf%3F/, 'func', handleEventBattle],
    //[/eventBattle%2FEventBattleResult%3F/, 'a', '//a[contains(text(), "相手を探す")]'],
    //[/eventBattle%2FMissionResult%2F/, 'func', handleEventRes],
    //[/eventBattle%2FMissionSwf%2F/, 'flash', "//*[@id=\"container\"]", 372,62],
    [/FusionFlash/, "flash", "//*[@id=\"container\"]"],
    [/%2FMissionSwf%2F/, 'flash', "//*[@id=\"container\"]", 372,62],
    [/Swf\b/, "flash", "//*[@id=\"container\"]"],
    [/xxxxxxxxxxxxxxxxx/]
];

