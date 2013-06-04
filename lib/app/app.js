
var bookmarks  = require('bookmarks')
  , Collection = require('collection')
  , Document   = require('document')
  , dom        = require('dom')
  , each       = require('each')
  , Editor     = require('editor')
  , find       = require('find')
  , Firebase   = window.Firebase
  // , mathjax    = require('./filters/mathjax')
  , map        = require('map')
  , Menu       = require('menu')
  , rainbow    = require('./filters/rainbow')
  , Router     = require('router')
  , store      = require('store')
  , type       = require('type')
  , uid        = require('uid');


/**
 * Keep a reference to the documents, current document and editor.
 */

var doc
  , documents = new Collection()
  , editor;


/**
 * DOM elements.
 */

var app         = dom('html')
  , article     = dom('article')
  , nav         = dom('nav')
  , textarea    = dom('textarea')
  , addButton   = dom('.add-button')
  , menuButton  = dom('.menu-button')
  , readButton  = dom('.read-button')
  , writeButton = dom('.write-button');


/**
 * Create our documents menu.
 */

var menu = new Menu();
nav.append(menu.el.get(0));

menu.template('<li><a data-text="title"></a></li>');

documents.on('add', function (doc) {
  menu.add(doc, function () {
    load(doc.primary());
  });
});


/**
 * Add filters to our Editors's output.
 */

Editor
  .use(rainbow);
  // .use(mathjax)


/**
 * Retrieve all of the bookmarks with Firebase.
 */

each(bookmarks(), get);


/**
 * Routes.
 */

var router = new Router();

router.get('/:id/:state', load);
router.get('/:id', load);
router.get('/', load);


/**
 * Start.
 */

router.dispatch(location.pathname);


/**
 * Load a document into the editor.
 *
 * @param {String} id               The ID of the document.
 * @param {String} state (optiona)  What state to start in.
 */

function load (id, state) {
  doc = documents.find('primary() === "' + id + '"');
  if (!doc) doc = create({ id: id });
  editor = new Editor(doc);
  textarea = textarea.replace(editor.textarea);
  article = article.replace(editor.article);
  mode(state);
  window.analytics.track('Viewed Document', { id: id, state: state });
}


/**
 * Get a document from Firebase.
 */

function get (id, fn) {
  var doc;
  Document.get(id, function (err, doc) {
    if (!doc) doc = new Document();
    documents.push(doc);
    fn && fn(null, doc);
  });
}


/**
 * Create a new document.
 *
 * @param {Object} attrs  The attributes to create the document with.
 */

function create (attrs) {
  var doc = new Document(attrs);
  bookmarks.add(doc.primary());
  window.analytics.track('Created New Document');
  return doc;
}


/**
 * Change the mode of the app to either default, read or write.
 *
 * @param {String} mode (optional)  State to change to, or nothing for default.
 */

function mode (value) {
  app
    .toggleClass('reading', value === 'read')
    .toggleClass('writing', value === 'write');
}