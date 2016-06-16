Handlebars.registerHelper('date', function(date) {
  if(date) {
    dateObj = new Date(date);
    return $.timeago(dateObj);
  }
  return 'a long long time ago in a galaxy far away';
});
