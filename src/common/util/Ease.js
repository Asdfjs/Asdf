(function($_) {
    $_.Ease = {};

    function linear(t) { return t; }

    function get(amount) {
        if (amount < -1) { amount = -1; }
        if (amount > 1) { amount = 1; }
        return function(t) {
            if (amount==0) { return t; }
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
        return 1-Ease.bounceOut(1-t);
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
        if (t<0.5) return bounceIn (t*2) * .5;
        return bounceOut(t*2-1)*0.5+0.5;
    }

    function getElasticIn(amplitude,period) {
        var pi2 = Math.PI*2;
        return function(t) {
            if (t==0 || t==1) return t;
            var s = period/pi2*Math.asin(1/amplitude);
            return -(amplitude*Math.pow(2,10*(t-=1))*Math.sin((t-s)*pi2/period));
        }
    }

    function getElasticOut(amplitude,period) {
        var pi2 = Math.PI*2;
        return function(t) {
            if (t==0 || t==1) return t;
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

    });
})(Asdf);