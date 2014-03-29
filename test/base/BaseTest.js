module("Asdf.Base");
test("Asdf.Base.getDefaultConstructor", function(){
    var f = Asdf.Base.getDefaultConstructor();
    equal(f().constructor, (new f()).constructor, 'new 없이 생성한 경우');
});