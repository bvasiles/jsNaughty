var VERSION;
VERSION = exports.VERSION = [0, 1, 2];
VERSION.toString = function(){
  return this.join('.');
};
exports.TimeSeriesData = require('./timeseries');
exports.CSVData = require('./csv');