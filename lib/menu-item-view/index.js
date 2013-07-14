
var domify = require('domify')
  , reactive = require('reactive')
  , template = require('./template.html');


/**
 * Expose `MenuItemView`.
 */

module.exports = MenuItemView;


/**
 * Initialize a new `MenuItemView`.
 */

function MenuItemView (model, menu) {
  this.model = model;
  this.menu = menu;
  this.el = domify(template)[0];
  reactive(this.el, this.model, this);
}


/**
 * On clicking the title.
 */

MenuItemView.prototype.select = function () {
  this.menu.select(this.el);
};


/**
 * Remove the document from the list.
 */

MenuItemView.prototype.remove = function () {
  this.menu.remove(this.el);
};