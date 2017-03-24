(function($_) {
    $_.Bom = {};
    var alwaysFalse = $_.F.alwaysFalse;
    var rnative = $_.R.FN_NATIVE;
    var Browser = getBrowser(window);
    function getBrowser(win) {
        var ua = win.navigator.userAgent;
        var doc = win.document;
        ua = ua.toLowerCase();
        var match = /(chrome)[ \/]([\w.]+)/.exec(ua)
            || /(webkit)[ \/]([\w.]+)/.exec(ua)
            || /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua)
            || /(msie) ([\w.]+)/.exec(ua)
            || /(msie)(?:.*?Trident.*? rv:([\w.]+))/.exec('msie'+ua)
            || ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua) || [];
        var browser = match[1] || "";
        var version = match[2] || "0";
        var documentMode =  browser != 'msie'? undefined : doc.documentMode || (doc.compatMode == 'CSS1Compat'? parseInt(version,10) : 5);
        return {
            browser : browser,
            version : version,
            documentMode:documentMode
        };
    }
    function _reset(div){
        div.innerHTML = '';
        div.id = '';
        div.name = '';
        div.className = '';
    }

    function getSupport(win){
        var doc = win.document;
        var docElem = doc.documentElement;
        var support = {};
        var div = document.createElement('div');
        var fragment = document.createDocumentFragment();
        var input = document.createElement('input');
        support.attribute = $_.F.errorHandler(function(div){
            div.className = 'i';
            return !div.getAttribute('className');
        }, alwaysFalse, _reset)(div);
        support.htmlSerialize = $_.F.errorHandler(function(div){
            div.innerHTML = '<link/>';
            return !!div.getElementsByTagName( "link" ).length;
        }, alwaysFalse, _reset)(div);
        support.html5Clone = doc.createElement( "nav" ).cloneNode( true ).outerHTML !== "<:nav></:nav>";
        support.getElementsByTagName = $_.F.errorHandler(function(div){
            div.appendChild(doc.createComment(''));
            return !div.getElementsByTagName('*').length;
        }, alwaysFalse, _reset)(div);
        support.getElementsByClassName = rnative.test(doc.getElementsByClassName);
        support.getById = $_.F.errorHandler(function(div){
            docElem.appendChild(div).id = 'aa';
            return !doc.getElementsByName || !doc.getElementsByName('aa').length;
        }, alwaysFalse, _reset)(div);
        support.leadingWhitespace = $_.F.errorHandler(function(div){
            div.innerHTML = '  ';
            return div.firstChild.nodeType === 3;
        }, alwaysFalse, _reset)(div);
        support.tbody = $_.F.errorHandler(function(div){
            div.innerHTML = '<table></table>';
            return !div.getElementsByTagName('tbody').length;
        }, alwaysFalse, _reset)(div);
        support.qsa = rnative.test(doc.querySelectorAll);
        support.qsaNotSupport = (function(){
            if(!support.qsa) return $_.F.alwaysFalse;
            var rbuggyQSA = [];
            var whitespace = "[\\x20\\t\\r\\n\\f]";
            var booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped";
            $_.F.errorHandler(function(div){
                div.innerHTML = "<select msallowcapture=''>" +
                "<option id='d\f]' selected=''></option></select>";
                if ( div.querySelectorAll("[msallowcapture^='']").length ) {
                    rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:''|\"\")" );
                }
                if ( !div.querySelectorAll("[selected]").length ) {
                    rbuggyQSA.push( "\\[" + whitespace + "*(?:value|" + booleans + ")" );
                }
                if ( !div.querySelectorAll("[id~=d]").length ) {
                    rbuggyQSA.push("~=");
                }
                if ( !div.querySelectorAll(":checked").length ) {
                    rbuggyQSA.push(":checked");
                }
            }, alwaysFalse, _reset)(div);
            $_.F.errorHandler(function(div){
                var input = doc.createElement("input");
                input.setAttribute( "type", "hidden" );
                div.appendChild( input ).setAttribute( "name", "D" );
                if ( div.querySelectorAll("[name=d]").length ) {
                    rbuggyQSA.push( "name" + whitespace + "*[*^$|!~]?=" );
                }
                if ( !div.querySelectorAll(":enabled").length ) {
                    rbuggyQSA.push( ":enabled", ":disabled" );
                }
                div.querySelectorAll("*,:x");
                rbuggyQSA.push(",.*:");
            }, alwaysFalse, _reset)(div);
            rbuggyQSA = rbuggyQSA.length && new RegExp( rbuggyQSA.join("|") );
            return function(selector){
                return rbuggyQSA&&rbuggyQSA.test(selector);
            }
        })();
        support.appendChecked =$_.F.errorHandler(function(div,input, fragment){
            input.type = 'checkbox';
            input.checked = true;
            fragment.appendChild(input);
            return input.checked;
        }, alwaysFalse, _reset)(div, input, fragment);
        support.noCloneChecked = $_.F.errorHandler(function(div){
            div.innerHTML = '<textarea>x</textarea>';
            return !!div.cloneNode( true ).lastChild.defaultValue;
        }, alwaysFalse, _reset)(div);
        support.noCloneEvent = $_.F.errorHandler(function(div){
            var res = true;
            div.attachEvent&&div.attachEvent( "onclick", function() {
                res = false;
            });
            div.cloneNode( true ).click();
            return res;
        }, alwaysFalse, _reset)(div);
        support.deleteExpando = $_.F.errorHandler(function(div){
            delete div.test;
            return true;
        }, alwaysFalse, _reset)(div);
        support.XPath = rnative.test(doc.evaluate);
        support.ElementExtensions = (function() {
            var constructor = win.Element || win.HTMLElement;
            return !!(constructor && constructor.prototype);
        })();
        support.SpecificElementExtensions = (function() {
            if (typeof window.HTMLDivElement !== 'undefined')
                return true;
            var form = document.createElement('form'), isSupported = false;
            if (div['__proto__'] && (div['__proto__'] !== form['__proto__'])) {
                isSupported = true;
            }
            form = null;
            return isSupported;
        })();
        div.parentNode&&div.parentNode.removeChild(div);
        div = fragment = null;
        return support;
    }

    var features = {
        CanAddNameOrTypeAttributes : Browser.browser != 'msie' || Browser.documentMode >= 9,
        CanUseChildrenAttribute : Browser.browser != 'msie' && Browser.browser != 'mozilla' ||
            Browser.browser == 'msie' && Browser.documentMode >= 9 ||
            Browser.browser == 'mozilla' && Asdf.S.compareVersion(Browser.version, '1.9.1') >=0,
        CanUseParentElementProperty : Browser.browser == 'msie' || Browser.browser == 'opera' || Browser.browser == 'webkit'
    };
    $_.O.extend(features, getSupport(window));
    var browserMap = {
        'firefox' : 'mozilla',
        'ff': 'mozilla',
        'ie': 'msie'
    };
    function isBrowser(browser){
        if(!Asdf.O.isString(browser)) throw new TypeError()
        return (browserMap[browser.toLowerCase()]||browser.toLowerCase()) == Browser.browser
    }
    function compareVersion(version){
        return Asdf.S.compareVersion(Browser.version, version);
    }
    $_.O.extend($_.Bom, {
        isBrowser: isBrowser,
        compareVersion: compareVersion,
        browser : Browser.browser,
        version: Browser.version,
        documentMode: Browser.documentMode,
        features:features,
        getSupport:getSupport
    });
})(Asdf);