
var debounce = require('debounce')
  , dom = require('dom')
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

function Editor (document) {
  this.document = document;
  this.textarea = dom('<textarea>');
  this.article = dom('<article>');

  this.textarea.on('keyup', this.onkeyup.bind(this));
  this.document.on('change', this.onchange.bind(this));
}


/**
 * Render settings into the DOM.
 *
 * @param {Object} attrs  The settings to render.
 */

Editor.prototype.render = function (attrs) {
  // TODO: apply filters
  if (!attrs.body) return;
  value(this.textarea.get(0), attrs.body);
  var html = marked(attrs.body);
  this.article.html(html);
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