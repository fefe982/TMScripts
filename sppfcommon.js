
function getXPATH(xpath) {
    return document.evaluate(xpath, document, null, XPathResult.ANY_TYPE, null).iterateNext();
}

function getXPATHAll(xpath) {
    return document.evaluate(xpath, document, null, XPathResult.ANY_TYPE, null);
}


var eventMatchers = {
    'HTMLEvents': /^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/,
    'MouseEvents': /^(?:click|dblclick|mouse(?:down|up|over|move|out))$/
};
var defaultOptions = {
    pointerX: 0,
    pointerY: 0,
    button: 0,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false,
    bubbles: true,
    cancelable: true
};

function extend(destination, source) {
    var property;
    for (property in source) {
        if (source.hasOwnProperty(property)) {
            destination[property] = source[property];
        }
    }
    return destination;
}

function simulate(element, eventName, config) {
    var options = extend(defaultOptions, config || {});
    var oEvent, eventType = null;
    var name;
    for (name in eventMatchers) {
        if (eventMatchers.hasOwnProperty(name)) {
            if (eventMatchers[name].test(eventName)) { eventType = name; break; }
        }
    }

    if (!eventType) {
        throw new SyntaxError('Only HTMLEvents and MouseEvents interfaces are supported');
    }

    if (document.createEvent) {
        oEvent = document.createEvent(eventType);
        if (eventType === 'HTMLEvents') {
            oEvent.initEvent(eventName, options.bubbles, options.cancelable);
        } else {
            oEvent.initMouseEvent(eventName, options.bubbles, options.cancelable, document.defaultView,
                                  options.button, options.pointerX, options.pointerY, options.pointerX, options.pointerY,
                                  options.ctrlKey, options.altKey, options.shiftKey, options.metaKey, options.button, element);
        }
        element.dispatchEvent(oEvent);
    } else {
        options.clientX = options.pointerX;
        options.clientY = options.pointerY;
        var evt = document.createEventObject();
        oEvent = extend(evt, options);
        element.fireEvent('on' + eventName, oEvent);
    }
    return element;
}


function clickSth(obj, eventname, xoff, yoff) {
    var rect, x, y;
    if (!obj) {
	//debugger;
        return false;
    }
    if (obj.getBoundingClientRect) {
        rect = obj.getBoundingClientRect();
        x = xoff ? rect.left + xoff : (rect.left + rect.right) / 2;
        y = yoff ? rect.top + yoff : (rect.top + rect.bottom) / 2;
    } else {
        x = 0;
        y = 0;
    }
    if (document.createEvent && obj.dispatchEvent) {
        var event = document.createEvent("MouseEvents");
        event.initMouseEvent(eventname, true, true, window,
                             0, x, y, x, y,
                             false, false, false, false,
                             0, obj);
        obj.dispatchEvent(event);
    } else if (obj.fireEvent) {
        obj.fireEvent("onclick");
    }
    return true;
}

function clickLink(link) {
    setTimeout(function () {
        var event = document.createEvent("MouseEvents");
        event.initMouseEvent("click", true, true, window,
                             0, 0, 0, 0, 0,
                             false, false, false, false,
                             0, null);
        var cancelled = !link.dispatchEvent(event);
        if (!cancelled) {
            window.location = link.href;
        }
    }, 2000);
}

$.fn.simMouseEvent = function (eveName, xoff, yoff) {
    var rect, x, y;
    if (this.length === 0) {
        return this;
    }
    if (this[0].getBoundingClientRect) {
        rect = this[0].getBoundingClientRect();
        x = xoff ? rect.left + xoff : (rect.left + rect.right) / 2;
        y = yoff ? rect.top + yoff : (rect.top + rect.bottom) / 2;
    } else {
        x = 0;
        y = 0;
    }
    var eve = document.createEvent("MouseEvents");
    eve.initMouseEvent(eveName, true, true, window,
                         0, x, y, x, y,
                         false, false, false, false,
                         0, this[0]);
    if (this[0].dispatchEvent(eve) && this[0].tagName === 'a') {
        window.location = this[0].href;
    }
    return this;
};
$.fn.simTouchEvent = function (eveName, xoff, yoff) {
    var rect, x, y;
    if (this.length === 0) {
        return this;
    }
    if (this[0].getBoundingClientRect) {
        rect = this[0].getBoundingClientRect();
        x = xoff ? rect.left + xoff : (rect.left + rect.right) / 2;
        y = yoff ? rect.top + yoff : (rect.top + rect.bottom) / 2;
    } else {
        x = 0;
        y = 0;
    }
    var eve = new CustomEvent(eveName);//document.createEvent("TouchEvent");
    this[0].dispatchEvent(eve);
    return this;
};

$.fn.clickJ = function (timeout) {
    if (this.length === 0) {
        return this;
    }
    if (timeout === 0) {
        this.simMouseEvent("click");
    } else {
        var jq = $(this);

        setTimeout(function () {
            jq.simMouseEvent("click");
        }, timeout || 1000);
    }
    return this;
};

$.fn.submitJ = function (timeout) {
    if (this.length === 0) {
        return this;
    }
    var jq = $(this);
    setTimeout(function () {
        jq.submit();
    }, timeout || 1000);
    return this;
};

$.fn.clickFlash = function (xoff, yoff) {
    //debugger;
    if (this.length === 0) {
        return this;
    }
    var flash = $(this);
    setInterval(function () {
        flash.simMouseEvent("mousedown", xoff, yoff);
        flash.simMouseEvent("mouseup", xoff, yoff);
        flash.simMouseEvent("click", xoff, yoff);
    }, 1000);
    return this;
};

$.fn.touchFlash = function (xoff, yoff) {
    if (this.length === 0) {
        return this;
    }
    var flash = $(this);
    setInterval(function () {
        flash.simTouchEvent("touchstart", xoff, yoff);
        flash.simTouchEvent("touchmove", xoff, yoff);
    }, 1000);
    return this;
};

var url = document.URL;

function clickA(xpath) {
    var a = getXPATH(xpath);
    if (a) {
        clickLink(a);
        return true;
    } //else {
    return false;
    //}
}

function clickAV(xpathw, xpatha) {
    var w = getXPATH(xpathw), a = getXPATH(xpatha);
    //debugger;
    if (w && a && getComputedStyle(w).getPropertyValue("display") !== "none") {clickLink(a, "click"); return true; }
    //else { return false;}
    return false;
}

function clickForm(xpath, nocheck) {
    var a = getXPATH(xpath);
    if (a && (nocheck || a.querySelectorAll("input").length > 0)) {
        setTimeout(function () {
            a.submit();
        }, 2000);
        return true;
    } //else {
    return false;
    //}
}
function clickS(xpath) {
    setInterval(function () {
        var a = getXPATH(xpath);
        if (a) {clickSth(a, "click"); }
    }, 1000);
}

function clickFlash(xpath, xoff, yoff) {
    //if (getXPATH(xpath))
    //{
    setInterval(function () {
        var canvas = getXPATH(xpath);
        if (canvas) {
            //clickSth(canvas,"mousemove",xoff,yoff);
            clickSth(canvas, "mousedown", xoff, yoff);
            //clickSth(canvas,"click",xoff,yoff);
            clickSth(canvas, "mouseup", xoff, yoff);
            clickSth(canvas, "click", xoff, yoff);
        }
    }, 1000);
    return true;
    //}
    //else
    //{
    //    return false;
    //}
}

function clickMinMax(xpath1, xpath2, xpath3, minmaxflag) {
    var minmax = 1000000, id = 0, i = 1, ele, nres, num;
    if (minmaxflag) {
        minmax = -minmax;
    }
    while (((ele = getXPATH(xpath1 + i + xpath2)) !== null) && getXPATH(xpath1 + i + xpath3)) {
        nres = ele.innerText.match(/([0-9]+)/);
        num = parseInt(nres[1], 10);
        if ((minmaxflag && num > minmax) || (!minmaxflag && num < minmax)) {
            minmax = num;
            id = i;
        }
        i += 1;
    }
    if (id > 0) {
        return clickA(xpath1 + id + xpath3);
    } //else {
    return false;
    //}
}

////////////
function setCookie(c_name, value, exsecs) {
    var exdate = new Date();
    exdate.setSeconds(exdate.getSeconds() + exsecs);
    var c_value = escape(value) + ((exsecs === null) ? "" : "; expires=" + exdate.toUTCString());
    document.cookie = c_name + "=" + c_value;
}
function getCookie(c_name) {
    var c_value = document.cookie;
    var c_start = c_value.indexOf(" " + c_name + "=");
    if (c_start === -1) {
        c_start = c_value.indexOf(c_name + "=");
    }
    if (c_start === -1) {
        c_value = null;
    } else {
        c_start = c_value.indexOf("=", c_start) + 1;
        var c_end = c_value.indexOf(";", c_start);
        if (c_end === -1) {
            c_end = c_value.length;
        }
        c_value = unescape(c_value.substring(c_start, c_end));
    }
    return c_value;
}

function reload_page(timeout) {
    setTimeout(function () {location.reload(true); }, timeout);
}
///////////

