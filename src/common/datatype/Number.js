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
        if (arguments.length <= 1) {
            end = start || 0;
            start = 0;
        }
        step = arguments[2] || 1;
        if($_.O.isNotNumber(start)||$_.O.isNotNumber(end)||$_.O.isNotNumber(step)) throw new TypeError();
        if(!Number.isFinite((end - start) / step))
             throw new TypeError('length is infinite');
        var i = start, s=start, e=end;
        if(start>end){
            s = end;
            e = start;
        }
        var res = [];
        while(s <= i && i <= e){
            res.push(i);
            i+=step;
        }
        return res;
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
		isNotUntil: isNotLessThan
	});
})(Asdf);