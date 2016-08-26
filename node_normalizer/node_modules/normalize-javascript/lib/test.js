var babylon = require('babylon');
var generate = require('babel-generator')['default'];

function check (code, options) {
  var ast = babylon.parse(code, options);
  console.log(generate(ast, options, code).code);
}

check('"foo"; "bar"; \'baz\'', {});
// output  : "foo";"bar";'baz';
// expected: "foo";"bar";"baz";

check("'foo'; 'bar'; \"baz\"", {});
// output  : 'foo';'bar';"baz";
// expected: 'foo';'bar';'baz';

check('"foo"; "bar"; \'baz\'', { quotes: 'single' });
// output  : "foo";"bar";'baz';
// expected: 'foo';'bar';'baz';

check("'foo'; 'bar'; \"baz\"", { quotes: 'double' });
// output  : 'foo';'bar';"baz";
// expected: "foo";"bar";"baz";
