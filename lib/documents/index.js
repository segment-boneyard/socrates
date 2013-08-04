
var Collection = require('collection')
  , Document = require('document')
  , each = require('each')
  , Set = require('set')
  , store = require('store');


/**
 * Define our local storage key.
 */

var STORE = 'bookmarks';


/**
 * BACKWARDS COMPATIBILITY: bookmarks used to be stored under
 * `socrates.bookmarks` as a comma-separate string. Convert them gracefully.
 */

var OLD_STORE = 'socrates.bookmarks';
if (store(OLD_STORE)) {
  store(STORE, store(OLD_STORE).split(','));
  store(OLD_STORE, null);
}


/**
 * Set.
 */

var bookmarks = new Set(store(STORE));


/**
 * Create a documents collection.
 */

var documents = module.exports = exports = new Collection()
  .on('add', function (doc) {
    bookmarks.add(doc.primary());
    store(STORE, bookmarks.values());
  })
  .on('remove', function (doc) {
    bookmarks.remove(doc.primary());
    store(STORE, bookmarks.values());
  });


/**
 * Fetch a document, saving it to documents.
 *
 * @param {String} id
 * @param {Function} callback(err, doc)
 */

exports.fetch = function (id, callback) {
  Document.get(id, function (err, doc) {
    if (!doc) {
      doc = new Document();
      doc.save();
      window.analytics.track('Created New Document', { id: doc.primary() });
    }
    if (!documents.has(doc)) documents.add(doc);
    callback && callback(null, doc);
  });
};


/**
 * Load our documents from the saved bookmarks.
 */

exports.load = function () {
  each(store(STORE), function (id) {
    exports.fetch(id);
  });
};