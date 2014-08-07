/**
 * Created by sungwon on 14. 8. 7.
 */
module("Asdf.Color");

test("Asdf.Color.parse", function(){
    equal(Asdf.Color.parse('red').toString(), '#ff0000', 'red is #ff0000');
    equal(Asdf.Color.parse('rgb(255,0,0)').toString(), '#ff0000', 'rgb(255,0,0) is #ff0000');
    equal(Asdf.Color.parse('rgb(100%,0%,0%)').toString(), '#ff0000', 'rgb(100%,0%,0%) is #ff0000');
    equal(Asdf.Color.parse('#ff0000').toString(), '#ff0000', '#ff0000 is #ff0000');
    equal(Asdf.Color.parse('#f00').toString(), '#ff0000', '#f00is #ff0000');
});