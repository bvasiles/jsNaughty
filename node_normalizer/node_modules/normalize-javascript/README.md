# normalize-javascript

Normalize javascript code, useful for comparison

normalizes whitespace, semicolons and variable names.

## Usage

```js
var normalizeJs = require('normalize-javascript');
normalizeJs(`
  var foo = 1;
function bar() {
  return foo
}`);

// Result:
//
// var _ref = 1;
// function _ref2() {
//   return _ref;
// }
`)
