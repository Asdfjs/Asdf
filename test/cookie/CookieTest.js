module("Asdf.Cookie", {
    setup:function(){
        Asdf.Cookie.clear(document);
    }
});

test("Asdf.Cookie.set", function(){
    Asdf.Cookie.set(document, 'a', 'aa');
    equal(Asdf.Cookie.get(document,'a'), 'aa', 'cookies set ok');
//    Asdf.Cookie.set(document, 'b', 'bb', 100, window.location.pathname, document.domain);
//    equal(Asdf.Cookie.get(document, 'b'), 'bb', 'cookie set ok pathname, domain');
//    Asdf.Cookie.set(document, 'c', 'cc', 100, window.location.pathname, document.domain, true);
//    equal(Asdf.Cookie.get(document, 'c'), undefined, 'cookie set ok secure');
});
test("Asdf.Cookie.keys", function(){
    Asdf.Cookie.set(document, 'a', 'aa');
    Asdf.Cookie.set(document, 'b', 'bb');
    Asdf.Cookie.set(document, 'c', 'cc');
    deepEqual(Asdf.Cookie.keys(document), ['a','b','c'], 'cookies key ok');
});
test("Asdf.Cookie.values", function(){
    Asdf.Cookie.set(document, 'a', 'aa');
    Asdf.Cookie.set(document, 'b', 'bb');
    Asdf.Cookie.set(document, 'c', 'cc');
    deepEqual(Asdf.Cookie.values(document), ['aa','bb','cc'], 'cookies value ok');
});
test("Asdf.Cookie.isEmpty", function(){
    Asdf.Cookie.set(document, 'a', 'aa');
    Asdf.Cookie.set(document, 'b', 'bb');
    Asdf.Cookie.set(document, 'c', 'cc');
    ok(!Asdf.Cookie.isEmpty(document), 'cookie');
    Asdf.Cookie.clear(document);
    ok(Asdf.Cookie.isEmpty(document), 'cookie');
});
test("Asdf.Cookie.containsKey", function(){
    Asdf.Cookie.set(document, 'a', 'aa');
    Asdf.Cookie.set(document, 'b', 'bb');
    Asdf.Cookie.set(document, 'c', 'cc');
    ok(Asdf.Cookie.containsKey(document, 'a'), 'cookie');
});
test("Asdf.Cookie.containsKey", function(){
    Asdf.Cookie.set(document, 'a', 'aa');
    Asdf.Cookie.set(document, 'b', 'bb');
    Asdf.Cookie.set(document, 'c', 'cc');
    ok(Asdf.Cookie.containsValue(document, 'aa'), 'cookie');
});
test("Asdf.Cookie.getCount", function(){
    Asdf.Cookie.set(document, 'a', 'aa');
    Asdf.Cookie.set(document, 'b', 'bb');
    Asdf.Cookie.set(document, 'c', 'cc');
    equal(Asdf.Cookie.getCount(document), 3, 'count');
});