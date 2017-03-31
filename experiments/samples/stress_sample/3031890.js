/* 
Created by Simon de la Rouviere. Mostly listened to the new deadmau5 album while creating this.
AND Roosevelt - Sea! Such a tune.
*/
$.ajaxSetup ({
    // Disable caching of AJAX responses
    cache: false
});

$(document).ready(function(){
    //load links as first one
    $("#content").load('links.html');

    $('#ontheweb').click(function(){
        $('#content').load('links.html');

        $('#proud').removeClass('active');
        $('#ontheweb').addClass('active');
        $('#other').removeClass('active');
        $('#programming').removeClass('active');
        $('#nottheweb').removeClass('active');
        return false; //prevent reloading page
    });

    $('#proud').click(function(){
        $('#content').load('proud.html');

        $('#proud').addClass('active');
        $('#ontheweb').removeClass('active');
        $('#other').removeClass('active');
        $('#programming').removeClass('active');
        $('#nottheweb').removeClass('active');
        return false; //prevent reloading page
    });

    $('#other').click(function(){
        $('#content').load('other.html');

        $('#proud').removeClass('active');
        $('#ontheweb').removeClass('active');
        $('#other').addClass('active');
        $('#programming').removeClass('active');
        $('#nottheweb').removeClass('active');
        return false; //prevent reloading page
    });

    $('#programming').click(function(){
        $('#content').load('programming.html');

        $('#proud').removeClass('active');
        $('#ontheweb').removeClass('active');
        $('#other').removeClass('active');
        $('#programming').addClass('active');
        $('#nottheweb').removeClass('active');
        return false; //prevent reloading page
    });

    $('#nottheweb').click(function(){
        $('#content').load('nottheweb.html');

        $('#proud').removeClass('active');
        $('#ontheweb').removeClass('active');
        $('#other').removeClass('active');
        $('#programming').removeClass('active');
        $('#nottheweb').addClass('active');
        return false; //prevent reloading page
    });
});
