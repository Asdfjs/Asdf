(function($_) {
    $_.Event = {};
    var extend = $_.O.extend, slice = Array.prototype.slice;
    var cache = {};
    var id = 1;
    function getIndex(element, eventName, handler){
        if(!element.eId || !cache[element.eId] || !cache[element.eId][eventName])
            return -1;
        var i = -1;
        var arr = cache[element.eId][eventName];
        for (i = 0; i < arr.length; i++ ){
            if(arr[i].handler == handler)
                return i;
        }
        return -1;

    }
    function getWrapedhandler(element, eventName, handler){
        var index = getIndex(element, eventName, handler);
        if(index == -1){
            return handler;
        }
        return cache[element.eId][eventName][index].wrapedhandler.pop();

    }
    function addEventListener(element, eventName, handler, filterFn) {
        var wrapedhandler = $_.F.wrap(handler,
            function(ofn, e) {
                e = e||window.event;
                e = fix(e);
                if(filterFn && !filterFn(e)) return null;
                return ofn(e);
            }
        );
        var eId;
        if (element.addEventListener) {
            element.addEventListener(eventName, wrapedhandler, false);

        }else {
            element.attachEvent("on"+ eventName, wrapedhandler);
        }
        if(!element.eId){
            element.eId = 'e'+(id++);
        }
        eId = element.eId;
        var index = getIndex(element, eventName, handler);
        if(!cache[eId]){
            cache[eId] = {};
        }
        if(!cache[eId][eventName]){
            cache[eId][eventName] = [];
        }
        if(index != -1)
            cache[eId][eventName][index].wrapedhandler.push(wrapedhandler);
        else
            cache[eId][eventName].push({handler:handler, wrapedhandler:[wrapedhandler]});

    }
    function removeEventListener(element, eventName, handler){
        if(element.removeEventListener){
            element.removeEventListener( eventName, handler, false );
        }else {
            var ieeventName = 'on'+eventName;
            if(element[ieeventName] === void 0){
                element[ieeventName] = null;
            }
            element.detachEvent( ieeventName, handler );
        }

    }
    function fix(event){
        if(!event.target){
            event.target = event.srcElement || document;
        }
        if(event.target.nodeType === 3) {
            event.target = event.target.parentNode;
        }
        event.metaKey = !!event.metaKey;
        fixEvent(event);
        event.stop = $_.F.methodize(stop);
        return fixHooks(event);
    }
    function fixEvent(event){
        if(!event.stopPropagation){
            event.stopPropagation = function() { event.cancelBubble = true; };
            event.preventDefault = function() { event.returnValue = false; };
        }
    }
    function stop(event){
        if(!event.stopPropagation){
            fixEvent(event);
        }
        event.preventDefault();
        event.stopPropagation();
    }
    function fixHooks(event){
        function keyHooks(event){
            if(!event.which) {
                event.which = event.charCode? event.charCode : event.keyCode;
            }
            return event;
        }
        function mouseHooks(event){
            var eventDoc, doc, body, button = event.button, fromElement = event.fromElement;
            if( event.pageX == null && event.clientX != null ) {
                eventDoc = event.target.ownerDocument || document;
                doc = eventDoc.documentElement;
                body = eventDoc.body;
                event.pageX = event.clientX + ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) - ( doc && doc.clientLeft || body && body.clientLeft || 0 );
                event.pageY = event.clientY + ( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) - ( doc && doc.clientTop  || body && body.clientTop  || 0 );
            }
            if ( !event.relatedTarget && fromElement ) {
                event.relatedTarget = fromElement === event.target ? event.toElement : fromElement;
            }
            if ( !event.which && button !== undefined ) {
                event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
            }
            return event;
        }
        var rkeyEvent = /^key/, rmouseEvent = /^(?:mouse|contextmenu)|click/ ;
        if ( rkeyEvent.test( event.type ) ) {
            return keyHooks(event);
        }
        if ( rmouseEvent.test( event.type ) ) {
            return mouseHooks(event);
        }
        return event;
    }
    function on(element, eventName, fn, filterFn){
        addEventListener(element, eventName, fn, filterFn);
        return element;
    }
    function once(element, eventName, fn, filterFn){
        var tfn = $_.F.wrap(fn, function(ofn){
            var arg = slice.call(arguments, 1);
            ofn.apply(this,arg);
            remove(element, eventName, tfn);
        });
        addEventListener(element, eventName, tfn, filterFn);
        return element;
    }
    function remove(element, eventName, handler) {
        var wrapedhandler = getWrapedhandler(element, eventName, handler)||handler;
        removeEventListener(element, eventName, wrapedhandler);
        return element;
    }
    function removeAll(element, eventName) {
        if(!element.eId || !cache[element.eId])
            return element;
        var events = [], i, j;
        if(eventName){
            events = $_.A.map(cache[element.eId][eventName], function(v) {
                v.eventName = eventName;
                return v;
            });
            cache[element.eId][eventName] = null;
        }else {
            $_.A.each(cache[element.eId], function(arr, key) {
                if($_.O.isArray(arr)){
                    Array.prototype.push.apply(events, $_.A.map(arr, function(value) {
                            value.eventName = key;
                            return value;}
                    ));
                }
            });
            cache[element.eId] = null;
        }
        for ( i = 0; events && i < events.length; i++){
            var e = events[i];
            for(j = 0 ; j < e.wrapedhandler.length; j++ ){
                removeEventListener(element, e.eventName, e.wrapedhandler[j]);
            }
        }
        return element;
    }
    function createEvent(name) {
        var event;
        if(document.createEvent) {
            event = document.createEvent('HTMLEvents');
            event.initEvent(name, true, true);
        }else {
            event = document.createEventObject();
        }
        return event;

    }
    function emit(element, name, data){
        if(element == document && document.createEvent && !element.dispatchEvent)
            element = document.documentElement;
        var event;

        event = createEvent(name);
        event.data = data;
        event.eventName = name;
        if(document.createEvent) {
            element.dispatchEvent(event);
        }else {
            element.fireEvent("on"+name, event);
        }
        return element;
    }
    extend($_.Event, {
        fix: fix,
        stop:stop,
        on:on,
        remove:remove,
        removeAll:removeAll,
        once: once,
        emit: emit
    });
})(Asdf);