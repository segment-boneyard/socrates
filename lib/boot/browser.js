
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
  })

  .on('remove', function (doc) {
    documents.remove(doc);
  });

document.body.appendChild(app.el);


/**
 * Documents. Update app and bookmarks when documents change.
 */

var documents = new Collection()

  .on('add', function (doc) {
    var id = doc.primary();
    bookmarks.add(id);
    app.add(doc);
  })

  .on('remove', function (doc) {
    var id = doc.primary();
    bookmarks.remove(id);
  });


/**
 * Start routing.
 */

router.dispatch(location.pathname);


/**
 * Finally, get the bookmarked documents from Firebase after already requesting
 * the currently active document.
 */

each(bookmarks(), function (id) {
  get(id);
});


/**
 * Load a Document onto the page.
 *
 * @param {String} id                ID of the document to load.
 * @param {String} state (optional)  State to start in.
 */

function load (id, state) {
  app.loading(true);
  get(id, function (err, doc) {
    if (err) throw err;
    app.load(doc);
    app.loading(false);
    var path = '/' + doc.primary();
    if (state) {
      app[state]();
      path += '/' + state;
    }
    window.history.pushState({}, document.title, path);
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
    if (!doc) {
      doc = new Document();
      doc.save(); // save to persist the defaults to firebase
      window.analytics.track('Created New Document', { id: doc.primary() });
    }
    documents.push(doc);
    callback && callback(null, doc);
  });
}