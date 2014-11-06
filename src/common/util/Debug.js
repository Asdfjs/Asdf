(function($_) {
    $_.Debug = {};
    var debug = false;
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

    var STRIP_COMMENTS = /(?:\/\*(\{[\s\S]*?\})\*\/)/mg;

    function validate(fn){
        if(!debug) return fn;
        var self = this;
        if(!$_.O.isFunction(fn)) throw new TypeError();
        var def = $_.F.getDef(fn.toString().replace(STRIP_COMMENTS, function(p,p1){
            return '+p1+'
        }));
        var pfns =  Asdf.A.map($_.A.filter(def.arguments, function(l){
            return $_.S.startsWith(l,'{');
        }), function(exe){
            return (new Function(def.arguments,'return ' + exe.substring(paramStr.length)));
        });
        var rfns =  Asdf.A.map($_.A.filter(lines, function(l){
            return $_.S.startsWith(l,returnStr);
        }), function(exe){
            return (new Function('res','return ' + exe.substring(paramStr.length)));
        });
        return $_.F.wrap(fn, function(ofn){
            var args = Array.prototype.slice.call(arguments,1);
            var perr = [], rerr = [];
            $_.A.each(pfns, function(f){
                if(f.apply(self, args)!==true){
                    perr.push($_.S.trim($_.F.getDef(f).body).substring(7));
                }
            });
            if(perr.length)
                throw new Error(perr.join('\n'));
            var res = ofn.apply(this, args);
            $_.A.each(rfns, function(f){
                if(f.call(self, res)!==true){
                    rerr.push($_.S.trim($_.F.getDef(f).body).substring(7));
                }
            });
            if(rerr.length)
                throw new Error(rerr.join('\n'));
            return res;
        });
    }
    $_.O.extend($_.Debug, {
        setDebug:setDebug,
        validate:validate
    });

})(Asdf);