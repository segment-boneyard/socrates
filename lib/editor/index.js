
var bind = require('event').bind
  , dom = require('dom')
  , domify = require('domify')
  , compose = require('async-compose')
  , debounce = require('debounce')
  , marked = require('marked')
  , moment = require('moment')
  , throttle = require('throttle')
  , value = require('value');


/**
 * Set some default markdown options.
 */

marked.setOptions({
  breaks : true,
  gfm : true,
  smartypants : true,
  tables : true
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
  this.doc = doc;
  this.input = domify('<textarea class="input" placeholder="Start writing here&hellip;">');
  this.output = domify('<article class="output">');

  // TODO: tabbing inside input

  bind(this.input, 'keyup', this.onkeyup.bind(this));
  doc.on('change', this.onchange.bind(this));

  this.render(doc.toJSON());
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
 * Render settings into the DOM.
 *
 * @param {Object} attrs
 * @param {Function} callback
 * @return {Editor}
 */

Editor.prototype.render = function (attrs, callback) {
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
        callback && callback();
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
 * Debounced 500ms.
 *
 * @param {Object} attrs
 * @return {Editor}
 */

Editor.prototype.save = debounce(function (attrs) {
  this.doc.set(attrs).save();
  return this;
}, 500);


/**
 * Update our DOM elements when our values change.
 */

Editor.prototype.onchange = function () {
  var attrs = this.doc.toJSON();
  this.render(attrs);
};


/**
 * On keyup, take the textarea contents and save them to firebase.
 *
 * Throttled 200ms.
 */

Editor.prototype.onkeyup = throttle(function (e) {
  this.doc.body(value(this.input));
  var attrs = this.doc.toJSON();
  var self = this;
  this.render(attrs, function () {
    self.save({ title : self.title() }); // grab the newest title
  });
}, 200);


/**
 * Generate a title based on the body and date of the document.
 *
 * @param  {String} markdown
 * @param  {Date} created
 * @return {String}
 */

Editor.prototype.title = function () {
  var headings = dom(this.output).find('h1, h2, h3, h4, h5, h6');
  if (headings.length()) {
    return headings.at(0).text();
  } else {
    return moment(this.doc.created()).format('[Untitled] - MMMM Do, YYYY');
  }
};