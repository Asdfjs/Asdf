(function (definition) {
    // RequireJS
    if (typeof define == "function") {
        define(definition);
    } else {
        definition();
    }
})(function() {
	window.Asdf = {};
});;(function($_) {
	var core = $_.Core = {};
	var nativeSlice = Array.prototype.slice;
	var errorProto = Error.prototype,
		objectProto = Object.prototype,
		stringProto = String.prototype,
		arrayProto = Array.prototype;
	var nativeToString = objectProto.toString,
		nativePropertyIsEnumerable = objectProto.propertyIsEnumerable,
		nativeHasOwnProperty = objectProto.hasOwnProperty;
	function each(object, initialization, termination, increment,statement, context) {
		while(termination(object[initialization], initialization, object)) {
			statement.call(context, object[initialization], initialization, object);
			initialization = increment(initialization);
		}
	}
	function namespace(/*[parent], ns_string*/) {
		var parts, i, parent;
		var args = Array.prototype.slice.call(arguments);
		if (typeof args[0] === 'object') {
			parent = args.shift();
		}
		parent = parent || window;
		parts = args[0].split('.');
		for (i = 0; i < parts.length; i++) {
			if (typeof parent[parts[i]] === 'undefined') {
				parent[parts[i]] = {};
			}
			parent = parent[parts[i]];
		}
		return parent;
	}
	var op = {
		"+": function (a, b) {
			return a+b; 
		},"-": function (a, b) {
			return a-b; 
		},"*": function (a, b) {
			return a*b;
		},"/": function (a, b) {
			if(b===0) throw new TypeError();
			return a/b;
		},"%": function (a, b) {
			if(b===0) throw new TypeError();
			return a%b;
		}, "==": function (a, b) {
			return a==b;
		}, "===": function (a, b){
			return a===b;
		}, "equals": function equals(a, b){
			if(a === b) return true;
			if(a == null|| b == null) return false;
			if(!(a.constructor === Object || a.constructor === Array) || a.constructor !== b.constructor) return false;
			function f(a, b) {
				var key, res;
				for(key in a){
					if(nativeHasOwnProperty.call(a, key))
						res = equals(a[key],b[key]);
					if(!res) return false;
				}
				return true;
			}
			return f(a, b) && f(b, a);
		}, "!": function (a) {
			return !a;
		}, "&&": function (a, b){
			return a && b;
		}, "||": function (a, b){
			return a||b;
		}, "inc": function (a) {
			return ++a;
		}, "desc": function (a) {
			return --a;
		}, "mask": function (a, b) {
			return a|b;
		}
	};
	var behavior = {
		'each': each,
		'memoizer' : function (fn, memo){
			memo = memo||{};
			return function (key, nouse) {
				var res = memo[key];
				if(res == null || nouse){
					res = fn.call(this,key);
					memo[key] = res;
				}
				return res;
			};
		},
		'iterate': function (fn, base) {
			return function (init) {
				init = (init == null)? base: init;
				base = fn.call(this,init);
				return init;
			};
		},
		'take': function take(fn, times, base) {
			if(times <= 1)
				return fn(base);
			return fn(take(fn, times-1));
		},
		'compose': function (f1, f2){
			return function () {
				return f1.call(this, (f2.apply(this, arguments)));
			};
		},
		'sync': function (f1) {
			var l = false;
			return function () {
				if(l){
					throw new Error('this function is Sync');
				}else {
					l = true;
					var res = f1.apply(this, arguments);
					l = false;
					return res;
				}
			};
		}
	};
	var returnType = {
		'is': function (fn){
			var self = this;
			return function (){return !!fn.apply(self,arguments);};
		},
		'a': function (fn) {
			var self = this;
			return function () {
				var res = fn.apply(self, arguments);
				return (res.length!=null)? res[0] : res;
			};
		}
	};
	var combine = {
		'curry': function (fn) {
			var args = nativeSlice.call(arguments, 1);
			return function () {
				return fn.apply(this, args.concat(nativeSlice.call(arguments)));
			};
		},
		'partial': function (fn) {
			var args = nativeSlice.call(arguments, 1);
			return function () {
				var arg = 0;
				var a = args.slice();
				for ( var i = 0; arg < arguments.length; i++ )
					if(args[i] === undefined)
						a[i] = arguments[arg++];
				return fn.apply(this, a);
			};
		},'extract': function (fn, n) {
			n==null && (n=1);
			return function () {
				return fn.apply(this, nativeSlice.call(arguments, n));
			};
		}, 'nAry': function (fn, n) {
            n==null && fn.length;
            return function () {
                return fn.apply(this, nativeSlice.call(arguments, 0, n));
        };
    }
	};
	var whitespace = (
		// whitespace
	' \t\x0B\f\xA0\ufeff' +
		// line terminators
	'\n\r\u2028\u2029' +
		// unicode category "Zs" space separators
	'\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000'
	);
	var regexp = {
		NUMBER: /^\d+$/,
		FN_NATIVE: RegExp('^' +
			String(nativeToString)
				.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
				.replace(/toString| for [^\]]+/g, '.*?') + '$'
		),
		"WHITESPACE": RegExp('^'+whitespace+'$'),
		"EMPTY": /(^$)/,
		"THIS":/\bthis\b/
	};

	var objectType = {
		FUNCTION_CLASS : '[object Function]',
		BOOLEAN_CLASS : '[object Boolean]',
		NUMBER_CLASS : '[object Number]',
		STRING_CLASS : '[object String]',
		ARRAY_CLASS : '[object Array]',
		DATE_CLASS : '[object Date]',
		OBJECT_CLASS: '[object Object]',
		REGEXP_CLASS : '[object RegExp]',
		ARGUMENTS_CLASS : '[object Arguments]',
		ERROR_CLASS:'[object Error]'
	};

	var shadowedProps = [
		'constructor', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable',
		'toLocaleString', 'toString', 'valueOf'
	];
	var nonEnumProps = {};
	nonEnumProps[objectType.ARRAY_CLASS] = nonEnumProps[objectType.DATE_CLASS] = nonEnumProps[objectType.NUMBER_CLASS] = { 'constructor': true, 'toLocaleString': true, 'toString': true, 'valueOf': true };
	nonEnumProps[objectType.BOOLEAN_CLASS] = nonEnumProps[objectType.STRING_CLASS] = { 'constructor': true, 'toString': true, 'valueOf': true };
	nonEnumProps[objectType.ERROR_CLASS] = nonEnumProps[objectType.FUNCTION_CLASS] = nonEnumProps[objectType.REGEXP_CLASS] = { 'constructor': true, 'toString': true };
	nonEnumProps[objectType.OBJECT_CLASS] = { 'constructor': true };
	(function() {
		var length = shadowedProps.length;
		while (length--) {
			var key = shadowedProps[length];
			for (var className in nonEnumProps) {
				if (nativeHasOwnProperty.call(nonEnumProps, className) && !nativeHasOwnProperty.call(nonEnumProps[className], key)) {
					nonEnumProps[className][key] = false;
				}
			}
		}
	}());

	var root = (typeof window === 'object' && window)||this;
	var support = (function(){
		var ctor = function() { this.x = 1; },
			object = { '0': 1, 'length': 1 },
			props = [];

		ctor.prototype = { 'valueOf': 1, 'y': 1 };
		for (var key in new ctor) { props.push(key); }
		for (key in arguments) { }
		return {
			ArgumentsClass: nativeToString.call(arguments) === objectType.ARGUMENTS_CLASS,
			ArgumentsObject: arguments.constructor === Object && !(arguments instanceof Array),
			EnumErrorProps: nativePropertyIsEnumerable.call(errorProto, 'message') || nativePropertyIsEnumerable.call(errorProto, 'name'),
			EnumPrototypes:nativePropertyIsEnumerable.call(ctor, 'prototype'),
			FunctionToString: regexp.FN_NATIVE.test(nativeToString),
			FunctionName: typeof Function.name === 'string',
			EnumArguments: key === 0,
			EnumShadows: /valueOf/.test(props),
			EnumOwnFirst: props[0] === 'x',
			SpliceObjects: (arrayProto.splice.call(object,0,1), !object[0]),
			IndexedChars: ('x'[0] + Object('x')[0]) === 'xx'
		}
	})(1);


	var iteratorTemplate = function(obj) {
		var __p = 'var index, iterable = ' +
			(obj.firstArg) +
			', result = ' +
			(obj.init) +
			';\nif (!iterable) return result;\n' +
			(obj.top) +
			';';
		if (obj.array) {
			__p += '\nvar length = iterable.length; index = -1;\nif (' +
			(obj.array) +
			') {  ';
			if (!support.IndexedChars) {
				__p += '\n  if (isString(iterable)) {\n    iterable = iterable.split(\'\')\n  }  ';
			}
			__p += '\n  while (++index < length) {\n    ' +
			(obj.loop) +
			';\n  }\n}\nelse {  ';
		} else if (!support.EnumArguments) {
			__p += '\n  var length = iterable.length; index = -1;\n  if (length && isArguments(iterable)) {\n    while (++index < length) {\n      index += \'\';\n      ' +
			(obj.loop) +
			';\n    }\n  } else {  ';
		}

		if (support.EnumPrototypes) {
			__p += '\n  var skipProto = typeof iterable == \'function\';\n  ';
		}

		if (support.EnumErrorProps) {
			__p += '\n  var skipErrorProps = iterable === errorProto || iterable instanceof Error;\n  ';
		}

		var conditions = [];    if (support.EnumPrototypes) { conditions.push('!(skipProto && index == "prototype")'); }    if (support.EnumErrorProps)  { conditions.push('!(skipErrorProps && (index == "message" || index == "name"))'); }

		if (obj.useHas && obj.keys) {
			__p += '\n  var ownIndex = -1,\n      ownProps = isObject(iterable) && keys(iterable),\n      length = ownProps ? ownProps.length : 0;\n\n  while (++ownIndex < length) {\n    index = ownProps[ownIndex];\n';
			if (conditions.length) {
				__p += '    if (' +
				(conditions.join(' && ')) +
				') {\n  ';
			}
			__p +=
				(obj.loop) +
				';    ';
			if (conditions.length) {
				__p += '\n    }';
			}
			__p += '\n  }  ';
		} else {
			__p += '\n  for (index in iterable) {\n';
			if (obj.useHas) { conditions.push("hasOwnProperty.call(iterable, index)"); }    if (conditions.length) {
				__p += '    if (' +
				(conditions.join(' && ')) +
				') {\n  ';
			}
			__p +=
				(obj.loop) +
				';    ';
			if (conditions.length) {
				__p += '\n    }';
			}
			__p += '\n  }    ';
			if (!support.EnumShadows) {
				__p += '\n\n  if (iterable !== objectProto) {\n    var ctor = iterable.constructor,\n        isProto = iterable === (ctor && ctor.prototype),\n        className = iterable === stringProto ? stringClass : iterable === errorProto ? errorClass : toString.call(iterable),\n        nonEnum = nonEnumProps[className];\n      ';
				for (k = 0; k < 7; k++) {
					__p += '\n    index = \'' +
					(obj.shadowedProps[k]) +
					'\';\n    if ((!(isProto && nonEnum[index]) && hasOwnProperty.call(iterable, index))';
					if (!obj.useHas) {
						__p += ' || (!nonEnum[index] && iterable[index] !== objectProto[index])';
					}
					__p += ') {\n      ' +
					(obj.loop) +
					';\n    }      ';
				}
				__p += '\n  }    ';
			}

		}

		if (obj.array || !support.EnumArguments) {
			__p += '\n}';
		}
		__p +=
			(obj.bottom) +
			';\nreturn result';

		return __p
	};
	function isNative(value) {
		return typeof value == 'function' && regexp.FN_NATIVE.test(value);
	}
	function isArguments(value){
		return value && typeof value === 'object' && typeof value.length === 'number' &&
			((support.ArgumentsClass)? nativeToString.call(value) === objectType.ARGUMENTS_CLASS:
			nativeHasOwnProperty.call(value, 'callee') && !nativePropertyIsEnumerable.call(value, 'callee')) ||
			false;
	}
	var nativeIsArray = isNative(nativeIsArray = Array.isArray) && nativeIsArray,
		nativeKeys = isNative(nativeKeys = Object.keys) && nativeKeys;
	var isArray = nativeIsArray || function(value) {
			return value && typeof value == 'object' && typeof value.length == 'number' &&
				nativeToString.call(value) == objectType.ARRAY_CLASS || false;
		};
	function isString(value) {
		return typeof value == 'string' ||
			value && typeof value == 'object' && nativeToString.call(value) == objectType.STRING_CLASS || false;
	}
	function isObject(value) {
		return value === Object(value);
	}

	function createIterator() {
		// data properties
		var iteratorData = {};
		iteratorData.shadowedProps = shadowedProps;

		// iterator options
		iteratorData.array = iteratorData.bottom = iteratorData.loop = iteratorData.top = '';
		iteratorData.init = 'iterable';
		iteratorData.useHas = true;

		// merge options into a template data object
		for (var object, index = 0; object = arguments[index]; index++) {
			for (var key in object) {
				iteratorData[key] = object[key];
			}
		}
		var args = iteratorData.args;
		iteratorData.firstArg = /^[^,]+/.exec(args)[0];

		// create the function factory
		var factory = Function(
			'errorClass, errorProto, hasOwnProperty, ' +
			'isArguments, isArray, isString, keys, objectProto, ' +
			'isObject, nonEnumProps, stringClass, stringProto, toString',
			'return function(' + args + ') {\n' + iteratorTemplate(iteratorData) + '\n}'
		);

		// return the compiled function
		return factory(
			objectType.ERROR_CLASS, errorProto, nativeHasOwnProperty,
			isArguments, isArray, isString, iteratorData.keys, objectProto,
			isObject, nonEnumProps, objectType.STRING_CLASS, stringProto, nativeToString
		);
	}

	var shimKeys = createIterator({
		'args': 'object',
		'init': '[]',
		'top': 'if (!(isObject(object))) return result',
		'loop': 'result.push(index)'
	});
	var keys = !nativeKeys ? shimKeys : function(object) {
		if (!isObject(object)) {
			return [];
		}
		if ((support.enumPrototypes && typeof object == 'function') ||
			(support.nonEnumArgs && object.length && isArguments(object))) {
			return shimKeys(object);
		}
		return nativeKeys(object);
	};
	var eachIteratorOptions = {
	 'args': 'collection, callback, thisArg',
	 'top': '',
	 'array': "typeof length == 'number'",
	 'keys': keys,
	 'loop': 'if (callback(iterable[index], index, collection) === false) return result'
	 };
	baseEach = createIterator(eachIteratorOptions);

	core.support = support;
	core.op = op;
	core.behavior = behavior;
	core.returnType = returnType;
	core.combine = combine;
    core.namespace = namespace;
})(Asdf);
;/**
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
			ARGUMENTS_CLASS : '[object Arguments]',
			ERROR_CLASS:'[object Error]'
	};
	var cloneableClasses = {
		'[object Function]':false,
		'[object Boolean]':true,
		'[object Number]':true,
		'[object String]':true,
		'[object Array]':true,
		'[object Date]':true,
		'[object RegExp]':true,
		'[object Arguments]':true
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
		return !!(object && object.nodeType === 1);
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

    function isBoolean(obj){
        return nativeToString.call(obj) === objectType.BOOLEAN_CLASS
    }

    var isNotBoolean = not(isBoolean);

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
	function isRegExp(object) {
		return nativeToString.call(object) === objectType.REGEXP_CLASS;
	}
	
	/**
	 * @memberof Asdf.O
	 * @func
	 * @param {Object} object 판단 객체
	 * @returns {boolean} Regexp 객체여부를 반환하다.
	 * @desc 해당 메소드를 사용하면 객체가 Regexp아닌지 판단한다.
	 */
	var isNotRegExp = not(isRegExp);
	
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
			return isArray(obj) ? obj.slice(0) : extend(true, {}, obj);
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

    function pathOrElse(obj, key, defult){
        if(isNotObject(obj)) throw new TypeError();
        var k = isString(key)?key.split('.'):key;
        if(isNotArray(k)) throw new TypeError();
		var isFalse = false;
        return Asdf.A.reduce(k, function(acc, a){
            if(isFalse) return defult;
            if(has(acc, a)){
                return acc[a];
            }
			isFalse = true;
            return defult;
        }, obj);
    }

    /**
     * @memberof Asdf.O
     * @function
     * @param {Object} object
     * @param {String} key
     * @return {*}
     */
	var get = $_.Core.combine.nAry(getOrElse, 2);

    var path = $_.Core.combine.nAry(pathOrElse, 2);

    function has(obj,str){
        if(Asdf.O.isNotObject(obj)) return false;
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
        if (obj === obj2) return obj !== 0 || 1 / obj === 1 / obj2;
        if(obj == null|| obj2 == null) return obj === obj2;
        if(obj.equals)
           return obj.equals(obj2);
        var className = nativeToString.call(obj);
        if(className !== nativeToString.call(obj2)) return false;
        if(isRegExp(obj) || isString(obj))
            return ''  + obj === '' + obj2;
        if(isNumber(obj)){
            if (+obj !== +obj) return +obj2 !== +obj2;
            return +obj === 0 ? 1 / +obj === 1 / obj2 : +obj === +obj2;
        }
        if(isDate(obj)||isBoolean(obj))
            return +obj === +obj2;
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

    function tap(obj, fn){
        if(isNotObject(obj) || isNotFunction(fn)) throw new TypeError();
            fn(obj);
        return obj;
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
        isBoolean:isBoolean,
        isNotBoolean:isNotBoolean,
		isDate : isDate,
		isNotDate: isNotDate,
        isRegExp: isRegExp,
		isNotRegExp: isNotRegExp,
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
        path:path,
        pathOrElse:pathOrElse,
        remove:remove,
        has:has,
		set: set,
		type:type,
        equals:equals,
        tap:tap
	});
})(Asdf);
;(function($_) {
    $_.R = {
        FN_DEF: /^function\s*([^\(\s]*)\s*\(\s*([^\)]*)\)\s*\{([\s\S]*)\}\s*$/m,
        FN_ARG_SPLIT: /,/,
        STRIP_COMMENTS: /(?:(?:\/\/(.*)$)|(?:\/\*([\s\S]*?)\*\/))/mg,
        FN_NATIVE: /^[^{]+\{\s*\[native \w/
    };
    $_.O.extend($_.R, {
    });
})(Asdf);;/**
 * @project Asdf.js
 * @author N3735
 */
(function($_) {
    /**
     * @namespace
	 * @name Asdf.F
     */
	$_.F = {};
	var slice = Array.prototype.slice, fnProto = Function.prototype, nativeBind = fnProto.bind;

	/**
     * @memberof Asdf.F
	 * @param {*} value value
	 * @returns {*} value를 리턴한다. 
	 * @desc value를 리턴한다.
	 */
	function identity(value) {
		return value;
	}

	/**
     * @memberof Asdf.F
	 * @param {function} func 실행 함수
	 * @param {object} context 실행 함수 context
	 * @returns {function} context에서 실행할 함수를 반환한다.
	 * @desc 함수의 context를 변경한다.
	 * @example
	 * var obj = {name: 'kim'};
	 * window.name = 'lee';
	 * function getName(){return this.name};
	 * getName(); //return 'lee'
	 * Asdf.F.bind(getName, obj)(); // return 'kim'
	 */
	function bind(func, context) {
		if (func.bind === nativeBind && nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
		if (!$_.O.isFunction(func)) throw new TypeError;
		if (arguments.length < 3 && $_.O.isUndefined(arguments[1])) return func;
		var __method = func, args = slice.call(arguments, 2);
		return function() {
			var a = [];
			$_.A.merge(a, args);
			$_.A.merge(a, arguments);
			return __method.apply(context, a);
		}
	}
		
	/**
	 * @memberof Asdf.F
	 * @param {function} func 실행 함수
	 * @param {...*=} args 미리 넣을 인자들
	 * @returns {function} func에 미리 인자를 넣은 함수를 반환한다.
	 * @desc 앞부터 인자를 채워 넣는다.
	 * @example
	 * var inc1 = Asdf.F.curry(function(a,b){return a+b;}, 1);
	 * var inc2 = Asdf.F.curry(function(a,b){return a+b;}, 2);
	 * inc1(1); return 2;
	 * inc2(1); return 3; 
	 */
	function curry(func) {
		if (!$_.O.isFunction(func)) throw new TypeError;
		if (arguments.length == 1)
			return func;
		var __method = func, args = slice.call(arguments, 1);
		return function() {
			var a = [];
			$_.A.merge(a, args);
			$_.A.merge(a, arguments);
			return __method.apply(this, a);
		};
	}

	/**
	 * @memberof Asdf.F
	 * @param {function} func 실행 함수
	 * @param {number} timeout 지연시간(초) 
	 * @returns {*} setTimeoutId를 반환한다.
	 * @desc 실행함수를 지연시간 후에 실행한다. 
	 */
	function delay(func, timeout) {
		if (!$_.O.isFunction(func)) throw new TypeError;
		var __method = func, args = slice.call(arguments, 2);
		timeout = timeout * 1000;
		return window.setTimeout(function() {
			return __method.apply(__method, args);
		}, timeout);
	}

	/**
	 * @memberof Asdf.F
	 * @param {function} func 실행 함수
	 * @returns {*} setTimeoutId를 반환한다.
	 * @desc 실행함수를 0.01초 후에 실행한다. 
	 */
	function defer(func) {
		if (!$_.O.isFunction(func)) throw new TypeError;
		var args = $_.A.merge([ func, 0.01 ], slice.call(arguments, 1));
		return delay.apply(this, args);
	}

	/**
	 * @memberof Asdf.F
	 * @param {function} func 실행 함수
	 * @param {function} wrapper wrapper 함수 
	 * @returns {function} 실행함수를 wrapper로 감싼 함수를 반환한다.
	 * @desc 실행함수를 wrapper로 감싼 함수를 반환한다. wrapper의 첫번째 인자는 실행 함수 이다.
	 * @example
	 * function fn(a){
	 * 	return -a;
	 * }
	 * Asdf.F.wrap(fn, function(fn, a){ return -fn(a);})(2); //return 2;
	 */
	function wrap(func, wrapper) {
		if (!$_.O.isFunction(func)) throw new TypeError;
		var __method = func;
		return function() {
			var a = $_.A.merge([ bind(__method, this) ], arguments);
			return wrapper.apply(this, a);
		};
	}
	
	/**
	 * @memberof Asdf.F
	 * @param {function} func 실행 함수
	 * @param {function} pre 이전 실행 함수
	 * @param {boolean=} stop 이전 실행 함수의 결과값여부에 따라 실행 함수를 실행여부를 결정
	 * @returns {function} 이전 실행 함수, 실행 함수를 실행하는 함수를 반환한다.
	 * @desc 이전 실행 함수, 실행 함수를 실행하는 함수를 반환한다.
	 * @example
	 * function b(a){
	 * 	return !a; 
	 * }
	 * function fn(a){
	 * 	return a;
	 * }
	 * Asdf.F.before(fn, b)(true); //return true;
	 */
	function before(func, pre, stop){
		if(!$_.O.isFunction(func)|| !$_.O.isFunction(pre)) throw new TypeError;
		return function () {
			var pres;
			if(!(pres = pre.apply(this,arguments))&&stop) return pres;
			return func.apply(this,arguments);
		};
	}
	
	/**
	 * @memberof Asdf.F
	 * @param {function} func 실행 함수
	 * @param {function} afterfn 이후 실행 함수
	 * @param {boolean} stop 실행 함수의 결과값여부에 따라 이후 실행 함수를 실행여부를 결정 
	 * @returns {function} 실행 함수, 이후 실행함수를 실행하는 함수를 반환한다.
	 * @desc 실행 함수, 이후 실행함수를 실행하는 함수를 반환한다.
	 * @example
	 * function a(res, a) {
	 * 	return res * 2;
	 * }
	 * function fn(a){
	 * 	return a * a;
	 * }
	 * Asdf.F.after(fn, a)(2); //return 8;
	 */
	function after(func, afterfn, stop){
		if(!$_.O.isFunction(func)||!$_.O.isFunction(afterfn)) throw new TypeError;
		return function() {
			var res = func.apply(this, arguments);
			if(!res && stop) return res;
			return afterfn.apply(this, $_.A.merge([res], arguments));
		};
	}
	
	/**
	 * @memberof Asdf.F
	 * @param {function} func 실행 함수
	 * @returns {function} 실행 함수 첫번째 인자를 this로 넣은 함수를 반환한다.
	 * @desc 순수 함수를 특정 객체의 매소드로 만들 경우 유용한 함수이다. 이 함수를 실행하면 첫번째 인자에 this를 넣은 함수를 반환한다.
	 * @example
	 * var obj = {name: 'lee'};
	 * function getName(obj){
	 * 	return obj.name;
	 * }
	 * obj.getName = Asdf.F.methodize(getName);
	 * obj.getName(); //return 'lee'
	 */
	function methodize(func) {
		if (func._methodized)
			return func._methodized;
		var __method = func;
		return func._methodized = function() {
			var a = $_.A.merge([ this ], slice.call(arguments,0));
			return __method.apply(null, a);
		}
	}

    function functionize(method){
        return function(){
            var a = slice.call(arguments,1);
            var context = arguments[0];
            return method.apply(context, a);
        }
    }
	
	/**
	 * @memberof Asdf.F
	 * @param {...function} fns 실행 함수들
	 * @returns {function} 함수들 오른쪽에서 왼쪽으로 실행하는 함수를 반환한다.
	 * @desc 함수들 오른쪽에서 왼쪽으로 실행하는 함수를 반환한다. composeRight(f, g) -> g(f(x))
	 * @example
	 * function fn(a){
	 * 	return a*2;
	 * }
	 * function fn2(a){
	 * 	return a+2;
	 * }
	 * 
	 * Asdf.F.composeRight(fn, fn2)(2); // return 8;
	 */
	function composeRight() {
		var fns = $_.A.filter(slice.call(arguments), $_.O.isFunction);
		return $_.A.reduce(fns, $_.Core.behavior.compose);
	}
	
	/**
	 * @memberof Asdf.F
	 * @param {...function} fns 실행 함수들
	 * @returns {function} 함수들 오른쪽에서 왼쪽으로 실행하는 함수를 반환한다.
	 * @desc 함수들 오른쪽에서 왼쪽으로 실행하는 함수를 반환한다. compose(f, g) -> f(g(x))
	 * @example
	 * function fn(a){
	 * 	return a*2;
	 * }
	 * function fn2(a){
	 * 	return a+2;
	 * }
	 * 
	 * Asdf.F.compose(fn, fn2)(2); // return 6;
	 */
	function compose() {
		var fns = $_.A.filter(slice.call(arguments), $_.O.isFunction);
		return $_.A.reduceRight(fns, $_.Core.behavior.compose);
	}
	var exisFunction = function (fn) {
		if($_.O.isNotFunction(fn)){
			throw new TypeError();
		}
		return true;
	};
	
	/**
	 * @memberof Asdf.F
	 * @function
	 * @param {function} func 실행 함수
	 * @param {number} number 제거할 인자 갯수.
	 * @returns {function} 실행 함수에서 number 갯수 인자를 제거한 실행 함수를 반환한다.
	 * @desc 실행 함수에서 number 갯수 인자를 제거한 실행 함수를 반환한다.
	 * @example
	 * function add(a,b){ return a+b; }
	 * var add2 = Asdf.F.extract(fn, 2);
	 * add2(1,2,3,4); // return 7;
	 */
	var extract = before($_.Core.combine.extract, exisFunction);

    var nAry = before($_.Core.combine.nAry,exisFunction);
	
	/**
	 * @memberof Asdf.F
	 * @function
	 * @param {function} func 실행 함수
	 * @param {...*=} args 미리 넣을 인자들
	 * @returns {function} func에 미리 인자를 넣은 함수를 반환한다.
	 * @desc 특정 위치 부터 미리 인자를 넣은 함수를 반환한다.
	 * @example
	 * var half = Asdf.F.partial(function(a,b){return a/b;}, undefined, 2);
	 * var quater = Asdf.F.partial(function(a,b){return a/b;}, 4);
	 * half(100); // return 50;
	 * quater(100); // return 25;
	 */ 
	var partial = before($_.Core.combine.partial, exisFunction);
	
	/**
	 * @memberof Asdf.F
	 * @function
	 * @param {...function} fns 실행 함수들
	 * @returns {function} 함수 실행 결과 값 중 하나만 참이면 결과는 참인 함수를 반환한다.
	 * @desc 함수 실행 중에 하나만 참이면 이후 연산은 하지 않고 참인 함수를 반환한다.
	 * @example
	 * Asdf.F.or(Asdf.O.isString, Asdf.O.isFunction, Asdf.O.isArray)('string'); // return true;
	 */
	function or(){
		var fns = $_.A.filter(slice.call(arguments), $_.O.isFunction);
		return function(){
			var i;
			for(i =0;i < fns.length; i++){
				if(fns[i].apply(this, arguments))
					return true;
			}
			return false;
		};
	}
	
	/**
	 * @memberof Asdf.F
	 * @function
	 * @param {...function} fns 실행 함수들
	 * @returns {function} 함수 실행 결과 값 중 하나만 거짓이면 결과는 거짓인 함수를 반환한다.
	 * @desc 함수 실행 중에 하나만 거짓이면 이후 연산은 하지 않고 거짓인 함수를 반환한다.
	 * @example
	 * function fn(a){
	 * 	return a < 10;
	 * }
	 * function fn1(a){
	 * 	return a < 15;
	 * }
	 * function fn2(a){
	 * 	return a < 20;
	 * }
	 * Asdf.F.and(fn, fn1, fn2)(9); // return true;
	 */
	function and(){
		var fns = $_.A.filter(slice.call(arguments), $_.O.isFunction);
		return function(){
			var i;
			for(i =0;i < fns.length; i++){
				if(!fns[i].apply(this, arguments))
					return false;
			}
			return true;
		};
	}
	var then = partial(after, undefined, undefined, true);

	function orElse(func, elseFn, stop){
		if(!$_.O.isFunction(func)||!$_.O.isFunction(elseFn)) throw new TypeError;
		return function() {
			var res = func.apply(this, arguments);
            if(Asdf.O.isNotUndefined(stop)&&stop===res||Asdf.O.isUndefined(stop)&&!res)
                return elseFn.apply(this, arguments);
            return res;


		};
	}
    function guarded(guards){
        if(!Asdf.O.isArray(guards)) throw new TypeError();
        var guardType = {
            test: function(v){return Asdf.O.isFunction(v)},
            fn: function(v){return Asdf.O.isFunction(v)}
        };
        if(!Asdf.A.any(guards, partial(Asdf.O.type, undefined, guardType)))
            throw new TypeError();
        return function(){
            for(var i =0 ; i < guards.length; i++){
                if(guards[i].test.apply(guards[i].context, arguments))
                    return guards[i].fn.apply(guards[i].context, arguments);
            }
            throw new TypeError();
        }
    }
    function sequence() {
        var fns = $_.A.filter(slice.call(arguments), $_.O.isFunction);
        return function(){
            var res;
            var args = arguments;
            Asdf.A.each(fns, function(f){
                res = f.apply(this, args);
            });
            return res;
        }
    }
    function cases(obj, defaults){
        if(!Asdf.O.isPlainObject(obj) || !Asdf.O.isFunction(defaults)) throw new TypeError();
        defaults = defaults || function(){};
        return function(key){
            var arg = slice.call(arguments, 1);
            var fn;
            if(fn = $_.O.get(obj, key)){
                if(Asdf.O.isFunction(fn)){
                    return fn.apply(this, arg);
                }
                return fn;
            }else {
                return defaults.apply(this, arg);
            }
        }
    }

    /**
     * @private
     * @type {Object}
     */
    var stop = {};
    function overload(fn, typeFn, overloadedFn){
        overloadedFn = overloadedFn||function(){throw new TypeError;};
        var f = function(){
            if(!typeFn.apply(this, arguments)){
                return stop;
            }
            return fn.apply(this, arguments);
        };
        return orElse(f, overloadedFn, stop)
    }
    function errorHandler(fn, handler, finhandler){
        return function(){
            try{
                return fn.apply(this, arguments);
            }catch(e){
                return handler(e);
            }finally{
                if(finhandler)
                    finhandler.apply(this, arguments);
            }
        }
    }

    function trys(){
        var fns = $_.A.filter(slice.call(arguments), $_.O.isFunction);
        return $_.A.reduce(fns, nAry(errorHandler,2));
    }

    /**
     * @memberof Asdf.F
     * @param {Function} func
     * @param {Function} after
     * @param {...Function} fn
     * @returns {Function}
     */
	function asyncThen(func, after/*fns*/){
		var fns = $_.A.filter(slice.call(arguments), $_.O.isFunction);
		var fn = fns.shift();
		return wrap(fn, function(f){
			var isDone = false;
			var arg = slice.call(arguments,1);
			return f.apply(this, $_.A.map(fns, function(f,i){
				if(i === 0) {
					return function () {
						if (isDone) return;
						isDone = true;
						return f.apply(this, $_.A.merge(arg, arguments))
					};
				}
				return function(){
					if(isDone) return;
					isDone = true;
					return f.apply(this, arguments)
				};
			}));
		});
	}

	function asyncCompose(/*fns*/){
		var fns = $_.A.filter(slice.call(arguments), $_.O.isFunction);
		return $_.A.reduceRight(fns, function(f1, f2){
			return asyncThen(f1,f2);
		});
	}

	/**
	 * @memberof Asdf.F
	 * @param func
	 * @returns {*}
	 * @example
	 *
	 */

	/*

	var p1 = Asdf.F.promise(
		function(s,f){
			console.log(1);
			setTimeout(s.bind(this, 1,2), 1000);
		}
	)(
		function(s,f){
			console.log(2);
			console.log(arguments)
			setTimeout(s,1000)
		}
	)(
		function(s,f){
			console.log(3);
			setTimeout(s,1000);
		}
	);
	p1(
		function(s,f){
			console.log(4);
			f();
			setTimeout(s,1000);
		}
	)(
		function(s,f){
			console.log(5);
		},function(){
			console.log('fail');
		}
	);
	p1(
		function(s,f){
			console.log(6);
			setTimeout(s,1000);
		}
	)(
		function(s,f){
			console.log(7);
			s();
		}
	);
	*/
	function promise(func){
		var su = function(o){
			return function(){
				if(o._status !== 'pending') return;
				o._status = 'resolved';
				o.arg = slice.call(arguments);
				sequence.apply(this,$_.A.pluck(o._next,0)).apply(this, arguments);
			}
		};
		var fa = function(o){
			return function(){
				if(o._status !== 'pending') return;
				o._status = 'rejected';
				o.arg = slice.call(arguments);
				sequence.apply(this,$_.A.pluck(o._next,1)).apply(this, arguments);
			}
		};
		function f(obj){
			obj._next = [];
			obj._status = 'pending';
			function next(succ, fail){
				var o = {};
				var n = f(o);
				var snext = su(o);
				var fnext = fa(o);
				if(obj._status == 'resolved'&&succ){
					return succ.apply(this, $_.A.merge([snext,fnext],o.arg||[]));
				}else if(obj._status == 'rejected'&&fail){
					return fail.apply(this, $_.A.merge([snext,fnext],o.arg||[]));
				}
				obj._next.push([function(){
					o.arg = slice.call(arguments);
					succ.apply(this, $_.A.merge([snext,fnext],o.arg||[]));
				},function(){
					o.arg = slice.call(arguments);
					fail.apply(this, $_.A.merge([snext,fnext],o.arg||[]));
				}]);
				return n;
			}
			return next;
		}
		function run(func){
			var o = {};
			var res = f(o);
			func(su(o),fa(o));
			return res;
		}

		return run(func);
	}

    /**
     * @memberof Asdf.F
     * @param {*} value
     * @returns {Function}
     * @desc value값을 반환하는 함수를 반환한다.
     * @example
     * var T = Asdf.F.toFunction(true);
     * T(); //true;
     */
	function toFunction(value){
		return function(){
			return value;
		}
	}

    /**
     * @memberof Asdf.F
     * @param {Function} asyncfn
     * @returns {Function}
     */

	function async(asyncfn){
        if(!$_.O.isFunction(asyncfn)) throw new TypeError();
		return function(cb) {
            asyncfn.call(this,cb);
        }
	}

    /**
     * @memberof Asdf.F
     * @param {...Function} async 인자값으로 callback 함수를 받는 함수들
     * @returns {Function} async 함수들이 다 완료 후 실행 하는 함수를 인자로 받는 함수
     * @desc async 함수들이 완료 한 경우 callback 함수를 부르는 함수를 반환한다.
     * @example
     * Asdf.F.when(
     * function(cb){setTimeout(function(){cb(1)}, 50)},
     * function(cb){setTimeout(function(){cb(2)}, 25)},
     * function(cb){setTimeout(function(){cb(3)}, 70)},
     * function(cb){setTimeout(function(){cb(4)}, 10)}
     * )(function(){console.log(arguments}) //[1,2,3,4]
     */
	function when(/*async*/){
		var asyncs = slice.call(arguments);
        if(asyncs.length < 2 || $_.A.any(asyncs, $_.O.isNotFunction)) throw new TypeError();
		var l = asyncs.length-1;
		return function(cb){
            if(!$_.O.isFunction(cb)) throw new TypeError();
            var res = [];
			function r(index, value){
                res[index] = value;
				if(l === 0)
					return cb.apply(this, res);
				l--;
			}
			$_.A.each(asyncs, function(v, k){
				v(curry(r, k));
			});
		}
	}

    /**
     * @memberof Asdf.F
     * @param {Function} fn
     * @param {Number=} argNum
     * @returns {Function|*}
     * @desc 함수를 커리 함수로 만든다.
     * @example
     * function add3(a,b,c){return a+b+c};
     * var f = curried(add3);
     * f(1,2,3);
     * f(1,2)(3);
     * f(1)(2,3);
     * f(1)(2)(3);
     */
    function curried(fn, argNum){
        if(!$_.O.isFunction(fn)) throw new TypeError();
        if(argNum != null && $_.O.isNotNumber(argNum)) throw new TypeError();
        return function r(){
            if(arguments.length >= (argNum||fn.length))
                return fn.apply(this, arguments);
            else
                return bind.apply(r,$_.A.merge([r,this], arguments));
        }
    }
    /**
     * @memberof Asdf.F
     * @param {Function} func
     * @param {number} wait
     * @param {Object=} options
     * @returns {Function}
     */
    function throttle(func, wait, options) {
        if(!$_.O.isFunction(func)||!$_.O.isNumber(wait)) throw new TypeError();
        wait = wait*1000;
        var context, args, result;
        var timeout = null;
        var previous = 0;
        options || (options = {});
        var later = function() {
            previous = options.leading === false ? 0 : $_.Utils.now();
            timeout = null;
            result = func.apply(context, args);
            context = args = null;
        };
        return function() {
            var now = $_.Utils.now();
            if (!previous && options.leading === false) previous = now;
            var remaining = wait - (now - previous);
            context = this;
            args = arguments;
            if (remaining <= 0) {
                clearTimeout(timeout);
                timeout = null;
                previous = now;
                result = func.apply(context, args);
                context = args = null;
            } else if (!timeout && options.trailing !== false) {
                timeout = setTimeout(later, remaining);
            }
            return result;
        };
    }


    /**
     * @memberof Asdf.F
     * @param {Function} func
     * @param {nubmer} wait
     * @param {boolean=} immediate
     * @returns {Function}
     */
    function debounce(func, wait, immediate){
        if(!$_.O.isFunction(func)||!$_.O.isNumber(wait)) throw new TypeError();
        var timeout, args, context, timestamp, result;
        wait = wait*1000;
        var later = function() {
            var last = $_.Utils.now() - timestamp;
            if (last < wait) {
                timeout = setTimeout(later, wait - last);
            } else {
                timeout = null;
                if (!immediate) {
                    result = func.apply(context, args);
                    context = args = null;
                }
            }
        };
        return function() {
            context = this;
            args = arguments;
            timestamp = $_.Utils.now();
            var callNow = immediate && !timeout;
            if (!timeout) {
                timeout = setTimeout(later, wait);
            }
            if (callNow) {
                result = func.apply(context, args);
                context = args = null;
            }
            return result;
        }
    }

    function periodize(func, frequency, wait){
        if(!$_.O.isFunction(func)||!$_.O.isNumber(frequency)||!$_.O.isNumber(wait)) throw new TypeError();
        wait = wait*1000;
        return function(cb){
            if(!$_.O.isFunction(cb)) throw new TypeError();
            var timeout, interval, timestamp, res;
            var self = this;
            var pfn = function(){
                var last = $_.Utils.now() - timestamp;
                res = func.call(self, res, Math.min(last/wait,1));
                if(last >= wait){
                    if(interval) {
                        cb.apply(self, res);
                    }
                    clearTimeout(timeout);
                    clearInterval(interval)
                }
            };
            timestamp = $_.Utils.now();
            timeout = setTimeout(pfn, wait);
            interval = setInterval(pfn, 1/frequency*1000);
            res = func.call(self, undefined, 0);
            return interval;
        }
    }

    /**
     * @memberof Asdf.F
     * @param {Function} func
     * @returns {Function}
     */
    function once(func){
        if(!$_.O.isFunction(func)) throw new TypeError();
        var ran = false, memo;
        return function() {
            if (ran) return memo;
            ran = true;
            memo = func.apply(this, arguments);
            func = null;
            return memo;
        };
    }

    /**
     * @memberof Asdf.F
     * @param {Function} func
     * @param {Function=} hasher
     * @returns {Function}
     */
    function memoize(func, hasher){
        if(!$_.O.isFunction(func)) throw new TypeError();
        var memo = {};
        hasher || (hasher = identity);
        return function() {
            var key = hasher.apply(this, arguments);
            return Asdf.O.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
        };
    }

    /**
     * @memberof Asdf.F
     * @param {Function} fn
     * @param {object} defaults
     * @returns {Function}
     */

    function annotate(fn, defaults){
        if(!$_.O.isFunction(fn)) throw new TypeError();
        var fnText = fn.toString().replace($_.R.STRIP_COMMENTS, '');
        var argNames = $_.A.map(fnText.match($_.R.FN_DEF)[2].split($_.R.FN_ARG_SPLIT), function(arg){
            return $_.S.trim(arg);
        });
        return function(obj){
            var arg = $_.A.map(argNames, function(v){
                return obj[v]||defaults[v];
            });
            return fn.apply(this, arg);
        }
    }

    function getDef(fn){
        if(!$_.O.isFunction(fn)) throw new TypeError();
        var comments = [];
        var fnText = fn.toString().replace($_.R.STRIP_COMMENTS, function(m,p1,p2){
            comments.push($_.S.trim(p1||p2));
            return '';
        });
        var m = fnText.match($_.R.FN_DEF);
        var argNames = $_.A.map(m[2].split($_.R.FN_ARG_SPLIT), function(arg){
            return $_.S.trim(arg);
        });
        return {
            name: m[1],
            arguments: argNames,
            body:m[3],
            comments:comments
        }
    }

    function converge(after /*fns*/){
        if(!$_.O.isFunction(after)) throw new TypeError();
        var fns = $_.A.filter(slice.call(arguments,1), $_.O.isFunction);
        return function(){
            var args = arguments;
            var self = this;
            return after.apply(self, Asdf.A.map(fns, function(fn){
                return fn.apply(self, args);
            }));
        }
    }

    function zip(fn /*arrays*/){
        if(!$_.O.isFunction(fn)) throw new TypeError();
        var arrays = slice.call(arguments,1);
        var length = Asdf.A.max(Asdf.A.pluck(arrays, 'length'));
        var results = new Array(length);
        for (var i = 0; i < length; i++) results[i] = fn.apply(this,Asdf.A.pluck(arrays, "" + i));
        return results;
    }

    var complement = before(curry(compose, $_.Core.op["!"]),exisFunction);

	$_.O.extend($_.F, {
		identity: identity,
		bind: bind,
		curry: curry,
		delay: delay,
		defer: defer,
		wrap: wrap,
		before: before,
		after:after,
		methodize: methodize,
        functionize:functionize,
		compose:compose,
		composeRight:composeRight,
		extract:extract,
		partial: partial,
		or: or,
		and: and,
		then: then,
		orElse: orElse,
        guarded: guarded,
        sequence: sequence,
        cases:cases,
        overload:overload,
        errorHandler:errorHandler,
        trys:trys,
		asyncThen:asyncThen,
		asyncCompose:asyncCompose,
		toFunction:toFunction,
		async:async,
		when:when,
        curried:curried,
        debounce:debounce,
        throttle:throttle,
        once:once,
        memoize:memoize,
        periodize:periodize,
        annotate:annotate,
        getDef:getDef,
        converge:converge,
        zip:zip,
        nAry:nAry,
        complement:complement,
		alwaysFalse: toFunction(false),
		alwaysTrue:  toFunction(true),
		promise:promise
	}, true);

})(Asdf);
;/**
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
})(Asdf);;/**
 * @project Asdf.js
 * @author N3735
 * @namespace
 * @name Asdf.S
 */
(function($_) {
    var o = $_.Core.namespace($_, 'S');
	var ScriptFragment = '<script[^>]*>([\\S\\s]*?)<\/script>';
	
	/**
	 * @memberof Asdf.S
	 * @param {string} str 대상 문자열
	 * @param {number} [length=30] 축약할 글자 수
	 * @param {string} [truncation=...] 축약 시 추가될 문자열 
	 * @returns {string} 대상 문자열을 특정 크기로 자른 후 결과를 반환한다.
	 * @desc 문자열을 크기가 length보다 클 경우 문자열을 해당 length 크기로 맞춘다. 
	 * @example
	 * Asdf.S.truncate('abcdefghijkl', 5, '...'); // return 'ab...'
	 * 
	 */
	function truncate(str, length, truncation) {
		if(!$_.O.isString(str)) throw new TypeError();
		length = length || 30;
		truncation = $_.O.isUndefined(truncation) ? '...' : truncation;
		return str.length > length ?
		str.slice(0, length - truncation.length) + truncation : str;
	}
	/**
	 * @memberof Asdf.S
	 * @param {string} str 대상 문자열
	 * @returns {string} str 앞뒤 공백 문자를 제거한다.
	 * @desc str 앞 뒤 공백 문자를 제거한다. 
	 * @example
	 * Asdf.S.trim('  ab c   '); // return 'ab c'
	 * 
	 */
	function trim(str) {
		if(!$_.O.isString(str)) throw new TypeError();
		return str.replace(/^\s+/, '').replace(/\s+$/, '');
	}
	
	/**
	 * @memberof Asdf.S
	 * @param {string} str 대상 문자열
	 * @returns {string} str에 태그를 제거한다. 
	 * @desc str에 태그를 제거한다.  
	 * @example
	 * Asdf.S.stripTags('a <a href="#">link</a><script>alert("hello world!");</script>'); // return 'a linkalert("hello world!");'
	 * 
	 */
	function stripTags(str) {
		if(!$_.O.isString(str)) throw new TypeError();
	    return str.replace(/<\w+(\s+("[^"]*"|'[^']*'|[^>])+)?>|<\/\w+>/gi, '');
	}
	
	/**
	 * @memberof Asdf.S
	 * @param {string} str 대상 문자열
	 * @returns {string} str에 script태그를 제거한다.
	 * @desc str에 script태그를 제거한다.  
	 * @example
	 * Asdf.S.stripScripts('a <a href="#">link</a><script>alert("hello world!");</script>'); // return 'a <a href="#">link</a>'
	 * 
	 */
	function stripScripts(str) {
		if(!$_.O.isString(str)) throw new TypeError();
	    return str.replace(new RegExp(ScriptFragment, 'img'), '');
	}
	
	/**
	 * @memberof Asdf.S
	 * @param {string} str 대상 문자열
	 * @returns {string} html에 출력 가능한 문자로 변경하여 반환한다.
	 * @desc str에 있는 특정 문자를 <, >, &를 화면에 출력 가능하게 변경한다.  
	 * @example
	 * Asdf.S.escapeHTML('a <a href="#">link</a>'); // return 'a &lt;a href="#"&gt;link&lt;/a&gt;'
	 * 
	 */
	function escapeHTML(str) {
		if(!$_.O.isString(str)) throw new TypeError();
	    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
	}
	
	/**
	 * @memberof Asdf.S
	 * @param {string} str 대상 문자열
	 * @returns {string} str문자를 html 문자로 변경한다.
	 * @desc str에 있는 특정 문자를 <, >, &를 html문자로 변경한다. escapeHTML와 반대.  
	 * @example
	 * Asdf.S.unescapeHTML('a &lt;a href="#"&gt;link&lt;/a&gt;'); // return 'a <a href="#">link</a>'
	 * 
	 */
	function unescapeHTML(str) {
		if(!$_.O.isString(str)) throw new TypeError();
	    return stripTags(str).replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
	}
	/**
	 * @memberof Asdf.S
	 * @param {string} str 대상 문자열
	 * @param {string} [separator=&] 값들 간의 구분자
	 * @param {string} [sepKV==] key value 구분자
	 * @returns {object} 대상 문자열을 object로 변환한다.
	 * @desc 대상 문자열을 object로 변환한다.  
	 * @example
	 * Asdf.S.toQueryParams('a=1&a=2&b=3&c=4'); // return {a:[1,2],b:3,c:4};
	 * 
	 */
	function toQueryParams(str,separator, sepKV) {
		if(!$_.O.isString(str)) throw new TypeError();
		var reduce = $_.A.reduce;
		var match = trim(str).match(/([^?#]*)(#.*)?$/);
		if (!match)
			return {};
		return reduce(match[1].split(separator || '&'),	function(hash, pair) {
			if ((pair = pair.split(sepKV || '='))[0]) {
				var key = decodeURIComponent(pair.shift()), value = pair.length > 1 ? pair.join('='): pair[0];
				if (value != null)
					value = decodeURIComponent(value);
				if (key in hash) {
					if (!$_.O.isArray(hash[key])){
						hash[key] = [ hash[key] ];
					}
					hash[key].push(value);
				} else
					hash[key] = value;
				}
			return hash;
		}, {});
	}
	
	/**
	 * @memberof Asdf.S
	 * @param {string} str 대상 문자열
	 * @returns {Array} 대상 문자열을 array로 변환한다.
	 * @desc 대상 문자열을 array로 변환한다.  
	 * @example
	 * Asdf.S.toArray('abc'); // return ['a','b','c'];
	 * 
	 */
	function toArray(str) {
		if(!$_.O.isString(str)) throw new TypeError();
	    return str.split('');
	}
	/**
	 * @memberof Asdf.S
	 * @param {string} str 대상 문자열
	 * @returns {string} 다음 문자열을 반환한다.
	 * @desc keycode가 다음인 문자열을 반환한다.
	 * @example
	 * Asdf.S.succ('a'); // return 'b';
	 * 
	 */
	function succ(str) {
		if(!$_.O.isString(str)) throw new TypeError();
	    return str.slice(0, str.length - 1) +
	      String.fromCharCode(str.charCodeAt(str.length - 1) + 1);
	}
	
	/**
	 * @memberof Asdf.S
	 * @param {string} str 대상 문자열
	 * @param {number} count 대상 문자열 횟수
	 * @returns {string} 대상 문자열을 count 횟수 만큼 반복하여 반환한다.
	 * @desc 대상 문자열을 count 횟수 만큼 반복하여 반환한다.
	 * @example
	 * Asdf.S.times('abc',3); // return 'abcabcabc'
	 * 
	 */
	function times(str, count) {
		if(!$_.O.isString(str)) throw new TypeError();
	    return count < 1 ? '' : new Array(count + 1).join(str);
	}
	
	/**
	 * @memberof Asdf.S
	 * @param {string} str 대상 문자열
	 * @returns {string} background-color -> backgroundColor.
	 * @desc -를 없애고 다음 문자를 대문자로 변경한다.
	 * @example
	 * Asdf.S.camelize('background-color'); // return 'backgroundColor'
	 * 
	 */
	function camelize(str) {
		if(!$_.O.isString(str)) throw new TypeError();
	    return str.replace(/-+(.)?/g, function(match, chr) {
	      return chr ? chr.toUpperCase() : '';
	    });
	}
	
	/**
	 * @memberof Asdf.S
	 * @param {string} str 대상 문자열
	 * @returns {string} background -> Background.
	 * @desc 첫문자를 대문자로 이후 문자를 소문자로 바꾼다.
	 * @example
	 * Asdf.S.capitalize('background'); // return 'Background'
	 * 
	 */
	function capitalize(str) {
		if(!$_.O.isString(str)) throw new TypeError();
	    return str.charAt(0).toUpperCase() + str.substring(1).toLowerCase();
	}
	
	/**
	 * @memberof Asdf.S
	 * @param {string} str 대상 문자열
	 * @returns {string} backgroundColor -> background_color
	 * @desc 대문자 앞에 _변경하고 대문자를 소문자로 바꾸어 반환한다.
	 * @example
	 * Asdf.S.underscore('backgroundColor'); // return 'background_color'
	 * 
	 */
	function underscore(str) {
		if(!$_.O.isString(str)) throw new TypeError();
	    return str.replace(/::/g, '/')
	               .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
	               .replace(/([a-z\d])([A-Z])/g, '$1_$2')
	               .replace(/-/g, '_')
	               .toLowerCase();
	}
	
	/**
	 * @memberof Asdf.S
	 * @param {string} str 대상 문자열
	 * @returns {string} background_color -> background-color
	 * @desc _를 -로 변경한다.
	 * @example
	 * Asdf.S.dasherize('background_color'); // return 'background-color'
	 * 
	 */
	function dasherize(str) {
		if(!$_.O.isString(str)) throw new TypeError();
	    return str.replace(/_/g, '-');
	}
	
	/**
	 * @memberof Asdf.S
	 * @param {string} str 대상 문자열
	 * @param {string} pattern 찾는 문자열
	 * @returns {boolean} 대상 문자열에 찾는 문자열이 있으면 true를 반환한다.
	 * @desc 대상 문자열에 찾는 문자열이 있으면 true를 반환한다.
	 * @example
	 * Asdf.S.include('background_color', 'or'); // return true;
	 * 
	 */
	function include(str, pattern) {
		if(!$_.O.isString(str)||!$_.O.isString(pattern)) throw new TypeError();
	    return str.indexOf(pattern) > -1;
	}
	
	/**
	 * @memberof Asdf.S
	 * @param {string} str 대상 문자열
	 * @param {string} pattern 찾는 문자열
	 * @returns {boolean} 대상 문자열 앞에 찾는 문자열이 있으면 true를 반환한다.
	 * @desc 대상 문자열 앞에 찾는 문자열이 있으면 true를 반환한다.
	 * @example
	 * Asdf.S.startsWith('background_color', 'back'); // return true;
	 * 
	 */
	function startsWith(str, pattern) {
		if(!$_.O.isString(str)||!$_.O.isString(pattern)) throw new TypeError();
	    return str.lastIndexOf(pattern, 0) === 0;
	}
	
	/**
	 * @memberof Asdf.S
	 * @param {string} str 대상 문자열
	 * @param {string} pattern 찾는 문자열
	 * @returns {boolean} 대상 문자열 마지막에 찾는 문자열이 있으면 true를 반환한다.
	 * @desc 대상 문자열 마지막에 찾는 문자열이 있으면 true를 반환한다.
	 * @example
	 * Asdf.S.endsWith('background_color', 'color'); // return true;
	 * 
	 */
	function endsWith(str, pattern) {
		if(!$_.O.isString(str)||!$_.O.isString(pattern)) throw new TypeError();
	    var d = str.length - pattern.length;
	    return d >= 0 && str.indexOf(pattern, d) === d;
	}
	
	/**
	 * @memberof Asdf.S
	 * @param {string} str 대상 문자열
	 * @returns {boolean} 대상 문자열이 빈값이면 true를 반환한다.
	 * @desc 대상 문자열이 빈값이면 true를 반환한다.
	 * @example
	 * Asdf.S.isEmpty(''); // return true;
	 * 
	 */
	function isEmpty(str) {
		if(!$_.O.isString(str)) throw new TypeError();
	    return str === '';
	}
	
	/**
	 * @memberof Asdf.S
	 * @param {string} str 대상 문자열
	 * @returns {boolean} 대상 문자열이 빈 값 또는 공백 문자일 경우 true를 반환한다.
	 * @desc 대상 문자열이 빈 값 또는 공백 문자일 경우 true를 반환한다.
	 * @example
	 * Asdf.S.isBlank(' '); // return true;
	 * 
	 */
	function isBlank(str) {
		if(!$_.O.isString(str)) throw new TypeError();
	    return /^\s*$/.test(str);
	}

    /**
     * @memberof Asdf.S
     * @param {string} str
     * @returns {boolean}
     * @desc json 여부를 판단한다.
     */
    function isJSON(str) {
        if($_.O.isNotString(str)) throw new TypeError();
        if(isBlank(str)) return false
        str = str.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@');
        str = str.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']');
        str = str.replace(/(?:^|:|,)(?:\s*\[)+/g, '');
        return (/^[\],:{}\s]*$/).test(str);
    }

	/**
	 * @memberof Asdf.S
	 * @param {string} str 대상 문자
     * @param {string} padStr 추가할 문자열
	 * @param {number} length 만들 문자열 길이
	 * @returns {string} 대상 문자열에 왼쪽에 추가 문자열을 넣어 length만큼 길이를 만들어서 반환한다. 
	 * @desc 대상 문자열에 왼쪽에 추가 문자열을 넣어 length만큼 길이를 만들어서 반환한다. 
	 * @example
	 * Asdf.S.lpad('1', '0', 4); // return '0001';
	 * 
	 */
	function lpad(str, padStr, length){
		if(!$_.O.isString(str) || !$_.O.isNumber(length)) throw new TypeError();
		return (new Array(length+1).join(padStr)+str).slice(-length);
	}
	
	/**
	 * @memberof Asdf.S
	 * @param {string} str 대상 문자열
	 * @param {string} padStr 추가할 문자열
	 * @param {number} length 만들 문자열 길이
	 * @returns {string} 대상 문자열에 오른쪽에 추가 문자열을 넣어 length만큼 길이를 만들어서 반환한다. 
	 * @desc 대상 문자열에 오른쪽쪽에 추가 문자열을 넣어 length만큼 길이를 만들어서 반환한다. 
	 * @example
	 * Asdf.S.rpad('1', '0', 4); // return '1000';
	 * 
	 */
	function rpad(str, padStr, length){
		if(!$_.O.isString(str) || !$_.O.isNumber(length)) throw new TypeError();
		return (str + new Array(length+1).join(padStr)).slice(0,length);
	}
	
	/**
	 * @memberof Asdf.S
	 * @param {string} str 대상 문자열
	 * @param {regexp} reg 정규 표현식
	 * @returns {{set:Function, toString:Function}} template
	 * @desc template 객체를 반환한다. template.set(1, 'abc');... template.toString(); 
	 * @example
	 * var t = Asdf.S.template('aa ? bb ? cc ?', /\?/g);
	 * t.set(1, 'bbb');
	 * t.set(2, 'ccc');
	 * t.set(3, 'ddd');
	 * t.toString(); // return 'aa bbb bb ccc cc ddd';
	 * 
	 * var t1 = Asdf.S.template('aa {{AA}} bb {{BB}} cc {{CC}}');
	 * t1.set('AA', 'bbb');
	 * t1.set('BB', 'ccc');
	 * t1.set(3, 'ddd');
	 * t1.toString(); // return 'aa bbb bb ccc cc ddd';
	 * 
	 * var t2 = Asdf.S.template('aa {{AA}} bb {{BB}} cc {{CC}}');
	 * var obj = {AA: 'bbb', BB:'ccc', CC: 'ddd'};
	 * t2.set(obj);
	 * 
	 * var t3 = Asdf.S.template('aa <?AA?> bb <?BB?> cc <?CC?>', /\<\?([\s\S]+?)\?\>/g);
	 * t3.set(1, 'bbb');
	 * t3.set(2, 'ccc');
	 * t3.set(3, 'ddd');
	 * t3.toString(); // return 'aa bbb bb ccc cc ddd'
	 */
	function template(str, reg){
		if (!$_.O.isString(str))
			throw new TypeError();
		reg = reg || /\{\{([\s\S]+?)\}\}/g;
		var data = [];
		var parse = function(str) {
			var i =0;
			var pos = 0;
			data[i] = str;
			str.replace(reg, function(m, key, index) {
				if($_.O.isNumber(key)) {
					index = key;
					key = undefined;
				}
				data[i] = str.substring(pos, index);
				data[++i] = {key:key, text:undefined, toString : function(){return this.text;}};
				pos = index + m.length;
				if(pos<str.length)
					data[++i] = str.substring(pos);
			});
		};
		var getIndexs = function(key){
			var res = [];
			$_.A.each($_.A.pluck(data, 'key'), function(value, i){
				if(value === key)
					res.push(i);
			});
			return res;
		};
		var set = function(index, str) {
			if($_.O.isNumber(index)){
				if (index < 1)
					throw new Error("index is great than 0");
				if (data.length <= index * 2 - 1)
					throw new Error("index is less than ?s");
				data[index * 2 - 1].text = str;
			}
			else if($_.O.isString(index)){
				var ins = getIndexs(index);
				if(ins.length === 0) throw new Error("index is wrong");
				$_.A.each(ins, function(value) {
					data[value].text = str;
				});
			}else if($_.O.isPlainObject(index)){
				$_.O.each(index, function(value, key) {
					set(key, value);
				});
			}else {
				throw new Error();
			}
		};
		var toString = function() {
			var i;
			for (i = 0; i < data.length; i++) {
				if (data[i].toString() === undefined)
					throw new Error(((i + 1) / 2) + " undefined");
			}
			return data.join('');
		};
		parse(str);
		return {
			set : set,
			toString : toString
		};
	}

    /**
     * @memberof Asdf.S
     * @param {string} version1
     * @param {string} version2
     * @param {Function} compareFn
     * @returns {number}
     */
    function compareVersion(version1, version2, compareFn){
        compareFn = compareFn||compare;
        var order = 0;
        var v1Subs = trim(String(version1)).split('.');
        var v2Subs = trim(String(version2)).split('.');
        var subCount = Math.max(v1Subs.length, v2Subs.length);
        for (var subIdx = 0; order === 0 && subIdx < subCount; subIdx++) {
            var v1Sub = v1Subs[subIdx] || '';
            var v2Sub = v2Subs[subIdx] || '';
            var v1CompParser = new RegExp('(\\d*)(\\D*)', 'g');
            var v2CompParser = new RegExp('(\\d*)(\\D*)', 'g');
            do {
                var v1Comp = v1CompParser.exec(v1Sub) || ['', '', ''];
                var v2Comp = v2CompParser.exec(v2Sub) || ['', '', ''];
                if (v1Comp[0].length === 0 && v2Comp[0].length === 0) {
                    break;
                }
                var v1CompNum = v1Comp[1].length === 0 ? 0 : parseInt(v1Comp[1], 10);
                var v2CompNum = v2Comp[1].length === 0 ? 0 : parseInt(v2Comp[1], 10);
                order = compareFn(v1CompNum, v2CompNum) ||
                    compareFn(v1Comp[2].length === 0, v2Comp[2].length === 0) ||
                    compareFn(v1Comp[2], v2Comp[2]);
            } while (order === 0);
        }

        return order;
    }

    function compare(a,b){
        if(a<b)
            return -1;
        else if(a>b)
            return 1;
        return 0;
    }

    function interpreter(/*c, str , args*/){
        var c = {};
        var args = Array.prototype.slice.call(arguments);
        if($_.O.isPlainObject(arguments[0])){
            c = args.shift();
        }
        var str = args.shift();
        if($_.O.isNotString(str))
            throw new TypeError();
        var conf = {
            varToken: '%v',
            argToken: '%a',
            token:{
                'false': false,
                'true': true,
                'null': null,
                'undefined': undefined,
                '#s': ' '
            },
            functions:{
            },
            separator:{
                startToken: '(',
                endToken: ')',
                separator: /\s+|,/
            },
            autoNumber: true
        };
        $_.A.each(['O','F','A','N','S'], function(v){
            $_.O.extend(conf.functions, $_[v]);
        });
        $_.O.extend(conf, c);

        var tokenKeys = Asdf.O.keys(conf.token);
        var tokenTree = tokenizer(conf.separator, {token:[], rest:str});
        var vars = new RegExp('^'+toRegExp(conf.varToken)+'[0-9]{1,2}$');
        var argsReg = new RegExp('^'+toRegExp(conf.argToken)+'[0-9]{1,2}$');
        function isFunction(fn, paramsObj){
            return $_.O.isFunction(fn)  && paramsObj && paramsObj.type == 'token';
        }
        function r(tokenTree){
            return $_.A.reduce(tokenTree, function(m, v){
                if(conf.functions[v]){
                    m.push(conf.functions[v]);
                    return m;
                }
                else if(isFunction($_.A.last(m), v)){
                    var fn = m.pop();
                    var parameter = r(v);
                    var fun = function(){
                        var arg = arguments;
                        for(var i = 0; i < parameter.length; i++) {
                            var v = parameter[i];
                            if (argsReg.test(v)) {
                                var j = parseInt(v.substring(conf.argToken.length), 10);
                                parameter[i] = arg[j];
                            }
                        }
                        return fn.apply(this, $_.A.map(parameter, function(f){
                                if($_.O.isFunction(f) && f.type == 'token')
                                    return f.apply(this, arg);
                                return f;
                            })
                        );
                    }
                    fun.type = 'token';
                    m.push(fun);
                    return m;
                }else if($_.A.include(tokenKeys,v)) {
                    m.push(conf.token[v]);
                    return m;
                }else if(conf.autoNumber&&Number(v) == v){
                    m.push(Number(v));
                    return m;
                }else if(vars.test(v)){
                    var j = parseInt(v.substring(conf.varToken.length),10);
                    if (args.length <= j)
                        throw new TypeError('too short variables '+ j);
                    m.push(args[j]);
                    return m;
                }
                m.push(v);
                return m;
            }, []);
        }
        return r(tokenTree.token)[0];
    }

    /**
     * @memberof Asdf.S
     * @param {string} str
     * @returns {string}
     */
    function toRegExp(str){
        return str.replace(/([\\^$()[\]])/g,'\\$1');
    }

    function tokenizer(c, o){
        var stack = [], m;
        var conf = c;
        var tokenReg = new RegExp('('+toRegExp(conf.startToken)+')|'+
            '('+toRegExp(conf.endToken)+')');
        function functionToken(array){
            return $_.A.merge({length:0, type:'token'},$_.A.compact(array));
        }
        function endToken(o, end){
            if(!stack.length)
                throw new TypeError(conf.endToken + ' parse Error');
            var pos = stack.pop();
            var res = o.token.splice(pos);
            var a = trim(o.rest.substring(0, end)).split(conf.separator);
            if(a!=='')
                $_.A.merge(res, a);
            o.token.push(functionToken(res));
            return {token: o.token, rest: o.rest.substring(end+conf.endToken.length)};
        }
        function startToken(o, start){
            var p = o.token.length;
            if(start !== 0)
                p = $_.A.merge(o.token, trim(o.rest.substring(0, start)).split(conf.separator)).length;
            stack.push(p);
            return {token: o.token, rest: o.rest.substring(start+conf.startToken.length)};
        }
        o.rest = trim(o.rest);
        while(m = tokenReg.exec(o.rest)){
            var res;
            if(m[2]){
                res = endToken(o, m.index);
            }else if(m[1]){
                res = startToken(o, m.index);
            }else{
                continue;
            }
            if(!res)
                throw new TypeError('parse Error');
            o.rest = trim(res.rest);
        }
        if(stack.length)
            throw new TypeError(conf.startToken + ' parse Error');
        return o;

    }

    var substring = Asdf.F.functionize(String.prototype.substring);

    var charAt = Asdf.F.functionize(String.prototype.charAt);

    var charCodeAt = Asdf.F.functionize(String.prototype.charCodeAt);

    var match = Asdf.F.functionize(String.prototype.match);

    var toUpperCase = Asdf.F.functionize(String.prototype.toUpperCase);

    var toLowerCase = Asdf.F.functionize(String.prototype.toLowerCase);

    var split = Asdf.F.functionize(String.prototype.split);

    $_.O.extend(o, {
		truncate: truncate,
		trim: trim,
		stripTags: stripTags,
		stripScripts: stripScripts,
		escapeHTML: escapeHTML,
		unescapeHTML: unescapeHTML,
		toQueryParams: toQueryParams,
		toArray: toArray,
		succ: succ,
		times: times,
		camelize: camelize,
		capitalize: capitalize,
		underscore: underscore,
		dasherize: dasherize,
		include: include,
		startsWith: startsWith,
		endsWith: endsWith,
		isEmpty: isEmpty,
		isBlank: isBlank,
		lpad: lpad,
		rpad: rpad,
		template:template,
        compareVersion: compareVersion,
        isJSON:isJSON,
        interpreter:interpreter,
        substring:substring,
        charAt:charAt,
        charCodeAt:charCodeAt,
        match:match,
        toUpperCase:toUpperCase,
        toLowerCase:toLowerCase,
        split:split
	});
})(Asdf);
;(function($_) {
	$_.Arg = {};
	function toArray(){
		return $_.A.toArray(arguments);
	}
    function relocate(arr, fn, context){
        if(!$_.O.isArray(arr)|| $_.A.any(arr, $_.O.isNotNumber))
            throw new TypeError();
        return function(){
            var res = [];
            var arg = $_.A.toArray(arguments);
            $_.A.each(arr, function(v, k){
                if($_.O.isUndefined(v))
                    return;
                res[k] = arg[v];
            });
            return fn.apply(context, res);
        }
    }
    function transfer(arr, fn, context){
        if(!$_.O.isArray(arr)|| $_.A.any(arr, $_.O.isNotFunction))
            throw new TypeError();
        return function(){
            var res = [];
            var arg = $_.A.toArray(arguments);
            $_.A.each(arr, function(v, k){
                res[k] = v(arg[k]);
            });
            return fn.apply(context, res);
        }
    }
	$_.O.extend($_.Arg, {
		toArray:toArray,
        relocate:relocate,
        transfer:transfer
	});
})(Asdf);;(function($_) {
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
    var add = $_.F.curried($_.Core.op["+"], 2);
    var multiply = $_.F.curried($_.Core.op["*"], 2);
    var subtract = $_.F.curried($_.Core.op["-"], 2);
    var divide = $_.F.curried($_.Core.op["/"], 2);
    var modulo = $_.F.curried($_.Core.op["%"], 2);
	var sum = $_.F.compose($_.Arg.toArray, partial($_.A.filter, undefined, isNotNaN), partial($_.A.reduce, undefined, $_.Core.op["+"], 0));
    var product = $_.F.compose($_.Arg.toArray, partial($_.A.filter, undefined, isNotNaN), partial($_.A.reduce, undefined, $_.Core.op["*"], 1));
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
    var isGreaterThanOrEqualTo = is(function (n, a){ return n >= a;});
	var isNotGreaterThan = not(isGreaterThan);
	var isLessThan = is(function (n, a){ return n < a;});
    var isLessThanOrEqualTo = is(function (n, a){ return n <= a;});
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

    function times(count, fn) {
        if($_.O.isNotNumber(count)||!$_.O.isFunction(fn)) throw new TypeError();
        for(var i = 0; i < count; i++){
            fn(i);
        }
    }

    $_.O.extend($_.N, {
		sum: sum,
        add: add,
        multiply:multiply,
        subtract:subtract,
        divide:divide,
        modulo:modulo,
        product:product,
		isNotNaN: isNotNaN,
		range: range,
		isRange: isRange,
		isNotRange: isNotRange,
		isZero : isZero,
		isNotZero : isNotZero,
		isSame : isSame,
		isNotSame: isNotSame,
		isGreaterThan: isGreaterThan,
        gt: Asdf.F.curried(Asdf.Arg.relocate([1,0], isGreaterThan),2),
		gte: Asdf.F.curried(Asdf.Arg.relocate([1,0], isGreaterThanOrEqualTo),2),
        isNotGreaterThan: isNotGreaterThan,
		isLessThan: isLessThan,
        lt: Asdf.F.curried(Asdf.Arg.relocate([1,0], isLessThan),2),
        lte: Asdf.F.curried(Asdf.Arg.relocate([1,0], isLessThanOrEqualTo),2),
		isNotLessThan: isNotLessThan,
		isUntil: isLessThan,
		isNotUntil: isNotLessThan,
        isFinite:isFinite,
        clamp:clamp,
        times:times
	});
})(Asdf);;(function($_) {
	$_.P = {};
	function mix(fn, sorce) {
		if(!$_.O.isFunction(fn) || !$_.O.isPlainObject(sorce))
			throw new TypeError();
		$_.O.each(sorce, function(value, key) {
			var pk = fn.prototype[key];
			if(pk == null){
				fn.prototype[key] = value;
			}else if($_.O.isFunction(pk)&&$_.O.isFunction(value)){
				fn.prototype[key] = $_.F.compose(pk, value);
			}else
				new TypeError();
		});
	}
	$_.O.extend($_.P, {
		mix:mix
	});
})(Asdf);;/**
 * Created by kim on 2014-04-20.
 */
/**
 * @project Asdf.js
 * @author N3735
 * @namespace
 * @name Asdf.O
 */
(function($_) {
    var o = $_.Core.namespace($_, 'O');
    var curry = $_.Core.combine.curry;
    var compose = $_.Core.behavior.compose;
    var not = curry(compose, $_.Core.op["!"]);

    function isXML(el){
        return (el.ownerDocument || el.documentElement.nodeName.toLowerCase() !== 'html');
    }
    var isNotXML = not(isXML);
    $_.O.extend(o, {
        isXML: isXML,
        isNotXML:isNotXML
    });
})(Asdf);;/**
 * @project Asdf.js
 * @author N3735
 * @namespace
 * @name Asdf.S
 */
(function($_) {
    var o = $_.Core.namespace($_, 'S');

	/**
	 * @memberof Asdf.S
	 * @param {string} str 대상 문자열
	 * @returns {Node} 대상 문자열을 node로 변경한다.
	 * @desc 대상 문자열을 node로 변경한다.
	 * @example
	 * Asdf.S.toElement('<div id='abc'>abc</div> '); // return <div id='abc'>abc</div>;
	 *
	 */
	function toElement(str){
		if(!$_.O.isString(str)) throw new TypeError();
		var el = document.createElement('div');
		el.innerHTML = str;
		return el.firstChild;
	}
	
	/**
	 * @memberof Asdf.S
	 * @param {string} str 대상 문자열
	 * @returns {DocumentFragment} 대상 문자열을 element로 변경 한 후 그 element를 documentFragment에 넣어서 반환한다.
	 * @desc 대상 문자열을 element로 변경 한 후 그 element를 documentFragment에 넣어서 반환한다.
	 * 
	 */
	function toDocumentFragment(str) {
		if(!$_.O.isString(str)) throw new TypeError();
		var el = document.createElement('div'), frg = document.createDocumentFragment();
		el.innerHTML = str;
		while(el.childNodes.length) frg.appendChild(el.childNodes[0]);
		return frg;	
	}
	

	$_.O.extend(o, {
		toDocumentFragment:toDocumentFragment,
		toElement: toElement
	});
})(Asdf);
;(function($_) {
	$_.Bom = {};
    var alwaysFalse = $_.F.alwaysFalse;
    var rnative = $_.R.FN_NATIVE;
	var Browser = getBrowser(window);
    function getBrowser(win) {
        var ua = win.navigator.userAgent;
        var doc = win.document;
        ua = ua.toLowerCase();
        var match = /(chrome)[ \/]([\w.]+)/.exec(ua)
            || /(webkit)[ \/]([\w.]+)/.exec(ua)
            || /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua)
            || /(msie) ([\w.]+)/.exec(ua)
            || /(msie)(?:.*?Trident.*? rv:([\w.]+))/.exec('msie'+ua)
            || ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua) || [];
        var browser = match[1] || "";
        var version = match[2] || "0";
        var documentMode =  browser != 'msie'? undefined : doc.documentMode || (doc.compatMode == 'CSS1Compat'? parseInt(version,10) : 5);
        return {
            browser : browser,
            version : version,
            documentMode:documentMode
        };
    }
    function _reset(div){
        div.innerHTML = '';
        div.id = '';
        div.name = '';
        div.className = '';
    }

    function getSupport(win){
        var doc = win.document;
        var docElem = doc.documentElement;
        var support = {};
        var div = document.createElement('div');
        var fragment = document.createDocumentFragment();
        var input = document.createElement('input');
        support.attribute = $_.F.errorHandler(function(div){
            div.className = 'i';
            return !div.getAttribute('className');
        }, alwaysFalse, _reset)(div);
        support.htmlSerialize = $_.F.errorHandler(function(div){
            div.innerHTML = '<link/>';
            return !!div.getElementsByTagName( "link" ).length;
        }, alwaysFalse, _reset)(div);
        support.html5Clone = doc.createElement( "nav" ).cloneNode( true ).outerHTML !== "<:nav></:nav>";
        support.getElementsByTagName = $_.F.errorHandler(function(div){
            div.appendChild(doc.createComment(''));
            return !div.getElementsByTagName('*').length;
        }, alwaysFalse, _reset)(div);
        support.getElementsByClassName = rnative.test(doc.getElementsByClassName);
        support.getById = $_.F.errorHandler(function(div){
            docElem.appendChild(div).id = 'aa';
            return !doc.getElementsByName || !doc.getElementsByName('aa').length;
        }, alwaysFalse, _reset)(div);
        support.leadingWhitespace = $_.F.errorHandler(function(div){
            div.innerHTML = '  ';
            return div.firstChild.nodeType === 3;
        }, alwaysFalse, _reset)(div);
        support.tbody = $_.F.errorHandler(function(div){
            div.innerHTML = '<table></table>';
            return !div.getElementsByTagName('tbody').length;
        }, alwaysFalse, _reset)(div);
        support.qsa = rnative.test(doc.querySelectorAll);
        support.qsaNotSupport = (function(){
            if(!support.qsa) return $_.F.alwaysFalse;
            var rbuggyQSA = [];
            var whitespace = "[\\x20\\t\\r\\n\\f]";
            var booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped";
            $_.F.errorHandler(function(div){
                div.innerHTML = "<select msallowcapture=''>" +
                "<option id='d\f]' selected=''></option></select>";
                if ( div.querySelectorAll("[msallowcapture^='']").length ) {
                    rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:''|\"\")" );
                }
                if ( !div.querySelectorAll("[selected]").length ) {
                    rbuggyQSA.push( "\\[" + whitespace + "*(?:value|" + booleans + ")" );
                }
                if ( !div.querySelectorAll("[id~=d]").length ) {
                    rbuggyQSA.push("~=");
                }
                if ( !div.querySelectorAll(":checked").length ) {
                    rbuggyQSA.push(":checked");
                }
            }, alwaysFalse, _reset)(div);
            $_.F.errorHandler(function(div){
                var input = doc.createElement("input");
                input.setAttribute( "type", "hidden" );
                div.appendChild( input ).setAttribute( "name", "D" );
                if ( div.querySelectorAll("[name=d]").length ) {
                    rbuggyQSA.push( "name" + whitespace + "*[*^$|!~]?=" );
                }
                if ( !div.querySelectorAll(":enabled").length ) {
                    rbuggyQSA.push( ":enabled", ":disabled" );
                }
                div.querySelectorAll("*,:x");
                rbuggyQSA.push(",.*:");
            }, alwaysFalse, _reset)(div);
            rbuggyQSA = rbuggyQSA.length && new RegExp( rbuggyQSA.join("|") );
            return function(selector){
                return rbuggyQSA&&rbuggyQSA.test(selector);
            }
        })();
        support.appendChecked =$_.F.errorHandler(function(div,input, fragment){
            input.type = 'checkbox';
            input.checked = true;
            fragment.appendChild(input);
            return input.checked;
        }, alwaysFalse, _reset)(div, input, fragment);
        support.noCloneChecked = $_.F.errorHandler(function(div){
            div.innerHTML = '<textarea>x</textarea>';
            return !!div.cloneNode( true ).lastChild.defaultValue;
        }, alwaysFalse, _reset)(div);
        support.noCloneEvent = $_.F.errorHandler(function(div){
            var res = true;
            div.attachEvent&&div.attachEvent( "onclick", function() {
                res = false;
            });
            div.cloneNode( true ).click();
            return res;
        }, alwaysFalse, _reset)(div);
        support.deleteExpando = $_.F.errorHandler(function(div){
            delete div.test;
            return true;
        }, alwaysFalse, _reset)(div);
        support.XPath = rnative.test(doc.evaluate);
        support.ElementExtensions = (function() {
            var constructor = win.Element || win.HTMLElement;
            return !!(constructor && constructor.prototype);
        })();
        support.SpecificElementExtensions = (function() {
            if (typeof window.HTMLDivElement !== 'undefined')
                return true;
            var form = document.createElement('form'), isSupported = false;
            if (div['__proto__'] && (div['__proto__'] !== form['__proto__'])) {
                isSupported = true;
            }
            form = null;
            return isSupported;
        })();
        div.parentNode&&div.parentNode.removeChild(div);
        div = fragment = null;
        return support;
    }

	var features = {
        CanAddNameOrTypeAttributes : Browser.browser != 'msie' || Browser.documentMode >= 9,
        CanUseChildrenAttribute : Browser.browser != 'msie' && Browser.browser != 'mozilla' ||
            Browser.browser == 'msie' && Browser.documentMode >= 9 ||
            Browser.browser == 'mozilla' && Asdf.S.compareVersion(Browser.version, '1.9.1') >=0,
        CanUseParentElementProperty : Browser.browser == 'msie' || Browser.browser == 'opera' || Browser.browser == 'webkit'
	};
    $_.O.extend(features, getSupport(window));
    var browserMap = {
        'firefox' : 'mozilla',
        'ff': 'mozilla',
        'ie': 'msie'
    };
    function isBrowser(browser){
        if(!Asdf.O.isString(browser)) throw new TypeError()
        return (browserMap[browser.toLowerCase()]||browser.toLowerCase()) == Browser.browser
    }
    function compareVersion(version){
        return Asdf.S.compareVersion(Browser.version, version);
    }
	$_.O.extend($_.Bom, {
        isBrowser: isBrowser,
        compareVersion: compareVersion,
		browser : Browser.browser,
		version: Browser.version,
        documentMode: Browser.documentMode,
		features:features,
        getSupport:getSupport
	});
})(Asdf);;(function($_) {
    $_.Event = {};
    var extend = $_.O.extend, slice = Array.prototype.slice;
    var id = 1;
    var prefix = 'f';

    function getWrapedhandler(element, eventName, handler){
        var event = Asdf.Element.get(element, '_event', true)||{};
        var farr;
        if(handler._fid && (farr = Asdf.O.path(event,[eventName, handler._fid]))){
            return farr.pop();
        }else{
            return handler;
        }
    }

    function makeid(){
        return prefix+(id++);
    }

    function addEventListener(element, eventName, handler) {
        if (element.addEventListener) {
            element.addEventListener(eventName, handler, false);

        }else {
            element.attachEvent("on" + eventName, handler);
        }
    }

    function removeEventListener(element, eventName, handler){
        if(element.removeEventListener){
            element.removeEventListener( eventName, handler, false );
        }else {
            var ieeventName = 'on'+eventName;
            if(element[ieeventName] === void 0){
                element[ieeventName] = null;
            }
            element.detachEvent( ieeventName, handler );
        }

    }
    function fix(event){
        if(!event.target){
            event.target = event.srcElement || document;
        }
        if(event.target.nodeType === 3) {
            event.target = event.target.parentNode;
        }
        event.metaKey = !!event.metaKey;
        fixEvent(event);
        event.stop = $_.F.methodize(stop);
        return fixHooks(event);
    }
    function fixEvent(event){
        if(!event.stopPropagation){
            event.stopPropagation = function() { event.cancelBubble = true; };
            event.preventDefault = function() { event.returnValue = false; };
        }
    }
    function stop(event){
        if(!event.stopPropagation){
            fixEvent(event);
        }
        event.preventDefault();
        event.stopPropagation();
    }
    function fixHooks(event){
        function keyHooks(event){
            if(!event.which) {
                event.which = event.charCode? event.charCode : event.keyCode;
            }
            return event;
        }
        function mouseHooks(event){
            var eventDoc, doc, body, button = event.button, fromElement = event.fromElement;
            if( event.pageX == null && event.clientX != null ) {
                eventDoc = event.target.ownerDocument || document;
                doc = eventDoc.documentElement;
                body = eventDoc.body;
                event.pageX = event.clientX + ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) - ( doc && doc.clientLeft || body && body.clientLeft || 0 );
                event.pageY = event.clientY + ( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) - ( doc && doc.clientTop  || body && body.clientTop  || 0 );
            }
            if ( !event.relatedTarget && fromElement ) {
                event.relatedTarget = fromElement === event.target ? event.toElement : fromElement;
            }
            if ( !event.which && button !== undefined ) {
                event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
            }
            return event;
        }
        var rkeyEvent = /^key/, rmouseEvent = /^(?:mouse|contextmenu)|click/ ;
        if ( rkeyEvent.test( event.type ) ) {
            return keyHooks(event);
        }
        if ( rmouseEvent.test( event.type ) ) {
            return mouseHooks(event);
        }
        return event;
    }

    function on(element, eventName, handler, filterFn){
        var wrapedhandler = $_.F.wrap(handler,
            function(ofn, e) {
                e = e||window.event;
                e = fix(e);
                return Asdf.F.before(ofn,filterFn||Asdf.F.toFunction(true), true)(e);
            }
        );
        var _fid = makeid();
        handler._fid = _fid;
        addEventListener(element, eventName, wrapedhandler);
        var event = Asdf.Element.get(element, '_event', true)||{};
        if(!event[eventName])
            event[eventName] = {};
        if(!event[eventName][_fid])
            event[eventName][_fid] = [];
        event[eventName][_fid].push(wrapedhandler);
        Asdf.Element.set(element, '_event', event);
        return element;
    }

    function once(element, eventName, fn, filterFn){
        var tfn = $_.F.wrap(fn, function(ofn){
            var arg = slice.call(arguments, 1);
            ofn.apply(this,arg);
            remove(element, eventName, tfn);
        });
        on(element, eventName, tfn, filterFn);
        return element;
    }

    function remove(element, eventName, handler) {
        var wrapedhandler = getWrapedhandler(element, eventName, handler);
        removeEventListener(element, eventName, wrapedhandler);
        return element;
    }

    function removeAll(element, eventName) {
        var event;
        if(!(event = Asdf.Element.get(element, '_event', true)))
            return element;
        var removeEvents = [];
        if(eventName){
            $_.O.each(event[eventName], function(v) {
                v.eventName = eventName;
                removeEvents.push(v);
            });
            event[eventName] = null;
        }else {
            $_.O.each(event, function(ev, key) {
                $_.O.each(ev, function(v){
                    v.eventName = key;
                    removeEvents.push(v);
                });
            });
            Asdf.Element.del(element, '_event');
        }
        Asdf.A.each(removeEvents, function(v){
            Asdf.A.each(v, function(fn){
                removeEventListener(element, v.eventName, fn);
            });
        });
        return element;
    }

    function createEvent(name) {
        var event;
        if(document.createEvent) {
            event = document.createEvent('HTMLEvents');
            event.initEvent(name, true, true);
        }else {
            event = document.createEventObject();
        }
        return event;

    }
    function emit(element, name, data){
        if(element == document && document.createEvent && !element.dispatchEvent)
            element = document.documentElement;
        var event;

        event = createEvent(name);
        event.data = data;
        event.eventName = name;
        if(document.createEvent) {
            element.dispatchEvent(event);
        }else {
            element.fireEvent("on"+name, event);
        }
        return element;
    }
    extend($_.Event, {
        fix: fix,
        stop:stop,
        on:on,
        remove:remove,
        removeAll:removeAll,
        once: once,
        emit: emit
    });
})(Asdf);;/**
 * @project Asdf.js
 * @author N3735
 * @namespace Asdf.Element
 */
(function($_) {
	var NODETYPE = {
		ELEMENT_NODE : 1,
		ATTRIBUTE_NODE : 2,
		TEXT_NODE : 3,
		CDATA_SECTION_NODE : 4,
		ENTITY_REFERENCE_NODE : 5,
		ENTITY_NODE: 6,
		PROCESSING_INSTRUCTION_NODE: 7,
		COMMENT_NODE: 8,
		DOCUMENT_NODE: 9,
		DOCUMENT_TYPE_NODE: 10,
		DOCUMENT_FRAGMENT_NODE: 11,
		NOTATION_NODE: 12
	};
	var nativeSlice = Array.prototype.slice, extend = $_.O.extend, isString = $_.O.isString;
	var tempParent = document.createElement('div');
	$_.Element = {};
	function recursivelyCollect(element, property, until, isReverse) {
		var elements = [];
		while (element = element[property]) {
			if (element.nodeType == 1)
				elements[isReverse?'unshift':'push'](element);
			if ($_.O.isFunction(until)?until(element):element == until)
				break;
		}
		return elements;
	}
	function recursively( element, property ) {
		do {
			element = element[ property ];
		} while ( element && element.nodeType !== 1 );
		return element;
	}
    /**
     * @memberof Asdf.Element
     * @param {element} element 대상element
     * @param {function} fun 실행 함수
     * @param {object=} context 실행 함수 context
     * @returns {element} 대상 element
     * @desc 대상element를 포함하여 자식들을 돌면서 실행 함수를 실행한다. 실행함수의 첫 번째 인자로 element가 들어간다.
     * @example
     * //element = <div>aa<div>bb</div><div>cc</div></div>
     * Asdf.Element.walk(e, Asdf.F.partial(Asdf.Element.addClass, undefined, '11'));
     * //return <div class="11">aa<div class="11">bb</div><div class="11">cc</div></div>
     */
	function walk(element, fun, context) {
		context = context || this;
		var i, ch = childNodes(element);
		fun.call(context, element);
		for (i = 0; i < ch.length ; i++) {
			walk(ch[i], fun, context);
		}
		return element;
	}
    /**
     * @memberof Asdf.Element
     * @param {element} element 대상element
     * @returns {boolean} boolean
     * @desc element가 display가 none 여부를 반환한다.
     *
     */
	function visible(element){
		if(!$_.O.isNode(element))
			throw new TypeError();
		return element.style.display !='none';
	}
    /**
     * @memberof Asdf.Element
     * @param {element} element 대상element
     * @returns {element} 대상 element
     * @desc visible(element)가 true면 hide를 실행하고 false면 show를 실행한다.
     * @example
     * var div = document.createElement('div');
     * Asdf.Element.toggle(div);
     * Asdf.Element.visible(div); //return false;
     */
	function toggle(element) {
		if(!$_.O.isNode(element))
			throw new TypeError();
	    visible(element) ? hide(element) : show(element);
	    return element;
	}
    /**
     * @memberof Asdf.Element
     * @param {element} element 대상element
     * @returns {element} 대상 element
     * @desc 대상 element를 style.display를 'none'으로 변경 한다.
     * @example
     * var div = document.createElement('div');
     * Asdf.Element.hide(div);
     * Asdf.Element.visible(div); //return false;
     */
	function hide(element) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		element.style.display = 'none';
	    return element;
	}
    /**
     * @memberof Asdf.Element
     * @param {element} element 대상element
     * @returns {element} 대상 element
     * @desc 대상 element를 style.display를 ''으로 변경 한다.
     * @example
     * var div = document.createElement('div');
     * Asdf.Element.hide(div);
     * Asdf.Element.visible(div); //return false;
     * Asdf.Element.show(div);
     * Asdf.Element.visible(div); //return true;
     */
	function show(element) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		 element.style.display = '';
		 return element;
	}
    /**
     * @memberof Asdf.Element
     * @param {element} element 대상element
     * @param {string=} value element에 넣을 문자열
     * @returns {element|string} value값이 존재하면 element를 반환하고 value값이 존재 하지 않으면 text값을 반환하다.
     * @desc value가 존재 하면 element에 해당 value를 넣고 value가 존재하지 않으면 해당 element의 text값을 반환한다.
     * @example
     * var div = document.createElement('div');
     * Asdf.Element.text(div, 'hi'); //return <div>hi</div>
     * Asdf.Element.text(div); //return "hi";
     */
	function text(element, value) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		var ret = '';
		if( value == null ){
			if ( typeof element.textContent === "string" ) {
				return element.textContent;
			} else {
				walk(element, function(e) {
					var nodeType = e.nodeType;
					if( nodeType === 3 || nodeType === 4 ) {
						ret += e.nodeValue;
					}
					return false;
				});
				return ret;
			}
		}else {
			append(empty(element), (element.ownerDocument || document ).createTextNode( value ) );
            return element;
		}
	}
    /**
     * @memberof Asdf.Element
     * @param {element} element 대상element
     * @param {string=} val value값
     * @returns {element|string} value값이 존재하면 element를 반환하고 value값이 존재 하지 않으면 value값을 반환하다.
     * @desc value가 존재 하면 element.value에 해당 value를 넣고 value가 존재하지 않으면 element.valvue 값을 반환한다.
     * @example
     * var input = document.createElement('input');
     * Asdf.Element.value(input, 'hi');
     * Asdf.Element.value(input); //return "hi";
     */
	function value(element, val) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		return (val==null)? element.value : (element.value = val, element);
	}
    /**
     * @memberof Asdf.Element
     * @param {HTMLElement} element 대상element
     * @param {string=} htm html값
     * @returns {element|string} html값이 존재하면 element를 반환하고 html값이 존재 하지 않으면 innerHTML값을 반환하다.
     * @desc html가 존재 하면 element.innerHTML에 해당 html를 넣고 html가 존재하지 않으면 element.innerHTML 값을 반환한다.
     * @example
     * var div = document.createElement('div');
     * Asdf.Element.html(div, 'hi'); //return <div>hi</div>
     * Asdf.Element.html(div); //return "hi";
     */
	function html(element, htm) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		return (htm==null)? element.innerHTML: (element.innerHTML = htm, element);
	}
    /**
     * @memberof Asdf.Element
     * @param {element} element 대상element
     * @returns {element} 대상element parentNode를 반환한다.
     * @desc 대상element parentNode를 반환한다.
     * @example
     * var p = document.createElement('div');
     * var c = document.createElement('div');
     * p.appendChild(c);
     * Asdf.Element.parent(c); //return p;
     */
	function parent(element){
		if(!$_.O.isNode(element))
			throw new TypeError();
		return recursively(element, 'parentNode');
	}

    function commonParent(element /*,element...*/){
        if($_.A.any(arguments, $_.O.isNotElement)) throw new TypeError();
        if(!arguments.length){
            return null
        }else if(arguments.length === 0){
            return arguments[0];
        }
        var paths = [];
        var minLength = Infinity;
        $_.A.each(arguments, function(el){
            var parents = recursivelyCollect(el, 'parentNode', null, true);
            paths.push(parents);
            minLength = Math.min(minLength, parents.length)
        });
        var res = null;
        for (var i = 0; i < minLength; i++) {
            var first = paths[0][i];
            for (var j = 1; j < arguments.length; j++) {
                if (first != paths[j][i]) {
                    return res;
                }
            }
            res = first;
        }
        return res;
    }
    /**
     * @memberof Asdf.Element
     * @param {element} element 대상element
     * @param {element=} until 최종element
     * @returns {array} 대상element에서 최종element까지 모든 조상을 array로 반환한다.
     * @desc 대상element에서 최종element까지 모든 조상을 array로 반환한다.
     * @example
     * var pp = document.createElement('div');
     * var p = document.createElement('div');
     * var c = document.createElement('div');
     * pp.appendChild(p);
     * p.appendChild(c);
     * Asdf.Element.parents(c); //return [p, pp];
     * Asdf.Element.parents(c, p); //return [p];
     */
	function parents(element, until) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		 return recursivelyCollect(element, 'parentNode', until);
	}
    /**
     * @memberof Asdf.Element
     * @param {element} element 대상element
     * @returns {element} 대상element nextSibling 반환한다.
     * @desc 대상element nextSibling 반환한다.
     * @example
     * var p = document.createElement('div');
     * var c = document.createElement('div');
     * var nc = document.createElement('div');
     * p.appendChild(c);
     * p.appendChild(nc);
     * Asdf.Element.next(c); //return nc;
     */
	function next(element){
		if(!$_.O.isNode(element))
			throw new TypeError();
		return recursively(element, 'nextSibling');
	}
    /**
     * @memberof Asdf.Element
     * @param {element} element 대상element
     * @returns {element} 대상element previousSibling 반환한다.
     * @desc 대상element previousSibling 반환한다.
     * @example
     * var p = document.createElement('div');
     * var pc = document.createElement('div');
     * var c = document.createElement('div');
     * p.appendChild(pc);
     * p.appendChild(c);
     * Asdf.Element.prev(c); //return nc;
     */
	function prev(element){
		if(!$_.O.isNode(element))
			throw new TypeError();
		return recursively(element, 'previousSibling');
	}
    /**
     * @memberof Asdf.Element
     * @param {element} element 대상element
     * @param {element=} until 최종element
     * @returns {array} 대상element에서 최종element까지 nextSibling들을 반환한다.
     * @desc 대상element에서 최종element까지 nextSibling들을 반환한다.
     * @example
     * var p = document.createElement('div');
     * var c = document.createElement('div');
     * var nc1 = document.createElement('div');
     * var nc2 = document.createElement('div');
     * p.appendChild(c);
     * p.appendChild(nc1);
     * p.appendChild(nc2);
     * Asdf.Element.nexts(c); //return [nc1, nc2];
     */
	function nexts(element, until) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		return recursivelyCollect(element, 'nextSibling', until);
	}
    /**
     * @memberof Asdf.Element
     * @param {element} element 대상element
     * @param {element=} until 최종element
     * @returns {array} 대상element에서 최종element까지 previousSibling 반환한다.
     * @desc 대상element에서 최종element까지 previousSibling 반환한다.
     * @example
     * var p = document.createElement('div');
     * var c = document.createElement('div');
     * var pc1 = document.createElement('div');
     * var pc2 = document.createElement('div');
     * p.appendChild(pc1);
     * p.appendChild(pc2);
     * p.appendChild(c);
     * Asdf.Element.prevs(c); //return [pc2,pc1];
     */
	function prevs(element, until) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		return recursivelyCollect(element, 'previousSibling', until);
	}
    /**
     * @memberof Asdf.Element
     * @param {element} element 대상element
     * @returns {array} 본인을 제외한 형제 노드들을 반환한다.
     * @desc 본인을 제외한 형제 노드들을 반환한다.
     * @example
     * var p = document.createElement('div');
     * var c = document.createElement('div');
     * var nc = document.createElement('div');
     * var pc = document.createElement('div');
     * p.appendChild(pc);
     * p.appendChild(c);
     * p.appendChild(nc);
     * Asdf.Element.siblings(c); //return [pc,nc];
     */
	function siblings(element) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		return $_.A.without($_.A.toArray(element.parentNode.childNodes), element);
	}
    /**
     * @memberof Asdf.Element
     * @param {Element} element 대상element
     * @returns {Array} 자식 노드를 반환한다.
     * @desc 자식 노드들을 반환한다.
     * @example
     * var p = document.createElement('div');
     * var c = document.createElement('div');
     * var nc = document.createElement('div');
     * var pc = document.createElement('div');
     * var text = document.createTextNode('aa');
     * p.appendChild(text);
     * p.appendChild(pc);
     * p.appendChild(c);
     * p.appendChild(nc);
     * Asdf.Element.childNodes(p); //return [text, pc,c,nc];
     */
	function childNodes(element) {
		if(!$_.O.isNode(element))
			throw new TypeError();
        if(!element.firstChild) return [];
		return Asdf.A.merge([element.firstChild],nexts(element.firstChild, 'nextSibling'));
	}
    function children(element){
        if(!$_.O.isNode(element))
            throw new TypeError();
        if($_.Bom.features.CanUseChildrenAttribute)
            return element.children;
        return $_.A.filter(element.children, $_.O.isElement);
    }
    /**
     * @memberof Asdf.Element
     * @param {element} element 대상element
     * @returns {element|elements} contents를 반환한다.
     * @desc contents를 반환한다.
     * @example
     * var p = document.createElement('div');
     * var c = document.createElement('div');
     * var nc = document.createElement('div');
     * var pc = document.createElement('div');
     * p.appendChild(text);
     * p.appendChild(pc);
     * p.appendChild(c);
     * p.appendChild(nc);
     * Asdf.Element.contents(p); //return [text, pc,c,nc];
     * var iframe = document.createElement('iframe');
     * var doc = Asdf.Element.contents(iframe);
     */
	function contents(element) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		return (element.nodeName === 'IFRAME')? (element.contentDocument||(element.contentWindow&&element.contentWindow.document)) : element.childNodes ;
	}
    /**
     * @memberof Asdf.Element
     * @param {element} element 대상element
     * @param {element} element wrapElement
     * @returns {element} wrapElement를 반환한다.
     * @desc 대상element를 wrapElement로 감싼 후 wrapElement를 반환한다.
     * @example
     * var p = document.createElement('div');
     * var c = document.createElement('div');
     * var wrap = document.createElement('div');
     * p.appendChild(c);
     * var el = Asdf.Element.wrap(c, wrap); //return wrap;
     * el.innerHTML; //'<div></div>'
     */
	function wrap(element, newContent) {
		if(!$_.O.isNode(element)||!$_.O.isNode(newContent))
			throw new TypeError();
		element.parentNode.replaceChild(newContent, element);
		newContent.appendChild(element);
		return newContent;
	}
    /**
     * @memberof Asdf.Element
     * @param {element} element 대상element
     * @returns {element} 대상 element를 반환한다.
     * @desc 대상element를 제거하고 대상 하위 element를 대상 부모 element로 이동시킨 후 대상 element를 반환한다.
     * @example
     * var p = document.createElement('div');
     * var c = document.createElement('div');
     * var wrap = document.createElement('div');
     * p.appendChild(wrap);
     * wrap.appendChild(c);
     * var el = Asdf.Element.unwrap(wrap); //return wrap;
     * p.innerHTML; //'<div></div>'
     */
	function unwrap(element) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		var bin = document.createDocumentFragment();
		var parentNode = element.parentNode;
		Asdf.A.each(childNodes(element), function(el){
            bin.appendChild(el);
        });
		parentNode.replaceChild(bin, element);
		return element;
	}

    function createDom(doc, name, attributes, children){
        if(Asdf.O.isNotDocument(doc)||Asdf.O.isNotString(name)) throw new TypeError();
        if(!Asdf.Bom.features.CanAddNameOrTypeAttributes && attributes &&(attributes.name||attributes.type)) {
            var htmlArr = ['<', name];
            attributes = Asdf.O.clone(attributes);
            if(attributes.name){
                htmlArr.push(' name="', Asdf.S.escapeHTML(attributes.name), '"');
                delete attributes['name']
            }
            if(attributes.type){
                htmlArr.push(' type="', Asdf.S.escapeHTML(attributes.type), '"');
                delete attributes['type']
            }
            htmlArr.push('>');
            name = htmlArr.join('');
        }
        var el = doc.createElement(name);
        if(attributes){
            Asdf.O.each(attributes, function(v, k){
                if(k === 'className' &&Asdf.O.isString(v)){
                    addClass(el, v);
                    return;
                }
                else if(k === 'style' && Asdf.O.isPlainObject(v)){
                    Asdf.O.each(v, function(key, value){
                        css(el, key, value);
                    });
                    return;
                }
                else{
                    attr(el, k, v);
                }
            });
        }
        children = nativeSlice.call(arguments, 3);
        Asdf.A.each(children, function(c){
            append(el, c);
        });
        return el;
    }
    function createText(doc, string){
        if(Asdf.O.isNotString(string)) throw new TypeError();
        return doc.createTextNode(string);
    }
    /**
     * @memberof Asdf.Element
     * @param {element} element 부모Element
     * @param {element} newContent 새Element
     * @returns {element} 부모Element를 반환한다.
     * @desc 부모Element에 자식으로 마지막에 새Element를 추가한다.
     * @example
     * var p = document.createElement('div');
     * var c = document.createElement('div');
     * var cs = document.createElement('span');
     * Asdf.Element.append(p, c);
     * Asdf.Element.append(p, cs);
     * p.innerHTML; //'<div></div><span></span>'
     */
	function append(element, newContent) {
		if(!$_.O.isNode(element)||!$_.O.isNode(newContent))
			throw new TypeError();
		var nodeType = element.nodeType;
		if ( nodeType === 1 || nodeType === 11 ) {
			element.appendChild( newContent );
		}
		return element;
	}
    /**
     * @memberof Asdf.Element
     * @param {element} element 부모Element
     * @param {element} newContent 새Element
     * @returns {element} 부모Element를 반환한다.
     * @desc 부모Element에 자식 첫번째로 새Element를 추가한다.
     * @example
     * var p = document.createElement('div');
     * var c = document.createElement('div');
     * var cs = document.createElement('span');
     * Asdf.Element.prepend(p, c);
     * Asdf.Element.prepend(p, cs);
     * p.innerHTML; //'<span></span><div></div>'
     */
	function prepend(element, newContent) {
		if(!$_.O.isNode(element)||!$_.O.isNode(newContent))
			throw new TypeError();
		var nodeType = element.nodeType;
		if ( nodeType === 1 || nodeType === 11 ) {
			element.insertBefore( newContent, element.firstChild );
		}
		return element;
	}
    /**
     * @memberof Asdf.Element
     * @param {element} element 기준Element
     * @param {element} newContent 새Element
     * @returns {element} 기준Element를 반환한다.
     * @desc 기준Element를 앞에 새Element를 추가한다.
     * @example
     * var p = document.createElement('div');
     * var c = document.createElement('div');
     * var cs = document.createElement('span');
     * Asdf.Element.append(p, c);
     * Asdf.Element.before(c, cs);
     * p.innerHTML; //'<span></span><div></div>'
     */
	function before(element, newContent) {
		if(!$_.O.isNode(element)||!$_.O.isNode(newContent))
			throw new TypeError();
		element.parentNode.insertBefore(newContent, element);
		return element;
	}

    /**
     * @memberof Asdf.Element
     * @param {element} element 기준Element
     * @param {element} newContent 새Element
     * @returns {element} 기준Element를 반환한다.
     * @desc 기준Element를 뒤에 새Element를 추가한다.
     * @example
     * var p = document.createElement('div');
     * var c = document.createElement('div');
     * var cs = document.createElement('span');
     * Asdf.Element.append(p, c);
     * Asdf.Element.after(c, cs);
     * p.innerHTML; //'<div></div><span></span>'
     */
	function after(element, newContent) {
		if(!$_.O.isNode(element)||!$_.O.isNode(newContent))
			throw new TypeError();
		element.parentNode.insertBefore(newContent, element.nextSibling);
		return element;		
	}
    /**
     * @memberof Asdf.Element
     * @param {element} element 대상Element
     * @returns {element} 대상Element를 반환한다.
     * @desc 대상Element를 빈Element로 만든다.
     * @example
     * var p = document.createElement('div');
     * var c = document.createElement('div');
     * Asdf.Element.append(p, c);
     * Asdf.Element.empty(p);
     * p.innerHTML; //''
     */
	function empty(element) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		element.innerHTML = '';
		return element;
	}

    /**
     * @memberof Asdf.Element
     * @param {Element} element
     */
	function remove(element) {
		if(!$_.O.isNode(element))
			throw new TypeError();
        if(element.parentNode)
		    element.parentNode.removeChild(element);
	}

    /**
     * @memberof Asdf.Element
     * @param element
     * @returns {Element|undefined}
     */
    function first(element){
        if(!$_.O.isElement(element))
          throw new TypeError();
        var c = children(element);
        return c&&c[0];
    }

    /**
     * @memberof Asdf.Element
     * @param element
     * @returns {Element|undefined}
     */
    function last(element){
        if(!$_.O.isElement(element))
            throw new TypeError();
        var c = children(element);
        return c&& c[c.length-1];
    }

    /**
     * @memberof Asdf.Element
     * @param {Element} element
     * @param {Number} n
     * @returns {Element|undefined}
     */
    function eq(element, n){
        if(!$_.O.isElement(element))
            throw new TypeError();
        var c = children(element);
        return c&& c[n];
    }

    /**
     * @memberof Asdf.Element
     * @param {Element} element
     * @param {String} name
     * @param {String=} value
     * @returns {null|Element|*}
     */
	function attr(element, name, value) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		var result, key;
		if(!name || !isString(name)){
			return null;
		}
		if(element.nodeType !== 1){
			return null;
		}
		if(value == null){
			if(name === 'value' && element.nodeName === 'INPUT' ){
				return element.value;
			}
			return (!(result = element.getAttribute(name)) && name in element) ? element[name] : result;
		}else {
			if (typeof name === 'object'){
				for (key in name)
					element.setAttribute(key, name[key]);
			}else {
				element.setAttribute(name, value);
			}
			return element;
		}
	}
	function hasAttr(element, name){
		if($_.R.FN_NATIVE.test(element.querySelectorAll)){
			element.hasAttribute(element, name);
		}
		element = element.getAttributeNode(name);
		return !!(element && (element.specified || element.nodeValue));

	}
	function removeAttr(element, name) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		if(element.nodeType === 1)
			element.removeAttribute(name);
		return element;
	}
	function prop(element, name, value) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		if( value == null){
			return element[name];
		} else {
			element[name] = value;
			return element;
		}
	}
	function removeProp(element, name){
		if(!$_.O.isNode(element))
			throw new TypeError();
		if(element[name])
			delete element[name];
		return element;
	}

    /**
     * @memberof Asdf.Element
     * @param {Document} doc
     * @returns {Window|false}
     */
    function getWindow(doc){
        return $_.O.isWindow(doc)?
            doc: doc.nodeType===9 ?
            doc.defaultView || doc.parentWindow : false;
    }

    /**
     * @memberof Asdf.Element
     * @param {Node} element
     * @param {Node} target
     * @returns {{left: number, top: number, height: number, width: number, right: number, bottom: number}}
     */
	function relatedOffset(element, target) {
		if(!$_.O.isNode(element)||!$_.O.isNode(target))
			throw new TypeError();
		var offsetEl = offset(element);
		var offsetTar = offset(target);
		return {left: offsetEl.left - offsetTar.left, 
				top: offsetEl.top - offsetTar.top,
				height:offsetEl.height,
				width:offsetEl.width,
				right: offsetEl.right - offsetTar.left,
				bottom: offsetEl.bottom - offsetTar.top
			};
	}

    /**
     * @memberof Asdf.Element
     * @param {Node} element
     * @returns {{height: number, width: number, top: number, bottom: number, right: number, left: number}}
     */
	function offset(element) {
		if(!$_.O.isNode(element))
			throw new TypeError();
        var doc = element.ownerDocument;
        var docElem = doc.documentElement;
        var win = getWindow(doc);
		// IE 경우 document.documentElement.scrollTop 그 외 document.body.scrollTop
		var width = 0,
			height = 0,
			rect = element.getBoundingClientRect(),
            ot = ( win.pageYOffset || docElem.scrollTop )  - ( docElem.clientTop  || 0 ),
            ol = ( win.pageXOffset || docElem.scrollLeft ) - ( docElem.clientLeft || 0 ),
			top = rect.top + ot,
			bottom = rect.bottom + ot,
			right = rect.right + ol,
			left = rect.left + ol;
		if (rect.height) {
			height = rect.height;
			width = rect.width;
		} else {
			height = element.offsetHeight || bottom - top;
			width = element.offsetWidth || right - left;
		}
		return {
			height : height,
			width : width,
			top : top,
			bottom : bottom,
			right : right,
			left : left
		};
	}

    /**
     * @memberof Asdf.Element
     * @param {Element} element
     * @returns {Element|undefined}
     */
    function offsetParent(element){
        if(!$_.O.isElement(element)) throw new TypeError();
        var res = element;
        while(res &&
            res.nodeName.toUpperCase() !== 'html' &&
            css(res, 'position') === 'static'){
            res = parent(res);
        }
        return res;
    }

    /**
     * @memberof Asdf.Element
     * @param {HTMLElement} element
     * @param {String} name
     * @returns {HTMLElement}
     */
	function addClass(element, name){
		if(!$_.O.isNode(element)||!$_.O.isString(name))
			throw new TypeError();
		var nms = name.replace(/\s+/g,' ').split(' ');
		$_.A.each(nms, function(name) {
			if(!hasClass(element, name))		
				element.className += (element.className? ' ':'') + name;
		});
		return element;
	}

    /**
     * @memberof Asdf.Element
     * @param {HTMLElement} element
     * @param {String} name
     * @returns {HTMLElement}
     */
	function removeClass(element, name) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		if(!name)
			element.className = '';
		else {
			var nms = name.replace(/\s+/g,' ').split(' ');
			$_.A.each(nms, function(name) {
				element.className = $_.S.trim(element.className.replace(new RegExp("(^|\\s+)" + name + "(\\s+|$)"), ' '));
			});
		}
		return element;
	}

    /**
     * @memberof Asdf.Element
     * @param {HTMLElement} element
     * @param {String} name
     * @returns {HTMLElement}
     */
	function toggleClass(element, name) {
		if(!$_.O.isNode(element)||!$_.O.isString(name))
			throw new TypeError();
		var nms = name.replace(/\s+/g,' ').split(' ');
		$_.A.each(nms, function(name) {
			if(hasClass(element, name)){
				return removeClass(element, name);
			}
			return addClass(element, name);
		});
		return element;
	}

    /**
     * @memberof Asdf.Element
     * @param {HTMLElement} element
     * @param {String} name
     * @returns {boolean}
     */
	function hasClass(element, name) {
		if(!$_.O.isNode(element)||!$_.O.isString(name))
			throw new TypeError();
		return !!element.className && new RegExp("(^|\\s)" + name + "(\\s|$)").test(element.className);
	}

	function _findByQSA(element, selector){
		var nid, old;
		nid = old = $_.Utils.makeuid();
		var nel = element;
		var nsel = $_.O.isDocument(element)&&selector;
		if($_.O.isElement(element) && element.nodeName.toLowerCase() !== 'object'){
			var groups = $_.Selector.tokenize(selector);
			if((old = attr(element,'id'))) {
				nid = old.replace(/'|\\/g, "\\$&");
			} else {
				attr(element,'id', nid);
			}
			nid = "[id='"+nid+"'] ";
			groups =  $_.A.map(groups, function(v){
				return nid + $_.Selector.toSelector(v);
			});
			nel = /[+~]/.test(selector) && parent(element)||element;
			nsel = groups.join(',');
		}
		if(nsel){
			try{
				return  nel.querySelectorAll(nsel);
			} catch(e){
			}finally{
				if(!old){
					removeAttr(element, 'id');
				}
			}
		}
	}
    var rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/;
	function _merge(a, b){
		if(a.length === 0)
			return b;
		return $_.A.merge(a,b);
	}
	function querySelectorAll(element, selector, results) {
        results = results||[];
        var match,m, nodeType = element.nodeType, els;
        if($_.O.isNotDocument(element)&&$_.O.isNotElement(element)&&nodeType !==11){
            return results;
        }
		selector = $_.S.trim(selector);
        if(nodeType !== 11 && (match = rquickExpr.exec(selector))){
            if(m = match[1]){
                return $_.A.append(results,getElementById(element, m));
            }else if(match[2]){
				return _merge(results, getElementsByTagName(element, selector));
			}else if((m = match[3])){
				return _merge(results,getElementsByClassName(element, m));
			}
        }
		if(element.querySelectorAll && !$_.Bom.features.qsaNotSupport(selector) && (els = _findByQSA(element, selector))){
			return _merge(results,els);
		}
		return $_.Selector.select(selector, element, results);
	}
	function closest(element, selector, context){
		if(!$_.O.isNode(element))
			throw new TypeError();
		while (element && !matchesSelector(element, selector))
			element = element !== context && element !== document && element.parentNode;
	    return element;
	}

    /**
     *
     * @param {HTMLElement} element
     * @param selector
     * @returns {boolean}
     */
	function matchesSelector(element, selector){
		if(!$_.O.isElement(element))
			throw new TypeError();
	    var mSelector = element.matches||element.mozMatchesSelector||element.webkitMatchesSelector;
	    if (mSelector) return mSelector.call(element, selector);
	    var match, parent = element.parentNode, temp = !parent;
	    if (temp) (parent = tempParent).appendChild(element);
	    match =  $_.A.indexOf( find(parent, selector), element);
	    temp && tempParent.removeChild(element);
	    return match !==-1;
	}

    /**
     * @memberof Asdf.Element
     * @param {HTMLElement} element
     * @param {String|Array} name
     * @param {String=} value
     * @returns {*}
     */
	function css(element, name, value){
		if(!$_.O.isNode(element))
			throw new TypeError();
		if(value!=null){
			var elementStyle = element.style;
			elementStyle[name] =  value;
		}else {
			var cssStyle, res;
            if (window.getComputedStyle) {
                cssStyle = window.getComputedStyle(element, null);
            } //ie
			else if (element.currentStyle) {
                cssStyle = element.currentStyle;
            } else {
				return new TypeError();
			}

			if(!name) {
                res = {};
				$_.O.each(cssStyle, function(value, key) {
                    res[key] = value == 'auto'? '': value;
                });
                return res;
			}
			else if (isString(name)) {
				return res = cssStyle[name];
			} else if($_.O.isArray(name)){
				res = {};
                $_.O.each(name, function(v){
                    res[v] = cssStyle[v] == 'auto'? '' : cssStyle[v];
                });
                return res;
			} else 
				throw new TypeError();
		}
	}

    /**
     * @memberof Asdf.Element
     * @param {node} element
     * @returns {string}
     */
	function toHTML(element){
		if(!$_.O.isNode(element))
			throw new TypeError();
		if(!element) throw new TypeError;
		var d = document.createElement('div');
		if($_.O.isNode(element))
			element = element.cloneNode(true);
		d.appendChild(element);
		return d.innerHTML;
	}

    /**
     * @memberof Asdf.Element
     * @param {Node} element
     * @returns {boolean}
     */
	function isWhitespace(element) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		return $_.S.isBlank(element.innerHTML);
	}

    var data = (function(){
        var data = {};
        var id = 0;
        var prefix = 'ae';
        var getData = function (el, key, isIsolate){
            if($_.O.isNotNode(el) || $_.O.isNotString(key)) throw new TypeError();
            if(!isIsolate && (!el.aeid || !hasData(el, key))){
                var p = parent(el);
                if(!p) return;
                return getData(p, key);
            }
            return data[el.aeid] && data[el.aeid][key];
        };
        var hasData = function (el, key){
            if(!el.aeid || !data[el.aeid])
                return false;
            var d = data[el.aeid];
            return key in d && Object.prototype.hasOwnProperty.call(d, key);
        };
        var setData = function (el, key, value){
            if($_.O.isNotNode(el) || $_.O.isNotString(key)) throw new TypeError();
            if(value == null) throw new TypeError();
            if(!el.aeid)
                el.aeid = prefix+id++;
            var aeid = el.aeid;
            if(!data[aeid])
                data[aeid] = {};
            data[aeid][key] = value;
            return el;
        };
        var delData = function(el, key){
            if($_.O.isNotNode(el) || $_.O.isNotString(key)) throw new TypeError();
            if(hasData(el, key)){
                delete data[el.aeid][key];
            }
            return el
        };

        return {
            get: getData,
            set: setData,
            has: hasData,
            del: delData
        }
    })();

    function outerHTML(element){
        if($_.O.isNotElement(element)) throw new TypeError();
        if('outerHTML' in element) return element.outerHTML;
        else {
            var doc = element.ownerDocument;
            var div = doc.createElement('div');
            div.appendChild(element.cloneNode(true));
            return div.innerHTML;
        }
    }

    function getElementsByClassName(element, className){
        if(element.getElementsByClassName){
            return element.getElementsByClassName(className);
        }else if(element.querySelectorAll){
			return _findByQSA(element, '.'+className.replace(/\s+/,'.'))||[];
        }else if(element.getElementsByTagName){
			var cls = className.split(' ');
			return $_.A.filter(element.getElementsByTagName('*'), function(el){
				return $_.A.every($_.A.map(cls, $_.F.curry(hasClass, el)), $_.F.identity);
			})||[];
        }else {
            throw new Error();
        }
    }
    function getElementsByTagName(element, tag){
        if(!$_.Bom.features.getElementsByTagName){
            var res = element.getElementsByTagName(tag);
            if(tag==='*'){
                return $_.A.filter(res, function(e){return e.nodeType === 1})||[];
            }
            return res;
        }
        if(element.getElementsByTagName){
            return element.getElementsByTagName(tag);
        }else if (element.querySelectorAll){
            return element.querySelectorAll(tag);
        }else {
            throw new Error();
        }
    }
    function getElementById(element, id){
        var el;
        if($_.O.isDocument(element)){
            el = element.getElementById(id);
            if(el && el.parentNode && el.id === id){
				return el;
            }
        } else {
            if(element.ownerDocument && (el = element.ownerDocument.getElementById(id)) && contains(element, el) && el.id === id){
                return el;
            }
        }
		return null;
    }
    function _isParent(p, c){
        if (c) do {
            if (c === p) return true;
        } while ((c = c.parentNode));
        return false;
    }
    function contains(parent, child){
        return parent.contains ?
            parent != child && parent.contains(child) :
            $_.O.isDocument(parent) && parent.documentElement.contains?parent.documentElement.contains(child) :
            parent.compareDocumentPosition? !!(parent.compareDocumentPosition(child) & 16) :
            _isParent(parent, child);
    }
    function comparePosition(a,b){
        return a.compareDocumentPosition ?
            a.compareDocumentPosition(b) :
            a.contains ?
                (a != b && a.contains(b) && 16) +
                    (a != b && b.contains(a) && 8) +
                    (a.sourceIndex >= 0 && b.sourceIndex >= 0 ?
                        (a.sourceIndex < b.sourceIndex && 4) +
                            (a.sourceIndex > b.sourceIndex && 2) :
                        1) +
                    0 :
                0;
    }

    function compareNode(a,b){
        return 3-(comparePosition(a,b)&6);
    }


    var _matchNTH = /^([+-]?\d*)?([a-z]+)?([+-]\d+)?$/;
    var _parseNTH = $_.F.memoize(function (str){
        var parsed = str.match(_matchNTH);
        if(!parsed) return null;
        var special = parsed[2] || false;
        var a = parsed[1] || 1;
        if (a === '-') a = -1;
        var b = +parsed[3] || 0;
        return $_.F.cases({
            n: {a:a-0, b:b-0},
            odd: {a:2, b:1},
            even: {a:2, b:0}
        }, $_.F.toFunction({a:0, b:a-0}))(special);
    });
    function getNTH(node, expression,isReverse, ofType){
        var p = parent(node);
        var parsed = _parseNTH(expression);
        var ns = children(p);
        if(ofType){
            ns = $_.A.filter(ns, function(el){return el.tagName === node.tagName;});
        }
        var indexs = $_.A.filter($_.N.range(1, ns.length+1), function(pos){return (parsed.a===0)?pos === parsed.b:((pos - parsed.b) % parsed.a) === 0;});
        if(isReverse) indexs.reverse();
        return $_.A.map(indexs, function(pos){return ns[pos-1];});
    }
    var pseudos = {
        'empty': function(element){
            var child = element.firstChild;
            return !(child && child.nodeType === 1) && !(element.innerText || element.textContent || '').length;
        },
        'not':function(element, expression){
            return !matchesSelector(element, expression);
        },
        'contains': function(element, text){
            return (element.innerText||element.textContent||'').indexOf(text)>-1;
        },
        'first-child': function(element){
            return !prev(element);
        },
        'last-child':function(element){
            return !next(element);
        },
        'only-child': function(element){
            return !prev(element) && !next(element);
        },
        'nth-child': function(node, expression){
            return $_.A.contains(getNTH(node, expression)||[], node);
        },
        'nth-last-child':function(node, expression){
            return $_.A.contains(getNTH(node, expression, true)||[], node);
        },
        'nth-of-type': function(node, expression){
            return $_.A.contains(getNTH(node, expression, false, true)||[], node);
        },
        'nth-last-of-type':function(node, expression){
            return $_.A.contains(getNTH(node, expression, true, true)||[], node);
        },
        'index': function(node, index){
            return $_.A.contains(getNTH(node, index+1+'')||[], node);
        },
        'even': function(node){
            return $_.A.contains(getNTH(node, '2n')||[], node);
        },
        'odd':function(node){
            return $_.A.contains(getNTH(node, '2n+1')||[], node);
        },
        'first-of-type':function(element){
            var nodeName = element.nodeName;
            while(element=prev(element)) if(element.nodeName === nodeName) return false;
            return true;
        },
        'last-of-type':function(element){
            var nodeName = element.nodeName;
            while(element=next(element)) if(element.nodeName === nodeName) return false;
            return true;
        },
        'only-of-type':function(element){
            return pseudos['first-of-type'](element) && pseudos['last-of-type'](element);
        },
        'enabled': function(element){
            return !element.disabled;
        },
        'disabled': function(element){
            return element.disabled
        },
        'checked': function(element){
            return element.checked || element.selected;
        },
        'focus': function(element){

        },
        'selected': function(element){
            return element.selected;
        },
		'target': function(element){
			var hash = window.location && window.location.hash;
			return hash && hash.slice( 1 ) === element.id;
		}

    };
    function getElementsByXPath(element, expression){
        if(!$_.Bom.features.XPath) throw error();
        var results = [];
        var query = document.evaluate(expression, element || document,
            null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        for (var i = 0, length = query.snapshotLength; i < length; i++)
            results.push(query.snapshotItem(i));
        return results;
    }
	function getOwnerDocument(node){
		if($_.O.isNotNode(node)) throw new TypeError();
		return $_.O.isDocument(node)? node : node.ownerDocument||node.document;
	}
	function getOwnerWindow(node){
		if($_.O.isNotNode(node)) throw new TypeError();
		return getWindow(getOwnerDocument(node));
	}
	function getFrameContentDocument(frame){
		return frame.contentDocument||frame.contentWindow||document
	}
	function findNodes(node, p, context){
		var res = [];
		walk(node, function(el){
			if(p.call(context, el))
				res.push(el);
		});
		return res;
	}
	var TAGS_TO_IGNORE = {
		'SCRIPT': 1,
		'STYLE': 1,
		'HEAD': 1,
		'IFRAME': 1,
		'OBJECT': 1
	};
	var PREDEFINED_TAG_VALUES_ = {'IMG': ' ', 'BR': '\n'};
	function getNodeAtOffset(parent, offset){
		var stack = [parent], pos = 0, cur = null;
		while (stack.length > 0 && pos < offset) {
			cur = stack.pop();
			if (cur.nodeName in TAGS_TO_IGNORE) {
			} else if (cur.nodeType == 3) {
				var text = cur.nodeValue.replace(/(\r\n|\r|\n)/g, '').replace(/ +/g, ' ');
				pos += text.length;
			} else if (cur.nodeName in PREDEFINED_TAG_VALUES_) {
				pos += PREDEFINED_TAG_VALUES_[cur.nodeName].length;
			} else {
				for (var i = cur.childNodes.length - 1; i >= 0; i--) {
					stack.push(cur.childNodes[i]);
				}
			}
		}
		return {node: cur, remainder:cur ? cur.nodeValue.length + offset - pos - 1 : 0}
	}

	extend($_.Element,  {
		walk: walk,
		visible: visible,
		toggle: toggle,
		hide: hide,
		show: show,
		remove: remove,
		text: text,
		value: value,
		html: html,
		parent: parent,
		parents: parents,
        commonParent:commonParent,
		next: next,
		prev: prev,
		nexts: nexts,
		prevs: prevs,
		siblings: siblings,
        childNodes:childNodes,
		children: children,
		contents: contents,
		wrap: wrap,
		unwrap: unwrap,
		append: append,
		prepend: prepend,
		before: before,
		after: after,
		empty: empty,
        first: first,
        eq: eq,
        last:last,
		attr: attr,
		hasAttr:hasAttr,
		removeAttr: removeAttr,
		prop: prop,
		removeProp: removeProp,
		relatedOffset:relatedOffset,
		offset: offset,
		addClass: addClass,
		removeClass: removeClass,
		toggleClass: toggleClass,
		hasClass: hasClass,
		find: querySelectorAll,
		querySelectorAll: querySelectorAll,
		matchesSelector:matchesSelector,
		is: matchesSelector,
		closest:closest,
		css:css,
		toHTML: toHTML,
		isWhitespace: isWhitespace,
        createDom: createDom,
        createText: createText,
        get: data.get,
        set: data.set,
        has: data.has,
        del: data.del,
        getWindow: getWindow,
		getOwnerDocument:getOwnerDocument,
		getOwnerWindow:getOwnerWindow,
		getFrameContentDocument:getFrameContentDocument,
        offsetParent: offsetParent,
        getElementsByClassName:getElementsByClassName,
        contains:contains,
        comparePosition:comparePosition,
        compareNode:compareNode,
        getElementsByXPath:getElementsByXPath,
        getElementsByTagName:getElementsByTagName,
        outerHTML:outerHTML,
        getNTH:getNTH,
		getElementById:getElementById,
		findNodes:findNodes,
		getNodeAtOffset:getNodeAtOffset,
		NODETYPE:NODETYPE
	});
    $_.O.each(pseudos, function(v,k){
        $_.Element['is'+$_.S.camelize($_.S.capitalize(k))] =v;
    });
})(Asdf);;(function($_) {
    /**
     * @namespace
     * @name Asdf.Utils
     */
    var o = $_.Core.namespace($_, 'Selector');
    var expando = "expando" + 1 * new Date();
    var booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",
    // Regular expressions
    // http://www.w3.org/TR/css3-selectors/#whitespace
        whitespace = "[\\x20\\t\\r\\n\\f]",
    // http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
        identifier = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",
    // Attribute selectors: http://www.w3.org/TR/selectors/#attribute-selectors
        attrs = "\\[" + whitespace + "*(" + identifier + ")(?:" + whitespace +
            // Operator (capture 2)
            "*([*^$|!~]?=)" + whitespace +
            // "Attribute values must be CSS identifiers [capture 5] or strings [capture 3 or capture 4]"
            "*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + identifier + "))|)" + whitespace +
            "*\\]",
        pseudos = ":(" + identifier + ")(?:\\((" +
            // To reduce the number of selectors needing tokenize in the preFilter, prefer arguments:
            // 1. quoted (capture 3; capture 4 or capture 5)
            "('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|" +
            // 2. simple (capture 6)
            "((?:\\\\.|[^\\\\()[\\]]|" + attrs + ")*)|" +
            // 3. anything else (capture 2)
            ".*" +
            ")\\)|)",
    // Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
        rwhitespace = new RegExp( whitespace + "+", "g" ),
        rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g" ),

        rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
        rcombinators = new RegExp( "^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*" ),

        rattributeQuotes = new RegExp( "=" + whitespace + "*([^\\]'\"]*?)" + whitespace + "*\\]", "g" ),

        rpseudo = new RegExp( pseudos ),
        ridentifier = new RegExp( "^" + identifier + "$" ),

        matchExpr = {
            "ID": new RegExp( "^#(" + identifier + ")" ),
            "CLASS": new RegExp( "^\\.(" + identifier + ")" ),
            "TAG": new RegExp( "^(" + identifier + "|[*])" ),
            "ATTR": new RegExp( "^" + attrs ),
            "PSEUDO": new RegExp( "^" + pseudos ),
            "CHILD": new RegExp( "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace +
                "*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
                "*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
            "bool": new RegExp( "^(?:" + booleans + ")$", "i" ),
            // For use in libraries implementing .is()
            // We use this for POS matching in `select`
            "needsContext": new RegExp( "^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
                whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
        },
        matchFunction = {
            "ATTR": function(match){
                match[1] = match[1].replace( runescape, funescape );
                // Move the given value to match[3] whether quoted or unquoted
                match[3] = ( match[3] || match[4] || match[5] || "" ).replace( runescape, funescape );
                if ( match[2] === "~=" ) {
                    match[3] = " " + match[3] + " ";
                }
                return match.slice( 0, 4 );
            },"CHILD": function( match ) {
                /* matches from matchExpr["CHILD"]
                 1 type (only|nth|...)
                 2 what (child|of-type)
                 3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
                 4 xn-component of xn+y argument ([+-]?\d*n|)
                 5 sign of xn-component
                 6 x of xn-component
                 7 sign of y-component
                 8 y of y-component
                 */
                match[1] = match[1].toLowerCase();
                if ( match[1].slice( 0, 3 ) === "nth" ) {
                    // nth-* requires argument
                    if ( !match[3] ) {
                        throw new Error( match[0] );
                    }
                    // numeric x and y parameters for Expr.filter.CHILD
                    // remember that false/true cast respectively to 0/1
                    match[4] = +( match[4] ? match[5] + (match[6] || 1) : 2 * ( match[3] === "even" || match[3] === "odd" ) );
                    match[5] = +( ( match[7] + match[8] ) || match[3] === "odd" );
                    // other types prohibit arguments
                } else if ( match[3] ) {
                    throw new Error( match[0] );
                }
                return match;
            },
            "PSEUDO": function( match ) {
                var excess,
                    unquoted = !match[6] && match[2];
                if ( matchExpr["CHILD"].test( match[0] ) ) {
                    return null;
                }
                // Accept quoted arguments as-is
                if ( match[3] ) {
                    match[2] = match[4] || match[5] || "";
                    // Strip excess characters from unquoted arguments
                } else if ( unquoted && rpseudo.test( unquoted ) &&
                    // Get excess from tokenize (recursively)
                    (excess = tokenize( unquoted, true )) &&
                    // advance to the next closing parenthesis
                    (excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length) ) {
                    // excess is a negative index
                    match[0] = match[0].slice( 0, excess );
                    match[2] = unquoted.slice( 0, excess );
                }
                // Return only captures needed by the pseudo filter method (type and argument)
                return match.slice( 0, 3 );
            }
        },
        rinputs = /^(?:input|select|textarea|button)$/i,
        rheader = /^h\d$/i,

        rnative = $_.R.FN_NATIVE,

    // Easily-parseable/retrievable ID or TAG or CLASS selectors
        rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

        rsibling = /[+~]/,
        rescape = /'|\\/g,

    // CSS escapes http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
        runescape = new RegExp( "\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig" ) ,
        funescape = function( _, escaped, escapedWhitespace ) {
            var high = "0x" + escaped - 0x10000;
            // NaN means non-codepoint
            // Support: Firefox<24
            // Workaround erroneous numeric interpretation of +"0x"
            return high !== high || escapedWhitespace ?
                escaped :
                high < 0 ?
                    // BMP codepoint
                    String.fromCharCode( high + 0x10000 ) :
                    // Supplemental Plane codepoint (surrogate pair)
                    String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
        };
    var _rbuggyMathches = [];

    var opposite = {
        'parentNode': 'childNode',
        'previousSibling':'nextSibling',
        'childNode':'parentNode',
        'nextSibling': 'previousSibling'
    };
    var combinators = {
        ' ': function(node, token){
            var item, i=0;
            var type = token[0].type;
            if(type === 'ID'){
                item = $_.Element.getElementById(node, token[0].matches[0]);
                if(!item|| !_matchSelector(item, _matchFn(token.slice(1))))
                    return [];
                return [item];
            }
            item = (type === 'CLASS')? ($_.Element.getElementsByClassName(node, $_.A.reduce(token, function(acc, v){
                if(v.type === 'CLASS') {acc.push(v.matches[0]);i++;}
                return acc;
            },[]).join(' '))): type==='TAG'?$_.Element.getElementsByTagName(node, token[0].matches[0]):[];
            return $_.A.filter(item, function(el) {
                    return _matchSelector(el, _matchFn(token.slice(i||1)));
                })||[];
        },
        '>': function(node, token){
            var item = $_.Element.children(node);
            return $_.A.filter(item, function(el) {
                    return _matchSelector(el, _matchFn(token));
                })||[];
        },
        '+':function(node, token){
            var item = $_.Element.next(node);
            if(!item|| !_matchSelector(item, _matchFn(token))) return [];
            return [item];
        },
        '~':function(node, token){
            var item = $_.Element.nexts(node);
            return $_.A.filter(item, function(el) {
                    return _matchSelector(el, _matchFn(token));
                })||[];
        }
    };
    var filters = {
        'ID': function(id){
            var attrId = id.replace( runescape, funescape );
            return $_.Bom.features.getById? function(elem){
                return elem.getAttribute("id") === attrId;
            }:function(elem){
                var node = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");
                return node && node.value === attrId;
            }
        },
        'TAG': function(tag){
            var nodeName = tag.replace( runescape, funescape ).toLowerCase();
            return tag === "*" ?
                function() { return true; } :
                function( elem ) {
                    return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
                };
        },
        'CLASS': $_.F.memoize(function(className){
            var pattern = new RegExp( "(^|" + whitespace + ")" + className + "(" + whitespace + "|$)" );
            return function( elem ){
                return pattern.test( typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== "undefined" && elem.getAttribute("class") || "" );
            }
        }, function(c){return c+ ' '}),
        'ATTR': function(name, op, value){
            return function(elem) {
                var res = $_.Element.attr(elem, name);
                if (res == null) {
                    return op === '!='
                }
                if(!op) return true;
                return op === "=" ? res === value :
                    op === "!=" ? res !== value :
                        op === "^=" ? value && res.indexOf( value ) === 0 :
                            op === "*=" ? value && res.indexOf( value ) > -1 :
                                op === "$=" ? value && res.slice( -value.length ) === value :
                                    op === "~=" ? ( " " + res.replace( rwhitespace, " " ) + " " ).indexOf( value ) > -1 :
                                        op === "|=" ? res === value || res.slice( 0, value.length + 1 ) === value + "-" :
                                            false;
            }
        },
        'CHILD':function(type, what, argument, first, last){
            var fn = $_.Element['is'+$_.S.capitalize(type)+$_.S.capitalize(what)];
            if(!fn)
                throw new Error('unsupported pseudo:'+type+'_'+what);
            return $_.F.partial(fn, undefined, argument);

        },
        'PSEUDO':function(pseudo, argument){
            var fn = $_.Element['is'+$_.S.capitalize(pseudo)];
            if(!fn)
                throw new Error('unsupported pseudo:'+pseudo);
            return $_.O.isUndefined(argument)?fn:$_.F.partial(fn, undefined, argument);
        }


    };
    var _matchFn = $_.F.memoize(function (tokens){
        return $_.A.map(tokens, function(token){
            return filters[token.type].apply(null, token.matches);
        });
    }, function(tokens){
        return toSelector(tokens);
    });
    function _matchSelector(node, fns) {
        for (var i = 0; i < fns.length; i++) {
            var fn = fns[i];
            if (!fn(node)) return false;
        }
        return true;
    }
    var filter = $_.O.keys(filters);
    function _tokenize(selector){
        var str = selector,res = [], matched, match, tokens;
        while(str){
            if(!matched||(match = rcomma.exec(str))) {
                if (match)
                    str = str.slice(match[0].length) || str;
                res.push((tokens = []));
            }
            matched = false;
            if((match = rcombinators.exec(str))){
                matched = match.shift();
                tokens.push({
                    value:matched,
                    type:match[0].replace(rtrim, ' ')
                });
                str = str.slice(matched.length)
            }
            $_.A.each(filter, function(type){
                if((match = matchExpr[type].exec(str)) && (!matchFunction[type]|| (match = matchFunction[type](match)))){
                    matched = match.shift();
                    tokens.push({
                        value:matched,
                        type:type,
                        matches:match
                    });
                    str = str.slice(matched.length);
                }
            });
            if(!matched){
                break;
            }
        }
        if(str) throw new Error();
        return res;
    }
    var tokenize = $_.F.compose($_.F.memoize(_tokenize, function(str){return str+' '}), $_.O.clone);
    function _findMerge(res, combinator, token){
        $_.N.times(res.length, function(){
            var node = res.shift();
            $_.A.merge(res,combinator(node, token));
        });
    }
    function compareToken(t1,t2) {
        var m = {
            'ID':0,
            'TAG':2,
            'CLASS':1,
            'ATTR':3,
            'PSEUDO':4
        };
        var res = m[t1.type] - m[t2.type];
        if(res === 0){
            if(t1.value < t2.value) return -1;
            else if(t1.value > t2.value) return 1;
            return 0;
        }
        return res;

    }
    function select(expression, element, results){
        results = results||[];
        element = element || document;
        expression = expression.replace(rtrim, '$1');
        var tokens = tokenize(expression);
        var types = filter;
        results =  $_.A.reduce(tokens, function(res, token){
            var i = 0,j = 0, t, combinator= combinators[' '],r = [element];
            while(t=token[i++]){
                var type = t.type;
                if(!$_.A.include(types, type)){
                    _findMerge(r, combinator, token.slice(j, i-1).sort(compareToken));
                    combinator = combinators[type];
                    j = i;
                }
            }
            _findMerge(r, combinator, token.slice(j).sort(compareToken));
            return $_.A.unique($_.A.merge(res,r));
        }, results);
        return results.sort($_.Element.compareNode);
    }

    function toSelector(tokens){
        return $_.A.reduce(tokens, function(str, i){
            return str+ i.value;
        }, '');
    }
    /*
    function markFunction(fn){
        fn[expando] = true;
        return fn;
    }

    function t(){
        return true;
    }

    function f(){
        return false;
    }

    function eachList(list, fn, untilFn){
        untilFn = untilFn|| $_.F.identity;
        while(list&&untilFn(list)){
            fn(list[0]);
            list = list[1];
        }
    }

    var mAnyList = {};
    function anyList(list, fn){
        var res = false, el;
        eachList(list, function(){}, function(l){
            if(mAnyList[l[0].pid]&&mAnyList[l[0].pid][fn.fid]){
                res = mAnyList[l[0].pid][fn.fid];
            }else {
                res = fn(l[0]);
            }
            if(res) {
                if (!mAnyList[l[0].pid])
                    mAnyList[l[0].pid] = {};
                mAnyList[l[0].pid][fn.fid] = res;
                el = l[0];
            }
            return !res;
        });
        if(res){
            eachList(list, function(l){
                if(!mAnyList[l.pid])
                    mAnyList[l.pid] = {};
                mAnyList[l.pid][fn.fid] =true;
            }, function(ls){
                return ls[0] !== el;
            });
        }
        return res;
    }

    function recursivelyCollect(element, nextFn, testFn, untilFn) {
        var elements = [];
        if($_.O.isNotNode(element)||$_.O.isNotFunction(nextFn)||$_.O.isNotFunction(testFn)) throw new TypeError();
        untilFn = untilFn||f;
        while ((element = nextFn(element)) && !untilFn(element)) {
            if (testFn(element))
                elements.push(element);
        }
        return elements;
    }

    function recursively( element, nextFn, testFn ) {
        do {
            element = nextFn(element);
        } while ( testFn(element) );
        return element;
    }

    var mParentList = {};
    function getParentList(element){
        function rec(el){
            var p;
            el.pid = el.pid? el.pid:'p'+$_.Utils.makeuid();
            if(p = el['parentNode']){
                var ps = mParentList[el.pid]? mParentList[el.pid]:rec(p);
                mParentList[el.pid] = ps;
                return [el, ps]
            }

        }
        return rec(element);
    }

    var ancestors = $_.F.partial(recursivelyCollect, undefined,
        function(element){ return element['parentNode']}, undefined, undefined);

    var ancestor = $_.F.partial(recursively, undefined,
        function(element){ return element['parentNode']}, undefined, undefined)

    function descentors(element, testFn) {
        if($_.O.isNotNode(element)||$_.O.isNotFunction(testFn)) throw new TypeError();
        if(document == element) element = document.body;
        var elements = [];
        var q = [element];
        while(q.length) {
            element = q.shift();
            q.unshift.apply(q, $_.Element.children(element));
            if(testFn(element))
                elements.push(element);
        }
        return elements;
    }

    function equalId(el, id){
        if($_.O.isNotNode(el)||$_.O.isNotString(id)) throw new TypeError();
        return el.id === id;
    }

    function equalClassName(el, className){
        if($_.O.isNotNode(el)||$_.O.isNotString(className)) throw new TypeError();
        return $_.Element.hasClass(el, className);
    }

    function equalTagName(el, tagName){
        if($_.O.isNotNode(el)||$_.O.isNotString(tagName)) throw new TypeError();
        return el.tagName === tagName.toUpperCase();
    }

    function ofnToElements(arr){
        var run = $_.O.clone(arr).reverse();
        var res = [];
        $_.A.each(run, function(o){
            if(!res.length){
                res = document.getElementsByTagName('li')//descentors(document, o.fn);
            }else {
                $_.A.filter(res, function (v){
                    var pl = getParentList(v);
                    return !anyList(pl, o.fn);
                });
            }
        });
        return res;
    }
    //Asdf.Selector.ofnToElements([{fn: function(e){return e.tagName="LI"}},{fn: function(e){ return e.className=='test-name'}}])
    var fnMap = {
        className: equalClassName,
        id: equalId,
        tagName: equalTagName,
        and: $_.F.and,
        or: $_.F.or
    };

    function adapterEqualFn(fn, str){
        return $_.F.partial(fn, undefined, str);
    }

    var mCompositFn = {};
    function compositFn(obj){
        function rec(o) {
            var res = [];
            $_.O.each(o, function (v, k) {
                if ($_.O.isString(v)) {
                    res.push(adapterEqualFn(fnMap[k], v));
                    return;
                }
                if ($_.O.isPlainObject(v)) {
                    res.push(fnMap[k].apply(this, rec(v)));
                    return;
                }
            });
            return  res;
        }
        var f = rec(obj)[0];
        f.fid = 'f'+$_.Utils.makeuid();
        return f;
    }
    //Asdf.Selector.compositFn({and:{id: 'qunit',tagName:'div'}})


    function oToOfn(arr){
        var res = [];
        $_.A.each(arr, function(v){
            res.push({fn:compositFn(v)});
        });
        return res;
    }
    //Asdf.Selector.ofnToElements(Asdf.Selector.oToOfn([{tagName: 'body'}, {and:{id: 'qunit',tagName:'div'}}]));

    */
    $_.O.extend(o, {
        /*
        descentors: descentors,
        ancestor: ancestor,
        ancestors: ancestors,
        getParentList:getParentList,
        anyList:anyList,
        eachList:eachList,
        equalId:equalId,
        equalClassName:equalClassName,
        equalTagName:equalTagName,
        ofnToElements:ofnToElements,
        compositFn:compositFn,
        oToOfn:oToOfn,
        */
        tokenize:tokenize,
        toSelector:toSelector,
        select:select
    })
})(Asdf);;(function ($_) {
	$_.Template = {};
	var attrBind = function(element, attrs) {
		var hasAttribute =  function (node, attr) {
			if (node.hasAttribute)
				return node.hasAttribute(attr);
			else
				return node.getAttribute(attr);
		};
		for(var key in attrs){
			if(key.toLowerCase() === 'html'){
				htmlBind(element,attrs[key]);
			}else if(key.toLowerCase() === 'text'){
				textBind(element,attrs[key]);
			}else if(key.toLowerCase() === 'class'){
				element.className = attrs[key];
			}else if(key.toLowerCase() === 'value'){
				element.value = attrs[key];
			}else if(hasAttribute(element, key)) {
				element.setAttribute(key,attrs[key]);
			}
		}
	}
	,textBind = function(element, text) {
		$_.Element.text(element, text);
	}
	,htmlBind = function(element, html) {
		element.innerHTML = html;
	}
	,findElements = function(root,selector) {
		return $_.Element.find(root, selector);
	}
	,bind = function(element, obj) {
		var key, targets;
		var valiableNodeType = element.nodeType === 1 || element.nodeType === 11;
		// validate
		if (!valiableNodeType) throw new TypeError();
		if (!$_.O.isPlainObject(obj)) throw new TypeError();
        function change(target, key){
            $_.A.each(targets, function(value) {
                if($_.O.isString(obj[key])||$_.O.isNumber(obj[key])) {
                    textBind(value, obj[key]);
                }
                else if($_.O.isPlainObject(obj[key])){
                    attrBind(value, obj[key]);
                }
            });
        }
		for (key in obj){
			targets = findElements(element, key);
			if(targets.length === 0) continue;
            change(target, key);
		}
		return element;
		
	};
	$_.Template.bind = bind;
})(Asdf);;/**
 * Created by kim on 14. 2. 14.
 */
(function($_) {
    $_.Color = {};
    function RGB(r,g,b){
        if($_.O.isNotNumber(r)||$_.O.isNotNumber(g)||$_.O.isNotNumber(b)) throw new TypeError();
        if(!this instanceof RGB) new RGB(r,g,b);
        this.r = r;
        this.g = g;
        this.b = b;

    }
    RGB.prototype.toString = function(){
        return '#'+$_.A.map([this.r,this.g,this.b], function (value) {return $_.S.lpad(Math.min(255,(value|0)).toString(16),"0",2);}).join("")
    };
    RGB.prototype.toHSL = function(){
        var t = rgbToHsl(this.r, this.g, this.b);
        return new HSL(t.h, t.s, t.l);
    };
    RGB.prototype.toHSV = function(){
        var t = rgbToHsv(this.r, this.g, this.b);
        return new HSV(t.h, t.s, t.v);
    };

    function HSL(h,s,l){
        if($_.O.isNotNumber(h)||$_.O.isNotNumber(s)||$_.O.isNotNumber(l)) throw new TypeError();
        if(!this instanceof HSL) new HSL(h,s,l);
        this.h = h;
        this.s = s;
        this.l = l;
    }
    HSL.prototype.toRGB = function(){
        var t = hslToRgb(this.h, this.s, this.l);
        return new RGB(t.r, t.g, t.b);
    };
    HSL.prototype.toHSV = $_.F.compose(HSL.prototype.toRGB, $_.F.functionize(RGB.prototype.toHSV));
    HSL.prototype.toString = $_.F.compose(HSL.prototype.toRGB, $_.F.functionize(RGB.prototype.toString));

    function HSV(h,s,v){
        if($_.O.isNotNumber(h)||$_.O.isNotNumber(s)||$_.O.isNotNumber(v)) throw new TypeError();
        if(!this instanceof HSV) new HSV(h,s,v);
        this.h = h;
        this.s = s;
        this.v = v;
    }
    HSV.prototype.toRGB = function(){
        var t = hsvToRgb(this.h, this.s, this.v);
        return new RGB(t.r, t.g, t.b);
    };
    HSV.prototype.toHSL = $_.F.compose(HSV.prototype.toRGB, $_.F.functionize(RGB.prototype.toHSL));
    HSV.prototype.toString = $_.F.compose(HSV.prototype.toRGB, $_.F.functionize(RGB.prototype.toString));

    function rgbToHsl(r, g, b) {
        r /= 255, g /= 255, b /= 255;
        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        var h, s, l = (max + min) / 2;

        if (max == min) {
            h = s = 0; // achromatic
        } else {
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h /= 6;
        }

        return { h:h, s:s, l:l };
    }
    function hslToRgb(h, s, l) {
        var r, g, b;
        function hue2rgb(p, q, t) {
            if (t < 0)
                t += 1;
            if (t > 1)
                t -= 1;
            if (t < 1 / 6)
                return p + (q - p) * 6 * t;
            if (t < 1 / 2)
                return q;
            if (t < 2 / 3)
                return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        }
        if (s === 0) {
            r = g = b = l; // achromatic
        } else {
            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }

        return {r:r * 255, g:g * 255, b:b * 255};
    }
    function rgbToHsv(r, g, b) {
        r = r / 255, g = g / 255, b = b / 255;
        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        var h, s, v = max;

        var d = max - min;
        s = max === 0 ? 0 : d / max;

        if (max == min) {
            h = 0; // achromatic
        } else {
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h /= 6;
        }

        return { h:h, s:s, v:v };
    }
    function hsvToRgb(h, s, v) {
        var r, g, b;

        var i = Math.floor(h * 6);
        var f = h * 6 - i;
        var p = v * (1 - s);
        var q = v * (1 - f * s);
        var t = v * (1 - (1 - f) * s);

        switch (i % 6) {
            case 0:
                r = v, g = t, b = p;
                break;
            case 1:
                r = q, g = v, b = p;
                break;
            case 2:
                r = p, g = v, b = t;
                break;
            case 3:
                r = p, g = q, b = v;
                break;
            case 4:
                r = t, g = p, b = v;
                break;
            case 5:
                r = v, g = p, b = q;
                break;
        }

        return { r: r * 255, g: g * 255, b: b * 255 };
    }
    var colorName = {
        aliceblue: 15792383,
        antiquewhite: 16444375,
        aqua: 65535,
        aquamarine: 8388564,
        azure: 15794175,
        beige: 16119260,
        bisque: 16770244,
        black: 0,
        blanchedalmond: 16772045,
        blue: 255,
        blueviolet: 9055202,
        brown: 10824234,
        burlywood: 14596231,
        cadetblue: 6266528,
        chartreuse: 8388352,
        chocolate: 13789470,
        coral: 16744272,
        cornflowerblue: 6591981,
        cornsilk: 16775388,
        crimson: 14423100,
        cyan: 65535,
        darkblue: 139,
        darkcyan: 35723,
        darkgoldenrod: 12092939,
        darkgray: 11119017,
        darkgreen: 25600,
        darkgrey: 11119017,
        darkkhaki: 12433259,
        darkmagenta: 9109643,
        darkolivegreen: 5597999,
        darkorange: 16747520,
        darkorchid: 10040012,
        darkred: 9109504,
        darksalmon: 15308410,
        darkseagreen: 9419919,
        darkslateblue: 4734347,
        darkslategray: 3100495,
        darkslategrey: 3100495,
        darkturquoise: 52945,
        darkviolet: 9699539,
        deeppink: 16716947,
        deepskyblue: 49151,
        dimgray: 6908265,
        dimgrey: 6908265,
        dodgerblue: 2003199,
        firebrick: 11674146,
        floralwhite: 16775920,
        forestgreen: 2263842,
        fuchsia: 16711935,
        gainsboro: 14474460,
        ghostwhite: 16316671,
        gold: 16766720,
        goldenrod: 14329120,
        gray: 8421504,
        green: 32768,
        greenyellow: 11403055,
        grey: 8421504,
        honeydew: 15794160,
        hotpink: 16738740,
        indianred: 13458524,
        indigo: 4915330,
        ivory: 16777200,
        khaki: 15787660,
        lavender: 15132410,
        lavenderblush: 16773365,
        lawngreen: 8190976,
        lemonchiffon: 16775885,
        lightblue: 11393254,
        lightcoral: 15761536,
        lightcyan: 14745599,
        lightgoldenrodyellow: 16448210,
        lightgray: 13882323,
        lightgreen: 9498256,
        lightgrey: 13882323,
        lightpink: 16758465,
        lightsalmon: 16752762,
        lightseagreen: 2142890,
        lightskyblue: 8900346,
        lightslategray: 7833753,
        lightslategrey: 7833753,
        lightsteelblue: 11584734,
        lightyellow: 16777184,
        lime: 65280,
        limegreen: 3329330,
        linen: 16445670,
        magenta: 16711935,
        maroon: 8388608,
        mediumaquamarine: 6737322,
        mediumblue: 205,
        mediumorchid: 12211667,
        mediumpurple: 9662683,
        mediumseagreen: 3978097,
        mediumslateblue: 8087790,
        mediumspringgreen: 64154,
        mediumturquoise: 4772300,
        mediumvioletred: 13047173,
        midnightblue: 1644912,
        mintcream: 16121850,
        mistyrose: 16770273,
        moccasin: 16770229,
        navajowhite: 16768685,
        navy: 128,
        oldlace: 16643558,
        olive: 8421376,
        olivedrab: 7048739,
        orange: 16753920,
        orangered: 16729344,
        orchid: 14315734,
        palegoldenrod: 15657130,
        palegreen: 10025880,
        paleturquoise: 11529966,
        palevioletred: 14381203,
        papayawhip: 16773077,
        peachpuff: 16767673,
        peru: 13468991,
        pink: 16761035,
        plum: 14524637,
        powderblue: 11591910,
        purple: 8388736,
        red: 16711680,
        rosybrown: 12357519,
        royalblue: 4286945,
        saddlebrown: 9127187,
        salmon: 16416882,
        sandybrown: 16032864,
        seagreen: 3050327,
        seashell: 16774638,
        sienna: 10506797,
        silver: 12632256,
        skyblue: 8900331,
        slateblue: 6970061,
        slategray: 7372944,
        slategrey: 7372944,
        snow: 16775930,
        springgreen: 65407,
        steelblue: 4620980,
        tan: 13808780,
        teal: 32896,
        thistle: 14204888,
        tomato: 16737095,
        turquoise: 4251856,
        violet: 15631086,
        wheat: 16113331,
        white: 16777215,
        whitesmoke: 16119285,
        yellow: 16776960,
        yellowgreen: 10145074
    };

    function parse(format){
        var m1 = /([a-z]+)\((.*)\)/i.exec(format);
        function parseNumber(c){
            var f = parseFloat(c);
            return c.charAt(c.length - 1) === "%" ? Math.round(f * 2.55) : f;
        }
        var r, g, b;
        if(m1){
            var m2 = m1[2].split(',');
            if(m1[1] === 'rgb'){
                return new RGB(parseNumber(m2[0]),parseNumber(m2[1]),parseNumber(m2[2]));
            }else {
                return new HSL(parseFloat(m2[0]/360), parseFloat(m2[1])/100, parseFloat(m2[2])/100);
            }

        }
        var color;
        if(colorName[format]){
            color = colorName[format];
        }else if((format.length === 4||format.length === 7)&&format.charAt(0) === '#' && !isNaN(color = parseInt(format.substring(1), 16))){
            if(format.length === 4){
                r = (color & 3840) >> 4;
                r = r >> 4 | r;
                g = color & 240;
                g = g >> 4 | g;
                b = color & 15;
                b = b << 4 | b;
                return new RGB(r,g,b);
            }
        }else {
            throw new TypeError();
        }
        r = (color & 16711680) >> 16;
        g = (color & 65280) >> 8;
        b = color & 255;
        return new RGB(r,g,b);
    }

    var colorNameList = $_.O.keys(colorName);

    $_.O.extend($_.Color, {
        RGB:RGB,
        HSL:HSL,
        HSV:HSV,
        rgbToHsl : rgbToHsl,
        hslToRgb : hslToRgb,
        rgbToHsv : rgbToHsv,
        hsvToRgb : hsvToRgb,
        parse:parse,
        colorNameList:colorNameList
    });
})(Asdf);;(function($_) {
    $_.Debug = {};
    var debug = true;
    function setDebug(d){
        debug = !!d;
    }

    function typeOf(value) {
        var s = typeof value;
        if (s == 'object') {
            if (value) {
                if (value instanceof Array) {
                    return 'array';
                } else if (value instanceof Object) {
                    return s;
                }
                var className = Object.prototype.toString.call(
                    /** @type {Object} */ (value));
                if (className == '[object Window]') {
                    return 'object';
                }
                if ((className == '[object Array]' ||
                    typeof value.length == 'number' &&
                    typeof value.splice != 'undefined' &&
                    typeof value.propertyIsEnumerable != 'undefined' &&
                    !value.propertyIsEnumerable('splice')
                    )) {
                    return 'array';
                }
                if ((className == '[object Function]' ||
                    typeof value.call != 'undefined' &&
                    typeof value.propertyIsEnumerable != 'undefined' &&
                    !value.propertyIsEnumerable('call'))) {
                    return 'function';
                }
            } else {
                return 'null';
            }

        } else if (s == 'function' && typeof value.call == 'undefined') {
            return 'object';
        }
        return s;
    }

    function doctest(fn, startsWith){
        startsWith = startsWith||'>>>';
        if(!$_.O.isFunction(fn)) throw new TypeError();
        var def = $_.F.getDef(fn);
        var lines = def.comments.join('\n').split('\n');
        return Asdf.A.map($_.A.filter(lines, function(l){
            return $_.S.startsWith(l,startsWith);
        }), function(exe){
            try{
                return (new Function('return ' + exe.substring(startsWith.length)))();
            }catch(e){
                return e;
            }
        });
    }

    var STRIP_COMMENTS = /(?:\/\*\{([\s\S]+?)\}\*\/)/mg;
    var rargcomment = /\{(\d+)\}\s*(\w+)/;
    var rreturncomment = /return\s+\{(\d+)\}/g;
    function validate(fn){
        if(!debug) return fn;
        if(!$_.O.isFunction(fn)) throw new TypeError();
        var comment = [];
        var fnText = fn.toString().replace(STRIP_COMMENTS, function(_,p1){
            return '{'+(comment.push(p1)-1)+'}'
        }).replace($_.R.STRIP_COMMENTS, '');
        var mfn = fnText.match($_.R.FN_DEF);
        var fname = mfn[1]||'{anonymous}';
        var fbody = mfn[3];
        var argNames = $_.A.map(mfn[2].split($_.R.FN_ARG_SPLIT), function(arg){
            return $_.S.trim(arg);
        });
        var self = this;
        var argTest = $_.A.reduce(argNames, function(o,v,i){
            var m =v.match(rargcomment);
            if(!m) return o;
            var index = i;
            var argName = m[2];
            var type = comment[m[1]].split('|');
            return $_.A.append(o,function(){
                var arg = arguments[index], ct;
                if( Asdf.A.contains(type,(ct = typeOf(arg))))
                    return true;
                throw new TypeError(fname+' : '+argName +" type must be a " + type.join(' or ') + '. current type is '+ct+'.'+'\n'+fn.toString());
            });
        }, []);
        var returnTest = function(res){
            var type = [], rt, m=fbody.match(rreturncomment);
            fbody.replace(rreturncomment, function(_,t){
                type.push(comment[t]);
            });
            if(m && (type = type.join('|').split('|'))){
                if( Asdf.A.contains(type,(rt = typeOf(res))))
                    return true;
                throw new TypeError(fname+' : return type must be a ' + type.join(' or ') + '. current type is '+rt+'.'+'\n'+fn.toString());
            }
        };

        return $_.F.wrap(fn, function(ofn){
            var args = Array.prototype.slice.call(arguments,1);
            $_.A.each(argTest, function(f){
                f.apply(self, args);
            });
            var res = ofn.apply(this, args);
            returnTest(res);
            return res;
        });
    }
    $_.O.extend($_.Debug, {
        setDebug:setDebug,
        validate:validate
    });

})(Asdf);;(function($_) {
    $_.Ease = {};

    function linear(t) { return t; }

    function get(amount) {
        if (amount < -1) { amount = -1; }
        if (amount > 1) { amount = 1; }
        return function(t) {
            if (amount===0) { return t; }
            if (amount<0) { return t*(t*-amount+1+amount); }
            return t*((2-t)*amount+(1-amount));
        }
    }

    function getPowIn(pow) {
        return function(t) {
            return Math.pow(t,pow);
        }
    }

    function getPowOut(pow) {
        return function(t) {
            return 1-Math.pow(1-t,pow);
        }
    }

    function getPowInOut(pow) {
        return function(t) {
            if ((t*=2)<1) return 0.5*Math.pow(t,pow);
            return 1-0.5*Math.abs(Math.pow(2-t,pow));
        }
    }

    var quadIn = getPowIn(2);

    var quadOut = getPowOut(2);

    var quadInOut = getPowInOut(2);

    var cubicIn = getPowIn(3);

    var cubicOut = getPowOut(3);

    var cubicInOut = getPowInOut(3);

    var quartIn = getPowIn(4);

    var quartOut = getPowOut(4);

    var quintIn = getPowIn(5);

    var quintOut = getPowOut(5);

    var quintInOut = getPowInOut(5);

    function sineIn(t) {
        return 1-Math.cos(t*Math.PI/2);
    }

    function sineOut(t) {
        return Math.sin(t*Math.PI/2);
    }

    function sineInOut(t) {
        return -0.5*(Math.cos(Math.PI*t) - 1)
    }

    function getBackIn(amount) {
        return function(t) {
            return t*t*((amount+1)*t-amount);
        }
    }

    function getBackInOut(amount) {
        amount*=1.525;
        return function(t) {
            if ((t*=2)<1) return 0.5*(t*t*((amount+1)*t-amount));
            return 0.5*((t-=2)*t*((amount+1)*t+amount)+2);
        }
    }

    function getBackOut(amount) {
        return function(t) {
            return (--t*t*((amount+1)*t + amount) + 1);
        }
    }

    var backIn = getBackIn(1.7);

    var backOut = getBackOut(1.7);

    var backInOut = getBackInOut(1.7);

    function circIn(t) {
        return -(Math.sqrt(1-t*t)- 1);
    }

    function circOut(t) {
        return Math.sqrt(1-(--t)*t);
    }

    function circInOut(t) {
        if ((t*=2) < 1) return -0.5*(Math.sqrt(1-t*t)-1);
        return 0.5*(Math.sqrt(1-(t-=2)*t)+1);
    }

    function bounceIn(t) {
        return 1-bounceOut(1-t);
    }

    function bounceOut(t) {
        if (t < 1/2.75) {
            return (7.5625*t*t);
        } else if (t < 2/2.75) {
            return (7.5625*(t-=1.5/2.75)*t+0.75);
        } else if (t < 2.5/2.75) {
            return (7.5625*(t-=2.25/2.75)*t+0.9375);
        } else {
            return (7.5625*(t-=2.625/2.75)*t +0.984375);
        }
    }

    function bounceInOut(t) {
        if (t<0.5) return bounceIn (t*2) * 0.5;
        return bounceOut(t*2-1)*0.5+0.5;
    }

    function getElasticIn(amplitude,period) {
        var pi2 = Math.PI*2;
        return function(t) {
            if (t===0 || t===1) return t;
            var s = period/pi2*Math.asin(1/amplitude);
            return -(amplitude*Math.pow(2,10*(t-=1))*Math.sin((t-s)*pi2/period));
        }
    }

    function getElasticOut(amplitude,period) {
        var pi2 = Math.PI*2;
        return function(t) {
            if (t===0 || t===1) return t;
            var s = period/pi2 * Math.asin(1/amplitude);
            return (amplitude*Math.pow(2,-10*t)*Math.sin((t-s)*pi2/period )+1);
        }
    }

    function getElasticInOut(amplitude,period) {
        var pi2 = Math.PI*2;
        return function(t) {
            var s = period/pi2 * Math.asin(1/amplitude);
            if ((t*=2)<1) return -0.5*(amplitude*Math.pow(2,10*(t-=1))*Math.sin( (t-s)*pi2/period ));
            return amplitude*Math.pow(2,-10*(t-=1))*Math.sin((t-s)*pi2/period)*0.5+1;
        }
    }

    var elasticIn = getElasticIn(1,0.3);

    var elasticOut = getElasticOut(1,0.3);

    var elasticInOut = getElasticInOut(1,0.3*1.5);

    $_.O.extend($_.Ease, {
        linear: linear,
        get:get,
        getPowIn:getPowIn,
        getPowOut:getPowOut,
        getPowInOut:getPowInOut,
        quadIn:quadIn,
        quadOut:quadOut,
        quadInOut:quadInOut,
        cubicIn:cubicIn,
        cubicOut:cubicOut,
        cubicInOut:cubicInOut,
        quartIn:quartIn,
        quartOut:quartOut,
        quintIn:quintIn,
        quintOut:quintOut,
        quintInOut:quintInOut,
        sineIn:sineIn,
        sineOut:sineOut,
        sineInOut:sineInOut,
        getBackIn:getBackIn,
        getBackInOut:getBackInOut,
        getBackOut:getBackOut,
        backIn:backIn,
        backOut:backOut,
        backInOut:backInOut,
        circIn:circIn,
        circOut:circOut,
        circInOut:circInOut,
        bounceIn:bounceIn,
        bounceOut:bounceOut,
        bounceInOut:bounceInOut,
        getElasticIn:getElasticIn,
        getElasticOut:getElasticOut,
        getElasticInOut:getElasticInOut,
        elasticIn:elasticIn,
        elasticOut:elasticOut,
        elasticInOut:elasticInOut
    });
})(Asdf);;(function($_) {
	$_.JSON = {};
	if(typeof Date.prototype.toJSON !== 'function'){
		Date.prototype.toJSON = function (key) {
			return isFinite(this.valueOf())
            ? this.getUTCFullYear()     + '-' +
                f(this.getUTCMonth() + 1) + '-' +
                f(this.getUTCDate())      + 'T' +
                f(this.getUTCHours())     + ':' +
                f(this.getUTCMinutes())   + ':' +
                f(this.getUTCSeconds())   + 'Z'
            : null;
		};
		String.prototype.toJSON      =
            Number.prototype.toJSON  =
            Boolean.prototype.toJSON = function (key) {
                return this.valueOf();
            };
	}
})(Asdf);;(function($_) {
    var promise = {}
	$_.Promise = promise;
	//state : Uninitialized, unfulfill, fulfilled, rejected
	var toPromise = function(resolver){
		var fire = true;
		function then(done, fail){
			fire = false;
			done = done||function(){};
			fail = fail||function(){};
			if(!done.length)
				done = $_.F.wrap(done, function(fn, d,f){
					try{
						fn();
						d();
					}catch(e){
						f(e.message);
					}
				});
			var fn = $_.F.wrap(resolver, function(fn, d, f){
				d = d||function() {};
				f = f||function() {};
				return fn($_.F.curry(done,d,f), fail);
			});
			return toPromise(fn);
		}
		$_.F.defer(function() {
			if(fire)
				resolver(function(){}, function(){});
		});
		function Promise() {}
		Promise.prototype.then = then;
		return new Promise;
	};
	
	$_.O.extend(promise, {
		toPromise:toPromise
	});
})(Asdf);;(function($_){
    $_.Scale = {};
    function uninterpolate(x, a, b){
        b = b-(a = +a) ? 1/(b-a):0;
        return (x-a)*b;
    }
    function interpolateNumber(x, a, b){
        b -= a = +a;
        return a + b*x;
    }

    function interpolateRgb(x, a, b){
        var ar = a.r, ag = a.g, ab = a.b, br = b.r - ar, bg = b.g - ag, bb = b.b - ab;
        return new $_.Color.RGB(ar+br*x, ag+bg *x, ab+bb*x);
    }

    function interpolateObject(x, a, b){
        var c = {}, k;
        for (k in a) {
            if (k in b) {
                c[k] = interpolate(x,a[k], b[k]);
            } else {
                c[k] = a[k];
            }
        }
        for (k in b) {
            if (!(k in a)) {
                c[k] = b[k];
            }
        }
        return c;
    }

    function interpolateArray(x,a,b){
        var c = [], na = a.length, nb = b.length, n0 = Math.min(a.length, b.length), i;
        for (i = 0; i < n0; ++i) c.push(interpolate(x, a[i], b[i]));
        for (;i < na; ++i) c[i] = a[i];
        for (;i < nb; ++i) c[i] = b[i];
        return c;
    }

    function interpolate(x,a,b){
        var inter = Asdf.F.overload(interpolateObject, function(x,a,b){
            return $_.O.isPlainObject(a) && $_.O.isPlainObject(b);
        });
        inter = Asdf.F.overload(interpolateArray, function(x,a,b){
            return $_.O.isArray(a) && $_.O.isArray(b);
        }, inter);
        inter = Asdf.F.overload(interpolateNumber, function(x,a,b){
            return $_.O.isNumber(a)&& $_.O.isNumber(b);
        }, inter);
        inter = Asdf.F.overload(interpolateRgb, function(x,a,b){
            return a instanceof $_.Color.RGB && b instanceof $_.Color.RGB;
        }, inter);
        return inter(x,a,b);
    }

    function _linear(x, domain, range){
        return interpolate(uninterpolate(x,domain[0],domain[1]), range[0], range[1]);
    }

    function get(fn, domain, range, n){
        domain = domain || [0,1];
        range = range || [0,1];
        return fn(n, domain, range);
    }
    var linear = $_.F.partial(get, _linear, undefined, undefined, undefined );
    var log = $_.F.partial(get, function(x, domain, range){return _linear(Math.log(x)/Math.log(10), [domain[0]/Math.log(10),domain[1]/Math.log(10)], range);}, undefined, undefined, undefined);
    var pow = $_.F.partial(get, function(x, domain, range){return _linear(Math.pow(10,x), [Math.pow(10,domain[0]),Math.pow(10,domain[1])], range);}, undefined, undefined, undefined);
    var sqrt = $_.F.partial(get, function(x, domain, range){return _linear(Math.pow(0.5,x), [Math.pow(0.5,domain[0]),Math.pow(0.5,domain[1])], range);}, undefined, undefined, undefined);
    $_.O.extend($_.Scale, {
        get:get,
        linear:linear,
        log:log,
        pow:pow,
        sqrt:sqrt
    });
})(Asdf);;/**
 * @project Asdf.js
 */
(function($_) {
    /**
     * @namespace
     * @name Asdf.Utils
     */
    var o = $_.Core.namespace($_, 'Utils');
	function randomMax8HexChars() {
		return (((1 + Math.random()) * 0x100000000) | 0).toString(16)
				.substring(1);
	}
	function makeuid() {
		return randomMax8HexChars() + randomMax8HexChars();
	}

	function parseJson(jsonString) {
		if (typeof jsonString == "string") {
			if (jsonString) {
				if (JSON && JSON.parse) {
					return JSON.parse(jsonString);
				}
				return (new Function("return " + jsonString))(); // jshint ignore:line
			}
		}
		return null;
	}
    function getTimer(){
        return Asdf.F.bind((performance.now||
            performance.mozNow||
            performance.msNow||
            performance.oNow||
            performance.webkitNow||
            function() { return new Date().getTime(); }), performance||{});
    }
    function time(fn){
        var timer = getTimer();
        var startTime = timer();
        var res = fn.apply(this,Array.prototype.slice.call(arguments, 1));
        var endTime = timer();
        if(endTime == startTime)
            endTime = timer();
        console.log(endTime - startTime);
        return res;
    }


    var con = (function(){
        var indent = 0;
        var res = {};
        if(typeof console === 'undefined') return null;
        if( !console.group || $_.O.isNotFunction(console.group) ){
            res.log =  function(str){
                return console.log($_.S.times(' ', indent) + str);
            };
            res.group = function(str){
                indent += 2;
                return console.log($_.S.times(' ', indent) + str);
            };
            res.groupEnd = function(){
                indent -= 2;
            };
        }else {
            res.log = $_.F.bind(console.log, console);
            res.group = $_.F.bind(console.group, console);
            res.groupEnd = $_.F.bind(console.groupEnd, console);
        }
        return res;
    })();
    function stringifyData(args) {
        var result = [];
        var slice = Array.prototype.slice;
        for (var i = 0; i < args.length; ++i) {
            var arg = args[i];
            if (arg === undefined) {
                result[i] = 'undefined';
            } else if (arg === null) {
                result[i] = 'null';
            } else if (arg.constructor) {
                // TODO constructor comparison does not work for iframes
                if (arg.constructor === Array) {
                    if (arg.length < 3) {
                        result[i] = '[' + stringifyData(arg) + ']';
                    } else {
                        result[i] = '[' + stringifyData(slice.call(arg, 0, 1)) + '...' + stringifyData(slice.call(arg, -1)) + ']';
                    }
                } else if (arg.constructor === Object) {
                    result[i] = '#object';
                } else if (arg.constructor === Function) {
                    result[i] = '#function';
                } else if (arg.constructor === String) {
                    result[i] = '"' + arg + '"';
                } else if (arg.constructor === Number) {
                    result[i] = arg;
                } else {
                    result[i] = '?';
                }
            }
        }
        return result.join(',');
    }

    function spy(fn, desc){
        if(typeof console === 'undefined') return fn;
        desc = desc ? desc + ': ' : '';
        var args = [];
        var returns = [];
        var stacks = [];
        var errors = [];
        var count = 0;
        var fndef = $_.F.getDef(fn);
        var isDir = console.dir;
        function log(str){
            con.log(str);
        }
        function groupStart(title){
            con.group(title);
        }
        function groupEnd(){
            con.groupEnd();
        }
        function print(name,o){
            groupStart(name+ '{')
            if($_.O.isArray(o)){
                $_.A.each(o, function(v){
                    log(isDir?v:('  ' + stringifyData(v)));
                });
            }else {
                log(isDir?o:('  ' + stringifyData(o)));
            }
            log('}');
            groupEnd();
        }
        var res = function spy() {
            var stack = trace().slice(1);
            var error;
            var value;
            var time;
            var timer = getTimer();
            var arg = Array.prototype.slice.call(arguments, 0);
            groupStart(desc + 'function ' + fndef.name + '('+ fndef.arguments.join(',') +')'+'{');
            print('arguments : ', arg);
            print('stack: ', stack);
            try{
                time = timer();
                value = fn.apply(this, arg);
                time = timer()- time;
            }catch(e){
                error = e;
                print('error', error);
            }
            finally{
                errors.push(error);
            }
            print('return: ', value);
            log('duration: ' + time + 'ms');
            log('}');
            groupEnd();
            args.push(arg);
            stacks.push(stack);
            returns.push(value);
            count ++ ;
            return value;
        };
        res.count = function(){
            return count;
        };
        res.returns = function(){
            return $_.O.clone(returns);
        };
        res.args = function(){
            return $_.O.clone(args);
        };
        res.stack = function(){
            return $_.O.clone(stacks);
        };
        res.error = function(){
            return $_.O.clone(errors);
        };
        return res;
    }

    function trace(e){
        function createException(){
            try{
                throw new Error();
            }catch(e){
                return e;
            }
        }
        function other(curr) {
            var ANON = '{anonymous}', fnRE = /function(?:\s+([\w$]+))?\s*\(/, stack = [], fn, args, maxStackSize = 10;
            var slice = Array.prototype.slice;
            while (curr && stack.length < maxStackSize) {
                fn = fnRE.test(curr.toString()) ? RegExp.$1 || ANON : ANON;
                try {
                    args = slice.call(curr['arguments'] || []);
                } catch (e) {
                    args = ['Cannot access arguments: ' + e];
                }
                stack[stack.length] = fn + '(' + stringifyData(args) + ')';
                try {
                    curr = curr.caller;
                } catch (e) {
                    stack[stack.length] = 'Cannot access caller: ' + e;
                    break;
                }
            }
            return stack;
        }
        var startIdx = 0;
        e = e || (++startIdx && createException());
        var nomalizer = $_.F.cases({
            'chrome': function(e){
                return (e.stack + '\n')
                    .replace(/^[\s\S]+?\s+at\s+/, ' at ')
                    .replace(/^\s+(at eval )?at\s+/gm, '')
                    .replace(/^([^\(]+?)([\n$])/gm, '{anonymous}() ($1)$2')
                    .replace(/^Object.<anonymous>\s*\(([^\)]+)\)/gm, '{anonymous}() ($1)')
                    .replace(/^(.+) \((.+)\)$/gm, '$1@$2')
                    .split('\n')
                    .slice(0, -1);
            },
            'mozilla': function(e){
                return e.stack.replace(/(?:\n@:0)?\s+$/m, '')
                    .replace(/^(?:\((\S*)\))?@/gm, '{anonymous}($1)@')
                    .split('\n');
            },
            'msie': function(e){
                return e.stack
                    .replace(/^\s*at\s+(.*)$/gm, '$1')
                    .replace(/^Anonymous function\s+/gm, '{anonymous}() ')
                    .replace(/^(.+)\s+\((.+)\)$/gm, '$1@$2')
                    .split('\n')
                    .slice(1);
            }
        }, function(e){return e.stack});
        return e.stack?nomalizer($_.Bom.browser,e).slice(startIdx):other(arguments.callee);
    }
    var now = Date.now || function() { return new Date().getTime(); };
	$_.O.extend(o, {
		makeuid : makeuid,
		parseJson : parseJson,
        time:time,
        spy: spy,
        trace:trace,
        now:now
	});
})(Asdf);;(function($_) {
    var o = $_.Core.namespace($_, 'Utils');
	var ready = (function() {
		var domReadyfn = [];
		var timer, defer = $_.F.defer;
		function fireContentLoadedEvent() {
			var i;
			if (document.loaded)
				return;
			if (timer)
				window.clearTimeout(timer);
			document.loaded = true;
			for (i = 0; i < domReadyfn.length; i++) {
				domReadyfn[i]($_);
			}
		}
		function checkReadyState() {
			if (document.readyState === 'complete') {
				document.detachEvent('onreadystatechange', checkReadyState);
				fireContentLoadedEvent();
			}
		}
		function pollDoScroll() {
			try {
				document.documentElement.doScroll('left');
			} catch (e) {
				timer = defer(pollDoScroll);
				return;
			}
			fireContentLoadedEvent();
		}
		if (document.addEventListener) {
			document.addEventListener('DOMContentLoaded',
					fireContentLoadedEvent, false);
			window.addEventListener('load', fireContentLoadedEvent);
		} else {
			document.attachEvent('onreadystatechange', checkReadyState);
			if (window == top)
				timer = defer(pollDoScroll);
			window.attachEvent('onload', fireContentLoadedEvent);
		}
		return function(callback) {domReadyfn.push(callback);};
	})();
	$_.O.extend(o, {
		ready : ready
	});
})(Asdf);;(function ($_) {
	$_.Base = {};
	function subclass() {}
	var Class = function(/*parent, protoProps, staticProps*/) {
		var arg = $_.A.toArray(arguments), parent = null, protoProps, staticProps;
		if($_.O.isFunction(arg[0]))
			parent = arg.shift();
		protoProps = arg[0];
		staticProps = arg[1];
		function child() {
			var self = this, key, arg = $_.A.toArray(arguments);
			for(key in self){
				if(!$_.O.isFunction(self[key]))self[key] = $_.O.clone(self[key]); 
			}
			function initsuper(parent) {
				if(!parent) return;
				if(parent.superclass)
					initsuper(parent.superclass);
				parent.prototype.initialize.apply(self, arg);
			}
			initsuper(parent);
			this.initialize.apply(this, arg);
		}
		child.superclass = parent;
		child.subclasses = [];
		if(parent){	
			subclass.prototype = parent.prototype;
			child.prototype = new subclass();
			parent.subclasses.push(child);
		}
		child.prototype.initialize = function () {};
		if (protoProps)
			$_.O.extend(child.prototype, protoProps);
		if (staticProps)
			$_.O.extend(child, staticProps);
		child.extend = $_.F.wrap($_.O.extend, function (fn, obj){
			var extended = obj.extended;
			fn(child, obj);
			if(extended) extended(child);
		});
		child.include = $_.F.wrap($_.O.extend, function (fn, obj){
			var included = obj.included;
			fn(child.prototype, obj);
			if(included) included(child);
		});
		child.prototype.constructor = child;
		return child;
	};
    function getDefaultConstructor(){
        var c = function (){
            if(this.constructor !== c ) return new c();
            var self = this;
            $_.O.each(c.prototype, function(v, k){
                if(!$_.O.isFunction(v))self[k] = $_.O.clone(v);
            });
        }
        return c;
    }
	$_.O.extend($_.Base, {
		Class: Class,
        getDefaultConstructor: getDefaultConstructor
	});
})(Asdf);;(function($_) {
    var Callbacks;
	$_.Callbacks = Callbacks = {};
	var getCallbacks = function(options) {
		var list = $_.Store.getStore();
		var on = function(fn) {
			var tmp = list.get('any')||[];
			tmp.push(fn);
			list.set('any', tmp);
		};
		var remove = function(fn){
			var tmp = list.get('any')||[];
			list.set('any', $_.A.without(tmp,fn));
		};
		var has = function(fn){
			var tmp = list.get('any')||[];
			return $_.A.include(tmp, fn);
		};
		var emit = function(context, args){
			var tmp = list.get('any')||[];
			$_.A.each(tmp, function(fn){
				fn.apply(context, args);
			});
			return this;
		};
		return {
			on: on,
			remove: remove,
			has: has,
			emit: emit
		};
	};
	$_.O.extend(Callbacks, {
		getCallbacks: getCallbacks
	});
})(Asdf);;(function ($_) {
    var o = $_.Core.namespace($_, 'C');
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
        emit: function(name/*, args*/){
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
    c.mixin = publicP;
    $_.O.extend(o, {
      Events:  c
    });
})(Asdf);
;(function($_) {
    var o = $_.Core.namespace($_, 'C');
	var safeObject = function(obj) {
		return ($_.O.isArray(obj)||$_.O.isPlainObject(obj))? $_.O.clone(obj):obj;
	};
    var publicP = {
        _data: {},
        _options: {
            safe: false,
            value: false,
            freeze: false,
            types: {}
        },
        initialize: function(data, options){
            if(data==null && options==null)
                return
            else if(!$_.O.isPlainObject(data)&& !$_.O.isPlainObject(options))
                throw new TypeError();
            if(options.types && !$_.O.type(data, options.types))
                throw new TypeError();
            data && $_.O.extend(this._data, data);
            options && $_.O.extend(this._options, options);
        },
        get: function(key){
            var res;
            if (this.has(key)) {
                res = this._data[key];
                return (this._options.safe)? safeObject(res):res;
            }
            return;
        },
        set: function(key, value, typeFn) {
            if(this._options.value)
                throw new Error('valueObject can\'t set value');
            if(this._options.freeze && !this.has(key))
                throw new Error('freezeObject can\'t set new value');
            typeFn = typeFn||this._options.types[key];
            if(typeFn&&!typeFn(value))
                throw new TypeError();
            typeFn && (this._options.types[key] = typeFn);
            this._data[key] = (this._options.safe)? safeObject(value):value;
        },
        has: function(key) {
            return $_.A.include($_.O.keys(this._data),key)
        },
        remove: function(key) {
            if(this._options.value)
                throw new Error('valueObject can\'t remove value');
            if(this._options.freeze && this.has(key))
                throw new Error('freezeObject can\'t remove value');
            if(this._options.types[key])
                delete this._options.types[key];
            delete this._data[key];
        },
        equals: function(obj){
            return $_.O.equals(this._data, obj._data);
        }

    };
    var c = $_.Base.Class(publicP);
    c.mixin = publicP;
    $_.O.extend(o, {
        Store:  c
    });
})(Asdf);;(function($_) {
    //Asdf.Chain("    asdfasdfasdfasdf").bind(Asdf.S.trim).bind(Asdf.S.capitalize).bind(Asdf.S.truncate, undefined, 5, '...').bind(Asdf.S.lpad, undefined, '0', 10).value();
    /*var promise = Asdf.Chain(
        function(f){console.log('start'); f()},
        {bind:function(async){
            var ff = Asdf.F.wrap(this._value, function(f,as){
                return f(function(){
                    return async.apply(this,Asdf.A.merge([as],arguments))
                });
            });
            return Asdf.Chain(ff, this._conf);
        }});
    promise
        .bind(Asdf.F.async(function(f){console.log('1');setTimeout(f,1000)}))
        .bind(Asdf.F.async(function(f){console.log('2');setTimeout(f,1000)}))
        .bind(Asdf.F.async(function(f){console.log('3');setTimeout(f,1000)}))
        .bind(Asdf.F.async(function(f){console.log('4');setTimeout(f,1000)}))
        .value()()
        */

    function Chain(obj, conf){
        if(obj instanceof Chain) return obj;
        if(!(this instanceof Chain)) return new Chain(obj, conf)
        this._value = obj;
        this._conf = conf||{};
        if(conf) {
            conf.bind && (this.bind = conf.bind);
            conf.fail && (this.fail = conf.fail);
        }
    }
    $_.Chain = Chain;
    function bind(fn){
        var _method = $_.F.partial.apply(this, arguments);
        if(this._value != this._conf.fail)
            return Chain(_method(this._value), this._conf);
        return Chain(this._conf.fail, this._conf);
    }
    function value(){
        return this._value;
    }

    Chain.prototype.bind = bind;
    Chain.prototype.value = value;

})(Asdf);;(function($_){
    var o = $_.Core.namespace( $_, 'Async');
    function loadImg(src, cb){
        var i = new Image();
        i.src=src;
        i.onload = function(){cb(i)}
    }

    function loadImgs(src, cb){
        var fn = $_.A.map(src, function(v){return $_.F.curry(loadImg, v)});
        $_.F.when.apply(this, fn)(cb);
    }
    $_.O.extend(o, {
        loadImg:loadImg,
        loadImgs:loadImgs
    });
})(Asdf);;(function($_) {
	$_.Ajax = {};
	var activeRequestCount = 0, emptyFunction = function () {};
	var Try = {
		these : function() {
			var returnValue;
			for ( var i = 0, length = arguments.length; i < length; i++) {
				var lambda = arguments[i];
				try {
					returnValue = lambda();
					break;
				} catch (e) {
				}
			}

			return returnValue;
		}
	};
	var states = 'Uninitialized Loading Loaded Interactive Complete'.split(' ');
	function onStateChange(transport, fn) {
		var readyState = transport.readyState();
		if (readyState > 1 && !((readyState == 4) && transport._complete))
			fn(readyState);
	}
	function setRequestHeaders (xhr, options) {
		if(!$_.O.isPlainObject(options)) throw new TypeError();
		var headers = {'Accept' : 'text/javascript, text/html, application/xml, text/xml, */*'};
		var contentType;
		if(options.method === 'post') {
			contentType = options.contentType + (options.encoding?';charset'+options.encoding: '');
		}
		$_.O.extend( headers, options.requestHeaders||{});
		headers['Content-type'] = contentType;
		for(var name in headers){
			xhr.setRequestHeader(name, headers[name]);
		}
	}
	function success(status) {
		return !status || (status >=200 && status < 300) || status ==304;
	}
	function getStatus(xhr){
		try{
			if(xhr.status === 1223) return 204;
			return xhr.status ||0;
		} catch (e) { return 0; }
	}
	function respondToReadyState(transport, options, readyState){
		var state = states[readyState];
		var res = getResponse(transport);
		if(state === 'Complete'){
			try {
				transport._complete = true;
				(options['on' + transport.status()]
						|| options['on'+ (success(transport.status()) ? 'Success' : 'Failure')] || emptyFunction)(res);
			} catch (e) {
				throw e;
			}
		}
		try{
			(options['on'+state]||emptyFunction)(res);
			responders.fire('on' + state, transport, res);
		}catch(e){
			throw new Error();
		}
		if(state === 'Complete'){
			transport.xhr.onreadystatechange = emptyFunction;
			transport.xhr = undefined;
			transport = undefined;
			
		}
	}
	function isSameOrigin(url) {
		 var m = url.match(/^\s*https?:\/\/[^\/]*/);
		 var protocol = location.protocol;
		 var domain = document.domain;
		 var port = location.port?':'+location.port:'';
		 return !m || (m[0] == prototype+'//'+domain+port);
	}
	
	function getHeader(xhr, name){
		try{
			return xhr.getResponseHeader(name)|| null;
		}catch(e){return null;}
	}
	
	//response
	function getStatusText(xhr){
		try{
			return xhr.statusText||'';
		} catch(e) {return '';}
	}
	
	function getTransport() {
		return Try.these(function() {
			return new XMLHttpRequest();
		}, function() {
			return new ActiveXObject('Msxml2.XMLHTTP');
		}, function() {
			return new ActiveXObject('Microsoft.XMLHTTP');
		}) || false;
	}
	var responders = (function (){
			var list = [];
			function add(responder) {
				if (!$_.A.include(list, responder))
					list.push(responder);
			}
			function remove(responder) {
				list = $_.A.without(list, responder);
			}
			function fire(callback, request, response) {
				$_.A.each(list, function(responder) {
					if ($_.O.isFunction(responder[callback])) {
						try {
							responder[callback].apply(responder, [ request, response]);
						} catch (e) { }
					}
			 	});
			}
			return {
				add: add,
				remove: remove,
				fire: fire
			};
	})();
	responders.add({
		onCreate: function () { activeRequestCount++},
		onComplete: function () {activeRequestCount--}
	});
	
	function request(url, options){
		options = options ||{};
		$_.O.extend(options, 
				{
					method : 'post',
					asynchronous : true,
					contentType : 'application/x-www-form-urlencoded',
					encoding : 'UTF-8',
					parameters : ''
				}, true);
		options.method = options.method.toLowerCase();
		var transport ={xhr:getTransport()}, params;
		fix(transport, options);
		
		params = $_.O.isString(options.parameters) ? options.parameters : $_.O
				.toQueryString(options.parameters);
		url = url||options.url;
		
		if(!$_.A.include(['get', 'post'], options.method)){
			params +=(params? '&':'') + '_method=' + options.method;
			options.method = 'post';
		}
		if(params && options.method ==='get'){
			url += ($_.S.include(url,'?')? '&': '?') + params;
		}
		try {
			var res = getResponse(transport);
			if(options.onCreate) onCreate(res);
			responders.fire('onCreate');
			transport.open(options.method.toUpperCase(), url, options.asynchronous);
			if(options.asynchronous)transport.respondToReadyState(1);

			transport.setRequestHeaders(options);
			var body = options.method === 'post'? params: null;
			transport.send(body);
			if (!options.asynchronous && transport.overrideMimeType)
				transport.onreadystatechange(transport.readyState);
		}catch(e){
			throw e;
		}
		
	}
	function fix(transport, options){
		$_.O.extend(transport, {
			setRequestHeaders: $_.F.curry(setRequestHeaders, transport.xhr),
			getStatus: $_.F.curry(getStatus, transport.xhr),
			getHeader: $_.F.curry(getHeader, transport.xhr),
			getStatusText: $_.F.curry(getStatusText, transport.xhr),
			status: function(){ return transport.xhr.status;},
			readyState: function() {return transport.xhr.readyState;},
			respondToReadyState: $_.F.curry(respondToReadyState, transport, options),
			responseText: function(){ return transport.xhr.responseText},
			responseXML: function(){ return transport.xhr.responseXML},
			send: function(data){transport.xhr.send(data)},
			open: function(method, url, async){transport.xhr.open(method, url, async)},
			getAllResponseHeaders: function(){ return transport.xhr.getAllResponseHeaders()},
			_complete: false
		});
		transport.xhr.onreadystatechange =  $_.F.curry(onStateChange, transport, transport.respondToReadyState);
	}
	function getResponse(transport){
		var res = {};
		var readyState = transport.readyState();
		if ((readyState > 2 && $_.Bom.browser !== 'msie') || readyState == 4) {
			res.status = transport.status();
			res.statusText = transport.getStatusText();
			res.responseText = transport.responseText();
			res.headers = $_.S.toQueryParams(transport.getAllResponseHeaders(), '\n', ':');
		}

		if (readyState == 4) {
			var xml = transport.responseXML();
			res.responseXML = xml == null ? null : xml;
		}
		return res;
		
	}
	$_.O.extend($_.Ajax, {
		getTransport: getTransport,
		request: request,
		responders: responders
	});
})(Asdf);;/**
 * Created by sungwon on 14. 10. 20.
 */
(function($_) {
    $_.Cookie = {};
    var MAX_COOKIE_LENGTH = 3950;
    var SPLIT_RE_ = /\s*;\s*/;
    var isEnabled = function() {
        return navigator.cookieEnabled;
    };
    var isValidName = function(name) {
        return !(/[;=\s]/.test(name));
    };
    var isValidValue = function(value) {
        return !(/[;\r\n]/.test(value));
    };

    var set = function(context, name, value, maxAge, path, domain, secure){
        if($_.O.isNotObject(context)||!isValidName(name)||!isValidValue(value)) throw new TypeError();
        maxAge = $_.O.isUndefined(maxAge)? -1: maxAge;
        var str = [domain?';domain='+domain:'',
            path?';path='+path:'',
            maxAge<0?'':maxAge===0?';expires='+(new Date(1970,1,1)).toUTCString():';expires='+(new Date(($_.Utils.now()+maxAge *1000))).toUTCString(),
            secure?';secure':''].join('');
        _setCookie(context, name+'='+value+str);
    };
    var _setCookie = function(context,str){
        context.cookie = str;
    };
    var get = function(context, name, defaultValue){
        if($_.O.isNotObject(context)||!isValidName(name)) throw new TypeError();
        var parts = _getParts(_getCookie(context)||'');
        var nameEq = name + '=';
        for(var i = 0; i < parts.length; i++){
            if($_.S.startsWith(parts[i], nameEq)){
                return parts[i].substr(nameEq.length);
            }
            if(parts[i]==name)
                return '';

        }
        return defaultValue;
    };
    var _getCookie = function(context){
        return context.cookie;
    };
    var remove = function(context, name, path, domain){
        var res = containsKey(context,name);
        set(context, name, '', 0, path, domain);
        return res;
    };
    var containsKey = function(context, name){
        return $_.O.isNotUndefined(get(context, name));
    };
    var keys = function(context){
        if($_.O.isNotObject(context)) throw new TypeError();
        var kv = _getKeyValues(_getCookie(context)||'');
        return $_.A.pluck(kv, '0');
    };
    var values = function(context){
        if($_.O.isNotObject(context)) throw new TypeError();
        var kv = _getKeyValues(_getCookie(context)||'');
        return $_.A.pluck(kv, '1');
    };
    var isEmpty = function(context){
        if($_.O.isNotObject(context)) throw new TypeError();
        return !_getCookie(context);
    };
    var getCount = function(context){
        if($_.O.isNotObject(context)) throw new TypeError();
        var c = _getCookie(context);
        return c?_getParts(c).length:0;
    };
    var containsValue = function(context, value){
        if($_.O.isNotObject(context)||!isValidValue(value)) throw new TypeError();
        return $_.A.contains(values(context), value);
    };
    var clear = function(context){
        if($_.O.isNotObject(context)) throw new TypeError();
        var k = keys(context);
        Asdf.A.each(k, function(v){
            remove(context, v);
        })
    };

    var _getParts = function(str){
        return str.split(SPLIT_RE_);
    };
    var _getKeyValues = function(str){
        var parts = _getParts(str);
        return $_.A.map(parts, function(v){
            var index = v.indexOf('=');
            return index ==-1?['',v]:[v.substring(0,index), v.substring(index+1)];
        });
    };

    $_.Cookie = {
        set:set,
        get:get,
        keys: keys,
        values: values,
        remove:remove,
        clear:clear,
        containsKey: containsKey,
        containsValue: containsValue,
        isEnabled:isEnabled,
        isValidName:isValidName,
        isValidValue:isValidValue,
        isEmpty:isEmpty,
        getCount:getCount
    }

})(Asdf);;(function($_) {
	var history = $_.History = {};
	var timer = null;
	var iframeWin = null;
	var hasPushState = window.history && window.history.pushState;
	var started = false;
	var currentHash = '';
	var router = null;
	
	function getHash(win){
		var match = win.location.href.match(/#(.*)$/);
		return match? match[1]:'';
	}
	function getPathname(win){
		return win.location.pathname;
	}
	function getUrl(win){
		return getPathname(win) +'#' + getHash(win);
	} 
	function start(options) {
		if(started) throw TypeError("error");
		started = true;
		router = options.router|| function() {};
		var isOldIE = $_.Bom.browser == 'msie' && $_.Bom.version <= 7;
		if(isOldIE){
			var iframe = $_.S.toElement('<iframe src="javascript:0" tabindex="-1" style="display:none">');
			$_.Element.append(document.body, iframe);
			iframeWin = iframe.contentWindow;
		}if(hasPushState) {
			$_.Event.on(window,'popstate', checkHash);
		}else if(!isOldIE){
			$_.Event.on(window,'hashchange', checkHash);
		}else {
			timer = $_.F.delay(checkHash, 0.05);
		}
	}
	function checkHash() {
		var hash = getHash(iframeWin||window);
		if(currentHash != hash){
			currentHash = hash;
			if(iframeWin)updateHash(hash);
			router(hash);
		}
		timer&&(timer = $_.F.delay(checkHash, 0.05));
	}
	function _update(hashValue, isExec){
		if(!started) throw TypeError();
		currentHash = hashValue;
		updateHash(hashValue);
		isExec&&router(hashValue);
	}
	function update(hashValue){
		_update(hashValue, true);
	}
	function push(hashValue){
		_update(hashValue, false);
	}
	function updateHash(hashValue){
		setHash(window, hashValue);
		if(iframeWin && getHash(iframeWin) != hashValue){
			iframeWin.document.open().close();
			setHash(iframeWin, hashValue);
		}
	}
	function setHash(win, hashValue){
		var url = getPathname(win) +'#'+ hashValue;
		if(hasPushState){
			win.history.pushState({}, document.title, url);
		}else{
			win.location.hash = '#' + hashValue;
		}
	}
	$_.O.extend(history, {
		start: start,
		update: update,
		push: push
	});
})(Asdf);
