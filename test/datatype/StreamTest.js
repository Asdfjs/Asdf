module('Asdf.Stream');

test("Asdf.Stream.get", function(){
    var a = Asdf.Stream.make([0], function(v){if(v<100)return v+1; return null});
    equal(Asdf.Stream.get(a,0), 0, 'ok');
    equal(Asdf.Stream.get(a,1), 1, 'ok');
    equal(Asdf.Stream.get(a,0), 0, 'ok');
    equal(Asdf.Stream.get(a,10), 10, 'ok');
    Asdf.Stream.get(a,200);
    equal(a.length, 101, 'ok');
});
test("Asdf.Stream.filter", function(){
    var a = Asdf.Stream.make([0], function(v){if(v<100)return v+1; return null});
    var b = Asdf.Stream.filter(a, function(v){return !(v%2)});
    equal(Asdf.Stream.get(b,1), 2, 'ok');
    equal(Asdf.Stream.get(b,2), 4, 'ok');
    var c = Asdf.Stream.filter(b, function(v){return !(v%3)});
    equal(Asdf.Stream.get(c,1), 6, 'ok');
    equal(Asdf.Stream.get(c,2), 12, 'ok');
    var d = Asdf.Stream.filter(c, function(v){return !(v%4)},[0,1]);
    equal(Asdf.Stream.get(d,0), 0, 'ok');
    equal(Asdf.Stream.get(d,1), 1, 'ok');
    equal(Asdf.Stream.get(d,3), 12, 'ok');
});

test("Asdf.Stream.map", function(){
    var a = Asdf.Stream.make([0], function(v){if(v<100)return v+1; return null});
    var b = Asdf.Stream.map(a, function(v){return v*v});
    equal(Asdf.Stream.get(b, 2), 4, 'ok');
    equal(Asdf.Stream.get(b, 3), 9, 'ok');
    var c = Asdf.Stream.map(b, function(v){return v-1}, [5,1]);
    equal(Asdf.Stream.get(c, 0), 5, 'ok');
    equal(Asdf.Stream.get(c, 5), 8, 'ok');
});