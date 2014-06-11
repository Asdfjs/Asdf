(function($_) {
    //Asdf.Chain("    asdfasdfasdfasdf").bind(Asdf.S.trim).bind(Asdf.S.capitalize).bind(Asdf.S.truncate, undefined, 5, '...').bind(Asdf.S.lpad, undefined, '0', 10).value();
    function Chain(obj, conf){
        if(obj instanceof Chain) return obj;
        if(!(this instanceof Chain)) return new Chain(obj, conf)
        this._value = obj;
        this._conf = conf||{};
        if(conf) {
            conf.bind && (this.bind = conf.bind);
            conf.fail && (this.fail = conf.fail);
        }
    }
    $_.Chain = Chain;
    function bind(fn){
        var _method = $_.F.partial.apply(this, arguments);
        if(this._value != this._conf.fail)
            return Chain(_method(this._value), this._conf);
        return Chain(this._conf.fail, this._conf);
    }
    function value(){
        return this._value;
    }

    Chain.prototype.bind = bind;
    Chain.prototype.value = value;

})(Asdf);