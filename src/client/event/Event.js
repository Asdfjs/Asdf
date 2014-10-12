(function($_) {
    $_.Event = {};
    var extend = $_.O.extend, slice = Array.prototype.slice;
    var id = 1;
    var prefix = 'f';

    function getWrapedhandler(element, eventName, handler){
        var event = Asdf.Element.get(element, '_event', true)||{};
        var farr;
        if(handler._fid && (farr = Asdf.O.path(event,[eventName, handler._fid]))){
            return farr.pop();
        }else{
            return handler;
        }
    }

    function makeid(){
        return prefix+(id++);
    }

    function addEventListener(element, eventName, handler) {
        if (element.addEventListener) {
            element.addEventListener(eventName, handler, false);

        }else {
            element.attachEvent("on" + eventName, handler);
        }
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

    function on(element, eventName, handler, filterFn){
        var wrapedhandler = $_.F.wrap(handler,
            function(ofn, e) {
                e = e||window.event;
                e = fix(e);
                return Asdf.F.before(ofn,filterFn||Asdf.F.toFunction(true), true)(e);
            }
        );
        var _fid = makeid();
        handler._fid = _fid;
        addEventListener(element, eventName, wrapedhandler);
        var event = Asdf.Element.get(element, '_event', true)||{};
        if(!event[eventName])
            event[eventName] = {};
        if(!event[eventName][_fid])
            event[eventName][_fid] = [];
        event[eventName][_fid].push(wrapedhandler);
        Asdf.Element.set(element, '_event', event);
        return element;
    }

    function once(element, eventName, fn, filterFn){
        var tfn = $_.F.wrap(fn, function(ofn){
            var arg = slice.call(arguments, 1);
            ofn.apply(this,arg);
            remove(element, eventName, tfn);
        });
        on(element, eventName, tfn, filterFn);
        return element;
    }

    function remove(element, eventName, handler) {
        var wrapedhandler = getWrapedhandler(element, eventName, handler);
        removeEventListener(element, eventName, wrapedhandler);
        return element;
    }

    function removeAll(element, eventName) {
        var event;
        if(!(event = Asdf.Element.get(element, '_event', true)))
            return element;
        var removeEvents = [];
        if(eventName){
            $_.O.each(event[eventName], function(v) {
                v.eventName = eventName;
                removeEvents.push(v);
            });
            event[eventName] = null;
        }else {
            $_.O.each(event, function(ev, key) {
                $_.O.each(ev, function(v){
                    v.eventName = key;
                    removeEvents.push(v);
                });
            });
            Asdf.Element.del(element, '_event');
        }
        Asdf.A.each(removeEvents, function(v){
            Asdf.A.each(v, function(fn){
                removeEventListener(element, v.eventName, fn);
            });
        });
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