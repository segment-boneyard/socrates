
var template = require('./item.html')
  , stop = require('stop')
  , prevent = require('prevent')
  , view = require('view');


/**
 * Expose `MenuItemView` constructor.
 */

var MenuItemView = module.exports = view(template);


/**
 * On clicking the delete button, remove the document from the list.
 */

MenuItemView.prototype.onClickDelete = function (e) {
  prevent(e);
  stop(e);
  this.menu.remove(this.model.primary());
};