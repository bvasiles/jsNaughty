var first, second, artist, title, duration;
var site = window.location;

/**
 * my own spiffy ajax wrapper
 * because cache should always be false for this kind of stuff
 */
function pajax(u, cb){
    $.ajax({
         url: 'http://'+site.host+':3000/'+u,
         dataType: 'jsonp',
         cache: false,
         jsonpCallback: cb});
}

/**
 * callback functions for jsonp
 */
function init(){
    pajax('info', 'setInit');
    setTimeout("pajax('info', 'checkTime')", 1100);
}

/**
 * set some globals to use in checkTime
 */
function setInit(data){
    artist = unescape(data.artist);
    title = unescape(data.title);
    duration = unescape(data.duration);
    first = unescape(data.elapsed);
}

/**
 * checks to see if times are different (time has increased by 1 second)
 * if not, assumes paused, set state to paused
 */
function checkTime(data){
    if (data != 0){
        second = data.elapsed;

        if (second > first){
            // song is playing, show pause button, info
            $('#loader').fadeOut('fast', function(){
                $('#artist').text(artist);
                $('#title').text(title);
                $('#data, #pause, #next, #prev').fadeIn('fast');
                $('#play').hide();
            });
        }
        else{
            // is paused
            $('#loader').fadeOut('fast', function(){
                $('#title').text('Not Playing');
                $('#data, #play, #next, #prev').fadeIn('fast');
                $('#pause').hide();
            });
        }
    }
    else {
        $('#title').text('An Error Occurred').fadeIn('fast');
    }
}

/**
 * used to set currently playing after a pause
 */
function setPlaying(data){
    artist = unescape(data.artist);
    title = unescape(data.title);
    $('#artist').text(artist);
    $('#title').text(title);
    $('#play').fadeOut('fast', function(){
        $('#data').fadeIn('fast');
        $('#pause').fadeIn('fast');
    });

}

/**
 * used to set artist/title after change
 */
function update(data){
    if (unescape(data.artist) != artist){
        artist = unescape(data.artist);
        $('#artist').fadeOut('fast', function(){
           $('#artist').text(artist).fadeIn('fast');
        });
    }
    if (unescape(data.title) != title){
        title = unescape(data.title);
        $('#title').fadeOut('fast', function(){
           $('#title').text(title).fadeIn('fast');
        });
    }
}

/**
 * used as async callback after next/prev to update currently playing song
 */
function change(data){
    setTimeout("pajax('info', 'update')", 500); // .5 seconds
}

/**
 * used to play or pause the song
 */
function play_pause(){
    pajax('play-pause', 'blank');
}

/**
 * some things just don't need to do anything
 */
function blank(){}

/**
 * interval to check and see which song is still playing (if at all)
 */
setInterval("init()", 5000); // 5 seconds

$(function(){
    $('#play').live('click', function(e){
        e.preventDefault();
        play_pause();
        $('#data').fadeOut('fast', pajax('info', 'setPlaying'));
    });

    $('#pause').live('click', function(e){
        e.preventDefault();
        play_pause();
        $('#data').fadeOut('fast', function(){
           $('#title').text('Not Playing');
           $('#data').fadeIn('fast');
        });
        $('#pause').fadeOut('fast', function(){
           $('#play').fadeIn('fast');
        });
    });

   $("#next").live('click', function(e){
        e.preventDefault();
        pajax('next', 'change');
    });
    $("#prev").live('click', function(e){
        e.preventDefault();
        pajax('prev', 'change');
    });

    /**
     * very first call to set things up.
     * set 'first'
     */
    init();

});
