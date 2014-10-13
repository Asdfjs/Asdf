/**
 * @project Asdf.js
 * @author N3735
 * @namespace Asdf.Element
 */
(function($_) {
	var nativeSlice = Array.prototype.slice, extend = $_.O.extend,
		isElement = $_.O.isElement, isString = $_.O.isString, trim = $_.S.trim;
	var tempParent = document.createElement('div');
	$_.Element = {};
	function recursivelyCollect(element, property, until) {
		var elements = [];
		while (element = element[property]) {
			if (element.nodeType == 1)
				elements.push(element);
			if (element == until)
				break;
		}
		return elements;
	}
	function recursively( element, property ) {
		do {
			element = element[ property ];
		} while ( element && element.nodeType !== 1 );
		return element;
	}
    /**
     * @memberof Asdf.Element
     * @param {element} element 대상element
     * @param {function} fun 실행 함수
     * @param {object=} context 실행 함수 context
     * @returns {element} 대상 element
     * @desc 대상element를 포함하여 자식들을 돌면서 실행 함수를 실행한다. 실행함수의 첫 번째 인자로 element가 들어간다.
     * @example
     * //element = <div>aa<div>bb</div><div>cc</div></div>
     * Asdf.Element.walk(e, Asdf.F.partial(Asdf.Element.addClass, undefined, '11'));
     * //return <div class="11">aa<div class="11">bb</div><div class="11">cc</div></div>
     */
	function walk(element, fun, context) {
		context = context || this;
		var i, childNodes = $_.A.toArray(element.childNodes);
		fun.call(context, element);
		for (i = 0; i < childNodes.length ; i++) {
			walk(childNodes[i], fun, context);
		}
		return element;
	}
    /**
     * @memberof Asdf.Element
     * @param {element} element 대상element
     * @returns {boolean} boolean
     * @desc element가 display가 none 여부를 반환한다.
     *
     */
	function visible(element){
		if(!$_.O.isNode(element))
			throw new TypeError();
		return element.style.display !='none';
	}
    /**
     * @memberof Asdf.Element
     * @param {element} element 대상element
     * @returns {element} 대상 element
     * @desc visible(element)가 true면 hide를 실행하고 false면 show를 실행한다.
     * @example
     * var div = document.createElement('div');
     * Asdf.Element.toggle(div);
     * Asdf.Element.visible(div); //return false;
     */
	function toggle(element) {
		if(!$_.O.isNode(element))
			throw new TypeError();
	    visible(element) ? hide(element) : show(element);
	    return element;
	}
    /**
     * @memberof Asdf.Element
     * @param {element} element 대상element
     * @returns {element} 대상 element
     * @desc 대상 element를 style.display를 'none'으로 변경 한다.
     * @example
     * var div = document.createElement('div');
     * Asdf.Element.hide(div);
     * Asdf.Element.visible(div); //return false;
     */
	function hide(element) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		element.style.display = 'none';
	    return element;
	}
    /**
     * @memberof Asdf.Element
     * @param {element} element 대상element
     * @returns {element} 대상 element
     * @desc 대상 element를 style.display를 ''으로 변경 한다.
     * @example
     * var div = document.createElement('div');
     * Asdf.Element.hide(div);
     * Asdf.Element.visible(div); //return false;
     * Asdf.Element.show(div);
     * Asdf.Element.visible(div); //return true;
     */
	function show(element) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		 element.style.display = '';
		 return element;
	}
    /**
     * @memberof Asdf.Element
     * @param {element} element 대상element
     * @param {string=} value element에 넣을 문자열
     * @returns {element|string} value값이 존재하면 element를 반환하고 value값이 존재 하지 않으면 text값을 반환하다.
     * @desc value가 존재 하면 element에 해당 value를 넣고 value가 존재하지 않으면 해당 element의 text값을 반환한다.
     * @example
     * var div = document.createElement('div');
     * Asdf.Element.text(div, 'hi'); //return <div>hi</div>
     * Asdf.Element.text(div); //return "hi";
     */
	function text(element, value) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		var ret = '';
		if( value == null ){
			if ( typeof element.textContent === "string" ) {
				return element.textContent;
			} else {
				walk(element, function(e) {
					var nodeType = e.nodeType;
					if( nodeType === 3 || nodeType === 4 ) {
						ret += e.nodeValue;
					}
					return false;
				});
				return ret;
			}
		}else {
			append(empty(element), (element.ownerDocument || document ).createTextNode( value ) );
            return element;
		}
	}
    /**
     * @memberof Asdf.Element
     * @param {element} element 대상element
     * @param {string=} val value값
     * @returns {element|string} value값이 존재하면 element를 반환하고 value값이 존재 하지 않으면 value값을 반환하다.
     * @desc value가 존재 하면 element.value에 해당 value를 넣고 value가 존재하지 않으면 element.valvue 값을 반환한다.
     * @example
     * var input = document.createElement('input');
     * Asdf.Element.value(input, 'hi');
     * Asdf.Element.value(input); //return "hi";
     */
	function value(element, val) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		return (val==null)? element.value : (element.value = val, element);
	}
    /**
     * @memberof Asdf.Element
     * @param {HTMLElement} element 대상element
     * @param {string=} htm html값
     * @returns {element|string} html값이 존재하면 element를 반환하고 html값이 존재 하지 않으면 innerHTML값을 반환하다.
     * @desc html가 존재 하면 element.innerHTML에 해당 html를 넣고 html가 존재하지 않으면 element.innerHTML 값을 반환한다.
     * @example
     * var div = document.createElement('div');
     * Asdf.Element.html(div, 'hi'); //return <div>hi</div>
     * Asdf.Element.html(div); //return "hi";
     */
	function html(element, htm) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		return (htm==null)? element.innerHTML: (element.innerHTML = htm, element);
	}
    /**
     * @memberof Asdf.Element
     * @param {element} element 대상element
     * @returns {element} 대상element parentNode를 반환한다.
     * @desc 대상element parentNode를 반환한다.
     * @example
     * var p = document.createElement('div');
     * var c = document.createElement('div');
     * p.appendChild(c);
     * Asdf.Element.parent(c); //return p;
     */
	function parent(element){
		if(!$_.O.isNode(element))
			throw new TypeError();
		return recursively(element, 'parentNode');
	}
    /**
     * @memberof Asdf.Element
     * @param {element} element 대상element
     * @param {element=} until 최종element
     * @returns {array} 대상element에서 최종element까지 모든 조상을 array로 반환한다.
     * @desc 대상element에서 최종element까지 모든 조상을 array로 반환한다.
     * @example
     * var pp = document.createElement('div');
     * var p = document.createElement('div');
     * var c = document.createElement('div');
     * pp.appendChild(p);
     * p.appendChild(c);
     * Asdf.Element.parents(c); //return [p, pp];
     * Asdf.Element.parents(c, p); //return [p];
     */
	function parents(element, until) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		 return recursivelyCollect(element, 'parentNode', until);
	}
    /**
     * @memberof Asdf.Element
     * @param {element} element 대상element
     * @returns {element} 대상element nextSibling 반환한다.
     * @desc 대상element nextSibling 반환한다.
     * @example
     * var p = document.createElement('div');
     * var c = document.createElement('div');
     * var nc = document.createElement('div');
     * p.appendChild(c);
     * p.appendChild(nc);
     * Asdf.Element.next(c); //return nc;
     */
	function next(element){
		if(!$_.O.isNode(element))
			throw new TypeError();
		return recursively(element, 'nextSibling');
	}
    /**
     * @memberof Asdf.Element
     * @param {element} element 대상element
     * @returns {element} 대상element previousSibling 반환한다.
     * @desc 대상element previousSibling 반환한다.
     * @example
     * var p = document.createElement('div');
     * var pc = document.createElement('div');
     * var c = document.createElement('div');
     * p.appendChild(pc);
     * p.appendChild(c);
     * Asdf.Element.prev(c); //return nc;
     */
	function prev(element){
		if(!$_.O.isNode(element))
			throw new TypeError();
		return recursively(element, 'previousSibling');
	}
    /**
     * @memberof Asdf.Element
     * @param {element} element 대상element
     * @param {element=} until 최종element
     * @returns {array} 대상element에서 최종element까지 nextSibling들을 반환한다.
     * @desc 대상element에서 최종element까지 nextSibling들을 반환한다.
     * @example
     * var p = document.createElement('div');
     * var c = document.createElement('div');
     * var nc1 = document.createElement('div');
     * var nc2 = document.createElement('div');
     * p.appendChild(c);
     * p.appendChild(nc1);
     * p.appendChild(nc2);
     * Asdf.Element.nexts(c); //return [nc1, nc2];
     */
	function nexts(element, until) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		return recursivelyCollect(element, 'nextSibling', until);
	}
    /**
     * @memberof Asdf.Element
     * @param {element} element 대상element
     * @param {element=} until 최종element
     * @returns {array} 대상element에서 최종element까지 previousSibling 반환한다.
     * @desc 대상element에서 최종element까지 previousSibling 반환한다.
     * @example
     * var p = document.createElement('div');
     * var c = document.createElement('div');
     * var pc1 = document.createElement('div');
     * var pc2 = document.createElement('div');
     * p.appendChild(pc1);
     * p.appendChild(pc2);
     * p.appendChild(c);
     * Asdf.Element.prevs(c); //return [pc2,pc1];
     */
	function prevs(element, until) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		return recursivelyCollect(element, 'previousSibling', until);
	}
    /**
     * @memberof Asdf.Element
     * @param {element} element 대상element
     * @returns {array} 본인을 제외한 형제 노드들을 반환한다.
     * @desc 본인을 제외한 형제 노드들을 반환한다.
     * @example
     * var p = document.createElement('div');
     * var c = document.createElement('div');
     * var nc = document.createElement('div');
     * var pc = document.createElement('div');
     * p.appendChild(pc);
     * p.appendChild(c);
     * p.appendChild(nc);
     * Asdf.Element.siblings(c); //return [pc,nc];
     */
	function siblings(element) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		return $_.A.without($_.A.toArray(element.parentNode.childNodes), element);
	}
    /**
     * @memberof Asdf.Element
     * @param {Element} element 대상element
     * @returns {Array} 자식 노드를 반환한다.
     * @desc 자식 노드들을 반환한다.
     * @example
     * var p = document.createElement('div');
     * var c = document.createElement('div');
     * var nc = document.createElement('div');
     * var pc = document.createElement('div');
     * var text = document.createTextNode('aa');
     * p.appendChild(text);
     * p.appendChild(pc);
     * p.appendChild(c);
     * p.appendChild(nc);
     * Asdf.Element.childNodes(p); //return [text, pc,c,nc];
     */
	function childNodes(element) {
		if(!$_.O.isNode(element))
			throw new TypeError();
        if(!element.firstChild) return []
		return Asdf.A.merge([element.firstChild],nexts(element.firstChild, 'nextSibling'));
	}
    function children(element){
        if(!$_.O.isNode(element))
            throw new TypeError();
        if($_.Bom.features.CanUseChildrenAttribute)
            return element.children;
        return $_.A.filter(element.children, $_.O.isElement);
    }
    /**
     * @memberof Asdf.Element
     * @param {element} element 대상element
     * @returns {element|elements} contents를 반환한다.
     * @desc contents를 반환한다.
     * @example
     * var p = document.createElement('div');
     * var c = document.createElement('div');
     * var nc = document.createElement('div');
     * var pc = document.createElement('div');
     * p.appendChild(text);
     * p.appendChild(pc);
     * p.appendChild(c);
     * p.appendChild(nc);
     * Asdf.Element.contents(p); //return [text, pc,c,nc];
     * var iframe = document.createElement('iframe');
     * var doc = Asdf.Element.contents(iframe);
     */
	function contents(element) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		return (element.nodeName === 'IFRAME')? (element.contentDocument||(element.contentWindow&&element.contentWindow.document)) : element.childNodes ;
	}
    /**
     * @memberof Asdf.Element
     * @param {element} element 대상element
     * @param {element} element wrapElement
     * @returns {element} wrapElement를 반환한다.
     * @desc 대상element를 wrapElement로 감싼 후 wrapElement를 반환한다.
     * @example
     * var p = document.createElement('div');
     * var c = document.createElement('div');
     * var wrap = document.createElement('div');
     * p.appendChild(c);
     * var el = Asdf.Element.wrap(c, wrap); //return wrap;
     * el.innerHTML; //'<div></div>'
     */
	function wrap(element, newContent) {
		if(!$_.O.isNode(element)||!$_.O.isNode(newContent))
			throw new TypeError();
		element.parentNode.replaceChild(newContent, element);
		newContent.appendChild(element);
		return newContent;
	}
    /**
     * @memberof Asdf.Element
     * @param {element} element 대상element
     * @returns {element} 대상 element를 반환한다.
     * @desc 대상element를 제거하고 대상 하위 element를 대상 부모 element로 이동시킨 후 대상 element를 반환한다.
     * @example
     * var p = document.createElement('div');
     * var c = document.createElement('div');
     * var wrap = document.createElement('div');
     * p.appendChild(wrap);
     * wrap.appendChild(c);
     * var el = Asdf.Element.unwrap(wrap); //return wrap;
     * p.innerHTML; //'<div></div>'
     */
	function unwrap(element) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		var bin = document.createDocumentFragment();
		var parentNode = element.parentNode;
		Asdf.A.each(childNodes(element), function(el){
            bin.appendChild(el);
        });
		parentNode.replaceChild(bin, element);
		return element;
	}

    function createDom(doc, name, attributes, children){
        if(Asdf.O.isNotDocument(doc)||Asdf.O.isNotString(name)) throw new TypeError();
        if(!Asdf.Bom.features.CanAddNameOrTypeAttributes && attributes &&(attributes.name||attributes.type)) {
            var htmlArr = ['<', name];
            attributes = Asdf.O.clone(attributes);
            if(attributes.name){
                htmlArr.push(' name="', Asdf.S.escapeHTML(attributes.name), '"');
                delete attributes['name']
            }
            if(attributes.type){
                htmlArr.push(' type="', Asdf.S.escapeHTML(attributes.type), '"');
                delete attributes['type']
            }
            htmlArr.push('>');
            name = htmlArr.join('');
        }
        var el = doc.createElement(name);
        if(attributes){
            Asdf.O.each(attributes, function(v, k){
                if(k === 'className' &&Asdf.O.isString(v)){
                    addClass(el, v);
                    return;
                }
                else if(k === 'style' && Asdf.O.isPlainObject(v)){
                    Asdf.O.each(v, function(key, value){
                        css(el, key, value);
                    });
                    return;
                }
                else{
                    attr(el, k, v);
                }
            });
        }
        children = nativeSlice.call(arguments, 3);
        Asdf.A.each(children, function(c){
            append(el, c);
        });
        return el;
    }
    function createText(doc, string){
        if(Asdf.O.isNotString(string)) throw new TypeError();
        return doc.createTextNode(string);
    }
    /**
     * @memberof Asdf.Element
     * @param {element} element 부모Element
     * @param {element} newContent 새Element
     * @returns {element} 부모Element를 반환한다.
     * @desc 부모Element에 자식으로 마지막에 새Element를 추가한다.
     * @example
     * var p = document.createElement('div');
     * var c = document.createElement('div');
     * var cs = document.createElement('span');
     * Asdf.Element.append(p, c);
     * Asdf.Element.append(p, cs);
     * p.innerHTML; //'<div></div><span></span>'
     */
	function append(element, newContent) {
		if(!$_.O.isNode(element)||!$_.O.isNode(newContent))
			throw new TypeError();
		var nodeType = element.nodeType;
		if ( nodeType === 1 || nodeType === 11 ) {
			element.appendChild( newContent );
		}
		return element;
	}
    /**
     * @memberof Asdf.Element
     * @param {element} element 부모Element
     * @param {element} newContent 새Element
     * @returns {element} 부모Element를 반환한다.
     * @desc 부모Element에 자식 첫번째로 새Element를 추가한다.
     * @example
     * var p = document.createElement('div');
     * var c = document.createElement('div');
     * var cs = document.createElement('span');
     * Asdf.Element.prepend(p, c);
     * Asdf.Element.prepend(p, cs);
     * p.innerHTML; //'<span></span><div></div>'
     */
	function prepend(element, newContent) {
		if(!$_.O.isNode(element)||!$_.O.isNode(newContent))
			throw new TypeError();
		var nodeType = element.nodeType;
		if ( nodeType === 1 || nodeType === 11 ) {
			element.insertBefore( newContent, element.firstChild );
		}
		return element;
	}
    /**
     * @memberof Asdf.Element
     * @param {element} element 기준Element
     * @param {element} newContent 새Element
     * @returns {element} 기준Element를 반환한다.
     * @desc 기준Element를 앞에 새Element를 추가한다.
     * @example
     * var p = document.createElement('div');
     * var c = document.createElement('div');
     * var cs = document.createElement('span');
     * Asdf.Element.append(p, c);
     * Asdf.Element.before(c, cs);
     * p.innerHTML; //'<span></span><div></div>'
     */
	function before(element, newContent) {
		if(!$_.O.isNode(element)||!$_.O.isNode(newContent))
			throw new TypeError();
		element.parentNode.insertBefore(newContent, element);
		return element;
	}

    /**
     * @memberof Asdf.Element
     * @param {element} element 기준Element
     * @param {element} newContent 새Element
     * @returns {element} 기준Element를 반환한다.
     * @desc 기준Element를 뒤에 새Element를 추가한다.
     * @example
     * var p = document.createElement('div');
     * var c = document.createElement('div');
     * var cs = document.createElement('span');
     * Asdf.Element.append(p, c);
     * Asdf.Element.after(c, cs);
     * p.innerHTML; //'<div></div><span></span>'
     */
	function after(element, newContent) {
		if(!$_.O.isNode(element)||!$_.O.isNode(newContent))
			throw new TypeError();
		element.parentNode.insertBefore(newContent, element.nextSibling);
		return element;		
	}
    /**
     * @memberof Asdf.Element
     * @param {element} element 대상Element
     * @returns {element} 대상Element를 반환한다.
     * @desc 대상Element를 빈Element로 만든다.
     * @example
     * var p = document.createElement('div');
     * var c = document.createElement('div');
     * Asdf.Element.append(p, c);
     * Asdf.Element.empty(p);
     * p.innerHTML; //''
     */
	function empty(element) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		element.innerHTML = '';
		return element;
	}

    /**
     * @memberof Asdf.Element
     * @param {Element} element
     */
	function remove(element) {
		if(!$_.O.isNode(element))
			throw new TypeError();
        if(element.parentNode)
		    element.parentNode.removeChild(element);
	}

    /**
     * @memberof Asdf.Element
     * @param element
     * @returns {Element|undefined}
     */
    function first(element){
        if(!$_.O.isElement(element))
          throw new TypeError();
        var c = children(element);
        return c&&c[0];
    }

    /**
     * @memberof Asdf.Element
     * @param element
     * @returns {Element|undefined}
     */
    function last(element){
        if(!$_.O.isElement(element))
            throw new TypeError();
        var c = children(element);
        return c&& c[c.length-1];
    }

    /**
     * @memberof Asdf.Element
     * @param {Element} element
     * @param {Number} n
     * @returns {Element|undefined}
     */
    function eq(element, n){
        if(!$_.O.isElement(element))
            throw new TypeError();
        var c = children(element);
        return c&& c[n];
    }

    /**
     * @memberof Asdf.Element
     * @param {Element} element
     * @param {String} name
     * @param {String=} value
     * @returns {null|Element|*}
     */
	function attr(element, name, value) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		var result, key;
		if(!name || !isString(name)){
			return null;
		}
		if(element.nodeType !== 1){
			return null;
		}
		if(value == null){
			if(name === 'value' && element.nodeName === 'INPUT' ){
				return element.value;
			}
			return (!(result = element.getAttribute(name)) && name in element) ? element[name] : result;
		}else {
			if (typeof name === 'object'){
				for (key in name)
					element.setAttribute(key, name[key]);
			}else {
				element.setAttribute(name, value);
			}
			return element;
		}
	}
	function removeAttr(element, name) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		if(element.nodeType === 1)
			element.removeAttribute(name);
		return element;
	}
	function prop(element, name, value) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		if( value == null){
			return element[name];
		} else {
			element[name] = value;
			return element;
		}
	}
	function removeProp(element, name){
		if(!$_.O.isNode(element))
			throw new TypeError();
		if(element[name])
			delete element[name];
		return element;
	}

    /**
     * @memberof Asdf.Element
     * @param {Document} doc
     * @returns {Window|false}
     */
    function getWindow(doc){
        return $_.O.isWindow(doc)?
            doc: doc.nodeType===9 ?
            doc.defaultView || doc.parentWindow : false;
    }

    /**
     * @memberof Asdf.Element
     * @param {Node} element
     * @param {Node} target
     * @returns {{left: number, top: number, height: number, width: number, right: number, bottom: number}}
     */
	function relatedOffset(element, target) {
		if(!$_.O.isNode(element)||!$_.O.isNode(target))
			throw new TypeError();
		var offsetEl = offset(element);
		var offsetTar = offset(target);
		return {left: offsetEl.left - offsetTar.left, 
				top: offsetEl.top - offsetTar.top,
				height:offsetEl.height,
				width:offsetEl.width,
				right: offsetEl.right - offsetTar.left,
				bottom: offsetEl.bottom - offsetTar.top
			};
	}

    /**
     * @memberof Asdf.Element
     * @param {Node} element
     * @returns {{height: number, width: number, top: number, bottom: number, right: number, left: number}}
     */
	function offset(element) {
		if(!$_.O.isNode(element))
			throw new TypeError();
        var doc = element.ownerDocument;
        var docElem = doc.documentElement;
        var win = getWindow(doc);
		// IE 경우 document.documentElement.scrollTop 그 외 document.body.scrollTop
		var width = 0,
			height = 0,
			rect = element.getBoundingClientRect(),
            ot = ( win.pageYOffset || docElem.scrollTop )  - ( docElem.clientTop  || 0 ),
            ol = ( win.pageXOffset || docElem.scrollLeft ) - ( docElem.clientLeft || 0 ),
			top = rect.top + ot,
			bottom = rect.bottom + ot,
			right = rect.right + ol,
			left = rect.left + ol;
		if (rect.height) {
			height = rect.height;
			width = rect.width;
		} else {
			height = element.offsetHeight || bottom - top;
			width = element.offsetWidth || right - left;
		}
		return {
			height : height,
			width : width,
			top : top,
			bottom : bottom,
			right : right,
			left : left
		};
	}

    /**
     * @memberof Asdf.Element
     * @param {Element} element
     * @returns {Element|undefined}
     */
    function offsetParent(element){
        if(!$_.O.isElement(element)) throw new TypeError();
        var res = element;
        while(res &&
            res.nodeName.toUpperCase() !== 'html' &&
            css(res, 'position') === 'static'){
            res = parent(res);
        }
        return res;
    }

    /**
     * @memberof Asdf.Element
     * @param {HTMLElement} element
     * @param {String} name
     * @returns {HTMLElement}
     */
	function addClass(element, name){
		if(!$_.O.isNode(element)||!$_.O.isString(name))
			throw new TypeError();
		var nms = name.replace(/\s+/g,' ').split(' ');
		$_.A.each(nms, function(name) {
			if(!hasClass(element, name))		
				element.className += (element.className? ' ':'') + name;
		});
		return element;
	}

    /**
     * @memberof Asdf.Element
     * @param {HTMLElement} element
     * @param {String} name
     * @returns {HTMLElement}
     */
	function removeClass(element, name) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		if(!name)
			element.className = '';
		else {
			var nms = name.replace(/\s+/g,' ').split(' ');
			$_.A.each(nms, function(name) {
				element.className = $_.S.trim(element.className.replace(new RegExp("(^|\\s+)" + name + "(\\s+|$)"), ' '));
			});
		}
		return element;
	}

    /**
     * @memberof Asdf.Element
     * @param {HTMLElement} element
     * @param {String} name
     * @returns {HTMLElement}
     */
	function toggleClass(element, name) {
		if(!$_.O.isNode(element)||!$_.O.isString(name))
			throw new TypeError();
		var nms = name.replace(/\s+/g,' ').split(' ');
		$_.A.each(nms, function(name) {
			if(hasClass(element, name)){
				return removeClass(element, name);
			}
			return addClass(element, name);
		});
		return element;
	}

    /**
     * @memberof Asdf.Element
     * @param {HTMLElement} element
     * @param {String} name
     * @returns {boolean}
     */
	function hasClass(element, name) {
		if(!$_.O.isNode(element)||!$_.O.isString(name))
			throw new TypeError();
		return element.className && new RegExp("(^|\\s)" + name + "(\\s|$)").test(element.className);
	}
	function find(element, selector, results, seed){
		if(!$_.O.isNode(element))
			throw new TypeError();
		results = results||[];
		return $_.A.toArray(querySelectorAll(element, selector)).concat(results);
	}
	function querySelectorAll(element, selector) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		if(window.Sizzle){
			return Sizzle(selector, element);
		}
		else if(element.querySelectorAll) {
			return element.querySelectorAll(selector);
		}else {
			var a=element.all, c=[], sel = selector.replace(/\[for\b/gi, '[htmlFor').split(','), i, j,s=document.createStyleSheet();
			for (i=sel.length; i--;) {
				s.addRule(sel[i], 'k:v');
				for (j=a.length; j--;) a[j].currentStyle.k && c.push(a[j]);
				s.removeRule(0);
			}
			return c;
		}
	}
	function closest(element, selector, context){
		if(!$_.O.isNode(element))
			throw new TypeError();
		while (element && !matchesSelector(element, selector))
			element = element !== context && element !== document && element.parentNode;
	    return element;
	}
	function matchesSelector(element, selector){
		if(!$_.O.isNode(element))
			throw new TypeError();
		if (!element || element.nodeType !== 1) return false
	    var mSelector = element.webkitMatchesSelector || element.mozMatchesSelector ||
	                          element.oMatchesSelector || element.matchesSelector;
	    if (mSelector) return mSelector.call(element, selector);
	    var match, parent = element.parentNode, temp = !parent;
	    if (temp) (parent = tempParent).appendChild(element);
	    match =  $_.A.indexOf( find(parent, selector), element);
	    temp && tempParent.removeChild(element);
	    return match !==-1;
	}

    /**
     * @memberof Asdf.Element
     * @param {HTMLElement} element
     * @param {String|Array} name
     * @param {String=} value
     * @returns {*}
     */
	function css(element, name, value){
		if(!$_.O.isNode(element))
			throw new TypeError();
		if(value!=null){
			var elementStyle = element.style;
			elementStyle[name] =  value;
		}else {
			var cssStyle, res;
            if (window.getComputedStyle) {
                cssStyle = window.getComputedStyle(element, null);
            } //ie
			else if (element.currentStyle) {
                cssStyle = element.currentStyle;
            } else {
				return new TypeError();
			}

			if(!name) {
                res = {};
				$_.O.each(cssStyle, function(value, key) {
                    res[key] = value == 'auto'? '': value;
                });
                return res;
			}
			else if (isString(name)) {
				return res = cssStyle[name];
			} else if($_.O.isArray(name)){
				res = {};
                $_.O.each(name, function(v){
                    res[v] = cssStyle[v] == 'auto'? '' : cssStyle[v];
                });
                return res;
			} else 
				throw new TypeError();
		}
	}

    /**
     * @memberof Asdf.Element
     * @param {node} element
     * @returns {string}
     */
	function toHTML(element){
		if(!$_.O.isNode(element))
			throw new TypeError();
		if(!element) throw new TypeError;
		var d = document.createElement('div');
		if($_.O.isNode(element))
			element = element.cloneNode(true);
		d.appendChild(element);
		return d.innerHTML;
	}

    /**
     * @memberof Asdf.Element
     * @param {Node} element
     * @returns {boolean}
     */
	function isWhitespace(element) {
		if(!$_.O.isNode(element))
			throw new TypeError();
		return $_.S.isBlank(element.innerHTML);
	}

    var data = (function(){
        var data = {};
        var id = 0;
        var prefix = 'ae';
        var getData = function (el, key, isIsolate){
            if($_.O.isNotNode(el) || $_.O.isNotString(key)) throw new TypeError();
            if(!isIsolate && (!el.aeid || !hasData(el, key))){
                var p = parent(el);
                if(!p) return;
                return getData(p, key);
            }
            return data[el.aeid] && data[el.aeid][key];
        };
        var hasData = function (el, key){
            if(!el.aeid || !data[el.aeid])
                return false;
            var d = data[el.aeid];
            return key in d && Object.prototype.hasOwnProperty.call(d, key);
        };
        var setData = function (el, key, value){
            if($_.O.isNotNode(el) || $_.O.isNotString(key)) throw new TypeError();
            if(value == null) throw new TypeError();
            if(!el.aeid)
                el.aeid = prefix+id++;
            var aeid = el.aeid;
            if(!data[aeid])
                data[aeid] = {};
            data[aeid][key] = value;
            return el;
        };
        var delData = function(el, key){
            if($_.O.isNotNode(el) || $_.O.isNotString(key)) throw new TypeError();
            if(hasData(el, key)){
                delete data[el.aeid][key];
            }
            return el
        };

        return {
            get: getData,
            set: setData,
            has: hasData,
            del: delData
        }
    })();

    function getElementsByClassName(element, className){
        if(element.querySelectorAll){
            return element.querySelectorAll('.'+className);
        }else if(element.getElementsByTagName){
            return Asdf.A.filter(element.getElementsByTagName('*'), Asdf.F.partial(hasClass, undefined, className));
        }
    }

	extend($_.Element,  {
		walk: walk,
		visible: visible,
		toggle: toggle,
		hide: hide,
		show: show,
		remove: remove,
		text: text,
		value: value,
		html: html,
		parent: parent,
		parents: parents,
		next: next,
		prev: prev,
		nexts: nexts,
		prevs: prevs,
		siblings: siblings,
        childNodes:childNodes,
		children: children,
		contents: contents,
		wrap: wrap,
		unwrap: unwrap,
		append: append,
		prepend: prepend,
		before: before,
		after: after,
		empty: empty,
        first: first,
        eq: eq,
        last:last,
		attr: attr,
		removeAttr: removeAttr,
		prop: prop,
		removeProp: removeProp,
		relatedOffset:relatedOffset,
		offset: offset,
		addClass: addClass,
		removeClass: removeClass,
		toggleClass: toggleClass,
		hasClass: hasClass,
		find: find,
		querySelectorAll: querySelectorAll,
		matchesSelector:matchesSelector,
		is: matchesSelector,
		closest:closest,
		css:css,
		toHTML: toHTML,
		isWhitespace: isWhitespace,
        createDom: createDom,
        createText: createText,
        get: data.get,
        set: data.set,
        has: data.has,
        del: data.del,
        getWindow: getWindow,
        offsetParent: offsetParent,
        getElementsByClassName:getElementsByClassName
	});
})(Asdf);