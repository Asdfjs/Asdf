(function($_) {
    var o = $_.Core.namespace($_, 'Selector');
    var expando = "expando" + 1 * new Date();
    var booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",
    // Regular expressions
    // http://www.w3.org/TR/css3-selectors/#whitespace
        whitespace = "[\\x20\\t\\r\\n\\f]",
    // http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
        identifier = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",
    // Attribute selectors: http://www.w3.org/TR/selectors/#attribute-selectors
        attributes = "\\[" + whitespace + "*(" + identifier + ")(?:" + whitespace +
            // Operator (capture 2)
            "*([*^$|!~]?=)" + whitespace +
            // "Attribute values must be CSS identifiers [capture 5] or strings [capture 3 or capture 4]"
            "*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + identifier + "))|)" + whitespace +
            "*\\]",
        pseudos = ":(" + identifier + ")(?:\\((" +
            // To reduce the number of selectors needing tokenize in the preFilter, prefer arguments:
            // 1. quoted (capture 3; capture 4 or capture 5)
            "('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|" +
            // 2. simple (capture 6)
            "((?:\\\\.|[^\\\\()[\\]]|" + attributes + ")*)|" +
            // 3. anything else (capture 2)
            ".*" +
            ")\\)|)",
    // Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
        rwhitespace = new RegExp( whitespace + "+", "g" ),
        rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g" ),

        rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
        rcombinators = new RegExp( "^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*" ),

        rattributeQuotes = new RegExp( "=" + whitespace + "*([^\\]'\"]*?)" + whitespace + "*\\]", "g" ),

        rpseudo = new RegExp( pseudos ),
        ridentifier = new RegExp( "^" + identifier + "$" ),

        matchExpr = {
            "ID": new RegExp( "^#(" + identifier + ")" ),
            "CLASS": new RegExp( "^\\.(" + identifier + ")" ),
            "TAG": new RegExp( "^(" + identifier + "|[*])" ),
            "ATTR": new RegExp( "^" + attributes ),
            "PSEUDO": new RegExp( "^" + pseudos ),
            "CHILD": new RegExp( "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace +
                "*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
                "*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
            "bool": new RegExp( "^(?:" + booleans + ")$", "i" ),
            // For use in libraries implementing .is()
            // We use this for POS matching in `select`
            "needsContext": new RegExp( "^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
                whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
        },
        rinputs = /^(?:input|select|textarea|button)$/i,
        rheader = /^h\d$/i,

        rnative = /^[^{]+\{\s*\[native \w/,

    // Easily-parseable/retrievable ID or TAG or CLASS selectors
        rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

        rsibling = /[+~]/,
        rescape = /'|\\/g,

    // CSS escapes http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
        runescape = new RegExp( "\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig" );

    var _tokenCache = {};
    var alwaysFalse = $_.F.toFunction(false);
    var alwaysTrue =  $_.F.toFunction(true);

    function tokenize(selector){
        var c = _tokenCache[selector+' '];
        if(c) return $_.O.clone(c);

        var str = selector;
        var res = [];

    }

    function markFunction(fn){
        fn[expando] = true;
        return fn;
    }

    function t(){
        return true;
    }

    function f(){
        return false;
    }

    function eachList(list, fn, untilFn){
        untilFn = untilFn|| $_.F.identity;
        while(list&&untilFn(list)){
            fn(list[0]);
            list = list[1];
        }
    }

    var mAnyList = {};
    function anyList(list, fn){
        var res = false, el;
        eachList(list, function(){}, function(l){
            if(mAnyList[l[0].pid]&&mAnyList[l[0].pid][fn.fid]){
                res = mAnyList[l[0].pid][fn.fid];
            }else {
                res = fn(l[0]);
            }
            if(res) {
                if (!mAnyList[l[0].pid])
                    mAnyList[l[0].pid] = {};
                mAnyList[l[0].pid][fn.fid] = res;
                el = l[0];
            }
            return !res;
        });
        if(res){
            eachList(list, function(l){
                if(!mAnyList[l.pid])
                    mAnyList[l.pid] = {};
                mAnyList[l.pid][fn.fid] =true;
            }, function(ls){
                return ls[0] !== el;
            });
        }
        return res;
    }

    function recursivelyCollect(element, nextFn, testFn, untilFn) {
        var elements = [];
        if($_.O.isNotNode(element)||$_.O.isNotFunction(nextFn)||$_.O.isNotFunction(testFn)) throw new TypeError();
        untilFn = untilFn||f;
        while ((element = nextFn(element)) && !untilFn(element)) {
            if (testFn(element))
                elements.push(element);
        }
        return elements;
    }

    function recursively( element, nextFn, testFn ) {
        do {
            element = nextFn(element);
        } while ( testFn(element) );
        return element;
    }

    var mParentList = {};
    function getParentList(element){
        function rec(el){
            var p;
            el.pid = el.pid? el.pid:'p'+$_.Utils.makeuid();
            if(p = el['parentNode']){
                var ps = mParentList[el.pid]? mParentList[el.pid]:rec(p);
                mParentList[el.pid] = ps;
                return [el, ps]
            }

        }
        return rec(element);
    }

    var ancestors = $_.F.partial(recursivelyCollect, undefined,
        function(element){ return element['parentNode']}, undefined, undefined);

    var ancestor = $_.F.partial(recursively, undefined,
        function(element){ return element['parentNode']}, undefined, undefined)

    function descentors(element, testFn) {
        if($_.O.isNotNode(element)||$_.O.isNotFunction(testFn)) throw new TypeError();
        if(document == element) element = document.body;
        var elements = [];
        var q = [element];
        while(q.length) {
            element = q.shift();
            q.unshift.apply(q, $_.Element.children(element));
            if(testFn(element))
                elements.push(element);
        }
        return elements;
    }

    function equalId(el, id){
        if($_.O.isNotNode(el)||$_.O.isNotString(id)) throw new TypeError();
        return el.id === id;
    }

    function equalClassName(el, className){
        if($_.O.isNotNode(el)||$_.O.isNotString(className)) throw new TypeError();
        return $_.Element.hasClass(el, className);
    }

    function equalTagName(el, tagName){
        if($_.O.isNotNode(el)||$_.O.isNotString(tagName)) throw new TypeError();
        return el.tagName === tagName.toUpperCase();
    }

    function ofnToElements(arr){
        var run = $_.O.clone(arr).reverse();
        var res = [];
        $_.A.each(run, function(o){
            if(!res.length){
                res = document.getElementsByTagName('li')//descentors(document, o.fn);
            }else {
                $_.A.filter(res, function (v){
                    var pl = getParentList(v);
                    return !anyList(pl, o.fn);
                });
            }
        });
        return res;
    }
    //Asdf.Selector.ofnToElements([{fn: function(e){return e.tagName="LI"}},{fn: function(e){ return e.className=='test-name'}}])
    var fnMap = {
        className: equalClassName,
        id: equalId,
        tagName: equalTagName,
        and: $_.F.and,
        or: $_.F.or
    };

    function adapterEqualFn(fn, str){
        return $_.F.partial(fn, undefined, str);
    }

    var mCompositFn = {};
    function compositFn(obj){
        function rec(o) {
            var res = [];
            $_.O.each(o, function (v, k) {
                if ($_.O.isString(v)) {
                    res.push(adapterEqualFn(fnMap[k], v));
                    return;
                }
                if ($_.O.isPlainObject(v)) {
                    res.push(fnMap[k].apply(this, rec(v)));
                    return;
                }
            });
            return  res;
        }
        var f = rec(obj)[0];
        f.fid = 'f'+$_.Utils.makeuid();
        return f;
    }
    //Asdf.Selector.compositFn({and:{id: 'qunit',tagName:'div'}})


    function oToOfn(arr){
        var res = [];
        $_.A.each(arr, function(v){
            res.push({fn:compositFn(v)});
        });
        return res;
    }
    //Asdf.Selector.ofnToElements(Asdf.Selector.oToOfn([{tagName: 'body'}, {and:{id: 'qunit',tagName:'div'}}]));


    $_.O.extend(o, {
        descentors: descentors,
        ancestor: ancestor,
        ancestors: ancestors,
        getParentList:getParentList,
        anyList:anyList,
        eachList:eachList,
        equalId:equalId,
        equalClassName:equalClassName,
        equalTagName:equalTagName,
        ofnToElements:ofnToElements,
        compositFn:compositFn,
        oToOfn:oToOfn
    })
})(Asdf);