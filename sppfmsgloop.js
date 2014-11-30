function msgloop(actions){
var i, j;
var list_action;
GM_log(Date() + url);
GM_log("REF: " + document.referrer);
var succ = (function () {
        return false;
		var sites = [
            ["http://sp.pf.mbga.jp/12010455?url=http%3A%2F%2Fmguildbattle.croozsocial.jp%2Fmypage%2FIndex%2F", 5], // avalon
            ["http://sp.pf.mbga.jp/12011538?url=http%3A%2F%2Fmhunter.forgroove.com%2Fmypage%2FIndex",          5], // hunter
            ["http://sp.pf.mbga.jp/12008490?url=http%3A%2F%2Fmragnarok.croozsocial.jp%2Fmypage%2FIndex",       5], //ragnarok
            ["http://sp.pf.mbga.jp/12011562?guid=ON&url=http%3A%2F%2Ftoaru-index.heroz.jp%2Fmypage",           5], // to aru
            ["http://sp.pf.mbga.jp/12012329?url=http%3A%2F%2Fmdrabre.croozsocial.jp%2Fmypage%2FIndex",         5]
        ];
        //debugger;
        var siteI = +(getCookie("site_loop_index") || 0);
        var siteT = +(getCookie("site_timeout") || (Date.now() - 10));
        GM_log(siteI + " -:- " + new Date(+siteT));
        //GM_log("Now :" + new Date(Date.now()));
        if (Date.now() > siteT) {
            siteI = (siteI + 1) % sites.length;
            siteT = Date.now() + 60 * 1000 * sites[siteI][1];
            setCookie("site_loop_index", siteI, 60 * 60 * 24 * 7);
            setCookie("site_timeout", siteT, 60 * 60 * 24 * 7);
            //debugger;
            window.location.href = sites[siteI][0];
            return true;
        }
        return false;
    }());
for (i = 0; i < actions.length; i++) {
    if (url.match(actions[i][0])) {
        GM_log(actions[i][0]);
        if (actions[i][1] === 'list') {
            list_action = actions[i][2];
        } else {
            list_action = [actions[i].slice(1, actions[i].length)];
        }
        var ele;
        for (j = 0; j < list_action.length; j++) {
            if (succ) {
                break;
            }
            switch (list_action[j][0]) {
            case "a":
                succ = succ || clickA(list_action[j][1]);
                break;
            case 'av':
                succ = succ || clickAV(list_action[j][1], list_action[j][2]);
                break;
            case 'aNC':
                if (!succ) {
                    var CCC = getCookie(list_action[j][1]);
                    if (!CCC) {
                        succ = clickA(list_action[j][2]);
                    }
                }
                break;
            case 'sth':
                if (!succ) {clickS(list_action[j][1]); }
                succ = true;
                break;
            case 'flash':
                succ = succ || clickFlash(list_action[j][1], list_action[j][2], list_action[j][3]);
                break;
            case 'func':
                if (!succ) {
                    list_action[j][1]();
                }
                succ = true;
                break;
            case 'funcR':
                succ = succ || list_action[j][1]();
                break;
            case 'form':
                succ = succ || clickForm(list_action[j][1]);
                break;
            case 'formN':
                succ = succ || clickForm(list_action[j][1], true);
                break;
            case 'setCookie':
                if (!succ) {setCookie(list_action[j][1], list_action[j][2], list_action[j][3]); }
                break;
            case 'hold':
                succ = true;
                break;
            case 'minmax':
                succ = succ || clickMinMax(list_action[j][1], list_action[j][2], list_action[j][3], list_action[j][4]);
                break;
            case 'link':
                if (!succ) {window.location.href = list_action[j][1]; }
                succ = true;
                break;
            case 'aJ':
                succ = $(list_action[j][1]).clickJ().length > 0;
                break;
            case 'aJP':
                $(list_action[j][1]).clickJ();
                break;
            case 'aJV':
                succ = $(list_action[j][1]).filter(':first').filter(':visible').click().length > 0;
                break;
            case 'formJ':
                succ = $(list_action[j][1]).submitJ().length > 0;
                break;
            case 'flashJ':
                succ = $(list_action[j][1]).clickFlash().length > 0;
                break;
            case 'flashJT':
                succ = $(list_action[j][1]).touchFlash().clickFlash().length > 0;
                break;
            case 'dbg':
                if (!succ) {debugger; }
                break;
            case 'reload':
                if (!succ) {reload_page(list_action[j][1]); /*setTimeout(function () {location.reload(true); }, list_action[j][1]);*/ }
                succ = true;
                break;
            default:
                alert("msgloop - unknown msg - " + list_action[j][0]);
                break;
            }
        }
        succ = succ || clickA(xpathmypage);
        break;
    }
}

//setTimeout(function () {location.reload(true); }, 600000);
reload_page(120000);
};
