var UglifyJS = require("uglify-js");
var fs = require("fs");
var util = require("util");
var cycle = require('./cycle');

//var myArgs = process.argv.slice(2);
//var fpath = myArgs[0]
//var code = fs.readFileSync(fpath, "utf8");

// var toplevel = UglifyJS.parse(code);
// 
// toplevel.figure_out_scope({"screw_ie8": true});
// 
// console.log(JSON.stringify(JSON.decycle(toplevel), undefined, 2))



var stdin = process.openStdin();

var code = "";

stdin.on('data', function(chunk) {
  code += chunk;
  
});

stdin.on('end', function() {

  var toplevel = UglifyJS.parse(code);

  toplevel.figure_out_scope({"screw_ie8": true});

  console.log(JSON.stringify(JSON.decycle(toplevel), undefined, 2))

  //console.log("DATA:\n" + data + "\nEND DATA");
});