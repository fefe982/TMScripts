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
        for (j = 0; j < list_action.length; j++){
            if (list_action[j][0] == "a") {
                succ = succ || clickA(list_action[j][1]);
            } else if (list_action[j][0] == "av") {
                succ = succ || clickAV(list_action[j][1], list_action[j][2]);
            } else if (list_action[j][0] == "aNC") {
                if (succ) {
                    var CCC = getCookie(list_action[j][1]);
                    if (!CCC) {
                        succ = clickA(list_action[j][2]);
                    }
                }
            } else if (list_action[j][0] == "sth") {
                if (!succ) clickS(list_action[j][1]);
                succ = true;
                break;
            } else if (list_action[j][0] == "flash") {
                succ = succ || clickFlash(list_action[j][1] , list_action[j][2] , list_action[j][3] );
                //succ = true;
                break;
            } else if (list_action[j][0] == "func") {
                if (!succ) {
                    list_action[j][1]();
                }
                succ = true;
                break;
            } else if (list_action[j][0] == "form") {
                //alert("oops");
                succ = succ || clickForm(list_action[j][1]);
            } else if (list_action[j][0] == "formN") {
                succ = succ || clickForm(list_action[j][1], true);
            } else if (list_action[j][0] == "setCookie"){
                if (!succ) {setCookie(list_action[j][1], list_action[j][2], list_action[j][3]);}
            } else if (list_action[j][0] == "hold") {
                succ = true;
            } else if (list_action[j][0] == "minmax") {
                succ = succ || clickMinMax(list_action[j][1], list_action[j][2], list_action[j][3], list_action[j][4]);
            } else if (list_action[j][0] == 'link') {
                //alert(list_action[j][1]);
                if (!succ) window.location.href = list_action[j][1];
                succ = true;
            } else if (list_action[j][0] == 'dbg') {
                if (!succ) debugger;
            } else if (list_action[j][0] == 'reload') {
                if (!succ) setTimeout(function(){location.reload(true);}, list_action[j][1]);
                succ = true;
            } else {
                alert("msgloop - unknown msg - " + list_action[j][0]);
            }
        }
        succ = succ || clickA(xpathmypage);
        break;
    }
}


