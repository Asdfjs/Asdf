(function($_) {
    var o = $_.Core.namespace($_, 'C');
	var safeObject = function(obj) {
		return ($_.O.isArray(obj)||$_.O.isPlainObject(obj))? $_.O.clone(obj):obj;
	};
    var publicP = {
        _data: {},
        _options: {
            safe: false,
            value: false,
            freeze: false,
            types: {}
        },
        initialize: function(data, options){
            if(data==null && options==null)
                return
            else if(!$_.O.isPlainObject(data)&& !$_.O.isPlainObject(options))
                throw new TypeError();
            if(options.types && !$_.O.type(data, options.types))
                throw new TypeError();
            data && $_.O.extend(this._data, data);
            options && $_.O.extend(this._options, options);
        },
        get: function(key){
            var res;
            if (this.has(key)) {
                res = this._data[key];
                return (this._options.safe)? safeObject(res):res;
            }
            return;
        },
        set: function(key, value, typeFn) {
            if(this._options.value)
                throw new Error('valueObject can\'t set value');
            if(this._options.freeze && !this.has(key))
                throw new Error('freezeObject can\'t set new value');
            typeFn = typeFn||this._options.types[key];
            if(typeFn&&!typeFn(value))
                throw new TypeError();
            typeFn && (this._options.types[key] = typeFn);
            this._data[key] = (this._options.safe)? safeObject(value):value;
        },
        has: function(key) {
            return $_.A.include($_.O.keys(this._data),key)
        },
        remove: function(key) {
            if(this._options.value)
                throw new Error('valueObject can\'t remove value');
            if(this._options.freeze && this.has(key))
                throw new Error('freezeObject can\'t remove value');
            if(this._options.types[key])
                delete this._options.types[key];
            delete this._data[key];
        },
        equals: function(obj){
            return $_.O.equals(this._data, obj._data);
        }

    };
    var c = $_.Base.Class(publicP);
    c.mixin = publicP;
    $_.O.extend(o, {
        Store:  c
    });
})(Asdf);