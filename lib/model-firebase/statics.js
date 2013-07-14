
var Collection = require('collection')
  , noop = function(){};


/**
 * `url` doesn't apply for firebase.
 */

exports.url = noop;

/**
 * Remove all and invoke `fn(err)`.
 *
 * @param {Function} [fn]
 * @api public
 */

exports.removeAll = function(fn){
  fn = fn || noop;
  this.firebase.remove(function (err) {
    if (err) return fn(err);
    fn();
  });
};

/**
 * Get all and invoke `fn(err, array)`.
 *
 * @param {Function} fn
 * @api public
 */

exports.all = function(fn){
  var self = this;
  var col = new Collection();
  this.firebase.once('value', function (snapshot) {
    snapshot.forEach(function (child) {
      var attrs = child.val();
      if (attrs) col.push(new self(attrs));
    });
    fn(null, col);
  });
};

/**
 * Get `id` and invoke `fn(err, model)`.
 *
 * @param {String} id
 * @param {Function} fn
 * @api public
 */

exports.get = function(id, fn){
  if (!id) return fn(new Error('no model'));
  var self = this;
  this.firebase.child(id).once('value', function (snapshot) {
    var attrs = snapshot.val();
    if (!attrs) return fn(new Error('no model'));
    var model = new self(attrs);
    fn(null, model);
  });
};