var UglifyJS = require("uglify-js");
var fs = require("fs");
var util = require("util");
var cycle = require('./cycle');

var myArgs = process.argv.slice(2);
var fpath = myArgs[0]
var code = fs.readFileSync(fpath, "utf8");

var toplevel = UglifyJS.parse(code);

toplevel.figure_out_scope();

console.log(JSON.stringify(JSON.decycle(toplevel), undefined, 2))



