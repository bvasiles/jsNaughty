(function(){

	parser = require("parser")
	parser.on('load', function(){
		//http://gb.cri.cn 首页无水印
		var title = document.querySelector('title').innerHTML;
		var photos = document.querySelectorAll('#slide7 center');

		var data = {title:title, photos:[]}

		for(var i = 0; i < photos.length; i++){
			var photoEl = photos[i];
			var imgurl = photoEl.querySelector("img").getAttribute("src");
			var title = "";
			var desc = photoEl.querySelector("a:nth-child(3)").innerText;

			data.photos.push({imgurl:imgurl, title:title, desc:desc});
		}

		var json = require('object.h').stringify(data);

		__callback__(json); //call Spider.onparsed
	});

})();