<!-- with jquery: -->
<!-- $(document).ready(function(){ -->

var outsideOnload = "outsideOnload";
outsideOnloadUndeclared = "outsideOnloadUndeclared";

<!-- without jquery: -->
window.onload = (function(){
/*
module("name");
  test("name", function() {
    ok( arg, "commentToOK"
        + " | ok( arg ) |" );
    strictEqual( 2args, "commentToStrictEqual"
                 + " | strictEqual( 2args ) |" );
  });
*/

var eg = EvolGo;

  eg.assert = function(expr, msg) {
    if (! expr) {
      throw new eg.AssertException(expr, msg);
    }
    return true;
  };

  function throwEx() {
    throw new TypeError();
  }
  function throwEx_2() {
    var str = "string";
    for (var k in str) { }
    return true;
  }
module("Properties (Note: FF debugger has made mistakes for 'for (var key in obj) ..' loops...)");
  
  test("eg.propsSameDeep()", function () {
    var p_1, p_2;

    p_1 = { eins: {} },
    p_2 = { eins: {} };
    ok( eg.propsSameDeep(p_1, p_2), "propsSameDeep"
        + "(" + JSON.stringify(p_1) + ", " + JSON.stringify(p_2) + ")" );

    p_1 = { eins: 1 },
    p_2 = { eins: 1 };
    ok( eg.propsSameDeep(p_1, p_2), "propsSameDeep"
        + "(" + JSON.stringify(p_1) + ", " + JSON.stringify(p_2) + ")" );

    p_1 = { eins: { inner:"42" } },
    p_2 = { eins: { inner:"42" } };
    ok( eg.propsSameDeep(p_1, p_2), "propsSameDeep"
        + "(" + JSON.stringify(p_1) + ", " + JSON.stringify(p_2) + ")" );

    p_1 = { eins: { inner: { inner2: "42" } } },
    p_2 = { eins: { inner: { inner2: "42" } } };
    ok( eg.propsSameDeep(p_1, p_2), "propsSameDeep"
        + "(" + JSON.stringify(p_1) + ", " + JSON.stringify(p_2) + ")" );
    p_1 = { eins: { inner: { inner2: { inner3_1:"42", inner3_2:"97" } } } };
    p_2 = { eins: { inner: { inner2: { inner3_1:"42", inner3_2:"97" } } } };
    ok( eg.propsSameDeep(p_1, p_2), "propsSameDeep"
        + "(" + JSON.stringify(p_1) + ", " + JSON.stringify(p_2) + ")" );

    // ! propsSameDeep()
    p_1 = { eins: { inner: { inner2: "42" } } },
    p_2 = { eins: { inner: { inner2: "4711" } } };
    ok( ! eg.propsSameDeep(p_1, p_2), "! propsSameDeep"
        + "(" + JSON.stringify(p_1) + ", " + JSON.stringify(p_2) + ")" );

    p_1 = { eins: { inner: { inner2: "42" } } },
    p_2 = { eins: { inner: { } } };
    ok( ! eg.propsSameDeep(p_1, p_2), "! propsSameDeep"
        + "(" + JSON.stringify(p_1) + ", " + JSON.stringify(p_2) + ")" );
    p_1 = { eins: { } },
    p_2 = { eins: { inner: { } } };
    ok( ! eg.propsSameDeep(p_1, p_2), "! propsSameDeep"
        + "(" + JSON.stringify(p_1) + ", " + JSON.stringify(p_2) + ")" );
    p_1 = { eins: { inner: { inner2: "42" } } },
    p_2 = { eins: { inner: { inner2: "42", foo:"foo" } } };
    ok( ! eg.propsSameDeep(p_1, p_2), "! propsSameDeep"
        + "(" + JSON.stringify(p_1) + ", " + JSON.stringify(p_2) + ")" );

  }); // test("eg.propsSameDeep()")

  test("eg.propsSame()", function () {
    var p_1, p_2

    p_1 = { name: "one", first: 1, second: 2, third: 3 };
    p_2 = { name: "one", first: 1, second: 2, third: 3 };
    ok( eg.propsSame(p_1, p_2), "propsSame"
        + "(" + JSON.stringify(p_1) + ", " + JSON.stringify(p_2) + ")" );
 
    p_2 = { name: "two", first: 11, second: 22, third: 33 };
    ok( ! eg.propsSame(p_1, p_2), "! propsSame"
        + "(" + JSON.stringify(p_1) + ", " + JSON.stringify(p_2) + ")" );

    p_1 = undefined, p_2 = undefined;
    raises(
      function(){ eg.propsSame(p_1, p_2); }, eg.AssertException,
      "propsSame: assert exception"
        + "(" + JSON.stringify(p_1) + ", " + JSON.stringify(p_2) + ")"
    );
    p_1 = null, p_2 = null;
    raises(
      function(){ eg.propsSame(p_1, p_2); }, eg.AssertException,
      "propsSame: assert exception"
        + "(" + JSON.stringify(p_1) + ", " + JSON.stringify(p_2) + ")"
    );
    p_1 = {}, p_2 = {};
    ok(
      eg.propsSame(p_1, p_2), "propsSame"
        + "(" + JSON.stringify(p_1) + ", " + JSON.stringify(p_2) + ")"
    );
    p_1 = undefined, p_2 = null;
    raises(
      function(){ eg.propsSame(p_1, p_2); }, eg.AssertException,
      "propsSame: assert exception"
        + "(" + JSON.stringify(p_1) + ", " + JSON.stringify(p_2) + ")"
    );
    p_1 = undefined, p_2 = {};
    raises(
      function(){ eg.propsSame(p_1, p_2); }, eg.AssertException,
      "propsSame: assert exception"
        + "(" + JSON.stringify(p_1) + ", " + JSON.stringify(p_2) + ")"
    );
    p_1 = null, p_2 = {};
    raises(
      function(){ eg.propsSame(p_1, p_2); }, eg.AssertException,
      "propsSame: assert exception"
        + "(" + JSON.stringify(p_1) + ", " + JSON.stringify(p_2) + ")"
    );

    p_1 = { eins: {} },
    p_2 = { eins: {} };
    ok( ! eg.propsSame(p_1, p_2), "! propsSame"
        + "(" + JSON.stringify(p_1) + ", " + JSON.stringify(p_2) + ")" );

    p_1 = { 1: 1 },
    p_2 = { "1": 1 };
    ok( eg.propsSame(p_1, p_2), "propsSame: key converted (1->\"1\")"
        + "(" + JSON.stringify(p_1) + ", " + JSON.stringify(p_2) + ")" );
    p_1 = { 1: 1 },
    p_2 = { 1: "1" };
    ok( ! eg.propsSame(p_1, p_2), "! propsSame: val *not* converted (===)"
        + "(" + JSON.stringify(p_1) + ", " + JSON.stringify(p_2) + ")" );

    p_1 = null,
    p_2 = null;
    raises(
      function(){ eg.propsSame(p_1, p_2); }, eg.AssertException,
      "propsSame: assert exception"
        + "(" + JSON.stringify(p_1) + ", " + JSON.stringify(p_2) + ")"
    );
    p_1 = {},
    p_2 = null;
    raises(
      function(){ eg.propsSame(p_1, p_2); }, eg.AssertException,
      "propsSame: assert exception"
        + "(" + JSON.stringify(p_1) + ", " + JSON.stringify(p_2) + ")"
    );
    p_1 = {},
    p_2 = 1;
    raises(
      function(){ eg.propsSame(p_1, p_2); }, eg.AssertException,
      "propsSame: assert exception"
        + "(" + JSON.stringify(p_1) + ", " + JSON.stringify(p_2) + ")"
    );
    p_1 = {},
    p_2 = "str";
    raises(
      function(){ eg.propsSame(p_1, p_2); }, eg.AssertException,
      "propsSame: assert exception"
        + "(" + JSON.stringify(p_1) + ", " + JSON.stringify(p_2) + ")"
    );
    p_1 = {},
    p_2 = /foo/;
    raises(
      function(){ eg.propsSame(p_1, p_2); }, eg.AssertException,
      "propsSame: assert exception"
        + "(" + JSON.stringify(p_1) + ", " + JSON.stringify(p_2) + ")"
    );
    // arrays
    p_1 = [], p_2 = [];
    ok( eg.propsSame(p_1, p_2), "propsSame"
        + "(" + JSON.stringify(p_1) + ", " + JSON.stringify(p_2) + ")" );
    p_1 = [1], p_2 = [1];
    ok( eg.propsSame(p_1, p_2), "propsSame"
        + "(" + JSON.stringify(p_1) + ", " + JSON.stringify(p_2) + ")" );

    p_1 = [1], p_2 = [1, 2];
    ok( ! eg.propsSame(p_1, p_2), "! propsSame"
        + "(" + JSON.stringify(p_1) + ", " + JSON.stringify(p_2) + ")" );

  }); // test("propsSame()")

  test("eg.propOfObjByPath()", function () {
    var emptyObj = { }, emptyPath = [ ];
    var obj = { inner: { inner2: { inner3_1: 1, inner3_2: 2 } } };
    var unsetVar;
    strictEqual( eg.propOfObjByPath(emptyObj, emptyPath), emptyObj, ""
                 + " | strictEqual( eg.propOfObjByPath(emptyObj, emptyPath), emptyObj ) |" );
    strictEqual( eg.propOfObjByPath(emptyObj, ['notThere']), unsetVar, ""
                 + " | strictEqual( eg.propOfObjByPath(emptyObj, ['notThere']), unsetVar ) |" );
    strictEqual( eg.propOfObjByPath(obj, []), obj, ""
                 + " | strictEqual( eg.propOfObjByPath(obj, []), obj ) |" );
    strictEqual( eg.propOfObjByPath(obj, ['notThere']), unsetVar, ""
                 + " | strictEqual( eg.propOfObjByPath(obj, ['notThere']), unsetVar ) |" );
    strictEqual( eg.propOfObjByPath(obj, ['inner', 'inner2', 'inner3_1']), 1, ""
                 + " | strictEqual( eg.propOfObjByPath(obj, ['inner', 'inner2', 'inner3_1']), 1 ) |" );
    strictEqual( eg.propOfObjByPath(obj, ['inner', 'inner2', 'inner3_2']), 2, ""
                 + " | strictEqual( eg.propOfObjByPath(obj, ['inner', 'inner2', 'inner3_2']), 2 ) |" );
    strictEqual( eg.propOfObjByPath(obj, ['inner', 'inner2', 'notThere']), unsetVar, ""
                 + " | strictEqual( eg.propOfObjByPath(obj, ['inner', 'inner2', 'notThere']), unsetVar ) |" );
  });
  test("eg.cloneProps()", function () {
    var emptyObj = { };
    var clone_emptyObj = eg.cloneProps(emptyObj);
    strictEqual( eg.hasProps(emptyObj), false, ""
                 + " | strictEqual( eg.hasProps(emptyObj), false ) |" );
    strictEqual( eg.hasProps(clone_emptyObj), false, ""
                 + " | strictEqual( eg.hasProps(clone_emptyObj), false ) |" );
  });
  test("eg.modifyProps()", function () {
    var obj123 = { 'one': 1, 'two': 2, 'three': 3 };
    var obj, unsetVar;
    ok( obj123, "obj123 to be used as cloned obj: "
        + JSON.stringify(obj123) );

    obj = eg.cloneProps(obj123);
    eg.modifyProps({ 'fourth': 4 }, obj);
    strictEqual( obj['fourth'], 4, "after: eg.modifyProps({ 'fourth': 4 }, obj);"
                 + " | strictEqual( obj['fourth'], 4 ) |" );
    obj = eg.cloneProps(obj123);
    eg.modifyProps({ 'two': 'zwei' }, obj);
    strictEqual( obj['two'], 'zwei', "after: eg.modifyProps({ 'two': 'zwei' }, obj);"
                 + " | strictEqual( obj['two'], 'zwei' |" );
    obj = eg.cloneProps(obj123);
    eg.modifyProps({ 'two': unsetVar }, obj);
    strictEqual( obj['two'], unsetVar, "after: eg.modifyProps({ 'two': unsetVar }, obj);"
                 + " | strictEqual( obj['two'], unsetVar |" );
    strictEqual( obj.hasOwnProperty('two'), false, "after: eg.modifyProps({ 'two': unsetVar }, obj);"
                 + " | strictEqual( obj.hasOwnProperty('two'), false |" );
    obj = eg.cloneProps(obj123);
    eg.modifyProps({ 'two': void 0 }, obj);
    strictEqual( obj['two'], unsetVar, "after: eg.modifyProps({ 'two': void 0 }, obj);"
                 + " | strictEqual( obj['two'], unsetVar |" );
  });

  test("eg.modifyPropsByPath()", function () {
    var objToBeCloned = { inner: { inner2: { inner3_1: 1, inner3_2: 2 } } };
    var obj, unsetVar;
    ok( objToBeCloned, "obj123 to be used as cloned obj: "
        + JSON.stringify(objToBeCloned) );

    obj = eg.cloneProps(objToBeCloned);
    eg.modifyPropsByPath({'inner_2b':'b', 'inner_2c':'c'}, obj, ['inner']);
    ok ( obj['inner']['inner_2b'] === 'b' && obj['inner']['inner_2c'] === 'c',
         "after: eg.modifyPropsByPath({'inner_2b':'b', 'inner_2c':'c'}, obj, ['inner']);"
         + " | ok( obj['inner']['inner_2b'] === 'b' && obj['inner']['inner_2c'] === 'c' ) |" );

    obj = eg.cloneProps(objToBeCloned);
    ok ( obj['inner']['inner2'].hasOwnProperty('inner3_1')
         && obj['inner']['inner2'].hasOwnProperty('inner3_2'),
         "before deleting prop 'inner3_2'");
    eg.modifyPropsByPath({'inner3_2':void 0}, obj, ['inner', 'inner2']);
    ok ( obj['inner']['inner2'].hasOwnProperty('inner3_1')
         && ! obj['inner']['inner2'].hasOwnProperty('inner3_2'),
         "after deleting prop 'inner3_2'" );
  });

// return;

module("filter and map");

  test("eg.map()", function () {
    var arr = [ "one", "two", "three" ];
    var obj = { "one":1, "two":2, "three":3 };
    var fn = function (val, key, coll) {
      return val;
    };

    var resArr, res;
    eg.log("arr:", arr);
    eg.log("obj:", obj);
    resArr = arr.map(fn);
    eg.log("resArr:", resArr);

    eg.log("map()");
    res = eg.map(arr, fn);
    eg.log("res:", res);
    res = eg.map(obj, fn);
    eg.log("res:", res);

    eg.log("mapOwn()");
    res = eg.mapOwn(arr, fn);
    eg.log("res:", res);
    res = eg.mapOwn(obj, fn);
    eg.log("res:", res);

    eg.log("map2keys()");
    res = eg.map2keys(arr, fn);
    eg.log("res:", res);
    res = eg.map2keys(obj, fn);
    eg.log("res:", res);

/* does not exist (so far)
    eg.log("mapOwn2keys()");
    res = eg.mapOwn2keys(arr, fn);
    eg.log("res:", res);
    res = eg.mapOwn2keys(obj, fn);
    eg.log("res:", res);
*/
/* template
    eg.log("map()");
    res = eg.map(arr, fn);
    eg.log("map(arr):", res);
    res = eg.map(obj, fn);
    eg.log("map(obj):", res);
*/

/*
    eg.log("mapA()");
    res = eg.mapA(arr, fn);
    eg.log("res:", res);
    res = eg.mapA(obj, fn);
    eg.log("res:", res);
*/
    eg.log("mapOwn2arr()");
    res = eg.mapOwn2arr(arr, fn);
    eg.log("res:", res);
    res = eg.mapOwn2arr(obj, fn);
    eg.log("res:", res);

    res = eg.associations(arr);
    eg.log("res:", res);
    res = eg.associations(obj);
    eg.log("res:", res);
    res = eg.ownAssociations(arr);
    eg.log("res:", res);
    res = eg.ownAssociations(obj);
    eg.log("res:", res);
    res = eg.keys(arr);
    eg.log("keys(arr):", res);
    res = eg.ownKeys(arr);
    eg.log("ownKeys(arr):", res);
    res = eg.vals(arr);
    eg.log("vals(arr):", res);
    res = eg.ownVals(arr);
    eg.log("ownVals(arr):", res);
    res = eg.vals(obj);
    eg.log("vals(obj):", res);
    res = eg.ownVals(obj);
    eg.log("ownVals(obj):", res);

    res = eg.$A(arr);
    eg.log("$A(arr):", res);
    res = eg.$A(obj);
    eg.log("$A(obj):", res);

    eg.log("map2arr()");
    res = eg.map2arr(arr, fn);
    eg.log("map2arr(arr):", res);
    res = eg.map2arr(obj, fn);
    eg.log("map2arr(obj):", res);

    eg.log("mapOwn2arr()");
    res = eg.mapOwn2arr(arr, fn);
    eg.log("mapOwn2arr(arr):", res);
    res = eg.mapOwn2arr(obj, fn);
    eg.log("mapOwn2arr(obj):", res);

    eg.log("old_map2arr()");
    res = eg.old_map2arr(arr, fn);
    eg.log("old_map2arr(arr):", res);
    res = eg.old_map2arr(obj, fn);
    eg.log("old_map2arr(obj):", res);

    eg.log("new_map2arr()");
    res = eg.new_map2arr(arr, fn);
    eg.log("new_map2arr(arr):", res);
    res = eg.new_map2arr(obj, fn);
    eg.log("new_map2arr(obj):", res);

  });
  test("map2arr() speed", function() {
    var arr = [ "one", "two", "three" ];
    var obj = { "one":1, "two":2, "three":3 };
    var fn = function (val, key, coll) {
      return val;
    };

    var loops = 500000;
    ok ( true, "loops: " + loops );
    var timers = [], timer;
    var i;

    timer = new Timer("old_map2arr(arr)");
    timers.push(timer);
    timer.start();
    for (i = 0; i < loops; ++i) {
      eg.old_map2arr(arr, fn);
    }
    timer.stop();

    timer = new Timer("new_map2arr(arr)");
    timers.push(timer);
    timer.start();
    for (i = 0; i < loops; ++i) {
      eg.new_map2arr(arr, fn);
    }
    timer.stop();

    timer = new Timer("old_map2arr(obj)");
    timers.push(timer);
    timer.start();
    for (i = 0; i < loops; ++i) {
      eg.old_map2arr(obj, fn);
    }
    timer.stop();

    timer = new Timer("new_map2arr(obj)");
    timers.push(timer);
    timer.start();
    for (i = 0; i < loops; ++i) {
      eg.new_map2arr(obj, fn);
    }
    timer.stop();

    stats(timers);
  });

  test("numOfProps() speed", function() {
    var arr = [ "one", "two", "three" ];
    var obj = { "one":1, "two":2, "three":3 };

    var loops = 500000;
    ok ( true, "loops: " + loops );
    var timers = [], timer;
    var i;

    timer = new Timer("numOfProps()");
    timers.push(timer);
    timer.start();
    for (i = 0; i < loops; ++i) {
      eg.numOfProps(obj);
    }
    timer.stop();

    timer = new Timer("numOfProps_alt()");
    timers.push(timer);
    timer.start();
    for (i = 0; i < loops; ++i) {
      eg.numOfProps_alt(obj);
    }
    timer.stop();

    stats(timers);
  });
  test("numOfOwnProps() speed", function() {
    var arr = [ "one", "two", "three" ];
    var obj = { "one":1, "two":2, "three":3 };

    var loops = 500000;
    ok ( true, "loops: " + loops );
    var timers = [], timer;
    var i;

    timer = new Timer("numOfOwnProps()");
    timers.push(timer);
    timer.start();
    for (i = 0; i < loops; ++i) {
      eg.numOfOwnProps(obj);
    }
    timer.stop();

    timer = new Timer("numOfOwnProps_alt()");
    timers.push(timer);
    timer.start();
    for (i = 0; i < loops; ++i) {
      eg.numOfOwnProps_alt(obj);
    }
    timer.stop();

    stats(timers);
  });

module("Language extensions in EvolGo namespace");

  test("'Object.create()' as eg.create(obj)", function() {
    ok ( eg.create, "eg.create : " + eg.create );
  });


module("Util");
  var undefinedDeclared; // remains undefined
  var func = function () { };
  var boolTrue = true;
  var boolFalse = false;
  var obj = { };
  var str = "aString";
  var num = 4711;
  var arr = [ ];
  var regex = /foo/;

  var defaultResults = {
    undefinedVal: false,
    null: false,
    func: false,
    obj: false,
    boolTrue: false,
    boolFalse: false,
    strEmpty: false,
    str: false,
    zero: false,
    num: false,
    arr: false,
    regex: false
  };
  var toBeChecked = {
    undefinedVal: undefined,
    null: null,
    func: func,
    obj: { },
    boolTrue: true,
    boolFalse: false,
    strEmpty: "",
    str: str,
    zero: 0,
    num: num,
    arr: arr,
    regex: regex
  };
  var toBeCheckedKeys = [
    "undefinedVal",
    "null",
    "func",
    "obj",
    "boolTrue",
    "boolFalse",
    "strEmpty",
    "str",
    "zero",
    "num",
    "arr",
    "regex"
  ];
  function checkTypecheck(name, trueResults) {
    var mergedResults = eg.create(defaultResults);
    var i, len;
    var key, arg;
    var argStringifiedOrArg;
    eg.copyProps(trueResults, mergedResults);
    for (i = 0, len = toBeCheckedKeys.length; i < len; ++i) {
      key = toBeCheckedKeys[i];
      arg = toBeChecked[key];
      argStringifiedOrArg = JSON.stringify(arg) || arg;
      eg.assert(typeof mergedResults[key] !== 'undefined');
      strictEqual(eg[name](arg), mergedResults[key],
                  "| strictEqual( eg." + name + "(" + argStringifiedOrArg
                  + "), " + mergedResults[key] +" ) |");
    }
  }
  // let it verbose but direct, because undefined vars may be special
  test("eg.isUndefined()", function() {
    strictEqual( eg.isUndefined(void 0), true,
                 " | strictEqual( eg.isUndefined(void 0), true ) |" );
    strictEqual( eg.isUndefined(undefined), true,
                 " | strictEqual( eg.isUndefined(undefined), true ) |" );
    strictEqual( eg.isUndefined(null), false,
                 " | strictEqual( eg.isUndefined(null), false ) |" );
    strictEqual( eg.isUndefined(function () { }), false,
                 " | strictEqual( eg.isUndefined(function () { }), false ) |" );
    strictEqual( eg.isUndefined({ }), false,
                 " | strictEqual( eg.isUndefined({ }), false ) |" );
    strictEqual( eg.isUndefined(false), false,
                 " | strictEqual( eg.isUndefined(false), false ) |" );
    strictEqual( eg.isUndefined(true), false,
                 " | strictEqual( eg.isUndefined(true), false ) |" );
    strictEqual( eg.isUndefined(""), false,
                 " | strictEqual( eg.isUndefined(\"\"), false ) |" );
    strictEqual( eg.isUndefined("aString"), false,
                 " | strictEqual( eg.isUndefined(\"aString\"), false ) |" );
    strictEqual( eg.isUndefined(0), false,
                 " | strictEqual( eg.isUndefined(0), false ) |" );
    strictEqual( eg.isUndefined(4711), false,
                 " | strictEqual( eg.isUndefined(4711), false ) |" );
    strictEqual( eg.isUndefined(undefinedDeclared), true,
                 " | strictEqual( eg.isUndefined(undefinedDeclared), true ) |" );
    strictEqual( eg.isUndefined(obj.undefinedProp), true,
                 " | strictEqual( eg.isUndefined(obj.undefinedProp), true ) |" );
    strictEqual( eg.isUndefined(func), false,
                 " | strictEqual( eg.isUndefined(func), false ) |" );
    strictEqual( eg.isUndefined(obj), false,
                 " | strictEqual( isUndefined(obj), false ) |" );
    strictEqual( eg.isUndefined(boolFalse), false,
                 " | strictEqual( eg.isUndefined(boolFalse), false ) |" );
    strictEqual( eg.isUndefined(boolTrue), false,
                 " | strictEqual( eg.isUndefined(boolTrue), false ) |" );
    strictEqual( eg.isUndefined(str), false,
                 " | strictEqual( eg.isUndefined(str), false ) |" );
    strictEqual( eg.isUndefined(num), false,
                 " | strictEqual( eg.isUndefined(num), false ) |" );
    strictEqual( eg.isUndefined(arr), false,
                 " | strictEqual( eg.isUndefined(arr), false ) |" );
  });
  test("eg.isNull()", function() {
    var trueResults = { null: true };
    checkTypecheck("isNull", trueResults);
  });
  // standard
  test("eg.isFunction()", function() {
    var trueResults = { func: true };
    checkTypecheck("isFunction", trueResults);
  });
  test("eg.isObject()", function() {
    var trueResults = { null: true, obj: true, arr: true, regex: true };
    checkTypecheck("isObject", trueResults);
  });
  test("eg.isBoolean()", function() {
    var trueResults = { boolTrue: true, boolFalse: true };
    checkTypecheck("isBoolean", trueResults);
  });
  test("eg.isString()", function() {
    var trueResults = { strEmpty: true, str: true };
    checkTypecheck("isString", trueResults);
  });
  test("eg.isNumber()", function() {
    var trueResults = { zero: true, num: true };
    checkTypecheck("isNumber", trueResults);
  });
  test("eg.isRegExp()", function() {
    var trueResults = { regex: true };
    checkTypecheck("isRegExp", trueResults);
  });
  // 'object' null variants
  test("eg.isObjectOrNull()", function() {
    strictEqual( eg.isObjectOrNull, eg.isObject, "typeof null === 'object'"
                 + " | strictEqual( eg.isObjectOrNull, eg.isObject ) |" );    
  });
  test("eg.isObjectNotNull()", function() {
    var trueResults = { obj: true, arr: true, regex: true };
    checkTypecheck("isObjectNotNull", trueResults);
  });
  test("eg.isObjectNotNullNotRegExp()", function() {
    var trueResults = { obj: true, arr: true };
    checkTypecheck("isObjectNotNullNotRegExp", trueResults);
  });
  test("eg.isProper()", function() {
    var trueResults = { obj: true, arr: true };
    checkTypecheck("isProper", trueResults);
  });

  // isNil(arg): true, if arg is undefined or null
  //
  test("eg.isNil()", function() {
    var trueResults = { undefinedVal: true, null: true };
    checkTypecheck("isNil", trueResults);
  });

  // isNilOr*()
  //
  test("eg.isNilOrFunction()", function() {
    var trueResults = { undefinedVal: true, null: true, func: true };
    checkTypecheck("isNilOrFunction", trueResults);
  });
  test("eg.isNilOrObject()", function() {
    var trueResults = { undefinedVal: true, null: true, obj: true, arr: true,
                        regex: true };
    checkTypecheck("isNilOrObject", trueResults);
  });
  test("eg.isNilOrBoolean()", function() {
    var trueResults = { undefinedVal: true, null: true,
                        boolTrue: true, boolFalse: true };
    checkTypecheck("isNilOrBoolean", trueResults);
  });
  test("eg.isNilOrString()", function() {
    var trueResults = { undefinedVal: true, null: true,
                        strEmpty: true, str: true };
    checkTypecheck("isNilOrString", trueResults);
  });
  test("eg.isNilOrNumber()", function() {
    var trueResults = { undefinedVal: true, null: true, zero: true, num: true };
    checkTypecheck("isNilOrNumber", trueResults);
  });

  // isNullOr*()
  //
  test("eg.isNullOrFunction()", function() {
    var trueResults = { null: true, func: true };
    checkTypecheck("isNullOrFunction", trueResults);
  });
  test("eg.isNullOrObject()", function() {
    strictEqual( eg.isNullOrObject, eg.isObjectOrNull, "aequivalence"
                 + " | strictEqual( eg.isNullOrObject, eg.isObjectOrNull ) |" );
  });
  test("eg.isNullOrBoolean()", function() {
    var trueResults = { null: true, boolTrue: true, boolFalse: true };
    checkTypecheck("isNullOrBoolean", trueResults);
  });
  test("eg.isNullOrString()", function() {
    var trueResults = { null: true, strEmpty: true, str: true };
    checkTypecheck("isNullOrString", trueResults);
  });
  test("eg.isNullOrNumber()", function() {
    var trueResults = { null: true, zero: true, num: true };
    checkTypecheck("isNullOrNumber", trueResults);
  });

  // isArrayLike()
  //
  test("eg.isArrayLike()", function() {
    var trueResults = { arr: true };
    checkTypecheck("isArrayLike", trueResults);
  });

  // in set of given extra args
  //
  test("eg.isOneOfNextArgs()", function() {
    ok( eg.isOneOfNextArgs(1, 1, 2, 3), ""
        + " | ok( eg.isOneOfNextArgs(1, 1, 2, 3) ) |" );
    ok( eg.isOneOfNextArgs(1, 2, 1, 3), ""
        + " | ok( eg.isOneOfNextArgs(1, 2, 1, 3) ) |" );
    ok( eg.isOneOfNextArgs(1, 2, 3, 1), ""
        + " | ok( eg.isOneOfNextArgs(1, 2, 3, 1) ) |" );

    ok( eg.isOneOfNextArgs(null, null), ""
        + " | ok( eg.isOneOfNextArgs(null, null) ) |" );
    ok( eg.isOneOfNextArgs(null, 1, null), ""
        + " | ok( eg.isOneOfNextArgs(null, 1, null) ) |" );
    ok( ! eg.isOneOfNextArgs(null, 1, 2), ""
        + " | ok( ! eg.isOneOfNextArgs(null, 1, 2) ) |" );
    ok( ! eg.isOneOfNextArgs(null), ""
        + " | ok( ! eg.isOneOfNextArgs(null) ) |" );

    ok( ! eg.isOneOfNextArgs(1), ""
        + " | ok( ! eg.isOneOfNextArgs(1) ) |" );
    ok( ! eg.isOneOfNextArgs(1, 2), ""
        + " | ok( ! eg.isOneOfNextArgs(1, 2) ) |" );
    ok( ! eg.isOneOfNextArgs(1, 2, 3), ""
        + " | ok( ! eg.isOneOfNextArgs(1, 2, 3) ) |" );

    ok( eg.isOneOfNextArgs(void 0, void 0), ""
        + " | ok( eg.isOneOfNextArgs(void 0, void 0) ) |" );
    ok( ! eg.isOneOfNextArgs(void 0), ""
        + " | ok( ! eg.isOneOfNextArgs(void 0) ) |" );
    ok( ! eg.isOneOfNextArgs(void 0, 1), ""
        + " | ok( ! eg.isOneOfNextArgs(void 0, 1) ) |" );
    ok( ! eg.isOneOfNextArgs(void 0, null), ""
        + " | ok( ! eg.isOneOfNextArgs(void 0, null) ) |" );
  });

  test("isUndefined() speed", function() {
    var loops = 1000000;
    var obj = { };
    var u; // remains undefined
    ok ( true, "loops: " + loops );
    var timers = [], timer;
    var i;
    var isUndefined = eg.isUndefined;

    timer = new Timer("isUndefined(obj)");
    timers.push(timer);
    timer.start();
    for (i = 0; i < loops; ++i) {
      isUndefined(obj);
    }
    timer.stop();

    timer = new Timer("isUndefined(u)");
    timers.push(timer);
    timer.start();
    for (i = 0; i < loops; ++i) {
      isUndefined(u);
    }
    timer.stop();

    stats(timers);
  });



module("Channel");

  LoggingListener = function(name) {
    this.name = name || "";
  };
  //
  LoggingListener.prototype.toString = function() {
    return "LoggingListener '" + this.name + "'";
  };
  LoggingListener.prototype.receiveFrom = function(msg, from) {
    ok( true, "msg: " + JSON.stringify(msg)
        + "; from: " + JSON.stringify(from) + "; to: " + this );
  };
 
  test("creating a Channel", function() {
    var channel = new eg.Channel();
     ok( channel, "channel created"
        + " | ok( channel ) |" );
  });
  test("adding/removing a listener", function() {
    var c = new eg.Channel();
    var l = { receiveFrom: function(){} };
    strictEqual( c.numOfListeners(), 0, "before adding a listener"
                 + " | strictEqual( c.numOfListeners(), 0 ) |" );
    c.addListener(l);
    strictEqual( c.numOfListeners(), 1, "after adding one listener"
                 + " | strictEqual( c.numOfListeners(), 1 ) |" );
    c.removeListener("not existing listener");
    strictEqual( c.numOfListeners(), 1,
                 "after removing not existing listener (nothing should have changed)"
                 + " | strictEqual( c.numOfListeners(), 1 ) |" );
    c.removeListener(l);
    strictEqual( c.numOfListeners(), 0, "after removing only listener"
                 + " | strictEqual( c.numOfListeners(), 0 ) |" );
  });
  //
  test("one listener", function() {
    var c = new eg.Channel();
    var loggingListener = new LoggingListener("first");
    c.addListener(loggingListener);
    c.sendFrom("msg", "someSender");
  });
  test("two listeners", function() {
    var c = new eg.Channel();
    c.addListener(new LoggingListener("first"));
    c.addListener(new LoggingListener("second"));
    c.sendFrom("msg", "someSender");
  });
  function addListenersToChannel(count, channel) {
    for (var i = 0; i < count; ++i) {
      channel.addListener(new LoggingListener(i.toString()));
    }
  }
  test("ten listeners: check numOf*()", function() {
    var c = new eg.Channel();
    strictEqual( c.numOfListeners(), 0, "no listeners at beginning"
                 + " | strictEqual( c.numOfListeners(), 0 ) |" );
    strictEqual( c.numOfSends(), 0, "no sends at beginning"
                 + " | strictEqual( c.numOfSends(), 0 ) |" );
    strictEqual( c.numOfReceives(), 0, "no receives at beginning"
                 + " | strictEqual( c.numOfReceives(), 0 ) |" );
    addListenersToChannel(10, c);
    strictEqual( c.numOfListeners(), 10, "listener count OK after adding a few"
                 + " | strictEqual( c.numOfListeners(), 10 ) |" );
    c.sendFrom("msg 1", "someSender");
    strictEqual( c.numOfSends(), 1, "send count after 1. send"
                 + " | strictEqual( c.numOfSends(), 1 ) |" );
    strictEqual( c.numOfReceives(), 10, "receive count after 1. send"
                 + " | strictEqual( c.numOfReceives(), 10 ) |" );
    c.sendFrom("msg 2", "someSender");
    strictEqual( c.numOfSends(), 2, "send count after 2. send"
                 + " | strictEqual( c.numOfSends(), 1 ) |" );
    strictEqual( c.numOfReceives(), 20, "receive count after 2. send"
                 + " | strictEqual( c.numOfReceives(), 10 ) |" );
  });
  test("storing messages", function() {
    var c = new eg.Channel();
    addListenersToChannel(2, c);
    strictEqual( c.numOfStoredMessages(), 0,
                 "stored messages count zero at beginning"
                 + " | strictEqual( c.numOfStoredMessages(), 0 ) |" );
    ok( ! c.isStoringMessages(), "default: channel not storing messages"
        + " | ok( ! c.isStoringMessages() ) |" );
    c.startStoringMessages();
    ok( c.isStoringMessages(), "channel storing messages"
        + " | ok( c.isStoringMessages() ) |" );
    c.sendFrom("msg 1", "someSender");
    c.sendFrom("msg 2", "someSender");
    strictEqual( c.numOfStoredMessages(), 2,
                 "stored messages count as expected"
                 + " | strictEqual( c.numOfStoredMessages(), 2 ) |" );
    var sms = c.getStoredMessages();
    strictEqual( sms.length, c.numOfStoredMessages(),
                 "gotten stored messages arr " + JSON.stringify(sms)
                 + " has expected length"
                 + " | strictEqual( sms.length, c.numOfStoredMessages() ) |" );
    c.stopStoringMessages();
    ok( ! c.isStoringMessages(), "switched off: channel not storing messages"
        + " | ok( ! c.isStoringMessages() ) |" );
    c.sendFrom("msg 3", "someSender");
    strictEqual( c.numOfStoredMessages(), sms.length,
                 "no further messages stored ('msg 3' omitted)"
                 + " | strictEqual( c.numOfStoredMessages(), sms.length ) |" );
    c.startStoringMessages();
    c.sendFrom("msg 4", "someSender");
    strictEqual( c.numOfStoredMessages(), 3,
                 "fourth message stored after switching storing on again: "
                 + JSON.stringify(c.getStoredMessages())
                 + " | strictEqual( c.numOfStoredMessages(), 3 ) |" );
    strictEqual( c.numOfSends(), 4, ""
                 + " | strictEqual( c.numOfSends(), 4 ) |" );
    strictEqual( c.numOfReceives(), 8, ""
                 + " | strictEqual( c.numOfReceives(), 8 ) |" );
    c.clearStoredMessages();
    strictEqual( c.numOfStoredMessages(), 0,
                 "zero stored messages after clearStoredMessages()"
                 + JSON.stringify(c.getStoredMessages())
                 + " | strictEqual( c.numOfStoredMessages(), 0 ) |" );

 });

 
module("EvolGo");

  var eg = EvolGo;

  test("EvolGo namespace", function() {
    ok ( EvolGo, "EvolGo namespace exists" );
    ok ( EvolGo === window.EvolGo, "EvolGo === window.EvolGo -> EvolGo is global prop/var" );
  });

  test("EvolGo.shared object", function() {
    ok( eg.shared, "eg.shared exists"
        + " | ok( eg.shared ) |" );
  });

  test("eg.log", function () {
    ok (typeof eg.log === 'function', "typeof eg.log === 'function'");
    eg.log("eg.log() available: now we are able to log ;-)");
  });

  test("assert in development mode", function() {
    strictEqual( eg.shared.productionMode, false, "in development mode"
                 + " | strictEqual( eg.shared.productionMode, false ) |" );
    eg.assert(true, 'assertion failed');
    ok (true, "should not stop for true assertions");

    ok (true, "[test switched off] failing assertion: not checked (to keep tests running)!");
    /*
    eg.assert(false, 'assertion failed');
    ok (true, "failing assertion: should be here after continuing in debugger");
    //*/
  });
  test("assert in productionMode", function() {
    eg.shared.productionMode = true;
    eg.assert(true, 'assertion failed');
    ok (true, "should not stop for true assertion");
    try {
      eg.assert(false, '[ignore: qunit test (expected exception)] assertion failed');
    } catch (e) {
      ok ( e, "failing assertion: exception '" + e + "' catched." );
    }
    eg.shared.productionMode = false;
  });

module("Scopes");

  test("misc", function () {
  });

  var thisInOnload = this;
  var varInOnload = "varInOnload";
  undeclaredVarInOnload = "undeclaredVarInOnload";
  test("scopes", function () {
    //ok (this.eg);
    eg.log("scopes this: ", this);
    ok ( window.outsideOnload, "window.outsideOnload -> var declared outside window.onload() becomes window.prop with global scope" );
    ok ( window.outsideOnloadUndeclared, "window.outsideOnloadUndeclared -> var undeclared outside window.onload() becomes window prop with global scope" );
    ok ( undeclaredVarInOnload && undeclaredVarInOnload === window.undeclaredVarInOnload,
         "undeclaredVarInOnload && undeclaredVarInOnload === window.undeclaredVarInOnload -> undeclared var in function has global scope (if not declared in outer scopes)" );
    ok ( varInOnload !== window.varInOnload, "varInOnload !== window.varInOnload -> declared var in function has local scope (always)" );
    ok ( thisInOnload === window, "thisInOnload === window -> this in window.onload() is the window global object");
  });

  test("undefined, null", function () {
    var obj = { };
    ok (typeof 'undefined' === 'string', "typeof 'undefined' === 'string'");
    ok (undefined != 'undefined', "undefined != 'undefined'");
    ok (typeof undefined === 'undefined', "typeof undefined === 'undefined'");
    ok (obj.unknownProp === undefined, "obj.unknownProp === undefined");
    ok (typeof obj.unknownProp === 'undefined', "typeof obj.unknownProp === 'undefined'");
    ok (obj.unknownProp !== 'undefined', "obj.unknownProp !== 'undefined'");
    ok (typeof null === 'object', "typeof null === 'object'");
  });
  test("example: show properties", function() {
    var obj = eg.Point.xy(1,2);
    obj.z = 4711;
    eg.log("### props in obj ###")
    var propsString = "";
    for (var prop in obj) {
      propsString += " "; propsString += prop;
    }
    eg.log(propsString);
    eg.log("### own props in obj ###");
    propsString = "";
    for (var prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        propsString += " "; propsString += prop;
      }
      obj.hasOwnProperty(prop)
        && ok (prop === 'x' || prop === 'y' || prop === 'z', "ownProperty: " + prop);
    }
    eg.log(propsString);
  });


module("bind*()");

test("arguments", function() {
  function funWithArgsReturningArguments(arg1, arg2, arg3) {
    eg.log(this, arg1, arg2, arg3);
    return arguments;
  };
  var arg1 = "one", arg2 = "two", arg3 = "three";
  eg.log( typeof funWithArgsReturningArguments(arg1, arg2, arg3).constructor,
          typeof [ arg1, arg2, arg3 ].constructor );
  var arr = [ arg1, arg2, arg3 ];
  var res = funWithArgsReturningArguments(arg1, arg2, arg3);
  ok ( res[0] === arr[0] && res[1] == arr[1] && res[2] == arr[2] );
  // but not the Array-like objects:
  notDeepEqual ( res, arr );
});

test("eg.bindThisNArgs()", function() {
  function funWithArgsAndLastArg(arg1, arg2, arg3, lastArg) {
    eg.log(this, arg1, arg2, arg3, lastArg);
    return arguments;
  };
  var arg1 = "one", arg2 = "two", arg3 = "three";
  var funcWithBoundArgs = eg.bindThisNArgs(funWithArgsAndLastArg, this, arg1, arg2, arg3);
  deepEqual ( eg.$A(funcWithBoundArgs()), [ arg1, arg2, arg3 ] );
  deepEqual ( eg.$A(funcWithBoundArgs("aString")), [ arg1, arg2, arg3, "aString" ] );
  deepEqual ( eg.$A(funcWithBoundArgs(true)), [ arg1, arg2, arg3, true ] );
  deepEqual ( eg.$A(funcWithBoundArgs()), [ arg1, arg2, arg3 ] );
});

// wrong bind example:
EvolGo.testBindThisNArgsWrong = function () {
  var args = eg.$A(arguments), func = args.shift(), object = args.shift();
  return function () {
    return func.apply(object, (args.length
                               ? args.concat(arguments)
                               : arguments));
  }
};
test("eg.bindThisNArgsWrong()", function() {
  function funWithArgsAndLastArg(arg1, arg2, arg3, lastArg) {
    eg.log(this, arg1, arg2, arg3, lastArg);
    return arguments;
  };
  var arg1 = "one", arg2 = "two", arg3 = "three";
  var funcWithBoundArgs = eg.testBindThisNArgsWrong(funWithArgsAndLastArg, this, arg1, arg2, arg3);
  notDeepEqual ( eg.$A(funcWithBoundArgs("aString")), [ arg1, arg2, arg3, "aString" ] );
  notDeepEqual ( eg.$A(funcWithBoundArgs(true)), [ arg1, arg2, arg3, true ] );
  notDeepEqual ( eg.$A(funcWithBoundArgs()), [ arg1, arg2, arg3 ] );
  // Comparison of last argument in result is OK by converting it into an Array, but nevertheless: this is not
  // what we want (last argument shouldn't be an Array-like object in the result).
  deepEqual ( eg.$A(funcWithBoundArgs("aString")[3]), ["aString"] );
  deepEqual ( eg.$A(funcWithBoundArgs(true)[3]), [true] );
  deepEqual ( eg.$A(funcWithBoundArgs()[3]), [ ] );
});


module("Geometrics");

  test("Point", function() {
    var pNaN = eg.Point.xy(0/0,0/0);
    var p1 = eg.Point.xy(1,2);
    var p2 = eg.Point.xy(1,2);
    ok( pNaN, ""+pNaN
        + " | ok( pNaN ) |" );
    ok( p1, ""+p1
        + " | ok( p1 ) |" );
    ok( p2, ""+p2
        + " | ok( p2 ) |" );
    strictEqual( eg.Point.xy(0/0,0/0).toString(), 'Point(NaN,NaN)', ""
                 + " | eg.Point(0/0,0/0).toString(), 'Point(NaN,NaN)' ) |" );
    strictEqual( eg.Point.zero().toString(), 'Point(0,0)', ""
                 + " | strictEqual( eg.Point.zero().toString(), 'Point(0,0)' ) |" );
    strictEqual( p1, p1, "same instance"
                 + " | strictEqual( p1, p1 ) |" );
    notStrictEqual( p1, p2, "two instances with same vals are notStrictEqual"
                    + " | notStrictEqual( p1, p2 ) |" );
    strictEqual( p1.x, p2.x, "vals of two instances with same vals are strictEqual"
                 + " | strictEqual( p1.x, p2.x ) |" );
    strictEqual( p1.y, p2.y, "vals of two instances with same vals are strictEqual"
                 + " | strictEqual( p1.y, p2.y ) |" );
    strictEqual( p1.equals(p2), true, "vals of two instances with same vals can be compared with equals()"
                 + " | strictEqual( p1.equals(p2), true ) |" );
  });
  test("Rect", function() {
    var extent = eg.Point.xy(10,10);
    var corner = extent;
    var rect = new eg.Rect(eg.Point.zero(), extent);
    var r1a = new eg.Rect(eg.Point.xy(1,2), eg.Point.xy(3,4));
    var r1b = new eg.Rect(eg.Point.xy(1,2), eg.Point.xy(3,4));
    var r2 = new eg.Rect(eg.Point.xy(4,3), eg.Point.xy(2,1));
    var rectFromCorner = eg.Rect.originCorner(eg.Point.zero(), extent);
    var rectFromCorner_2 = eg.Rect.originCorner(eg.Point.xy(1,1), corner);
    var r0_0__10_10 = new eg.Rect(eg.Point.xy(0,0), eg.Point.xy(10,10));
    var r8_8__4_4 = new eg.Rect(eg.Point.xy(8,8), eg.Point.xy(4,4));
    var r8_8__2_2 = new eg.Rect(eg.Point.xy(8,8), eg.Point.xy(2,2));
    var r0_0__12_12 = new eg.Rect(eg.Point.xy(0,0), eg.Point.xy(12,12));
    var r5_5__1_1 = new eg.Rect(eg.Point.xy(5,5), eg.Point.xy(1,1));
    ok( extent, ""+extent
        + " | ok( extent ) |" );
    ok( rect, ""+rect
        + " | ok( rect ) |" );
    ok( r1a, ""+r1a
        + " | ok( r1a ) |" );
    ok( r1b, ""+r1b
        + " | ok( r1b ) |" );
    ok( r2, ""+r2
        + " | ok( r2 ) |" );
    ok( rectFromCorner, ""+rectFromCorner
        + " | ok( rectFromCorner ) |" );
    ok( rectFromCorner_2, ""+rectFromCorner_2
        + " | ok( rectFromCorner_2 ) |" );
    strictEqual( rect.origin(), eg.Point.zero(), ""
                 + " | strictEqual( rect.origin(), eg.Point.zero() ) |" );
    strictEqual( rect.extent().x, extent.x, ""
                 + " | strictEqual( rect.extent().x, extent.x ) |" );
    strictEqual( rect.extent().y, extent.y, ""
                 + " | strictEqual( rect.extent().y, extent.y ) |" );
    strictEqual( rect.toString(), 'Rect(origin: Point(0,0), extent: Point(10,10))', ""
                 + " | strictEqual( rect.toString(), 'Rect(origin: Point(0,0), extent: Point(10,10))' ) |" );
    strictEqual( rectFromCorner.toString(), 'Rect(origin: Point(0,0), extent: Point(10,10))', ""
                 + " | strictEqual( rectFromCorner.toString(), 'Rect(origin: Point(0,0), extent: Point(10,10))' ) |" );
    strictEqual( rectFromCorner_2.toString(), 'Rect(origin: Point(1,1), extent: Point(9,9))', ""
                 + " | strictEqual( rectFromCorner_2.toString(), 'Rect(origin: Point(1,1), extent: Point(9,9))' ) |" );
    strictEqual( r1a.equals(r1b), true, "Rects of two instances with equal Points can be compared with equals()"
                 + " | strictEqual( r1a.equals(r1b), true ) |" );
    strictEqual( r1a.equals(r2), false, "Rects of two instances with equal Points can be compared with equals()"
                 + " | strictEqual( r1a.equals(r2), false ) |" );

    strictEqual( r0_0__10_10.intersection(r5_5__1_1).equals(r5_5__1_1), true,
                 "intersection"
                 + " | strictEqual( r0_0__10_10.intersection(r5_5__1_1).equals(r5_5__1_1), true ) |" );
    strictEqual( r0_0__10_10.union(r5_5__1_1).equals(r0_0__10_10), true,
                 "union"
                 + " | strictEqual( r0_0__10_10.union(r5_5__1_1).equals(r0_0__10_10), true ) |" );
    strictEqual( r0_0__10_10.intersection(r8_8__4_4).equals(r8_8__2_2), true,
                 "intersection"
                 + " | strictEqual( r0_0__10_10.intersection(r8_8__4_4).equals(r8_8__2_2), true ) |" );
    strictEqual( r0_0__10_10.union(r8_8__4_4).equals(r0_0__12_12), true,
                 "union"
                 + " | strictEqual( r0_0__10_10.union(r8_8__4_4).equals(r0_0__12_12), true ) |" );

    strictEqual( r5_5__1_1.intersection(r8_8__4_4) === null, true,
                 "intersection"
                 + " | strictEqual( r5_5__1_1.intersection(r8_8__4_4) === null, true ) |" );


/*
    strictEqual( 2args, "commentToStrictEqual"
                 + " | strictEqual( 2args ) |" );
*/    
  });
  test("Line()", function() {
    strictEqual( new eg.Line(1,2,3).toString(), 'Line(A:1,B:2,C:3)',
                 + ""
                 + " | strictEqual( new eg.Line(1,2,3).toString(), 'Line(A:1,B:2,C:3)' ) |" );
    strictEqual( eg.Line.equationABC(1,2,3).toString(), 'Line(A:1,B:2,C:3)',
                 + ""
                 + " | strictEqual( eg.Line.equationABC(1,2,3).toString(), 'Line(A:1,B:2,C:3)' ) |" );
  });
  var locV1 = eg.Point.xy(2,2);
  var locV1b = eg.Point.xy(-1,3);
  var dirV1 = eg.Point.xy(3,-1);
  var locV2 = eg.Point.xy(3,0);
  var dirV2 = eg.Point.xy(4,2);
  test("Line()", function() {
    ok ( locV1 && locV1b && dirV1 && locV2 && dirV2, "" + "locV1: " + locV1 + ", locV1b: " + locV1b + ", dirV1: " + dirV1
         + ", locV2: " + locV2 + ", dirV2: "+ dirV2);
    strictEqual( eg.Line.locDir(eg.Point.xy(1,1), eg.Point.xy(0,0)), null,
                 "invalid line" +
                 " | strictEqual( eg.Line.locDir(eg.Point.xy(1,1), eg.Point.xy(0,0)), null ) |" );
    strictEqual( eg.Line.locDir(eg.Point.xy(0,0), eg.Point.xy(1,1)).toString(), 'Line(A:-1,B:1,C:0)',
                 "valid line" +
                 " | strictEqual( eg.Line.locDir(eg.Point.xy(0,0), eg.Point.xy(1,1)).toString()"
                 + ", 'Line(A:-1,B:1,C:0)' ) |" );
    strictEqual( eg.Line.locDir(locV1, dirV1).toString(), 'Line(A:1,B:3,C:-8)',
                 ""
                 + " | strictEqual( eg.Line.locDir(locV1, dirV1).toString(), 'Line(A:1,B:3,C:-8)' ) |" );
    strictEqual( eg.Line.locDir(locV1b, dirV1).toString(), 'Line(A:1,B:3,C:-8)',
                 ""
                 + " | strictEqual( eg.Line.locDir(locV1b, dirV1).toString(), 'Line(A:1,B:3,C:-8)' ) |" );
    strictEqual( eg.Line.locDir(locV2, dirV2).toString(), 'Line(A:-2,B:4,C:6)',
                 ""
                 + " | strictEqual( eg.Line.locDir(locV2, dirV2).toString(), 'Line(A:-2,B:4,C:6)' ) |" );

    strictEqual( eg.Line.dir(eg.Point.xy(1,1)).toString(), 'Line(A:-1,B:1,C:0)',
                 "Line.dir()" +
                 " | strictEqual( eg.Line.dir(eg.Point.xy(1,1)).toString()"
                 + ", 'Line(A:-1,B:1,C:0)' ) |" );
  });
  test("Line.proto.intersection()", function() {
    var l1 = eg.Line.locDir(locV1, dirV1);
    var locV1add = locV1.add(eg.Point.xy(1,1));
    var parallelToL1 = eg.Line.locDir(locV1add, dirV1);
    var l2 = eg.Line.locDir(locV2, dirV2);
    ok ( l1 && l2, "l1: " + l1 + ", l2: " + l2 + ", locV1add: " + locV1add + ", parallelToL1: " + parallelToL1);

    strictEqual( l1.intersection(l2).toString(), 'Point(5,1)',
                 "" + " | strictEqual( l1.intersection(l2).toString(), 'Point(5,1)' ) |" );
    strictEqual( l1.intersection(l1), null,
                 "" + " | strictEqual( l1.intersection(l1), null ) |" );
    strictEqual( l1.intersection(parallelToL1), null,
                 "" + " | strictEqual( l1.intersection(parallelToL1), null ) |" );

    raises(
      function(){
        l1.intersection(eg.Line.locDir(eg.Point.xy(0,0), eg.Point.xy(0,0)))
      },
      TypeError,
      "l1.intersection(eg.Line.locDir(eg.Point.xy(0,0), eg.Point.xy(0,0)))"
        + ": -> expected ex: intersection() with invalid line"
    );
  }); // Line.proto.intersection()

  test("rectAfterRectTranslation()", function() {
    var r1 = eg.Rect.originCorner(eg.Point.xy(0,0), eg.Point.xy(10,10));
    var r2 = eg.Rect.originCorner(eg.Point.xy(4,3), eg.Point.xy(6,5));
    var r3 = eg.Rect.originCorner(eg.Point.xy(4,5), eg.Point.xy(6,7));
    var r4 = eg.Rect.originCorner(eg.Point.xy(0,7), eg.Point.xy(3,8));
    var r5 = eg.Rect.originCorner(eg.Point.xy(7,6), eg.Point.xy(9,8));
    var dir = r2.center().sub(r1.center());
    ok( true, "r1: " + r1 + ", r2: " + r2 + ", dir: " + dir );
    ok ( eg.rectBehindRectTranslation(r1,r2,dir),
         "eg.rectBehindRectTranslation(r1,r2,dir): " + eg.rectBehindRectTranslation(r1,r2,dir).toString() );
    dir = r3.center().sub(r1.center());
    ok( true, "r1: " + r1 + ", r3: " + r3 + ", dir: " + dir );
    ok ( eg.rectBehindRectTranslation(r1,r3,dir),
         "eg.rectBehindRectTranslation(r1,r3,dir): " + eg.rectBehindRectTranslation(r1,r3,dir).toString() );
    dir = r4.center().sub(r1.center());
    ok( true, "r1: " + r1 + ", r4: " + r4 + ", dir: " + dir );
    ok ( eg.rectBehindRectTranslation(r1,r4,dir),
         "eg.rectBehindRectTranslation(r1,r4,dir): " + eg.rectBehindRectTranslation(r1,r4,dir).toString() );
    dir = r5.center().sub(r1.center());
    ok( true, "r1: " + r1 + ", r5: " + r5 + ", dir: " + dir );
    ok ( eg.rectBehindRectTranslation(r1,r5,dir),
         "eg.rectBehindRectTranslation(r1,r5,dir): " + eg.rectBehindRectTranslation(r1,r5,dir).toString() );
  });

}); // window.onload()
