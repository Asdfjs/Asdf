(function($_) {
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
