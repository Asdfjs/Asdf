(function($_) {
    var htmlPartsRegex = /<(?:(?:\/([^>]+)>)|(?:!--([\S|\s]*?)-->)|(?:([^\/\s>]+)((?:\s+[\w\-:.]+(?:\s*=\s*?(?:(?:"[^"]*")|(?:'[^']*')|[^\s"'\/>]+))?)*)[\S\s]*?(\/?)>))/g;
    var attribsRegex = /([\w\-:.]+)(?:(?:\s*=\s*(?:(?:"([^"]*)")|(?:'([^']*)')|([^\s>]+)))|(?=\s|$))/g;
    var emptyAttribs = makeMap('checked,compact,declare,defer,disabled,ismap,multiple,nohref,noresize,noshade,nowrap,readonly,selected');
    function makeMap(str){
        var obj = {};
        $_.A.each(str.split(","), function(v){
            obj[v] = true;
        });
        return obj;
    }
    function parser(html){
        var p, tagName, cdata;
        var nextIndex = htmlPartsRegex.lastIndex = 0;
        while(p = htmlPartsRegex.exec(html)){
            var index = p.index;
            if(index > nextIndex){
                var text = html.substring(nextIndex, index);
                if( cdata )
                    cdata.push(text)
                //onText(text);
            }
            nextIndex = htmlPartsRegex.lastIndex;
            if((tagName = p[1])){
                tagName = tagName.toLowerCase();
            }
        }

    }
})(Asdf);