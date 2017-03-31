/*
 * sp-export-webpart-old.js
 * by @mirontoli (https://github.com/mirontoli)
 * License: MIT
*/
"use strict";
window.spExportWebPart = {};
window.spExportWebPart.init = function() {
	var getCommonUrlPart = (function() {
		var commonUrlPart = undefined;
		function assembleCommonUrlPart() {
			return [_spPageContextInfo.webAbsoluteUrl, '/_vti_bin/exportwp.aspx?pageurl='
				, window.location.protocol, '//', window.location.host
				, _spPageContextInfo.serverRequestPath,  '&guidstring='].join('');
		}
		return function() {
			commonUrlPart = commonUrlPart || assembleCommonUrlPart();
			return commonUrlPart;
		}
	})();
	function getAllWebParts() {
		var allWebPartElements = document.querySelectorAll("[webpartid]");
		var allWebParts = Array.prototype.map.call(allWebPartElements, function(elem) { return {id: elem.getAttribute("webpartid"), elementId: elem.id }; });
		var notEmptyWebParts = allWebParts.filter(function(w) { return w.id !== SP.Guid.get_empty().toString(); });
		return notEmptyWebParts;	
	}
	function getWebPartsAsHtml() {
		var webparts = getAllWebParts();
		var webpartsAsHtml = webparts.map(function(w) { 
			var url = getCommonUrlPart() + w.id;
			return ['<li><a href="', url, '">', w.elementId, '</a></li>' ].join(''); 
		});
		return webpartsAsHtml.join('');
	}
	function getHtml() {
		var explanation = ['<div>Please click on the link for you web part to export the webpart</div>',
			'<div>In future I will try to provide a better interface for selecting your webpart</div>',
			'<div>The tool is provided as is. Author: Anatoly Mironov @mirontoli, 2015-10-21. See the details on my blog: <a href="">asdf</a></div>'
			].join('');
		return [explanation, '<ul>', getWebPartsAsHtml(), '</ul>'].join('');
	}

	function showDialog() {
		var html = document.createElement('div');
		html.innerHTML = getHtml();
		OpenPopUpPageWithDialogOptions({
		 title: "Export Web Part",
		 html:html,
		 allowMaximized: true,
		 showClose: true,
		 autoSize: true,
		});
	}
	showDialog();
};
window.spExportWebPart.init();