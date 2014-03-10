(function ($_) {
    var o = $_.Utils.namespace($_, 'C');
    function doFilter(name, when, args){
        var self = this;
        $_.A.each(this._filters||[], function(v){
            if(when == v[2] && $_.A.include(v[0], name))
                v[1].apply(self, args);
        });
    }
    var publicP = {
        _events: {},
        _filters: [],
        on: function (name, fn){
            if(!$_.O.isString(name)||!$_.O.isFunction(fn))
                throw new TypeError();
            this._events || (this._events = {});
            var e = this._events[name]||(this._events[name] = []);
            e.push(fn);
            return this;
        },
        once: function (name, fn){
            var tfn = $_.F.after(fn, function(){
               this.remove(name, tfn);
            });
            this.on(name, tfn);
        },
        remove: function(name, fn){
            if(!$_.O.isString(name)) throw new TypeError();
            var e = this._events && this._events[name];
            if(!e)
                return this;
            if(!fn)
                $_.A.clear(e);
            var index = $_.A.indexOf(e, fn);
            if(index === -1)
                return this;
            e.splice(index, 1);
        },
        emit: function(name, args){
            var args = Array.prototype.slice.call(arguments, 1);
            if(!$_.O.isString(name))
                throw new TypeError();
            var e = this._events && this._events[name];
            if(!e)
                return this;
            var self = this;
            doFilter.call(this, name, 'before', args);
            $_.A.each(e, function(fn){
                fn.apply(self, args);
            });
            doFilter.call(this, name, 'after', args);
            return this;
        },
        addFilter: function(name, fn, when){
            if(!($_.O.isString(name)||$_.O.isArray(name))||!$_.O.isFunction(fn))
                throw new TypeError();
            when = when||'after';
            $_.O.isString(name) && (name = [name]);
            this._filters || (this._filters = []);
            this._filters.push([name, fn, when]);
            return this;
        }
    }
    var c = $_.Base.Class(publicP);
    $_.O.extend(o, {
      Events:  c
    });
})(Asdf);
