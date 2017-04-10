/*---------	Contact Form  -------*/
 
 $(document).ready(function(){
 
$('#send').click(function(){
 
$.post("mailer.php", $("#contactform").serialize(),  function(response) {
$('#success').html(response);
//$('#success').hide('slow');
});
return false;
 
});
 
});

/*--------- 1.	Input auto-clear -------*/
    $(function(){
    $('input:text, textarea').each(function(){
    var txtval = $(this).val();
    $(this).focus(function(){
    $(this).val('')
    });
    $(this).blur(function(){
    if($(this).val() == ""){
    $(this).val(txtval);
    }
    });
    });
    });



	

	
 

$(document).ready(function(){
$(".featu").hover(
function() {
$(".step p", this).toggleClass("step-hover", 300);

},
function() {
$(".step p", this).toggleClass("step-hover", 300);});

});


$(document).ready(function(){
$(".testi").hover(
function() {
$(".quote img", this).toggleClass("quote-hover", 300);

},
function() {
$(".quote img", this).toggleClass("quote-hover", 300);});

});



 $(function() {
$( "#tabs" ).tabs( { show: { effect: "fade", duration: 500 }});
});

 

$(document).ready(function(){
$("img.b").hover(
function() {
$(this).stop().animate({"opacity": "1","-ms-filter":"progid:DXImageTransform.Microsoft.Alpha(opacity=100)"}, "800");
},
function() {
$(this).stop().animate({"opacity": "0","-ms-filter":"progid:DXImageTransform.Microsoft.Alpha(opacity=0)"}, "fast");
});

});

$(document).ready(function(){
$(".top-button").click(function() {
  $("html, body").animate({ scrollTop: 0 }, 'slow');
  return false;
});
});




