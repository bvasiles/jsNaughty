/**
 * 文件模块
 */
define(function(require, exports, module) {
    "require:nomunge,exports:nomunge,module:nomunge";
    "use strict";

    var console = require('console');

    //处理错误

    function printError(ex) {
        var msg = '';
        switch (ex.code) {
            case FileError.QUOTA_EXCEEDED_ERR:
                msg = 'QUOTA_EXCEEDED_ERR';
                break;
            case FileError.NOT_FOUND_ERR:
                msg = 'NOT_FOUND_ERR';
                break;
            case FileError.SECURITY_ERR:
                msg = 'SECURITY_ERR';
                break;
            case FileError.INVALID_MODIFICATION_ERR:
                msg = 'INVALID_MODIFICATION_ERR';
                break;
            case FileError.INVALID_STATE_ERR:
                msg = 'INVALID_STATE_ERR';
                break;
            default:
                msg = 'Unknown Error';
                break;
        };
        console.log('Error: ' + ex.code + ' ; ' + msg);
    };

    var option = exports.option = {
        type: 0,
        size: 104857600
    };

    var fileSystem = null;

    /*使用文件系统*/
    var use = exports.use = function(success, error) {
        if (fileSystem && success) {
            return success(fileSystem);
        }
        window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
        if (!window.requestFileSystem) {
            if (error) error();
            return printError('no support file system.');
        }
        window.requestFileSystem(option.type, option.size, function(fs) {
            fileSystem = fs;
            success(fileSystem);
        }, function(ex) {
            if (error) error(ex);
            printError(ex);
        });
    };

});