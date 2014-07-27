/**
 * @project Asdf.js
 * @author N3735
 * @namespace
 * @name Asdf.O
 */
(function($_) {
    var o = $_.Core.namespace($_, 'O');
	var ObjProto = Object.prototype, ArrayProto = Array.prototype,
	nativeToString = ObjProto.toString,
	hasOwnProperty = ObjProto.hasOwnProperty, slice = ArrayProto.slice ;
	
	var objectType = {
			FUNCTION_CLASS : '[object Function]', 
			BOOLEAN_CLASS : '[object Boolean]', 
			NUMBER_CLASS : '[object Number]', 
			STRING_CLASS : '[object String]', 
			ARRAY_CLASS : '[object Array]', 
			DATE_CLASS : '[object Date]', 
			REGEXP_CLASS : '[object RegExp]',
			ARGUMENTS_CLASS : '[object Arguments]'
	};
	
	var partial = $_.Core.combine.partial;
	var curry = $_.Core.combine.curry;
	var compose = $_.Core.behavior.compose;
	var not = curry(compose, $_.Core.op["!"]);
	
	function _eachIn(obj, statement, content, termination){
		for( var key in obj){
			if(!termination(obj[key], key, obj))
				break;
			if(hasOwnProperty.call(obj, key))
				statement.call(content,obj[key], key, obj);
		}
	}
	function _mapIn(obj, statement, content, termination, memo){
		memo = memo||{};
		for (var key in obj) {
			if(!termination(obj[key], key, obj))
				break;
			if(hasOwnProperty.call(obj, key))
				memo[key] = statement.call(content,obj[key], key, obj);
		}
		return memo;
	}
	function returnTrue () { return true; }
	var each = partial(_eachIn, undefined, undefined, undefined, returnTrue);
	var map = partial(_mapIn, undefined, undefined, undefined, returnTrue, undefined);
	
	/**
	 * @memberof Asdf.O
	 * @param {boolean} [deep=false] deepCopy 여부
	 * @param {Object} destination 대상 객체
	 * @param {Object} source 출처 객체
	 * @param {boolean} [default=false] 대상객체 프로퍼티와 출처 객체프로퍼티가 같을 경우 대상객체를 우선한다.
	 * @returns {Object} 대상객체를 반환한다.
	 * @desc 해당 메소드를 사용하면 출처 객체에 있는 프로퍼티를 대상 객체로 복사한다.
	 */
	function extend() {
		var destination , source , defaults, deep = false, arg = slice.call(arguments), clone;
		destination = arg.shift();
		if(typeof destination === "boolean"){
			deep = destination;
			destination = arg.shift();
		}
		source = arg.shift();
		defaults = !!arg.shift();
		each(source, function (value, key) {
			if(defaults && destination[key]) return;
			if(deep && (isArray(value)|| isPlainObject(value))){
				clone = isArray(value)? []:{};
				destination[key] = extend(deep, clone, value);
			}else {
				destination[key] = value;
			}
		});
		return destination;
	}
	/**
	 * @memberof Asdf.O
	 * @param {Object} obj 대상 객체
	 * @param {Object} mixinObj 출처 객체
	 * @returns {Object} 대상객체를 반환한다.
	 * @desc 해당 메소드를 사용하면 출처 객체에 있는 프로퍼티를 대상 객체로 복사한다.
	 */
	function mixin(obj, mixinObj) {
		if(!isPlainObject(obj) || !isPlainObject(mixinObj))
			throw new TypeError();
		each(mixinObj, function (value, key) {
			obj[key] = value;
		});
		return obj;
	}
	/**
	 * @memberof Asdf.O
	 * @param {Object} object 판단 객체
	 * @returns {boolean} 순수Object여부를 반환하다.
	 * @desc 해당 메소드를 사용하면 객체가 순수Object인지 판단한다.
	 */
	function isPlainObject(object) {
		if(!object || !isObject(object) || object.nodeType || isWindow(object)) {
			return false;
		}
		try{
			if (object.constructor &&
				!hasOwnProperty.call(object, "constructor") &&
				!hasOwnProperty.call(object.constructor.prototype, "isPrototypeOf") ) {
				return false;
			}
		}catch (e) {
			return false;
		}
		var key;
		for( key in object ){}
		return key === undefined || hasOwnProperty.call(object, key);
	}
	/**
	 * @memberof Asdf.O
	 * @func
	 * @param {Object} object 판단 객체
	 * @returns {boolean} 순수Object여부를 반환하다.
	 * @desc 해당 메소드를 사용하면 객체가 순수Object아닌지 판단한다.
	 */
	var isNotPlainObject = not(isPlainObject);
	/**
	 * @memberof Asdf.O
	 * @param {Object} object 판단 객체
	 * @returns {boolean} Element여부를 반환하다.
	 * @desc 해당 메소드를 사용하면 객체가 Element인지 판단한다.
	 */
	function isElement(object) {
		return !!(object && object.nodeType !== 3);
	}
	/**
	 * @memberof Asdf.O
	 * @func
	 * @param {Object} object 판단 객체
	 * @returns {boolean} Element여부를 반환하다.
	 * @desc 해당 메소드를 사용하면 객체가 Element아닌지 판단한다.
	 */
	var isNotElement = not(isElement);
    function isDocument(object) {
        return !!(object && object.nodeType === 9);
    }
    var isNotDocument = not(isDocument);
	/**
	 * @memberof Asdf.O
	 * @param {Object} object 판단 객체
	 * @returns {boolean} Node여부를 반환하다.
	 * @desc 해당 메소드를 사용하면 객체가 Node인지 판단한다.
	 */
	function isNode(object) {
		return !!(object && object.nodeType);
	}
	
	/**
	 * @memberof Asdf.O
	 * @func
	 * @param {Object} object 판단 객체
	 * @returns {boolean} Node여부를 반환하다.
	 * @desc 해당 메소드를 사용하면 객체가 Node아닌지 판단한다.
	 */
	var isNotNode = not(isNode);
	
	/**
	 * @memberof Asdf.O
	 * @param {Object} obj 판단 객체
	 * @returns {boolean} Window여부를 반환하다.
	 * @desc 해당 메소드를 사용하면 객체가 window인지 판단한다.
	 */
	function isWindow (obj) {
		return obj != null && obj == obj.window;
	}
	
	/**
	 * @memberof Asdf.O
	 * @func
	 * @param {Object} object 판단 객체
	 * @returns {boolean} Window여부를 반환하다.
	 * @desc 해당 메소드를 사용하면 객체가 window아닌지 판단한다.
	 */
	var isNotWindow = not(isWindow);
	
	/**
	 * @memberof Asdf.O
	 * @param {Object} obj 판단 객체
	 * @returns {boolean} 빈 객체여부를 반환하다.
	 * @desc 해당 메소드를 사용하면 객체가 빈 객체인지 판단한다.
	 */
	function isEmptyObject(obj) {
		var res = true;
		each(obj, function (value, key){
			res = false;
		});
		return res;
	}
	
	/**
	 * @memberof Asdf.O
	 * @func
	 * @param {Object} object 판단 객체
	 * @returns {boolean} 빈 객체여부를 반환하다.
	 * @desc 해당 메소드를 사용하면 객체가 빈 객체가 아닌지 판단한다.
	 */
	var isNotEmptyObject = not(isEmptyObject);
	
	/**
	 * @memberof Asdf.O
	 * @param {Object} object 판단 객체
	 * @returns {boolean} Array 객체여부를 반환하다.
	 * @desc 해당 메소드를 사용하면 객체가 Array인지 판단한다.
	 */
	var isArray = function (object) {
		var hasNativeIsArray = (typeof Array.isArray == 'function') && Array.isArray([]) && !Array.isArray({});
		if (hasNativeIsArray) {
			isArray = Array.isArray;
			return Array.isArray(object);
		}
		return nativeToString.call(object) === objectType.ARRAY_CLASS;
	}
	/**
	 * @memberof Asdf.O
	 * @func
	 * @param {Object} object 판단 객체
	 * @returns {boolean} Array 객체여부를 반환하다.
	 * @desc 해당 메소드를 사용하면 객체가 Array아닌지 판단한다.
	 */
	var isNotArray = not(isArray);
	
	/**
	 * @memberof Asdf.O
	 * @param {Object} object 판단 객체
	 * @returns {boolean} Object 객체여부를 반환하다.
	 * @desc 해당 메소드를 사용하면 객체가 Object인지 판단한다.
	 */
	function isObject(object) {
		return object === Object(object);
	}
	
	/**
	 * @memberof Asdf.O
	 * @func
	 * @param {Object} object 판단 객체
	 * @returns {boolean} Object 객체여부를 반환하다.
	 * @desc 해당 메소드를 사용하면 객체가 Object아닌지 판단한다.
	 */
	var isNotObject = not(isObject);
	
	/**
	 * @memberof Asdf.O
	 * @param {Object} object 판단 객체
	 * @returns {boolean} Arguments 객체여부를 반환하다.
	 * @desc 해당 메소드를 사용하면 객체가 Arguments인지 판단한다.
	 */
	function isArguments(object) {
		return nativeToString.call(object) === objectType.ARGUMENTS_CLASS;
	}
	
	/**
	 * @memberof Asdf.O
	 * @func
	 * @param {Object} object 판단 객체
	 * @returns {boolean} Arguments 객체여부를 반환하다.
	 * @desc 해당 메소드를 사용하면 객체가 Arguments아닌지 판단한다.
	 */
	var isNotArguments = not(isArguments);
	
	/**
	 * @memberof Asdf.O
	 * @param {Object} object 판단 객체
	 * @returns {boolean} function 객체여부를 반환하다.
	 * @desc 해당 메소드를 사용하면 객체가 function인지 판단한다.
	 */
	function isFunction(object) {
		return nativeToString.call(object) === objectType.FUNCTION_CLASS;
	}
	
	/**
	 * @memberof Asdf.O
	 * @func
	 * @param {Object} object 판단 객체
	 * @returns {boolean} function 객체여부를 반환하다.
	 * @desc 해당 메소드를 사용하면 객체가 function아닌지 판단한다.
	 */
	var isNotFunction  = not(isFunction);

	/**
	 * @memberof Asdf.O
	 * @param {Object} object 판단 객체
	 * @returns {boolean} String 객체여부를 반환하다.
	 * @desc 해당 메소드를 사용하면 객체가 String인지 판단한다.
	 */
	function isString(object) {
		return nativeToString.call(object) === objectType.STRING_CLASS;
	}
	
	/**
	 * @memberof Asdf.O
	 * @func
	 * @param {Object} object 판단 객체
	 * @returns {boolean} String 객체여부를 반환하다.
	 * @desc 해당 메소드를 사용하면 객체가 String아닌지 판단한다.
	 */
	var isNotString = not(isString);

	/**
	 * @memberof Asdf.O
	 * @param {Object} object 판단 객체
	 * @returns {boolean} Number 객체여부를 반환하다.
	 * @desc 해당 메소드를 사용하면 객체가 Number인지 판단한다.
	 */
	function isNumber(object) {
		return nativeToString.call(object) === objectType.NUMBER_CLASS;
	}
	
	/**
	 * @memberof Asdf.O
	 * @func
	 * @param {Object} object 판단 객체
	 * @returns {boolean} Number 객체여부를 반환하다.
	 * @desc 해당 메소드를 사용하면 객체가 Number아닌지 판단한다.
	 */
	var isNotNumber = not(isNumber);

	/**
	 * @memberof Asdf.O
	 * @param {Object} object 판단 객체
	 * @returns {boolean} Date 객체여부를 반환하다.
	 * @desc 해당 메소드를 사용하면 객체가 Date인지 판단한다.
	 */
	function isDate(object) {
		return nativeToString.call(object) === objectType.DATE_CLASS;
	}
	
	/**
	 * @memberof Asdf.O
	 * @func
	 * @param {Object} object 판단 객체
	 * @returns {boolean} Date 객체여부를 반환하다.
	 * @desc 해당 메소드를 사용하면 객체가 Date아닌지 판단한다.
	 */
	var isNotDate = not(isDate);
	
	/**
	 * @memberof Asdf.O
	 * @param {Object} object 판단 객체
	 * @returns {boolean} Regexp 객체여부를 반환하다.
	 * @desc 해당 메소드를 사용하면 객체가 Regexp인지 판단한다.
	 */
	function isRegexp(object) {
		return nativeToString.call(object) === objectType.REGEXP_CLASS;
	}
	
	/**
	 * @memberof Asdf.O
	 * @func
	 * @param {Object} object 판단 객체
	 * @returns {boolean} Regexp 객체여부를 반환하다.
	 * @desc 해당 메소드를 사용하면 객체가 Regexp아닌지 판단한다.
	 */
	var isNotRegexp = not(isRegexp);
	
	/**
	 * @memberof Asdf.O
	 * @param {Object} object 판단 객체
	 * @returns {boolean} undefined여부를 반환하다.
	 * @desc 해당 메소드를 사용하면 객체가 undefined인지 판단한다.
	 */
	function isUndefined(object) {
		return typeof object === "undefined";
	}
	
	/**
	 * @memberof Asdf.O
	 * @func
	 * @param {Object} object 판단 객체
	 * @returns {boolean} undefined여부를 반환하다.
	 * @desc 해당 메소드를 사용하면 객체가 undefined아닌지 판단한다.
	 */
	var isNotUndefined = not(isUndefined);
	
	/**
	 * @memberof Asdf.O
	 * @param {Object} object 판단 객체
	 * @returns {boolean} null여부를 반환하다.
	 * @desc 해당 메소드를 사용하면 객체가 null인지 판단한다.
	 */
	function isNull(object) {
		return object === null;
	}
	
	/**
	 * @memberof Asdf.O
	 * @func
	 * @param {Object} object 판단 객체
	 * @returns {boolean} null여부를 반환하다.
	 * @desc 해당 메소드를 사용하면 객체가 null아닌지 판단한다.
	 */
	var isNotNull = not(isNull);
	
	/**
	 * @memberof Asdf.O
	 * @func
	 * @param {object} obj 판단 객체
	 * @returns {boolean} collection여부를 반환하다.
	 * @desc 해당 메소드를 사용하면 객체가 collection인지 판단한다. <br>
	 * collection 객체란? length프로퍼티가 존재 하며 숫자 이여야 한다.
	 */
	function isCollection(obj) {
		return isArray(obj)||isObject(obj)&&isNumber(obj.length)
	}
	/**
	 * @memberof Asdf.O
	 * @func
	 * @param {object} obj 판단 객체
	 * @returns {boolean} collection여부를 반환하다.
	 * @desc 해당 메소드를 사용하면 객체가 collection아닌지 판단한다.
	 */
	var isNotCollection = not(isCollection);
	/**
	 * @memberof Asdf.O
	 * @func
	 * @param {object} object 대상 객체
	 * @returns {array} object의 key값을 추출하여 Array type으로 반환한다.
	 * @desc 대상 객체에서 key값을 추출한다.
	 * @example
	 * var obj = {a:1, b:2};
	 * Asdf.O.keys(obj) //return ['a','b'];
	 */
	function keys(object) {
		if ((typeof object != "object" && typeof object != "function")
				|| object === null) {
			throw new TypeError("Object.key called on a non-object");
		}
		var res = [];
		each(object, function (value, key) { res.push(key); });
		return res;
	}
	
	/**
	 * @memberof Asdf.O
	 * @func
	 * @param {object} object 대상 객체
	 * @returns {array} object의 value값을 추출하여 Array type으로 반환한다.
	 * @desc 대상 객체에서 value값을 추출한다.
	 * @example
	 * var obj = {a:1, b:2};
	 * Asdf.O.values(obj) //return [1,2];
	 */
	function values(object) {
		if ((typeof object != "object" && typeof object != "function")
				|| object === null) {
			throw new TypeError("Object.values called on a non-object");
		}
		var res = [];
		each(object, function (value, key){ res.push(value); });
		return res;
	}
	
	function getKeysbyType(obj, fn){
		var names = [];
		each(obj, function (value, key){ 
			if(fn(value))
				names.push(key);
		});
		return names.sort();
	}
	
	/**
	 * @memberof Asdf.O
	 * @func
	 * @param {object} object 대상 객체
	 * @returns {array} object의 value값이 function인 key값을 추출하여 Array type으로 반환한다.
	 * @desc 대상 객체에서 value가 function인 key값을 추출한다.
	 * @example
	 * var obj = {a:1, b:2, c: function(){}};
	 * Asdf.O.functions(obj) //return ['c'];
	 */
	var functions = partial(getKeysbyType, undefined, isFunction);
	
	/**
	 * @memberof Asdf.O
	 * @func
	 * @param {object} object 대상 객체
	 * @returns {array} object의 value값이 null인 key값을 추출하여 Array type으로 반환한다.
	 * @desc 대상 객체에서 value가 null인 key값을 추출한다.
	 * @example
	 * var obj = {a:1, b:2, c: function(){}, d: null};
	 * Asdf.O.nulls(obj) //return ['d'];
	 */
	var nulls = partial(getKeysbyType, undefined, isNull);
	
	/**
	 * @memberof Asdf.O
	 * @func
	 * @param {object} object 대상 객체
	 * @returns {array} object의 value값이 undefined key값을 추출하여 Array type으로 반환한다.
	 * @desc 대상 객체에서 value가 undefined인 key값을 추출한다.
	 * @example
	 * var obj = {a:1, b:2, c: function(){}, d: null, e: undefined};
	 * Asdf.O.undefineds(obj) //return ['e'];
	 */
	var undefineds = partial(getKeysbyType, undefined, isUndefined);
	
	/**
	 * @memberof Asdf.O
	 * @func
	 * @param {object} object 대상 객체
	 * @returns {array} object의 value값이 plainObject인 key값을 추출하여 Array type으로 반환한다.
	 * @desc 대상 객체에서 value가 plainObject인 key값을 추출한다.
	 * @example
	 * var obj = {a:1, b:2, c: function(){}, d: null, e: undefined, f: {}};
	 * Asdf.O.plainObjects(obj) //return ['f'];
	 */
	var plainObjects = partial(getKeysbyType, undefined, isPlainObject);
	
	/**
	 * @memberof Asdf.O
	 * @func
	 * @param {object} object 대상 객체
	 * @returns {array} object의 value값이 Array인 key값을 추출하여 Array type으로 반환한다.
	 * @desc 대상 객체에서 value가 Array인 key값을 추출한다.
	 * @example
	 * var obj = {a:1, b:2, c: function(){}, d: null, e: undefined, f: {}, g: []};
	 * Asdf.O.arrays(obj) //return ['f'];
	 */
	var arrays = partial(getKeysbyType, undefined, isArray);
	
	/**
	 * @memberof Asdf.O
	 * @func
	 * @param {object} obj 대상 객체
	 * @param {...string} key 추출 key값들
	 * @returns {object} obj에서 key 값을 추출하여 객체를 반환한다.
	 * @desc 대상 객체에서 해당하는 key값을 추출하여 반환한다.
	 * @example
	 * var obj = {a:1, b:2, c: function(){}, d: null, e: undefined, f: {}, g: []};
	 * Asdf.O.pick(obj,'a', 'c') //return {a:1, c:function(){}};
	 */
	function pick(obj) {
		var result = {};
		$_.A.each($_.A.flatten(slice.call(arguments,1)), function(key) {
			if (key in obj)
				result[key] = obj[key];
		});
		return result;
	}
	
	/**
	 * @memberof Asdf.O
	 * @func
	 * @param {object} obj 대상 객체
	 * @returns {object} obj복사하여 반환한다.
	 * @desc array 객체이거나 plainObject인 경우 객체에 clone 메소드가 없어도 복사가 가능하나 그 외인 경우 반드시 clone메소드를 구현해야 한다.
	 */
	function clone(obj) {
		if (!isObject(obj))
			throw new TypeError();
		if(obj.clone)
			return obj.clone();
		if(isArray(obj)||isPlainObject(obj))
			return isArray(obj) ? obj.slice() : extend(true, {}, obj);
		throw new TypeError();
	}
	
	/**
	 * @memberof Asdf.O
	 * @func
	 * @param {object} obj 대상 객체
	 * @returns {string} obj를 queryString으로 바꾸어 반환한다.
	 * @desc obj는 반드시 plainObject이여야 한다. key1=value1&key2=value2... 로 반환된다.
	 * @example
	 * var obj = {a:1, b:2, c:[1,2,3,4]};
	 * Asdf.O.toQueryString(obj); //return 'a=1&b=2&c=1&c=2&c=3&c=4';
	 */
	function toQueryString(obj) {
		if(isNotPlainObject(obj)) throw new TypeError();
		function toQueryPair(key, value) {
			key = encodeURIComponent(key);
			if (isUndefined(value))
				return key;
			return key + '=' + encodeURIComponent(value);
		}
		var res = [];
		each(obj, function (value, key) {
			if(isArray(value)){
				res = res.concat($_.A.map(value, function (v, k){ return toQueryPair(key, v);}));
			}else {
				res.push(toQueryPair(key, value));
			}
		});
		return res.join('&');
	}

    /**
     * @memberof Asdf.O
     * @param {Object} obj
     * @param {String} key
     * @returns {Object}
     */
	function remove(obj, key) {
		if(isNotObject(obj)||isNotString(key)) throw new TypeError();
		if(key in obj){
			delete obj[key];
		}
		return obj;
	}

	function getOrElse(obj, key, defult){
		if(isNotObject(obj)) throw new TypeError();
		if(has(obj, key))
			return obj[key];
		return defult;
	}

    /**
     * @memberof Asdf.O
     * @function
     * @param {Object} object
     * @param {String} key
     * @return {*}
     */
	var get = partial(getOrElse, undefined, undefined, undefined);

	function has(obj,str){
		return str in obj;
	}

    /**
     * @memberof Asdf.O
     * @param {Object} obj
     * @param {String} key
     * @param {*} value
     */
	function set(obj, key, value){
		if(isNotObject(obj)) throw new TypeError();
		obj[key] = value;
        return obj;
	}
	/**
	 * @memberof Asdf.O
	 * @func
	 * @param {object} obj 대상 객체
	 * @param {object} type 타입에 대한 정의 객체 
	 * @returns {boolean} obj가 해당 type이면 참을 반환한다.
	 * @desc type객체는 key값과 대응하는 function으로 이루어 진다. type의 key값과 obj의 같은 key값에 대응되는 value값을 function의 인자값으로 넣고 실행할 경우 모두 참이 떨어지면 참을 반환한다.
	 * @example
	 * var obj = {
	 *	a: function(){},
	 *	b: function(){}
	 * };
	 * var type1 = {a: Asdf.O.isFunction,
	 *	b: Asdf.O.isFunction,
	 *	aa: Asdf.O.isUndefined
	 * };
	 * Asdf.O.type(obj, type1); // return true;
	 */
	function type(obj, typeObj){
		if(isNotPlainObject(typeObj)) throw new TypeError();
		var res = true;
		each(typeObj, function(fn, key){
			if(isFunction(fn))
				if(!fn(obj[key]))
					res = false;
		});
		
		return res;
	}

    /**
     * @memberof Asdf.O
     * @param {*} obj
     * @param {*} obj2
     * @returns {Boolean}
     */
    function equals(obj, obj2){
        if(obj == null|| obj2 == null) return false;
        if(obj===obj2) return true;
        if(obj.equals)
           return obj.equals(obj2);
        if(!(isPlainObject(obj)||isArray(obj))|| obj.constructor !== obj2.constructor) return false;
        var k1 = keys(obj);
        var k2 = keys(obj2);
        if(k1.length !== k2.length) return false;
        var key, res;
        for(key in obj){
            res = equals(obj[key],obj2[key]);
            if(!res) return false;
        }
        return true;
    }

	extend(o, {
		each: each,
		map: map,
		extend: extend,
		mixin: mixin,
		keys: keys,
		values : values,
		nulls : nulls,
		undefineds : undefineds,
		plainObjects : plainObjects,
		arrays : arrays,
		functions : functions,
		isElement : isElement,
		isNotElement : isNotElement,
        isDocument:isDocument,
        isNotDocument: isNotDocument,
		isNode: isNode,
		isNotNode: isNotNode,
		isWindow: isWindow,
		isNotWindow: isNotWindow,
		isEmptyObject: isEmptyObject,
		isNotEmptyObject: isNotEmptyObject,
		isArray : isArray,
		isNotArray : isNotArray,
		isObject: isObject,
		isNotObject: isNotObject,
		isPlainObject: isPlainObject,
		isNotPlainObject: isNotPlainObject,
		isArguments: isArguments,
		isNotArguments: isNotArguments,
		isFunction : isFunction,
		isNotFunction: isNotFunction,
		isString : isString,
		isNotString: isNotString,
		isNumber : isNumber,
		isNotNumber: isNotNumber,
		isDate : isDate,
		isNotDate: isNotDate,
		isRegexp: isRegexp,
		isNotRegexp: isNotRegexp,
		isUndefined : isUndefined,
		isNotUndefined: isNotUndefined,
		isNull : isNull,
		isNotNull : isNotNull,
		isCollection: isCollection,
		isNotCollection : isNotCollection,
		pick: pick,
		clone: clone,
		toQueryString: toQueryString,
		get: get,
		getOrElse: getOrElse,
        remove:remove,
        has:has,
		set: set,
		type:type,
        equals:equals
	});
})(Asdf);
