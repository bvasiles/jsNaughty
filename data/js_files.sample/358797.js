(function() {
  var number = -1,
      raw = '',
      numbers = [],
      SIGNIFICANCE = 4,
      NUMBER_GROUPS = /[0-9]+/g;
  // Init
  (function init() {
    if (navigator.plugins && navigator.plugins.length > 0) {
      var type = 'application/x-shockwave-flash',
          mimeTypes = navigator.mimeTypes;
      if (mimeTypes && mimeTypes[type] && mimeTypes[type].enabledPlugin &&
              mimeTypes[type].enabledPlugin.description) {
        raw = mimeTypes[type].enabledPlugin.description;
      }
    } else if (navigator.appVersion.indexOf('Mac') == -1 &&
        window.execScript) {
      // I will be here soon!
    }
    if (raw) {
      numbers = raw.match(NUMBER_GROUPS);
      number = arrayOfNumbersToInt(numbers, SIGNIFICANCE);
    }
  })();
  // Safe accessor for native ActiveX GetVariable method.
  function activeXObjectGetVariable(activeXObj, name) {
    try {
      return activeXObj.GetVariable(name);
    } catch (e) {
      return '';
    }
  }
  // Safe constructor for ActiveX object creation.
  function newActiveXObject(name) {
    try {
      return new ActiveXObject(name);
    } catch (e) {
      return undefined;
    }
  }
  // Takes and array of numbers and normalizes it to numerical
  // value based on significant digits.
  function arrayOfNumbersToInt(array, significant, options) {
    var sum = 0,
        units = 1,
        options = options || {},
        i = 0,
        l = options.length || array.length;
    for (; i < l; i++) {
      sum += array[(l - i - 1)] * units;
      units *= Math.pow(10, significant);
    }
    return sum;
  }
  // Takes an arbitrary loose set of arguments and parses them
  // into a normalized number for comparison.
  function argumentsToNumber() {
    var args = Array.prototype.slice.call(arguments),
        csv = args.join(','),
        numberGroups = csv.match(NUMBER_GROUPS),
        number = arrayOfNumbersToInt(numberGroups, SIGNIFICANCE);
    return number;
  }
  // Compare to values againts a defined operator. The minimum
  // length of the two values is used without rounding.
  function compare(a, operator, b) {
    var comparisons = {
      '>': function(a, b) {return a > b;},
      '>=': function(a, b) {return a >= b;},
      '<': function(a, b) {return a < b;},
      '<=': function(a, b) {return a <= b;},
      '==': function(a, b) {return a == b;}
    };
    var minLength = Math.min(a.toString().length, b.toString().length),
        a = parseInt(a.toString().substring(0, minLength), 10),
        b = parseInt(b.toString().substring(0, minLength), 10);
    return comparisons[operator](a, b);
  }
  // Public
  var lilswf = window.lilswf = {
    // Does it exist.
    has: !!(raw),
    // Raw version info.
    raw: raw,
    // Parsed and casted array of numbers from raw.
    numbers: numbers,
    // Normalized numerical value from numbers.
    number: number,
    // Greater than comparison.
    gt: function() {
      var number = argumentsToNumber.apply(null, arguments);
      return compare(number, '>', number2);
    },
    // Greater than or equal comparison.
    gte: function() {
      var number2 = argumentsToNumber.apply(null, arguments);
      return compare(number, '>=', number2);
    },
    // Equal comparison.
    eq: function() {
      var number2 = argumentsToNumber.apply(null, arguments);
      return compare(number, '==', number2);
    },
    // Less than comparison.
    lt: function() {
      var number2 = argumentsToNumber.apply(null, arguments);
      return compare(number, '<', number2);
    },
    // Less than or equal comparison.
    lte: function() {
      var number2 = argumentsToNumber.apply(null, arguments);
      return compare(number, '<=', number2);
    },
    // Enables test mode of private methods.
    enableTest: function() {
      var privates = ['arrayOfNumbersToInt', 'argumentsToNumber',
                      'compare'];
      for (var i = 0; i < privates.length; i++) {
        var name = privates[i];
        lilswf[name] = eval(name);
      }
      version = arguments[0];
    }
  };
})();
