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
        matchFunction = {
            "ATTR": function(match){
                match[1] = match[1].replace( runescape, funescape );
                // Move the given value to match[3] whether quoted or unquoted
                match[3] = ( match[3] || match[4] || match[5] || "" ).replace( runescape, funescape );
                if ( match[2] === "~=" ) {
                    match[3] = " " + match[3] + " ";
                }
                return match.slice( 0, 4 );
            },"CHILD": function( match ) {
                /* matches from matchExpr["CHILD"]
                 1 type (only|nth|...)
                 2 what (child|of-type)
                 3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
                 4 xn-component of xn+y argument ([+-]?\d*n|)
                 5 sign of xn-component
                 6 x of xn-component
                 7 sign of y-component
                 8 y of y-component
                 */
                match[1] = match[1].toLowerCase();
                if ( match[1].slice( 0, 3 ) === "nth" ) {
                    // nth-* requires argument
                    if ( !match[3] ) {
                        throw new Error( match[0] );
                    }
                    // numeric x and y parameters for Expr.filter.CHILD
                    // remember that false/true cast respectively to 0/1
                    match[4] = +( match[4] ? match[5] + (match[6] || 1) : 2 * ( match[3] === "even" || match[3] === "odd" ) );
                    match[5] = +( ( match[7] + match[8] ) || match[3] === "odd" );
                    // other types prohibit arguments
                } else if ( match[3] ) {
                    throw new Error( match[0] );
                }
                return match;
            },
            "PSEUDO": function( match ) {
                var excess,
                    unquoted = !match[6] && match[2];
                if ( matchExpr["CHILD"].test( match[0] ) ) {
                    return null;
                }
                // Accept quoted arguments as-is
                if ( match[3] ) {
                    match[2] = match[4] || match[5] || "";
                    // Strip excess characters from unquoted arguments
                } else if ( unquoted && rpseudo.test( unquoted ) &&
                    // Get excess from tokenize (recursively)
                    (excess = tokenize( unquoted, true )) &&
                    // advance to the next closing parenthesis
                    (excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length) ) {
                    // excess is a negative index
                    match[0] = match[0].slice( 0, excess );
                    match[2] = unquoted.slice( 0, excess );
                }
                // Return only captures needed by the pseudo filter method (type and argument)
                return match.slice( 0, 3 );
            }
        },
        rinputs = /^(?:input|select|textarea|button)$/i,
        rheader = /^h\d$/i,

        rnative = /^[^{]+\{\s*\[native \w/,

    // Easily-parseable/retrievable ID or TAG or CLASS selectors
        rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

        rsibling = /[+~]/,
        rescape = /'|\\/g,

    // CSS escapes http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
        runescape = new RegExp( "\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig" ) ,
        funescape = function( _, escaped, escapedWhitespace ) {
            var high = "0x" + escaped - 0x10000;
            // NaN means non-codepoint
            // Support: Firefox<24
            // Workaround erroneous numeric interpretation of +"0x"
            return high !== high || escapedWhitespace ?
                escaped :
                high < 0 ?
                    // BMP codepoint
                    String.fromCharCode( high + 0x10000 ) :
                    // Supplemental Plane codepoint (surrogate pair)
                    String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
        };
    var alwaysFalse = $_.F.toFunction(false);
    var alwaysTrue =  $_.F.toFunction(true);
    var _rbuggyMathches = [];
    var _rbuggyQSA = [];

    var opposite = {
        'parentNode': 'childNode',
        'previousSibling':'nextSibling',
        'childNode':'parentNode',
        'nextSibling': 'previousSibling'
    };
    var combinators = {
        ' ': {dir: 'parentNode', first:true}

    };

    var filter = 'ID,TAG,CLASS,ATTR,CHILD,PSEUDO'.split(',');
    function _tokenize(selector){
        var str = selector,res = [], matched, match, tokens;
        while(str){
            if(!matched)
                res.push((tokens = []));
            else if((match = rcomma.exec(str)))
                str = str.slice(match[0].length)||str;
            matched = false;
            if((match = rcombinators.exec(str))){
                matched = match.shift();
                tokens.push({
                    value:matched,
                    type:match[0].replace(rtrim, ' ')
                });
                str = str.slice(matched.length)
            }
            $_.A.each(filter, function(type){
                if((match = matchExpr[type].exec(str)) && (!matchFunction[type]|| (match = matchFunction[type](match)))){
                    matched = match.shift();
                    tokens.push({
                        value:matched,
                        type:type,
                        matcheds:match
                    });
                    str = str.slice(matched.length);
                }
            });
            if(!matched){
                break;
            }
        }
        if(str) throw new Error();
        return res;
    }
    var tokenize = $_.F.compose($_.F.memoize(_tokenize, function(str){return str+' '}), $_.O.clone);
    function select(expression, element, results, seed){
        results = results||[];
        element = element || document;
        return _select(expression.replace(rtrim, '$1'), element, results, seed);
    }
    function _select(expression, element, results, seed){
    }
    function toSelector(tokens){
        return $_.A.reduce(tokens, function(str, i){
            return str+ i.value;
        }, '')
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