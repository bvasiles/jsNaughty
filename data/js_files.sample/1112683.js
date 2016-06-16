// Create a rect and set the x value to a positive number and y to zero 

var win = Ti.UI.currentWindow;
var label = Ti.UI.createLabel({
	text: "THIS IS INVALID"
});
var rect = Ti.UI.createRect({left:0, top:0, width:20, height:0});

win.add(rect);
