(function($_) {
    /**
     * @namespace
     * @name Asdf.N
     */
	$_.N = {};
	var is =  $_.Core.returnType.is, compose = $_.Core.behavior.compose;
	var curry = $_.Core.combine.curry;
	var partial = $_.Core.combine.partial;
	var not = curry(compose, $_.Core.op["!"]);
	var isNotNaN = not(isNaN);
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
     * @desc half-open interval
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
        while(s*integerscale <= i && i < e*integerscale){
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
        clamp:clamp
	});
})(Asdf);