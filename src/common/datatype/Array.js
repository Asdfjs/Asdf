/**
 * @project Asdf.js
 * @author N3735
 * @namespace
 * @name Asdf.A
 */
(function($_) {
	$_.A = {};
	var arrayProto = Array.prototype, slice = arrayProto.slice, nativeForEach = arrayProto.forEach, nativeMap = arrayProto.map, nativeReduce = arrayProto.reduce, nativeReduceRight = arrayProto.reduceRight, nativeFilter = arrayProto.filter, nativeEvery = arrayProto.every, nativeSome = arrayProto.some, nativeIndexOf = arrayProto.indexOf, nativeLastIndexOf = arrayProto.lastIndexOf;
	var partial = $_.Core.combine.partial;
	var inc = $_.Core.op.inc;
	var coreEach = $_.Core.behavior.each;
	var compose = $_.Core.behavior.compose;
	var curry = $_.Core.combine.curry;
	var extract = $_.Core.combine.extract;
	var not = curry(compose, $_.Core.op["!"]);
	var isEnd = function (i, col){return i >= col.length; };
	var isNotEnd = not(isEnd);
	var _each = partial(coreEach, undefined, 0, extract(isNotEnd, 1), inc, undefined, undefined);
	var _eachWithTermination = partial(coreEach, undefined, 0, undefined, inc, undefined, undefined);
	
	/**
	 * @memberof Asdf.Asdf.A
	 * @param {collection|Array} col collection 객체
	 * @param {function} iterator 실행 함수 인자값으로 value, key, col이 들어간다.
	 * @param {object=} context iterator의 context
	 * @desc collection을 순환하면서 iterator를 실행한다.
	 * @example
	 * Asdf.A.each([1,2,3,4,5], function(n, index){ console.log('index : '+ index + ' / value : ' + n)})
	 * index : 0 / value: 1
	 * index : 1 / value: 2
	 * index : 2 / value: 3
	 * index : 3 / value: 4
	 * index : 4 / value: 5
	 */
	function each(col, iterator, context) {
		if (col == null || $_.O.isNotCollection(col)) throw new TypeError();
		if (nativeForEach && col.forEach === nativeForEach) {
			return col.forEach(iterator, context);
		}
		_each(col, iterator, context);
	}
	
	/**
	 * @memberof Asdf.Asdf.A
	 * @param {collection|Array} col collection 객체
	 * @param {function} iterator 실행 함수 인자값으로 value, key, col이 들어간다.
	 * @param {object=} context iterator의 context
	 * @returns {Array} collection을 순환 하면서 iterator 실행 결과를 array type으로 반환한다.
	 * @desc collection을 순환하면서 iterator를 실행결과를 반환한다.
	 * @example
	 * Asdf.A.map([1,2,3,4,5], function(n, index){ return n+1 }) //return [2,3,4,5,6]
	 */
	function map(col, iterator, context) {
		var results = [];
		if (col == null || $_.O.isNotCollection(col))
			throw new TypeError();
		if (nativeMap && col.map === nativeMap)
			return col.map(iterator, context);
		_each(col, function(value, index, list) {
			results[results.length] = iterator.call(context, value, index, list);
		});
		return results;
	}
	
	/**
	 * @memberof Asdf.Asdf.A
	 * @param {collection|Array} col collection 객체
	 * @param {function} iterator 실행 함수 인자값으로 value, key, col이 들어간다.
	 * @param {*} memo 초기 값
	 * @param {object=} context iterator의 context
	 * @returns {*} 각 식의 반환 값을 누적한 후, 최종 값을 반환한다.
	 * @desc iterator 반환값을 누적한 후 최종 값을 반환한다.
	 * @example
	 * Asdf.A.reduce([1,2,3], function(a,b){ return a+b; }, 0) //return 6
	 */
	function reduce(col, iterator, memo, context) {
		var initial = arguments.length > 2;
		if (col == null || $_.O.isNotCollection(col))
			throw new TypeError();
		if (nativeReduce && col.reduce === nativeReduce) {
			if (context)
				iterator = $_.F.bind(iterator, context);
			return initial ? col.reduce(iterator, memo) : col.reduce(iterator);
		}
		each(col, function(value, index, list) {
			if (!initial) {
				memo = value;
				initial = true;
			} else {
				memo = iterator.call(context, memo, value, index, list);
			}
		});
		if (!initial)
			throw new TypeError('Reduce of empty array with no initial value');
		return memo;
	}
	
	/**
	 * @memberof Asdf.Asdf.A
	 * @param {collection|Array} col collection 객체
	 * @param {function} iterator 실행 함수 인자값으로 value, key, col이 들어간다.
	 * @param {*} memo 초기 값
	 * @param {object=} context iterator의 context
	 * @returns {*} 각 식의 반환 값을 누적한 후, 최종 값을 반환한다.
	 * @desc iterator 반환값을 누적을 오른쪽 부터 시작하여 왼쪽으로 진행한 후 최종 값을 반환한다.
	 * @example
	 * Asdf.A.reduceRight([-1,-2,-3], function(a,b){ return a-b; }, 4) //return 10
	 */
	function reduceRight(col, iterator, memo, context) {
		var initial = arguments.length > 2;
		if (col == null || $_.O.isNotCollection(col))
			throw new TypeError();
		if (nativeReduceRight && col.reduceRight === nativeReduceRight) {
			if (context)
				iterator = $_.F.bind(iterator, context);
			return initial ? col.reduceRight(iterator, memo) : col.reduceRight(iterator);
		}
		var reversed = toArray(col).reverse();
		if (context && !initial)
			iterator = $_.F.bind(iterator, context);
		return initial ? reduce(reversed, iterator, memo, context): reduce(reversed, iterator);
	}
	
	/**
	 * @memberof Asdf.Asdf.A
	 * @param {collection} first 대상 객체
	 * @param {collection} second 추가 객체
	 * @returns {collection} first에 second를 추가한다.  first 객체를 반환한다.
	 * @desc 두개의 객체를 합치는 것에 대해서는 concat과 유사하지만, 새로운 collection 객체를 생성하여 반환하는 것이 아니라, first 객체에 second 객체를 추가하여 반환하는것이다. 
	 * @example
	 * var a1 = [1,2,3];
	 * var a2 = [4,5,6]
	 * Asdf.A.merge(a1, a2) // return [1,2,3,4,5,6];
	 * console.log(a1) //[1,2,3,4,5,6];
	 */
	function merge( first, second ) {
		if ($_.O.isNotCollection(first)||$_.O.isNotCollection(second))
			throw new TypeError();
		if(first.push){
			first.push.apply(first, second);
			return first;
		}
		var fl = first.length, l = fl + second.length;
		each(second, function (value, key,list){
			first[fl+key] = value;
		} );
		first.length = l;
		return first;
	}
	
	/**
	 * @memberof Asdf.Asdf.A
	 * @param {collection} col 대상 객체
	 * @param {number} [n=0] index
	 * @returns {*} col[n]값을 반환한다.
	 * @desc col[n]값을 반환한다.
	 */
	function get(col, n){
		n == null && (n = 0);
		return col[n];
	}
	
	/**
	 * @memberof Asdf.Asdf.A
	 * @func
	 * @param {collection|Array} col 대상 객체
	 * @returns {*} col[0]값을 반환한다.
	 * @desc col[0]값을 반환한다.
	 */
	var first = partial(get, undefined, 0);
	
	/**
	 * @memberof Asdf.Asdf.A
	 * @func
	 * @param {collection|Array} col 대상 객체
	 * @returns {*} col[col.length-1]값을 반환한다.
	 * @desc col[length-1]값을 반환한다.
	 */
	function last(col) {
		return col[col.length-1];
	}
	
	/**
	 * @memberof Asdf.Asdf.A
	 * @func
	 * @param {collection|Array} col 대상 객체
	 * @param {function} iterator 실행 함수 인자값으로 value, key, col이 들어간다.
	 * @param {object=} context iterator의 context
	 * @returns {Array} iterator실행이 참으로 만족하는 값만 추출하여 반환한다.
	 * @desc context에서 iterator 실행이 참으로 만족하는 값만 반환한다. iterator에 인자값은 value, index, col가 들어간다.
	 * @example
	 * Asdf.A.filter([1, 2, 3, 4, 5, 6], function(n, index){return n > 3; }) //return [4,5,6];
	 */
	function filter(col, iterator, context) {
		var results = [];
		if (col == null || $_.O.isNotCollection(col))
			throw new TypeError();
		if (nativeFilter && col.filter === nativeFilter)
			return col.filter(iterator, context);
		each(col, function(value, index, list) {
			if (iterator.call(context, value, index, list))
				results[results.length] = value;
		});
		return results;
	}
	/**
	 * @memberof Asdf.Asdf.A
	 * @func
	 * @param {collection|Array} col 대상 객체
	 * @param {function} iterator 실행 함수 인자값으로 value, key, col이 들어간다.
	 * @param {object=} context iterator의 context
	 * @returns {Array} iterator실행이 거짓으로 만족하는 값만 추출하여 반환한다.
	 * @desc context에서 iterator 실행이 거짓으로 만족하는 값만 반환한다. iterator에 인자값은 value, index, col가 들어간다.
	 * @example
	 * Asdf.A.reject([1, 2, 3, 4, 5, 6], function(n, index){return n > 3; }) //return [1,2,3];
	 */
	function reject(col, iterator, context) {
		return filter(col, not(iterator), context);
	}
	
	/**
	 * @memberof Asdf.Asdf.A
	 * @func
	 * @param {collection|Array} col 대상 객체
	 * @param {function} iterator 실행 함수 인자값으로 value, key, col이 들어간다.
	 * @param {object=} context iterator의 context
	 * @returns {boolean} iterator실행이 결과가 모두 참인 경우 참을 반환한다. 
	 * @desc context에서 iterator 실행이 모두 참인 경우 참으로 반환한다. iterator에 인자값은 value, index, col가 들어간다.
	 * @example
	 * Asdf.A.every([1, 2, 3, 4, 5, 6], function(n, index){return n > 3; }) //return false;
	 */
	function every(col, iterator, context) {
	    if (col == null || $_.O.isNotCollection(col))
			throw new TypeError();
		if (nativeEvery && col.every === nativeEvery)
			return col.every(iterator, context);
		 var result = true;
		_eachWithTermination(col, 
				function (value, index, list) { return isNotEnd(index, list) && (result = iterator.call(context, value, index, list));}, 
				function () {});
		return !!result;
	}
	
	/**
	 * @memberof Asdf.Asdf.A
	 * @func
	 * @param {collection|Array} col 대상 객체
	 * @param {function} iterator 실행 함수 인자값으로 value, key, col이 들어간다.
	 * @param {object=} context iterator의 context
	 * @returns {boolean} iterator실행이 결과가 하나 이상 참인 경우 참을 반환한다. 
	 * @desc context에서 iterator 실행이 하나 이상 참인 경우 참으로 반환한다. iterator에 인자값은 value, index, col가 들어간다.
	 * @example
	 * Asdf.A.any([1, 2, 3, 4, 5, 6], function(n, index){return n > 3; }) //return true;
	 */
	function any(col, iterator, context) {
		if (col == null || $_.O.isNotCollection(col))
			throw new TypeError();
		if (nativeSome && col.some === nativeSome)
			return col.some(iterator, context);
		var result = false;
		_eachWithTermination(col, 
				function (value, index, list) { return isNotEnd(index, list) && !(result = iterator.call(context, value, index, list));}, 
				function () {});
		return !!result;
	}
	
	/**
	 * @memberof Asdf.Asdf.A
	 * @func
	 * @param {collection} col 대상 객체
	 * @param {*} target 비교 값
	 * @returns {boolean} col 안에 target이 존재 하면 true를 반환한다. 
	 * @desc col안에 target이 존재 하면 true를 반환한다.
	 * @example
	 * Asdf.A.include([1, 2, 3, 4, 5, 6], 1) //return true;
	 */
	function include(col, target) {
		if (col == null || $_.O.isNotCollection(col))
			throw new TypeError();
		if (nativeIndexOf && col.indexOf === nativeIndexOf)
			return col.indexOf(target) != -1;
		return any(col, function(value) {
			return value === target;
		});
	}
	
	/**
	 * @memberof Asdf.Asdf.A
	 * @func
	 * @param {collection} col 대상 객체
	 * @param {(string|function)} method 이름 또는 function
	 * @param {...*=} arg method에 들어갈 인자 값
	 * @returns {Array} collection 객체에 method를 실행한 결과를 array Type으로 반환한다.
	 * @desc 각각의 collection객체 안을 순환하면서 method를 실행하고 그 결과를 반환한다.  
	 * @example
	 * Asdf.A.invoke([[3,1,2],['c','b','a']], 'sort') //return [[1,2,3],['a','b','c']];
	 */
	function invoke(col, method) {
		if (col == null || $_.O.isNotCollection(col))
			throw new TypeError();
		var args = slice.call(arguments, 2);
		return map(col, function(obj) {
			return ($_.O.isFunction(method) ? method : $_.O.isFunction(obj[method])? obj[method]: function() {return obj[method];}).apply(obj, args);
		});
	}
	
	/**
	 * @memberof Asdf.Asdf.A
	 * @func
	 * @param {collection|Array} col 대상 객체
	 * @param {String} key
	 * @returns {Array} collection 객체에서 key값을 추출하여 반환한다.
	 * @desc 각각의 collection객체 안을 순환하면서 각각의 객체의 key값을 추출하여 반환한다.
	 * @example
	 * Asdf.A.pluck([[1, 2, 3, 4, 5, 6], [1,2,3]], 'length') //return [6,3]
	 */
	function pluck(col, key) {
		if (col == null || $_.O.isNotCollection(col))
			throw new TypeError();
		return map(col, function(obj){ return obj[key]; });
	}
	/**
	 * @memberof Asdf.Asdf.A
	 * @func
	 * @param {collection} col 대상 객체
	 * @param {function=} iterator
	 * @param {object=} context
	 * @returns {*} collection 에서 가장 큰 값을 반환한다. 
	 * @desc collection에서 가장 큰 값을 반환한다. 단 iterator가 정의 되어 있으면 해당 iterator를 실행하고 그 결과가 가장 큰 값을 반환한다.
	 * @example
	 * Asdf.A.max([1, 2, 3, 4, 5, 6], function(v){ return -v;}) //return 1
	 */
	function max(col, iterator, context) {
		if (col == null || $_.O.isNotCollection(col))
			throw new TypeError();
		iterator = iterator||function (value){return value;};
		var result = reduce(col, function(memo, value, index, list) {
			var computed = iterator.call(context, value, index, list);
			return computed >= memo.computed? {computed: computed, value: value}: memo;
		}, { computed : -Infinity } );
		return result.value;
	}
	
	/**
	 * @memberof Asdf.Asdf.A
	 * @func
	 * @param {collection} col 대상 객체
	 * @param {function=} iterator
	 * @param {object=} context
	 * @returns {*} collection 에서 가장 작은 값을 반환한다. 
	 * @desc collection에서 가장 작은 값을 반환한다. 단 iterator가 정의 되어 있으면 해당 iterator를 실행하고 그 결과가 가장 작은 값을 반환한다.
	 * @example
	 * Asdf.A.min([1, 2, 3, 4, 5, 6], function(v){ return -v;}) //return 6
	 */
	function min(col, iterator, context) {
		if (col == null || $_.O.isNotCollection(col))
			throw new TypeError();
		iterator = iterator||function (value){return value;};
		var result = reduce(col, function(memo, value, index, list) {
			var computed = iterator.call(context, value, index, list);
			return computed < memo.computed? {computed: computed, value: value}: memo;
		}, { computed : Infinity } );
		return result.value;
	}
	
	/**
	 * @memberof Asdf.Asdf.A
	 * @func
	 * @param {collection} col 대상 객체
	 * @returns {Array} 대상객체를 섞은 후 반환한다.
	 * @desc 대상 객체를 섞은 후 반환한다.
	 * @example
	 * Asdf.A.shuffle([1, 2, 3, 4, 5, 6]) //return [3, 1, 4, 2, 5, 6]
	 */
	function shuffle(col) {
		if (col == null || $_.O.isNotCollection(col))
			throw new TypeError();
		var shuffled = [], rand;
		each(col, function(value, index, list) {
			rand = Math.floor(Math.random() * (index + 1));
			shuffled[index] = shuffled[rand];
			shuffled[rand] = value;
		});
		return shuffled;
	}
	
	/**
	 * @memberof Asdf.Asdf.A
	 * @func
	 * @param {Array} arr 대상 객체
	 * @param {function=} sortfn 정렬 함수
	 * @returns {Array} 대상 객체를 sort함수에 맞춰 정렬 한 후 array 객체를 반환한다.
	 * @desc 대상 객체를 정렬한다. sort 함수를 생략 시 정렬의 기본 sort를 실행한다.
	 * @example
	 * Asdf.A.sort([2,1,3]) //return [1,2,3]
	 */
	function sort(arr, sortfn){
		if($_.O.isNotArray(arr)) throw new TypeError();
		return arr.sort(sortfn||asc);
	}
	function desc(a, b) {
		if(a == null)
			return 1;
		if(b == null)
			return -1;
		if(a == b)
			return 0;
		if(a < b)
			return 1;
		if(a > b)
			return -1;
	}
	function asc(a, b) {
		if(a == null)
			return 1;
		if(b == null)
			return -1;
		if(a == b)
			return 0;
		if(a > b)
			return 1;
		if(a < b)
			return -1;
		
	}
	
	/**
	 * @memberof Asdf.Asdf.A
	 * @func
	 * @param {Array} arr 대상 객체
	 * @param {string|function} key key값
	 * @param {function=} order 정렬 함수
	 * @returns {Array} 특정 key값으로 정렬한 후 결과 값을 반환한다.
	 * @desc arr안에 객체를 key 값을 기준으로 정렬한다. sort함수가 없는 경우 오름차순으로 정렬한다.
	 * @example
	 * Asdf.A.sortBy([[3,1],[4],[2,6,3]], 'length') //return [[4],[3,1],[2,6,3]]
	 */
	function sortBy(arr, key, order) {
		if($_.O.isNotArray(arr)||($_.O.isNotString(key)&&$_.O.isNotFunction(key))) throw new TypeError();
		order = order || asc;
		return sort(arr, function(a, b){return order(($_.O.isFunction(key) ? key : $_.O.isFunction(a[key])? a[key]: function() {return a[key];}).call(a)
            , ($_.O.isFunction(key) ? key : $_.O.isFunction(b[key])? b[key]: function() {return b[key];}).call(b));});
	}
	
	/**
	 * @memberof Asdf.Asdf.A
	 * @func
	 * @param {collection} col 대상 객체
	 * @param {(string|function)} key key값 또는 처리 함수 값
	 * @param {object=} context 함수 시 실행 context
	 * @returns {object} 특정 key값으로 정렬한 후 결과 값을 반환한다. 
	 * @desc arr 객체를 key를 통해 그룹을 만든다.
	 * @example
	 * Asdf.A.groupBy([1.3, 2.1, 2.4], function(num){ return Math.floor(num); }); //return {1:[1.3],2:[2.1,2,4]}
	 */
	function groupBy(col,key, context) {
		if (col == null || $_.O.isNotCollection(col))
			throw new TypeError();
		if (!($_.O.isString(key)||$_.O.isFunction(key)))
			throw new TypeError();
		var result = {};
		each(col, function(value, index, list) {
			var k = ($_.O.isFunction(key))? key.call(context,value):value[key];
			(result[k] || (result[k] = [])).push(value);
		});
		return result;
	}
	
	function bisectLeft(array, obj, iterator) {
		iterator || (iterator = $_.F.identity);
		var low = 0, high = array.length;
        var value =  iterator(obj);
		while (low < high) {
			var mid = (low + high) >>> 1;
			iterator(array[mid]) < value ? low = mid + 1
					: high = mid;
		}
		return low;
	}

    function bisectRight(array, obj, iterator) {
        iterator || (iterator = $_.F.identity);
        var low = 0, high = array.length;
        var value =  iterator(obj);
        while (low < high) {
            var mid = (low + high) >>> 1;
            iterator(array[mid]) > value ? high = mid
                : low = mid+1;
        }
        return low;
    }
	
	/**
	 * @memberof Asdf.Asdf.A
	 * @func
	 * @param {collection|Array} col 대상 객체
	 * @returns {Array} array를 반환한다.
	 * @desc collection 객체를 받아서 array객체로 변환한다.
	 */
	function toArray(col) {
		if (col == null || $_.O.isNotCollection(col))
			throw new TypeError();
		if ($_.O.isArray(col))
			return col;
		if ($_.O.isArguments(col))
			return slice.call(col);
		if (col.toArray && $_.O.isFunction(col.toArray))
			return col.toArray();
		var length = col.length || 0, results = new Array(length);
		while (length--) results[length] = col[length];
		return results;
	}
	
	/**
	 * @memberof Asdf.Asdf.A
	 * @func
	 * @param {collection} col 대상 객체
	 * @returns {number} col.length를 반환한다.
	 * @desc collection 객체를 받아서 length를 변환한다.
	 */
	function size(col) {
		if (col == null || $_.O.isNotCollection(col))
			throw new TypeError();
		return col.length;
	}
	
	/**
	 * @memberof Asdf.Asdf.A
	 * @func
	 * @param {Array} array 대상 객체
	 * @returns {Array} 빈 대상 객체를 반환한다.
	 * @desc array.length가 0인 빈 array를 반환한다.
	 */
	function clear(array) {
		if($_.O.isNotArray(array)) throw new TypeError();
		array.length = 0;
		return array;
	}
	
	function initial(array, n) {
		if($_.O.isNotArray(array)) throw new TypeError();
		n == null && (n=1);
		return slice.call(array, 0, array.length - n);
	}
	
	/**
	 * @memberof Asdf.Asdf.A
	 * @func
	 * @param {Array} array 대상 객체
	 * @param {number} [n=1] 버릴 갯수
	 * @returns {Array} 앞부터 n개를 버린 array를 반환한다.
	 * @desc array에서 n부터 나머지 array를 반환한다.
	 */
	function rest(array, n){
		if($_.O.isNotArray(array)) throw new TypeError();
		n == null && (n=1);
		return slice.call(array, n);
	}
	
	/**
	 * @memberof Asdf.Asdf.A
	 * @func
	 * @param {Array} array 대상 객체
	 * @returns {Array} ==false인 values를 제거하고 나머지 array를 반환한다.
	 * @desc ==false('',0,null,undefined,false..)인 values을 제거한 array를 반환한다.
	 * @example
	 * Asdf.A.compact([1,null,undefined, false, '', 4]); //return [1,4]
	 */
	function compact(array) {
		if($_.O.isNotArray(array)) throw new TypeError();
		return filter(array, function(value){ return !!value; });
	}
	
	/**
	 * @memberof Asdf.Asdf.A
	 * @func
	 * @param {Array} array 대상 객체
	 * @param {boolean=} shallow deep여부 false면 deep 
	 * @returns {Array} array를 평탄하게 하여 반환한다.
	 * @desc ==false('',0,null,undefined,false..)인 values을 제거한 array를 반환한다.
	 * @example
	 * Asdf.A.flatten([1,[2],[3,[4]]]); //return [1,2,3,4]
	 * Asdf.A.flatten([1,[2],[3,[4]]], true); //return [1,2,3,[4]]
	 */
	function flatten(array, shallow) {
		if($_.O.isNotArray(array)) throw new TypeError();
		return reduce(array, function(memo, value) {
		      if ($_.O.isArray(value)) return memo.concat(shallow ? value : flatten(value));
		      memo[memo.length] = value;
		      return memo;
		    }, []);
	}
	
	/**
	 * @memberof Asdf.Asdf.A
	 * @func
	 * @param {Array} array 대상 객체
	 * @param {...*=} values 대상 객체
	 * @returns {Array} array에서 value를 제거한 리스트를 리턴한다.
	 * @desc array에서 values와 ===참인 값을 제거하여 array를 반환한다.
	 * @example
	 * Asdf.A.without([1,2,3],1,2); //return [3]
	 */
	function without(array) {
		if($_.O.isNotArray(array)) throw new TypeError();
		return difference(array, slice.call(arguments, 1));
	}
	
	/**
	 * @memberof Asdf.Asdf.A
	 * @func
	 * @param {Array} array 대상 객체
	 * @param {boolean=} isSorted 정렬 여부
	 * @param {function=} iterator 변형 함수
	 * @returns {Array} array에 있는 값 중 중복된 값을 제거한 후 array를 반환한다.
	 * @desc array에서 iterator변형 함수가 존재하면 값을 변형한 후 중복된 값을 제거한다.
	 * @example
	 * Asdf.A.unique([1,2,1]); //return [1,2]
	 */
	function unique(array, isSorted, iterator) {
		var initial = iterator ? map(array, iterator) : array;
		var results = [];
		if (array.length < 3)
			isSorted = true;
		reduce(initial, function(memo, value, index) {
			if (isSorted ? last(memo) !== value || !memo.length
					: !include(memo, value)) {
				memo.push(value);
				results.push(array[index]);
			}
			return memo;
		}, []);
		return results;
	}
	
	/**
	 * @memberof Asdf.Asdf.A
	 * @func
	 * @param {...Array} array 대상 객체
	 * @returns {Array} array들의 합집합을 반환한다.
	 * @desc array들의 합집합을 반환한다.
	 * @example
	 * Asdf.A.union([1,2,3],[3,4,5],[1,6]); //return [1,2,3,4,5,6];
	 */
	function union() {
		 return unique(flatten(arguments, true));
	}
	
	/**
	 * @memberof Asdf.A
	 * @func
	 * @param {...Array} array 대상 객체
	 * @returns {Array} array들의 교집합을 반환한다.
	 * @desc array들의 교집합을 반환한다.
	 * @example
	 * Asdf.A.intersection([1,2,3],[1,6]); //return [1];
	 */
	function intersection(array) {
		var rest = slice.call(arguments, 1);
		return filter(unique(array), function(item) {
			return every(rest, function(other) {
				return indexOf(other, item) >= 0;
			});
		});
	}
	
	/**
	 * @memberof Asdf.A
	 * @func
	 * @param {Array} array 대상 객체
	 * @param {...Array} others array 객체
	 * @returns {Array} array에서 others의 차집합을 반환한다.
	 * @desc array에서 others의 차집합을 반환한다.
	 * @example
	 * Asdf.A.difference([1,2,3],[3,4,5],[1,6]); //return [2];
	 */
	function difference(array) {
		var rest = flatten(slice.call(arguments, 1), true);
	    return filter(array, function(value){ return !include(rest, value); });
	}
	
	/**
	 * @memberof Asdf.A
	 * @func
	 * @param {...Array} array 대상 객체들
	 * @returns {Array} 대상 객체들이 합쳐친 array 객체를 반환한다.
	 * @desc 같은 position에 있는 값을 합쳐서 array로 반환한다.
	 * @example
	 * Asdf.A.zip([1,2,3],[3,4,5],[1,6]); //return [[1,3,1], [2,4,6], [3,5, undefined]];
	 */
	function zip() {
		var args = slice.call(arguments);
	    var length = max(pluck(args, 'length'));
	    var results = new Array(length);
	    for (var i = 0; i < length; i++) results[i] = pluck(args, "" + i);
	    return results;
	}

    function xprod(){
        var args = slice.call(arguments);
        var self = this;
        var res = [];
        var a1 = args.shift();
        for(var j = 0; j < a1.length; j++){
            if(args.length === 0){
                res.push([a1[j]]);
            }else {
                var t = map(xprod.apply(self,args), function(v){
                    return prepend(v,a1[j]);
                });
                merge(res,t);
            }
        }
        return res;
    }
	
	/**
	 * @memberof Asdf.A
	 * @func
	 * @param {Array} array 대상 객체
	 * @param {*} item 찾는 값
	 * @param {boolean=} isSorted 정렬 여부
	 * @returns {Number} array에서 item값을 찾아 그 위치를 반환한다.
	 * @desc Array에서 item 위치를 앞부터 찾아서 그 위치를 반환한다. 만약 없을 경우 -1을 반환한다.
	 * @example
	 * Asdf.A.indexOf([1,2,3,4,2], 2); //return 1;
	 */
	function indexOf(array, item, isSorted) {
		if (array == null) return -1;
	    var i, l;
	    if (isSorted) {
	      i = sortedIndex(array, item);
	      return array[i] === item ? i : -1;
	    }
	    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item);
	    for (i = 0, l = array.length; i < l; i++) if (i in array && array[i] === item) return i;
	    return -1;
	}
	
	/**
	 * @memberof Asdf.A
	 * @func
	 * @param {Array} array 대상 객체
	 * @param {*} item 찾는 값
	 * @returns {Number} array에서 item값을 찾아 그 위치를 반환한다.
	 * @desc array에서 item 위치를 뒤부터 찾아서 그 위치를 반환한다. 만약 없을 경우 -1을 반환한다.
	 * @example
	 * Asdf.A.lastIndexOf([1,2,3,4,2], 2); //return 4;
	 */
	function lastIndexOf(array, item) {
		if (array == null) return -1;
	    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) return array.lastIndexOf(item);
	    var i = array.length;
	    while (i--) if (i in array && array[i] === item) return i;
	    return -1;
	}
	
	/**
	 * @memberof Asdf.A
	 * @func
	 * @param {Array} array 대상 객체
	 * @param {Array} fns [function1, functio2..]
	 * @returns {Array} [fns[0](array[0]), fns[1](array[1]),...]을 반환한다.
	 * @desc {Array} [fns[0](array[0]), fns[1](array[1],...]을 반환한다.
	 * @example
	 * Asdf.A.batch([1,2,3,4], [function(a){return a-1}, function(a){return a*2}]); //return [0,4,3,4];
	 */
	function batch(array, fns){
		if($_.O.isNotArray(array)) throw new TypeError();
		return map(array, function(value, i){
			return ($_.O.isFunction(fns[i]))? fns[i](value): value;
		});
	}
	
	/**
	 * @memberof Asdf.A
	 * @func
	 * @param {Array} array 대상 객체
	 * @param {function} fn 실행 함수
     * @param {Object} context 실행 context
	 * @desc {Array} array를 fn의 인자값으로 사용한다.
	 * @example
	 * Asdf.A.batch([1,2,3,4], [function(a){return a-1}, function(a){return a*2}]); //return [0,4,3,4];
	 */
	function toArguments(array, fn, context){
		if($_.O.isNotArray(array)||$_.O.isNotFunction(fn)) throw new TypeError();
		return fn.apply(context, array);
	}

    function contains(array, item, context){
        return Asdf.O.isFunction(item)?_containsWith(array,item, context):indexOf(array, item) >= 0;
    }

    function _containsWith(array, fn,context){
        for(var i =0; i < array.length; i++){
            if(fn.call(context, array[i], i, array)){
                return true;
            }
        }
        return false;
    }

    function concat(array){
        return arrayProto.concat.apply(arrayProto, arguments);
    }

    function count(array, fn, context){
        var res = 0;
        each(array, function(v, i, l){
           if(fn.call(context, v, i, l))
            ++res;
        });
        return res;
    }

    function repeat(value, n, args){
        var arr = [];
        for(var i = 0 ;  i < n ; i++){
            arr[i] = Asdf.O.isFunction(value)? value.apply(this,slice.call(arguments, 2)):value;
        }
        return arr;
    }

    function rotate(array, n){
        if(Asdf.O.isNotArray(array)||Asdf.O.isNotNumber(n)) throw new TypeError();
        n %= array.length;
        if(n>0){
            arrayProto.unshift.apply(array, array.splice(-n, n));
        }else if(n<0){
            arrayProto.push.apply(array, array.splice(0, -n));
        }
        return array;
    }

    /**
     * @memberof Asdf.A
     * @param {Array} array
     * @param {*} item
     * @returns {Array}
     */
    function prepend(array, item){
        if(Asdf.O.isNotArray(array)) throw new TypeError();
        array.unshift(item);
        return array;
    }

    /**
     * @memberof Asdf.A
     * @param {Array} array
     * @param {*} item
     * @returns {Array}
     */
    function append(array, item){
        if(Asdf.O.isNotArray(array)) throw new TypeError();
        array.push(item);
        return array;
    }

    function ap(fns, values){
        if(Asdf.O.isNotArray(fns)||Asdf.O.isNotArray(values)) throw new TypeError();
        fns = filter(fns, $_.O.isFunction);
        return reduce(fns, function(acc, fn){
            return merge(acc, map(values, fn));
        }, []);
    }

    function take(array, n){
        return slice.call(array, 0, Math.min(n, array.length));
    }

	$_.O.extend($_.A, {
		each: each,
		map: map,
		reduce: reduce,
		reduceRight: reduceRight,
		first: first,
        get: get,
		last: last,
		filter: filter,
		reject: reject,
		every: every,
		any: any,
		include: include,
		invoke: invoke,
		pluck: pluck,
		merge:merge,
		max: max,
		min: min,
		shuffle: shuffle,
		sortBy: sortBy,
		sort: sort,
		groupBy: groupBy,
        bisectLeft: bisectLeft,
        bisectRight:bisectRight,
		toArray: toArray,
		size: size,
		clear: clear,
		initial: initial,
		rest: rest,
		compact: compact,
		flatten: flatten,
		without: without,
		unique: unique,
		union: union,
		intersection: intersection,
		difference: difference,
		zip: zip,
		indexOf: indexOf,
		lastIndexOf: lastIndexOf,
		batch:batch,
		toArguments:toArguments,
        contains: contains,
        concat: concat,
        count: count,
        repeat:repeat,
        rotate: rotate,
        prepend:prepend,
        append:append,
        ap:ap,
        take:take,
        xprod:xprod
	}, true);
})(Asdf);