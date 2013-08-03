
var template = require('./item.html')
  , view = require('view');


/**
 * Expose `MenuItemView` constructor.
 */

var MenuItemView = module.exports = view(template);


/**
 * On clicking the delete button, remove the document from the list.
 */

MenuItemView.prototype.onClickDelete = function (e) {
  e.preventDefault();
  e.stopPropagation();
  this.menu.remove(this.model.primary());
};