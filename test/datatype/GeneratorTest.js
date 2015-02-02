/**
 * Created by sungwon on 15. 2. 1..
 */
module('Asdf.Gen');
test('Asdf.Gen.toGenerator', function(){
    var g = Asdf.Gen.toGenerator([1,2,3]);
    var i = 1;
    Asdf.Gen.consumer(g, function(v){
        equal(v, i++, 'toGenerator');
    });
});
test('Asdf.Gen.map', function(){
    var g = Asdf.Gen.toGenerator([1,2,3]);
    var gm = Asdf.Gen.map(g, function(v){return v*2});
    var i = 1;
    Asdf.Gen.consumer(gm, function(v){
        equal(v, 2*i++, 'map');
    });
});
test('Asdf.Gen.filter', function(){
    var g = Asdf.Gen.toGenerator([1,2,3]);
    var gf = Asdf.Gen.filter(g, function(v){return v%2});
    equal(gf().value, 1, 'filter');
    equal(gf().value, 3, 'filter');
});
test('Asdf.Gen.drop', function(){
    var g = Asdf.Gen.toGenerator([1,2,3]);
    var gd = Asdf.Gen.drop(g, 1);
    equal(gd().value, 2, 'drop');
});
test('Asdf.Gen.reduce', function(){
    var g = Asdf.Gen.toGenerator([1,2,3]);
    var gr = Asdf.Gen.reduce(g, function(a,b){return a+b;}, 0);
    equal(gr().value, 1, 'reduce');
    equal(gr().value, 3, 'reduce');
    equal(gr().value, 6, 'reduce');
});
test('Asdf.Gen.treeToGenerator', function(){
    var root = Asdf.Tree.Node(0);
    var n1 = Asdf.Tree.Node(1);
    var n2 = Asdf.Tree.Node(2);
    root.append(n1);
    root.append(n2);
    var g = Asdf.Gen.treeToGenerator(root);
    equal(g().value, root, 'treeToGenerator');
    equal(g().value, n1, 'treeToGenerator');
    equal(g().value, n2, 'treeToGenerator');
});