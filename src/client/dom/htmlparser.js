(function($_) {
    var htmlPartsRegex = /<(?:(?:\/([^>]+)>)|(?:!--([\S|\s]*?)-->)|(?:([^\/\s>]+)((?:\s+[\w\-:.]+(?:\s*=\s*?(?:(?:"[^"]*")|(?:'[^']*')|[^\s"'\/>]+))?)*)[\S\s]*?(\/?)>))/g;
    var attribsRegex = /([\w\-:.]+)(?:(?:\s*=\s*(?:(?:"([^"]*)")|(?:'([^']*)')|([^\s>]+)))|(?=\s|$))/g;
    var dtd = $_.Dtd.getDtd('html5');
    function makeMap(str){
        var obj = {};
        $_.A.each(str.split(","), function(v){
            obj[v] = true;
        });
        return obj;
    }
    function _tokenizer(html, callback){
        var emptyAttr = dtd.$boolAttr;
        var cd = dtd.$cdata;
        var cdata;
        var lastIndex=0;
        html.replace(htmlPartsRegex, function(){
            var args = $_.A.toArray(arguments);
            var p = args.splice(0,6);
            var index = args.shift();
            var tagName;
            if(lastIndex<index){
                var text = html.substring(lastIndex, index);
                if( cdata )
                    cdata.push(text);
                else{
                    callback('text',text);
                }
            }
            lastIndex = index+ p[0].length;
            if((tagName = p[1])){
                tagName = tagName.toLowerCase();
                if(cdata && cd[tagName]){
                    callback('cdata', cdata.join(''));
                    cdata = null;
                }

                if(!cdata){
                    callback('close', tagName);
                    return;
                }
            }

            if(cdata){
                cdata.push(p[0]);
                return;
            }
            if((tagName = p[3])){
                tagName = tagName.toLowerCase();
                var attrs = {}, ap = p[4], selfClosing = !!p[5];
                if(ap){
                    ap.replace(attribsRegex, function(m){
                        var am = $_.A.toArray(arguments);
                        var name = am[1].toLowerCase();
                        var value = am[2]||am[3]||am[4]||'';
                        if(!value||emptyAttr[name])
                            attrs[name] = name;
                        else
                            attrs[name] = value;
                    });
                }
                callback('open', tagName, attrs, selfClosing);
                if(!cdata && cd[tagName])
                    cdata = [];
                return;
            }
            if((tagName = p[2])) {
                callback('comment', tagName);
                return;
            }
            if(html.length > lastIndex)
                callback('text', html.substring(lastIndex, html.length))
        });
    }

    var tokenizer = $_.F.memoize(function(html){
        var res = [];
        _tokenizer(html, function(){
            res.push($_.A.toArray(arguments));
        });
        return res;
    });
    $_.htmlParser={tokenizer :tokenizer}
})(Asdf);