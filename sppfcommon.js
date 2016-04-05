
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
        event.initMouseEvent(eventname, true, true, unsafeWindow,
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
        event.initMouseEvent("click", true, true, unsafeWindow,
                             0, 0, 0, 0, 0,
                             false, false, false, false,
                             0, null);
        var cancelled = !link.dispatchEvent(event);
        if (cancelled) {
            unsafeWindow.location.href = link.href;
        }
    }, 2000);
}

$.expr[':'].regex = function(elem, index, match) {
    var matchParams = match[3].split(','),
        validLabels = /^(data|css):/,
        attr = {
            method: matchParams[0].match(validLabels) ? 
                        matchParams[0].split(':')[0] : 'attr',
            property: matchParams.shift().replace(validLabels,'')
        },
        regexFlags = 'ig',
        regex = new RegExp(matchParams.join('').replace(/^\s+|\s+$/g,''), regexFlags);
    return regex.test(jQuery(elem)[attr.method](attr.property));
}

$.expr[':'].regexText = function(elem, index, match) {
	//GM_log(":" + elem.innerText + ":");
	//GM_log(elem.innerText.match(match[3]));
	//GM_log(match[3]);
	//GM_log((new RegExp(match[3])).test(elem.innerText));
	return (new RegExp(match[3])).test(elem.innerText);
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
    eve.initMouseEvent(eveName, true, true, unsafeWindow,
                         0, x, y, x, y,
                         false, false, false, false,
                         0, this[0]);
	//GM_log("sim mouse " + eveName);
    if (!this[0].dispatchEvent(eve) && eveName === "click" && this[0].tagName === 'A') {
		GM_log("click : "+ this[0].href);
        //unsafeWindow.location.href = this[0].href;
    }
    return this;
};
$.fn.simTouchEvent = function (eveName, xoff, yoff) {

	var customEvent;
 
	// check taget
    if (this.length === 0) {
        return this;
    }
    var rect, x, y;

    if (this[0].getBoundingClientRect) {
        rect = this[0].getBoundingClientRect();
        x = xoff ? rect.left + xoff : (rect.left + rect.right) / 2;
        y = yoff ? rect.top + yoff : (rect.top + rect.bottom) / 2;
    } else {
        x = 0;
        y = 0;
    }
	//if(eveName === 'touchstart' || eveName === 'touchmove') {
	//	if(touches.length === 0) {
	//		//Y.error('simulateTouchEvent(): No touch object in touches');
	//	}
	//} else if(eveName === 'touchend') {
	//	if(changedTouches.length === 0) {
	//		//Y.error('simulateTouchEvent(): No touch object in changedTouches');
	//	}
	//}
 
	// setup default values
	//if (!Y.Lang.isBoolean(bubbles)) { bubbles = true; } // bubble by default.
	//if (!Y.Lang.isBoolean(cancelable)) {
	//	cancelable = (type !== "touchcancel"); // touchcancel is not cancelled
	//}
	//if (!Y.Lang.isObject(view)) { view = Y.config.win; }
	//if (!Y.Lang.isNumber(detail)) { detail = 1; } // usually not used. defaulted to # of touch objects.
	//if (!Y.Lang.isNumber(screenX)) { screenX = 0; }
	//if (!Y.Lang.isNumber(screenY)) { screenY = 0; }
	//if (!Y.Lang.isNumber(clientX)) { clientX = 0; }
	//if (!Y.Lang.isNumber(clientY)) { clientY = 0; }
	//if (!Y.Lang.isBoolean(ctrlKey)) { ctrlKey = false; }
	//if (!Y.Lang.isBoolean(altKey)) { altKey = false; }
	//if (!Y.Lang.isBoolean(shiftKey)){ shiftKey = false; }
	//if (!Y.Lang.isBoolean(metaKey)) { metaKey = false; }
	//if (!Y.Lang.isNumber(scale)) { scale = 1.0; }
	//if (!Y.Lang.isNumber(rotation)) { rotation = 0.0; }
 
	//check for DOM-compliant browsers first
	
	//customEvent = Y.config.doc.createEvent("TouchEvent");
 
	// Andoroid isn't compliant W3C initTouchEvent method signature.
	//customEvent.initTouchEvent(touches, targetTouches, changedTouches,
	//type, view,
	//screenX, screenY, clientX, clientY,
	//ctrlKey, altKey, shiftKey, metaKey);
	//}
	
	var customEvent = document.createEvent("MouseEvent");
	customEvent.touches = [{clientX: x, clientY:y, pageX:x, pageY:y, screenX:x, screenY:y}];
 
	// Available iOS 2.0 and later
	customEvent.initMouseEvent(eveName, /*bubbles*/true, /*cancelable*/true, unsafeWindow/*view*/, /*detail*/1,
	x, y, x, y,
	false, false, false, false);
	//customEvent.createTouchList(
	//	customEvent.createTouch(unsafeWindow, this[0], 12345, x, y, x, y, x, y)));
	//new TouchList(), new TouchList(), new TouchList()
	//);
	//touches, targetTouches, changedTouches,
	//1.0, 0.0);
	
 
	//fire the event
	//target.dispatchEvent(customEvent);

    //var eve = new CustomEvent(eveName);//document.createEvent("TouchEvent");
    this[0].dispatchEvent(customEvent);
    return this;
};

$.fn.clickJ = function (timeout) {
	GM_log("clickJ : ");
	GM_log(this);
	for (var i = 0; i < this.length; i++)
	{
		GM_log(i + ' tagname : ' + this.get(i).tagName);
		$(this.get(i).attributes).each(function() {
			GM_log(i + " " + this.nodeName + ' : ' + this.value);
		});
		GM_log("text : " + this.get(i).text);
	}
    if (this.length === 0) {
        return this;
    }
    if (timeout === 0) {
        this.simMouseEvent("mousedown");
        this.simMouseEvent("mouseup");
        this.simMouseEvent("click");
    } else {
        var jq = $(this);
		GM_log(Date() + ' wait clickJ ' + (timeout || 1000));
        setTimeout(function () {
			GM_log(Date() + ' click func ');
	        jq.simMouseEvent("mousedown");
			jq.simMouseEvent("mouseup");
            jq.simMouseEvent("click");
        }, timeout || 500);
    }
    return this;
};

$.fn.touchJ = function (timeout) {
	GM_log("touchJ : " + this.length);
	GM_log(this);
	for (var i = 0; i < this.length; i++)
	{
		GM_log(i + ' tagname : ' + this.get(i).tagName);
		$(this.get(i).attributes).each(function() {
			GM_log(i + " " + this.nodeName + ' : ' + this.value);
		});
	}
    if (this.length === 0) {
        return this;
    }
    if (timeout === 0) {
        this.simTouchEvent("touchstart");
        this.simMouseEvent("touchend");
    } else {
        var jq = $(this);
		GM_log(Date() + ' wait clickJ ' + (timeout || 1000));
        setTimeout(function () {
			GM_log(Date() + ' touch func ');
	        jq.simTouchEvent("touchstart");
			jq.simTouchEvent("touchend");
        }, timeout || 500);
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

$.fn.minmaxJ = function (compare, target, minmaxflag) {
	var minmax = 1000000, id = -1, ele, nres, num;
    if (minmaxflag) {
        minmax = -minmax;
    }
	var p = this;
	if (p.length == 0) {
		return p;
	}
    for (i=0; i<p.length; i++) {
		var p1 = $(p[i]);
	    GM_log(i + ", " + id + ", " + p.length + ", " + compare + ", " + target);
		if (p1.find(compare).length == 0 || p1.find(target).length == 0) {
			continue;
		}
        nres = p1.find(compare).text().match(/([0-9]+)/);
        num = parseInt(nres[1], 10);
        if ((minmaxflag && num > minmax) || (!minmaxflag && num < minmax)) {
            minmax = num;
            id = i;
        }
    }
    if (id >= 0) {
        return $(p[id]).find(target).clickJ();
    }
    return $();
}

$.fn.clickFlash = function (xoff, yoff) {
    //debugger;
	GM_log("clickFlash: ");
	GM_log(this);
    if (this.length === 0) {
        return this;
    }
    var flash = $(this);
    setInterval(function () {
        flash.simMouseEvent("mousemove", xoff, yoff);
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
	GM_log("touchFlash: ");
	GM_log(this);
	//alert(flash.text());
    setInterval(function () {
        setTimeout(function () {flash.simTouchEvent("touchstart", xoff, yoff);}, 10);
		setTimeout(function () {flash.simTouchEvent("touchend", xoff, yoff);}, 20);
		setTimeout(function () {flash.simMouseEvent("mousedown", xoff, yoff);}, 30);
		setTimeout(function () {flash.simMouseEvent("mousemove", xoff, yoff);}, 40);
		setTimeout(function () {flash.simMouseEvent("mouseup", xoff, yoff);}, 50);
		setTimeout(function () {flash.simMouseEvent("click", xoff, yoff);}, 60);
	}, 1000);
    return this;
};

var url = document.URL;

function clickA(xpath) {
	GM_log("clickA : " + xpath);
    var a = getXPATH(xpath);
    if (a) {
        clickLink(a);
		GM_log("clickA : success");
        return true;
    } //else {
	GM_log("clickA : fail");
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
	GM_log('clickFlash : ' + xpath);
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
	GM_log("get cookie : " + c_name);
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
	GM_log("get cookie res : " + c_name + " : " + c_value);
    return c_value;
}

function reload_page(timeout) {
    setTimeout(function () {location.reload(true); }, timeout);
}
///////////

