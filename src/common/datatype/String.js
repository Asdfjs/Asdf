/**
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
	function trim(str, removestr) {
		if(!$_.O.isString(str)) throw new TypeError();
		return rtrim(ltrim(str, removestr), removestr);
	}

	function ltrim(str, removestr){
		if(!$_.O.isString(str)) throw new TypeError();
		var re = (removestr != null)? new RegExp('^'+toRegExp(removestr)+'+'):/^\s+/;
		return str.replace(re, '');
	}

	function rtrim(str, removestr){
		if(!$_.O.isString(str)) throw new TypeError();
		var re = (removestr != null)? new RegExp(toRegExp(removestr)+'+$'):/\s+$/;
		return str.replace(re, '');
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
        return '(?:'+str.replace(/([\\^$()+*.[\]])/g, '\\$1')+')';
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

	function lambda(str){
		if($_.O.isNotString(str)) throw new TypeError();
		var expr = str.match(/^[(\s]*([^()]*?)[)\s]*=>(.*)/);
		if(!expr) throw new TypeError();
		var body = trim(expr[2]);
		var isBlock = /\{.*\}/.test(body);
		return new Function(expr[1], (isBlock?"":"return ") + body);
	}

	function translate(str, obj){
		$_.O.each(obj, function(v,k){
			var re = new RegExp(toRegExp(k), 'g');
			str = str.replace(re,v);
		});
		return str;
	}

	function wildcard(pattern, str){
		if($_.O.isNotString(pattern)||$_.O.isNotString(str)) throw new TypeError();
		function match(pp, sp){
			while(sp < str.length){
				if(matchHere(pp,sp)) return true;
				sp++;
			}
			return false;
		}
		function matchHere(pp, sp){
			while(sp < str.length){
				if(pattern[pp]==='?'|| pattern[pp] === str[sp]){
					pp++;
					sp++;
					continue;
				}else if(pattern[pp] === '*'){
					if(pattern[pp+1]=== undefined)
						return true;
					else {
						return match(pp+1,sp);
					}
				}
				return false;
			}
			return /^\**$/.test(pattern.substring(pp));
		}
		return matchHere(0,0);
	}

    $_.O.extend(o, {
		truncate: truncate,
		trim: trim,
		ltrim:ltrim,
		rtrim:rtrim,
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
        split:split,
		lambda:lambda,
		translate:translate,
		wildcard:wildcard
	});
})(Asdf);
