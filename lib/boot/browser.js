
var App = require('app')
  , bookmarks = require('bookmarks')
  , Collection = require('collection')
  , Document = require('document')
  , each = require('each')
  , loading = require('loading')
  , Router = require('router')
  , uid = require('uid');


/**
 * App.
 */

var app = new App()

  .on('remove', function (document) {
    documents.remove(document);
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
 * Router.
 */

var router = new Router();

router.on('/', function (next) {
  router.go('/' + uid());
});

router.on('/:document/:state?', begin, doc, state, end);

router.listen();


/**
 * Finally, get the bookmarked documents from Firebase after already requesting
 * the currently active document.
 */

each(bookmarks(), function (id) {
  get(id);
});


/**
 * Put the app in a loading state.
 *
 * @param {Object} context
 * @param {Function} next
 */

function begin (context, next) {
  context.loaded = loading(app.el);
  next();
}


/**
 * Take the app out of a loading state.
 *
 * @param {Object} context
 * @param {Function} next
 */

function end (context, next) {
  context.loaded && context.loaded();
  next();
}


/**
 * Load the current document into the app.
 *
 * @param {Object} context
 * @param {Function} next
 */

function doc (context, next) {
  get(context.document, function (err, doc) {
    if (err) throw err;
    app.load(doc);
    window.analytics.track('Viewed Document', { id: doc.primary() });
    next();
  });
}


/**
 * Apply the current state to the app.
 *
 * @param {Object} context
 * @param {Function} next
 */

function state (context, next) {
  var state = context.state;
  if (state) app[state]();
  next();
}


/**
 * Retrieve a document.
 *
 * @param {String} id
 * @param {Function} callback(err, doc)
 */

function get (id, callback) {
  Document.get(id, function (err, doc) {
    if (!doc) doc = create();
    if (!documents.has(doc)) documents.add(doc);
    callback && callback(null, doc);
  });
}


/**
 * Create a new document.
 *
 * @return {Document}
 */

function create () {
  var doc = new Document();
  doc.save(); // save to persist the defaults to Firebase
  window.analytics.track('Created New Document', { id: doc.primary() });
  return doc;
}