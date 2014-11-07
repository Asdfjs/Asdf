(function($_) {
    $_.Debug = {};
    var debug = true;
    function setDebug(d){
        debug = !!d;
    }

    function typeOf(value) {
        var s = typeof value;
        if (s == 'object') {
            if (value) {
                if (value instanceof Array) {
                    return 'array';
                } else if (value instanceof Object) {
                    return s;
                }
                var className = Object.prototype.toString.call(
                    /** @type {Object} */ (value));
                if (className == '[object Window]') {
                    return 'object';
                }
                if ((className == '[object Array]' ||
                    typeof value.length == 'number' &&
                    typeof value.splice != 'undefined' &&
                    typeof value.propertyIsEnumerable != 'undefined' &&
                    !value.propertyIsEnumerable('splice')
                    )) {
                    return 'array';
                }
                if ((className == '[object Function]' ||
                    typeof value.call != 'undefined' &&
                    typeof value.propertyIsEnumerable != 'undefined' &&
                    !value.propertyIsEnumerable('call'))) {
                    return 'function';
                }
            } else {
                return 'null';
            }

        } else if (s == 'function' && typeof value.call == 'undefined') {
            return 'object';
        }
        return s;
    }

    function doctest(fn, startsWith){
        startsWith = startsWith||'>>>';
        if(!$_.O.isFunction(fn)) throw new TypeError();
        var def = $_.F.getDef(fn);
        var lines = def.comments.join('\n').split('\n');
        return Asdf.A.map($_.A.filter(lines, function(l){
            return $_.S.startsWith(l,startsWith);
        }), function(exe){
            try{
                return (new Function('return ' + exe.substring(startsWith.length)))();
            }catch(e){
                return e;
            }
        });
    }

    var STRIP_COMMENTS = /(?:\/\*\{([\s\S]+?)\}\*\/)/mg;
    var rargcomment = /\{(\d+)\}\s*(\w+)/;
    var rreturncomment = /return\s+\{(\d+)\}/;
    function validate(fn){
        if(!debug) return fn;
        if(!$_.O.isFunction(fn)) throw new TypeError();
        var comment = [];
        var fnText = fn.toString().replace(STRIP_COMMENTS, function(_,p1){
            return '{'+(comment.push(p1)-1)+'}'
        }).replace($_.R.STRIP_COMMENTS, '');
        var mfn = fnText.match($_.R.FN_DEF);
        var fname = mfn[1]||'{anonymous}';
        var fbody = mfn[3];
        var argNames = $_.A.map(mfn[2].split($_.R.FN_ARG_SPLIT), function(arg){
            return $_.S.trim(arg);
        });
        var self = this;
        var argTest = $_.A.reduce(argNames, function(o,v,i){
            var m =v.match(rargcomment);
            if(!m) return o;
            var index = i;
            var argName = m[2];
            var type = comment[m[1]].split('|');
            return $_.A.append(o,function(){
                var arg = arguments[index], ct;
                if( Asdf.A.contains(type,(ct = typeOf(arg))))
                    return true;
                throw new TypeError(fname+' : '+argName +" type must be a " + type.join(' or ') + '. current type is '+ct+'.'+'\n'+fn.toString());
            });
        }, []);
        var returnTest = function(res){
            var type, rt, m=fbody.match(rreturncomment);
            if(m && (type = comment[m[1]].split('|'))){
                if( Asdf.A.contains(type,(rt = typeOf(res))))
                    return true;
                throw new TypeError(fname+' : return type must be a ' + type.join(' or ') + '. current type is '+rt+'.'+'\n'+fn.toString());
            }
        };

        return $_.F.wrap(fn, function(ofn){
            var args = Array.prototype.slice.call(arguments,1);
            $_.A.each(argTest, function(f){
                f.apply(self, args);
            });
            var res = ofn.apply(this, args);
            returnTest(res);
            return res;
        });
    }
    $_.O.extend($_.Debug, {
        setDebug:setDebug,
        validate:validate
    });

})(Asdf);