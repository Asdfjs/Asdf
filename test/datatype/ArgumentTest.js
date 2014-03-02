/**
 * Created by kim on 14. 3. 1.
 */
module("Asdf.Arg");
test("Asdf.Arg.relocate", function(){
    var f = Asdf.Arg.relocate([1,0], function(a,b){
        return a/b;
    });
    equal(f(1,2), 2, 'relocate ok');
});
test("Asdf.Arg.transfer", function(){
    var f = Asdf.Arg.transfer([function(a){return a+1},function(b){return b+1}], function(a,b){
            return a*b;
        });
    equal(f(1,2), 6, 'transfer ok');
});
