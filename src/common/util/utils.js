(function($_) {
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
        var res = fn(Array.prototype.slice.call(arguments, 1));
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
        if( !console.group ){
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
            var error
            var arg = Array.prototype.slice.call(arguments, 0);
            var time = Date.now();
            time = Date.now()- time;
            groupStart(desc + 'function ' + fndef.name + '('+ fndef.arguments.join(',') +')'+'{');
            print('arguments : ', arg);
            print('stack: ', stack);
            try{
                var value = fn.apply(this, arg);
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
	$_.O.extend(o, {
		makeuid : makeuid,
		parseJson : parseJson,
        time:time,
        spy: spy,
        trace:trace
	});
})(Asdf);