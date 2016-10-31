var normalizeJs = require("normalize-javascript");
var fs = require("fs");
var util = require("util");

var myArgs = process.argv.slice(2);
var fpath = myArgs[0]
var rename = myArgs[1] === 'true'

var code = fs.readFileSync(fpath, "utf8");

var s = normalizeJs(code, rename);

console.log(s)
