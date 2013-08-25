
var bind = require('event').bind
  , classes = require('classes')
  , compose = require('async-compose')
  , dom = require('dom')
  , domify = require('domify')
  , debounce = require('debounce')
  , filters = require('./filters')
  , marked = require('marked')
  , template = require('./index.html')
  , value = require('value');


/**
 * Set some default markdown options.
 */

marked.setOptions({
  breaks: true,
  gfm: true,
  smartypants: true,
  tables: true
});


/**
 * Expose `Editor`.
 */

module.exports = Editor;


/**
 * Initialize a new `Editor`.
 *
 * @param {Object} doc
 */

function Editor (doc) {
  this.model = doc;
  this.el = domify(template);
  this.input = this.el.querySelector('.editor-input');
  this.output = this.el.querySelector('.editor-output');
  this.bind();
  this.render();
}


/**
 * Add a plugin.
 *
 * @param {Function} plugin
 */

Editor.use = function (plugin) {
  plugin(this);
  return this;
};


/**
 * Add a filter, for transforming text, html or DOM elements.
 *
 * @param {String} name
 * @param {Function} callback
 */

Editor.filter = function (name, callback) {
  this._filters || (this._filters = {});
  this._filters[name] || (this._filters[name] = []);
  this._filters[name].push(callback);
};


/**
 * Bind to events.
 *
 * @return {Editor}
 */

Editor.prototype.bind = function () {
  var self = this;

  // model change
  this.model.on('change', this.render.bind(this));

  // keyup
  bind(this.input, 'keyup', this.onkeyup.bind(this));

  // write button
  var write = this.el.querySelector('.editor-write-button');
  bind(write, 'click', function (e) {
    'writing' === self._mode
      ? self.mode(null)
      : self.mode('writing');
  });

  // read button
  var read = this.el.querySelector('.editor-read-button');
  bind(read, 'click', function (e) {
    'reading' === self._mode
      ? self.mode(null)
      : self.mode('reading');
  });

  return this;
};


/**
 * Render settings into the DOM.
 *
 * @param {Function} callback
 * @return {Editor}
 */

Editor.prototype.render = function (callback) {
  var attrs = this.model.toJSON();
  var text = attrs.body;
  if (!text) return;
  value(this.input, text);

  var self = this;
  self.filter('text', text, function (err, text) {
    if (err) throw err;
    var html = marked(text);

    self.filter('html', html, function (err, html) {
      if (err) throw err;
      var els = domify('<div>' + html + '</div>');

      self.filter('dom', els, function (err, els) {
        if (err) throw err;
        dom(self.output).empty().append(els);
        if ('function' === typeof callback) callback();
      });
    });
  });

  return this;
};


/**
 * Runs all the filters for a given `type`, and `callback`.
 *
 * @param {String} name
 * @param {Mixed} input
 * @param {Function} callback
 * @return {Editor}
 */

Editor.prototype.filter = function (type, input, callback) {
  var filter = compose(Editor._filters[type] || []);
  filter(input, callback);
  return this;
};


/**
 * Save settings to Firebase.
 *
 * @param {Object} attrs
 * @return {Editor}
 */

Editor.prototype.save = function (attrs) {
  this.model.set(attrs).save();
  return this;
};


/**
 * Set the editor's mode.
 *
 * @param {String} mode - 'reading' or 'writing'
 */

Editor.prototype.mode = function (mode) {
  this._mode = mode;
  classes(this.el).remove('writing').remove('reading');
  if (mode) classes(this.el).add(mode);
  return this;
};


/**
 * On keyup, take the textarea contents and save them to firebase.
 *
 * Debounced 100ms.
 */

Editor.prototype.onkeyup = debounce(function (e) {
  this.model.body(value(this.input));
  var self = this;
  this.render(function () {
    self.save({ title: self.title() }); // grab the newest title
  });
}, 100);


/**
 * Generate a title based on the body and date of the document.
 *
 * @param  {String} markdown
 * @param  {Date} created
 * @return {String}
 */

Editor.prototype.title = function () {
  var headings = dom(this.output).find('h1, h2, h3, h4, h5, h6');
  return headings.length()
    ? headings.first().text()
    : '';
};


/**
 * Apply filters.
 */

for (var key in filters) Editor.use(filters[key]);