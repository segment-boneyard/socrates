
var keyname = require('keyname')
  , Menu = require('menu')
  , MenuItem = require('./item')
  , template = require('./index.html')
  , value = require('value')
  , view = require('view');


/**
 * Expose the `Nav` constructor.
 */

var Nav = module.exports = view(template);


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
 * Add an item to the menu.
 *
 * @param {Object} model
 * @return {Nav}
 */

Nav.prototype.add = function (model) {
  this.menu.add(model);
  return this;
};


/**
 * Remove an item from the menu.
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
  this.menu = new Menu(MenuItem)
    .on('select', function (model) {
      self.emit('select', model);
    })
    .on('remove', function (model) {
      self.emit('remove', model);
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