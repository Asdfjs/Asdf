/**
 * Created by kim on 2014-06-28.
 */

module("Asdf.N");

test("Asdf.N.range", function(){
    deepEqual(Asdf.N.range(1,10), [1,2,3,4,5,6,7,8,9,10], '1 to 10 ok');
    deepEqual(Asdf.N.range(10), [0,1,2,3,4,5,6,7,8,9,10], '10 ok');
    deepEqual(Asdf.N.range(1,10, 3), [1,4,7,10], '1 to 10 step 3 ok');
    deepEqual(Asdf.N.range(0,10, 3), [0,3,6,9], '1 to 10 step 3 ok');
});