
var bookmarks  = require('bookmarks')
  , Collection = require('collection')
  , Document   = require('document')
  , dom        = require('dom')
  , each       = require('each')
  , Editor     = require('editor')
  , find       = require('find')
  , Firebase   = window.Firebase
  , map        = require('map')
  , Nav        = require('nav')
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

var menu = new Nav();
nav.append(menu.el.get(0));
documents.on('add', function (doc) {
  menu.add(doc, function () {
    load(doc.primary());
  });
});


/**
 * Retrieve all of the bookmarks with Firebase.
 */

each(bookmarks(), function (id) {
  Document.get(id, function (err, doc) {
    if (!doc) doc = new Document();
    documents.push(doc);
  });
});


/**
 * Routes.
 */

var router = new Router();

router.get('/:id/:state', load);
router.get('/:id', load);
router.get('/', function () {
  var id = uid();
  bookmarks.add(id);
  router.dispatch('/' + id);
});


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
  doc = find(documents, "id === '" + id + "'");
  if (!doc) doc = new Document();
  editor = new Editor(doc);
  textarea = textarea.replace(editor.textarea);
  article = article.replace(editor.article);
  mode(state);
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