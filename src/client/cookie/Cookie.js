/**
 * Created by sungwon on 14. 10. 20.
 */
(function($_) {
    $_.Cookie = {};
    var MAX_COOKIE_LENGTH = 3950;
    var SPLIT_RE_ = /\s*;\s*/;
    var isEnabled = function() {
        return navigator.cookieEnabled;
    };
    var isValidName = function(name) {
        return !(/[;=\s]/.test(name));
    };
    var isValidValue = function(value) {
        return !(/[;\r\n]/.test(value));
    };

    var set = function(context, name, value, maxAge, path, domain, secure){
        if($_.O.isNotObject(context)||!isValidName(name)||!isValidValue(value)) throw new TypeError();
        maxAge = $_.O.isUndefined(maxAge)? -1: maxAge;
        var str = [domain?';domain='+domain:'',
            path?';path='+path:'',
            maxAge<0?'':maxAge===0?';expires='+(new Date(1970,1,1)).toUTCString():';expires='+(new Date(($_.Utils.now()+maxAge *1000))).toUTCString(),
            secure?';secure':''].join('');
        _setCookie(context, name+'='+value+str);
    };
    var _setCookie = function(context,str){
        context.cookie = str;
    };
    var get = function(context, name, defaultValue){
        if($_.O.isNotObject(context)||!isValidName(name)) throw new TypeError();
        var parts = _getParts(_getCookie(context)||'');
        var nameEq = name + '=';
        for(var i = 0; i < parts.length; i++){
            if($_.S.startsWith(parts[i], nameEq)){
                return parts[i].substr(nameEq.length);
            }
            if(parts[i]==name)
                return '';

        }
        return defaultValue;
    };
    var _getCookie = function(context){
        return context.cookie;
    };
    var remove = function(context, name, path, domain){
        var res = containsKey(context,name);
        set(context, name, '', 0, path, domain);
        return res;
    };
    var containsKey = function(context, name){
        return $_.O.isNotUndefined(get(context, name));
    };
    var keys = function(context){
        if($_.O.isNotObject(context)) throw new TypeError();
        var kv = _getKeyValues(_getCookie(context)||'');
        return $_.A.pluck(kv, '0');
    };
    var values = function(context){
        if($_.O.isNotObject(context)) throw new TypeError();
        var kv = _getKeyValues(_getCookie(context)||'');
        return $_.A.pluck(kv, '1');
    };
    var isEmpty = function(context){
        if($_.O.isNotObject(context)) throw new TypeError();
        return !_getCookie(context);
    };
    var getCount = function(context){
        if($_.O.isNotObject(context)) throw new TypeError();
        var c = _getCookie(context);
        return c?_getParts(c).length:0;
    };
    var containsValue = function(context, value){
        if($_.O.isNotObject(context)||!isValidValue(value)) throw new TypeError();
        return $_.A.contains(values(context), value);
    };
    var clear = function(context){
        if($_.O.isNotObject(context)) throw new TypeError();
        var k = keys(context);
        Asdf.A.each(k, function(v){
            remove(context, v);
        })
    };

    var _getParts = function(str){
        return str.split(SPLIT_RE_);
    };
    var _getKeyValues = function(str){
        var parts = _getParts(str);
        return $_.A.map(parts, function(v){
            var index = v.indexOf('=');
            return index ==-1?['',v]:[v.substring(0,index), v.substring(index+1)];
        });
    };

    $_.Cookie = {
        set:set,
        get:get,
        keys: keys,
        values: values,
        remove:remove,
        clear:clear,
        containsKey: containsKey,
        containsValue: containsValue,
        isEnabled:isEnabled,
        isValidName:isValidName,
        isValidValue:isValidValue,
        isEmpty:isEmpty,
        getCount:getCount
    }

})(Asdf);