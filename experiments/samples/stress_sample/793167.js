console.log('Guttencopy active');

document.body.addEventListener("copy", function(event) {
	var sel = window.getSelection();
	chrome.extension.sendRequest({
		action: 'guttencopy',
		selection: sel.toString(),
		title: document.title,
		url: document.URL}
	);
}, false);

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
	var sel = window.getSelection();
	sendResponse({selection: sel.toString()});
});

window.addEventListener('keydown', function(ev) {
	if (ev.altKey && ev.ctrlKey && ev.keyIdentifier == "U+0043") {
		var sel = window.getSelection();
		chrome.extension.sendRequest({
			action: 'normalcopy',
			selection: sel.toString(),
		});
		return false;
	}
}, true);
