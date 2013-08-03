
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

  documents.get(this.model.primary(), function (err, doc) {
    if (err) throw err;
    documents.remove(doc);
  });
};