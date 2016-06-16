Handlebars.registerHelper('date', function(time) {
   var date = new Date(time);
   return (date.getMonth() + 1) + "/" + date.getDate();
});

Handlebars.registerHelper('timeago', function(time) {
   time = time.replace(/.*, /, "");
   return $.timeago(time);
});

$(document).ready(function() {
  var eventTemplate = Handlebars.compile($("#event-template").html());
  var tweetTemplate = Handlebars.compile($("#tweet-template").html());

  getMeetupStuff('events', { status: "upcoming,past" }, function(data) {
    var eventsHTML = "";
    var events = data.results;
    events.reverse();

    events.forEach(function(event) {
      var name = event.name.toLowerCase();
      if (name.indexOf("python") == -1
          && name.indexOf("ruby") == -1
          && name.indexOf("rails") == -1
          && name.indexOf("taking") == -1) {
        eventsHTML += (eventTemplate(event));                
      }
    })
    $("#events").html(eventsHTML);
  });
  
  searchTwitter('#wwcode', function(data) {
    var tweetsHTML = "";
    var tweets = data.results;

    tweets.forEach(function(tweet) {
      tweetsHTML += tweetTemplate(tweet);
    });
    $("#tweets").html(tweetsHTML);
  });
})
