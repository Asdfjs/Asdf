/**
 * Created by kim on 2014-06-28.
 */

module("Asdf.N");

test("Asdf.N.range", function(){
    deepEqual(Asdf.N.range(1,10), [1,2,3,4,5,6,7,8,9], '1 to 10 ok');
    deepEqual(Asdf.N.range(10), [0,1,2,3,4,5,6,7,8,9], '10 ok');
    deepEqual(Asdf.N.range(1,10, 3), [1,4,7], '1 to 10 step 3 ok');
    deepEqual(Asdf.N.range(0,10, 3), [0,3,6,9], '1 to 10 step 3 ok');
    deepEqual(Asdf.N.range(0,1,0.2), [0,0.2,0.4,0.6,0.8], '0 to 1 step 0.2 ok')
});
test("Asdf.N.clamp", function(){
    equal(Asdf.N.clamp(3,1,5), 3, 'ok');
    equal(Asdf.N.clamp(0,1,5), 1, 'ok');
    equal(Asdf.N.clamp(6,1,5), 5, 'ok');
});