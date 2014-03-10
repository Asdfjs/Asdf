(function($_) {
    var o = $_.Utils.namespace($_, 'C');
	var safeObject = function(obj) {
		return ($_.O.isArray(obj)||$_.O.isPlainObject(obj))? $_.O.clone(obj):obj;
	};
    var publicP = {
        _data: {},
        _options: {
            safe: false,
            value: false
        },
        initialize: function(data, options){
            if(data==null && options==null)
                return
            else if(!$_.O.isPlainObject(data)&& !$_.O.isPlainObject(options))
                throw new TypeError()
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
        set: function(key, value) {
            if(this._options.value)
                throw new Error('valueObject can\'t set value');
            this._data[key] = (this._options.safe)? safeObject(value):value;
        },
        has: function(key) {
            return !!this._data[key];
        },
        remove: function(key) {
            delete this._data[key];
        },
        equals: function(obj){
            return $_.O.equals(this._data, obj._data);
        }

    };
    var c = $_.Base.Class(publicP);
    $_.O.extend(o, {
        Store:  c
    });
})(Asdf);