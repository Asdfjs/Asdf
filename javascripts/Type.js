var type = {};
(function($_, ty){
    var cls = {};
    var init = Asdf.F.partial(Asdf.F.wrap, undefined, function(f, obj){
        if(!f(obj)){
            throw new TypeError();
        }
        this.data = obj;
        }
    );
    var end = function(){
        var res = this.data;
        this.data = null;
        return res;
    }
    function create(name, typeFn, proto){
        var p = {
            initialize: init(typeFn),
            end: end
        }
        Asdf.O.extend(p, proto);
        cls[name] = Asdf.Base.Class(p)
        ty['is'+Asdf.S.capitalize(name)] = function(data){
            return new cls[name](data);
        }
    }
    function adapter(fn){
        return function(){
            var res = fn.apply(this, Asdf.A.merge([this.data], arguments) );
            if(!res)
                throw new Error();
            this.data = res;
            return this;
        }
    }
    /**
    * dom
    * */

    var dom = 'walk visible toggle hide show remove text value html parent next prev wrap unwrap append prepend first last'.split(' ');
    var domProto = {}
    $_.A.each(dom, function(v){
        domProto[v] = adapter($_.Element[v]);
    });
    create('dom', Asdf.O.isElement, domProto);

    /**
     *
     * array
     */
    var array = 'map filter reject shuffle sort clear initial rest compact flatten without unique union intersection difference zip concat rotate'.split(' ');
    var arrayProto = {}
    $_.A.each(array, function(v){
        arrayProto[v] = adapter($_.A[v]);
    });
    create('array', Asdf.O.isArray, arrayProto);

    /**
     *
     * function
     */
    var fun = 'bind curry wrap before after composeRight compose extract partial or and orElse sequence overload errorHandler'.split(' ');
    var funProto = {}
    $_.A.each(fun, function(v){
        funProto[v] = adapter($_.F[v]);
    });
    create('function', Asdf.O.isFunction, funProto);

    ty.create = create;
})(Asdf,type);