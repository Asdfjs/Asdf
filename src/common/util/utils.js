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
				return (new Function("return " + jsonString))();
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
        var res = fn.apply(null, (Array.prototype.slice.call(arguments, 1)));
        var endTime = timer();
        if(endTime == startTime)
            endTime = timer();
        console.log(endTime - startTime);
        return res;
    }
	$_.O.extend(o, {
		makeuid : makeuid,
		parseJson : parseJson,
        time:time
	});
})(Asdf);