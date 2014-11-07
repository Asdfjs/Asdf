(function($_) {
    $_.R = {
        FN_DEF: /^function\s*([^\(\s]*)\s*\(\s*([^\)]*)\)\s*\{([\s\S]*)\}\s*$/m,
        FN_ARG_SPLIT: /,/,
        STRIP_COMMENTS: /(?:(?:\/\/(.*)$)|(?:\/\*([\s\S]*?)\*\/))/mg
    };
    $_.O.extend($_.R, {
    });
})(Asdf);