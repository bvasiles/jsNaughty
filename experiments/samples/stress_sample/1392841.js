/*!
 *
 * jQuery Sort Grid Plugin v.1.0
 * http://darcyclarke.me/dev/sortgrid/
 *
 * Copyright 2011, Darcy Clarke
 * Do what you want license
 * 
 */
jQuery.fn.sortGrid = function(selector, speed, callback){
	var $ = jQuery;
	speed =	(typeof(speed) != "number") ? 1000 : speed;
	callback = (typeof(callback) != "function") ? function(){} : callback;
	return this.each(function(){
		var element = $(this), el = element.children(), p = { "height": element.height(), "width": element.width(), "top": (parseFloat(element.css('borderTopWidth')) + parseFloat(element.css('padding-top'))), "left": 0 }, box;
		for(var i=(el.length-1);i>=0;i--){
			box = el.eq(i);
			box.css({ "position":"absolute", "top": box.position().top + "px", "left": box.position().left + "px" });
		}		
		$(this).queue(function(next){
			el.animate({"top":p.top,"left":p.left}, speed, function(){
				$(this).dequeue();
				next();
			});
		}).queue(function(){
			var top = p.top, left = p.left;
			for(var i=0;i<=el.length;i++){
				var box = el.eq(i);
				if(box.hasClass(selector)){
					if((left + box.outerWidth(true)) >= (p.width + p.left)){
						top = parseFloat(top) + parseFloat(box.outerHeight(true));
						box.stop(true, false).show().animate({ "top": + top + "px", "left": p.left + "px" }, speed);
						left = p.left + box.outerWidth(true);
					} else {
						box.stop(true, false).show().animate({ "top": + top + "px", "left": left + "px" }, speed);
						left = left + box.outerWidth(true);	
					}
					element.stop(true, false).animate({"height": ((parseFloat(top)-parseFloat(p.top)) + box.outerHeight(true)) +"px"}, speed);
				} else {
					box.stop(true, false).hide();	
				}
				if(i == length){
					setTimeout(function(){ callback(); }, speed);
				}
			}
		});
	});
}