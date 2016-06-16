module.exports = function (req, res, next) {
  res.status(err.status | 500);
  res.render('5xx.jade', { title: 'Internal Server Error', error: err });
};
