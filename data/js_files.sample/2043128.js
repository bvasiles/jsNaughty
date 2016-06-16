function processFooter(tab){
	appendCount();
	enableActiveTab(tab);
}

function enableActiveTab(tab){
	$('#' + tab).addClass('ui-btn-active');
}


function appendCount(){
	/*var url = './data.json';	
	url = url + '?action=' + 'count' + '&subaction=getcount';
	$.ajax({
		  url: url,
		  cache:false,
		  async: true,
		  dataType: 'json',
		  error:function(e){
			  //alert("Error" + e);
		  },
		  success: function (data) {
			  $("#taskCount").empty();
			  $("#taskCount").append(' (' + data.count[0].tasks + ')');
			  $("#eventCount").empty();
			  $("#eventCount").append(' (' + data.count[0].events + ')');
		  }
		});*/
}
