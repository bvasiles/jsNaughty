var mongoose = require('mongoose');
var conn = require('../database').getConnection();
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    id          : Schema.ObjectId
    ,username   : String
    ,password   : String
    ,email      : String
});
var UserModel = conn.model("User", UserSchema);

UserModel.prototype.checkPassword = function (password) {
    if (!password) return false;
    
    var crypto = require('crypto');
    var md5 = crypto.createHash('md5');
    md5.update(password);
    return this.password === md5.digest('hex');
};

module.exports = UserModel;