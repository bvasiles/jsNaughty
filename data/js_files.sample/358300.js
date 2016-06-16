// ==UserScript==
// @name Google sidebar + fade remove
// @namespace SIDE
// @description Removes the useless and obnoxious "Everything" sidebar in Google searches, and disables fade.
// @include http://www.google.*
// ==/UserScript==

function AddStyle(Style) {
var style = document.createElement('style');
style.type = "text/css";
style.innerHTML = Style;
document.getElementsByTagName('head')[0].appendChild(style);
};

AddStyle("#leftnav {display:none}");
AddStyle("#center_col {margin-left:0}");

(function () {
var css = '#fctr,#ghead,#pmocntr,#sbl,#tba,#tbe,.fade,.gbh {opacity: 1 !important; filter:alpha(opacity=100) !important;} * {font-family:\"Segoe UI\",\"Segoe UI\" !important; font-size:12px !important;}';
if (typeof GM_addStyle != 'undefined') {
GM_addStyle(css);
} else if (typeof PRO_addStyle != 'undefined') {
PRO_addStyle(css);
} else {
var style = document.createElement('style');
style.type = 'text/css';
style.innerHTML = css;
document.getElementsByTagName('head')[0].appendChild(style);
}
})();
