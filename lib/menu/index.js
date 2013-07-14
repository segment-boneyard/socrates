
var dom = require('dom')
  , events = require('events')
  , find = require('find')
  , inherit = require('inherit')
  , keyname = require('keyname')
  , List = require('list')
  , prevent = require('prevent');


/**
 * Expose `Menu`.
 */

module.exports = Menu;


/**
 * Initialize a new `Menu`.
 */

function Menu () {
  List.apply(this, arguments); // super
  this.events = events(this.el, this);
  this.events.bind('hover');
  this.events.bind('focus');
  this.events.bind('blur');
  this.events.bind('keydown');
}


/**
 * Inherit from list.
 */

inherit(Menu, List);


/**
 * Select a menu item by `id`.
 *
 * @param {String} id
 */

Menu.prototype.select = function (id) {
  this.deselect();
  var el = this.elements[id];
  var model = this.models[id];
  if (!el || !model) return;
  this.list.find(el).addClass('selected');
  this.emit('select', model, el);
  return this;
};


/**
 * Deselect selected menu items.
 */

Menu.prototype.deselect = function () {
  this.list.removeClass('selected');
  return this;
};


/**
 * Focus the next menu item in `direction`.
 *
 * @param {String} direction  'previous' or 'next'
 */

Menu.prototype.move = function (direction) {
  var previous = this.list.find('.selected');
  var next = previous.length()
    ? previous[direction]()
    : this.list.at(0);

  if (next.length) {
    previous.removeClass('selected');
    next.addClass('selected');
  }
  return this;
};


/**
 * Event handlers.
 */

Menu.prototype.onhover = function (e) {
  this.deselect();
};

Menu.prototype.onfocus = function (e) {
  dom(document).on('keydown', this.onkeydown);
};

Menu.prototype.onblur = function (e) {
  dom(document).off('keydown', this.onkeydown);
};

Menu.prototype.onkeydown = function (e) {
  switch (keyname(e.keyCode)) {
    case 'enter':
      var el = this.list.find('.selected').get(0);
      var id = find(this.elements, function (id, element) { return el === element; });
      if (id) this.select(id);
      break;

    case 'up':
      prevent(e);
      this.move('previous');
      break;

    case 'down':
      prevent(e);
      this.move('next');
      break;
  }
};

