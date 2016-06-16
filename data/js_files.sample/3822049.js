var path = require('path');
var fs = require('fs');
var util = require('util');
var uglify = require('uglify-js');

var JSDepHandler = require('./depHandlers/JSDepHandler.js');
var HtmlDepHandler = require('./depHandlers/HtmlDepHandler.js');
var TmplDepHandler = require('./depHandlers/TmplDepHandler.js');

var dependencyBuilder = require('./dep.js');

var indexPath = '/home/hsalkaline/workspace/dealerViewer/index.html';
var rootPath = path.dirname(indexPath);
var initialFile = path.basename(indexPath);

var dg = dependencyBuilder.getDependencyGraph({
  rootPath: rootPath,
  initialFile: {
    fileName: initialFile,
    content: fs.readFileSync(indexPath, 'UTF-8')
  },
  fileHandlers: {
    html: new HtmlDepHandler(),
    js: new JSDepHandler(),
    //tmpl: new TmplDepHandler()
  }
});

// var CssBuildHandler = require('./buildHandlers/CssBuildHandler.js');

// var cssBuildHandler = CssBuildHandler();

// cssBuildHandler.handle(dg);

console.log(util.inspect(dg, false, null, true));
