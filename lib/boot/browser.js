
var App = require('app')
  , documents = require('documents')
  , loading = require('loading')
  , Router = require('router')
  , uid = require('uid');


/**
 * App.
 */

var app = new App();
document.body.appendChild(app.el);


/**
 * Router.
 */

var router = new Router()
  .on('/', function () { router.go('/' + uid()); })
  .on('/:document/:state?', begin, doc, state, end)
  .listen();


/**
 * Load documents from Firebase.
 */

documents.load();


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
  documents.get(context.document, function (err, doc) {
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