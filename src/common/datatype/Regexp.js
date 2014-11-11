(function($_) {
    $_.R = {
        FN_DEF: /^function\s*([^\(\s]*)\s*\(\s*([^\)]*)\)\s*\{([\s\S]*)\}\s*$/m,
        FN_ARG_SPLIT: /,/,
        STRIP_COMMENTS: /(?:(?:\/\/(.*)$)|(?:\/\*([\s\S]*?)\*\/))/mg,
        FN_NATIVE: /^[^{]+\{\s*\[native \w/
    };
    $_.O.extend($_.R, {
    });
})(Asdf);