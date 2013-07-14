
var bindAll = require('bind-all')
  , dom = require('dom')
  , domify = require('domify')
  , Editor = require('editor')
  , Emitter = require('emitter')
  , keyname = require('keyname')
  // , mathjax = require('./filters/mathjax')
  , Menu = require('menu')
  , MenuItemView = require('menu-item-view')
  , rainbow = require('./filters/rainbow')
  , reactive = require('reactive')
  , shortcut = require('mousetrap')
  , template = require('./template.html')
  , value = require('value');


/**
 * Configure Editors.
 */

Editor
  .use(rainbow);
  // .use(mathjax)


/**
 * Configure Mousetrap to allow binding inside text inputs.
 */

shortcut.stopCallback = function () { return false; };


/**
 * Exports.
 */

module.exports = App;


/**
 * Initialize the `App`.
 */

function App () {
  this.el = domify(template)[0];
  reactive(this.el, {}, this);
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
 * Call for a new document.
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
  this.menu.add(doc);
  return this;
};


/**
 * Remove a document from the app.
 *
 * @param {String} id
 */

App.prototype.remove = function (doc) {
  this.emit('remove', doc);
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
  if (this.state('navigating')) dom('.search', this.el).get(0).focus();
  return this;
};


/**
 * Reactive bindings.
 */

App.prototype.createMenu = function () {
  this.menu = new Menu(MenuItemView)
    .on('select', this.load.bind(this))
    .on('remove', this.remove.bind(this));
  return this.menu.el;
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

App.prototype.onSearch = function (e) {
  switch (keyname(e.keyCode)) {
    case 'esc':
      return this.navigating(false);
    case 'up':
      return this.menu.move('previous');
    case 'down':
      return this.menu.move('next');
  }
  var string = value(e.target);
  this.menu.filter(function (el) {
    return el.text().toLowerCase().indexOf(string) !== -1;
  });
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