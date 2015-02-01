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
                if(/="/.test(tagName)) return;
                var attrs = {}, ap = p[4], selfClosing = !!p[5]||dtd.$empty[tagName];
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
    function vaildate(str){

    }
    function parser(str){
        var Node = $_.Tree.Node;
        var ts = tokenizer(str);
        var status =1;// 1:open, 0:close
        var parentNode = new Node({root:true});
        var stack = [parentNode];
        $_.A.each(ts, function(t){
            var pNode = stack[stack.length-1];
            if(t[0] === 'open'){
                var node = new Node({tagName:t[1],attrs:t[2], type:'element'});
                if(!t[3]) {
                    status = 1;
                    stack.push(node);
                }
                pNode.append(node);
            }else if(t[0] === 'close'){
                stack.pop();
                status = 0;
            }else if(t[0] === 'text'){
                pNode.append(new Node({text:t[1], type:'text'}));
            }else if(t[0] === 'comment'){
                pNode.append(new Node({text:t[1], type:'comment'}));
            }else {
                pNode.append(new Node({text:t[1], type:'cdata'}));
            }
        });
        if(stack.length !== 1) throw new Error();
        return stack[0];
    }

    $_.htmlParser={tokenizer :tokenizer,parser:parser}
})(Asdf);