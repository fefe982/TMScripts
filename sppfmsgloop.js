var i, j;
var list_action;
GM_log(url);
for (i=0; i<actions.length; i++) {
    if (url.match(actions[i][0])) {
        GM_log(actions[i][0]);
        if (actions[i][1] == 'list') {
            list_action = actions[i][2];
        } else {
            list_action = [actions[i].slice(1, actions[i].length)];
        }
        var succ = false;
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
                if (succ) {
                    var CCC = getCookie(list_action[j][1]);
                    if (!CCC) {
                        succ = clickA(list_action[j][2]);
                    }
                }
                break;
            case 'sth':
                if (!succ) {clickS(list_action[j][1]);}
                succ = true;
                break;
            case 'flash':
                succ = succ || clickFlash(list_action[j][1] , list_action[j][2] , list_action[j][3] );
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
                if (!succ) {setCookie(list_action[j][1], list_action[j][2], list_action[j][3]);}
                break;
            case 'hold':
                succ = true;
                break;
            case 'minmax':
                succ = succ || clickMinMax(list_action[j][1], list_action[j][2], list_action[j][3], list_action[j][4]);
                break;
            case 'link':
                if (!succ) {window.location.href = list_action[j][1];}
                succ = true;
                break;
            case 'dbg':
                if (!succ) {debugger;}
                break;
            case 'reload':
                if (!succ) {setTimeout(function(){location.reload(true);}, list_action[j][1]);}
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

setTimeout(function(){location.reload(true);}, 600000);
