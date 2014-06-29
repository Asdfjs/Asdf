/**
 * @project Asdf.js
 * @author N3735
 * @namespace
 * @name Asdf.S
 */
(function($_) {
    var o = $_.Core.namespace($_, 'S');

	/**
	 * @memberof Asdf.S
	 * @param {string} str 대상 문자열
	 * @returns {Node} 대상 문자열을 node로 변경한다.
	 * @desc 대상 문자열을 node로 변경한다.
	 * @example
	 * Asdf.S.toElement('<div id='abc'>abc</div> '); // return <div id='abc'>abc</div>;
	 *
	 */
	function toElement(str){
		if(!$_.O.isString(str)) throw new TypeError();
		var el = document.createElement('div');
		el.innerHTML = str;
		return el.firstChild;
	}
	
	/**
	 * @memberof Asdf.S
	 * @param {string} str 대상 문자열
	 * @returns {DocumentFragment} 대상 문자열을 element로 변경 한 후 그 element를 documentFragment에 넣어서 반환한다.
	 * @desc 대상 문자열을 element로 변경 한 후 그 element를 documentFragment에 넣어서 반환한다.
	 * 
	 */
	function toDocumentFragment(str) {
		if(!$_.O.isString(str)) throw new TypeError();
		var el = document.createElement('div'), frg = document.createDocumentFragment();
		el.innerHTML = str;
		while(el.childNodes.length) frg.appendChild(el.childNodes[0]);
		return frg;	
	}
	

	$_.O.extend(o, {
		toDocumentFragment:toDocumentFragment,
		toElement: toElement
	});
})(Asdf);
