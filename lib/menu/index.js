
var bind = require('bind')
  , dom = require('dom')
  , Emitter = require('emitter')
  , events = require('events')
  , prevent = require('prevent')
  , reactive = require('reactive')
  , stop = require('stop')
  , type = require('type');


module.exports = Menu;


/**
 * Initialize a new `Menu`.
 */

function Menu (collection) {
  Emitter.call(this);
  this.items = {};
  this.el = dom('<ul>');

  this.onkeydown = bind(this, this.onkeydown); // keep bound to this

  this.events = events(this.el.get(0), this);
  this.events.bind('hover');
  this.events.bind('focus');
  this.events.bind('blur');

  if (collection) collection.each(this.add.bind(this));
}


/**
 * Mixin emitter.
 */

Menu.prototype = new Emitter();


/**
 * Deselect selected menu items.
 * @api public
 */

Menu.prototype.deselect = function(){
  this.el.find('.selected').removeClass('selected');
  return this;
};


/**
 * Focus the next menu item in `direction`.
 *
 * @param {String} direction  'previous' or 'next'
 * @api public
 */

Menu.prototype.move = function (direction) {
  var previous = this.el.find('.selected').at(0);

  var next = previous.length
    ? previous[direction]
    : this.el.find('li:first-chid');

  if (next.length) {
    previous.removeClass('selected');
    next.addClass('selected');
  }
  return this;
};


/**
 * Add menu item with the given `model` and optional `view` and callback `fn`.
 *
 * @param {Object}   model
 * @param {Object}   view (optional)
 * @param {Function} fn (optional)
 * @return {Menu}
 * @api public
 */

Menu.prototype.add = function (model, view, fn) {
  // model, [view], fn
  if ('function' === type(view)) {
    fn = view;
    view = undefined;
  }

  var el = this.template();
  reactive(el.get(0), model, view);
  el
    .appendTo(this.el)
    .on('click', function (e) {
      prevent(e);
      stop(e);
      fn && fn();
    });

  this.items[model.id || model.primary()] = el;
  this.emit('add', model);
  return this;
};


/**
 * Remove menu item with the given `slug`.
 *
 * @param {String} slug
 * @return {Menu}
 * @api public
 */

Menu.prototype.remove = function (id) {
  var item = this.items[id];
  if (!item) throw new Error('no menu item named "' + id + '"');
  item.el.remove();
  delete this.items[id];
  this.emit('remove', item);
  return this;
};


/**
 * Check if this menu has an item with the given `slug`.
 *
 * @param {String} slug
 * @return {Boolean}
 * @api public
 */

Menu.prototype.has = function (id) {
  return !!this.items[id];
};


/**
 * Set or render the template for the menu.
 *
 * @param {String|Function} template (optional)  The template string.
 */

Menu.prototype.template = function (template) {
  if (!template) {
    if ('function' === type(this._template)) return this._template();
    else return dom(this._template);
  }
  this._template = template;
};


/**
 * Event handlers.
 */

Menu.prototype.onhover = function (e) {
  this.deselect();
};

Menu.prototype.onfocus = function (e) {
  dom(document).bind('keydown', this.onkeydown);
};

Menu.prototype.onblur = function (e) {
  dom(document).unbind('keydown', this.onkeydown);
};

Menu.prototype.onkeydown = function(e){
  switch (e.keyCode) {
    // esc
    case 27:
      break;
    // enter
    case 13:
      break;
    // up
    case 38:
      prevent(e);
      this.move('prev');
      break;
    // down
    case 40:
      prevent(e);
      this.move('next');
      break;
  }
};

