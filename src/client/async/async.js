(function($_){
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
})(Asdf);