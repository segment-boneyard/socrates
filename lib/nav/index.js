
var bind = require('event').bind
  , keyname = require('keyname')
  , menu = require('menu')
  , MenuItem = require('./item')
  , prevent = require('prevent')
  , template = require('./index.html')
  , value = require('value')
  , view = require('view');


/**
 * Expose the `Nav` constructor.
 */

var Nav = module.exports = view(template, function (self) {
  self.search = self.el.querySelector('.nav-search');
  self.form = self.el.querySelector('.nav-form');
  bind(self.form, 'submit', prevent);
  bind(self.search, 'focus', function () {
    self.menu.next();
  });
});


/**
 * Create a `Menu` constructor.
 */

var Menu = menu(MenuItem);


/**
 * Add a document to the menu.
 *
 * @param {Object} doc
 * @return {Nav}
 */

Nav.prototype.add = function (doc) {
  this.menu.add(doc);
  return this;
};


/**
 * Remove a document from the menu.
 *
 * @param {String} id
 * @return {Nav}
 */

Nav.prototype.remove = function (id) {
  this.menu.remove(id);
  return this;
};


/**
 * Focus the nav's search input.
 *
 * @return {Nav}
 */

Nav.prototype.focus = function () {
  this.search.focus();
  return this;
};


/**
 * Reactive menu replacement.
 *
 * @return {Element}
 */

Nav.prototype.replaceMenu = function () {
  var self = this;
  this.menu = new Menu()
    .on('select', function (doc) {
      self.emit('select', doc);
    });
  return this.menu.el;
};


/**
 * On search, filter the menu.
 */

Nav.prototype.onSearch = function (e) {
  switch (keyname(e.keyCode)) {
    case 'enter':
      return this.menu.select();
    case 'up':
      return this.menu.previous();
    case 'down':
      return this.menu.next();
  }
  var string = value(e.target);
  this.menu.filter(function (el, model, view) {
    return model.title().toLowerCase().indexOf(string) !== -1;
  });
};