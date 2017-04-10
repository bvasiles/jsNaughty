var Popup = {
	options:null,
	open:function(options){
		var that = this;
		that.options = $.extend({
			width:400,
			height:300,
			hasTitle:true,
			hasButton:true,
			allowMove:true,
			isAajx:false,
			title:"提示信息",
			content:"tiny little fantasy, tiny little happiness!",
			params:"",
			yesBtnText:"确定",
			yesCallBack:function(){},
			cancelBtnText:"取消",
			cancelCallBack:function(){},
		},options||{});
		
		var html = this._createBox();
		//var html = "";
		this._showBox(html);
		this._bindEvt();
	},
	close:function(){
		$("#popupMast").hide();
	},
	_createBox:function(){
		var html = [
			'<div id="popupMask" class="popup-mask">',
				'<div id="popupBox" class="popup-box">',
					'<div id="popupTitle" class="popup-title">',
						'<span id="popupClose" class="hand">XXX</span>',
					'</div>',
					'<div id="popupContent" class="popup-content">',
						'<span>are you happy?</span>',
					'</div>',
					'<div id="popupAction" class="popup-action">',
						'<button type="button" id="btnConfirm">确认</button>',
						'<button type="button" id="btnCancel">取消</button>',
					'</div>',
				'</div>',
			'</div>'
		].join("");
		
	
		// var html = '';
		// html += '<div id="popupMast" class="popup-mask">';
		// html += '<div id="popupBox" class="popup-box">';
		// html += '<div id="popupTitle" class="popup-title">';
		// html += '<span id="popupClose" class="hand">XXX</span>';
		// html += '</div>';	//title
		// html += '<div id="popupContent" class="popup-content">';
		// html += '</div>';	//content
		// html += '<div id="popupAction" class="popup-action">';
		// html += '</div>';	//button
		// html += '</div>';	//box	
		// html += '</div>'; 	//mask
		return html;
	},
	_showBox:function(html){
		var that = this;
		if($(".popup-mask").length==0)
		{
			$(document.body).append(html);
		}
		if(that.options.hasTitle==false)
		{
			$("#popupTitle").remove();
		}
		if(that.options.hasButton==false)
		{
			$("#popupAction").remove();
		}
		//$("#popupBox").css({width:"400px",height:"300px"});
		$("#popupBox").css({
			width:that.options.width,
			height:that.options.height,
			marginLeft:-(that.options.width/2),
			marginTop:-(that.options.height/2)
		});
		$("#popupMask").show();
	},
	_bindEvt:function(){
		var that = this;
		$(document).keydown(function(e){
			if (e.keyCode == 27){
				Popup.close();
			}
		});
		$("#popupClose").click(function(){
			Popup.close();
		});
		$("#btnConfirm").click(that.options.yesCallBack);	
		$("#btnCancel").click(that.options.cancelCallBack);
		if(that.options.allowMove==true){
			var popupBox="#popupBox";
			var distanceX = 0;
			var distanceY = 0;
			$("#popupTitle").mousedown(function(e){
				popupBox = "#popupBox";
				var offset = $(this).offset();
				distanceX = e.clientX - offset.left;
				distanceY = e.clientY - offset.top;
				$("#popupTitle").css("cursor","move");
				//$("#happy").text(parseInt($("#popupBox").css("top")) + " ### " + parseInt($("#popupBox").css("left")));
				//$("#happy").text((parseInt($("#popupBox").css("left"))-200) + " ### " + parseInt($("#popupBox").css("top")));
			}).mouseup(function(e){
				popupBox = "";
			});
			
			$(document).mousemove(function(e){
				$(popupBox).css({
					marginLeft:0,
					marginTop:0,
					cursor:"move",
					zIndex:100,
					left:e.clientX - distanceX,
					top:e.clientY - distanceY
				});
				$("#happy").text($("#popupTitle").offset().top+"###"+$("#popupTitle").offset().left + "      " + $("#popupBox").offset().top + "###" + $("#popupBox").offset().left);
				
				window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
				//$("#happy").text("e.clienx:"+e.clientX + "   distanceX : " + distanceX );
				//$("#happy").text(" x : " + (e.clientX - distanceX) + " y : " + (e.clientY - distanceY));
			}).click(function(){
				popupBox = "";
			});
		}
	}
}

$(document).ready(function(){
	$("#btnOK").click(function(){
		Popup.open({
			title:"good news",
			content:"小幻想，小幸福！",
			yesCallBack:function(){
				alert("ok");
			},
			cancelCallBack:function(){
				alert("no");
			}
		});
	});
});