(function($_) {
    /**
     * @namespace
     * @name Asdf.N
     */
	$_.N = {};
	var is =  $_.Core.returnType.is, compose = $_.Core.behavior.compose, iterate = $_.Core.behavior.iterate;
	var curry = $_.Core.combine.curry;
	var partial = $_.Core.combine.partial;
	var not = curry(compose, $_.Core.op["!"]);
	var isNotNaN = not(isNaN);
	function multiply() {
		var arg = $_.A.toArray(arguments);
		arg = $_.A.filter(arg, isNotNaN);
		return $_.A.reduce(arg, $_.Core.op["*"], 1);
	}
	var sum = $_.F.compose($_.Arg.toArray, partial($_.A.filter, undefined, isNotNaN), partial($_.A.reduce, undefined, $_.Core.op["+"], 0));

    /**
     * @memberof Asdf.N
     * @function
     * @param {number} n
     * @param {number} a
     * @param {number} b
     * @returns {boolean}
     */
    var isRange = is(function (n,a,b) { return a<=n && n<=b; });

    /**
     * @memberof Asdf.N
     * @function
     * @param {number} n
     * @param {number} a
     * @param {number} b
     * @returns {boolean}
     */
	var isNotRange = not(isRange);

    /**
     * @memberof Asdf.N
     * @function
     * @param {number} n
     * @returns {boolean}
     */
	var isZero = is(function (n) { return n === 0;});

    /**
     * @memberof Asdf.N
     * @function
     * @param {number} n
     * @returns {boolean}
     */
	var isNotZero = not(isZero);

    /**
     * @memberof Asdf.N
     * @function
     * @param {number} a
     * @param {number} b
     * @returns {boolean}
     */
	var isSame = is(function (a, b) { return a === b;});

    /**
     * @memberof Asdf.N
     * @function
     * @param {number} a
     * @param {number} b
     * @returns {boolean}
     */
	var isNotSame = not(isSame);
	var isGreaterThan = is(function (n, a){ return n > a;});
	var isNotGreaterThan = not(isGreaterThan);
	var isLessThan = is(function (n, a){ return n < a;});
	var isNotLessThan = not(isLessThan);

    /**
     * @memberof Asdf.N
     * @param {number=} start
     * @param {number} end
     * @param {number=} step
     * @returns {Array}
     */
	function range(start, end, step) {
        function integerScale(x){
            var k = 1;
            while (x * k % 1) k *= 10;
            return k;
        }
        if (arguments.length <= 1) {
            end = start || 0;
            start = 0;
        }
        step = arguments[2] || 1;
        if($_.O.isNotNumber(start)||$_.O.isNotNumber(end)||$_.O.isNotNumber(step)) throw new TypeError();
        if(!isFinite((end - start) / step))
             throw new TypeError('length is infinite');
        var integerscale = integerScale(Math.abs(step)),i = start*integerscale, s=start, e=end;
        if(start>end){
            s = end;
            e = start;
        }
        var res = [];
        while(s*integerscale <= i && i <= e*integerscale){
            res.push(i/integerscale);
            i+=step*integerscale;
        }
        return res;
	}

    /**
     * @memberof Asdf.N
     * @param n {number}
     * @returns {boolean}
     */
    function isFinite(n){
        return Number.POSITIVE_INFINITY !== n && Number.NEGATIVE_INFINITY !==n;
    }

    /**
     *
     * @param n {number}
     * @param a {number}
     * @param b {number}
     * @returns {number}
     */
    function clamp(n,a,b){
        if($_.O.isNotNumber(n)||$_.O.isNotNumber(a)||$_.O.isNotNumber(b)) throw new TypeError();
        var min = a, max = b;
        if(min>max){
            min = b;
            max = a;
        }
        return Math.max(min, Math.min(max, n));
    }
    function uninterpolate(x, a, b){
        b = b-(a = +a) ? 1/(b-a):0;
        return (x-a)*b;
    }
    function interpolate(x, a, b){
        b -= a = +a;
        return a + b*x;
    }
    function linear(x, domain, range){
        return interpolate(uninterpolate(x,domain[0],domain[1]), range[0], range[1]);
    }

    function scale(n, domain, range, fn){
        domain = domain || [0,1];
        range = range || [0,1];
        return fn(n, domain, range);
    }
    var scaleLinear = $_.F.partial(scale, undefined, undefined, undefined, linear);
    var scaleLog = $_.F.partial(scale, undefined, undefined, undefined, function(x, domain, range){return linear(Math.log(x)/Math.log(10), [domain[0]/Math.log(10),domain[1]/Math.log(10)], range);});
    var scalePow = $_.F.partial(scale, undefined, undefined, undefined, function(x, domain, range){return linear(Math.pow(10,x), [Math.pow(10,domain[0]),Math.pow(10,domain[1])], range);});
    var scaleSqrt = $_.F.partial(scale, undefined, undefined, undefined, function(x, domain, range){return linear(Math.pow(0.5,x), [Math.pow(0.5,domain[0]),Math.pow(0.5,domain[1])], range);});

    $_.O.extend($_.N, {
		sum: sum,
		isNotNaN: isNotNaN,
		range: range,
		isRange: isRange,
		isNotRange: isNotRange,
		isZero : isZero,
		isNotZero : isNotZero,
		isSame : isSame,
		isNotSame: isNotSame,
		isGreaterThan: isGreaterThan,
		isNotGreaterThan: isNotGreaterThan,
		isLessThan: isLessThan,
		isNotLessThan: isNotLessThan,
		isUntil: isLessThan,
		isNotUntil: isNotLessThan,
        isFinite:isFinite,
        clamp:clamp,
        scale:scale,
        scaleLinear:scaleLinear,
        scaleLog:scaleLog,
        scalePow:scalePow,
        scaleSqrt:scaleSqrt
	});
})(Asdf);