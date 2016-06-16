//util2 define一个module，返回一个包含两个function的json
define(function(){
	function util2AlertHelper(param){
		alert(param);
	}
	function changePElement(){
		var p = document.getElementById("container");
		p.innerText = "i am util2";
	}
	return {alertUtil:util2AlertHelper, changeP:changePElement};
})