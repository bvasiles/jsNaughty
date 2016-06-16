
var childProcess = require("child_process"),
    utils = require("./utils"),
    _c = require("./conf");

function _getCmd() {
    if (utils.isWindows()) {
        return "don't have time to write windows build scripts, why the hell are you on windows??"; 
    } else {
        console.log(
                "make -f " + _c.DEPENDENCIES_BOOTSTRAP + "/Makefile bootstrap ");
        return "lessc " + _c.ROOT + "less/style.less >" + _c.ROOT + "public/css/style.css && " +
                "make -f " + _c.DEPENDENCIES_BOOTSTRAP + "/Makefile bootstrap ";
    }
}

module.exports = function (prev, baton) {
    baton.take();

    childProcess.exec(_getCmd(), function (error, stdout, stderr) {
        if (error) {
            console.log(stdout);
            console.log(stderr);
            baton.pass(error.code);
        } else {
            baton.pass(prev);
        }
    });
};
