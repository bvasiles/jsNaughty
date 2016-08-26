var normalizeJs = require('..');
var assert = require('chai').assert;
var fs = require('fs');
var path = require('path');

var fixtureFolders = fs.readdirSync(path.resolve(__dirname, 'fixtures'));

function runTest(script1, script2) {
  it(`compare ${script1.name} with ${script2.name}`, () => {
    var norm1 = normalizeJs(script1.content);
    var norm2 = normalizeJs(script2.content);
    assert.strictEqual(norm1, norm2);
  });
}

describe('normalize-javascript', () => {
  fixtureFolders.forEach(folderName => {
    describe(folderName, () => {
      var scriptNames = fs.readdirSync(path.resolve(__dirname, `fixtures/${folderName}`));
      var scripts = scriptNames.map(scriptName => {
        return {
          name: scriptName,
          content: fs.readFileSync(path.resolve(__dirname, `fixtures/${folderName}/${scriptName}`), {
            encoding: 'utf-8'
          })
        };
      });

      scripts.slice(1)
        .forEach(script => {
          runTest(scripts[0], script);
        });
    });
  });

  runTest({
    name: 'leading-lines',
    content: '\n\na'
  }, {
    name: 'trailing-lines',
    content: 'a\n\n'
  });
});
