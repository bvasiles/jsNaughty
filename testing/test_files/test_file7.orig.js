var fs = require("../lib/readdirIgnore");

var path = __dirname + "/fixtures/readdirIgnore/", ignoreList = [ ".*", "ignore" ];

describe("readdirIgnore", function() {
    it("callback should receive filenames that does not match any of the patterns within `ignoreList`", function(done) {
        fs.readdirIgnore(path, ignoreList, function(err, file) {
            file.should.not.equal("ignore");
            file.should.not.equal(".ignored");
            file.should.equal("show");
        });
        done();
    });
});
