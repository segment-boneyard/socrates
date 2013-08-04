
var express = require('express')
  , hbs = require('hbs');


/**
 * App.
 */

var app = module.exports = express();


/**
 * Settings.
 */

app
  .set('views', __dirname)
  .engine('html', hbs.__express);


/**
 * Home page.
 */

app.get('*', function (req, res, next) {
  res.render('index.html');
});