// Build 9

$(document).ready(function () {


// for iOS, shows the time when tapping onto a message
if ((navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPod/i)) || (navigator.userAgent.match(/iPad/i))) {
    $('*').click(function(){});
} // if

$('#new_name').val(parseGET('name')); // adds the content of the GET parameter "name" into the name field

// get's the content of GET parameter
function parseGET(name) {
    return unescape((RegExp(name + '=' + '(.+?)(&|$)').
    exec(location.search)||[,''])[1]);
}


}); // document.ready