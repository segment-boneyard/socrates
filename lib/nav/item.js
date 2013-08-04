
var documents = require('documents')
  , template = require('./item.html')
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

  var doc = documents.find('.primary() ===' + this.model.primary());
  if (doc) documents.remove(doc);
};


/**
 * Return an href for the document.
 *
 * @return {String}
 */

MenuItemView.prototype.href = function () {
  return '/' + this.model.primary();
};