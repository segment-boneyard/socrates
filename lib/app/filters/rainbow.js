
var Rainbow = require('rainbow');


/**
 * Export our plugin.
 */

module.exports = function (Editor) {
  Editor.filter('dom', function (dom, done) {
    Rainbow.color(dom, function () {
      done(null, dom);
    });
  });
};