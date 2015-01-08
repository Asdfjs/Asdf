/**
 * Created by sungwon on 2015-01-08.
 */
( function($_) {
    var dtd;
    $_.Element.dtd = dtd = {};

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

    // Phrasing elements.
    // P = { a: 1, em: 1, strong: 1, small: 1, abbr: 1, dfn: 1, i: 1, b: 1, s: 1,
    //		u: 1, code: 1, 'var': 1, samp: 1, kbd: 1, sup: 1, sub: 1, q: 1, cite: 1,
    //		span: 1, bdo: 1, bdi: 1, br: 1, wbr: 1, ins: 1, del: 1, img: 1, embed: 1,
    //		object: 1, iframe: 1, map: 1, area: 1, script: 1, noscript: 1, ruby: 1,
    //		video: 1, audio: 1, input: 1, textarea: 1, select: 1, button: 1, label: 1,
    //		output: 1, keygen: 1, progress: 1, command: 1, canvas: 1, time: 1,
    //		meter: 1, detalist: 1 },

    // Flow elements.
    // F = { a: 1, p: 1, hr: 1, pre: 1, ul: 1, ol: 1, dl: 1, div: 1, h1: 1, h2: 1,
    //		h3: 1, h4: 1, h5: 1, h6: 1, hgroup: 1, address: 1, blockquote: 1, ins: 1,
    //		del: 1, object: 1, map: 1, noscript: 1, section: 1, nav: 1, article: 1,
    //		aside: 1, header: 1, footer: 1, video: 1, audio: 1, figure: 1, table: 1,
    //		form: 1, fieldset: 1, menu: 1, canvas: 1, details:1 },

    // Text can be everywhere.
    // X( P, T );
    // Flow elements set consists of phrasing elements set.
    // X( F, P );

    var phrase = ('a,em,strong,small,abbr,dfn,i,b,s,u,code,var,samp,kbd,sup,sub,q,cite1,span,bdo,bdi,br,wbr,' +
        'ins,del,img,embed,object,iframe,map,area,script,noscript,ruby,video,audio,input,textarea,select,' +
        'button,label,output,keygen,progress,command,canvas,time,meter,detalist').split(',');
    var flow = ('a,p,hr,pre,ul,ol,dl,div,h1,h2,h3,h4,h5,h6,hgroup,address,blockquote,ins,del,object,map,' +
        'noscript,section,nav,article,aside,header,footer,video,audio,figure,table,form,fieldset,menu,' +
        'canvas,details').split(',');

    var P = {}, F = {},
    // Intersection of flow elements set and phrasing elements set.
        PF = {
            a: 1, abbr: 1, area: 1, audio: 1, b: 1, bdi: 1, bdo: 1, br: 1, button: 1, canvas: 1, cite: 1,
            code: 1, command: 1, datalist: 1, del: 1, dfn: 1, em: 1, embed: 1, i: 1, iframe: 1, img: 1,
            input: 1, ins: 1, kbd: 1, keygen: 1, label: 1, map: 1, mark: 1, meter: 1, noscript: 1, object: 1,
            output: 1, progress: 1, q: 1, ruby: 1, s: 1, samp: 1, script: 1, select: 1, small: 1, span: 1,
            strong: 1, sub: 1, sup: 1, textarea: 1, time: 1, u: 1, 'var': 1, video: 1, wbr: 1
        },
    // F - PF (Flow Only).
        FO = {
            address: 1, article: 1, aside: 1, blockquote: 1, details: 1, div: 1, dl: 1, fieldset: 1,
            figure: 1, footer: 1, form: 1, h1: 1, h2: 1, h3: 1, h4: 1, h5: 1, h6: 1, header: 1, hgroup: 1,
            hr: 1, main: 1, menu: 1, nav: 1, ol: 1, p: 1, pre: 1, section: 1, table: 1, ul: 1
        },
    // Metadata elements.
        M = { command: 1, link: 1, meta: 1, noscript: 1, script: 1, style: 1 },
    // Empty.
        E = {},
    // Text.
        T = { '#': 1 },

    // Deprecated phrasing elements.
        DP = { acronym: 1, applet: 1, basefont: 1, big: 1, font: 1, isindex: 1, strike: 1, style: 1, tt: 1 }, // TODO remove "style".
    // Deprecated flow only elements.
        DFO = { center: 1, dir: 1, noframes: 1 };

    // Phrasing elements := PF + T + DP
    extend( P, PF, T, DP );
    // Flow elements := FO + P + DFO
    extend( F, FO, P, DFO );

    extend(dtd, {
        a: substract( P, { a: 1, button: 1 } ), // Treat as normal inline element (not a transparent one).
        abbr: P,
        address: F,
        area: E,
        article: F,
        aside: F,
        audio: extend( { source: 1, track: 1 }, F ),
        b: P,
        base: E,
        bdi: P,
        bdo: P,
        blockquote: F,
        body: F,
        br: E,
        button: substract( P, { a: 1, button: 1 } ),
        canvas: P, // Treat as normal inline element (not a transparent one).
        caption: F,
        cite: P,
        code: P,
        col: E,
        colgroup: { col: 1 },
        command: E,
        datalist: extend( { option: 1 }, P ),
        dd: F,
        del: P, // Treat as normal inline element (not a transparent one).
        details: extend( { summary: 1 }, F ),
        dfn: P,
        div: F,
        dl: { dt: 1, dd: 1 },
        dt: F,
        em: P,
        embed: E,
        fieldset: extend( { legend: 1 }, F ),
        figcaption: F,
        figure: extend( { figcaption: 1 }, F ),
        footer: F,
        form: F,
        h1: P,
        h2: P,
        h3: P,
        h4: P,
        h5: P,
        h6: P,
        head: extend( { title: 1, base: 1 }, M ),
        header: F,
        hgroup: { h1: 1, h2: 1, h3: 1, h4: 1, h5: 1, h6: 1 },
        hr: E,
        html: extend( { head: 1, body: 1 }, F, M ), // Head and body are optional...
        i: P,
        iframe: T,
        img: E,
        input: E,
        ins: P, // Treat as normal inline element (not a transparent one).
        kbd: P,
        keygen: E,
        label: P,
        legend: P,
        li: F,
        link: E,
        // Can't be a descendant of article, aside, footer, header, nav, but we don't need this
        // complication. As well as checking if it's used only once.
        main: F,
        map: F,
        mark: P, // Treat as normal inline element (not a transparent one).
        menu: extend( { li: 1 }, F ),
        meta: E,
        meter: substract( P, { meter: 1 } ),
        nav: F,
        noscript: extend( { link: 1, meta: 1, style: 1 }, P ), // Treat as normal inline element (not a transparent one).
        object: extend( { param: 1 }, P ), // Treat as normal inline element (not a transparent one).
        ol: { li: 1 },
        optgroup: { option: 1 },
        option: T,
        output: P,
        p: P,
        param: E,
        pre: P,
        progress: substract( P, { progress: 1 } ),
        q: P,
        rp: P,
        rt: P,
        ruby: extend( { rp: 1, rt: 1 }, P ),
        s: P,
        samp: P,
        script: T,
        section: F,
        select: { optgroup: 1, option: 1 },
        small: P,
        source: E,
        span: P,
        strong: P,
        style: T,
        sub: P,
        summary: P,
        sup: P,
        table: { caption: 1, colgroup: 1, thead: 1, tfoot: 1, tbody: 1, tr: 1 },
        tbody: { tr: 1 },
        td: F,
        textarea: T,
        tfoot: { tr: 1 },
        th: F,
        thead: { tr: 1 },
        time: substract( P, { time: 1 } ),
        title: T,
        tr: { th: 1, td: 1 },
        track: E,
        u: P,
        ul: { li: 1 },
        'var': P,
        video: extend( { source: 1, track: 1 }, F ),
        wbr: E,

        // Deprecated tags.
        acronym: P,
        applet: extend( { param: 1 }, F ),
        basefont: E,
        big: P,
        center: F,
        dialog: E,
        dir: { li: 1 },
        font: P,
        isindex: E,
        noframes: F,
        strike: P,
        tt: P
    });

    extend( dtd, {
        /**
         * List of block elements, like `<p>` or `<div>`.
         */
        $block: extend( { audio: 1, dd: 1, dt: 1, figcaption: 1, li: 1, video: 1 }, FO, DFO ),

        /**
         * List of elements that contain other blocks, in which block-level operations should be limited,
         * this property is not intended to be checked directly, use {@link CKEDITOR.dom.elementPath#blockLimit} instead.
         *
         * Some examples of editor behaviors that are impacted by block limits:
         *
         * * Enter key never split a block-limit element;
         * * Style application is constraint by the block limit of the current selection.
         * * Pasted html will be inserted into the block limit of the current selection.
         *
         * **Note:** As an exception `<li>` is not considered as a block limit, as it's generally used as a text block.
         */
        $blockLimit: {
            article: 1, aside: 1, audio: 1, body: 1, caption: 1, details: 1, dir: 1, div: 1, dl: 1,
            fieldset: 1, figcaption: 1, figure: 1, footer: 1, form: 1, header: 1, hgroup: 1, main: 1, menu: 1, nav: 1,
            ol: 1, section: 1, table: 1, td: 1, th: 1, tr: 1, ul: 1, video: 1
        },

        /**
         * List of elements that contain character data.
         */
        $cdata: { script: 1, style: 1 },

        /**
         * List of elements that are accepted as inline editing hosts.
         */
        $editable: {
            address: 1, article: 1, aside: 1, blockquote: 1, body: 1, details: 1, div: 1, fieldset: 1,
            figcaption: 1, footer: 1, form: 1, h1: 1, h2: 1, h3: 1, h4: 1, h5: 1, h6: 1, header: 1, hgroup: 1,
            main: 1, nav: 1, p: 1, pre: 1, section: 1
        },

        /**
         * List of empty (self-closing) elements, like `<br>` or `<img>`.
         */
        $empty: {
            area: 1, base: 1, basefont: 1, br: 1, col: 1, command: 1, dialog: 1, embed: 1, hr: 1, img: 1,
            input: 1, isindex: 1, keygen: 1, link: 1, meta: 1, param: 1, source: 1, track: 1, wbr: 1
        },

        /**
         * List of inline (`<span>` like) elements.
         */
        $inline: P,

        /**
         * List of list root elements.
         */
        $list: { dl: 1, ol: 1, ul: 1 },

        /**
         * List of list item elements, like `<li>` or `<dd>`.
         */
        $listItem: { dd: 1, dt: 1, li: 1 },

        /**
         * List of elements which may live outside body.
         */
        $nonBodyContent: extend( { body: 1, head: 1, html: 1 }, dtd.head ),

        /**
         * Elements that accept text nodes, but are not possible to edit into the browser.
         */
        $nonEditable: {
            applet: 1, audio: 1, button: 1, embed: 1, iframe: 1, map: 1, object: 1, option: 1,
            param: 1, script: 1, textarea: 1, video: 1
        },

        /**
         * Elements that are considered objects, therefore selected as a whole in the editor.
         */
        $object: {
            applet: 1, audio: 1, button: 1, hr: 1, iframe: 1, img: 1, input: 1, object: 1, select: 1,
            table: 1, textarea: 1, video: 1
        },

        /**
         * List of elements that can be ignored if empty, like `<b>` or `<span>`.
         */
        $removeEmpty: {
            abbr: 1, acronym: 1, b: 1, bdi: 1, bdo: 1, big: 1, cite: 1, code: 1, del: 1, dfn: 1,
            em: 1, font: 1, i: 1, ins: 1, label: 1, kbd: 1, mark: 1, meter: 1, output: 1, q: 1, ruby: 1, s: 1,
            samp: 1, small: 1, span: 1, strike: 1, strong: 1, sub: 1, sup: 1, time: 1, tt: 1, u: 1, 'var': 1
        },

        /**
         * List of elements that have tabindex set to zero by default.
         */
        $tabIndex: { a: 1, area: 1, button: 1, input: 1, object: 1, select: 1, textarea: 1 },

        /**
         * List of elements used inside the `<table>` element, like `<tbody>` or `<td>`.
         */
        $tableContent: { caption: 1, col: 1, colgroup: 1, tbody: 1, td: 1, tfoot: 1, th: 1, thead: 1, tr: 1 },

        /**
         * List of "transparent" elements. See [W3C's definition of "transparent" element](http://dev.w3.org/html5/markup/terminology.html#transparent).
         */
        $transparent: { a: 1, audio: 1, canvas: 1, del: 1, ins: 1, map: 1, noscript: 1, object: 1, video: 1 },

        /**
         * List of elements that are not to exist standalone that must live under it's parent element.
         */
        $intermediate: {
            caption: 1, colgroup: 1, dd: 1, dt: 1, figcaption: 1, legend: 1, li: 1, optgroup: 1,
            option: 1, rp: 1, rt: 1, summary: 1, tbody: 1, td: 1, tfoot: 1, th: 1, thead: 1, tr: 1
        }
    } );

    return dtd;
} )(Asdf);

