
var $ = require('dom')
  , compose = require('async-compose')
  , debounce = require('debounce')
  , marked = require('marked')
  , moment = require('moment')
  , throttle = require('throttle')
  , value = require('value');


module.exports = Editor;


/**
 * Set some default marked options.
 */

marked.setOptions({
  gfm : true,
  tables : true,
  breaks : true,
  smartypants : true
});


/**
 * Editor.
 */

function Editor (doc) {
  this.doc = doc;
  this.input = $('<textarea class="input" placeholder="Start writing here&hellip;">');
  this.output = $('<article class="output">');

  // TODO: tabbing inside input

  this.input.on('keyup', this.onkeyup.bind(this));
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
 * @param {String}   name      The name of the hook to attach to.
 * @param {Function} callback  A function called with `input` and a `done`
 *                             callback to to be called with `err, output`.
 */

Editor.filter = function (name, callback) {
  this._filters || (this._filters = {});
  this._filters[name] = this._filters[name] || [];
  this._filters[name].push(callback);
};


/**
 * Render settings into the DOM.
 *
 * @param {Object}   attrs     The settings to render.
 * @param {Function} callback
 */

Editor.prototype.render = function (attrs, callback) {
  var text = attrs.body;
  if (!text) return;
  value(this.input.get(0), text);

  var self = this;
  self.filter('text', text, function (err, text) {
    if (err) throw err;
    var html = marked(text);

    self.filter('html', html, function (err, html) {
      if (err) throw err;
      var dom = $('<div>' + html + '</div>').get();

      self.filter('dom', dom, function (err, dom) {
        if (err) throw err;
        self.output.empty().append(dom);
        callback && callback();
      });
    });
  });
};


/**
 * Runs all the filters for a given `type`, and `callback`.
 *
 * @param {String}   name      The type of the filter to run.
 * @param {Mixed}    input     The input to start with.
 * @param {Function} callback  The callback to invoke when finished.
 */

Editor.prototype.filter = function (type, input, callback) {
  var filter = compose(Editor._filters[type] || []);
  filter(input, callback);
};


/**
 * Save settings to Firebase.
 *
 * Debounced 500ms.
 *
 * @param {Object} attrs  The settings to save.
 */

Editor.prototype.save = debounce(function (attrs) {
  this.doc.set(attrs).save();
}, 500);


/**
 * Update our DOM elements when our values change.
 *
 * @param {Object} snapshot  The new Firebase snapshot.
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
  this.doc.body(value(this.input.get(0)));
  var attrs = this.doc.toJSON();
  var self = this;
  this.render(attrs, function () {
    self.save({ title : self.title() }); // grab the newest title
  });
}, 200);


/**
 * Generate a title based on the body and date of the document.
 *
 * @param  {String} markdown  An HTML representation of the document body.
 * @param  {Date}   created   The date the document was created.
 * @return {String}           The title to use for the document.
 */

Editor.prototype.title = function () {
  var headings = $(this.output).find('h1, h2, h3, h4, h5, h6');
  if (headings.length()) {
    return headings.at(0).text();
  } else {
    return moment(this.doc.created()).format('[Untitled] - MMMM Do, YYYY');
  }
};