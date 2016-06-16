require("../../../include/include.js");

var test = unitTest(function(Future, Async, Bfuture, Bsync) {
    forEach2WithSpy(testInts, testInts, function(ignored, input, spy) {
        checkBfPass(Bsync.constant(input)(ignored), input);
        checkBfFail(Bsync.constantFail(input)(ignored), input);
    });
});