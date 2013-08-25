
var bind = require('event').bind
  , body = document.body
  , classes = require('classes')
  , documents = require('documents')
  , Editor = require('editor')
  , Nav = require('nav')
  , Router = require('router')
  , uid = require('uid');


/**
 * Editor reference.
 */

var editor;


/**
 * Router.
 */

var router = new Router();


/**
 * Home route.
 */

router.on('/', function (next) {
  router.go('/' + uid());
});


/**
 * Document route.
 */

router.on('/:id/:state?', function (context, next) {
  body.className = 'loading ss-loading';
  documents.fetch(context.params.id, function (err, doc) {
    if (err) throw err;
    if (editor) body.removeChild(editor.el);
    editor = new Editor(doc);
    body.appendChild(editor.el);
    body.className = context.params.state;
    window.analytics.track('Viewed Document', { id: doc.primary() });
  });
});


/**
 * Nav.
 */

var nav = new Nav();

nav.on('select', function (doc) {
  router.go('/' + doc.primary());
});

body.appendChild(nav.el);

documents
  .on('add', nav.add.bind(nav))
  .on('remove', nav.remove.bind(nav));

bind(document.querySelector('.main-menu-nav-button'), 'click', function (e) {
  var el = classes(body);
  if (el.has('navigating')) {
    el.remove('navigating');
  } else {
    el.add('navigating');
    nav.focus();
  }
});


/**
 * Listen.
 */

router.listen();


/**
 * Load documents from Firebase.
 */

documents.load();