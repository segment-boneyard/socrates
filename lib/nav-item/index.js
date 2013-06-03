
var dom = require('dom')
  , reactive = require('reactive')
  , template = require('./template');


module.exports = NavItem;


/**
 * Initialize a new `NavItem`.
 */

function NavItem (model) {
  this.el = dom(template);
  reactive(this.el.get(0), model);
  model.on('change', function (title) {
    console.log(title);
  });
}