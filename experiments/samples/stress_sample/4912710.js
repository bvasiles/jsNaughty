////
// Named queries
////

module.exports = function findByAlias(schema, options) {

  var attr = options.attr;
  
  schema.virtual('alias').get(function () {
    return this[attr];
  });

  schema.statics.findByAlias = function (value, callback) {
    var criteria = {};
    criteria[options.attr] = value;
    this.findOne(criteria, callback);
  };
};
