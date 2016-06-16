var async = require('async');
var mysql = require('../lib/mysql.js');
var Util = require('../lib/util.js');


///////////////////////  设备  会议 ////////////////////
//type 0：设备  1：会议
/**
 * 获得所有设备、会议
 */
exports.queryAllDevice = function(type,callback){
    mysql.query('select device.*,user.name from device join user on device.user = user.id where device.type =  ?',[type],function(err, devices) {
        callback(err, devices);
    });
};
/**
 * 增加设备、会议
 */
exports.addDevice = function(name,type, callback){
    mysql.update('insert into device(name,type) values(?,?)', [name,type], function(err, info) {
        callback(err, info);
    });
};
/**
 * 更新设备、会议
 */
exports.updateDevice = function(id ,status,return_time,user,type, callback){
    mysql.update('update device set STATUS = ?,RETURN_TIME=?,USER =? where ID = ? and type= ?', [ status,return_time,user,id,type ], function(err, info) {
        callback(err, info);
    });
};
/**
 * 删除设备、会议
 */
exports.deleteDevice = function(id , callback){
    mysql.update('delete from device where id = ?', [id], function(err, info) {
        callback(err, info);
    });
};



