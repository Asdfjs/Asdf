(function($_) {
    /**
     * @namespace
     * @name Asdf.Struct.Tuple
     */
    var o = $_.Core.namespace($_, 'Struct');
    function copy(target, source){
        $_.A.each(source, function(v,i){
            target[i] = v;
        });
        target.length = source.length;
    }
    function Tuple(){
        copy(this, arguments);
    }
    Tuple.prototype.equals = function(o){
        if(this.length !== o.length)return false;
        return $_.A.every(this, function(v,i){
            return v === o[i];
        })
    };
    Tuple.prototype.unpack = function(fn){
        if($_.O.isNotFunction(fn)) throw new Error();
        return fn.apply(this, this);
    };
    Tuple.prototype.map = function(fn){
        if($_.O.isNotFunction(fn)) throw new Error();
        var t = new Tuple();
        copy(t, $_.A.map(this, fn));
        return t;
    };
    o.Tuple = Tuple;
})(Asdf);