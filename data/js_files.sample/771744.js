Ti.include(Ti.Filesystem.resourcesDirectory + 'classes/ui.login.js');

var win = Ti.UI.currentWindow;
ui_login.draw.unauthed();

win.addEventListener('focus', function(e){
    Ti.App.analytics.trackPageview('/new_user/');
});