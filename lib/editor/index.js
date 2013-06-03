
var compose = require('async-compose')
  , debounce = require('debounce')
  , dom = require('dom')
  , domify = require('domify')
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
  this.document = doc;
  var textarea = this.textarea = dom('<textarea>');
  var article = this.article = dom('<article>');

  textarea.on('keyup', this.onkeyup.bind(this));
  doc.on('change', this.onchange.bind(this));

  this.render(doc.toJSON());
}


/**
 * Add a filter, for transforming text, html or DOM elements.
 *
 * @param {String} name  The name of the hook to attach to.
 * @param {Function} fn  A function called with `input` and a `done` callback to
 *                       call with `err, output` when finished.
 */

Editor._filters = {};

Editor.filter = function (name, fn) {
  Editor._filters[name] = Editor._filters[name] || [];
  Editor._filters[name].push(fn);
};


/**
 * Render settings into the DOM.
 *
 * @param {Object} attrs  The settings to render.
 */

Editor.prototype.render = function (attrs) {
  var text = attrs.body;
  if (!text) return;
  value(this.textarea.get(0), text);

  this.filter('text', text, function (err, text) {
    if (err) throw err;
    var html = marked(text);

    this.filter('html', html, function (err, html) {
      if (err) throw err;
      var dom = domify(html);

      this.filter('dom', dom, function (err, dom) {
        if (err) throw err;
        this.article.html(dom);
      });
    });
  });
};


/**
 * Runs all the filters for a given `type`, and calls back `fn`.
 *
 * @param {String}   name   The type of the filter to run.
 * @param {Mixed}    input  The input to start with.
 * @param {Function} fn     The callback to invoke when finished.
 */

Editor.prototype.filter = function (type, input, fn) {
  var filter = compose(Editor._filters[type] || []);
  filter(input, fn);
};


/**
 * Save settings to Firebase.
 *
 * Debounced 500ms.
 *
 * @param {Object} attrs  The settings to save.
 */

Editor.prototype.save = debounce(function (attrs) {
  this.document.set(attrs).save();
}, 500);


/**
 * Update our DOM elements when our values change.
 *
 * @param {Object} snapshot  The new Firebase snapshot.
 */

Editor.prototype.onchange = function () {
  var attrs = this.document.toJSON();
  this.render(attrs);
};


/**
 * On keyup, take the textarea contents and save them to firebase.
 *
 * Throttled 200ms.
 */

Editor.prototype.onkeyup = throttle(function (e) {
  var doc = this.document;
  doc.body(value(this.textarea.get(0)));
  var attrs = doc.toJSON();
  this.render(attrs);
  this.save({ title : this.title() }); // after rendering, grab the newest title
}, 200);


/**
 * Generate a title based on the body and date of the document.
 *
 * @param  {String} markdown  An HTML representation of the document body.
 * @param  {Date}   created   The date the document was created.
 * @return {String}           The title to use for the document.
 */

Editor.prototype.title = function () {
  var headings = dom(this.article).find('h1, h2, h3, h4, h5, h6');
  if (headings.length()) {
    return headings.at(0).text();
  } else {
    return moment(this.document.created()).format('[Untitled] - MMMM Do, YYYY');
  }
};