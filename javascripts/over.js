var ov = {};
(function($_,ov) {
    function isBoolean(b){ return b===true||b===false}
    var add = Asdf.F.overload(function(a,b){return a+b;},
        function(a,b){
            return (Asdf.O.isNumber(a)||Asdf.O.isString(a))&& (Asdf.O.isNumber(b)||Asdf.O.isString(b));
        });
    add = Asdf.F.overload(function (a,b){ return a||b;},
        function(a,b){
            return isBoolean(a)&&isBoolean(b);
        }, add);
    add = Asdf.F.overload(function (a,b){ return Asdf.A.merge(a,b);},
        function(a,b){
            return Asdf.O.isArray(a)&&Asdf.O.isArray(b);
        }, add);
    add = Asdf.F.overload(function (a,b){a.push(b); return a},
        function(a,b){
            return Asdf.O.isArray(a)&&Asdf.O.isNotArray(b);
        }, add);
    add = Asdf.F.overload(function (a,b){return Asdf.F.compose(a,b);},
        function(a,b){
            return Asdf.O.isFunction(a) && Asdf.O.isFunction(b);
        }, add);
    add = Asdf.F.overload(function (a,b){return Asdf.Element.append(a,b);},
        function(a,b){
            return Asdf.O.isElement(a) && Asdf.O.isNode(b);
        }, add);
    ov.add = add;
})(Asdf, ov);