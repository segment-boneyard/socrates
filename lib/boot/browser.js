
var App = require('app')
  , bookmarks = require('bookmarks')
  , Collection = require('collection')
  , Document = require('document')
  , each = require('each')
  , Router = require('router');


/**
 * Router.
 */

var router = new Router();

router.get('/:id/:state', load);
router.get('/:id', load);
router.get('/', load);


/**
 * App.
 */

var app = new App(document.body)

  .on('new', function () {
    router.dispatch('/');
  });


/**
 * Documents. Update app and bookmarks when documents change.
 */

var documents = new Collection()

  .on('add', function (doc) {
    var id = doc.primary();
    bookmarks.add(id);
    app.add(doc, function () {
      load(id);
    });
  })

  .on('remove', function (doc) {
    var id = doc.primary();
    bookmarks.remove(id);
    app.remove(id);
  });


/**
 * Start routing.
 */

router.dispatch(location.pathname);


/**
 * Finally, get the bookmarked documents from Firebase after already requesting
 * the currently active document.
 */

each(bookmarks(), get);


/**
 * Load a Document onto the page.
 *
 * @param {String} id                ID of the document to load.
 * @param {String} state (optional)  State to start in.
 */

function load (id, state) {
  app.loading();
  get(id, function (err, doc) {
    if (err) throw err;
    app
      .load(doc)
      .loading()
      .state(state);
    window.analytics.track('Viewed Document', { id: doc.primary(), state: state });
  });
}


/**
 * Retrieve a Document.
 *
 * @param {String}   id        ID to query by.
 * @param {Function} callback  Called with `err, doc`.
 */

function get (id, callback) {
  var doc = documents.find('primary() === "' + id + '"');
  if (doc) return callback && callback(null, doc);

  Document.get(id, function (err, doc) {
    if (err) return callback(err);
    if (!doc) {
      doc = new Document();
      window.analytics.track('Created New Document');
    }
    documents.push(doc);
    callback && callback(null, doc);
  });
}