function menutoggle() {
    $('.old-post').slideToggle();
    $('#expand-switch').toggle();
    $('#collapse-switch').toggle();
}
function collapsePostIndex() {
	$("#postindex li:nth-child(-n+5)").removeClass("old-post");
	if ( $('#postindex li').length > 5 ) {
        $('#postindex').append('<li><a href="javascript:menutoggle();" id="expand-switch">↓Show all↓</a><a href="javascript:menutoggle();" id="collapse-switch">↑Show recent↑</a></li>')
    }
}
function setupProxyLinks() {
	$('#proxify').click( function(event){ proxify() });
	$('#proxify').hover( function(event){ $(this).addClass('pressed')},function(event){$(this).removeClass('pressed')})
	if ( $.cookie('off-campus') ) {
		proxify();
	}
}

$(document).ready( function () {
	collapsePostIndex();
	setupProxyLinks();
});

function proxify() {
	for (var i=0; i<document.links.length; i++) {
  		document.links[i].href = document.links[i].href.replace("jstor.org", "jstor.org.proxy.lib.ohio-state.edu");
  		document.links[i].href = document.links[i].href.replace("springerlink.com", "springerlink.com.proxy.lib.ohio-state.edu");
  		document.links[i].href = document.links[i].href.replace("dx.doi.org", "dx.doi.org.proxy.lib.ohio-state.edu");
  		document.links[i].href = document.links[i].href.replace("oxfordscholarship.com", "oxfordscholarship.com.proxy.lib.ohio-state.edu");
		document.links[i].href = document.links[i].href.replace("wiley.com", "wiley.com.proxy.lib.ohio-state.edu")
		document.links[i].href = document.links[i].href.replace("gateway.proquest.com", "gateway.proquest.com.proxy.lib.ohio-state.edu")
	}
	$.cookie('off-campus', 'true', {expires: 21});
	$('#proxify').html('Off-Campus Links Enabled');
	$('#proxify').unbind('click');
	$('#proxify').click( function(event){ deproxify() });
}
function deproxify() {
	for (var i=0; i<document.links.length; i++) {
  		document.links[i].href = document.links[i].href.replace(".proxy.lib.ohio-state.edu", "");
	}
	$.cookie('off-campus', false, {expires: 21});
	$('#proxify').html('Off-Campus Links Disabled');
	$('#proxify').unbind('click');	
	$('#proxify').click( function(event){ proxify() });
}

