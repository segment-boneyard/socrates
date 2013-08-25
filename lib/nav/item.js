
var documents = require('documents')
  , moment = require('moment')
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


/**
 * Return a title for the document.
 *
 * @return {String}
 */

MenuItemView.prototype.title = function () {
  var title = this.model.title();
  if (title) return title;
  var created = moment(this.model.created());
  return created.format('[Untitled] - MMM Do, YYYY');
};