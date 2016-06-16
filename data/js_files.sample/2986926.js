var Resourceful = require('resourceful-redis')
  , url = require('url');
// A function helper to connect to redis using Heroku's redis url
var connect = function(redis_url) {
  var password, database;
  var parsed_url  = url.parse(redis_url || process.env.REDISTOGO_URL || 'redis://localhost:6379');
  var parsed_auth = (parsed_url.auth || '').split(':');
  
  var redis = require('redis').createClient(parsed_url.port, parsed_url.hostname);

  if (password = parsed_auth[1]) {
    redis.auth(password, function(err) {
      if (err) throw err;
    });
  }
  // Select the right database
  if (database = parsed_auth[0]) {
    redis.select(database);
    redis.on('connect', function() {
      redis.send_anyways = true
      redis.select(database);
      redis.send_anyways = false;
    });
  }

  return(redis);
};

// Get a new redis connection
var redisConnection = exports.redisConnection =  connect('redis://localhost:6379');


var Comment = Resourceful.define('resourceful-redis', function() {
  // Use a Redis Backend for this Model
  this.use('redis', {
    connection: redisConnection,
    namespace: 'comments'
  });

  // The id of the blog_post that this comment is in response to.
  this.string('post_id');
  this.string('author');
  this.string('comment');
  this.string('authorEmail');
  // An array of comment objects. Replies cannot have sub-replies.
  this.array('replies');

  this.timestamps();

});


