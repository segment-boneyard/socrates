
var keyname = require('keyname')
  , menu = require('menu')
  , MenuItem = require('./item')
  , template = require('./index.html')
  , value = require('value')
  , view = require('view');


/**
 * Expose the `Nav` constructor.
 */

var Nav = module.exports = view(template);


/**
 * Create a `Menu` constructor.
 */

var Menu = menu(MenuItem);


/**
 * Show the nav.
 *
 * @return {Nav}
 */

Nav.prototype.show = function () {
  return this
    .addClass('visible')
    .removeClass('hidden')
    .emit('show');
};


/**
 * Hide the nav.
 *
 * @return {Nav}
 */

Nav.prototype.hide = function () {
  return this
    .removeClass('visible')
    .addClass('hidden')
    .emit('hide');
};


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
  this.el.querySelector('.nav-search').focus();
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
    .on('remove', function (el, doc) {
      self.emit('remove', doc);
    });
  return this.menu.el;
};


/**
 * On search, filter the menu.
 */

Nav.prototype.onSearch = function (e) {
  switch (keyname(e.keyCode)) {
    case 'esc':
      return this.hide();
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