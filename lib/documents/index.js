
var Collection = require('collection')
  , Document = require('document')
  , each = require('each')
  , next = require('next-tick')
  , set = require('collection-set')
  , store = require('store');


/**
 * Define our local storage key.
 */

var STORE = 'bookmarks';


/**
 * Create a documents collection.
 */

var documents = module.exports = exports = new Collection()
  .use(set)
  .on('add', save)
  .on('remove', save);


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
      doc.save(); // persist it
      window.analytics.track('Created New Document', { id: doc.primary() });
    }
    documents.add(doc);
    callback && callback(null, doc);
  });
};


/**
 * Load our documents from the saved bookmarks.
 */

exports.load = function () {
  // BACKWARDS COMPATIBILITY: bookmarks used to be stored under
  // `socrates.bookmarks` as a comma-separate string. Convert them gracefully.
  var OLD_STORE = 'socrates.bookmarks';
  if (store(OLD_STORE)) {
    store(STORE, store(OLD_STORE).split(','));
    store(OLD_STORE, null);
  }

  each(store(STORE), exports.fetch);
};


/**
 * Save documents to local storage.
 */

function save () {
  var ids = documents.map('.primary()');
  store('documents', ids);
};