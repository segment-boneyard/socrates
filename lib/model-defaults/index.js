
var clone = require('clone')
  , each = require('each')
  , type = require('type');


/**
 * Mixin our plugin.
 */

module.exports = function (Model) {
  Model.on('construct', function (model, attrs) {
    each(Model.attrs, function (key, options) {
      if (options.default !== undefined) def(model, key, options.default);
    });
  });
};


/**
 * Default a `model` with a `value` for a `key` if it doesn't exist. Use a clone
 * of the value, so that they it's easy to declare objects and arrays without
 * worrying about copying by reference.
 *
 * @param {Model}          model  The model.
 * @param {String}         key    The key to back by a default.
 * @param {Mixed|Function} value  The default value to use.
 */

function def (model, key, value) {
  if ('function' === type(value)) value = value();
  if (!model.attrs[key]) model.attrs[key] = clone(value);
}