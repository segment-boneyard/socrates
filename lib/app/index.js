
var $ = require('dom')
  , bindAll = require('bind-all')
  , Editor = require('editor')
  , Emitter = require('emitter')
  // , mathjax = require('./filters/mathjax')
  , Menu = require('menu')
  , rainbow = require('./filters/rainbow')
  , shortcut = require('mousetrap')
  , value = require('value');


/**
 * Configure Editors.
 */

Editor
  .use(rainbow);
  // .use(mathjax)


/**
 * Initialize the `App`.
 */

function App (el) {
  bindAll(this);

  this.el = el;

  // cache dom elements
  this.nav = el.find('nav');
  this.search = el.find('.search');
  this.input = el.find('.input');
  this.output = el.find('.output');
  this.navButton = el.find('.nav-button');
  this.addButton = el.find('.add-button');
  this.writeButton = el.find('.write-button');
  this.readButton = el.find('.read-button');

  // make our menu
  var menu = this.menu = new Menu()
    .template('<li><a data-text="title"></a></li>')
    .el.appendTo(this.nav.el);

  this.bind();
}


/**
 * Mixin Emitter.
 */

Emitter(App.prototype);


/**
 * Bind events and shortcuts.
 */

App.prototype.bind = function () {
  var self = this;

  this.navButton.on('click', this.navigate);
  this.addButton.on('click', this.new);
  this.writeButton.on('click', this.write);
  this.readButton.on('click', this.read);

  this.search.on('change', function (e) {
    var string = value(self.search.get(0));
    self.menu.filter(string);
  });

  shortcut.bind('ctrl+alt+o', this.navigate);
  shortcut.bind('ctrl+alt+n', this.new);
  shortcut.bind('ctrl+alt+left', this.write);
  shortcut.bind('ctrl+alt+right', this.read);
  shortcut.bind('esc', this.close);
  return this;
};


/**
 * Load a document.
 */

App.prototype.load = function (doc) {
  var editor = this.editor = new Editor(doc);
  this.input = this.input.replace(editor.input);
  this.output = this.output.replace(editor.output);
  return this;
};


/**
 * Add a document to the app.
 *
 * @param {Document} doc
 * @param {Function} callback
 */

App.prototype.add = function (doc, callback) {
  this.menu.add(doc, callback);
  return this;
};


/**
 * Remove a document from the app.
 *
 * @param {String} id
 */

App.prototype.remove = function (id) {
  this.menu.remove(id);
  return this;
};


/**
 * Change the App's reading or writing state.
 *
 * @param {String} state 'read' or 'write' or null
 */

App.prototype.state = function (state) {
  this.el
    .toggleClass('reading', state === 'read')
    .toggleClass('writing', state === 'write');
  return this;
};


/**
 * Toggle the App's navigating state.
 */

App.prototype.navigate = function () {
  this.el.toggleClass(this.el.hasClass('navigating'));
  return this;
};


/**
 * Toggle the App's loading state.
 */

App.prototype.loading = function () {
  this.el.toggleClass(this.el.hasClass('loading'));
  return this;
};


/**
 * Close the navigation.
 */

App.prototype.close = function () {
  this.el.removeClass('navigating');
  return this;
};


/**
 * Call for a new document.
 */

App.prototype.new = function () {
  this.emit('new');
  return this;
};