(function($_){
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
            return $_.O.isObject(a) && $_.O.isObject(b);
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

    function linear(x, domain, range){
        return interpolate(uninterpolate(x,domain[0],domain[1]), range[0], range[1]);
    }

    function scale(fn, domain, range, n){
        domain = domain || [0,1];
        range = range || [0,1];
        return fn(n, domain, range);
    }
    var scaleLinear = $_.F.partial(scale, linear, undefined, undefined, undefined );
    var scaleLog = $_.F.partial(scale, function(x, domain, range){return linear(Math.log(x)/Math.log(10), [domain[0]/Math.log(10),domain[1]/Math.log(10)], range);}, undefined, undefined, undefined);
    var scalePow = $_.F.partial(scale, function(x, domain, range){return linear(Math.pow(10,x), [Math.pow(10,domain[0]),Math.pow(10,domain[1])], range);}, undefined, undefined, undefined);
    var scaleSqrt = $_.F.partial(scale, function(x, domain, range){return linear(Math.pow(0.5,x), [Math.pow(0.5,domain[0]),Math.pow(0.5,domain[1])], range);}, undefined, undefined, undefined);
    $_.O.extend($_.Scale, {
        scale:scale,
        scaleLinear:scaleLinear,
        scaleLog:scaleLog,
        scalePow:scalePow,
        scaleSqrt:scaleSqrt
    });
})(Asdf);