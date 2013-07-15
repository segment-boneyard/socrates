
var dom = require('dom')
  , domify = require('domify')
  , Editor = require('editor')
  , Emitter = require('emitter')
  , Nav = require('nav')
  , reactive = require('reactive')
  , shortcut = require('mousetrap')
  , template = require('./index.html');


/**
 * Configure Editors.
 */

Editor
  .use(require('./filters/rainbow'));
  // .use(require('./filters/mathjax'))


/**
 * Configure Mousetrap to allow binding inside text inputs.
 */

shortcut.stopCallback = function () { return false; };


/**
 * Expose `App`.
 */

module.exports = App;


/**
 * Initialize a new `App`.
 */

function App () {
  this.el = domify(template);
  this.reactive = reactive(this.el, {}, this);
  this.bindShortcuts();
}


/**
 * Mixin Emitter.
 */

Emitter(App.prototype);


/**
 * Load a document.
 */

App.prototype.load = function (doc) {
  var editor = this.editor = new Editor(doc);
  dom('.input', this.el).replace(editor.input);
  dom('.output', this.el).replace(editor.output);
  return this;
};


/**
 * HACK: Call for a new document.
 */

App.prototype.new = function () {
  this.emit('new');
  return this;
};


/**
 * Add a document to the app.
 *
 * @param {Document} doc
 */

App.prototype.add = function (doc) {
  this.nav.add(doc);
  this.emit('add', doc);
  return this;
};


/**
 * Get or set a state for the app.
 *
 * @param {String}  name   Name of the state.
 * @param {Boolean} value  Value to set the state to.
 */

App.prototype.state = function (name, value) {
  if (value === undefined) return dom(this.el).hasClass(name);
  dom(this.el).toggleClass(name, value);
  return this;
};


/**
 * Toggles for the different states of the App.
 *
 * @param {Boolean} value  An optional value to toggle the state to.
 */

App.prototype.loading = function (value) {
  return this.state('loading', value);
};

App.prototype.reading = function (value) {
  if (value === undefined) this.state('writing', false);
  return this.state('reading', value);
};

App.prototype.writing = function (value) {
  if (value === undefined) this.state('reading', false);
  return this.state('writing', value);
};

App.prototype.navigating = function (value) {
  if (value === undefined) return this.state('navigating'); // avoid loop
  this.state('navigating', value);
  if (value) this.nav.focus();
  return this;
};


/**
 * Reactive bindings.
 */

App.prototype.replaceNav = function () {
  var self = this;
  this.nav = new Nav()
    .on('select', this.load.bind(this))
    .on('remove', function (el, doc) {
      self.emit('remove', doc);
    });
  return this.nav.el;
};

App.prototype.onAdd = function (e) {
  this.new();
};

App.prototype.onNav = function (e) {
  this.navigating(!this.navigating());
};

App.prototype.onWrite = function (e) {
  this.writing(!this.writing());
};

App.prototype.onRead = function (e) {
  this.reading(!this.reading());
};


/**
 * Bind to keyboard shortcuts.
 */

App.prototype.bindShortcuts = function () {
  var self = this;
  shortcut.bind('ctrl+alt+n', function () {
    self.new();
  });

  shortcut.bind('ctrl+alt+o', function () {
    self.navigating(true);
  });

  shortcut.bind('ctrl+alt+left', function () {
    if (self.reading()) self.reading(false);
    else if (self.writing()) self.navigating(true);
    else self.writing(true);
  });

  shortcut.bind('ctrl+alt+right', function () {
    if (self.writing()) self.writing(false);
    else if (self.navigating()) self.navigating(false);
    else self.reading(true);
  });

  shortcut.bind('esc', function () {
    self.navigating(false);
  });
};