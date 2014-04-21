/**
 * Created by kim on 2014-04-20.
 */
/**
 * @project Asdf.js
 * @author N3735
 * @namespace
 * @name O
 */
(function($_) {
    var o = $_.Core.namespace($_, 'O');
    var curry = $_.Core.combine.curry;
    var compose = $_.Core.behavior.compose;
    var not = curry(compose, $_.Core.op["!"]);

    function isXML(el){
        return (el.ownerDocument || el.documentElement.nodeName.toLowerCase() !== 'html');
    }
    var isNotXML = not(isXML);
    $_.O.extend(o, {
        isXML: isXML,
        isNotXML:isNotXML
    });
})(Asdf);