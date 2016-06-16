TwitterBrowser.User = SC.Record.extend({
  userName: SC.Record.attr(String),
  fullName: SC.Record.attr(String),
  location: SC.Record.attr(String),
  bio:      SC.Record.attr(String),
  profileImageUrl: SC.Record.attr(String),
  tweetCount: SC.Record.attr(Number),
  followersCount: SC.Record.attr(Number),
  followingCount: SC.Record.attr(Number),

  tweets: SC.Record.toMany('TwitterBrowser.Tweet', { nested: true }),
});
