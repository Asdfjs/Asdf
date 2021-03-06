(function($_) {
    /**
     * @namespace
     * @name Asdf.Gen
     */
    $_.Gen = {};
    /**
     * @member Asdf.Gen
     * @param {Function} initFn
     * @param {Function} nextFn
     * @param {Function=} returnFn
     * @returns {Function}
     */
    function generator(initFn, nextFn, returnFn){
        if($_.O.isNotFunction(initFn)||$_.O.isNotFunction(nextFn)) throw new TypeError();
        var state = 0; //0:pending, 1:running, 2:done
        var current;
        returnFn = returnFn||$_.F.identity;
        function stop(){
            state = 2;
        }
        return function(){
            var arg = $_.A.toArray(arguments);
            if(state === 2){
                return {done:true}
            }else {
                if(state === 0){
                    state = 1;
                    current = initFn.call(this, stop);
                }else {
                    arg.unshift(stop);
                    arg.unshift(current);
                    current = nextFn.apply(this, arg);
                }
                if (state === 2) {
                    return {done: true}
                }
                return {value: returnFn(current), done: false};
            }
        }
    }

    /**
     * @member Asdf.Gen
     * @param {Function} genFn
     * @param {Function} fn
     */
    function consumer(genFn, fn){
        if($_.O.isNotFunction(genFn)||$_.O.isNotFunction(fn)) throw new TypeError();
        for(var v =genFn(); !v.done;v=genFn()){
            fn(v.value, v.done);
        }
    }

    /**
     * @member Asdf.Gen
     * @param {Function} genFn
     * @param {Function} fn
     * @returns {Function}
     */
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

    /**
     * @member Asdf.Gen
     * @param {Function} genFn
     * @param {Function} fn
     * @returns {Function}
     */
    function filter(genFn, fn){
        if($_.O.isNotFunction(fn)) throw new TypeError();
        var f = function(_,s){
            var v;
            do {
                v = genFn();
            }while(!v.done && !fn(v.value));
            if(v.done) return s();
            return v;
        };
        return generator($_.F.curry(f,undefined),f,
            function(v){return v.value}
        )

    }

    /**
     * @member Asdf.Gen
     * @param {Function} genFn
     * @param {Function} fn
     * @param {*} memo
     * @returns {Function}
     */
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

    /**
     * @member Asdf.Gen
     * @param {Function} genFn
     * @param {number} n
     * @returns {Function}
     */
    function take(genFn, n){
        n = n-1;
        return generator(genFn,
            function(c,s){
                var v=genFn();
                if(v.done || n === 0) return s();
                n--;
                return v;
            },
            function(v){return v.value}
        )
    }

    /**
     * @member Asdf.Gen
     * @param {Function} genFn
     * @param {number} n
     * @returns {Function}
     */
    function drop(genFn, n){
        return generator(function(s){
                var v;
                do {
                    v = genFn();
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

    /**
     * @member Asdf.Gen
     * @param {Collection} col
     * @returns {Function}
     */
    function collectionToGenerator(col){
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
    function treeToGenerator(tree, conf){
        conf = $_.O.extend({
            children: 'children'
        },conf);
        if(!$_.Tree.isTree(tree, conf)) throw new TypeError();
        return generator($_.F.toFunction({node:tree,q:$_.A.toArray(tree[conf.children])}),
            function(c,s){
                if(c.q.length === 0) return s();
                c.node = c.q.shift();
                var children = c.node[conf.children];
                var i = children.length;
                while(i--){
                    c.q.unshift(children[i]);
                }
                return c;
            }, function(c){
                return c.node;
            }
        )
    }
    function toGenerator(obj){
        if($_.O.isCollection(obj)){
            return collectionToGenerator(obj);
        }else if($_.Tree.isTree(obj)){
            return treeToGenerator(obj);
        }else {
            throw new TypeError();
        }
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
        collectionToGenerator:collectionToGenerator,
        treeToGenerator:treeToGenerator,
        toGenerator:toGenerator
    });
})(Asdf);