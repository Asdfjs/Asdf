/**
 * Created by sungwon on 2015-01-08.
 */
( function($_) {
    var extend = $_.O.extend;
    function substract( source, removed ) {
        var clone = $_.O.clone( source );
        removed = Array.prototype.slice.call(arguments, 1);
        $_.A.each(removed, function(r){
           $_.O.each(r, function(v){
               delete clone[v];
           })
        });
        return clone
    }
    function makeMap(arr){
        var obj = {};
        $_.A.each(arr, function(v){
            obj[v] = true;
        });
        return obj;
    }
    var globalAttribute = ("id,accesskey,class,dir,lang,style,tabindex,title").split(',');
    var eventAttribute = ("onabort,onblur,oncancel,oncanplay,oncanplaythrough,onchange,onclick,onclose,oncontextmenu,oncuechange," +
    "ondblclick,ondrag,ondragend,ondragenter,ondragleave,ondragover,ondragstart,ondrop,ondurationchange,onemptied,onended," +
    "onerror,onfocus,oninput,oninvalid,onkeydown,onkeypress,onkeyup,onload,onloadeddata,onloadedmetadata,onloadstart," +
    "onmousedown,onmousemove,onmouseout,onmouseover,onmouseup,onmousewheel,onpause,onplay,onplaying,onprogress,onratechange," +
    "onreset,onscroll,onseeked,onseeking,onseeking,onselect,onshow,onstalled,onsubmit,onsuspend,ontimeupdate,onvolumechange," +
    "onwaiting").split(',');

    var phrasingContent = (
    "a,abbr,b,bdo,br,button,cite,code,del,dfn,em,embed,i,iframe,img,input,ins,kbd," +
    "label,map,noscript,object,q,s,samp,script,select,small,span,strong,sub,sup," +
    "textarea,u,var,#text,#comment"
    ).split(',');

    var blockContent = ("address,blockquote,div,dl,fieldset,form,h1,h2,h3,h4,h5,h6,hr,menu,ol,p,pre,table,ul").split(',');

    var phrasingContentHtml5 =  ("audio,canvas,command,datalist,mark,meter,output,progress,time,wbr,video,ruby,bdi,keygen").split(',');

    var globalAttributesHtml5 = ("contenteditable,contextmenu,draggable,dropzone,hidden,spellcheck,translate").split(',');

    var blockContentHtml5 = ("article aside details dialog figure header footer hgroup section nav").split(',');

    var phrasingContentHtml4 = ("acronym,applet,basefont,big,font,strike,tt").split(',');

    var blockContentHtml4 = ("center,dir,isindex,noframes").split(',');

    var globalAttributesNotHtml5Strict = ["xml:lang"];

    var meta = ("command,link,meta,noscript,script,style").split(',');

    var empty = [];

    /**
     * @param {String} type html4, html5, html-strict
     * @return {Object} dtd
     */
    function _complieDtd(type){
        var clone = $_.O.clone;
        var merge = $_.A.merge;
        var concat = $_.A.concat;
        var diff = $_.A.difference;
        var dtd = {}, attr = clone(globalAttribute), b = clone(blockContent), p = clone(phrasingContent), f;

        /**
         * @param name {String|Array}
         * @param a {Array}
         * @param c {Array}
         */
        function add(name, a, c){
            if($_.O.isArray(name)){
                $_.A.each(name, function(n){
                    add(n, a, c);
                });
                return
            }
            if(dtd[name]){
                merge(dtd[name].attrs,a);
                merge(dtd[name].children,c);
            }
            else {
                dtd[name] = {
                    attrs: concat(attr, a),
                    children: clone(c)
                }
            }
        }

        if(type !== 'html4'){
            merge(attr, globalAttributesHtml5);
            merge(b, blockContentHtml5);
            merge(p, phrasingContentHtml5);
        }
        if(type !== 'html5-strict'){
            merge(attr, globalAttributesNotHtml5Strict);
            merge(p, phrasingContentHtml4);
            merge(b, blockContentHtml4);
        }

        f = concat(p, b);

        add("html", ["manifest"], ("head,body").split(','));
        add("head", [], ("base,command,link,meta,noscript,script,style,title").split(','));
        add("title", [], empty);
        add("hr,noscript,br".split(','),[], empty);
        add("base", "href,target".split(','), empty);
        add("link", "href,rel,media,hreflang,type,sizes,hreflang".split(','), empty);
        add("meta", "name,http-equiv,content,charset".split(','),empty);
        add("style", "media,type,scoped".split(','),empty);
        add("script", "src,async,defer,type,charset".split(','),empty);
        add("body", ("onafterprint,onbeforeprint,onbeforeunload,onblur,onerror,onfocus " +
        "onhashchange,onload,onmessage,onoffline,ononline,onpagehide,onpageshow " +
        "onpopstate,onresize,onscroll,onstorage,onunload").split(','), f);
        add("address,dt,dd,div,caption".split(','), [], f);
        add("caption", [], diff(f, ['table']));
        add("h1,h2,h3,h4,h5,h6,pre,p,abbr,code,var,samp,kbd,sub,sup,i,b,u,bdo,span,legend,em,strong,small,s,cite".split(','), [], p);
        add('dfn', [], diff(p,['dfn']));
        add("blockquote", "cite", f);
        add("ol", "reversed,start,type".split(','), ["li"]);
        add("ul", [], ["li"]);
        add("li", ["value"], f);
        add("dl", [], "dt,dd".split(','));
        add("a", "href,target,rel,media,hreflang,type".split(','), diff(p, ['a']));
        add("q", ["cite"], p);
        add("ins,del".split(','), "cite,datetime".split(','), f);
        add("img", "src,srcset,alt,usemap,ismap,width,height".split(','), empty);
        add("iframe", "src,name,width,height".split(','), f);
        add("embed", "src,type,width,height".split(','),empty);
        add("object", "data,type,typemustmatch,name,usemap,form,width,height".split(','), concat(f, ["param"]));
        add("param", "name,value".split(','),empty);
        add("map", ["name"], concat(f, ["area"]));
        add("area", "alt,coords,shape,href,target,rel,media,hreflang,type".split(','),empty);
        add("table", ["border"], ("caption,colgroup,thead,tfoot,tbody,tr" + (type == "html4" ? " col" : "")).split(','));
        add("colgroup", ["span"], ["col"]);
        add("col", ["span"],empty);
        add("tbody,thead,tfoot".split(','), [], ["tr"]);
        add("tr", [], "td,th".split(','));
        add("td", "colspan,rowspan,headers".split(','), f);
        add("th", "colspan,rowspan,headers,scope,abbr".split(','), f);
        add("form", "accept-charset,action,autocomplete,enctype,method,name,novalidate,target".split(','), diff(f,['form']));
        add("fieldset", "disabled,form,name".split(','), concat(f, ["legend"]));
        add("label", "form,for".split(','), p);
        add("input", ("accept,alt,autocomplete,checked,dirname,disabled,form,formaction,formenctype,formmethod,formnovalidate " +
            "formtarget,height,list,max,maxlength,min,multiple,name,pattern,readonly,required,size,src,step,type,value,width").split(','),empty);
        add("button", "disabled,form,formaction,formenctype,formmethod,formnovalidate,formtarget,name,type,value".split(','),
            type == "html4" ? f : p);
        add("select", "disabled,form,multiple,name,required,size".split(','), "option,optgroup".split(','));
        add("optgroup", "disabled,label".split(','), ["option"]);
        add("option", "disabled,label,selected,value".split(','),empty);
        add("textarea", "cols,dirname,disabled,form,maxlength,name,readonly,required,rows,wrap".split(','),empty);
        add("menu", "type,label".split(','), concat(f, ["li"]));
        add("noscript", [], f);
        if(type!=='html4'){
            add("wbr",[],empty);
            add("ruby", [], concat(p, "rt,rp".split(',')));
            add("figcaption", [], f);
            add("mark,rt,rp,summary,bdi".split(','), [], p);
            add("canvas", "width,height".split(','), f);
            add("video", ("src,crossorigin,poster,preload,autoplay,mediagroup,loop " +
            "muted,controls,width,height,buffered").split(','), concat(f, "track,source".split(',')));
            add("audio", "src,crossorigin,preload,autoplay,mediagroup,loop,muted,controls,buffered,volume".split(','), concat(f, "track,source".split(',')));
            add("picture", [], "img,source".split(','));
            add("source", "src,srcset,type,media,sizes".split(','), empty);
            add("track", "kind,src,srclang,label,default".split(','), empty);
            add("datalist", [], concat(p, "option"));
            add("article,section,nav,aside,header,footer".split(','), [], f);
            add("hgroup", [], "h1,h2,h3,h4,h5,h6".split(','));
            add("figure", [], concat(f, "figcaption".split(',')));
            add("time", ["datetime"], p);
            add("dialog", ["open"], f);
            add("command", "type,label,icon,disabled,checked,radiogroup,command".split(','),empty);
            add("output", "for,form,name".split(','), p);
            add("progress", "value,max".split(','), diff(p, ['progress']));
            add("meter", "value,min,max,low,high,optimum".split(','), diff(p,'meter'));
            add("details", ["open"], concat(f, "summary"));
            add("keygen", "autofocus,challenge,disabled,form,keytype,name".split(','), empty);
            add("input,button,select,textarea".split(','), ["autofocus"], []);
            add("input,textarea".split(','), ["placeholder"], []);
            add("a", ["download"], []);
            add("link,script,img".split(','), ["crossorigin"],[]);
            add("iframe", "sandbox,seamless,allowfullscreen".split(','), []);
        }
        if(type !== "html5-strict"){
            $_.A.each(phrasingContentHtml4, function(n){
                add(n, [], p);
            });
            $_.A.each(blockContentHtml4, function(n){
                add(n, [], f);
            });
            add("script", ["language,xml:space"],[]);
            add("style", ["xml:space"],[]);
            add("object", "declare,classid,code,codebase,codetype,archive,standby,align,border,hspace,vspace".split(','),[]);
            add("embed", "align,name,hspace,vspace".split(','),[]);
            add("param", "valuetype,type".split(','),[]);
            add("a", "charset,name,rev,shape,coords".split(','),[]);
            add("br", ["clear"],[]);
            add("applet", "codebase,archive,code,object,alt,name,width,height,align,hspace,vspace".split(','),[]);
            add("img", "name,longdesc,align,border,hspace,vspace".split(','),[]);
            add("iframe", "longdesc,frameborder,marginwidth,marginheight,scrolling,align".split(','),[]);
            add("font,basefont".split(','), "size,color,face".split(','),[]);
            add("input", "usemap,align".split(','),[]);
            add("select", ["onchange"],[]);
            add("h1,h2,h3,h4,h5,h6,div,p,legend,caption".split(','), ["align"],[]);
            add("ul", "type,compact".split(','), []);
            add("li", ["type"], []);
            add("ol,dl,menu,dir".split(','), ["compact"],[]);
            add("pre", "width,xml:space".split(','),[]);
            add("hr", "align,noshade,size,width".split(','),[]);
            add("isindex", ["prompt"],[]);
            add("table", "summary,width,frame,rules,cellspacing,cellpadding,align,bgcolor".split(','),[]);
            add("col", "width,align,char,charoff,valign".split(','),[]);
            add("colgroup", "width,align,char,charoff,valign".split(','),[]);
            add("thead", "align,char,charoff,valign".split(','),[]);
            add("tr", "align,char,charoff,valign,bgcolor".split(','),[]);
            add("th", "axis,align,char,charoff,valign,nowrap,bgcolor,width,height".split(','),[]);
            add("form", ["accept"],[]);
            add("td", "abbr,axis,scope,align,char,charoff,valign,nowrap,bgcolor,width,height".split(','),[]);
            add("tfoot", "align,char,charoff,valign".split(','),[]);
            add("tbody", "align,char,charoff,valign".split(','),[]);
            add("area", ["nohref"],[]);
            add("body", "background,bgcolor,text,link,vlink,alink".split(','),[]);
        }
        if(type!== 'html4'){
            add("input,button,select,textarea".split(','), ["autofocus"],[]);
            add("input,textarea".split(','), ["placeholder"],[]);
            add("a", ["download"],[]);
            add("link,script,img".split(','), ["crossorigin"],[]);
            add("iframe", "sandbox,seamless,allowfullscreen".split(','),[]);
        }
        extend(dtd, {
            $block: makeMap(b),
            $cdata: makeMap(['script', 'style']),
            $empty: makeMap("area,base,basefont,br,col,command,dialog,embed,hr,img,input,isindex,keygen,link,meta,param,source,track,wbr".split(',')),
            $inline: makeMap(p),
            $list: makeMap("dl,ol,ul".split(',')),
            $noBodyContent: makeMap(concat('body,head,html'.split(','),dtd.head.children)),
            $object: makeMap("applet,audio,button,hr,iframe,img,input,object,select,table,textarea,video".split(',')),
            $tabIndex: makeMap("a,area,button,input,object,select,textarea".split(',')),
            $tableContent: makeMap("caption,col,colgroup,tbody,td,tfoot,th,thead,tr".split(',')),
            $transparent: makeMap("a,audio,canvas,del,ins,map,noscript,object,video".split(',')),
            $intermediate: makeMap("caption,colgroup,dd,dt,figcaption,legend,li,optgroup,option,rp,rt,summary,tbody,td,tfoot,th,thead,tr".split(',')),
            $boolAttrMap: makeMap(('checked,compact,declare,defer,disabled,ismap,multiple,nohref,noresize,' +
            'noshade,nowrap,readonly,selected,autoplay,loop,controls').split(',')),
            $textBlock: makeMap(('h1,h2,h3,h4,h5,h6,p,div,address,pre,form,' +
            'blockquote,center,dir,fieldset,header,footer,article,section,hgroup,aside,nav,figure').split(',')),
            $textInline: makeMap(('span,strong,b,em,i,font,strike,u,var,cite,' +
            'dfn,code,mark,q,sup,sub,samp').split(','))
        });
        return dtd;
    }
    var getDtd = $_.F.memoize($_.F.compose(_complieDtd, function(obj){
        $_.O.each(obj, function(v,k){
            if($_.S.startsWith(k, '$')) return;
            v.attrs = makeMap(v.attrs);
            v.children = makeMap(v.children);
        });
        return obj;
    }));
    Asdf.Dtd = {
        getDtd: getDtd
        }

} )(Asdf);

