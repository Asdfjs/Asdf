test("Asdf.Template.bind", function(){
	var el = document.createElement('div');
	var d = document.createElement('div');
	d.id = 'a';
	d.className = 'b';
	el.appendChild(d);
	Asdf.Template.bind(el, {'#a':1});
	equal(d.innerHTML, '1', 'template id test');
	var el1 = document.createElement('div');
	var d1 = document.createElement('div');
	d1.id = 'a';
	d1.className = 'b';
	el1.appendChild(d1);
	Asdf.Template.bind(el1, {'.b':'hello world!'});
	equal(d1.innerHTML, 'hello world!', 'template class test');
});
