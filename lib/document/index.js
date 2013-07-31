
var defaults = require('model-defaults')
  , firebase = require('model-firebase')('https://socrates.firebaseio.com/documents/')
  , memoize = require('model-memoize')
  , model = require('model')
  , uid = require('uid');


/**
 * Document.
 */

var Document = module.exports = model('document')
  .use(defaults)
  .use(firebase)
  .use(memoize)
  .attr('id', { default : function () { return uid(); } })
  .attr('created', { default : function () { return new Date(); } })
  .attr('title', { default : '' })
  .attr('body', { default : '' });