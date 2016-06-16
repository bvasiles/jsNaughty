
var ufShiv={version:0.2,get:function(name,element){var date=[];var nodes=[];var uf=this.internal[name];if(!uf||!element){return this.internal.pack({},"Sorry either the format or element was not found.",this.version)}
if(uf.className){nodes=this.internal.getElementsByClassName(element,uf.className);if((nodes.length===0)&&uf.alternateClassName){var altClass=this.internal.getElementsByClassName(element,uf.alternateClassName);if(altClass.length>0){nodes.push(element)}}}else{if(uf.attributeValues){nodes=this.internal.getElementsByAttribute(element,uf.attributeName,uf.attributeValues)}}
if(name=="hCard"){var items=[];for(var i=0;i<nodes.length;i++){if(this.internal.findParentByClass(nodes[i],"vcard")===null){items.push(nodes[i])}}
nodes=items}
for(var x=0;x<nodes.length;x++){date.push(this.internal.getMicroformat(nodes[x],name))}
if(name=="XFN"){date=this.internal.compressXFN(date)}
var obj={};if(uf.className){obj[uf.className]=date}else{obj[uf.altName]=date}
return this.internal.pack(obj,"",this.version)},add:function add(name,object){if(!this.internal[name]){this.internal[name]=object}},internal:{pack:function(data,error,version){var pack={microformats:data};pack["parser-information"]={};pack["parser-information"].name="Microformat Shiv";pack["parser-information"].version=version;if(!error&&error!==""){pack.errors=[error]}
return pack},getMicroformat:function(node,microformat){var data={};for(var i in this[microformat].properties){var item=this.getMicroformatProperty(node,microformat,i);if(item!=undefined){data[i]=item}}
return data},getMicroformatProperty:function(in_mfnode,mfname,propname){var mfnode=in_mfnode;if(!in_mfnode.origNode&&this[mfname].className&&in_mfnode.ownerDocument){mfnode=this.preProcessMicroformat(in_mfnode)}
var propobj;if(this[mfname].properties[propname]){propobj=this[mfname].properties[propname]}else{return undefined}
var propnodes;if(propobj.rel===true){propnodes=this.getElementsByAttribute(mfnode,"rel",propname)}else{propnodes=this.getElementsByClassName(mfnode,propname)}
if(mfname=="hCard"){var items=[];for(var i=0;i<propnodes.length;i++){var found=this.findParentByClass(propnodes[i],"vcard");if(mfnode==found){items.push(propnodes[i])}}
propnodes=items}
if(propnodes.length>0){var resultArray=[];for(var y=0;y<propnodes.length;y++){var subresult=this.getPropertyInternal(propnodes[y],mfnode,propobj,propname,mfnode);if(subresult!=undefined){resultArray.push(subresult);if(!propobj.plural){return resultArray[0]}}}
if(resultArray.length>0){return resultArray}}else{if(propobj.virtual){return this.getPropertyInternal(mfnode,null,propobj,propname,mfnode)}}
return undefined},getPropertyInternal:function(propnode,parentnode,propobj,propname,mfnode){var result;if(propobj.subproperties){for(var subpropname in propobj.subproperties){var subpropnodes;var subpropobj=propobj.subproperties[subpropname];if(subpropobj.rel===true){subpropnodes=this.getElementsByAttribute(propnode,"rel",subpropname)}else{subpropnodes=this.getElementsByClassName(propnode,subpropname)}
var resultArray=[];var subresult;for(var i=0;i<subpropnodes.length;i++){subresult=this.getPropertyInternal(subpropnodes[i],propnode,subpropobj,subpropname,mfnode);if(subresult!=undefined){resultArray.push(subresult);if(!subpropobj.plural){break}}}
if(resultArray.length===0){subresult=this.getPropertyInternal(propnode,null,subpropobj,subpropname,mfnode);if(subresult!=undefined){resultArray.push(subresult)}}
if(resultArray.length>0){result=result||{};if(subpropobj.plural){result[subpropname]=resultArray}else{result[subpropname]=resultArray[0]}}}}
if(!parentnode||((result==undefined)&&propobj.subproperties)){if(propobj.virtual){if(propobj.virtualGetter){result=propobj.virtualGetter(this,mfnode||propnode)}else{result=this.datatypeHelper(propobj,propnode)}}}else{if(result==undefined){result=this.datatypeHelper(propobj,propnode,parentnode);if((result==undefined)&&!propobj.subproperties){if(propobj.virtual&&propobj.virtualGetter){result=propobj.virtualGetter(parentnode)}}}}
return result},preProcessMicroformat:function(in_mfnode){var mfnode;if((in_mfnode.nodeName.toLowerCase()=="td")&&(in_mfnode.getAttribute("headers"))){mfnode=in_mfnode.cloneNode(true);mfnode.origNode=in_mfnode;var headers=in_mfnode.getAttribute("headers").split(" ");for(var i=0;i<headers.length;i++){var tempNode=in_mfnode.ownerDocument.createElement("span");var headerNode=in_mfnode.ownerDocument.getElementById(headers[i]);if(headerNode){tempNode.innerHTML=headerNode.innerHTML;tempNode.className=headerNode.className;mfnode.appendChild(tempNode)}}}else{mfnode=in_mfnode}
var includes=this.getElementsByClassName(mfnode,"include");if(includes.length>0){if(!mfnode.origNode){mfnode=in_mfnode.cloneNode(true);mfnode.origNode=in_mfnode}
includes=this.getElementsByClassName(mfnode,"include");var includeId;var include_length=includes.length;for(var y=include_length-1;y>=0;y--){if(includes[y].nodeName.toLowerCase()=="a"){includeId=includes[y].getAttribute("href").substr(1)}
if(includes[y].nodeName.toLowerCase()=="object"){includeId=includes[y].getAttribute("data").substr(1)}
if(in_mfnode.ownerDocument.getElementById(includeId)){includes[y].parentNode.replaceChild(in_mfnode.ownerDocument.getElementById(includeId).cloneNode(true),includes[y])}}}
return mfnode},defaultGetter:function(propnode,parentnode,datatype){function collapseWhitespace(instring){instring=instring.replace(/[\t\n\r ]+/g," ");if(instring.charAt(0)==" "){instring=instring.substring(1,instring.length)}
if(instring.charAt(instring.length-1)==" "){instring=instring.substring(0,instring.length-1)}
return instring}
if((propnode.nodeName.toLowerCase()=="abbr")&&(propnode.getAttribute("title"))){return propnode.getAttribute("title")}else{if((propnode.nodeName.toLowerCase()=="time")&&(propnode.getAttribute("datetime"))){return propnode.getAttribute("datetime")}else{if((propnode.nodeName.toLowerCase()=="img")&&(propnode.getAttribute("alt"))){return propnode.getAttribute("alt")}else{if((propnode.nodeName.toLowerCase()=="area")&&(propnode.getAttribute("alt"))){return propnode.getAttribute("alt")}else{if((propnode.nodeName.toLowerCase()=="textarea")||(propnode.nodeName.toLowerCase()=="select")||(propnode.nodeName.toLowerCase()=="input")){return propnode.value}else{var valueTitles=this.getElementsByClassName(propnode,"value-title");for(var i=valueTitles.length-1;i>=0;i--){if(valueTitles[i].parentNode!=propnode){valueTitles.splice(i,1)}}
if(valueTitles.length>0){var valueTitle="";for(var j=0;j<valueTitles.length;j++){valueTitle+=valueTitles[j].getAttribute("title")}
return collapseWhitespace(valueTitle)}
var values=this.getElementsByClassName(propnode,"value");for(var x=values.length-1;x>=0;x--){if(values[x].parentNode!=propnode){values.splice(x,1)}}
if(values.length>0){var value="";for(var z=0;z<values.length;z++){value+=this.defaultGetter(values[z],propnode,datatype)}
return collapseWhitespace(value)}
var s;if(datatype=="HTML"){s=propnode.innerHTML}else{if(this.getTextContent(propnode)){s=this.getTextContent(propnode)}else{s=this.getTextContent(propnode)}}
if(!this.matchClass(propnode,"value")){s=collapseWhitespace(s)}
if(s.length>0){return s}}}}}}
return undefined},dateTimeGetter:function(propnode,parentnode,raw){function parseTime(time){if(time.match("am")||time.match("a.m.")){time=time.replace("am","");time=time.replace("a.m.","");var times=time.split(":");if(times[0]=="12"){times[0]="00"}
if(times[0].length==1){times[0]="0"+times[0]}
if(times.length>1){time=times.join(":")}else{time=times[0]+":00:00"}
if(times.length==2){time+=":00"}}
if(time.match("pm")||time.match("p.m.")){time=time.replace("pm","");time=time.replace("p.m.","");times=time.split(":");if(times[0]<12){times[0]=parseInt(times[0],10)+12}
if(times[0].length==1){times[0]="0"+times[0]}
if(times.length>1){time=times.join(":")}else{time=times[0]+":00:00"}
if(times.length==2){time+=":00"}}
return time}
var valueTitles=this.getElementsByClassName(propnode,"value-title");if(valueTitles.length>0){var time="";var date="";var value="";var offset="";for(var i=0;i<valueTitles.length;i++){value=valueTitles[i].getAttribute("title");if(value.match("T")){return this.normalizeISO8601(value)}
if(value.charAt(4)=="-"){date=value}else{if((value.charAt(0)=="-")||(value.charAt(0)=="+")||(value=="Z")){if(value.length==2){offset=value[0]+"0"+value[1]}else{offset=value}}else{time=value}}}
time=parseTime(time);if(raw){return date+(time?"T":"")+time+offset}else{if(date){return this.normalizeISO8601(date+(time?"T":"")+time+offset)}else{return undefined}}}
var values=this.getElementsByClassName(propnode,"value");for(var z=values.length-1;z>=0;z--){if(values[z].parentNode!=propnode){values.splice(z,1)}}
if(values.length>0){var time="";var date="";var value="";var offset="";for(var y=0;y<values.length;y++){value=this.defaultGetter(values[y],propnode);if(value.match("T")){return this.normalizeISO8601(value)}
if(value.charAt(4)=="-"){date=value}else{if((value.charAt(0)=="-")||(value.charAt(0)=="+")||(value=="Z")){if(value.length==2){offset=value[0]+"0"+value[1]}else{offset=value}}else{time=value}}}
time=parseTime(time);if(raw){return date+(time?"T":"")+time+offset}else{if(date){return this.normalizeISO8601(date+(time?"T":"")+time+offset)}else{return undefined}}}else{var date;var testDate;if(propnode.hasAttribute("title")){date=propnode.getAttribute("title");testDate=this.normalizeISO8601(date)}
if(!testDate){date=this.textGetter(propnode,parentnode)}
if(date){if(raw){return parseTime(date)}else{return this.normalizeISO8601(date)}}}
return undefined},uriGetter:function(propnode,parentnode){var pairs={a:"href",img:"src",object:"data",area:"href"};var name=propnode.nodeName.toLowerCase();if(pairs.hasOwnProperty(name)){return propnode[pairs[name]]}
return this.textGetter(propnode,parentnode)},telGetter:function(propnode,parentnode){var pairs={a:"href",object:"data",area:"href"};var name=propnode.nodeName.toLowerCase();if(pairs.hasOwnProperty(name)){var protocol;if(propnode[pairs[name]].indexOf("tel:")===0){protocol="tel:"}
if(propnode[pairs[name]].indexOf("fax:")===0){protocol="fax:"}
if(propnode[pairs[name]].indexOf("modem:")===0){protocol="modem:"}
if(protocol){if(propnode[pairs[name]].indexOf("?")>0){return unescape(propnode[pairs[name]].substring(protocol.length,propnode[pairs[name]].indexOf("?")))}else{return unescape(propnode[pairs[name]].substring(protocol.length))}}}
if(this.matchClass(propnode,"value")){return this.textGetter(parentnode,parentnode)}else{if(!parentnode&&(this.getElementsByClassName(propnode,"type").length>0)){var tempNode=propnode.cloneNode(true);var typeNodes=this.getElementsByClassName(tempNode,"type");for(var i=0;i<typeNodes.length;i++){typeNodes[i].parentNode.removeChild(typeNodes[i])}
return this.textGetter(tempNode)}
return this.textGetter(propnode,parentnode)}},emailGetter:function(propnode,parentnode){if((propnode.nodeName.toLowerCase()=="a")||(propnode.nodeName.toLowerCase()=="area")){var mailto=propnode.href;if(mailto.indexOf("?")>0){return unescape(mailto.substring("mailto:".length,mailto.indexOf("?")))}else{return unescape(mailto.substring("mailto:".length))}}else{if(this.matchClass(propnode,"value")){return this.textGetter(parentnode,parentnode)}else{if(!parentnode&&(this.getElementsByClassName(propnode,"type").length>0)){var tempNode=propnode.cloneNode(true);var typeNodes=this.getElementsByClassName(tempNode,"type");for(var i=0;i<typeNodes.length;i++){typeNodes[i].parentNode.removeChild(typeNodes[i])}
return this.textGetter(tempNode)}
return this.textGetter(propnode,parentnode)}}},textGetter:function(propnode,parentnode){return this.defaultGetter(propnode,parentnode,"text")},htmlGetter:function(propnode,parentnode){return this.defaultGetter(propnode,parentnode,"HTML")},normalizeISO8601:function normalizeISO8601(string){var dateArray=string.match(/(\d\d\d\d)(?:-?(\d\d[\d]*)(?:-?([\d]*)(?:[T ](\d\d)(?::?(\d\d)(?::?(\d\d)(?:\.(\d+))?)?)?(?:Z|(?:([-+])(\d\d)(?::?(\d\d))?)?)?)?)?)?/);var dateString;var tzOffset=0;if(!dateArray){return undefined}
if(dateArray[1]){dateString=dateArray[1];if(dateArray[2]){dateString+="-"+dateArray[2];if(dateArray[3]||dateArray[4]){if(dateArray[3]){dateString+="-"+dateArray[3]}
if(dateArray[4]){dateString+="T"+dateArray[4];if(dateArray[5]){dateString+=":"+dateArray[5]}else{dateString+=":00"}
if(dateArray[6]){dateString+=":"+dateArray[6]}else{dateString+=":00"}
if(dateArray[7]){dateString+="."+dateArray[7]}
if(dateArray[8]){dateString+=dateArray[8];if((dateArray[8]=="+")||(dateArray[8]=="-")){if(dateArray[9]){if(dateArray[9].length==1){dateString+="0"}
dateString+=dateArray[9];if(dateArray[10]){dateString+=dateArray[10]}else{dateString+="00"}}}}}}}}
if(string.indexOf("Z")>-1){dateString+="Z"}
return dateString},datatypeHelper:function(prop,node,parentnode){var result;var datatype=prop.datatype;switch(datatype){case"dateTime":result=this.dateTimeGetter(node,parentnode);break;case"anyURI":result=this.uriGetter(node,parentnode);break;case"email":result=this.emailGetter(node,parentnode);break;case"tel":result=this.telGetter(node,parentnode);break;case"HTML":result=this.htmlGetter(node,parentnode);break;case"float":var asText=this.textGetter(node,parentnode);if(!isNaN(asText)){result=parseFloat(asText)}
break;case"custom":result=prop.customGetter(this,node,parentnode);break;case"microformat":try{result=this.getMicroformat(node,prop.microformat)}catch(ex){if(ex!="Node is not a microformat ("+prop.microformat+")"){break}}
if(result!=undefined&&this.hasProperties(result)){if(prop.microformat_property){result=result[prop.microformat_property]}
break}
default:result=this.textGetter(node,parentnode);break}
if(prop.values&&(result!=undefined)){var validType=false;for(var value in prop.values){if(result.toLowerCase()==prop.values[value]){result=result.toLowerCase();validType=true;break}}
if(!validType){return undefined}}
return result},getElementsByClassName:function(rootNode,className){var returnElements=[];if(rootNode.getElementsByClassName){var col=rootNode.getElementsByClassName(className);for(var i=0;i<col.length;i++){returnElements[i]=col[i]}}else{if(document.evaluate){var xpathExpression;xpathExpression=".//*[contains(concat(' ', @class, ' '), ' "+className+" ')]";var xpathResult=document.evaluate(xpathExpression,rootNode,null,0,null);var node;while((node=xpathResult.iterateNext())){returnElements.push(node)}}else{className=className.replace(/\-/g,"\\-");var elements=rootNode.getElementsByTagName("*");for(var x=0;x<elements.length;x++){if(elements[x].className.match("(^|\\s)"+className+"(\\s|$)")){returnElements.push(elements[x])}}}}
return returnElements},getElementsByAttribute:function(rootNode,attributeName,attributeValues){var attributeList=attributeValues.split(" ");var returnElements=[];if(document.evaluate){var xpathExpression=".//*[";for(var i=0;i<attributeList.length;i++){if(i!==0){xpathExpression+=" or "}
xpathExpression+="contains(concat(' ', @"+attributeName+", ' '), ' "+attributeList[i]+" ')"}
xpathExpression+="]";var xpathResult=document.evaluate(xpathExpression,rootNode,null,0,null);var node;while((node=xpathResult.iterateNext())){returnElements.push(node)}}else{attributeName=attributeName.replace(/\-/g,"\\-");var elements=rootNode.getElementsByTagName("*");for(var x=0;x<elements.length;x++){if(elements[x][attributeName]){var found=false;for(var y=0;y<attributeList.length;y++){if(elements[x][attributeName].match("(^|\\s)"+attributeList[y]+"(\\s|$)")){found=true}}
if(found){returnElements.push(elements[x])}}}}
return returnElements},findParentByClass:function(node,className){if(document.evaluate){var xpathExpression;var xpathResult;xpathExpression="ancestor::*[contains(concat(' ', @class, ' '), ' "+className+" ')][1]";xpathResult=(node.ownerDocument||node).evaluate(xpathExpression,node,null,XPathResult.FIRST_ORDERED_NODE_TYPE,null);if(xpathResult.singleNodeValue){return xpathResult.singleNodeValue}
return null}else{if(arguments.length==2){if(node.parentNode&&node.nodeName!="BODY"){return this.findParentByClass(node.parentNode,className,1)}else{return null}}
if(node!==null&&node!==undefined){if(this.matchClass(node,className)){return node}else{if(node.parentNode&&node.nodeName!="BODY"){return this.findParentByClass(node.parentNode,className,1)}else{return null}}}else{return null}}},childernCountByClass:function(node,className){var nodes=this.getElementsByClassName(node,className);if(nodes.length){return nodes.length}else{return 0}},getTextContent:function(element){var temp=document.createElement("div");temp.innerHTML=element.textContent;var result=temp.childNodes[0].nodeValue;temp.removeChild(temp.firstChild);return result;},matchClass:function(node,className){if(node.nodeType!=11){var classValue=node.getAttribute("class");if(node.getAttribute("className")){classValue=node.getAttribute("className")}
return(classValue&&classValue.match("(^|\\s)"+className+"(\\s|$)"))}else{return false}},hasProperties:function(obj){for(var i in obj){return true}
return false},compressXFN:function(returnArray){var newArray=[];for(var j=0;j<returnArray.length;j++){var obj=returnArray[j];var newObj={};newObj.rel="";for(var i in obj){if(obj[i]){var name=String(i);if(name!="text"&&name!="link"){newObj.rel+=name+" "}else{newObj[i]=obj[i]}}}
if(newObj.rel!==""){newObj.rel=newObj.rel.substring(0,newObj.rel.length-1)}
newArray.push(newObj)}
return newArray}}};navigator.microformats=ufShiv;