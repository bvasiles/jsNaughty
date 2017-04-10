/*
 * Ext JS Library 2.2.1
 * Copyright(c) 2006-2009, Ext JS, LLC.
 * licensing@extjs.com
 * 
 * http://extjs.com/license
 */
/**
 * 
 * By: 	LoriSun  
 * 		Ext User
 * 		http://extjs.com/forum/showthread.php?t=60350
 * 
 * Copy: Francisco Tanajura

 */
Ext.namespace('Ext.ux');
Ext.ux.OnDemandLoad = function(){
	
	loadComponent = function(component,callback){
	var fileType = component.substring(component.lastIndexOf('.'));
	var head = document.getElementsByTagName("head")[0];
	var done = false;
	if (fileType === ".js") {
		var fileRef = document.createElement('script');
		fileRef.setAttribute("type", "text/javascript");
		fileRef.setAttribute("src", component);
		fileRef.onload = fileRef.onreadystatechange = function(){
		if (!done && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete") ) {
			done = true;
			eval(callback+'()');
			head.removeChild(fileRef);
		}
		};
	}
	else if (fileType === ".css") {
		var fileRef = document.createElement("link");
		fileRef.setAttribute("type", "text/css");
		fileRef.setAttribute("rel", "stylesheet");
		fileRef.setAttribute("href", component);
	}
	if (typeof fileRef != "undefined") {
		head.appendChild(fileRef);
	}
	};
	
	return {
		load: function(components, callback){
			Ext.each(components, function(component){
				loadComponent(component,callback);
			});
		}
	};
}();