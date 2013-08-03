
/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module.exports) {
    module.exports = {};
    module.client = module.component = true;
    module.call(this, module.exports, require.relative(resolved), module);
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("component-indexof/index.js", Function("exports, require, module",
"module.exports = function(arr, obj){\n\
  if (arr.indexOf) return arr.indexOf(obj);\n\
  for (var i = 0; i < arr.length; ++i) {\n\
    if (arr[i] === obj) return i;\n\
  }\n\
  return -1;\n\
};//@ sourceURL=component-indexof/index.js"
));
require.register("component-emitter/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var index = require('indexof');\n\
\n\
/**\n\
 * Expose `Emitter`.\n\
 */\n\
\n\
module.exports = Emitter;\n\
\n\
/**\n\
 * Initialize a new `Emitter`.\n\
 *\n\
 * @api public\n\
 */\n\
\n\
function Emitter(obj) {\n\
  if (obj) return mixin(obj);\n\
};\n\
\n\
/**\n\
 * Mixin the emitter properties.\n\
 *\n\
 * @param {Object} obj\n\
 * @return {Object}\n\
 * @api private\n\
 */\n\
\n\
function mixin(obj) {\n\
  for (var key in Emitter.prototype) {\n\
    obj[key] = Emitter.prototype[key];\n\
  }\n\
  return obj;\n\
}\n\
\n\
/**\n\
 * Listen on the given `event` with `fn`.\n\
 *\n\
 * @param {String} event\n\
 * @param {Function} fn\n\
 * @return {Emitter}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.on = function(event, fn){\n\
  this._callbacks = this._callbacks || {};\n\
  (this._callbacks[event] = this._callbacks[event] || [])\n\
    .push(fn);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Adds an `event` listener that will be invoked a single\n\
 * time then automatically removed.\n\
 *\n\
 * @param {String} event\n\
 * @param {Function} fn\n\
 * @return {Emitter}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.once = function(event, fn){\n\
  var self = this;\n\
  this._callbacks = this._callbacks || {};\n\
\n\
  function on() {\n\
    self.off(event, on);\n\
    fn.apply(this, arguments);\n\
  }\n\
\n\
  fn._off = on;\n\
  this.on(event, on);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Remove the given callback for `event` or all\n\
 * registered callbacks.\n\
 *\n\
 * @param {String} event\n\
 * @param {Function} fn\n\
 * @return {Emitter}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.off =\n\
Emitter.prototype.removeListener =\n\
Emitter.prototype.removeAllListeners = function(event, fn){\n\
  this._callbacks = this._callbacks || {};\n\
\n\
  // all\n\
  if (0 == arguments.length) {\n\
    this._callbacks = {};\n\
    return this;\n\
  }\n\
\n\
  // specific event\n\
  var callbacks = this._callbacks[event];\n\
  if (!callbacks) return this;\n\
\n\
  // remove all handlers\n\
  if (1 == arguments.length) {\n\
    delete this._callbacks[event];\n\
    return this;\n\
  }\n\
\n\
  // remove specific handler\n\
  var i = index(callbacks, fn._off || fn);\n\
  if (~i) callbacks.splice(i, 1);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Emit `event` with the given args.\n\
 *\n\
 * @param {String} event\n\
 * @param {Mixed} ...\n\
 * @return {Emitter}\n\
 */\n\
\n\
Emitter.prototype.emit = function(event){\n\
  this._callbacks = this._callbacks || {};\n\
  var args = [].slice.call(arguments, 1)\n\
    , callbacks = this._callbacks[event];\n\
\n\
  if (callbacks) {\n\
    callbacks = callbacks.slice(0);\n\
    for (var i = 0, len = callbacks.length; i < len; ++i) {\n\
      callbacks[i].apply(this, args);\n\
    }\n\
  }\n\
\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Return array of callbacks for `event`.\n\
 *\n\
 * @param {String} event\n\
 * @return {Array}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.listeners = function(event){\n\
  this._callbacks = this._callbacks || {};\n\
  return this._callbacks[event] || [];\n\
};\n\
\n\
/**\n\
 * Check if this emitter has `event` handlers.\n\
 *\n\
 * @param {String} event\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.hasListeners = function(event){\n\
  return !! this.listeners(event).length;\n\
};\n\
//@ sourceURL=component-emitter/index.js"
));
require.register("component-to-function/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Expose `toFunction()`.\n\
 */\n\
\n\
module.exports = toFunction;\n\
\n\
/**\n\
 * Convert `obj` to a `Function`.\n\
 *\n\
 * @param {Mixed} obj\n\
 * @return {Function}\n\
 * @api private\n\
 */\n\
\n\
function toFunction(obj) {\n\
  switch ({}.toString.call(obj)) {\n\
    case '[object Object]':\n\
      return objectToFunction(obj);\n\
    case '[object Function]':\n\
      return obj;\n\
    case '[object String]':\n\
      return stringToFunction(obj);\n\
    case '[object RegExp]':\n\
      return regexpToFunction(obj);\n\
    default:\n\
      return defaultToFunction(obj);\n\
  }\n\
}\n\
\n\
/**\n\
 * Default to strict equality.\n\
 *\n\
 * @param {Mixed} val\n\
 * @return {Function}\n\
 * @api private\n\
 */\n\
\n\
function defaultToFunction(val) {\n\
  return function(obj){\n\
    return val === obj;\n\
  }\n\
}\n\
\n\
/**\n\
 * Convert `re` to a function.\n\
 *\n\
 * @param {RegExp} re\n\
 * @return {Function}\n\
 * @api private\n\
 */\n\
\n\
function regexpToFunction(re) {\n\
  return function(obj){\n\
    return re.test(obj);\n\
  }\n\
}\n\
\n\
/**\n\
 * Convert property `str` to a function.\n\
 *\n\
 * @param {String} str\n\
 * @return {Function}\n\
 * @api private\n\
 */\n\
\n\
function stringToFunction(str) {\n\
  // immediate such as \"> 20\"\n\
  if (/^ *\\W+/.test(str)) return new Function('_', 'return _ ' + str);\n\
\n\
  // properties such as \"name.first\" or \"age > 18\"\n\
  return new Function('_', 'return _.' + str);\n\
}\n\
\n\
/**\n\
 * Convert `object` to a function.\n\
 *\n\
 * @param {Object} object\n\
 * @return {Function}\n\
 * @api private\n\
 */\n\
\n\
function objectToFunction(obj) {\n\
  var match = {}\n\
  for (var key in obj) {\n\
    match[key] = typeof obj[key] === 'string'\n\
      ? defaultToFunction(obj[key])\n\
      : toFunction(obj[key])\n\
  }\n\
  return function(val){\n\
    if (typeof val !== 'object') return false;\n\
    for (var key in match) {\n\
      if (!(key in val)) return false;\n\
      if (!match[key](val[key])) return false;\n\
    }\n\
    return true;\n\
  }\n\
}\n\
//@ sourceURL=component-to-function/index.js"
));
require.register("component-enumerable/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var toFunction = require('to-function')\n\
  , proto = {};\n\
\n\
/**\n\
 * Expose `Enumerable`.\n\
 */\n\
\n\
module.exports = Enumerable;\n\
\n\
/**\n\
 * Mixin to `obj`.\n\
 *\n\
 *    var Enumerable = require('enumerable');\n\
 *    Enumerable(Something.prototype);\n\
 *\n\
 * @param {Object} obj\n\
 * @return {Object} obj\n\
 */\n\
\n\
function mixin(obj){\n\
  for (var key in proto) obj[key] = proto[key];\n\
  obj.__iterate__ = obj.__iterate__ || defaultIterator;\n\
  return obj;\n\
}\n\
\n\
/**\n\
 * Initialize a new `Enumerable` with the given `obj`.\n\
 *\n\
 * @param {Object} obj\n\
 * @api private\n\
 */\n\
\n\
function Enumerable(obj) {\n\
  if (!(this instanceof Enumerable)) {\n\
    if (Array.isArray(obj)) return new Enumerable(obj);\n\
    return mixin(obj);\n\
  }\n\
  this.obj = obj;\n\
}\n\
\n\
/*!\n\
 * Default iterator utilizing `.length` and subscripts.\n\
 */\n\
\n\
function defaultIterator() {\n\
  var self = this;\n\
  return {\n\
    length: function(){ return self.length },\n\
    get: function(i){ return self[i] }\n\
  }\n\
}\n\
\n\
/**\n\
 * Return a string representation of this enumerable.\n\
 *\n\
 *    [Enumerable [1,2,3]]\n\
 *\n\
 * @return {String}\n\
 * @api public\n\
 */\n\
\n\
Enumerable.prototype.inspect =\n\
Enumerable.prototype.toString = function(){\n\
  return '[Enumerable ' + JSON.stringify(this.obj) + ']';\n\
};\n\
\n\
/**\n\
 * Iterate enumerable.\n\
 *\n\
 * @return {Object}\n\
 * @api private\n\
 */\n\
\n\
Enumerable.prototype.__iterate__ = function(){\n\
  var obj = this.obj;\n\
  obj.__iterate__ = obj.__iterate__ || defaultIterator;\n\
  return obj.__iterate__();\n\
};\n\
\n\
/**\n\
 * Iterate each value and invoke `fn(val, i)`.\n\
 *\n\
 *    users.each(function(val, i){\n\
 *\n\
 *    })\n\
 *\n\
 * @param {Function} fn\n\
 * @return {Object} self\n\
 * @api public\n\
 */\n\
\n\
proto.forEach =\n\
proto.each = function(fn){\n\
  var vals = this.__iterate__();\n\
  var len = vals.length();\n\
  for (var i = 0; i < len; ++i) {\n\
    fn(vals.get(i), i);\n\
  }\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Map each return value from `fn(val, i)`.\n\
 *\n\
 * Passing a callback function:\n\
 *\n\
 *    users.map(function(user){\n\
 *      return user.name.first\n\
 *    })\n\
 *\n\
 * Passing a property string:\n\
 *\n\
 *    users.map('name.first')\n\
 *\n\
 * @param {Function} fn\n\
 * @return {Enumerable}\n\
 * @api public\n\
 */\n\
\n\
proto.map = function(fn){\n\
  fn = toFunction(fn);\n\
  var vals = this.__iterate__();\n\
  var len = vals.length();\n\
  var arr = [];\n\
  for (var i = 0; i < len; ++i) {\n\
    arr.push(fn(vals.get(i), i));\n\
  }\n\
  return new Enumerable(arr);\n\
};\n\
\n\
/**\n\
 * Select all values that return a truthy value of `fn(val, i)`.\n\
 *\n\
 *    users.select(function(user){\n\
 *      return user.age > 20\n\
 *    })\n\
 *\n\
 *  With a property:\n\
 *\n\
 *    items.select('complete')\n\
 *\n\
 * @param {Function|String} fn\n\
 * @return {Enumerable}\n\
 * @api public\n\
 */\n\
\n\
proto.filter =\n\
proto.select = function(fn){\n\
  fn = toFunction(fn);\n\
  var val;\n\
  var arr = [];\n\
  var vals = this.__iterate__();\n\
  var len = vals.length();\n\
  for (var i = 0; i < len; ++i) {\n\
    val = vals.get(i);\n\
    if (fn(val, i)) arr.push(val);\n\
  }\n\
  return new Enumerable(arr);\n\
};\n\
\n\
/**\n\
 * Select all unique values.\n\
 *\n\
 *    nums.unique()\n\
 *\n\
 * @return {Enumerable}\n\
 * @api public\n\
 */\n\
\n\
proto.unique = function(){\n\
  var val;\n\
  var arr = [];\n\
  var vals = this.__iterate__();\n\
  var len = vals.length();\n\
  for (var i = 0; i < len; ++i) {\n\
    val = vals.get(i);\n\
    if (~arr.indexOf(val)) continue;\n\
    arr.push(val);\n\
  }\n\
  return new Enumerable(arr);\n\
};\n\
\n\
/**\n\
 * Reject all values that return a truthy value of `fn(val, i)`.\n\
 *\n\
 * Rejecting using a callback:\n\
 *\n\
 *    users.reject(function(user){\n\
 *      return user.age < 20\n\
 *    })\n\
 *\n\
 * Rejecting with a property:\n\
 *\n\
 *    items.reject('complete')\n\
 *\n\
 * Rejecting values via `==`:\n\
 *\n\
 *    data.reject(null)\n\
 *    users.reject(tobi)\n\
 *\n\
 * @param {Function|String|Mixed} fn\n\
 * @return {Enumerable}\n\
 * @api public\n\
 */\n\
\n\
proto.reject = function(fn){\n\
  var val;\n\
  var arr = [];\n\
  var vals = this.__iterate__();\n\
  var len = vals.length();\n\
\n\
  if ('string' == typeof fn) fn = toFunction(fn);\n\
\n\
  if (fn) {\n\
    for (var i = 0; i < len; ++i) {\n\
      val = vals.get(i);\n\
      if (!fn(val, i)) arr.push(val);\n\
    }\n\
  } else {\n\
    for (var i = 0; i < len; ++i) {\n\
      val = vals.get(i);\n\
      if (val != fn) arr.push(val);\n\
    }\n\
  }\n\
\n\
  return new Enumerable(arr);\n\
};\n\
\n\
/**\n\
 * Reject `null` and `undefined`.\n\
 *\n\
 *    [1, null, 5, undefined].compact()\n\
 *    // => [1,5]\n\
 *\n\
 * @return {Enumerable}\n\
 * @api public\n\
 */\n\
\n\
\n\
proto.compact = function(){\n\
  return this.reject(null);\n\
};\n\
\n\
/**\n\
 * Return the first value when `fn(val, i)` is truthy,\n\
 * otherwise return `undefined`.\n\
 *\n\
 *    users.find(function(user){\n\
 *      return user.role == 'admin'\n\
 *    })\n\
 *\n\
 * With a property string:\n\
 *\n\
 *    users.find('age > 20')\n\
 *\n\
 * @param {Function|String} fn\n\
 * @return {Mixed}\n\
 * @api public\n\
 */\n\
\n\
proto.find = function(fn){\n\
  fn = toFunction(fn);\n\
  var val;\n\
  var vals = this.__iterate__();\n\
  var len = vals.length();\n\
  for (var i = 0; i < len; ++i) {\n\
    val = vals.get(i);\n\
    if (fn(val, i)) return val;\n\
  }\n\
};\n\
\n\
/**\n\
 * Return the last value when `fn(val, i)` is truthy,\n\
 * otherwise return `undefined`.\n\
 *\n\
 *    users.findLast(function(user){\n\
 *      return user.role == 'admin'\n\
 *    })\n\
 *\n\
 * @param {Function} fn\n\
 * @return {Mixed}\n\
 * @api public\n\
 */\n\
\n\
proto.findLast = function(fn){\n\
  fn = toFunction(fn);\n\
  var val;\n\
  var vals = this.__iterate__();\n\
  var len = vals.length();\n\
  for (var i = len - 1; i > -1; --i) {\n\
    val = vals.get(i);\n\
    if (fn(val, i)) return val;\n\
  }\n\
};\n\
\n\
/**\n\
 * Assert that all invocations of `fn(val, i)` are truthy.\n\
 *\n\
 * For example ensuring that all pets are ferrets:\n\
 *\n\
 *    pets.all(function(pet){\n\
 *      return pet.species == 'ferret'\n\
 *    })\n\
 *\n\
 *    users.all('admin')\n\
 *\n\
 * @param {Function|String} fn\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
proto.all =\n\
proto.every = function(fn){\n\
  fn = toFunction(fn);\n\
  var val;\n\
  var vals = this.__iterate__();\n\
  var len = vals.length();\n\
  for (var i = 0; i < len; ++i) {\n\
    val = vals.get(i);\n\
    if (!fn(val, i)) return false;\n\
  }\n\
  return true;\n\
};\n\
\n\
/**\n\
 * Assert that none of the invocations of `fn(val, i)` are truthy.\n\
 *\n\
 * For example ensuring that no pets are admins:\n\
 *\n\
 *    pets.none(function(p){ return p.admin })\n\
 *    pets.none('admin')\n\
 *\n\
 * @param {Function|String} fn\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
proto.none = function(fn){\n\
  fn = toFunction(fn);\n\
  var val;\n\
  var vals = this.__iterate__();\n\
  var len = vals.length();\n\
  for (var i = 0; i < len; ++i) {\n\
    val = vals.get(i);\n\
    if (fn(val, i)) return false;\n\
  }\n\
  return true;\n\
};\n\
\n\
/**\n\
 * Assert that at least one invocation of `fn(val, i)` is truthy.\n\
 *\n\
 * For example checking to see if any pets are ferrets:\n\
 *\n\
 *    pets.any(function(pet){\n\
 *      return pet.species == 'ferret'\n\
 *    })\n\
 *\n\
 * @param {Function} fn\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
proto.any = function(fn){\n\
  fn = toFunction(fn);\n\
  var val;\n\
  var vals = this.__iterate__();\n\
  var len = vals.length();\n\
  for (var i = 0; i < len; ++i) {\n\
    val = vals.get(i);\n\
    if (fn(val, i)) return true;\n\
  }\n\
  return false;\n\
};\n\
\n\
/**\n\
 * Count the number of times `fn(val, i)` returns true.\n\
 *\n\
 *    var n = pets.count(function(pet){\n\
 *      return pet.species == 'ferret'\n\
 *    })\n\
 *\n\
 * @param {Function} fn\n\
 * @return {Number}\n\
 * @api public\n\
 */\n\
\n\
proto.count = function(fn){\n\
  var val;\n\
  var vals = this.__iterate__();\n\
  var len = vals.length();\n\
  var n = 0;\n\
  for (var i = 0; i < len; ++i) {\n\
    val = vals.get(i);\n\
    if (fn(val, i)) ++n;\n\
  }\n\
  return n;\n\
};\n\
\n\
/**\n\
 * Determine the indexof `obj` or return `-1`.\n\
 *\n\
 * @param {Mixed} obj\n\
 * @return {Number}\n\
 * @api public\n\
 */\n\
\n\
proto.indexOf = function(obj){\n\
  var val;\n\
  var vals = this.__iterate__();\n\
  var len = vals.length();\n\
  for (var i = 0; i < len; ++i) {\n\
    val = vals.get(i);\n\
    if (val === obj) return i;\n\
  }\n\
  return -1;\n\
};\n\
\n\
/**\n\
 * Check if `obj` is present in this enumerable.\n\
 *\n\
 * @param {Mixed} obj\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
proto.has = function(obj){\n\
  return !! ~this.indexOf(obj);\n\
};\n\
\n\
/**\n\
 * Reduce with `fn(accumulator, val, i)` using\n\
 * optional `init` value defaulting to the first\n\
 * enumerable value.\n\
 *\n\
 * @param {Function} fn\n\
 * @param {Mixed} [val]\n\
 * @return {Mixed}\n\
 * @api public\n\
 */\n\
\n\
proto.reduce = function(fn, init){\n\
  var val;\n\
  var i = 0;\n\
  var vals = this.__iterate__();\n\
  var len = vals.length();\n\
\n\
  val = null == init\n\
    ? vals.get(i++)\n\
    : init;\n\
\n\
  for (; i < len; ++i) {\n\
    val = fn(val, vals.get(i), i);\n\
  }\n\
\n\
  return val;\n\
};\n\
\n\
/**\n\
 * Determine the max value.\n\
 *\n\
 * With a callback function:\n\
 *\n\
 *    pets.max(function(pet){\n\
 *      return pet.age\n\
 *    })\n\
 *\n\
 * With property strings:\n\
 *\n\
 *    pets.max('age')\n\
 *\n\
 * With immediate values:\n\
 *\n\
 *    nums.max()\n\
 *\n\
 * @param {Function|String} fn\n\
 * @return {Number}\n\
 * @api public\n\
 */\n\
\n\
proto.max = function(fn){\n\
  var val;\n\
  var n = 0;\n\
  var max = -Infinity;\n\
  var vals = this.__iterate__();\n\
  var len = vals.length();\n\
\n\
  if (fn) {\n\
    fn = toFunction(fn);\n\
    for (var i = 0; i < len; ++i) {\n\
      n = fn(vals.get(i), i);\n\
      max = n > max ? n : max;\n\
    }\n\
  } else {\n\
    for (var i = 0; i < len; ++i) {\n\
      n = vals.get(i);\n\
      max = n > max ? n : max;\n\
    }\n\
  }\n\
\n\
  return max;\n\
};\n\
\n\
/**\n\
 * Determine the min value.\n\
 *\n\
 * With a callback function:\n\
 *\n\
 *    pets.min(function(pet){\n\
 *      return pet.age\n\
 *    })\n\
 *\n\
 * With property strings:\n\
 *\n\
 *    pets.min('age')\n\
 *\n\
 * With immediate values:\n\
 *\n\
 *    nums.min()\n\
 *\n\
 * @param {Function|String} fn\n\
 * @return {Number}\n\
 * @api public\n\
 */\n\
\n\
proto.min = function(fn){\n\
  var val;\n\
  var n = 0;\n\
  var min = Infinity;\n\
  var vals = this.__iterate__();\n\
  var len = vals.length();\n\
\n\
  if (fn) {\n\
    fn = toFunction(fn);\n\
    for (var i = 0; i < len; ++i) {\n\
      n = fn(vals.get(i), i);\n\
      min = n < min ? n : min;\n\
    }\n\
  } else {\n\
    for (var i = 0; i < len; ++i) {\n\
      n = vals.get(i);\n\
      min = n < min ? n : min;\n\
    }\n\
  }\n\
\n\
  return min;\n\
};\n\
\n\
/**\n\
 * Determine the sum.\n\
 *\n\
 * With a callback function:\n\
 *\n\
 *    pets.sum(function(pet){\n\
 *      return pet.age\n\
 *    })\n\
 *\n\
 * With property strings:\n\
 *\n\
 *    pets.sum('age')\n\
 *\n\
 * With immediate values:\n\
 *\n\
 *    nums.sum()\n\
 *\n\
 * @param {Function|String} fn\n\
 * @return {Number}\n\
 * @api public\n\
 */\n\
\n\
proto.sum = function(fn){\n\
  var ret;\n\
  var n = 0;\n\
  var vals = this.__iterate__();\n\
  var len = vals.length();\n\
\n\
  if (fn) {\n\
    fn = toFunction(fn);\n\
    for (var i = 0; i < len; ++i) {\n\
      n += fn(vals.get(i), i);\n\
    }\n\
  } else {\n\
    for (var i = 0; i < len; ++i) {\n\
      n += vals.get(i);\n\
    }\n\
  }\n\
\n\
  return n;\n\
};\n\
\n\
/**\n\
 * Determine the average value.\n\
 *\n\
 * With a callback function:\n\
 *\n\
 *    pets.avg(function(pet){\n\
 *      return pet.age\n\
 *    })\n\
 *\n\
 * With property strings:\n\
 *\n\
 *    pets.avg('age')\n\
 *\n\
 * With immediate values:\n\
 *\n\
 *    nums.avg()\n\
 *\n\
 * @param {Function|String} fn\n\
 * @return {Number}\n\
 * @api public\n\
 */\n\
\n\
proto.avg =\n\
proto.mean = function(fn){\n\
  var ret;\n\
  var n = 0;\n\
  var vals = this.__iterate__();\n\
  var len = vals.length();\n\
\n\
  if (fn) {\n\
    fn = toFunction(fn);\n\
    for (var i = 0; i < len; ++i) {\n\
      n += fn(vals.get(i), i);\n\
    }\n\
  } else {\n\
    for (var i = 0; i < len; ++i) {\n\
      n += vals.get(i);\n\
    }\n\
  }\n\
\n\
  return n / len;\n\
};\n\
\n\
/**\n\
 * Return the first value, or first `n` values.\n\
 *\n\
 * @param {Number|Function} [n]\n\
 * @return {Array|Mixed}\n\
 * @api public\n\
 */\n\
\n\
proto.first = function(n){\n\
  if ('function' == typeof n) return this.find(n);\n\
  var vals = this.__iterate__();\n\
\n\
  if (n) {\n\
    var len = Math.min(n, vals.length());\n\
    var arr = new Array(len);\n\
    for (var i = 0; i < len; ++i) {\n\
      arr[i] = vals.get(i);\n\
    }\n\
    return arr;\n\
  }\n\
\n\
  return vals.get(0);\n\
};\n\
\n\
/**\n\
 * Return the last value, or last `n` values.\n\
 *\n\
 * @param {Number|Function} [n]\n\
 * @return {Array|Mixed}\n\
 * @api public\n\
 */\n\
\n\
proto.last = function(n){\n\
  if ('function' == typeof n) return this.findLast(n);\n\
  var vals = this.__iterate__();\n\
  var len = vals.length();\n\
\n\
  if (n) {\n\
    var i = Math.max(0, len - n);\n\
    var arr = [];\n\
    for (; i < len; ++i) {\n\
      arr.push(vals.get(i));\n\
    }\n\
    return arr;\n\
  }\n\
\n\
  return vals.get(len - 1);\n\
};\n\
\n\
/**\n\
 * Return values in groups of `n`.\n\
 *\n\
 * @param {Number} n\n\
 * @return {Enumerable}\n\
 * @api public\n\
 */\n\
\n\
proto.inGroupsOf = function(n){\n\
  var arr = [];\n\
  var group = [];\n\
  var vals = this.__iterate__();\n\
  var len = vals.length();\n\
\n\
  for (var i = 0; i < len; ++i) {\n\
    group.push(vals.get(i));\n\
    if ((i + 1) % n == 0) {\n\
      arr.push(group);\n\
      group = [];\n\
    }\n\
  }\n\
\n\
  if (group.length) arr.push(group);\n\
\n\
  return new Enumerable(arr);\n\
};\n\
\n\
/**\n\
 * Return the value at the given index.\n\
 *\n\
 * @param {Number} i\n\
 * @return {Mixed}\n\
 * @api public\n\
 */\n\
\n\
proto.at = function(i){\n\
  return this.__iterate__().get(i);\n\
};\n\
\n\
/**\n\
 * Return a regular `Array`.\n\
 *\n\
 * @return {Array}\n\
 * @api public\n\
 */\n\
\n\
proto.toJSON =\n\
proto.array = function(){\n\
  var arr = [];\n\
  var vals = this.__iterate__();\n\
  var len = vals.length();\n\
  for (var i = 0; i < len; ++i) {\n\
    arr.push(vals.get(i));\n\
  }\n\
  return arr;\n\
};\n\
\n\
/**\n\
 * Return the enumerable value.\n\
 *\n\
 * @return {Mixed}\n\
 * @api public\n\
 */\n\
\n\
proto.value = function(){\n\
  return this.obj;\n\
};\n\
\n\
/**\n\
 * Mixin enumerable.\n\
 */\n\
\n\
mixin(Enumerable.prototype);\n\
//@ sourceURL=component-enumerable/index.js"
));
require.register("segmentio-collection/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var Emitter = require('emitter')\n\
  , Enumerable = require('enumerable');\n\
\n\
/**\n\
 * Expose `Collection`.\n\
 */\n\
\n\
module.exports = Collection;\n\
\n\
/**\n\
 * Initialize a new collection with the given `models`.\n\
 *\n\
 * @param {Array} models\n\
 * @api public\n\
 */\n\
\n\
function Collection(models) {\n\
  this.models = models || [];\n\
}\n\
\n\
/**\n\
 * Mixin emitter.\n\
 */\n\
\n\
Emitter(Collection.prototype);\n\
\n\
/**\n\
 * Mixin enumerable.\n\
 */\n\
\n\
Enumerable(Collection.prototype);\n\
\n\
/**\n\
 * Iterator implementation.\n\
 */\n\
\n\
Collection.prototype.__iterate__ = function(){\n\
  var self = this;\n\
  return {\n\
    length: function(){ return self.length() },\n\
    get: function(i){ return self.models[i] }\n\
  }\n\
};\n\
\n\
/**\n\
 * Return the collection length.\n\
 *\n\
 * @return {Number}\n\
 * @api public\n\
 */\n\
\n\
Collection.prototype.length = function(){\n\
  return this.models.length;\n\
};\n\
\n\
/**\n\
 * Add `model` to the collection and return the index.\n\
 *\n\
 * @param {Object} model\n\
 * @return {Number}\n\
 * @api public\n\
 */\n\
\n\
Collection.prototype.add =\n\
Collection.prototype.push = function(model){\n\
  var length = this.models.push(model);\n\
  this.emit('add', model);\n\
  return length;\n\
};\n\
\n\
/**\n\
 * Remove `model` from the collection, returning `true` when present,\n\
 * otherwise `false`.\n\
 *\n\
 * @param {Object} model\n\
 * @api public\n\
 */\n\
\n\
Collection.prototype.remove = function(model){\n\
  var i = this.indexOf(model);\n\
  if (~i) {\n\
    this.models.splice(i, 1);\n\
    this.emit('remove', model);\n\
  }\n\
  return !! ~i;\n\
};\n\
//@ sourceURL=segmentio-collection/index.js"
));
require.register("component-type/index.js", Function("exports, require, module",
"\n\
/**\n\
 * toString ref.\n\
 */\n\
\n\
var toString = Object.prototype.toString;\n\
\n\
/**\n\
 * Return the type of `val`.\n\
 *\n\
 * @param {Mixed} val\n\
 * @return {String}\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(val){\n\
  switch (toString.call(val)) {\n\
    case '[object Function]': return 'function';\n\
    case '[object Date]': return 'date';\n\
    case '[object RegExp]': return 'regexp';\n\
    case '[object Arguments]': return 'arguments';\n\
    case '[object Array]': return 'array';\n\
    case '[object String]': return 'string';\n\
  }\n\
\n\
  if (val === null) return 'null';\n\
  if (val === undefined) return 'undefined';\n\
  if (val && val.nodeType === 1) return 'element';\n\
  if (val === Object(val)) return 'object';\n\
\n\
  return typeof val;\n\
};\n\
//@ sourceURL=component-type/index.js"
));
require.register("component-each/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var toFunction = require('to-function');\n\
var type;\n\
\n\
try {\n\
  type = require('type-component');\n\
} catch (e) {\n\
  type = require('type');\n\
}\n\
\n\
/**\n\
 * HOP reference.\n\
 */\n\
\n\
var has = Object.prototype.hasOwnProperty;\n\
\n\
/**\n\
 * Iterate the given `obj` and invoke `fn(val, i)`.\n\
 *\n\
 * @param {String|Array|Object} obj\n\
 * @param {Function} fn\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(obj, fn){\n\
  fn = toFunction(fn);\n\
  switch (type(obj)) {\n\
    case 'array':\n\
      return array(obj, fn);\n\
    case 'object':\n\
      if ('number' == typeof obj.length) return array(obj, fn);\n\
      return object(obj, fn);\n\
    case 'string':\n\
      return string(obj, fn);\n\
  }\n\
};\n\
\n\
/**\n\
 * Iterate string chars.\n\
 *\n\
 * @param {String} obj\n\
 * @param {Function} fn\n\
 * @api private\n\
 */\n\
\n\
function string(obj, fn) {\n\
  for (var i = 0; i < obj.length; ++i) {\n\
    fn(obj.charAt(i), i);\n\
  }\n\
}\n\
\n\
/**\n\
 * Iterate object keys.\n\
 *\n\
 * @param {Object} obj\n\
 * @param {Function} fn\n\
 * @api private\n\
 */\n\
\n\
function object(obj, fn) {\n\
  for (var key in obj) {\n\
    if (has.call(obj, key)) {\n\
      fn(key, obj[key]);\n\
    }\n\
  }\n\
}\n\
\n\
/**\n\
 * Iterate array-ish.\n\
 *\n\
 * @param {Array|Object} obj\n\
 * @param {Function} fn\n\
 * @api private\n\
 */\n\
\n\
function array(obj, fn) {\n\
  for (var i = 0; i < obj.length; ++i) {\n\
    fn(obj[i], i);\n\
  }\n\
}\n\
//@ sourceURL=component-each/index.js"
));
require.register("component-classes/index.js", Function("exports, require, module",
"/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var index = require('indexof');\n\
\n\
/**\n\
 * Whitespace regexp.\n\
 */\n\
\n\
var re = /\\s+/;\n\
\n\
/**\n\
 * toString reference.\n\
 */\n\
\n\
var toString = Object.prototype.toString;\n\
\n\
/**\n\
 * Wrap `el` in a `ClassList`.\n\
 *\n\
 * @param {Element} el\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(el){\n\
  return new ClassList(el);\n\
};\n\
\n\
/**\n\
 * Initialize a new ClassList for `el`.\n\
 *\n\
 * @param {Element} el\n\
 * @api private\n\
 */\n\
\n\
function ClassList(el) {\n\
  if (!el) throw new Error('A DOM element reference is required');\n\
  this.el = el;\n\
  this.list = el.classList;\n\
}\n\
\n\
/**\n\
 * Add class `name` if not already present.\n\
 *\n\
 * @param {String} name\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.add = function(name){\n\
  // classList\n\
  if (this.list) {\n\
    this.list.add(name);\n\
    return this;\n\
  }\n\
\n\
  // fallback\n\
  var arr = this.array();\n\
  var i = index(arr, name);\n\
  if (!~i) arr.push(name);\n\
  this.el.className = arr.join(' ');\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Remove class `name` when present, or\n\
 * pass a regular expression to remove\n\
 * any which match.\n\
 *\n\
 * @param {String|RegExp} name\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.remove = function(name){\n\
  if ('[object RegExp]' == toString.call(name)) {\n\
    return this.removeMatching(name);\n\
  }\n\
\n\
  // classList\n\
  if (this.list) {\n\
    this.list.remove(name);\n\
    return this;\n\
  }\n\
\n\
  // fallback\n\
  var arr = this.array();\n\
  var i = index(arr, name);\n\
  if (~i) arr.splice(i, 1);\n\
  this.el.className = arr.join(' ');\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Remove all classes matching `re`.\n\
 *\n\
 * @param {RegExp} re\n\
 * @return {ClassList}\n\
 * @api private\n\
 */\n\
\n\
ClassList.prototype.removeMatching = function(re){\n\
  var arr = this.array();\n\
  for (var i = 0; i < arr.length; i++) {\n\
    if (re.test(arr[i])) {\n\
      this.remove(arr[i]);\n\
    }\n\
  }\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Toggle class `name`.\n\
 *\n\
 * @param {String} name\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.toggle = function(name){\n\
  // classList\n\
  if (this.list) {\n\
    this.list.toggle(name);\n\
    return this;\n\
  }\n\
\n\
  // fallback\n\
  if (this.has(name)) {\n\
    this.remove(name);\n\
  } else {\n\
    this.add(name);\n\
  }\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Return an array of classes.\n\
 *\n\
 * @return {Array}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.array = function(){\n\
  var str = this.el.className.replace(/^\\s+|\\s+$/g, '');\n\
  var arr = str.split(re);\n\
  if ('' === arr[0]) arr.shift();\n\
  return arr;\n\
};\n\
\n\
/**\n\
 * Check if class `name` is present.\n\
 *\n\
 * @param {String} name\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.has =\n\
ClassList.prototype.contains = function(name){\n\
  return this.list\n\
    ? this.list.contains(name)\n\
    : !! ~index(this.array(), name);\n\
};\n\
//@ sourceURL=component-classes/index.js"
));
require.register("ianstormtaylor-loading/index.js", Function("exports, require, module",
"\n\
var classes = require('classes');\n\
\n\
\n\
/**\n\
 * Expose `loading`.\n\
 */\n\
\n\
module.exports = loading;\n\
\n\
\n\
/**\n\
 * Add a loading class to an element, and return a function that will remove it.\n\
 *\n\
 * @param {Element} el\n\
 * @return {Function}\n\
 */\n\
\n\
function loading (el) {\n\
  classes(el).add('loading');\n\
  return function () {\n\
    classes(el).remove('loading');\n\
  };\n\
}//@ sourceURL=ianstormtaylor-loading/index.js"
));
require.register("component-query/index.js", Function("exports, require, module",
"\n\
function one(selector, el) {\n\
  return el.querySelector(selector);\n\
}\n\
\n\
exports = module.exports = function(selector, el){\n\
  el = el || document;\n\
  return one(selector, el);\n\
};\n\
\n\
exports.all = function(selector, el){\n\
  el = el || document;\n\
  return el.querySelectorAll(selector);\n\
};\n\
\n\
exports.engine = function(obj){\n\
  if (!obj.one) throw new Error('.one callback required');\n\
  if (!obj.all) throw new Error('.all callback required');\n\
  one = obj.one;\n\
  exports.all = obj.all;\n\
};\n\
//@ sourceURL=component-query/index.js"
));
require.register("component-matches-selector/index.js", Function("exports, require, module",
"/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var query = require('query');\n\
\n\
/**\n\
 * Element prototype.\n\
 */\n\
\n\
var proto = Element.prototype;\n\
\n\
/**\n\
 * Vendor function.\n\
 */\n\
\n\
var vendor = proto.matchesSelector\n\
  || proto.webkitMatchesSelector\n\
  || proto.mozMatchesSelector\n\
  || proto.msMatchesSelector\n\
  || proto.oMatchesSelector;\n\
\n\
/**\n\
 * Expose `match()`.\n\
 */\n\
\n\
module.exports = match;\n\
\n\
/**\n\
 * Match `el` to `selector`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {String} selector\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
function match(el, selector) {\n\
  if (vendor) return vendor.call(el, selector);\n\
  var nodes = query.all(selector, el.parentNode);\n\
  for (var i = 0; i < nodes.length; ++i) {\n\
    if (nodes[i] == el) return true;\n\
  }\n\
  return false;\n\
}\n\
//@ sourceURL=component-matches-selector/index.js"
));
require.register("component-event/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Bind `el` event `type` to `fn`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {String} type\n\
 * @param {Function} fn\n\
 * @param {Boolean} capture\n\
 * @return {Function}\n\
 * @api public\n\
 */\n\
\n\
exports.bind = function(el, type, fn, capture){\n\
  if (el.addEventListener) {\n\
    el.addEventListener(type, fn, capture);\n\
  } else {\n\
    el.attachEvent('on' + type, fn);\n\
  }\n\
  return fn;\n\
};\n\
\n\
/**\n\
 * Unbind `el` event `type`'s callback `fn`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {String} type\n\
 * @param {Function} fn\n\
 * @param {Boolean} capture\n\
 * @return {Function}\n\
 * @api public\n\
 */\n\
\n\
exports.unbind = function(el, type, fn, capture){\n\
  if (el.removeEventListener) {\n\
    el.removeEventListener(type, fn, capture);\n\
  } else {\n\
    el.detachEvent('on' + type, fn);\n\
  }\n\
  return fn;\n\
};\n\
//@ sourceURL=component-event/index.js"
));
require.register("component-delegate/index.js", Function("exports, require, module",
"/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var matches = require('matches-selector')\n\
  , event = require('event');\n\
\n\
/**\n\
 * Delegate event `type` to `selector`\n\
 * and invoke `fn(e)`. A callback function\n\
 * is returned which may be passed to `.unbind()`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {String} selector\n\
 * @param {String} type\n\
 * @param {Function} fn\n\
 * @param {Boolean} capture\n\
 * @return {Function}\n\
 * @api public\n\
 */\n\
\n\
exports.bind = function(el, selector, type, fn, capture){\n\
  return event.bind(el, type, function(e){\n\
    if (matches(e.target || e.srcElement, selector)) fn.call(el, e);\n\
  }, capture);\n\
};\n\
\n\
/**\n\
 * Unbind event `type`'s callback `fn`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {String} type\n\
 * @param {Function} fn\n\
 * @param {Boolean} capture\n\
 * @api public\n\
 */\n\
\n\
exports.unbind = function(el, type, fn, capture){\n\
  event.unbind(el, type, fn, capture);\n\
};\n\
//@ sourceURL=component-delegate/index.js"
));
require.register("component-link-delegate/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var delegate = require('delegate');\n\
var url = require('url');\n\
\n\
/**\n\
 * Handle link delegation on `el` or the document,\n\
 * and invoke `fn(e)` when clickable.\n\
 *\n\
 * @param {Element|Function} el or fn\n\
 * @param {Function} [fn]\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(el, fn){\n\
  // default to document\n\
  if ('function' == typeof el) {\n\
    fn = el;\n\
    el = document;\n\
  }\n\
\n\
  delegate.bind(el, 'a', 'click', function(e){\n\
    if (clickable(e)) fn(e);\n\
  });\n\
};\n\
\n\
/**\n\
 * Check if `e` is clickable.\n\
 */\n\
\n\
function clickable(e) {\n\
  if (1 != which(e)) return;\n\
  if (e.metaKey || e.ctrlKey || e.shiftKey) return;\n\
  if (e.defaultPrevented) return;\n\
\n\
  // target\n\
  var el = e.target;\n\
\n\
  // check target\n\
  if (el.target) return;\n\
\n\
  // x-origin\n\
  if (url.isCrossDomain(el.href)) return;\n\
\n\
  return true;\n\
}\n\
\n\
/**\n\
 * Event button.\n\
 */\n\
\n\
function which(e) {\n\
  e = e || window.event;\n\
  return null == e.which\n\
    ? e.button\n\
    : e.which;\n\
}\n\
//@ sourceURL=component-link-delegate/index.js"
));
require.register("component-path-to-regexp/index.js", Function("exports, require, module",
"/**\n\
 * Expose `pathtoRegexp`.\n\
 */\n\
\n\
module.exports = pathtoRegexp;\n\
\n\
/**\n\
 * Normalize the given path string,\n\
 * returning a regular expression.\n\
 *\n\
 * An empty array should be passed,\n\
 * which will contain the placeholder\n\
 * key names. For example \"/user/:id\" will\n\
 * then contain [\"id\"].\n\
 *\n\
 * @param  {String|RegExp|Array} path\n\
 * @param  {Array} keys\n\
 * @param  {Object} options\n\
 * @return {RegExp}\n\
 * @api private\n\
 */\n\
\n\
function pathtoRegexp(path, keys, options) {\n\
  options = options || {};\n\
  var sensitive = options.sensitive;\n\
  var strict = options.strict;\n\
  keys = keys || [];\n\
\n\
  if (path instanceof RegExp) return path;\n\
  if (path instanceof Array) path = '(' + path.join('|') + ')';\n\
\n\
  path = path\n\
    .concat(strict ? '' : '/?')\n\
    .replace(/\\/\\(/g, '(?:/')\n\
    .replace(/(\\/)?(\\.)?:(\\w+)(?:(\\(.*?\\)))?(\\?)?(\\*)?/g, function(_, slash, format, key, capture, optional, star){\n\
      keys.push({ name: key, optional: !! optional });\n\
      slash = slash || '';\n\
      return ''\n\
        + (optional ? '' : slash)\n\
        + '(?:'\n\
        + (optional ? slash : '')\n\
        + (format || '') + (capture || (format && '([^/.]+?)' || '([^/]+?)')) + ')'\n\
        + (optional || '')\n\
        + (star ? '(/*)?' : '');\n\
    })\n\
    .replace(/([\\/.])/g, '\\\\$1')\n\
    .replace(/\\*/g, '(.*)');\n\
\n\
  return new RegExp('^' + path + '$', sensitive ? '' : 'i');\n\
};\n\
//@ sourceURL=component-path-to-regexp/index.js"
));
require.register("component-url/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Parse the given `url`.\n\
 *\n\
 * @param {String} str\n\
 * @return {Object}\n\
 * @api public\n\
 */\n\
\n\
exports.parse = function(url){\n\
  var a = document.createElement('a');\n\
  a.href = url;\n\
  return {\n\
    href: a.href,\n\
    host: a.host || location.host,\n\
    port: ('0' === a.port || '' === a.port) ? location.port : a.port,\n\
    hash: a.hash,\n\
    hostname: a.hostname || location.hostname,\n\
    pathname: a.pathname.charAt(0) != '/' ? '/' + a.pathname : a.pathname,\n\
    protocol: !a.protocol || ':' == a.protocol ? location.protocol : a.protocol,\n\
    search: a.search,\n\
    query: a.search.slice(1)\n\
  };\n\
};\n\
\n\
/**\n\
 * Check if `url` is absolute.\n\
 *\n\
 * @param {String} url\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
exports.isAbsolute = function(url){\n\
  return 0 == url.indexOf('//') || !!~url.indexOf('://');\n\
};\n\
\n\
/**\n\
 * Check if `url` is relative.\n\
 *\n\
 * @param {String} url\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
exports.isRelative = function(url){\n\
  return !exports.isAbsolute(url);\n\
};\n\
\n\
/**\n\
 * Check if `url` is cross domain.\n\
 *\n\
 * @param {String} url\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
exports.isCrossDomain = function(url){\n\
  url = exports.parse(url);\n\
  return url.hostname !== location.hostname\n\
    || url.port !== location.port\n\
    || url.protocol !== location.protocol;\n\
};//@ sourceURL=component-url/index.js"
));
require.register("ianstormtaylor-history/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Get the current path.\n\
 *\n\
 * @return {String}\n\
 */\n\
\n\
exports.path = function () {\n\
  return window.location.pathname;\n\
};\n\
\n\
\n\
/**\n\
 * Get the current state.\n\
 *\n\
 * @return {Object}\n\
 */\n\
\n\
exports.state = function () {\n\
  return window.history.state;\n\
};\n\
\n\
\n\
/**\n\
 * Push a new `url` on to the history.\n\
 *\n\
 * @param {String} url\n\
 * @param {Object} state (optional)\n\
 */\n\
\n\
exports.push = function (url, state) {\n\
  window.history.pushState(state, null, url);\n\
};\n\
\n\
\n\
/**\n\
 * Replace the current url with a new `url`.\n\
 *\n\
 * @param {String} url\n\
 * @param {Object} state (optional)\n\
 */\n\
\n\
exports.replace = function (url, state) {\n\
  window.history.replaceState(state, null, url);\n\
};\n\
\n\
\n\
/**\n\
 * Move back in the history, by an optional number of `steps`.\n\
 *\n\
 * @param {Number} steps (optional)\n\
 */\n\
\n\
exports.back =\n\
exports.backward = function (steps) {\n\
  steps || (steps = 1);\n\
  window.history.go(-1 * steps);\n\
};\n\
\n\
\n\
/**\n\
 * Move forward in the history, by an optional number of `steps`.\n\
 *\n\
 * @param {Number} steps (optional)\n\
 */\n\
\n\
exports.forward = function (steps) {\n\
  steps || (steps = 1);\n\
  window.history.go(steps);\n\
};//@ sourceURL=ianstormtaylor-history/index.js"
));
require.register("yields-prevent/index.js", Function("exports, require, module",
"\n\
/**\n\
 * prevent default on the given `e`.\n\
 * \n\
 * examples:\n\
 * \n\
 *      anchor.onclick = prevent;\n\
 *      anchor.onclick = function(e){\n\
 *        if (something) return prevent(e);\n\
 *      };\n\
 * \n\
 * @param {Event} e\n\
 */\n\
\n\
module.exports = function(e){\n\
  e = e || window.event\n\
  return e.preventDefault\n\
    ? e.preventDefault()\n\
    : e.returnValue = false;\n\
};\n\
//@ sourceURL=yields-prevent/index.js"
));
require.register("yields-stop/index.js", Function("exports, require, module",
"\n\
/**\n\
 * stop propagation on the given `e`.\n\
 * \n\
 * examples:\n\
 * \n\
 *      anchor.onclick = require('stop');\n\
 *      anchor.onclick = function(e){\n\
 *        if (!some) return require('stop')(e);\n\
 *      };\n\
 * \n\
 * \n\
 * @param {Event} e\n\
 */\n\
\n\
module.exports = function(e){\n\
  e = e || window.event;\n\
  return e.stopPropagation\n\
    ? e.stopPropagation()\n\
    : e.cancelBubble = true;\n\
};\n\
//@ sourceURL=yields-stop/index.js"
));
require.register("ianstormtaylor-router/lib/context.js", Function("exports, require, module",
"\n\
\n\
/**\n\
 * Expose `Context`.\n\
 */\n\
\n\
module.exports = Context;\n\
\n\
\n\
/**\n\
 * Initialize a new `Context`.\n\
 *\n\
 * @param {String} path\n\
 * @param {Object} previous (optional)\n\
 */\n\
\n\
function Context (path, previous) {\n\
  this.path = path;\n\
  this.params = {};\n\
  this.previous = previous ? previous.params : {};\n\
}//@ sourceURL=ianstormtaylor-router/lib/context.js"
));
require.register("ianstormtaylor-router/lib/index.js", Function("exports, require, module",
"\n\
var Context = require('./context')\n\
  , history = require('history')\n\
  , link = require('link-delegate')\n\
  , prevent = require('prevent')\n\
  , Route = require('./route')\n\
  , stop = require('stop')\n\
  , url = require('url');\n\
\n\
\n\
/**\n\
 * Expose `Router`.\n\
 */\n\
\n\
module.exports = exports = Router;\n\
\n\
\n\
/**\n\
 * Expose `Route`.\n\
 */\n\
\n\
exports.Route = Route;\n\
\n\
\n\
/**\n\
 * Expose `Context`.\n\
 */\n\
\n\
exports.Context = Context;\n\
\n\
\n\
/**\n\
 * Initialize a new `Router`.\n\
 */\n\
\n\
function Router () {\n\
  this.callbacks = [];\n\
  this.running = false;\n\
}\n\
\n\
\n\
/**\n\
 * Use the given `plugin`.\n\
 *\n\
 * @param {Function} plugin\n\
 * @return {Router}\n\
 */\n\
\n\
Router.use = function (plugin) {\n\
  plugin(this);\n\
  return this;\n\
};\n\
\n\
\n\
/**\n\
 * Attach a route handler.\n\
 *\n\
 * @param {String} path\n\
 * @param {Functions...} fns\n\
 * @return {Router}\n\
 */\n\
\n\
Router.prototype.on = function (path) {\n\
  var route = new Route(path);\n\
  var fns = Array.prototype.slice.call(arguments, 1);\n\
  for (var i = 1; i < arguments.length; i++) {\n\
    this.callbacks.push(route.middleware(arguments[i]));\n\
  }\n\
  return this;\n\
};\n\
\n\
\n\
/**\n\
 * Trigger a route at `path`.\n\
 *\n\
 * @param {String} path\n\
 * @return {Router}\n\
 */\n\
\n\
Router.prototype.dispatch = function (path) {\n\
  var context = this._context = new Context(path, this._context);\n\
  var callbacks = this.callbacks;\n\
  var i = 0;\n\
\n\
  function next () {\n\
    var fn = callbacks[i++];\n\
    if (fn) fn(context, next);\n\
  }\n\
\n\
  next();\n\
  return this;\n\
};\n\
\n\
\n\
/**\n\
 * Dispatch a new `path` and push it to the history, or use the current path.\n\
 *\n\
 * @param {String} path (optional)\n\
 * @return {Router}\n\
 */\n\
\n\
Router.prototype.go = function (path) {\n\
  if (!path) {\n\
    var l = window.location;\n\
    path = l.pathname;\n\
    if (l.search) path += l.search;\n\
  } else {\n\
    this.push(path);\n\
  }\n\
\n\
  this.dispatch(path);\n\
  return this;\n\
};\n\
\n\
\n\
/**\n\
 * Start the router and listen for link clicks relative to an optional `path`.\n\
 * You can optionally set `go` to false to manage the first dispatch yourself.\n\
 *\n\
 * @param {String} path\n\
 * @return {Router}\n\
 */\n\
\n\
Router.prototype.listen = function (path, go) {\n\
  if ('boolean' === typeof path) {\n\
    go = path;\n\
    path = null;\n\
  }\n\
\n\
  if (go || go === undefined) this.go();\n\
\n\
  var self = this;\n\
  link(function (e) {\n\
    var el = e.target;\n\
    var href = el.href;\n\
    if (!routable(href, path)) return;\n\
    var parsed = url.parse(href);\n\
    self.go(parsed.pathname);\n\
    prevent(e);\n\
    stop(e);\n\
  });\n\
\n\
  return this;\n\
};\n\
\n\
\n\
/**\n\
 * Push a new `path` to the browsers history.\n\
 *\n\
 * @param {String} path\n\
 * @return {Router}\n\
 */\n\
\n\
Router.prototype.push = function (path) {\n\
  history.push(path);\n\
  return this;\n\
};\n\
\n\
\n\
/**\n\
 * Replace the current path in the browsers history.\n\
 *\n\
 * @param {String} path\n\
 * @return {Router}\n\
 */\n\
\n\
Router.prototype.replace = function (path) {\n\
  history.replace(path);\n\
  return this;\n\
};\n\
\n\
\n\
/**\n\
 * Check if a given `href` is routable under `path`.\n\
 *\n\
 * @param {String} href\n\
 * @return {Boolean}\n\
 */\n\
\n\
function routable (href, path) {\n\
  if (!path) return true;\n\
  var parsed = url.parse(href);\n\
  if (parsed.pathname.indexOf(path) === 0) return true;\n\
  return false;\n\
}//@ sourceURL=ianstormtaylor-router/lib/index.js"
));
require.register("ianstormtaylor-router/lib/route.js", Function("exports, require, module",
"\n\
var regexp = require('path-to-regexp');\n\
\n\
\n\
/**\n\
 * Expose `Route`.\n\
 */\n\
\n\
module.exports = Route;\n\
\n\
\n\
/**\n\
 * Initialize a new `Route` with the given `path`.\n\
 *\n\
 * @param {String} path\n\
 */\n\
\n\
function Route (path) {\n\
  this.path = path;\n\
  this.keys = [];\n\
  this.regexp = regexp(path, this.keys);\n\
}\n\
\n\
\n\
/**\n\
 * Return route middleware with the given `fn`.\n\
 *\n\
 * @param {Function} fn\n\
 * @return {Function}\n\
 */\n\
\n\
Route.prototype.middleware = function (fn) {\n\
  var self = this;\n\
  return function (context, next) {\n\
    if (self.match(context.path, context.params)) return fn(context, next);\n\
    next();\n\
  };\n\
};\n\
\n\
\n\
/**\n\
 * Check if the route matches a given `path`, returning false or an object.\n\
 *\n\
 * @param {String} path\n\
 * @return {Boolean|Object}\n\
 */\n\
\n\
Route.prototype.match = function (path, params) {\n\
  var keys = this.keys;\n\
  var qsIndex = path.indexOf('?');\n\
  var pathname = ~qsIndex ? path.slice(0, qsIndex) : path;\n\
  var m = this.regexp.exec(pathname);\n\
\n\
  if (!m) return false;\n\
\n\
  for (var i = 1, len = m.length; i < len; ++i) {\n\
    var key = keys[i - 1];\n\
    var val = 'string' === typeof m[i] ? decodeURIComponent(m[i]) : m[i];\n\
    params[key.name] = val;\n\
  }\n\
  return true;\n\
};//@ sourceURL=ianstormtaylor-router/lib/route.js"
));
require.register("matthewmueller-uid/index.js", Function("exports, require, module",
"/**\n\
 * Export `uid`\n\
 */\n\
\n\
module.exports = uid;\n\
\n\
/**\n\
 * Create a `uid`\n\
 *\n\
 * @param {String} len\n\
 * @return {String} uid\n\
 */\n\
\n\
function uid(len) {\n\
  len = len || 7;\n\
  return Math.random().toString(35).substr(2, len);\n\
}\n\
//@ sourceURL=matthewmueller-uid/index.js"
));
require.register("component-css/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Properties to ignore appending \"px\".\n\
 */\n\
\n\
var ignore = {\n\
  columnCount: true,\n\
  fillOpacity: true,\n\
  fontWeight: true,\n\
  lineHeight: true,\n\
  opacity: true,\n\
  orphans: true,\n\
  widows: true,\n\
  zIndex: true,\n\
  zoom: true\n\
};\n\
\n\
/**\n\
 * Set `el` css values.\n\
 *\n\
 * @param {Element} el\n\
 * @param {Object} obj\n\
 * @return {Element}\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(el, obj){\n\
  for (var key in obj) {\n\
    var val = obj[key];\n\
    if ('number' == typeof val && !ignore[key]) val += 'px';\n\
    el.style[key] = val;\n\
  }\n\
  return el;\n\
};\n\
//@ sourceURL=component-css/index.js"
));
require.register("component-sort/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Expose `sort`.\n\
 */\n\
\n\
exports = module.exports = sort;\n\
\n\
/**\n\
 * Sort `el`'s children with the given `fn(a, b)`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {Function} fn\n\
 * @api public\n\
 */\n\
\n\
function sort(el, fn) {\n\
  var arr = [].slice.call(el.children).sort(fn);\n\
  var frag = document.createDocumentFragment();\n\
  for (var i = 0; i < arr.length; i++) {\n\
    frag.appendChild(arr[i]);\n\
  }\n\
  el.appendChild(frag);\n\
};\n\
\n\
/**\n\
 * Sort descending.\n\
 *\n\
 * @param {Element} el\n\
 * @param {Function} fn\n\
 * @api public\n\
 */\n\
\n\
exports.desc = function(el, fn){\n\
  sort(el, function(a, b){\n\
    return ~fn(a, b) + 1;\n\
  });\n\
};\n\
\n\
/**\n\
 * Sort ascending.\n\
 */\n\
\n\
exports.asc = sort;\n\
//@ sourceURL=component-sort/index.js"
));
require.register("component-value/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var typeOf = require('type');\n\
\n\
/**\n\
 * Set or get `el`'s' value.\n\
 *\n\
 * @param {Element} el\n\
 * @param {Mixed} val\n\
 * @return {Mixed}\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(el, val){\n\
  if (2 == arguments.length) return set(el, val);\n\
  return get(el);\n\
};\n\
\n\
/**\n\
 * Get `el`'s value.\n\
 */\n\
\n\
function get(el) {\n\
  switch (type(el)) {\n\
    case 'checkbox':\n\
    case 'radio':\n\
      if (el.checked) {\n\
        var attr = el.getAttribute('value');\n\
        return null == attr ? true : attr;\n\
      } else {\n\
        return false;\n\
      }\n\
    case 'radiogroup':\n\
      for (var i = 0, radio; radio = el[i]; i++) {\n\
        if (radio.checked) return radio.value;\n\
      }\n\
      break;\n\
    case 'select':\n\
      for (var i = 0, option; option = el.options[i]; i++) {\n\
        if (option.selected) return option.value;\n\
      }\n\
      break;\n\
    default:\n\
      return el.value;\n\
  }\n\
}\n\
\n\
/**\n\
 * Set `el`'s value.\n\
 */\n\
\n\
function set(el, val) {\n\
  switch (type(el)) {\n\
    case 'checkbox':\n\
    case 'radio':\n\
      if (val) {\n\
        el.checked = true;\n\
      } else {\n\
        el.checked = false;\n\
      }\n\
      break;\n\
    case 'radiogroup':\n\
      for (var i = 0, radio; radio = el[i]; i++) {\n\
        radio.checked = radio.value === val;\n\
      }\n\
      break;\n\
    case 'select':\n\
      for (var i = 0, option; option = el.options[i]; i++) {\n\
        option.selected = option.value === val;\n\
      }\n\
      break;\n\
    default:\n\
      el.value = val;\n\
  }\n\
}\n\
\n\
/**\n\
 * Element type.\n\
 */\n\
\n\
function type(el) {\n\
  var group = 'array' == typeOf(el) || 'object' == typeOf(el);\n\
  if (group) el = el[0];\n\
  var name = el.nodeName.toLowerCase();\n\
  var type = el.getAttribute('type');\n\
\n\
  if (group && type && 'radio' == type.toLowerCase()) return 'radiogroup';\n\
  if ('input' == name && type && 'checkbox' == type.toLowerCase()) return 'checkbox';\n\
  if ('input' == name && type && 'radio' == type.toLowerCase()) return 'radio';\n\
  if ('select' == name) return 'select';\n\
  return name;\n\
}\n\
//@ sourceURL=component-value/index.js"
));
require.register("segmentio-dom/index.js", Function("exports, require, module",
"/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var delegate = require('delegate');\n\
var classes = require('classes');\n\
var indexof = require('indexof');\n\
var domify = require('domify');\n\
var events = require('event');\n\
var value = require('value');\n\
var query = require('query');\n\
var type = require('type');\n\
var css = require('css');\n\
\n\
/**\n\
 * Attributes supported.\n\
 */\n\
\n\
var attrs = [\n\
  'id',\n\
  'src',\n\
  'rel',\n\
  'cols',\n\
  'rows',\n\
  'name',\n\
  'href',\n\
  'title',\n\
  'style',\n\
  'width',\n\
  'height',\n\
  'tabindex',\n\
  'placeholder'\n\
];\n\
\n\
/**\n\
 * Expose `dom()`.\n\
 */\n\
\n\
exports = module.exports = dom;\n\
\n\
/**\n\
 * Expose supported attrs.\n\
 */\n\
\n\
exports.attrs = attrs;\n\
\n\
/**\n\
 * Return a dom `List` for the given\n\
 * `html`, selector, or element.\n\
 *\n\
 * @param {String|Element|List}\n\
 * @return {List}\n\
 * @api public\n\
 */\n\
\n\
function dom(selector, context) {\n\
  // array\n\
  if (Array.isArray(selector)) {\n\
    return new List(selector);\n\
  }\n\
\n\
  // List\n\
  if (selector instanceof List) {\n\
    return selector;\n\
  }\n\
\n\
  // node\n\
  if (selector.nodeName) {\n\
    return new List([selector]);\n\
  }\n\
\n\
  if ('string' != typeof selector) {\n\
    throw new TypeError('invalid selector');\n\
  }\n\
\n\
  // html\n\
  if ('<' == selector.charAt(0)) {\n\
    return new List([domify(selector)[0]], selector);\n\
  }\n\
\n\
  // selector\n\
  var ctx = context\n\
    ? (context.els ? context.els[0] : context)\n\
    : document;\n\
\n\
  return new List(query.all(selector, ctx), selector);\n\
}\n\
\n\
/**\n\
 * Expose `List` constructor.\n\
 */\n\
\n\
exports.List = List;\n\
\n\
/**\n\
 * Initialize a new `List` with the\n\
 * given array-ish of `els` and `selector`\n\
 * string.\n\
 *\n\
 * @param {Mixed} els\n\
 * @param {String} selector\n\
 * @api private\n\
 */\n\
\n\
function List(els, selector) {\n\
  this.els = els || [];\n\
  this.selector = selector;\n\
}\n\
\n\
/**\n\
 * Enumerable iterator.\n\
 */\n\
\n\
List.prototype.__iterate__ = function(){\n\
  var self = this;\n\
  return {\n\
    length: function(){ return self.els.length },\n\
    get: function(i){ return new List([self.els[i]]) }\n\
  }\n\
};\n\
\n\
/**\n\
 * Remove elements from the DOM.\n\
 *\n\
 * @api public\n\
 */\n\
\n\
List.prototype.remove = function(){\n\
  for (var i = 0; i < this.els.length; i++) {\n\
    var el = this.els[i];\n\
    var parent = el.parentNode;\n\
    if (parent) parent.removeChild(el);\n\
  }\n\
};\n\
\n\
/**\n\
 * Replace elements in the DOM.\n\
 *\n\
 * @param {String|Element|List} val\n\
 * @return {List} new list\n\
 * @api public\n\
 */\n\
\n\
List.prototype.replace = function(val){\n\
  val = dom(val);\n\
  var el = val.els[0];\n\
  if (!el) return;\n\
  for (var i = 0; i < this.els.length; i++) {\n\
    var old = this.els[i];\n\
    var parent = old.parentNode;\n\
    if (parent) parent.replaceChild(val.els[0], old);\n\
  }\n\
  return val;\n\
};\n\
\n\
/**\n\
 * Set attribute `name` to `val`, or get attr `name`.\n\
 *\n\
 * @param {String} name\n\
 * @param {String} [val]\n\
 * @return {String|List} self\n\
 * @api public\n\
 */\n\
\n\
List.prototype.attr = function(name, val){\n\
  // get\n\
  if (1 == arguments.length) {\n\
    return this.els[0] && this.els[0].getAttribute(name);\n\
  }\n\
\n\
  // remove\n\
  if (null == val) {\n\
    return this.removeAttr(name);\n\
  }\n\
\n\
  // set\n\
  return this.forEach(function(el){\n\
    el.setAttribute(name, val);\n\
  });\n\
};\n\
\n\
/**\n\
 * Remove attribute `name`.\n\
 *\n\
 * @param {String} name\n\
 * @return {List} self\n\
 * @api public\n\
 */\n\
\n\
List.prototype.removeAttr = function(name){\n\
  return this.forEach(function(el){\n\
    el.removeAttribute(name);\n\
  });\n\
};\n\
\n\
/**\n\
 * Set property `name` to `val`, or get property `name`.\n\
 *\n\
 * @param {String} name\n\
 * @param {String} [val]\n\
 * @return {Object|List} self\n\
 * @api public\n\
 */\n\
\n\
List.prototype.prop = function(name, val){\n\
  if (1 == arguments.length) {\n\
    return this.els[0] && this.els[0][name];\n\
  }\n\
\n\
  return this.forEach(function(el){\n\
    el[name] = val;\n\
  });\n\
};\n\
\n\
/**\n\
 * Get the first element's value or set selected\n\
 * element values to `val`.\n\
 *\n\
 * @param {Mixed} [val]\n\
 * @return {Mixed}\n\
 * @api public\n\
 */\n\
\n\
List.prototype.val =\n\
List.prototype.value = function(val){\n\
  if (0 == arguments.length) {\n\
    return this.els[0]\n\
      ? value(this.els[0])\n\
      : undefined;\n\
  }\n\
\n\
  return this.forEach(function(el){\n\
    value(el, val);\n\
  });\n\
};\n\
\n\
/**\n\
 * Return a cloned `List` with all elements cloned.\n\
 *\n\
 * @return {List}\n\
 * @api public\n\
 */\n\
\n\
List.prototype.clone = function(){\n\
  var arr = [];\n\
  for (var i = 0, len = this.els.length; i < len; ++i) {\n\
    arr.push(this.els[i].cloneNode(true));\n\
  }\n\
  return new List(arr);\n\
};\n\
\n\
/**\n\
 * Prepend `val`.\n\
 *\n\
 * @param {String|Element|List} val\n\
 * @return {List} new list\n\
 * @api public\n\
 */\n\
\n\
List.prototype.prepend = function(val){\n\
  var el = this.els[0];\n\
  if (!el) return this;\n\
  val = dom(val);\n\
  for (var i = 0; i < val.els.length; ++i) {\n\
    if (el.children.length) {\n\
      el.insertBefore(val.els[i], el.firstChild);\n\
    } else {\n\
      el.appendChild(val.els[i]);\n\
    }\n\
  }\n\
  return val;\n\
};\n\
\n\
/**\n\
 * Append `val`.\n\
 *\n\
 * @param {String|Element|List} val\n\
 * @return {List} new list\n\
 * @api public\n\
 */\n\
\n\
List.prototype.append = function(val){\n\
  var el = this.els[0];\n\
  if (!el) return this;\n\
  val = dom(val);\n\
  for (var i = 0; i < val.els.length; ++i) {\n\
    el.appendChild(val.els[i]);\n\
  }\n\
  return val;\n\
};\n\
\n\
/**\n\
 * Append self's `el` to `val`\n\
 *\n\
 * @param {String|Element|List} val\n\
 * @return {List} self\n\
 * @api public\n\
 */\n\
\n\
List.prototype.appendTo = function(val){\n\
  dom(val).append(this);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Return a `List` containing the element at `i`.\n\
 *\n\
 * @param {Number} i\n\
 * @return {List}\n\
 * @api public\n\
 */\n\
\n\
List.prototype.at = function(i){\n\
  return new List([this.els[i]], this.selector);\n\
};\n\
\n\
/**\n\
 * Return a `List` containing the first element.\n\
 *\n\
 * @param {Number} i\n\
 * @return {List}\n\
 * @api public\n\
 */\n\
\n\
List.prototype.first = function(){\n\
  return new List([this.els[0]], this.selector);\n\
};\n\
\n\
/**\n\
 * Return a `List` containing the last element.\n\
 *\n\
 * @param {Number} i\n\
 * @return {List}\n\
 * @api public\n\
 */\n\
\n\
List.prototype.last = function(){\n\
  return new List([this.els[this.els.length - 1]], this.selector);\n\
};\n\
\n\
/**\n\
 * Return a `List` containing the next element.\n\
 *\n\
 * @return {List}\n\
 * @api public\n\
 */\n\
\n\
List.prototype.next = function(){\n\
  var el = this.els[0];\n\
  while((el = el.nextSibling) && el.nodeType !== 1) {} // only element nodes\n\
  return new List([el], this.selector);\n\
};\n\
\n\
/**\n\
 * Return a `List` containing the previous element.\n\
 *\n\
 * @return {List}\n\
 * @api public\n\
 */\n\
\n\
\n\
List.prototype.previous =\n\
List.prototype.prev = function(){\n\
  var el = this.els[0];\n\
  while((el = el.previousSibling) && el.nodeType !== 1) {} // only element nodes\n\
  return new List([el], this.selector);\n\
};\n\
\n\
/**\n\
 * Return an `Element` at `i`.\n\
 *\n\
 * @param {Number} i\n\
 * @return {Element}\n\
 * @api public\n\
 */\n\
\n\
List.prototype.get = function(i){\n\
  return this.els[i || 0];\n\
};\n\
\n\
/**\n\
 * Return list length.\n\
 *\n\
 * @return {Number}\n\
 * @api public\n\
 */\n\
\n\
List.prototype.length = function(){\n\
  return this.els.length;\n\
};\n\
\n\
/**\n\
 * Return element text.\n\
 *\n\
 * @param {String} str\n\
 * @return {String|List}\n\
 * @api public\n\
 */\n\
\n\
List.prototype.text = function(str){\n\
  // TODO: real impl\n\
  if (1 == arguments.length) {\n\
    this.forEach(function(el){\n\
      el.textContent = str;\n\
    });\n\
    return this;\n\
  }\n\
\n\
  var str = '';\n\
  for (var i = 0; i < this.els.length; ++i) {\n\
    str += this.els[i].textContent;\n\
  }\n\
  return str;\n\
};\n\
\n\
/**\n\
 * Return element html.\n\
 *\n\
 * @return {String} html\n\
 * @api public\n\
 */\n\
\n\
List.prototype.html = function(html){\n\
  if (1 == arguments.length) {\n\
    this.forEach(function(el){\n\
      el.innerHTML = html;\n\
    });\n\
  }\n\
  // TODO: real impl\n\
  return this.els[0] && this.els[0].innerHTML;\n\
};\n\
\n\
/**\n\
 * Bind to `event` and invoke `fn(e)`. When\n\
 * a `selector` is given then events are delegated.\n\
 *\n\
 * @param {String} event\n\
 * @param {String} [selector]\n\
 * @param {Function} fn\n\
 * @param {Boolean} capture\n\
 * @return {List}\n\
 * @api public\n\
 */\n\
\n\
List.prototype.on = function(event, selector, fn, capture){\n\
  if ('string' == typeof selector) {\n\
    for (var i = 0; i < this.els.length; ++i) {\n\
      fn._delegate = delegate.bind(this.els[i], selector, event, fn, capture);\n\
    }\n\
    return this;\n\
  }\n\
\n\
  capture = fn;\n\
  fn = selector;\n\
\n\
  for (var i = 0; i < this.els.length; ++i) {\n\
    events.bind(this.els[i], event, fn, capture);\n\
  }\n\
\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Unbind to `event` and invoke `fn(e)`. When\n\
 * a `selector` is given then delegated event\n\
 * handlers are unbound.\n\
 *\n\
 * @param {String} event\n\
 * @param {String} [selector]\n\
 * @param {Function} fn\n\
 * @param {Boolean} capture\n\
 * @return {List}\n\
 * @api public\n\
 */\n\
\n\
List.prototype.off = function(event, selector, fn, capture){\n\
  if ('string' == typeof selector) {\n\
    for (var i = 0; i < this.els.length; ++i) {\n\
      // TODO: add selector support back\n\
      delegate.unbind(this.els[i], event, fn._delegate, capture);\n\
    }\n\
    return this;\n\
  }\n\
\n\
  capture = fn;\n\
  fn = selector;\n\
\n\
  for (var i = 0; i < this.els.length; ++i) {\n\
    events.unbind(this.els[i], event, fn, capture);\n\
  }\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Iterate elements and invoke `fn(list, i)`.\n\
 *\n\
 * @param {Function} fn\n\
 * @return {List} self\n\
 * @api public\n\
 */\n\
\n\
List.prototype.each = function(fn){\n\
  for (var i = 0; i < this.els.length; ++i) {\n\
    fn(new List([this.els[i]], this.selector), i);\n\
  }\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Iterate elements and invoke `fn(el, i)`.\n\
 *\n\
 * @param {Function} fn\n\
 * @return {List} self\n\
 * @api public\n\
 */\n\
\n\
List.prototype.forEach = function(fn){\n\
  for (var i = 0; i < this.els.length; ++i) {\n\
    fn(this.els[i], i);\n\
  }\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Map elements invoking `fn(list, i)`.\n\
 *\n\
 * @param {Function} fn\n\
 * @return {Array}\n\
 * @api public\n\
 */\n\
\n\
List.prototype.map = function(fn){\n\
  var arr = [];\n\
  for (var i = 0; i < this.els.length; ++i) {\n\
    arr.push(fn(new List([this.els[i]], this.selector), i));\n\
  }\n\
  return arr;\n\
};\n\
\n\
/**\n\
 * Filter elements invoking `fn(list, i)`, returning\n\
 * a new `List` of elements when a truthy value is returned.\n\
 *\n\
 * @param {Function} fn\n\
 * @return {List}\n\
 * @api public\n\
 */\n\
\n\
List.prototype.select =\n\
List.prototype.filter = function(fn){\n\
  var el;\n\
  var list = new List([], this.selector);\n\
  for (var i = 0; i < this.els.length; ++i) {\n\
    el = this.els[i];\n\
    if (fn(new List([el], this.selector), i)) list.els.push(el);\n\
  }\n\
  return list;\n\
};\n\
\n\
/**\n\
 * Filter elements invoking `fn(list, i)`, returning\n\
 * a new `List` of elements when a falsey value is returned.\n\
 *\n\
 * @param {Function} fn\n\
 * @return {List}\n\
 * @api public\n\
 */\n\
\n\
List.prototype.reject = function(fn){\n\
  var el;\n\
  var list = new List([], this.selector);\n\
  for (var i = 0; i < this.els.length; ++i) {\n\
    el = this.els[i];\n\
    if (!fn(new List([el], this.selector), i)) list.els.push(el);\n\
  }\n\
  return list;\n\
};\n\
\n\
/**\n\
 * Add the given class `name`.\n\
 *\n\
 * @param {String} name\n\
 * @return {List} self\n\
 * @api public\n\
 */\n\
\n\
List.prototype.addClass = function(name){\n\
  var el;\n\
  for (var i = 0; i < this.els.length; ++i) {\n\
    el = this.els[i];\n\
    el._classes = el._classes || classes(el);\n\
    el._classes.add(name);\n\
  }\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Remove the given class `name`.\n\
 *\n\
 * @param {String|RegExp} name\n\
 * @return {List} self\n\
 * @api public\n\
 */\n\
\n\
List.prototype.removeClass = function(name){\n\
  var el;\n\
\n\
  if ('regexp' == type(name)) {\n\
    for (var i = 0; i < this.els.length; ++i) {\n\
      el = this.els[i];\n\
      el._classes = el._classes || classes(el);\n\
      var arr = el._classes.array();\n\
      for (var j = 0; j < arr.length; j++) {\n\
        if (name.test(arr[j])) {\n\
          el._classes.remove(arr[j]);\n\
        }\n\
      }\n\
    }\n\
    return this;\n\
  }\n\
\n\
  for (var i = 0; i < this.els.length; ++i) {\n\
    el = this.els[i];\n\
    el._classes = el._classes || classes(el);\n\
    el._classes.remove(name);\n\
  }\n\
\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Toggle the given class `name`,\n\
 * optionally a `bool` may be given\n\
 * to indicate that the class should\n\
 * be added when truthy.\n\
 *\n\
 * @param {String} name\n\
 * @param {Boolean} bool\n\
 * @return {List} self\n\
 * @api public\n\
 */\n\
\n\
List.prototype.toggleClass = function(name, bool){\n\
  var el;\n\
  var fn = 'toggle';\n\
\n\
  // toggle with boolean\n\
  if (2 == arguments.length) {\n\
    fn = bool ? 'add' : 'remove';\n\
  }\n\
\n\
  for (var i = 0; i < this.els.length; ++i) {\n\
    el = this.els[i];\n\
    el._classes = el._classes || classes(el);\n\
    el._classes[fn](name);\n\
  }\n\
\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Check if the given class `name` is present.\n\
 *\n\
 * @param {String} name\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
List.prototype.hasClass = function(name){\n\
  var el;\n\
  for (var i = 0; i < this.els.length; ++i) {\n\
    el = this.els[i];\n\
    el._classes = el._classes || classes(el);\n\
    if (el._classes.has(name)) return true;\n\
  }\n\
  return false;\n\
};\n\
\n\
/**\n\
 * Set CSS `prop` to `val` or get `prop` value.\n\
 * Also accepts an object (`prop`: `val`)\n\
 *\n\
 * @param {String} prop\n\
 * @param {Mixed} val\n\
 * @return {List|String}\n\
 * @api public\n\
 */\n\
\n\
List.prototype.css = function(prop, val){\n\
  if (2 == arguments.length) {\n\
    var obj = {};\n\
    obj[prop] = val;\n\
    return this.setStyle(obj);\n\
  }\n\
\n\
  if ('object' == type(prop)) {\n\
    return this.setStyle(prop);\n\
  }\n\
\n\
  return this.getStyle(prop);\n\
};\n\
\n\
/**\n\
 * Set CSS `props`.\n\
 *\n\
 * @param {Object} props\n\
 * @return {List} self\n\
 * @api private\n\
 */\n\
\n\
List.prototype.setStyle = function(props){\n\
  for (var i = 0; i < this.els.length; ++i) {\n\
    css(this.els[i], props);\n\
  }\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Get CSS `prop` value.\n\
 *\n\
 * @param {String} prop\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
List.prototype.getStyle = function(prop){\n\
  var el = this.els[0];\n\
  if (el) return el.style[prop];\n\
};\n\
\n\
/**\n\
 * Find children matching the given `selector`.\n\
 *\n\
 * @param {String} selector\n\
 * @return {List}\n\
 * @api public\n\
 */\n\
\n\
List.prototype.find = function(selector){\n\
  return dom(selector, this);\n\
};\n\
\n\
/**\n\
 * Empty the dom list\n\
 *\n\
 * @return self\n\
 * @api public\n\
 */\n\
\n\
List.prototype.empty = function(){\n\
  var elem, el;\n\
\n\
  for (var i = 0; i < this.els.length; ++i) {\n\
    el = this.els[i];\n\
    while (el.firstChild) {\n\
      el.removeChild(el.firstChild);\n\
    }\n\
  }\n\
\n\
  return this;\n\
}\n\
\n\
/**\n\
 * Attribute accessors.\n\
 */\n\
\n\
attrs.forEach(function(name){\n\
  List.prototype[name] = function(val){\n\
    if (0 == arguments.length) return this.attr(name);\n\
    return this.attr(name, val);\n\
  };\n\
});\n\
\n\
//@ sourceURL=segmentio-dom/index.js"
));
require.register("component-domify/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Expose `parse`.\n\
 */\n\
\n\
module.exports = parse;\n\
\n\
/**\n\
 * Wrap map from jquery.\n\
 */\n\
\n\
var map = {\n\
  option: [1, '<select multiple=\"multiple\">', '</select>'],\n\
  optgroup: [1, '<select multiple=\"multiple\">', '</select>'],\n\
  legend: [1, '<fieldset>', '</fieldset>'],\n\
  thead: [1, '<table>', '</table>'],\n\
  tbody: [1, '<table>', '</table>'],\n\
  tfoot: [1, '<table>', '</table>'],\n\
  colgroup: [1, '<table>', '</table>'],\n\
  caption: [1, '<table>', '</table>'],\n\
  tr: [2, '<table><tbody>', '</tbody></table>'],\n\
  td: [3, '<table><tbody><tr>', '</tr></tbody></table>'],\n\
  th: [3, '<table><tbody><tr>', '</tr></tbody></table>'],\n\
  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],\n\
  _default: [0, '', '']\n\
};\n\
\n\
/**\n\
 * Parse `html` and return the children.\n\
 *\n\
 * @param {String} html\n\
 * @return {Array}\n\
 * @api private\n\
 */\n\
\n\
function parse(html) {\n\
  if ('string' != typeof html) throw new TypeError('String expected');\n\
\n\
  // tag name\n\
  var m = /<([\\w:]+)/.exec(html);\n\
  if (!m) throw new Error('No elements were generated.');\n\
  var tag = m[1];\n\
\n\
  // body support\n\
  if (tag == 'body') {\n\
    var el = document.createElement('html');\n\
    el.innerHTML = html;\n\
    return el.removeChild(el.lastChild);\n\
  }\n\
\n\
  // wrap map\n\
  var wrap = map[tag] || map._default;\n\
  var depth = wrap[0];\n\
  var prefix = wrap[1];\n\
  var suffix = wrap[2];\n\
  var el = document.createElement('div');\n\
  el.innerHTML = prefix + html + suffix;\n\
  while (depth--) el = el.lastChild;\n\
\n\
  var els = el.children;\n\
  if (1 == els.length) {\n\
    return el.removeChild(els[0]);\n\
  }\n\
\n\
  var fragment = document.createDocumentFragment();\n\
  while (els.length) {\n\
    fragment.appendChild(el.removeChild(els[0]));\n\
  }\n\
\n\
  return fragment;\n\
}\n\
//@ sourceURL=component-domify/index.js"
));
require.register("component-mousetrap/index.js", Function("exports, require, module",
"/**\n\
 * Copyright 2012 Craig Campbell\n\
 *\n\
 * Licensed under the Apache License, Version 2.0 (the \"License\");\n\
 * you may not use this file except in compliance with the License.\n\
 * You may obtain a copy of the License at\n\
 *\n\
 * http://www.apache.org/licenses/LICENSE-2.0\n\
 *\n\
 * Unless required by applicable law or agreed to in writing, software\n\
 * distributed under the License is distributed on an \"AS IS\" BASIS,\n\
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n\
 * See the License for the specific language governing permissions and\n\
 * limitations under the License.\n\
 *\n\
 * Mousetrap is a simple keyboard shortcut library for Javascript with\n\
 * no external dependencies\n\
 *\n\
 * @version 1.1.2\n\
 * @url craig.is/killing/mice\n\
 */\n\
\n\
  /**\n\
   * mapping of special keycodes to their corresponding keys\n\
   *\n\
   * everything in this dictionary cannot use keypress events\n\
   * so it has to be here to map to the correct keycodes for\n\
   * keyup/keydown events\n\
   *\n\
   * @type {Object}\n\
   */\n\
  var _MAP = {\n\
          8: 'backspace',\n\
          9: 'tab',\n\
          13: 'enter',\n\
          16: 'shift',\n\
          17: 'ctrl',\n\
          18: 'alt',\n\
          20: 'capslock',\n\
          27: 'esc',\n\
          32: 'space',\n\
          33: 'pageup',\n\
          34: 'pagedown',\n\
          35: 'end',\n\
          36: 'home',\n\
          37: 'left',\n\
          38: 'up',\n\
          39: 'right',\n\
          40: 'down',\n\
          45: 'ins',\n\
          46: 'del',\n\
          91: 'meta',\n\
          93: 'meta',\n\
          224: 'meta'\n\
      },\n\
\n\
      /**\n\
       * mapping for special characters so they can support\n\
       *\n\
       * this dictionary is only used incase you want to bind a\n\
       * keyup or keydown event to one of these keys\n\
       *\n\
       * @type {Object}\n\
       */\n\
      _KEYCODE_MAP = {\n\
          106: '*',\n\
          107: '+',\n\
          109: '-',\n\
          110: '.',\n\
          111 : '/',\n\
          186: ';',\n\
          187: '=',\n\
          188: ',',\n\
          189: '-',\n\
          190: '.',\n\
          191: '/',\n\
          192: '`',\n\
          219: '[',\n\
          220: '\\\\',\n\
          221: ']',\n\
          222: '\\''\n\
      },\n\
\n\
      /**\n\
       * this is a mapping of keys that require shift on a US keypad\n\
       * back to the non shift equivelents\n\
       *\n\
       * this is so you can use keyup events with these keys\n\
       *\n\
       * note that this will only work reliably on US keyboards\n\
       *\n\
       * @type {Object}\n\
       */\n\
      _SHIFT_MAP = {\n\
          '~': '`',\n\
          '!': '1',\n\
          '@': '2',\n\
          '#': '3',\n\
          '$': '4',\n\
          '%': '5',\n\
          '^': '6',\n\
          '&': '7',\n\
          '*': '8',\n\
          '(': '9',\n\
          ')': '0',\n\
          '_': '-',\n\
          '+': '=',\n\
          ':': ';',\n\
          '\\\"': '\\'',\n\
          '<': ',',\n\
          '>': '.',\n\
          '?': '/',\n\
          '|': '\\\\'\n\
      },\n\
\n\
      /**\n\
       * this is a list of special strings you can use to map\n\
       * to modifier keys when you specify your keyboard shortcuts\n\
       *\n\
       * @type {Object}\n\
       */\n\
      _SPECIAL_ALIASES = {\n\
          'option': 'alt',\n\
          'command': 'meta',\n\
          'return': 'enter',\n\
          'escape': 'esc'\n\
      },\n\
\n\
      /**\n\
       * variable to store the flipped version of _MAP from above\n\
       * needed to check if we should use keypress or not when no action\n\
       * is specified\n\
       *\n\
       * @type {Object|undefined}\n\
       */\n\
      _REVERSE_MAP,\n\
\n\
      /**\n\
       * a list of all the callbacks setup via Mousetrap.bind()\n\
       *\n\
       * @type {Object}\n\
       */\n\
      _callbacks = {},\n\
\n\
      /**\n\
       * direct map of string combinations to callbacks used for trigger()\n\
       *\n\
       * @type {Object}\n\
       */\n\
      _direct_map = {},\n\
\n\
      /**\n\
       * keeps track of what level each sequence is at since multiple\n\
       * sequences can start out with the same sequence\n\
       *\n\
       * @type {Object}\n\
       */\n\
      _sequence_levels = {},\n\
\n\
      /**\n\
       * variable to store the setTimeout call\n\
       *\n\
       * @type {null|number}\n\
       */\n\
      _reset_timer,\n\
\n\
      /**\n\
       * temporary state where we will ignore the next keyup\n\
       *\n\
       * @type {boolean|string}\n\
       */\n\
      _ignore_next_keyup = false,\n\
\n\
      /**\n\
       * are we currently inside of a sequence?\n\
       * type of action (\"keyup\" or \"keydown\" or \"keypress\") or false\n\
       *\n\
       * @type {boolean|string}\n\
       */\n\
      _inside_sequence = false;\n\
\n\
  /**\n\
   * loop through the f keys, f1 to f19 and add them to the map\n\
   * programatically\n\
   */\n\
  for (var i = 1; i < 20; ++i) {\n\
      _MAP[111 + i] = 'f' + i;\n\
  }\n\
\n\
  /**\n\
   * loop through to map numbers on the numeric keypad\n\
   */\n\
  for (i = 0; i <= 9; ++i) {\n\
      _MAP[i + 96] = i;\n\
  }\n\
\n\
  /**\n\
   * cross browser add event method\n\
   *\n\
   * @param {Element|HTMLDocument} object\n\
   * @param {string} type\n\
   * @param {Function} callback\n\
   * @returns void\n\
   */\n\
  function _addEvent(object, type, callback) {\n\
      if (object.addEventListener) {\n\
          return object.addEventListener(type, callback, false);\n\
      }\n\
\n\
      object.attachEvent('on' + type, callback);\n\
  }\n\
\n\
  /**\n\
   * takes the event and returns the key character\n\
   *\n\
   * @param {Event} e\n\
   * @return {string}\n\
   */\n\
  function _characterFromEvent(e) {\n\
\n\
      // for keypress events we should return the character as is\n\
      if (e.type == 'keypress') {\n\
          return String.fromCharCode(e.which);\n\
      }\n\
\n\
      // for non keypress events the special maps are needed\n\
      if (_MAP[e.which]) {\n\
          return _MAP[e.which];\n\
      }\n\
\n\
      if (_KEYCODE_MAP[e.which]) {\n\
          return _KEYCODE_MAP[e.which];\n\
      }\n\
\n\
      // if it is not in the special map\n\
      return String.fromCharCode(e.which).toLowerCase();\n\
  }\n\
\n\
  /**\n\
   * should we stop this event before firing off callbacks\n\
   *\n\
   * @param {Event} e\n\
   * @return {boolean}\n\
   */\n\
  function _stop(e) {\n\
      var element = e.target || e.srcElement,\n\
          tag_name = element.tagName;\n\
\n\
      // if the element has the class \"mousetrap\" then no need to stop\n\
      if ((' ' + element.className + ' ').indexOf(' mousetrap ') > -1) {\n\
          return false;\n\
      }\n\
\n\
      // stop for input, select, and textarea\n\
      return tag_name == 'INPUT' || tag_name == 'SELECT' || tag_name == 'TEXTAREA' || (element.contentEditable && element.contentEditable == 'true');\n\
  }\n\
\n\
  /**\n\
   * checks if two arrays are equal\n\
   *\n\
   * @param {Array} modifiers1\n\
   * @param {Array} modifiers2\n\
   * @returns {boolean}\n\
   */\n\
  function _modifiersMatch(modifiers1, modifiers2) {\n\
      return modifiers1.sort().join(',') === modifiers2.sort().join(',');\n\
  }\n\
\n\
  /**\n\
   * resets all sequence counters except for the ones passed in\n\
   *\n\
   * @param {Object} do_not_reset\n\
   * @returns void\n\
   */\n\
  function _resetSequences(do_not_reset) {\n\
      do_not_reset = do_not_reset || {};\n\
\n\
      var active_sequences = false,\n\
          key;\n\
\n\
      for (key in _sequence_levels) {\n\
          if (do_not_reset[key]) {\n\
              active_sequences = true;\n\
              continue;\n\
          }\n\
          _sequence_levels[key] = 0;\n\
      }\n\
\n\
      if (!active_sequences) {\n\
          _inside_sequence = false;\n\
      }\n\
  }\n\
\n\
  /**\n\
   * finds all callbacks that match based on the keycode, modifiers,\n\
   * and action\n\
   *\n\
   * @param {string} character\n\
   * @param {Array} modifiers\n\
   * @param {string} action\n\
   * @param {boolean=} remove - should we remove any matches\n\
   * @param {string=} combination\n\
   * @returns {Array}\n\
   */\n\
  function _getMatches(character, modifiers, action, remove, combination) {\n\
      var i,\n\
          callback,\n\
          matches = [];\n\
\n\
      // if there are no events related to this keycode\n\
      if (!_callbacks[character]) {\n\
          return [];\n\
      }\n\
\n\
      // if a modifier key is coming up on its own we should allow it\n\
      if (action == 'keyup' && _isModifier(character)) {\n\
          modifiers = [character];\n\
      }\n\
\n\
      // loop through all callbacks for the key that was pressed\n\
      // and see if any of them match\n\
      for (i = 0; i < _callbacks[character].length; ++i) {\n\
          callback = _callbacks[character][i];\n\
\n\
          // if this is a sequence but it is not at the right level\n\
          // then move onto the next match\n\
          if (callback.seq && _sequence_levels[callback.seq] != callback.level) {\n\
              continue;\n\
          }\n\
\n\
          // if the action we are looking for doesn't match the action we got\n\
          // then we should keep going\n\
          if (action != callback.action) {\n\
              continue;\n\
          }\n\
\n\
          // if this is a keypress event that means that we need to only\n\
          // look at the character, otherwise check the modifiers as\n\
          // well\n\
          if (action == 'keypress' || _modifiersMatch(modifiers, callback.modifiers)) {\n\
\n\
              // remove is used so if you change your mind and call bind a\n\
              // second time with a new function the first one is overwritten\n\
              if (remove && callback.combo == combination) {\n\
                  _callbacks[character].splice(i, 1);\n\
              }\n\
\n\
              matches.push(callback);\n\
          }\n\
      }\n\
\n\
      return matches;\n\
  }\n\
\n\
  /**\n\
   * takes a key event and figures out what the modifiers are\n\
   *\n\
   * @param {Event} e\n\
   * @returns {Array}\n\
   */\n\
  function _eventModifiers(e) {\n\
      var modifiers = [];\n\
\n\
      if (e.shiftKey) {\n\
          modifiers.push('shift');\n\
      }\n\
\n\
      if (e.altKey) {\n\
          modifiers.push('alt');\n\
      }\n\
\n\
      if (e.ctrlKey) {\n\
          modifiers.push('ctrl');\n\
      }\n\
\n\
      if (e.metaKey) {\n\
          modifiers.push('meta');\n\
      }\n\
\n\
      return modifiers;\n\
  }\n\
\n\
  /**\n\
   * actually calls the callback function\n\
   *\n\
   * if your callback function returns false this will use the jquery\n\
   * convention - prevent default and stop propogation on the event\n\
   *\n\
   * @param {Function} callback\n\
   * @param {Event} e\n\
   * @returns void\n\
   */\n\
  function _fireCallback(callback, e) {\n\
      if (callback(e) === false) {\n\
          if (e.preventDefault) {\n\
              e.preventDefault();\n\
          }\n\
\n\
          if (e.stopPropagation) {\n\
              e.stopPropagation();\n\
          }\n\
\n\
          e.returnValue = false;\n\
          e.cancelBubble = true;\n\
      }\n\
  }\n\
\n\
  /**\n\
   * handles a character key event\n\
   *\n\
   * @param {string} character\n\
   * @param {Event} e\n\
   * @returns void\n\
   */\n\
  function _handleCharacter(character, e) {\n\
\n\
      // if this event should not happen stop here\n\
      if (_stop(e)) {\n\
          return;\n\
      }\n\
\n\
      var callbacks = _getMatches(character, _eventModifiers(e), e.type),\n\
          i,\n\
          do_not_reset = {},\n\
          processed_sequence_callback = false;\n\
\n\
      // loop through matching callbacks for this key event\n\
      for (i = 0; i < callbacks.length; ++i) {\n\
\n\
          // fire for all sequence callbacks\n\
          // this is because if for example you have multiple sequences\n\
          // bound such as \"g i\" and \"g t\" they both need to fire the\n\
          // callback for matching g cause otherwise you can only ever\n\
          // match the first one\n\
          if (callbacks[i].seq) {\n\
              processed_sequence_callback = true;\n\
\n\
              // keep a list of which sequences were matches for later\n\
              do_not_reset[callbacks[i].seq] = 1;\n\
              _fireCallback(callbacks[i].callback, e);\n\
              continue;\n\
          }\n\
\n\
          // if there were no sequence matches but we are still here\n\
          // that means this is a regular match so we should fire that\n\
          if (!processed_sequence_callback && !_inside_sequence) {\n\
              _fireCallback(callbacks[i].callback, e);\n\
          }\n\
      }\n\
\n\
      // if you are inside of a sequence and the key you are pressing\n\
      // is not a modifier key then we should reset all sequences\n\
      // that were not matched by this key event\n\
      if (e.type == _inside_sequence && !_isModifier(character)) {\n\
          _resetSequences(do_not_reset);\n\
      }\n\
  }\n\
\n\
  /**\n\
   * handles a keydown event\n\
   *\n\
   * @param {Event} e\n\
   * @returns void\n\
   */\n\
  function _handleKey(e) {\n\
\n\
      // normalize e.which for key events\n\
      // @see http://stackoverflow.com/questions/4285627/javascript-keycode-vs-charcode-utter-confusion\n\
      e.which = typeof e.which == \"number\" ? e.which : e.keyCode;\n\
\n\
      var character = _characterFromEvent(e);\n\
\n\
      // no character found then stop\n\
      if (!character) {\n\
          return;\n\
      }\n\
\n\
      if (e.type == 'keyup' && _ignore_next_keyup == character) {\n\
          _ignore_next_keyup = false;\n\
          return;\n\
      }\n\
\n\
      _handleCharacter(character, e);\n\
  }\n\
\n\
  /**\n\
   * determines if the keycode specified is a modifier key or not\n\
   *\n\
   * @param {string} key\n\
   * @returns {boolean}\n\
   */\n\
  function _isModifier(key) {\n\
      return key == 'shift' || key == 'ctrl' || key == 'alt' || key == 'meta';\n\
  }\n\
\n\
  /**\n\
   * called to set a 1 second timeout on the specified sequence\n\
   *\n\
   * this is so after each key press in the sequence you have 1 second\n\
   * to press the next key before you have to start over\n\
   *\n\
   * @returns void\n\
   */\n\
  function _resetSequenceTimer() {\n\
      clearTimeout(_reset_timer);\n\
      _reset_timer = setTimeout(_resetSequences, 1000);\n\
  }\n\
\n\
  /**\n\
   * reverses the map lookup so that we can look for specific keys\n\
   * to see what can and can't use keypress\n\
   *\n\
   * @return {Object}\n\
   */\n\
  function _getReverseMap() {\n\
      if (!_REVERSE_MAP) {\n\
          _REVERSE_MAP = {};\n\
          for (var key in _MAP) {\n\
\n\
              // pull out the numeric keypad from here cause keypress should\n\
              // be able to detect the keys from the character\n\
              if (key > 95 && key < 112) {\n\
                  continue;\n\
              }\n\
\n\
              if (_MAP.hasOwnProperty(key)) {\n\
                  _REVERSE_MAP[_MAP[key]] = key;\n\
              }\n\
          }\n\
      }\n\
      return _REVERSE_MAP;\n\
  }\n\
\n\
  /**\n\
   * picks the best action based on the key combination\n\
   *\n\
   * @param {string} key - character for key\n\
   * @param {Array} modifiers\n\
   * @param {string=} action passed in\n\
   */\n\
  function _pickBestAction(key, modifiers, action) {\n\
\n\
      // if no action was picked in we should try to pick the one\n\
      // that we think would work best for this key\n\
      if (!action) {\n\
          action = _getReverseMap()[key] ? 'keydown' : 'keypress';\n\
      }\n\
\n\
      // modifier keys don't work as expected with keypress,\n\
      // switch to keydown\n\
      if (action == 'keypress' && modifiers.length) {\n\
          action = 'keydown';\n\
      }\n\
\n\
      return action;\n\
  }\n\
\n\
  /**\n\
   * binds a key sequence to an event\n\
   *\n\
   * @param {string} combo - combo specified in bind call\n\
   * @param {Array} keys\n\
   * @param {Function} callback\n\
   * @param {string=} action\n\
   * @returns void\n\
   */\n\
  function _bindSequence(combo, keys, callback, action) {\n\
\n\
      // start off by adding a sequence level record for this combination\n\
      // and setting the level to 0\n\
      _sequence_levels[combo] = 0;\n\
\n\
      // if there is no action pick the best one for the first key\n\
      // in the sequence\n\
      if (!action) {\n\
          action = _pickBestAction(keys[0], []);\n\
      }\n\
\n\
      /**\n\
       * callback to increase the sequence level for this sequence and reset\n\
       * all other sequences that were active\n\
       *\n\
       * @param {Event} e\n\
       * @returns void\n\
       */\n\
      var _increaseSequence = function(e) {\n\
              _inside_sequence = action;\n\
              ++_sequence_levels[combo];\n\
              _resetSequenceTimer();\n\
          },\n\
\n\
          /**\n\
           * wraps the specified callback inside of another function in order\n\
           * to reset all sequence counters as soon as this sequence is done\n\
           *\n\
           * @param {Event} e\n\
           * @returns void\n\
           */\n\
          _callbackAndReset = function(e) {\n\
              _fireCallback(callback, e);\n\
\n\
              // we should ignore the next key up if the action is key down\n\
              // or keypress.  this is so if you finish a sequence and\n\
              // release the key the final key will not trigger a keyup\n\
              if (action !== 'keyup') {\n\
                  _ignore_next_keyup = _characterFromEvent(e);\n\
              }\n\
\n\
              // weird race condition if a sequence ends with the key\n\
              // another sequence begins with\n\
              setTimeout(_resetSequences, 10);\n\
          },\n\
          i;\n\
\n\
      // loop through keys one at a time and bind the appropriate callback\n\
      // function.  for any key leading up to the final one it should\n\
      // increase the sequence. after the final, it should reset all sequences\n\
      for (i = 0; i < keys.length; ++i) {\n\
          _bindSingle(keys[i], i < keys.length - 1 ? _increaseSequence : _callbackAndReset, action, combo, i);\n\
      }\n\
  }\n\
\n\
  /**\n\
   * binds a single keyboard combination\n\
   *\n\
   * @param {string} combination\n\
   * @param {Function} callback\n\
   * @param {string=} action\n\
   * @param {string=} sequence_name - name of sequence if part of sequence\n\
   * @param {number=} level - what part of the sequence the command is\n\
   * @returns void\n\
   */\n\
  function _bindSingle(combination, callback, action, sequence_name, level) {\n\
\n\
      // make sure multiple spaces in a row become a single space\n\
      combination = combination.replace(/\\s+/g, ' ');\n\
\n\
      var sequence = combination.split(' '),\n\
          i,\n\
          key,\n\
          keys,\n\
          modifiers = [];\n\
\n\
      // if this pattern is a sequence of keys then run through this method\n\
      // to reprocess each pattern one key at a time\n\
      if (sequence.length > 1) {\n\
          return _bindSequence(combination, sequence, callback, action);\n\
      }\n\
\n\
      // take the keys from this pattern and figure out what the actual\n\
      // pattern is all about\n\
      keys = combination === '+' ? ['+'] : combination.split('+');\n\
\n\
      for (i = 0; i < keys.length; ++i) {\n\
          key = keys[i];\n\
\n\
          // normalize key names\n\
          if (_SPECIAL_ALIASES[key]) {\n\
              key = _SPECIAL_ALIASES[key];\n\
          }\n\
\n\
          // if this is not a keypress event then we should\n\
          // be smart about using shift keys\n\
          // this will only work for US keyboards however\n\
          if (action && action != 'keypress' && _SHIFT_MAP[key]) {\n\
              key = _SHIFT_MAP[key];\n\
              modifiers.push('shift');\n\
          }\n\
\n\
          // if this key is a modifier then add it to the list of modifiers\n\
          if (_isModifier(key)) {\n\
              modifiers.push(key);\n\
          }\n\
      }\n\
\n\
      // depending on what the key combination is\n\
      // we will try to pick the best event for it\n\
      action = _pickBestAction(key, modifiers, action);\n\
\n\
      // make sure to initialize array if this is the first time\n\
      // a callback is added for this key\n\
      if (!_callbacks[key]) {\n\
          _callbacks[key] = [];\n\
      }\n\
\n\
      // remove an existing match if there is one\n\
      _getMatches(key, modifiers, action, !sequence_name, combination);\n\
\n\
      // add this call back to the array\n\
      // if it is a sequence put it at the beginning\n\
      // if not put it at the end\n\
      //\n\
      // this is important because the way these are processed expects\n\
      // the sequence ones to come first\n\
      _callbacks[key][sequence_name ? 'unshift' : 'push']({\n\
          callback: callback,\n\
          modifiers: modifiers,\n\
          action: action,\n\
          seq: sequence_name,\n\
          level: level,\n\
          combo: combination\n\
      });\n\
  }\n\
\n\
  /**\n\
   * binds multiple combinations to the same callback\n\
   *\n\
   * @param {Array} combinations\n\
   * @param {Function} callback\n\
   * @param {string|undefined} action\n\
   * @returns void\n\
   */\n\
  function _bindMultiple(combinations, callback, action) {\n\
      for (var i = 0; i < combinations.length; ++i) {\n\
          _bindSingle(combinations[i], callback, action);\n\
      }\n\
  }\n\
\n\
  // start!\n\
  _addEvent(document, 'keypress', _handleKey);\n\
  _addEvent(document, 'keydown', _handleKey);\n\
  _addEvent(document, 'keyup', _handleKey);\n\
\n\
  var mousetrap = {\n\
\n\
      /**\n\
       * binds an event to mousetrap\n\
       *\n\
       * can be a single key, a combination of keys separated with +,\n\
       * a comma separated list of keys, an array of keys, or\n\
       * a sequence of keys separated by spaces\n\
       *\n\
       * be sure to list the modifier keys first to make sure that the\n\
       * correct key ends up getting bound (the last key in the pattern)\n\
       *\n\
       * @param {string|Array} keys\n\
       * @param {Function} callback\n\
       * @param {string=} action - 'keypress', 'keydown', or 'keyup'\n\
       * @returns void\n\
       */\n\
      bind: function(keys, callback, action) {\n\
          _bindMultiple(keys instanceof Array ? keys : [keys], callback, action);\n\
          _direct_map[keys + ':' + action] = callback;\n\
          return this;\n\
      },\n\
\n\
      /**\n\
       * unbinds an event to mousetrap\n\
       *\n\
       * the unbinding sets the callback function of the specified key combo\n\
       * to an empty function and deletes the corresponding key in the\n\
       * _direct_map dict.\n\
       *\n\
       * the keycombo+action has to be exactly the same as\n\
       * it was defined in the bind method\n\
       *\n\
       * TODO: actually remove this from the _callbacks dictionary instead\n\
       * of binding an empty function\n\
       *\n\
       * @param {string|Array} keys\n\
       * @param {string} action\n\
       * @returns void\n\
       */\n\
      unbind: function(keys, action) {\n\
          if (_direct_map[keys + ':' + action]) {\n\
              delete _direct_map[keys + ':' + action];\n\
              this.bind(keys, function() {}, action);\n\
          }\n\
          return this;\n\
      },\n\
\n\
      /**\n\
       * triggers an event that has already been bound\n\
       *\n\
       * @param {string} keys\n\
       * @param {string=} action\n\
       * @returns void\n\
       */\n\
      trigger: function(keys, action) {\n\
          _direct_map[keys + ':' + action]();\n\
          return this;\n\
      },\n\
\n\
      /**\n\
       * resets the library back to its initial state.  this is useful\n\
       * if you want to clear out the current keyboard shortcuts and bind\n\
       * new ones - for example if you switch to another page\n\
       *\n\
       * @returns void\n\
       */\n\
      reset: function() {\n\
          _callbacks = {};\n\
          _direct_map = {};\n\
          return this;\n\
      }\n\
  };\n\
\n\
module.exports = mousetrap;\n\
\n\
//@ sourceURL=component-mousetrap/index.js"
));
require.register("component-format-parser/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Parse the given format `str`.\n\
 *\n\
 * @param {String} str\n\
 * @return {Array}\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(str){\n\
\treturn str.split(/ *\\| */).map(function(call){\n\
\t\tvar parts = call.split(':');\n\
\t\tvar name = parts.shift();\n\
\t\tvar args = parseArgs(parts.join(':'));\n\
\n\
\t\treturn {\n\
\t\t\tname: name,\n\
\t\t\targs: args\n\
\t\t};\n\
\t});\n\
};\n\
\n\
/**\n\
 * Parse args `str`.\n\
 *\n\
 * @param {String} str\n\
 * @return {Array}\n\
 * @api private\n\
 */\n\
\n\
function parseArgs(str) {\n\
\tvar args = [];\n\
\tvar re = /\"([^\"]*)\"|'([^']*)'|([^ \\t,]+)/g;\n\
\tvar m;\n\
\t\n\
\twhile (m = re.exec(str)) {\n\
\t\targs.push(m[2] || m[1] || m[0]);\n\
\t}\n\
\t\n\
\treturn args;\n\
}\n\
//@ sourceURL=component-format-parser/index.js"
));
require.register("component-props/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Return immediate identifiers parsed from `str`.\n\
 *\n\
 * @param {String} str\n\
 * @return {Array}\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(str, prefix){\n\
  var p = unique(props(str));\n\
  if (prefix) return prefixed(str, p, prefix);\n\
  return p;\n\
};\n\
\n\
/**\n\
 * Return immediate identifiers in `str`.\n\
 *\n\
 * @param {String} str\n\
 * @return {Array}\n\
 * @api private\n\
 */\n\
\n\
function props(str) {\n\
  return str\n\
    .replace(/\\.\\w+|\\w+ *\\(|\"[^\"]*\"|'[^']*'|\\/([^/]+)\\//g, '')\n\
    .match(/[a-zA-Z_]\\w*/g)\n\
    || [];\n\
}\n\
\n\
/**\n\
 * Return `str` with `props` prefixed with `prefix`.\n\
 *\n\
 * @param {String} str\n\
 * @param {Array} props\n\
 * @param {String} prefix\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
function prefixed(str, props, prefix) {\n\
  var re = /\\.\\w+|\\w+ *\\(|\"[^\"]*\"|'[^']*'|\\/([^/]+)\\/|[a-zA-Z_]\\w*/g;\n\
  return str.replace(re, function(_){\n\
    if ('(' == _[_.length - 1]) return prefix + _;\n\
    if (!~props.indexOf(_)) return _;\n\
    return prefix + _;\n\
  });\n\
}\n\
\n\
/**\n\
 * Return unique array.\n\
 *\n\
 * @param {Array} arr\n\
 * @return {Array}\n\
 * @api private\n\
 */\n\
\n\
function unique(arr) {\n\
  var ret = [];\n\
\n\
  for (var i = 0; i < arr.length; i++) {\n\
    if (~ret.indexOf(arr[i])) continue;\n\
    ret.push(arr[i]);\n\
  }\n\
\n\
  return ret;\n\
}\n\
//@ sourceURL=component-props/index.js"
));
require.register("visionmedia-debug/index.js", Function("exports, require, module",
"if ('undefined' == typeof window) {\n\
  module.exports = require('./lib/debug');\n\
} else {\n\
  module.exports = require('./debug');\n\
}\n\
//@ sourceURL=visionmedia-debug/index.js"
));
require.register("visionmedia-debug/debug.js", Function("exports, require, module",
"\n\
/**\n\
 * Expose `debug()` as the module.\n\
 */\n\
\n\
module.exports = debug;\n\
\n\
/**\n\
 * Create a debugger with the given `name`.\n\
 *\n\
 * @param {String} name\n\
 * @return {Type}\n\
 * @api public\n\
 */\n\
\n\
function debug(name) {\n\
  if (!debug.enabled(name)) return function(){};\n\
\n\
  return function(fmt){\n\
    fmt = coerce(fmt);\n\
\n\
    var curr = new Date;\n\
    var ms = curr - (debug[name] || curr);\n\
    debug[name] = curr;\n\
\n\
    fmt = name\n\
      + ' '\n\
      + fmt\n\
      + ' +' + debug.humanize(ms);\n\
\n\
    // This hackery is required for IE8\n\
    // where `console.log` doesn't have 'apply'\n\
    window.console\n\
      && console.log\n\
      && Function.prototype.apply.call(console.log, console, arguments);\n\
  }\n\
}\n\
\n\
/**\n\
 * The currently active debug mode names.\n\
 */\n\
\n\
debug.names = [];\n\
debug.skips = [];\n\
\n\
/**\n\
 * Enables a debug mode by name. This can include modes\n\
 * separated by a colon and wildcards.\n\
 *\n\
 * @param {String} name\n\
 * @api public\n\
 */\n\
\n\
debug.enable = function(name) {\n\
  try {\n\
    localStorage.debug = name;\n\
  } catch(e){}\n\
\n\
  var split = (name || '').split(/[\\s,]+/)\n\
    , len = split.length;\n\
\n\
  for (var i = 0; i < len; i++) {\n\
    name = split[i].replace('*', '.*?');\n\
    if (name[0] === '-') {\n\
      debug.skips.push(new RegExp('^' + name.substr(1) + '$'));\n\
    }\n\
    else {\n\
      debug.names.push(new RegExp('^' + name + '$'));\n\
    }\n\
  }\n\
};\n\
\n\
/**\n\
 * Disable debug output.\n\
 *\n\
 * @api public\n\
 */\n\
\n\
debug.disable = function(){\n\
  debug.enable('');\n\
};\n\
\n\
/**\n\
 * Humanize the given `ms`.\n\
 *\n\
 * @param {Number} m\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
debug.humanize = function(ms) {\n\
  var sec = 1000\n\
    , min = 60 * 1000\n\
    , hour = 60 * min;\n\
\n\
  if (ms >= hour) return (ms / hour).toFixed(1) + 'h';\n\
  if (ms >= min) return (ms / min).toFixed(1) + 'm';\n\
  if (ms >= sec) return (ms / sec | 0) + 's';\n\
  return ms + 'ms';\n\
};\n\
\n\
/**\n\
 * Returns true if the given mode name is enabled, false otherwise.\n\
 *\n\
 * @param {String} name\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
debug.enabled = function(name) {\n\
  for (var i = 0, len = debug.skips.length; i < len; i++) {\n\
    if (debug.skips[i].test(name)) {\n\
      return false;\n\
    }\n\
  }\n\
  for (var i = 0, len = debug.names.length; i < len; i++) {\n\
    if (debug.names[i].test(name)) {\n\
      return true;\n\
    }\n\
  }\n\
  return false;\n\
};\n\
\n\
/**\n\
 * Coerce `val`.\n\
 */\n\
\n\
function coerce(val) {\n\
  if (val instanceof Error) return val.stack || val.message;\n\
  return val;\n\
}\n\
\n\
// persist\n\
\n\
if (window.localStorage) debug.enable(localStorage.debug);\n\
//@ sourceURL=visionmedia-debug/debug.js"
));
require.register("ianstormtaylor-reactive/lib/index.js", Function("exports, require, module",
"/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var adapter = require('./adapter');\n\
var AttrBinding = require('./attr-binding');\n\
var TextBinding = require('./text-binding');\n\
var debug = require('debug')('reactive');\n\
var bindings = require('./bindings');\n\
var Binding = require('./binding');\n\
var utils = require('./utils');\n\
var query = require('query');\n\
\n\
/**\n\
 * Expose `Reactive`.\n\
 */\n\
\n\
exports = module.exports = Reactive;\n\
\n\
/**\n\
 * Bindings.\n\
 */\n\
\n\
exports.bindings = {};\n\
\n\
/**\n\
 * Define subscription function.\n\
 *\n\
 * @param {Function} fn\n\
 * @api public\n\
 */\n\
\n\
exports.subscribe = function(fn){\n\
  adapter.subscribe = fn;\n\
};\n\
\n\
/**\n\
 * Define unsubscribe function.\n\
 *\n\
 * @param {Function} fn\n\
 * @api public\n\
 */\n\
\n\
exports.unsubscribe = function(fn){\n\
  adapter.unsubscribe = fn;\n\
};\n\
\n\
/**\n\
 * Define a get function.\n\
 *\n\
 * @param {Function} fn\n\
 * @api public\n\
 */\n\
\n\
exports.get = function(fn) {\n\
  adapter.get = fn;\n\
};\n\
\n\
/**\n\
 * Define a set function.\n\
 *\n\
 * @param {Function} fn\n\
 * @api public\n\
 */\n\
\n\
exports.set = function(fn) {\n\
  adapter.set = fn;\n\
};\n\
\n\
/**\n\
 * Expose adapter\n\
 */\n\
\n\
exports.adapter = adapter;\n\
\n\
/**\n\
 * Define binding `name` with callback `fn(el, val)`.\n\
 *\n\
 * @param {String} name or object\n\
 * @param {String|Object} name\n\
 * @param {Function} fn\n\
 * @api public\n\
 */\n\
\n\
exports.bind = function(name, fn){\n\
  if ('object' == typeof name) {\n\
    for (var key in name) {\n\
      exports.bind(key, name[key]);\n\
    }\n\
    return;\n\
  }\n\
\n\
  exports.bindings[name] = fn;\n\
};\n\
\n\
/**\n\
 * Initialize a reactive template for `el` and `obj`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {Element} obj\n\
 * @param {Object} options\n\
 * @api public\n\
 */\n\
\n\
function Reactive(el, obj, options) {\n\
  if (!(this instanceof Reactive)) return new Reactive(el, obj, options);\n\
  this.el = el;\n\
  this.obj = obj;\n\
  this.els = [];\n\
  this.fns = options || {}; // TODO: rename, this is awful\n\
  this.bindAll();\n\
  this.bindInterpolation(this.el, []);\n\
}\n\
\n\
/**\n\
 * Subscribe to changes on `prop`.\n\
 *\n\
 * @param {String} prop\n\
 * @param {Function} fn\n\
 * @return {Reactive}\n\
 * @api private\n\
 */\n\
\n\
Reactive.prototype.sub = function(prop, fn){\n\
  adapter.subscribe(this.obj, prop, fn);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Unsubscribe to changes from `prop`.\n\
 *\n\
 * @param {String} prop\n\
 * @param {Function} fn\n\
 * @return {Reactive}\n\
 * @api private\n\
 */\n\
\n\
Reactive.prototype.unsub = function(prop, fn){\n\
  adapter.unsubscribe(this.obj, prop, fn);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Get a `prop`\n\
 *\n\
 * @param {String} prop\n\
 * @param {Mixed} val\n\
 * @return {Mixed}\n\
 * @api private\n\
 */\n\
\n\
Reactive.prototype.get = function(prop) {\n\
  return adapter.get(this.obj, prop);\n\
};\n\
\n\
/**\n\
 * Set a `prop`\n\
 *\n\
 * @param {String} prop\n\
 * @param {Mixed} val\n\
 * @return {Reactive}\n\
 * @api private\n\
 */\n\
\n\
Reactive.prototype.set = function(prop, val) {\n\
  adapter.set(this.obj, prop, val);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Traverse and bind all interpolation within attributes and text.\n\
 *\n\
 * @param {Element} el\n\
 * @api private\n\
 */\n\
\n\
Reactive.prototype.bindInterpolation = function(el, els){\n\
\n\
  // element\n\
  if (el.nodeType == 1) {\n\
    for (var i = 0; i < el.attributes.length; i++) {\n\
      var attr = el.attributes[i];\n\
      if (utils.hasInterpolation(attr.value)) {\n\
        new AttrBinding(this, el, attr);\n\
      }\n\
    }\n\
  }\n\
\n\
  // text node\n\
  if (el.nodeType == 3) {\n\
    if (utils.hasInterpolation(el.data)) {\n\
      debug('bind text \"%s\"', el.data);\n\
      new TextBinding(this, el);\n\
    }\n\
  }\n\
\n\
  // walk nodes\n\
  for (var i = 0; i < el.childNodes.length; i++) {\n\
    var node = el.childNodes[i];\n\
    this.bindInterpolation(node, els);\n\
  }\n\
};\n\
\n\
/**\n\
 * Apply all bindings.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
Reactive.prototype.bindAll = function() {\n\
  for (var name in exports.bindings) {\n\
    this.bind(name, exports.bindings[name]);\n\
  }\n\
};\n\
\n\
/**\n\
 * Bind `name` to `fn`.\n\
 *\n\
 * @param {String|Object} name or object\n\
 * @param {Function} fn\n\
 * @api public\n\
 */\n\
\n\
Reactive.prototype.bind = function(name, fn) {\n\
  if ('object' == typeof name) {\n\
    for (var key in name) {\n\
      this.bind(key, name[key]);\n\
    }\n\
    return;\n\
  }\n\
\n\
  var els = query.all('[' + name + ']', this.el);\n\
  if (this.el.hasAttribute && this.el.hasAttribute(name)) {\n\
    els = [].slice.call(els);\n\
    els.unshift(this.el);\n\
  }\n\
  if (!els.length) return;\n\
\n\
  debug('bind [%s] (%d elements)', name, els.length);\n\
  for (var i = 0; i < els.length; i++) {\n\
    var binding = new Binding(name, this, els[i], fn);\n\
    binding.bind();\n\
  }\n\
};\n\
\n\
// bundled bindings\n\
\n\
bindings(exports.bind);\n\
//@ sourceURL=ianstormtaylor-reactive/lib/index.js"
));
require.register("ianstormtaylor-reactive/lib/utils.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var debug = require('debug')('reactive:utils');\n\
var props = require('props');\n\
var adapter = require('./adapter');\n\
\n\
/**\n\
 * Function cache.\n\
 */\n\
\n\
var cache = {};\n\
\n\
/**\n\
 * Return interpolation property names in `str`,\n\
 * for example \"{foo} and {bar}\" would return\n\
 * ['foo', 'bar'].\n\
 *\n\
 * @param {String} str\n\
 * @return {Array}\n\
 * @api private\n\
 */\n\
\n\
exports.interpolationProps = function(str) {\n\
  var m;\n\
  var arr = [];\n\
  var re = /\\{([^}]+)\\}/g;\n\
\n\
  while (m = re.exec(str)) {\n\
    var expr = m[1];\n\
    arr = arr.concat(props(expr));\n\
  }\n\
\n\
  return unique(arr);\n\
};\n\
\n\
/**\n\
 * Interpolate `str` with the given `fn`.\n\
 *\n\
 * @param {String} str\n\
 * @param {Function} fn\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
exports.interpolate = function(str, fn){\n\
  return str.replace(/\\{([^}]+)\\}/g, function(_, expr){\n\
    var cb = cache[expr];\n\
    if (!cb) cb = cache[expr] = compile(expr);\n\
    return fn(expr.trim(), cb);\n\
  });\n\
};\n\
\n\
/**\n\
 * Check if `str` has interpolation.\n\
 *\n\
 * @param {String} str\n\
 * @return {Boolean}\n\
 * @api private\n\
 */\n\
\n\
exports.hasInterpolation = function(str) {\n\
  return ~str.indexOf('{');\n\
};\n\
\n\
/**\n\
 * Remove computed properties notation from `str`.\n\
 *\n\
 * @param {String} str\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
exports.clean = function(str) {\n\
  return str.split('<')[0].trim();\n\
};\n\
\n\
/**\n\
 * Call `prop` on `model` or `view`.\n\
 *\n\
 * @param {Object} model\n\
 * @param {Object} view\n\
 * @param {String} prop\n\
 * @return {Mixed}\n\
 * @api private\n\
 */\n\
\n\
exports.call = function(model, view, prop){\n\
  // view method\n\
  if ('function' == typeof view[prop]) {\n\
    return view[prop]();\n\
  }\n\
\n\
  // view value\n\
  if (view.hasOwnProperty(prop)) {\n\
    return view[prop];\n\
  }\n\
\n\
  // get property from model\n\
  return adapter.get(model, prop);\n\
};\n\
\n\
/**\n\
 * Compile `expr` to a `Function`.\n\
 *\n\
 * @param {String} expr\n\
 * @return {Function}\n\
 * @api private\n\
 */\n\
\n\
function compile(expr) {\n\
  // TODO: use props() callback instead\n\
  var re = /\\.\\w+|\\w+ *\\(|\"[^\"]*\"|'[^']*'|\\/([^/]+)\\/|[a-zA-Z_]\\w*/g;\n\
  var p = props(expr);\n\
\n\
  var body = expr.replace(re, function(_) {\n\
    if ('(' == _[_.length - 1]) return access(_);\n\
    if (!~p.indexOf(_)) return _;\n\
    return call(_);\n\
  });\n\
\n\
  debug('compile `%s`', body);\n\
  return new Function('model', 'view', 'call', 'return ' + body);\n\
}\n\
\n\
/**\n\
 * Access a method `prop` with dot notation.\n\
 *\n\
 * @param {String} prop\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
function access(prop) {\n\
  return 'model.' + prop;\n\
}\n\
\n\
/**\n\
 * Call `prop` on view, model, or access the model's property.\n\
 *\n\
 * @param {String} prop\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
function call(prop) {\n\
  return 'call(model, view, \"' + prop + '\")';\n\
}\n\
\n\
/**\n\
 * Return unique array.\n\
 *\n\
 * @param {Array} arr\n\
 * @return {Array}\n\
 * @api private\n\
 */\n\
\n\
function unique(arr) {\n\
  var ret = [];\n\
\n\
  for (var i = 0; i < arr.length; i++) {\n\
    if (~ret.indexOf(arr[i])) continue;\n\
    ret.push(arr[i]);\n\
  }\n\
\n\
  return ret;\n\
}\n\
//@ sourceURL=ianstormtaylor-reactive/lib/utils.js"
));
require.register("ianstormtaylor-reactive/lib/text-binding.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var debug = require('debug')('reactive:text-binding');\n\
var utils = require('./utils');\n\
\n\
/**\n\
 * Expose `TextBinding`.\n\
 */\n\
\n\
module.exports = TextBinding;\n\
\n\
/**\n\
 * Initialize a new text binding.\n\
 *\n\
 * @param {Reactive} view\n\
 * @param {Element} node\n\
 * @param {Attribute} attr\n\
 * @api private\n\
 */\n\
\n\
function TextBinding(view, node) {\n\
  var self = this;\n\
  this.view = view;\n\
  this.text = node.data;\n\
  this.node = node;\n\
  this.props = utils.interpolationProps(this.text);\n\
  this.subscribe();\n\
  this.render();\n\
}\n\
\n\
/**\n\
 * Subscribe to changes.\n\
 */\n\
\n\
TextBinding.prototype.subscribe = function(){\n\
  var self = this;\n\
  var view = this.view;\n\
  this.props.forEach(function(prop){\n\
    view.sub(prop, function(){\n\
      self.render();\n\
    });\n\
  });\n\
};\n\
\n\
/**\n\
 * Render text.\n\
 */\n\
\n\
TextBinding.prototype.render = function(){\n\
  var node = this.node;\n\
  var text = this.text;\n\
  var view = this.view;\n\
  var obj = view.obj;\n\
\n\
  // TODO: delegate most of this to `Reactive`\n\
  debug('render \"%s\"', text);\n\
  node.data = utils.interpolate(text, function(prop, fn){\n\
    if (fn) {\n\
      return fn(obj, view.fns, utils.call);\n\
    } else {\n\
      return view.get(obj, prop);\n\
    }\n\
  });\n\
};\n\
//@ sourceURL=ianstormtaylor-reactive/lib/text-binding.js"
));
require.register("ianstormtaylor-reactive/lib/attr-binding.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var debug = require('debug')('reactive:attr-binding');\n\
var utils = require('./utils');\n\
\n\
/**\n\
 * Expose `AttrBinding`.\n\
 */\n\
\n\
module.exports = AttrBinding;\n\
\n\
/**\n\
 * Initialize a new attribute binding.\n\
 *\n\
 * @param {Reactive} view\n\
 * @param {Element} node\n\
 * @param {Attribute} attr\n\
 * @api private\n\
 */\n\
\n\
function AttrBinding(view, node, attr) {\n\
  var self = this;\n\
  this.view = view;\n\
  this.node = node;\n\
  this.attr = attr;\n\
  this.text = attr.value;\n\
  this.props = utils.interpolationProps(this.text);\n\
  this.subscribe();\n\
  this.render();\n\
}\n\
\n\
/**\n\
 * Subscribe to changes.\n\
 */\n\
\n\
AttrBinding.prototype.subscribe = function(){\n\
  var self = this;\n\
  var view = this.view;\n\
  this.props.forEach(function(prop){\n\
    view.sub(prop, function(){\n\
      self.render();\n\
    });\n\
  });\n\
};\n\
\n\
/**\n\
 * Render the value.\n\
 */\n\
\n\
AttrBinding.prototype.render = function(){\n\
  var attr = this.attr;\n\
  var text = this.text;\n\
  var view = this.view;\n\
  var obj = view.obj;\n\
\n\
  // TODO: delegate most of this to `Reactive`\n\
  debug('render %s \"%s\"', attr.name, text);\n\
  attr.value = utils.interpolate(text, function(prop, fn){\n\
    if (fn) {\n\
      return fn(obj, view.fns, utils.call);\n\
    } else {\n\
      return view.get(obj, prop);\n\
    }\n\
  });\n\
};\n\
//@ sourceURL=ianstormtaylor-reactive/lib/attr-binding.js"
));
require.register("ianstormtaylor-reactive/lib/binding.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var parse = require('format-parser');\n\
\n\
/**\n\
 * Expose `Binding`.\n\
 */\n\
\n\
module.exports = Binding;\n\
\n\
/**\n\
 * Initialize a binding.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
function Binding(name, view, el, fn) {\n\
  this.name = name;\n\
  this.view = view;\n\
  this.obj = view.obj;\n\
  this.fns = view.fns;\n\
  this.el = el;\n\
  this.fn = fn;\n\
}\n\
\n\
/**\n\
 * Apply the binding.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
Binding.prototype.bind = function() {\n\
  var val = this.el.getAttribute(this.name);\n\
  this.fn(this.el, val, this.obj);\n\
};\n\
\n\
/**\n\
 * Perform interpolation on `name`.\n\
 *\n\
 * @param {String} name\n\
 * @return {String}\n\
 * @api public\n\
 */\n\
\n\
Binding.prototype.interpolate = function(name) {\n\
  var self = this;\n\
  name = clean(name);\n\
\n\
  if (~name.indexOf('{')) {\n\
    return name.replace(/{([^}]+)}/g, function(_, name){\n\
      return self.value(name);\n\
    });\n\
  }\n\
\n\
  return this.formatted(name);\n\
};\n\
\n\
/**\n\
 * Return value for property `name`.\n\
 *\n\
 *  - check if the \"view\" has a `name` method\n\
 *  - check if the \"model\" has a `name` method\n\
 *  - check if the \"model\" has a `name` property\n\
 *\n\
 * @param {String} name\n\
 * @return {Mixed}\n\
 * @api public\n\
 */\n\
\n\
Binding.prototype.value = function(name) {\n\
  var self = this;\n\
  var obj = this.obj;\n\
  var view = this.view;\n\
  var fns = view.fns;\n\
  name = clean(name);\n\
\n\
  // view method\n\
  if ('function' == typeof fns[name]) {\n\
    return fns[name]();\n\
  }\n\
\n\
  // view value\n\
  if (fns.hasOwnProperty(name)) {\n\
    return fns[name];\n\
  }\n\
\n\
  return view.get(name);\n\
};\n\
\n\
/**\n\
 * Return formatted property.\n\
 *\n\
 * @param {String} fmt\n\
 * @return {Mixed}\n\
 * @api public\n\
 */\n\
\n\
Binding.prototype.formatted = function(fmt) {\n\
  var calls = parse(clean(fmt));\n\
  var name = calls[0].name;\n\
  var val = this.value(name);\n\
\n\
  for (var i = 1; i < calls.length; ++i) {\n\
    var call = calls[i];\n\
    call.args.unshift(val);\n\
    var fn = this.fns[call.name];\n\
    val = fn.apply(this.fns, call.args);\n\
  }\n\
\n\
  return val;\n\
};\n\
\n\
/**\n\
 * Invoke `fn` on changes.\n\
 *\n\
 * @param {Function} fn\n\
 * @api public\n\
 */\n\
\n\
Binding.prototype.change = function(fn) {\n\
  fn.call(this);\n\
\n\
  var self = this;\n\
  var view = this.view;\n\
  var val = this.el.getAttribute(this.name);\n\
\n\
  // computed props\n\
  var parts = val.split('<');\n\
  val = parts[0];\n\
  var computed = parts[1];\n\
  if (computed) computed = computed.trim().split(/\\s+/);\n\
\n\
  // interpolation\n\
  if (hasInterpolation(val)) {\n\
    var props = interpolationProps(val);\n\
    props.forEach(function(prop){\n\
      view.sub(prop, fn.bind(self));\n\
    });\n\
    return;\n\
  }\n\
\n\
  // formatting\n\
  var calls = parse(val);\n\
  var prop = calls[0].name;\n\
\n\
  // computed props\n\
  if (computed) {\n\
    computed.forEach(function(prop){\n\
      view.sub(prop, fn.bind(self));\n\
    });\n\
    return;\n\
  }\n\
\n\
  // bind to prop\n\
  view.sub(prop, fn.bind(this));\n\
};\n\
\n\
/**\n\
 * Return interpolation property names in `str`,\n\
 * for example \"{foo} and {bar}\" would return\n\
 * ['foo', 'bar'].\n\
 *\n\
 * @param {String} str\n\
 * @return {Array}\n\
 * @api private\n\
 */\n\
\n\
function interpolationProps(str) {\n\
  var m;\n\
  var arr = [];\n\
  var re = /\\{([^}]+)\\}/g;\n\
  while (m = re.exec(str)) {\n\
    arr.push(m[1]);\n\
  }\n\
  return arr;\n\
}\n\
\n\
/**\n\
 * Check if `str` has interpolation.\n\
 *\n\
 * @param {String} str\n\
 * @return {Boolean}\n\
 * @api private\n\
 */\n\
\n\
function hasInterpolation(str) {\n\
  return ~str.indexOf('{');\n\
}\n\
\n\
/**\n\
 * Remove computed properties notation from `str`.\n\
 *\n\
 * @param {String} str\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
function clean(str) {\n\
  return str.split('<')[0].trim();\n\
}\n\
//@ sourceURL=ianstormtaylor-reactive/lib/binding.js"
));
require.register("ianstormtaylor-reactive/lib/bindings.js", Function("exports, require, module",
"/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var classes = require('classes');\n\
var event = require('event');\n\
\n\
/**\n\
 * Attributes supported.\n\
 */\n\
\n\
var attrs = [\n\
  'id',\n\
  'src',\n\
  'rel',\n\
  'cols',\n\
  'rows',\n\
  'name',\n\
  'href',\n\
  'title',\n\
  'class',\n\
  'style',\n\
  'width',\n\
  'value',\n\
  'height',\n\
  'tabindex',\n\
  'placeholder'\n\
];\n\
\n\
/**\n\
 * Events supported.\n\
 */\n\
\n\
var events = [\n\
  'change',\n\
  'click',\n\
  'dblclick',\n\
  'mousedown',\n\
  'mouseup',\n\
  'blur',\n\
  'focus',\n\
  'input',\n\
  'keydown',\n\
  'keypress',\n\
  'keyup'\n\
];\n\
\n\
/**\n\
 * Apply bindings.\n\
 */\n\
\n\
module.exports = function(bind){\n\
\n\
  /**\n\
   * Generate attribute bindings.\n\
   */\n\
\n\
  attrs.forEach(function(attr){\n\
    bind('data-' + attr, function(el, name, obj){\n\
      this.change(function(){\n\
        el.setAttribute(attr, this.interpolate(name));\n\
      });\n\
    });\n\
  });\n\
\n\
  /**\n\
   * Show binding.\n\
   */\n\
\n\
  bind('data-show', function(el, name){\n\
    this.change(function(){\n\
      if (this.value(name)) {\n\
        classes(el).add('show').remove('hide');\n\
      } else {\n\
        classes(el).remove('show').add('hide');\n\
      }\n\
    });\n\
  });\n\
\n\
  /**\n\
   * Hide binding.\n\
   */\n\
\n\
  bind('data-hide', function(el, name){\n\
    this.change(function(){\n\
      if (this.value(name)) {\n\
        classes(el).remove('show').add('hide');\n\
      } else {\n\
        classes(el).add('show').remove('hide');\n\
      }\n\
    });\n\
  });\n\
\n\
  /**\n\
   * Checked binding.\n\
   */\n\
\n\
  bind('data-checked', function(el, name){\n\
    this.change(function(){\n\
      if (this.value(name)) {\n\
        el.setAttribute('checked', 'checked');\n\
      } else {\n\
        el.removeAttribute('checked');\n\
      }\n\
    });\n\
  });\n\
\n\
  /**\n\
   * Text binding.\n\
   */\n\
\n\
  bind('data-text', function(el, name){\n\
    this.change(function(){\n\
      el.textContent = this.interpolate(name);\n\
    });\n\
  });\n\
\n\
  /**\n\
   * HTML binding.\n\
   */\n\
\n\
  bind('data-html', function(el, name){\n\
    this.change(function(){\n\
      el.innerHTML = this.formatted(name);\n\
    });\n\
  });\n\
\n\
  /**\n\
   * Generate event bindings.\n\
   */\n\
\n\
  events.forEach(function(name){\n\
    bind('on-' + name, function(el, method){\n\
      var fns = this.view.fns;\n\
      event.bind(el, name, function(e){\n\
        var fn = fns[method];\n\
        if (!fn) throw new Error('method .' + method + '() missing');\n\
        fns[method](e);\n\
      });\n\
    });\n\
  });\n\
\n\
  /**\n\
   * Conditional binding.\n\
   */\n\
\n\
  bind('data-if', function(el, name){\n\
    var value = this.value(name);\n\
    if (!value) el.parentNode.removeChild(el);\n\
  });\n\
\n\
  /**\n\
   * Append child element.\n\
   */\n\
\n\
  bind('data-append', function(el, name){\n\
    var other = this.value(name);\n\
    el.appendChild(other);\n\
  });\n\
\n\
  /**\n\
   * Replace element, carrying over its attributes.\n\
   */\n\
\n\
  bind('data-replace', function(el, name){\n\
    var other = this.value(name);\n\
\n\
    // carryover attributes\n\
    for (var key in el.attributes) {\n\
      var attr = el.attributes[key];\n\
      if (!attr.specified || 'class' == attr.name) continue;\n\
      if (!other.hasAttribute(attr.name)) other.setAttribute(attr.name, attr.value);\n\
    }\n\
\n\
    // carryover classes\n\
    var arr = classes(el).array();\n\
    for (var i = 0; i < arr.length; i++) {\n\
      classes(other).add(arr[i]);\n\
    }\n\
\n\
    el.parentNode.replaceChild(other, el);\n\
  });\n\
\n\
};\n\
//@ sourceURL=ianstormtaylor-reactive/lib/bindings.js"
));
require.register("ianstormtaylor-reactive/lib/adapter.js", Function("exports, require, module",
"/**\n\
 * Default subscription method.\n\
 * Subscribe to changes on the model.\n\
 *\n\
 * @param {Object} obj\n\
 * @param {String} prop\n\
 * @param {Function} fn\n\
 */\n\
\n\
exports.subscribe = function(obj, prop, fn) {\n\
  if (!obj.on) return;\n\
  obj.on('change ' + prop, fn);\n\
};\n\
\n\
/**\n\
 * Default unsubscription method.\n\
 * Unsubscribe from changes on the model.\n\
 */\n\
\n\
exports.unsubscribe = function(obj, prop, fn) {\n\
  if (!obj.off) return;\n\
  obj.off('change ' + prop, fn);\n\
};\n\
\n\
/**\n\
 * Default setter method.\n\
 * Set a property on the model.\n\
 *\n\
 * @param {Object} obj\n\
 * @param {String} prop\n\
 * @param {Mixed} val\n\
 */\n\
\n\
exports.set = function(obj, prop, val) {\n\
  if ('function' == typeof obj[prop]) {\n\
    obj[prop](val);\n\
  } else {\n\
    obj[prop] = val;\n\
  }\n\
};\n\
\n\
/**\n\
 * Default getter method.\n\
 * Get a property from the model.\n\
 *\n\
 * @param {Object} obj\n\
 * @param {String} prop\n\
 * @return {Mixed}\n\
 */\n\
\n\
exports.get = function(obj, prop) {\n\
  if ('function' == typeof obj[prop]) {\n\
    return obj[prop]();\n\
  } else {\n\
    return obj[prop];\n\
  }\n\
};\n\
//@ sourceURL=ianstormtaylor-reactive/lib/adapter.js"
));
require.register("segmentio-mathjax/MathJax.js", Function("exports, require, module",
"/*************************************************************\n\
 *\n\
 *  MathJax.js\n\
 *\n\
 *  The main code for the MathJax math-typesetting library.  See\n\
 *  http://www.mathjax.org/ for details.\n\
 *\n\
 *  ---------------------------------------------------------------------\n\
 *\n\
 *  Copyright (c) 2009-2013 The MathJax Consortium\n\
 *\n\
 *  Licensed under the Apache License, Version 2.0 (the \"License\");\n\
 *  you may not use this file except in compliance with the License.\n\
 *  You may obtain a copy of the License at\n\
 *\n\
 *      http://www.apache.org/licenses/LICENSE-2.0\n\
 *\n\
 *  Unless required by applicable law or agreed to in writing, software\n\
 *  distributed under the License is distributed on an \"AS IS\" BASIS,\n\
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n\
 *  See the License for the specific language governing permissions and\n\
 *  limitations under the License.\n\
 */\n\
\n\
if (!window.MathJax) {window.MathJax = {}}\n\
\n\
MathJax.isPacked = true;\n\
\n\
if(document.getElementById&&document.childNodes&&document.createElement){if(!window.MathJax){window.MathJax={}}if(!MathJax.Hub){MathJax.version=\"2.2\";MathJax.fileversion=\"2.2\";(function(d){var b=window[d];if(!b){b=window[d]={}}var f=[];var c=function(g){var h=g.constructor;if(!h){h=new Function(\"\")}for(var i in g){if(i!==\"constructor\"&&g.hasOwnProperty(i)){h[i]=g[i]}}return h};var a=function(){return new Function(\"return arguments.callee.Init.call(this,arguments)\")};var e=a();e.prototype={bug_test:1};if(!e.prototype.bug_test){a=function(){return function(){return arguments.callee.Init.call(this,arguments)}}}b.Object=c({constructor:a(),Subclass:function(g,i){var h=a();h.SUPER=this;h.Init=this.Init;h.Subclass=this.Subclass;h.Augment=this.Augment;h.protoFunction=this.protoFunction;h.can=this.can;h.has=this.has;h.isa=this.isa;h.prototype=new this(f);h.prototype.constructor=h;h.Augment(g,i);return h},Init:function(g){var h=this;if(g.length===1&&g[0]===f){return h}if(!(h instanceof g.callee)){h=new g.callee(f)}return h.Init.apply(h,g)||h},Augment:function(g,h){var i;if(g!=null){for(i in g){if(g.hasOwnProperty(i)){this.protoFunction(i,g[i])}}if(g.toString!==this.prototype.toString&&g.toString!=={}.toString){this.protoFunction(\"toString\",g.toString)}}if(h!=null){for(i in h){if(h.hasOwnProperty(i)){this[i]=h[i]}}}return this},protoFunction:function(h,g){this.prototype[h]=g;if(typeof g===\"function\"){g.SUPER=this.SUPER.prototype}},prototype:{Init:function(){},SUPER:function(g){return g.callee.SUPER},can:function(g){return typeof(this[g])===\"function\"},has:function(g){return typeof(this[g])!==\"undefined\"},isa:function(g){return(g instanceof Object)&&(this instanceof g)}},can:function(g){return this.prototype.can.call(this,g)},has:function(g){return this.prototype.has.call(this,g)},isa:function(h){var g=this;while(g){if(g===h){return true}else{g=g.SUPER}}return false},SimpleSUPER:c({constructor:function(g){return this.SimpleSUPER.define(g)},define:function(g){var i={};if(g!=null){for(var h in g){if(g.hasOwnProperty(h)){i[h]=this.wrap(h,g[h])}}if(g.toString!==this.prototype.toString&&g.toString!=={}.toString){i.toString=this.wrap(\"toString\",g.toString)}}return i},wrap:function(i,h){if(typeof(h)===\"function\"&&h.toString().match(/\\.\\s*SUPER\\s*\\(/)){var g=new Function(this.wrapper);g.label=i;g.original=h;h=g;g.toString=this.stringify}return h},wrapper:function(){var h=arguments.callee;this.SUPER=h.SUPER[h.label];try{var g=h.original.apply(this,arguments)}catch(i){delete this.SUPER;throw i}delete this.SUPER;return g}.toString().replace(/^\\s*function\\s*\\(\\)\\s*\\{\\s*/i,\"\").replace(/\\s*\\}\\s*$/i,\"\"),toString:function(){return this.original.toString.apply(this.original,arguments)}})})})(\"MathJax\");(function(BASENAME){var BASE=window[BASENAME];if(!BASE){BASE=window[BASENAME]={}}var CALLBACK=function(data){var cb=new Function(\"return arguments.callee.execute.apply(arguments.callee,arguments)\");for(var id in CALLBACK.prototype){if(CALLBACK.prototype.hasOwnProperty(id)){if(typeof(data[id])!==\"undefined\"){cb[id]=data[id]}else{cb[id]=CALLBACK.prototype[id]}}}cb.toString=CALLBACK.prototype.toString;return cb};CALLBACK.prototype={isCallback:true,hook:function(){},data:[],object:window,execute:function(){if(!this.called||this.autoReset){this.called=!this.autoReset;return this.hook.apply(this.object,this.data.concat([].slice.call(arguments,0)))}},reset:function(){delete this.called},toString:function(){return this.hook.toString.apply(this.hook,arguments)}};var ISCALLBACK=function(f){return(typeof(f)===\"function\"&&f.isCallback)};var EVAL=function(code){return eval.call(window,code)};EVAL(\"var __TeSt_VaR__ = 1\");if(window.__TeSt_VaR__){try{delete window.__TeSt_VaR__}catch(error){window.__TeSt_VaR__=null}}else{if(window.execScript){EVAL=function(code){BASE.__code=code;code=\"try {\"+BASENAME+\".__result = eval(\"+BASENAME+\".__code)} catch(err) {\"+BASENAME+\".__result = err}\";window.execScript(code);var result=BASE.__result;delete BASE.__result;delete BASE.__code;if(result instanceof Error){throw result}return result}}else{EVAL=function(code){BASE.__code=code;code=\"try {\"+BASENAME+\".__result = eval(\"+BASENAME+\".__code)} catch(err) {\"+BASENAME+\".__result = err}\";var head=(document.getElementsByTagName(\"head\"))[0];if(!head){head=document.body}var script=document.createElement(\"script\");script.appendChild(document.createTextNode(code));head.appendChild(script);head.removeChild(script);var result=BASE.__result;delete BASE.__result;delete BASE.__code;if(result instanceof Error){throw result}return result}}}var USING=function(args,i){if(arguments.length>1){if(arguments.length===2&&!(typeof arguments[0]===\"function\")&&arguments[0] instanceof Object&&typeof arguments[1]===\"number\"){args=[].slice.call(args,i)}else{args=[].slice.call(arguments,0)}}if(args instanceof Array&&args.length===1){args=args[0]}if(typeof args===\"function\"){if(args.execute===CALLBACK.prototype.execute){return args}return CALLBACK({hook:args})}else{if(args instanceof Array){if(typeof(args[0])===\"string\"&&args[1] instanceof Object&&typeof args[1][args[0]]===\"function\"){return CALLBACK({hook:args[1][args[0]],object:args[1],data:args.slice(2)})}else{if(typeof args[0]===\"function\"){return CALLBACK({hook:args[0],data:args.slice(1)})}else{if(typeof args[1]===\"function\"){return CALLBACK({hook:args[1],object:args[0],data:args.slice(2)})}}}}else{if(typeof(args)===\"string\"){return CALLBACK({hook:EVAL,data:[args]})}else{if(args instanceof Object){return CALLBACK(args)}else{if(typeof(args)===\"undefined\"){return CALLBACK({})}}}}}throw Error(\"Can't make callback from given data\")};var DELAY=function(time,callback){callback=USING(callback);callback.timeout=setTimeout(callback,time);return callback};var WAITFOR=function(callback,signal){callback=USING(callback);if(!callback.called){WAITSIGNAL(callback,signal);signal.pending++}};var WAITEXECUTE=function(){var signals=this.signal;delete this.signal;this.execute=this.oldExecute;delete this.oldExecute;var result=this.execute.apply(this,arguments);if(ISCALLBACK(result)&&!result.called){WAITSIGNAL(result,signals)}else{for(var i=0,m=signals.length;i<m;i++){signals[i].pending--;if(signals[i].pending<=0){signals[i].call()}}}};var WAITSIGNAL=function(callback,signals){if(!(signals instanceof Array)){signals=[signals]}if(!callback.signal){callback.oldExecute=callback.execute;callback.execute=WAITEXECUTE;callback.signal=signals}else{if(signals.length===1){callback.signal.push(signals[0])}else{callback.signal=callback.signal.concat(signals)}}};var AFTER=function(callback){callback=USING(callback);callback.pending=0;for(var i=1,m=arguments.length;i<m;i++){if(arguments[i]){WAITFOR(arguments[i],callback)}}if(callback.pending===0){var result=callback();if(ISCALLBACK(result)){callback=result}}return callback};var HOOKS=MathJax.Object.Subclass({Init:function(reset){this.hooks=[];this.reset=reset},Add:function(hook,priority){if(priority==null){priority=10}if(!ISCALLBACK(hook)){hook=USING(hook)}hook.priority=priority;var i=this.hooks.length;while(i>0&&priority<this.hooks[i-1].priority){i--}this.hooks.splice(i,0,hook);return hook},Remove:function(hook){for(var i=0,m=this.hooks.length;i<m;i++){if(this.hooks[i]===hook){this.hooks.splice(i,1);return}}},Execute:function(){var callbacks=[{}];for(var i=0,m=this.hooks.length;i<m;i++){if(this.reset){this.hooks[i].reset()}var result=this.hooks[i].apply(window,arguments);if(ISCALLBACK(result)&&!result.called){callbacks.push(result)}}if(callbacks.length===1){return null}if(callbacks.length===2){return callbacks[1]}return AFTER.apply({},callbacks)}});var EXECUTEHOOKS=function(hooks,data,reset){if(!hooks){return null}if(!(hooks instanceof Array)){hooks=[hooks]}if(!(data instanceof Array)){data=(data==null?[]:[data])}var handler=HOOKS(reset);for(var i=0,m=hooks.length;i<m;i++){handler.Add(hooks[i])}return handler.Execute.apply(handler,data)};var QUEUE=BASE.Object.Subclass({Init:function(){this.pending=0;this.running=0;this.queue=[];this.Push.apply(this,arguments)},Push:function(){var callback;for(var i=0,m=arguments.length;i<m;i++){callback=USING(arguments[i]);if(callback===arguments[i]&&!callback.called){callback=USING([\"wait\",this,callback])}this.queue.push(callback)}if(!this.running&&!this.pending){this.Process()}return callback},Process:function(queue){while(!this.running&&!this.pending&&this.queue.length){var callback=this.queue[0];queue=this.queue.slice(1);this.queue=[];this.Suspend();var result=callback();this.Resume();if(queue.length){this.queue=queue.concat(this.queue)}if(ISCALLBACK(result)&&!result.called){WAITFOR(result,this)}}},Suspend:function(){this.running++},Resume:function(){if(this.running){this.running--}},call:function(){this.Process.apply(this,arguments)},wait:function(callback){return callback}});var SIGNAL=QUEUE.Subclass({Init:function(name){QUEUE.prototype.Init.call(this);this.name=name;this.posted=[];this.listeners=HOOKS(true)},Post:function(message,callback,forget){callback=USING(callback);if(this.posting||this.pending){this.Push([\"Post\",this,message,callback,forget])}else{this.callback=callback;callback.reset();if(!forget){this.posted.push(message)}this.Suspend();this.posting=true;var result=this.listeners.Execute(message);if(ISCALLBACK(result)&&!result.called){WAITFOR(result,this)}this.Resume();delete this.posting;if(!this.pending){this.call()}}return callback},Clear:function(callback){callback=USING(callback);if(this.posting||this.pending){callback=this.Push([\"Clear\",this,callback])}else{this.posted=[];callback()}return callback},call:function(){this.callback(this);this.Process()},Interest:function(callback,ignorePast,priority){callback=USING(callback);this.listeners.Add(callback,priority);if(!ignorePast){for(var i=0,m=this.posted.length;i<m;i++){callback.reset();var result=callback(this.posted[i]);if(ISCALLBACK(result)&&i===this.posted.length-1){WAITFOR(result,this)}}}return callback},NoInterest:function(callback){this.listeners.Remove(callback)},MessageHook:function(msg,callback,priority){callback=USING(callback);if(!this.hooks){this.hooks={};this.Interest([\"ExecuteHooks\",this])}if(!this.hooks[msg]){this.hooks[msg]=HOOKS(true)}this.hooks[msg].Add(callback,priority);for(var i=0,m=this.posted.length;i<m;i++){if(this.posted[i]==msg){callback.reset();callback(this.posted[i])}}return callback},ExecuteHooks:function(msg,more){var type=((msg instanceof Array)?msg[0]:msg);if(!this.hooks[type]){return null}return this.hooks[type].Execute(msg)}},{signals:{},find:function(name){if(!SIGNAL.signals[name]){SIGNAL.signals[name]=new SIGNAL(name)}return SIGNAL.signals[name]}});BASE.Callback=BASE.CallBack=USING;BASE.Callback.Delay=DELAY;BASE.Callback.After=AFTER;BASE.Callback.Queue=QUEUE;BASE.Callback.Signal=SIGNAL.find;BASE.Callback.Hooks=HOOKS;BASE.Callback.ExecuteHooks=EXECUTEHOOKS})(\"MathJax\");(function(d){var a=window[d];if(!a){a=window[d]={}}var c=(navigator.vendor===\"Apple Computer, Inc.\"&&typeof navigator.vendorSub===\"undefined\");var f=0;var g=function(h){if(document.styleSheets&&document.styleSheets.length>f){f=document.styleSheets.length}if(!h){h=(document.getElementsByTagName(\"head\"))[0];if(!h){h=document.body}}return h};var e=[];var b=function(){for(var j=0,h=e.length;j<h;j++){a.Ajax.head.removeChild(e[j])}e=[]};a.Ajax={loaded:{},loading:{},loadHooks:{},timeout:15*1000,styleDelay:1,config:{root:\"\"},STATUS:{OK:1,ERROR:-1},rootPattern:new RegExp(\"^\\\\[\"+d+\"\\\\]\"),fileURL:function(h){return h.replace(this.rootPattern,this.config.root)},Require:function(j,m){m=a.Callback(m);var k;if(j instanceof Object){for(var h in j){if(j.hasOwnProperty(h)){k=h.toUpperCase();j=j[h]}}}else{k=j.split(/\\./).pop().toUpperCase()}j=this.fileURL(j);if(this.loaded[j]){m(this.loaded[j])}else{var l={};l[k]=j;this.Load(l,m)}return m},Load:function(j,l){l=a.Callback(l);var k;if(j instanceof Object){for(var h in j){if(j.hasOwnProperty(h)){k=h.toUpperCase();j=j[h]}}}else{k=j.split(/\\./).pop().toUpperCase()}j=this.fileURL(j);if(this.loading[j]){this.addHook(j,l)}else{this.head=g(this.head);if(this.loader[k]){this.loader[k].call(this,j,l)}else{throw Error(\"Can't load files of type \"+k)}}return l},LoadHook:function(k,l,j){l=a.Callback(l);if(k instanceof Object){for(var h in k){if(k.hasOwnProperty(h)){k=k[h]}}}k=this.fileURL(k);if(this.loaded[k]){l(this.loaded[k])}else{this.addHook(k,l,j)}return l},addHook:function(i,j,h){if(!this.loadHooks[i]){this.loadHooks[i]=MathJax.Callback.Hooks()}this.loadHooks[i].Add(j,h)},Preloading:function(){for(var k=0,h=arguments.length;k<h;k++){var j=this.fileURL(arguments[k]);if(!this.loading[j]){this.loading[j]={preloaded:true}}}},loader:{JS:function(i,k){var h=document.createElement(\"script\");var j=a.Callback([\"loadTimeout\",this,i]);this.loading[i]={callback:k,timeout:setTimeout(j,this.timeout),status:this.STATUS.OK,script:h};this.loading[i].message=a.Message.File(i);h.onerror=j;h.type=\"text/javascript\";h.src=i;this.head.appendChild(h)},CSS:function(h,j){var i=document.createElement(\"link\");i.rel=\"stylesheet\";i.type=\"text/css\";i.href=h;this.loading[h]={callback:j,message:a.Message.File(h),status:this.STATUS.OK};this.head.appendChild(i);this.timer.create.call(this,[this.timer.file,h],i)}},timer:{create:function(i,h){i=a.Callback(i);if(h.nodeName===\"STYLE\"&&h.styleSheet&&typeof(h.styleSheet.cssText)!==\"undefined\"){i(this.STATUS.OK)}else{if(window.chrome&&typeof(window.sessionStorage)!==\"undefined\"&&h.nodeName===\"STYLE\"){i(this.STATUS.OK)}else{if(c){this.timer.start(this,[this.timer.checkSafari2,f++,i],this.styleDelay)}else{this.timer.start(this,[this.timer.checkLength,h,i],this.styleDelay)}}}return i},start:function(i,h,j,k){h=a.Callback(h);h.execute=this.execute;h.time=this.time;h.STATUS=i.STATUS;h.timeout=k||i.timeout;h.delay=h.total=0;if(j){setTimeout(h,j)}else{h()}},time:function(h){this.total+=this.delay;this.delay=Math.floor(this.delay*1.05+5);if(this.total>=this.timeout){h(this.STATUS.ERROR);return 1}return 0},file:function(i,h){if(h<0){a.Ajax.loadTimeout(i)}else{a.Ajax.loadComplete(i)}},execute:function(){this.hook.call(this.object,this,this.data[0],this.data[1])},checkSafari2:function(h,i,j){if(h.time(j)){return}if(document.styleSheets.length>i&&document.styleSheets[i].cssRules&&document.styleSheets[i].cssRules.length){j(h.STATUS.OK)}else{setTimeout(h,h.delay)}},checkLength:function(h,k,m){if(h.time(m)){return}var l=0;var i=(k.sheet||k.styleSheet);try{if((i.cssRules||i.rules||[]).length>0){l=1}}catch(j){if(j.message.match(/protected variable|restricted URI/)){l=1}else{if(j.message.match(/Security error/)){l=1}}}if(l){setTimeout(a.Callback([m,h.STATUS.OK]),0)}else{setTimeout(h,h.delay)}}},loadComplete:function(h){h=this.fileURL(h);var i=this.loading[h];if(i&&!i.preloaded){a.Message.Clear(i.message);clearTimeout(i.timeout);if(i.script){if(e.length===0){setTimeout(b,0)}e.push(i.script)}this.loaded[h]=i.status;delete this.loading[h];this.addHook(h,i.callback)}else{if(i){delete this.loading[h]}this.loaded[h]=this.STATUS.OK;i={status:this.STATUS.OK}}if(!this.loadHooks[h]){return null}return this.loadHooks[h].Execute(i.status)},loadTimeout:function(h){if(this.loading[h].timeout){clearTimeout(this.loading[h].timeout)}this.loading[h].status=this.STATUS.ERROR;this.loadError(h);this.loadComplete(h)},loadError:function(h){a.Message.Set([\"LoadFailed\",\"File failed to load: %1\",h],null,2000);a.Hub.signal.Post([\"file load error\",h])},Styles:function(j,k){var h=this.StyleString(j);if(h===\"\"){k=a.Callback(k);k()}else{var i=document.createElement(\"style\");i.type=\"text/css\";this.head=g(this.head);this.head.appendChild(i);if(i.styleSheet&&typeof(i.styleSheet.cssText)!==\"undefined\"){i.styleSheet.cssText=h}else{i.appendChild(document.createTextNode(h))}k=this.timer.create.call(this,k,i)}return k},StyleString:function(m){if(typeof(m)===\"string\"){return m}var j=\"\",n,l;for(n in m){if(m.hasOwnProperty(n)){if(typeof m[n]===\"string\"){j+=n+\" {\"+m[n]+\"}\\n\
\"}else{if(m[n] instanceof Array){for(var k=0;k<m[n].length;k++){l={};l[n]=m[n][k];j+=this.StyleString(l)}}else{if(n.substr(0,6)===\"@media\"){j+=n+\" {\"+this.StyleString(m[n])+\"}\\n\
\"}else{if(m[n]!=null){l=[];for(var h in m[n]){if(m[n].hasOwnProperty(h)){if(m[n][h]!=null){l[l.length]=h+\": \"+m[n][h]}}}j+=n+\" {\"+l.join(\"; \")+\"}\\n\
\"}}}}}}return j}}})(\"MathJax\");MathJax.HTML={Element:function(c,e,d){var f=document.createElement(c);if(e){if(e.style){var b=e.style;e.style={};for(var g in b){if(b.hasOwnProperty(g)){e.style[g.replace(/-([a-z])/g,this.ucMatch)]=b[g]}}}MathJax.Hub.Insert(f,e)}if(d){if(!(d instanceof Array)){d=[d]}for(var a=0;a<d.length;a++){if(d[a] instanceof Array){f.appendChild(this.Element(d[a][0],d[a][1],d[a][2]))}else{if(c===\"script\"){this.setScript(f,d[a])}else{f.appendChild(document.createTextNode(d[a]))}}}}return f},ucMatch:function(a,b){return b.toUpperCase()},addElement:function(b,a,d,c){return b.appendChild(this.Element(a,d,c))},TextNode:function(a){return document.createTextNode(a)},addText:function(a,b){return a.appendChild(this.TextNode(b))},setScript:function(a,b){if(this.setScriptBug){a.text=b}else{while(a.firstChild){a.removeChild(a.firstChild)}this.addText(a,b)}},getScript:function(a){var b=(a.text===\"\"?a.innerHTML:a.text);return b.replace(/^\\s+/,\"\").replace(/\\s+$/,\"\")},Cookie:{prefix:\"mjx\",expires:365,Set:function(a,e){var d=[];if(e){for(var g in e){if(e.hasOwnProperty(g)){d.push(g+\":\"+e[g].toString().replace(/&/g,\"&&\"))}}}var b=this.prefix+\".\"+a+\"=\"+escape(d.join(\"&;\"));if(this.expires){var f=new Date();f.setDate(f.getDate()+this.expires);b+=\"; expires=\"+f.toGMTString()}try{document.cookie=b+\"; path=/\"}catch(c){}},Get:function(c,h){if(!h){h={}}var g=new RegExp(\"(?:^|;\\\\s*)\"+this.prefix+\"\\\\.\"+c+\"=([^;]*)(?:;|$)\");var b=g.exec(document.cookie);if(b&&b[1]!==\"\"){var e=unescape(b[1]).split(\"&;\");for(var d=0,a=e.length;d<a;d++){b=e[d].match(/([^:]+):(.*)/);var f=b[2].replace(/&&/g,\"&\");if(f===\"true\"){f=true}else{if(f===\"false\"){f=false}else{if(f.match(/^-?(\\d+(\\.\\d+)?|\\.\\d+)$/)){f=parseFloat(f)}}}h[b[1]]=f}}return h}}};MathJax.Localization={locale:\"en\",directory:\"[MathJax]/localization\",strings:{en:{menuTitle:\"English\",isLoaded:true},de:{menuTitle:\"Deutsch\"},fr:{menuTitle:\"Fran\\u00E7ais\"}},pattern:/%(\\d+|\\{\\d+\\}|\\{[a-z]+:\\%\\d+(?:\\|(?:%\\{\\d+\\}|%.|[^\\}])*)+\\}|.)/g,SPLIT:(\"axb\".split(/(x)/).length===3?function(a,b){return a.split(b)}:function(c,e){var a=[],b,d=0;e.lastIndex=0;while(b=e.exec(c)){a.push(c.substr(d,b.index));a.push.apply(a,b.slice(1));d=b.index+b[0].length}a.push(c.substr(d));return a}),_:function(b,a){if(a instanceof Array){return this.processSnippet(b,a)}return this.processString(this.lookupPhrase(b,a),[].slice.call(arguments,2))},processString:function(l,o,g){var j,e;for(j=0,e=o.length;j<e;j++){if(g&&o[j] instanceof Array){o[j]=this.processSnippet(g,o[j])}}var f=this.SPLIT(l,this.pattern);for(j=1,e=f.length;j<e;j+=2){var p=f[j].charAt(0);if(p>=\"0\"&&p<=\"9\"){f[j]=o[f[j]-1];if(typeof f[j]===\"number\"){f[j]=this.number(f[j])}}else{if(p===\"{\"){p=f[j].substr(1);if(p>=\"0\"&&p<=\"9\"){f[j]=o[f[j].substr(1,f[j].length-2)-1];if(typeof f[j]===\"number\"){f[j]=this.number(f[j])}}else{var k=f[j].match(/^\\{([a-z]+):%(\\d+)\\|(.*)\\}$/);if(k){if(k[1]===\"plural\"){var d=o[k[2]-1];if(typeof d===\"undefined\"){f[j]=\"???\"}else{d=this.plural(d)-1;var h=k[3].replace(/(^|[^%])(%%)*%\\|/g,\"$1$2%\\uEFEF\").split(/\\|/);if(d>=0&&d<h.length){f[j]=this.processString(h[d].replace(/\\uEFEF/g,\"|\"),o,g)}else{f[j]=\"???\"}}}else{f[j]=\"%\"+f[j]}}}}}if(f[j]==null){f[j]=\"???\"}}if(!g){return f.join(\"\")}var a=[],b=\"\";for(j=0;j<e;j++){b+=f[j];j++;if(j<e){if(f[j] instanceof Array){a.push(b);a=a.concat(f[j]);b=\"\"}else{b+=f[j]}}}if(b!==\"\"){a.push(b)}return a},processSnippet:function(g,e){var c=[];for(var d=0,b=e.length;d<b;d++){if(e[d] instanceof Array){var f=e[d];if(typeof f[1]===\"string\"){var h=f[0];if(!(h instanceof Array)){h=[g,h]}var a=this.lookupPhrase(h,f[1]);c=c.concat(this.processMarkdown(a,f.slice(2),g))}else{if(f[1] instanceof Array){c=c.concat(this.processSnippet.apply(this,f))}else{if(f.length>=3){c.push([f[0],f[1],this.processSnippet(g,f[2])])}else{c.push(e[d])}}}}else{c.push(e[d])}}return c},markdownPattern:/(%.)|(\\*{1,3})((?:%.|.)+?)\\2|(`+)((?:%.|.)+?)\\4|\\[((?:%.|.)+?)\\]\\(([^\\s\\)]+)\\)/,processMarkdown:function(b,h,d){var j=[],e;var c=b.split(this.markdownPattern);var g=c[0];for(var f=1,a=c.length;f<a;f+=8){if(c[f+1]){e=this.processString(c[f+2],h,d);if(!(e instanceof Array)){e=[e]}e=[[\"b\",\"i\",\"i\"][c[f+1].length-1],{},e];if(c[f+1].length===3){e=[\"b\",{},e]}}else{if(c[f+3]){e=this.processString(c[f+4].replace(/^\\s/,\"\").replace(/\\s$/,\"\"),h,d);if(!(e instanceof Array)){e=[e]}e=[\"code\",{},e]}else{if(c[f+5]){e=this.processString(c[f+5],h,d);if(!(e instanceof Array)){e=[e]}e=[\"a\",{href:this.processString(c[f+6],h),target:\"_blank\"},e]}else{g+=c[f];e=null}}}if(e){j=this.concatString(j,g,h,d);j.push(e);g=\"\"}if(c[f+7]!==\"\"){g+=c[f+7]}}j=this.concatString(j,g,h,d);return j},concatString:function(a,c,b,d){if(c!=\"\"){c=this.processString(c,b,d);if(!(c instanceof Array)){c=[c]}a=a.concat(c)}return a},lookupPhrase:function(f,a,d){if(!d){d=\"_\"}if(f instanceof Array){d=(f[0]||\"_\");f=(f[1]||\"\")}var c=this.loadDomain(d);if(c){MathJax.Hub.RestartAfter(c)}var b=this.strings[this.locale];if(b){if(b.domains&&d in b.domains){var e=b.domains[d];if(e.strings&&f in e.strings){a=e.strings[f]}}}return a},loadFile:function(b,d,e){e=MathJax.Callback(e||{});b=(d.file||b);if(!b.match(/\\.js$/)){b+=\".js\"}if(!b.match(/^([a-z]+:|\\[MathJax\\])/)){var a=(this.strings[this.locale].directory||this.directory+\"/\"+this.locale||\"[MathJax]/localization/\"+this.locale);b=a+\"/\"+b}var c=MathJax.Ajax.Require(b,function(){d.isLoaded=true;return e()});return(c.called?null:c)},loadDomain:function(c,e){var b,a=this.strings[this.locale];if(a){if(!a.isLoaded){b=this.loadFile(this.locale,a);if(b){return MathJax.Callback.Queue(b,[\"loadDomain\",this,c]).Push(e)}}if(a.domains&&c in a.domains){var d=a.domains[c];if(!d.isLoaded){b=this.loadFile(c,d);if(b){return MathJax.Callback.Queue(b).Push(e)}}}}return MathJax.Callback(e)()},Try:function(a){a=MathJax.Callback(a);a.autoReset=true;try{a()}catch(b){if(!b.restart){throw b}MathJax.Callback.After([\"Try\",this,a],b.restart)}},setLocale:function(a){if(this.strings[a]){this.locale=a}if(MathJax.Menu){this.loadDomain(\"MathMenu\")}},addTranslation:function(b,e,c){var d=this.strings[b],a=false;if(!d){d=this.strings[b]={};a=true}if(!d.domains){d.domains={}}if(e){if(!d.domains[e]){d.domains[e]={}}d=d.domains[e]}MathJax.Hub.Insert(d,c);if(a&&MathJax.Menu.menu){MathJax.Menu.CreateLocaleMenu()}},setCSS:function(b){var a=this.strings[this.locale];if(a){if(a.fontFamily){b.style.fontFamily=a.fontFamily}if(a.fontDirection){b.style.direction=a.fontDirection;if(a.fontDirection===\"rtl\"){b.style.textAlign=\"right\"}}}return b},fontFamily:function(){var a=this.strings[this.locale];return(a?a.fontFamily:null)},fontDirection:function(){var a=this.strings[this.locale];return(a?a.fontDirection:null)},plural:function(b){var a=this.strings[this.locale];if(a&&a.plural){return a.plural(b)}if(b==1){return 1}return 2},number:function(b){var a=this.strings[this.locale];if(a&&a.number){return a.number(b)}return b}};MathJax.Message={ready:false,log:[{}],current:null,textNodeBug:(navigator.vendor===\"Apple Computer, Inc.\"&&typeof navigator.vendorSub===\"undefined\")||(window.hasOwnProperty&&window.hasOwnProperty(\"konqueror\")),styles:{\"#MathJax_Message\":{position:\"fixed\",left:\"1px\",bottom:\"2px\",\"background-color\":\"#E6E6E6\",border:\"1px solid #959595\",margin:\"0px\",padding:\"2px 8px\",\"z-index\":\"102\",color:\"black\",\"font-size\":\"80%\",width:\"auto\",\"white-space\":\"nowrap\"},\"#MathJax_MSIE_Frame\":{position:\"absolute\",top:0,left:0,width:\"0px\",\"z-index\":101,border:\"0px\",margin:\"0px\",padding:\"0px\"}},browsers:{MSIE:function(a){MathJax.Hub.config.styles[\"#MathJax_Message\"].position=\"absolute\";MathJax.Message.quirks=(document.compatMode===\"BackCompat\")},Chrome:function(a){MathJax.Hub.config.styles[\"#MathJax_Message\"].bottom=\"1.5em\";MathJax.Hub.config.styles[\"#MathJax_Message\"].left=\"1em\"}},Init:function(a){if(a){this.ready=true}if(!document.body||!this.ready){return false}if(this.div&&this.div.parentNode==null){this.div=document.getElementById(\"MathJax_Message\");if(this.div){this.text=this.div.firstChild}}if(!this.div){var b=document.body;if(MathJax.Hub.Browser.isMSIE){b=this.frame=this.addDiv(document.body);b.removeAttribute(\"id\");b.style.position=\"absolute\";b.style.border=b.style.margin=b.style.padding=\"0px\";b.style.zIndex=\"101\";b.style.height=\"0px\";b=this.addDiv(b);b.id=\"MathJax_MSIE_Frame\";window.attachEvent(\"onscroll\",this.MoveFrame);window.attachEvent(\"onresize\",this.MoveFrame);this.MoveFrame()}this.div=this.addDiv(b);this.div.style.display=\"none\";this.text=this.div.appendChild(document.createTextNode(\"\"))}return true},addDiv:function(a){var b=document.createElement(\"div\");b.id=\"MathJax_Message\";if(a.firstChild){a.insertBefore(b,a.firstChild)}else{a.appendChild(b)}return b},MoveFrame:function(){var a=(MathJax.Message.quirks?document.body:document.documentElement);var b=MathJax.Message.frame;b.style.left=a.scrollLeft+\"px\";b.style.top=a.scrollTop+\"px\";b.style.width=a.clientWidth+\"px\";b=b.firstChild;b.style.height=a.clientHeight+\"px\"},localize:function(a){return MathJax.Localization._(a,a)},filterText:function(a,c,b){if(MathJax.Hub.config.messageStyle===\"simple\"){if(b===\"LoadFile\"){if(!this.loading){this.loading=this.localize(\"Loading\")+\" \"}a=this.loading;this.loading+=\".\"}else{if(b===\"ProcessMath\"){if(!this.processing){this.processing=this.localize(\"Processing\")+\" \"}a=this.processing;this.processing+=\".\"}else{if(b===\"TypesetMath\"){if(!this.typesetting){this.typesetting=this.localize(\"Typesetting\")+\" \"}a=this.typesetting;this.typesetting+=\".\"}}}}return a},Set:function(c,e,b){if(e==null){e=this.log.length;this.log[e]={}}var d=\"\";if(c instanceof Array){d=c[0];if(d instanceof Array){d=d[1]}try{c=MathJax.Localization._.apply(MathJax.Localization,c)}catch(a){if(!a.restart){throw a}if(!a.restart.called){if(this.log[e].restarted==null){this.log[e].restarted=0}this.log[e].restarted++;delete this.log[e].cleared;MathJax.Callback.After([\"Set\",this,c,e,b],a.restart);return e}}}if(this.timer){clearTimeout(this.timer);delete this.timer}this.log[e].text=c;this.log[e].filteredText=c=this.filterText(c,e,d);if(typeof(this.log[e].next)===\"undefined\"){this.log[e].next=this.current;if(this.current!=null){this.log[this.current].prev=e}this.current=e}if(this.current===e&&MathJax.Hub.config.messageStyle!==\"none\"){if(this.Init()){if(this.textNodeBug){this.div.innerHTML=c}else{this.text.nodeValue=c}this.div.style.display=\"\";if(this.status){window.status=\"\";delete this.status}}else{window.status=c;this.status=true}}if(this.log[e].restarted){if(this.log[e].cleared){b=0}if(--this.log[e].restarted===0){delete this.log[e].cleared}}if(b){setTimeout(MathJax.Callback([\"Clear\",this,e]),b)}else{if(b==0){this.Clear(e,0)}}return e},Clear:function(b,a){if(this.log[b].prev!=null){this.log[this.log[b].prev].next=this.log[b].next}if(this.log[b].next!=null){this.log[this.log[b].next].prev=this.log[b].prev}if(this.current===b){this.current=this.log[b].next;if(this.text){if(this.div.parentNode==null){this.Init()}if(this.current==null){if(this.timer){clearTimeout(this.timer);delete this.timer}if(a==null){a=600}if(a===0){this.Remove()}else{this.timer=setTimeout(MathJax.Callback([\"Remove\",this]),a)}}else{if(MathJax.Hub.config.messageStyle!==\"none\"){if(this.textNodeBug){this.div.innerHTML=this.log[this.current].filteredText}else{this.text.nodeValue=this.log[this.current].filteredText}}}if(this.status){window.status=\"\";delete this.status}}else{if(this.status){window.status=(this.current==null?\"\":this.log[this.current].text)}}}delete this.log[b].next;delete this.log[b].prev;delete this.log[b].filteredText;if(this.log[b].restarted){this.log[b].cleared=true}},Remove:function(){this.text.nodeValue=\"\";this.div.style.display=\"none\"},File:function(b){var a=MathJax.Ajax.config.root;if(b.substr(0,a.length)===a){b=\"[MathJax]\"+b.substr(a.length)}return this.Set([\"LoadFile\",\"Loading %1\",b],null,null)},Log:function(){var b=[];for(var c=1,a=this.log.length;c<a;c++){b[c]=this.log[c].text}return b.join(\"\\n\
\")}};MathJax.Hub={config:{root:\"\",config:[],styleSheets:[],styles:{\".MathJax_Preview\":{color:\"#888\"}},jax:[],extensions:[],preJax:null,postJax:null,displayAlign:\"center\",displayIndent:\"0\",preRemoveClass:\"MathJax_Preview\",showProcessingMessages:true,messageStyle:\"normal\",delayStartupUntil:\"none\",skipStartupTypeset:false,elements:[],positionToHash:true,showMathMenu:true,showMathMenuMSIE:true,menuSettings:{zoom:\"None\",CTRL:false,ALT:false,CMD:false,Shift:false,discoverable:false,zscale:\"200%\",renderer:\"\",font:\"Auto\",context:\"MathJax\",locale:\"en\",mpContext:false,mpMouse:false,texHints:true},errorSettings:{message:[\"[\",[\"MathProcessingError\",\"Math Processing Error\"],\"]\"],style:{color:\"#CC0000\",\"font-style\":\"italic\"}}},preProcessors:MathJax.Callback.Hooks(true),inputJax:{},outputJax:{order:{}},processUpdateTime:250,processUpdateDelay:10,signal:MathJax.Callback.Signal(\"Hub\"),Config:function(a){this.Insert(this.config,a);if(this.config.Augment){this.Augment(this.config.Augment)}},CombineConfig:function(c,f){var b=this.config,g,e;c=c.split(/\\./);for(var d=0,a=c.length;d<a;d++){g=c[d];if(!b[g]){b[g]={}}e=b;b=b[g]}e[g]=b=this.Insert(f,b);return b},Register:{PreProcessor:function(){MathJax.Hub.preProcessors.Add.apply(MathJax.Hub.preProcessors,arguments)},MessageHook:function(){return MathJax.Hub.signal.MessageHook.apply(MathJax.Hub.signal,arguments)},StartupHook:function(){return MathJax.Hub.Startup.signal.MessageHook.apply(MathJax.Hub.Startup.signal,arguments)},LoadHook:function(){return MathJax.Ajax.LoadHook.apply(MathJax.Ajax,arguments)}},getAllJax:function(e){var c=[],b=this.elementScripts(e);for(var d=0,a=b.length;d<a;d++){if(b[d].MathJax&&b[d].MathJax.elementJax){c.push(b[d].MathJax.elementJax)}}return c},getJaxByType:function(f,e){var c=[],b=this.elementScripts(e);for(var d=0,a=b.length;d<a;d++){if(b[d].MathJax&&b[d].MathJax.elementJax&&b[d].MathJax.elementJax.mimeType===f){c.push(b[d].MathJax.elementJax)}}return c},getJaxByInputType:function(f,e){var c=[],b=this.elementScripts(e);for(var d=0,a=b.length;d<a;d++){if(b[d].MathJax&&b[d].MathJax.elementJax&&b[d].type&&b[d].type.replace(/ *;(.|\\s)*/,\"\")===f){c.push(b[d].MathJax.elementJax)}}return c},getJaxFor:function(a){if(typeof(a)===\"string\"){a=document.getElementById(a)}if(a&&a.MathJax){return a.MathJax.elementJax}if(a&&a.isMathJax){while(a&&!a.jaxID){a=a.parentNode}if(a){return MathJax.OutputJax[a.jaxID].getJaxFromMath(a)}}return null},isJax:function(a){if(typeof(a)===\"string\"){a=document.getElementById(a)}if(a&&a.isMathJax){return 1}if(a&&a.tagName!=null&&a.tagName.toLowerCase()===\"script\"){if(a.MathJax){return(a.MathJax.state===MathJax.ElementJax.STATE.PROCESSED?1:-1)}if(a.type&&this.inputJax[a.type.replace(/ *;(.|\\s)*/,\"\")]){return -1}}return 0},setRenderer:function(d,c){if(!d){return}if(!MathJax.OutputJax[d]){this.config.menuSettings.renderer=\"\";var b=\"[MathJax]/jax/output/\"+d+\"/config.js\";return MathJax.Ajax.Require(b,[\"setRenderer\",this,d,c])}else{this.config.menuSettings.renderer=d;if(c==null){c=\"jax/mml\"}var a=this.outputJax;if(a[c]&&a[c].length){if(d!==a[c][0].id){a[c].unshift(MathJax.OutputJax[d]);return this.signal.Post([\"Renderer Selected\",d])}}return null}},Queue:function(){return this.queue.Push.apply(this.queue,arguments)},Typeset:function(e,f){if(!MathJax.isReady){return null}var c=this.elementCallback(e,f);var b=MathJax.Callback.Queue();for(var d=0,a=c.elements.length;d<a;d++){if(c.elements[d]){b.Push([\"PreProcess\",this,c.elements[d]],[\"Process\",this,c.elements[d]])}}return b.Push(c.callback)},PreProcess:function(e,f){var c=this.elementCallback(e,f);var b=MathJax.Callback.Queue();for(var d=0,a=c.elements.length;d<a;d++){if(c.elements[d]){b.Push([\"Post\",this.signal,[\"Begin PreProcess\",c.elements[d]]],(arguments.callee.disabled?{}:[\"Execute\",this.preProcessors,c.elements[d]]),[\"Post\",this.signal,[\"End PreProcess\",c.elements[d]]])}}return b.Push(c.callback)},Process:function(a,b){return this.takeAction(\"Process\",a,b)},Update:function(a,b){return this.takeAction(\"Update\",a,b)},Reprocess:function(a,b){return this.takeAction(\"Reprocess\",a,b)},Rerender:function(a,b){return this.takeAction(\"Rerender\",a,b)},takeAction:function(g,e,h){var c=this.elementCallback(e,h);var b=MathJax.Callback.Queue([\"Clear\",this.signal]);for(var d=0,a=c.elements.length;d<a;d++){if(c.elements[d]){var f={scripts:[],start:new Date().getTime(),i:0,j:0,jax:{},jaxIDs:[]};b.Push([\"Post\",this.signal,[\"Begin \"+g,c.elements[d]]],[\"Post\",this.signal,[\"Begin Math\",c.elements[d],g]],[\"prepareScripts\",this,g,c.elements[d],f],[\"Post\",this.signal,[\"Begin Math Input\",c.elements[d],g]],[\"processInput\",this,f],[\"Post\",this.signal,[\"End Math Input\",c.elements[d],g]],[\"prepareOutput\",this,f,\"preProcess\"],[\"Post\",this.signal,[\"Begin Math Output\",c.elements[d],g]],[\"processOutput\",this,f],[\"Post\",this.signal,[\"End Math Output\",c.elements[d],g]],[\"prepareOutput\",this,f,\"postProcess\"],[\"Post\",this.signal,[\"End Math\",c.elements[d],g]],[\"Post\",this.signal,[\"End \"+g,c.elements[d]]])}}return b.Push(c.callback)},scriptAction:{Process:function(a){},Update:function(b){var a=b.MathJax.elementJax;if(a&&a.needsUpdate()){a.Remove(true);b.MathJax.state=a.STATE.UPDATE}else{b.MathJax.state=a.STATE.PROCESSED}},Reprocess:function(b){var a=b.MathJax.elementJax;if(a){a.Remove(true);b.MathJax.state=a.STATE.UPDATE}},Rerender:function(b){var a=b.MathJax.elementJax;if(a){a.Remove(true);b.MathJax.state=a.STATE.OUTPUT}}},prepareScripts:function(h,e,g){if(arguments.callee.disabled){return}var b=this.elementScripts(e);var f=MathJax.ElementJax.STATE;for(var d=0,a=b.length;d<a;d++){var c=b[d];if(c.type&&this.inputJax[c.type.replace(/ *;(.|\\n\
)*/,\"\")]){if(c.MathJax){if(c.MathJax.elementJax&&c.MathJax.elementJax.hover){MathJax.Extension.MathEvents.Hover.ClearHover(c.MathJax.elementJax)}if(c.MathJax.state!==f.PENDING){this.scriptAction[h](c)}}if(!c.MathJax){c.MathJax={state:f.PENDING}}if(c.MathJax.state!==f.PROCESSED){g.scripts.push(c)}}}},checkScriptSiblings:function(a){if(a.MathJax.checked){return}var b=this.config,f=a.previousSibling;if(f&&f.nodeName===\"#text\"){var d,e,c=a.nextSibling;if(c&&c.nodeName!==\"#text\"){c=null}if(b.preJax){if(typeof(b.preJax)===\"string\"){b.preJax=new RegExp(b.preJax+\"$\")}d=f.nodeValue.match(b.preJax)}if(b.postJax&&c){if(typeof(b.postJax)===\"string\"){b.postJax=new RegExp(\"^\"+b.postJax)}e=c.nodeValue.match(b.postJax)}if(d&&(!b.postJax||e)){f.nodeValue=f.nodeValue.replace(b.preJax,(d.length>1?d[1]:\"\"));f=null}if(e&&(!b.preJax||d)){c.nodeValue=c.nodeValue.replace(b.postJax,(e.length>1?e[1]:\"\"))}if(f&&!f.nodeValue.match(/\\S/)){f=f.previousSibling}}if(b.preRemoveClass&&f&&f.className===b.preRemoveClass){a.MathJax.preview=f}a.MathJax.checked=1},processInput:function(a){var b,i=MathJax.ElementJax.STATE;var h,e,d=a.scripts.length;try{while(a.i<d){h=a.scripts[a.i];if(!h){a.i++;continue}e=h.previousSibling;if(e&&e.className===\"MathJax_Error\"){e.parentNode.removeChild(e)}if(!h.MathJax||h.MathJax.state===i.PROCESSED){a.i++;continue}if(!h.MathJax.elementJax||h.MathJax.state===i.UPDATE){this.checkScriptSiblings(h);var g=h.type.replace(/ *;(.|\\s)*/,\"\");b=this.inputJax[g].Process(h,a);if(typeof b===\"function\"){if(b.called){continue}this.RestartAfter(b)}b.Attach(h,this.inputJax[g].id);this.saveScript(b,a,h,i)}else{if(h.MathJax.state===i.OUTPUT){this.saveScript(h.MathJax.elementJax,a,h,i)}}a.i++;var c=new Date().getTime();if(c-a.start>this.processUpdateTime&&a.i<a.scripts.length){a.start=c;this.RestartAfter(MathJax.Callback.Delay(1))}}}catch(f){return this.processError(f,a,\"Input\")}if(a.scripts.length&&this.config.showProcessingMessages){MathJax.Message.Set([\"ProcessMath\",\"Processing math: %1%%\",100],0)}a.start=new Date().getTime();a.i=a.j=0;return null},saveScript:function(a,d,b,c){if(!this.outputJax[a.mimeType]){b.MathJax.state=c.UPDATE;throw Error(\"No output jax registered for \"+a.mimeType)}a.outputJax=this.outputJax[a.mimeType][0].id;if(!d.jax[a.outputJax]){if(d.jaxIDs.length===0){d.jax[a.outputJax]=d.scripts}else{if(d.jaxIDs.length===1){d.jax[d.jaxIDs[0]]=d.scripts.slice(0,d.i)}d.jax[a.outputJax]=[]}d.jaxIDs.push(a.outputJax)}if(d.jaxIDs.length>1){d.jax[a.outputJax].push(b)}b.MathJax.state=c.OUTPUT},prepareOutput:function(c,f){while(c.j<c.jaxIDs.length){var e=c.jaxIDs[c.j],d=MathJax.OutputJax[e];if(d[f]){try{var a=d[f](c);if(typeof a===\"function\"){if(a.called){continue}this.RestartAfter(a)}}catch(b){if(!b.restart){MathJax.Message.Set([\"PrepError\",\"Error preparing %1 output (%2)\",e,f],null,600);MathJax.Hub.lastPrepError=b;c.j++}return MathJax.Callback.After([\"prepareOutput\",this,c,f],b.restart)}}c.j++}return null},processOutput:function(h){var b,g=MathJax.ElementJax.STATE,d,a=h.scripts.length;try{while(h.i<a){d=h.scripts[h.i];if(!d||!d.MathJax||d.MathJax.error){h.i++;continue}var c=d.MathJax.elementJax;if(!c){h.i++;continue}b=MathJax.OutputJax[c.outputJax].Process(d,h);d.MathJax.state=g.PROCESSED;h.i++;if(d.MathJax.preview){d.MathJax.preview.innerHTML=\"\"}this.signal.Post([\"New Math\",c.inputID]);var e=new Date().getTime();if(e-h.start>this.processUpdateTime&&h.i<h.scripts.length){h.start=e;this.RestartAfter(MathJax.Callback.Delay(this.processUpdateDelay))}}}catch(f){return this.processError(f,h,\"Output\")}if(h.scripts.length&&this.config.showProcessingMessages){MathJax.Message.Set([\"TypesetMath\",\"Typesetting math: %1%%\",100],0);MathJax.Message.Clear(0)}h.i=h.j=0;return null},processMessage:function(d,b){var a=Math.floor(d.i/(d.scripts.length)*100);var c=(b===\"Output\"?[\"TypesetMath\",\"Typesetting math: %1%%\"]:[\"ProcessMath\",\"Processing math: %1%%\"]);if(this.config.showProcessingMessages){MathJax.Message.Set(c.concat(a),0)}},processError:function(b,c,a){if(!b.restart){if(!this.config.errorSettings.message){throw b}this.formatError(c.scripts[c.i],b);c.i++}this.processMessage(c,a);return MathJax.Callback.After([\"process\"+a,this,c],b.restart)},formatError:function(b,e){var d=\"Error: \"+e.message+\"\\n\
\";if(e.sourceURL){d+=\"\\n\
file: \"+e.sourceURL}if(e.line){d+=\"\\n\
line: \"+e.line}b.MathJax.error=MathJax.OutputJax.Error.Jax(d,b);var f=this.config.errorSettings;var a=MathJax.Localization._(f.messageId,f.message);var c=MathJax.HTML.Element(\"span\",{className:\"MathJax_Error\",jaxID:\"Error\",isMathJax:true},a);if(MathJax.Extension.MathEvents){c.oncontextmenu=MathJax.Extension.MathEvents.Event.Menu;c.onmousedown=MathJax.Extension.MathEvents.Event.Mousedown}else{MathJax.Ajax.Require(\"[MathJax]/extensions/MathEvents.js\",function(){c.oncontextmenu=MathJax.Extension.MathEvents.Event.Menu;c.onmousedown=MathJax.Extension.MathEvents.Event.Mousedown})}b.parentNode.insertBefore(c,b);if(b.MathJax.preview){b.MathJax.preview.innerHTML=\"\"}this.lastError=e;this.signal.Post([\"Math Processing Error\",b,e])},RestartAfter:function(a){throw this.Insert(Error(\"restart\"),{restart:MathJax.Callback(a)})},elementCallback:function(c,f){if(f==null&&(c instanceof Array||typeof c===\"function\")){try{MathJax.Callback(c);f=c;c=null}catch(d){}}if(c==null){c=this.config.elements||[]}if(!(c instanceof Array)){c=[c]}c=[].concat(c);for(var b=0,a=c.length;b<a;b++){if(typeof(c[b])===\"string\"){c[b]=document.getElementById(c[b])}}if(!document.body){document.body=document.getElementsByTagName(\"body\")[0]}if(c.length==0){c.push(document.body)}if(!f){f={}}return{elements:c,callback:f}},elementScripts:function(a){if(typeof(a)===\"string\"){a=document.getElementById(a)}if(!document.body){document.body=document.getElementsByTagName(\"body\")[0]}if(a==null){a=document.body}if(a.tagName!=null&&a.tagName.toLowerCase()===\"script\"){return[a]}return a.getElementsByTagName(\"script\")},Insert:function(c,a){for(var b in a){if(a.hasOwnProperty(b)){if(typeof a[b]===\"object\"&&!(a[b] instanceof Array)&&(typeof c[b]===\"object\"||typeof c[b]===\"function\")){this.Insert(c[b],a[b])}else{c[b]=a[b]}}}return c},SplitList:(\"trim\" in String.prototype?function(a){return a.trim().split(/\\s+/)}:function(a){return a.replace(/^\\s+/,\"\").replace(/\\s+$/,\"\").split(/\\s+/)})};MathJax.Hub.Insert(MathJax.Hub.config.styles,MathJax.Message.styles);MathJax.Hub.Insert(MathJax.Hub.config.styles,{\".MathJax_Error\":MathJax.Hub.config.errorSettings.style});MathJax.Extension={};MathJax.Hub.Configured=MathJax.Callback({});MathJax.Hub.Startup={script:\"\",queue:MathJax.Callback.Queue(),signal:MathJax.Callback.Signal(\"Startup\"),params:{},Config:function(){this.queue.Push([\"Post\",this.signal,\"Begin Config\"]);if(this.params.locale){MathJax.Localization.locale=this.params.locale;MathJax.Hub.config.menuSettings.locale=this.params.locale}var b=MathJax.HTML.Cookie.Get(\"user\");if(b.URL||b.Config){if(confirm(MathJax.Localization._(\"CookieConfig\",\"MathJax has found a user-configuration cookie that includes code to be run. Do you want to run it?\\n\
\\n\
(You should press Cancel unless you set up the cookie yourself.)\"))){if(b.URL){this.queue.Push([\"Require\",MathJax.Ajax,b.URL])}if(b.Config){this.queue.Push(new Function(b.Config))}}else{MathJax.HTML.Cookie.Set(\"user\",{})}}if(this.params.config){var d=this.params.config.split(/,/);for(var c=0,a=d.length;c<a;c++){if(!d[c].match(/\\.js$/)){d[c]+=\".js\"}this.queue.Push([\"Require\",MathJax.Ajax,this.URL(\"config\",d[c])])}}if(this.script.match(/\\S/)){this.queue.Push(this.script+\";\\n\
1;\")}this.queue.Push([\"ConfigDelay\",this],[\"ConfigBlocks\",this],[function(e){return e.loadArray(MathJax.Hub.config.config,\"config\",null,true)},this],[\"Post\",this.signal,\"End Config\"])},ConfigDelay:function(){var a=this.params.delayStartupUntil||MathJax.Hub.config.delayStartupUntil;if(a===\"onload\"){return this.onload}if(a===\"configured\"){return MathJax.Hub.Configured}return a},ConfigBlocks:function(){var c=document.getElementsByTagName(\"script\");var f=null,b=MathJax.Callback.Queue();for(var d=0,a=c.length;d<a;d++){var e=String(c[d].type).replace(/ /g,\"\");if(e.match(/^text\\/x-mathjax-config(;.*)?$/)&&!e.match(/;executed=true/)){c[d].type+=\";executed=true\";f=b.Push(c[d].innerHTML+\";\\n\
1;\")}}return f},Cookie:function(){return this.queue.Push([\"Post\",this.signal,\"Begin Cookie\"],[\"Get\",MathJax.HTML.Cookie,\"menu\",MathJax.Hub.config.menuSettings],[function(d){if(d.menuSettings.locale){MathJax.Localization.locale=d.menuSettings.locale}var f=d.menuSettings.renderer,b=d.jax;if(f){var c=\"output/\"+f;b.sort();for(var e=0,a=b.length;e<a;e++){if(b[e].substr(0,7)===\"output/\"){break}}if(e==a-1){b.pop()}else{while(e<a){if(b[e]===c){b.splice(e,1);break}e++}}b.unshift(c)}},MathJax.Hub.config],[\"Post\",this.signal,\"End Cookie\"])},Styles:function(){return this.queue.Push([\"Post\",this.signal,\"Begin Styles\"],[\"loadArray\",this,MathJax.Hub.config.styleSheets,\"config\"],[\"Styles\",MathJax.Ajax,MathJax.Hub.config.styles],[\"Post\",this.signal,\"End Styles\"])},Jax:function(){var f=MathJax.Hub.config,c=MathJax.Hub.outputJax;for(var g=0,b=f.jax.length,d=0;g<b;g++){var e=f.jax[g].substr(7);if(f.jax[g].substr(0,7)===\"output/\"&&c.order[e]==null){c.order[e]=d;d++}}var a=MathJax.Callback.Queue();return a.Push([\"Post\",this.signal,\"Begin Jax\"],[\"loadArray\",this,f.jax,\"jax\",\"config.js\"],[\"Post\",this.signal,\"End Jax\"])},Extensions:function(){var a=MathJax.Callback.Queue();return a.Push([\"Post\",this.signal,\"Begin Extensions\"],[\"loadArray\",this,MathJax.Hub.config.extensions,\"extensions\"],[\"Post\",this.signal,\"End Extensions\"])},Message:function(){MathJax.Message.Init(true)},Menu:function(){var b=MathJax.Hub.config.menuSettings,a=MathJax.Hub.outputJax,d;for(var c in a){if(a.hasOwnProperty(c)){if(a[c].length){d=a[c];break}}}if(d&&d.length){if(b.renderer&&b.renderer!==d[0].id){d.unshift(MathJax.OutputJax[b.renderer])}b.renderer=d[0].id}},Hash:function(){if(MathJax.Hub.config.positionToHash&&document.location.hash&&document.body&&document.body.scrollIntoView){var d=document.location.hash.substr(1);var f=document.getElementById(d);if(!f){var c=document.getElementsByTagName(\"a\");for(var e=0,b=c.length;e<b;e++){if(c[e].name===d){f=c[e];break}}}if(f){while(!f.scrollIntoView){f=f.parentNode}f=this.HashCheck(f);if(f&&f.scrollIntoView){setTimeout(function(){f.scrollIntoView(true)},1)}}}},HashCheck:function(b){if(b.isMathJax){var a=MathJax.Hub.getJaxFor(b);if(a&&MathJax.OutputJax[a.outputJax].hashCheck){b=MathJax.OutputJax[a.outputJax].hashCheck(b)}}return b},MenuZoom:function(){if(!MathJax.Extension.MathMenu){setTimeout(function(){MathJax.Callback.Queue([\"Require\",MathJax.Ajax,\"[MathJax]/extensions/MathMenu.js\",{}],[\"loadDomain\",MathJax.Localization,\"MathMenu\"])},1000)}else{setTimeout(MathJax.Callback([\"loadDomain\",MathJax.Localization,\"MathMenu\"]),1000)}if(!MathJax.Extension.MathZoom){setTimeout(MathJax.Callback([\"Require\",MathJax.Ajax,\"[MathJax]/extensions/MathZoom.js\",{}]),2000)}},onLoad:function(){var a=this.onload=MathJax.Callback(function(){MathJax.Hub.Startup.signal.Post(\"onLoad\")});if(document.body&&document.readyState){if(MathJax.Hub.Browser.isMSIE){if(document.readyState===\"complete\"){return[a]}}else{if(document.readyState!==\"loading\"){return[a]}}}if(window.addEventListener){window.addEventListener(\"load\",a,false);if(!this.params.noDOMContentEvent){window.addEventListener(\"DOMContentLoaded\",a,false)}}else{if(window.attachEvent){window.attachEvent(\"onload\",a)}else{window.onload=a}}return a},Typeset:function(a,b){if(MathJax.Hub.config.skipStartupTypeset){return function(){}}return this.queue.Push([\"Post\",this.signal,\"Begin Typeset\"],[\"Typeset\",MathJax.Hub,a,b],[\"Post\",this.signal,\"End Typeset\"])},URL:function(b,a){if(!a.match(/^([a-z]+:\\/\\/|\\[|\\/)/)){a=\"[MathJax]/\"+b+\"/\"+a}return a},loadArray:function(b,f,c,a){if(b){if(!(b instanceof Array)){b=[b]}if(b.length){var h=MathJax.Callback.Queue(),j={},e;for(var g=0,d=b.length;g<d;g++){e=this.URL(f,b[g]);if(c){e+=\"/\"+c}if(a){h.Push([\"Require\",MathJax.Ajax,e,j])}else{h.Push(MathJax.Ajax.Require(e,j))}}return h.Push({})}}return null}};(function(d){var b=window[d],e=\"[\"+d+\"]\";var c=b.Hub,a=b.Ajax,f=b.Callback;var g=MathJax.Object.Subclass({JAXFILE:\"jax.js\",require:null,config:{},Init:function(i,h){if(arguments.length===0){return this}return(this.constructor.Subclass(i,h))()},Augment:function(k,j){var i=this.constructor,h={};if(k!=null){for(var l in k){if(k.hasOwnProperty(l)){if(typeof k[l]===\"function\"){i.protoFunction(l,k[l])}else{h[l]=k[l]}}}if(k.toString!==i.prototype.toString&&k.toString!=={}.toString){i.protoFunction(\"toString\",k.toString)}}c.Insert(i.prototype,h);i.Augment(null,j);return this},Translate:function(h,i){throw Error(this.directory+\"/\"+this.JAXFILE+\" failed to define the Translate() method\")},Register:function(h){},Config:function(){this.config=c.CombineConfig(this.id,this.config);if(this.config.Augment){this.Augment(this.config.Augment)}},Startup:function(){},loadComplete:function(i){if(i===\"config.js\"){return a.loadComplete(this.directory+\"/\"+i)}else{var h=f.Queue();h.Push(c.Register.StartupHook(\"End Config\",{}),[\"Post\",c.Startup.signal,this.id+\" Jax Config\"],[\"Config\",this],[\"Post\",c.Startup.signal,this.id+\" Jax Require\"],[function(j){return MathJax.Hub.Startup.loadArray(j.require,this.directory)},this],[function(j,k){return MathJax.Hub.Startup.loadArray(j.extensions,\"extensions/\"+k)},this.config||{},this.id],[\"Post\",c.Startup.signal,this.id+\" Jax Startup\"],[\"Startup\",this],[\"Post\",c.Startup.signal,this.id+\" Jax Ready\"]);if(this.copyTranslate){h.Push([function(j){j.preProcess=j.preTranslate;j.Process=j.Translate;j.postProcess=j.postTranslate},this.constructor.prototype])}return h.Push([\"loadComplete\",a,this.directory+\"/\"+i])}}},{id:\"Jax\",version:\"2.2\",directory:e+\"/jax\",extensionDir:e+\"/extensions\"});b.InputJax=g.Subclass({elementJax:\"mml\",sourceMenuTitle:[\"OriginalForm\",\"Original Form\"],copyTranslate:true,Process:function(l,q){var j=f.Queue(),o;var k=this.elementJax;if(!(k instanceof Array)){k=[k]}for(var n=0,h=k.length;n<h;n++){o=b.ElementJax.directory+\"/\"+k[n]+\"/\"+this.JAXFILE;if(!this.require){this.require=[]}else{if(!(this.require instanceof Array)){this.require=[this.require]}}this.require.push(o);j.Push(a.Require(o))}o=this.directory+\"/\"+this.JAXFILE;var p=j.Push(a.Require(o));if(!p.called){this.constructor.prototype.Process=function(){if(!p.called){return p}throw Error(o+\" failed to load properly\")}}k=c.outputJax[\"jax/\"+k[0]];if(k){j.Push(a.Require(k[0].directory+\"/\"+this.JAXFILE))}return j.Push({})},needsUpdate:function(h){var i=h.SourceElement();return(h.originalText!==b.HTML.getScript(i))},Register:function(h){if(!c.inputJax){c.inputJax={}}c.inputJax[h]=this}},{id:\"InputJax\",version:\"2.2\",directory:g.directory+\"/input\",extensionDir:g.extensionDir});b.OutputJax=g.Subclass({copyTranslate:true,preProcess:function(j){var i,h=this.directory+\"/\"+this.JAXFILE;this.constructor.prototype.preProcess=function(k){if(!i.called){return i}throw Error(h+\" failed to load properly\")};i=a.Require(h);return i},Register:function(i){var h=c.outputJax;if(!h[i]){h[i]=[]}if(h[i].length&&(this.id===c.config.menuSettings.renderer||(h.order[this.id]||0)<(h.order[h[i][0].id]||0))){h[i].unshift(this)}else{h[i].push(this)}if(!this.require){this.require=[]}else{if(!(this.require instanceof Array)){this.require=[this.require]}}this.require.push(b.ElementJax.directory+\"/\"+(i.split(/\\//)[1])+\"/\"+this.JAXFILE)},Remove:function(h){}},{id:\"OutputJax\",version:\"2.2\",directory:g.directory+\"/output\",extensionDir:g.extensionDir,fontDir:e+(b.isPacked?\"\":\"/..\")+\"/fonts\",imageDir:e+(b.isPacked?\"\":\"/..\")+\"/images\"});b.ElementJax=g.Subclass({Init:function(i,h){return this.constructor.Subclass(i,h)},inputJax:null,outputJax:null,inputID:null,originalText:\"\",mimeType:\"\",sourceMenuTitle:[\"MathMLcode\",\"MathML Code\"],Text:function(i,j){var h=this.SourceElement();b.HTML.setScript(h,i);h.MathJax.state=this.STATE.UPDATE;return c.Update(h,j)},Reprocess:function(i){var h=this.SourceElement();h.MathJax.state=this.STATE.UPDATE;return c.Reprocess(h,i)},Update:function(h){return this.Rerender(h)},Rerender:function(i){var h=this.SourceElement();h.MathJax.state=this.STATE.OUTPUT;return c.Process(h,i)},Remove:function(h){if(this.hover){this.hover.clear(this)}b.OutputJax[this.outputJax].Remove(this);if(!h){c.signal.Post([\"Remove Math\",this.inputID]);this.Detach()}},needsUpdate:function(){return b.InputJax[this.inputJax].needsUpdate(this)},SourceElement:function(){return document.getElementById(this.inputID)},Attach:function(i,j){var h=i.MathJax.elementJax;if(i.MathJax.state===this.STATE.UPDATE){h.Clone(this)}else{h=i.MathJax.elementJax=this;if(i.id){this.inputID=i.id}else{i.id=this.inputID=b.ElementJax.GetID();this.newID=1}}h.originalText=b.HTML.getScript(i);h.inputJax=j;if(h.root){h.root.inputID=h.inputID}return h},Detach:function(){var h=this.SourceElement();if(!h){return}try{delete h.MathJax}catch(i){h.MathJax=null}if(this.newID){h.id=\"\"}},Clone:function(h){var i;for(i in this){if(!this.hasOwnProperty(i)){continue}if(typeof(h[i])===\"undefined\"&&i!==\"newID\"){delete this[i]}}for(i in h){if(!h.hasOwnProperty(i)){continue}if(typeof(this[i])===\"undefined\"||(this[i]!==h[i]&&i!==\"inputID\")){this[i]=h[i]}}}},{id:\"ElementJax\",version:\"2.2\",directory:g.directory+\"/element\",extensionDir:g.extensionDir,ID:0,STATE:{PENDING:1,PROCESSED:2,UPDATE:3,OUTPUT:4},GetID:function(){this.ID++;return\"MathJax-Element-\"+this.ID},Subclass:function(){var h=g.Subclass.apply(this,arguments);h.loadComplete=this.prototype.loadComplete;return h}});b.ElementJax.prototype.STATE=b.ElementJax.STATE;b.OutputJax.Error={id:\"Error\",version:\"2.2\",config:{},ContextMenu:function(){return b.Extension.MathEvents.Event.ContextMenu.apply(b.Extension.MathEvents.Event,arguments)},Mousedown:function(){return b.Extension.MathEvents.Event.AltContextMenu.apply(b.Extension.MathEvents.Event,arguments)},getJaxFromMath:function(h){return(h.nextSibling.MathJax||{}).error},Jax:function(j,i){var h=MathJax.Hub.inputJax[i.type.replace(/ *;(.|\\s)*/,\"\")];return{inputJax:(h||{id:\"Error\"}).id,outputJax:\"Error\",sourceMenuTitle:[\"ErrorMessage\",\"Error Message\"],sourceMenuFormat:\"Error\",originalText:MathJax.HTML.getScript(i),errorText:j}}};b.InputJax.Error={id:\"Error\",version:\"2.2\",config:{},sourceMenuTitle:[\"OriginalForm\",\"Original Form\"]}})(\"MathJax\");(function(l){var f=window[l];if(!f){f=window[l]={}}var c=f.Hub;var q=c.Startup;var u=c.config;var e=document.getElementsByTagName(\"head\")[0];if(!e){e=document.childNodes[0]}var b=(document.documentElement||document).getElementsByTagName(\"script\");var d=new RegExp(\"(^|/)\"+l+\"\\\\.js(\\\\?.*)?$\");for(var o=b.length-1;o>=0;o--){if((b[o].src||\"\").match(d)){q.script=b[o].innerHTML;if(RegExp.$2){var r=RegExp.$2.substr(1).split(/\\&/);for(var n=0,h=r.length;n<h;n++){var k=r[n].match(/(.*)=(.*)/);if(k){q.params[unescape(k[1])]=unescape(k[2])}}}u.root=b[o].src.replace(/(^|\\/)[^\\/]*(\\?.*)?$/,\"\");break}}f.Ajax.config=u;var a={isMac:(navigator.platform.substr(0,3)===\"Mac\"),isPC:(navigator.platform.substr(0,3)===\"Win\"),isMSIE:(window.ActiveXObject!=null&&window.clipboardData!=null),isFirefox:(navigator.userAgent.match(/Gecko/)!=null&&navigator.userAgent.match(/KHTML/)==null),isSafari:(navigator.userAgent.match(/ (Apple)?WebKit\\//)!=null&&(!window.chrome||window.chrome.loadTimes==null)),isChrome:(window.chrome!=null&&window.chrome.loadTimes!=null),isOpera:(window.opera!=null&&window.opera.version!=null),isKonqueror:(window.hasOwnProperty&&window.hasOwnProperty(\"konqueror\")&&navigator.vendor==\"KDE\"),versionAtLeast:function(x){var w=(this.version).split(\".\");x=(new String(x)).split(\".\");for(var y=0,j=x.length;y<j;y++){if(w[y]!=x[y]){return parseInt(w[y]||\"0\")>=parseInt(x[y])}}return true},Select:function(j){var i=j[c.Browser];if(i){return i(c.Browser)}return null}};var g=navigator.userAgent.replace(/^Mozilla\\/(\\d+\\.)+\\d+ /,\"\").replace(/[a-z][-a-z0-9._: ]+\\/\\d+[^ ]*-[^ ]*\\.([a-z][a-z])?\\d+ /i,\"\").replace(/Gentoo |Ubuntu\\/(\\d+\\.)*\\d+ (\\([^)]*\\) )?/,\"\");c.Browser=c.Insert(c.Insert(new String(\"Unknown\"),{version:\"0.0\"}),a);for(var t in a){if(a.hasOwnProperty(t)){if(a[t]&&t.substr(0,2)===\"is\"){t=t.slice(2);if(t===\"Mac\"||t===\"PC\"){continue}c.Browser=c.Insert(new String(t),a);var p=new RegExp(\".*(Version)/((?:\\\\d+\\\\.)+\\\\d+)|.*(\"+t+\")\"+(t==\"MSIE\"?\" \":\"/\")+\"((?:\\\\d+\\\\.)*\\\\d+)|(?:^|\\\\(| )([a-z][-a-z0-9._: ]+|(?:Apple)?WebKit)/((?:\\\\d+\\\\.)+\\\\d+)\");var s=p.exec(g)||[\"\",\"\",\"\",\"unknown\",\"0.0\"];c.Browser.name=(s[1]==\"Version\"?t:(s[3]||s[5]));c.Browser.version=s[2]||s[4]||s[6];break}}}c.Browser.Select({Safari:function(j){var i=parseInt((String(j.version).split(\".\"))[0]);if(i>85){j.webkit=j.version}if(i>=534){j.version=\"5.1\"}else{if(i>=533){j.version=\"5.0\"}else{if(i>=526){j.version=\"4.0\"}else{if(i>=525){j.version=\"3.1\"}else{if(i>500){j.version=\"3.0\"}else{if(i>400){j.version=\"2.0\"}else{if(i>85){j.version=\"1.0\"}}}}}}}j.isMobile=(navigator.appVersion.match(/Mobile/i)!=null);j.noContextMenu=j.isMobile},Firefox:function(j){if((j.version===\"0.0\"||navigator.userAgent.match(/Firefox/)==null)&&navigator.product===\"Gecko\"){var m=navigator.userAgent.match(/[\\/ ]rv:(\\d+\\.\\d.*?)[\\) ]/);if(m){j.version=m[1]}else{var i=(navigator.buildID||navigator.productSub||\"0\").substr(0,8);if(i>=\"20111220\"){j.version=\"9.0\"}else{if(i>=\"20111120\"){j.version=\"8.0\"}else{if(i>=\"20110927\"){j.version=\"7.0\"}else{if(i>=\"20110816\"){j.version=\"6.0\"}else{if(i>=\"20110621\"){j.version=\"5.0\"}else{if(i>=\"20110320\"){j.version=\"4.0\"}else{if(i>=\"20100121\"){j.version=\"3.6\"}else{if(i>=\"20090630\"){j.version=\"3.5\"}else{if(i>=\"20080617\"){j.version=\"3.0\"}else{if(i>=\"20061024\"){j.version=\"2.0\"}}}}}}}}}}}}j.isMobile=(navigator.appVersion.match(/Android/i)!=null||navigator.userAgent.match(/ Fennec\\//)!=null||navigator.userAgent.match(/Mobile/)!=null)},Opera:function(i){i.version=opera.version()},MSIE:function(j){j.isIE9=!!(document.documentMode&&(window.performance||window.msPerformance));MathJax.HTML.setScriptBug=!j.isIE9||document.documentMode<9;var v=false;try{new ActiveXObject(\"MathPlayer.Factory.1\");j.hasMathPlayer=v=true}catch(m){}try{if(v&&!q.params.NoMathPlayer){var i=document.createElement(\"object\");i.id=\"mathplayer\";i.classid=\"clsid:32F66A20-7614-11D4-BD11-00104BD3F987\";document.getElementsByTagName(\"head\")[0].appendChild(i);document.namespaces.add(\"m\",\"http://www.w3.org/1998/Math/MathML\");j.mpNamespace=true;if(document.readyState&&(document.readyState===\"loading\"||document.readyState===\"interactive\")){document.write('<?import namespace=\"m\" implementation=\"#MathPlayer\">');j.mpImported=true}}else{document.namespaces.add(\"mjx_IE_fix\",\"http://www.w3.org/1999/xlink\")}}catch(m){}}});c.Browser.Select(MathJax.Message.browsers);c.queue=f.Callback.Queue();c.queue.Push([\"Post\",q.signal,\"Begin\"],[\"Config\",q],[\"Cookie\",q],[\"Styles\",q],[\"Message\",q],function(){var i=f.Callback.Queue(q.Jax(),q.Extensions());return i.Push({})},[\"Menu\",q],q.onLoad(),function(){MathJax.isReady=true},[\"Typeset\",q],[\"Hash\",q],[\"MenuZoom\",q],[\"Post\",q.signal,\"End\"])})(\"MathJax\")}};\n\
\n\
// Exports for component.\n\
module.exports = window.MathJax;\n\
//@ sourceURL=segmentio-mathjax/MathJax.js"
));
require.register("component-dom/index.js", Function("exports, require, module",
"/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var delegate = require('delegate');\n\
var classes = require('classes');\n\
var indexof = require('indexof');\n\
var domify = require('domify');\n\
var events = require('event');\n\
var value = require('value');\n\
var query = require('query');\n\
var type = require('type');\n\
var css = require('css');\n\
\n\
/**\n\
 * Attributes supported.\n\
 */\n\
\n\
var attrs = [\n\
  'id',\n\
  'src',\n\
  'rel',\n\
  'cols',\n\
  'rows',\n\
  'type',\n\
  'name',\n\
  'href',\n\
  'title',\n\
  'style',\n\
  'width',\n\
  'height',\n\
  'action',\n\
  'method',\n\
  'tabindex',\n\
  'placeholder'\n\
];\n\
\n\
/**\n\
 * Expose `dom()`.\n\
 */\n\
\n\
exports = module.exports = dom;\n\
\n\
/**\n\
 * Expose supported attrs.\n\
 */\n\
\n\
exports.attrs = attrs;\n\
\n\
/**\n\
 * Return a dom `List` for the given\n\
 * `html`, selector, or element.\n\
 *\n\
 * @param {String|Element|List}\n\
 * @return {List}\n\
 * @api public\n\
 */\n\
\n\
function dom(selector, context) {\n\
  // array\n\
  if (Array.isArray(selector)) {\n\
    return new List(selector);\n\
  }\n\
\n\
  // List\n\
  if (selector instanceof List) {\n\
    return selector;\n\
  }\n\
\n\
  // node\n\
  if (selector.nodeName) {\n\
    return new List([selector]);\n\
  }\n\
\n\
  if ('string' != typeof selector) {\n\
    throw new TypeError('invalid selector');\n\
  }\n\
\n\
  // html\n\
  if ('<' == selector.charAt(0)) {\n\
    return new List([domify(selector)], selector);\n\
  }\n\
\n\
  // selector\n\
  var ctx = context\n\
    ? (context.els ? context.els[0] : context)\n\
    : document;\n\
\n\
  return new List(query.all(selector, ctx), selector);\n\
}\n\
\n\
/**\n\
 * Expose `List` constructor.\n\
 */\n\
\n\
exports.List = List;\n\
\n\
/**\n\
 * Initialize a new `List` with the\n\
 * given array-ish of `els` and `selector`\n\
 * string.\n\
 *\n\
 * @param {Mixed} els\n\
 * @param {String} selector\n\
 * @api private\n\
 */\n\
\n\
function List(els, selector) {\n\
  this.els = els || [];\n\
  this.selector = selector;\n\
}\n\
\n\
/**\n\
 * Enumerable iterator.\n\
 */\n\
\n\
List.prototype.__iterate__ = function(){\n\
  var self = this;\n\
  return {\n\
    length: function(){ return self.els.length },\n\
    get: function(i){ return new List([self.els[i]]) }\n\
  }\n\
};\n\
\n\
/**\n\
 * Remove elements from the DOM.\n\
 *\n\
 * @api public\n\
 */\n\
\n\
List.prototype.remove = function(){\n\
  for (var i = 0; i < this.els.length; i++) {\n\
    var el = this.els[i];\n\
    var parent = el.parentNode;\n\
    if (parent) parent.removeChild(el);\n\
  }\n\
};\n\
\n\
/**\n\
 * Set attribute `name` to `val`, or get attr `name`.\n\
 *\n\
 * @param {String} name\n\
 * @param {String} [val]\n\
 * @return {String|List} self\n\
 * @api public\n\
 */\n\
\n\
List.prototype.attr = function(name, val){\n\
  // get\n\
  if (1 == arguments.length) {\n\
    return this.els[0] && this.els[0].getAttribute(name);\n\
  }\n\
\n\
  // remove\n\
  if (null == val) {\n\
    return this.removeAttr(name);\n\
  }\n\
\n\
  // set\n\
  return this.forEach(function(el){\n\
    el.setAttribute(name, val);\n\
  });\n\
};\n\
\n\
/**\n\
 * Remove attribute `name`.\n\
 *\n\
 * @param {String} name\n\
 * @return {List} self\n\
 * @api public\n\
 */\n\
\n\
List.prototype.removeAttr = function(name){\n\
  return this.forEach(function(el){\n\
    el.removeAttribute(name);\n\
  });\n\
};\n\
\n\
/**\n\
 * Set property `name` to `val`, or get property `name`.\n\
 *\n\
 * @param {String} name\n\
 * @param {String} [val]\n\
 * @return {Object|List} self\n\
 * @api public\n\
 */\n\
\n\
List.prototype.prop = function(name, val){\n\
  if (1 == arguments.length) {\n\
    return this.els[0] && this.els[0][name];\n\
  }\n\
\n\
  return this.forEach(function(el){\n\
    el[name] = val;\n\
  });\n\
};\n\
\n\
/**\n\
 * Get the first element's value or set selected\n\
 * element values to `val`.\n\
 *\n\
 * @param {Mixed} [val]\n\
 * @return {Mixed}\n\
 * @api public\n\
 */\n\
\n\
List.prototype.val =\n\
List.prototype.value = function(val){\n\
  if (0 == arguments.length) {\n\
    return this.els[0]\n\
      ? value(this.els[0])\n\
      : undefined;\n\
  }\n\
\n\
  return this.forEach(function(el){\n\
    value(el, val);\n\
  });\n\
};\n\
\n\
/**\n\
 * Return a cloned `List` with all elements cloned.\n\
 *\n\
 * @return {List}\n\
 * @api public\n\
 */\n\
\n\
List.prototype.clone = function(){\n\
  var arr = [];\n\
  for (var i = 0, len = this.els.length; i < len; ++i) {\n\
    arr.push(this.els[i].cloneNode(true));\n\
  }\n\
  return new List(arr);\n\
};\n\
\n\
/**\n\
 * Prepend `val`.\n\
 *\n\
 * @param {String|Element|List} val\n\
 * @return {List} new list\n\
 * @api public\n\
 */\n\
\n\
List.prototype.prepend = function(val){\n\
  var el = this.els[0];\n\
  if (!el) return this;\n\
  val = dom(val);\n\
  for (var i = 0; i < val.els.length; ++i) {\n\
    if (el.children.length) {\n\
      el.insertBefore(val.els[i], el.firstChild);\n\
    } else {\n\
      el.appendChild(val.els[i]);\n\
    }\n\
  }\n\
  return val;\n\
};\n\
\n\
/**\n\
 * Append `val`.\n\
 *\n\
 * @param {String|Element|List} val\n\
 * @return {List} new list\n\
 * @api public\n\
 */\n\
\n\
List.prototype.append = function(val){\n\
  var el = this.els[0];\n\
  if (!el) return this;\n\
  val = dom(val);\n\
  for (var i = 0; i < val.els.length; ++i) {\n\
    el.appendChild(val.els[i]);\n\
  }\n\
  return val;\n\
};\n\
\n\
/**\n\
 * Append self's `el` to `val`\n\
 *\n\
 * @param {String|Element|List} val\n\
 * @return {List} self\n\
 * @api public\n\
 */\n\
\n\
List.prototype.appendTo = function(val){\n\
  dom(val).append(this);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Insert self's `els` after `val`\n\
 *\n\
 * @param {String|Element|List} val\n\
 * @return {List} self\n\
 * @api public\n\
 */\n\
\n\
List.prototype.insertAfter = function(val){\n\
  val = dom(val).els[0];\n\
  if (!val || !val.parentNode) return this;\n\
  this.els.forEach(function(el){\n\
    val.parentNode.insertBefore(el, val.nextSibling);\n\
  });\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Return a `List` containing the element at `i`.\n\
 *\n\
 * @param {Number} i\n\
 * @return {List}\n\
 * @api public\n\
 */\n\
\n\
List.prototype.at = function(i){\n\
  return new List([this.els[i]], this.selector);\n\
};\n\
\n\
/**\n\
 * Return a `List` containing the first element.\n\
 *\n\
 * @param {Number} i\n\
 * @return {List}\n\
 * @api public\n\
 */\n\
\n\
List.prototype.first = function(){\n\
  return new List([this.els[0]], this.selector);\n\
};\n\
\n\
/**\n\
 * Return a `List` containing the last element.\n\
 *\n\
 * @param {Number} i\n\
 * @return {List}\n\
 * @api public\n\
 */\n\
\n\
List.prototype.last = function(){\n\
  return new List([this.els[this.els.length - 1]], this.selector);\n\
};\n\
\n\
/**\n\
 * Return an `Element` at `i`.\n\
 *\n\
 * @param {Number} i\n\
 * @return {Element}\n\
 * @api public\n\
 */\n\
\n\
List.prototype.get = function(i){\n\
  return this.els[i || 0];\n\
};\n\
\n\
/**\n\
 * Return list length.\n\
 *\n\
 * @return {Number}\n\
 * @api public\n\
 */\n\
\n\
List.prototype.length = function(){\n\
  return this.els.length;\n\
};\n\
\n\
/**\n\
 * Return element text.\n\
 *\n\
 * @param {String} str\n\
 * @return {String|List}\n\
 * @api public\n\
 */\n\
\n\
List.prototype.text = function(str){\n\
  // TODO: real impl\n\
  if (1 == arguments.length) {\n\
    this.forEach(function(el){\n\
      el.textContent = str;\n\
    });\n\
    return this;\n\
  }\n\
\n\
  var str = '';\n\
  for (var i = 0; i < this.els.length; ++i) {\n\
    str += this.els[i].textContent;\n\
  }\n\
  return str;\n\
};\n\
\n\
/**\n\
 * Return element html.\n\
 *\n\
 * @return {String} html\n\
 * @api public\n\
 */\n\
\n\
List.prototype.html = function(html){\n\
  if (1 == arguments.length) {\n\
    this.forEach(function(el){\n\
      el.innerHTML = html;\n\
    });\n\
  }\n\
  // TODO: real impl\n\
  return this.els[0] && this.els[0].innerHTML;\n\
};\n\
\n\
/**\n\
 * Bind to `event` and invoke `fn(e)`. When\n\
 * a `selector` is given then events are delegated.\n\
 *\n\
 * @param {String} event\n\
 * @param {String} [selector]\n\
 * @param {Function} fn\n\
 * @param {Boolean} capture\n\
 * @return {List}\n\
 * @api public\n\
 */\n\
\n\
List.prototype.on = function(event, selector, fn, capture){\n\
  if ('string' == typeof selector) {\n\
    for (var i = 0; i < this.els.length; ++i) {\n\
      fn._delegate = delegate.bind(this.els[i], selector, event, fn, capture);\n\
    }\n\
    return this;\n\
  }\n\
\n\
  capture = fn;\n\
  fn = selector;\n\
\n\
  for (var i = 0; i < this.els.length; ++i) {\n\
    events.bind(this.els[i], event, fn, capture);\n\
  }\n\
\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Unbind to `event` and invoke `fn(e)`. When\n\
 * a `selector` is given then delegated event\n\
 * handlers are unbound.\n\
 *\n\
 * @param {String} event\n\
 * @param {String} [selector]\n\
 * @param {Function} fn\n\
 * @param {Boolean} capture\n\
 * @return {List}\n\
 * @api public\n\
 */\n\
\n\
List.prototype.off = function(event, selector, fn, capture){\n\
  if ('string' == typeof selector) {\n\
    for (var i = 0; i < this.els.length; ++i) {\n\
      // TODO: add selector support back\n\
      delegate.unbind(this.els[i], event, fn._delegate, capture);\n\
    }\n\
    return this;\n\
  }\n\
\n\
  capture = fn;\n\
  fn = selector;\n\
\n\
  for (var i = 0; i < this.els.length; ++i) {\n\
    events.unbind(this.els[i], event, fn, capture);\n\
  }\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Iterate elements and invoke `fn(list, i)`.\n\
 *\n\
 * @param {Function} fn\n\
 * @return {List} self\n\
 * @api public\n\
 */\n\
\n\
List.prototype.each = function(fn){\n\
  for (var i = 0; i < this.els.length; ++i) {\n\
    fn(new List([this.els[i]], this.selector), i);\n\
  }\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Iterate elements and invoke `fn(el, i)`.\n\
 *\n\
 * @param {Function} fn\n\
 * @return {List} self\n\
 * @api public\n\
 */\n\
\n\
List.prototype.forEach = function(fn){\n\
  for (var i = 0; i < this.els.length; ++i) {\n\
    fn(this.els[i], i);\n\
  }\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Map elements invoking `fn(list, i)`.\n\
 *\n\
 * @param {Function} fn\n\
 * @return {Array}\n\
 * @api public\n\
 */\n\
\n\
List.prototype.map = function(fn){\n\
  var arr = [];\n\
  for (var i = 0; i < this.els.length; ++i) {\n\
    arr.push(fn(new List([this.els[i]], this.selector), i));\n\
  }\n\
  return arr;\n\
};\n\
\n\
/**\n\
 * Filter elements invoking `fn(list, i)`, returning\n\
 * a new `List` of elements when a truthy value is returned.\n\
 *\n\
 * @param {Function} fn\n\
 * @return {List}\n\
 * @api public\n\
 */\n\
\n\
List.prototype.select =\n\
List.prototype.filter = function(fn){\n\
  var el;\n\
  var list = new List([], this.selector);\n\
  for (var i = 0; i < this.els.length; ++i) {\n\
    el = this.els[i];\n\
    if (fn(new List([el], this.selector), i)) list.els.push(el);\n\
  }\n\
  return list;\n\
};\n\
\n\
/**\n\
 * Filter elements invoking `fn(list, i)`, returning\n\
 * a new `List` of elements when a falsey value is returned.\n\
 *\n\
 * @param {Function} fn\n\
 * @return {List}\n\
 * @api public\n\
 */\n\
\n\
List.prototype.reject = function(fn){\n\
  var el;\n\
  var list = new List([], this.selector);\n\
  for (var i = 0; i < this.els.length; ++i) {\n\
    el = this.els[i];\n\
    if (!fn(new List([el], this.selector), i)) list.els.push(el);\n\
  }\n\
  return list;\n\
};\n\
\n\
/**\n\
 * Add the given class `name`.\n\
 *\n\
 * @param {String} name\n\
 * @return {List} self\n\
 * @api public\n\
 */\n\
\n\
List.prototype.addClass = function(name){\n\
  var el;\n\
  for (var i = 0; i < this.els.length; ++i) {\n\
    el = this.els[i];\n\
    el._classes = el._classes || classes(el);\n\
    el._classes.add(name);\n\
  }\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Remove the given class `name`.\n\
 *\n\
 * @param {String|RegExp} name\n\
 * @return {List} self\n\
 * @api public\n\
 */\n\
\n\
List.prototype.removeClass = function(name){\n\
  var el;\n\
\n\
  if ('regexp' == type(name)) {\n\
    for (var i = 0; i < this.els.length; ++i) {\n\
      el = this.els[i];\n\
      el._classes = el._classes || classes(el);\n\
      var arr = el._classes.array();\n\
      for (var j = 0; j < arr.length; j++) {\n\
        if (name.test(arr[j])) {\n\
          el._classes.remove(arr[j]);\n\
        }\n\
      }\n\
    }\n\
    return this;\n\
  }\n\
\n\
  for (var i = 0; i < this.els.length; ++i) {\n\
    el = this.els[i];\n\
    el._classes = el._classes || classes(el);\n\
    el._classes.remove(name);\n\
  }\n\
\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Toggle the given class `name`,\n\
 * optionally a `bool` may be given\n\
 * to indicate that the class should\n\
 * be added when truthy.\n\
 *\n\
 * @param {String} name\n\
 * @param {Boolean} bool\n\
 * @return {List} self\n\
 * @api public\n\
 */\n\
\n\
List.prototype.toggleClass = function(name, bool){\n\
  var el;\n\
  var fn = 'toggle';\n\
\n\
  // toggle with boolean\n\
  if (2 == arguments.length) {\n\
    fn = bool ? 'add' : 'remove';\n\
  }\n\
\n\
  for (var i = 0; i < this.els.length; ++i) {\n\
    el = this.els[i];\n\
    el._classes = el._classes || classes(el);\n\
    el._classes[fn](name);\n\
  }\n\
\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Check if the given class `name` is present.\n\
 *\n\
 * @param {String} name\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
List.prototype.hasClass = function(name){\n\
  var el;\n\
  for (var i = 0; i < this.els.length; ++i) {\n\
    el = this.els[i];\n\
    el._classes = el._classes || classes(el);\n\
    if (el._classes.has(name)) return true;\n\
  }\n\
  return false;\n\
};\n\
\n\
/**\n\
 * Set CSS `prop` to `val` or get `prop` value.\n\
 * Also accepts an object (`prop`: `val`)\n\
 *\n\
 * @param {String} prop\n\
 * @param {Mixed} val\n\
 * @return {List|String}\n\
 * @api public\n\
 */\n\
\n\
List.prototype.css = function(prop, val){\n\
  if (2 == arguments.length) {\n\
    var obj = {};\n\
    obj[prop] = val;\n\
    return this.setStyle(obj);\n\
  }\n\
\n\
  if ('object' == type(prop)) {\n\
    return this.setStyle(prop);\n\
  }\n\
\n\
  return this.getStyle(prop);\n\
};\n\
\n\
/**\n\
 * Set CSS `props`.\n\
 *\n\
 * @param {Object} props\n\
 * @return {List} self\n\
 * @api private\n\
 */\n\
\n\
List.prototype.setStyle = function(props){\n\
  for (var i = 0; i < this.els.length; ++i) {\n\
    css(this.els[i], props);\n\
  }\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Get CSS `prop` value.\n\
 *\n\
 * @param {String} prop\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
List.prototype.getStyle = function(prop){\n\
  var el = this.els[0];\n\
  if (el) return el.style[prop];\n\
};\n\
\n\
/**\n\
 * Find children matching the given `selector`.\n\
 *\n\
 * @param {String} selector\n\
 * @return {List}\n\
 * @api public\n\
 */\n\
\n\
List.prototype.find = function(selector){\n\
  return dom(selector, this);\n\
};\n\
\n\
/**\n\
 * Empty the dom list\n\
 *\n\
 * @return self\n\
 * @api public\n\
 */\n\
\n\
List.prototype.empty = function(){\n\
  var elem, el;\n\
\n\
  for (var i = 0; i < this.els.length; ++i) {\n\
    el = this.els[i];\n\
    while (el.firstChild) {\n\
      el.removeChild(el.firstChild);\n\
    }\n\
  }\n\
\n\
  return this;\n\
}\n\
\n\
/**\n\
 * Attribute accessors.\n\
 */\n\
\n\
attrs.forEach(function(name){\n\
  List.prototype[name] = function(val){\n\
    if (0 == arguments.length) return this.attr(name);\n\
    return this.attr(name, val);\n\
  };\n\
});\n\
\n\
//@ sourceURL=component-dom/index.js"
));
require.register("component-inherit/index.js", Function("exports, require, module",
"\n\
module.exports = function(a, b){\n\
  var fn = function(){};\n\
  fn.prototype = b.prototype;\n\
  a.prototype = new fn;\n\
  a.prototype.constructor = a;\n\
};//@ sourceURL=component-inherit/index.js"
));
require.register("component-reactive/lib/index.js", Function("exports, require, module",
"/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var adapter = require('./adapter');\n\
var AttrBinding = require('./attr-binding');\n\
var TextBinding = require('./text-binding');\n\
var debug = require('debug')('reactive');\n\
var bindings = require('./bindings');\n\
var Binding = require('./binding');\n\
var utils = require('./utils');\n\
var query = require('query');\n\
\n\
/**\n\
 * Expose `Reactive`.\n\
 */\n\
\n\
exports = module.exports = Reactive;\n\
\n\
/**\n\
 * Bindings.\n\
 */\n\
\n\
exports.bindings = {};\n\
\n\
/**\n\
 * Define subscription function.\n\
 *\n\
 * @param {Function} fn\n\
 * @api public\n\
 */\n\
\n\
exports.subscribe = function(fn){\n\
  adapter.subscribe = fn;\n\
};\n\
\n\
/**\n\
 * Define unsubscribe function.\n\
 *\n\
 * @param {Function} fn\n\
 * @api public\n\
 */\n\
\n\
exports.unsubscribe = function(fn){\n\
  adapter.unsubscribe = fn;\n\
};\n\
\n\
/**\n\
 * Define a get function.\n\
 *\n\
 * @param {Function} fn\n\
 * @api public\n\
 */\n\
\n\
exports.get = function(fn) {\n\
  adapter.get = fn;\n\
};\n\
\n\
/**\n\
 * Define a set function.\n\
 *\n\
 * @param {Function} fn\n\
 * @api public\n\
 */\n\
\n\
exports.set = function(fn) {\n\
  adapter.set = fn;\n\
};\n\
\n\
/**\n\
 * Expose adapter\n\
 */\n\
\n\
exports.adapter = adapter;\n\
\n\
/**\n\
 * Define binding `name` with callback `fn(el, val)`.\n\
 *\n\
 * @param {String} name or object\n\
 * @param {String|Object} name\n\
 * @param {Function} fn\n\
 * @api public\n\
 */\n\
\n\
exports.bind = function(name, fn){\n\
  if ('object' == typeof name) {\n\
    for (var key in name) {\n\
      exports.bind(key, name[key]);\n\
    }\n\
    return;\n\
  }\n\
\n\
  exports.bindings[name] = fn;\n\
};\n\
\n\
/**\n\
 * Initialize a reactive template for `el` and `obj`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {Element} obj\n\
 * @param {Object} options\n\
 * @api public\n\
 */\n\
\n\
function Reactive(el, obj, options) {\n\
  if (!(this instanceof Reactive)) return new Reactive(el, obj, options);\n\
  this.el = el;\n\
  this.obj = obj;\n\
  this.els = [];\n\
  this.fns = options || {}; // TODO: rename, this is awful\n\
  this.bindAll();\n\
  this.bindInterpolation(this.el, []);\n\
}\n\
\n\
/**\n\
 * Subscribe to changes on `prop`.\n\
 *\n\
 * @param {String} prop\n\
 * @param {Function} fn\n\
 * @return {Reactive}\n\
 * @api private\n\
 */\n\
\n\
Reactive.prototype.sub = function(prop, fn){\n\
  adapter.subscribe(this.obj, prop, fn);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Unsubscribe to changes from `prop`.\n\
 *\n\
 * @param {String} prop\n\
 * @param {Function} fn\n\
 * @return {Reactive}\n\
 * @api private\n\
 */\n\
\n\
Reactive.prototype.unsub = function(prop, fn){\n\
  adapter.unsubscribe(this.obj, prop, fn);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Get a `prop`\n\
 *\n\
 * @param {String} prop\n\
 * @param {Mixed} val\n\
 * @return {Mixed}\n\
 * @api private\n\
 */\n\
\n\
Reactive.prototype.get = function(prop) {\n\
  return adapter.get(this.obj, prop);\n\
};\n\
\n\
/**\n\
 * Set a `prop`\n\
 *\n\
 * @param {String} prop\n\
 * @param {Mixed} val\n\
 * @return {Reactive}\n\
 * @api private\n\
 */\n\
\n\
Reactive.prototype.set = function(prop, val) {\n\
  adapter.set(this.obj, prop, val);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Traverse and bind all interpolation within attributes and text.\n\
 *\n\
 * @param {Element} el\n\
 * @api private\n\
 */\n\
\n\
Reactive.prototype.bindInterpolation = function(el, els){\n\
\n\
  // element\n\
  if (el.nodeType == 1) {\n\
    for (var i = 0; i < el.attributes.length; i++) {\n\
      var attr = el.attributes[i];\n\
      if (utils.hasInterpolation(attr.value)) {\n\
        new AttrBinding(this, el, attr);\n\
      }\n\
    }\n\
  }\n\
\n\
  // text node\n\
  if (el.nodeType == 3) {\n\
    if (utils.hasInterpolation(el.data)) {\n\
      debug('bind text \"%s\"', el.data);\n\
      new TextBinding(this, el);\n\
    }\n\
  }\n\
\n\
  // walk nodes\n\
  for (var i = 0; i < el.childNodes.length; i++) {\n\
    var node = el.childNodes[i];\n\
    this.bindInterpolation(node, els);\n\
  }\n\
};\n\
\n\
/**\n\
 * Apply all bindings.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
Reactive.prototype.bindAll = function() {\n\
  for (var name in exports.bindings) {\n\
    this.bind(name, exports.bindings[name]);\n\
  }\n\
};\n\
\n\
/**\n\
 * Bind `name` to `fn`.\n\
 *\n\
 * @param {String|Object} name or object\n\
 * @param {Function} fn\n\
 * @api public\n\
 */\n\
\n\
Reactive.prototype.bind = function(name, fn) {\n\
  if ('object' == typeof name) {\n\
    for (var key in name) {\n\
      this.bind(key, name[key]);\n\
    }\n\
    return;\n\
  }\n\
\n\
  var obj = this.obj;\n\
  var els = query.all('[' + name + ']', this.el);\n\
  if (!els.length) return;\n\
\n\
  debug('bind [%s] (%d elements)', name, els.length);\n\
  for (var i = 0; i < els.length; i++) {\n\
    var binding = new Binding(name, this, els[i], fn);\n\
    binding.bind();\n\
  }\n\
};\n\
\n\
// bundled bindings\n\
\n\
bindings(exports.bind);\n\
//@ sourceURL=component-reactive/lib/index.js"
));
require.register("component-reactive/lib/utils.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var debug = require('debug')('reactive:utils');\n\
var props = require('props');\n\
var adapter = require('./adapter');\n\
\n\
/**\n\
 * Function cache.\n\
 */\n\
\n\
var cache = {};\n\
\n\
/**\n\
 * Return interpolation property names in `str`,\n\
 * for example \"{foo} and {bar}\" would return\n\
 * ['foo', 'bar'].\n\
 *\n\
 * @param {String} str\n\
 * @return {Array}\n\
 * @api private\n\
 */\n\
\n\
exports.interpolationProps = function(str) {\n\
  var m;\n\
  var arr = [];\n\
  var re = /\\{([^}]+)\\}/g;\n\
\n\
  while (m = re.exec(str)) {\n\
    var expr = m[1];\n\
    arr = arr.concat(props(expr));\n\
  }\n\
\n\
  return unique(arr);\n\
};\n\
\n\
/**\n\
 * Interpolate `str` with the given `fn`.\n\
 *\n\
 * @param {String} str\n\
 * @param {Function} fn\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
exports.interpolate = function(str, fn){\n\
  return str.replace(/\\{([^}]+)\\}/g, function(_, expr){\n\
    var cb = cache[expr];\n\
    if (!cb) cb = cache[expr] = compile(expr);\n\
    return fn(expr.trim(), cb);\n\
  });\n\
};\n\
\n\
/**\n\
 * Check if `str` has interpolation.\n\
 *\n\
 * @param {String} str\n\
 * @return {Boolean}\n\
 * @api private\n\
 */\n\
\n\
exports.hasInterpolation = function(str) {\n\
  return ~str.indexOf('{');\n\
};\n\
\n\
/**\n\
 * Remove computed properties notation from `str`.\n\
 *\n\
 * @param {String} str\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
exports.clean = function(str) {\n\
  return str.split('<')[0].trim();\n\
};\n\
\n\
/**\n\
 * Call `prop` on `model` or `view`.\n\
 *\n\
 * @param {Object} model\n\
 * @param {Object} view\n\
 * @param {String} prop\n\
 * @return {Mixed}\n\
 * @api private\n\
 */\n\
\n\
exports.call = function(model, view, prop){\n\
  // view method\n\
  if ('function' == typeof view[prop]) {\n\
    return view[prop]();\n\
  }\n\
\n\
  // view value\n\
  if (view.hasOwnProperty(prop)) {\n\
    return view[prop];\n\
  }\n\
\n\
  // get property from model\n\
  return adapter.get(model, prop);\n\
};\n\
\n\
/**\n\
 * Compile `expr` to a `Function`.\n\
 *\n\
 * @param {String} expr\n\
 * @return {Function}\n\
 * @api private\n\
 */\n\
\n\
function compile(expr) {\n\
  // TODO: use props() callback instead\n\
  var re = /\\.\\w+|\\w+ *\\(|\"[^\"]*\"|'[^']*'|\\/([^/]+)\\/|[a-zA-Z_]\\w*/g;\n\
  var p = props(expr);\n\
\n\
  var body = expr.replace(re, function(_) {\n\
    if ('(' == _[_.length - 1]) return access(_);\n\
    if (!~p.indexOf(_)) return _;\n\
    return call(_);\n\
  });\n\
\n\
  debug('compile `%s`', body);\n\
  return new Function('model', 'view', 'call', 'return ' + body);\n\
}\n\
\n\
/**\n\
 * Access a method `prop` with dot notation.\n\
 *\n\
 * @param {String} prop\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
function access(prop) {\n\
  return 'model.' + prop;\n\
}\n\
\n\
/**\n\
 * Call `prop` on view, model, or access the model's property.\n\
 *\n\
 * @param {String} prop\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
function call(prop) {\n\
  return 'call(model, view, \"' + prop + '\")';\n\
}\n\
\n\
/**\n\
 * Return unique array.\n\
 *\n\
 * @param {Array} arr\n\
 * @return {Array}\n\
 * @api private\n\
 */\n\
\n\
function unique(arr) {\n\
  var ret = [];\n\
\n\
  for (var i = 0; i < arr.length; i++) {\n\
    if (~ret.indexOf(arr[i])) continue;\n\
    ret.push(arr[i]);\n\
  }\n\
\n\
  return ret;\n\
}\n\
//@ sourceURL=component-reactive/lib/utils.js"
));
require.register("component-reactive/lib/text-binding.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var debug = require('debug')('reactive:text-binding');\n\
var utils = require('./utils');\n\
\n\
/**\n\
 * Expose `TextBinding`.\n\
 */\n\
\n\
module.exports = TextBinding;\n\
\n\
/**\n\
 * Initialize a new text binding.\n\
 *\n\
 * @param {Reactive} view\n\
 * @param {Element} node\n\
 * @param {Attribute} attr\n\
 * @api private\n\
 */\n\
\n\
function TextBinding(view, node) {\n\
  var self = this;\n\
  this.view = view;\n\
  this.text = node.data;\n\
  this.node = node;\n\
  this.props = utils.interpolationProps(this.text);\n\
  this.subscribe();\n\
  this.render();\n\
}\n\
\n\
/**\n\
 * Subscribe to changes.\n\
 */\n\
\n\
TextBinding.prototype.subscribe = function(){\n\
  var self = this;\n\
  var view = this.view;\n\
  this.props.forEach(function(prop){\n\
    view.sub(prop, function(){\n\
      self.render();\n\
    });\n\
  });\n\
};\n\
\n\
/**\n\
 * Render text.\n\
 */\n\
\n\
TextBinding.prototype.render = function(){\n\
  var node = this.node;\n\
  var text = this.text;\n\
  var view = this.view;\n\
  var obj = view.obj;\n\
\n\
  // TODO: delegate most of this to `Reactive`\n\
  debug('render \"%s\"', text);\n\
  node.data = utils.interpolate(text, function(prop, fn){\n\
    if (fn) {\n\
      return fn(obj, view.fns, utils.call);\n\
    } else {\n\
      return view.get(obj, prop);\n\
    }\n\
  });\n\
};\n\
//@ sourceURL=component-reactive/lib/text-binding.js"
));
require.register("component-reactive/lib/attr-binding.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var debug = require('debug')('reactive:attr-binding');\n\
var utils = require('./utils');\n\
\n\
/**\n\
 * Expose `AttrBinding`.\n\
 */\n\
\n\
module.exports = AttrBinding;\n\
\n\
/**\n\
 * Initialize a new attribute binding.\n\
 *\n\
 * @param {Reactive} view\n\
 * @param {Element} node\n\
 * @param {Attribute} attr\n\
 * @api private\n\
 */\n\
\n\
function AttrBinding(view, node, attr) {\n\
  var self = this;\n\
  this.view = view;\n\
  this.node = node;\n\
  this.attr = attr;\n\
  this.text = attr.value;\n\
  this.props = utils.interpolationProps(this.text);\n\
  this.subscribe();\n\
  this.render();\n\
}\n\
\n\
/**\n\
 * Subscribe to changes.\n\
 */\n\
\n\
AttrBinding.prototype.subscribe = function(){\n\
  var self = this;\n\
  var view = this.view;\n\
  this.props.forEach(function(prop){\n\
    view.sub(prop, function(){\n\
      self.render();\n\
    });\n\
  });\n\
};\n\
\n\
/**\n\
 * Render the value.\n\
 */\n\
\n\
AttrBinding.prototype.render = function(){\n\
  var attr = this.attr;\n\
  var text = this.text;\n\
  var view = this.view;\n\
  var obj = view.obj;\n\
\n\
  // TODO: delegate most of this to `Reactive`\n\
  debug('render %s \"%s\"', attr.name, text);\n\
  attr.value = utils.interpolate(text, function(prop, fn){\n\
    if (fn) {\n\
      return fn(obj, view.fns, utils.call);\n\
    } else {\n\
      return view.get(obj, prop);\n\
    }\n\
  });\n\
};\n\
//@ sourceURL=component-reactive/lib/attr-binding.js"
));
require.register("component-reactive/lib/binding.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var parse = require('format-parser');\n\
\n\
/**\n\
 * Expose `Binding`.\n\
 */\n\
\n\
module.exports = Binding;\n\
\n\
/**\n\
 * Initialize a binding.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
function Binding(name, view, el, fn) {\n\
  this.name = name;\n\
  this.view = view;\n\
  this.obj = view.obj;\n\
  this.fns = view.fns;\n\
  this.el = el;\n\
  this.fn = fn;\n\
}\n\
\n\
/**\n\
 * Apply the binding.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
Binding.prototype.bind = function() {\n\
  var val = this.el.getAttribute(this.name);\n\
  this.fn(this.el, val, this.obj);\n\
};\n\
\n\
/**\n\
 * Perform interpolation on `name`.\n\
 *\n\
 * @param {String} name\n\
 * @return {String}\n\
 * @api public\n\
 */\n\
\n\
Binding.prototype.interpolate = function(name) {\n\
  var self = this;\n\
  name = clean(name);\n\
\n\
  if (~name.indexOf('{')) {\n\
    return name.replace(/{([^}]+)}/g, function(_, name){\n\
      return self.value(name);\n\
    });\n\
  }\n\
\n\
  return this.formatted(name);\n\
};\n\
\n\
/**\n\
 * Return value for property `name`.\n\
 *\n\
 *  - check if the \"view\" has a `name` method\n\
 *  - check if the \"model\" has a `name` method\n\
 *  - check if the \"model\" has a `name` property\n\
 *\n\
 * @param {String} name\n\
 * @return {Mixed}\n\
 * @api public\n\
 */\n\
\n\
Binding.prototype.value = function(name) {\n\
  var self = this;\n\
  var obj = this.obj;\n\
  var view = this.view;\n\
  var fns = view.fns;\n\
  name = clean(name);\n\
\n\
  // view method\n\
  if ('function' == typeof fns[name]) {\n\
    return fns[name]();\n\
  }\n\
\n\
  // view value\n\
  if (fns.hasOwnProperty(name)) {\n\
    return fns[name];\n\
  }\n\
\n\
  return view.get(name);\n\
};\n\
\n\
/**\n\
 * Return formatted property.\n\
 *\n\
 * @param {String} fmt\n\
 * @return {Mixed}\n\
 * @api public\n\
 */\n\
\n\
Binding.prototype.formatted = function(fmt) {\n\
  var calls = parse(clean(fmt));\n\
  var name = calls[0].name;\n\
  var val = this.value(name);\n\
\n\
  for (var i = 1; i < calls.length; ++i) {\n\
    var call = calls[i];\n\
    call.args.unshift(val);\n\
    var fn = this.fns[call.name];\n\
    val = fn.apply(this.fns, call.args);\n\
  }\n\
\n\
  return val;\n\
};\n\
\n\
/**\n\
 * Invoke `fn` on changes.\n\
 *\n\
 * @param {Function} fn\n\
 * @api public\n\
 */\n\
\n\
Binding.prototype.change = function(fn) {\n\
  fn.call(this);\n\
\n\
  var self = this;\n\
  var view = this.view;\n\
  var val = this.el.getAttribute(this.name);\n\
\n\
  // computed props\n\
  var parts = val.split('<');\n\
  val = parts[0];\n\
  var computed = parts[1];\n\
  if (computed) computed = computed.trim().split(/\\s+/);\n\
\n\
  // interpolation\n\
  if (hasInterpolation(val)) {\n\
    var props = interpolationProps(val);\n\
    props.forEach(function(prop){\n\
      view.sub(prop, fn.bind(self));\n\
    });\n\
    return;\n\
  }\n\
\n\
  // formatting\n\
  var calls = parse(val);\n\
  var prop = calls[0].name;\n\
\n\
  // computed props\n\
  if (computed) {\n\
    computed.forEach(function(prop){\n\
      view.sub(prop, fn.bind(self));\n\
    });\n\
    return;\n\
  }\n\
\n\
  // bind to prop\n\
  view.sub(prop, fn.bind(this));\n\
};\n\
\n\
/**\n\
 * Return interpolation property names in `str`,\n\
 * for example \"{foo} and {bar}\" would return\n\
 * ['foo', 'bar'].\n\
 *\n\
 * @param {String} str\n\
 * @return {Array}\n\
 * @api private\n\
 */\n\
\n\
function interpolationProps(str) {\n\
  var m;\n\
  var arr = [];\n\
  var re = /\\{([^}]+)\\}/g;\n\
  while (m = re.exec(str)) {\n\
    arr.push(m[1]);\n\
  }\n\
  return arr;\n\
}\n\
\n\
/**\n\
 * Check if `str` has interpolation.\n\
 *\n\
 * @param {String} str\n\
 * @return {Boolean}\n\
 * @api private\n\
 */\n\
\n\
function hasInterpolation(str) {\n\
  return ~str.indexOf('{');\n\
}\n\
\n\
/**\n\
 * Remove computed properties notation from `str`.\n\
 *\n\
 * @param {String} str\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
function clean(str) {\n\
  return str.split('<')[0].trim();\n\
}\n\
//@ sourceURL=component-reactive/lib/binding.js"
));
require.register("component-reactive/lib/bindings.js", Function("exports, require, module",
"/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var classes = require('classes');\n\
var event = require('event');\n\
\n\
/**\n\
 * Attributes supported.\n\
 */\n\
\n\
var attrs = [\n\
  'id',\n\
  'src',\n\
  'rel',\n\
  'cols',\n\
  'rows',\n\
  'name',\n\
  'href',\n\
  'title',\n\
  'class',\n\
  'style',\n\
  'width',\n\
  'value',\n\
  'height',\n\
  'tabindex',\n\
  'placeholder'\n\
];\n\
\n\
/**\n\
 * Events supported.\n\
 */\n\
\n\
var events = [\n\
  'change',\n\
  'click',\n\
  'dblclick',\n\
  'mousedown',\n\
  'mouseup',\n\
  'blur',\n\
  'focus',\n\
  'input',\n\
  'submit',\n\
  'keydown',\n\
  'keypress',\n\
  'keyup'\n\
];\n\
\n\
/**\n\
 * Apply bindings.\n\
 */\n\
\n\
module.exports = function(bind){\n\
\n\
  /**\n\
   * Generate attribute bindings.\n\
   */\n\
\n\
  attrs.forEach(function(attr){\n\
    bind('data-' + attr, function(el, name, obj){\n\
      this.change(function(){\n\
        el.setAttribute(attr, this.interpolate(name));\n\
      });\n\
    });\n\
  });\n\
\n\
/**\n\
 * Append child element.\n\
 */\n\
\n\
  bind('data-append', function(el, name){\n\
    var other = this.value(name);\n\
    el.appendChild(other);\n\
  });\n\
\n\
/**\n\
 * Replace element.\n\
 */\n\
\n\
  bind('data-replace', function(el, name){\n\
    var other = this.value(name);\n\
    el.parentNode.replaceChild(other, el);\n\
  });\n\
\n\
  /**\n\
   * Show binding.\n\
   */\n\
\n\
  bind('data-show', function(el, name){\n\
    this.change(function(){\n\
      if (this.value(name)) {\n\
        classes(el).add('show').remove('hide');\n\
      } else {\n\
        classes(el).remove('show').add('hide');\n\
      }\n\
    });\n\
  });\n\
\n\
  /**\n\
   * Hide binding.\n\
   */\n\
\n\
  bind('data-hide', function(el, name){\n\
    this.change(function(){\n\
      if (this.value(name)) {\n\
        classes(el).remove('show').add('hide');\n\
      } else {\n\
        classes(el).add('show').remove('hide');\n\
      }\n\
    });\n\
  });\n\
\n\
  /**\n\
   * Checked binding.\n\
   */\n\
\n\
  bind('data-checked', function(el, name){\n\
    this.change(function(){\n\
      if (this.value(name)) {\n\
        el.setAttribute('checked', 'checked');\n\
      } else {\n\
        el.removeAttribute('checked');\n\
      }\n\
    });\n\
  });\n\
\n\
  /**\n\
   * Text binding.\n\
   */\n\
\n\
  bind('data-text', function(el, name){\n\
    this.change(function(){\n\
      el.textContent = this.interpolate(name);\n\
    });\n\
  });\n\
\n\
  /**\n\
   * HTML binding.\n\
   */\n\
\n\
  bind('data-html', function(el, name){\n\
    this.change(function(){\n\
      el.innerHTML = this.formatted(name);\n\
    });\n\
  });\n\
\n\
  /**\n\
   * Generate event bindings.\n\
   */\n\
\n\
  events.forEach(function(name){\n\
    bind('on-' + name, function(el, method){\n\
      var fns = this.view.fns\n\
      event.bind(el, name, function(e){\n\
        var fn = fns[method];\n\
        if (!fn) throw new Error('method .' + method + '() missing');\n\
        fns[method](e);\n\
      });\n\
    });\n\
  });\n\
};\n\
//@ sourceURL=component-reactive/lib/bindings.js"
));
require.register("component-reactive/lib/adapter.js", Function("exports, require, module",
"/**\n\
 * Default subscription method.\n\
 * Subscribe to changes on the model.\n\
 *\n\
 * @param {Object} obj\n\
 * @param {String} prop\n\
 * @param {Function} fn\n\
 */\n\
\n\
exports.subscribe = function(obj, prop, fn) {\n\
  if (!obj.on) return;\n\
  obj.on('change ' + prop, fn);\n\
};\n\
\n\
/**\n\
 * Default unsubscription method.\n\
 * Unsubscribe from changes on the model.\n\
 */\n\
\n\
exports.unsubscribe = function(obj, prop, fn) {\n\
  if (!obj.off) return;\n\
  obj.off('change ' + prop, fn);\n\
};\n\
\n\
/**\n\
 * Default setter method.\n\
 * Set a property on the model.\n\
 *\n\
 * @param {Object} obj\n\
 * @param {String} prop\n\
 * @param {Mixed} val\n\
 */\n\
\n\
exports.set = function(obj, prop, val) {\n\
  if ('function' == typeof obj[prop]) {\n\
    obj[prop](val);\n\
  } else {\n\
    obj[prop] = val;\n\
  }\n\
};\n\
\n\
/**\n\
 * Default getter method.\n\
 * Get a property from the model.\n\
 *\n\
 * @param {Object} obj\n\
 * @param {String} prop\n\
 * @return {Mixed}\n\
 */\n\
\n\
exports.get = function(obj, prop) {\n\
  if ('function' == typeof obj[prop]) {\n\
    return obj[prop]();\n\
  } else {\n\
    return obj[prop];\n\
  }\n\
};\n\
//@ sourceURL=component-reactive/lib/adapter.js"
));
require.register("ianstormtaylor-get/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Get a value from a obj, by direct access, named getter/setter or via `get`.\n\
 *\n\
 * @param {Object} obj\n\
 * @param {String} prop\n\
 */\n\
\n\
module.exports = function get (obj, prop) {\n\
\n\
  // named getter/setter\n\
  if ('function' === typeof obj[prop]) {\n\
    return obj[prop]();\n\
  }\n\
\n\
  // get method\n\
  if ('function' === typeof obj.get) {\n\
    return obj.get(prop);\n\
  }\n\
\n\
  // plain object\n\
  return obj[prop];\n\
};//@ sourceURL=ianstormtaylor-get/index.js"
));
require.register("component-bind/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Slice reference.\n\
 */\n\
\n\
var slice = [].slice;\n\
\n\
/**\n\
 * Bind `obj` to `fn`.\n\
 *\n\
 * @param {Object} obj\n\
 * @param {Function|String} fn or string\n\
 * @return {Function}\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(obj, fn){\n\
  if ('string' == typeof fn) fn = obj[fn];\n\
  if ('function' != typeof fn) throw new Error('bind() requires a function');\n\
  var args = [].slice.call(arguments, 2);\n\
  return function(){\n\
    return fn.apply(obj, args.concat(slice.call(arguments)));\n\
  }\n\
};\n\
//@ sourceURL=component-bind/index.js"
));
require.register("segmentio-emitter/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var index = require('indexof');\n\
\n\
/**\n\
 * Expose `Emitter`.\n\
 */\n\
\n\
module.exports = Emitter;\n\
\n\
/**\n\
 * Initialize a new `Emitter`.\n\
 *\n\
 * @api public\n\
 */\n\
\n\
function Emitter(obj) {\n\
  if (obj) return mixin(obj);\n\
};\n\
\n\
/**\n\
 * Mixin the emitter properties.\n\
 *\n\
 * @param {Object} obj\n\
 * @return {Object}\n\
 * @api private\n\
 */\n\
\n\
function mixin(obj) {\n\
  for (var key in Emitter.prototype) {\n\
    obj[key] = Emitter.prototype[key];\n\
  }\n\
  return obj;\n\
}\n\
\n\
/**\n\
 * Listen on the given `event` with `fn`.\n\
 *\n\
 * @param {String} event\n\
 * @param {Function} fn\n\
 * @return {Emitter}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.on = function(event, fn){\n\
  this._callbacks = this._callbacks || {};\n\
  (this._callbacks[event] = this._callbacks[event] || [])\n\
    .push(fn);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Adds an `event` listener that will be invoked a single\n\
 * time then automatically removed.\n\
 *\n\
 * @param {String} event\n\
 * @param {Function} fn\n\
 * @return {Emitter}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.once = function(event, fn){\n\
  var self = this;\n\
  this._callbacks = this._callbacks || {};\n\
\n\
  function on() {\n\
    self.off(event, on);\n\
    fn.apply(this, arguments);\n\
  }\n\
\n\
  fn._off = on;\n\
  this.on(event, on);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Remove the given callback for `event` or all\n\
 * registered callbacks.\n\
 *\n\
 * @param {String} event\n\
 * @param {Function} fn\n\
 * @return {Emitter}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.off =\n\
Emitter.prototype.removeListener =\n\
Emitter.prototype.removeAllListeners = function(event, fn){\n\
  this._callbacks = this._callbacks || {};\n\
\n\
  // all\n\
  if (0 == arguments.length) {\n\
    this._callbacks = {};\n\
    return this;\n\
  }\n\
\n\
  // specific event\n\
  var callbacks = this._callbacks[event];\n\
  if (!callbacks) return this;\n\
\n\
  // remove all handlers\n\
  if (1 == arguments.length) {\n\
    delete this._callbacks[event];\n\
    return this;\n\
  }\n\
\n\
  // remove specific handler\n\
  var i = index(callbacks, fn._off || fn);\n\
  if (~i) callbacks.splice(i, 1);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Emit `event` with the given args.\n\
 *\n\
 * @param {String} event\n\
 * @param {Mixed} ...\n\
 * @return {Emitter}\n\
 */\n\
\n\
Emitter.prototype.emit = function(event){\n\
  this._callbacks = this._callbacks || {};\n\
  var args = [].slice.call(arguments, 1)\n\
    , callbacks = this._callbacks[event];\n\
\n\
  // \"all\" event\n\
  if ('*' != event) this.emit.apply(this, ['*', event].concat(args));\n\
\n\
  if (callbacks) {\n\
    callbacks = callbacks.slice(0);\n\
    for (var i = 0, len = callbacks.length; i < len; ++i) {\n\
      callbacks[i].apply(this, args);\n\
    }\n\
  }\n\
\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Return array of callbacks for `event`.\n\
 *\n\
 * @param {String} event\n\
 * @return {Array}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.listeners = function(event){\n\
  this._callbacks = this._callbacks || {};\n\
  return this._callbacks[event] || [];\n\
};\n\
\n\
/**\n\
 * Check if this emitter has `event` handlers.\n\
 *\n\
 * @param {String} event\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.hasListeners = function(event){\n\
  return !! this.listeners(event).length;\n\
};\n\
//@ sourceURL=segmentio-emitter/index.js"
));
require.register("segmentio-list/lib/index.js", Function("exports, require, module",
"\n\
var dom = require('dom')\n\
  , Emitter = require('emitter')\n\
  , protos = require('./protos')\n\
  , statics = require('./statics');\n\
\n\
\n\
/**\n\
 * Expose `createList`.\n\
 */\n\
\n\
module.exports = createList;\n\
\n\
\n\
/**\n\
 * Create a `List` with the given `Item` constructor.\n\
 *\n\
 * @param {Function} Item\n\
 */\n\
\n\
function createList (Item) {\n\
\n\
  /**\n\
   * Initialize a new `List`.\n\
   */\n\
\n\
  function List () {\n\
    this.Item = Item;\n\
    this.el = document.createElement('ul');\n\
    this.items = {};\n\
    this.list = dom([]);\n\
    this.List.emit('construct', this);\n\
  }\n\
\n\
  // statics & protos\n\
  List.prototype.List = List;\n\
  for (var key in statics) List[key] = statics[key];\n\
  for (var key in protos) List.prototype[key] = protos[key];\n\
\n\
  return List;\n\
}//@ sourceURL=segmentio-list/lib/index.js"
));
require.register("segmentio-list/lib/protos.js", Function("exports, require, module",
"\n\
var bind = require('bind')\n\
  , dom = require('dom')\n\
  , each = require('each')\n\
  , Emitter = require('emitter')\n\
  , get = require('get')\n\
  , sort = require('sort');\n\
\n\
\n\
/**\n\
 * Mixin emitter.\n\
 */\n\
\n\
Emitter(exports);\n\
\n\
\n\
/**\n\
 * Add an item to the list.\n\
 *\n\
 * @param {Object} model\n\
 * @return {List}\n\
 */\n\
\n\
exports.add = function (model) {\n\
  var self = this;\n\
\n\
  var view = new this.Item(model);\n\
  if (view.on) {\n\
    view.on('*', function () {\n\
      var args = Array.prototype.slice.call(arguments);\n\
      args[0] = 'item ' + args[0];\n\
      self.emit.apply(self, args);\n\
    });\n\
  }\n\
\n\
  var el = view.el;\n\
  var id = get(model, 'primary') || get(model, 'id');\n\
  this.items[id] = {\n\
    el    : el,\n\
    model : model,\n\
    view  : view\n\
  };\n\
\n\
  this.list.els.push(el);\n\
  this.el.appendChild(el);\n\
  this.emit('add', el, model, view);\n\
  return this;\n\
};\n\
\n\
\n\
/**\n\
 * Remove an item from the list.\n\
 *\n\
 * @param {String} id\n\
 * @return {List}\n\
 */\n\
\n\
exports.remove = function (id) {\n\
  var item = this.items[id];\n\
  var el = item.el;\n\
  delete this.items[id];\n\
  if (!el) return;\n\
\n\
  this.list = this.list.reject(function (_) { el === _.get(0); });\n\
  this.el.removeChild(el);\n\
  this.emit('remove', el, item.model, item.view);\n\
  return this;\n\
};\n\
\n\
\n\
/**\n\
 * Filter the list's elements by hiding ones that don't match.\n\
 *\n\
 * @param {Function} fn\n\
 * @return {List}\n\
 */\n\
\n\
exports.filter = function (fn) {\n\
  this.list.removeClass('hidden');\n\
  this.list.reject(fn).addClass('hidden');\n\
  return this;\n\
};\n\
\n\
\n\
/**\n\
 * Sort the list's elements by an iterator `fn`.\n\
 *\n\
 * @param {Function} fn\n\
 * @return {List}\n\
 */\n\
\n\
exports.sort = function (fn) {\n\
  sort(this.el, fn);\n\
  return this;\n\
};\n\
\n\
\n\
/**\n\
 * Empty the list.\n\
 *\n\
 * @return {List}\n\
 */\n\
\n\
exports.empty = function () {\n\
  var self = this;\n\
  var items = this.items;\n\
  this.items = {};\n\
  this.list = dom([]);\n\
  each(items, function (id, item) {\n\
    dom(item.el).remove();\n\
    item.view.off('*');\n\
    self.emit('remove', item.el, item.model, item.view);\n\
  });\n\
  return this;\n\
};\n\
\n\
\n\
/**\n\
 * Add a class to the list.\n\
 *\n\
 * @param {String} name\n\
 * @return {List}\n\
 */\n\
\n\
exports.addClass = function (name) {\n\
  dom(this.el).addClass(name);\n\
  return this;\n\
};\n\
\n\
\n\
/**\n\
 * Remove a class from the list.\n\
 *\n\
 * @param {String} name\n\
 * @return {List}\n\
 */\n\
\n\
exports.removeClass = function (name) {\n\
  dom(this.el).removeClass(name);\n\
  return this;\n\
};//@ sourceURL=segmentio-list/lib/protos.js"
));
require.register("segmentio-list/lib/statics.js", Function("exports, require, module",
"\n\
var Emitter = require('emitter');\n\
\n\
\n\
/**\n\
 * Mixin emitter.\n\
 */\n\
\n\
Emitter(exports);\n\
\n\
\n\
/**\n\
 * Use a given `plugin`.\n\
 *\n\
 * @param {Function} plugin\n\
 */\n\
\n\
exports.use = function (plugin) {\n\
  plugin(this);\n\
  return this;\n\
};//@ sourceURL=segmentio-list/lib/statics.js"
));
require.register("yields-slug/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Generate a slug from the given `str`.\n\
 *\n\
 * example:\n\
 *\n\
 *        generate('foo bar');\n\
 *        // > foo-bar\n\
 *\n\
 * options:\n\
 *\n\
 *    - `.replace` characters to replace, defaulted to `/[^a-z0-9]/g`\n\
 *    - `.separator` separator to insert, defaulted to `-`\n\
 *\n\
 * @param {String} str\n\
 * @param {Object} opts\n\
 * @return {String}\n\
 */\n\
\n\
module.exports = function(str, opts){\n\
  opts = opts || {};\n\
  return str.toLowerCase()\n\
    .replace(opts.replace || /[^a-z0-9]/g, ' ')\n\
    .replace(/^ +| +$/g, '')\n\
    .replace(/ +/g, opts.separator || '-')\n\
};\n\
//@ sourceURL=yields-slug/index.js"
));
require.register("segmentio-menu/lib/index.js", Function("exports, require, module",
"\n\
var domify = require('domify')\n\
  , inherit = require('inherit')\n\
  , Item = require('./item')\n\
  , list = require('list')\n\
  , protos = require('./protos')\n\
  , statics = require('./statics');\n\
\n\
\n\
/**\n\
 * Expose the default `Menu`.\n\
 */\n\
\n\
module.exports = createMenu(Item);\n\
\n\
\n\
/**\n\
 * Create a `Menu` constructor with a given `MenuItem` view.\n\
 *\n\
 * @param {Function} MenuItem\n\
 */\n\
\n\
function createMenu (MenuItem) {\n\
\n\
  var List = list(MenuItem);\n\
\n\
  /**\n\
   * Initialize a new `Menu`.\n\
   *\n\
   * @param {Function} View (optional)\n\
   */\n\
\n\
  function Menu () {\n\
    if (!(this instanceof Menu)) return createMenu.apply(this, arguments);\n\
    List.apply(this, arguments);\n\
    this.el = domify('<menu class=\"menu\">');\n\
    this.type('list'); // default menu type\n\
    this.Menu.emit('construct', this);\n\
  }\n\
\n\
  // inherit from List\n\
  inherit(Menu, List);\n\
\n\
  // statics + protos\n\
  Menu.prototype.Menu = Menu;\n\
  for (var key in statics) Menu[key] = statics[key];\n\
  for (var key in protos) Menu.prototype[key] = protos[key];\n\
\n\
  return Menu;\n\
}//@ sourceURL=segmentio-menu/lib/index.js"
));
require.register("segmentio-menu/lib/item.js", Function("exports, require, module",
"\n\
var domify = require('domify')\n\
  , get = require('get')\n\
  , reactive = require('reactive')\n\
  , slug = require('slug')\n\
  , template = require('./template');\n\
\n\
\n\
/**\n\
 * Expose `ItemView`.\n\
 */\n\
\n\
module.exports = ItemView;\n\
\n\
\n\
/**\n\
 * Initialize a new `ItemView`.\n\
 */\n\
\n\
function ItemView (model) {\n\
  this.model = model;\n\
  this.el = domify(template);\n\
  this.reactive = reactive(this.el, model, this);\n\
}\n\
\n\
\n\
/**\n\
 * Get the id of the model.\n\
 *\n\
 * @return {String}\n\
 */\n\
\n\
ItemView.prototype.id = function () {\n\
  return get(this.model, 'id') || get(this.model, 'primary');\n\
};\n\
\n\
\n\
/**\n\
 * Make a slug out of the id.\n\
 *\n\
 * @return {String}\n\
 */\n\
\n\
ItemView.prototype.slug = function () {\n\
  return slug(this.id());\n\
};//@ sourceURL=segmentio-menu/lib/item.js"
));
require.register("segmentio-menu/lib/protos.js", Function("exports, require, module",
"\n\
var dom = require('dom')\n\
  , get = require('get');\n\
\n\
\n\
/**\n\
 * Set the menu's `type`.\n\
 *\n\
 * TODO: handle context menus (hidden, moveable, etc.)\n\
 *\n\
 * @param {String} type  Either 'context', 'toolbar' or 'list'.\n\
 * @return {Menu}\n\
 */\n\
\n\
exports.type = function (type) {\n\
  this._type = type;\n\
  dom(this.el).attr('type', type);\n\
  if ('context' === type) this.hide();\n\
  return this;\n\
};\n\
\n\
\n\
/**\n\
 * Add an item to the menu.\n\
 *\n\
 * @param {Object} model\n\
 * @return {Menu}\n\
 */\n\
\n\
exports.add = function (model) {\n\
  if ('string' === typeof model) model = { id: model };\n\
  this.List.prototype.add.call(this, model);\n\
\n\
  var id = primary(model);\n\
  var el = this.items[id].el;\n\
  var view = this.items[id].view;\n\
  var self = this;\n\
\n\
  // no href, bind to click\n\
  if (!get(model, 'href')) {\n\
    dom(el).on('click', function (e) {\n\
      e.preventDefault();\n\
      e.stopPropagation();\n\
      self.emit('select', el, model, view);\n\
      self.select(id);\n\
    });\n\
  }\n\
\n\
  this.emit('add', el, model, view);\n\
  return this;\n\
};\n\
\n\
\n\
/**\n\
 * Select an item by `id`.\n\
 *\n\
 * @param {String} id\n\
 * @return {Menu}\n\
 */\n\
\n\
exports.select = function (id) {\n\
  this.deselect();\n\
  var item = this.items[id];\n\
  if (!item) return this;\n\
\n\
  var el = item.el;\n\
  var model = item.model;\n\
  var view = item.view;\n\
  dom(el).addClass('selected');\n\
  this.emit('select', el, model, view);\n\
  return this;\n\
};\n\
\n\
\n\
/**\n\
 * Deselect all the items.\n\
 *\n\
 * @return {Menu}\n\
 */\n\
\n\
exports.deselect = function () {\n\
  this.list.removeClass('selected');\n\
  return this;\n\
};\n\
\n\
\n\
/**\n\
 * Get the primary property value for a model.\n\
 *\n\
 * @param {Object} model\n\
 * @return {String}\n\
 */\n\
\n\
function primary (model) {\n\
  return get(model, 'primary') || get(model, 'id');\n\
}//@ sourceURL=segmentio-menu/lib/protos.js"
));
require.register("segmentio-menu/lib/statics.js", Function("exports, require, module",
"\n\
var Emitter = require('emitter');\n\
\n\
\n\
/**\n\
 * Mixin emitter.\n\
 */\n\
\n\
Emitter(exports);//@ sourceURL=segmentio-menu/lib/statics.js"
));
require.register("segmentio-menu/lib/template.js", Function("exports, require, module",
"module.exports = '<li class=\"menu-item {slug}-menu-item\"><a data-href=\"href\">{text || id}</a></li>';//@ sourceURL=segmentio-menu/lib/template.js"
));
require.register("segmentio-rainbow/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Dependencies.\n\
 */\n\
\n\
var Rainbow = require('./js/rainbow')\n\
  , languages = [\n\
      require('./js/language/c.js'),\n\
      require('./js/language/coffeescript.js'),\n\
      require('./js/language/csharp.js'),\n\
      require('./js/language/css.js'),\n\
      require('./js/language/d.js'),\n\
      require('./js/language/generic.js'),\n\
      require('./js/language/go.js'),\n\
      require('./js/language/haskell.js'),\n\
      require('./js/language/html.js'),\n\
      require('./js/language/java.js'),\n\
      require('./js/language/javascript.js'),\n\
      require('./js/language/lua.js'),\n\
      require('./js/language/php.js'),\n\
      require('./js/language/python.js'),\n\
      require('./js/language/r.js'),\n\
      require('./js/language/ruby.js'),\n\
      require('./js/language/scheme.js'),\n\
      require('./js/language/shell.js'),\n\
      require('./js/language/smalltalk.js')\n\
    ];\n\
\n\
\n\
/**\n\
 * Extend Rainbow with each language.\n\
 */\n\
\n\
for (var i = 0, settings; settings = languages[i]; i++) {\n\
  Rainbow.extend.apply(Rainbow, settings);\n\
}\n\
\n\
\n\
/**\n\
 * Exports.\n\
 */\n\
\n\
module.exports = Rainbow;//@ sourceURL=segmentio-rainbow/index.js"
));
require.register("segmentio-rainbow/js/rainbow.js", Function("exports, require, module",
"/**\n\
 * Copyright 2013 Craig Campbell\n\
 *\n\
 * Licensed under the Apache License, Version 2.0 (the \"License\");\n\
 * you may not use this file except in compliance with the License.\n\
 * You may obtain a copy of the License at\n\
 *\n\
 * http://www.apache.org/licenses/LICENSE-2.0\n\
 *\n\
 * Unless required by applicable law or agreed to in writing, software\n\
 * distributed under the License is distributed on an \"AS IS\" BASIS,\n\
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n\
 * See the License for the specific language governing permissions and\n\
 * limitations under the License.\n\
 *\n\
 * Rainbow is a simple code syntax highlighter\n\
 *\n\
 * @preserve @version 1.2\n\
 * @url rainbowco.de\n\
 */\n\
module.exports = (function() {\n\
\n\
    /**\n\
     * array of replacements to process at the end\n\
     *\n\
     * @type {Object}\n\
     */\n\
    var replacements = {},\n\
\n\
        /**\n\
         * an array of start and end positions of blocks to be replaced\n\
         *\n\
         * @type {Object}\n\
         */\n\
        replacement_positions = {},\n\
\n\
        /**\n\
         * an array of the language patterns specified for each language\n\
         *\n\
         * @type {Object}\n\
         */\n\
        language_patterns = {},\n\
\n\
        /**\n\
         * an array of languages and whether they should bypass the default patterns\n\
         *\n\
         * @type {Object}\n\
         */\n\
        bypass_defaults = {},\n\
\n\
        /**\n\
         * processing level\n\
         *\n\
         * replacements are stored at this level so if there is a sub block of code\n\
         * (for example php inside of html) it runs at a different level\n\
         *\n\
         * @type {number}\n\
         */\n\
        CURRENT_LEVEL = 0,\n\
\n\
        /**\n\
         * constant used to refer to the default language\n\
         *\n\
         * @type {number}\n\
         */\n\
        DEFAULT_LANGUAGE = 0,\n\
\n\
        /**\n\
         * used as counters so we can selectively call setTimeout\n\
         * after processing a certain number of matches/replacements\n\
         *\n\
         * @type {number}\n\
         */\n\
        match_counter = 0,\n\
\n\
        /**\n\
         * @type {number}\n\
         */\n\
        replacement_counter = 0,\n\
\n\
        /**\n\
         * @type {null|string}\n\
         */\n\
        global_class,\n\
\n\
        /**\n\
         * @type {null|Function}\n\
         */\n\
        onHighlight;\n\
\n\
    /**\n\
     * cross browser get attribute for an element\n\
     *\n\
     * @see http://stackoverflow.com/questions/3755227/cross-browser-javascript-getattribute-method\n\
     *\n\
     * @param {Node} el\n\
     * @param {string} attr     attribute you are trying to get\n\
     * @returns {string|number}\n\
     */\n\
    function _attr(el, attr, attrs, i) {\n\
        var result = (el.getAttribute && el.getAttribute(attr)) || 0;\n\
\n\
        if (!result) {\n\
            attrs = el.attributes;\n\
\n\
            for (i = 0; i < attrs.length; ++i) {\n\
                if (attrs[i].nodeName === attr) {\n\
                    return attrs[i].nodeValue;\n\
                }\n\
            }\n\
        }\n\
\n\
        return result;\n\
    }\n\
\n\
    /**\n\
     * adds a class to a given code block\n\
     *\n\
     * @param {Element} el\n\
     * @param {string} class_name   class name to add\n\
     * @returns void\n\
     */\n\
    function _addClass(el, class_name) {\n\
        el.className += el.className ? ' ' + class_name : class_name;\n\
    }\n\
\n\
    /**\n\
     * checks if a block has a given class\n\
     *\n\
     * @param {Element} el\n\
     * @param {string} class_name   class name to check for\n\
     * @returns {boolean}\n\
     */\n\
    function _hasClass(el, class_name) {\n\
        return (' ' + el.className + ' ').indexOf(' ' + class_name + ' ') > -1;\n\
    }\n\
\n\
    /**\n\
     * gets the language for this block of code\n\
     *\n\
     * @param {Element} block\n\
     * @returns {string|null}\n\
     */\n\
    function _getLanguageForBlock(block) {\n\
\n\
        // if this doesn't have a language but the parent does then use that\n\
        // this means if for example you have: <pre data-language=\"php\">\n\
        // with a bunch of <code> blocks inside then you do not have\n\
        // to specify the language for each block\n\
        var language = _attr(block, 'data-language') || _attr(block.parentNode, 'data-language');\n\
\n\
        // this adds support for specifying language via a css class\n\
        // you can use the Google Code Prettify style: <pre class=\"lang-php\">\n\
        // or the HTML5 style: <pre><code class=\"language-php\">\n\
        if (!language) {\n\
            var pattern = /\\blang(?:uage)?-(\\w+)/,\n\
                match = block.className.match(pattern) || block.parentNode.className.match(pattern);\n\
\n\
            if (match) {\n\
                language = match[1];\n\
            }\n\
        }\n\
\n\
        return language;\n\
    }\n\
\n\
    /**\n\
     * makes sure html entities are always used for tags\n\
     *\n\
     * @param {string} code\n\
     * @returns {string}\n\
     */\n\
    function _htmlEntities(code) {\n\
        return code.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/&(?![\\w\\#]+;)/g, '&amp;');\n\
    }\n\
\n\
    /**\n\
     * determines if a new match intersects with an existing one\n\
     *\n\
     * @param {number} start1    start position of existing match\n\
     * @param {number} end1      end position of existing match\n\
     * @param {number} start2    start position of new match\n\
     * @param {number} end2      end position of new match\n\
     * @returns {boolean}\n\
     */\n\
    function _intersects(start1, end1, start2, end2) {\n\
        if (start2 >= start1 && start2 < end1) {\n\
            return true;\n\
        }\n\
\n\
        return end2 > start1 && end2 < end1;\n\
    }\n\
\n\
    /**\n\
     * determines if two different matches have complete overlap with each other\n\
     *\n\
     * @param {number} start1   start position of existing match\n\
     * @param {number} end1     end position of existing match\n\
     * @param {number} start2   start position of new match\n\
     * @param {number} end2     end position of new match\n\
     * @returns {boolean}\n\
     */\n\
    function _hasCompleteOverlap(start1, end1, start2, end2) {\n\
\n\
        // if the starting and end positions are exactly the same\n\
        // then the first one should stay and this one should be ignored\n\
        if (start2 == start1 && end2 == end1) {\n\
            return false;\n\
        }\n\
\n\
        return start2 <= start1 && end2 >= end1;\n\
    }\n\
\n\
    /**\n\
     * determines if the match passed in falls inside of an existing match\n\
     * this prevents a regex pattern from matching inside of a bigger pattern\n\
     *\n\
     * @param {number} start - start position of new match\n\
     * @param {number} end - end position of new match\n\
     * @returns {boolean}\n\
     */\n\
    function _matchIsInsideOtherMatch(start, end) {\n\
        for (var key in replacement_positions[CURRENT_LEVEL]) {\n\
            key = parseInt(key, 10);\n\
\n\
            // if this block completely overlaps with another block\n\
            // then we should remove the other block and return false\n\
            if (_hasCompleteOverlap(key, replacement_positions[CURRENT_LEVEL][key], start, end)) {\n\
                delete replacement_positions[CURRENT_LEVEL][key];\n\
                delete replacements[CURRENT_LEVEL][key];\n\
            }\n\
\n\
            if (_intersects(key, replacement_positions[CURRENT_LEVEL][key], start, end)) {\n\
                return true;\n\
            }\n\
        }\n\
\n\
        return false;\n\
    }\n\
\n\
    /**\n\
     * takes a string of code and wraps it in a span tag based on the name\n\
     *\n\
     * @param {string} name     name of the pattern (ie keyword.regex)\n\
     * @param {string} code     block of code to wrap\n\
     * @returns {string}\n\
     */\n\
    function _wrapCodeInSpan(name, code) {\n\
        return '<span class=\"' + name.replace(/\\./g, ' ') + (global_class ? ' ' + global_class : '') + '\">' + code + '</span>';\n\
    }\n\
\n\
    /**\n\
     * finds out the position of group match for a regular expression\n\
     *\n\
     * @see http://stackoverflow.com/questions/1985594/how-to-find-index-of-groups-in-match\n\
     *\n\
     * @param {Object} match\n\
     * @param {number} group_number\n\
     * @returns {number}\n\
     */\n\
    function _indexOfGroup(match, group_number) {\n\
        var index = 0,\n\
            i;\n\
\n\
        for (i = 1; i < group_number; ++i) {\n\
            if (match[i]) {\n\
                index += match[i].length;\n\
            }\n\
        }\n\
\n\
        return index;\n\
    }\n\
\n\
    /**\n\
     * matches a regex pattern against a block of code\n\
     * finds all matches that should be processed and stores the positions\n\
     * of where they should be replaced within the string\n\
     *\n\
     * this is where pretty much all the work is done but it should not\n\
     * be called directly\n\
     *\n\
     * @param {RegExp} pattern\n\
     * @param {string} code\n\
     * @returns void\n\
     */\n\
    function _processPattern(regex, pattern, code, callback)\n\
    {\n\
        var match = regex.exec(code);\n\
\n\
        if (!match) {\n\
            return callback();\n\
        }\n\
\n\
        ++match_counter;\n\
\n\
        // treat match 0 the same way as name\n\
        if (!pattern['name'] && typeof pattern['matches'][0] == 'string') {\n\
            pattern['name'] = pattern['matches'][0];\n\
            delete pattern['matches'][0];\n\
        }\n\
\n\
        var replacement = match[0],\n\
            start_pos = match.index,\n\
            end_pos = match[0].length + start_pos,\n\
\n\
            /**\n\
             * callback to process the next match of this pattern\n\
             */\n\
            processNext = function() {\n\
                var nextCall = function() {\n\
                    _processPattern(regex, pattern, code, callback);\n\
                };\n\
\n\
                // every 100 items we process let's call set timeout\n\
                // to let the ui breathe a little\n\
                return match_counter % 100 > 0 ? nextCall() : setTimeout(nextCall, 0);\n\
            };\n\
\n\
        // if this is not a child match and it falls inside of another\n\
        // match that already happened we should skip it and continue processing\n\
        if (_matchIsInsideOtherMatch(start_pos, end_pos)) {\n\
            return processNext();\n\
        }\n\
\n\
        /**\n\
         * callback for when a match was successfully processed\n\
         *\n\
         * @param {string} replacement\n\
         * @returns void\n\
         */\n\
        var onMatchSuccess = function(replacement) {\n\
                // if this match has a name then wrap it in a span tag\n\
                if (pattern['name']) {\n\
                    replacement = _wrapCodeInSpan(pattern['name'], replacement);\n\
                }\n\
\n\
                // console.log('LEVEL', CURRENT_LEVEL, 'replace', match[0], 'with', replacement, 'at position', start_pos, 'to', end_pos);\n\
\n\
                // store what needs to be replaced with what at this position\n\
                if (!replacements[CURRENT_LEVEL]) {\n\
                    replacements[CURRENT_LEVEL] = {};\n\
                    replacement_positions[CURRENT_LEVEL] = {};\n\
                }\n\
\n\
                replacements[CURRENT_LEVEL][start_pos] = {\n\
                    'replace': match[0],\n\
                    'with': replacement\n\
                };\n\
\n\
                // store the range of this match so we can use it for comparisons\n\
                // with other matches later\n\
                replacement_positions[CURRENT_LEVEL][start_pos] = end_pos;\n\
\n\
                // process the next match\n\
                processNext();\n\
            },\n\
\n\
            // if this pattern has sub matches for different groups in the regex\n\
            // then we should process them one at a time by rerunning them through\n\
            // this function to generate the new replacement\n\
            //\n\
            // we run through them backwards because the match position of earlier\n\
            // matches will not change depending on what gets replaced in later\n\
            // matches\n\
            group_keys = keys(pattern['matches']),\n\
\n\
            /**\n\
             * callback for processing a sub group\n\
             *\n\
             * @param {number} i\n\
             * @param {Array} group_keys\n\
             * @param {Function} callback\n\
             */\n\
            processGroup = function(i, group_keys, callback) {\n\
                if (i >= group_keys.length) {\n\
                    return callback(replacement);\n\
                }\n\
\n\
                var processNextGroup = function() {\n\
                        processGroup(++i, group_keys, callback);\n\
                    },\n\
                    block = match[group_keys[i]];\n\
\n\
                // if there is no match here then move on\n\
                if (!block) {\n\
                    return processNextGroup();\n\
                }\n\
\n\
                var group = pattern['matches'][group_keys[i]],\n\
                    language = group['language'],\n\
\n\
                    /**\n\
                     * process group is what group we should use to actually process\n\
                     * this match group\n\
                     *\n\
                     * for example if the subgroup pattern looks like this\n\
                     * 2: {\n\
                     *     'name': 'keyword',\n\
                     *     'pattern': /true/g\n\
                     * }\n\
                     *\n\
                     * then we use that as is, but if it looks like this\n\
                     *\n\
                     * 2: {\n\
                     *     'name': 'keyword',\n\
                     *     'matches': {\n\
                     *          'name': 'special',\n\
                     *          'pattern': /whatever/g\n\
                     *      }\n\
                     * }\n\
                     *\n\
                     * we treat the 'matches' part as the pattern and keep\n\
                     * the name around to wrap it with later\n\
                     */\n\
                    process_group = group['name'] && group['matches'] ? group['matches'] : group,\n\
\n\
                    /**\n\
                     * takes the code block matched at this group, replaces it\n\
                     * with the highlighted block, and optionally wraps it with\n\
                     * a span with a name\n\
                     *\n\
                     * @param {string} block\n\
                     * @param {string} replace_block\n\
                     * @param {string|null} match_name\n\
                     */\n\
                    _replaceAndContinue = function(block, replace_block, match_name) {\n\
                        replacement = _replaceAtPosition(_indexOfGroup(match, group_keys[i]), block, match_name ? _wrapCodeInSpan(match_name, replace_block) : replace_block, replacement);\n\
                        processNextGroup();\n\
                    };\n\
\n\
                // if this is a sublanguage go and process the block using that language\n\
                if (language) {\n\
                    return _highlightBlockForLanguage(block, language, function(code) {\n\
                        _replaceAndContinue(block, code);\n\
                    });\n\
                }\n\
\n\
                // if this is a string then this match is directly mapped to selector\n\
                // so all we have to do is wrap it in a span and continue\n\
                if (typeof group === 'string') {\n\
                    return _replaceAndContinue(block, block, group);\n\
                }\n\
\n\
                // the process group can be a single pattern or an array of patterns\n\
                // _processCodeWithPatterns always expects an array so we convert it here\n\
                _processCodeWithPatterns(block, process_group.length ? process_group : [process_group], function(code) {\n\
                    _replaceAndContinue(block, code, group['matches'] ? group['name'] : 0);\n\
                });\n\
            };\n\
\n\
        processGroup(0, group_keys, onMatchSuccess);\n\
    }\n\
\n\
    /**\n\
     * should a language bypass the default patterns?\n\
     *\n\
     * if you call Rainbow.extend() and pass true as the third argument\n\
     * it will bypass the defaults\n\
     */\n\
    function _bypassDefaultPatterns(language)\n\
    {\n\
        return bypass_defaults[language];\n\
    }\n\
\n\
    /**\n\
     * returns a list of regex patterns for this language\n\
     *\n\
     * @param {string} language\n\
     * @returns {Array}\n\
     */\n\
    function _getPatternsForLanguage(language) {\n\
        var patterns = language_patterns[language] || [],\n\
            default_patterns = language_patterns[DEFAULT_LANGUAGE] || [];\n\
\n\
        return _bypassDefaultPatterns(language) ? patterns : patterns.concat(default_patterns);\n\
    }\n\
\n\
    /**\n\
     * substring replace call to replace part of a string at a certain position\n\
     *\n\
     * @param {number} position         the position where the replacement should happen\n\
     * @param {string} replace          the text we want to replace\n\
     * @param {string} replace_with     the text we want to replace it with\n\
     * @param {string} code             the code we are doing the replacing in\n\
     * @returns {string}\n\
     */\n\
    function _replaceAtPosition(position, replace, replace_with, code) {\n\
        var sub_string = code.substr(position);\n\
        return code.substr(0, position) + sub_string.replace(replace, replace_with);\n\
    }\n\
\n\
   /**\n\
     * sorts an object by index descending\n\
     *\n\
     * @param {Object} object\n\
     * @return {Array}\n\
     */\n\
    function keys(object) {\n\
        var locations = [],\n\
            replacement,\n\
            pos;\n\
\n\
        for(var location in object) {\n\
            if (object.hasOwnProperty(location)) {\n\
                locations.push(location);\n\
            }\n\
        }\n\
\n\
        // numeric descending\n\
        return locations.sort(function(a, b) {\n\
            return b - a;\n\
        });\n\
    }\n\
\n\
    /**\n\
     * processes a block of code using specified patterns\n\
     *\n\
     * @param {string} code\n\
     * @param {Array} patterns\n\
     * @returns void\n\
     */\n\
    function _processCodeWithPatterns(code, patterns, callback)\n\
    {\n\
        // we have to increase the level here so that the\n\
        // replacements will not conflict with each other when\n\
        // processing sub blocks of code\n\
        ++CURRENT_LEVEL;\n\
\n\
        // patterns are processed one at a time through this function\n\
        function _workOnPatterns(patterns, i)\n\
        {\n\
            // still have patterns to process, keep going\n\
            if (i < patterns.length) {\n\
                return _processPattern(patterns[i]['pattern'], patterns[i], code, function() {\n\
                    _workOnPatterns(patterns, ++i);\n\
                });\n\
            }\n\
\n\
            // we are done processing the patterns\n\
            // process the replacements and update the DOM\n\
            _processReplacements(code, function(code) {\n\
\n\
                // when we are done processing replacements\n\
                // we are done at this level so we can go back down\n\
                delete replacements[CURRENT_LEVEL];\n\
                delete replacement_positions[CURRENT_LEVEL];\n\
                --CURRENT_LEVEL;\n\
                callback(code);\n\
            });\n\
        }\n\
\n\
        _workOnPatterns(patterns, 0);\n\
    }\n\
\n\
    /**\n\
     * process replacements in the string of code to actually update the markup\n\
     *\n\
     * @param {string} code         the code to process replacements in\n\
     * @param {Function} onComplete   what to do when we are done processing\n\
     * @returns void\n\
     */\n\
    function _processReplacements(code, onComplete) {\n\
\n\
        /**\n\
         * processes a single replacement\n\
         *\n\
         * @param {string} code\n\
         * @param {Array} positions\n\
         * @param {number} i\n\
         * @param {Function} onComplete\n\
         * @returns void\n\
         */\n\
        function _processReplacement(code, positions, i, onComplete) {\n\
            if (i < positions.length) {\n\
                ++replacement_counter;\n\
                var pos = positions[i],\n\
                    replacement = replacements[CURRENT_LEVEL][pos];\n\
                code = _replaceAtPosition(pos, replacement['replace'], replacement['with'], code);\n\
\n\
                // process next function\n\
                var next = function() {\n\
                    _processReplacement(code, positions, ++i, onComplete);\n\
                };\n\
\n\
                // use a timeout every 250 to not freeze up the UI\n\
                return replacement_counter % 250 > 0 ? next() : setTimeout(next, 0);\n\
            }\n\
\n\
            onComplete(code);\n\
        }\n\
\n\
        var string_positions = keys(replacements[CURRENT_LEVEL]);\n\
        _processReplacement(code, string_positions, 0, onComplete);\n\
    }\n\
\n\
    /**\n\
     * takes a string of code and highlights it according to the language specified\n\
     *\n\
     * @param {string} code\n\
     * @param {string} language\n\
     * @param {Function} onComplete\n\
     * @returns void\n\
     */\n\
    function _highlightBlockForLanguage(code, language, onComplete) {\n\
        var patterns = _getPatternsForLanguage(language);\n\
        _processCodeWithPatterns(_htmlEntities(code), patterns, onComplete);\n\
    }\n\
\n\
    /**\n\
     * highlight an individual code block\n\
     *\n\
     * @param {Array} code_blocks\n\
     * @param {number} i\n\
     * @returns void\n\
     */\n\
    function _highlightCodeBlock(code_blocks, i, onComplete) {\n\
        if (i < code_blocks.length) {\n\
            var block = code_blocks[i],\n\
                language = _getLanguageForBlock(block);\n\
\n\
            if (!_hasClass(block, 'rainbow') && language) {\n\
                language = language.toLowerCase();\n\
\n\
                _addClass(block, 'rainbow');\n\
\n\
                return _highlightBlockForLanguage(block.innerHTML, language, function(code) {\n\
                    block.innerHTML = code;\n\
\n\
                    // reset the replacement arrays\n\
                    replacements = {};\n\
                    replacement_positions = {};\n\
\n\
                    // if you have a listener attached tell it that this block is now highlighted\n\
                    if (onHighlight) {\n\
                        onHighlight(block, language);\n\
                    }\n\
\n\
                    // process the next block\n\
                    setTimeout(function() {\n\
                        _highlightCodeBlock(code_blocks, ++i, onComplete);\n\
                    }, 0);\n\
                });\n\
            }\n\
            return _highlightCodeBlock(code_blocks, ++i, onComplete);\n\
        }\n\
\n\
        if (onComplete) {\n\
            onComplete();\n\
        }\n\
    }\n\
\n\
    /**\n\
     * start highlighting all the code blocks\n\
     *\n\
     * @returns void\n\
     */\n\
    function _highlight(node, onComplete) {\n\
\n\
        // the first argument can be an Event or a DOM Element\n\
        // I was originally checking instanceof Event but that makes it break\n\
        // when using mootools\n\
        //\n\
        // @see https://github.com/ccampbell/rainbow/issues/32\n\
        //\n\
        node = node && typeof node.getElementsByTagName == 'function' ? node : document;\n\
\n\
        var pre_blocks = node.getElementsByTagName('pre'),\n\
            code_blocks = node.getElementsByTagName('code'),\n\
            i,\n\
            final_pre_blocks = [],\n\
            final_code_blocks = [];\n\
\n\
        // first loop through all pre blocks to find which ones to highlight\n\
        // also strip whitespace\n\
        for (i = 0; i < pre_blocks.length; ++i) {\n\
\n\
            // strip whitespace around code tags when they are inside of a pre tag\n\
            // this makes the themes look better because you can't accidentally\n\
            // add extra linebreaks at the start and end\n\
            //\n\
            // when the pre tag contains a code tag then strip any extra whitespace\n\
            // for example\n\
            // <pre>\n\
            //      <code>var foo = true;</code>\n\
            // </pre>\n\
            //\n\
            // will become\n\
            // <pre><code>var foo = true;</code></pre>\n\
            //\n\
            // if you want to preserve whitespace you can use a pre tag on its own\n\
            // without a code tag inside of it\n\
            if (pre_blocks[i].getElementsByTagName('code').length) {\n\
                pre_blocks[i].innerHTML = pre_blocks[i].innerHTML.replace(/^\\s+/, '').replace(/\\s+$/, '');\n\
                continue;\n\
            }\n\
\n\
            // if the pre block has no code blocks then we are going to want to\n\
            // process it directly\n\
            final_pre_blocks.push(pre_blocks[i]);\n\
        }\n\
\n\
        // @see http://stackoverflow.com/questions/2735067/how-to-convert-a-dom-node-list-to-an-array-in-javascript\n\
        // we are going to process all <code> blocks\n\
        for (i = 0; i < code_blocks.length; ++i) {\n\
            final_code_blocks.push(code_blocks[i]);\n\
        }\n\
\n\
        _highlightCodeBlock(final_code_blocks.concat(final_pre_blocks), 0, onComplete);\n\
    }\n\
\n\
    /**\n\
     * public methods\n\
     */\n\
    return {\n\
\n\
        /**\n\
         * extends the language pattern matches\n\
         *\n\
         * @param {*} language     name of language\n\
         * @param {*} patterns      array of patterns to add on\n\
         * @param {boolean|null} bypass      if true this will bypass the default language patterns\n\
         */\n\
        extend: function(language, patterns, bypass) {\n\
\n\
            // if there is only one argument then we assume that we want to\n\
            // extend the default language rules\n\
            if (arguments.length == 1) {\n\
                patterns = language;\n\
                language = DEFAULT_LANGUAGE;\n\
            }\n\
\n\
            bypass_defaults[language] = bypass;\n\
            language_patterns[language] = patterns.concat(language_patterns[language] || []);\n\
        },\n\
\n\
        /**\n\
         * call back to let you do stuff in your app after a piece of code has been highlighted\n\
         *\n\
         * @param {Function} callback\n\
         */\n\
        onHighlight: function(callback) {\n\
            onHighlight = callback;\n\
        },\n\
\n\
        /**\n\
         * method to set a global class that will be applied to all spans\n\
         *\n\
         * @param {string} class_name\n\
         */\n\
        addClass: function(class_name) {\n\
            global_class = class_name;\n\
        },\n\
\n\
        /**\n\
         * starts the magic rainbow\n\
         *\n\
         * @returns void\n\
         */\n\
        color: function() {\n\
\n\
            // if you want to straight up highlight a string you can pass the string of code,\n\
            // the language, and a callback function\n\
            if (typeof arguments[0] == 'string') {\n\
                return _highlightBlockForLanguage(arguments[0], arguments[1], arguments[2]);\n\
            }\n\
\n\
            // if you pass a callback function then we rerun the color function\n\
            // on all the code and call the callback function on complete\n\
            if (typeof arguments[0] == 'function') {\n\
                return _highlight(0, arguments[0]);\n\
            }\n\
\n\
            // otherwise we use whatever node you passed in with an optional\n\
            // callback function as the second parameter\n\
            _highlight(arguments[0], arguments[1]);\n\
        }\n\
    };\n\
}) ();//@ sourceURL=segmentio-rainbow/js/rainbow.js"
));
require.register("segmentio-rainbow/js/language/c.js", Function("exports, require, module",
"/**\n\
 * C patterns\n\
 *\n\
 * @author Daniel Holden\n\
 * @author Craig Campbell\n\
 * @version 1.0.7\n\
 */\n\
module.exports = ['c', [\n\
    {\n\
        'name': 'meta.preprocessor',\n\
        'matches': {\n\
            1: [\n\
                {\n\
                    'matches': {\n\
                        1: 'keyword.define',\n\
                        2: 'entity.name'\n\
                    },\n\
                    'pattern': /(\\w+)\\s(\\w+)\\b/g\n\
                },\n\
                {\n\
                    'name': 'keyword.define',\n\
                    'pattern': /endif/g\n\
                },\n\
                {\n\
                    'name': 'constant.numeric',\n\
                    'pattern': /\\d+/g\n\
                },\n\
                {\n\
                    'matches': {\n\
                        1: 'keyword.include',\n\
                        2: 'string'\n\
                    },\n\
                    'pattern': /(include)\\s(.*?)$/g\n\
                }\n\
            ]\n\
        },\n\
        'pattern': /\\#([\\S\\s]*?)$/gm\n\
    },\n\
    {\n\
        'name': 'keyword',\n\
        'pattern': /\\b(do|goto|typedef)\\b/g\n\
    },\n\
    {\n\
        'name': 'entity.label',\n\
        'pattern': /\\w+:/g\n\
    },\n\
    {\n\
        'matches': {\n\
            1: 'storage.type',\n\
            3: 'storage.type',\n\
            4: 'entity.name.function'\n\
        },\n\
        'pattern': /\\b((un)?signed|const)? ?(void|char|short|int|long|float|double)\\*? +((\\w+)(?= ?\\())?/g\n\
    },\n\
    {\n\
        'matches': {\n\
            2: 'entity.name.function'\n\
        },\n\
        'pattern': /(\\w|\\*) +((\\w+)(?= ?\\())/g\n\
    },\n\
    {\n\
        'name': 'storage.modifier',\n\
        'pattern': /\\b(static|extern|auto|register|volatile|inline)\\b/g\n\
    },\n\
    {\n\
        'name': 'support.type',\n\
        'pattern': /\\b(struct|union|enum)\\b/g\n\
    }\n\
]];\n\
//@ sourceURL=segmentio-rainbow/js/language/c.js"
));
require.register("segmentio-rainbow/js/language/coffeescript.js", Function("exports, require, module",
"/**\n\
 * Coffeescript patterns\n\
 *\n\
 * @author Craig Campbell\n\
 * @version 1.0\n\
 */\n\
module.exports = ['coffeescript', [\n\
    {\n\
        'name': 'comment.block',\n\
        'pattern': /(\\#{3})[\\s\\S]*\\1/gm\n\
    },\n\
    {\n\
        'name': 'string.block',\n\
        'pattern': /('{3}|\"{3})[\\s\\S]*\\1/gm\n\
    },\n\
\n\
    /**\n\
     * multiline regex with comments\n\
     */\n\
    {\n\
        'name': 'string.regex',\n\
        'matches': {\n\
            2: {\n\
                'name': 'comment',\n\
                'pattern': /\\#(.*?)\\n\
/g\n\
            }\n\
        },\n\
        'pattern': /(\\/{3})([\\s\\S]*)\\1/gm\n\
    },\n\
    {\n\
        'matches': {\n\
            1: 'keyword'\n\
        },\n\
        'pattern': /\\b(in|when|is|isnt|of|not|unless|until|super)(?=\\b)/gi\n\
    },\n\
    {\n\
        'name': 'keyword.operator',\n\
        'pattern': /\\?/g\n\
    },\n\
    {\n\
        'name': 'constant.language',\n\
        'pattern': /\\b(undefined|yes|on|no|off)\\b/g\n\
    },\n\
    {\n\
        'name': 'keyword.variable.coffee',\n\
        'pattern': /@(\\w+)/gi\n\
    },\n\
\n\
    /**\n\
     * reset global keywards from generic\n\
     */\n\
    {\n\
        'name': 'reset',\n\
        'pattern': /object|class|print/gi\n\
    },\n\
\n\
    /**\n\
     * named function\n\
     */\n\
    {\n\
        'matches' : {\n\
            1: 'entity.name.function',\n\
            2: 'keyword.operator',\n\
            3: {\n\
                    'name': 'function.argument.coffee',\n\
                    'pattern': /([\\@\\w]+)/g\n\
            },\n\
            4: 'keyword.function'\n\
        },\n\
        'pattern': /(\\w+)\\s{0,}(=|:)\\s{0,}\\((.*?)((-|=)&gt;)/gi\n\
    },\n\
\n\
    /**\n\
     * anonymous function\n\
     */\n\
    {\n\
        'matches': {\n\
            1: {\n\
                    'name': 'function.argument.coffee',\n\
                    'pattern': /([\\@\\w]+)/g\n\
            },\n\
            2: 'keyword.function'\n\
        },\n\
        'pattern': /\\s\\((.*?)\\)\\s{0,}((-|=)&gt;)/gi\n\
    },\n\
\n\
    /**\n\
     * direct function no arguments\n\
     */\n\
    {\n\
        'matches' : {\n\
            1: 'entity.name.function',\n\
            2: 'keyword.operator',\n\
            3: 'keyword.function'\n\
        },\n\
        'pattern': /(\\w+)\\s{0,}(=|:)\\s{0,}((-|=)&gt;)/gi\n\
    },\n\
\n\
    /**\n\
     * class definitions\n\
     */\n\
    {\n\
        'matches': {\n\
            1: 'storage.class',\n\
            2: 'entity.name.class',\n\
            3: 'storage.modifier.extends',\n\
            4: 'entity.other.inherited-class'\n\
        },\n\
        'pattern': /\\b(class)\\s(\\w+)(\\sextends\\s)?([\\w\\\\]*)?\\b/g\n\
    },\n\
\n\
    /**\n\
     * object instantiation\n\
     */\n\
    {\n\
        'matches': {\n\
            1: 'keyword.new',\n\
            2: {\n\
                'name': 'support.class',\n\
                'pattern': /\\w+/g\n\
            }\n\
        },\n\
        'pattern': /\\b(new)\\s(.*?)(?=\\s)/g\n\
    }\n\
]];\n\
//@ sourceURL=segmentio-rainbow/js/language/coffeescript.js"
));
require.register("segmentio-rainbow/js/language/csharp.js", Function("exports, require, module",
"/**\n\
* C# patterns\n\
*\n\
* @author Dan Stewart\n\
* @version 1.0.1\n\
*/\n\
module.exports = ['csharp', [\n\
\t{\n\
        // @see http://msdn.microsoft.com/en-us/library/23954zh5.aspx\n\
\t\t'name': 'constant',\n\
\t\t'pattern': /\\b(false|null|true)\\b/g\n\
\t},\n\
\t{\n\
\t\t// @see http://msdn.microsoft.com/en-us/library/x53a06bb%28v=vs.100%29.aspx\n\
\t\t// Does not support putting an @ in front of a keyword which makes it not a keyword anymore.\n\
\t\t'name': 'keyword',\n\
\t\t'pattern': /\\b(abstract|add|alias|ascending|as|base|bool|break|byte|case|catch|char|checked|class|const|continue|decimal|default|delegate|descending|double|do|dynamic|else|enum|event|explicit|extern|false|finally|fixed|float|foreach|for|from|get|global|goto|group|if|implicit|int|interface|internal|into|in|is|join|let|lock|long|namespace|new|object|operator|orderby|out|override|params|partial|private|protected|public|readonly|ref|remove|return|sbyte|sealed|select|set|short|sizeof|stackalloc|static|string|struct|switch|this|throw|try|typeof|uint|unchecked|ulong|unsafe|ushort|using|value|var|virtual|void|volatile|where|while|yield)\\b/g\n\
\t},\n\
    {\n\
        'matches': {\n\
            1: 'keyword',\n\
            2: {\n\
                'name': 'support.class',\n\
                'pattern': /\\w+/g\n\
            }\n\
        },\n\
        'pattern': /(typeof)\\s([^\\$].*?)(\\)|;)/g\n\
    },\n\
    {\n\
        'matches': {\n\
            1: 'keyword.namespace',\n\
            2: {\n\
                'name': 'support.namespace',\n\
                'pattern': /\\w+/g\n\
            }\n\
        },\n\
        'pattern': /\\b(namespace)\\s(.*?);/g\n\
    },\n\
    {\n\
        'matches': {\n\
            1: 'storage.modifier',\n\
            2: 'storage.class',\n\
            3: 'entity.name.class',\n\
            4: 'storage.modifier.extends',\n\
            5: 'entity.other.inherited-class'\n\
        },\n\
        'pattern': /\\b(abstract|sealed)?\\s?(class)\\s(\\w+)(\\sextends\\s)?([\\w\\\\]*)?\\s?\\{?(\\n\
|\\})/g\n\
    },\n\
    {\n\
        'name': 'keyword.static',\n\
        'pattern': /\\b(static)\\b/g\n\
    },\n\
    {\n\
        'matches': {\n\
            1: 'keyword.new',\n\
\t\t\t2: {\n\
                'name': 'support.class',\n\
                'pattern': /\\w+/g\n\
            }\n\
\n\
        },\n\
        'pattern': /\\b(new)\\s([^\\$].*?)(?=\\)|\\(|;|&)/g\n\
    },\n\
\t{\n\
\t\t'name': 'string',\n\
\t\t'pattern': /(\")(.*?)\\1/g\n\
\t},\n\
\t{\n\
\t\t'name': 'integer',\n\
\t\t'pattern': /\\b(0x[\\da-f]+|\\d+)\\b/g\n\
\t},\n\
\t{\n\
        'name': 'comment',\n\
        'pattern': /\\/\\*[\\s\\S]*?\\*\\/|(\\/\\/)[\\s\\S]*?$/gm\n\
    },\n\
\t{\n\
\t\t'name': 'operator',\n\
\t\t// @see http://msdn.microsoft.com/en-us/library/6a71f45d%28v=vs.100%29.aspx\n\
\t\t// ++ += + -- -= - <<= << <= => >>= >> >= != ! ~ ^ || && &= & ?? :: : *= * |= %= |= == =\n\
\t\t'pattern': /(\\+\\+|\\+=|\\+|--|-=|-|&lt;&lt;=|&lt;&lt;|&lt;=|=&gt;|&gt;&gt;=|&gt;&gt;|&gt;=|!=|!|~|\\^|\\|\\||&amp;&amp;|&amp;=|&amp;|\\?\\?|::|:|\\*=|\\*|\\/=|%=|\\|=|==|=)/g\n\
\t},\n\
    {\n\
\t\t// @see http://msdn.microsoft.com/en-us/library/ed8yd1ha%28v=vs.100%29.aspx\n\
\t\t'name': 'preprocessor',\n\
\t\t'pattern': /(\\#if|\\#else|\\#elif|\\#endif|\\#define|\\#undef|\\#warning|\\#error|\\#line|\\#region|\\#endregion|\\#pragma)[\\s\\S]*?$/gm\n\
\t}\n\
], true];\n\
//@ sourceURL=segmentio-rainbow/js/language/csharp.js"
));
require.register("segmentio-rainbow/js/language/css.js", Function("exports, require, module",
"/**\n\
 * CSS patterns\n\
 *\n\
 * @author Craig Campbell\n\
 * @version 1.0.8\n\
 */\n\
module.exports = ['css', [\n\
    {\n\
        'name': 'comment',\n\
        'pattern': /\\/\\*[\\s\\S]*?\\*\\//gm\n\
    },\n\
    {\n\
        'name': 'constant.hex-color',\n\
        'pattern': /#([a-f0-9]{3}|[a-f0-9]{6})(?=;|\\s|,|\\))/gi\n\
    },\n\
    {\n\
        'matches': {\n\
            1: 'constant.numeric',\n\
            2: 'keyword.unit'\n\
        },\n\
        'pattern': /(\\d+)(px|em|cm|s|%)?/g\n\
    },\n\
    {\n\
        'name': 'string',\n\
        'pattern': /('|\")(.*?)\\1/g\n\
    },\n\
    {\n\
        'name': 'support.css-property',\n\
        'matches': {\n\
            1: 'support.vendor-prefix'\n\
        },\n\
        'pattern': /(-o-|-moz-|-webkit-|-ms-)?[\\w-]+(?=\\s?:)(?!.*\\{)/g\n\
    },\n\
    {\n\
        'matches': {\n\
            1: [\n\
                {\n\
                    'name': 'entity.name.sass',\n\
                    'pattern': /&amp;/g\n\
                },\n\
                {\n\
                    'name': 'direct-descendant',\n\
                    'pattern': /&gt;/g\n\
                },\n\
                {\n\
                    'name': 'entity.name.class',\n\
                    'pattern': /\\.[\\w\\-_]+/g\n\
                },\n\
                {\n\
                    'name': 'entity.name.id',\n\
                    'pattern': /\\#[\\w\\-_]+/g\n\
                },\n\
                {\n\
                    'name': 'entity.name.pseudo',\n\
                    'pattern': /:[\\w\\-_]+/g\n\
                },\n\
                {\n\
                    'name': 'entity.name.tag',\n\
                    'pattern': /\\w+/g\n\
                }\n\
            ]\n\
        },\n\
        'pattern': /([\\w\\ ,:\\.\\#\\&\\;\\-_]+)(?=.*\\{)/g\n\
    },\n\
    {\n\
        'matches': {\n\
            2: 'support.vendor-prefix',\n\
            3: 'support.css-value'\n\
        },\n\
        'pattern': /(:|,)\\s*(-o-|-moz-|-webkit-|-ms-)?([a-zA-Z-]*)(?=\\b)(?!.*\\{)/g\n\
    },\n\
    {\n\
        'matches': {\n\
            1: 'support.tag.style',\n\
            2: [\n\
                {\n\
                    'name': 'string',\n\
                    'pattern': /('|\")(.*?)(\\1)/g\n\
                },\n\
                {\n\
                    'name': 'entity.tag.style',\n\
                    'pattern': /(\\w+)/g\n\
                }\n\
            ],\n\
            3: 'support.tag.style'\n\
        },\n\
        'pattern': /(&lt;\\/?)(style.*?)(&gt;)/g\n\
    }\n\
], true];\n\
//@ sourceURL=segmentio-rainbow/js/language/css.js"
));
require.register("segmentio-rainbow/js/language/d.js", Function("exports, require, module",
"/**\n\
* D patterns\n\
*\n\
* @author Matthew Brennan Jones\n\
* @version 1.0.1\n\
*/\n\
module.exports = ['d', [\n\
    {\n\
        'name': 'constant',\n\
        'pattern': /\\b(false|null|true)\\b/gm\n\
    },\n\
    {\n\
        // http://dlang.org/lex.html\n\
        'name': 'keyword',\n\
        'pattern': /\\b(abstract|alias|align|asm|assert|auto|body|bool|break|byte|case|cast|catch|cdouble|cent|cfloat|char|class|const|continue|creal|dchar|debug|default|delegate|delete|deprecated|do|double|else|enum|export|extern|final|finally|float|for|foreach|foreach_reverse|function|goto|idouble|if|ifloat|immutable|import|in|inout|int|interface|invariant|ireal|is|lazy|long|macro|mixin|module|new|nothrow|null|out|override|package|pragma|private|protected|public|pure|real|ref|return|scope|shared|short|size_t|static|string|struct|super|switch|synchronized|template|this|throw|try|typedef|typeid|typeof|ubyte|ucent|uint|ulong|union|unittest|ushort|version|void|volatile|wchar|while|with|__FILE__|__LINE__|__gshared|__traits|__vector|__parameters)\\b/gm\n\
    },\n\
    {\n\
        'matches': {\n\
            1: 'keyword',\n\
            2: {\n\
                'name': 'support.class',\n\
                'pattern': /\\w+/gm\n\
            }\n\
        },\n\
        'pattern': /(typeof)\\s([^\\$].*?)(\\)|;)/gm\n\
    },\n\
    {\n\
        'matches': {\n\
            1: 'keyword.namespace',\n\
            2: {\n\
                'name': 'support.namespace',\n\
                'pattern': /\\w+/gm\n\
            }\n\
        },\n\
        'pattern': /\\b(namespace)\\s(.*?);/gm\n\
    },\n\
    {\n\
        'matches': {\n\
            1: 'storage.modifier',\n\
            2: 'storage.class',\n\
            3: 'entity.name.class',\n\
            4: 'storage.modifier.extends',\n\
            5: 'entity.other.inherited-class'\n\
        },\n\
        'pattern': /\\b(abstract|sealed)?\\s?(class)\\s(\\w+)(\\sextends\\s)?([\\w\\\\]*)?\\s?\\{?(\\n\
|\\})/gm\n\
    },\n\
    {\n\
        'name': 'keyword.static',\n\
        'pattern': /\\b(static)\\b/gm\n\
    },\n\
    {\n\
        'matches': {\n\
            1: 'keyword.new',\n\
            2: {\n\
                'name': 'support.class',\n\
                'pattern': /\\w+/gm\n\
            }\n\
\n\
        },\n\
        'pattern': /\\b(new)\\s([^\\$].*?)(?=\\)|\\(|;|&)/gm\n\
    },\n\
    {\n\
        'name': 'string',\n\
        'pattern': /(\"|')(.*?)\\1/gm\n\
    },\n\
    {\n\
        'name': 'integer',\n\
        'pattern': /\\b(0x[\\da-f]+|\\d+)\\b/gm\n\
    },\n\
    {\n\
        'name': 'comment',\n\
        'pattern': /\\/\\*[\\s\\S]*?\\*\\/|\\/\\+[\\s\\S]*?\\+\\/|(\\/\\/)[\\s\\S]*?$/gm\n\
    },\n\
    {\n\
        // http://dlang.org/operatoroverloading.html\n\
        'name': 'operator',\n\
        //  / /= &= && & |= || | -= -- - += ++ + <= << < <<= <>= <> > >>>= >>= >= >> >>> != !<>= !<> !<= !< !>= !> ! [ ] $ == = *= * %= % ^^= ^= ^^ ^ ~= ~ @ => :\n\
        'pattern': /(\\/|\\/=|&amp;=|&amp;&amp;|&amp;|\\|=|\\|\\|\\||\\-=|\\-\\-|\\-|\\+=|\\+\\+|\\+|&lt;=|&lt;&lt;|&lt;|&lt;&lt;=|&lt;&gt;=|&lt;&gt;|&gt;|&gt;&gt;&gt;=|&gt;&gt;=|&gt;=|&gt;&gt;|&gt;&gt;&gt;|!=|!&lt;&gt;=|!&lt;&gt;|!&lt;=|!&lt;|!&gt;=|!&gt;|!|[|]|\\$|==|=|\\*=|\\*|%=|%|\\^\\^=|\\^=|\\^\\^|\\^|~=|~|@|=&gt;|\\:)/gm\n\
    }\n\
], true];\n\
\n\
//@ sourceURL=segmentio-rainbow/js/language/d.js"
));
require.register("segmentio-rainbow/js/language/generic.js", Function("exports, require, module",
"/**\n\
 * Generic language patterns\n\
 *\n\
 * @author Craig Campbell\n\
 * @version 1.0.10\n\
 */\n\
module.exports = [[\n\
    {\n\
        'matches': {\n\
            1: {\n\
                'name': 'keyword.operator',\n\
                'pattern': /\\=/g\n\
            },\n\
            2: {\n\
                'name': 'string',\n\
                'matches': {\n\
                    'name': 'constant.character.escape',\n\
                    'pattern': /\\\\('|\"){1}/g\n\
                }\n\
            }\n\
        },\n\
        'pattern': /(\\(|\\s|\\[|\\=|:)(('|\")([^\\\\\\1]|\\\\.)*?(\\3))/gm\n\
    },\n\
    {\n\
        'name': 'comment',\n\
        'pattern': /\\/\\*[\\s\\S]*?\\*\\/|(\\/\\/|\\#)[\\s\\S]*?$/gm\n\
    },\n\
    {\n\
        'name': 'constant.numeric',\n\
        'pattern': /\\b(\\d+(\\.\\d+)?(e(\\+|\\-)?\\d+)?(f|d)?|0x[\\da-f]+)\\b/gi\n\
    },\n\
    {\n\
        'matches': {\n\
            1: 'keyword'\n\
        },\n\
        'pattern': /\\b(and|array|as|b(ool(ean)?|reak)|c(ase|atch|har|lass|on(st|tinue))|d(ef|elete|o(uble)?)|e(cho|lse(if)?|xit|xtends|xcept)|f(inally|loat|or(each)?|unction)|global|if|import|int(eger)?|long|new|object|or|pr(int|ivate|otected)|public|return|self|st(ring|ruct|atic)|switch|th(en|is|row)|try|(un)?signed|var|void|while)(?=\\(|\\b)/gi\n\
    },\n\
    {\n\
        'name': 'constant.language',\n\
        'pattern': /true|false|null/g\n\
    },\n\
    {\n\
        'name': 'keyword.operator',\n\
        'pattern': /\\+|\\!|\\-|&(gt|lt|amp);|\\||\\*|\\=/g\n\
    },\n\
    {\n\
        'matches': {\n\
            1: 'function.call'\n\
        },\n\
        'pattern': /(\\w+?)(?=\\()/g\n\
    },\n\
    {\n\
        'matches': {\n\
            1: 'storage.function',\n\
            2: 'entity.name.function'\n\
        },\n\
        'pattern': /(function)\\s(.*?)(?=\\()/g\n\
    }\n\
]];\n\
//@ sourceURL=segmentio-rainbow/js/language/generic.js"
));
require.register("segmentio-rainbow/js/language/go.js", Function("exports, require, module",
"/**\n\
 * GO Language\n\
 *\n\
 * @author Javier Aguirre\n\
 * @version 1.0\n\
 */\n\
module.exports = ['go', [\n\
    {\n\
        'matches': {\n\
            1: {\n\
                'name': 'keyword.operator',\n\
                'pattern': /\\=/g\n\
            },\n\
            2: {\n\
                'name': 'string',\n\
                'matches': {\n\
                    'name': 'constant.character.escape',\n\
                    'pattern': /\\\\(`|\"){1}/g\n\
                }\n\
            }\n\
        },\n\
        'pattern': /(\\(|\\s|\\[|\\=|:)((`|\")([^\\\\\\1]|\\\\.)*?(\\3))/gm\n\
    },\n\
    {\n\
        'name': 'comment',\n\
        'pattern': /\\/\\*[\\s\\S]*?\\*\\/|(\\/\\/)[\\s\\S]*?$/gm\n\
    },\n\
    {\n\
        'name': 'constant.numeric',\n\
        'pattern': /\\b(\\d+(\\.\\d+)?(e(\\+|\\-)?\\d+)?(f|d)?|0x[\\da-f]+)\\b/gi\n\
    },\n\
    {\n\
        'matches': {\n\
            1: 'keyword'\n\
        },\n\
        'pattern': /\\b(break|c(ase|onst|ontinue)|d(efault|efer)|else|fallthrough|for|go(to)?|if|import|interface|map|package|range|return|select|struct|switch|type|var)(?=\\(|\\b)/gi\n\
    },\n\
    {\n\
        'name': 'constant.language',\n\
        'pattern': /true|false|null|string|byte|rune|u?int(8|16|32|64)?|float(32|64)|complex(64|128)/g\n\
    },\n\
    {\n\
        'name': 'keyword.operator',\n\
        'pattern': /\\+|\\!|\\-|&(gt|lt|amp);|\\||\\*|\\:?=/g\n\
    },\n\
    {\n\
        'matches': {\n\
            1: 'function.call'\n\
        },\n\
        'pattern': /(\\w+?)(?=\\()/g\n\
    },\n\
    {\n\
        'matches': {\n\
            1: 'storage.function',\n\
            2: 'entity.name.function'\n\
        },\n\
        'pattern': /(func)\\s(.*?)(?=\\()/g\n\
    }\n\
]];\n\
//@ sourceURL=segmentio-rainbow/js/language/go.js"
));
require.register("segmentio-rainbow/js/language/haskell.js", Function("exports, require, module",
"/**\n\
 * Haskell patterns\n\
 *\n\
 * @author Bruno Dias\n\
 * @version 1.0.1\n\
 */\n\
//TODO: {-# ... #-} stuff...\n\
module.exports = ['haskell', [\n\
\t///- Comments\n\
\t{\n\
\t\t'name': 'comment',\n\
\t\t'pattern': /\\{\\-\\-[\\s\\S(\\w+)]+[\\-\\-][\\}$]/gm\n\
\t\t// /\\{\\-{2}[\\s\\S(.*)]+[\\-\\-][\\}$]/gm [multiple lines]\n\
\t},\n\
\t{\n\
\t\t'name': 'comment',\n\
\t\t'pattern': /\\-\\-(.*)/g\n\
\t\t// /\\-\\-\\s(.+)$/gm [single]\n\
\t},\n\
\t///- End Comments\n\
\n\
\t///- Namespace (module)\n\
\t{\n\
\t\t'matches': {\n\
\t\t\t1: 'keyword',\n\
\t\t\t2: 'support.namespace'\n\
\t\t},\n\
\t\t'pattern': /\\b(module)\\s(\\w+)\\s[\\(]?(\\w+)?[\\)?]\\swhere/g\n\
\t},\n\
\t///- End Namespace (module)\n\
\n\
\t///- Keywords and Operators\n\
\t{\n\
\t\t'name': 'keyword.operator',\n\
\t\t'pattern': /\\+|\\!|\\-|&(gt|lt|amp);|\\/\\=|\\||\\@|\\:|\\.|\\+{2}|\\:|\\*|\\=|#|\\.{2}|(\\\\)[a-zA-Z_]/g\n\
\t},\n\
\t{\n\
\t\t'name': 'keyword',\n\
\t\t'pattern': /\\b(case|class|foreign|hiding|qualified|data|family|default|deriving|do|else|if|import|in|infix|infixl|infixr|instance|let|in|otherwise|module|newtype|of|then|type|where)\\b/g\n\
\t},\n\
\t{\n\
\t\t'name': 'keyword',\n\
\t\t'pattern': /[\\`][a-zA-Z_']*?[\\`]/g\n\
\t},\n\
\t///- End Keywords and Operators\n\
\n\
\n\
\t///- Infix|Infixr|Infixl\n\
\t{\n\
\t\t'matches': {\n\
\t\t\t1: 'keyword',\n\
\t\t\t2: 'keyword.operator'\n\
\t\t},\n\
\t\t'pattern': /\\b(infix|infixr|infixl)+\\s\\d+\\s(\\w+)*/g\n\
\t},\n\
\t///- End Infix|Infixr|Infixl\n\
\n\
\t{\n\
\t\t'name': 'entity.class',\n\
\t\t'pattern': /\\b([A-Z][A-Za-z0-9_']*)/g\n\
\t},\n\
\n\
\t// From c.js\n\
\t{\n\
\t\t'name': 'meta.preprocessor',\n\
\t\t'matches': {\n\
\t\t\t1: [\n\
\t\t\t\t{\n\
\t\t\t\t\t'matches': {\n\
\t\t\t\t\t\t1: 'keyword.define',\n\
\t\t\t\t\t\t2: 'entity.name'\n\
\t\t\t\t\t},\n\
\t\t\t\t\t'pattern': /(\\w+)\\s(\\w+)\\b/g\n\
\t\t\t\t},\n\
\t\t\t\t{\n\
\t\t\t\t\t'name': 'keyword.define',\n\
\t\t\t\t\t'pattern': /endif/g\n\
\t\t\t\t},\n\
\t\t\t\t{\n\
\t\t\t\t\t'name': 'constant.numeric',\n\
\t\t\t\t\t'pattern': /\\d+/g\n\
\t\t\t\t},\n\
\t\t\t\t{\n\
\t\t\t\t\t'matches': {\n\
\t\t\t\t\t\t1: 'keyword.include',\n\
\t\t\t\t\t\t2: 'string'\n\
\t\t\t\t\t},\n\
\t\t\t\t 'pattern': /(include)\\s(.*?)$/g\n\
\t\t\t\t}\n\
\t\t\t]\n\
\t\t},\n\
\t\t'pattern': /^\\#([\\S\\s]*?)$/gm\n\
\t}\n\
]];\n\
//@ sourceURL=segmentio-rainbow/js/language/haskell.js"
));
require.register("segmentio-rainbow/js/language/html.js", Function("exports, require, module",
"/**\n\
 * HTML patterns\n\
 *\n\
 * @author Craig Campbell\n\
 * @version 1.0.7\n\
 */\n\
module.exports = ['html', [\n\
    {\n\
        'name': 'source.php.embedded',\n\
        'matches': {\n\
            2: {\n\
                'language': 'php'\n\
            }\n\
        },\n\
        'pattern': /&lt;\\?=?(?!xml)(php)?([\\s\\S]*?)(\\?&gt;)/gm\n\
    },\n\
    {\n\
        'name': 'source.css.embedded',\n\
        'matches': {\n\
            0: {\n\
                'language': 'css'\n\
            }\n\
        },\n\
        'pattern': /&lt;style(.*?)&gt;([\\s\\S]*?)&lt;\\/style&gt;/gm\n\
    },\n\
    {\n\
        'name': 'source.js.embedded',\n\
        'matches': {\n\
            0: {\n\
                'language': 'javascript'\n\
            }\n\
        },\n\
        'pattern': /&lt;script(?! src)(.*?)&gt;([\\s\\S]*?)&lt;\\/script&gt;/gm\n\
    },\n\
    {\n\
        'name': 'comment.html',\n\
        'pattern': /&lt;\\!--[\\S\\s]*?--&gt;/g\n\
    },\n\
    {\n\
        'matches': {\n\
            1: 'support.tag.open',\n\
            2: 'support.tag.close'\n\
        },\n\
        'pattern': /(&lt;)|(\\/?\\??&gt;)/g\n\
    },\n\
    {\n\
        'name': 'support.tag',\n\
        'matches': {\n\
            1: 'support.tag',\n\
            2: 'support.tag.special',\n\
            3: 'support.tag-name'\n\
        },\n\
        'pattern': /(&lt;\\??)(\\/|\\!?)(\\w+)/g\n\
    },\n\
    {\n\
        'matches': {\n\
            1: 'support.attribute'\n\
        },\n\
        'pattern': /([a-z-]+)(?=\\=)/gi\n\
    },\n\
    {\n\
        'matches': {\n\
            1: 'support.operator',\n\
            2: 'string.quote',\n\
            3: 'string.value',\n\
            4: 'string.quote'\n\
        },\n\
        'pattern': /(=)('|\")(.*?)(\\2)/g\n\
    },\n\
    {\n\
        'matches': {\n\
            1: 'support.operator',\n\
            2: 'support.value'\n\
        },\n\
        'pattern': /(=)([a-zA-Z\\-0-9]*)\\b/g\n\
    },\n\
    {\n\
        'matches': {\n\
            1: 'support.attribute'\n\
        },\n\
        'pattern': /\\s(\\w+)(?=\\s|&gt;)(?![\\s\\S]*&lt;)/g\n\
    }\n\
], true];\n\
//@ sourceURL=segmentio-rainbow/js/language/html.js"
));
require.register("segmentio-rainbow/js/language/java.js", Function("exports, require, module",
"/**\n\
* Java patterns\n\
*\n\
* @author Leo Accend\n\
* @version 1.0.0\n\
*/\n\
module.exports = [ \"java\", [\n\
  {\n\
    name: \"constant\",\n\
    pattern: /\\b(false|null|true|[A-Z_]+)\\b/g\n\
  },\n\
  {\n\
    matches: {\n\
      1: \"keyword\",\n\
      2: \"support.namespace\"\n\
    },\n\
    pattern: /(import|package)\\s(.+)/g\n\
  },\n\
  {\n\
    // see http://docs.oracle.com/javase/tutorial/java/nutsandbolts/_keywords.html\n\
    name: \"keyword\",\n\
    pattern: /\\b(abstract|assert|boolean|break|byte|case|catch|char|class|const|continue|default|do|double|else|enum|extends|final|finally|float|for|goto|if|implements|import|instanceof|int|interface|long|native|new|package|private|protected|public|return|short|static|strictfp|super|switch|synchronized|this|throw|throws|transient|try|void|volatile|while)\\b/g\n\
  },\n\
  {\n\
    name: \"string\",\n\
    pattern: /(\".*?\")/g\n\
  },\n\
  {\n\
    name: \"char\",\n\
    pattern: /(')(.|\\\\.|\\\\u[\\dA-Fa-f]{4})\\1/g\n\
  },\n\
  {\n\
    name: \"integer\",\n\
    pattern: /\\b(0x[\\da-f]+|\\d+)L?\\b/g\n\
  },\n\
  {\n\
    name: \"comment\",\n\
    pattern: /\\/\\*[\\s\\S]*?\\*\\/|(\\/\\/).*?$/gm\n\
  },\n\
  {\n\
    name: \"support.annotation\",\n\
    pattern: /@\\w+/g\n\
  },\n\
  {\n\
    matches: {\n\
      1: \"entity.function\"\n\
    },\n\
    pattern: /([^@\\.\\s]+)\\(/g\n\
  },\n\
  {\n\
    name: \"entity.class\",\n\
    pattern: /\\b([A-Z]\\w*)\\b/g\n\
  },\n\
  {\n\
    // see http://docs.oracle.com/javase/tutorial/java/nutsandbolts/operators.html\n\
    name: \"operator\",\n\
    pattern: /(\\+{1,2}|-{1,2}|~|!|\\*|\\/|%|(?:&lt;){1,2}|(?:&gt;){1,3}|instanceof|(?:&amp;){1,2}|\\^|\\|{1,2}|\\?|:|(?:=|!|\\+|-|\\*|\\/|%|\\^|\\||(?:&lt;){1,2}|(?:&gt;){1,3})?=)/g\n\
  }\n\
], true ];\n\
//@ sourceURL=segmentio-rainbow/js/language/java.js"
));
require.register("segmentio-rainbow/js/language/javascript.js", Function("exports, require, module",
"/**\n\
 * Javascript patterns\n\
 *\n\
 * @author Craig Campbell\n\
 * @version 1.0.8\n\
 */\n\
module.exports = ['javascript', [\n\
\n\
    /**\n\
     * matches $. or $(\n\
     */\n\
    {\n\
        'name': 'selector',\n\
        'pattern': /(\\s|^)\\$(?=\\.|\\()/g\n\
    },\n\
    {\n\
        'name': 'support',\n\
        'pattern': /\\b(window|document)\\b/g\n\
    },\n\
    {\n\
        'matches': {\n\
            1: 'support.property'\n\
        },\n\
        'pattern': /\\.(length|node(Name|Value))\\b/g\n\
    },\n\
    {\n\
        'matches': {\n\
            1: 'support.function'\n\
        },\n\
        'pattern': /(setTimeout|setInterval)(?=\\()/g\n\
\n\
    },\n\
    {\n\
        'matches': {\n\
            1: 'support.method'\n\
        },\n\
        'pattern': /\\.(getAttribute|push|getElementById|getElementsByClassName|log|setTimeout|setInterval)(?=\\()/g\n\
    },\n\
    {\n\
        'matches': {\n\
            1: 'support.tag.script',\n\
            2: [\n\
                {\n\
                    'name': 'string',\n\
                    'pattern': /('|\")(.*?)(\\1)/g\n\
                },\n\
                {\n\
                    'name': 'entity.tag.script',\n\
                    'pattern': /(\\w+)/g\n\
                }\n\
            ],\n\
            3: 'support.tag.script'\n\
        },\n\
        'pattern': /(&lt;\\/?)(script.*?)(&gt;)/g\n\
    },\n\
\n\
    /**\n\
     * matches any escaped characters inside of a js regex pattern\n\
     *\n\
     * @see https://github.com/ccampbell/rainbow/issues/22\n\
     *\n\
     * this was causing single line comments to fail so it now makes sure\n\
     * the opening / is not directly followed by a *\n\
     *\n\
     * @todo check that there is valid regex in match group 1\n\
     */\n\
    {\n\
        'name': 'string.regexp',\n\
        'matches': {\n\
            1: 'string.regexp.open',\n\
            2: {\n\
                'name': 'constant.regexp.escape',\n\
                'pattern': /\\\\(.){1}/g\n\
            },\n\
            3: 'string.regexp.close',\n\
            4: 'string.regexp.modifier'\n\
        },\n\
        'pattern': /(\\/)(?!\\*)(.+)(\\/)([igm]{0,3})/g\n\
    },\n\
\n\
    /**\n\
     * matches runtime function declarations\n\
     */\n\
    {\n\
        'matches': {\n\
            1: 'storage',\n\
            3: 'entity.function'\n\
        },\n\
        'pattern': /(var)?(\\s|^)(\\S*)(?=\\s?=\\s?function\\()/g\n\
    },\n\
\n\
    /**\n\
     * matches constructor call\n\
     */\n\
    {\n\
        'matches': {\n\
            1: 'keyword',\n\
            2: 'entity.function'\n\
        },\n\
        'pattern': /(new)\\s+(.*)(?=\\()/g\n\
    },\n\
\n\
    /**\n\
     * matches any function call in the style functionName: function()\n\
     */\n\
    {\n\
        'name': 'entity.function',\n\
        'pattern': /(\\w+)(?=:\\s{0,}function)/g\n\
    }\n\
]];\n\
//@ sourceURL=segmentio-rainbow/js/language/javascript.js"
));
require.register("segmentio-rainbow/js/language/lua.js", Function("exports, require, module",
"/**\n\
 * Lua patterns\n\
 *\n\
 * @author Javier Aguirre\n\
 * @version 1.0.1\n\
 */\n\
module.exports = ['lua', [\n\
    {\n\
        'matches': {\n\
            1: {\n\
                'name': 'keyword.operator',\n\
                'pattern': /\\=/g\n\
            },\n\
            2: {\n\
                'name': 'string',\n\
                'matches': {\n\
                    'name': 'constant.character.escape',\n\
                    'pattern': /\\\\('|\"){1}/g\n\
                }\n\
            }\n\
        },\n\
        'pattern': /(\\(|\\s|\\[|\\=)(('|\")([^\\\\\\1]|\\\\.)*?(\\3))/gm\n\
    },\n\
    {\n\
        'name': 'comment',\n\
        'pattern': /\\-{2}\\[{2}\\-{2}[\\s\\S]*?\\-{2}\\]{2}\\-{2}|(\\-{2})[\\s\\S]*?$/gm\n\
    },\n\
    {\n\
        'name': 'constant.numeric',\n\
        'pattern': /\\b(\\d+(\\.\\d+)?(e(\\+|\\-)?\\d+)?(f|d)?|0x[\\da-f]+)\\b/gi\n\
    },\n\
    {\n\
        'matches': {\n\
            1: 'keyword'\n\
        },\n\
        'pattern': /\\b((a|e)nd|in|repeat|break|local|return|do|for|then|else(if)?|function|not|if|or|until|while)(?=\\(|\\b)/gi\n\
    },\n\
    {\n\
        'name': 'constant.language',\n\
        'pattern': /true|false|nil/g\n\
    },\n\
    {\n\
        'name': 'keyword.operator',\n\
        'pattern': /\\+|\\!|\\-|&(gt|lt|amp);|\\||\\*|\\=|#|\\.{2}/g\n\
    },\n\
    {\n\
        'matches': {\n\
            1: 'storage.function',\n\
            2: 'entity.name.function'\n\
        },\n\
        'pattern': /(function)\\s+(\\w+[\\:|\\.]?\\w+?)(?=\\()/g\n\
    },\n\
    {\n\
        'matches': {\n\
            1: 'support.function'\n\
        },\n\
        'pattern': /\\b(print|require|module|\\w+\\.\\w+)(?=\\()/g\n\
    }\n\
], true];\n\
//@ sourceURL=segmentio-rainbow/js/language/lua.js"
));
require.register("segmentio-rainbow/js/language/php.js", Function("exports, require, module",
"/**\n\
 * PHP patterns\n\
 *\n\
 * @author Craig Campbell\n\
 * @version 1.0.8\n\
 */\n\
module.exports = ['php', [\n\
    {\n\
        'name': 'support',\n\
        'pattern': /\\becho\\b/g\n\
    },\n\
    {\n\
        'matches': {\n\
            1: 'variable.dollar-sign',\n\
            2: 'variable'\n\
        },\n\
        'pattern': /(\\$)(\\w+)\\b/g\n\
    },\n\
    {\n\
        'name': 'constant.language',\n\
        'pattern': /true|false|null/ig\n\
    },\n\
    {\n\
        'name': 'constant',\n\
        'pattern': /\\b[A-Z0-9_]{2,}\\b/g\n\
    },\n\
    {\n\
        'name': 'keyword.dot',\n\
        'pattern': /\\./g\n\
    },\n\
    {\n\
        'name': 'keyword',\n\
        'pattern': /\\b(die|end(for(each)?|switch|if)|case|require(_once)?|include(_once)?)(?=\\(|\\b)/g\n\
    },\n\
    {\n\
        'matches': {\n\
            1: 'keyword',\n\
            2: {\n\
                'name': 'support.class',\n\
                'pattern': /\\w+/g\n\
            }\n\
        },\n\
        'pattern': /(instanceof)\\s([^\\$].*?)(\\)|;)/g\n\
    },\n\
\n\
    /**\n\
     * these are the top 50 most used PHP functions\n\
     * found from running a script and checking the frequency of each function\n\
     * over a bunch of popular PHP frameworks then combining the results\n\
     */\n\
    {\n\
        'matches': {\n\
            1: 'support.function'\n\
        },\n\
        'pattern': /\\b(array(_key_exists|_merge|_keys|_shift)?|isset|count|empty|unset|printf|is_(array|string|numeric|object)|sprintf|each|date|time|substr|pos|str(len|pos|tolower|_replace|totime)?|ord|trim|in_array|implode|end|preg_match|explode|fmod|define|link|list|get_class|serialize|file|sort|mail|dir|idate|log|intval|header|chr|function_exists|dirname|preg_replace|file_exists)(?=\\()/g\n\
    },\n\
    {\n\
        'name': 'variable.language.php-tag',\n\
        'pattern': /(&lt;\\?(php)?|\\?&gt;)/g\n\
    },\n\
    {\n\
        'matches': {\n\
            1: 'keyword.namespace',\n\
            2: {\n\
                'name': 'support.namespace',\n\
                'pattern': /\\w+/g\n\
            }\n\
        },\n\
        'pattern': /\\b(namespace|use)\\s(.*?);/g\n\
    },\n\
    {\n\
        'matches': {\n\
            1: 'storage.modifier',\n\
            2: 'storage.class',\n\
            3: 'entity.name.class',\n\
            4: 'storage.modifier.extends',\n\
            5: 'entity.other.inherited-class',\n\
            6: 'storage.modifier.extends',\n\
            7: 'entity.other.inherited-class'\n\
        },\n\
        'pattern': /\\b(abstract|final)?\\s?(class|interface|trait)\\s(\\w+)(\\sextends\\s)?([\\w\\\\]*)?(\\simplements\\s)?([\\w\\\\]*)?\\s?\\{?(\\n\
|\\})/g\n\
    },\n\
    {\n\
        'name': 'keyword.static',\n\
        'pattern': /self::|static::/g\n\
    },\n\
    {\n\
        'matches': {\n\
            1: 'storage.function',\n\
            2: 'support.magic'\n\
        },\n\
        'pattern': /(function)\\s(__.*?)(?=\\()/g\n\
    },\n\
    {\n\
        'matches': {\n\
            1: 'keyword.new',\n\
            2: {\n\
                'name': 'support.class',\n\
                'pattern': /\\w+/g\n\
            }\n\
        },\n\
        'pattern': /\\b(new)\\s([^\\$].*?)(?=\\)|\\(|;)/g\n\
    },\n\
    {\n\
        'matches': {\n\
            1: {\n\
                'name': 'support.class',\n\
                'pattern': /\\w+/g\n\
            },\n\
            2: 'keyword.static'\n\
        },\n\
        'pattern': /([\\w\\\\]*?)(::)(?=\\b|\\$)/g\n\
    },\n\
    {\n\
        'matches': {\n\
            2: {\n\
                'name': 'support.class',\n\
                'pattern': /\\w+/g\n\
            }\n\
        },\n\
        'pattern': /(\\(|,\\s?)([\\w\\\\]*?)(?=\\s\\$)/g\n\
    }\n\
]];\n\
//@ sourceURL=segmentio-rainbow/js/language/php.js"
));
require.register("segmentio-rainbow/js/language/python.js", Function("exports, require, module",
"/**\n\
 * Python patterns\n\
 *\n\
 * @author Craig Campbell\n\
 * @version 1.0.9\n\
 */\n\
module.exports = ['python', [\n\
    /**\n\
     * don't highlight self as a keyword\n\
     */\n\
    {\n\
        'name': 'variable.self',\n\
        'pattern': /self/g\n\
    },\n\
    {\n\
        'name': 'constant.language',\n\
        'pattern': /None|True|False|NotImplemented|\\.\\.\\./g\n\
    },\n\
    {\n\
        'name': 'support.object',\n\
        'pattern': /object/g\n\
    },\n\
\n\
    /**\n\
     * built in python functions\n\
     *\n\
     * this entire list is 580 bytes minified / 379 bytes gzipped\n\
     *\n\
     * @see http://docs.python.org/library/functions.html\n\
     *\n\
     * @todo strip some out or consolidate the regexes with matching patterns?\n\
     */\n\
    {\n\
        'name': 'support.function.python',\n\
        'pattern': /\\b(bs|divmod|input|open|staticmethod|all|enumerate|int|ord|str|any|eval|isinstance|pow|sum|basestring|execfile|issubclass|print|super|bin|file|iter|property|tuple|bool|filter|len|range|type|bytearray|float|list|raw_input|unichr|callable|format|locals|reduce|unicode|chr|frozenset|long|reload|vars|classmethod|getattr|map|repr|xrange|cmp|globals|max|reversed|zip|compile|hasattr|memoryview|round|__import__|complex|hash|min|set|apply|delattr|help|next|setattr|buffer|dict|hex|object|slice|coerce|dir|id|oct|sorted|intern)(?=\\()/g\n\
    },\n\
    {\n\
        'matches': {\n\
            1: 'keyword'\n\
        },\n\
        'pattern': /\\b(pass|lambda|with|is|not|in|from|elif|raise|del)(?=\\(|\\b)/g\n\
    },\n\
    {\n\
        'matches': {\n\
            1: 'storage.class',\n\
            2: 'entity.name.class',\n\
            3: 'entity.other.inherited-class'\n\
        },\n\
        'pattern': /(class)\\s+(\\w+)\\((\\w+?)\\)/g\n\
    },\n\
    {\n\
        'matches': {\n\
            1: 'storage.function',\n\
            2: 'support.magic'\n\
        },\n\
        'pattern': /(def)\\s+(__\\w+)(?=\\()/g\n\
    },\n\
    {\n\
        'name': 'support.magic',\n\
        'pattern': /__(name)__/g\n\
    },\n\
    {\n\
        'matches': {\n\
            1: 'keyword.control',\n\
            2: 'support.exception.type'\n\
        },\n\
        'pattern': /(except) (\\w+):/g\n\
    },\n\
    {\n\
        'matches': {\n\
            1: 'storage.function',\n\
            2: 'entity.name.function'\n\
        },\n\
        'pattern': /(def)\\s+(\\w+)(?=\\()/g\n\
    },\n\
    {\n\
        'name': 'entity.name.function.decorator',\n\
        'pattern': /@([\\w\\.]+)/g\n\
    },\n\
    {\n\
        'name': 'comment.docstring',\n\
        'pattern': /('{3}|\"{3})[\\s\\S]*?\\1/gm\n\
    }\n\
]];\n\
//@ sourceURL=segmentio-rainbow/js/language/python.js"
));
require.register("segmentio-rainbow/js/language/r.js", Function("exports, require, module",
"/**\n\
 * R language patterns\n\
 *\n\
 * @author Simon Potter\n\
 * @version 1.0\n\
 */\n\
module.exports = ['r', [\n\
    /**\n\
     * Note that a valid variable name is of the form:\n\
     * [.a-zA-Z][0-9a-zA-Z._]*\n\
     */\n\
    {\n\
        'matches': {\n\
            1: {\n\
                'name': 'keyword.operator',\n\
                'pattern': /\\=|<\\-|&lt;-/g\n\
            },\n\
            2: {\n\
                'name': 'string',\n\
                'matches': {\n\
                    'name': 'constant.character.escape',\n\
                    'pattern': /\\\\('|\"){1}/g\n\
                }\n\
            }\n\
        },\n\
        'pattern': /(\\(|\\s|\\[|\\=|:)(('|\")([^\\\\\\1]|\\\\.)*?(\\3))/gm\n\
    },\n\
\n\
    /**\n\
     * Most of these are known via the Language Reference.\n\
     * The built-in constant symbols are known via ?Constants.\n\
     */\n\
    {\n\
        'matches': {\n\
            1: 'constant.language'\n\
        },\n\
        'pattern': /\\b(NULL|NA|TRUE|FALSE|T|F|NaN|Inf|NA_integer_|NA_real_|NA_complex_|NA_character_)\\b/g\n\
    },\n\
    {\n\
        'matches': {\n\
            1: 'constant.symbol'\n\
        },\n\
        'pattern': /[^0-9a-zA-Z\\._](LETTERS|letters|month\\.(abb|name)|pi)/g\n\
    },\n\
\n\
    /**\n\
     * @todo: The list subsetting operator isn't quite working properly.\n\
     *        It includes the previous variable when it should only match [[\n\
     */\n\
    {\n\
        'name': 'keyword.operator',\n\
        'pattern': /&lt;-|<-|-|==|&lt;=|<=|&gt;>|>=|<|>|&amp;&amp;|&&|&amp;|&|!=|\\|\\|?|\\*|\\+|\\^|\\/|%%|%\\/%|\\=|%in%|%\\*%|%o%|%x%|\\$|:|~|\\[{1,2}|\\]{1,2}/g\n\
    },\n\
    {\n\
        'matches': {\n\
            1: 'storage',\n\
            3: 'entity.function'\n\
        },\n\
        'pattern': /(\\s|^)(.*)(?=\\s?=\\s?function\\s\\()/g\n\
    },\n\
    {\n\
        'matches': {\n\
            1: 'storage.function'\n\
        },\n\
        'pattern': /[^a-zA-Z0-9._](function)(?=\\s*\\()/g\n\
    },\n\
    {\n\
        'matches': {\n\
            1: 'namespace',\n\
            2: 'keyword.operator',\n\
            3: 'function.call'\n\
        },\n\
        'pattern': /([a-zA-Z][a-zA-Z0-9._]+)([:]{2,3})([.a-zA-Z][a-zA-Z0-9._]*(?=\\s*\\())\\b/g\n\
    },\n\
\n\
    /*\n\
     * Note that we would perhaps match more builtin functions and\n\
     * variables, but there are so many that most are ommitted for now.\n\
     * See ?builtins for more info.\n\
     *\n\
     * @todo: Fix the case where we have a function like tmp.logical().\n\
     *        This should just be a function call, at the moment it's\n\
     *        only partly a function all.\n\
     */\n\
    {\n\
        'name': 'support.function',\n\
        'pattern': /(^|[^0-9a-zA-Z\\._])(array|character|complex|data\\.frame|double|integer|list|logical|matrix|numeric|vector)(?=\\s*\\()/g\n\
    }\n\
]];\n\
//@ sourceURL=segmentio-rainbow/js/language/r.js"
));
require.register("segmentio-rainbow/js/language/ruby.js", Function("exports, require, module",
"/**\n\
 * Ruby patterns\n\
 *\n\
 * @author Matthew King\n\
 * @author Jesse Farmer <jesse@20bits.com>\n\
 * @author actsasflinn\n\
 * @version 1.0.5\n\
 */\n\
\n\
module.exports = ['ruby', [\n\
    /**\n\
     * Strings\n\
     *   1. No support for multi-line strings\n\
     */\n\
    {\n\
        'name': 'string',\n\
        'matches': {\n\
            1: 'string.open',\n\
            2: {\n\
                'name': 'string.keyword',\n\
                'pattern': /(\\#\\{.*?\\})/g\n\
            },\n\
            3: 'string.close'\n\
        },\n\
        'pattern': /(\"|`)(.*?[^\\\\\\1])?(\\1)/g\n\
    },\n\
    {\n\
        'name': 'string',\n\
        'pattern': /('|\"|`)([^\\\\\\1\\n\
]|\\\\.)*\\1/g\n\
    },\n\
    {\n\
        'name': 'string',\n\
        'pattern': /%[qQ](?=(\\(|\\[|\\{|&lt;|.)(.*?)(?:'|\\)|\\]|\\}|&gt;|\\1))(?:\\(\\2\\)|\\[\\2\\]|\\{\\2\\}|\\&lt;\\2&gt;|\\1\\2\\1)/g\n\
    },\n\
    /**\n\
     * Heredocs\n\
     * Heredocs of the form `<<'HTML' ... HTML` are unsupported.\n\
     */\n\
    {\n\
        'matches': {\n\
            1: 'string',\n\
            2: 'string',\n\
            3: 'string'\n\
        },\n\
        'pattern': /(&lt;&lt;)(\\w+).*?$([\\s\\S]*?^\\2)/gm\n\
    },\n\
    {\n\
        'matches': {\n\
            1: 'string',\n\
            2: 'string',\n\
            3: 'string'\n\
        },\n\
        'pattern': /(&lt;&lt;\\-)(\\w+).*?$([\\s\\S]*?\\2)/gm\n\
    },\n\
    /**\n\
     * Regular expressions\n\
     * Escaped delimiter (`/\\//`) is unsupported.\n\
     */\n\
    {\n\
        'name': 'string.regexp',\n\
        'matches': {\n\
            1: 'string.regexp',\n\
            2: {\n\
                'name': 'string.regexp',\n\
                'pattern': /\\\\(.){1}/g\n\
            },\n\
            3: 'string.regexp',\n\
            4: 'string.regexp'\n\
        },\n\
        'pattern': /(\\/)(.*?)(\\/)([a-z]*)/g\n\
    },\n\
    {\n\
        'name': 'string.regexp',\n\
        'matches': {\n\
            1: 'string.regexp',\n\
            2: {\n\
                'name': 'string.regexp',\n\
                'pattern': /\\\\(.){1}/g\n\
            },\n\
            3: 'string.regexp',\n\
            4: 'string.regexp'\n\
        },\n\
        'pattern': /%r(?=(\\(|\\[|\\{|&lt;|.)(.*?)('|\\)|\\]|\\}|&gt;|\\1))(?:\\(\\2\\)|\\[\\2\\]|\\{\\2\\}|\\&lt;\\2&gt;|\\1\\2\\1)([a-z]*)/g\n\
    },\n\
    /**\n\
     * Comments\n\
     */\n\
    {\n\
        'name': 'comment',\n\
        'pattern': /#.*$/gm\n\
    },\n\
    {\n\
        'name': 'comment',\n\
        'pattern': /^\\=begin[\\s\\S]*?\\=end$/gm\n\
    },\n\
    /**\n\
     * Symbols\n\
     */\n\
    {\n\
        'matches': {\n\
            1: 'constant'\n\
        },\n\
        'pattern': /(\\w+:)[^:]/g\n\
    },\n\
    {\n\
        'matches': {\n\
            1: 'constant.symbol'\n\
        },\n\
        'pattern': /[^:](:(?:\\w+|(?=['\"](.*?)['\"])(?:\"\\2\"|'\\2')))/g\n\
    },\n\
    {\n\
        'name': 'constant.numeric',\n\
        'pattern': /\\b(0x[\\da-f]+|\\d+)\\b/g\n\
    },\n\
    {\n\
        'name': 'support.class',\n\
        'pattern': /\\b[A-Z]\\w*(?=((\\.|::)[A-Za-z]|\\[))/g\n\
    },\n\
    {\n\
        'name': 'constant',\n\
        'pattern': /\\b[A-Z]\\w*\\b/g\n\
    },\n\
    /**\n\
     * Keywords, variables, constants, and operators\n\
     *   In Ruby some keywords are valid method names, e.g., MyClass#yield\n\
     *   Don't mark those instances as \"keywords\"\n\
     */\n\
    {\n\
        'matches': {\n\
            1: 'storage.class',\n\
            2: 'entity.name.class',\n\
            3: 'entity.other.inherited-class'\n\
        },\n\
        'pattern': /\\s*(class)\\s+((?:(?:::)?[A-Z]\\w*)+)(?:\\s+&lt;\\s+((?:(?:::)?[A-Z]\\w*)+))?/g\n\
    },\n\
    {\n\
        'matches': {\n\
            1: 'storage.module',\n\
            2: 'entity.name.class'\n\
        },\n\
        'pattern': /\\s*(module)\\s+((?:(?:::)?[A-Z]\\w*)+)/g\n\
    },\n\
    {\n\
        'name': 'variable.global',\n\
        'pattern': /\\$([a-zA-Z_]\\w*)\\b/g\n\
    },\n\
    {\n\
        'name': 'variable.class',\n\
        'pattern': /@@([a-zA-Z_]\\w*)\\b/g\n\
    },\n\
    {\n\
        'name': 'variable.instance',\n\
        'pattern': /@([a-zA-Z_]\\w*)\\b/g\n\
    },\n\
    {\n\
        'matches': {\n\
            1: 'keyword.control'\n\
        },\n\
        'pattern': /[^\\.]\\b(BEGIN|begin|case|class|do|else|elsif|END|end|ensure|for|if|in|module|rescue|then|unless|until|when|while)\\b(?![?!])/g\n\
    },\n\
    {\n\
        'matches': {\n\
            1: 'keyword.control.pseudo-method'\n\
        },\n\
        'pattern': /[^\\.]\\b(alias|alias_method|break|next|redo|retry|return|super|undef|yield)\\b(?![?!])|\\bdefined\\?|\\bblock_given\\?/g\n\
    },\n\
    {\n\
        'matches': {\n\
            1: 'constant.language'\n\
        },\n\
        'pattern': /\\b(nil|true|false)\\b(?![?!])/g\n\
    },\n\
    {\n\
        'matches': {\n\
            1: 'variable.language'\n\
        },\n\
        'pattern': /\\b(__(FILE|LINE)__|self)\\b(?![?!])/g\n\
    },\n\
    {\n\
        'matches': {\n\
            1: 'keyword.special-method'\n\
        },\n\
        'pattern': /\\b(require|gem|initialize|new|loop|include|extend|raise|attr_reader|attr_writer|attr_accessor|attr|catch|throw|private|module_function|public|protected)\\b(?![?!])/g\n\
    },\n\
    {\n\
        'name': 'keyword.operator',\n\
        'pattern': /\\s\\?\\s|=|&lt;&lt;|&lt;&lt;=|%=|&=|\\*=|\\*\\*=|\\+=|\\-=|\\^=|\\|{1,2}=|&lt;&lt;|&lt;=&gt;|&lt;(?!&lt;|=)|&gt;(?!&lt;|=|&gt;)|&lt;=|&gt;=|===|==|=~|!=|!~|%|&amp;|\\*\\*|\\*|\\+|\\-|\\/|\\||~|&gt;&gt;/g\n\
    },\n\
    {\n\
        'matches': {\n\
            1: 'keyword.operator.logical'\n\
        },\n\
        'pattern': /[^\\.]\\b(and|not|or)\\b/g\n\
    },\n\
\n\
    /**\n\
    * Functions\n\
    *   1. No support for marking function parameters\n\
    */\n\
    {\n\
        'matches': {\n\
            1: 'storage.function',\n\
            2: 'entity.name.function'\n\
        },\n\
        'pattern': /(def)\\s(.*?)(?=(\\s|\\())/g\n\
    }\n\
], true];\n\
//@ sourceURL=segmentio-rainbow/js/language/ruby.js"
));
require.register("segmentio-rainbow/js/language/scheme.js", Function("exports, require, module",
"/**\n\
 * Scheme patterns\n\
 *\n\
 * @author Alex Queiroz <alex@artisancoder.com>\n\
 * @version 1.0\n\
 */\n\
module.exports = ['scheme', [\n\
    {\n\
        /* making peace with HTML */\n\
        'name': 'plain',\n\
        'pattern': /&gt;|&lt;/g\n\
    },\n\
    {\n\
        'name': 'comment',\n\
        'pattern': /;.*$/gm\n\
    },\n\
    {\n\
        'name': 'constant.language',\n\
        'pattern': /#t|#f|'\\(\\)/g\n\
    },\n\
    {\n\
        'name': 'constant.symbol',\n\
        'pattern': /'[^()\\s#]+/g\n\
    },\n\
    {\n\
        'name': 'constant.number',\n\
        'pattern': /\\b\\d+(?:\\.\\d*)?\\b/g\n\
    },\n\
    {\n\
        'name': 'string',\n\
        'pattern': /\".+?\"/g\n\
    },\n\
    {\n\
        'matches': {\n\
            1: 'storage.function',\n\
            2: 'variable'\n\
        },\n\
        'pattern': /\\(\\s*(define)\\s+\\(?(\\S+)/g\n\
    },\n\
    {\n\
        'matches': {\n\
            1: 'keyword'\n\
        },\n\
        'pattern': /\\(\\s*(begin|define\\-syntax|if|lambda|quasiquote|quote|set!|syntax\\-rules|and|and\\-let\\*|case|cond|delay|do|else|or|let|let\\*|let\\-syntax|letrec|letrec\\-syntax)(?=[\\]()\\s#])/g\n\
    },\n\
    {\n\
        'matches': {\n\
            1: 'entity.function'\n\
        },\n\
        'pattern': /\\(\\s*(eqv\\?|eq\\?|equal\\?|number\\?|complex\\?|real\\?|rational\\?|integer\\?|exact\\?|inexact\\?|=|<|>|<=|>=|zero\\?|positive\\?|negative\\?|odd\\?|even\\?|max|min|\\+|\\-|\\*|\\/|abs|quotient|remainder|modulo|gcd|lcm|numerator|denominator|floor|ceiling|truncate|round|rationalize|exp|log|sin|cos|tan|asin|acos|atan|sqrt|expt|make\\-rectangular|make\\-polar|real\\-part|imag\\-part|magnitude|angle|exact\\->inexact|inexact\\->exact|number\\->string|string\\->number|not|boolean\\?|pair\\?|cons|car|cdr|set\\-car!|set\\-cdr!|caar|cadr|cdar|cddr|caaar|caadr|cadar|caddr|cdaar|cdadr|cddar|cdddr|caaaar|caaadr|caadar|caaddr|cadaar|cadadr|caddar|cadddr|cdaaar|cdaadr|cdadar|cdaddr|cddaar|cddadr|cdddar|cddddr|null\\?|list\\?|list|length|append|reverse|list\\-tail|list\\-ref|memq|memv|member|assq|assv|assoc|symbol\\?|symbol\\->string|string\\->symbol|char\\?|char=\\?|char<\\?|char>\\?|char<=\\?|char>=\\?|char\\-ci=\\?|char\\-ci<\\?|char\\-ci>\\?|char\\-ci<=\\?|char\\-ci>=\\?|char\\-alphabetic\\?|char\\-numeric\\?|char\\-whitespace\\?|char\\-upper\\-case\\?|char\\-lower\\-case\\?|char\\->integer|integer\\->char|char\\-upcase|char\\-downcase|string\\?|make\\-string|string|string\\-length|string\\-ref|string\\-set!|string=\\?|string\\-ci=\\?|string<\\?|string>\\?|string<=\\?|string>=\\?|string\\-ci<\\?|string\\-ci>\\?|string\\-ci<=\\?|string\\-ci>=\\?|substring|string\\-append|string\\->list|list\\->string|string\\-copy|string\\-fill!|vector\\?|make\\-vector|vector|vector\\-length|vector\\-ref|vector\\-set!|vector\\->list|list\\->vector|vector\\-fill!|procedure\\?|apply|map|for\\-each|force|call\\-with\\-current\\-continuation|call\\/cc|values|call\\-with\\-values|dynamic\\-wind|eval|scheme\\-report\\-environment|null\\-environment|interaction\\-environment|call\\-with\\-input\\-file|call\\-with\\-output\\-file|input\\-port\\?|output\\-port\\?|current\\-input\\-port|current\\-output\\-port|with\\-input\\-from\\-file|with\\-output\\-to\\-file|open\\-input\\-file|open\\-output\\-file|close\\-input\\-port|close\\-output\\-port|read|read\\-char|peek\\-char|eof\\-object\\?|char\\-ready\\?|write|display|newline|write\\-char|load|transcript\\-on|transcript\\-off)(?=[\\]()\\s#])/g\n\
    }\n\
], true];\n\
//@ sourceURL=segmentio-rainbow/js/language/scheme.js"
));
require.register("segmentio-rainbow/js/language/shell.js", Function("exports, require, module",
"/**\n\
 * Shell patterns\n\
 *\n\
 * @author Matthew King\n\
 * @author Craig Campbell\n\
 * @version 1.0.3\n\
 */\n\
module.exports = ['shell', [\n\
    /**\n\
     * This handles the case where subshells contain quotes.\n\
     * For example: `\"$(resolve_link \"$name\" || true)\"`.\n\
     *\n\
     * Caveat: This really should match balanced parentheses, but cannot.\n\
     * @see http://stackoverflow.com/questions/133601/can-regular-expressions-be-used-to-match-nested-patterns\n\
     */\n\
    {\n\
        'name': 'shell',\n\
        'matches': {\n\
            1: {\n\
                'language': 'shell'\n\
            }\n\
        },\n\
        'pattern': /\\$\\(([\\s\\S]*?)\\)/gm\n\
    },\n\
    {\n\
        'matches': {\n\
            2: 'string'\n\
        },\n\
        'pattern': /(\\(|\\s|\\[|\\=)(('|\")[\\s\\S]*?(\\3))/gm\n\
    },\n\
    {\n\
        'name': 'keyword.operator',\n\
        'pattern': /&lt;|&gt;|&amp;/g\n\
    },\n\
    {\n\
        'name': 'comment',\n\
        'pattern': /\\#[\\s\\S]*?$/gm\n\
    },\n\
    {\n\
        'name': 'storage.function',\n\
        'pattern': /(.+?)(?=\\(\\)\\s{0,}\\{)/g\n\
    },\n\
    /**\n\
     * Environment variables\n\
     */\n\
    {\n\
        'name': 'support.command',\n\
        'pattern': /\\b(echo|rm|ls|(mk|rm)dir|cd|find|cp|exit|pwd|exec|trap|source|shift|unset)/g\n\
    },\n\
    {\n\
        'matches': {\n\
            1: 'keyword'\n\
        },\n\
        'pattern': /\\b(break|case|continue|do|done|elif|else|esac|eval|export|fi|for|function|if|in|local|return|set|then|unset|until|while)(?=\\(|\\b)/g\n\
    }\n\
], true];\n\
//@ sourceURL=segmentio-rainbow/js/language/shell.js"
));
require.register("segmentio-rainbow/js/language/smalltalk.js", Function("exports, require, module",
"/**\n\
 * Smalltalk patterns\n\
 *\n\
 * @author Frank Shearar <frank@angband.za.org>\n\
 * @version 1.0\n\
 */\n\
module.exports = ['smalltalk', [\n\
    {\n\
        'name': 'keyword.pseudovariable',\n\
        'pattern': /self|thisContext/g\n\
    },\n\
    {\n\
        'name': 'keyword.constant',\n\
        'pattern': /false|nil|true/g\n\
    },\n\
    {\n\
        'name': 'string',\n\
        'pattern': /'([^']|'')*'/g\n\
    },\n\
    {\n\
        'name': 'string.symbol',\n\
        'pattern': /#\\w+|#'([^']|'')*'/g\n\
    },\n\
    {\n\
        'name': 'string.character',\n\
        'pattern': /\\$\\w+/g\n\
    },\n\
    {\n\
        'name': 'comment',\n\
        'pattern': /\"([^\"]|\"\")*\"/g\n\
    },\n\
    {\n\
        'name': 'constant.numeric',\n\
        'pattern': /-?\\d+(\\.\\d+)?((r-?|s)[A-Za-z0-9]+|e-?[0-9]+)?/g\n\
    },\n\
    {\n\
        'name': 'entity.name.class',\n\
        'pattern': /\\b[A-Z]\\w*/g\n\
    },\n\
    {\n\
        'name': 'entity.name.function',\n\
        'pattern': /\\b[a-z]\\w*:?/g\n\
    },\n\
    {\n\
        'name': 'entity.name.binary',\n\
        'pattern': /(&lt;|&gt;|&amp;|[=~\\|\\\\\\/!@*\\-_+])+/g\n\
    },\n\
    {\n\
        'name': 'operator.delimiter',\n\
        'pattern': /;[\\(\\)\\[\\]\\{\\}]|#\\[|#\\(^\\./g\n\
    }\n\
], true];\n\
//@ sourceURL=segmentio-rainbow/js/language/smalltalk.js"
));
require.register("component-moment/index.js", Function("exports, require, module",
"// moment.js\n\
// version : 2.0.0\n\
// author : Tim Wood\n\
// license : MIT\n\
// momentjs.com\n\
\n\
(function (undefined) {\n\
\n\
    /************************************\n\
        Constants\n\
    ************************************/\n\
\n\
    var moment,\n\
        VERSION = \"2.0.0\",\n\
        round = Math.round, i,\n\
        // internal storage for language config files\n\
        languages = {},\n\
\n\
        // check for nodeJS\n\
        hasModule = (typeof module !== 'undefined' && module.exports),\n\
\n\
        // ASP.NET json date format regex\n\
        aspNetJsonRegex = /^\\/?Date\\((\\-?\\d+)/i,\n\
\n\
        // format tokens\n\
        formattingTokens = /(\\[[^\\[]*\\])|(\\\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|YYYYY|YYYY|YY|a|A|hh?|HH?|mm?|ss?|SS?S?|X|zz?|ZZ?|.)/g,\n\
        localFormattingTokens = /(\\[[^\\[]*\\])|(\\\\)?(LT|LL?L?L?|l{1,4})/g,\n\
\n\
        // parsing tokens\n\
        parseMultipleFormatChunker = /([0-9a-zA-Z\\u00A0-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF]+)/gi,\n\
\n\
        // parsing token regexes\n\
        parseTokenOneOrTwoDigits = /\\d\\d?/, // 0 - 99\n\
        parseTokenOneToThreeDigits = /\\d{1,3}/, // 0 - 999\n\
        parseTokenThreeDigits = /\\d{3}/, // 000 - 999\n\
        parseTokenFourDigits = /\\d{1,4}/, // 0 - 9999\n\
        parseTokenSixDigits = /[+\\-]?\\d{1,6}/, // -999,999 - 999,999\n\
        parseTokenWord = /[0-9]*[a-z\\u00A0-\\u05FF\\u0700-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF]+|[\\u0600-\\u06FF]+\\s*?[\\u0600-\\u06FF]+/i, // any word (or two) characters or numbers including two word month in arabic.\n\
        parseTokenTimezone = /Z|[\\+\\-]\\d\\d:?\\d\\d/i, // +00:00 -00:00 +0000 -0000 or Z\n\
        parseTokenT = /T/i, // T (ISO seperator)\n\
        parseTokenTimestampMs = /[\\+\\-]?\\d+(\\.\\d{1,3})?/, // 123456789 123456789.123\n\
\n\
        // preliminary iso regex\n\
        // 0000-00-00 + T + 00 or 00:00 or 00:00:00 or 00:00:00.000 + +00:00 or +0000\n\
        isoRegex = /^\\s*\\d{4}-\\d\\d-\\d\\d((T| )(\\d\\d(:\\d\\d(:\\d\\d(\\.\\d\\d?\\d?)?)?)?)?([\\+\\-]\\d\\d:?\\d\\d)?)?/,\n\
        isoFormat = 'YYYY-MM-DDTHH:mm:ssZ',\n\
\n\
        // iso time formats and regexes\n\
        isoTimes = [\n\
            ['HH:mm:ss.S', /(T| )\\d\\d:\\d\\d:\\d\\d\\.\\d{1,3}/],\n\
            ['HH:mm:ss', /(T| )\\d\\d:\\d\\d:\\d\\d/],\n\
            ['HH:mm', /(T| )\\d\\d:\\d\\d/],\n\
            ['HH', /(T| )\\d\\d/]\n\
        ],\n\
\n\
        // timezone chunker \"+10:00\" > [\"10\", \"00\"] or \"-1530\" > [\"-15\", \"30\"]\n\
        parseTimezoneChunker = /([\\+\\-]|\\d\\d)/gi,\n\
\n\
        // getter and setter names\n\
        proxyGettersAndSetters = 'Month|Date|Hours|Minutes|Seconds|Milliseconds'.split('|'),\n\
        unitMillisecondFactors = {\n\
            'Milliseconds' : 1,\n\
            'Seconds' : 1e3,\n\
            'Minutes' : 6e4,\n\
            'Hours' : 36e5,\n\
            'Days' : 864e5,\n\
            'Months' : 2592e6,\n\
            'Years' : 31536e6\n\
        },\n\
\n\
        // format function strings\n\
        formatFunctions = {},\n\
\n\
        // tokens to ordinalize and pad\n\
        ordinalizeTokens = 'DDD w W M D d'.split(' '),\n\
        paddedTokens = 'M D H h m s w W'.split(' '),\n\
\n\
        formatTokenFunctions = {\n\
            M    : function () {\n\
                return this.month() + 1;\n\
            },\n\
            MMM  : function (format) {\n\
                return this.lang().monthsShort(this, format);\n\
            },\n\
            MMMM : function (format) {\n\
                return this.lang().months(this, format);\n\
            },\n\
            D    : function () {\n\
                return this.date();\n\
            },\n\
            DDD  : function () {\n\
                return this.dayOfYear();\n\
            },\n\
            d    : function () {\n\
                return this.day();\n\
            },\n\
            dd   : function (format) {\n\
                return this.lang().weekdaysMin(this, format);\n\
            },\n\
            ddd  : function (format) {\n\
                return this.lang().weekdaysShort(this, format);\n\
            },\n\
            dddd : function (format) {\n\
                return this.lang().weekdays(this, format);\n\
            },\n\
            w    : function () {\n\
                return this.week();\n\
            },\n\
            W    : function () {\n\
                return this.isoWeek();\n\
            },\n\
            YY   : function () {\n\
                return leftZeroFill(this.year() % 100, 2);\n\
            },\n\
            YYYY : function () {\n\
                return leftZeroFill(this.year(), 4);\n\
            },\n\
            YYYYY : function () {\n\
                return leftZeroFill(this.year(), 5);\n\
            },\n\
            a    : function () {\n\
                return this.lang().meridiem(this.hours(), this.minutes(), true);\n\
            },\n\
            A    : function () {\n\
                return this.lang().meridiem(this.hours(), this.minutes(), false);\n\
            },\n\
            H    : function () {\n\
                return this.hours();\n\
            },\n\
            h    : function () {\n\
                return this.hours() % 12 || 12;\n\
            },\n\
            m    : function () {\n\
                return this.minutes();\n\
            },\n\
            s    : function () {\n\
                return this.seconds();\n\
            },\n\
            S    : function () {\n\
                return ~~(this.milliseconds() / 100);\n\
            },\n\
            SS   : function () {\n\
                return leftZeroFill(~~(this.milliseconds() / 10), 2);\n\
            },\n\
            SSS  : function () {\n\
                return leftZeroFill(this.milliseconds(), 3);\n\
            },\n\
            Z    : function () {\n\
                var a = -this.zone(),\n\
                    b = \"+\";\n\
                if (a < 0) {\n\
                    a = -a;\n\
                    b = \"-\";\n\
                }\n\
                return b + leftZeroFill(~~(a / 60), 2) + \":\" + leftZeroFill(~~a % 60, 2);\n\
            },\n\
            ZZ   : function () {\n\
                var a = -this.zone(),\n\
                    b = \"+\";\n\
                if (a < 0) {\n\
                    a = -a;\n\
                    b = \"-\";\n\
                }\n\
                return b + leftZeroFill(~~(10 * a / 6), 4);\n\
            },\n\
            X    : function () {\n\
                return this.unix();\n\
            }\n\
        };\n\
\n\
    function padToken(func, count) {\n\
        return function (a) {\n\
            return leftZeroFill(func.call(this, a), count);\n\
        };\n\
    }\n\
    function ordinalizeToken(func) {\n\
        return function (a) {\n\
            return this.lang().ordinal(func.call(this, a));\n\
        };\n\
    }\n\
\n\
    while (ordinalizeTokens.length) {\n\
        i = ordinalizeTokens.pop();\n\
        formatTokenFunctions[i + 'o'] = ordinalizeToken(formatTokenFunctions[i]);\n\
    }\n\
    while (paddedTokens.length) {\n\
        i = paddedTokens.pop();\n\
        formatTokenFunctions[i + i] = padToken(formatTokenFunctions[i], 2);\n\
    }\n\
    formatTokenFunctions.DDDD = padToken(formatTokenFunctions.DDD, 3);\n\
\n\
\n\
    /************************************\n\
        Constructors\n\
    ************************************/\n\
\n\
    function Language() {\n\
\n\
    }\n\
\n\
    // Moment prototype object\n\
    function Moment(config) {\n\
        extend(this, config);\n\
    }\n\
\n\
    // Duration Constructor\n\
    function Duration(duration) {\n\
        var data = this._data = {},\n\
            years = duration.years || duration.year || duration.y || 0,\n\
            months = duration.months || duration.month || duration.M || 0,\n\
            weeks = duration.weeks || duration.week || duration.w || 0,\n\
            days = duration.days || duration.day || duration.d || 0,\n\
            hours = duration.hours || duration.hour || duration.h || 0,\n\
            minutes = duration.minutes || duration.minute || duration.m || 0,\n\
            seconds = duration.seconds || duration.second || duration.s || 0,\n\
            milliseconds = duration.milliseconds || duration.millisecond || duration.ms || 0;\n\
\n\
        // representation for dateAddRemove\n\
        this._milliseconds = milliseconds +\n\
            seconds * 1e3 + // 1000\n\
            minutes * 6e4 + // 1000 * 60\n\
            hours * 36e5; // 1000 * 60 * 60\n\
        // Because of dateAddRemove treats 24 hours as different from a\n\
        // day when working around DST, we need to store them separately\n\
        this._days = days +\n\
            weeks * 7;\n\
        // It is impossible translate months into days without knowing\n\
        // which months you are are talking about, so we have to store\n\
        // it separately.\n\
        this._months = months +\n\
            years * 12;\n\
\n\
        // The following code bubbles up values, see the tests for\n\
        // examples of what that means.\n\
        data.milliseconds = milliseconds % 1000;\n\
        seconds += absRound(milliseconds / 1000);\n\
\n\
        data.seconds = seconds % 60;\n\
        minutes += absRound(seconds / 60);\n\
\n\
        data.minutes = minutes % 60;\n\
        hours += absRound(minutes / 60);\n\
\n\
        data.hours = hours % 24;\n\
        days += absRound(hours / 24);\n\
\n\
        days += weeks * 7;\n\
        data.days = days % 30;\n\
\n\
        months += absRound(days / 30);\n\
\n\
        data.months = months % 12;\n\
        years += absRound(months / 12);\n\
\n\
        data.years = years;\n\
    }\n\
\n\
\n\
    /************************************\n\
        Helpers\n\
    ************************************/\n\
\n\
\n\
    function extend(a, b) {\n\
        for (var i in b) {\n\
            if (b.hasOwnProperty(i)) {\n\
                a[i] = b[i];\n\
            }\n\
        }\n\
        return a;\n\
    }\n\
\n\
    function absRound(number) {\n\
        if (number < 0) {\n\
            return Math.ceil(number);\n\
        } else {\n\
            return Math.floor(number);\n\
        }\n\
    }\n\
\n\
    // left zero fill a number\n\
    // see http://jsperf.com/left-zero-filling for performance comparison\n\
    function leftZeroFill(number, targetLength) {\n\
        var output = number + '';\n\
        while (output.length < targetLength) {\n\
            output = '0' + output;\n\
        }\n\
        return output;\n\
    }\n\
\n\
    // helper function for _.addTime and _.subtractTime\n\
    function addOrSubtractDurationFromMoment(mom, duration, isAdding) {\n\
        var ms = duration._milliseconds,\n\
            d = duration._days,\n\
            M = duration._months,\n\
            currentDate;\n\
\n\
        if (ms) {\n\
            mom._d.setTime(+mom + ms * isAdding);\n\
        }\n\
        if (d) {\n\
            mom.date(mom.date() + d * isAdding);\n\
        }\n\
        if (M) {\n\
            currentDate = mom.date();\n\
            mom.date(1)\n\
                .month(mom.month() + M * isAdding)\n\
                .date(Math.min(currentDate, mom.daysInMonth()));\n\
        }\n\
    }\n\
\n\
    // check if is an array\n\
    function isArray(input) {\n\
        return Object.prototype.toString.call(input) === '[object Array]';\n\
    }\n\
\n\
    // compare two arrays, return the number of differences\n\
    function compareArrays(array1, array2) {\n\
        var len = Math.min(array1.length, array2.length),\n\
            lengthDiff = Math.abs(array1.length - array2.length),\n\
            diffs = 0,\n\
            i;\n\
        for (i = 0; i < len; i++) {\n\
            if (~~array1[i] !== ~~array2[i]) {\n\
                diffs++;\n\
            }\n\
        }\n\
        return diffs + lengthDiff;\n\
    }\n\
\n\
\n\
    /************************************\n\
        Languages\n\
    ************************************/\n\
\n\
\n\
    Language.prototype = {\n\
        set : function (config) {\n\
            var prop, i;\n\
            for (i in config) {\n\
                prop = config[i];\n\
                if (typeof prop === 'function') {\n\
                    this[i] = prop;\n\
                } else {\n\
                    this['_' + i] = prop;\n\
                }\n\
            }\n\
        },\n\
\n\
        _months : \"January_February_March_April_May_June_July_August_September_October_November_December\".split(\"_\"),\n\
        months : function (m) {\n\
            return this._months[m.month()];\n\
        },\n\
\n\
        _monthsShort : \"Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec\".split(\"_\"),\n\
        monthsShort : function (m) {\n\
            return this._monthsShort[m.month()];\n\
        },\n\
\n\
        monthsParse : function (monthName) {\n\
            var i, mom, regex, output;\n\
\n\
            if (!this._monthsParse) {\n\
                this._monthsParse = [];\n\
            }\n\
\n\
            for (i = 0; i < 12; i++) {\n\
                // make the regex if we don't have it already\n\
                if (!this._monthsParse[i]) {\n\
                    mom = moment([2000, i]);\n\
                    regex = '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');\n\
                    this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');\n\
                }\n\
                // test the regex\n\
                if (this._monthsParse[i].test(monthName)) {\n\
                    return i;\n\
                }\n\
            }\n\
        },\n\
\n\
        _weekdays : \"Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday\".split(\"_\"),\n\
        weekdays : function (m) {\n\
            return this._weekdays[m.day()];\n\
        },\n\
\n\
        _weekdaysShort : \"Sun_Mon_Tue_Wed_Thu_Fri_Sat\".split(\"_\"),\n\
        weekdaysShort : function (m) {\n\
            return this._weekdaysShort[m.day()];\n\
        },\n\
\n\
        _weekdaysMin : \"Su_Mo_Tu_We_Th_Fr_Sa\".split(\"_\"),\n\
        weekdaysMin : function (m) {\n\
            return this._weekdaysMin[m.day()];\n\
        },\n\
\n\
        _longDateFormat : {\n\
            LT : \"h:mm A\",\n\
            L : \"MM/DD/YYYY\",\n\
            LL : \"MMMM D YYYY\",\n\
            LLL : \"MMMM D YYYY LT\",\n\
            LLLL : \"dddd, MMMM D YYYY LT\"\n\
        },\n\
        longDateFormat : function (key) {\n\
            var output = this._longDateFormat[key];\n\
            if (!output && this._longDateFormat[key.toUpperCase()]) {\n\
                output = this._longDateFormat[key.toUpperCase()].replace(/MMMM|MM|DD|dddd/g, function (val) {\n\
                    return val.slice(1);\n\
                });\n\
                this._longDateFormat[key] = output;\n\
            }\n\
            return output;\n\
        },\n\
\n\
        meridiem : function (hours, minutes, isLower) {\n\
            if (hours > 11) {\n\
                return isLower ? 'pm' : 'PM';\n\
            } else {\n\
                return isLower ? 'am' : 'AM';\n\
            }\n\
        },\n\
\n\
        _calendar : {\n\
            sameDay : '[Today at] LT',\n\
            nextDay : '[Tomorrow at] LT',\n\
            nextWeek : 'dddd [at] LT',\n\
            lastDay : '[Yesterday at] LT',\n\
            lastWeek : '[last] dddd [at] LT',\n\
            sameElse : 'L'\n\
        },\n\
        calendar : function (key, mom) {\n\
            var output = this._calendar[key];\n\
            return typeof output === 'function' ? output.apply(mom) : output;\n\
        },\n\
\n\
        _relativeTime : {\n\
            future : \"in %s\",\n\
            past : \"%s ago\",\n\
            s : \"a few seconds\",\n\
            m : \"a minute\",\n\
            mm : \"%d minutes\",\n\
            h : \"an hour\",\n\
            hh : \"%d hours\",\n\
            d : \"a day\",\n\
            dd : \"%d days\",\n\
            M : \"a month\",\n\
            MM : \"%d months\",\n\
            y : \"a year\",\n\
            yy : \"%d years\"\n\
        },\n\
        relativeTime : function (number, withoutSuffix, string, isFuture) {\n\
            var output = this._relativeTime[string];\n\
            return (typeof output === 'function') ?\n\
                output(number, withoutSuffix, string, isFuture) :\n\
                output.replace(/%d/i, number);\n\
        },\n\
        pastFuture : function (diff, output) {\n\
            var format = this._relativeTime[diff > 0 ? 'future' : 'past'];\n\
            return typeof format === 'function' ? format(output) : format.replace(/%s/i, output);\n\
        },\n\
\n\
        ordinal : function (number) {\n\
            return this._ordinal.replace(\"%d\", number);\n\
        },\n\
        _ordinal : \"%d\",\n\
\n\
        preparse : function (string) {\n\
            return string;\n\
        },\n\
\n\
        postformat : function (string) {\n\
            return string;\n\
        },\n\
\n\
        week : function (mom) {\n\
            return weekOfYear(mom, this._week.dow, this._week.doy);\n\
        },\n\
        _week : {\n\
            dow : 0, // Sunday is the first day of the week.\n\
            doy : 6  // The week that contains Jan 1st is the first week of the year.\n\
        }\n\
    };\n\
\n\
    // Loads a language definition into the `languages` cache.  The function\n\
    // takes a key and optionally values.  If not in the browser and no values\n\
    // are provided, it will load the language file module.  As a convenience,\n\
    // this function also returns the language values.\n\
    function loadLang(key, values) {\n\
        values.abbr = key;\n\
        if (!languages[key]) {\n\
            languages[key] = new Language();\n\
        }\n\
        languages[key].set(values);\n\
        return languages[key];\n\
    }\n\
\n\
    // Determines which language definition to use and returns it.\n\
    //\n\
    // With no parameters, it will return the global language.  If you\n\
    // pass in a language key, such as 'en', it will return the\n\
    // definition for 'en', so long as 'en' has already been loaded using\n\
    // moment.lang.\n\
    function getLangDefinition(key) {\n\
        if (!key) {\n\
            return moment.fn._lang;\n\
        }\n\
        if (!languages[key] && hasModule) {\n\
            require('./lang/' + key);\n\
        }\n\
        return languages[key];\n\
    }\n\
\n\
\n\
    /************************************\n\
        Formatting\n\
    ************************************/\n\
\n\
\n\
    function removeFormattingTokens(input) {\n\
        if (input.match(/\\[.*\\]/)) {\n\
            return input.replace(/^\\[|\\]$/g, \"\");\n\
        }\n\
        return input.replace(/\\\\/g, \"\");\n\
    }\n\
\n\
    function makeFormatFunction(format) {\n\
        var array = format.match(formattingTokens), i, length;\n\
\n\
        for (i = 0, length = array.length; i < length; i++) {\n\
            if (formatTokenFunctions[array[i]]) {\n\
                array[i] = formatTokenFunctions[array[i]];\n\
            } else {\n\
                array[i] = removeFormattingTokens(array[i]);\n\
            }\n\
        }\n\
\n\
        return function (mom) {\n\
            var output = \"\";\n\
            for (i = 0; i < length; i++) {\n\
                output += typeof array[i].call === 'function' ? array[i].call(mom, format) : array[i];\n\
            }\n\
            return output;\n\
        };\n\
    }\n\
\n\
    // format date using native date object\n\
    function formatMoment(m, format) {\n\
        var i = 5;\n\
\n\
        function replaceLongDateFormatTokens(input) {\n\
            return m.lang().longDateFormat(input) || input;\n\
        }\n\
\n\
        while (i-- && localFormattingTokens.test(format)) {\n\
            format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);\n\
        }\n\
\n\
        if (!formatFunctions[format]) {\n\
            formatFunctions[format] = makeFormatFunction(format);\n\
        }\n\
\n\
        return formatFunctions[format](m);\n\
    }\n\
\n\
\n\
    /************************************\n\
        Parsing\n\
    ************************************/\n\
\n\
\n\
    // get the regex to find the next token\n\
    function getParseRegexForToken(token) {\n\
        switch (token) {\n\
        case 'DDDD':\n\
            return parseTokenThreeDigits;\n\
        case 'YYYY':\n\
            return parseTokenFourDigits;\n\
        case 'YYYYY':\n\
            return parseTokenSixDigits;\n\
        case 'S':\n\
        case 'SS':\n\
        case 'SSS':\n\
        case 'DDD':\n\
            return parseTokenOneToThreeDigits;\n\
        case 'MMM':\n\
        case 'MMMM':\n\
        case 'dd':\n\
        case 'ddd':\n\
        case 'dddd':\n\
        case 'a':\n\
        case 'A':\n\
            return parseTokenWord;\n\
        case 'X':\n\
            return parseTokenTimestampMs;\n\
        case 'Z':\n\
        case 'ZZ':\n\
            return parseTokenTimezone;\n\
        case 'T':\n\
            return parseTokenT;\n\
        case 'MM':\n\
        case 'DD':\n\
        case 'YY':\n\
        case 'HH':\n\
        case 'hh':\n\
        case 'mm':\n\
        case 'ss':\n\
        case 'M':\n\
        case 'D':\n\
        case 'd':\n\
        case 'H':\n\
        case 'h':\n\
        case 'm':\n\
        case 's':\n\
            return parseTokenOneOrTwoDigits;\n\
        default :\n\
            return new RegExp(token.replace('\\\\', ''));\n\
        }\n\
    }\n\
\n\
    // function to convert string input to date\n\
    function addTimeToArrayFromToken(token, input, config) {\n\
        var a, b,\n\
            datePartArray = config._a;\n\
\n\
        switch (token) {\n\
        // MONTH\n\
        case 'M' : // fall through to MM\n\
        case 'MM' :\n\
            datePartArray[1] = (input == null) ? 0 : ~~input - 1;\n\
            break;\n\
        case 'MMM' : // fall through to MMMM\n\
        case 'MMMM' :\n\
            a = getLangDefinition(config._l).monthsParse(input);\n\
            // if we didn't find a month name, mark the date as invalid.\n\
            if (a != null) {\n\
                datePartArray[1] = a;\n\
            } else {\n\
                config._isValid = false;\n\
            }\n\
            break;\n\
        // DAY OF MONTH\n\
        case 'D' : // fall through to DDDD\n\
        case 'DD' : // fall through to DDDD\n\
        case 'DDD' : // fall through to DDDD\n\
        case 'DDDD' :\n\
            if (input != null) {\n\
                datePartArray[2] = ~~input;\n\
            }\n\
            break;\n\
        // YEAR\n\
        case 'YY' :\n\
            datePartArray[0] = ~~input + (~~input > 68 ? 1900 : 2000);\n\
            break;\n\
        case 'YYYY' :\n\
        case 'YYYYY' :\n\
            datePartArray[0] = ~~input;\n\
            break;\n\
        // AM / PM\n\
        case 'a' : // fall through to A\n\
        case 'A' :\n\
            config._isPm = ((input + '').toLowerCase() === 'pm');\n\
            break;\n\
        // 24 HOUR\n\
        case 'H' : // fall through to hh\n\
        case 'HH' : // fall through to hh\n\
        case 'h' : // fall through to hh\n\
        case 'hh' :\n\
            datePartArray[3] = ~~input;\n\
            break;\n\
        // MINUTE\n\
        case 'm' : // fall through to mm\n\
        case 'mm' :\n\
            datePartArray[4] = ~~input;\n\
            break;\n\
        // SECOND\n\
        case 's' : // fall through to ss\n\
        case 'ss' :\n\
            datePartArray[5] = ~~input;\n\
            break;\n\
        // MILLISECOND\n\
        case 'S' :\n\
        case 'SS' :\n\
        case 'SSS' :\n\
            datePartArray[6] = ~~ (('0.' + input) * 1000);\n\
            break;\n\
        // UNIX TIMESTAMP WITH MS\n\
        case 'X':\n\
            config._d = new Date(parseFloat(input) * 1000);\n\
            break;\n\
        // TIMEZONE\n\
        case 'Z' : // fall through to ZZ\n\
        case 'ZZ' :\n\
            config._useUTC = true;\n\
            a = (input + '').match(parseTimezoneChunker);\n\
            if (a && a[1]) {\n\
                config._tzh = ~~a[1];\n\
            }\n\
            if (a && a[2]) {\n\
                config._tzm = ~~a[2];\n\
            }\n\
            // reverse offsets\n\
            if (a && a[0] === '+') {\n\
                config._tzh = -config._tzh;\n\
                config._tzm = -config._tzm;\n\
            }\n\
            break;\n\
        }\n\
\n\
        // if the input is null, the date is not valid\n\
        if (input == null) {\n\
            config._isValid = false;\n\
        }\n\
    }\n\
\n\
    // convert an array to a date.\n\
    // the array should mirror the parameters below\n\
    // note: all values past the year are optional and will default to the lowest possible value.\n\
    // [year, month, day , hour, minute, second, millisecond]\n\
    function dateFromArray(config) {\n\
        var i, date, input = [];\n\
\n\
        if (config._d) {\n\
            return;\n\
        }\n\
\n\
        for (i = 0; i < 7; i++) {\n\
            config._a[i] = input[i] = (config._a[i] == null) ? (i === 2 ? 1 : 0) : config._a[i];\n\
        }\n\
\n\
        // add the offsets to the time to be parsed so that we can have a clean array for checking isValid\n\
        input[3] += config._tzh || 0;\n\
        input[4] += config._tzm || 0;\n\
\n\
        date = new Date(0);\n\
\n\
        if (config._useUTC) {\n\
            date.setUTCFullYear(input[0], input[1], input[2]);\n\
            date.setUTCHours(input[3], input[4], input[5], input[6]);\n\
        } else {\n\
            date.setFullYear(input[0], input[1], input[2]);\n\
            date.setHours(input[3], input[4], input[5], input[6]);\n\
        }\n\
\n\
        config._d = date;\n\
    }\n\
\n\
    // date from string and format string\n\
    function makeDateFromStringAndFormat(config) {\n\
        // This array is used to make a Date, either with `new Date` or `Date.UTC`\n\
        var tokens = config._f.match(formattingTokens),\n\
            string = config._i,\n\
            i, parsedInput;\n\
\n\
        config._a = [];\n\
\n\
        for (i = 0; i < tokens.length; i++) {\n\
            parsedInput = (getParseRegexForToken(tokens[i]).exec(string) || [])[0];\n\
            if (parsedInput) {\n\
                string = string.slice(string.indexOf(parsedInput) + parsedInput.length);\n\
            }\n\
            // don't parse if its not a known token\n\
            if (formatTokenFunctions[tokens[i]]) {\n\
                addTimeToArrayFromToken(tokens[i], parsedInput, config);\n\
            }\n\
        }\n\
        // handle am pm\n\
        if (config._isPm && config._a[3] < 12) {\n\
            config._a[3] += 12;\n\
        }\n\
        // if is 12 am, change hours to 0\n\
        if (config._isPm === false && config._a[3] === 12) {\n\
            config._a[3] = 0;\n\
        }\n\
        // return\n\
        dateFromArray(config);\n\
    }\n\
\n\
    // date from string and array of format strings\n\
    function makeDateFromStringAndArray(config) {\n\
        var tempConfig,\n\
            tempMoment,\n\
            bestMoment,\n\
\n\
            scoreToBeat = 99,\n\
            i,\n\
            currentScore;\n\
\n\
        for (i = config._f.length; i > 0; i--) {\n\
            tempConfig = extend({}, config);\n\
            tempConfig._f = config._f[i - 1];\n\
            makeDateFromStringAndFormat(tempConfig);\n\
            tempMoment = new Moment(tempConfig);\n\
\n\
            if (tempMoment.isValid()) {\n\
                bestMoment = tempMoment;\n\
                break;\n\
            }\n\
\n\
            currentScore = compareArrays(tempConfig._a, tempMoment.toArray());\n\
\n\
            if (currentScore < scoreToBeat) {\n\
                scoreToBeat = currentScore;\n\
                bestMoment = tempMoment;\n\
            }\n\
        }\n\
\n\
        extend(config, bestMoment);\n\
    }\n\
\n\
    // date from iso format\n\
    function makeDateFromString(config) {\n\
        var i,\n\
            string = config._i;\n\
        if (isoRegex.exec(string)) {\n\
            config._f = 'YYYY-MM-DDT';\n\
            for (i = 0; i < 4; i++) {\n\
                if (isoTimes[i][1].exec(string)) {\n\
                    config._f += isoTimes[i][0];\n\
                    break;\n\
                }\n\
            }\n\
            if (parseTokenTimezone.exec(string)) {\n\
                config._f += \" Z\";\n\
            }\n\
            makeDateFromStringAndFormat(config);\n\
        } else {\n\
            config._d = new Date(string);\n\
        }\n\
    }\n\
\n\
    function makeDateFromInput(config) {\n\
        var input = config._i,\n\
            matched = aspNetJsonRegex.exec(input);\n\
\n\
        if (input === undefined) {\n\
            config._d = new Date();\n\
        } else if (matched) {\n\
            config._d = new Date(+matched[1]);\n\
        } else if (typeof input === 'string') {\n\
            makeDateFromString(config);\n\
        } else if (isArray(input)) {\n\
            config._a = input.slice(0);\n\
            dateFromArray(config);\n\
        } else {\n\
            config._d = input instanceof Date ? new Date(+input) : new Date(input);\n\
        }\n\
    }\n\
\n\
\n\
    /************************************\n\
        Relative Time\n\
    ************************************/\n\
\n\
\n\
    // helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize\n\
    function substituteTimeAgo(string, number, withoutSuffix, isFuture, lang) {\n\
        return lang.relativeTime(number || 1, !!withoutSuffix, string, isFuture);\n\
    }\n\
\n\
    function relativeTime(milliseconds, withoutSuffix, lang) {\n\
        var seconds = round(Math.abs(milliseconds) / 1000),\n\
            minutes = round(seconds / 60),\n\
            hours = round(minutes / 60),\n\
            days = round(hours / 24),\n\
            years = round(days / 365),\n\
            args = seconds < 45 && ['s', seconds] ||\n\
                minutes === 1 && ['m'] ||\n\
                minutes < 45 && ['mm', minutes] ||\n\
                hours === 1 && ['h'] ||\n\
                hours < 22 && ['hh', hours] ||\n\
                days === 1 && ['d'] ||\n\
                days <= 25 && ['dd', days] ||\n\
                days <= 45 && ['M'] ||\n\
                days < 345 && ['MM', round(days / 30)] ||\n\
                years === 1 && ['y'] || ['yy', years];\n\
        args[2] = withoutSuffix;\n\
        args[3] = milliseconds > 0;\n\
        args[4] = lang;\n\
        return substituteTimeAgo.apply({}, args);\n\
    }\n\
\n\
\n\
    /************************************\n\
        Week of Year\n\
    ************************************/\n\
\n\
\n\
    // firstDayOfWeek       0 = sun, 6 = sat\n\
    //                      the day of the week that starts the week\n\
    //                      (usually sunday or monday)\n\
    // firstDayOfWeekOfYear 0 = sun, 6 = sat\n\
    //                      the first week is the week that contains the first\n\
    //                      of this day of the week\n\
    //                      (eg. ISO weeks use thursday (4))\n\
    function weekOfYear(mom, firstDayOfWeek, firstDayOfWeekOfYear) {\n\
        var end = firstDayOfWeekOfYear - firstDayOfWeek,\n\
            daysToDayOfWeek = firstDayOfWeekOfYear - mom.day();\n\
\n\
\n\
        if (daysToDayOfWeek > end) {\n\
            daysToDayOfWeek -= 7;\n\
        }\n\
\n\
        if (daysToDayOfWeek < end - 7) {\n\
            daysToDayOfWeek += 7;\n\
        }\n\
\n\
        return Math.ceil(moment(mom).add('d', daysToDayOfWeek).dayOfYear() / 7);\n\
    }\n\
\n\
\n\
    /************************************\n\
        Top Level Functions\n\
    ************************************/\n\
\n\
    function makeMoment(config) {\n\
        var input = config._i,\n\
            format = config._f;\n\
\n\
        if (input === null || input === '') {\n\
            return null;\n\
        }\n\
\n\
        if (typeof input === 'string') {\n\
            config._i = input = getLangDefinition().preparse(input);\n\
        }\n\
\n\
        if (moment.isMoment(input)) {\n\
            config = extend({}, input);\n\
            config._d = new Date(+input._d);\n\
        } else if (format) {\n\
            if (isArray(format)) {\n\
                makeDateFromStringAndArray(config);\n\
            } else {\n\
                makeDateFromStringAndFormat(config);\n\
            }\n\
        } else {\n\
            makeDateFromInput(config);\n\
        }\n\
\n\
        return new Moment(config);\n\
    }\n\
\n\
    moment = function (input, format, lang) {\n\
        return makeMoment({\n\
            _i : input,\n\
            _f : format,\n\
            _l : lang,\n\
            _isUTC : false\n\
        });\n\
    };\n\
\n\
    // creating with utc\n\
    moment.utc = function (input, format, lang) {\n\
        return makeMoment({\n\
            _useUTC : true,\n\
            _isUTC : true,\n\
            _l : lang,\n\
            _i : input,\n\
            _f : format\n\
        });\n\
    };\n\
\n\
    // creating with unix timestamp (in seconds)\n\
    moment.unix = function (input) {\n\
        return moment(input * 1000);\n\
    };\n\
\n\
    // duration\n\
    moment.duration = function (input, key) {\n\
        var isDuration = moment.isDuration(input),\n\
            isNumber = (typeof input === 'number'),\n\
            duration = (isDuration ? input._data : (isNumber ? {} : input)),\n\
            ret;\n\
\n\
        if (isNumber) {\n\
            if (key) {\n\
                duration[key] = input;\n\
            } else {\n\
                duration.milliseconds = input;\n\
            }\n\
        }\n\
\n\
        ret = new Duration(duration);\n\
\n\
        if (isDuration && input.hasOwnProperty('_lang')) {\n\
            ret._lang = input._lang;\n\
        }\n\
\n\
        return ret;\n\
    };\n\
\n\
    // version number\n\
    moment.version = VERSION;\n\
\n\
    // default format\n\
    moment.defaultFormat = isoFormat;\n\
\n\
    // This function will load languages and then set the global language.  If\n\
    // no arguments are passed in, it will simply return the current global\n\
    // language key.\n\
    moment.lang = function (key, values) {\n\
        var i;\n\
\n\
        if (!key) {\n\
            return moment.fn._lang._abbr;\n\
        }\n\
        if (values) {\n\
            loadLang(key, values);\n\
        } else if (!languages[key]) {\n\
            getLangDefinition(key);\n\
        }\n\
        moment.duration.fn._lang = moment.fn._lang = getLangDefinition(key);\n\
    };\n\
\n\
    // returns language data\n\
    moment.langData = function (key) {\n\
        if (key && key._lang && key._lang._abbr) {\n\
            key = key._lang._abbr;\n\
        }\n\
        return getLangDefinition(key);\n\
    };\n\
\n\
    // compare moment object\n\
    moment.isMoment = function (obj) {\n\
        return obj instanceof Moment;\n\
    };\n\
\n\
    // for typechecking Duration objects\n\
    moment.isDuration = function (obj) {\n\
        return obj instanceof Duration;\n\
    };\n\
\n\
\n\
    /************************************\n\
        Moment Prototype\n\
    ************************************/\n\
\n\
\n\
    moment.fn = Moment.prototype = {\n\
\n\
        clone : function () {\n\
            return moment(this);\n\
        },\n\
\n\
        valueOf : function () {\n\
            return +this._d;\n\
        },\n\
\n\
        unix : function () {\n\
            return Math.floor(+this._d / 1000);\n\
        },\n\
\n\
        toString : function () {\n\
            return this.format(\"ddd MMM DD YYYY HH:mm:ss [GMT]ZZ\");\n\
        },\n\
\n\
        toDate : function () {\n\
            return this._d;\n\
        },\n\
\n\
        toJSON : function () {\n\
            return moment.utc(this).format('YYYY-MM-DD[T]HH:mm:ss.SSS[Z]');\n\
        },\n\
\n\
        toArray : function () {\n\
            var m = this;\n\
            return [\n\
                m.year(),\n\
                m.month(),\n\
                m.date(),\n\
                m.hours(),\n\
                m.minutes(),\n\
                m.seconds(),\n\
                m.milliseconds()\n\
            ];\n\
        },\n\
\n\
        isValid : function () {\n\
            if (this._isValid == null) {\n\
                if (this._a) {\n\
                    this._isValid = !compareArrays(this._a, (this._isUTC ? moment.utc(this._a) : moment(this._a)).toArray());\n\
                } else {\n\
                    this._isValid = !isNaN(this._d.getTime());\n\
                }\n\
            }\n\
            return !!this._isValid;\n\
        },\n\
\n\
        utc : function () {\n\
            this._isUTC = true;\n\
            return this;\n\
        },\n\
\n\
        local : function () {\n\
            this._isUTC = false;\n\
            return this;\n\
        },\n\
\n\
        format : function (inputString) {\n\
            var output = formatMoment(this, inputString || moment.defaultFormat);\n\
            return this.lang().postformat(output);\n\
        },\n\
\n\
        add : function (input, val) {\n\
            var dur;\n\
            // switch args to support add('s', 1) and add(1, 's')\n\
            if (typeof input === 'string') {\n\
                dur = moment.duration(+val, input);\n\
            } else {\n\
                dur = moment.duration(input, val);\n\
            }\n\
            addOrSubtractDurationFromMoment(this, dur, 1);\n\
            return this;\n\
        },\n\
\n\
        subtract : function (input, val) {\n\
            var dur;\n\
            // switch args to support subtract('s', 1) and subtract(1, 's')\n\
            if (typeof input === 'string') {\n\
                dur = moment.duration(+val, input);\n\
            } else {\n\
                dur = moment.duration(input, val);\n\
            }\n\
            addOrSubtractDurationFromMoment(this, dur, -1);\n\
            return this;\n\
        },\n\
\n\
        diff : function (input, units, asFloat) {\n\
            var that = this._isUTC ? moment(input).utc() : moment(input).local(),\n\
                zoneDiff = (this.zone() - that.zone()) * 6e4,\n\
                diff, output;\n\
\n\
            if (units) {\n\
                // standardize on singular form\n\
                units = units.replace(/s$/, '');\n\
            }\n\
\n\
            if (units === 'year' || units === 'month') {\n\
                diff = (this.daysInMonth() + that.daysInMonth()) * 432e5; // 24 * 60 * 60 * 1000 / 2\n\
                output = ((this.year() - that.year()) * 12) + (this.month() - that.month());\n\
                output += ((this - moment(this).startOf('month')) - (that - moment(that).startOf('month'))) / diff;\n\
                if (units === 'year') {\n\
                    output = output / 12;\n\
                }\n\
            } else {\n\
                diff = (this - that) - zoneDiff;\n\
                output = units === 'second' ? diff / 1e3 : // 1000\n\
                    units === 'minute' ? diff / 6e4 : // 1000 * 60\n\
                    units === 'hour' ? diff / 36e5 : // 1000 * 60 * 60\n\
                    units === 'day' ? diff / 864e5 : // 1000 * 60 * 60 * 24\n\
                    units === 'week' ? diff / 6048e5 : // 1000 * 60 * 60 * 24 * 7\n\
                    diff;\n\
            }\n\
            return asFloat ? output : absRound(output);\n\
        },\n\
\n\
        from : function (time, withoutSuffix) {\n\
            return moment.duration(this.diff(time)).lang(this.lang()._abbr).humanize(!withoutSuffix);\n\
        },\n\
\n\
        fromNow : function (withoutSuffix) {\n\
            return this.from(moment(), withoutSuffix);\n\
        },\n\
\n\
        calendar : function () {\n\
            var diff = this.diff(moment().startOf('day'), 'days', true),\n\
                format = diff < -6 ? 'sameElse' :\n\
                diff < -1 ? 'lastWeek' :\n\
                diff < 0 ? 'lastDay' :\n\
                diff < 1 ? 'sameDay' :\n\
                diff < 2 ? 'nextDay' :\n\
                diff < 7 ? 'nextWeek' : 'sameElse';\n\
            return this.format(this.lang().calendar(format, this));\n\
        },\n\
\n\
        isLeapYear : function () {\n\
            var year = this.year();\n\
            return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;\n\
        },\n\
\n\
        isDST : function () {\n\
            return (this.zone() < moment([this.year()]).zone() ||\n\
                this.zone() < moment([this.year(), 5]).zone());\n\
        },\n\
\n\
        day : function (input) {\n\
            var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();\n\
            return input == null ? day :\n\
                this.add({ d : input - day });\n\
        },\n\
\n\
        startOf: function (units) {\n\
            units = units.replace(/s$/, '');\n\
            // the following switch intentionally omits break keywords\n\
            // to utilize falling through the cases.\n\
            switch (units) {\n\
            case 'year':\n\
                this.month(0);\n\
                /* falls through */\n\
            case 'month':\n\
                this.date(1);\n\
                /* falls through */\n\
            case 'week':\n\
            case 'day':\n\
                this.hours(0);\n\
                /* falls through */\n\
            case 'hour':\n\
                this.minutes(0);\n\
                /* falls through */\n\
            case 'minute':\n\
                this.seconds(0);\n\
                /* falls through */\n\
            case 'second':\n\
                this.milliseconds(0);\n\
                /* falls through */\n\
            }\n\
\n\
            // weeks are a special case\n\
            if (units === 'week') {\n\
                this.day(0);\n\
            }\n\
\n\
            return this;\n\
        },\n\
\n\
        endOf: function (units) {\n\
            return this.startOf(units).add(units.replace(/s?$/, 's'), 1).subtract('ms', 1);\n\
        },\n\
\n\
        isAfter: function (input, units) {\n\
            units = typeof units !== 'undefined' ? units : 'millisecond';\n\
            return +this.clone().startOf(units) > +moment(input).startOf(units);\n\
        },\n\
\n\
        isBefore: function (input, units) {\n\
            units = typeof units !== 'undefined' ? units : 'millisecond';\n\
            return +this.clone().startOf(units) < +moment(input).startOf(units);\n\
        },\n\
\n\
        isSame: function (input, units) {\n\
            units = typeof units !== 'undefined' ? units : 'millisecond';\n\
            return +this.clone().startOf(units) === +moment(input).startOf(units);\n\
        },\n\
\n\
        zone : function () {\n\
            return this._isUTC ? 0 : this._d.getTimezoneOffset();\n\
        },\n\
\n\
        daysInMonth : function () {\n\
            return moment.utc([this.year(), this.month() + 1, 0]).date();\n\
        },\n\
\n\
        dayOfYear : function (input) {\n\
            var dayOfYear = round((moment(this).startOf('day') - moment(this).startOf('year')) / 864e5) + 1;\n\
            return input == null ? dayOfYear : this.add(\"d\", (input - dayOfYear));\n\
        },\n\
\n\
        isoWeek : function (input) {\n\
            var week = weekOfYear(this, 1, 4);\n\
            return input == null ? week : this.add(\"d\", (input - week) * 7);\n\
        },\n\
\n\
        week : function (input) {\n\
            var week = this.lang().week(this);\n\
            return input == null ? week : this.add(\"d\", (input - week) * 7);\n\
        },\n\
\n\
        // If passed a language key, it will set the language for this\n\
        // instance.  Otherwise, it will return the language configuration\n\
        // variables for this instance.\n\
        lang : function (key) {\n\
            if (key === undefined) {\n\
                return this._lang;\n\
            } else {\n\
                this._lang = getLangDefinition(key);\n\
                return this;\n\
            }\n\
        }\n\
    };\n\
\n\
    // helper for adding shortcuts\n\
    function makeGetterAndSetter(name, key) {\n\
        moment.fn[name] = moment.fn[name + 's'] = function (input) {\n\
            var utc = this._isUTC ? 'UTC' : '';\n\
            if (input != null) {\n\
                this._d['set' + utc + key](input);\n\
                return this;\n\
            } else {\n\
                return this._d['get' + utc + key]();\n\
            }\n\
        };\n\
    }\n\
\n\
    // loop through and add shortcuts (Month, Date, Hours, Minutes, Seconds, Milliseconds)\n\
    for (i = 0; i < proxyGettersAndSetters.length; i ++) {\n\
        makeGetterAndSetter(proxyGettersAndSetters[i].toLowerCase().replace(/s$/, ''), proxyGettersAndSetters[i]);\n\
    }\n\
\n\
    // add shortcut for year (uses different syntax than the getter/setter 'year' == 'FullYear')\n\
    makeGetterAndSetter('year', 'FullYear');\n\
\n\
    // add plural methods\n\
    moment.fn.days = moment.fn.day;\n\
    moment.fn.weeks = moment.fn.week;\n\
    moment.fn.isoWeeks = moment.fn.isoWeek;\n\
\n\
    /************************************\n\
        Duration Prototype\n\
    ************************************/\n\
\n\
\n\
    moment.duration.fn = Duration.prototype = {\n\
        weeks : function () {\n\
            return absRound(this.days() / 7);\n\
        },\n\
\n\
        valueOf : function () {\n\
            return this._milliseconds +\n\
              this._days * 864e5 +\n\
              this._months * 2592e6;\n\
        },\n\
\n\
        humanize : function (withSuffix) {\n\
            var difference = +this,\n\
                output = relativeTime(difference, !withSuffix, this.lang());\n\
\n\
            if (withSuffix) {\n\
                output = this.lang().pastFuture(difference, output);\n\
            }\n\
\n\
            return this.lang().postformat(output);\n\
        },\n\
\n\
        lang : moment.fn.lang\n\
    };\n\
\n\
    function makeDurationGetter(name) {\n\
        moment.duration.fn[name] = function () {\n\
            return this._data[name];\n\
        };\n\
    }\n\
\n\
    function makeDurationAsGetter(name, factor) {\n\
        moment.duration.fn['as' + name] = function () {\n\
            return +this / factor;\n\
        };\n\
    }\n\
\n\
    for (i in unitMillisecondFactors) {\n\
        if (unitMillisecondFactors.hasOwnProperty(i)) {\n\
            makeDurationAsGetter(i, unitMillisecondFactors[i]);\n\
            makeDurationGetter(i.toLowerCase());\n\
        }\n\
    }\n\
\n\
    makeDurationAsGetter('Weeks', 6048e5);\n\
\n\
\n\
    /************************************\n\
        Default Lang\n\
    ************************************/\n\
\n\
\n\
    // Set default language, other languages will inherit from English.\n\
    moment.lang('en', {\n\
        ordinal : function (number) {\n\
            var b = number % 10,\n\
                output = (~~ (number % 100 / 10) === 1) ? 'th' :\n\
                (b === 1) ? 'st' :\n\
                (b === 2) ? 'nd' :\n\
                (b === 3) ? 'rd' : 'th';\n\
            return number + output;\n\
        }\n\
    });\n\
\n\
\n\
    /************************************\n\
        Exposing Moment\n\
    ************************************/\n\
\n\
\n\
    // CommonJS module is defined\n\
    if (hasModule) {\n\
        module.exports = moment;\n\
    }\n\
    /*global ender:false */\n\
    if (typeof ender === 'undefined') {\n\
        // here, `this` means `window` in the browser, or `global` on the server\n\
        // add `moment` as a global object via a string identifier,\n\
        // for Closure Compiler \"advanced\" mode\n\
        this['moment'] = moment;\n\
    }\n\
    /*global define:false */\n\
    if (typeof define === \"function\" && define.amd) {\n\
        define(\"moment\", [], function () {\n\
            return moment;\n\
        });\n\
    }\n\
}).call(this);\n\
//@ sourceURL=component-moment/index.js"
));
require.register("component-throttle/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module exports.\n\
 */\n\
\n\
module.exports = throttle;\n\
\n\
/**\n\
 * Returns a new function that, when invoked, invokes `func` at most one time per\n\
 * `wait` milliseconds.\n\
 *\n\
 * @param {Function} func The `Function` instance to wrap.\n\
 * @param {Number} wait The minimum number of milliseconds that must elapse in between `func` invokations.\n\
 * @return {Function} A new function that wraps the `func` function passed in.\n\
 * @api public\n\
 */\n\
\n\
function throttle (func, wait) {\n\
  var rtn; // return value\n\
  var last = 0; // last invokation timestamp\n\
  return function throttled () {\n\
    var now = new Date().getTime();\n\
    var delta = now - last;\n\
    if (delta >= wait) {\n\
      rtn = func.apply(this, arguments);\n\
      last = now;\n\
    }\n\
    return rtn;\n\
  };\n\
}\n\
//@ sourceURL=component-throttle/index.js"
));
require.register("matthewmueller-debounce/index.js", Function("exports, require, module",
"/**\n\
 * Debounces a function by the given threshold.\n\
 *\n\
 * @see http://unscriptable.com/2009/03/20/debouncing-javascript-methods/\n\
 * @param {Function} function to wrap\n\
 * @param {Number} timeout in ms (`100`)\n\
 * @param {Boolean} whether to execute at the beginning (`true`)\n\
 * @api public\n\
 */\n\
\n\
module.exports = function debounce(func, threshold, execAsap){\n\
  var timeout;\n\
  if (false !== execAsap) execAsap = true;\n\
\n\
  return function debounced(){\n\
    var obj = this, args = arguments;\n\
\n\
    function delayed () {\n\
      if (!execAsap) {\n\
        func.apply(obj, args);\n\
      }\n\
      timeout = null;\n\
    }\n\
\n\
    if (timeout) {\n\
      clearTimeout(timeout);\n\
    } else if (execAsap) {\n\
      func.apply(obj, args);\n\
    }\n\
\n\
    timeout = setTimeout(delayed, threshold || 100);\n\
  };\n\
};\n\
//@ sourceURL=matthewmueller-debounce/index.js"
));
require.register("segmentio-marked/lib/marked.js", Function("exports, require, module",
"/**\n\
 * marked - a markdown parser\n\
 * Copyright (c) 2011-2013, Christopher Jeffrey. (MIT Licensed)\n\
 * https://github.com/chjj/marked\n\
 */\n\
\n\
;(function() {\n\
\n\
/**\n\
 * Block-Level Grammar\n\
 */\n\
\n\
var block = {\n\
  newline: /^\\n\
+/,\n\
  code: /^( {4}[^\\n\
]+\\n\
*)+/,\n\
  fences: noop,\n\
  hr: /^( *[-*_]){3,} *(?:\\n\
+|$)/,\n\
  heading: /^ *(#{1,6}) *([^\\n\
]+?) *#* *(?:\\n\
+|$)/,\n\
  nptable: noop,\n\
  lheading: /^([^\\n\
]+)\\n\
 *(=|-){3,} *\\n\
*/,\n\
  blockquote: /^( *>[^\\n\
]+(\\n\
[^\\n\
]+)*\\n\
*)+/,\n\
  list: /^( *)(bull) [\\s\\S]+?(?:hr|\\n\
{2,}(?! )(?!\\1bull )\\n\
*|\\s*$)/,\n\
  html: /^ *(?:comment|closed|closing) *(?:\\n\
{2,}|\\s*$)/,\n\
  def: /^ *\\[([^\\]]+)\\]: *<?([^\\s>]+)>?(?: +[\"(]([^\\n\
]+)[\")])? *(?:\\n\
+|$)/,\n\
  table: noop,\n\
  paragraph: /^((?:[^\\n\
]+\\n\
?(?!hr|heading|lheading|blockquote|tag|def))+)\\n\
*/,\n\
  text: /^[^\\n\
]+/\n\
};\n\
\n\
block.bullet = /(?:[*+-]|\\d+\\.)/;\n\
block.item = /^( *)(bull) [^\\n\
]*(?:\\n\
(?!\\1bull )[^\\n\
]*)*/;\n\
block.item = replace(block.item, 'gm')\n\
  (/bull/g, block.bullet)\n\
  ();\n\
\n\
block.list = replace(block.list)\n\
  (/bull/g, block.bullet)\n\
  ('hr', /\\n\
+(?=(?: *[-*_]){3,} *(?:\\n\
+|$))/)\n\
  ();\n\
\n\
block._tag = '(?!(?:'\n\
  + 'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code'\n\
  + '|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo'\n\
  + '|span|br|wbr|ins|del|img)\\\\b)\\\\w+(?!:/|@)\\\\b';\n\
\n\
block.html = replace(block.html)\n\
  ('comment', /<!--[\\s\\S]*?-->/)\n\
  ('closed', /<(tag)[\\s\\S]+?<\\/\\1>/)\n\
  ('closing', /<tag(?:\"[^\"]*\"|'[^']*'|[^'\">])*?>/)\n\
  (/tag/g, block._tag)\n\
  ();\n\
\n\
block.paragraph = replace(block.paragraph)\n\
  ('hr', block.hr)\n\
  ('heading', block.heading)\n\
  ('lheading', block.lheading)\n\
  ('blockquote', block.blockquote)\n\
  ('tag', '<' + block._tag)\n\
  ('def', block.def)\n\
  ();\n\
\n\
/**\n\
 * Normal Block Grammar\n\
 */\n\
\n\
block.normal = merge({}, block);\n\
\n\
/**\n\
 * GFM Block Grammar\n\
 */\n\
\n\
block.gfm = merge({}, block.normal, {\n\
  fences: /^ *(`{3,}|~{3,}) *(\\S+)? *\\n\
([\\s\\S]+?)\\s*\\1 *(?:\\n\
+|$)/,\n\
  paragraph: /^/\n\
});\n\
\n\
block.gfm.paragraph = replace(block.paragraph)\n\
  ('(?!', '(?!' + block.gfm.fences.source.replace('\\\\1', '\\\\2') + '|')\n\
  ();\n\
\n\
/**\n\
 * GFM + Tables Block Grammar\n\
 */\n\
\n\
block.tables = merge({}, block.gfm, {\n\
  nptable: /^ *(\\S.*\\|.*)\\n\
 *([-:]+ *\\|[-| :]*)\\n\
((?:.*\\|.*(?:\\n\
|$))*)\\n\
*/,\n\
  table: /^ *\\|(.+)\\n\
 *\\|( *[-:]+[-| :]*)\\n\
((?: *\\|.*(?:\\n\
|$))*)\\n\
*/\n\
});\n\
\n\
/**\n\
 * Block Lexer\n\
 */\n\
\n\
function Lexer(options) {\n\
  this.tokens = [];\n\
  this.tokens.links = {};\n\
  this.options = options || marked.defaults;\n\
  this.rules = block.normal;\n\
\n\
  if (this.options.gfm) {\n\
    if (this.options.tables) {\n\
      this.rules = block.tables;\n\
    } else {\n\
      this.rules = block.gfm;\n\
    }\n\
  }\n\
}\n\
\n\
/**\n\
 * Expose Block Rules\n\
 */\n\
\n\
Lexer.rules = block;\n\
\n\
/**\n\
 * Static Lex Method\n\
 */\n\
\n\
Lexer.lex = function(src, options) {\n\
  var lexer = new Lexer(options);\n\
  return lexer.lex(src);\n\
};\n\
\n\
/**\n\
 * Preprocessing\n\
 */\n\
\n\
Lexer.prototype.lex = function(src) {\n\
  src = src\n\
    .replace(/\\r\\n\
|\\r/g, '\\n\
')\n\
    .replace(/\\t/g, '    ')\n\
    .replace(/\\u00a0/g, ' ')\n\
    .replace(/\\u2424/g, '\\n\
');\n\
\n\
  return this.token(src, true);\n\
};\n\
\n\
/**\n\
 * Lexing\n\
 */\n\
\n\
Lexer.prototype.token = function(src, top) {\n\
  var src = src.replace(/^ +$/gm, '')\n\
    , next\n\
    , loose\n\
    , cap\n\
    , bull\n\
    , b\n\
    , item\n\
    , space\n\
    , i\n\
    , l;\n\
\n\
  while (src) {\n\
    // newline\n\
    if (cap = this.rules.newline.exec(src)) {\n\
      src = src.substring(cap[0].length);\n\
      if (cap[0].length > 1) {\n\
        this.tokens.push({\n\
          type: 'space'\n\
        });\n\
      }\n\
    }\n\
\n\
    // code\n\
    if (cap = this.rules.code.exec(src)) {\n\
      src = src.substring(cap[0].length);\n\
      cap = cap[0].replace(/^ {4}/gm, '');\n\
      this.tokens.push({\n\
        type: 'code',\n\
        text: !this.options.pedantic\n\
          ? cap.replace(/\\n\
+$/, '')\n\
          : cap\n\
      });\n\
      continue;\n\
    }\n\
\n\
    // fences (gfm)\n\
    if (cap = this.rules.fences.exec(src)) {\n\
      src = src.substring(cap[0].length);\n\
      this.tokens.push({\n\
        type: 'code',\n\
        lang: cap[2],\n\
        text: cap[3]\n\
      });\n\
      continue;\n\
    }\n\
\n\
    // heading\n\
    if (cap = this.rules.heading.exec(src)) {\n\
      src = src.substring(cap[0].length);\n\
      this.tokens.push({\n\
        type: 'heading',\n\
        depth: cap[1].length,\n\
        text: cap[2]\n\
      });\n\
      continue;\n\
    }\n\
\n\
    // table no leading pipe (gfm)\n\
    if (top && (cap = this.rules.nptable.exec(src))) {\n\
      src = src.substring(cap[0].length);\n\
\n\
      item = {\n\
        type: 'table',\n\
        header: cap[1].replace(/^ *| *\\| *$/g, '').split(/ *\\| */),\n\
        align: cap[2].replace(/^ *|\\| *$/g, '').split(/ *\\| */),\n\
        cells: cap[3].replace(/\\n\
$/, '').split('\\n\
')\n\
      };\n\
\n\
      for (i = 0; i < item.align.length; i++) {\n\
        if (/^ *-+: *$/.test(item.align[i])) {\n\
          item.align[i] = 'right';\n\
        } else if (/^ *:-+: *$/.test(item.align[i])) {\n\
          item.align[i] = 'center';\n\
        } else if (/^ *:-+ *$/.test(item.align[i])) {\n\
          item.align[i] = 'left';\n\
        } else {\n\
          item.align[i] = null;\n\
        }\n\
      }\n\
\n\
      for (i = 0; i < item.cells.length; i++) {\n\
        item.cells[i] = item.cells[i].split(/ *\\| */);\n\
      }\n\
\n\
      this.tokens.push(item);\n\
\n\
      continue;\n\
    }\n\
\n\
    // lheading\n\
    if (cap = this.rules.lheading.exec(src)) {\n\
      src = src.substring(cap[0].length);\n\
      this.tokens.push({\n\
        type: 'heading',\n\
        depth: cap[2] === '=' ? 1 : 2,\n\
        text: cap[1]\n\
      });\n\
      continue;\n\
    }\n\
\n\
    // hr\n\
    if (cap = this.rules.hr.exec(src)) {\n\
      src = src.substring(cap[0].length);\n\
      this.tokens.push({\n\
        type: 'hr'\n\
      });\n\
      continue;\n\
    }\n\
\n\
    // blockquote\n\
    if (cap = this.rules.blockquote.exec(src)) {\n\
      src = src.substring(cap[0].length);\n\
\n\
      this.tokens.push({\n\
        type: 'blockquote_start'\n\
      });\n\
\n\
      cap = cap[0].replace(/^ *> ?/gm, '');\n\
\n\
      // Pass `top` to keep the current\n\
      // \"toplevel\" state. This is exactly\n\
      // how markdown.pl works.\n\
      this.token(cap, top);\n\
\n\
      this.tokens.push({\n\
        type: 'blockquote_end'\n\
      });\n\
\n\
      continue;\n\
    }\n\
\n\
    // list\n\
    if (cap = this.rules.list.exec(src)) {\n\
      src = src.substring(cap[0].length);\n\
      bull = cap[2];\n\
\n\
      this.tokens.push({\n\
        type: 'list_start',\n\
        ordered: bull.length > 1\n\
      });\n\
\n\
      // Get each top-level item.\n\
      cap = cap[0].match(this.rules.item);\n\
\n\
      next = false;\n\
      l = cap.length;\n\
      i = 0;\n\
\n\
      for (; i < l; i++) {\n\
        item = cap[i];\n\
\n\
        // Remove the list item's bullet\n\
        // so it is seen as the next token.\n\
        space = item.length;\n\
        item = item.replace(/^ *([*+-]|\\d+\\.) +/, '');\n\
\n\
        // Outdent whatever the\n\
        // list item contains. Hacky.\n\
        if (~item.indexOf('\\n\
 ')) {\n\
          space -= item.length;\n\
          item = !this.options.pedantic\n\
            ? item.replace(new RegExp('^ {1,' + space + '}', 'gm'), '')\n\
            : item.replace(/^ {1,4}/gm, '');\n\
        }\n\
\n\
        // Determine whether the next list item belongs here.\n\
        // Backpedal if it does not belong in this list.\n\
        if (this.options.smartLists && i !== l - 1) {\n\
          b = block.bullet.exec(cap[i+1])[0];\n\
          if (bull !== b && !(bull.length > 1 && b.length > 1)) {\n\
            src = cap.slice(i + 1).join('\\n\
') + src;\n\
            i = l - 1;\n\
          }\n\
        }\n\
\n\
        // Determine whether item is loose or not.\n\
        // Use: /(^|\\n\
)(?! )[^\\n\
]+\\n\
\\n\
(?!\\s*$)/\n\
        // for discount behavior.\n\
        loose = next || /\\n\
\\n\
(?!\\s*$)/.test(item);\n\
        if (i !== l - 1) {\n\
          next = item[item.length-1] === '\\n\
';\n\
          if (!loose) loose = next;\n\
        }\n\
\n\
        this.tokens.push({\n\
          type: loose\n\
            ? 'loose_item_start'\n\
            : 'list_item_start'\n\
        });\n\
\n\
        // Recurse.\n\
        this.token(item, false);\n\
\n\
        this.tokens.push({\n\
          type: 'list_item_end'\n\
        });\n\
      }\n\
\n\
      this.tokens.push({\n\
        type: 'list_end'\n\
      });\n\
\n\
      continue;\n\
    }\n\
\n\
    // html\n\
    if (cap = this.rules.html.exec(src)) {\n\
      src = src.substring(cap[0].length);\n\
      this.tokens.push({\n\
        type: this.options.sanitize\n\
          ? 'paragraph'\n\
          : 'html',\n\
        pre: cap[1] === 'pre' || cap[1] === 'script',\n\
        text: cap[0]\n\
      });\n\
      continue;\n\
    }\n\
\n\
    // def\n\
    if (top && (cap = this.rules.def.exec(src))) {\n\
      src = src.substring(cap[0].length);\n\
      this.tokens.links[cap[1].toLowerCase()] = {\n\
        href: cap[2],\n\
        title: cap[3]\n\
      };\n\
      continue;\n\
    }\n\
\n\
    // table (gfm)\n\
    if (top && (cap = this.rules.table.exec(src))) {\n\
      src = src.substring(cap[0].length);\n\
\n\
      item = {\n\
        type: 'table',\n\
        header: cap[1].replace(/^ *| *\\| *$/g, '').split(/ *\\| */),\n\
        align: cap[2].replace(/^ *|\\| *$/g, '').split(/ *\\| */),\n\
        cells: cap[3].replace(/(?: *\\| *)?\\n\
$/, '').split('\\n\
')\n\
      };\n\
\n\
      for (i = 0; i < item.align.length; i++) {\n\
        if (/^ *-+: *$/.test(item.align[i])) {\n\
          item.align[i] = 'right';\n\
        } else if (/^ *:-+: *$/.test(item.align[i])) {\n\
          item.align[i] = 'center';\n\
        } else if (/^ *:-+ *$/.test(item.align[i])) {\n\
          item.align[i] = 'left';\n\
        } else {\n\
          item.align[i] = null;\n\
        }\n\
      }\n\
\n\
      for (i = 0; i < item.cells.length; i++) {\n\
        item.cells[i] = item.cells[i]\n\
          .replace(/^ *\\| *| *\\| *$/g, '')\n\
          .split(/ *\\| */);\n\
      }\n\
\n\
      this.tokens.push(item);\n\
\n\
      continue;\n\
    }\n\
\n\
    // top-level paragraph\n\
    if (top && (cap = this.rules.paragraph.exec(src))) {\n\
      src = src.substring(cap[0].length);\n\
      this.tokens.push({\n\
        type: 'paragraph',\n\
        text: cap[1][cap[1].length-1] === '\\n\
'\n\
          ? cap[1].slice(0, -1)\n\
          : cap[1]\n\
      });\n\
      continue;\n\
    }\n\
\n\
    // text\n\
    if (cap = this.rules.text.exec(src)) {\n\
      // Top-level should never reach here.\n\
      src = src.substring(cap[0].length);\n\
      this.tokens.push({\n\
        type: 'text',\n\
        text: cap[0]\n\
      });\n\
      continue;\n\
    }\n\
\n\
    if (src) {\n\
      throw new\n\
        Error('Infinite loop on byte: ' + src.charCodeAt(0));\n\
    }\n\
  }\n\
\n\
  return this.tokens;\n\
};\n\
\n\
/**\n\
 * Inline-Level Grammar\n\
 */\n\
\n\
var inline = {\n\
  escape: /^\\\\([\\\\`*{}\\[\\]()#+\\-.!_>])/,\n\
  autolink: /^<([^ >]+(@|:\\/)[^ >]+)>/,\n\
  url: noop,\n\
  tag: /^<!--[\\s\\S]*?-->|^<\\/?\\w+(?:\"[^\"]*\"|'[^']*'|[^'\">])*?>/,\n\
  link: /^!?\\[(inside)\\]\\(href\\)/,\n\
  reflink: /^!?\\[(inside)\\]\\s*\\[([^\\]]*)\\]/,\n\
  nolink: /^!?\\[((?:\\[[^\\]]*\\]|[^\\[\\]])*)\\]/,\n\
  strong: /^__([\\s\\S]+?)__(?!_)|^\\*\\*([\\s\\S]+?)\\*\\*(?!\\*)/,\n\
  em: /^\\b_((?:__|[\\s\\S])+?)_\\b|^\\*((?:\\*\\*|[\\s\\S])+?)\\*(?!\\*)/,\n\
  code: /^(`+)\\s*([\\s\\S]*?[^`])\\s*\\1(?!`)/,\n\
  br: /^ {2,}\\n\
(?!\\s*$)/,\n\
  del: noop,\n\
  text: /^[\\s\\S]+?(?=[\\\\<!\\[_*`]| {2,}\\n\
|$)/\n\
};\n\
\n\
inline._inside = /(?:\\[[^\\]]*\\]|[^\\]]|\\](?=[^\\[]*\\]))*/;\n\
inline._href = /\\s*<?([^\\s]*?)>?(?:\\s+['\"]([\\s\\S]*?)['\"])?\\s*/;\n\
\n\
inline.link = replace(inline.link)\n\
  ('inside', inline._inside)\n\
  ('href', inline._href)\n\
  ();\n\
\n\
inline.reflink = replace(inline.reflink)\n\
  ('inside', inline._inside)\n\
  ();\n\
\n\
/**\n\
 * Normal Inline Grammar\n\
 */\n\
\n\
inline.normal = merge({}, inline);\n\
\n\
/**\n\
 * Pedantic Inline Grammar\n\
 */\n\
\n\
inline.pedantic = merge({}, inline.normal, {\n\
  strong: /^__(?=\\S)([\\s\\S]*?\\S)__(?!_)|^\\*\\*(?=\\S)([\\s\\S]*?\\S)\\*\\*(?!\\*)/,\n\
  em: /^_(?=\\S)([\\s\\S]*?\\S)_(?!_)|^\\*(?=\\S)([\\s\\S]*?\\S)\\*(?!\\*)/\n\
});\n\
\n\
/**\n\
 * GFM Inline Grammar\n\
 */\n\
\n\
inline.gfm = merge({}, inline.normal, {\n\
  escape: replace(inline.escape)('])', '~|])')(),\n\
  url: /^(https?:\\/\\/[^\\s<]+[^<.,:;\"')\\]\\s])/,\n\
  del: /^~~(?=\\S)([\\s\\S]*?\\S)~~/,\n\
  text: replace(inline.text)\n\
    (']|', '~]|')\n\
    ('|', '|https?://|')\n\
    ()\n\
});\n\
\n\
/**\n\
 * GFM + Line Breaks Inline Grammar\n\
 */\n\
\n\
inline.breaks = merge({}, inline.gfm, {\n\
  br: replace(inline.br)('{2,}', '*')(),\n\
  text: replace(inline.gfm.text)('{2,}', '*')()\n\
});\n\
\n\
/**\n\
 * Inline Lexer & Compiler\n\
 */\n\
\n\
function InlineLexer(links, options) {\n\
  this.options = options || marked.defaults;\n\
  this.links = links;\n\
  this.rules = inline.normal;\n\
\n\
  if (!this.links) {\n\
    throw new\n\
      Error('Tokens array requires a `links` property.');\n\
  }\n\
\n\
  if (this.options.gfm) {\n\
    if (this.options.breaks) {\n\
      this.rules = inline.breaks;\n\
    } else {\n\
      this.rules = inline.gfm;\n\
    }\n\
  } else if (this.options.pedantic) {\n\
    this.rules = inline.pedantic;\n\
  }\n\
}\n\
\n\
/**\n\
 * Expose Inline Rules\n\
 */\n\
\n\
InlineLexer.rules = inline;\n\
\n\
/**\n\
 * Static Lexing/Compiling Method\n\
 */\n\
\n\
InlineLexer.output = function(src, links, options) {\n\
  var inline = new InlineLexer(links, options);\n\
  return inline.output(src);\n\
};\n\
\n\
/**\n\
 * Lexing/Compiling\n\
 */\n\
\n\
InlineLexer.prototype.output = function(src) {\n\
  var out = ''\n\
    , link\n\
    , text\n\
    , href\n\
    , cap;\n\
\n\
  while (src) {\n\
    // escape\n\
    if (cap = this.rules.escape.exec(src)) {\n\
      src = src.substring(cap[0].length);\n\
      out += cap[1];\n\
      continue;\n\
    }\n\
\n\
    // autolink\n\
    if (cap = this.rules.autolink.exec(src)) {\n\
      src = src.substring(cap[0].length);\n\
      if (cap[2] === '@') {\n\
        text = cap[1][6] === ':'\n\
          ? this.mangle(cap[1].substring(7))\n\
          : this.mangle(cap[1]);\n\
        href = this.mangle('mailto:') + text;\n\
      } else {\n\
        text = escape(cap[1]);\n\
        href = text;\n\
      }\n\
      out += '<a href=\"'\n\
        + href\n\
        + '\">'\n\
        + text\n\
        + '</a>';\n\
      continue;\n\
    }\n\
\n\
    // url (gfm)\n\
    if (cap = this.rules.url.exec(src)) {\n\
      src = src.substring(cap[0].length);\n\
      text = escape(cap[1]);\n\
      href = text;\n\
      out += '<a href=\"'\n\
        + href\n\
        + '\">'\n\
        + text\n\
        + '</a>';\n\
      continue;\n\
    }\n\
\n\
    // tag\n\
    if (cap = this.rules.tag.exec(src)) {\n\
      src = src.substring(cap[0].length);\n\
      out += this.options.sanitize\n\
        ? escape(cap[0])\n\
        : cap[0];\n\
      continue;\n\
    }\n\
\n\
    // link\n\
    if (cap = this.rules.link.exec(src)) {\n\
      src = src.substring(cap[0].length);\n\
      out += this.outputLink(cap, {\n\
        href: cap[2],\n\
        title: cap[3]\n\
      });\n\
      continue;\n\
    }\n\
\n\
    // reflink, nolink\n\
    if ((cap = this.rules.reflink.exec(src))\n\
        || (cap = this.rules.nolink.exec(src))) {\n\
      src = src.substring(cap[0].length);\n\
      link = (cap[2] || cap[1]).replace(/\\s+/g, ' ');\n\
      link = this.links[link.toLowerCase()];\n\
      if (!link || !link.href) {\n\
        out += cap[0][0];\n\
        src = cap[0].substring(1) + src;\n\
        continue;\n\
      }\n\
      out += this.outputLink(cap, link);\n\
      continue;\n\
    }\n\
\n\
    // strong\n\
    if (cap = this.rules.strong.exec(src)) {\n\
      src = src.substring(cap[0].length);\n\
      out += '<strong>'\n\
        + this.output(cap[2] || cap[1])\n\
        + '</strong>';\n\
      continue;\n\
    }\n\
\n\
    // em\n\
    if (cap = this.rules.em.exec(src)) {\n\
      src = src.substring(cap[0].length);\n\
      out += '<em>'\n\
        + this.output(cap[2] || cap[1])\n\
        + '</em>';\n\
      continue;\n\
    }\n\
\n\
    // code\n\
    if (cap = this.rules.code.exec(src)) {\n\
      src = src.substring(cap[0].length);\n\
      out += '<code>'\n\
        + escape(cap[2], true)\n\
        + '</code>';\n\
      continue;\n\
    }\n\
\n\
    // br\n\
    if (cap = this.rules.br.exec(src)) {\n\
      src = src.substring(cap[0].length);\n\
      out += '<br>';\n\
      continue;\n\
    }\n\
\n\
    // del (gfm)\n\
    if (cap = this.rules.del.exec(src)) {\n\
      src = src.substring(cap[0].length);\n\
      out += '<del>'\n\
        + this.output(cap[1])\n\
        + '</del>';\n\
      continue;\n\
    }\n\
\n\
    // text\n\
    if (cap = this.rules.text.exec(src)) {\n\
      src = src.substring(cap[0].length);\n\
      out += escape(this.smartypants(cap[0]));\n\
      continue;\n\
    }\n\
\n\
    if (src) {\n\
      throw new\n\
        Error('Infinite loop on byte: ' + src.charCodeAt(0));\n\
    }\n\
  }\n\
\n\
  return out;\n\
};\n\
\n\
/**\n\
 * Compile Link\n\
 */\n\
\n\
InlineLexer.prototype.outputLink = function(cap, link) {\n\
  if (cap[0][0] !== '!') {\n\
    return '<a href=\"'\n\
      + escape(link.href)\n\
      + '\"'\n\
      + (link.title\n\
      ? ' title=\"'\n\
      + escape(link.title)\n\
      + '\"'\n\
      : '')\n\
      + '>'\n\
      + this.output(cap[1])\n\
      + '</a>';\n\
  } else {\n\
    return '<img src=\"'\n\
      + escape(link.href)\n\
      + '\" alt=\"'\n\
      + escape(cap[1])\n\
      + '\"'\n\
      + (link.title\n\
      ? ' title=\"'\n\
      + escape(link.title)\n\
      + '\"'\n\
      : '')\n\
      + '>';\n\
  }\n\
};\n\
\n\
/**\n\
 * Smartypants Transformations\n\
 */\n\
\n\
InlineLexer.prototype.smartypants = function(text) {\n\
  if (!this.options.smartypants) return text;\n\
  return text\n\
    .replace(/(^|[-\\u2014\\s(\\[\"])'/g, \"$1\\u2018\")       // opening singles\n\
    .replace(/'/g, \"\\u2019\")                            // closing singles & apostrophes\n\
    .replace(/(^|[-\\u2014/\\[(\\u2018\\s])\"/g, \"$1\\u201C\") // opening doubles\n\
    .replace(/\"/g, \"\\u201D\")                            // closing doubles\n\
    .replace(/--/g, \"\\u2014\")                           // em-dashes\n\
    .replace(/\\.{3}/g, '\\u2026');                       // ellipsis\n\
};\n\
\n\
/**\n\
 * Mangle Links\n\
 */\n\
\n\
InlineLexer.prototype.mangle = function(text) {\n\
  var out = ''\n\
    , l = text.length\n\
    , i = 0\n\
    , ch;\n\
\n\
  for (; i < l; i++) {\n\
    ch = text.charCodeAt(i);\n\
    if (Math.random() > 0.5) {\n\
      ch = 'x' + ch.toString(16);\n\
    }\n\
    out += '&#' + ch + ';';\n\
  }\n\
\n\
  return out;\n\
};\n\
\n\
/**\n\
 * Parsing & Compiling\n\
 */\n\
\n\
function Parser(options) {\n\
  this.tokens = [];\n\
  this.token = null;\n\
  this.options = options || marked.defaults;\n\
}\n\
\n\
/**\n\
 * Static Parse Method\n\
 */\n\
\n\
Parser.parse = function(src, options) {\n\
  var parser = new Parser(options);\n\
  return parser.parse(src);\n\
};\n\
\n\
/**\n\
 * Parse Loop\n\
 */\n\
\n\
Parser.prototype.parse = function(src) {\n\
  this.inline = new InlineLexer(src.links, this.options);\n\
  this.tokens = src.reverse();\n\
\n\
  var out = '';\n\
  while (this.next()) {\n\
    out += this.tok();\n\
  }\n\
\n\
  return out;\n\
};\n\
\n\
/**\n\
 * Next Token\n\
 */\n\
\n\
Parser.prototype.next = function() {\n\
  return this.token = this.tokens.pop();\n\
};\n\
\n\
/**\n\
 * Preview Next Token\n\
 */\n\
\n\
Parser.prototype.peek = function() {\n\
  return this.tokens[this.tokens.length-1] || 0;\n\
};\n\
\n\
/**\n\
 * Parse Text Tokens\n\
 */\n\
\n\
Parser.prototype.parseText = function() {\n\
  var body = this.token.text;\n\
\n\
  while (this.peek().type === 'text') {\n\
    body += '\\n\
' + this.next().text;\n\
  }\n\
\n\
  return this.inline.output(body);\n\
};\n\
\n\
/**\n\
 * Parse Current Token\n\
 */\n\
\n\
Parser.prototype.tok = function() {\n\
  switch (this.token.type) {\n\
    case 'space': {\n\
      return '';\n\
    }\n\
    case 'hr': {\n\
      return '<hr>\\n\
';\n\
    }\n\
    case 'heading': {\n\
      return '<h'\n\
        + this.token.depth\n\
        + '>'\n\
        + this.inline.output(this.token.text)\n\
        + '</h'\n\
        + this.token.depth\n\
        + '>\\n\
';\n\
    }\n\
    case 'code': {\n\
      if (this.options.highlight) {\n\
        var code = this.options.highlight(this.token.text, this.token.lang);\n\
        if (code != null && code !== this.token.text) {\n\
          this.token.escaped = true;\n\
          this.token.text = code;\n\
        }\n\
      }\n\
\n\
      if (!this.token.escaped) {\n\
        this.token.text = escape(this.token.text, true);\n\
      }\n\
\n\
      return '<pre><code'\n\
        + (this.token.lang\n\
        ? ' class=\"'\n\
        + this.options.langPrefix\n\
        + this.token.lang\n\
        + '\"'\n\
        : '')\n\
        + '>'\n\
        + this.token.text\n\
        + '</code></pre>\\n\
';\n\
    }\n\
    case 'table': {\n\
      var body = ''\n\
        , heading\n\
        , i\n\
        , row\n\
        , cell\n\
        , j;\n\
\n\
      // header\n\
      body += '<thead>\\n\
<tr>\\n\
';\n\
      for (i = 0; i < this.token.header.length; i++) {\n\
        heading = this.inline.output(this.token.header[i]);\n\
        body += this.token.align[i]\n\
          ? '<th align=\"' + this.token.align[i] + '\">' + heading + '</th>\\n\
'\n\
          : '<th>' + heading + '</th>\\n\
';\n\
      }\n\
      body += '</tr>\\n\
</thead>\\n\
';\n\
\n\
      // body\n\
      body += '<tbody>\\n\
'\n\
      for (i = 0; i < this.token.cells.length; i++) {\n\
        row = this.token.cells[i];\n\
        body += '<tr>\\n\
';\n\
        for (j = 0; j < row.length; j++) {\n\
          cell = this.inline.output(row[j]);\n\
          body += this.token.align[j]\n\
            ? '<td align=\"' + this.token.align[j] + '\">' + cell + '</td>\\n\
'\n\
            : '<td>' + cell + '</td>\\n\
';\n\
        }\n\
        body += '</tr>\\n\
';\n\
      }\n\
      body += '</tbody>\\n\
';\n\
\n\
      return '<table>\\n\
'\n\
        + body\n\
        + '</table>\\n\
';\n\
    }\n\
    case 'blockquote_start': {\n\
      var body = '';\n\
\n\
      while (this.next().type !== 'blockquote_end') {\n\
        body += this.tok();\n\
      }\n\
\n\
      return '<blockquote>\\n\
'\n\
        + body\n\
        + '</blockquote>\\n\
';\n\
    }\n\
    case 'list_start': {\n\
      var type = this.token.ordered ? 'ol' : 'ul'\n\
        , body = '';\n\
\n\
      while (this.next().type !== 'list_end') {\n\
        body += this.tok();\n\
      }\n\
\n\
      return '<'\n\
        + type\n\
        + '>\\n\
'\n\
        + body\n\
        + '</'\n\
        + type\n\
        + '>\\n\
';\n\
    }\n\
    case 'list_item_start': {\n\
      var body = '';\n\
\n\
      while (this.next().type !== 'list_item_end') {\n\
        body += this.token.type === 'text'\n\
          ? this.parseText()\n\
          : this.tok();\n\
      }\n\
\n\
      return '<li>'\n\
        + body\n\
        + '</li>\\n\
';\n\
    }\n\
    case 'loose_item_start': {\n\
      var body = '';\n\
\n\
      while (this.next().type !== 'list_item_end') {\n\
        body += this.tok();\n\
      }\n\
\n\
      return '<li>'\n\
        + body\n\
        + '</li>\\n\
';\n\
    }\n\
    case 'html': {\n\
      return !this.token.pre && !this.options.pedantic\n\
        ? this.inline.output(this.token.text)\n\
        : this.token.text;\n\
    }\n\
    case 'paragraph': {\n\
      return '<p>'\n\
        + this.inline.output(this.token.text)\n\
        + '</p>\\n\
';\n\
    }\n\
    case 'text': {\n\
      return '<p>'\n\
        + this.parseText()\n\
        + '</p>\\n\
';\n\
    }\n\
  }\n\
};\n\
\n\
/**\n\
 * Helpers\n\
 */\n\
\n\
function escape(html, encode) {\n\
  return html\n\
    .replace(!encode ? /&(?!#?\\w+;)/g : /&/g, '&amp;')\n\
    .replace(/</g, '&lt;')\n\
    .replace(/>/g, '&gt;')\n\
    .replace(/\"/g, '&quot;')\n\
    .replace(/'/g, '&#39;');\n\
}\n\
\n\
function replace(regex, opt) {\n\
  regex = regex.source;\n\
  opt = opt || '';\n\
  return function self(name, val) {\n\
    if (!name) return new RegExp(regex, opt);\n\
    val = val.source || val;\n\
    val = val.replace(/(^|[^\\[])\\^/g, '$1');\n\
    regex = regex.replace(name, val);\n\
    return self;\n\
  };\n\
}\n\
\n\
function noop() {}\n\
noop.exec = noop;\n\
\n\
function merge(obj) {\n\
  var i = 1\n\
    , target\n\
    , key;\n\
\n\
  for (; i < arguments.length; i++) {\n\
    target = arguments[i];\n\
    for (key in target) {\n\
      if (Object.prototype.hasOwnProperty.call(target, key)) {\n\
        obj[key] = target[key];\n\
      }\n\
    }\n\
  }\n\
\n\
  return obj;\n\
}\n\
\n\
/**\n\
 * Marked\n\
 */\n\
\n\
function marked(src, opt, callback) {\n\
  if (callback || typeof opt === 'function') {\n\
    if (!callback) {\n\
      callback = opt;\n\
      opt = null;\n\
    }\n\
\n\
    if (opt) opt = merge({}, marked.defaults, opt);\n\
\n\
    var highlight = opt.highlight\n\
      , tokens\n\
      , pending\n\
      , i = 0;\n\
\n\
    try {\n\
      tokens = Lexer.lex(src, opt)\n\
    } catch (e) {\n\
      return callback(e);\n\
    }\n\
\n\
    pending = tokens.length;\n\
\n\
    var done = function(hi) {\n\
      var out, err;\n\
\n\
      if (hi !== true) {\n\
        delete opt.highlight;\n\
      }\n\
\n\
      try {\n\
        out = Parser.parse(tokens, opt);\n\
      } catch (e) {\n\
        err = e;\n\
      }\n\
\n\
      opt.highlight = highlight;\n\
\n\
      return err\n\
        ? callback(err)\n\
        : callback(null, out);\n\
    };\n\
\n\
    if (!highlight || highlight.length < 3) {\n\
      return done(true);\n\
    }\n\
\n\
    if (!pending) return done();\n\
\n\
    for (; i < tokens.length; i++) {\n\
      (function(token) {\n\
        if (token.type !== 'code') {\n\
          return --pending || done();\n\
        }\n\
        return highlight(token.text, token.lang, function(err, code) {\n\
          if (code == null || code === token.text) {\n\
            return --pending || done();\n\
          }\n\
          token.text = code;\n\
          token.escaped = true;\n\
          --pending || done();\n\
        });\n\
      })(tokens[i]);\n\
    }\n\
\n\
    return;\n\
  }\n\
  try {\n\
    if (opt) opt = merge({}, marked.defaults, opt);\n\
    return Parser.parse(Lexer.lex(src, opt), opt);\n\
  } catch (e) {\n\
    e.message += '\\n\
Please report this to https://github.com/chjj/marked.';\n\
    if ((opt || marked.defaults).silent) {\n\
      return '<p>An error occured:</p><pre>'\n\
        + escape(e.message + '', true)\n\
        + '</pre>';\n\
    }\n\
    throw e;\n\
  }\n\
}\n\
\n\
/**\n\
 * Options\n\
 */\n\
\n\
marked.options =\n\
marked.setOptions = function(opt) {\n\
  merge(marked.defaults, opt);\n\
  return marked;\n\
};\n\
\n\
marked.defaults = {\n\
  gfm: true,\n\
  tables: true,\n\
  breaks: false,\n\
  pedantic: false,\n\
  sanitize: false,\n\
  smartLists: false,\n\
  silent: false,\n\
  highlight: null,\n\
  langPrefix: 'lang-',\n\
  smartypants: false\n\
};\n\
\n\
/**\n\
 * Expose\n\
 */\n\
\n\
marked.Parser = Parser;\n\
marked.parser = Parser.parse;\n\
\n\
marked.Lexer = Lexer;\n\
marked.lexer = Lexer.lex;\n\
\n\
marked.InlineLexer = InlineLexer;\n\
marked.inlineLexer = InlineLexer.output;\n\
\n\
marked.parse = marked;\n\
\n\
if (typeof exports === 'object') {\n\
  module.exports = marked;\n\
} else if (typeof define === 'function' && define.amd) {\n\
  define(function() { return marked; });\n\
} else {\n\
  this.marked = marked;\n\
}\n\
\n\
}).call(function() {\n\
  return this || (typeof window !== 'undefined' ? window : global);\n\
}());\n\
//@ sourceURL=segmentio-marked/lib/marked.js"
));
require.register("solutionio-async/index.js", Function("exports, require, module",
"/*global setTimeout: false, console: false */\n\
(function () {\n\
\n\
    var async = {};\n\
\n\
    // global on the server, window in the browser\n\
    var root = this,\n\
        previous_async = root.async;\n\
\n\
    if (typeof module !== 'undefined' && module.exports) {\n\
        module.exports = async;\n\
    }\n\
    else {\n\
        root.async = async;\n\
    }\n\
\n\
    async.noConflict = function () {\n\
        root.async = previous_async;\n\
        return async;\n\
    };\n\
\n\
    //// cross-browser compatiblity functions ////\n\
\n\
    var _forEach = function (arr, iterator) {\n\
        if (arr.forEach) {\n\
            return arr.forEach(iterator);\n\
        }\n\
        for (var i = 0; i < arr.length; i += 1) {\n\
            iterator(arr[i], i, arr);\n\
        }\n\
    };\n\
\n\
    var _map = function (arr, iterator) {\n\
        if (arr.map) {\n\
            return arr.map(iterator);\n\
        }\n\
        var results = [];\n\
        _forEach(arr, function (x, i, a) {\n\
            results.push(iterator(x, i, a));\n\
        });\n\
        return results;\n\
    };\n\
\n\
    var _reduce = function (arr, iterator, memo) {\n\
        if (arr.reduce) {\n\
            return arr.reduce(iterator, memo);\n\
        }\n\
        _forEach(arr, function (x, i, a) {\n\
            memo = iterator(memo, x, i, a);\n\
        });\n\
        return memo;\n\
    };\n\
\n\
    var _keys = function (obj) {\n\
        if (Object.keys) {\n\
            return Object.keys(obj);\n\
        }\n\
        var keys = [];\n\
        for (var k in obj) {\n\
            if (obj.hasOwnProperty(k)) {\n\
                keys.push(k);\n\
            }\n\
        }\n\
        return keys;\n\
    };\n\
\n\
    //// exported async module functions ////\n\
\n\
    //// nextTick implementation with browser-compatible fallback ////\n\
    if (typeof process === 'undefined' || !(process.nextTick)) {\n\
        async.nextTick = function (fn) {\n\
            setTimeout(fn, 0);\n\
        };\n\
    }\n\
    else {\n\
        async.nextTick = process.nextTick;\n\
    }\n\
\n\
    async.forEach = function (arr, iterator, callback) {\n\
        callback = callback || function () {};\n\
        if (!arr.length) {\n\
            return callback();\n\
        }\n\
        var completed = 0;\n\
        _forEach(arr, function (x) {\n\
            iterator(x, function (err) {\n\
                if (err) {\n\
                    callback(err);\n\
                    callback = function () {};\n\
                }\n\
                else {\n\
                    completed += 1;\n\
                    if (completed === arr.length) {\n\
                        callback(null);\n\
                    }\n\
                }\n\
            });\n\
        });\n\
    };\n\
\n\
    async.forEachSeries = function (arr, iterator, callback) {\n\
        callback = callback || function () {};\n\
        if (!arr.length) {\n\
            return callback();\n\
        }\n\
        var completed = 0;\n\
        var iterate = function () {\n\
            iterator(arr[completed], function (err) {\n\
                if (err) {\n\
                    callback(err);\n\
                    callback = function () {};\n\
                }\n\
                else {\n\
                    completed += 1;\n\
                    if (completed === arr.length) {\n\
                        callback(null);\n\
                    }\n\
                    else {\n\
                        iterate();\n\
                    }\n\
                }\n\
            });\n\
        };\n\
        iterate();\n\
    };\n\
\n\
    async.forEachLimit = function (arr, limit, iterator, callback) {\n\
        callback = callback || function () {};\n\
        if (!arr.length || limit <= 0) {\n\
            return callback();\n\
        }\n\
        var completed = 0;\n\
        var started = 0;\n\
        var running = 0;\n\
\n\
        (function replenish () {\n\
            if (completed === arr.length) {\n\
                return callback();\n\
            }\n\
\n\
            while (running < limit && started < arr.length) {\n\
                started += 1;\n\
                running += 1;\n\
                iterator(arr[started - 1], function (err) {\n\
                    if (err) {\n\
                        callback(err);\n\
                        callback = function () {};\n\
                    }\n\
                    else {\n\
                        completed += 1;\n\
                        running -= 1;\n\
                        if (completed === arr.length) {\n\
                            callback();\n\
                        }\n\
                        else {\n\
                            replenish();\n\
                        }\n\
                    }\n\
                });\n\
            }\n\
        })();\n\
    };\n\
\n\
\n\
    var doParallel = function (fn) {\n\
        return function () {\n\
            var args = Array.prototype.slice.call(arguments);\n\
            return fn.apply(null, [async.forEach].concat(args));\n\
        };\n\
    };\n\
    var doSeries = function (fn) {\n\
        return function () {\n\
            var args = Array.prototype.slice.call(arguments);\n\
            return fn.apply(null, [async.forEachSeries].concat(args));\n\
        };\n\
    };\n\
\n\
\n\
    var _asyncMap = function (eachfn, arr, iterator, callback) {\n\
        var results = [];\n\
        arr = _map(arr, function (x, i) {\n\
            return {index: i, value: x};\n\
        });\n\
        eachfn(arr, function (x, callback) {\n\
            iterator(x.value, function (err, v) {\n\
                results[x.index] = v;\n\
                callback(err);\n\
            });\n\
        }, function (err) {\n\
            callback(err, results);\n\
        });\n\
    };\n\
    async.map = doParallel(_asyncMap);\n\
    async.mapSeries = doSeries(_asyncMap);\n\
\n\
\n\
    // reduce only has a series version, as doing reduce in parallel won't\n\
    // work in many situations.\n\
    async.reduce = function (arr, memo, iterator, callback) {\n\
        async.forEachSeries(arr, function (x, callback) {\n\
            iterator(memo, x, function (err, v) {\n\
                memo = v;\n\
                callback(err);\n\
            });\n\
        }, function (err) {\n\
            callback(err, memo);\n\
        });\n\
    };\n\
    // inject alias\n\
    async.inject = async.reduce;\n\
    // foldl alias\n\
    async.foldl = async.reduce;\n\
\n\
    async.reduceRight = function (arr, memo, iterator, callback) {\n\
        var reversed = _map(arr, function (x) {\n\
            return x;\n\
        }).reverse();\n\
        async.reduce(reversed, memo, iterator, callback);\n\
    };\n\
    // foldr alias\n\
    async.foldr = async.reduceRight;\n\
\n\
    var _filter = function (eachfn, arr, iterator, callback) {\n\
        var results = [];\n\
        arr = _map(arr, function (x, i) {\n\
            return {index: i, value: x};\n\
        });\n\
        eachfn(arr, function (x, callback) {\n\
            iterator(x.value, function (v) {\n\
                if (v) {\n\
                    results.push(x);\n\
                }\n\
                callback();\n\
            });\n\
        }, function (err) {\n\
            callback(_map(results.sort(function (a, b) {\n\
                return a.index - b.index;\n\
            }), function (x) {\n\
                return x.value;\n\
            }));\n\
        });\n\
    };\n\
    async.filter = doParallel(_filter);\n\
    async.filterSeries = doSeries(_filter);\n\
    // select alias\n\
    async.select = async.filter;\n\
    async.selectSeries = async.filterSeries;\n\
\n\
    var _reject = function (eachfn, arr, iterator, callback) {\n\
        var results = [];\n\
        arr = _map(arr, function (x, i) {\n\
            return {index: i, value: x};\n\
        });\n\
        eachfn(arr, function (x, callback) {\n\
            iterator(x.value, function (v) {\n\
                if (!v) {\n\
                    results.push(x);\n\
                }\n\
                callback();\n\
            });\n\
        }, function (err) {\n\
            callback(_map(results.sort(function (a, b) {\n\
                return a.index - b.index;\n\
            }), function (x) {\n\
                return x.value;\n\
            }));\n\
        });\n\
    };\n\
    async.reject = doParallel(_reject);\n\
    async.rejectSeries = doSeries(_reject);\n\
\n\
    var _detect = function (eachfn, arr, iterator, main_callback) {\n\
        eachfn(arr, function (x, callback) {\n\
            iterator(x, function (result) {\n\
                if (result) {\n\
                    main_callback(x);\n\
                    main_callback = function () {};\n\
                }\n\
                else {\n\
                    callback();\n\
                }\n\
            });\n\
        }, function (err) {\n\
            main_callback();\n\
        });\n\
    };\n\
    async.detect = doParallel(_detect);\n\
    async.detectSeries = doSeries(_detect);\n\
\n\
    async.some = function (arr, iterator, main_callback) {\n\
        async.forEach(arr, function (x, callback) {\n\
            iterator(x, function (v) {\n\
                if (v) {\n\
                    main_callback(true);\n\
                    main_callback = function () {};\n\
                }\n\
                callback();\n\
            });\n\
        }, function (err) {\n\
            main_callback(false);\n\
        });\n\
    };\n\
    // any alias\n\
    async.any = async.some;\n\
\n\
    async.every = function (arr, iterator, main_callback) {\n\
        async.forEach(arr, function (x, callback) {\n\
            iterator(x, function (v) {\n\
                if (!v) {\n\
                    main_callback(false);\n\
                    main_callback = function () {};\n\
                }\n\
                callback();\n\
            });\n\
        }, function (err) {\n\
            main_callback(true);\n\
        });\n\
    };\n\
    // all alias\n\
    async.all = async.every;\n\
\n\
    async.sortBy = function (arr, iterator, callback) {\n\
        async.map(arr, function (x, callback) {\n\
            iterator(x, function (err, criteria) {\n\
                if (err) {\n\
                    callback(err);\n\
                }\n\
                else {\n\
                    callback(null, {value: x, criteria: criteria});\n\
                }\n\
            });\n\
        }, function (err, results) {\n\
            if (err) {\n\
                return callback(err);\n\
            }\n\
            else {\n\
                var fn = function (left, right) {\n\
                    var a = left.criteria, b = right.criteria;\n\
                    return a < b ? -1 : a > b ? 1 : 0;\n\
                };\n\
                callback(null, _map(results.sort(fn), function (x) {\n\
                    return x.value;\n\
                }));\n\
            }\n\
        });\n\
    };\n\
\n\
    async.auto = function (tasks, callback) {\n\
        callback = callback || function () {};\n\
        var keys = _keys(tasks);\n\
        if (!keys.length) {\n\
            return callback(null);\n\
        }\n\
\n\
        var results = {};\n\
\n\
        var listeners = [];\n\
        var addListener = function (fn) {\n\
            listeners.unshift(fn);\n\
        };\n\
        var removeListener = function (fn) {\n\
            for (var i = 0; i < listeners.length; i += 1) {\n\
                if (listeners[i] === fn) {\n\
                    listeners.splice(i, 1);\n\
                    return;\n\
                }\n\
            }\n\
        };\n\
        var taskComplete = function () {\n\
            _forEach(listeners.slice(0), function (fn) {\n\
                fn();\n\
            });\n\
        };\n\
\n\
        addListener(function () {\n\
            if (_keys(results).length === keys.length) {\n\
                callback(null, results);\n\
                callback = function () {};\n\
            }\n\
        });\n\
\n\
        _forEach(keys, function (k) {\n\
            var task = (tasks[k] instanceof Function) ? [tasks[k]]: tasks[k];\n\
            var taskCallback = function (err) {\n\
                if (err) {\n\
                    callback(err);\n\
                    // stop subsequent errors hitting callback multiple times\n\
                    callback = function () {};\n\
                }\n\
                else {\n\
                    var args = Array.prototype.slice.call(arguments, 1);\n\
                    if (args.length <= 1) {\n\
                        args = args[0];\n\
                    }\n\
                    results[k] = args;\n\
                    taskComplete();\n\
                }\n\
            };\n\
            var requires = task.slice(0, Math.abs(task.length - 1)) || [];\n\
            var ready = function () {\n\
                return _reduce(requires, function (a, x) {\n\
                    return (a && results.hasOwnProperty(x));\n\
                }, true) && !results.hasOwnProperty(k);\n\
            };\n\
            if (ready()) {\n\
                task[task.length - 1](taskCallback, results);\n\
            }\n\
            else {\n\
                var listener = function () {\n\
                    if (ready()) {\n\
                        removeListener(listener);\n\
                        task[task.length - 1](taskCallback, results);\n\
                    }\n\
                };\n\
                addListener(listener);\n\
            }\n\
        });\n\
    };\n\
\n\
    async.waterfall = function (tasks, callback) {\n\
        callback = callback || function () {};\n\
        if (!tasks.length) {\n\
            return callback();\n\
        }\n\
        var wrapIterator = function (iterator) {\n\
            return function (err) {\n\
                if (err) {\n\
                    callback(err);\n\
                    callback = function () {};\n\
                }\n\
                else {\n\
                    var args = Array.prototype.slice.call(arguments, 1);\n\
                    var next = iterator.next();\n\
                    if (next) {\n\
                        args.push(wrapIterator(next));\n\
                    }\n\
                    else {\n\
                        args.push(callback);\n\
                    }\n\
                    async.nextTick(function () {\n\
                        iterator.apply(null, args);\n\
                    });\n\
                }\n\
            };\n\
        };\n\
        wrapIterator(async.iterator(tasks))();\n\
    };\n\
\n\
    async.parallel = function (tasks, callback) {\n\
        callback = callback || function () {};\n\
        if (tasks.constructor === Array) {\n\
            async.map(tasks, function (fn, callback) {\n\
                if (fn) {\n\
                    fn(function (err) {\n\
                        var args = Array.prototype.slice.call(arguments, 1);\n\
                        if (args.length <= 1) {\n\
                            args = args[0];\n\
                        }\n\
                        callback.call(null, err, args);\n\
                    });\n\
                }\n\
            }, callback);\n\
        }\n\
        else {\n\
            var results = {};\n\
            async.forEach(_keys(tasks), function (k, callback) {\n\
                tasks[k](function (err) {\n\
                    var args = Array.prototype.slice.call(arguments, 1);\n\
                    if (args.length <= 1) {\n\
                        args = args[0];\n\
                    }\n\
                    results[k] = args;\n\
                    callback(err);\n\
                });\n\
            }, function (err) {\n\
                callback(err, results);\n\
            });\n\
        }\n\
    };\n\
\n\
    async.series = function (tasks, callback) {\n\
        callback = callback || function () {};\n\
        if (tasks.constructor === Array) {\n\
            async.mapSeries(tasks, function (fn, callback) {\n\
                if (fn) {\n\
                    fn(function (err) {\n\
                        var args = Array.prototype.slice.call(arguments, 1);\n\
                        if (args.length <= 1) {\n\
                            args = args[0];\n\
                        }\n\
                        callback.call(null, err, args);\n\
                    });\n\
                }\n\
            }, callback);\n\
        }\n\
        else {\n\
            var results = {};\n\
            async.forEachSeries(_keys(tasks), function (k, callback) {\n\
                tasks[k](function (err) {\n\
                    var args = Array.prototype.slice.call(arguments, 1);\n\
                    if (args.length <= 1) {\n\
                        args = args[0];\n\
                    }\n\
                    results[k] = args;\n\
                    callback(err);\n\
                });\n\
            }, function (err) {\n\
                callback(err, results);\n\
            });\n\
        }\n\
    };\n\
\n\
    async.iterator = function (tasks) {\n\
        var makeCallback = function (index) {\n\
            var fn = function () {\n\
                if (tasks.length) {\n\
                    tasks[index].apply(null, arguments);\n\
                }\n\
                return fn.next();\n\
            };\n\
            fn.next = function () {\n\
                return (index < tasks.length - 1) ? makeCallback(index + 1): null;\n\
            };\n\
            return fn;\n\
        };\n\
        return makeCallback(0);\n\
    };\n\
\n\
    async.apply = function (fn) {\n\
        var args = Array.prototype.slice.call(arguments, 1);\n\
        return function () {\n\
            return fn.apply(\n\
                null, args.concat(Array.prototype.slice.call(arguments))\n\
            );\n\
        };\n\
    };\n\
\n\
    var _concat = function (eachfn, arr, fn, callback) {\n\
        var r = [];\n\
        eachfn(arr, function (x, cb) {\n\
            fn(x, function (err, y) {\n\
                r = r.concat(y || []);\n\
                cb(err);\n\
            });\n\
        }, function (err) {\n\
            callback(err, r);\n\
        });\n\
    };\n\
    async.concat = doParallel(_concat);\n\
    async.concatSeries = doSeries(_concat);\n\
\n\
    async.whilst = function (test, iterator, callback) {\n\
        if (test()) {\n\
            iterator(function (err) {\n\
                if (err) {\n\
                    return callback(err);\n\
                }\n\
                async.whilst(test, iterator, callback);\n\
            });\n\
        }\n\
        else {\n\
            callback();\n\
        }\n\
    };\n\
\n\
    async.until = function (test, iterator, callback) {\n\
        if (!test()) {\n\
            iterator(function (err) {\n\
                if (err) {\n\
                    return callback(err);\n\
                }\n\
                async.until(test, iterator, callback);\n\
            });\n\
        }\n\
        else {\n\
            callback();\n\
        }\n\
    };\n\
\n\
    async.queue = function (worker, concurrency) {\n\
        var workers = 0;\n\
        var q = {\n\
            tasks: [],\n\
            concurrency: concurrency,\n\
            saturated: null,\n\
            empty: null,\n\
            drain: null,\n\
            push: function (data, callback) {\n\
                if(data.constructor !== Array) {\n\
                    data = [data];\n\
                }\n\
                _forEach(data, function(task) {\n\
                    q.tasks.push({\n\
                        data: task,\n\
                        callback: typeof callback === 'function' ? callback : null\n\
                    });\n\
                    if (q.saturated && q.tasks.length == concurrency) {\n\
                        q.saturated();\n\
                    }\n\
                    async.nextTick(q.process);\n\
                });\n\
            },\n\
            process: function () {\n\
                if (workers < q.concurrency && q.tasks.length) {\n\
                    var task = q.tasks.shift();\n\
                    if(q.empty && q.tasks.length == 0) q.empty();\n\
                    workers += 1;\n\
                    worker(task.data, function () {\n\
                        workers -= 1;\n\
                        if (task.callback) {\n\
                            task.callback.apply(task, arguments);\n\
                        }\n\
                        if(q.drain && q.tasks.length + workers == 0) q.drain();\n\
                        q.process();\n\
                    });\n\
                }\n\
            },\n\
            length: function () {\n\
                return q.tasks.length;\n\
            },\n\
            running: function () {\n\
                return workers;\n\
            }\n\
        };\n\
        return q;\n\
    };\n\
\n\
    var _console_fn = function (name) {\n\
        return function (fn) {\n\
            var args = Array.prototype.slice.call(arguments, 1);\n\
            fn.apply(null, args.concat([function (err) {\n\
                var args = Array.prototype.slice.call(arguments, 1);\n\
                if (typeof console !== 'undefined') {\n\
                    if (err) {\n\
                        if (console.error) {\n\
                            console.error(err);\n\
                        }\n\
                    }\n\
                    else if (console[name]) {\n\
                        _forEach(args, function (x) {\n\
                            console[name](x);\n\
                        });\n\
                    }\n\
                }\n\
            }]));\n\
        };\n\
    };\n\
    async.log = _console_fn('log');\n\
    async.dir = _console_fn('dir');\n\
    /*async.info = _console_fn('info');\n\
    async.warn = _console_fn('warn');\n\
    async.error = _console_fn('error');*/\n\
\n\
    async.memoize = function (fn, hasher) {\n\
        var memo = {};\n\
        var queues = {};\n\
        hasher = hasher || function (x) {\n\
            return x;\n\
        };\n\
        var memoized = function () {\n\
            var args = Array.prototype.slice.call(arguments);\n\
            var callback = args.pop();\n\
            var key = hasher.apply(null, args);\n\
            if (key in memo) {\n\
                callback.apply(null, memo[key]);\n\
            }\n\
            else if (key in queues) {\n\
                queues[key].push(callback);\n\
            }\n\
            else {\n\
                queues[key] = [callback];\n\
                fn.apply(null, args.concat([function () {\n\
                    memo[key] = arguments;\n\
                    var q = queues[key];\n\
                    delete queues[key];\n\
                    for (var i = 0, l = q.length; i < l; i++) {\n\
                      q[i].apply(null, arguments);\n\
                    }\n\
                }]));\n\
            }\n\
        };\n\
        memoized.unmemoized = fn;\n\
        return memoized;\n\
    };\n\
\n\
    async.unmemoize = function (fn) {\n\
      return function () {\n\
        return (fn.unmemoized || fn).apply(null, arguments);\n\
      };\n\
    };\n\
\tmodule.exports = async;\n\
}());\n\
//@ sourceURL=solutionio-async/index.js"
));
require.register("timoxley-next-tick/index.js", Function("exports, require, module",
"\"use strict\"\n\
\n\
if (typeof setImmediate == 'function') {\n\
  module.exports = function(f){ setImmediate(f) }\n\
}\n\
// legacy node.js\n\
else if (typeof process != 'undefined' && typeof process.nextTick == 'function') {\n\
  module.exports = process.nextTick\n\
}\n\
// fallback for other environments / postMessage behaves badly on IE8\n\
else if (typeof window == 'undefined' || window.ActiveXObject || !window.postMessage) {\n\
  module.exports = function(f){ setTimeout(f) };\n\
} else {\n\
  var q = [];\n\
\n\
  window.addEventListener('message', function(){\n\
    var i = 0;\n\
    while (i < q.length) {\n\
      try { q[i++](); }\n\
      catch (e) {\n\
        q = q.slice(i);\n\
        window.postMessage('tic!', '*');\n\
        throw e;\n\
      }\n\
    }\n\
    q.length = 0;\n\
  }, true);\n\
\n\
  module.exports = function(fn){\n\
    if (!q.length) window.postMessage('tic!', '*');\n\
    q.push(fn);\n\
  }\n\
}\n\
//@ sourceURL=timoxley-next-tick/index.js"
));
require.register("timoxley-async-compose/index.js", Function("exports, require, module",
"var async = require('async.js')\n\
var nextTick = require('next-tick')\n\
\n\
module.exports = function compose(fns) {\n\
  return function(obj, done) {\n\
    async.reduce(fns, obj, function(obj, fn, callback){\n\
      fn = requireCallback(fn)\n\
      fn(obj, callback)\n\
    }, function(err, results) {\n\
      nextTick(function() {\n\
        done(err, results)\n\
      })\n\
    })\n\
  }\n\
}\n\
\n\
/**\n\
 * Require function to return results in callback.\n\
 *\n\
 * @param {Function:obj, Function} fn\n\
 * @return {Function}\n\
 * @api private\n\
 */\n\
\n\
function requireCallback(fn) {\n\
  if (fn.length !== 1) return fn\n\
  return function(obj, next) {\n\
    next(null, fn(obj))\n\
  }\n\
}\n\
//@ sourceURL=timoxley-async-compose/index.js"
));
require.register("editor/index.js", Function("exports, require, module",
"\n\
var bind = require('event').bind\n\
  , dom = require('dom')\n\
  , domify = require('domify')\n\
  , compose = require('async-compose')\n\
  , debounce = require('debounce')\n\
  , marked = require('marked')\n\
  , moment = require('moment')\n\
  , throttle = require('throttle')\n\
  , value = require('value');\n\
\n\
\n\
/**\n\
 * Set some default markdown options.\n\
 */\n\
\n\
marked.setOptions({\n\
  breaks : true,\n\
  gfm : true,\n\
  smartypants : true,\n\
  tables : true\n\
});\n\
\n\
\n\
/**\n\
 * Expose `Editor`.\n\
 */\n\
\n\
module.exports = Editor;\n\
\n\
\n\
/**\n\
 * Initialize a new `Editor`.\n\
 *\n\
 * @param {Object} doc\n\
 */\n\
\n\
function Editor (doc) {\n\
  this.doc = doc;\n\
  this.input = domify('<textarea class=\"input\" placeholder=\"Start writing here&hellip;\">');\n\
  this.output = domify('<article class=\"output\">');\n\
\n\
  // TODO: tabbing inside input\n\
\n\
  bind(this.input, 'keyup', this.onkeyup.bind(this));\n\
  doc.on('change', this.onchange.bind(this));\n\
\n\
  this.render(doc.toJSON());\n\
}\n\
\n\
\n\
/**\n\
 * Add a plugin.\n\
 *\n\
 * @param {Function} plugin\n\
 */\n\
\n\
Editor.use = function (plugin) {\n\
  plugin(this);\n\
  return this;\n\
};\n\
\n\
\n\
/**\n\
 * Add a filter, for transforming text, html or DOM elements.\n\
 *\n\
 * @param {String} name\n\
 * @param {Function} callback\n\
 */\n\
\n\
Editor.filter = function (name, callback) {\n\
  this._filters || (this._filters = {});\n\
  this._filters[name] || (this._filters[name] = []);\n\
  this._filters[name].push(callback);\n\
};\n\
\n\
\n\
/**\n\
 * Render settings into the DOM.\n\
 *\n\
 * @param {Object} attrs\n\
 * @param {Function} callback\n\
 * @return {Editor}\n\
 */\n\
\n\
Editor.prototype.render = function (attrs, callback) {\n\
  var text = attrs.body;\n\
  if (!text) return;\n\
  value(this.input, text);\n\
\n\
  var self = this;\n\
  self.filter('text', text, function (err, text) {\n\
    if (err) throw err;\n\
    var html = marked(text);\n\
\n\
    self.filter('html', html, function (err, html) {\n\
      if (err) throw err;\n\
      var els = domify('<div>' + html + '</div>');\n\
\n\
      self.filter('dom', els, function (err, els) {\n\
        if (err) throw err;\n\
        dom(self.output).empty().append(els);\n\
        callback && callback();\n\
      });\n\
    });\n\
  });\n\
\n\
  return this;\n\
};\n\
\n\
\n\
/**\n\
 * Runs all the filters for a given `type`, and `callback`.\n\
 *\n\
 * @param {String} name\n\
 * @param {Mixed} input\n\
 * @param {Function} callback\n\
 * @return {Editor}\n\
 */\n\
\n\
Editor.prototype.filter = function (type, input, callback) {\n\
  var filter = compose(Editor._filters[type] || []);\n\
  filter(input, callback);\n\
  return this;\n\
};\n\
\n\
\n\
/**\n\
 * Save settings to Firebase.\n\
 *\n\
 * Debounced 500ms.\n\
 *\n\
 * @param {Object} attrs\n\
 * @return {Editor}\n\
 */\n\
\n\
Editor.prototype.save = debounce(function (attrs) {\n\
  this.doc.set(attrs).save();\n\
  return this;\n\
}, 500);\n\
\n\
\n\
/**\n\
 * Update our DOM elements when our values change.\n\
 */\n\
\n\
Editor.prototype.onchange = function () {\n\
  var attrs = this.doc.toJSON();\n\
  this.render(attrs);\n\
};\n\
\n\
\n\
/**\n\
 * On keyup, take the textarea contents and save them to firebase.\n\
 *\n\
 * Throttled 200ms.\n\
 */\n\
\n\
Editor.prototype.onkeyup = throttle(function (e) {\n\
  this.doc.body(value(this.input));\n\
  var attrs = this.doc.toJSON();\n\
  var self = this;\n\
  this.render(attrs, function () {\n\
    self.save({ title : self.title() }); // grab the newest title\n\
  });\n\
}, 200);\n\
\n\
\n\
/**\n\
 * Generate a title based on the body and date of the document.\n\
 *\n\
 * @param  {String} markdown\n\
 * @param  {Date} created\n\
 * @return {String}\n\
 */\n\
\n\
Editor.prototype.title = function () {\n\
  var headings = dom(this.output).find('h1, h2, h3, h4, h5, h6');\n\
  if (headings.length()) {\n\
    return headings.at(0).text();\n\
  } else {\n\
    return moment(this.doc.created()).format('[Untitled] - MMMM Do, YYYY');\n\
  }\n\
};//@ sourceURL=editor/index.js"
));
require.register("component-keyname/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Key name map.\n\
 */\n\
\n\
var map = {\n\
  8: 'backspace',\n\
  9: 'tab',\n\
  13: 'enter',\n\
  16: 'shift',\n\
  17: 'ctrl',\n\
  18: 'alt',\n\
  20: 'capslock',\n\
  27: 'esc',\n\
  32: 'space',\n\
  33: 'pageup',\n\
  34: 'pagedown',\n\
  35: 'end',\n\
  36: 'home',\n\
  37: 'left',\n\
  38: 'up',\n\
  39: 'right',\n\
  40: 'down',\n\
  45: 'ins',\n\
  46: 'del',\n\
  91: 'meta',\n\
  93: 'meta',\n\
  224: 'meta'\n\
};\n\
\n\
/**\n\
 * Return key name for `n`.\n\
 *\n\
 * @param {Number} n\n\
 * @return {String}\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(n){\n\
  return map[n];\n\
};//@ sourceURL=component-keyname/index.js"
));
require.register("segmentio-view/lib/index.js", Function("exports, require, module",
"\n\
var domify = require('domify')\n\
  , Emitter = require('emitter')\n\
  , protos = require('./protos')\n\
  , reactive = require('reactive')\n\
  , type = require('type');\n\
\n\
\n\
/**\n\
 * Expose `createView`.\n\
 */\n\
\n\
module.exports = createView;\n\
\n\
\n\
/**\n\
 * Create a new view constructor with the given `template`.\n\
 *\n\
 * @param {String} template\n\
 * @return {Function}\n\
 */\n\
\n\
function createView (template) {\n\
  if (!template) throw new Error('template required');\n\
\n\
  /**\n\
   * Initialize a new `View` with an optional `model`, `el` and `options`.\n\
   *\n\
   * @param {Object} model (optional)\n\
   * @param {Element} el (optional)\n\
   * @param {Object} options (optional)\n\
   */\n\
\n\
  function View (model, el, options) {\n\
    options || (options = {});\n\
\n\
    if ('element' === type(model)) {\n\
      options = el;\n\
      el = model;\n\
      model = null;\n\
    }\n\
\n\
    if ('object' === type(el)) {\n\
      options = el;\n\
      el = null;\n\
    }\n\
\n\
    this.model = model;\n\
    this.el = el || domify(template);\n\
    this.options = options;\n\
    this.reactive = reactive(this.el, this.model || {}, this);\n\
    this.view.emit('construct', this, model, el, options);\n\
  }\n\
\n\
  // mixin emitter\n\
  Emitter(View);\n\
\n\
  // statics\n\
  View.template = template;\n\
\n\
  // prototypes\n\
  View.prototype.view = View;\n\
  for (var key in protos) View.prototype[key] = protos[key];\n\
\n\
  return View;\n\
}//@ sourceURL=segmentio-view/lib/index.js"
));
require.register("segmentio-view/lib/protos.js", Function("exports, require, module",
"\n\
var classes = require('classes')\n\
  , Emitter = require('emitter');\n\
\n\
\n\
/**\n\
 * Mixin emitter.\n\
 */\n\
\n\
Emitter(exports);\n\
\n\
\n\
/**\n\
 * Add a class to the view's el.\n\
 *\n\
 * @param {String} name\n\
 * @return {View}\n\
 */\n\
\n\
exports.addClass = function (name) {\n\
  classes(this.el).add(name);\n\
  return this;\n\
};\n\
\n\
\n\
/**\n\
 * Remove a class from the view's el.\n\
 *\n\
 * @param {String} name\n\
 * @return {View}\n\
 */\n\
\n\
exports.removeClass = function (name) {\n\
  classes(this.el).remove(name);\n\
  return this;\n\
};//@ sourceURL=segmentio-view/lib/protos.js"
));
require.register("nav/index.js", Function("exports, require, module",
"\n\
var keyname = require('keyname')\n\
  , menu = require('menu')\n\
  , MenuItem = require('./item')\n\
  , template = require('./index.html')\n\
  , value = require('value')\n\
  , view = require('view');\n\
\n\
\n\
/**\n\
 * Expose the `Nav` constructor.\n\
 */\n\
\n\
var Nav = module.exports = view(template);\n\
\n\
\n\
/**\n\
 * Create a `Menu` constructor.\n\
 */\n\
\n\
var Menu = menu(MenuItem);\n\
\n\
\n\
/**\n\
 * Show the nav.\n\
 *\n\
 * @return {Nav}\n\
 */\n\
\n\
Nav.prototype.show = function () {\n\
  return this\n\
    .addClass('visible')\n\
    .removeClass('hidden')\n\
    .emit('show');\n\
};\n\
\n\
\n\
/**\n\
 * Hide the nav.\n\
 *\n\
 * @return {Nav}\n\
 */\n\
\n\
Nav.prototype.hide = function () {\n\
  return this\n\
    .removeClass('visible')\n\
    .addClass('hidden')\n\
    .emit('hide');\n\
};\n\
\n\
\n\
/**\n\
 * Add a document to the menu.\n\
 *\n\
 * @param {Object} doc\n\
 * @return {Nav}\n\
 */\n\
\n\
Nav.prototype.add = function (doc) {\n\
  this.menu.add(doc);\n\
  return this;\n\
};\n\
\n\
\n\
/**\n\
 * Remove a document from the menu.\n\
 *\n\
 * @param {String} id\n\
 * @return {Nav}\n\
 */\n\
\n\
Nav.prototype.remove = function (id) {\n\
  this.menu.remove(id);\n\
  return this;\n\
};\n\
\n\
\n\
/**\n\
 * Focus the nav's search input.\n\
 *\n\
 * @return {Nav}\n\
 */\n\
\n\
Nav.prototype.focus = function () {\n\
  this.el.querySelector('.nav-search').focus();\n\
  return this;\n\
};\n\
\n\
\n\
/**\n\
 * Reactive menu replacement.\n\
 *\n\
 * @return {Element}\n\
 */\n\
\n\
Nav.prototype.replaceMenu = function () {\n\
  var self = this;\n\
  this.menu = new Menu()\n\
    .on('remove', function (el, doc) {\n\
      self.emit('remove', doc);\n\
    });\n\
  return this.menu.el;\n\
};\n\
\n\
\n\
/**\n\
 * On search, filter the menu.\n\
 */\n\
\n\
Nav.prototype.onSearch = function (e) {\n\
  switch (keyname(e.keyCode)) {\n\
    case 'esc':\n\
      return this.hide();\n\
    case 'up':\n\
      return this.menu.move('previous');\n\
    case 'down':\n\
      return this.menu.move('next');\n\
  }\n\
  var string = value(e.target);\n\
  this.menu.filter(function (el) {\n\
    return el.text().toLowerCase().indexOf(string) !== -1;\n\
  });\n\
};//@ sourceURL=nav/index.js"
));
require.register("nav/item.js", Function("exports, require, module",
"\n\
var template = require('./item.html')\n\
  , stop = require('stop')\n\
  , prevent = require('prevent')\n\
  , view = require('view');\n\
\n\
\n\
/**\n\
 * Expose `MenuItemView` constructor.\n\
 */\n\
\n\
var MenuItemView = module.exports = view(template);\n\
\n\
\n\
/**\n\
 * On clicking the delete button, remove the document from the list.\n\
 */\n\
\n\
MenuItemView.prototype.onClickDelete = function (e) {\n\
  prevent(e);\n\
  stop(e);\n\
  this.menu.remove(this.model.primary());\n\
};//@ sourceURL=nav/item.js"
));
require.register("app/index.js", Function("exports, require, module",
"\n\
var dom = require('dom')\n\
  , domify = require('domify')\n\
  , Editor = require('editor')\n\
  , Emitter = require('emitter')\n\
  , Nav = require('nav')\n\
  , reactive = require('reactive')\n\
  , shortcut = require('mousetrap')\n\
  , template = require('./index.html');\n\
\n\
\n\
/**\n\
 * Configure Editor with filters.\n\
 */\n\
\n\
Editor\n\
  .use(require('./filters/rainbow'));\n\
  // .use(require('./filters/mathjax'))\n\
\n\
\n\
/**\n\
 * Configure Mousetrap to allow binding inside text inputs.\n\
 */\n\
\n\
shortcut.stopCallback = function () { return false; };\n\
\n\
\n\
/**\n\
 * Expose `App`.\n\
 */\n\
\n\
module.exports = App;\n\
\n\
\n\
/**\n\
 * Initialize a new `App`.\n\
 */\n\
\n\
function App () {\n\
  this.el = domify(template);\n\
  this.reactive = reactive(this.el, {}, this);\n\
  this.bindShortcuts();\n\
}\n\
\n\
\n\
/**\n\
 * Mixin Emitter.\n\
 */\n\
\n\
Emitter(App.prototype);\n\
\n\
\n\
/**\n\
 * Load a document.\n\
 */\n\
\n\
App.prototype.load = function (doc) {\n\
  var editor = this.editor = new Editor(doc);\n\
  dom('.input', this.el).replace(editor.input);\n\
  dom('.output', this.el).replace(editor.output);\n\
  return this;\n\
};\n\
\n\
\n\
/**\n\
 * Add a document to the app.\n\
 *\n\
 * @param {Document} doc\n\
 * @return {App}\n\
 */\n\
\n\
App.prototype.add = function (doc) {\n\
  this.nav.add(doc);\n\
  this.emit('add', doc);\n\
  return this;\n\
};\n\
\n\
\n\
/**\n\
 * Get or set a state for the app.\n\
 *\n\
 * @param {String} name\n\
 * @param {Boolean} value\n\
 * @return {App}\n\
 */\n\
\n\
App.prototype.state = function (name, value) {\n\
  if (value === undefined) return dom(this.el).hasClass(name);\n\
  dom(this.el).toggleClass(name, value);\n\
  return this;\n\
};\n\
\n\
\n\
/**\n\
 * Toggles for the different states of the App.\n\
 *\n\
 * @param {Boolean} value\n\
 * @return {App}\n\
 */\n\
\n\
App.prototype.reading = function (value) {\n\
  if (value === undefined) this.state('writing', false);\n\
  return this.state('reading', value);\n\
};\n\
\n\
App.prototype.writing = function (value) {\n\
  if (value === undefined) this.state('reading', false);\n\
  return this.state('writing', value);\n\
};\n\
\n\
App.prototype.navigating = function (value) {\n\
  if (value === undefined) return this.state('navigating'); // avoid loop\n\
  this.state('navigating', value);\n\
  if (value) this.nav.focus();\n\
  return this;\n\
};\n\
\n\
\n\
/**\n\
 * Reactive bindings.\n\
 */\n\
\n\
App.prototype.replaceNav = function () {\n\
  var self = this;\n\
  this.nav = new Nav()\n\
    .on('remove', function (doc) {\n\
      self.emit('remove', doc);\n\
    });\n\
  return this.nav.el;\n\
};\n\
\n\
App.prototype.onNav = function (e) {\n\
  this.navigating(!this.navigating());\n\
};\n\
\n\
App.prototype.onWrite = function (e) {\n\
  this.writing(!this.writing());\n\
};\n\
\n\
App.prototype.onRead = function (e) {\n\
  this.reading(!this.reading());\n\
};\n\
\n\
\n\
/**\n\
 * Bind to keyboard shortcuts.\n\
 */\n\
\n\
App.prototype.bindShortcuts = function () {\n\
  var self = this;\n\
  shortcut.bind('ctrl+alt+n', function () {\n\
    self.new();\n\
  });\n\
\n\
  shortcut.bind('ctrl+alt+o', function () {\n\
    self.navigating(true);\n\
  });\n\
\n\
  shortcut.bind('ctrl+alt+left', function () {\n\
    if (self.reading()) self.reading(false);\n\
    else if (self.writing()) self.navigating(true);\n\
    else self.writing(true);\n\
  });\n\
\n\
  shortcut.bind('ctrl+alt+right', function () {\n\
    if (self.writing()) self.writing(false);\n\
    else if (self.navigating()) self.navigating(false);\n\
    else self.reading(true);\n\
  });\n\
\n\
  shortcut.bind('esc', function () {\n\
    self.navigating(false);\n\
  });\n\
};//@ sourceURL=app/index.js"
));
require.register("app/filters/mathjax.js", Function("exports, require, module",
"\n\
var MathJax = require('mathjax');\n\
\n\
\n\
/**\n\
 * Configure.\n\
 *\n\
 * http://docs.mathjax.org/en/latest/config-files.html#the-tex-ams-mml-htmlormml-configuration-file\n\
 */\n\
\n\
MathJax.Hub.Config({\n\
  config: [\"MMLorHTML.js\"],\n\
  jax: [\"input/TeX\",\"input/MathML\",\"output/HTML-CSS\",\"output/NativeMML\"],\n\
  extensions: [\"tex2jax.js\",\"mml2jax.js\",\"MathMenu.js\",\"MathZoom.js\"],\n\
  TeX: {\n\
    extensions: [\"AMSmath.js\",\"AMSsymbols.js\",\"noErrors.js\",\"noUndefined.js\"]\n\
  },\n\
  tex2jax : {\n\
    displayMath : [['$$','$$'], ['\\\\[','\\\\]']],\n\
    inlineMath  : [['\\\\(','\\\\)']]\n\
  }\n\
});\n\
\n\
\n\
/**\n\
 * Filter dom and turn it into MathJax.\n\
 */\n\
\n\
module.exports = function (Editor) {\n\
  Editor.filter('dom', function (dom, done) {\n\
    MathJax.Hub.Queue(['Typeset'], MathJax.Hub, dom);\n\
    MathJax.Hub.Queue(function () {\n\
      done(null, dom);\n\
    });\n\
  });\n\
};//@ sourceURL=app/filters/mathjax.js"
));
require.register("app/filters/rainbow.js", Function("exports, require, module",
"\n\
var Rainbow = require('rainbow');\n\
\n\
\n\
/**\n\
 * Export our plugin.\n\
 */\n\
\n\
module.exports = function (Editor) {\n\
  Editor.filter('dom', function (dom, done) {\n\
    Rainbow.color(dom, function () {\n\
      done(null, dom);\n\
    });\n\
  });\n\
};//@ sourceURL=app/filters/rainbow.js"
));
require.register("component-set/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Expose `Set`.\n\
 */\n\
\n\
module.exports = Set;\n\
\n\
/**\n\
 * Initialize a new `Set` with optional `vals`\n\
 *\n\
 * @param {Array} vals\n\
 * @api public\n\
 */\n\
\n\
function Set(vals) {\n\
  if (!(this instanceof Set)) return new Set(vals);\n\
  this.vals = [];\n\
  if (vals) {\n\
    for (var i = 0; i < vals.length; ++i) {\n\
      this.add(vals[i]);\n\
    }\n\
  }\n\
}\n\
\n\
/**\n\
 * Add `val`.\n\
 *\n\
 * @param {Mixed} val\n\
 * @api public\n\
 */\n\
\n\
Set.prototype.add = function(val){\n\
  if (this.has(val)) return;\n\
  this.vals.push(val);\n\
};\n\
\n\
/**\n\
 * Check if this set has `val`.\n\
 *\n\
 * @param {Mixed} val\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
Set.prototype.has = function(val){\n\
  return !! ~this.indexOf(val);\n\
};\n\
\n\
/**\n\
 * Return the indexof `val`.\n\
 *\n\
 * @param {Mixed} val\n\
 * @return {Number}\n\
 * @api private\n\
 */\n\
\n\
Set.prototype.indexOf = function(val){\n\
  for (var i = 0, len = this.vals.length; i < len; ++i) {\n\
    var obj = this.vals[i];\n\
    if (obj.equals && obj.equals(val)) return i;\n\
    if (obj == val) return i;\n\
  }\n\
  return -1;\n\
};\n\
\n\
/**\n\
 * Iterate each member and invoke `fn(val)`.\n\
 *\n\
 * @param {Function} fn\n\
 * @return {Set}\n\
 * @api public\n\
 */\n\
\n\
Set.prototype.each = function(fn){\n\
  for (var i = 0; i < this.vals.length; ++i) {\n\
    fn(this.vals[i]);\n\
  }\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Return the values as an array.\n\
 *\n\
 * @return {Array}\n\
 * @api public\n\
 */\n\
\n\
Set.prototype.values =\n\
Set.prototype.array =\n\
Set.prototype.members =\n\
Set.prototype.toJSON = function(){\n\
  return this.vals;\n\
};\n\
\n\
/**\n\
 * Return the set size.\n\
 *\n\
 * @return {Number}\n\
 * @api public\n\
 */\n\
\n\
Set.prototype.size = function(){\n\
  return this.vals.length;\n\
};\n\
\n\
/**\n\
 * Empty the set and return old values.\n\
 *\n\
 * @return {Array}\n\
 * @api public\n\
 */\n\
\n\
Set.prototype.clear = function(){\n\
  var old = this.vals;\n\
  this.vals = [];\n\
  return old;\n\
};\n\
\n\
/**\n\
 * Remove `val`, returning __true__ when present, otherwise __false__.\n\
 *\n\
 * @param {Mixed} val\n\
 * @return {Mixed}\n\
 * @api public\n\
 */\n\
\n\
Set.prototype.remove = function(val){\n\
  var i = this.indexOf(val);\n\
  if (~i) this.vals.splice(i, 1);\n\
  return !! ~i;\n\
};\n\
\n\
/**\n\
 * Perform a union on `set`.\n\
 *\n\
 * @param {Set} set\n\
 * @return {Set} new set\n\
 * @api public\n\
 */\n\
\n\
Set.prototype.union = function(set){\n\
  var ret = new Set;\n\
  var a = this.vals;\n\
  var b = set.vals;\n\
  for (var i = 0; i < a.length; ++i) ret.add(a[i]);\n\
  for (var i = 0; i < b.length; ++i) ret.add(b[i]);\n\
  return ret;\n\
};\n\
\n\
/**\n\
 * Perform an intersection on `set`.\n\
 *\n\
 * @param {Set} set\n\
 * @return {Set} new set\n\
 * @api public\n\
 */\n\
\n\
Set.prototype.intersect = function(set){\n\
  var ret = new Set;\n\
  var a = this.vals;\n\
  var b = set.vals;\n\
\n\
  for (var i = 0; i < a.length; ++i) {\n\
    if (set.has(a[i])) {\n\
      ret.add(a[i]);\n\
    }\n\
  }\n\
\n\
  for (var i = 0; i < b.length; ++i) {\n\
    if (this.has(b[i])) {\n\
      ret.add(b[i]);\n\
    }\n\
  }\n\
\n\
  return ret;\n\
};\n\
\n\
/**\n\
 * Check if the set is empty.\n\
 *\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
Set.prototype.isEmpty = function(){\n\
  return 0 == this.vals.length;\n\
};\n\
\n\
//@ sourceURL=component-set/index.js"
));
require.register("yields-unserialize/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Unserialize the given \"stringified\" javascript.\n\
 * \n\
 * @param {String} val\n\
 * @return {Mixed}\n\
 */\n\
\n\
module.exports = function(val){\n\
  try {\n\
    return JSON.parse(val);\n\
  } catch (e) {\n\
    return val || undefined;\n\
  }\n\
};\n\
//@ sourceURL=yields-unserialize/index.js"
));
require.register("yields-store/index.js", Function("exports, require, module",
"\n\
/**\n\
 * dependencies.\n\
 */\n\
\n\
var each = require('each')\n\
  , unserialize = require('unserialize')\n\
  , storage = window.localStorage\n\
  , type = require('type');\n\
\n\
/**\n\
 * Store the given `key` `val`.\n\
 *\n\
 * @param {String} key\n\
 * @param {Mixed} val\n\
 * @return {Mixed}\n\
 */\n\
\n\
exports = module.exports = function(key, val){\n\
  switch (arguments.length) {\n\
    case 2: return set(key, val);\n\
    case 0: return all();\n\
    case 1: return 'object' == type(key)\n\
      ? each(key, set)\n\
      : get(key);\n\
  }\n\
};\n\
\n\
/**\n\
 * supported flag.\n\
 */\n\
\n\
exports.supported = !! storage;\n\
\n\
/**\n\
 * export methods.\n\
 */\n\
\n\
exports.set = set;\n\
exports.get = get;\n\
exports.all = all;\n\
\n\
/**\n\
 * Set `key` to `val`.\n\
 *\n\
 * @param {String} key\n\
 * @param {Mixed} val\n\
 */\n\
\n\
function set(key, val){\n\
  return null == val\n\
    ? storage.removeItem(key)\n\
    : storage.setItem(key, JSON.stringify(val));\n\
}\n\
\n\
/**\n\
 * Get `key`.\n\
 *\n\
 * @param {String} key\n\
 * @return {Mixed}\n\
 */\n\
\n\
function get(key){\n\
  return null == key\n\
    ? storage.clear()\n\
    : unserialize(storage.getItem(key));\n\
}\n\
\n\
/**\n\
 * Get all.\n\
 *\n\
 * @return {Object}\n\
 */\n\
\n\
function all(){\n\
  var len = storage.length\n\
    , ret = {}\n\
    , key\n\
    , val;\n\
\n\
  for (var i = 0; i < len; ++i) {\n\
    key = storage.key(i);\n\
    ret[key] = get(key);\n\
  }\n\
\n\
  return ret;\n\
}\n\
//@ sourceURL=yields-store/index.js"
));
require.register("bookmarks/index.js", Function("exports, require, module",
"\n\
var each = require('each')\n\
  , Set = require('set')\n\
  , store = require('store');\n\
\n\
\n\
/**\n\
 * Create a set of bookmarks from local storage.\n\
 */\n\
\n\
var KEY = 'bookmarks';\n\
var set = new Set(store(KEY));\n\
\n\
\n\
\n\
/**\n\
 * Exports.\n\
 */\n\
\n\
module.exports = all;\n\
module.exports.add = add;\n\
module.exports.remove = remove;\n\
\n\
\n\
/**\n\
 * Get all bookmarks.\n\
 */\n\
\n\
function all () {\n\
  return set.values();\n\
}\n\
\n\
\n\
/**\n\
 * Add a bookmark.\n\
 *\n\
 * @param {String} id  The ID of the bookmark to add.\n\
 */\n\
\n\
function add (id) {\n\
  set.add(id);\n\
  save();\n\
}\n\
\n\
\n\
/**\n\
 * Remove a bookmark.\n\
 *\n\
 * @param {String} id  The ID of the bookmark to remove.\n\
 */\n\
\n\
function remove (id) {\n\
  set.remove(id);\n\
  save();\n\
}\n\
\n\
\n\
/**\n\
 * Save the current bookmarks set.\n\
 */\n\
\n\
function save () {\n\
  store(KEY, set.values());\n\
}\n\
\n\
\n\
/**\n\
 * BACKWARDS COMPATIBILITY: Bookmarks used to be stored under\n\
 * `socrates.bookmarks` and as a comma-separated string. So convert them to the\n\
 * new system gracefully.\n\
 */\n\
\n\
var OLD_KEY = 'socrates.bookmarks';\n\
\n\
if (store(OLD_KEY)) {\n\
  each(store(OLD_KEY).split(','), add);\n\
  store(OLD_KEY, null);\n\
}//@ sourceURL=bookmarks/index.js"
));
require.register("component-clone/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var type;\n\
\n\
try {\n\
  type = require('type');\n\
} catch(e){\n\
  type = require('type-component');\n\
}\n\
\n\
/**\n\
 * Module exports.\n\
 */\n\
\n\
module.exports = clone;\n\
\n\
/**\n\
 * Clones objects.\n\
 *\n\
 * @param {Mixed} any object\n\
 * @api public\n\
 */\n\
\n\
function clone(obj){\n\
  switch (type(obj)) {\n\
    case 'object':\n\
      var copy = {};\n\
      for (var key in obj) {\n\
        if (obj.hasOwnProperty(key)) {\n\
          copy[key] = clone(obj[key]);\n\
        }\n\
      }\n\
      return copy;\n\
\n\
    case 'array':\n\
      var copy = new Array(obj.length);\n\
      for (var i = 0, l = obj.length; i < l; i++) {\n\
        copy[i] = clone(obj[i]);\n\
      }\n\
      return copy;\n\
\n\
    case 'regexp':\n\
      // from millermedeiros/amd-utils - MIT\n\
      var flags = '';\n\
      flags += obj.multiline ? 'm' : '';\n\
      flags += obj.global ? 'g' : '';\n\
      flags += obj.ignoreCase ? 'i' : '';\n\
      return new RegExp(obj.source, flags);\n\
\n\
    case 'date':\n\
      return new Date(obj.getTime());\n\
\n\
    default: // string, number, boolean, …\n\
      return obj;\n\
  }\n\
}\n\
//@ sourceURL=component-clone/index.js"
));
require.register("component-collection/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var Enumerable = require('enumerable');\n\
\n\
/**\n\
 * Expose `Collection`.\n\
 */\n\
\n\
module.exports = Collection;\n\
\n\
/**\n\
 * Initialize a new collection with the given `models`.\n\
 *\n\
 * @param {Array} models\n\
 * @api public\n\
 */\n\
\n\
function Collection(models) {\n\
  this.models = models || [];\n\
}\n\
\n\
/**\n\
 * Mixin enumerable.\n\
 */\n\
\n\
Enumerable(Collection.prototype);\n\
\n\
/**\n\
 * Iterator implementation.\n\
 */\n\
\n\
Collection.prototype.__iterate__ = function(){\n\
  var self = this;\n\
  return {\n\
    length: function(){ return self.length() },\n\
    get: function(i){ return self.models[i] }\n\
  }\n\
};\n\
\n\
/**\n\
 * Return the collection length.\n\
 *\n\
 * @return {Number}\n\
 * @api public\n\
 */\n\
\n\
Collection.prototype.length = function(){\n\
  return this.models.length;\n\
};\n\
\n\
/**\n\
 * Add `model` to the collection and return the index.\n\
 *\n\
 * @param {Object} model\n\
 * @return {Number}\n\
 * @api public\n\
 */\n\
\n\
Collection.prototype.push = function(model){\n\
  return this.models.push(model);\n\
};\n\
//@ sourceURL=component-collection/index.js"
));
require.register("RedVentures-reduce/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Reduce `arr` with `fn`.\n\
 *\n\
 * @param {Array} arr\n\
 * @param {Function} fn\n\
 * @param {Mixed} initial\n\
 *\n\
 * TODO: combatible error handling?\n\
 */\n\
\n\
module.exports = function(arr, fn, initial){  \n\
  var idx = 0;\n\
  var len = arr.length;\n\
  var curr = arguments.length == 3\n\
    ? initial\n\
    : arr[idx++];\n\
\n\
  while (idx < len) {\n\
    curr = fn.call(null, curr, arr[idx], ++idx, arr);\n\
  }\n\
  \n\
  return curr;\n\
};//@ sourceURL=RedVentures-reduce/index.js"
));
require.register("visionmedia-superagent/lib/client.js", Function("exports, require, module",
"/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var Emitter = require('emitter');\n\
var reduce = require('reduce');\n\
\n\
/**\n\
 * Root reference for iframes.\n\
 */\n\
\n\
var root = 'undefined' == typeof window\n\
  ? this\n\
  : window;\n\
\n\
/**\n\
 * Noop.\n\
 */\n\
\n\
function noop(){};\n\
\n\
/**\n\
 * Check if `obj` is a host object,\n\
 * we don't want to serialize these :)\n\
 *\n\
 * TODO: future proof, move to compoent land\n\
 *\n\
 * @param {Object} obj\n\
 * @return {Boolean}\n\
 * @api private\n\
 */\n\
\n\
function isHost(obj) {\n\
  var str = {}.toString.call(obj);\n\
\n\
  switch (str) {\n\
    case '[object File]':\n\
    case '[object Blob]':\n\
    case '[object FormData]':\n\
      return true;\n\
    default:\n\
      return false;\n\
  }\n\
}\n\
\n\
/**\n\
 * Determine XHR.\n\
 */\n\
\n\
function getXHR() {\n\
  if (root.XMLHttpRequest\n\
    && ('file:' != root.location.protocol || !root.ActiveXObject)) {\n\
    return new XMLHttpRequest;\n\
  } else {\n\
    try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch(e) {}\n\
    try { return new ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch(e) {}\n\
    try { return new ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch(e) {}\n\
    try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch(e) {}\n\
  }\n\
  return false;\n\
}\n\
\n\
/**\n\
 * Removes leading and trailing whitespace, added to support IE.\n\
 *\n\
 * @param {String} s\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
var trim = ''.trim\n\
  ? function(s) { return s.trim(); }\n\
  : function(s) { return s.replace(/(^\\s*|\\s*$)/g, ''); };\n\
\n\
/**\n\
 * Check if `obj` is an object.\n\
 *\n\
 * @param {Object} obj\n\
 * @return {Boolean}\n\
 * @api private\n\
 */\n\
\n\
function isObject(obj) {\n\
  return obj === Object(obj);\n\
}\n\
\n\
/**\n\
 * Serialize the given `obj`.\n\
 *\n\
 * @param {Object} obj\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
function serialize(obj) {\n\
  if (!isObject(obj)) return obj;\n\
  var pairs = [];\n\
  for (var key in obj) {\n\
    pairs.push(encodeURIComponent(key)\n\
      + '=' + encodeURIComponent(obj[key]));\n\
  }\n\
  return pairs.join('&');\n\
}\n\
\n\
/**\n\
 * Expose serialization method.\n\
 */\n\
\n\
 request.serializeObject = serialize;\n\
\n\
 /**\n\
  * Parse the given x-www-form-urlencoded `str`.\n\
  *\n\
  * @param {String} str\n\
  * @return {Object}\n\
  * @api private\n\
  */\n\
\n\
function parseString(str) {\n\
  var obj = {};\n\
  var pairs = str.split('&');\n\
  var parts;\n\
  var pair;\n\
\n\
  for (var i = 0, len = pairs.length; i < len; ++i) {\n\
    pair = pairs[i];\n\
    parts = pair.split('=');\n\
    obj[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);\n\
  }\n\
\n\
  return obj;\n\
}\n\
\n\
/**\n\
 * Expose parser.\n\
 */\n\
\n\
request.parseString = parseString;\n\
\n\
/**\n\
 * Default MIME type map.\n\
 *\n\
 *     superagent.types.xml = 'application/xml';\n\
 *\n\
 */\n\
\n\
request.types = {\n\
  html: 'text/html',\n\
  json: 'application/json',\n\
  urlencoded: 'application/x-www-form-urlencoded',\n\
  'form': 'application/x-www-form-urlencoded',\n\
  'form-data': 'application/x-www-form-urlencoded'\n\
};\n\
\n\
/**\n\
 * Default serialization map.\n\
 *\n\
 *     superagent.serialize['application/xml'] = function(obj){\n\
 *       return 'generated xml here';\n\
 *     };\n\
 *\n\
 */\n\
\n\
 request.serialize = {\n\
   'application/x-www-form-urlencoded': serialize,\n\
   'application/json': JSON.stringify\n\
 };\n\
\n\
 /**\n\
  * Default parsers.\n\
  *\n\
  *     superagent.parse['application/xml'] = function(str){\n\
  *       return { object parsed from str };\n\
  *     };\n\
  *\n\
  */\n\
\n\
request.parse = {\n\
  'application/x-www-form-urlencoded': parseString,\n\
  'application/json': JSON.parse\n\
};\n\
\n\
/**\n\
 * Parse the given header `str` into\n\
 * an object containing the mapped fields.\n\
 *\n\
 * @param {String} str\n\
 * @return {Object}\n\
 * @api private\n\
 */\n\
\n\
function parseHeader(str) {\n\
  var lines = str.split(/\\r?\\n\
/);\n\
  var fields = {};\n\
  var index;\n\
  var line;\n\
  var field;\n\
  var val;\n\
\n\
  lines.pop(); // trailing CRLF\n\
\n\
  for (var i = 0, len = lines.length; i < len; ++i) {\n\
    line = lines[i];\n\
    index = line.indexOf(':');\n\
    field = line.slice(0, index).toLowerCase();\n\
    val = trim(line.slice(index + 1));\n\
    fields[field] = val;\n\
  }\n\
\n\
  return fields;\n\
}\n\
\n\
/**\n\
 * Return the mime type for the given `str`.\n\
 *\n\
 * @param {String} str\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
function type(str){\n\
  return str.split(/ *; */).shift();\n\
};\n\
\n\
/**\n\
 * Return header field parameters.\n\
 *\n\
 * @param {String} str\n\
 * @return {Object}\n\
 * @api private\n\
 */\n\
\n\
function params(str){\n\
  return reduce(str.split(/ *; */), function(obj, str){\n\
    var parts = str.split(/ *= */)\n\
      , key = parts.shift()\n\
      , val = parts.shift();\n\
\n\
    if (key && val) obj[key] = val;\n\
    return obj;\n\
  }, {});\n\
};\n\
\n\
/**\n\
 * Initialize a new `Response` with the given `xhr`.\n\
 *\n\
 *  - set flags (.ok, .error, etc)\n\
 *  - parse header\n\
 *\n\
 * Examples:\n\
 *\n\
 *  Aliasing `superagent` as `request` is nice:\n\
 *\n\
 *      request = superagent;\n\
 *\n\
 *  We can use the promise-like API, or pass callbacks:\n\
 *\n\
 *      request.get('/').end(function(res){});\n\
 *      request.get('/', function(res){});\n\
 *\n\
 *  Sending data can be chained:\n\
 *\n\
 *      request\n\
 *        .post('/user')\n\
 *        .send({ name: 'tj' })\n\
 *        .end(function(res){});\n\
 *\n\
 *  Or passed to `.send()`:\n\
 *\n\
 *      request\n\
 *        .post('/user')\n\
 *        .send({ name: 'tj' }, function(res){});\n\
 *\n\
 *  Or passed to `.post()`:\n\
 *\n\
 *      request\n\
 *        .post('/user', { name: 'tj' })\n\
 *        .end(function(res){});\n\
 *\n\
 * Or further reduced to a single call for simple cases:\n\
 *\n\
 *      request\n\
 *        .post('/user', { name: 'tj' }, function(res){});\n\
 *\n\
 * @param {XMLHTTPRequest} xhr\n\
 * @param {Object} options\n\
 * @api private\n\
 */\n\
\n\
function Response(req, options) {\n\
  options = options || {};\n\
  this.req = req;\n\
  this.xhr = this.req.xhr;\n\
  this.text = this.xhr.responseText;\n\
  this.setStatusProperties(this.xhr.status);\n\
  this.header = this.headers = parseHeader(this.xhr.getAllResponseHeaders());\n\
  // getAllResponseHeaders sometimes falsely returns \"\" for CORS requests, but\n\
  // getResponseHeader still works. so we get content-type even if getting\n\
  // other headers fails.\n\
  this.header['content-type'] = this.xhr.getResponseHeader('content-type');\n\
  this.setHeaderProperties(this.header);\n\
  this.body = this.parseBody(this.text);\n\
}\n\
\n\
/**\n\
 * Get case-insensitive `field` value.\n\
 *\n\
 * @param {String} field\n\
 * @return {String}\n\
 * @api public\n\
 */\n\
\n\
Response.prototype.get = function(field){\n\
  return this.header[field.toLowerCase()];\n\
};\n\
\n\
/**\n\
 * Set header related properties:\n\
 *\n\
 *   - `.type` the content type without params\n\
 *\n\
 * A response of \"Content-Type: text/plain; charset=utf-8\"\n\
 * will provide you with a `.type` of \"text/plain\".\n\
 *\n\
 * @param {Object} header\n\
 * @api private\n\
 */\n\
\n\
Response.prototype.setHeaderProperties = function(header){\n\
  // content-type\n\
  var ct = this.header['content-type'] || '';\n\
  this.type = type(ct);\n\
\n\
  // params\n\
  var obj = params(ct);\n\
  for (var key in obj) this[key] = obj[key];\n\
};\n\
\n\
/**\n\
 * Parse the given body `str`.\n\
 *\n\
 * Used for auto-parsing of bodies. Parsers\n\
 * are defined on the `superagent.parse` object.\n\
 *\n\
 * @param {String} str\n\
 * @return {Mixed}\n\
 * @api private\n\
 */\n\
\n\
Response.prototype.parseBody = function(str){\n\
  var parse = request.parse[this.type];\n\
  return parse\n\
    ? parse(str)\n\
    : null;\n\
};\n\
\n\
/**\n\
 * Set flags such as `.ok` based on `status`.\n\
 *\n\
 * For example a 2xx response will give you a `.ok` of __true__\n\
 * whereas 5xx will be __false__ and `.error` will be __true__. The\n\
 * `.clientError` and `.serverError` are also available to be more\n\
 * specific, and `.statusType` is the class of error ranging from 1..5\n\
 * sometimes useful for mapping respond colors etc.\n\
 *\n\
 * \"sugar\" properties are also defined for common cases. Currently providing:\n\
 *\n\
 *   - .noContent\n\
 *   - .badRequest\n\
 *   - .unauthorized\n\
 *   - .notAcceptable\n\
 *   - .notFound\n\
 *\n\
 * @param {Number} status\n\
 * @api private\n\
 */\n\
\n\
Response.prototype.setStatusProperties = function(status){\n\
  var type = status / 100 | 0;\n\
\n\
  // status / class\n\
  this.status = status;\n\
  this.statusType = type;\n\
\n\
  // basics\n\
  this.info = 1 == type;\n\
  this.ok = 2 == type;\n\
  this.clientError = 4 == type;\n\
  this.serverError = 5 == type;\n\
  this.error = (4 == type || 5 == type)\n\
    ? this.toError()\n\
    : false;\n\
\n\
  // sugar\n\
  this.accepted = 202 == status;\n\
  this.noContent = 204 == status || 1223 == status;\n\
  this.badRequest = 400 == status;\n\
  this.unauthorized = 401 == status;\n\
  this.notAcceptable = 406 == status;\n\
  this.notFound = 404 == status;\n\
  this.forbidden = 403 == status;\n\
};\n\
\n\
/**\n\
 * Return an `Error` representative of this response.\n\
 *\n\
 * @return {Error}\n\
 * @api public\n\
 */\n\
\n\
Response.prototype.toError = function(){\n\
  var req = this.req;\n\
  var method = req.method;\n\
  var path = req.path;\n\
\n\
  var msg = 'cannot ' + method + ' ' + path + ' (' + this.status + ')';\n\
  var err = new Error(msg);\n\
  err.status = this.status;\n\
  err.method = method;\n\
  err.path = path;\n\
\n\
  return err;\n\
};\n\
\n\
/**\n\
 * Expose `Response`.\n\
 */\n\
\n\
request.Response = Response;\n\
\n\
/**\n\
 * Initialize a new `Request` with the given `method` and `url`.\n\
 *\n\
 * @param {String} method\n\
 * @param {String} url\n\
 * @api public\n\
 */\n\
\n\
function Request(method, url) {\n\
  var self = this;\n\
  Emitter.call(this);\n\
  this._query = this._query || [];\n\
  this.method = method;\n\
  this.url = url;\n\
  this.header = {};\n\
  this._header = {};\n\
  this.on('end', function(){\n\
    var res = new Response(self);\n\
    if ('HEAD' == method) res.text = null;\n\
    self.callback(null, res);\n\
  });\n\
}\n\
\n\
/**\n\
 * Mixin `Emitter`.\n\
 */\n\
\n\
Emitter(Request.prototype);\n\
\n\
/**\n\
 * Set timeout to `ms`.\n\
 *\n\
 * @param {Number} ms\n\
 * @return {Request} for chaining\n\
 * @api public\n\
 */\n\
\n\
Request.prototype.timeout = function(ms){\n\
  this._timeout = ms;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Clear previous timeout.\n\
 *\n\
 * @return {Request} for chaining\n\
 * @api public\n\
 */\n\
\n\
Request.prototype.clearTimeout = function(){\n\
  this._timeout = 0;\n\
  clearTimeout(this._timer);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Abort the request, and clear potential timeout.\n\
 *\n\
 * @return {Request}\n\
 * @api public\n\
 */\n\
\n\
Request.prototype.abort = function(){\n\
  if (this.aborted) return;\n\
  this.aborted = true;\n\
  this.xhr.abort();\n\
  this.clearTimeout();\n\
  this.emit('abort');\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Set header `field` to `val`, or multiple fields with one object.\n\
 *\n\
 * Examples:\n\
 *\n\
 *      req.get('/')\n\
 *        .set('Accept', 'application/json')\n\
 *        .set('X-API-Key', 'foobar')\n\
 *        .end(callback);\n\
 *\n\
 *      req.get('/')\n\
 *        .set({ Accept: 'application/json', 'X-API-Key': 'foobar' })\n\
 *        .end(callback);\n\
 *\n\
 * @param {String|Object} field\n\
 * @param {String} val\n\
 * @return {Request} for chaining\n\
 * @api public\n\
 */\n\
\n\
Request.prototype.set = function(field, val){\n\
  if (isObject(field)) {\n\
    for (var key in field) {\n\
      this.set(key, field[key]);\n\
    }\n\
    return this;\n\
  }\n\
  this._header[field.toLowerCase()] = val;\n\
  this.header[field] = val;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Get case-insensitive header `field` value.\n\
 *\n\
 * @param {String} field\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
Request.prototype.getHeader = function(field){\n\
  return this._header[field.toLowerCase()];\n\
};\n\
\n\
/**\n\
 * Set Content-Type to `type`, mapping values from `request.types`.\n\
 *\n\
 * Examples:\n\
 *\n\
 *      superagent.types.xml = 'application/xml';\n\
 *\n\
 *      request.post('/')\n\
 *        .type('xml')\n\
 *        .send(xmlstring)\n\
 *        .end(callback);\n\
 *\n\
 *      request.post('/')\n\
 *        .type('application/xml')\n\
 *        .send(xmlstring)\n\
 *        .end(callback);\n\
 *\n\
 * @param {String} type\n\
 * @return {Request} for chaining\n\
 * @api public\n\
 */\n\
\n\
Request.prototype.type = function(type){\n\
  this.set('Content-Type', request.types[type] || type);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Set Authorization field value with `user` and `pass`.\n\
 *\n\
 * @param {String} user\n\
 * @param {String} pass\n\
 * @return {Request} for chaining\n\
 * @api public\n\
 */\n\
\n\
Request.prototype.auth = function(user, pass){\n\
  var str = btoa(user + ':' + pass);\n\
  this.set('Authorization', 'Basic ' + str);\n\
  return this;\n\
};\n\
\n\
/**\n\
* Add query-string `val`.\n\
*\n\
* Examples:\n\
*\n\
*   request.get('/shoes')\n\
*     .query('size=10')\n\
*     .query({ color: 'blue' })\n\
*\n\
* @param {Object|String} val\n\
* @return {Request} for chaining\n\
* @api public\n\
*/\n\
\n\
Request.prototype.query = function(val){\n\
  if ('string' != typeof val) val = serialize(val);\n\
  if (val) this._query.push(val);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Send `data`, defaulting the `.type()` to \"json\" when\n\
 * an object is given.\n\
 *\n\
 * Examples:\n\
 *\n\
 *       // querystring\n\
 *       request.get('/search')\n\
 *         .end(callback)\n\
 *\n\
 *       // multiple data \"writes\"\n\
 *       request.get('/search')\n\
 *         .send({ search: 'query' })\n\
 *         .send({ range: '1..5' })\n\
 *         .send({ order: 'desc' })\n\
 *         .end(callback)\n\
 *\n\
 *       // manual json\n\
 *       request.post('/user')\n\
 *         .type('json')\n\
 *         .send('{\"name\":\"tj\"})\n\
 *         .end(callback)\n\
 *\n\
 *       // auto json\n\
 *       request.post('/user')\n\
 *         .send({ name: 'tj' })\n\
 *         .end(callback)\n\
 *\n\
 *       // manual x-www-form-urlencoded\n\
 *       request.post('/user')\n\
 *         .type('form')\n\
 *         .send('name=tj')\n\
 *         .end(callback)\n\
 *\n\
 *       // auto x-www-form-urlencoded\n\
 *       request.post('/user')\n\
 *         .type('form')\n\
 *         .send({ name: 'tj' })\n\
 *         .end(callback)\n\
 *\n\
 *       // defaults to x-www-form-urlencoded\n\
  *      request.post('/user')\n\
  *        .send('name=tobi')\n\
  *        .send('species=ferret')\n\
  *        .end(callback)\n\
 *\n\
 * @param {String|Object} data\n\
 * @return {Request} for chaining\n\
 * @api public\n\
 */\n\
\n\
Request.prototype.send = function(data){\n\
  var obj = isObject(data);\n\
  var type = this.getHeader('Content-Type');\n\
\n\
  // merge\n\
  if (obj && isObject(this._data)) {\n\
    for (var key in data) {\n\
      this._data[key] = data[key];\n\
    }\n\
  } else if ('string' == typeof data) {\n\
    if (!type) this.type('form');\n\
    type = this.getHeader('Content-Type');\n\
    if ('application/x-www-form-urlencoded' == type) {\n\
      this._data = this._data\n\
        ? this._data + '&' + data\n\
        : data;\n\
    } else {\n\
      this._data = (this._data || '') + data;\n\
    }\n\
  } else {\n\
    this._data = data;\n\
  }\n\
\n\
  if (!obj) return this;\n\
  if (!type) this.type('json');\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Invoke the callback with `err` and `res`\n\
 * and handle arity check.\n\
 *\n\
 * @param {Error} err\n\
 * @param {Response} res\n\
 * @api private\n\
 */\n\
\n\
Request.prototype.callback = function(err, res){\n\
  var fn = this._callback;\n\
  if (2 == fn.length) return fn(err, res);\n\
  if (err) return this.emit('error', err);\n\
  fn(res);\n\
};\n\
\n\
/**\n\
 * Invoke callback with x-domain error.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
Request.prototype.crossDomainError = function(){\n\
  var err = new Error('Origin is not allowed by Access-Control-Allow-Origin');\n\
  err.crossDomain = true;\n\
  this.callback(err);\n\
};\n\
\n\
/**\n\
 * Invoke callback with timeout error.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
Request.prototype.timeoutError = function(){\n\
  var timeout = this._timeout;\n\
  var err = new Error('timeout of ' + timeout + 'ms exceeded');\n\
  err.timeout = timeout;\n\
  this.callback(err);\n\
};\n\
\n\
/**\n\
 * Enable transmission of cookies with x-domain requests.\n\
 *\n\
 * Note that for this to work the origin must not be\n\
 * using \"Access-Control-Allow-Origin\" with a wildcard,\n\
 * and also must set \"Access-Control-Allow-Credentials\"\n\
 * to \"true\".\n\
 *\n\
 * @api public\n\
 */\n\
\n\
Request.prototype.withCredentials = function(){\n\
  this._withCredentials = true;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Initiate request, invoking callback `fn(res)`\n\
 * with an instanceof `Response`.\n\
 *\n\
 * @param {Function} fn\n\
 * @return {Request} for chaining\n\
 * @api public\n\
 */\n\
\n\
Request.prototype.end = function(fn){\n\
  var self = this;\n\
  var xhr = this.xhr = getXHR();\n\
  var query = this._query.join('&');\n\
  var timeout = this._timeout;\n\
  var data = this._data;\n\
\n\
  // store callback\n\
  this._callback = fn || noop;\n\
\n\
  // CORS\n\
  if (this._withCredentials) xhr.withCredentials = true;\n\
\n\
  // state change\n\
  xhr.onreadystatechange = function(){\n\
    if (4 != xhr.readyState) return;\n\
    if (0 == xhr.status) {\n\
      if (self.aborted) return self.timeoutError();\n\
      return self.crossDomainError();\n\
    }\n\
    self.emit('end');\n\
  };\n\
\n\
  // progress\n\
  if (xhr.upload) {\n\
    xhr.upload.onprogress = function(e){\n\
      e.percent = e.loaded / e.total * 100;\n\
      self.emit('progress', e);\n\
    };\n\
  }\n\
\n\
  // timeout\n\
  if (timeout && !this._timer) {\n\
    this._timer = setTimeout(function(){\n\
      self.abort();\n\
    }, timeout);\n\
  }\n\
\n\
  // querystring\n\
  if (query) {\n\
    query = request.serializeObject(query);\n\
    this.url += ~this.url.indexOf('?')\n\
      ? '&' + query\n\
      : '?' + query;\n\
  }\n\
\n\
  // initiate request\n\
  xhr.open(this.method, this.url, true);\n\
\n\
  // body\n\
  if ('GET' != this.method && 'HEAD' != this.method && 'string' != typeof data && !isHost(data)) {\n\
    // serialize stuff\n\
    var serialize = request.serialize[this.getHeader('Content-Type')];\n\
    if (serialize) data = serialize(data);\n\
  }\n\
\n\
  // set header fields\n\
  for (var field in this.header) {\n\
    if (null == this.header[field]) continue;\n\
    xhr.setRequestHeader(field, this.header[field]);\n\
  }\n\
\n\
  // send stuff\n\
  xhr.send(data);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Expose `Request`.\n\
 */\n\
\n\
request.Request = Request;\n\
\n\
/**\n\
 * Issue a request:\n\
 *\n\
 * Examples:\n\
 *\n\
 *    request('GET', '/users').end(callback)\n\
 *    request('/users').end(callback)\n\
 *    request('/users', callback)\n\
 *\n\
 * @param {String} method\n\
 * @param {String|Function} url or callback\n\
 * @return {Request}\n\
 * @api public\n\
 */\n\
\n\
function request(method, url) {\n\
  // callback\n\
  if ('function' == typeof url) {\n\
    return new Request('GET', method).end(url);\n\
  }\n\
\n\
  // url first\n\
  if (1 == arguments.length) {\n\
    return new Request('GET', method);\n\
  }\n\
\n\
  return new Request(method, url);\n\
}\n\
\n\
/**\n\
 * GET `url` with optional callback `fn(res)`.\n\
 *\n\
 * @param {String} url\n\
 * @param {Mixed|Function} data or fn\n\
 * @param {Function} fn\n\
 * @return {Request}\n\
 * @api public\n\
 */\n\
\n\
request.get = function(url, data, fn){\n\
  var req = request('GET', url);\n\
  if ('function' == typeof data) fn = data, data = null;\n\
  if (data) req.query(data);\n\
  if (fn) req.end(fn);\n\
  return req;\n\
};\n\
\n\
/**\n\
 * GET `url` with optional callback `fn(res)`.\n\
 *\n\
 * @param {String} url\n\
 * @param {Mixed|Function} data or fn\n\
 * @param {Function} fn\n\
 * @return {Request}\n\
 * @api public\n\
 */\n\
\n\
request.head = function(url, data, fn){\n\
  var req = request('HEAD', url);\n\
  if ('function' == typeof data) fn = data, data = null;\n\
  if (data) req.send(data);\n\
  if (fn) req.end(fn);\n\
  return req;\n\
};\n\
\n\
/**\n\
 * DELETE `url` with optional callback `fn(res)`.\n\
 *\n\
 * @param {String} url\n\
 * @param {Function} fn\n\
 * @return {Request}\n\
 * @api public\n\
 */\n\
\n\
request.del = function(url, fn){\n\
  var req = request('DELETE', url);\n\
  if (fn) req.end(fn);\n\
  return req;\n\
};\n\
\n\
/**\n\
 * PATCH `url` with optional `data` and callback `fn(res)`.\n\
 *\n\
 * @param {String} url\n\
 * @param {Mixed} data\n\
 * @param {Function} fn\n\
 * @return {Request}\n\
 * @api public\n\
 */\n\
\n\
request.patch = function(url, data, fn){\n\
  var req = request('PATCH', url);\n\
  if ('function' == typeof data) fn = data, data = null;\n\
  if (data) req.send(data);\n\
  if (fn) req.end(fn);\n\
  return req;\n\
};\n\
\n\
/**\n\
 * POST `url` with optional `data` and callback `fn(res)`.\n\
 *\n\
 * @param {String} url\n\
 * @param {Mixed} data\n\
 * @param {Function} fn\n\
 * @return {Request}\n\
 * @api public\n\
 */\n\
\n\
request.post = function(url, data, fn){\n\
  var req = request('POST', url);\n\
  if ('function' == typeof data) fn = data, data = null;\n\
  if (data) req.send(data);\n\
  if (fn) req.end(fn);\n\
  return req;\n\
};\n\
\n\
/**\n\
 * PUT `url` with optional `data` and callback `fn(res)`.\n\
 *\n\
 * @param {String} url\n\
 * @param {Mixed|Function} data or fn\n\
 * @param {Function} fn\n\
 * @return {Request}\n\
 * @api public\n\
 */\n\
\n\
request.put = function(url, data, fn){\n\
  var req = request('PUT', url);\n\
  if ('function' == typeof data) fn = data, data = null;\n\
  if (data) req.send(data);\n\
  if (fn) req.end(fn);\n\
  return req;\n\
};\n\
\n\
/**\n\
 * Expose `request`.\n\
 */\n\
\n\
module.exports = request;\n\
//@ sourceURL=visionmedia-superagent/lib/client.js"
));
require.register("segmentio-model/lib/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var proto = require('./proto')\n\
  , statics = require('./static')\n\
  , Emitter = require('emitter');\n\
\n\
/**\n\
 * Expose `createModel`.\n\
 */\n\
\n\
module.exports = createModel;\n\
\n\
/**\n\
 * Create a new model constructor with the given `name`.\n\
 *\n\
 * @param {String} name\n\
 * @return {Function}\n\
 * @api public\n\
 */\n\
\n\
function createModel(name) {\n\
  if ('string' != typeof name) throw new TypeError('model name required');\n\
\n\
  /**\n\
   * Initialize a new model with the given `attrs`.\n\
   *\n\
   * @param {Object} attrs\n\
   * @api public\n\
   */\n\
\n\
  function model(attrs) {\n\
    if (!(this instanceof model)) return new model(attrs);\n\
    attrs = attrs || {};\n\
    this._callbacks = {};\n\
    this.attrs = attrs;\n\
    this.dirty = attrs;\n\
    this.model.emit('construct', this, attrs);\n\
  }\n\
\n\
  // mixin emitter\n\
\n\
  Emitter(model);\n\
\n\
  // statics\n\
\n\
  model.modelName = name;\n\
  model.base = '/' + name.toLowerCase();\n\
  model.attrs = {};\n\
  model.validators = [];\n\
  for (var key in statics) model[key] = statics[key];\n\
\n\
  // prototype\n\
\n\
  model.prototype = {};\n\
  model.prototype.model = model;\n\
  for (var key in proto) model.prototype[key] = proto[key];\n\
\n\
  return model;\n\
}\n\
\n\
//@ sourceURL=segmentio-model/lib/index.js"
));
require.register("segmentio-model/lib/static.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var request = require('superagent')\n\
  , Collection = require('collection')\n\
  , noop = function(){};\n\
\n\
/**\n\
 * Construct a url to the given `path`.\n\
 *\n\
 * Example:\n\
 *\n\
 *    User.url('add')\n\
 *    // => \"/users/add\"\n\
 *\n\
 * @param {String} path\n\
 * @return {String}\n\
 * @api public\n\
 */\n\
\n\
exports.url = function(path){\n\
  var url = this.base;\n\
  if (0 == arguments.length) return url;\n\
  return url + '/' + path;\n\
};\n\
\n\
/**\n\
 * Add validation `fn()`.\n\
 *\n\
 * @param {Function} fn\n\
 * @return {Function} self\n\
 * @api public\n\
 */\n\
\n\
exports.validate = function(fn){\n\
  this.validators.push(fn);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Use the given plugin `fn()`.\n\
 *\n\
 * @param {Function} fn\n\
 * @return {Function} self\n\
 * @api public\n\
 */\n\
\n\
exports.use = function(fn){\n\
  fn(this);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Define attr with the given `name` and `options`.\n\
 *\n\
 * @param {String} name\n\
 * @param {Object} options\n\
 * @return {Function} self\n\
 * @api public\n\
 */\n\
\n\
exports.attr = function(name, options){\n\
  this.attrs[name] = options || {};\n\
\n\
  // implied pk\n\
  if ('_id' == name || 'id' == name) {\n\
    this.attrs[name].primaryKey = true;\n\
    this.primaryKey = name;\n\
  }\n\
\n\
  // getter / setter method\n\
  this.prototype[name] = function(val){\n\
    if (0 == arguments.length) return this.attrs[name];\n\
    var prev = this.attrs[name];\n\
    this.dirty[name] = val;\n\
    this.attrs[name] = val;\n\
    this.model.emit('change', this, name, val, prev);\n\
    this.model.emit('change ' + name, this, val, prev);\n\
    this.emit('change', name, val, prev);\n\
    this.emit('change ' + name, val, prev);\n\
    return this;\n\
  };\n\
\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Remove all and invoke `fn(err)`.\n\
 *\n\
 * @param {Function} [fn]\n\
 * @api public\n\
 */\n\
\n\
exports.removeAll = function(fn){\n\
  fn = fn || noop;\n\
  var self = this;\n\
  var url = this.url('all');\n\
  request.del(url, function(res){\n\
    if (res.error) return fn(error(res));\n\
    fn();\n\
  });\n\
};\n\
\n\
/**\n\
 * Get all and invoke `fn(err, array)`.\n\
 *\n\
 * @param {Function} fn\n\
 * @api public\n\
 */\n\
\n\
exports.all = function(fn){\n\
  var self = this;\n\
  var url = this.url('all');\n\
  request.get(url, function(res){\n\
    if (res.error) return fn(error(res));\n\
    var col = new Collection;\n\
    for (var i = 0, len = res.body.length; i < len; ++i) {\n\
      col.push(new self(res.body[i]));\n\
    }\n\
    fn(null, col);\n\
  });\n\
};\n\
\n\
/**\n\
 * Get `id` and invoke `fn(err, model)`.\n\
 *\n\
 * @param {Mixed} id\n\
 * @param {Function} fn\n\
 * @api public\n\
 */\n\
\n\
exports.get = function(id, fn){\n\
  var self = this;\n\
  var url = this.url(id);\n\
  request.get(url, function(res){\n\
    if (res.error) return fn(error(res));\n\
    var model = new self(res.body);\n\
    fn(null, model);\n\
  });\n\
};\n\
\n\
/**\n\
 * Response error helper.\n\
 *\n\
 * @param {Response} er\n\
 * @return {Error}\n\
 * @api private\n\
 */\n\
\n\
function error(res) {\n\
  return new Error('got ' + res.status + ' response');\n\
}\n\
//@ sourceURL=segmentio-model/lib/static.js"
));
require.register("segmentio-model/lib/proto.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var Emitter = require('emitter')\n\
  , request = require('superagent')\n\
  , clone = require('clone')\n\
  , each = require('each')\n\
  , noop = function(){};\n\
\n\
/**\n\
 * Mixin emitter.\n\
 */\n\
\n\
Emitter(exports);\n\
\n\
/**\n\
 * Register an error `msg` on `attr`.\n\
 *\n\
 * @param {String} attr\n\
 * @param {String} msg\n\
 * @return {Object} self\n\
 * @api public\n\
 */\n\
\n\
exports.error = function(attr, msg){\n\
  this.errors.push({\n\
    attr: attr,\n\
    message: msg\n\
  });\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Check if this model is new.\n\
 *\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
exports.isNew = function(){\n\
  var key = this.model.primaryKey;\n\
  return ! this.has(key);\n\
};\n\
\n\
/**\n\
 * Get / set the primary key.\n\
 *\n\
 * @param {Mixed} val\n\
 * @return {Mixed}\n\
 * @api public\n\
 */\n\
\n\
exports.primary = function(val){\n\
  var key = this.model.primaryKey;\n\
  if (0 == arguments.length) return this[key]();\n\
  return this[key](val);\n\
};\n\
\n\
/**\n\
 * Validate the model and return a boolean.\n\
 *\n\
 * Example:\n\
 *\n\
 *    user.isValid()\n\
 *    // => false\n\
 *\n\
 *    user.errors\n\
 *    // => [{ attr: ..., message: ... }]\n\
 *\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
exports.isValid = function(){\n\
  this.validate();\n\
  return 0 == this.errors.length;\n\
};\n\
\n\
/**\n\
 * Return `false` or an object\n\
 * containing the \"dirty\" attributes.\n\
 *\n\
 * Optionally check for a specific `attr`.\n\
 *\n\
 * @param {String} [attr]\n\
 * @return {Object|Boolean}\n\
 * @api public\n\
 */\n\
\n\
exports.changed = function(attr){\n\
  var dirty = this.dirty;\n\
  if (Object.keys(dirty).length) {\n\
    if (attr) return !! dirty[attr];\n\
    return dirty;\n\
  }\n\
  return false;\n\
};\n\
\n\
/**\n\
 * Perform validations.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
exports.validate = function(){\n\
  var self = this;\n\
  var fns = this.model.validators;\n\
  this.errors = [];\n\
  each(fns, function(fn){ fn(self) });\n\
};\n\
\n\
/**\n\
 * Destroy the model and mark it as `.removed`\n\
 * and invoke `fn(err)`.\n\
 *\n\
 * Events:\n\
 *\n\
 *  - `removing` before deletion\n\
 *  - `remove` on deletion\n\
 *\n\
 * @param {Function} [fn]\n\
 * @api public\n\
 */\n\
\n\
exports.destroy =\n\
exports.remove = function(fn){\n\
  fn = fn || noop;\n\
  if (this.isNew()) return fn(new Error('not saved'));\n\
  var self = this;\n\
  var url = this.url();\n\
  this.model.emit('removing', this);\n\
  this.emit('removing');\n\
  request.del(url, function(res){\n\
    if (res.error) return fn(error(res));\n\
    self.removed = true;\n\
    self.model.emit('remove', self);\n\
    self.emit('remove');\n\
    fn();\n\
  });\n\
};\n\
\n\
/**\n\
 * Save and invoke `fn(err)`.\n\
 *\n\
 * Events:\n\
 *\n\
 *  - `saving` pre-update or save, after validation\n\
 *  - `save` on updates and saves\n\
 *\n\
 * @param {Function} [fn]\n\
 * @api public\n\
 */\n\
\n\
exports.save = function(fn){\n\
  if (!this.isNew()) return this.update(fn);\n\
  var self = this;\n\
  var url = this.model.url();\n\
  fn = fn || noop;\n\
  if (!this.isValid()) return fn(new Error('validation failed'));\n\
  this.model.emit('saving', this);\n\
  this.emit('saving');\n\
  request.post(url, self, function(res){\n\
    if (res.error) return fn(error(res));\n\
    if (res.body) self.primary(res.body.id);\n\
    self.dirty = {};\n\
    self.model.emit('save', self);\n\
    self.emit('save');\n\
    fn();\n\
  });\n\
};\n\
\n\
/**\n\
 * Update and invoke `fn(err)`.\n\
 *\n\
 * @param {Function} [fn]\n\
 * @api private\n\
 */\n\
\n\
exports.update = function(fn){\n\
  var self = this;\n\
  var url = this.url();\n\
  fn = fn || noop;\n\
  if (!this.isValid()) return fn(new Error('validation failed'));\n\
  this.model.emit('saving', this);\n\
  this.emit('saving');\n\
  request.put(url, self, function(res){\n\
    if (res.error) return fn(error(res));\n\
    self.dirty = {};\n\
    self.model.emit('save', self);\n\
    self.emit('save');\n\
    fn();\n\
  });\n\
};\n\
\n\
/**\n\
 * Return a url for `path` relative to this model.\n\
 *\n\
 * Example:\n\
 *\n\
 *    var user = new User({ id: 5 });\n\
 *    user.url('edit');\n\
 *    // => \"/users/5/edit\"\n\
 *\n\
 * @param {String} path\n\
 * @return {String}\n\
 * @api public\n\
 */\n\
\n\
exports.url = function(path){\n\
  var model = this.model;\n\
  var url = model.base;\n\
  var id = this.primary();\n\
  if (0 == arguments.length) return url + '/' + id;\n\
  return url + '/' + id + '/' + path;\n\
};\n\
\n\
/**\n\
 * Set multiple `attrs`.\n\
 *\n\
 * @param {Object} attrs\n\
 * @return {Object} self\n\
 * @api public\n\
 */\n\
\n\
exports.set = function(attrs){\n\
  for (var key in attrs) {\n\
    this[key](attrs[key]);\n\
  }\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Get `attr` value.\n\
 *\n\
 * @param {String} attr\n\
 * @return {Mixed}\n\
 * @api public\n\
 */\n\
\n\
exports.get = function(attr){\n\
  return this.attrs[attr];\n\
};\n\
\n\
/**\n\
 * Check if `attr` is present (not `null` or `undefined`).\n\
 *\n\
 * @param {String} attr\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
exports.has = function(attr){\n\
  return null != this.attrs[attr];\n\
};\n\
\n\
/**\n\
 * Return the JSON representation of the model.\n\
 *\n\
 * @return {Object}\n\
 * @api public\n\
 */\n\
\n\
exports.toJSON = function(){\n\
  return clone(this.attrs);\n\
};\n\
\n\
/**\n\
 * Response error helper.\n\
 *\n\
 * @param {Response} er\n\
 * @return {Error}\n\
 * @api private\n\
 */\n\
\n\
function error(res) {\n\
  return new Error('got ' + res.status + ' response');\n\
}//@ sourceURL=segmentio-model/lib/proto.js"
));
require.register("segmentio-model-defaults/index.js", Function("exports, require, module",
"\n\
var clone = require('clone')\n\
  , each = require('each')\n\
  , type = require('type');\n\
\n\
\n\
/**\n\
 * Plugin.\n\
 *\n\
 * @param {Function|Object} values  The default values dictionary or the Model.\n\
 */\n\
\n\
module.exports = function (values) {\n\
  if ('object' === type(values)) {\n\
    return function (Model) {\n\
      bind(Model, values);\n\
    };\n\
  } else {\n\
    return bind(values);\n\
  }\n\
};\n\
\n\
\n\
/**\n\
 * Bind to the model's construct event.\n\
 *\n\
 * @param {Function} Model  The model constructor.\n\
 */\n\
\n\
function bind (Model, defaults) {\n\
  defaults || (defaults = {});\n\
  Model.on('construct', function (model, attrs) {\n\
    each(Model.attrs, function (key, options) {\n\
      var value = undefined != options.default\n\
        ? options.default\n\
        : defaults[key];\n\
\n\
      if (value !== undefined) apply(model, key, value);\n\
    });\n\
  });\n\
}\n\
\n\
\n\
/**\n\
 * Default a `model` with a `value` for a `key` if it doesn't exist. Use a clone\n\
 * of the value, so that they it's easy to declare objects and arrays without\n\
 * worrying about copying by reference.\n\
 *\n\
 * @param {Model}          model  The model.\n\
 * @param {String}         key    The key to back by a default.\n\
 * @param {Mixed|Function} value  The default value to use.\n\
 */\n\
\n\
function apply (model, key, value) {\n\
  if ('function' === type(value)) value = value();\n\
  if (!model.attrs[key]) model.attrs[key] = clone(value);\n\
}\n\
//@ sourceURL=segmentio-model-defaults/index.js"
));
require.register("segmentio-model-firebase/index.js", Function("exports, require, module",
"\n\
var statics = require('./statics')\n\
  , protos = require('./protos');\n\
\n\
\n\
/**\n\
 * Mixin our plugin.\n\
 */\n\
\n\
module.exports = function (url) {\n\
  return function (Model) {\n\
    Model.firebase = new window.Firebase(url);\n\
    for (var key in statics) Model[key] = statics[key];\n\
    for (var key in protos) Model.prototype[key] = protos[key];\n\
    Model.on('construct', construct);\n\
  };\n\
};\n\
\n\
\n\
/**\n\
 * On construct, start listening for firebase changes.\n\
 */\n\
\n\
function construct (model, attrs) {\n\
  model.firebase().on('value', function (snapshot) {\n\
    var attrs = snapshot.val();\n\
    if (attrs) model.set(attrs);\n\
  });\n\
}//@ sourceURL=segmentio-model-firebase/index.js"
));
require.register("segmentio-model-firebase/statics.js", Function("exports, require, module",
"\n\
var Collection = require('collection')\n\
  , noop = function(){};\n\
\n\
\n\
/**\n\
 * `url` doesn't apply for firebase.\n\
 */\n\
\n\
exports.url = noop;\n\
\n\
/**\n\
 * Remove all and invoke `fn(err)`.\n\
 *\n\
 * @param {Function} [fn]\n\
 * @api public\n\
 */\n\
\n\
exports.removeAll = function(fn){\n\
  fn = fn || noop;\n\
  this.firebase.remove(function (err) {\n\
    if (err) return fn(err);\n\
    fn();\n\
  });\n\
};\n\
\n\
/**\n\
 * Get all and invoke `fn(err, array)`.\n\
 *\n\
 * @param {Function} fn\n\
 * @api public\n\
 */\n\
\n\
exports.all = function(fn){\n\
  var self = this;\n\
  var col = new Collection();\n\
  this.firebase.once('value', function (snapshot) {\n\
    snapshot.forEach(function (child) {\n\
      var attrs = child.val();\n\
      if (attrs) col.push(new self(attrs));\n\
    });\n\
    fn(null, col);\n\
  });\n\
};\n\
\n\
/**\n\
 * Get `id` and invoke `fn(err, model)`.\n\
 *\n\
 * @param {String} id\n\
 * @param {Function} fn\n\
 * @api public\n\
 */\n\
\n\
exports.get = function(id, fn){\n\
  if (!id) return fn(new Error('no model'));\n\
  var self = this;\n\
  this.firebase.child(id).once('value', function (snapshot) {\n\
    var attrs = snapshot.val();\n\
    if (!attrs) return fn(new Error('no model'));\n\
    var model = new self(attrs);\n\
    fn(null, model);\n\
  });\n\
};//@ sourceURL=segmentio-model-firebase/statics.js"
));
require.register("segmentio-model-firebase/protos.js", Function("exports, require, module",
"\n\
var noop = function(){};\n\
\n\
\n\
/**\n\
 * `url` doesn't apply for firebase.\n\
 */\n\
\n\
exports.url = noop;\n\
\n\
/**\n\
 * Returns this model's firebase.\n\
 *\n\
 * @return {Firebase} - Your Firebase reference.\n\
 * @api public\n\
 */\n\
\n\
exports.firebase = function () {\n\
  var firebase = this.model.firebase;\n\
  if (!firebase) throw new Error('no firebase');\n\
  return firebase.child(this.primary());\n\
};\n\
\n\
/**\n\
 * Destroy the model and mark it as `.removed`\n\
 * and invoke `fn(err)`.\n\
 *\n\
 * @param {Function} [fn] - Callback.\n\
 * @api public\n\
 */\n\
\n\
exports.destroy =\n\
exports.remove = function (fn) {\n\
  fn = fn || noop;\n\
  if (this.isNew()) return fn(new Error('not saved'));\n\
  var firebase = this.firebase();\n\
  var self = this;\n\
  this.model.emit('removing', this);\n\
  this.emit('removing');\n\
  firebase.remove(function (err) {\n\
    if (err) return fn(err);\n\
    self.removed = true;\n\
    self.model.emit('remove', self);\n\
    self.emit('remove');\n\
    fn();\n\
  });\n\
};\n\
\n\
/**\n\
 * Save and invoke `fn(err)`.\n\
 *\n\
 * @param {Function} [fn] - Callback.\n\
 * @api public\n\
 */\n\
\n\
exports.save  = function (fn) {\n\
  if (!this.isNew()) return this.update(fn);\n\
  var self = this;\n\
  var firebase = this.firebase();\n\
  fn = fn || noop;\n\
  if (!this.isValid()) return fn(new Error('validation failed'));\n\
  this.model.emit('saving', this);\n\
  this.emit('saving');\n\
  firebase.set(self.attrs, function (err) {\n\
    if (err) return fn(err);\n\
    self.dirty = {};\n\
    self.model.emit('save', self);\n\
    self.emit('save');\n\
    fn();\n\
  });\n\
};\n\
\n\
/**\n\
 * Update and invoke `fn(err)`.\n\
 *\n\
 * @param {Function} [fn] - Callback.\n\
 * @api public\n\
 */\n\
\n\
exports.update = function (fn) {\n\
  var self = this;\n\
  var firebase = this.firebase();\n\
  fn = fn || noop;\n\
  if (!this.isValid()) return fn(new Error('validation failed'));\n\
  this.model.emit('saving', this);\n\
  this.emit('saving');\n\
  firebase.update(self.attrs, function (err) {\n\
    if (err) return fn(err);\n\
    self.dirty = {};\n\
    self.model.emit('save', self);\n\
    self.emit('save');\n\
    fn();\n\
  });\n\
};//@ sourceURL=segmentio-model-firebase/protos.js"
));
require.register("segmentio-model-memoize/index.js", Function("exports, require, module",
"\n\
var each = require('each')\n\
  , type = require('type')\n\
  , bind = require('bind');\n\
\n\
\n\
/**\n\
 * Plugin.\n\
 *\n\
 * @param {Function|Object} models  The models to warm the cache with or the\n\
 *                                  Model constructor for the plugin.\n\
 */\n\
\n\
module.exports = function (models) {\n\
  // just the plugin\n\
  if ('function' === type(models)) return new Memoizer(models);\n\
\n\
  // warming cache with models\n\
  return function (Model) {\n\
    new Memoizer(Model, models);\n\
  };\n\
};\n\
\n\
\n\
/**\n\
 * Initialize a new `Memoizer`.\n\
 *\n\
 * @param {Model} Model   The Model constructor to memoize.\n\
 * @param {Array} models  Optional array of models to warm the cache with.\n\
 */\n\
\n\
function Memoizer (Model, models) {\n\
  this.Model = Model;\n\
  this._get = bind(Model, Model.get);\n\
  Model.get = bind(this, this.get);\n\
\n\
  var cache = this.cache = {};\n\
  if (models) each(models, function (attrs) {\n\
    var model = new Model(attrs);\n\
    cache[model.primary()] = model;\n\
  });\n\
}\n\
\n\
\n\
/**\n\
 * Check the cache before getting a model from the server.\n\
 *\n\
 * @param {String}   id        The primary key for the model.\n\
 * @param {Function} callback  Called with `err, model`.\n\
 */\n\
\n\
Memoizer.prototype.get = function (id, callback) {\n\
  var cache = this.cache;\n\
  if (cache[id]) return callback(null, cache[id]);\n\
\n\
  this._get(id, function (err, model) {\n\
    if (err) return callback(err);\n\
    cache[model.primary()] = model;\n\
    callback(null, model);\n\
  });\n\
};\n\
//@ sourceURL=segmentio-model-memoize/index.js"
));
require.register("document/index.js", Function("exports, require, module",
"\n\
var defaults = require('model-defaults')\n\
  , firebase = require('model-firebase')('https://socrates.firebaseio.com/documents/')\n\
  , memoize = require('model-memoize')\n\
  , model = require('model')\n\
  , uid = require('uid');\n\
\n\
\n\
/**\n\
 * Document.\n\
 */\n\
\n\
var Document = module.exports = model('document')\n\
  .use(defaults)\n\
  .use(firebase)\n\
  .use(memoize)\n\
  .attr('id', { default : function () { return uid(); } })\n\
  .attr('created', { default : function () { return new Date(); } })\n\
  .attr('title', { default : '' })\n\
  .attr('body', { default : '' });//@ sourceURL=document/index.js"
));
require.register("boot/browser.js", Function("exports, require, module",
"\n\
var App = require('app')\n\
  , bookmarks = require('bookmarks')\n\
  , Collection = require('collection')\n\
  , Document = require('document')\n\
  , each = require('each')\n\
  , loading = require('loading')\n\
  , Router = require('router')\n\
  , uid = require('uid');\n\
\n\
\n\
/**\n\
 * App.\n\
 */\n\
\n\
var app = new App()\n\
\n\
  .on('remove', function (document) {\n\
    documents.remove(document);\n\
  });\n\
\n\
document.body.appendChild(app.el);\n\
\n\
\n\
/**\n\
 * Documents. Update app and bookmarks when documents change.\n\
 */\n\
\n\
var documents = new Collection()\n\
\n\
  .on('add', function (doc) {\n\
    var id = doc.primary();\n\
    bookmarks.add(id);\n\
    app.add(doc);\n\
  })\n\
\n\
  .on('remove', function (doc) {\n\
    var id = doc.primary();\n\
    bookmarks.remove(id);\n\
  });\n\
\n\
\n\
/**\n\
 * Router.\n\
 */\n\
\n\
var router = new Router();\n\
\n\
router.on('/', function (next) {\n\
  router.go('/' + uid());\n\
});\n\
\n\
router.on('/:document/:state?', begin, doc, state, end);\n\
\n\
router.listen();\n\
\n\
\n\
/**\n\
 * Finally, get the bookmarked documents from Firebase after already requesting\n\
 * the currently active document.\n\
 */\n\
\n\
each(bookmarks(), function (id) {\n\
  get(id);\n\
});\n\
\n\
\n\
/**\n\
 * Put the app in a loading state.\n\
 *\n\
 * @param {Object} context\n\
 * @param {Function} next\n\
 */\n\
\n\
function begin (context, next) {\n\
  context.loaded = loading(app.el);\n\
  next();\n\
}\n\
\n\
\n\
/**\n\
 * Take the app out of a loading state.\n\
 *\n\
 * @param {Object} context\n\
 * @param {Function} next\n\
 */\n\
\n\
function end (context, next) {\n\
  context.loaded && context.loaded();\n\
  next();\n\
}\n\
\n\
\n\
/**\n\
 * Load the current document into the app.\n\
 *\n\
 * @param {Object} context\n\
 * @param {Function} next\n\
 */\n\
\n\
function doc (context, next) {\n\
  get(context.document, function (err, doc) {\n\
    if (err) throw err;\n\
    app.load(doc);\n\
    window.analytics.track('Viewed Document', { id: doc.primary() });\n\
    next();\n\
  });\n\
}\n\
\n\
\n\
/**\n\
 * Apply the current state to the app.\n\
 *\n\
 * @param {Object} context\n\
 * @param {Function} next\n\
 */\n\
\n\
function state (context, next) {\n\
  var state = context.state;\n\
  if (state) app[state]();\n\
  next();\n\
}\n\
\n\
\n\
/**\n\
 * Retrieve a document.\n\
 *\n\
 * @param {String} id\n\
 * @param {Function} callback(err, doc)\n\
 */\n\
\n\
function get (id, callback) {\n\
  Document.get(id, function (err, doc) {\n\
    if (!doc) doc = create();\n\
    if (!documents.has(doc)) documents.add(doc);\n\
    callback && callback(null, doc);\n\
  });\n\
}\n\
\n\
\n\
/**\n\
 * Create a new document.\n\
 *\n\
 * @return {Document}\n\
 */\n\
\n\
function create () {\n\
  var doc = new Document();\n\
  doc.save(); // save to persist the defaults to Firebase\n\
  window.analytics.track('Created New Document', { id: doc.primary() });\n\
  return doc;\n\
}//@ sourceURL=boot/browser.js"
));











































require.register("nav/index.html", Function("exports, require, module",
"module.exports = '<nav class=\"nav\">\\n\
  <form>\\n\
    <input class=\"nav-search\"\\n\
           type=\"search\"\\n\
           placeholder=\"Filter the list&hellip;\"\\n\
           on-keyup=\"onSearch\">\\n\
    <i class=\"nav-search-icon ss-search\"></i>\\n\
  </form>\\n\
  <menu data-replace=\"replaceMenu\"></menu>\\n\
</nav>';//@ sourceURL=nav/index.html"
));
require.register("nav/item.html", Function("exports, require, module",
"module.exports = '<li class=\"menu-item\">\\n\
  <a class=\"menu-item-title\"\\n\
     href=\"/{id}\">{title || \\'Untitled\\'}</a>\\n\
  <a class=\"menu-item-delete-button ss-trash\"\\n\
     title=\"Remove Document from Bookmarks\"\\n\
     on-click=\"onClickDelete\"></a>\\n\
</li>';//@ sourceURL=nav/item.html"
));
require.register("app/index.html", Function("exports, require, module",
"module.exports = '<div class=\"app loading ss-loading\">\\n\
  <div class=\"write\">\\n\
    <div class=\"wrap\">\\n\
      <form>\\n\
        <textarea class=\"input\" placeholder=\"Start writing here&hellip;\"></textarea>\\n\
      </form>\\n\
    </div>\\n\
  </div>\\n\
\\n\
  <div class=\"read\">\\n\
    <div class=\"wrap\">\\n\
      <article class=\"output\"></article>\\n\
    </div>\\n\
  </div>\\n\
\\n\
  <menu type=\"toolbar\" class=\"toolbar\">\\n\
    <div class=\"wrap\">\\n\
\\n\
      <a title=\"Your Documents (Ctrl + Alt + O)\"\\n\
         class=\"nav-button button ss-rows\"\\n\
         on-click=\"onNav\"></a>\\n\
\\n\
      <a href=\"/\"\\n\
         title=\"New Document (Ctrl + Alt + N)\"\\n\
         class=\"add-button button ss-plus\"></a>\\n\
\\n\
      <a title=\"Write Mode (Ctrl + Alt + ⇽)\"\\n\
         class=\"write-button button ss-write\"\\n\
         on-click=\"onWrite\"></a>\\n\
\\n\
    </div>\\n\
    <div class=\"wrap\">\\n\
\\n\
      <a title=\"Read Mode (Ctrl + Alt + ⇾)\"\\n\
         class=\"read-button button ss-view\"\\n\
         on-click=\"onRead\"></a>\\n\
\\n\
    </div>\\n\
  </menu>\\n\
\\n\
  <nav class=\"nav\" data-replace=\"replaceNav\">\\n\
</div>';//@ sourceURL=app/index.html"
));














require.alias("boot/browser.js", "socrates/deps/boot/browser.js");
require.alias("boot/browser.js", "socrates/deps/boot/index.js");
require.alias("boot/browser.js", "boot/index.js");
require.alias("segmentio-collection/index.js", "boot/deps/collection/index.js");
require.alias("component-emitter/index.js", "segmentio-collection/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-enumerable/index.js", "segmentio-collection/deps/enumerable/index.js");
require.alias("component-to-function/index.js", "component-enumerable/deps/to-function/index.js");

require.alias("component-each/index.js", "boot/deps/each/index.js");
require.alias("component-to-function/index.js", "component-each/deps/to-function/index.js");

require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("ianstormtaylor-loading/index.js", "boot/deps/loading/index.js");
require.alias("component-classes/index.js", "ianstormtaylor-loading/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("ianstormtaylor-router/lib/context.js", "boot/deps/router/lib/context.js");
require.alias("ianstormtaylor-router/lib/index.js", "boot/deps/router/lib/index.js");
require.alias("ianstormtaylor-router/lib/route.js", "boot/deps/router/lib/route.js");
require.alias("ianstormtaylor-router/lib/index.js", "boot/deps/router/index.js");
require.alias("component-link-delegate/index.js", "ianstormtaylor-router/deps/link-delegate/index.js");
require.alias("component-link-delegate/index.js", "ianstormtaylor-router/deps/link-delegate/index.js");
require.alias("component-delegate/index.js", "component-link-delegate/deps/delegate/index.js");
require.alias("component-matches-selector/index.js", "component-delegate/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("component-event/index.js", "component-delegate/deps/event/index.js");

require.alias("component-url/index.js", "component-link-delegate/deps/url/index.js");

require.alias("component-link-delegate/index.js", "component-link-delegate/index.js");
require.alias("component-path-to-regexp/index.js", "ianstormtaylor-router/deps/path-to-regexp/index.js");

require.alias("component-url/index.js", "ianstormtaylor-router/deps/url/index.js");

require.alias("ianstormtaylor-history/index.js", "ianstormtaylor-router/deps/history/index.js");

require.alias("yields-prevent/index.js", "ianstormtaylor-router/deps/prevent/index.js");

require.alias("yields-stop/index.js", "ianstormtaylor-router/deps/stop/index.js");

require.alias("ianstormtaylor-router/lib/index.js", "ianstormtaylor-router/index.js");
require.alias("matthewmueller-uid/index.js", "boot/deps/uid/index.js");

require.alias("app/index.js", "boot/deps/app/index.js");
require.alias("app/filters/mathjax.js", "boot/deps/app/filters/mathjax.js");
require.alias("app/filters/rainbow.js", "boot/deps/app/filters/rainbow.js");
require.alias("segmentio-dom/index.js", "app/deps/dom/index.js");
require.alias("component-type/index.js", "segmentio-dom/deps/type/index.js");

require.alias("component-event/index.js", "segmentio-dom/deps/event/index.js");

require.alias("component-delegate/index.js", "segmentio-dom/deps/delegate/index.js");
require.alias("component-matches-selector/index.js", "component-delegate/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("component-event/index.js", "component-delegate/deps/event/index.js");

require.alias("component-indexof/index.js", "segmentio-dom/deps/indexof/index.js");

require.alias("component-domify/index.js", "segmentio-dom/deps/domify/index.js");

require.alias("component-classes/index.js", "segmentio-dom/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-css/index.js", "segmentio-dom/deps/css/index.js");

require.alias("component-sort/index.js", "segmentio-dom/deps/sort/index.js");

require.alias("component-value/index.js", "segmentio-dom/deps/value/index.js");
require.alias("component-value/index.js", "segmentio-dom/deps/value/index.js");
require.alias("component-type/index.js", "component-value/deps/type/index.js");

require.alias("component-value/index.js", "component-value/index.js");
require.alias("component-query/index.js", "segmentio-dom/deps/query/index.js");

require.alias("component-domify/index.js", "app/deps/domify/index.js");

require.alias("component-emitter/index.js", "app/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-mousetrap/index.js", "app/deps/mousetrap/index.js");

require.alias("ianstormtaylor-reactive/lib/index.js", "app/deps/reactive/lib/index.js");
require.alias("ianstormtaylor-reactive/lib/utils.js", "app/deps/reactive/lib/utils.js");
require.alias("ianstormtaylor-reactive/lib/text-binding.js", "app/deps/reactive/lib/text-binding.js");
require.alias("ianstormtaylor-reactive/lib/attr-binding.js", "app/deps/reactive/lib/attr-binding.js");
require.alias("ianstormtaylor-reactive/lib/binding.js", "app/deps/reactive/lib/binding.js");
require.alias("ianstormtaylor-reactive/lib/bindings.js", "app/deps/reactive/lib/bindings.js");
require.alias("ianstormtaylor-reactive/lib/adapter.js", "app/deps/reactive/lib/adapter.js");
require.alias("ianstormtaylor-reactive/lib/index.js", "app/deps/reactive/index.js");
require.alias("component-format-parser/index.js", "ianstormtaylor-reactive/deps/format-parser/index.js");

require.alias("component-props/index.js", "ianstormtaylor-reactive/deps/props/index.js");
require.alias("component-props/index.js", "ianstormtaylor-reactive/deps/props/index.js");
require.alias("component-props/index.js", "component-props/index.js");
require.alias("visionmedia-debug/index.js", "ianstormtaylor-reactive/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "ianstormtaylor-reactive/deps/debug/debug.js");

require.alias("component-event/index.js", "ianstormtaylor-reactive/deps/event/index.js");

require.alias("component-classes/index.js", "ianstormtaylor-reactive/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-query/index.js", "ianstormtaylor-reactive/deps/query/index.js");

require.alias("ianstormtaylor-reactive/lib/index.js", "ianstormtaylor-reactive/index.js");
require.alias("segmentio-mathjax/MathJax.js", "app/deps/mathjax/MathJax.js");
require.alias("segmentio-mathjax/MathJax.js", "app/deps/mathjax/index.js");
require.alias("segmentio-mathjax/MathJax.js", "segmentio-mathjax/index.js");
require.alias("segmentio-menu/lib/index.js", "app/deps/menu/lib/index.js");
require.alias("segmentio-menu/lib/item.js", "app/deps/menu/lib/item.js");
require.alias("segmentio-menu/lib/protos.js", "app/deps/menu/lib/protos.js");
require.alias("segmentio-menu/lib/statics.js", "app/deps/menu/lib/statics.js");
require.alias("segmentio-menu/lib/template.js", "app/deps/menu/lib/template.js");
require.alias("segmentio-menu/lib/index.js", "app/deps/menu/index.js");
require.alias("component-dom/index.js", "segmentio-menu/deps/dom/index.js");
require.alias("component-type/index.js", "component-dom/deps/type/index.js");

require.alias("component-event/index.js", "component-dom/deps/event/index.js");

require.alias("component-delegate/index.js", "component-dom/deps/delegate/index.js");
require.alias("component-matches-selector/index.js", "component-delegate/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("component-event/index.js", "component-delegate/deps/event/index.js");

require.alias("component-indexof/index.js", "component-dom/deps/indexof/index.js");

require.alias("component-domify/index.js", "component-dom/deps/domify/index.js");

require.alias("component-classes/index.js", "component-dom/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-css/index.js", "component-dom/deps/css/index.js");

require.alias("component-sort/index.js", "component-dom/deps/sort/index.js");

require.alias("component-value/index.js", "component-dom/deps/value/index.js");
require.alias("component-value/index.js", "component-dom/deps/value/index.js");
require.alias("component-type/index.js", "component-value/deps/type/index.js");

require.alias("component-value/index.js", "component-value/index.js");
require.alias("component-query/index.js", "component-dom/deps/query/index.js");

require.alias("component-domify/index.js", "segmentio-menu/deps/domify/index.js");

require.alias("component-emitter/index.js", "segmentio-menu/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-inherit/index.js", "segmentio-menu/deps/inherit/index.js");

require.alias("component-reactive/lib/index.js", "segmentio-menu/deps/reactive/lib/index.js");
require.alias("component-reactive/lib/utils.js", "segmentio-menu/deps/reactive/lib/utils.js");
require.alias("component-reactive/lib/text-binding.js", "segmentio-menu/deps/reactive/lib/text-binding.js");
require.alias("component-reactive/lib/attr-binding.js", "segmentio-menu/deps/reactive/lib/attr-binding.js");
require.alias("component-reactive/lib/binding.js", "segmentio-menu/deps/reactive/lib/binding.js");
require.alias("component-reactive/lib/bindings.js", "segmentio-menu/deps/reactive/lib/bindings.js");
require.alias("component-reactive/lib/adapter.js", "segmentio-menu/deps/reactive/lib/adapter.js");
require.alias("component-reactive/lib/index.js", "segmentio-menu/deps/reactive/index.js");
require.alias("component-format-parser/index.js", "component-reactive/deps/format-parser/index.js");

require.alias("component-props/index.js", "component-reactive/deps/props/index.js");
require.alias("component-props/index.js", "component-reactive/deps/props/index.js");
require.alias("component-props/index.js", "component-props/index.js");
require.alias("visionmedia-debug/index.js", "component-reactive/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "component-reactive/deps/debug/debug.js");

require.alias("component-event/index.js", "component-reactive/deps/event/index.js");

require.alias("component-classes/index.js", "component-reactive/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-query/index.js", "component-reactive/deps/query/index.js");

require.alias("component-reactive/lib/index.js", "component-reactive/index.js");
require.alias("ianstormtaylor-get/index.js", "segmentio-menu/deps/get/index.js");

require.alias("segmentio-list/lib/index.js", "segmentio-menu/deps/list/lib/index.js");
require.alias("segmentio-list/lib/protos.js", "segmentio-menu/deps/list/lib/protos.js");
require.alias("segmentio-list/lib/statics.js", "segmentio-menu/deps/list/lib/statics.js");
require.alias("segmentio-list/lib/index.js", "segmentio-menu/deps/list/index.js");
require.alias("component-bind/index.js", "segmentio-list/deps/bind/index.js");

require.alias("segmentio-dom/index.js", "segmentio-list/deps/dom/index.js");
require.alias("component-type/index.js", "segmentio-dom/deps/type/index.js");

require.alias("component-event/index.js", "segmentio-dom/deps/event/index.js");

require.alias("component-delegate/index.js", "segmentio-dom/deps/delegate/index.js");
require.alias("component-matches-selector/index.js", "component-delegate/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("component-event/index.js", "component-delegate/deps/event/index.js");

require.alias("component-indexof/index.js", "segmentio-dom/deps/indexof/index.js");

require.alias("component-domify/index.js", "segmentio-dom/deps/domify/index.js");

require.alias("component-classes/index.js", "segmentio-dom/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-css/index.js", "segmentio-dom/deps/css/index.js");

require.alias("component-sort/index.js", "segmentio-dom/deps/sort/index.js");

require.alias("component-value/index.js", "segmentio-dom/deps/value/index.js");
require.alias("component-value/index.js", "segmentio-dom/deps/value/index.js");
require.alias("component-type/index.js", "component-value/deps/type/index.js");

require.alias("component-value/index.js", "component-value/index.js");
require.alias("component-query/index.js", "segmentio-dom/deps/query/index.js");

require.alias("component-each/index.js", "segmentio-list/deps/each/index.js");
require.alias("component-to-function/index.js", "component-each/deps/to-function/index.js");

require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("segmentio-emitter/index.js", "segmentio-list/deps/emitter/index.js");
require.alias("component-indexof/index.js", "segmentio-emitter/deps/indexof/index.js");

require.alias("component-sort/index.js", "segmentio-list/deps/sort/index.js");

require.alias("ianstormtaylor-get/index.js", "segmentio-list/deps/get/index.js");

require.alias("segmentio-list/lib/index.js", "segmentio-list/index.js");
require.alias("yields-slug/index.js", "segmentio-menu/deps/slug/index.js");

require.alias("segmentio-menu/lib/index.js", "segmentio-menu/index.js");
require.alias("segmentio-rainbow/index.js", "app/deps/rainbow/index.js");
require.alias("segmentio-rainbow/js/rainbow.js", "app/deps/rainbow/js/rainbow.js");
require.alias("segmentio-rainbow/js/language/c.js", "app/deps/rainbow/js/language/c.js");
require.alias("segmentio-rainbow/js/language/coffeescript.js", "app/deps/rainbow/js/language/coffeescript.js");
require.alias("segmentio-rainbow/js/language/csharp.js", "app/deps/rainbow/js/language/csharp.js");
require.alias("segmentio-rainbow/js/language/css.js", "app/deps/rainbow/js/language/css.js");
require.alias("segmentio-rainbow/js/language/d.js", "app/deps/rainbow/js/language/d.js");
require.alias("segmentio-rainbow/js/language/generic.js", "app/deps/rainbow/js/language/generic.js");
require.alias("segmentio-rainbow/js/language/go.js", "app/deps/rainbow/js/language/go.js");
require.alias("segmentio-rainbow/js/language/haskell.js", "app/deps/rainbow/js/language/haskell.js");
require.alias("segmentio-rainbow/js/language/html.js", "app/deps/rainbow/js/language/html.js");
require.alias("segmentio-rainbow/js/language/java.js", "app/deps/rainbow/js/language/java.js");
require.alias("segmentio-rainbow/js/language/javascript.js", "app/deps/rainbow/js/language/javascript.js");
require.alias("segmentio-rainbow/js/language/lua.js", "app/deps/rainbow/js/language/lua.js");
require.alias("segmentio-rainbow/js/language/php.js", "app/deps/rainbow/js/language/php.js");
require.alias("segmentio-rainbow/js/language/python.js", "app/deps/rainbow/js/language/python.js");
require.alias("segmentio-rainbow/js/language/r.js", "app/deps/rainbow/js/language/r.js");
require.alias("segmentio-rainbow/js/language/ruby.js", "app/deps/rainbow/js/language/ruby.js");
require.alias("segmentio-rainbow/js/language/scheme.js", "app/deps/rainbow/js/language/scheme.js");
require.alias("segmentio-rainbow/js/language/shell.js", "app/deps/rainbow/js/language/shell.js");
require.alias("segmentio-rainbow/js/language/smalltalk.js", "app/deps/rainbow/js/language/smalltalk.js");

require.alias("editor/index.js", "app/deps/editor/index.js");
require.alias("component-dom/index.js", "editor/deps/dom/index.js");
require.alias("component-type/index.js", "component-dom/deps/type/index.js");

require.alias("component-event/index.js", "component-dom/deps/event/index.js");

require.alias("component-delegate/index.js", "component-dom/deps/delegate/index.js");
require.alias("component-matches-selector/index.js", "component-delegate/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("component-event/index.js", "component-delegate/deps/event/index.js");

require.alias("component-indexof/index.js", "component-dom/deps/indexof/index.js");

require.alias("component-domify/index.js", "component-dom/deps/domify/index.js");

require.alias("component-classes/index.js", "component-dom/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-css/index.js", "component-dom/deps/css/index.js");

require.alias("component-sort/index.js", "component-dom/deps/sort/index.js");

require.alias("component-value/index.js", "component-dom/deps/value/index.js");
require.alias("component-value/index.js", "component-dom/deps/value/index.js");
require.alias("component-type/index.js", "component-value/deps/type/index.js");

require.alias("component-value/index.js", "component-value/index.js");
require.alias("component-query/index.js", "component-dom/deps/query/index.js");

require.alias("component-domify/index.js", "editor/deps/domify/index.js");

require.alias("component-event/index.js", "editor/deps/event/index.js");

require.alias("component-moment/index.js", "editor/deps/moment/index.js");

require.alias("component-throttle/index.js", "editor/deps/throttle/index.js");

require.alias("component-value/index.js", "editor/deps/value/index.js");
require.alias("component-value/index.js", "editor/deps/value/index.js");
require.alias("component-type/index.js", "component-value/deps/type/index.js");

require.alias("component-value/index.js", "component-value/index.js");
require.alias("matthewmueller-debounce/index.js", "editor/deps/debounce/index.js");

require.alias("segmentio-marked/lib/marked.js", "editor/deps/marked/lib/marked.js");
require.alias("segmentio-marked/lib/marked.js", "editor/deps/marked/index.js");
require.alias("segmentio-marked/lib/marked.js", "segmentio-marked/index.js");
require.alias("timoxley-async-compose/index.js", "editor/deps/async-compose/index.js");
require.alias("solutionio-async/index.js", "timoxley-async-compose/deps/async.js/index.js");

require.alias("timoxley-next-tick/index.js", "timoxley-async-compose/deps/next-tick/index.js");

require.alias("nav/index.js", "app/deps/nav/index.js");
require.alias("nav/item.js", "app/deps/nav/item.js");
require.alias("component-keyname/index.js", "nav/deps/keyname/index.js");

require.alias("component-value/index.js", "nav/deps/value/index.js");
require.alias("component-value/index.js", "nav/deps/value/index.js");
require.alias("component-type/index.js", "component-value/deps/type/index.js");

require.alias("component-value/index.js", "component-value/index.js");
require.alias("segmentio-menu/lib/index.js", "nav/deps/menu/lib/index.js");
require.alias("segmentio-menu/lib/item.js", "nav/deps/menu/lib/item.js");
require.alias("segmentio-menu/lib/protos.js", "nav/deps/menu/lib/protos.js");
require.alias("segmentio-menu/lib/statics.js", "nav/deps/menu/lib/statics.js");
require.alias("segmentio-menu/lib/template.js", "nav/deps/menu/lib/template.js");
require.alias("segmentio-menu/lib/index.js", "nav/deps/menu/index.js");
require.alias("component-dom/index.js", "segmentio-menu/deps/dom/index.js");
require.alias("component-type/index.js", "component-dom/deps/type/index.js");

require.alias("component-event/index.js", "component-dom/deps/event/index.js");

require.alias("component-delegate/index.js", "component-dom/deps/delegate/index.js");
require.alias("component-matches-selector/index.js", "component-delegate/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("component-event/index.js", "component-delegate/deps/event/index.js");

require.alias("component-indexof/index.js", "component-dom/deps/indexof/index.js");

require.alias("component-domify/index.js", "component-dom/deps/domify/index.js");

require.alias("component-classes/index.js", "component-dom/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-css/index.js", "component-dom/deps/css/index.js");

require.alias("component-sort/index.js", "component-dom/deps/sort/index.js");

require.alias("component-value/index.js", "component-dom/deps/value/index.js");
require.alias("component-value/index.js", "component-dom/deps/value/index.js");
require.alias("component-type/index.js", "component-value/deps/type/index.js");

require.alias("component-value/index.js", "component-value/index.js");
require.alias("component-query/index.js", "component-dom/deps/query/index.js");

require.alias("component-domify/index.js", "segmentio-menu/deps/domify/index.js");

require.alias("component-emitter/index.js", "segmentio-menu/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-inherit/index.js", "segmentio-menu/deps/inherit/index.js");

require.alias("component-reactive/lib/index.js", "segmentio-menu/deps/reactive/lib/index.js");
require.alias("component-reactive/lib/utils.js", "segmentio-menu/deps/reactive/lib/utils.js");
require.alias("component-reactive/lib/text-binding.js", "segmentio-menu/deps/reactive/lib/text-binding.js");
require.alias("component-reactive/lib/attr-binding.js", "segmentio-menu/deps/reactive/lib/attr-binding.js");
require.alias("component-reactive/lib/binding.js", "segmentio-menu/deps/reactive/lib/binding.js");
require.alias("component-reactive/lib/bindings.js", "segmentio-menu/deps/reactive/lib/bindings.js");
require.alias("component-reactive/lib/adapter.js", "segmentio-menu/deps/reactive/lib/adapter.js");
require.alias("component-reactive/lib/index.js", "segmentio-menu/deps/reactive/index.js");
require.alias("component-format-parser/index.js", "component-reactive/deps/format-parser/index.js");

require.alias("component-props/index.js", "component-reactive/deps/props/index.js");
require.alias("component-props/index.js", "component-reactive/deps/props/index.js");
require.alias("component-props/index.js", "component-props/index.js");
require.alias("visionmedia-debug/index.js", "component-reactive/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "component-reactive/deps/debug/debug.js");

require.alias("component-event/index.js", "component-reactive/deps/event/index.js");

require.alias("component-classes/index.js", "component-reactive/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-query/index.js", "component-reactive/deps/query/index.js");

require.alias("component-reactive/lib/index.js", "component-reactive/index.js");
require.alias("ianstormtaylor-get/index.js", "segmentio-menu/deps/get/index.js");

require.alias("segmentio-list/lib/index.js", "segmentio-menu/deps/list/lib/index.js");
require.alias("segmentio-list/lib/protos.js", "segmentio-menu/deps/list/lib/protos.js");
require.alias("segmentio-list/lib/statics.js", "segmentio-menu/deps/list/lib/statics.js");
require.alias("segmentio-list/lib/index.js", "segmentio-menu/deps/list/index.js");
require.alias("component-bind/index.js", "segmentio-list/deps/bind/index.js");

require.alias("segmentio-dom/index.js", "segmentio-list/deps/dom/index.js");
require.alias("component-type/index.js", "segmentio-dom/deps/type/index.js");

require.alias("component-event/index.js", "segmentio-dom/deps/event/index.js");

require.alias("component-delegate/index.js", "segmentio-dom/deps/delegate/index.js");
require.alias("component-matches-selector/index.js", "component-delegate/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("component-event/index.js", "component-delegate/deps/event/index.js");

require.alias("component-indexof/index.js", "segmentio-dom/deps/indexof/index.js");

require.alias("component-domify/index.js", "segmentio-dom/deps/domify/index.js");

require.alias("component-classes/index.js", "segmentio-dom/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-css/index.js", "segmentio-dom/deps/css/index.js");

require.alias("component-sort/index.js", "segmentio-dom/deps/sort/index.js");

require.alias("component-value/index.js", "segmentio-dom/deps/value/index.js");
require.alias("component-value/index.js", "segmentio-dom/deps/value/index.js");
require.alias("component-type/index.js", "component-value/deps/type/index.js");

require.alias("component-value/index.js", "component-value/index.js");
require.alias("component-query/index.js", "segmentio-dom/deps/query/index.js");

require.alias("component-each/index.js", "segmentio-list/deps/each/index.js");
require.alias("component-to-function/index.js", "component-each/deps/to-function/index.js");

require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("segmentio-emitter/index.js", "segmentio-list/deps/emitter/index.js");
require.alias("component-indexof/index.js", "segmentio-emitter/deps/indexof/index.js");

require.alias("component-sort/index.js", "segmentio-list/deps/sort/index.js");

require.alias("ianstormtaylor-get/index.js", "segmentio-list/deps/get/index.js");

require.alias("segmentio-list/lib/index.js", "segmentio-list/index.js");
require.alias("yields-slug/index.js", "segmentio-menu/deps/slug/index.js");

require.alias("segmentio-menu/lib/index.js", "segmentio-menu/index.js");
require.alias("segmentio-view/lib/index.js", "nav/deps/view/lib/index.js");
require.alias("segmentio-view/lib/protos.js", "nav/deps/view/lib/protos.js");
require.alias("segmentio-view/lib/index.js", "nav/deps/view/index.js");
require.alias("component-classes/index.js", "segmentio-view/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-domify/index.js", "segmentio-view/deps/domify/index.js");

require.alias("component-emitter/index.js", "segmentio-view/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("ianstormtaylor-reactive/lib/index.js", "segmentio-view/deps/reactive/lib/index.js");
require.alias("ianstormtaylor-reactive/lib/utils.js", "segmentio-view/deps/reactive/lib/utils.js");
require.alias("ianstormtaylor-reactive/lib/text-binding.js", "segmentio-view/deps/reactive/lib/text-binding.js");
require.alias("ianstormtaylor-reactive/lib/attr-binding.js", "segmentio-view/deps/reactive/lib/attr-binding.js");
require.alias("ianstormtaylor-reactive/lib/binding.js", "segmentio-view/deps/reactive/lib/binding.js");
require.alias("ianstormtaylor-reactive/lib/bindings.js", "segmentio-view/deps/reactive/lib/bindings.js");
require.alias("ianstormtaylor-reactive/lib/adapter.js", "segmentio-view/deps/reactive/lib/adapter.js");
require.alias("ianstormtaylor-reactive/lib/index.js", "segmentio-view/deps/reactive/index.js");
require.alias("component-format-parser/index.js", "ianstormtaylor-reactive/deps/format-parser/index.js");

require.alias("component-props/index.js", "ianstormtaylor-reactive/deps/props/index.js");
require.alias("component-props/index.js", "ianstormtaylor-reactive/deps/props/index.js");
require.alias("component-props/index.js", "component-props/index.js");
require.alias("visionmedia-debug/index.js", "ianstormtaylor-reactive/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "ianstormtaylor-reactive/deps/debug/debug.js");

require.alias("component-event/index.js", "ianstormtaylor-reactive/deps/event/index.js");

require.alias("component-classes/index.js", "ianstormtaylor-reactive/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-query/index.js", "ianstormtaylor-reactive/deps/query/index.js");

require.alias("ianstormtaylor-reactive/lib/index.js", "ianstormtaylor-reactive/index.js");
require.alias("component-type/index.js", "segmentio-view/deps/type/index.js");

require.alias("segmentio-view/lib/index.js", "segmentio-view/index.js");
require.alias("yields-prevent/index.js", "nav/deps/prevent/index.js");

require.alias("yields-stop/index.js", "nav/deps/stop/index.js");

require.alias("bookmarks/index.js", "boot/deps/bookmarks/index.js");
require.alias("component-each/index.js", "bookmarks/deps/each/index.js");
require.alias("component-to-function/index.js", "component-each/deps/to-function/index.js");

require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("component-set/index.js", "bookmarks/deps/set/index.js");

require.alias("yields-store/index.js", "bookmarks/deps/store/index.js");
require.alias("component-each/index.js", "yields-store/deps/each/index.js");
require.alias("component-to-function/index.js", "component-each/deps/to-function/index.js");

require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("component-type/index.js", "yields-store/deps/type/index.js");

require.alias("yields-unserialize/index.js", "yields-store/deps/unserialize/index.js");

require.alias("document/index.js", "boot/deps/document/index.js");
require.alias("matthewmueller-uid/index.js", "document/deps/uid/index.js");

require.alias("segmentio-model/lib/index.js", "document/deps/model/lib/index.js");
require.alias("segmentio-model/lib/static.js", "document/deps/model/lib/static.js");
require.alias("segmentio-model/lib/proto.js", "document/deps/model/lib/proto.js");
require.alias("segmentio-model/lib/index.js", "document/deps/model/index.js");
require.alias("component-clone/index.js", "segmentio-model/deps/clone/index.js");
require.alias("component-type/index.js", "component-clone/deps/type/index.js");

require.alias("component-each/index.js", "segmentio-model/deps/each/index.js");
require.alias("component-to-function/index.js", "component-each/deps/to-function/index.js");

require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("component-emitter/index.js", "segmentio-model/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-collection/index.js", "segmentio-model/deps/collection/index.js");
require.alias("component-enumerable/index.js", "component-collection/deps/enumerable/index.js");
require.alias("component-to-function/index.js", "component-enumerable/deps/to-function/index.js");

require.alias("visionmedia-superagent/lib/client.js", "segmentio-model/deps/superagent/lib/client.js");
require.alias("visionmedia-superagent/lib/client.js", "segmentio-model/deps/superagent/index.js");
require.alias("component-emitter/index.js", "visionmedia-superagent/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("RedVentures-reduce/index.js", "visionmedia-superagent/deps/reduce/index.js");

require.alias("visionmedia-superagent/lib/client.js", "visionmedia-superagent/index.js");
require.alias("segmentio-model/lib/index.js", "segmentio-model/index.js");
require.alias("segmentio-model-defaults/index.js", "document/deps/model-defaults/index.js");
require.alias("component-clone/index.js", "segmentio-model-defaults/deps/clone/index.js");
require.alias("component-type/index.js", "component-clone/deps/type/index.js");

require.alias("component-each/index.js", "segmentio-model-defaults/deps/each/index.js");
require.alias("component-to-function/index.js", "component-each/deps/to-function/index.js");

require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("component-type/index.js", "segmentio-model-defaults/deps/type/index.js");

require.alias("segmentio-model-firebase/index.js", "document/deps/model-firebase/index.js");
require.alias("segmentio-model-firebase/statics.js", "document/deps/model-firebase/statics.js");
require.alias("segmentio-model-firebase/protos.js", "document/deps/model-firebase/protos.js");
require.alias("component-collection/index.js", "segmentio-model-firebase/deps/collection/index.js");
require.alias("component-enumerable/index.js", "component-collection/deps/enumerable/index.js");
require.alias("component-to-function/index.js", "component-enumerable/deps/to-function/index.js");

require.alias("segmentio-model-memoize/index.js", "document/deps/model-memoize/index.js");
require.alias("component-each/index.js", "segmentio-model-memoize/deps/each/index.js");
require.alias("component-to-function/index.js", "component-each/deps/to-function/index.js");

require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("component-type/index.js", "segmentio-model-memoize/deps/type/index.js");

require.alias("component-bind/index.js", "segmentio-model-memoize/deps/bind/index.js");

require.alias("boot/browser.js", "boot/index.js");
