// Place your application-specific JavaScript functions and classes here
// This file is automatically included by javascript_include_tag :defaults

// Java Script for Capitalization

function capitalizeMe(obj) {
    val = obj.value;
    newVal = '';
    val = val.split(' ');
    for (var c = 0; c < val.length; c++) {
        newVal += val[c].substring(0, 1).toUpperCase() +
            val[c].substring(1, val[c].length) + ' ';
    }
    obj.value = newVal;
}
// Javascript for tipTip
$(function() {
    $(".tipTip").tipTip({maxWidth: "auto", edgeOffset: 10,defaultPosition: "right",activation: "focus"});
    $(".tipTip1").tipTip({maxWidth: "auto", edgeOffset: 10,defaultPosition: "right"});
    $(".tipTip2").tipTip({maxWidth: "auto", edgeOffset: 10});
});

//Javascript for Facebox
jQuery(document).ready(function($) {
    $('a[rel*=facebox]').facebox()
})
//Javascript for Binding Facebox
$(document).bind('reveal.facebox', function() {
    $('#facebox').draggable();
})


// ajax cluetip
$(document).ready(function() {
    $('a.ajax-cluetip').cluetip({width: '400px;', showTitle: false, arrows: true});
});


// pagination
$(function () {
    $('.flickr_pagination1 a').live("click", function () {
        $('.flickr_pagination1').html('Loading Page.....');
        $.get(this.href, null, null, 'script');
        return false;
    });
});

