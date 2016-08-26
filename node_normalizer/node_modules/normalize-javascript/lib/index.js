var babylon = require('babylon');
var generate = require('babel-generator')['default'];
var traverse = require('babel-traverse')['default'];
var jsStringify = require('javascript-stringify');

var VISITED = Symbol();

function normalize (code, options) {
  code = code.replace(/\n+/g, '\n').replace(/^\n/, '');
  var ast = babylon.parse(code, options);
  traverse(ast, {
    enter (path) {
      delete path.node.start;
      delete path.node.end;
    },
    'StringLiteral|DirectiveLiteral' (path) {
      var raw = path.node.extra && path.node.extra.raw;
      if (!raw) return;
      raw = raw.normalize();
      path.node.extra.rawValue = jsStringify(raw);
    },
    Identifier (path) {
      var binding = path.scope.bindings[path.node.name];
      if (!binding || binding[VISITED]) return;
      binding[VISITED] = true;
      var ref = path.scope.generateUid('ref');
      path.scope.rename(path.node.name, ref);
    }
  });
  return generate(ast, { quotes: 'single' }, '').code;
}

module.exports = normalize;
