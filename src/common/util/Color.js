/**
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
        return '#'+$_.A.map([this.r,this.g,this.b], function (value) {return $_.S.lpad((value|0).toString(16),"0",2);}).join("")
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

    $_.O.extend($_.Color, {
        RGB:RGB,
        HSL:HSL,
        HSV:HSV,
        rgbToHsl : rgbToHsl,
        hslToRgb : hslToRgb,
        rgbToHsv : rgbToHsv,
        hsvToRgb : hsvToRgb,
        parse:parse
    });
})(Asdf);