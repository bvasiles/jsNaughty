$(document).ready(function(){

    /* Contains the height of divs that are minimized. Entries ending
       with Large are for categories with their intestants expanded and
       the values are used by the open and close all buttons. */
    originalHeight = new Object(); 

    //Saving objects of often used selectors
    hidden = $('.hidden');  
    kategori = $('.kategori');
    formContainer = $('.formContainer');

    fadeOutTime = 200; //These four varibales determine animation speed
    fadeInTime = 400; 
    openTime = 600;
    closeTime = 400;
    
    $('.loginBox').hide(); //Hidden administrational interface
    $('.submitCancelContainer').hide();
    $('.formContainer').hide();
    $('.yesNoContainer').hide();

    //The fallowing captures the hight of hidden objects and hides them
    hidden.each(function(){
	originalHeight['#' + $(this).attr('id')] = $(this).height();
    });
    kategori.each(function(){
	originalHeight['#' + $(this).attr('id') + 'Large'] = $(this).height();
    });
    $('.child').not(kategori).height(0);
    $(kategori.get().reverse()).each(function(){
	originalHeight['#' + $(this).attr('id')] = $(this).height();
	$(this).height(0);
    });
    hidden.height(0);
    
    bindOpenClose('.X');
    
    $('#PageUnsortedList').delegate('', 'click', function(){
       if($(this).height() != 0){
	   var name = '#' + $(this).attr('id') + 'Div';
	   setTimeout(function(){ $(name).children('.hidden').height(0);}, 400); }
   });

    $('#PageUnsortedList').delegate('.close', 'click', function(){
    	close('.hidden');
    }) 
    $('#PageUnsortedList').delegate('.open', 'click', function(){
    	$('.hidden').each(function(){
    	    var name = '#' + $(this).attr('id');
	    open(name, 'Large');
    	});
    })
			
    $('.admin').click(function(){
	$(this).fadeOut(fadeOutTime);
	setTimeout(function(){$('.loginBox').fadeIn(fadeInTime);}, fadeOutTime);
	$('#Anv').focus();
    });
});

function open(object, addon){
    if(addon == null){
	$(object).animate(
    	    { height: originalHeight[object] }, {
    		duration: openTime,
    		easing: 'easeOutExpo'
    	    })
    }
    else{
	if(originalHeight[object + addon] == null){
	    $(object).animate(
    		{ height: originalHeight[object] }, {
    		    duration: openTime,
    		    easing: 'easeOutExpo'
    		})
	}
	else{
	    $(object).animate(
    		{ height: originalHeight[object + addon] }, {
    		    duration: openTime,
    		    easing: 'easeOutExpo'
    		})
	}
    }
    
    setTimeout(function(){
	$(object).height('auto');
    }, openTime + 100);
}
function close(object){
    $(object).animate(
	{ height: 0 }, {
	    duration: closeTime,
	    easing: 'easeOutExpo'
	})
}

function bindOpenClose(pattern){
    $(pattern).click(function() {
	var name = $(this).attr('id');
    	name = '#' + name + "Div";
	
	$(this).parent().height('auto');
    	if($(name).height() == 0)
    	    open(name);
    	else
	    close(name);
    });
}