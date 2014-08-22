module("Asdf.Scale");

test("Asdf.Scale.linear", function(){
    var scaleNumber = Asdf.F.curry(Asdf.Scale.linear, [0,1], [0,100]);

    equal(scaleNumber(0), 0, 'scale 0 is 0');
    equal(scaleNumber(0.5), 50, 'scale 0.5 is 50');
    equal(scaleNumber(1), 100, 'scale, 1 is 100');

    var scaleArray = Asdf.F.curry(Asdf.Scale.linear, [0,1], [[0,0,0], [10,100,1000]]);

    deepEqual(scaleArray(0.5), [5,50,500], 'array ok');

    var scaleRGB = Asdf.F.curry(Asdf.Scale.linear, [0,1],[Asdf.Color.parse('#000'), Asdf.Color.parse('#fff')]);
    equal(scaleRGB(0.5).toString(), '#7f7f7f', 'rgb ok');

    var scaleObject = Asdf.F.curry(Asdf.Scale.linear, [0,1], [{left: 0, top:0, backgroundColor:Asdf.Color.parse('#000')},{left:100, top:200, backgroundColor:Asdf.Color.parse('#fff')}]);
    var res = scaleObject(0.5);
    res.backgroundColor = res.backgroundColor.toString();

    deepEqual(res, {left:50, top:100, backgroundColor:'#7f7f7f'}, 'object ok')
});