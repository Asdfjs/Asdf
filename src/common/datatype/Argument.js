(function($_) {
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
})(Asdf);