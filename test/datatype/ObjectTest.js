module("Asdf.O")
test("Asdf.O.extend", function(){
	var dObj = {a:1, b:2};
	var sObj = {b:3, c:4};
	Asdf.O.extend(dObj, sObj);
	deepEqual(dObj, {a:1,b:3,c:4}, 'deep=false, default=false');
	dObj = {a:1, b:2};
	sObj = {b:3, c:4};
	Asdf.O.extend(dObj, sObj, true);
	deepEqual(dObj, {a:1,b:2,c:4}, 'deep=false, default=true');
	dObj = {a:1, b:2};
	sObj = {b:3, c:[1,2,3]};
	Asdf.O.extend(true, dObj, sObj, true);
	sObj.c.push(4);
	deepEqual(dObj, {a:1,b:2,c:[1,2,3]}, 'deep=true, default=true');
});
test("Asdf.O.mixin", function() {
	var obj = {a:1,b:2};
	var fn = function() {};
	var mixin = {fn:fn};
	Asdf.O.mixin(obj, mixin);
	deepEqual(obj, {a:1,b:2, fn:fn}, 'mixin-ok');
});
test("Asdf.O.isPlainObject", function() {
	var obj = {};
	ok(Asdf.O.isPlainObject(obj), '{} is plainObject');
	ok(!Asdf.O.isPlainObject(window), 'window is not plainObject');
});
test("Asdf.O.isWindow", function() {
	ok(Asdf.O.isWindow(window), 'window is window');
});
test("Asdf.O.isEmptyObject", function() {
	ok(Asdf.O.isEmptyObject({}), '{} is emptyObject');
});
test("Asdf.O.isArray", function() {
	ok(Asdf.O.isArray([]), '[] is array');
	ok(!Asdf.O.isArray({}), '{} is not array');
	ok(!Asdf.O.isArray(function() {}), 'function(){} is not array');
});
test("Asdf.O.isObject", function() {
	ok(Asdf.O.isObject({}), '{} is object');
	ok(!Asdf.O.isObject(1), '1 is not object');
});
test("Asdf.O.isArguments", function() {
	ok(Asdf.O.isArguments(arguments), 'arguments is arguments');
	ok(!Asdf.O.isArguments([]), '[] is not arguments');
});
test("Asdf.O.isFunction", function() {
	ok(Asdf.O.isFunction(function(){}), 'function(){} is function');
	ok(!Asdf.O.isFunction({}), '{} is not function');
});
test("Asdf.O.isString", function() {
	ok(Asdf.O.isString('abc'), 'abc is String');
	ok(Asdf.O.isString(String('abc')), 'String("abc") is String');
	ok(Asdf.O.isString(new String('abc')), 'new String("abc") is String'); // jshint ignore:line
	ok(!Asdf.O.isString(1), '1 is not String');
});
test("Asdf.O.isNumber", function() {
	ok(Asdf.O.isNumber(1), '1 is Number');
	ok(Asdf.O.isNumber(0.1), '0.1 is Number');
	ok(!Asdf.O.isNumber("1"), '"1" is not Number');
});
test("Asdf.O.isDate", function(){
	ok(Asdf.O.isDate(new Date()), 'new Date() is Date');
});
test("Asdf.O.isRegExp", function() {
	ok(Asdf.O.isRegExp(/1/), '/1/ is Regexp');
	ok(Asdf.O.isRegExp(new RegExp(1), 'new RegExp is Regexp'));
});
test("Asdf.O.isNull", function() {
	ok(Asdf.O.isNull(null), 'null is null');
	ok(!Asdf.O.isNull(''), '"" is not null');
	ok(!Asdf.O.isNull(0), '0 is not null');
	ok(!Asdf.O.isNull(void 0), 'void 0 is not null');
});
test("Asdf.O.isUndefined", function() {
	ok(Asdf.O.isUndefined(undefined), 'undefined is undefined');
	ok(Asdf.O.isUndefined(void 0), 'void 0 is undefined');
	ok(!Asdf.O.isUndefined(null), 'null is not undefined');
});
test("Asdf.O.isCollection", function() {
	ok(Asdf.O.isCollection([]), '[] is Collection');
	ok(Asdf.O.isCollection(arguments), 'arguments is Collection');
	ok(Asdf.O.isCollection(document.getElementsByTagName('div')), 'nodeList is Collection');
	ok(!Asdf.O.isCollection({}), '{} is not Collection');
});
test("Asdf.O.keys", function() {
	var obj = {a:1, b:2, c: function() {}, d:null, e: undefined, f: [], g: {}};
	deepEqual(Asdf.O.keys(obj), ['a','b','c','d','e','f','g'], '{a:1, b:2, c: function() {}, d:null, e: undefined, f: [], g: {}} key value a,b');
});
test("Asdf.O.values", function() {
	var obj = {a:1, b:2};
	deepEqual(Asdf.O.values(obj), [1,2], '{a:1, b:2} value a,b');
});
test("Asdf.O.functions", function() {
	var obj = {a:1, b:2, c: function() {}, d:null, e: undefined, f: [], g: {}};
	deepEqual(Asdf.O.functions(obj), ['c'], '{a:1, b:2, c: function() {}, d:null, e: undefined, f: [], g: {}} function c');

});
test("Asdf.O.nulls", function() {
	var obj = {a:1, b:2, c: function() {}, d:null, e: undefined, f: [], g: {}};
	deepEqual(Asdf.O.nulls(obj), ['d'], '{a:1, b:2, c: function() {}, d:null, e: undefined, f: [], g: {}} null d');
});
test("Asdf.O.undefineds", function() {
	var obj = {a:1, b:2, c: function() {}, d:null, e: undefined, f: [], g: {}};
	deepEqual(Asdf.O.undefineds(obj), ['e'], '{a:1, b:2, c: function() {}, d:null, e: undefined, f: [], g: {}} undefined e');
});
test("Asdf.O.plainObjects", function() {
	var obj = {a:1, b:2, c: function() {}, d:null, e: undefined, f: [], g: {}};
	deepEqual(Asdf.O.plainObjects(obj), ['g'], '{a:1, b:2, c: function() {}, d:null, e: undefined, f: [], g: {}} plainObject g');
});
test("Asdf.O.arrays", function() {
	var obj = {a:1, b:2, c: function() {}, d:null, e: undefined, f: [], g: {}};
	deepEqual(Asdf.O.arrays(obj), ['f'], '{a:1, b:2, c: function() {}, d:null, e: undefined, f: [], g: {}} array c');
});
test("Asdf.O.pick", function() {
	var obj = {a:1, b:2, c: function() {}, d:null, e: undefined, f: [], g: {}};
	deepEqual(Asdf.O.pick(obj, 'a','d'), {a:1, d:null}, ' pick a,d');
});
test("Asdf.O.clone", function() {
	var obj = {a:1, b:2, c:{d:1,e:2}};
	var array = [1,2,3,4];
	deepEqual(Asdf.O.clone(obj), {a:1, b:2, c:{d:1,e:2}}, 'plainObject clone');
	deepEqual(Asdf.O.clone(array), [1,2,3,4], 'array clone');
});
test("Asdf.O.toQueryString", function() {
	var obj = {a:1, b:2, c:[1,2,3,4]};
	equal(Asdf.O.toQueryString(obj), 'a=1&b=2&c=1&c=2&c=3&c=4', '{a:1, b:2, c:[1,2,3,4] queryString() a=1&b=2&c=1&c=2&c=3&c=4');
});

test("Asdf.O.get", function() {
	var obj = {a:'aa', b:'bb'};
	equal(Asdf.O.get(obj, 'a'), 'aa','값이 있을 경우');
	equal(Asdf.O.get(obj, 'c'), null,'값이 없을 경우');
});
test("Asdf.O.pathOrElse", function(){
    equal(Asdf.O.pathOrElse({a:{b:1}},'a.b.c', 'aa'),'aa', '.으로 구분될 경우');
    equal(Asdf.O.pathOrElse({a:{b:1}},'a.b', 'aa'),'1', '.으로 구분될 경우');
    equal(Asdf.O.pathOrElse({a:{b:1}},['a','b'], 'aa'),'1', '배열 구분될 경우');
});
test("Asdf.O.remove", function(){
    var obj = {a:'aa', b:'bb'};
    Asdf.O.remove(obj, 'a');
    ok(!Asdf.O.has(obj, 'a'), 'property 삭제');
});
test("Asdf.O.getOrElse", function() {
	var obj = {a:'aa', b:'bb'};
	equal(Asdf.O.getOrElse(obj, 'a', 'cc'), 'aa','값이 있을 경우');
	equal(Asdf.O.getOrElse(obj, 'c', 'cc'), 'cc','값이 없을 경우');
});

test("Asdf.O.type", function() {
	var obj = {
		a: function(){},
		b: function(){}
	};
	var type1 = {a: Asdf.O.isFunction,
		b: Asdf.O.isFunction,
		aa: Asdf.O.isUndefined
	};
	var type2 = {a: Asdf.O.isUndefined,
		b: Asdf.O.isUndefined	
	};
	ok(Asdf.O.type(obj, type1), '덕타입 테스트');
	ok(!Asdf.O.type(obj, type2), '덕타입 실패 테스트');
});

test("Asdf.O.equals", function(){
    ok(Asdf.O.equals('aa', 'aa'), 'string ok');
    ok(Asdf.O.equals(1,1), 'number ok');
    ok(Asdf.O.equals([1,2],[1,2]), 'array ok');
    ok(Asdf.O.equals([1,[2,3]],[1,[2,3]]), 'deep Array ok');
    ok(Asdf.O.equals({a:1, b:2}, {a:1, b:2}), 'object ok');
    ok(Asdf.O.equals({a:1, b:2, c:[1,2], d:{aa:'a',bb:'b'}}, {a:1, b:2, c:[1,2], d:{aa:'a',bb:'b'}}), 'complex ok');
    ok(Asdf.O.equals(/aa/, /aa/), 'regexp ok');
    ok(Asdf.O.equals(new Date(),new Date() ), 'date ok');
    ok(Asdf.O.equals(true, true), 'boolean ok');
});
test("Asdf.O.tap", function(){
    Asdf.O.tap({a:1}, function(o){
        deepEqual(o, {a:1}, 'tap ok')
    });
});
test("Asdf.O.prototypedCopy", function(){
    var obj = {a:1, b:2};
    var po = Asdf.O.prototypedCopy(obj);
    console.log(po);
    deepEqual(obj, po, 'prototypedCopy');
});