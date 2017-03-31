/*
 * pyjs.js
 * A js toolkit for PyJs
 * @author demixcn@gmail.com
 */


(function(ns){
    
    var BUILD = '##build##';
    var COMBO_URL = "##combo_url##";
    var VERSION = '##version##';
    var isIE = /*@cc_on!@*/false;
    
    var page_modules = {};
    var dependencies = {};
    
    var deepSearch = function(arr , value){
        var result = false;
        for( var i=0 , l=arr.length ; i<l ; i++  ){
            var sa = arr[i];
            if( sa instanceof Array ){
                result = deepSearch(sa , value);
            }else{
                if( sa == value ){
                    result = true;
                }
            }
            if(result){
                return result;
            }
        }
        return result;
    };
    
    
    var getXHR = function(){
        if (window.ActiveXObject) {
            try {
                return new ActiveXObject("Msxml2.XMLHTTP");
            } catch (e) {
                try {
                    return new ActiveXObject("Microsoft.XMLHTTP");
                } catch (e) {}
            }
        }
        if (window.XMLHttpRequest) {
            return new XMLHttpRequest();
        }
    };
    
    var getScript = function(url , cb){
        var xhr = getXHR();
        xhr.open('GET' , url , false);
        
        xhr.send();
        if(xhr.readyState == 4 && xhr.status == 200){
            eval(xhr.responseText);
        }
    };
    
    var getXdScript = function(src, cb){
        var scrElement;
        var scrElements = document.getElementsByTagName('script');
        if( scrElements ){
            scrElement = document.createElement('script');

            scrElement.onload = scrElement.onreadystatechange = function(){
                var readyState = scrElement.readyState;
                if ('undefined' == typeof readyState
                    || readyState == "loaded"
                    || readyState == "complete") {
                    try {
                        cb && cb();
                    } finally {
                        scrElement.onload = scrElement.onreadystatechange = null;
                    }
                }                
            };

            scrElement.async = true;
            scrElement.src = src;
            scrElement.charset = 'utf-8';
            scrElements[0].parentNode.appendChild(scrElement);
        }
        
    };
    
    
    var prefetchScript = function(urls , cb){
        var current_deps = [].slice.call(urls);
        urls = [].slice.call(urls);
        var callback = function(url){
            if( current_deps.indexOf(url) != -1 ){
                current_deps.splice(current_deps.indexOf(url) , 1);
            }
            if(current_deps.length == 0){
                cb && cb();
            }
        };

        for( var i=0,l=urls.length; i<l; i++ ){
            var elTrigger = null;
            if (isIE) {
                elTrigger = new Image();
                elTrigger.onload = (function(url , elTrigger){
                    return function(){
                        callback(url);
                        elTrigger.onload = null;
                        elTrigger = null;
                    };
                })(urls[i] , elTrigger);
                elTrigger.src = urls[i];
                return;
            }
            elTrigger = document.createElement('object');
            elTrigger.data = urls[i]; 
            
            elTrigger.width  = 0;
            elTrigger.height = 0;
            
            elTrigger.onload = (function(url , elTrigger){
                return function(){
                    callback(url);
                    elTrigger.onload = null;
                    elTrigger.parentNode.removeChild(elTrigger);
                    elTrigger = null;
                };
            })(urls[i] , elTrigger);
            
            document.body.appendChild(elTrigger);
        }
    };

    var getBuildFile = function(md , cb){
        var deps = getDependence(md);
        if( COMBO_URL.length ){//有combo的情况
            for( var i =0, l= deps.length ; i<l ; i++ ){
                deps[i] = VERSION + '/' + deps[i] + '.js';
            }
            var js = deps.join('&');
            getXdScript( COMBO_URL + js  , function(){
                cb && cb();
            });
        }else{
            for( var i =0, l= deps.length ; i<l ; i++ ){
                deps[i] = '%#js_url#%'  + deps[i] + '.js';
            }
            
            var getAllScript = function(){
                if( deps.length ){
                    var url = deps.shift();
                    getXdScript(url , function(){
                        getAllScript();
                    });
                }else{
                    cb && cb();
                }
            };
            
            prefetchScript(deps , function(){
                getAllScript();
            });
        }
    };

    /**
     * 定义模块
     * @function
     * @param {String} module 定义的模块名
     * @param {Function} declare 模块的构造函数
     */
    var define = function(module , declare){
        page_modules[module] = declare;
    };
    
    var required_modules = {};

    
    /**
     * 获取模块
     * @function
     * @param {String} md 要获取的模块名
     * @param {Function} cb 模块内部的require不需要写cb，页面运行时调用请使用cb
     */
    var require = function(md , cb){

        var callback = function(){
            var final_md = [];
            for( var i=0 , l=md.length ; i<l; i++ ){
                var sm = md[i];
                if( required_modules[sm] ){//require只require一次，之后取出缓存
                    final_md.push( required_modules[sm] );
                    continue;
                }
                var declare = page_modules[sm];
                var exports = {};
                var self = exports;
                var module = {};
                module.id = md;
                declare(require , exports , module , self );  //TODO hack for self
                required_modules[sm] = exports;
                final_md.push( exports );
            }

            if( cb ){
                cb.apply(null , final_md);
            }else{
                return final_md[0];//本地调试，不允许多个module
            }
        
        };


        if( typeof md == 'string' ){
            md = [md];
        }
        
        var target_md = [];
        for( var i=0,l=md.length ; i<l; i++ ){
            var sm = md[i];
            
            if( !page_modules[sm] ){
                target_md.push(sm);
            }
        }
        if( target_md.length ){
            if( +BUILD>0 ){//编译之后
                return getBuildFile(target_md , callback);
            }else{
                getScript('/' + md[0] + '.js'); //本地不允许require多个module
                return callback();
            }
        }else{
            return callback();
        }

    };
    
    var addDependence = function(pkg  ,deps){
        dependencies[pkg] = deps.split(',');
    };
    
    var getDependence = function(pkgs){
        if( typeof pkgs == 'string' ){
            pkgs = [pkgs];
        }
        var final_deps = [].slice.call(pkgs);

        var t_deps = [];
        for( var z=0,x=pkgs.length ; z<x; z++ ){
            var pkg = pkgs[z];
            t_deps[z] = [];
            var deps = dependencies[pkg] || [];
            for( var i=0 , l=deps.length ; i<l; i++ ){
                var rs = getDependence(deps[i]);
                for ( var j=0,k=rs.length ; j<k; j++ ){
                    if( !deepSearch(t_deps[z] , rs[j]) && rs[j].length && !page_modules[rs[j]]){  //TODO 多级去重
                        t_deps[z].unshift(rs[j]);
                    }
                }
            }
        }
        for( var c=0,d=t_deps.length ; c<d; c++ ){
            final_deps = t_deps[c].concat(final_deps);
        }

        return final_deps;
    };


    ns.define = define;
    ns.require = require;
    ns.addDependence = addDependence;
    ns.getDependence = getDependence;

})(this);

