module("ReturnStatement");

testCompile(
    "return;", 
    function anonymous() {
        return;
    },
    function anonymous() {
        return promise.unit();
    }
);

testCompile(
    "return value;", 
    function anonymous() {
        return 1;
    },
    function anonymous() {
        return promise.unit(1);
    }
);

