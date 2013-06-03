
var noop = function(){};


/**
 * `url` doesn't apply for firebase.
 */

exports.url = noop;

/**
 * Returns this model's firebase.
 *
 * @return {Firebase} - Your Firebase reference.
 * @api public
 */

exports.firebase = function () {
  var firebase = this.model.firebase;
  if (!firebase) throw new Error('no firebase');
  return firebase.child(this.primary());
};

/**
 * Destroy the model and mark it as `.removed`
 * and invoke `fn(err)`.
 *
 * @param {Function} [fn] - Callback.
 * @api public
 */

exports.destroy =
exports.remove = function (fn) {
  fn = fn || noop;
  if (this.isNew()) return fn(new Error('not saved'));
  var firebase = this.firebase();
  var self = this;
  this.model.emit('removing', this);
  this.emit('removing');
  firebase.remove(function (err) {
    if (err) return fn(err);
    self.removed = true;
    self.model.emit('remove', self);
    self.emit('remove');
    fn();
  });
};

/**
 * Save and invoke `fn(err)`.
 *
 * @param {Function} [fn] - Callback.
 * @api public
 */

exports.save  = function (fn) {
  if (!this.isNew()) return this.update(fn);
  var self = this;
  var firebase = this.firebase();
  fn = fn || noop;
  if (!this.isValid()) return fn(new Error('validation failed'));
  this.model.emit('saving', this);
  this.emit('saving');
  firebase.set(self.attrs, function (err) {
    if (err) return fn(err);
    self.dirty = {};
    self.model.emit('save', self);
    self.emit('save');
    fn();
  });
};

/**
 * Update and invoke `fn(err)`.
 *
 * @param {Function} [fn] - Callback.
 * @api public
 */

exports.update = function (fn) {
  var self = this;
  var firebase = this.firebase();
  fn = fn || noop;
  if (!this.isValid()) return fn(new Error('validation failed'));
  this.model.emit('saving', this);
  this.emit('saving');
  firebase.update(self.attrs, function (err) {
    if (err) return fn(err);
    self.dirty = {};
    self.model.emit('save', self);
    self.emit('save');
    fn();
  });
};