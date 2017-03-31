// ==UserScript==
// @name		wwwww
// @namespace	http://www.kanasansoft.com/
// @description [wwwww] is changed into [w3w].
// @include		*
// ==/UserScript==

(function(){

	var THRESHOLD=5;

	var regw=new RegExp("[wｗ]{"+(THRESHOLD).toString()+",}");

	//star mode
	var SmileStars=function(){};

	SmileStars.prototype.change=
		function(strW){

			var inner=document.createElement("span");
			var addW=this.getAddW();
			addW.addEventListener(
				"click",
				(function(element,getW){
					var _element=element,_getW=getW;
					return function(){
						_element.appendChild(_getW.call(_element));
					}
				})(inner,this.getW),
				true
			);

			inner.appendChild(addW);
			inner.appendChild(this.getW());
			inner.appendChild(this.getWs(strW.length-2));
			inner.appendChild(this.getW());

			return inner;
		}

	SmileStars.prototype.getAddW=
		function(){
			var img=document.createElement("img");
			img.setAttribute("src",this.constructor.IMAGE_URI.ADD_W);
			img.setAttribute("tabindex","0");
			img.setAttribute("alt","Add w");
			img.setAttribute("style","border:medium none;margin:0pt 3px;padding:0pt;cursor:pointer;vertical-align:middle;");
			return img;
		}

	SmileStars.prototype.getW=
		function(){
			var img=document.createElement("img");
			img.setAttribute("src",this.constructor.IMAGE_URI.W);
			img.setAttribute("tabindex","0");
			img.setAttribute("style","border:medium none;padding:0pt;");
			return img;
		}

	SmileStars.prototype.getWs=
		function(count){
			var ws=document.createElement("span");
			ws.setAttribute("tabindex","0");
			ws.setAttribute("style","margin:0pt 2px;color:rgb(244,177,40);font-weight:bold;font-size:80%;font-family:\"arial\",sans-serif;cursor:pointer;");
			var handler=
				(function(count,dflg,ws,getW){
					var _count=count,_dflg=dflg,_ws=ws,_getW=getW;
					return function(){
						while(_ws.hasChildNodes()){
							_ws.removeChild(_ws.firstChild);
						}
						if(_dflg){
							_ws.style.margin="0pt 2px";
							_ws.appendChild(document.createTextNode(_count));
						}else{
							_ws.style.margin="0pt 0px";
							for(var i=0;i<_count;i++){
								_ws.appendChild(_getW.call(_ws));
							}
						}
						_dflg=!_dflg;
					}
				})(count,true,ws,this.getW);
			ws.addEventListener("click",handler,true);
			handler();
			return ws;
		}

	SmileStars.IMAGE_URI={};

	SmileStars.IMAGE_URI.W=
		"data:image/gif;base64,"+
		"R0lGODlhCwAKAKEDAAAAAPazK%2F%2FMaf8WaSH5BAEKAAMALAAAAAALAAoAAAIg"+
		"3GB4dgHgIILiVSBiqNvlt2HhR43ddJ5J%2BjFSo7iyUQAAOw%3D%3D";

	SmileStars.IMAGE_URI.ADD_W=
		"data:image/gif;base64,"+
		"R0lGODlhEAAQAIABAL3Z2P8WaSH5BAEAAAEALAAAAAAQABAAAAIpjI%2Bpm%2BAP"+
		"YQBMuWkobi9nfUjdtYkXqUWUGk0nWa4vmKbhAlcey%2Br%2BXwAAOw%3D%3D";

	//word mode
	var SmileWords=function(){};

	SmileWords.prototype.change=
		function(strW){

			var inner=document.createElement("span");
			var ws=[];
			var place;
			inner.setAttribute("style","margin:0pt 3px;");

			for(var i=0;i<strW.length;i++){
				var span=document.createElement("span");
				var w=document.createTextNode(strW.charAt(i));
				span.setAttribute("style","margin:0px;cursor:pointer;");
				span.appendChild(w);
				ws.push(span);
			}

			var data={"element":inner,"ws":ws,"place":place};

			ws[0].addEventListener(
				"click",this.firstHandler(this,data),true
			);
			ws[ws.length-1].addEventListener(
				"click",this.lastHandler(this,data),true
			);
			for(var i=1;i<ws.length-1;i++){
				ws[i].addEventListener(
					"click",this.otherHandler(this,data,i),true
				);
			}

			this.otherHandler(this,data,1)();

			return inner;
		}

	SmileWords.prototype.firstHandler=
		function(scope,data){
			var _data=data;
			return function(){
				if(_data.place<_data.ws.length-1){
					_data.place++;
				}
				scope.displayW(_data.element,_data.ws,_data.place);
			}
		};

	SmileWords.prototype.lastHandler=
		function(scope,data){
			var _data=data;
			return function(){
				_data.place=_data.ws.length-1;
				scope.displayW(_data.element,_data.ws,_data.place);
			}
		};

	SmileWords.prototype.otherHandler=
		function(scope,data,c){
			var _data=data;
			return function(){
				_data.place=c;
				scope.displayW(_data.element,_data.ws,_data.place);
			};
		}

	SmileWords.prototype.displayW=
		function(ele,ary,place){
			while(ele.hasChildNodes()){
				ele.removeChild(ele.firstChild);
			}
			for(var i=0;i<place;i++){
				ele.appendChild(ary[i]);
			}
			if(ary.length-1!=place){
				var span=document.createElement("span");
				span.appendChild(
					document.createTextNode(String(ary.length-place-1))
				);
				ele.appendChild(span);
			}
			ele.appendChild(ary[ary.length-1]);
		}

	//money mode
	var SmileMoneys=function(){};

	SmileMoneys.prototype.change=
		function(strW){

			var inner=document.createElement("span");

			var total=strW.length;

			var moneyKinds=[1,5,10,50,100,500,1000,5000,10000];
			moneyKinds.sort(function(a,b){return b-a});

			for(var i=1;i<moneyKinds.length;i++){
				if(((moneyKinds[i-1])%(moneyKinds[i]))!=0){return;}
			}

			var moneyAll={};
			for(var i=0;i<moneyKinds.length;i++){
				moneyAll[moneyKinds[i.toString(10)]]=Math.floor(total/moneyKinds[i]);
				total=total%moneyKinds[i];
			}

			this.replaceMoney(this,inner,moneyAll);

			return inner;

		}

	SmileMoneys.prototype.replaceMoney=
		function(scope,ele,moneyAll){

			while(ele.hasChildNodes()){
				ele.removeChild(ele.firstChild);
			}

			var moneyKinds=[];
			for(var key in moneyAll){moneyKinds.push(Number(key));}
			moneyKinds.sort(function(a,b){return b-a});

			for(var i=0;i<moneyKinds.length;i++){

				var moneyKind=moneyKinds[i];
				var bandWrapper=document.createElement("span");
				var moneyCount=moneyAll[moneyKind.toString(10)];
				var sameMoneys=[];

				for(var j=0;j<moneyCount;j++){
					var moneyImage=document.createElement("img");
					moneyImage.setAttribute(
						"src",scope.constructor.IMAGE_URI["MONEY_"+moneyKind.toString(10)]
					);
					sameMoneys.push(moneyImage);
					bandWrapper.appendChild(moneyImage);
				}

				var upperFlag=i!=0&&moneyKinds[i]*moneyCount>=moneyKinds[i-1];
				var lowerFlag=i!=moneyKinds.length-1;
				if(moneyCount>1&&upperFlag){
					sameMoneys[0].style.cursor="pointer";
					sameMoneys[0].addEventListener(
						"click",scope.changeMoneyHandler(scope,ele,moneyAll,"up",moneyKind),true
					);
				}
				if(moneyCount>0&&lowerFlag){
					sameMoneys[sameMoneys.length-1].style.cursor="pointer";
					sameMoneys[sameMoneys.length-1].addEventListener(
						"click",scope.changeMoneyHandler(scope,ele,moneyAll,"down",moneyKind),true
					);
				}

				ele.appendChild(bandWrapper);

			}

		}

	SmileMoneys.prototype.changeMoneyHandler=
		function(scope,ele,moneyAll,direction,moneyKind){

			return function(){

				var moneyKinds=[];
				for(var key in moneyAll){moneyKinds.push(Number(key));}
				moneyKinds.sort(function(a,b){return b-a});

				var changeFrom=-1;
				for(var i=0;i<moneyKinds.length;i++){
					if(moneyKinds[i]==moneyKind){changeFrom=i}
				}

				var changeTo=-1;
				switch(direction){
				case "up":
					changeTo=changeFrom-1;
					break;
				case "down":
					changeTo=changeFrom+1;
					break;
				}
/*
				if(-1<changeFrom&&changeFrom<moneyKinds.length&&
				   -1<changeTo&&changeTo<moneyKinds.length){
				}else{
					return;
				}
*/
				var moneyKindFrom=moneyKinds[changeFrom];
				var moneyKindTo=moneyKinds[changeTo];
				var moneyCountFrom=moneyAll[moneyKindFrom.toString(10)];
				var moneyCountTo=moneyAll[moneyKindTo.toString(10)];

				switch(direction){
				case "up":
					moneyCountFrom-=moneyKindTo/moneyKindFrom;
					moneyCountTo++;
					break;
				case "down":
					moneyCountTo+=moneyKindFrom/moneyKindTo;
					moneyCountFrom--;
					break;
				}

				moneyAll[moneyKindFrom.toString(10)]=moneyCountFrom;
				moneyAll[moneyKindTo.toString(10)]=moneyCountTo;

				scope.replaceMoney(scope,ele,moneyAll);

			}
		}

	SmileMoneys.IMAGE_URI={};

	SmileMoneys.IMAGE_URI.MONEY_1=
		"data:image/png;base64,"+
		"iVBORw0KGgoAAAANSUhEUgAAAAcAAAALBAMAAABBvoqbAAAAAXNSR0IArs4c6QAA"+
		"AA9QTFRFwLgiZmZmmZmZzMzM%2F%2F%2F%2F%2BhgC2AAAAAF0Uk5TAEDm2GYAAA"+
		"AnSURBVAjXY2BAACUFBgYmQycGBmVHYwEGFTBhCCQYDQ2BsoICSEoBWa8DI88uD8"+
		"8AAAAASUVORK5CYII%3D";

	SmileMoneys.IMAGE_URI.MONEY_5=
		"data:image/png;base64,"+
		"iVBORw0KGgoAAAANSUhEUgAAAAkAAAALBAMAAABfd7ooAAAAAXNSR0IArs4c6QAA"+
		"ABJQTFRFAAAAmTMAzGYA%2F5kz%2F8xm%2F%2F%2BZNMwxVAAAAAF0Uk5TAEDm2G"+
		"YAAAA4SURBVAjXY2CAAGNjAwYGZhfXYAYGE0dBFwUgGeIMJAMFjRUYTEMcQaQjiM"+
		"3kbGwEVK%2BkpADVCQABkwd6GkobBAAAAABJRU5ErkJggg%3D%3D";

	SmileMoneys.IMAGE_URI.MONEY_10=
		"data:image/png;base64,"+
		"iVBORw0KGgoAAAANSUhEUgAAAAkAAAALBAMAAABfd7ooAAAAAXNSR0IArs4c6QAA"+
		"ABJQTFRFAAAAMwAAZjMAmTMAzGYA%2F5kz9%2FGujgAAAAF0Uk5TAEDm2GYAAAA1"+
		"SURBVAjXY2CAAGNjAwYGZhfXYAYGE5FAFwUGE1ERYRhpKiIMJg2NFRiYnI2NgOqV"+
		"lBSgOgHRAQX91OmcRQAAAABJRU5ErkJggg%3D%3D";

	SmileMoneys.IMAGE_URI.MONEY_50=
		"data:image/png;base64,"+
		"iVBORw0KGgoAAAANSUhEUgAAAAkAAAALBAMAAABfd7ooAAAAAXNSR0IArs4c6QAA"+
		"ABJQTFRFAAAAMzMzZmZmmZmZzMzM%2F%2F%2F%2FqUEXyQAAAAF0Uk5TAEDm2GYA"+
		"AAA5SURBVAjXY2CAAGNjAwYGZhfXYAYGE8FAFwUGE1ERYSApCCJNA4VBpKChsQID"+
		"k7OxEVC9kpICVCcA1lkGMGw8BkgAAAAASUVORK5CYII%3D";

	SmileMoneys.IMAGE_URI.MONEY_100=
		"data:image/png;base64,"+
		"iVBORw0KGgoAAAANSUhEUgAAAAkAAAALBAMAAABfd7ooAAAAAXNSR0IArs4c6QAA"+
		"ABJQTFRFAGd0MzMzZmZmmZmZzMzM%2F%2F%2F%2F8WHDEgAAAAF0Uk5TAEDm2GYA"+
		"AAA3SURBVAjXY2CAAGNjAwYGZhfXYAYGQ8dQEQUGQ1FBRzBpCCRFwKSjsbACA5Oz"+
		"sRFQvZKSAlQnAN1kBl40xebAAAAAAElFTkSuQmCC";

	SmileMoneys.IMAGE_URI.MONEY_500=
		"data:image/png;base64,"+
		"iVBORw0KGgoAAAANSUhEUgAAAAsAAAALBAMAAABbgmoVAAAAAXNSR0IArs4c6QAA"+
		"ABJQTFRFAAAAMzMAZmYzmZlmzMyZ%2F%2F%2FMnfoPkgAAAAF0Uk5TAEDm2GYAAA"+
		"BLSURBVAjXY2BgNjZmAAITl1ADBgZmF9dQJwYGQ8HAEBEFBkNXUUFHICUoImiowG"+
		"AaCKYMBR2NhRWAKp2NjYD6VIyNFYAUk5ISAwMAdTwJHj9UTsQAAAAASUVORK5CYI"+
		"I%3D";

	SmileMoneys.IMAGE_URI.MONEY_1000=
		"data:image/png;base64,"+
		"iVBORw0KGgoAAAANSUhEUgAAABcAAAALBAMAAABmEAtzAAAAAXNSR0IArs4c6QAA"+
		"ABJQTFRFADMzM2ZmZpmZmZmZmczMzP%2F%2FLeaxegAAAEtJREFUCNdjUEIABQYV"+
		"FzgQAHIcXFhcWVyYjUEcJQUFh4AABwNjEzgnAMJxcXBAcIwNwBwHqB4QxwHCgZsG"+
		"1gMGzsbGxgIMggggAAAX%2BhiYu1kQUwAAAABJRU5ErkJggg%3D%3D";

	SmileMoneys.IMAGE_URI.MONEY_5000=
		"data:image/png;base64,"+
		"iVBORw0KGgoAAAANSUhEUgAAABcAAAALBAMAAABmEAtzAAAAAXNSR0IArs4c6QAA"+
		"ABJQTFRFZjMAmWYzzJlm%2F5mZ%2F8yZ%2F%2F%2FMThVZpAAAAEtJREFUCNdjUE"+
		"IABQYVFzgQAHIYWBxcA1wcjEEcJSYVFlZWFmZmEwiHFc4BKkNwjE2gHLAeFRYWOA"+
		"dqmoExWA8YOBsbGwswCCKAAADhphCOUX3IdQAAAABJRU5ErkJggg%3D%3D";

	SmileMoneys.IMAGE_URI.MONEY_10000=
		"data:image/png;base64,"+
		"iVBORw0KGgoAAAANSUhEUgAAABcAAAALBAMAAABmEAtzAAAAAXNSR0IArs4c6QAA"+
		"ABJQTFRFZjMAmWYAzJkzzMxm%2F8xm%2F%2F%2BZ9tN9RgAAAE9JREFUCNdjUEIA"+
		"BQYVFzgQYFBxcGFxYQ1hcWYGcRQUFBwCAhwMDEzgnAAIxwEI4BwDAzDHwQCiB8Rx"+
		"gHCgphkzg5RB7HA2NjYWYBBEAAEA%2FBgYLLOK1n0AAAAASUVORK5CYII%3D";

	var getChangedLine=
		function(param,smile){
			var text=String(param);
			var outer=document.createElement("span");
			var c=10;
			while(c>0&&text.length>0){

				var match=text.match(regw);

				if(match&&match.length==1){

					var leftContext=RegExp.leftContext;
					var rightContext=RegExp.rightContext;
					var matchContext=match[0];

					if(leftContext.length>0){
						outer.appendChild(document.createTextNode(leftContext));
					}

					outer.appendChild(smile.change(matchContext));

					text=rightContext;

				}else{
					outer.appendChild(document.createTextNode(text));
					break;
				}
				c--;
			}
			return outer;
		}
 
	//load
	var onLoad=
		function(){
			GM_registerMenuCommand(
				"wwwww - star mode",
				function(){GM_setValue("type","star")}
			);
			GM_registerMenuCommand(
				"wwwww - money mode",
				function(){GM_setValue("type","money")}
			);
			GM_registerMenuCommand(
				"wwwww - word mode",
				function(){GM_setValue("type","word")}
			);

			var smile;
			switch(GM_getValue("type")){
			case "star":
				smile=new SmileStars();
				break;
			case "word":
				smile=new SmileWords();
				break;
			case "money":
				smile=new SmileMoneys();
				break;
			default:
				smile=new SmileStars();
				break;
			}

			var texts=
				document.evaluate(
					"//text()",
					document,
					null,
					XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
					null
				);
			for(var i=texts.snapshotLength-1;i>=0;i--){
				var text=texts.snapshotItem(i);
				if(text.parentNode.nodeName.toLowerCase()=="textarea"||
				   !regw.test(text.nodeValue)){
					continue;
				}
				var ws=getChangedLine(text.nodeValue,smile);
				text.parentNode.replaceChild(ws,text);
			}
		}

	window.addEventListener("load",onLoad,true);

})();
