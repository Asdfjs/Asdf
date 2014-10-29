(function($_) {
    $_.Debug = {};
    var debug = false;
    function setDebug(d){
        debug = !!d;
    }
    function validate(fn, paramStr, returnStr){
        if(!debug) return fn;
        paramStr = paramStr||'!>>';
        returnStr = returnStr||'!<<';
        var self = this;
        if(!$_.O.isFunction(fn)) throw new TypeError();
        var def = $_.F.getDef(fn);
        var lines = def.comments.join('\n').split('\n');
        var pfns =  Asdf.A.map($_.A.filter(lines, function(l){
            return $_.S.startsWith(l,paramStr);
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