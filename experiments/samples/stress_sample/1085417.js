//what happ
AlexPic.filter = {
stackXpath:"",
typeUrl:"",
getImgSrc:function(node){
  var p = node.parentNode;
  if(p){
    if(p.nodeName == "a"){    
      if(p.href){
        if(this.ifImgUrl(p.href) == true){
          return p.href;
        }else{
          if(node.src){
            //alert(node.src);
            return node.src;
          }
        }        
      }
    }else{
      //alert(node.src);
      return node.src;
    } 
  } 
},
ifImgUrl:function(iUrl){
  var r = true;
  if(iUrl.lastIndexOf('/') != -1){
     iUrl = iUrl.substring(iUrl.lastIndexOf('/')+1);
     if(iUrl.lastIndexOf('.') != -1){
       iUrl = iUrl.substring(iUrl.lastIndexOf('.')+1);
       var pattern = /png|jpeg|gif|jpg/i;
       var match = pattern.exec(iUrl);
       if(match != null){ 
        
       }else{
        r = false;
       }
     }else{
      r = false;
     }
  }else{
    r = false;
  }
  return r;
},
getXpath:function(node){
  var r = new Array();
  var sX = new Array();  
  // stack xpath
  r["xpath"] = null;
  r["typeUrl"] = null;
  r["rootNode"] = null;
  var p = node.parentNode;
  var selectA = false;  
  if(p.nodeName.toLowerCase() == "a"){
    //alert("b");
    if(p.href){
      if(this.ifImgUrl(p.href) == true){
        
        //alert(p.href);
        sX.push("[@href]/img/..");
        r["typeUrl"] = "href";
        selectA = true;
      }
    }
  }
  if(selectA != true){
    if(node.hasAttribute("original") ){
     
        sX.push("/img[@original]");
        r["typeUrl"] = "original";
        
    }else{
      sX.push("/img[@src]");
      r["typeUrl"] = "src";
    }  
  }
  while(p.getElementsByTagName("img").length == 1){    
    sX.push("/"+p.nodeName);
    p = p.parentNode;
  }
  
  if(p.nodeName.toLowerCase() == "p"){
  
  do{    
    sX.push("/"+p.nodeName);
    p = p.parentNode;
  }while(p.getElementsByTagName("img").length == 1)
  }
  sX = sX.reverse();
  r["xpath"] = sX.join("").toLowerCase();
  r["rootNode"]  = p;
  return r;
},
getXpath2:function(node){
//get Thumb          
  var r = new Array();
  var sX = new Array();  
  // stack xpath
  r["xpath"] = null;
  r["typeUrl"] = null;
  r["rootNode"] = null;
  var p = node.parentNode; 

  if(node.hasAttribute("original") ){
   
      sX.push("/img[@original]");
      r["typeUrl"] = "original";
      
  }else{
    sX.push("/img[@src]");
    r["typeUrl"] = "src";
  }  

  while(p.getElementsByTagName("img").length == 1){    
    sX.push("/"+p.nodeName);
    p = p.parentNode;
  }
  if(p.nodeName.toLowerCase() == "p"){
  
  do{    
    sX.push("/"+p.nodeName);
    p = p.parentNode;
  }while(p.getElementsByTagName("img").length == 1)
  }
  sX = sX.reverse();
  r["xpath"] = sX.join("").toLowerCase();
  r["rootNode"]  = p;
  return r;
},
getImgsSrc:function(node,type){
  // type 1 getXpath get photo,type 2 getXpath2 get the thumb
  if(type == 1){
    var opt = this.getXpath(node);
  }else{
    var opt = this.getXpath2(node);
  }
  var xpathEx = opt["xpath"].substring(1);
  //alert(xpathEx);
  var contextNode = opt["rootNode"];
  //alert(contextNode.nodeName);
  var typeUrl = opt["typeUrl"];
  //alert(xpathEx);
  var imgs = new Array();
  //alert(contextNode.nodeName);
  //alert(contextNode);
  var doc =  window.getBrowser().selectedBrowser.contentDocument;
  var tempImg = doc.createElement("img");
  var iterator = doc.evaluate(xpathEx,
      contextNode, null, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null );
  if(opt["typeUrl"] == "original"){
    try {
    var thisNode = iterator.iterateNext();
   
    while (thisNode) {
      //alert( thisNode.textContent );
      //alert(thisNode.nodeName);
      tempImg.src =thisNode.getAttribute(opt["typeUrl"]); 
      imgs.push(tempImg.src);
      thisNode = iterator.iterateNext();
    }	
    }
    catch (e) {
    dump( 'Error: Document tree modified during iteration ' + e );
    }
  }
  else{
    try {
    var thisNode = iterator.iterateNext();
   
    while (thisNode) {
      //alert( thisNode.textContent );
      //alert(thisNode.nodeName);
      imgs.push(thisNode[opt["typeUrl"]]);
      thisNode = iterator.iterateNext();
    }	
    }
    catch (e) {
    dump( 'Error: Document tree modified during iteration ' + e );
    }
  }


  //alert(imgs[0]);
  return imgs;
 
}
};
