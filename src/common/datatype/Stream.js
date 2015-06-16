(function($_) {
    /**
     * @namespace
     * @name Asdf.Stream
     */
    $_.Stream = {};

    function stream(initArr, fn){
        initArr = Array.prototype.slice.call(initArr||[],0);
        initArr._fn = fn;
        return initArr;
    }
    function streamRef(arr, i){
        if(arr[i])return arr[i];
        if(!arr._fn)return null;
        while(arr._fn&&arr.length<=i){
            var res = arr._fn(arr[arr.length-1], arr);
            if(res=== null){
                arr._fn = null;
                return null;
            }
            else arr[arr.length] = res;
        }
        return (arr.length<=i)?null:arr[i];
    }
    function streamFilter(arr, fn, initArr){
        var i = 0;
        return stream(initArr||[], function(){
            var res;
            do{
                res = streamRef(arr, i++);
            }while(res&&!fn(res));
            return res;
        })
    }
    function streamMap(arr, fn, initArr){
        var i = 0;
        return stream(initArr||[], function(){
            return fn(streamRef(arr, i++));
        })
    }
    function streamEach(arr, fn){
        var i = 0, res;
        while((res = streamRef(arr,i++))!== null)
            fn(res, i-1, arr);
    }

    $_.O.extend($_.Stream, {
        make: stream,
        get: streamRef,
        filter: streamFilter,
        map: streamMap,
        each:streamEach
    });
})(Asdf);