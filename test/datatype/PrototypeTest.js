module("Asdf.P");
test("Asdf.P.mix", function(){
	var fn = function() {};
	var obj1 = {a:function(a){return a+2;}};
	var obj2 = {a:function(a){return a*2;}};
	Asdf.P.mix(fn, obj1);
	Asdf.P.mix(fn, obj2);
	var o = new fn();
	equal(o.a(2), 8, 'ok');
    var e = Asdf.Base.getDefaultConstructor();
    Asdf.P.mix(e, Asdf.C.Events.mixin);
    var a = e();
    var b = e();
    a.on('aa', function(){});
    notEqual(a._events, b._events, 'array is not Equals both instances');
});