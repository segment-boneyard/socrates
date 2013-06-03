
var express = require('express')
  , app = module.exports = express();


/**
 * Settings.
 */

app.use(express.static(__dirname + '/public'));


/**
 * Mount.
 */

app.use(require('./lib/app'));


/**
 * Listen.
 */

var port = process.env.PORT || 5000;

app.listen(port, function () {
  console.log('Listening on ' + port + '...');
});