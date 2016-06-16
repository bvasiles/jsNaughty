define("dist/base/base", [ "../head" ], function(require, exports, module) {
    var head = require("../head");
    head.exec();
    exports.ttt = function(tx) {
        alert(tx);
    };
});

define("dist/head", [], function(require, exports, module) {
    exports.exec = function() {
        alert("全站头部");
    };
});
