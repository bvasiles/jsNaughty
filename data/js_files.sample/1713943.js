var TransformHelper = require('../common').helper('transform_helper');
var helper = TransformHelper.create();

helper.test({
  description:
    'Simple brace test. No wrapping.',
  options:
    {braces: '{\n'},
  input:
    'function(){}',
  expected:
    'function(){}'
});

helper.test({
  description:
    'Simple brace test. Wrapping.',
  options:
    {braces: '{\n'},
  input:
    'function(){\n' +
    '  var foo="bar";\n' +
    '}',
  expected:
    'function(){\n' +
    '  var foo="bar";\n' +
    '}'
});

helper.test({
  description:
    'Simple brace test with \\r\\n as new line.',
  options:
    {braces: '{\r\n'},
  input:
    'function(){\n' +
    '  var foo="bar";\n' +
    '}',
  expected:
    'function(){\r\n' +
    '  var foo="bar";\r\n' +
    '}'
});

helper.test({
  description:
    'Simple brace test. Same line with space.',
  options:
    {braces: ' {\n'},
  input:
    '  function(){\n' +
    '    var foo="bar";\n' +
    '  }',
  expected:
    '  function() {\n' +
    '    var foo="bar";\n' +
    '  }'
});

helper.test({
  description:
    'Simple brace test. Next line.',
  options:
    {braces: '\n{'},
  input:
    '  function(){\n' +
    '    var foo="bar";\n' +
    '  }',
  expected:
    '  function()\n' +
    '  {\n' + 
    '    var foo="bar";\n' +
    '  }'
});

helper.test({
  description:
    'Simple object (no manipulation)',
  options:
    {braces: '{\n'},
  input:
    'a={\n' +
    '  foo:bar,\n' +
    '  bar:baz\n' +
    '};',
  expected:
    'a={\n' +
    '  foo:bar,\n' +
    '  bar:baz\n' +
    '};'
});

helper.test({
  description:
    'Brace test with indentation.',
  options:
    {braces: '{\n'},
  input:
    '  \tfunction(){var foo="bar";}',
  expected:
    '  \tfunction(){var foo="bar";}'
});

helper.test({
  description:
    'Brace test with indentation, statement on two lines.',
  options:
    {braces: '{\n'},
  input:
    '  if(a == b &&\n' +
    '      b == c){\n' +
    '    var foo="bar";\n' +
    '  }',
  expected:
    '  if(a == b &&\n' +
    '      b == c){\n' +
    '    var foo="bar";\n' +
    '  }',
});

helper.test({
  description:
    'Brace test with spacing.',
  options:
    {braces: '{\n'},
  input:
    'function()\t\n' +
    ' {\n' +
    '\t var foo="bar";}',
  expected:
    'function(){\n'+
    '\t var foo="bar";\n' +
    '}'
});

helper.test({
  description:
    'More complex brace test with spacing',
  options:
    {braces: '{\n'},
  input:
    'var func = function()\n' +
    '\n'+
    '  {  /*what*/  switch(foo)  {  case "foo":if(){if(){}}}' +
    '\n};',
  expected:
    'var func = function(){ /*what*/\n' +
    'switch(foo)  {  case "foo":if(){if(){}}}\n'+
    '};'
});

helper.test({
  description:
    'Try/catch test',
  options: { braces: '{\n' },
  input:
    'try {\n' +
    '    var foo = bar;\n' +
    '} catch (err) {\n' +
    '}',
  expected:
    'try{\n' +
    '    var foo = bar;\n' +
    '} catch (err){\n' +
    '\n' +
    '}'
});

helper.test({
  description:
    'if/else indentation test',
  options: { braces: '{\n' },
  input:
    '  if (foo){\n' +
    '    bar=baz;\n' +
    '  } else{\n' + 
    '    baz=bar;\n' +
    '  }',
  expected:
    '  if (foo){\n' +
    '    bar=baz;\n' +
    '  } else{\n' + 
    '    baz=bar;\n' +
    '  }',
});

helper.test({
  description:
    'Braces and comments. Do not remove them.',
  options: { braces: '{\n' },
  input:
    '  if (foo) {\n' +
    '    bar = baz; \/\/ foo?\n' +
    '  }',
  expected:
    '  if (foo){\n' +
    '    bar = baz; \/\/ foo?\n' +
    '  }',
});

helper.test({
  description:
    'Braces and comments (same line). Do not break them.',
  options: { braces: '{\n' },
  input:
    '  if (foo) { /*comment*/\n' +
    '    bar = baz;\n' +
    '  }',
  expected:
    '  if (foo){ /*comment*/\n' +
    '    bar = baz;\n' +
    '  }',
});

helper.test({
  description:
    'Braces and comments (next line). Do not break them.',
  options: { braces: '\n{' },
  input:
    '  if (foo) { // comment\n' +
    '    bar = baz;\n' +
    '  }',
  expected:
    '  if (foo)\n' +
    '  { // comment\n' +
    '    bar = baz;\n' +
    '  }',
});
