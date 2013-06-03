
var statics = require('./statics')
  , protos = require('./protos');


/**
 * Mixin our plugin.
 */

module.exports = function (url) {
  return function (Model) {
    Model.firebase = new window.Firebase(url);
    for (var key in statics) Model[key] = statics[key];
    for (var key in protos) Model.prototype[key] = protos[key];
    Model.on('construct', construct);
  };
};


/**
 * On construct, start listening for firebase changes.
 */

function construct (model, attrs) {
  model.firebase().on('value', function (snapshot) {
    var attrs = snapshot.val();
    if (attrs) model.set(attrs);
  });
}