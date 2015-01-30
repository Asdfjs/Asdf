(function($_) {
    /**
     * @namespace
     * @name Asdf.Gen
     */
    $_.Gen = {};
    function generator(initFn, nextFn, returnFn){
        if($_.O.isNotFunction(initFn)||$_.O.isNotFunction(nextFn)||$_.O.isNotFunction(returnFn)) throw new TypeError();
        var state = 0; //0:pending, 1:running, 2:done
        var current;
        returnFn = returnFn||$_.F.identity;
        function stop(){
            state = 2;
        }
        return function(){
            if(state === 2){
                return {done:true}
            }else {
                current = state==0?(state=1,initFn.call(this, stop)):nextFn(current, stop);
                if (state === 2) {
                    return {done: true}
                }
                return {value: returnFn(current), done: false};
            }
        }
    }
    function consumer(genFn, fn){
        if($_.O.isNotFunction(genFn)||$_.O.isNotFunction(fn)) throw new TypeError();
        for(var v =genFn(); !v.done;v=genFn()){
            fn(v.value, v.done);
        }
    }

    function map(genFn, fn){
        if($_.O.isNotFunction(fn)) throw new TypeError();
        return generator(genFn,
            function(c,s){
                var v=genFn();
                if(v.done) return s();
                return v;
            },
            function(c){
                return fn(c.value);
            }
        )
    }

    function filter(genFn, fn){
        if($_.O.isNotFunction(fn)) throw new TypeError();
        var f = function(_,s){
            do {
                var v = genFn();
            }while(!v.done && !fn(v.value));
            if(v.done) return s();
            return v;
        };
        return generator($_.F.curry(f,undefined),f,
            function(v){return v.value}
        )

    }

    function reduce(genFn, fn, memo){
        return generator(genFn,
            function(c,s){
                var v=genFn();
                if(v.done) return s();
                return v;
            },
            function(c){
                return memo = fn(memo, c.value);
            }
        )
    }

    function take(genFn, n){
        n = n-1;
        return generator(genFn,
            function(c,s){
                var v=genFn();
                if(v.done || n == 0) return s();
                n--;
                return v;
            },
            function(v){return v.value}
        )
    }

    function drop(genFn, n){
        return generator(function(s){
                do {
                    var v = genFn();
                }while(!v.done && n-->0);
                if(v.done) return s();
                return v;
            },
            function(c,s){
                var v=genFn();
                if(v.done) return s();
                return v;
            },
            function(v){return v.value}

        )
    }

    function toGenerator(col){
        if($_.O.isNotCollection(col)) throw new TypeError();
        return generator($_.F.toFunction({arr:col, index:0}),
            function(c,s){
                if(++c.index>=c.arr.length){
                    return s();
                }
                return c;
            },function(c){
                return c.arr[c.index]
            });
    }

/*
     Asdf.Gen.consumer(
         Asdf.Gen.take(
             Asdf.Gen.filter(
                 Asdf.Gen.filter(
                     Asdf.Gen.filter(
                         Asdf.Gen.toGenerator(
                             [2,3,4,5,6,7,8,9,10,11,12]
                         ),function(v){console.log('filter 2');return v%2}
                     ), function(v){console.log('filter 3');return v%3}
                 ), function(v){console.log('filter 5');return v%5}
             ),3
         ),function(v){console.log(v)}
     );
*/

    $_.O.extend($_.Gen, {
        generator:generator,
        consumer:consumer,
        map:map,
        filter:filter,
        take:take,
        drop:drop,
        reduce:reduce,
        toGenerator:toGenerator
    });
})(Asdf);