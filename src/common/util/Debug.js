(function($_) {
    $_.Debug = {};
    var debug = false;
    function setDebug(d){
        debug = !!d;
    }
    function assert(fn, startsWith){
        if(!debug) return fn;
        startsWith = startsWith||'!!';
        var self = this;
        if(!$_.O.isFunction(fn)) throw new TypeError();
        var def = $_.F.getDef(fn);
        var lines = def.comments.join('\n').split('\n');
        var fns =  Asdf.A.map($_.A.filter(lines, function(l){
            return $_.S.startsWith(l,startsWith);
        }), function(exe){
            return (new Function(def.arguments,'return ' + exe.substring(startsWith.length)));
        });
        return $_.F.before(fn, function(){
            var args = arguments;
            var res = [];
            $_.A.each(fns, function(f){
                if(f.apply(self, args)!==true){
                    res.push(f.toString());
                }
            });
            if(res.length)
                throw new Error(res.join('\n'));
            return res;
        });
    }
    $_.O.extend($_.Debug, {
        setDebug:setDebug,
        assert:assert
    });

})(Asdf);