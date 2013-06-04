
var MathJax = require('mathjax');


/**
 * Configure.
 *
 * http://docs.mathjax.org/en/latest/config-files.html#the-tex-ams-mml-htmlormml-configuration-file
 */

MathJax.Hub.Config({
  config: ["MMLorHTML.js"],
  jax: ["input/TeX","input/MathML","output/HTML-CSS","output/NativeMML"],
  extensions: ["tex2jax.js","mml2jax.js","MathMenu.js","MathZoom.js"],
  TeX: {
    extensions: ["AMSmath.js","AMSsymbols.js","noErrors.js","noUndefined.js"]
  },
  tex2jax : {
    displayMath : [['$$','$$'], ['\\[','\\]']],
    inlineMath  : [['\\(','\\)']]
  }
});


/**
 * Filter dom and turn it into MathJax.
 */

module.exports = function (Editor) {
  Editor.filter('dom', function (dom, done) {
    MathJax.Hub.Queue(['Typeset'], MathJax.Hub, dom);
    MathJax.Hub.Queue(function () {
      done(null, dom);
    });
  });
};