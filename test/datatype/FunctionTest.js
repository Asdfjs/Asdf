module("Asdf.F")
test("Asdf.F.identity", function(){
	equal(Asdf.F.identity('abc'), 'abc', 'indentity ok');
});
test("Asdf.F.bind", function() {
	function fn(){
		return this;
	}
	var obj = {};
	equal(Asdf.F.bind(fn, obj)(), obj, 'bind ok');
});
test("Asdf.F.curry", function() {
	function fn(a,b) {
		return a+b;
	}
	equal(Asdf.F.curry(fn,1,2)(), 3, 'curry ok');
});
test("Asdf.F.wrap", function() {
	function fn(a) {
		return -a;
	}
	equal(Asdf.F.wrap(fn, function(fn, a){ return -fn(a);})(2), 2, 'wrap ok');
});
test("Asdf.F.before", function() {
	function b(a){
		return !a;
	}
	function fn(a){
		return a;
	}
	equal(Asdf.F.before(fn, b)(true), true, 'before ok');
	equal(Asdf.F.before(fn, b, true)(true), false, 'stop ok');
});
test("Asdf.F.after", function() {
	function afterfn(res, a){
		return res *a;
	}
	function fn(a) {
		return a*a;
	}
	equal(Asdf.F.after(fn, afterfn)(2), 8, 'after ok');
	equal(Asdf.F.after(function(){return false}, function(res){ return !res}, true)(), false, 'stop ok');
});
test("Asdf.F.methodize", function() {
	var obj = {};
	function fn(obj) {
		return obj;
	}
	obj.f = Asdf.F.methodize(fn,  obj);
	equal(obj.f(), obj, 'methodize ok');
});
test("Asdf.F.composeRight", function() {
	function fn(a){
		return a*2;
	}
	function fn2(a){
		return a+2;
	}
	equal(Asdf.F.composeRight(fn, fn2)(2), 8, 'composeRight ok');
});
test("Asdf.F.compose", function() {
	function fn(a){
		return a*2;
	}
	function fn2(a){
		return a+2;
	}
	equal(Asdf.F.compose(fn, fn2)(2), 6, 'compose ok');
});
test("Asdf.F.or", function() {
	ok(Asdf.F.or(Asdf.O.isString, Asdf.O.isFunction, Asdf.O.isArray)('string'), 'string');
});

test("Asdf.F.and", function() {
	function fn(a){
		return a<10;
	}
	function fn1(a){
		return a<15;
	}
	function fn2(a){
		return a<20;
	}
	ok(Asdf.F.and(fn, fn1, fn2)(9), 'all true');
});
test("Asdf.F.partial", function(){
	function f(a,b){
		return a/b;
	}
	equal(Asdf.F.partial(f, undefined, 2)(4), 2, 'partial');
    equal(Asdf.F.partial(f, 4)(2), 2, 'partial');
    equal(Asdf.F.partial(f, 4, 2)(), 2, 'partial');
});
test("Asdf.F.orElse", function(){
	function fn(i){
		return i-1;
	}
	function elseFn(i){
		return i+1;
	}
	equal(Asdf.F.orElse(fn, elseFn)(1), 2, 'orElse ok');
});
test("Asdf.F.guarded", function(){
    var fibo = Asdf.F.guarded([
        {
            test: function(n){return n===0},
            fn: function(){return 1}
        },
        {
            test: function(n){return n==1},
            fn: function(){return 1}
        }, {
            test:function(n){return n>1},
            fn: function(n){return fibo(n-2)+fibo(n-1)}
        }
    ]);
    equal(fibo(1), 1, 'fibo 1 ok');
    equal(fibo(2), 2, 'fibo 2 ok');
    equal(fibo(10), 89, 'fibo 89 ok');
});
test("Asdf.F.sequence", function(){
    var f = Asdf.F.sequence(function(){return 1;}, function(){return 2});
    equal(f(), 2, 'sequence ok');
});
test("Asdf.F.overload", function(){
    var add = Asdf.F.overload(function(a,b){return a.length+b.length}, function(a,b){ return Asdf.O.isArray(a) && Asdf.O.isArray(b)});
    add = Asdf.F.overload(function(a,b){return a+b}, function(a,b){ return Asdf.O.isNumber(a) && Asdf.O.isNumber(b)}, add);
    equal(add(1,2), 3, 'ok');
    equal(add([],[]), 0, 'ok');
    throws(function(){add(1,[])}, 'throws');
});
test("Asdf.F.errorHandler", function(){
    function f(){
        throw new Error();
    }
    var ef = Asdf.F.errorHandler(f, function(){return true;});
    equal(ef(), true, 'errorHandler');
});
test("Asdf.F.trys", function(){
    function f1(b){
       if(b)
           throw new Error();
       return 'aaa';
    }
    function f2(b){
        if(b)
            throw new Error();
        return 'bbb';
    }
    function f3(b){
        return 'ccc';
    }

    var f = Asdf.F.trys(f1, f2, f3);

    equal(f(true), 'ccc', 'error test');
    equal(f(false), 'aaa', 'error test');

});
asyncTest("Asdf.F.asyncThen", function(){
    var f = Asdf.F.asyncThen(function(f){
        setTimeout(f, 20);
    }, function(){
        ok(true, 'asyncThen ok');
        start();
    });
    f();
});
asyncTest("Asdf.F.promise", function(){
    var f = Asdf.F.promise(function(cb){
        setTimeout(cb,20);
    });
    f(function(){
        start();
        ok(true, 'promise ok');
    })
});
asyncTest("Asdf.F.asyncSequence", function(){
    var b = false;
    function s(cb){
        setTimeout(function(){cb(2)}, 20);
    }
    var f = Asdf.F.asyncSequence(s,s,s,s);
    f(function(){
        b=true;
        ok(b, 'asyncSequence ok');
        start();
    });
});
asyncTest("Asdf.F.when", function(){
    Asdf.F.when(
        function(cb){setTimeout(function(){cb(1)}, 50)},
        function(cb){setTimeout(function(){cb(2)}, 25)},
        function(cb){setTimeout(function(){cb(3)}, 70)},
        function(cb){setTimeout(function(){cb(4)}, 10)}
    )(function(){
        deepEqual(Asdf.A.toArray(arguments), [1,2,3,4], 'Asdf.F.when ok')
        start();
    })
});

test("Asdf.F.curried", function(){
    function add3(a,b,c){return a+b+c}
    var f = Asdf.F.curried(add3);
    equal(f(1,2,3), 6, 'curry ok');
    equal(f(1)(2)(3), 6, 'curry ok');
    var f1 = Asdf.F.curried(add3, 4);
    equal(f1(1,2,3,4), 6, 'argNum ok');
    equal(f1(1)(2)(3)(4), 6, 'argNum ok');
});

asyncTest("Asdf.F.debounce", function(){
    var i = 0;
    var fn = Asdf.F.debounce(function(){i++},0.1);
    var timer = setInterval(fn, 60);
    Asdf.F.delay(function(){
        clearInterval(timer);
        Asdf.F.delay(function(){
            equal(i, 1, 'Asdf.F.debounce ok');
            start();
        },0.3);
    },0.3);
});

asyncTest("Asdf.F.debounce", function(){
    var i = 0;
    var fn = Asdf.F.throttle(function(){i++},0.1);
    var timer = setInterval(fn, 60);
    Asdf.F.delay(function(){
        clearInterval(timer);
        equal(i, 3, 'Asdf.F.debounce ok');
        start();
    },0.35);
});

test("Asdf.F.once", function(){
    var i = 0;
    var fn = Asdf.F.once(function(){return i++;});
    equal(fn(), 0, '첫번째 결과값은 0');
    equal(fn(), 0, '두번째 결과값은 0');
    equal(i, 1, 'i값은 1');
});

test("Asdf.F.memoize", function(){
    var i = 0;
    var fn = Asdf.F.memoize(function(a){
        i++;
        return a;
    });
    equal(fn(1), 1, '첫번째 연산 ok');
    equal(fn(1), 1, '두번째 연산 ok');
    equal(i, 1, '연산은 한번만 실행되었음');
});

test("Asdf.F.annotate", function(){
    var  fn = function(a,b){return a/b};
    var f = Asdf.F.annotate(fn, {a:1, b:1});
    equal(f({a:4,b:2}), 2, '4/2는 2');
    equal(f({b:2,a:4}), 2, '4/2는 2');
    equal(f({a:2}),2, '2/1(default) 는 2');
});

test("Asdf.F.converge", function(){
    var add = function(a, b) { return a + b; };
    var subtract = function(a, b) { return a - b; };
    var multiply = function(a, b) { return a * b; };
    equal(Asdf.F.converge(multiply, add, subtract)(1, 2), -3, 'converge ok');
});
test("Asdf.F.zip", function(){
   deepEqual(Asdf.F.zip(function(a,b){return a+b},[1,2,3],[1,3,4]), [2,5,7], 'zip ok');
});
test("Asdf.F.complement", function(){
    ok(Asdf.F.complement(Asdf.O.isNotFunction)(function(){}), 'Asdf.complement ok');
});
test("Asdf.F.trampoline", function(){
    equal(Asdf.F.trampoline(function(arr, sum){
        return function r(){
            if(arr.length ==0) return sum;
            sum+=arr.pop();
            return r;
        }
    },[1,2,3,4,5,6,7],0),28, "Asdf.F.trampoline ok");
});