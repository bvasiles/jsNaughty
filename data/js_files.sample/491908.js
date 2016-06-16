function extend (target, source) {
    Object.keys(source).forEach(function (property) {
        target[property] = source[property];
    });

    return target;
}

var assert = extend(exports, require("assert"));

assert.isNull = function (value, message) {
    if (value !== null) {
        assert.fail(value, null, message, "===", assert.isNull);
    }
}

assert.isNotNull = function (value, message) {
    if (value === null) {
        assert.fail(value, null, message, "!==", assert.isNotNull);
    }
}

function typeOf (value, type, message, stackStart) {
    if (typeof value != type) {
        assert.fail(value, type, message, "typeof", stackStart);
    }
}

function notTypeOf (value, type, message, stackStart) {
    if (typeof value == type) {
        assert.fail(value, type, message, "!typeof", stackStart);
    }
}

assert.isTypeOf = function (value, type, message) {
    typeOf(value, type, message, assert.isTypeOf);
};

assert.isNotTypeOf = function (value, type, message) {
    notTypeOf(value, type, message, assert.isNotTypeOf);
};

assert.isObject = function (value, message) {
    typeOf(value, "object", message, assert.isObject);
};

assert.isFunction = function (value, message) {
    typeOf(value, "function", message, assert.isFunction);
};

assert.isString = function (value, message) {
    typeOf(value, "string", message, assert.isString);
};

assert.isBoolean = function (value, message) {
    typeOf(value, "boolean", message, assert.isBoolean);
};

assert.isNumber = function (value, message) {
    typeOf(value, "number", message, assert.isNumber);
};

assert.isUndefined = function (value, message) {
    typeOf(value, "undefined", message, assert.isUndefined);
};

assert.isNotUndefined = function (value, message) {
    notTypeOf(value, "undefined", message, assert.isNotUndefined);
};

assert.isArray = function (value, message) {
    if (Object.prototype.toString.call(value) != "[object Array]") {
        assert.fail(value, "Array", message, "[[Class]]", assert.isArray);
    }
};

assert.isNaN = function (value, message) {
    if (!isNaN(value)) {
        assert.fail(value, "NaN", message, "==", assert.isNaN);
    }
}

assert.isNotNaN = function (value, message) {
    if (isNaN(value)) {
        assert.fail(value, "NaN", message, "!=", assert.isNotNaN);
    }
}

assert.match = function (value, pattern, message) {
    if (!pattern.test(value)) {
        assert.fail(value, pattern, message, "test", assert.match);
    }
}

assert.noMatch = function (value, pattern, message) {
    if (pattern.test(value)) {
        assert.fail(value, pattern, message, "!test", assert.noMatch);
    }
}

assert.isPrototypeOf = function (proto, object, message) {
    if (!proto.isPrototypeOf(object)) {
        assert.fail(proto, object, message, "isPrototypeOf", assert.isPrototypeOf);
    }
}

assert.isNotPrototypeOf = function (proto, object, message) {
    if (proto.isPrototypeOf(object)) {
        assert.fail(proto, object, message, "!isPrototypeOf", assert.isNotPrototypeOf);
    }
}

assert.isWritable = function (object, property, message) {
    var descriptor = Object.getOwnPropertyDescriptor(object, property);

    if (!descriptor.writable) {
        assert.fail(object, property, message, "isWritable", assert.isWritable);
    }
}

assert.isNotWritable = function (object, property, message) {
    var descriptor = Object.getOwnPropertyDescriptor(object, property);

    if (descriptor.writable) {
        assert.fail(object, property, message, "isNotWritable", assert.isNotWritable);
    }
}

assert.isConfigurable = function (object, property, message) {
    var descriptor = Object.getOwnPropertyDescriptor(object, property);

    if (!descriptor.configurable) {
        assert.fail(object, property, message, "isConfigurable", assert.isConfigurable);
    }
}

assert.isNotConfigurable = function (object, property, message) {
    var descriptor = Object.getOwnPropertyDescriptor(object, property);

    if (descriptor.configurable) {
        assert.fail(object, property, message, "isNotConfigurable", assert.isNotConfigurable);
    }
}

assert.isEnumerable = function (object, property, message) {
    var descriptor = Object.getOwnPropertyDescriptor(object, property);

    if (!descriptor.enumerable) {
        assert.fail(object, property, message, "isEnumerable", assert.isEnumerable);
    }
}

assert.isNotEnumerable = function (object, property, message) {
    var descriptor = Object.getOwnPropertyDescriptor(object, property);

    if (descriptor.enumerable) {
        assert.fail(object, property, message, "isNotEnumerable", assert.isNotEnumerable);
    }
}
