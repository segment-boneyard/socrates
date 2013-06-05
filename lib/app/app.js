
var $ = require('dom')
  , bookmarks = require('bookmarks')
  , Collection = require('collection')
  , Document = require('document')
  , each = require('each')
  , Editor = require('editor')
  // , mathjax = require('./filters/mathjax')
  , Menu = require('menu')
  , prevent = require('prevent')
  , rainbow = require('./filters/rainbow')
  , Router = require('router')
  , shortcut = require('mousetrap')
  , value = require('value');


/**
 * Configure Editors.
 */

Editor
  .use(rainbow);
  // .use(mathjax)


/**
 * Keep a reference to all `documents`, and the current `doc` and `editor`.
 */

var doc
  , documents = new Collection()
  , editor;


/**
 * Cache DOM elements.
 */

var app = $('body')
  , nav = $('nav')
  , search = $('input')
  , textarea = $('textarea')
  , article = $('article')
  , navButton = $('.nav-button')
  , addButton = $('.add-button')
  , writeButton = $('.write-button')
  , readButton = $('.read-button');


/**
 * Make a menu.
 */

var menu = new Menu();
nav.append(menu.el.get(0));

menu.template('<li><a data-text="title"></a></li>');

search.on('change', function (e) {
  var string = value(search.get(0));
  menu.filter(string);
});


/**
 * Update menu and bookmarks when documents change.
 */

documents
  .on('add', function (doc) {
    var id = doc.primary();
    bookmarks.add(id);
    menu.add(doc, function () {
      load(id);
    });
  })
  .on('remove', function (doc) {
    var id = doc.primary();
    bookmarks.remove(id);
    menu.remove(id);
  });


/**
 * Bind to our buttons and shortcuts.
 */

navButton.on('click', open);
shortcut.bind('ctrl+alt+o', open);

addButton.on('click', create);
shortcut.bind('ctrl+alt+n', create);

writeButton.on('click', write);
shortcut.bind('ctrl+alt+left', write);

readButton.on('click', read);
shortcut.bind('ctrl+alt+right', read);

shortcut.bind('esc', close);


/**
 * Start routing.
 */

var router = new Router();

router.get('/:id/:state', load);
router.get('/:id', load);
router.get('/', load);

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
  app.addClass('loading');
  get(id, function (err, doc) {
    if (err) throw err;
    editor = new Editor(doc);
    textarea = textarea.replace(editor.textarea);
    article = article.replace(editor.article);
    mode(state);
    app.removeClass('loading');
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


/**
 * Change the mode of the app to either default, read or write.
 *
 * @param {String} mode (optional)  State to change to, or nothing for default.
 */

function mode (value) {
  app
    .toggleClass('reading', value === 'read')
    .toggleClass('writing', value === 'write')
    .toggleClass('navigating', value === 'nav');
}


/**
 * State methods.
 */

function close () {
  mode(null);
}

function create () {
  router.dispatch('/');
}

function write () {
  app.hasClass('writing') ? close() : mode('write');
}

function read () {
  app.hasClass('reading') ? close() : mode('read');
}

function open () {
  app.hasClass('navigating') ? close() : mode('nav');
}