module("Asdf.A")
test("Asdf.A.batch", function(){
	function not(t) {
		return !t;
	}
	var arr = Asdf.A.batch([true, false, true], [not, not, not]);
	deepEqual(arr, [false, true, false], 'batch ok');
});
test("Asdf.A.toArguments", function() {
	var arr = [1,2,3];
	deepEqual(Asdf.A.toArguments(arr, Asdf.Arg.toArray), [1,2,3], 'toArguments ok');
});
test("Asdf.A.concat", function(){
    var a1 = [1,2,3];
    var a2 = [4,5,6];
    deepEqual(Asdf.A.concat(a1,a2), [1,2,3,4,5,6], 'concat ok');
});
test("Asdf.A.count", function(){
    var a = [1,2,3,4,5,6,7];
    equal(Asdf.A.count(a, function(v){return v>3;}), 4, 'count ok');
});
test("Asdf.A.repeat", function(){
    var fn = Asdf.Core.behavior.iterate(Asdf.Core.op.inc, 0);
    deepEqual(Asdf.A.repeat(fn, 10), [0,1,2,3,4,5,6,7,8,9], 'repeat fn ok');
    deepEqual(Asdf.A.repeat(fn, 10, 0), [0,0,0,0,0,0,0,0,0,0], 'repeat fn with arg ok');
});
test("Asdf.A.rotate", function(){
    var arr = [1,2,3,4,5];
    deepEqual(Asdf.A.rotate(arr, 2), [4,5,1,2,3], '2 rotate ok');
    arr = [1,2,3,4,5];
    deepEqual(Asdf.A.rotate(arr, -2), [3,4,5,1,2], '-2 rotate ok');
});
test("Asdf.A.groupBy", function(){
    deepEqual(Asdf.A.groupBy([1.3,2.1,2.4], function(num){
        return Math.floor(num);
    }), {1:[1.3],2:[2.1,2.4]}, 'groupBy ok');
});
test("Asdf.A.each", function(){
    var arr = [1,2,3];
    var res = [];
    Asdf.A.each(arr, function(v){
        res.push(v*2);
    });
    deepEqual(res, [2,4,6], 'each ok');
});
test("Asdf.A.map", function(){
    deepEqual(Asdf.A.map([1,2,3,4,5], function(n, index){ return n+1 }), [2,3,4,5,6], 'map ok')
});
test("Asdf.A.reduce", function(){
    equal(Asdf.A.reduce([1,2,3], function(a,b){ return a+b; }, 0), 6, 'reduce ok');
});
test("Asdf.A.reduceRight", function(){
    equal(Asdf.A.reduceRight([-1,-2,-3], function(a,b){ return a-b; }, 4), 10, 'reduceRight ok');
});
test("Asdf.A.merge", function(){
    var a1 = [1,2,3];
    var a2 = [4,5,6];
    equal(Asdf.A.merge(a1,a2), a1, 'merge ok');
});
test("Asdf.A.get", function(){
    equal(Asdf.A.get([1,2,3],0), 1, 'get ok');
});
test("Asdf.A.first", function(){
    equal(Asdf.A.first([1,2,3]), 1,'first ok');
});
test("Asdf.A.last", function(){
    equal(Asdf.A.last([1,2,3]), 3, 'last ok');
});
test("Asdf.A.filter", function(){
    deepEqual(Asdf.A.filter([1, 2, 3, 4, 5, 6], function(n, index){return n > 3; }), [4,5,6], 'filter ok');
});
test("Asdf.A.reject", function(){
    deepEqual(Asdf.A.reject([1, 2, 3, 4, 5, 6], function(n, index){return n > 3; }), [1,2,3], 'reject ok');
});
test("Asdf.A.every", function(){
    equal(Asdf.A.every([1, 2, 3, 4, 5, 6], function(n, index){return n > 3; }), false, 'every ok')
});
test("Asdf.A.any", function(){
    equal(Asdf.A.any([1, 2, 3, 4, 5, 6], function(n, index){return n > 3; }), true, 'any ok');
});
test("Asdf.A.include", function(){
    equal(Asdf.A.include([1, 2, 3, 4, 5, 6], 1), true, 'include ok');
});
test("Asdf.A.invoke", function(){
    deepEqual(Asdf.A.invoke([[3,1,2],['c','b','a']], 'sort'), [[1,2,3],['a','b','c']], 'method ok');
    deepEqual(Asdf.A.invoke([[1,2,3],[3,4,5]], function(){return Asdf.A.get(this, 0)}), [1,3], 'function ok');
});
test("Asdf.A.pluck", function(){
    deepEqual(Asdf.A.pluck([[1, 2, 3, 4, 5, 6], [1,2,3]], 'length'), [6,3], 'pluck ok');
});
test("Asdf.A.max", function(){
    equal(Asdf.A.max([1, 2, 3, 4, 5, 6], function(v){ return -v;}), 1, 'max ok');
});
test("Asdf.A.min", function(){
    equal(Asdf.A.min([1, 2, 3, 4, 5, 6], function(v){ return -v;}),6, 'min ok');
});
test("Asdf.A.sort", function(){
    deepEqual(Asdf.A.sort([2,1,3]), [1,2,3], 'sort ok');
});
test("Asdf.A.sortBy", function(){
    deepEqual(Asdf.A.sortBy([[3,1],[4],[2,6,3]], 'length'),[[4],[3,1],[2,6,3]], 'key ok');
    deepEqual(Asdf.A.sortBy([[3,1],[4],[2,6,3]], function(){return this[0]}), [[2,6,3],[3,1],[4]], 'function ok');
});
test("Asdf.A.bisectLeft", function(){
    equal(Asdf.A.bisectLeft([10, 20, 30, 40, 50], 30),2, 'bisectLeft ok');
});
test("Asdf.A.bisectRight", function(){
    equal(Asdf.A.bisectRight([10, 20, 30, 40, 50], 30),3, 'bisectRight ok');
});