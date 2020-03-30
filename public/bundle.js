(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function (global){
'use strict';

var objectAssign = require('object-assign');

// compare and isBuffer taken from https://github.com/feross/buffer/blob/680e9e5e488f22aac27599a57dc844a6315928dd/index.js
// original notice:

/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
function compare(a, b) {
  if (a === b) {
    return 0;
  }

  var x = a.length;
  var y = b.length;

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i];
      y = b[i];
      break;
    }
  }

  if (x < y) {
    return -1;
  }
  if (y < x) {
    return 1;
  }
  return 0;
}
function isBuffer(b) {
  if (global.Buffer && typeof global.Buffer.isBuffer === 'function') {
    return global.Buffer.isBuffer(b);
  }
  return !!(b != null && b._isBuffer);
}

// based on node assert, original notice:
// NB: The URL to the CommonJS spec is kept just for tradition.
//     node-assert has evolved a lot since then, both in API and behavior.

// http://wiki.commonjs.org/wiki/Unit_Testing/1.0
//
// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
//
// Originally from narwhal.js (http://narwhaljs.org)
// Copyright (c) 2009 Thomas Robinson <280north.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the 'Software'), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

var util = require('util/');
var hasOwn = Object.prototype.hasOwnProperty;
var pSlice = Array.prototype.slice;
var functionsHaveNames = (function () {
  return function foo() {}.name === 'foo';
}());
function pToString (obj) {
  return Object.prototype.toString.call(obj);
}
function isView(arrbuf) {
  if (isBuffer(arrbuf)) {
    return false;
  }
  if (typeof global.ArrayBuffer !== 'function') {
    return false;
  }
  if (typeof ArrayBuffer.isView === 'function') {
    return ArrayBuffer.isView(arrbuf);
  }
  if (!arrbuf) {
    return false;
  }
  if (arrbuf instanceof DataView) {
    return true;
  }
  if (arrbuf.buffer && arrbuf.buffer instanceof ArrayBuffer) {
    return true;
  }
  return false;
}
// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

var regex = /\s*function\s+([^\(\s]*)\s*/;
// based on https://github.com/ljharb/function.prototype.name/blob/adeeeec8bfcc6068b187d7d9fb3d5bb1d3a30899/implementation.js
function getName(func) {
  if (!util.isFunction(func)) {
    return;
  }
  if (functionsHaveNames) {
    return func.name;
  }
  var str = func.toString();
  var match = str.match(regex);
  return match && match[1];
}
assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  if (options.message) {
    this.message = options.message;
    this.generatedMessage = false;
  } else {
    this.message = getMessage(this);
    this.generatedMessage = true;
  }
  var stackStartFunction = options.stackStartFunction || fail;
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, stackStartFunction);
  } else {
    // non v8 browsers so we can have a stacktrace
    var err = new Error();
    if (err.stack) {
      var out = err.stack;

      // try to strip useless frames
      var fn_name = getName(stackStartFunction);
      var idx = out.indexOf('\n' + fn_name);
      if (idx >= 0) {
        // once we have located the function frame
        // we need to strip out everything before it (and its line)
        var next_line = out.indexOf('\n', idx + 1);
        out = out.substring(next_line + 1);
      }

      this.stack = out;
    }
  }
};

// assert.AssertionError instanceof Error
util.inherits(assert.AssertionError, Error);

function truncate(s, n) {
  if (typeof s === 'string') {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}
function inspect(something) {
  if (functionsHaveNames || !util.isFunction(something)) {
    return util.inspect(something);
  }
  var rawname = getName(something);
  var name = rawname ? ': ' + rawname : '';
  return '[Function' +  name + ']';
}
function getMessage(self) {
  return truncate(inspect(self.actual), 128) + ' ' +
         self.operator + ' ' +
         truncate(inspect(self.expected), 128);
}

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, !!guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected, false)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

assert.deepStrictEqual = function deepStrictEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected, true)) {
    fail(actual, expected, message, 'deepStrictEqual', assert.deepStrictEqual);
  }
};

function _deepEqual(actual, expected, strict, memos) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;
  } else if (isBuffer(actual) && isBuffer(expected)) {
    return compare(actual, expected) === 0;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (util.isDate(actual) && util.isDate(expected)) {
    return actual.getTime() === expected.getTime();

  // 7.3 If the expected value is a RegExp object, the actual value is
  // equivalent if it is also a RegExp object with the same source and
  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
  } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
    return actual.source === expected.source &&
           actual.global === expected.global &&
           actual.multiline === expected.multiline &&
           actual.lastIndex === expected.lastIndex &&
           actual.ignoreCase === expected.ignoreCase;

  // 7.4. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if ((actual === null || typeof actual !== 'object') &&
             (expected === null || typeof expected !== 'object')) {
    return strict ? actual === expected : actual == expected;

  // If both values are instances of typed arrays, wrap their underlying
  // ArrayBuffers in a Buffer each to increase performance
  // This optimization requires the arrays to have the same type as checked by
  // Object.prototype.toString (aka pToString). Never perform binary
  // comparisons for Float*Arrays, though, since e.g. +0 === -0 but their
  // bit patterns are not identical.
  } else if (isView(actual) && isView(expected) &&
             pToString(actual) === pToString(expected) &&
             !(actual instanceof Float32Array ||
               actual instanceof Float64Array)) {
    return compare(new Uint8Array(actual.buffer),
                   new Uint8Array(expected.buffer)) === 0;

  // 7.5 For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else if (isBuffer(actual) !== isBuffer(expected)) {
    return false;
  } else {
    memos = memos || {actual: [], expected: []};

    var actualIndex = memos.actual.indexOf(actual);
    if (actualIndex !== -1) {
      if (actualIndex === memos.expected.indexOf(expected)) {
        return true;
      }
    }

    memos.actual.push(actual);
    memos.expected.push(expected);

    return objEquiv(actual, expected, strict, memos);
  }
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b, strict, actualVisitedObjects) {
  if (a === null || a === undefined || b === null || b === undefined)
    return false;
  // if one is a primitive, the other must be same
  if (util.isPrimitive(a) || util.isPrimitive(b))
    return a === b;
  if (strict && Object.getPrototypeOf(a) !== Object.getPrototypeOf(b))
    return false;
  var aIsArgs = isArguments(a);
  var bIsArgs = isArguments(b);
  if ((aIsArgs && !bIsArgs) || (!aIsArgs && bIsArgs))
    return false;
  if (aIsArgs) {
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b, strict);
  }
  var ka = objectKeys(a);
  var kb = objectKeys(b);
  var key, i;
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length !== kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] !== kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key], strict, actualVisitedObjects))
      return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected, false)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

assert.notDeepStrictEqual = notDeepStrictEqual;
function notDeepStrictEqual(actual, expected, message) {
  if (_deepEqual(actual, expected, true)) {
    fail(actual, expected, message, 'notDeepStrictEqual', notDeepStrictEqual);
  }
}


// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (Object.prototype.toString.call(expected) == '[object RegExp]') {
    return expected.test(actual);
  }

  try {
    if (actual instanceof expected) {
      return true;
    }
  } catch (e) {
    // Ignore.  The instanceof check doesn't work for arrow functions.
  }

  if (Error.isPrototypeOf(expected)) {
    return false;
  }

  return expected.call({}, actual) === true;
}

function _tryBlock(block) {
  var error;
  try {
    block();
  } catch (e) {
    error = e;
  }
  return error;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (typeof block !== 'function') {
    throw new TypeError('"block" argument must be a function');
  }

  if (typeof expected === 'string') {
    message = expected;
    expected = null;
  }

  actual = _tryBlock(block);

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail(actual, expected, 'Missing expected exception' + message);
  }

  var userProvidedMessage = typeof message === 'string';
  var isUnwantedException = !shouldThrow && util.isError(actual);
  var isUnexpectedException = !shouldThrow && actual && !expected;

  if ((isUnwantedException &&
      userProvidedMessage &&
      expectedException(actual, expected)) ||
      isUnexpectedException) {
    fail(actual, expected, 'Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws(true, block, error, message);
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/error, /*optional*/message) {
  _throws(false, block, error, message);
};

assert.ifError = function(err) { if (err) throw err; };

// Expose a strict only variant of assert
function strict(value, message) {
  if (!value) fail(value, true, message, '==', strict);
}
assert.strict = objectAssign(strict, assert, {
  equal: assert.strictEqual,
  deepEqual: assert.deepStrictEqual,
  notEqual: assert.notStrictEqual,
  notDeepEqual: assert.notDeepStrictEqual
});
assert.strict.strict = assert.strict;

var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    if (hasOwn.call(obj, key)) keys.push(key);
  }
  return keys;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"object-assign":10,"util/":4}],2:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],3:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],4:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":3,"_process":11,"inherits":2}],5:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  var i
  for (i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(
      uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)
    ))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}

},{}],6:[function(require,module,exports){
(function (Buffer){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')
var customInspectSymbol =
  (typeof Symbol === 'function' && typeof Symbol.for === 'function')
    ? Symbol.for('nodejs.util.inspect.custom')
    : null

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

var K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1)
    var proto = { foo: function () { return 42 } }
    Object.setPrototypeOf(proto, Uint8Array.prototype)
    Object.setPrototypeOf(arr, proto)
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

Object.defineProperty(Buffer.prototype, 'parent', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.buffer
  }
})

Object.defineProperty(Buffer.prototype, 'offset', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.byteOffset
  }
})

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('The value "' + length + '" is invalid for option "size"')
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length)
  Object.setPrototypeOf(buf, Buffer.prototype)
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new TypeError(
        'The "string" argument must be of type string. Received type number'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

// Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
if (typeof Symbol !== 'undefined' && Symbol.species != null &&
    Buffer[Symbol.species] === Buffer) {
  Object.defineProperty(Buffer, Symbol.species, {
    value: null,
    configurable: true,
    enumerable: false,
    writable: false
  })
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  if (ArrayBuffer.isView(value)) {
    return fromArrayLike(value)
  }

  if (value == null) {
    throw new TypeError(
      'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
      'or Array-like Object. Received type ' + (typeof value)
    )
  }

  if (isInstance(value, ArrayBuffer) ||
      (value && isInstance(value.buffer, ArrayBuffer))) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof SharedArrayBuffer !== 'undefined' &&
      (isInstance(value, SharedArrayBuffer) ||
      (value && isInstance(value.buffer, SharedArrayBuffer)))) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'number') {
    throw new TypeError(
      'The "value" argument must not be of type number. Received type number'
    )
  }

  var valueOf = value.valueOf && value.valueOf()
  if (valueOf != null && valueOf !== value) {
    return Buffer.from(valueOf, encodingOrOffset, length)
  }

  var b = fromObject(value)
  if (b) return b

  if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null &&
      typeof value[Symbol.toPrimitive] === 'function') {
    return Buffer.from(
      value[Symbol.toPrimitive]('string'), encodingOrOffset, length
    )
  }

  throw new TypeError(
    'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
    'or Array-like Object. Received type ' + (typeof value)
  )
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Object.setPrototypeOf(Buffer.prototype, Uint8Array.prototype)
Object.setPrototypeOf(Buffer, Uint8Array)

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be of type number')
  } else if (size < 0) {
    throw new RangeError('The value "' + size + '" is invalid for option "size"')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('Unknown encoding: ' + encoding)
  }

  var length = byteLength(string, encoding) | 0
  var buf = createBuffer(length)

  var actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('"offset" is outside of buffer bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('"length" is outside of buffer bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  Object.setPrototypeOf(buf, Buffer.prototype)

  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj.length !== undefined) {
    if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
      return createBuffer(0)
    }
    return fromArrayLike(obj)
  }

  if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
    return fromArrayLike(obj.data)
  }
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return b != null && b._isBuffer === true &&
    b !== Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false
}

Buffer.compare = function compare (a, b) {
  if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength)
  if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength)
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError(
      'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
    )
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (isInstance(buf, Uint8Array)) {
      buf = Buffer.from(buf)
    }
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    throw new TypeError(
      'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
      'Received type ' + typeof string
    )
  }

  var len = string.length
  var mustMatch = (arguments.length > 2 && arguments[2] === true)
  if (!mustMatch && len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) {
          return mustMatch ? -1 : utf8ToBytes(string).length // assume utf8
        }
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.toLocaleString = Buffer.prototype.toString

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim()
  if (this.length > max) str += ' ... '
  return '<Buffer ' + str + '>'
}
if (customInspectSymbol) {
  Buffer.prototype[customInspectSymbol] = Buffer.prototype.inspect
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (isInstance(target, Uint8Array)) {
    target = Buffer.from(target, target.offset, target.byteLength)
  }
  if (!Buffer.isBuffer(target)) {
    throw new TypeError(
      'The "target" argument must be one of type Buffer or Uint8Array. ' +
      'Received type ' + (typeof target)
    )
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset // Coerce to Number.
  if (numberIsNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [val], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  var strLen = string.length

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (numberIsNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
        : (firstByte > 0xBF) ? 2
          : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += hexSliceLookupTable[buf[i]]
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  Object.setPrototypeOf(newBuf, Buffer.prototype)

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer')
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start

  if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
    // Use built-in when available, missing from IE11
    this.copyWithin(targetStart, start, end)
  } else if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (var i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, end),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if ((encoding === 'utf8' && code < 128) ||
          encoding === 'latin1') {
        // Fast path: If `val` fits into a single byte, use that numeric value.
        val = code
      }
    }
  } else if (typeof val === 'number') {
    val = val & 255
  } else if (typeof val === 'boolean') {
    val = Number(val)
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : Buffer.from(val, encoding)
    var len = bytes.length
    if (len === 0) {
      throw new TypeError('The value "' + val +
        '" is invalid for argument "value"')
    }
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node takes equal signs as end of the Base64 encoding
  str = str.split('=')[0]
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

// ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
// the `instanceof` check but they should be treated as of that type.
// See: https://github.com/feross/buffer/issues/166
function isInstance (obj, type) {
  return obj instanceof type ||
    (obj != null && obj.constructor != null && obj.constructor.name != null &&
      obj.constructor.name === type.name)
}
function numberIsNaN (obj) {
  // For IE11 support
  return obj !== obj // eslint-disable-line no-self-compare
}

// Create lookup table for `toString('hex')`
// See: https://github.com/feross/buffer/issues/219
var hexSliceLookupTable = (function () {
  var alphabet = '0123456789abcdef'
  var table = new Array(256)
  for (var i = 0; i < 16; ++i) {
    var i16 = i * 16
    for (var j = 0; j < 16; ++j) {
      table[i16 + j] = alphabet[i] + alphabet[j]
    }
  }
  return table
})()

}).call(this,require("buffer").Buffer)
},{"base64-js":5,"buffer":6,"ieee754":9}],7:[function(require,module,exports){
(function (global){
/*global window, global*/
var util = require("util")
var assert = require("assert")
function now() { return new Date().getTime() }

var slice = Array.prototype.slice
var console
var times = {}

if (typeof global !== "undefined" && global.console) {
    console = global.console
} else if (typeof window !== "undefined" && window.console) {
    console = window.console
} else {
    console = {}
}

var functions = [
    [log, "log"],
    [info, "info"],
    [warn, "warn"],
    [error, "error"],
    [time, "time"],
    [timeEnd, "timeEnd"],
    [trace, "trace"],
    [dir, "dir"],
    [consoleAssert, "assert"]
]

for (var i = 0; i < functions.length; i++) {
    var tuple = functions[i]
    var f = tuple[0]
    var name = tuple[1]

    if (!console[name]) {
        console[name] = f
    }
}

module.exports = console

function log() {}

function info() {
    console.log.apply(console, arguments)
}

function warn() {
    console.log.apply(console, arguments)
}

function error() {
    console.warn.apply(console, arguments)
}

function time(label) {
    times[label] = now()
}

function timeEnd(label) {
    var time = times[label]
    if (!time) {
        throw new Error("No such label: " + label)
    }

    delete times[label]
    var duration = now() - time
    console.log(label + ": " + duration + "ms")
}

function trace() {
    var err = new Error()
    err.name = "Trace"
    err.message = util.format.apply(null, arguments)
    console.error(err.stack)
}

function dir(object) {
    console.log(util.inspect(object) + "\n")
}

function consoleAssert(expression) {
    if (!expression) {
        var arr = slice.call(arguments, 1)
        assert.ok(false, util.format.apply(null, arr))
    }
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"assert":1,"util":14}],8:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var objectCreate = Object.create || objectCreatePolyfill
var objectKeys = Object.keys || objectKeysPolyfill
var bind = Function.prototype.bind || functionBindPolyfill

function EventEmitter() {
  if (!this._events || !Object.prototype.hasOwnProperty.call(this, '_events')) {
    this._events = objectCreate(null);
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
var defaultMaxListeners = 10;

var hasDefineProperty;
try {
  var o = {};
  if (Object.defineProperty) Object.defineProperty(o, 'x', { value: 0 });
  hasDefineProperty = o.x === 0;
} catch (err) { hasDefineProperty = false }
if (hasDefineProperty) {
  Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
    enumerable: true,
    get: function() {
      return defaultMaxListeners;
    },
    set: function(arg) {
      // check whether the input is a positive number (whose value is zero or
      // greater and not a NaN).
      if (typeof arg !== 'number' || arg < 0 || arg !== arg)
        throw new TypeError('"defaultMaxListeners" must be a positive number');
      defaultMaxListeners = arg;
    }
  });
} else {
  EventEmitter.defaultMaxListeners = defaultMaxListeners;
}

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || isNaN(n))
    throw new TypeError('"n" argument must be a positive number');
  this._maxListeners = n;
  return this;
};

function $getMaxListeners(that) {
  if (that._maxListeners === undefined)
    return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return $getMaxListeners(this);
};

// These standalone emit* functions are used to optimize calling of event
// handlers for fast cases because emit() itself often has a variable number of
// arguments and can be deoptimized because of that. These functions always have
// the same number of arguments and thus do not get deoptimized, so the code
// inside them can execute faster.
function emitNone(handler, isFn, self) {
  if (isFn)
    handler.call(self);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self);
  }
}
function emitOne(handler, isFn, self, arg1) {
  if (isFn)
    handler.call(self, arg1);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1);
  }
}
function emitTwo(handler, isFn, self, arg1, arg2) {
  if (isFn)
    handler.call(self, arg1, arg2);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1, arg2);
  }
}
function emitThree(handler, isFn, self, arg1, arg2, arg3) {
  if (isFn)
    handler.call(self, arg1, arg2, arg3);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1, arg2, arg3);
  }
}

function emitMany(handler, isFn, self, args) {
  if (isFn)
    handler.apply(self, args);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].apply(self, args);
  }
}

EventEmitter.prototype.emit = function emit(type) {
  var er, handler, len, args, i, events;
  var doError = (type === 'error');

  events = this._events;
  if (events)
    doError = (doError && events.error == null);
  else if (!doError)
    return false;

  // If there is no 'error' event listener then throw.
  if (doError) {
    if (arguments.length > 1)
      er = arguments[1];
    if (er instanceof Error) {
      throw er; // Unhandled 'error' event
    } else {
      // At least give some kind of context to the user
      var err = new Error('Unhandled "error" event. (' + er + ')');
      err.context = er;
      throw err;
    }
    return false;
  }

  handler = events[type];

  if (!handler)
    return false;

  var isFn = typeof handler === 'function';
  len = arguments.length;
  switch (len) {
      // fast cases
    case 1:
      emitNone(handler, isFn, this);
      break;
    case 2:
      emitOne(handler, isFn, this, arguments[1]);
      break;
    case 3:
      emitTwo(handler, isFn, this, arguments[1], arguments[2]);
      break;
    case 4:
      emitThree(handler, isFn, this, arguments[1], arguments[2], arguments[3]);
      break;
      // slower
    default:
      args = new Array(len - 1);
      for (i = 1; i < len; i++)
        args[i - 1] = arguments[i];
      emitMany(handler, isFn, this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  if (typeof listener !== 'function')
    throw new TypeError('"listener" argument must be a function');

  events = target._events;
  if (!events) {
    events = target._events = objectCreate(null);
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener) {
      target.emit('newListener', type,
          listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  if (!existing) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] =
          prepend ? [listener, existing] : [existing, listener];
    } else {
      // If we've already got an array, just append.
      if (prepend) {
        existing.unshift(listener);
      } else {
        existing.push(listener);
      }
    }

    // Check for listener leak
    if (!existing.warned) {
      m = $getMaxListeners(target);
      if (m && m > 0 && existing.length > m) {
        existing.warned = true;
        var w = new Error('Possible EventEmitter memory leak detected. ' +
            existing.length + ' "' + String(type) + '" listeners ' +
            'added. Use emitter.setMaxListeners() to ' +
            'increase limit.');
        w.name = 'MaxListenersExceededWarning';
        w.emitter = target;
        w.type = type;
        w.count = existing.length;
        if (typeof console === 'object' && console.warn) {
          console.warn('%s: %s', w.name, w.message);
        }
      }
    }
  }

  return target;
}

EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener =
    function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };

function onceWrapper() {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    switch (arguments.length) {
      case 0:
        return this.listener.call(this.target);
      case 1:
        return this.listener.call(this.target, arguments[0]);
      case 2:
        return this.listener.call(this.target, arguments[0], arguments[1]);
      case 3:
        return this.listener.call(this.target, arguments[0], arguments[1],
            arguments[2]);
      default:
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; ++i)
          args[i] = arguments[i];
        this.listener.apply(this.target, args);
    }
  }
}

function _onceWrap(target, type, listener) {
  var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
  var wrapped = bind.call(onceWrapper, state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

EventEmitter.prototype.once = function once(type, listener) {
  if (typeof listener !== 'function')
    throw new TypeError('"listener" argument must be a function');
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// Emits a 'removeListener' event if and only if the listener was removed.
EventEmitter.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');

      events = this._events;
      if (!events)
        return this;

      list = events[type];
      if (!list)
        return this;

      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = objectCreate(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (position === 0)
          list.shift();
        else
          spliceOne(list, position);

        if (list.length === 1)
          events[type] = list[0];

        if (events.removeListener)
          this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };

EventEmitter.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var listeners, events, i;

      events = this._events;
      if (!events)
        return this;

      // not listening for removeListener, no need to emit
      if (!events.removeListener) {
        if (arguments.length === 0) {
          this._events = objectCreate(null);
          this._eventsCount = 0;
        } else if (events[type]) {
          if (--this._eventsCount === 0)
            this._events = objectCreate(null);
          else
            delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = objectKeys(events);
        var key;
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = objectCreate(null);
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners) {
        // LIFO order
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }

      return this;
    };

function _listeners(target, type, unwrap) {
  var events = target._events;

  if (!events)
    return [];

  var evlistener = events[type];
  if (!evlistener)
    return [];

  if (typeof evlistener === 'function')
    return unwrap ? [evlistener.listener || evlistener] : [evlistener];

  return unwrap ? unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
}

EventEmitter.prototype.listeners = function listeners(type) {
  return _listeners(this, type, true);
};

EventEmitter.prototype.rawListeners = function rawListeners(type) {
  return _listeners(this, type, false);
};

EventEmitter.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type) {
  var events = this._events;

  if (events) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
};

// About 1.5x faster than the two-arg version of Array#splice().
function spliceOne(list, index) {
  for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1)
    list[i] = list[k];
  list.pop();
}

function arrayClone(arr, n) {
  var copy = new Array(n);
  for (var i = 0; i < n; ++i)
    copy[i] = arr[i];
  return copy;
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}

function objectCreatePolyfill(proto) {
  var F = function() {};
  F.prototype = proto;
  return new F;
}
function objectKeysPolyfill(obj) {
  var keys = [];
  for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k)) {
    keys.push(k);
  }
  return k;
}
function functionBindPolyfill(context) {
  var fn = this;
  return function () {
    return fn.apply(context, arguments);
  };
}

},{}],9:[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],10:[function(require,module,exports){
/*
object-assign
(c) Sindre Sorhus
@license MIT
*/

'use strict';
/* eslint-disable no-unused-vars */
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

function shouldUseNative() {
	try {
		if (!Object.assign) {
			return false;
		}

		// Detect buggy property enumeration order in older V8 versions.

		// https://bugs.chromium.org/p/v8/issues/detail?id=4118
		var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
		test1[5] = 'de';
		if (Object.getOwnPropertyNames(test1)[0] === '5') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test2 = {};
		for (var i = 0; i < 10; i++) {
			test2['_' + String.fromCharCode(i)] = i;
		}
		var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
			return test2[n];
		});
		if (order2.join('') !== '0123456789') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test3 = {};
		'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
			test3[letter] = letter;
		});
		if (Object.keys(Object.assign({}, test3)).join('') !==
				'abcdefghijklmnopqrst') {
			return false;
		}

		return true;
	} catch (err) {
		// We don't expect any of the above to throw, but better to be safe.
		return false;
	}
}

module.exports = shouldUseNative() ? Object.assign : function (target, source) {
	var from;
	var to = toObject(target);
	var symbols;

	for (var s = 1; s < arguments.length; s++) {
		from = Object(arguments[s]);

		for (var key in from) {
			if (hasOwnProperty.call(from, key)) {
				to[key] = from[key];
			}
		}

		if (getOwnPropertySymbols) {
			symbols = getOwnPropertySymbols(from);
			for (var i = 0; i < symbols.length; i++) {
				if (propIsEnumerable.call(from, symbols[i])) {
					to[symbols[i]] = from[symbols[i]];
				}
			}
		}
	}

	return to;
};

},{}],11:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],12:[function(require,module,exports){
arguments[4][2][0].apply(exports,arguments)
},{"dup":2}],13:[function(require,module,exports){
arguments[4][3][0].apply(exports,arguments)
},{"dup":3}],14:[function(require,module,exports){
arguments[4][4][0].apply(exports,arguments)
},{"./support/isBuffer":13,"_process":11,"dup":4,"inherits":12}],15:[function(require,module,exports){
var indexOf = function (xs, item) {
    if (xs.indexOf) return xs.indexOf(item);
    else for (var i = 0; i < xs.length; i++) {
        if (xs[i] === item) return i;
    }
    return -1;
};
var Object_keys = function (obj) {
    if (Object.keys) return Object.keys(obj)
    else {
        var res = [];
        for (var key in obj) res.push(key)
        return res;
    }
};

var forEach = function (xs, fn) {
    if (xs.forEach) return xs.forEach(fn)
    else for (var i = 0; i < xs.length; i++) {
        fn(xs[i], i, xs);
    }
};

var defineProp = (function() {
    try {
        Object.defineProperty({}, '_', {});
        return function(obj, name, value) {
            Object.defineProperty(obj, name, {
                writable: true,
                enumerable: false,
                configurable: true,
                value: value
            })
        };
    } catch(e) {
        return function(obj, name, value) {
            obj[name] = value;
        };
    }
}());

var globals = ['Array', 'Boolean', 'Date', 'Error', 'EvalError', 'Function',
'Infinity', 'JSON', 'Math', 'NaN', 'Number', 'Object', 'RangeError',
'ReferenceError', 'RegExp', 'String', 'SyntaxError', 'TypeError', 'URIError',
'decodeURI', 'decodeURIComponent', 'encodeURI', 'encodeURIComponent', 'escape',
'eval', 'isFinite', 'isNaN', 'parseFloat', 'parseInt', 'undefined', 'unescape'];

function Context() {}
Context.prototype = {};

var Script = exports.Script = function NodeScript (code) {
    if (!(this instanceof Script)) return new Script(code);
    this.code = code;
};

Script.prototype.runInContext = function (context) {
    if (!(context instanceof Context)) {
        throw new TypeError("needs a 'context' argument.");
    }
    
    var iframe = document.createElement('iframe');
    if (!iframe.style) iframe.style = {};
    iframe.style.display = 'none';
    
    document.body.appendChild(iframe);
    
    var win = iframe.contentWindow;
    var wEval = win.eval, wExecScript = win.execScript;

    if (!wEval && wExecScript) {
        // win.eval() magically appears when this is called in IE:
        wExecScript.call(win, 'null');
        wEval = win.eval;
    }
    
    forEach(Object_keys(context), function (key) {
        win[key] = context[key];
    });
    forEach(globals, function (key) {
        if (context[key]) {
            win[key] = context[key];
        }
    });
    
    var winKeys = Object_keys(win);

    var res = wEval.call(win, this.code);
    
    forEach(Object_keys(win), function (key) {
        // Avoid copying circular objects like `top` and `window` by only
        // updating existing context properties or new properties in the `win`
        // that was only introduced after the eval.
        if (key in context || indexOf(winKeys, key) === -1) {
            context[key] = win[key];
        }
    });

    forEach(globals, function (key) {
        if (!(key in context)) {
            defineProp(context, key, win[key]);
        }
    });
    
    document.body.removeChild(iframe);
    
    return res;
};

Script.prototype.runInThisContext = function () {
    return eval(this.code); // maybe...
};

Script.prototype.runInNewContext = function (context) {
    var ctx = Script.createContext(context);
    var res = this.runInContext(ctx);

    if (context) {
        forEach(Object_keys(ctx), function (key) {
            context[key] = ctx[key];
        });
    }

    return res;
};

forEach(Object_keys(Script.prototype), function (name) {
    exports[name] = Script[name] = function (code) {
        var s = Script(code);
        return s[name].apply(s, [].slice.call(arguments, 1));
    };
});

exports.isContext = function (context) {
    return context instanceof Context;
};

exports.createScript = function (code) {
    return exports.Script(code);
};

exports.createContext = Script.createContext = function (context) {
    var copy = new Context();
    if(typeof context === 'object') {
        forEach(Object_keys(context), function (key) {
            copy[key] = context[key];
        });
    }
    return copy;
};

},{}],16:[function(require,module,exports){
(function (process){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var buffer_1 = require("buffer");
var vm_1 = require("vm");
require("console");
var context_1 = require("./context");
var aliasRegistry = {};
var FUNCTION_PREFIX = '___parser_';
var PRIMITIVE_SIZES = {
    uint8: 1,
    uint16le: 2,
    uint16be: 2,
    uint32le: 4,
    uint32be: 4,
    int8: 1,
    int16le: 2,
    int16be: 2,
    int32le: 4,
    int32be: 4,
    int64be: 8,
    int64le: 8,
    uint64be: 8,
    uint64le: 8,
    floatle: 4,
    floatbe: 4,
    doublele: 8,
    doublebe: 8,
};
var CAPITILIZED_TYPE_NAMES = {
    uint8: 'UInt8',
    uint16le: 'UInt16LE',
    uint16be: 'UInt16BE',
    uint32le: 'UInt32LE',
    uint32be: 'UInt32BE',
    int8: 'Int8',
    int16le: 'Int16LE',
    int16be: 'Int16BE',
    int32le: 'Int32LE',
    int32be: 'Int32BE',
    int64be: 'BigInt64BE',
    int64le: 'BigInt64LE',
    uint64be: 'BigUInt64BE',
    uint64le: 'BigUInt64LE',
    floatle: 'FloatLE',
    floatbe: 'FloatBE',
    doublele: 'DoubleLE',
    doublebe: 'DoubleBE',
    bit: 'Bit',
    string: 'String',
    buffer: 'Buffer',
    array: 'Array',
    choice: 'Choice',
    nest: 'Nest',
    seek: 'Seek',
    pointer: 'Pointer',
    saveOffset: 'SaveOffset',
    '': '',
};
var Parser = /** @class */ (function () {
    function Parser() {
        this.varName = '';
        this.type = '';
        this.options = {};
        this.next = null;
        this.head = null;
        this.compiled = null;
        this.endian = 'be';
        this.constructorFn = null;
        this.alias = null;
    }
    Parser.start = function () {
        return new Parser();
    };
    Parser.prototype.primitiveGenerateN = function (type, ctx) {
        var typeName = CAPITILIZED_TYPE_NAMES[type];
        ctx.pushCode(ctx.generateVariable(this.varName) + " = buffer.read" + typeName + "(offset);");
        ctx.pushCode("offset += " + PRIMITIVE_SIZES[type] + ";");
    };
    Parser.prototype.primitiveN = function (type, varName, options) {
        return this.setNextParser(type, varName, options);
    };
    Parser.prototype.useThisEndian = function (type) {
        return (type + this.endian.toLowerCase());
    };
    Parser.prototype.uint8 = function (varName, options) {
        return this.primitiveN('uint8', varName, options);
    };
    Parser.prototype.uint16 = function (varName, options) {
        return this.primitiveN(this.useThisEndian('uint16'), varName, options);
    };
    Parser.prototype.uint16le = function (varName, options) {
        return this.primitiveN('uint16le', varName, options);
    };
    Parser.prototype.uint16be = function (varName, options) {
        return this.primitiveN('uint16be', varName, options);
    };
    Parser.prototype.uint32 = function (varName, options) {
        return this.primitiveN(this.useThisEndian('uint32'), varName, options);
    };
    Parser.prototype.uint32le = function (varName, options) {
        return this.primitiveN('uint32le', varName, options);
    };
    Parser.prototype.uint32be = function (varName, options) {
        return this.primitiveN('uint32be', varName, options);
    };
    Parser.prototype.int8 = function (varName, options) {
        return this.primitiveN('int8', varName, options);
    };
    Parser.prototype.int16 = function (varName, options) {
        return this.primitiveN(this.useThisEndian('int16'), varName, options);
    };
    Parser.prototype.int16le = function (varName, options) {
        return this.primitiveN('int16le', varName, options);
    };
    Parser.prototype.int16be = function (varName, options) {
        return this.primitiveN('int16be', varName, options);
    };
    Parser.prototype.int32 = function (varName, options) {
        return this.primitiveN(this.useThisEndian('int32'), varName, options);
    };
    Parser.prototype.int32le = function (varName, options) {
        return this.primitiveN('int32le', varName, options);
    };
    Parser.prototype.int32be = function (varName, options) {
        return this.primitiveN('int32be', varName, options);
    };
    Parser.prototype.bigIntVersionCheck = function () {
        var major = process.version.replace('v', '').split('.')[0];
        if (Number(major) < 12) {
            throw new Error("The methods readBigInt64BE, readBigInt64BE, readBigInt64BE, readBigInt64BE are not avilable in your version of nodejs: " + process.version + ", you must use v12 or greater");
        }
    };
    Parser.prototype.int64 = function (varName, options) {
        this.bigIntVersionCheck();
        return this.primitiveN(this.useThisEndian('int64'), varName, options);
    };
    Parser.prototype.int64be = function (varName, options) {
        this.bigIntVersionCheck();
        return this.primitiveN('int64be', varName, options);
    };
    Parser.prototype.int64le = function (varName, options) {
        this.bigIntVersionCheck();
        return this.primitiveN('int64le', varName, options);
    };
    Parser.prototype.uint64 = function (varName, options) {
        this.bigIntVersionCheck();
        return this.primitiveN(this.useThisEndian('uint64'), varName, options);
    };
    Parser.prototype.uint64be = function (varName, options) {
        this.bigIntVersionCheck();
        return this.primitiveN('uint64be', varName, options);
    };
    Parser.prototype.uint64le = function (varName, options) {
        this.bigIntVersionCheck();
        return this.primitiveN('uint64le', varName, options);
    };
    Parser.prototype.floatle = function (varName, options) {
        return this.primitiveN('floatle', varName, options);
    };
    Parser.prototype.floatbe = function (varName, options) {
        return this.primitiveN('floatbe', varName, options);
    };
    Parser.prototype.doublele = function (varName, options) {
        return this.primitiveN('doublele', varName, options);
    };
    Parser.prototype.doublebe = function (varName, options) {
        return this.primitiveN('doublebe', varName, options);
    };
    Parser.prototype.bitN = function (size, varName, options) {
        if (!options) {
            options = {};
        }
        options.length = size;
        return this.setNextParser('bit', varName, options);
    };
    Parser.prototype.bit1 = function (varName, options) {
        return this.bitN(1, varName, options);
    };
    Parser.prototype.bit2 = function (varName, options) {
        return this.bitN(2, varName, options);
    };
    Parser.prototype.bit3 = function (varName, options) {
        return this.bitN(3, varName, options);
    };
    Parser.prototype.bit4 = function (varName, options) {
        return this.bitN(4, varName, options);
    };
    Parser.prototype.bit5 = function (varName, options) {
        return this.bitN(5, varName, options);
    };
    Parser.prototype.bit6 = function (varName, options) {
        return this.bitN(6, varName, options);
    };
    Parser.prototype.bit7 = function (varName, options) {
        return this.bitN(7, varName, options);
    };
    Parser.prototype.bit8 = function (varName, options) {
        return this.bitN(8, varName, options);
    };
    Parser.prototype.bit9 = function (varName, options) {
        return this.bitN(9, varName, options);
    };
    Parser.prototype.bit10 = function (varName, options) {
        return this.bitN(10, varName, options);
    };
    Parser.prototype.bit11 = function (varName, options) {
        return this.bitN(11, varName, options);
    };
    Parser.prototype.bit12 = function (varName, options) {
        return this.bitN(12, varName, options);
    };
    Parser.prototype.bit13 = function (varName, options) {
        return this.bitN(13, varName, options);
    };
    Parser.prototype.bit14 = function (varName, options) {
        return this.bitN(14, varName, options);
    };
    Parser.prototype.bit15 = function (varName, options) {
        return this.bitN(15, varName, options);
    };
    Parser.prototype.bit16 = function (varName, options) {
        return this.bitN(16, varName, options);
    };
    Parser.prototype.bit17 = function (varName, options) {
        return this.bitN(17, varName, options);
    };
    Parser.prototype.bit18 = function (varName, options) {
        return this.bitN(18, varName, options);
    };
    Parser.prototype.bit19 = function (varName, options) {
        return this.bitN(19, varName, options);
    };
    Parser.prototype.bit20 = function (varName, options) {
        return this.bitN(20, varName, options);
    };
    Parser.prototype.bit21 = function (varName, options) {
        return this.bitN(21, varName, options);
    };
    Parser.prototype.bit22 = function (varName, options) {
        return this.bitN(22, varName, options);
    };
    Parser.prototype.bit23 = function (varName, options) {
        return this.bitN(23, varName, options);
    };
    Parser.prototype.bit24 = function (varName, options) {
        return this.bitN(24, varName, options);
    };
    Parser.prototype.bit25 = function (varName, options) {
        return this.bitN(25, varName, options);
    };
    Parser.prototype.bit26 = function (varName, options) {
        return this.bitN(26, varName, options);
    };
    Parser.prototype.bit27 = function (varName, options) {
        return this.bitN(27, varName, options);
    };
    Parser.prototype.bit28 = function (varName, options) {
        return this.bitN(28, varName, options);
    };
    Parser.prototype.bit29 = function (varName, options) {
        return this.bitN(29, varName, options);
    };
    Parser.prototype.bit30 = function (varName, options) {
        return this.bitN(30, varName, options);
    };
    Parser.prototype.bit31 = function (varName, options) {
        return this.bitN(31, varName, options);
    };
    Parser.prototype.bit32 = function (varName, options) {
        return this.bitN(32, varName, options);
    };
    Parser.prototype.namely = function (alias) {
        aliasRegistry[alias] = this;
        this.alias = alias;
        return this;
    };
    Parser.prototype.skip = function (length, options) {
        return this.seek(length, options);
    };
    Parser.prototype.seek = function (relOffset, options) {
        if (options && options.assert) {
            throw new Error('assert option on seek is not allowed.');
        }
        return this.setNextParser('seek', '', { length: relOffset });
    };
    Parser.prototype.string = function (varName, options) {
        if (!options.zeroTerminated && !options.length && !options.greedy) {
            throw new Error('Neither length, zeroTerminated, nor greedy is defined for string.');
        }
        if ((options.zeroTerminated || options.length) && options.greedy) {
            throw new Error('greedy is mutually exclusive with length and zeroTerminated for string.');
        }
        if (options.stripNull && !(options.length || options.greedy)) {
            throw new Error('Length or greedy must be defined if stripNull is defined.');
        }
        options.encoding = options.encoding || 'utf8';
        return this.setNextParser('string', varName, options);
    };
    Parser.prototype.buffer = function (varName, options) {
        if (!options.length && !options.readUntil) {
            throw new Error('Length nor readUntil is defined in buffer parser');
        }
        return this.setNextParser('buffer', varName, options);
    };
    Parser.prototype.array = function (varName, options) {
        if (!options.readUntil && !options.length && !options.lengthInBytes) {
            throw new Error('Length option of array is not defined.');
        }
        if (!options.type) {
            throw new Error('Type option of array is not defined.');
        }
        if (typeof options.type === 'string' &&
            !aliasRegistry[options.type] &&
            Object.keys(PRIMITIVE_SIZES).indexOf(options.type) < 0) {
            throw new Error("Specified primitive type \"" + options.type + "\" is not supported.");
        }
        return this.setNextParser('array', varName, options);
    };
    Parser.prototype.choice = function (varName, options) {
        if (typeof options !== 'object' && typeof varName === 'object') {
            options = varName;
            varName = null;
        }
        if (!options.tag) {
            throw new Error('Tag option of array is not defined.');
        }
        if (!options.choices) {
            throw new Error('Choices option of array is not defined.');
        }
        Object.keys(options.choices).forEach(function (keyString) {
            var key = parseInt(keyString, 10);
            var value = options.choices[key];
            if (isNaN(key)) {
                throw new Error('Key of choices must be a number.');
            }
            if (!value) {
                throw new Error("Choice Case " + keyString + " of " + varName + " is not valid.");
            }
            if (typeof value === 'string' &&
                !aliasRegistry[value] &&
                Object.keys(PRIMITIVE_SIZES).indexOf(value) < 0) {
                throw new Error("Specified primitive type \"" + value + "\" is not supported.");
            }
        });
        return this.setNextParser('choice', varName, options);
    };
    Parser.prototype.nest = function (varName, options) {
        if (typeof options !== 'object' && typeof varName === 'object') {
            options = varName;
            varName = null;
        }
        if (!options.type) {
            throw new Error('Type option of nest is not defined.');
        }
        if (!(options.type instanceof Parser) && !aliasRegistry[options.type]) {
            throw new Error('Type option of nest must be a Parser object.');
        }
        if (!(options.type instanceof Parser) && !varName) {
            throw new Error('options.type must be a object if variable name is omitted.');
        }
        return this.setNextParser('nest', varName, options);
    };
    Parser.prototype.pointer = function (varName, options) {
        if (!options.offset) {
            throw new Error('Offset option of pointer is not defined.');
        }
        if (!options.type) {
            throw new Error('Type option of pointer is not defined.');
        }
        else if (typeof options.type === 'string') {
            if (Object.keys(PRIMITIVE_SIZES).indexOf(options.type) < 0 &&
                !aliasRegistry[options.type]) {
                throw new Error('Specified type "' + options.type + '" is not supported.');
            }
        }
        else if (options.type instanceof Parser) {
        }
        else {
            throw new Error('Type option of pointer must be a string or a Parser object.');
        }
        return this.setNextParser('pointer', varName, options);
    };
    Parser.prototype.saveOffset = function (varName, options) {
        return this.setNextParser('saveOffset', varName, options);
    };
    Parser.prototype.endianess = function (endianess) {
        switch (endianess.toLowerCase()) {
            case 'little':
                this.endian = 'le';
                break;
            case 'big':
                this.endian = 'be';
                break;
            default:
                throw new Error("Invalid endianess: " + endianess);
        }
        return this;
    };
    Parser.prototype.create = function (constructorFn) {
        if (!(constructorFn instanceof Function)) {
            throw new Error('Constructor must be a Function object.');
        }
        this.constructorFn = constructorFn;
        return this;
    };
    Parser.prototype.getCode = function () {
        var ctx = new context_1.Context();
        if (!this.alias) {
            this.addRawCode(ctx);
        }
        else {
            this.addAliasedCode(ctx);
        }
        if (this.alias) {
            ctx.pushCode("return " + (FUNCTION_PREFIX + this.alias) + "(0).result;");
        }
        else {
            ctx.pushCode('return vars;');
        }
        return ctx.code;
    };
    Parser.prototype.addRawCode = function (ctx) {
        ctx.pushCode('var offset = 0;');
        if (this.constructorFn) {
            ctx.pushCode('var vars = new constructorFn();');
        }
        else {
            ctx.pushCode('var vars = {};');
        }
        this.generate(ctx);
        this.resolveReferences(ctx);
    };
    Parser.prototype.addAliasedCode = function (ctx) {
        ctx.pushCode("function " + (FUNCTION_PREFIX + this.alias) + "(offset) {");
        if (this.constructorFn) {
            ctx.pushCode('var vars = new constructorFn();');
        }
        else {
            ctx.pushCode('var vars = {};');
        }
        this.generate(ctx);
        ctx.markResolved(this.alias);
        this.resolveReferences(ctx);
        ctx.pushCode('return { offset: offset, result: vars };');
        ctx.pushCode('}');
        return ctx;
    };
    Parser.prototype.resolveReferences = function (ctx) {
        var references = ctx.getUnresolvedReferences();
        ctx.markRequested(references);
        references.forEach(function (alias) {
            var parser = aliasRegistry[alias];
            parser.addAliasedCode(ctx);
        });
    };
    Parser.prototype.compile = function () {
        var src = "(function(buffer, constructorFn) { " + this.getCode() + " })";
        this.compiled = vm_1.runInNewContext(src, { Buffer: buffer_1.Buffer, console: console });
    };
    Parser.prototype.sizeOf = function () {
        var size = NaN;
        if (Object.keys(PRIMITIVE_SIZES).indexOf(this.type) >= 0) {
            size = PRIMITIVE_SIZES[this.type];
            // if this is a fixed length string
        }
        else if (this.type === 'string' &&
            typeof this.options.length === 'number') {
            size = this.options.length;
            // if this is a fixed length buffer
        }
        else if (this.type === 'buffer' &&
            typeof this.options.length === 'number') {
            size = this.options.length;
            // if this is a fixed length array
        }
        else if (this.type === 'array' &&
            typeof this.options.length === 'number') {
            var elementSize = NaN;
            if (typeof this.options.type === 'string') {
                elementSize = PRIMITIVE_SIZES[this.options.type];
            }
            else if (this.options.type instanceof Parser) {
                elementSize = this.options.type.sizeOf();
            }
            size = this.options.length * elementSize;
            // if this a skip
        }
        else if (this.type === 'seek') {
            size = this.options.length;
            // if this is a nested parser
        }
        else if (this.type === 'nest') {
            size = this.options.type.sizeOf();
        }
        else if (!this.type) {
            size = 0;
        }
        if (this.next) {
            size += this.next.sizeOf();
        }
        return size;
    };
    // Follow the parser chain till the root and start parsing from there
    Parser.prototype.parse = function (buffer) {
        if (!this.compiled) {
            this.compile();
        }
        if (!buffer_1.Buffer.isBuffer(buffer)) {
            throw new Error('argument buffer is not a Buffer object');
        }
        return this.compiled(buffer, this.constructorFn);
    };
    Parser.prototype.setNextParser = function (type, varName, options) {
        var parser = new Parser();
        parser.type = type;
        parser.varName = varName;
        parser.options = options || parser.options;
        parser.endian = this.endian;
        if (this.head) {
            this.head.next = parser;
        }
        else {
            this.next = parser;
        }
        this.head = parser;
        return this;
    };
    // Call code generator for this parser
    Parser.prototype.generate = function (ctx) {
        if (this.type) {
            switch (this.type) {
                case 'uint8':
                case 'uint16le':
                case 'uint16be':
                case 'uint32le':
                case 'uint32be':
                case 'int8':
                case 'int16le':
                case 'int16be':
                case 'int32le':
                case 'int32be':
                case 'int64be':
                case 'int64le':
                case 'uint64be':
                case 'uint64le':
                case 'floatle':
                case 'floatbe':
                case 'doublele':
                case 'doublebe':
                    this.primitiveGenerateN(this.type, ctx);
                    break;
                case 'bit':
                    this.generateBit(ctx);
                    break;
                case 'string':
                    this.generateString(ctx);
                    break;
                case 'buffer':
                    this.generateBuffer(ctx);
                    break;
                case 'seek':
                    this.generateSeek(ctx);
                    break;
                case 'nest':
                    this.generateNest(ctx);
                    break;
                case 'array':
                    this.generateArray(ctx);
                    break;
                case 'choice':
                    this.generateChoice(ctx);
                    break;
                case 'pointer':
                    this.generatePointer(ctx);
                    break;
                case 'saveOffset':
                    this.generateSaveOffset(ctx);
                    break;
            }
            this.generateAssert(ctx);
        }
        var varName = ctx.generateVariable(this.varName);
        if (this.options.formatter) {
            this.generateFormatter(ctx, varName, this.options.formatter);
        }
        return this.generateNext(ctx);
    };
    Parser.prototype.generateAssert = function (ctx) {
        if (!this.options.assert) {
            return;
        }
        var varName = ctx.generateVariable(this.varName);
        switch (typeof this.options.assert) {
            case 'function':
                ctx.pushCode("if (!(" + this.options.assert + ").call(vars, " + varName + ")) {");
                break;
            case 'number':
                ctx.pushCode("if (" + this.options.assert + " !== " + varName + ") {");
                break;
            case 'string':
                ctx.pushCode("if (\"" + this.options.assert + "\" !== " + varName + ") {");
                break;
            default:
                throw new Error('Assert option supports only strings, numbers and assert functions.');
        }
        ctx.generateError("\"Assert error: " + varName + " is \" + " + this.options.assert);
        ctx.pushCode('}');
    };
    // Recursively call code generators and append results
    Parser.prototype.generateNext = function (ctx) {
        if (this.next) {
            ctx = this.next.generate(ctx);
        }
        return ctx;
    };
    Parser.prototype.generateBit = function (ctx) {
        // TODO find better method to handle nested bit fields
        var parser = JSON.parse(JSON.stringify(this));
        parser.varName = ctx.generateVariable(parser.varName);
        ctx.bitFields.push(parser);
        if (!this.next ||
            (this.next && ['bit', 'nest'].indexOf(this.next.type) < 0)) {
            var sum_1 = 0;
            ctx.bitFields.forEach(function (parser) { return (sum_1 += parser.options.length); });
            var val_1 = ctx.generateTmpVariable();
            if (sum_1 <= 8) {
                ctx.pushCode("var " + val_1 + " = buffer.readUInt8(offset);");
                sum_1 = 8;
            }
            else if (sum_1 <= 16) {
                ctx.pushCode("var " + val_1 + " = buffer.readUInt16BE(offset);");
                sum_1 = 16;
            }
            else if (sum_1 <= 24) {
                var val1 = ctx.generateTmpVariable();
                var val2 = ctx.generateTmpVariable();
                ctx.pushCode("var " + val1 + " = buffer.readUInt16BE(offset);");
                ctx.pushCode("var " + val2 + " = buffer.readUInt8(offset + 2);");
                ctx.pushCode("var " + val_1 + " = (" + val1 + " << 8) | " + val2 + ";");
                sum_1 = 24;
            }
            else if (sum_1 <= 32) {
                ctx.pushCode("var " + val_1 + " = buffer.readUInt32BE(offset);");
                sum_1 = 32;
            }
            else {
                throw new Error('Currently, bit field sequence longer than 4-bytes is not supported.');
            }
            ctx.pushCode("offset += " + sum_1 / 8 + ";");
            var bitOffset_1 = 0;
            var isBigEndian_1 = this.endian === 'be';
            ctx.bitFields.forEach(function (parser) {
                var length = parser.options.length;
                var offset = isBigEndian_1 ? sum_1 - bitOffset_1 - length : bitOffset_1;
                var mask = (1 << length) - 1;
                ctx.pushCode(parser.varName + " = " + val_1 + " >> " + offset + " & " + mask + ";");
                bitOffset_1 += length;
            });
            ctx.bitFields = [];
        }
    };
    Parser.prototype.generateSeek = function (ctx) {
        var length = ctx.generateOption(this.options.length);
        ctx.pushCode("offset += " + length + ";");
    };
    Parser.prototype.generateString = function (ctx) {
        var name = ctx.generateVariable(this.varName);
        var start = ctx.generateTmpVariable();
        var encoding = this.options.encoding;
        if (this.options.length && this.options.zeroTerminated) {
            var len = this.options.length;
            ctx.pushCode("var " + start + " = offset;");
            ctx.pushCode("while(buffer.readUInt8(offset++) !== 0 && offset - " + start + "  < " + len + ");");
            ctx.pushCode(name + " = buffer.toString('" + encoding + "', " + start + ", offset - " + start + " < " + len + " ? offset - 1 : offset);");
        }
        else if (this.options.length) {
            var len = ctx.generateOption(this.options.length);
            ctx.pushCode(name + " = buffer.toString('" + encoding + "', offset, offset + " + len + ");");
            ctx.pushCode("offset += " + len + ";");
        }
        else if (this.options.zeroTerminated) {
            ctx.pushCode("var " + start + " = offset;");
            ctx.pushCode('while(buffer.readUInt8(offset++) !== 0);');
            ctx.pushCode(name + " = buffer.toString('" + encoding + "', " + start + ", offset - 1);");
        }
        else if (this.options.greedy) {
            ctx.pushCode("var " + start + " = offset;");
            ctx.pushCode('while(buffer.length > offset++);');
            ctx.pushCode(name + " = buffer.toString('" + encoding + "', " + start + ", offset);");
        }
        if (this.options.stripNull) {
            ctx.pushCode(name + " = " + name + ".replace(/\\x00+$/g, '')");
        }
    };
    Parser.prototype.generateBuffer = function (ctx) {
        var varName = ctx.generateVariable(this.varName);
        if (typeof this.options.readUntil === 'function') {
            var pred = this.options.readUntil;
            var start = ctx.generateTmpVariable();
            var cur = ctx.generateTmpVariable();
            ctx.pushCode("var " + start + " = offset;");
            ctx.pushCode("var " + cur + " = 0;");
            ctx.pushCode("while (offset < buffer.length) {");
            ctx.pushCode(cur + " = buffer.readUInt8(offset);");
            ctx.pushCode("if (" + pred + ".call(this, " + cur + ", buffer.slice(offset))) break;");
            ctx.pushCode("offset += 1;");
            ctx.pushCode("}");
            ctx.pushCode(varName + " = buffer.slice(" + start + ", offset);");
        }
        else if (this.options.readUntil === 'eof') {
            ctx.pushCode(varName + " = buffer.slice(offset);");
        }
        else {
            var len = ctx.generateOption(this.options.length);
            ctx.pushCode(varName + " = buffer.slice(offset, offset + " + len + ");");
            ctx.pushCode("offset += " + len + ";");
        }
        if (this.options.clone) {
            ctx.pushCode(varName + " = Buffer.from(" + varName + ");");
        }
    };
    Parser.prototype.generateArray = function (ctx) {
        var length = ctx.generateOption(this.options.length);
        var lengthInBytes = ctx.generateOption(this.options.lengthInBytes);
        var type = this.options.type;
        var counter = ctx.generateTmpVariable();
        var lhs = ctx.generateVariable(this.varName);
        var item = ctx.generateTmpVariable();
        var key = this.options.key;
        var isHash = typeof key === 'string';
        if (isHash) {
            ctx.pushCode(lhs + " = {};");
        }
        else {
            ctx.pushCode(lhs + " = [];");
        }
        if (typeof this.options.readUntil === 'function') {
            ctx.pushCode('do {');
        }
        else if (this.options.readUntil === 'eof') {
            ctx.pushCode("for (var " + counter + " = 0; offset < buffer.length; " + counter + "++) {");
        }
        else if (lengthInBytes !== undefined) {
            ctx.pushCode("for (var " + counter + " = offset; offset - " + counter + " < " + lengthInBytes + "; ) {");
        }
        else {
            ctx.pushCode("for (var " + counter + " = 0; " + counter + " < " + length + "; " + counter + "++) {");
        }
        if (typeof type === 'string') {
            if (!aliasRegistry[type]) {
                var typeName = CAPITILIZED_TYPE_NAMES[type];
                ctx.pushCode("var " + item + " = buffer.read" + typeName + "(offset);");
                ctx.pushCode("offset += " + PRIMITIVE_SIZES[type] + ";");
            }
            else {
                var tempVar = ctx.generateTmpVariable();
                ctx.pushCode("var " + tempVar + " = " + (FUNCTION_PREFIX + type) + "(offset);");
                ctx.pushCode("var " + item + " = " + tempVar + ".result; offset = " + tempVar + ".offset;");
                if (type !== this.alias)
                    ctx.addReference(type);
            }
        }
        else if (type instanceof Parser) {
            ctx.pushCode("var " + item + " = {};");
            ctx.pushScope(item);
            type.generate(ctx);
            ctx.popScope();
        }
        if (isHash) {
            ctx.pushCode(lhs + "[" + item + "." + key + "] = " + item + ";");
        }
        else {
            ctx.pushCode(lhs + ".push(" + item + ");");
        }
        ctx.pushCode('}');
        if (typeof this.options.readUntil === 'function') {
            var pred = this.options.readUntil;
            ctx.pushCode("while (!(" + pred + ").call(this, " + item + ", buffer.slice(offset)));");
        }
    };
    Parser.prototype.generateChoiceCase = function (ctx, varName, type) {
        if (typeof type === 'string') {
            var varName_1 = ctx.generateVariable(this.varName);
            if (!aliasRegistry[type]) {
                var typeName = CAPITILIZED_TYPE_NAMES[type];
                ctx.pushCode(varName_1 + " = buffer.read" + typeName + "(offset);");
                ctx.pushCode("offset += " + PRIMITIVE_SIZES[type]);
            }
            else {
                var tempVar = ctx.generateTmpVariable();
                ctx.pushCode("var " + tempVar + " = " + (FUNCTION_PREFIX + type) + "(offset);");
                ctx.pushCode(varName_1 + " = " + tempVar + ".result; offset = " + tempVar + ".offset;");
                if (type !== this.alias)
                    ctx.addReference(type);
            }
        }
        else if (type instanceof Parser) {
            ctx.pushPath(varName);
            type.generate(ctx);
            ctx.popPath(varName);
        }
    };
    Parser.prototype.generateChoice = function (ctx) {
        var _this = this;
        var tag = ctx.generateOption(this.options.tag);
        if (this.varName) {
            ctx.pushCode(ctx.generateVariable(this.varName) + " = {};");
        }
        ctx.pushCode("switch(" + tag + ") {");
        Object.keys(this.options.choices).forEach(function (tag) {
            var type = _this.options.choices[parseInt(tag, 10)];
            ctx.pushCode("case " + tag + ":");
            _this.generateChoiceCase(ctx, _this.varName, type);
            ctx.pushCode('break;');
        });
        ctx.pushCode('default:');
        if (this.options.defaultChoice) {
            this.generateChoiceCase(ctx, this.varName, this.options.defaultChoice);
        }
        else {
            ctx.generateError("\"Met undefined tag value \" + " + tag + " + \" at choice\"");
        }
        ctx.pushCode('}');
    };
    Parser.prototype.generateNest = function (ctx) {
        var nestVar = ctx.generateVariable(this.varName);
        if (this.options.type instanceof Parser) {
            if (this.varName) {
                ctx.pushCode(nestVar + " = {};");
            }
            ctx.pushPath(this.varName);
            this.options.type.generate(ctx);
            ctx.popPath(this.varName);
        }
        else if (aliasRegistry[this.options.type]) {
            var tempVar = ctx.generateTmpVariable();
            ctx.pushCode("var " + tempVar + " = " + (FUNCTION_PREFIX + this.options.type) + "(offset);");
            ctx.pushCode(nestVar + " = " + tempVar + ".result; offset = " + tempVar + ".offset;");
            if (this.options.type !== this.alias)
                ctx.addReference(this.options.type);
        }
    };
    Parser.prototype.generateFormatter = function (ctx, varName, formatter) {
        if (typeof formatter === 'function') {
            ctx.pushCode(varName + " = (" + formatter + ").call(this, " + varName + ");");
        }
    };
    Parser.prototype.generatePointer = function (ctx) {
        var type = this.options.type;
        var offset = ctx.generateOption(this.options.offset);
        var tempVar = ctx.generateTmpVariable();
        var nestVar = ctx.generateVariable(this.varName);
        // Save current offset
        ctx.pushCode("var " + tempVar + " = offset;");
        // Move offset
        ctx.pushCode("offset = " + offset + ";");
        if (this.options.type instanceof Parser) {
            ctx.pushCode(nestVar + " = {};");
            ctx.pushPath(this.varName);
            this.options.type.generate(ctx);
            ctx.popPath(this.varName);
        }
        else if (aliasRegistry[this.options.type]) {
            var tempVar_1 = ctx.generateTmpVariable();
            ctx.pushCode("var " + tempVar_1 + " = " + (FUNCTION_PREFIX + this.options.type) + "(offset);");
            ctx.pushCode(nestVar + " = " + tempVar_1 + ".result; offset = " + tempVar_1 + ".offset;");
            if (this.options.type !== this.alias)
                ctx.addReference(this.options.type);
        }
        else if (Object.keys(PRIMITIVE_SIZES).indexOf(this.options.type) >= 0) {
            var typeName = CAPITILIZED_TYPE_NAMES[type];
            ctx.pushCode(nestVar + " = buffer.read" + typeName + "(offset);");
            ctx.pushCode("offset += " + PRIMITIVE_SIZES[type] + ";");
        }
        // Restore offset
        ctx.pushCode("offset = " + tempVar + ";");
    };
    Parser.prototype.generateSaveOffset = function (ctx) {
        var varName = ctx.generateVariable(this.varName);
        ctx.pushCode(varName + " = offset");
    };
    return Parser;
}());
exports.Parser = Parser;

}).call(this,require('_process'))
},{"./context":17,"_process":11,"buffer":6,"console":7,"vm":15}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Context = /** @class */ (function () {
    function Context() {
        this.code = '';
        this.scopes = [['vars']];
        this.bitFields = [];
        this.tmpVariableCount = 0;
        this.references = {};
    }
    Context.prototype.generateVariable = function (name) {
        var arr = [];
        var scopes = this.scopes[this.scopes.length - 1];
        arr.push.apply(arr, scopes);
        if (name) {
            arr.push(name);
        }
        return arr.join('.');
    };
    Context.prototype.generateOption = function (val) {
        switch (typeof val) {
            case 'number':
                return val.toString();
            case 'string':
                return this.generateVariable(val);
            case 'function':
                return "(" + val + ").call(" + this.generateVariable() + ", vars)";
        }
    };
    Context.prototype.generateError = function (err) {
        this.pushCode('throw new Error(' + err + ');');
    };
    Context.prototype.generateTmpVariable = function () {
        return '$tmp' + this.tmpVariableCount++;
    };
    Context.prototype.pushCode = function (code) {
        this.code += code + '\n';
    };
    Context.prototype.pushPath = function (name) {
        if (name) {
            this.scopes[this.scopes.length - 1].push(name);
        }
    };
    Context.prototype.popPath = function (name) {
        if (name) {
            this.scopes[this.scopes.length - 1].pop();
        }
    };
    Context.prototype.pushScope = function (name) {
        this.scopes.push([name]);
    };
    Context.prototype.popScope = function () {
        this.scopes.pop();
    };
    Context.prototype.addReference = function (alias) {
        if (this.references[alias])
            return;
        this.references[alias] = { resolved: false, requested: false };
    };
    Context.prototype.markResolved = function (alias) {
        this.references[alias].resolved = true;
    };
    Context.prototype.markRequested = function (aliasList) {
        var _this = this;
        aliasList.forEach(function (alias) {
            _this.references[alias].requested = true;
        });
    };
    Context.prototype.getUnresolvedReferences = function () {
        var references = this.references;
        return Object.keys(this.references).filter(function (alias) { return !references[alias].resolved && !references[alias].requested; });
    };
    return Context;
}());
exports.Context = Context;

},{}],18:[function(require,module,exports){
(function (Buffer){
/**
 * HEP-js: A simple HEP3 Library for Node.JS
 *
 * Copyright (C) 2015 Lorenzo Mangani (SIPCAPTURE.ORG)
 * Copyright (C) 2015 Alexandr Dubovikov (SIPCAPTURE.ORG)
 * Copyright (C) 2019 QXIP BV (QXIP.NET)
 *
 * Project Homepage: http://github.com/sipcapture
 *
 * This file is part of HEP-js
 *
 * HEP-js is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * HEP-js is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 *
 **/

var debug = false;

// Module import
var Parser = require("binary-parser").Parser;
var mixinDeep = require('mixin-deep');

module.exports = {
  /**
   * Decode HEP3 Packet to JSON Object.
   *
   * @param  {Buffer} hep message
   * @return {Object}
   */
  decapsulate: function(message) {
    if (debug) console.log('Decoding HEP3 Packet...');
    try {
	var HEP = hepHeader.parse(message);
	if(HEP.payload && HEP.payload.length>0){
	  var data = HEP.payload;
	  var tot = 0;
	  var decoded = {};
	  var PAYLOAD;
	  while(true){
	    PAYLOAD = hepParse.parse( data.slice(tot) );
	    var tmp = hepDecode(PAYLOAD);
	    decoded = mixinDeep(decoded, tmp);
	    tot += PAYLOAD.length;
	    if(tot>=HEP.payload.length) { break; }
	  }
	  if(debug) console.log(decoded);
	  return decoded;
	}
    } catch(e) {
	return false;
    }

  },
  /**
   * Encode HEP3 Packet from JSON Object.
   *
   * @param  {String} sip_msg
   * @param  {String} hep_json
   * @return {Buffer} hep message
   */
  encapsulate: function(msg,rcinfo) {
	if (debug) console.log('Sending HEP3 Packet...');
	var payload_message = new Buffer(msg);
	var header = new Buffer (6);
	header.write ("HEP3");

	var ip_family = new Buffer (7);
	ip_family.writeUInt16BE(0x0000, 0);
	ip_family.writeUInt16BE(0x0001,2);
	ip_family.writeUInt8(rcinfo.ip_family,6);
	ip_family.writeUInt16BE(ip_family.length,4);

	var ip_proto = new Buffer (7);
	ip_proto.writeUInt16BE(0x0000, 0);
	ip_proto.writeUInt16BE(0x0002, 2);
	ip_proto.writeUInt8(rcinfo.protocol,6);
	ip_proto.writeUInt16BE(ip_proto.length,4);

	/*ip*/
	var d = rcinfo.srcIp ? rcinfo.srcIp.split('.') : ['127','0','0','1'];
	var tmpip = ((((((+d[0])*256)+(+d[1]))*256)+(+d[2]))*256)+(+d[3]);

	var src_ip4 = new Buffer (10);
	src_ip4.writeUInt16BE(0x0000, 0);
	src_ip4.writeUInt16BE(0x0003, 2);
	src_ip4.writeUInt32BE(tmpip,6);
	src_ip4.writeUInt16BE(src_ip4.length,4);

	d = rcinfo.dstIp ? rcinfo.dstIp.split('.') : ['127','0','0','1'];
	tmpip = ((((((+d[0])*256)+(+d[1]))*256)+(+d[2]))*256)+(+d[3]);

	var dst_ip4 = new Buffer (10);
	dst_ip4.writeUInt16BE(0x0000, 0);
	dst_ip4.writeUInt16BE(0x0004, 2);
	dst_ip4.writeUInt32BE(tmpip,6);
	dst_ip4.writeUInt16BE(dst_ip4.length,4);

	var src_port = new Buffer (8);
	var tmpA = rcinfo.srcPort ? parseInt(rcinfo.srcPort,10) : 0;
	src_port.writeUInt16BE(0x0000, 0);
	src_port.writeUInt16BE(0x0007, 2);
	src_port.writeUInt16BE(tmpA,6);
	src_port.writeUInt16BE(src_port.length,4);

	var dst_port = new Buffer (8);
	tmpA = rcinfo.dstPort ? parseInt(rcinfo.dstPort, 10) : 0;
	dst_port.writeUInt16BE(0x0000, 0);
	dst_port.writeUInt16BE(0x0008, 2);
	dst_port.writeUInt16BE(tmpA,6);
	dst_port.writeUInt16BE(dst_port.length,4);

	tmpA = ToUint32(rcinfo.time_sec);
	var time_sec = new Buffer (10);
	time_sec.writeUInt16BE(0x0000, 0);
	time_sec.writeUInt16BE(0x0009, 2);
	time_sec.writeUInt32BE(tmpA,6);
	time_sec.writeUInt16BE(time_sec.length,4);

	tmpA = ToUint32(rcinfo.time_usec);
	var time_usec = new Buffer (10);
	time_usec.writeUInt16BE(0x0000, 0);
	time_usec.writeUInt16BE(0x000a, 2);
	time_usec.writeUInt32BE(tmpA,6);
	time_usec.writeUInt16BE(time_usec.length,4);

	var proto_type = new Buffer (7);
	proto_type.writeUInt16BE(0x0000, 0);
	proto_type.writeUInt16BE(0x000b,2);
	proto_type.writeUInt8(rcinfo.proto_type,6);
	proto_type.writeUInt16BE(proto_type.length,4);

	tmpA = ToUint32(rcinfo.captureId);
	var capt_id = new Buffer (10);
	capt_id.writeUInt16BE(0x0000, 0);
	capt_id.writeUInt16BE(0x000c, 2);
	capt_id.writeUInt32BE(tmpA,6);
	capt_id.writeUInt16BE(capt_id.length,4);
	  
	// HEPNodeName w/ Fallback to HEP Capture ID
	tmpA = rcinfo.hepNodeName ? rcinfo.hepNodeName : "" + rcinfo.captureId;
	var hepnodename_chunk = new Buffer (6 + tmpA.length);
	hepnodename_chunk.writeUInt16BE(0x0000, 0);
	hepnodename_chunk.writeUInt16BE(0x0013, 2);
	hepnodename_chunk.write(tmpA,6, tmpA.length);
	hepnodename_chunk.writeUInt16BE(hepnodename_chunk.length,4);

	var auth_chunk = new Buffer (6 + rcinfo.capturePass.length);
	auth_chunk.writeUInt16BE(0x0000, 0);
	auth_chunk.writeUInt16BE(0x000e, 2);
	auth_chunk.write(rcinfo.capturePass,6, rcinfo.capturePass.length);
	auth_chunk.writeUInt16BE(auth_chunk.length,4);

	var payload_chunk = new Buffer (6 + msg.length);
	payload_chunk.writeUInt16BE(0x0000, 0);
	payload_chunk.writeUInt16BE(0x000f, 2);
	payload_chunk.write(msg, 6, msg.length);
	payload_chunk.writeUInt16BE(payload_chunk.length,4);

	var hep_message, correlation_chunk;

	if ((rcinfo.proto_type == 32 || rcinfo.proto_type == 35 ) && rcinfo.correlation_id.length) {

		// create correlation chunk
	        correlation_chunk = new Buffer (6 + rcinfo.correlation_id.length);
	        correlation_chunk.writeUInt16BE(0x0000, 0);
	        correlation_chunk.writeUInt16BE(0x0011, 2);
	        correlation_chunk.write(rcinfo.correlation_id,6, rcinfo.correlation_id.length);
	        correlation_chunk.writeUInt16BE(correlation_chunk.length,4);

	        tmpA = ToUint16(rcinfo.mos);
		var mos = new Buffer (8);
		mos.writeUInt16BE(0x0000, 0);
		mos.writeUInt16BE(0x0020, 2);
		mos.writeUInt16BE(tmpA,6);
		mos.writeUInt16BE(mos.length,4);

		hep_message = Buffer.concat([
			header, 
			ip_family,
			ip_proto,
			src_ip4,
			dst_ip4,
			src_port,
			dst_port,
			time_sec,
			time_usec,
			proto_type,
			capt_id,
			hepnodename_chunk,
			auth_chunk,
			correlation_chunk,
			mos,
			payload_chunk
		]);

	}
	// HEP TYPE 101 w/ mandatory json_chunk (string)
	else if (rcinfo.transaction_type && rcinfo.transaction_type.length && rcinfo.correlation_id.length) {

		// create correlation chunk
	        correlation_chunk = new Buffer (6 + rcinfo.correlation_id.length);
	        correlation_chunk.writeUInt16BE(0x0000, 0);
	        correlation_chunk.writeUInt16BE(0x0011, 2);
	        correlation_chunk.write(rcinfo.correlation_id,6, rcinfo.correlation_id.length);
	        correlation_chunk.writeUInt16BE(correlation_chunk.length,4);

	        // create transaction_type chunk
	        var transaction_type = new Buffer (6 + rcinfo.transaction_type.length);
	        transaction_type.writeUInt16BE(0x0000, 0);
	        transaction_type.writeUInt16BE(0x0024, 2);
	        transaction_type.write(rcinfo.transaction_type,6, rcinfo.transaction_type.length);
	        transaction_type.writeUInt16BE(transaction_type.length,4);

		hep_message = Buffer.concat([
			header, 
			ip_family,
			ip_proto,
			src_ip4,
			dst_ip4,
			src_port,
			dst_port,
			time_sec,
			time_usec,
			proto_type,
			capt_id,
			hepnodename_chunk,
			auth_chunk,
			correlation_chunk,
			transaction_type,
			payload_chunk
		]);

	}
	else if (rcinfo.correlation_id && rcinfo.correlation_id.length) {

		// create correlation chunk
	        correlation_chunk = new Buffer (6 + rcinfo.correlation_id.length);
	        correlation_chunk.writeUInt16BE(0x0000, 0);
	        correlation_chunk.writeUInt16BE(0x0011, 2);
	        correlation_chunk.write(rcinfo.correlation_id,6, rcinfo.correlation_id.length);
	        correlation_chunk.writeUInt16BE(correlation_chunk.length,4);
		
		hep_message = Buffer.concat([
			header, 
			ip_family,
			ip_proto,
			src_ip4,
			dst_ip4,
			src_port,
			dst_port,
			time_sec,
			time_usec,
			proto_type,
			capt_id,
			hepnodename_chunk,
			auth_chunk,
			correlation_chunk,
			payload_chunk
		]);
	}
	else {

		hep_message = Buffer.concat([
			header,
			ip_family,
			ip_proto,
			src_ip4,
			dst_ip4,
			src_port,
			dst_port,
			time_sec,
			time_usec,
			proto_type,
			capt_id,
			hepnodename_chunk,
			auth_chunk,
			payload_chunk
		]);

	}
	hep_message.writeUInt16BE(hep_message.length, 4);
	return hep_message;

  },

  encode: function(json) {
    return String(json)
      .toString("binary");
  },

  decode: function(hep) {
    return String(hep)
      .toString('utf8');
  }
};


/* Functions */

var modulo = function (a, b) {
        return a - Math.floor(a/b)*b;
};

var ToUint32 = function (x) {
        return modulo(ToInteger(x), Math.pow(2, 32));
};

var ToUint16 = function (x) {
        return modulo(ToInteger(x), Math.pow(2, 16));
};

var ToInteger =function (x) {
        x = Number(x);
        return x < 0 ? Math.ceil(x) : Math.floor(x);
};

var ntohl = function (val) {
    return ((val & 0xFF) << 24)
           | ((val & 0xFF00) << 8)
           | ((val >> 8) & 0xFF00)
           | ((val >> 24) & 0xFF);
};

var inet_pton = function inet_pton(a) {

  var r, m, x, i, j, f = String.fromCharCode;
  // IPv4
  m = a.match(/^(?:\d{1,3}(?:\.|$)){4}/);
  if (m) {
    m = m[0].split('.');
    m = f(m[0]) + f(m[1]) + f(m[2]) + f(m[3]);
    // Return if 4 bytes, otherwise false.
    return m.length === 4 ? m : false;
  }
  r = /^((?:[\da-f]{1,4}(?::|)){0,8})(::)?((?:[\da-f]{1,4}(?::|)){0,8})$/;
  // IPv6
  m = a.match(r);
  if (m) {
    // Translate each hexadecimal value.
    for (j = 1; j < 4; j++) {
      // Indice 2 is :: and if no length, continue.
      if (j === 2 || m[j].length === 0) {
        continue;
      }
      m[j] = m[j].split(':');
      for (i = 0; i < m[j].length; i++) {
        m[j][i] = parseInt(m[j][i], 16);
        // Would be NaN if it was blank, return false.
        if (isNaN(m[j][i])) {
          // Invalid IP.
          return false;
        }
        m[j][i] = f(m[j][i] >> 8) + f(m[j][i] & 0xFF);
      }
      m[j] = m[j].join('');
    }
    x = m[1].length + m[3].length;
    if (x === 16) {
      return m[1] + m[3];
    } else if (x < 16 && m[2].length > 0) {
      return m[1] + (new Array(16 - x + 1))
        .join('\x00') + m[3];
    }
  }
  // Invalid IP.
  return false;
};

// Build an IP packet header Parser
var hepHeader = new Parser()
  .endianess("big")
  .string("hep", { length: 4, stripNull: true, assert: "HEP3" })
  .uint16("hepLength")
  .buffer("payload", { length: function () {return this.hepLength - 6; } }); // Length of HepMessage is defined including the 6 Byte Header

var hepParse = new Parser()
  .endianess("big")
  .uint16("vendor")
  .uint16("type")
  .uint16("length")
  .buffer("chunk", { length: function () {return this.length-6;} }); // Length of Chunk is defined including the 6 Byte header

var hepIps = new Parser()
  .endianess("big")
  .array("ip",{
     type: "uint8",
     length: 4
  });

var hepDecode = function(data){
  switch(data.type) {
    case 1:
	return { rcinfo: { protocolFamily: data.chunk.readUInt8() } };
    case 2:
	return { rcinfo: { protocol: data.chunk.readUInt8() } };
    case 3:
	return { rcinfo: { srcIp: hepIps.parse(data.chunk).ip.join('.') } };
    case 4:
	return { rcinfo: { dstIp: hepIps.parse(data.chunk).ip.join('.') } };
    case 7:
	return { rcinfo: { srcPort: data.chunk.readUInt16BE() } };
    case 8:
	return { rcinfo: { dstPort: data.chunk.readUInt16BE() } };
    case 9:
	return { rcinfo: { timeSeconds: data.chunk.readUInt32BE() } };
    case 10:
	return { rcinfo: { timeUseconds: data.chunk.readUInt32BE() } };
    case 11:
	return { rcinfo: { payloadType: data.chunk.readUInt8() } };
    case 12:
	return { rcinfo: { captureId: data.chunk.readUInt32BE() } };
    case 14:
	return { rcinfo: { capturePass: data.chunk.toString() } };
    case 15:
	return { payload: data.chunk.toString() };
    case 17:
        return { rcinfo: { correlation_id: data.chunk.toString() } };
    case 19:
	return { rcinfo: { hepNodeName: data.chunk.toString() } };
    case 32:
	return { rcinfo: { mos: data.chunk.readUInt16BE() } };
    case 36:
	return { rcinfo: { transaction_type: data.chunk.readUInt16BE() } };
    default:
	return {};
  }
};

function deepMerge(o1,o2) {
 for (var k in o2) {
   if (typeof(o2[k])=='object') {
       if(!o1[k]) o1[k] = {};
       //console.log(merge(o1[k],o2[k]) );
       o1[k] = deepMerge(o1[k],o2[k]);
   } else { 
       o1[k] = o2[k];
   }
 }
 return o1;
}


/*
   Appendix A: HEP3 JSON Format (prototype)
*/

/*
var hepPacket = {
       "type": "HEP",
       "version": 3,
       "rcinfo": {
         "protocolFamily": 2,
         "protocol": 17,
         "srcIp": "192.168.3.12",
         "srcPort": 5060,
         "dstIp": "192.168.3.11",
         "dstPort": 5060,
         "timestamp": "2015-06-11T12:36:08:222Z",
         "timestampUSecs": 0,
         "captureId": 241,
	 "hepNodeName": "ams01-voip",
         "capturePass": "myHep",
         "payload_type": "SIP"
       },
       "payload": {
           "data": "INVITE sip:9999@homer SIP/2.0\r\n..."
       }
   };

*/

}).call(this,require("buffer").Buffer)
},{"binary-parser":16,"buffer":6,"mixin-deep":19}],19:[function(require,module,exports){
'use strict';

const isObject = val => {
  return typeof val === 'function' || (typeof val === 'object' && val !== null && !Array.isArray(val));
};

const isValidKey = key => {
  return key !== '__proto__' && key !== 'constructor' && key !== 'prototype';
};

const mixinDeep = (target, ...rest) => {
  for (let obj of rest) {
    if (isObject(obj)) {
      for (let key in obj) {
        if (isValidKey(key)) {
          mixin(target, obj[key], key);
        }
      }
    }
  }
  return target;
};

function mixin(target, val, key) {
  let obj = target[key];
  if (isObject(val) && isObject(obj)) {
    mixinDeep(obj, val);
  } else {
    target[key] = val;
  }
}

/**
 * Expose mixinDeep
 * @type {Function}
 */

module.exports = mixinDeep;

},{}],20:[function(require,module,exports){
/*
  SIPCore.js - General purpose SIP library for JavaScript.
  Copyright (C) 2013 Gregor Mazovec

  SIPCore.js is free software: you can redistribute it and/or modify
  it under the terms of the GNU Lesser General Public License as
  published by the Free Software Foundation, either version 3 of the
  License, or any later version.

  SIPCore.js is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  GNU Lesser General Public License for more details.

  You should have received a copy of the GNU Lesser General Public License
  along with SIPCore.js. If not, see <http://www.gnu.org/licenses/>.
*/
// **SIPCore.js** is general purpose SIP library as defined in 
// [RFC 3261](http://www.ietf.org/rfc/rfc3261.txt). Source
// code is released under *GNU Lesser General Public License*.


/*jslint continue: true, nomen: true, regexp: true, sub: true, vars: true */

'use strict';

var EventEmitter = require('events').EventEmitter;
var assert = require('assert').ok;
var inherits = require('util').inherits;


// ## Token Constants
var CR        = '\r';
var LF        = '\n';
var CRLF      = CR + LF;
var HTAB      = '\t';
var SPACE     = ' ';
var DOT       = '.';
var COMMA     = ',';
var SEMI      = ';';
var COLON     = ':';
var EQUAL     = '=';
var DQUOT     = '"';
var QUOT      = '\'';
var DASH      = '-';
var AMPERSAND = '&';
var QMARK     = '?';
var EMPTY     = '';


// ## SIP Constants

// Currently supported protocol version.
var SIP_VERSION = '2.0';


// SIP messages types.
var SIP_REQUEST   = 1;
var SIP_RESPONSE  = 2;


// SIP transaction states.
var SIP_STATE_CALLING    = 1;
var SIP_STATE_TRYING     = 2;
var SIP_STATE_PROCEEDING = 3;
var SIP_STATE_COMPLETED  = 4;
var SIP_STATE_CONFIRMED  = 5;
var SIP_STATE_TERMINATED = 6;


// SIP Timers in miliseconds.
var SIP_T1 = 500;
var SIP_T2 = 4 * 1000;
var SIP_T4 = 5 * 1000;
var SIP_TIMER_A = SIP_T1;
var SIP_TIMER_B = 64 * SIP_T1;
var SIP_TIMER_C = 60 * 3 * 1000;
var SIP_TIMER_D = 32 * 1000;
var SIP_TIMER_E = SIP_T1;
var SIP_TIMER_F = 64 * SIP_T1;
var SIP_TIMER_G = SIP_T1;
var SIP_TIMER_H = 64 * SIP_T1;
var SIP_TIMER_I = SIP_T4;
var SIP_TIMER_J = 64 * SIP_T1;
var SIP_TIMER_K = SIP_T4;


// SIP methods defined in *RFC 3261*, *RFC 3262*, *RFC 3265*,
// *RFC 3428*, *RFC 3515* and *RFC 3856*.
var SIP_ACK       = 'ACK';
var SIP_BYE       = 'BYE';
var SIP_CANCEL    = 'CANCEL';
var SIP_INVITE    = 'INVITE';
var SIP_MESSAGE   = 'MESSAGE';
var SIP_NOTIFY    = 'NOTIFY';
var SIP_OPTIONS   = 'OPTIONS';
var SIP_PRACK     = 'PRACK';
var SIP_PUBLISH   = 'PUBLISH';
var SIP_REFER     = 'REFER';
var SIP_REGISTER  = 'REGISTER';
var SIP_SUBSCRIBE = 'SUBSCRIBE';


// ### Defined response status codes
var SIP_STATUS = {

// 1xx - Provisional status codes
    100: 'Trying',
    180: 'Ringing',
    181: 'Call Is Being Forwarded',
    182: 'Queued',
    183: 'Session Progress',

// 2xx - Success status codes
    200: 'OK',

// 3xx - Redirection status codes
    300: 'Multiple Choises',
    301: 'Moved Permanently',
    302: 'Moved Temporarily',
    305: 'Use Proxy',
    380: 'Alternative Service',

// 4xx - Client error status codes
    400: 'Bad Request',
    401: 'Unauthorized',
    402: 'Payment Required',
    403: 'Forbidden',
    404: 'Not Found',
    405: 'Method Not Allowed',
    406: 'Not Acceptable',
    407: 'Proxy Authentication Required',
    408: 'Request Timeout',
    410: 'Gone',
    413: 'Request Entity Too Large',
    414: 'Request-URI to Long',
    415: 'Unsupported Media Type',
    416: 'Unsupported URI Scheme',
    420: 'Bad Extension',
    421: 'Extension Required',
    423: 'Interval Too Brief',
    480: 'Temporarily Unavailable',
    481: 'Call/Transaction Does Not Exist',
    482: 'Loop Detected',
    483: 'Too Many Hops',
    484: 'Address Incomplete',
    485: 'Ambiguous',
    486: 'Busy Here',
    487: 'Request Terminated',
    488: 'Not Acceptable Here',
    491: 'Request Pending',
    493: 'Undecipherable',

// 5xx - Server Error status codes
    500: 'Server Internal Error',
    501: 'Not Implemented',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    504: 'Server Time-out',
    505: 'Version Not Supported',
    513: 'Message Too Large',

// 6xx - Global failure status codes
    600: 'Busy Everywhere',
    603: 'Decline',
    604: 'Does Not Exist Anywhere',
    606: 'Not Acceptable'
};

// ### Compact Form


// Header names can be replace with shorter values.
var SIP_COMPACT_VALUES = {

    'content-type'      : 'c',
    'content-encoding'  : 'e',
    'from'              : 'f',
    'call-id'           : 'i',
    'supported'         : 'k',
    'content-length'    : 'l',
    'contact'           : 'm',
    'subject'           : 's',
    'to'                : 't',
    'via'               : 'v'
};


var SIP_COMPACT_HEADERS = {

    'c': 'content-type',
    'e': 'content-encoding',
    'f': 'from',
    'i': 'call-id',
    'k': 'supported',
    'l': 'content-length',
    'm': 'contact',
    's': 'subject',
    't': 'to',
    'v': 'via'
};


// Predefined formated header names. This list only defines header
// names that cannot be transformed to original form from lower case
// string. Other header names are added during runtime.
var sip_headers = {

    'call-id': 'Call-ID',
    'cseq': 'CSeq',
    'mime-version': 'MIME-Version',
    'rack': 'RAck',
    'www-authenticate': 'WWW-Authenticate'
};


// ## Custom methods


// This method returns byte length for UTF8 strings.
String.prototype.lengthUTF8 = function () {

    var m = encodeURIComponent(this).match(/%[89ABab]/g);

    return this.length + (m ? m.length : 0);
};


// ## Helpers

// Checks if object is instance of some class.
//
// Example:
//
//     is(someObj, Message);
/**
 * @param {*} obj Object to check.
 * @param {(function()|Object)} name Class object.
 * @return {boolean}
 */
function is(obj, name) {

    return (obj instanceof name);
}


// Checks if object is instance of JavaScript Object.
//
// Example:
//
//     // same as is(someObj, Object);
//     isObject(someObj);
/**
 * @param {*} obj Object to check.
 * @return {boolean}
 */
function isObject(obj) {

    return is(obj, Object);
}


// Checks if object is instance of JavaScript Array.
//
// Example:
//
//     // same as is(someArr, Array);
//     isArray(someArr);
/**
 * @param {*} obj Object to check.
 * @return {boolean}
 */
function isArray(obj) {

    return is(obj, Array);
}


// Deep clone of an object.
//
// Example:
//
//     clone(msg, copy);
/**
 * @param {Object} from Source object.
 * @param {Object} to Target object.
 */
function clone(from, to) {

    var attr, type, _attr;

    for (_attr in from) {

        if (from.hasOwnProperty(_attr)) {

            attr = from[_attr];
            type = typeof attr;

            if (type === 'function') {
                continue;
            }

            if (attr !== null && type === 'object') {

                to[_attr] = (isArray(attr)) ? [] : {};
                clone(attr, to[_attr]);

            } else {
                to[_attr] = attr;
            }
        }
    }
}


// Split header values from string to array. SIP parser uses this
// function to get values from header. Values are seperated with
// comma character - quoted string are ignored.
//
// For example *Record-Route* header value
//
//     "<sip:proxy1@example.org>, <sip:proxy2@example.org>"
//
// is parsed to array
//
//     [ "<sip:proxy1@example.org>", "<sip:proxy2@example.org>" ]
/**
 * @param {string} value Header value.
 * @return {Array.<string>} Array of header values.
 */
function splitHeaderValues(value) {

    if (value.indexOf(COMMA) === -1) {
        return [value];
    }

    var values = [];
    var i = 0;
    var start = 0;
    var len = value.length;
    var inQuote = false;
    var c;

    while (i < len) {

        c = value.charAt(i);
        i += 1;

        if (c === DQUOT) {
            inQuote = !inQuote;
        }

        if (!inQuote && c === COMMA) {

            values.push(value.substr(start, i - start - 1));
            start = i;
        }
    }

    values.push(value.substr(start, len));

    return values;
}

// ## SIP Parser
//
// SIP parser is state machine that traverse message in main loop - byte
// by byte.

// Initialize new parser for parsing SIP messages.
/**
 * @return {Function} Function for parsing messages.
 */
function initParser() {

    var i;
    var len;
    var data;

// States of parser's state machine.
    var state_req_or_res    = 0;
    var state_start_req     = 1;
    var state_start_res     = 2;
    var state_res_s         = 3;
    var state_res_si        = 4;
    var state_res_sip       = 5;
    var state_req_method    = 6;
    var state_req_uri       = 7;
    var state_res_status    = 8;
    var state_res_reason    = 9;
    var state_msg_version   = 10;
    var state_header_start  = 11;
    var state_header_value  = 12;
    var state_start_body    = 13;
    var state_msg_end       = 14;

// List of headers that can hold more that one value.
    var multipleValueHeader = {

        'contact': true,
        'record-route' : true,
        'route': true,
        'via': true
    };


// Character is pushed back to main loop.
    function push() {
        i -= 1;
    }

// Character is pulled from main loop.
    function pull() {

        i += 1;
        return data.charAt(i);
    }

// Main loop is reset.
    function reset() {
        i = -1;
    }

// Throws parse error.
    function error(text) {

        i = len;
        throw new Error(text);
    }

// Read characters until delimiter is found.
    function read_until(delimit) {

        if (!delimit) {
            return data.substr(i);
        }

        var start = i;
        var end = data.length;
        var c;

        while (i < len) {

            c = data.charAt(i);
            end = i;

            if (c === delimit) {
                break;
            }
            i += 1;
        }

        return data.substr(start, end - start);
    }


// Main parser function.
    function _parse(raw) {

        var message = {headers: {}, body: EMPTY};
        var state = state_req_or_res;
        var method, uri, version;
        var status, reason;
        var headers = {};
        var header_name, header_value;
        var type;
        var header_multiline;
        var c;

        var _method, isReq, _, _values, next, _i, body;

        data = raw;
        len = data.length;
        i = -1;


// Main loop read characters from message. Characters are pulled
// and pushed back to loop.

        while (i < len) {

            i += 1;
            c = data.charAt(i);

            switch (state) {

// This is initial state where figure out if parsing request or response.
            case state_req_or_res:

                if (c === CR || c === LF) {
                    break;
                }

                state = (c === 'S') ? state_start_res : state_start_req;

                push();

                break;


// Message type and method is set. Method is set based on first
// character. Method value is checked in *state_req_method* state.
            case state_start_req:

                type = SIP_REQUEST;

                switch (c) {

                case 'I':
                    method = SIP_INVITE;
                    break;

                case 'A':
                    method = SIP_ACK;
                    break;

                case 'C':
                    method = SIP_CANCEL;
                    break;

                case 'B':
                    method = SIP_BYE;
                    break;

                case 'R':
                    method = SIP_REGISTER;
                    break;

                case 'O':
                    method = SIP_OPTIONS;
                    break;

                case 'P':
                    method = SIP_PRACK;
                    break;

                case 'S':
                    method = SIP_SUBSCRIBE;
                    break;

                case 'N':
                    method = SIP_NOTIFY;
                    break;

                case 'M':
                    method = SIP_MESSAGE;
                    break;

                default:
                    error('Invalid request method');
                    break;

                }

                state = state_req_method;

                break;

            case state_start_res:

                if (c === 'S') {
                    state = state_res_s;
                }

                break;

            case state_res_s:

                if (c === 'I') {

                    if (!type) {
                        type = SIP_RESPONSE;
                    }

                    state = state_res_si;

                } else if (c === 'U') {

                    state = state_start_req;
                    reset();

                } else {
                    error('Invalid method or status');
                }

                break;

            case state_res_si:

                if (c === 'P') {
                    state = state_res_sip;

                } else {
                    error('Invalid message');
                }

                break;

            case state_res_sip:

                if (c === '/') {
                    state = state_msg_version;

                } else {
                    error('Missing protocol version');
                }

                break;

            case state_res_status:

                status = parseInt(read_until(SPACE), 10);

                if (!SIP_STATUS[status]) {
                    error('Invalid message status code');
                }

                state = state_res_reason;
                message.status = status + EMPTY;

                break;

            case state_res_reason:

                reason = read_until(CR);
                state = state_header_start;
                message.reason = reason;

                break;

            case state_req_method:

                if (method === SIP_PRACK && c === 'U') {
                    method = SIP_PUBLISH;

                } else if (method === SIP_REGISTER) {

                    if (c === 'E') {

                        if (pull() === 'F') {
                            method = SIP_REFER;
                        }

                        push();
                    }
                }

                push();

                _method = read_until(SPACE);

                if (!method || !_method || method !== _method) {
                    error('Invalid message header');
                }

                state = state_req_uri;
                message.method = method;

                break;

            case state_req_uri:

                if (c === SPACE) {
                    break;
                }

                if (c === 's') {

                    uri = read_until(SPACE);
                    state = state_start_res;
                    message.uri = uri;

                } else {
                    error('Invalid request URI');
                }

                break;

            case state_msg_version:

                isReq = (type === SIP_REQUEST);
                version = read_until(isReq ? CR : SPACE);
                state = isReq ? state_header_start : state_res_status;
                message.version = version;

                break;

            case state_header_start:

                if (c === LF) {
                    break;
                }

                if (c === SPACE || c === HTAB) {
                    header_multiline = true;

                } else if (c === CR) {

                    next = pull();

                    if (next === LF) {
                        state = state_start_body;
                    }

                    break;
                }

                if (!header_multiline) {

                    header_name = read_until(COLON).toLowerCase();

                    if (SIP_COMPACT_HEADERS[header_name]) {
                        header_name = SIP_COMPACT_HEADERS[header_name];
                    }
                }

                state = state_header_value;

                break;

            case state_header_value:

                header_value = read_until(CR).trim();

                if (!header_value) {

                    state = state_header_start;
                    break;
                }

                if (headers[header_name]) {

                    if (!isArray(headers[header_name])) {

                        if (!header_multiline) {

                            _ = headers[header_name];
                            headers[header_name] = [_];
                        }
                    }
                }

                if (header_multiline) {

                    if (isArray(headers[header_name])) {

                        _ = headers[header_name].pop();
                        _ += header_value;

                        headers[header_name].push(_);

                    } else {
                        headers[header_name] += header_value;
                    }

                    header_multiline = false;

                } else {

                    if (headers[header_name]) {
                        headers[header_name].push(header_value);

                    } else {
                        headers[header_name] = header_value;
                    }
                }

                if (multipleValueHeader[header_name]) {

                    if (isArray(headers[header_name])) {

                        _ = headers[header_name].pop();
                        _values = splitHeaderValues(_);

                        for (_i in _values) {

                            if (_values.hasOwnProperty(_i)) {
                                headers[header_name].push(_values[_i].trim());
                            }
                        }

                    } else {

                        _ = headers[header_name];
                        _values = splitHeaderValues(_);

                        if (_values.length > 1) {

                            headers[header_name] = [];

                            for (_i in _values) {

                                if (_values.hasOwnProperty(_i)) {
                                    headers[header_name].push(_values[_i].trim());
                                }
                            }
                        }
                    }
                }

                state = state_header_start;

                pull();

                break;

            case state_start_body:

                body = read_until(null);
                message.headers = headers || {};
                message.body = body || EMPTY;
                state = state_msg_end;

                break;

            default:

                break;

            }

        }

        if (state !== state_msg_end) {
            error('Invalid message: ' + state);
        }

        return message;
    }

    return function (raw) {

        return _parse(raw);
    };
}


// ## Value Parsers

var uriRe = /^(\w+):([\w\-\.\!\~\*\'\(\)\&\=\+\$\,\;\?\/]+):?([\w\-\.\!\~\*\'\(\)\&\=\+\$\,]+)?@?([\w\-\.]+)?:?(\d+)?;?([\w=@;\.\-_]+)?\??([\S\s]+)?/;
var viaRe = /SIP\/(\d\.\d)\/(\w+)\s+([\w\-\.]+):?(\d*)?;?(.*)?/;


// *parseParameters* function parses parameter values from string.
//
//     parseParameters('branch=rgfh374ny;received=192.168.1.102');
//
//     // result
//     {
//       branch: 'rgfh374ny',
//       received: '192.168.1.102'
//     }
/**
 * @param {string} value
 * @param {(string|null)=} sep Character that seperates parameters.
 * @param {boolean=} lower Covert parameter value to lower case.
 * @return {Object}
 */
function parseParameters(value, sep, lower) {

    var c;
    var i = 0;
    var start = 0;
    var end;
    var len = value.length;
    var params = {};
    var paramName;

    sep = sep || SEMI;

    function getValue() {
        return value.substr(start, end);
    }

    while (i <= len) {

        c = value.charAt(i);
        i += 1;

        if ((i === len && paramName) || c === sep) {

            end = i - start - (i === len && c !== sep ? 0 : 1);

            if (!paramName) {

                paramName = getValue();
                params[paramName] = '';

            } else {
                params[paramName] = lower ? getValue().toLowerCase() : getValue();
            }

            paramName = '';
            start = i;

        } else if (c === EQUAL) {

            end = i - start - 1;
            paramName = getValue().toLowerCase();
            start = i;

        } else if (i === len) {

            end = i - start;
            paramName = getValue().toLowerCase();
            params[paramName] = '';
        }
    }

    return params;
}


// *formatParameters* function does the opposite operation as
// *parseParameters*.
//
//     formatParameters({branch:'rgfh374ny',received:'192.168.1.102'});
//
//     // result
//     'branch=rgfh374ny;received=192.168.1.102'
/**
 * @param {Object} params
 * @param {string} sep
 * @param {string} delimit
 * @return {string}
 */
function formatParameters(params, sep, delimit) {

    var _ = [];
    var p;

    for (p in params) {

        if (params.hasOwnProperty(p)) {
            _.push(p + EQUAL + encodeURI(params[p]));
        }
    }

    return _.length ? delimit + _.join(sep) : '';
}


// Parser for *Via* header value.
//
//     parseVia('SIP/2.0/TCP pc33.example.com:5060;branch=bb654vt3f');
//
//     // result
//     {
//       'version': '2.0',
//       'protocol': 'TCP',
//       'host': 'pc33.example.com',
//       'port': '5060',
//       'params': {
//         'branch': 'bb654vt3f'
//       }
//     }
/**
 * @param {string} value
 * @return {(Object.<string, *>|null)}
 */
function parseVia(value) {

    var match = viaRe.exec(value);

    if (!match) {
        return null;
    }

    var params = parseParameters(match[5]);

    return match ? {

        'version': match[1],
        'protocol': match[2],
        'host': match[3],
        'port': match[4],
        'params': params || {}
    } : null;
}


// Parser for *Contact* header value.
//
//     parseContact('Bob <sip:bob@biloxi.example.com>;rinstance=65bv4');
//
//     // result
//     {
//       'name': 'Bob',
//       'uri': 'sip:bob@biloxi.example.com',
//       'params': {
//         'rinstance': '65bv4'
//       }
//     }
/**
 * @param {string} value
 * @return {(Object.<string, *>)}
 */
function parseContact(value) {

    var _contact = value.split('>;');
    var name = '', uri = '', params = {};
    var _addr = _contact[0];
    var _params = [], _paramData;

    if (_contact[1]) {
        _params = _contact[1].split(SEMI);
    }

    if (_addr.indexOf('sip') < 2) {
        uri = _addr.substr(1, _addr.length).replace('>', '');

    } else {

        _addr = _addr.split(SPACE);
        name = _addr[0].trim();
        uri = _addr[1].substr(1, _addr[1].length).replace('>', '');
    }

    var i;

    for (i = 0; i < _params.length; i += 1) {

        _paramData = _params[i].split(EQUAL);
        params[_paramData[0]] = _paramData[1];
    }

    return {'name': name, 'uri': uri, 'params': params};
}


// Parser for *CSeq* header value.
//
//     parseCSeq('242 INVITE');
//
//     // result
//     {
//       'seq': '242',
//       'method': 'INVITE'
//     }
/**
 * @param {string} value
 * @return {(Object.<string, *>|null)}
 */
function parseCSeq(value) {

    var _data = value.split(SPACE);

    return {

        'seq': _data[0],
        'method': _data[1]
    };
}


var parsers = {

    'contact': parseContact,
    'cseq': parseCSeq,
    'from': parseContact,
    'via': parseVia,
    'to': parseContact
};


// ## Value Stringifiers

/**
 * @param {Object} value
 */
function stringifyParameters(params) {

    var value = '';
    var key;

    for (key in params) {

        if (params.hasOwnProperty(key)) {
            value += params[key] ? ';' + key + '=' + params[key] : ';' + key;
        }
    }

    return value;
}


/**
 * @param {Object} value
 */
function stringifyContact(value) {

    return value.name + ' <' + value.uri + '>' + stringifyParameters(value['params']);
}


/**
 * @param {Object} value
 */
function stringifyCSeq(value) {

    return value['seq'] + ' ' + value.method;
}


/**
 * @param {Object} value
 */
function stringifyVia(value) {

    var s = 'SIP/' + value.version + '/' + value.protocol + ' ' + value.host;

    if (value.port) {
        s += ':' + value.port;
    }

    s += stringifyParameters(value['params']);

    return s;
}


var stringifiers = {

    'contact': stringifyContact,
    'cseq': stringifyCSeq,
    'from': stringifyContact,
    'via': stringifyVia,
    'to': stringifyContact
};


// ## Message
//
// Message class represents SIP message which is similar to HTTP message.
// Like in HTTP there are two types of messages - requests and responses.
// Request is defined with *method* and *URI* value, and response is defined
// with *status code* and *reason text*. Both types have *headers* and *body*
// attributes.
//
//     request = {
//       method: 'INVITE',
//       uri: 'sip:alice@example.org',
//       version: '2.0',
//
//       headers: { ... },
//       body: ''
//     }
//
//     response = {
//       status: '200',
//       reason: 'OK',
//       version: '2.0',
//
//       headers: { ... },
//       body: ''
//     }
//
// Examples of creating new messages are described under section
// [SIP.createMessage](#section-34). Supported methods and status codes
// are defined under section [SIP Constants](#section-3).
/**
 * @constructor
 * @param {(string|number|Object|Message|null)} arg1 SIP request method or response status or object.
 * @param {string=} arg2 Valid SIP URI or message status text.
 * @param {Object.<string, string>=} headers SIP message headers.
 * @param {string=} body SIP message body content.
 */
function Message(arg1, arg2, headers, body) {

    if (is(arg1, Message)) {

        clone(arg1, this);
        return;
    }

    var exportArgs = isObject(arg1);
    var isResponse = (arg1 > 0);

    if (exportArgs) {

        var args = arg1;
        arg1 = args.method || args.status;
        isResponse = (arg1 > 0);

        if (isResponse) {
            arg2 = args.reason;

        } else {
            arg2 = args.uri;
        }

        headers = args.headers;
        body = args.body;
    }


    if (isResponse) {

        if (!SIP_STATUS[arg1]) {
            throw new TypeError('Invalid status code ' + arg1);
        }

        this.status = arg1;
        this.reason = arg2 || SIP_STATUS[arg1];

    } else {

        if (!arg1) {
            throw new TypeError('Invalid message method');
        }

        if (!arg2) {
            throw new TypeError('Invalid message URI');
        }

        this.method = arg1;
        this.uri = arg2;
    }

    this.version = SIP_VERSION;
    this.headers = headers || {};
    this.body = body || '';
}


// ## Message.getHeader
//
// Fetch header value in string or object form.
//
// Notice - compact header names can be used, check 
// [compact headers](#section-15).
//
// Example:
//
//     messsage.getHeader('to');
//
//     // get first value from via header
//     message.getHeader('via', false, 0);
//
//     // get last value from via header
//     message.getHeader('via', false , -1);
//
//     // get all values
//     message.getHeader('via');
//
// Header value can be parsed to object.
//
// Example:
//
//     message.getHeader('from', true);
//
//     // result
//     {
//       'name': 'Alice',
//       'uri': 'sip:atlanta.example.com;transport=tcp',
//       'params': {
//         'tag': 'b7546u5e'
//       }
//     }
/**
 * @param {string} name Header name.
 * @param {boolean} parse Return parsed header value.
 * @param {number=} pos Get header value from position.
 * @return {string}
 */
Message.prototype.getHeader = function (name, parse, pos) {

    name = name.toLowerCase();

    if (SIP_COMPACT_HEADERS[name]) {
        name = SIP_COMPACT_HEADERS[name];
    }

    var returnAll = (pos === undefined);
    var header = this.headers[name];
    var multiHeader = isArray(header);

    if (pos < 0 && header) {
        pos += header.length;

    } else {
        pos = pos > 0 ? pos : 0;
    }

    var i;
    var value = (!returnAll && multiHeader) ? header[pos] : header;

    if (value && parse && parsers[name]) {

        if (multiHeader && returnAll) {

            var _values = [];

            for (i in value) {

                if (value.hasOwnProperty(i)) {
                    _values.push(parsers[name](value[i]));
                }
            }

            value = _values;

        } else {
            value = parsers[name](value);
        }
    }

    return value || null;
};


// ## Message.setHeader
//
// This method can be convenient for manipulating header values. Values
// can be added, updated or removed.
//
// Notice - compact header names can be used, check 
// [compact headers](#section-15).
//
// Example:
//
//     // add Contact header value
//     message.setHeader('contact', 'Bob <sip:bob@example.org>');
//     message.setHeader('t', 'Alice <sip:alice@example.org>');
//
//     // add many Contact header values
//     message.setHeader('record-route',
//       ['<sip:proxy.example.org>', '<sip:proxy2.example.org']);
//
//     // append value to Via header
//     message.setHeader('via',
//       'SIP/2.0/TCP 10.0.0.1:5060;branch=z9hG4bKnashd92', true);
//
//     // prepend value to Via header
//     message.setHeader('via',
//       'SIP/2.0/TCP 10.0.0.4:5060;branch=z9hG4bKb7546v', false);
//
//     // update value
//     message.setHeader('date', 'Sat, 13 Nov 2010 23:29:00 GMT');
//     message.setHeader('via',
//       'SIP/2.0/UDP 10.0.0.1:5060;branch=z9hG4bKnashd92', 0);
/**
 * @param {string} name Header name.
 * @param {(string|Object)} value Header value.
 * @param {(boolean|number)=} pos Push values to array or remove from position.
 */
Message.prototype.setHeader = function (name, value, pos) {

    var i;
    var headers = this.headers;

    name = name.toLowerCase();

    if (SIP_COMPACT_HEADERS[name]) {
        name = SIP_COMPACT_HEADERS[name];
    }

    if (!isArray(value) && isObject(value)) {

        assert(stringifiers[name], 'Undefined stringifer');

        value = stringifiers[name](value);
    }

    if (headers[name] && pos !== undefined) {

        if (!isArray(headers[name])) {
            headers[name] = [headers[name]];
        }

        if (value === null) {

            if (pos < 0) {
                pos += headers[name].length;
            }

            headers[name][pos] = value;

            if (headers[name].length < 2) {

                delete headers[name];
                return;
            }

            var newValues = [];

            for (i in headers[name]) {

                if (headers[name].hasOwnProperty(i)) {

                    if (headers[name][i] === null) {
                        continue;
                    }

                    newValues.push(headers[name][i]);
                }
            }

            headers[name] = newValues;

        } else if (isArray(value)) {

            for (i = 0; i < value.length; i += 1) {

                if (isObject(value[i])) {
                    headers[name].push(stringifiers[name](value[i]));

                } else {
                    headers[name].push(value[i]);
                }
            }

        } else {

            if (pos < 0) {
                pos += headers[name].length;

                if (pos < 0) {
                    pos = 0;
                }
            }

            if ((pos || pos === 0) && headers[name][pos]) {
                headers[name][pos] = value;

            } else if (pos === false) {
                headers[name].unshift(value);

            } else {
                headers[name].push(value);
            }
        }

    } else {

        if (value === null) {
            delete headers[name];

        } else {
            headers[name] = value;
        }
    }

    this.headers = headers;
};


// ## SIP.createMessage
//
// This function can be used to create SIP Message object from string
// or object. 
//
// Example:
//
//     SIP.createMessage('INVITE', 'alice@example.org');
//     SIP.createMessage(200, 'OK');
//
//     SIP.createMessage({
//       method: 'MESSAGE',
//       uri: 'sip:alice@example.org',
//       body: 'Hello Alice!'
//     });
//
//  Message can be cloned with:
//
//      SIP.createMessage(message);
/**
 * @param {(string|number|Object|Message)} arg1 SIP request method or response status or object.
 * @param {string} arg2 Valid SIP URI or message status text.
 * @param {Object.<string, string>=} headers SIP message headers.
 * @param {string=} body SIP message body content.
 * @return {Message}
 */
var createMessage = function (arg1, arg2, headers, body) {

    return new Message(arg1, arg2, headers, body);
};


// ## Message.copy
/**
 * @return {Message}
 */
Message.prototype.copy = function () {

    return createMessage(this);
};


// ## SIP.format
//
// This function transforms *Message* object to raw message
// which can be sent over the network.
//
// Example:
//
//     SIP.format({
//       method: 'MESSAGE',
//       uri: 'sip:alice@example.org',
//       body: 'Hello Alice!'
//     }); 
//
//     // result
//     'MESSAGE sip:alice@example.org SIP/2.0
//      ... (headers)
//
//      Hello Alice!'
/**
 * @param {(Object|Message)} msg Message object.
 * @param {boolean=} compact Format message with compact header names.
 * @return {string}
 */
function formatMessage(msg, compact) {

    var s = '';

    if (msg.method) {
        s += msg.method + SPACE + msg.uri + ' SIP/' + msg.version + CRLF;

    } else {
        s += 'SIP/' + msg.version + SPACE + msg.status + SPACE + msg.reason + CRLF;
    }

    var h, i;
    var header, value, _;

    for (h in msg.headers) {

        if (msg.headers.hasOwnProperty(h)) {

            value = msg.headers[h];

            if (compact && SIP_COMPACT_VALUES[h]) {
                header = SIP_COMPACT_VALUES[h];

            } else {

                if (!sip_headers[h]) {

                    header = [];
                    _ = h.split(DASH);

                    for (i in _) {

                        if (_.hasOwnProperty(i)) {
                            header.push(_[i].substr(0, 1).toUpperCase() + _[i].substr(1));
                        }
                    }

                    sip_headers[h] = header.join(DASH);
                }

                header = sip_headers[h];
            }

            s += header + COLON + SPACE;
            s += isArray(value) ? value.join(CRLF + SPACE + COMMA + SPACE) : value;
            s += CRLF;
        }
    }

    s += CRLF;

    if (msg.body) {
        s += msg.body;
    }

    return s;
}


// ## Message.format
/**
 * @param {boolean} compact
 * @return {string}
 */
Message.prototype.format = function (compact) {

    return formatMessage(this, compact);
};


// ## Message.toResponse
/**
 * @param {string|number} status
 * @param {string=} reason
 * @return {Message}
 */
Message.prototype.toResponse = function (status, reason) {

    assert(this.method, 'Check message type');
    assert(SIP_STATUS[status], 'Check status');

    var msg = createMessage(this);

    delete msg.method;
    delete msg.uri;

    msg.status = status;
    msg.reason = reason || SIP_STATUS[status];
    msg.body = '';

    msg.setHeader('content-length', '0');
    msg.setHeader('max-forwards', null);

    return msg;
};


// ## Message.toRequest
/**
 * @param {string} method
 * @param {string} uri
 * @return {Message}
 */
Message.prototype.toRequest = function (method, uri) {

    assert(this.status, 'Check message type');
    assert(uriRe.exec(uri), 'Check URI');

    var msg = createMessage(this);

    delete msg.status;
    delete msg.reason;

    msg.method = method;
    msg.uri = uri;
    msg.body = '';

    msg.setHeader('content-length', '0');
    msg.setHeader('max-forwards', 70);

    return msg;
};


// ## SIP.isMessage
//
// Checks if object is instance of Message class and returns boolean value.
/**
 * @param {*} obj Object to test against.
 * @return {boolean}
 */
function isMessage(obj) {

    return is(obj, Message);
}


// ## SIP.parseUri
//
// SIP URIs are not parsed during message parsing. Therefore, URIs
// have to be parsed with function *parseUri**.
//
// Example:
//
//     SIP.parseUri('sip:alice@atlanta.example.com;transport=udp');
//
//     // result
//     {
//       'scheme': 'sip',
//       'user': 'alice',
//       'password': '',
//       'hostname': 'atlanta.example.com',
//       'port': '',
//       'params': {
//         'transport': 'udp'
//       },
//       'headers': {}
//     }
/**
 * @param {string} value SIP uri value.
 * @param {boolean=} parse Parse parameters and headers into object.
 * @return {SIPCoreUri}
 */
function parseUri(value, parse) {

    var match = uriRe.exec(decodeURI(value));

    if (!match) {
        return {};
    }

    var uri = {

        'scheme': (match[1] && match[1].toLowerCase()) || EMPTY,
        'user': (match[4] && match[2]) || EMPTY,
        'password': match[3] || EMPTY,
        'hostname': (match[4] && match[4].toLowerCase()) || match[2] || EMPTY,
        'port': match[5] || EMPTY,
    };

    if (parse) {

        uri['params'] = (match[6] && parseParameters(match[6], null, true)) || {};
        uri['headers'] = (match[7] && parseParameters(match[7], AMPERSAND)) || {};

    } else {

        uri['params'] = match[6] || {};
        uri['headers'] = match[7] || {};
    }

    return uri;
}


// ## SIP.formatUri
//
// This function returns formatted URI object.
//
// Example:
//
//     SIP.formatUri({
//       'scheme': 'sip',
//       'user': 'alice',
//       'hostname': 'atlanta.example.com',
//       'params': {
//         'transport': 'udp'
//       }
//     })
//
//     // result
//     'sip:alice@atlanta.example.com;transport=udp'
/**
 * @param {SIPCoreUri} uri URI object.
 * @return {string}
 */
function formatUri(uri) {

    var s = EMPTY;

    if (uri.scheme) {
        s += uri.scheme + COLON;
    }

    if (uri.user) {
        s += uri['user'];
    }

    if (uri.password) {
        s += COLON + uri['password'];
    }

    if (uri.hostname) {
        s += '@' + uri.hostname;
    }

    if (uri.port) {
        s += COLON + uri.port;
    }

    if (uri.params) {
        s += formatParameters(uri['params'], SEMI, SEMI);
    }

    if (uri.headers) {
        s += formatParameters(uri.headers, AMPERSAND, QMARK);
    }

    return s;
}


// ## SIP.parse
var __parser;

// This function parses SIP message into object.
//
// Example of parsing request:
//
//     SIP.parse('INVITE sip:alice@atlanta.example.com SIP/2.0...');
//
//     // result
//     {
//       'method': 'INVITE',
//       'uri': 'sip:alice@atlanta.example.com',
//       'version': '2.0',
//       'headers': { ... },
//       'body': ''
//     }
//
// Example of parsing response:
//
//     SIP.parse('SIP/2.0 200 OK...');
//
//     // result
//     {
//       'status': '200',
//       'reason': 'OK',
//       'version': '2.0',
//       'headers': { ... },
//       'body': ''
//     }
/**
 * @param {string} raw
 * @return {Object}
 */
function parseMessage(raw) {

    if (!__parser) {
        __parser = initParser();
    }

    return __parser(raw);
}


/**
 * @interface
 * @extends {EventEmitter}
 */
function Socket(port, addr) {

    EventEmitter.call(this);

    this.remotePort = port;
    this.remoteAddr = addr;
    this._closed = false;
    this._closeWatcher = null;
}


inherits(Socket, EventEmitter);


/**
 * @param {number=} timeout Timeout in miliseconds.
 */
Socket.prototype.setTimeout = function (timeout) {

    clearTimeout(this._closeWatcher);

    var that = this;

    this._closeWatcher = setTimeout(function () {
        that.close();

    }, timeout || 32 * 1000);
};


/**
 * @interface
 */
function Protocol() {

    EventEmitter.call(this);

    this.name = null;
    this.reliable = null;
    this.format = 'text';
    this.addr = null;
    this.port = null;
    this.listenState = 0;
}


inherits(Protocol, EventEmitter);


// Extend plugin protocol at runtime.
/**
 * @return {Protocol}
 */
function createProtocol(Constructor, options) {
/*
  if (!constructor) {
    var mod = require('./protocol/heap');
    constructor = mod.Protocol;
  }
*/
    if (Constructor.prototype.super_ !== Protocol) {

        var mem;
        var prototype = Constructor.prototype;

        inherits(Constructor, Protocol);

        for (mem in prototype) {

            if (prototype.hasOwnProperty(mem)) {
                Constructor.prototype[mem] = prototype[mem];
            }
        }

        Constructor.prototype.super_ = Protocol;
    }

    return new Constructor(Protocol, options);
}


// ## Transport API
/**
 * @constructor
 * @extends {EventEmitter}
 */
function Transport() {

    EventEmitter.call(this);

    this._protocols = {};
    this._sockets = {};
}


inherits(Transport, EventEmitter);


// ## Transport.register

// Register new transport protocol. Protocol can listen only to one
// port.
/**
 * @param {Protocol} protocol Protocol name.
 * @param {(number|string)=} port Binding port number.
 * @param {string=} addr Binding address.
 */
Transport.prototype.register = function (protocol, port, addr) {

    var that = this;
    var name = protocol.name;

    if (this._protocols[name]) {
        throw new Error('Protocol ' + name + ' already registered');
    }

/*
  // Initialize protocol from file.
  if (!protocol) {

    var path = './protocol/';

    if (name !== 'heap') {
      path += (process['env'] && process['env']['JS_ENV']) ? process['env']['JS_ENV'] : '';
    }

    var wrapper = require(path + '/' + name);

    protocol = wrapper.createProtocol();
  }
*/
    this._protocols[name] = [protocol, port, addr];

    protocol.on('listening', function () {
        that.emit('listening', protocol.name);
    });

// For reliable protocols, ex. TCP, listen for new connections. New
// connections are indexed by address, port and protocol name.

    if (protocol.reliable) {

        protocol.on('connection', function (sock) {

            var sockId = sock.remoteAddr + ':' + sock.remotePort + ':' + protocol.name;

            if (!that._sockets[sockId]) {
                that._sockets[sockId] = sock;
            }

            // Connection is removed from index on disconnect.
            sock.once('close', function () {
                delete that._sockets[sockId];
            });
        });
    }

// Listen for new messages from protocol layer.
    protocol.on('message', function (data, rinfo) {

        var mobj;

        // Message are parsed as JSON or plain text.
        try {
            mobj = (protocol.format === 'json') ?
                    JSON.parse(data) : parseMessage(data.toString());

        } catch (e) {
            // @pass
            console.log('Parse error:', e);
            return;
        }

        var msg = new Message(mobj);
        var via = msg.getHeader('via', true, 0);
        var hCseq = msg.getHeader('cseq', true);
        var match = '';

        // match transaction
        if (via && hCseq) {

            match = via['params']['branch'];

            if (msg.status) {
                match += '-' + hCseq.method;

            } else {

                match += '-' + via.host + ':' + via.port;
                match += '-' + (msg.method === SIP_ACK ? SIP_INVITE : msg.method);
            }
        }

        var emitEvent = 'message';

        if (EventEmitter.listenerCount(that, match) > 0) {
            emitEvent = match;
        }

// Add received and rport parameter as defined in *18.2.1* and *RFC 3581*.
// !!! setHeader stringifiers

        if (msg.method) {

            var viaRaw = msg.getHeader('via', false, 0);

            if (via['params']['rport'] === '' && rinfo.port && via.port !== rinfo.port) {
                viaRaw += '=' + rinfo.port;
            }

            if (rinfo['address'] && rinfo['address'] !== via.host) {
                viaRaw += ';received=' + rinfo['address'];
            }

            msg.setHeader('via', viaRaw, 0);

        }
        // !!! check sent-by value

        that.emit(emitEvent, msg);
    });

    protocol.on('close', function () {
        that.emit('close', protocol.name);
    });
};


/**
 * @private
 * @param {Array} bindData Protocol bind information.
 * @param {function()} cb
 */
Transport.prototype._bind = function (bindData, cb) {

    var protocol = bindData[0];
    var port = bindData[1] || 5060;
    var addr = bindData[2] || '0.0.0.0';

    protocol.bind(port, addr, function (err) {

        if (cb) {
            cb(err);
        }
    });
};


// ## Transport.listen

// Start listening on all protocols that are registered.
/**
 * @param {function()=} cb Callback function called when all protocols
 * are listening.
 */
Transport.prototype.listen = function (cb) {

    var name, bindData;
    var protocolNum = 0;
    var listening = {};

    var onBind = function (listen) {

        protocolNum -= 1;
        listening[name] = listen;

        if (protocolNum === 0) {

            if (cb) {
                cb(listening);
            }
        }
    };

    for (name in this._protocols) {

        if (this._protocols.hasOwnProperty(name)) {

            bindData = this._protocols[name];
            listening[name] = bindData[0].listenState;

            if (bindData[0].listenState !== 0) {
                continue;
            }

            protocolNum += 1;

            this._bind(bindData, onBind);

            if (protocolNum === 0) {

                if (cb) {
                    cb(listening);
                }
            }
        }
    }
};


// ## Transport.isListening

// Get listening state of specific protocol. If no name argument
// is passed to function, result contains listening states for all
// protocols.
/**
 * @param {string=} name Protocol name.
 * @return {boolean|object}
 */
Transport.prototype.isListening = function (name) {

    var bindData;

    if (name) {

        bindData = this._protocols[name];

        return bindData ? bindData[0].listenState : 0;

    }

    var listenStates = {};
    var protocolName;

    for (protocolName in this._protocols) {

        if (this._protocols.hasOwnProperty(protocolName)) {

            bindData = this._protocols[protocolName];
            listenStates[protocolName] = bindData[0].listenState;
        }
    }

    return listenStates;
};


// ## Transport.close

// Close and stop all running protocols.
/**
 * @param {function(Object)=} cb Callback called when call protocols are closed.
 */
Transport.prototype.close = function (cb) {

    var protocolNum = 0;
    var protocol;
    var listening = {};
    var name;

    for (name in this._protocols) {

        if (this._protocols.hasOwnProperty(name)) {

            protocol = this._protocols[name][0];
            listening[name]  = protocol.listenState;

            if (protocol.listenState === 1) {
                protocolNum += 1;
            }
        }
    }

    var onListen = function (listen) {

        protocolNum -= 1;
        listening[name] = listen;

        if (protocolNum === 0) {

            if (cb) {
                cb(listening);
            }
        }
    };

    for (name in this._protocols) {

        if (this._protocols.hasOwnProperty(name)) {

            protocol = this._protocols[name][0];

            if (protocol.listenState === 1) {
                protocol.close(onListen);
            }
        }
    }

    if (protocolNum === 0) {

        if (cb) {
            cb(listening);
        }
    }
};


// ## Transport.send

// This function can be used to send SIP message within client or server
// transport. Usually requests are sent to specific address within client
// transport. Responses are routed upstream to address that is stored in
// *Via* header.
/**
 * @param {(Object|Message)} msg Message object.
 * @param {string=} addr Binding address.
 * @param {(number|string)=} port Binding port number.
 * @param {string=} name Protocol name.
 * @param {function()} cb Send callback function.
 */
Transport.prototype.send = function (msg, addr, port, name, cb) {

    if (!isMessage(msg)) {

        if (cb) {
            cb('Invalid message argument');
        }

        return;
    }

    var readVia = (!addr);

    if (addr && typeof addr === 'function') {

        cb = addr;
        readVia = true;
    }

    var via = msg.getHeader('via', true, 0);

    if (!via) {

        if (cb) {
            cb('Missing Via header');
        }

        return;
    }

    if (readVia) {

        addr = via['params']['received'] || via.host;
        port = via['params']['rport'] || via.port;
        name = via.protocol;
    }

    name = name.toLowerCase();

    var bindData = this._protocols[name];

    if (!bindData) {

        if (cb) {
            cb('Unknown protocol ' + name);
        }

        return;
    }


    var protocol = bindData[0];

    if (!readVia) {

        via.host = protocol.addr;
        via.port = protocol.port;
        via['params']['rport'] = '';

        msg.setHeader('via', via, 0);
    }

    var data;

    try {

        // @temp - move to UA core
        msg.setHeader('Content-Length', msg.body ? msg.body.lengthUTF8() : 0);

        data = formatMessage(msg);

    } catch (e) {

        if (cb) {
            cb(e.message);
        }

        return;
    }

    var that = this;
    var sockId = addr + ':' + port + ':' + protocol.name;
    var sock = this._sockets[sockId];

    if (sock) {

        sock.send(data, function (err) {

            if (!err) {
                that.emit('send', msg);
            }

            if (cb) {
                cb(err);
            }
        });

    } else {

        sock = protocol.send(data, addr, port, function (err) {

            if (!err) {
                that.emit('send', msg);
            }

            if (cb) {
                cb(err);
            }
        });

        if (sock) {

            sockId = sock.remoteAddr + ':' + sock.remotePort + ':' + protocol.name;

            if (!this._sockets[sockId]) {
                this._sockets[sockId] = sock;
            }

            sock.once('close', function () {
                delete that._sockets[sockId];
            });
        }
    }
};


/**
 * @return {Transport}
 */
function createTransport() {

    return new Transport();
}


/**
 * @param {Transport} transport
 * @param {Message=} msg
 */
function Transaction(transport, msg) {

    EventEmitter.call(this);

    this._transport = transport;
    this._initMsg = msg;
    this._type = msg ? 0 : 1;
    this._isInvite = (msg && msg.method === SIP_INVITE);
    this._isReliable = true;
    this.state = 0;
    this.error = false;
    this.timeout = false;

    if (!this._type) {
        this._listen();
    }
}


inherits(Transaction, EventEmitter);


Transaction.prototype._listener = function (msg) {

    var stateCb;


    if (this._type) {
        stateCb = this._isInvite ?
                this.__clientInvite : this.__clientNonInvite;

    } else {

        stateCb = this._isInvite ?
                this.__serverInvite : this.__serverNonInvite;
    }

    var state;

    if (stateCb === this.__clientInvite) {
        state = stateCb.call(this, msg.status, msg);

    } else {
        state = stateCb.call(this, msg.status, msg.method, msg);
    }

    if (state) {

        this._setState(state);
        this.emit('message', msg, state);
    }
};


Transaction.prototype._listen = function () {

    var that = this;
    var mInit = this._initMsg;
    var hVia = mInit.getHeader('via', true, 0);
    var match = hVia['params']['branch'];

    // check if transport is reliable
    var name = hVia.protocol.toLowerCase();
    var protocol = this._transport._protocols[name][0];

    this._isReliable = protocol.reliable;

    // server transaction
    if (!this._type) {
        match += '-' + hVia.host + ':' + hVia.port;
    }

    match += '-' + mInit.method;

    this.listener = function (msg) {
        that._listener(msg);
    };

    this._transport.on(match, this.listener);
    this._match = match;

    // Send 100 Trying after 200ms if TU won't
    if (!this._type) {

        this._timerTry = setTimeout(function () {
            that._send(mInit.toResponse(100));

        }, 200);
    }


    if (this._isInvite) {
        this._setState(this._type ? SIP_STATE_CALLING : SIP_STATE_PROCEEDING);

    } else {
        this._setState(SIP_STATE_TRYING);
    }
};


/**
 * @param {number} status Response status code.
 * @param {string} method Request method name.
 * @param {Message} msgR Response message.
 * @return {number} New state of transaction.
 */
Transaction.prototype.__clientInvite = function (status, msgR) {

    var state = this.state;

    if (state === SIP_STATE_CALLING) {

        if (status >= 300) {
            state = SIP_STATE_COMPLETED;

        } else if (status >= 200) {
            state = SIP_STATE_TERMINATED;

        } else if (status >= 100) {
            state = SIP_STATE_PROCEEDING;
        }

    } else if (state === SIP_STATE_PROCEEDING) {

        if (status >= 300) {
            state = SIP_STATE_COMPLETED;

        } else if (status >= 200) {
            state = SIP_STATE_TERMINATED;
        }
    }


// ACK for non-200 final responses must be not be send within
// transaction but sent directly to transport layer.

    if (state === SIP_STATE_COMPLETED) {

        var msgACK = msgR.toRequest('ACK', this._initMsg.uri);
        var hCseq = msgACK.getHeader('cseq', true);

        // Add top Via header to ACK
        msgACK.setHeader('via', msgACK.getHeader('via', false, 0));
        msgACK.setHeader('cseq', hCseq['seq'] + ' ' + SIP_ACK);

        msgACK.body = '';

        this._sendACK(msgACK);
    }

    return state;
};


/**
 * @param {number} status Response status code.
 * @return {number} New state of transaction.
 */
Transaction.prototype.__clientNonInvite = function (status) {

    var state = this.state;

    if (state === SIP_STATE_TRYING) {

        if (status >= 200) {
            state = SIP_STATE_COMPLETED;

        } else if (status >= 100) {
            state = SIP_STATE_PROCEEDING;
        }

    } else if (state === SIP_STATE_PROCEEDING) {

        if (status >= 200) {
            state = SIP_STATE_COMPLETED;
        }
    }

    return state;
};


/**
 * @param {number} status Response status code.
 * @param {string} method Request method name.
 * @return {number} New state of transaction.
 */
Transaction.prototype.__serverInvite = function (status, method) {

    var state = this.state;

    // retransmit last response
    if (state < SIP_STATE_CONFIRMED && method === SIP_INVITE) {

        this._resend();
        return;
    }

    if (state === SIP_STATE_PROCEEDING) {

        if (status >= 300) {
            state = SIP_STATE_COMPLETED;

        } else if (status >= 200) {
            state = SIP_STATE_TERMINATED;
        }

    } else if (state === SIP_STATE_COMPLETED) {

        if (method === SIP_ACK) {
            state = SIP_STATE_CONFIRMED;
        }
    }

    return state;
};


/**
 * @param {number} status Response status code.
 * @param {string} method Request method name.
 * @return {number} New state of transaction.
 */
Transaction.prototype.__serverNonInvite = function (status, method) {

    var state = this.state;

    // retransmit last response
    if (method && method !== SIP_INVITE &&
            (state === SIP_STATE_COMPLETED || state === SIP_STATE_PROCEEDING)) {

        this._resend();
        return;
    }

    if (state === SIP_STATE_TRYING) {

        if (status >= 200) {
            state = SIP_STATE_COMPLETED;

        } else if (status >= 100) {
            state = SIP_STATE_PROCEEDING;
        }

    } else if (state === SIP_STATE_PROCEEDING) {

        if (status >= 200) {
            state = SIP_STATE_COMPLETED;
        }
    }

    return state;
};


Transaction.prototype._setState = function (state, isError, isTimeout) {

    // Emit new state value only if it has changed.
    if (state <= this.state) {
        return;
    }

    var that = this;
    this.state = state;
    this.error = isError ? true : false;
    this.timeout = isTimeout ? true : false;

    // remove transport listener
    if (state === SIP_STATE_TERMINATED) {
        this._transport.removeListener(this._match, this.listener);
    }

    this.emit('state', state);


    // Timer D
    if (this._isInvite && this._type && this.state === SIP_STATE_COMPLETED) {

        this._timerD = setTimeout(function () {

            if (that.state === SIP_STATE_COMPLETED) {
                that._setState(SIP_STATE_TERMINATED);
            }

        }, this._isReliable ? 0 : SIP_TIMER_D);

    // Timer K
    } else if (!this._isInvite && this._type && this.state === SIP_STATE_COMPLETED) {

        this._timerK = setTimeout(function () {

            if (that.state === SIP_STATE_COMPLETED) {
                that._setState(SIP_STATE_TERMINATED);
            }

        }, this._isReliable ? 0 : SIP_TIMER_K);

    // Timer G
    } else if (this._isInvite && this._type === 0 && !this._isReliable && this.state === SIP_STATE_COMPLETED) {

        var startTimerG = function (timeout) {

            that._timerE = setTimeout(function () {

                if (that.state === SIP_STATE_COMPLETED) {

                    timeout = (timeout >= SIP_T2) ? SIP_T2 : timeout * 2;

                    that._resend();
                    startTimerG(timeout);
                }

            }, timeout);
        };

        startTimerG(SIP_TIMER_G);

    // Timer I
    } else if (this._isInvite && this._type === 0 && this.state === SIP_STATE_CONFIRMED) {

        this._timerI = setTimeout(function () {

            if (that.state === SIP_STATE_CONFIRMED) {
                that._setState(SIP_STATE_TERMINATED);
            }

        }, this._isReliable ? 0 : SIP_TIMER_I);

    // Timer J
    } else if (!this._isInvite && this._type === 0 && this.state === SIP_STATE_COMPLETED) {

        this._timerJ = setTimeout(function () {

            if (that.state === SIP_STATE_COMPLETED) {
                that._setState(SIP_STATE_TERMINATED);
            }

        }, this._isReliable ? 0 : SIP_TIMER_J);
    }

    // Timer H
    if (this._isInvite && this._type === 0 && this.state === SIP_STATE_COMPLETED) {

        this._timerH = setTimeout(function () {

            if (that.state === SIP_STATE_COMPLETED) {

                that._setState(SIP_STATE_TERMINATED, true, true);
                that.emit('timeout');
            }

        }, SIP_TIMER_H);
    }
};


/**
 * @param {(Object|Message)} msg
 * @param {string=} addr
 * @param {(number|string)=} port
 * @param {string=} name
 * @param {function()} cb
 */
Transaction.prototype._send = function (msg, addr, port, name, cb) {

    var that = this;

    if (!this._type) {

        this._resend = function () {
            that._send(msg);
        };
    }

    if (this._timerTry) {

        clearTimeout(this._timerTry);

        this._timerTry = null;
    }

    this._transport.send(msg, addr, port, name, function (err) {

        if (err) {
            that._setState(SIP_STATE_TERMINATED, true, false);
        }

        if (cb) {
            cb(err);
        }

        if (err) {
            that.emit('error', err);
        }
    });
};


/**
 * @param {(Object|Message)} msg
 * @param {string=} addr
 * @param {(number|string)=} port
 * @param {string=} name
 * @param {function()} cb
 */
Transaction.prototype.send = function (msg, addr, port, name, cb) {

    var that = this;

    if (isObject(addr)) {
        cb = addr;
    }

    // client transaction
    if (this._type) {
        this._isInvite = (msg.method === SIP_INVITE);
    }

    // check transaction state before sending
    if ((this._type && this.state > 0) ||
            (!this._type && this.state) > SIP_STATE_PROCEEDING) {

        if (cb) {
            cb('Invalid state for sending');
        }

        return;
    }

    this._send(msg, addr, port, name, cb);

    if (!this.state) {

        this._initMsg = msg;
        this._listen();

        if (msg.method === SIP_INVITE) {

            this._sendACK = function (msg) {
                this._transport.send(msg, addr, port, name);
            };
        }
    }

    // Client transaction timers
    if (this._type) {

        if (this._isInvite) {

            // Timer A
            if (!this._isReliable) {

                var startTimerA = function (timeout) {

                    that._timerA = setTimeout(function () {

                        if (that.state === SIP_STATE_CALLING) {

                            that._send(msg, addr, port, name);
                            startTimerA(timeout * 2);
                        }

                    }, timeout);
                };

                startTimerA(SIP_TIMER_A);
            }

            // Timer B
            this._timerB = setTimeout(function () {

                if (that.state === SIP_STATE_CALLING) {
                    that._setState(SIP_STATE_TERMINATED, true, true);
                    that.emit('timeout');
                }

            }, SIP_TIMER_B);

        } else {

            // Timer A
            if (!this._isReliable) {

                var startTimerE = function (timeout) {

                    that._timerE = setTimeout(function () {

                        var state = that.state;

                        if (state === SIP_STATE_TRYING ||
                                state === SIP_STATE_PROCEEDING) {

                            timeout = (timeout >= SIP_T2 || state === SIP_STATE_PROCEEDING) ?
                                    SIP_T2 : timeout * 2;

                            that._send(msg, addr, port, name);
                            startTimerE(timeout);
                        }

                    }, timeout);
                };

                startTimerE(SIP_TIMER_E);
            }

            // Timer F
            this._timerF = setTimeout(function () {

                if (that.state <= SIP_STATE_PROCEEDING) {
                    that._setState(SIP_STATE_TERMINATED, true, true);
                    that.emit('timeout');
                }

            }, SIP_TIMER_F);
        }
    }

    // server transaction
    if (!this._type) {

        var stateCb = this._isInvite ? this.__serverInvite : this.__serverNonInvite;
        var state = stateCb.call(this, msg.status);

        this._setState(state);
    }
};


/**
 * @param {Transport} transport
 * @param {Message=} msg
 * @return {Transaction}
 */
function createTransaction(transport, msg) {

    return new Transaction(transport, msg);
}


// ## Exports
//
// Exported functions - *parse*, *format*, *isMessage*,
// *createMessage*, *parseUri* and *formatUri*.
exports.parse = parseMessage;
exports.isMessage = isMessage;
exports.createMessage = createMessage;
exports.format = formatMessage;
exports.parseUri = parseUri;
exports.formatUri = formatUri;

// Transport layer exports - *createProtocol*, *createTransport*, *createTransaction*, *Socket* and *Protocol* class.
exports.Socket = Socket;
exports.Protocol = Protocol;
exports.createProtocol = createProtocol;
exports.createTransport = createTransport;
exports.createTransaction = createTransaction;


},{"assert":1,"events":8,"util":14}],21:[function(require,module,exports){
(function (Buffer){
/*********************************************************************
  Purpose: Parse PCAP-SIP and convert to HEP binary format
  Author: Lorenzo Mangani
  Date: 30.03.2020
*********************************************************************/
/*********************************************************************
  Purpose: File containing all of the code to parse a PCAP file
  and display it using D3 to create a ladder diagram.
  Author: Nick Knight
  Date: 23.05.2017
*********************************************************************/
var connection = new WebSocket('ws://' + window.location.hostname + ':8060');

var HEP = require('hep-js');
var SIP = require('sipcore');

connection.onopen = function () {
  connection.binaryType = 'Buffer';
};

/* HEP3 Socket OUT */
var sendHEP3 = function(msg, rcinfo){
	var sipmsg = SIP.parse(msg);
	if (rcinfo && sipmsg) {
		try {
			var hep_message = HEP.encapsulate(msg,rcinfo);
			if (hep_message) {
				var packet = Buffer.from(hep_message)
				connection.send(packet);
			}
		}
		catch (e) {
			console.log('HEP3 Error sending to WS!',e);
		}
	}
}

var processPacket = function(message){
	try { var decoded = JSON.parse(message) } catch { var decoded = false; };
        var hep_proto = { "type": "HEP", "version": 3, "payload_type": "SIP", "captureId": 9999, "ip_family": 2, "capturePass": "wss" };
	/* TCP DECODE */
	if (decoded && decoded.ipv4 && decoded.ipv4.tcp){
		var payload = String.fromCharCode(...Object.values(decoded.ipv4.udp.data));
        	// Build HEP3
		hep_proto.ip_family = 2;
        	hep_proto.protocol = 6;
		hep_proto.proto_type = 1;
	        hep_proto.srcIp = decoded.ipv4.src;
	        hep_proto.dstIp = decoded.ipv4.dst;
        	hep_proto.srcPort = decoded.ipv4.tcp.srcport;
        	hep_proto.dstPort = decoded.ipv4.tcp.dstport;
		hep_proto.time_sec = parseInt(decoded.ts_sec),
		hep_proto.time_usec = parseInt(decoded.ts_sec.toString().split('.')[1]) | 000 ;
		sendHEP3(payload,hep_proto);

	}
	/* UDP DECODE */
	if (decoded && decoded.ipv4 && decoded.ipv4.udp){
		var payload = String.fromCharCode(...Object.values(decoded.ipv4.udp.data));
	        // Build HEP3
		hep_proto.ip_family = 2;
	        hep_proto.protocol = 17;
		hep_proto.proto_type = 1;
	        hep_proto.srcIp = decoded.ipv4.src;
	        hep_proto.dstIp = decoded.ipv4.dst;
	        hep_proto.srcPort = decoded.ipv4.udp.srcport;
	        hep_proto.dstPort = decoded.ipv4.udp.dstport;
		hep_proto.time_sec = parseInt(decoded.ts_sec),
		hep_proto.time_usec = parseInt(decoded.ts_sec.toString().split('.')[1]) | 000 ;
		sendHEP3(payload,hep_proto);
	}
}

// $( document ).ready( function ()
document.addEventListener("DOMContentLoaded", function(event)
{
  /*********************************************************************
    Function: drawGraph
    Purpose: Render the graph
    Author: Nick Knight
    Date: 23.05.2017
  *********************************************************************/
  function drawGraph( etherframes, ipv4hosts )
  {
    document.getElementById('viz-frames').innerHTML = '<p>Parsed '+etherframes.length+' IP frames</p>';
    document.getElementById('viz-hosts').innerHTML = '<p>Parsed '+ipv4hosts.length+' hosts ('+ipv4hosts.join(",")+')</p>';
    console.log('parsed '+etherframes.length + 'frames');

    // console.log(etherframes, ipv4hosts)
    document.getElementById("upload").onclick = function(){
	    etherframes.forEach(function(frame){
		  processPacket(frame)
	    });
    }
    document.getElementById("upload").disabled = false;
    document.getElementById("files").style.visibility = 'hidden';
    return;
  }

  /*********************************************************************
    Purpose: The next section is here to parse the contents of a PCAP
    file. This first method needs improving. As when reading a large file
    , for the purpose of a ladder diagram, we don't need to look at all
    the parts of each packet. The format of PCAP can be Found
    https://wiki.wireshark.org/Development/LibpcapFileFormat
    Author: Nick Knight
    Date: 23.05.2017
  *********************************************************************/
  function abortRead()
  {
    reader.abort();
  }

  function errorHandler( evt )
  {
    switch ( evt.target.error.code )
    {
    case evt.target.error.NOT_FOUND_ERR:
      alert( 'File Not Found!' );
      break;
    case evt.target.error.NOT_READABLE_ERR:
      alert( 'File is not readable' );
      break;
    case evt.target.error.ABORT_ERR:
      break; // noop
    default:
      alert( 'An error occurred reading this file.' );
    };
  }

  /*********************************************************************
    Function: updateProgress
    Purpose: TODO: tie this function to something actually on the page
    to indicate we are loading the PCAP file.
    Author: Nick Knight
    Date: 23.05.2017
  *********************************************************************/
  function updateProgress( evt )
  {
    // evt is an ProgressEvent.
    if ( evt.lengthComputable )
    {
      var percentLoaded = Math.round( ( evt.loaded / evt.total ) * 100 );
      // Increase the progress bar length.
      if ( percentLoaded < 100 )
      {
        progress.style.width = percentLoaded + '%';
        progress.textContent = percentLoaded + '%';
      }
    }
  }

  /*********************************************************************
    Function: toHex
    Purpose: Little helper function to convert value into a hex value.
    Author: Nick Knight
    Date: 23.05.2017
  *********************************************************************/
  function toHex( d )
  {
    return ( "0" + ( Number( d ).toString( 16 ) ) ).slice( -2 ).toUpperCase()
  }

  if ( window.File && window.FileReader && window.FileList && window.Blob )
  {
    // Great success! All the File APIs are supported.

    /*********************************************************************
      Function: handleFileSelect
      Purpose: This is the workhorse. User has selected a file and we can
      now parse it.
      Author: Nick Knight
      Date: 23.05.2017
    *********************************************************************/
    function handleFileSelect( evt )
    {
      var files = evt.target.files; // FileList object
      var file;
      var state = 0;
      var fileposition = 0;
      var reader = new FileReader();
      reader.onerror = errorHandler;
      reader.onprogress = updateProgress;
      reader.onabort = function ( e )
      {
        alert( 'File read cancelled' );
      };
      reader.onloadstart = function ( e )
      {
        //document.getElementById('progress_bar').className = 'loading';
      };
      var ts_sec = 0;
      var ts_usec = 0;
      var ts_firstether = -1;
      var frame = 0;
      var ipv4hosts = [];
      var etherframes = [];
      reader.onload = function ( e )
      {
        var data = e.currentTarget.result;
        switch ( state )
        {
        case 0:
          var uint32array = new Uint32Array( data );
          var int32array = new Int32Array( data );
          // Do we need version info for now?
          //var uint16array = new Uint16Array(data);
          /* Magic number */
          if ( 2712847316 == uint32array[ 0 ] )
          {
            /* Native byte order */
            console.log( "Native byte order" );
          }
          else if ( 3569595041 == uint32array[ 0 ] )
          {
            /* Swapped byte order */
            console.log( "Swapped byte order" );
          }
          else if ( 2712812621 == uint32array[ 0 ] )
          {
            /* Native byte order nano second timing */
            console.log( "Native byte order nano second timing" );
          }
          else if ( 1295823521 == uint32array[ 0 ] )
          {
            /* Swapped byte order nano second timing */
            console.log( "Swapped byte order nano second timing" );
          }
          /* http://www.tcpdump.org/linktypes.html */
          if ( 1 != uint32array[ 5 ] )
          {
            console.log( "Link layer type not supported" );
            return;
          }
          console.log( "LINKTYPE_ETHERNET" );
          /* Read our first packet header */
          var blob = file.slice( fileposition, fileposition + 16 );
          fileposition += 16;
          reader.readAsArrayBuffer( blob );
          state = 1;
          break;
        case 1:
          var uint32array = new Uint32Array( data );
          ts_sec = uint32array[ 0 ];
          ts_usec = uint32array[ 1 ];
          var incl_len = uint32array[ 2 ];
          var orig_len = uint32array[ 3 ];
          if ( 0 == incl_len )
          {
            var blob = file.slice( fileposition, fileposition + 16 );
            fileposition += 16;
            reader.readAsArrayBuffer( blob );
            break;
          }
          var blob = file.slice( fileposition, fileposition + incl_len );
          fileposition += incl_len;
          reader.readAsArrayBuffer( blob );
          state = 2;
          break;
        case 2:
          var uint8array = new Uint8Array( data );
          var etherpacket = {};
          etherpacket.frame = frame;
          frame++;
          etherpacket.ts_sec = ts_sec + ( ts_usec / 1000000 );
          if ( -1 == ts_firstether )
          {
            ts_firstether = etherpacket.ts_sec;
          }
          etherpacket.ts_sec_offset = ( ts_sec + ( ts_usec / 1000000 ) ) - ts_firstether;
          //etherpacket.ts_usec = ts_usec;
          etherpacket.src = "" + toHex( uint8array[ 0 ] ) + ":" + toHex( uint8array[ 1 ] ) + ":" + toHex( uint8array[ 2 ] ) + ":" + toHex( uint8array[ 3 ] ) + ":" + toHex( uint8array[ 4 ] ) + ":" + toHex( uint8array[ 5 ] );
          etherpacket.dst = "" + toHex( uint8array[ 6 ] ) + ":" + toHex( uint8array[ 7 ] ) + ":" + toHex( uint8array[ 8 ] ) + ":" + toHex( uint8array[ 9 ] ) + ":" + toHex( uint8array[ 10 ] ) + ":" + toHex( uint8array[ 11 ] );
          etherpacket.ethertype = "" + toHex( uint8array[ 12 ] ) + toHex( uint8array[ 13 ] );
          if ( parseInt( etherpacket.ethertype, 16 ) > 1536 )
          {
            // Ref: https://en.wikipedia.org/wiki/EtherType
            switch ( etherpacket.ethertype )
            {
            case "0800":
              /* IPV4 */
              etherpacket.ipv4 = {};
              etherpacket.ipv4.data = uint8array.slice( 14, uint8array.length );
              etherpacket.ipv4.version = parseInt( toHex( ( etherpacket.ipv4.data[ 0 ] >> 4 ) & 0xf ), 16 );
              etherpacket.ipv4.ihl = parseInt( toHex( etherpacket.ipv4.data[ 0 ] & 0xf ), 16 );
              etherpacket.ipv4.dscp = toHex( ( etherpacket.ipv4.data[ 1 ] >> 2 ) & 0x3f );
              etherpacket.ipv4.ecn = toHex( etherpacket.ipv4.data[ 1 ] & 0x3 );
              etherpacket.ipv4.totallength = parseInt( toHex( etherpacket.ipv4.data[ 2 ] ) + toHex( etherpacket.ipv4.data[ 3 ] ), 16 );
              etherpacket.ipv4.identification = parseInt( toHex( etherpacket.ipv4.data[ 4 ] ) + toHex( etherpacket.ipv4.data[ 5 ] ), 16 );
              etherpacket.ipv4.flags = toHex( ( etherpacket.ipv4.data[ 6 ] >> 5 ) & 7 );
              etherpacket.ipv4.fragmentoffset = "" + toHex( etherpacket.ipv4.data[ 6 ] & 0x1f ) + toHex( etherpacket.ipv4.data[ 7 ] );
              etherpacket.ipv4.ttl = etherpacket.ipv4.data[ 8 ];
              etherpacket.ipv4.protocol = etherpacket.ipv4.data[ 9 ];
              etherpacket.ipv4.checksum = "" + toHex( etherpacket.ipv4.data[ 10 ] ) + toHex( etherpacket.ipv4.data[ 11 ] );
              etherpacket.ipv4.src = "" + etherpacket.ipv4.data[ 12 ] + "." + etherpacket.ipv4.data[ 13 ] + "." + etherpacket.ipv4.data[ 14 ] + "." + etherpacket.ipv4.data[ 15 ];
              etherpacket.ipv4.dst = "" + etherpacket.ipv4.data[ 16 ] + "." + etherpacket.ipv4.data[ 17 ] + "." + etherpacket.ipv4.data[ 18 ] + "." + etherpacket.ipv4.data[ 19 ];
              var hostid = -1;
              if ( -1 == ( hostid = ipv4hosts.indexOf( etherpacket.ipv4.src ) ) )
              {
                etherpacket.ipv4.srchostid = ipv4hosts.length;
                ipv4hosts.push( etherpacket.ipv4.src );
              }
              else
              {
                etherpacket.ipv4.srchostid = hostid;
              }
              if ( -1 == ( hostid = ipv4hosts.indexOf( etherpacket.ipv4.dst ) ) )
              {
                etherpacket.ipv4.dsthostid = ipv4hosts.length;
                ipv4hosts.push( etherpacket.ipv4.dst );
              }
              else
              {
                etherpacket.ipv4.dsthostid = hostid;
              }
              switch ( etherpacket.ipv4.protocol )
              {
              case 17:
                /* UDP */
                etherpacket.ipv4.udp = {};
                etherpacket.ipv4.udp.srcport = parseInt( toHex( etherpacket.ipv4.data[ 20 ] ) + toHex( etherpacket.ipv4.data[ 21 ] ), 16 );
                etherpacket.ipv4.udp.dstport = parseInt( toHex( etherpacket.ipv4.data[ 22 ] ) + toHex( etherpacket.ipv4.data[ 23 ] ), 16 );
                etherpacket.ipv4.udp.length = parseInt( toHex( etherpacket.ipv4.data[ 24 ] ) + toHex( etherpacket.ipv4.data[ 25 ] ), 16 );
                etherpacket.ipv4.udp.checksum = parseInt( toHex( etherpacket.ipv4.data[ 26 ] ) + toHex( etherpacket.ipv4.data[ 27 ] ), 16 );
                etherpacket.ipv4.udp.data = etherpacket.ipv4.data.slice( 28, etherpacket.ipv4.data.length );
                break;
              case 6:
                /* TCP */
                etherpacket.ipv4.tcp = {};
                etherpacket.ipv4.tcp.srcport = parseInt( toHex( etherpacket.ipv4.data[ 20 ] ) + toHex( etherpacket.ipv4.data[ 21 ] ), 16 );
                etherpacket.ipv4.tcp.dstport = parseInt( toHex( etherpacket.ipv4.data[ 22 ] ) + toHex( etherpacket.ipv4.data[ 23 ] ), 16 );
                etherpacket.ipv4.tcp.sequencenumber = parseInt( toHex( etherpacket.ipv4.data[ 24 ] ) + toHex( etherpacket.ipv4.data[ 25 ] ) + toHex( etherpacket.ipv4.data[ 26 ] ) + toHex( etherpacket.ipv4.data[ 27 ] ), 16 );
                etherpacket.ipv4.tcp.acknowledgmentnumber = parseInt( toHex( etherpacket.ipv4.data[ 28 ] ) + toHex( etherpacket.ipv4.data[ 29 ] ) + toHex( etherpacket.ipv4.data[ 30 ] ) + toHex( etherpacket.ipv4.data[ 31 ] ), 16 );
                etherpacket.ipv4.tcp.dataoffset = ( etherpacket.ipv4.data[ 32 ] >> 4 ) & 0xf;
                etherpacket.ipv4.tcp.flags = {};
                etherpacket.ipv4.tcp.flags.ns = etherpacket.ipv4.data[ 32 ] & 1;
                etherpacket.ipv4.tcp.flags.cwr = ( etherpacket.ipv4.data[ 33 ] >> 7 ) & 1;
                etherpacket.ipv4.tcp.flags.ece = ( etherpacket.ipv4.data[ 33 ] >> 6 ) & 1;
                etherpacket.ipv4.tcp.flags.urg = ( etherpacket.ipv4.data[ 33 ] >> 5 ) & 1;
                etherpacket.ipv4.tcp.flags.ack = ( etherpacket.ipv4.data[ 33 ] >> 4 ) & 1;
                etherpacket.ipv4.tcp.flags.psh = ( etherpacket.ipv4.data[ 33 ] >> 3 ) & 1;
                etherpacket.ipv4.tcp.flags.rst = ( etherpacket.ipv4.data[ 33 ] >> 2 ) & 1;
                etherpacket.ipv4.tcp.flags.syn = ( etherpacket.ipv4.data[ 33 ] >> 1 ) & 1;
                etherpacket.ipv4.tcp.flags.fin = etherpacket.ipv4.data[ 33 ] & 1;
                etherpacket.ipv4.tcp.windowsize = parseInt( toHex( etherpacket.ipv4.data[ 34 ] ) + toHex( etherpacket.ipv4.data[ 35 ] ), 16 );
                etherpacket.ipv4.tcp.checksum = parseInt( toHex( etherpacket.ipv4.data[ 36 ] ) + toHex( etherpacket.ipv4.data[ 37 ] ), 16 );
                etherpacket.ipv4.tcp.urgentpointer = parseInt( toHex( etherpacket.ipv4.data[ 38 ] ) + toHex( etherpacket.ipv4.data[ 39 ] ), 16 );
                etherpacket.ipv4.tcp.data = etherpacket.ipv4.data.slice( 20 + ( etherpacket.ipv4.tcp.dataoffset * 4 ), etherpacket.ipv4.data.length );
                break;
              }
              break;
            case "86DD":
              /* IPV6 */
              break;
            case "0806":
              /* ARP */
              break;
            case "9100":
              /* VLAN tagged */
              break;
            }
          }
          else
          {
            // We probbaly won't need this as is raw length.
          }
          etherframes.push( etherpacket );
          if ( etherframes.length > 100 )
          {
            drawGraph( etherframes, ipv4hosts );
            return;
          }
          var blob = file.slice( fileposition, fileposition + 16 );
          fileposition += 16;
          if ( fileposition > file.size )
          {
            drawGraph( etherframes, ipv4hosts );
            return;
          }
          reader.readAsArrayBuffer( blob );
          state = 1;
          break;
        }
      }
      file = files[ 0 ];
      var blob = file.slice( fileposition, fileposition + 24 );
      fileposition += 24;
      reader.readAsArrayBuffer( blob );
    }
    document.getElementById( 'files' ).addEventListener( 'change', handleFileSelect, false );
  }
  else
  {
    alert( 'The File APIs are not fully supported in this browser.' );
  }
} );

}).call(this,require("buffer").Buffer)
},{"buffer":6,"hep-js":18,"sipcore":20}]},{},[21]);
