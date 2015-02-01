(function($_) {
    $_.Tree = {};
    function Node(data, children, parent){
        if(children&&($_.O.isNotArray(children)||$_.O.any(children, function(v){return v.constructor!==Node;})))throw new TypeError();
        if(this.constructor !== Node ) return new Node(data,children);
        children = children || [];
        this._data = data;
        this.parent = parent;
        this.children = children;

    }
    Node.prototype.find = function(fn){
        function f(arr){
            for(var i = 0; i < arr.length; i++){
                var res = arr[i].find(fn);
                if(res)
                    return res;
            }
        }
        return fn(this)?this:f(this.children)
    };
    Node.prototype.append = function(node){
        if(node.constructor !== Node) throw new TypeError();
        node.parent = this;
        this.children.push(node);
    };
    Node.prototype.next = function(){
        if(!this.parent) return null;
        var sibling = this.parent.children;
        var next = sibling[sibling.indexOf(this)+1];
        return next? next:null;
    };
    Node.prototype.prev = function(){
        if(!this.parent) return null;
        var sibling = this.parent.children;
        var next = sibling[sibling.indexOf(this)-1];
        return next? next:null;
    };
    Node.prototype.remove = function(){
        if(this.parent){
            var sibling = this.parent.children;
            sibling.splice(sibling.indexOf(this),1);
        }
        this.parent = null;

    };
    Node.prototype.data = function(value){
        if($_.O.isUndefined(value)){
            return this._data;
        }else {
            this._data = value;
        }
    };

    function dfs(tree, fn, isAll, conf){
        conf = $_.O.extend({
            children: 'children'
        },conf);
        if(!isTree(tree, conf)||$_.O.isNotFunction(fn)) throw new TypeError();
        var arr = [tree];
        var n;
        while(arr.length){
            n = arr.shift();
            if(fn(n)&&!isAll) return;
            var c = n[conf.children];
            var i = c.length;
            while(i--){
                arr.unshift(c[i]);
            }
        }
    }

    function bfs(tree, fn, isAll, conf){
        conf = $_.O.extend({
            children: 'children'
        },conf);
        if(!isTree(tree, conf)||$_.O.isNotFunction(fn)) throw new TypeError();
        var arr = [tree];
        var n;
        while(arr.length){
            n = arr.shift();
            if(fn(n)&&!isAll) return;
            var c = n[conf.children];
            var i = 0;
            while(i< c.length){
                arr.push(c[i++]);
            }
        }
    }

    function find(tree, fn, isAll, sfn, conf){
        conf = $_.O.extend({
            children: 'children'
        },conf);
        if(!isTree(tree, conf)||$_.O.isNotFunction(fn)) throw new TypeError();
        sfn = sfn||dfs;
        var res = [];
        fn = $_.F.wrap(fn, function(ofn, node){
            var r = ofn(node);
            if(r){
                if(isAll) {
                    res.push(node);
                }else {
                    res = node;
                }
            }
            return r;
        });
        sfn(tree, fn, isAll,conf);
        return res;
    }
    function isTree(tree, conf){
        conf = $_.O.extend({
            children: 'children'
        },conf);
        return !($_.O.isNotObject(tree)||$_.O.isNotCollection(tree[conf.children]));
    }
    $_.O.extend($_.Tree, {
        Node:Node,
        isTree:isTree,
        dfs:dfs,
        bfs:bfs,
        find:find
    })

})(Asdf);