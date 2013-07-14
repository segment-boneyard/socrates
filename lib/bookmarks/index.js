
var each = require('each')
  , Set = require('set')
  , store = require('store');


/**
 * Create a set of bookmarks from local storage.
 */

var KEY = 'bookmarks';
var set = new Set(store(KEY));



/**
 * Exports.
 */

module.exports = all;
module.exports.add = add;
module.exports.remove = remove;


/**
 * Get all bookmarks.
 */

function all () {
  return set.values();
}


/**
 * Add a bookmark.
 *
 * @param {String} id  The ID of the bookmark to add.
 */

function add (id) {
  set.add(id);
  save();
}


/**
 * Remove a bookmark.
 *
 * @param {String} id  The ID of the bookmark to remove.
 */

function remove (id) {
  set.remove(id);
  save();
}


/**
 * Save the current bookmarks set.
 */

function save () {
  store(KEY, set.values());
}


/**
 * BACKWARDS COMPATIBILITY: Bookmarks used to be stored under
 * `socrates.bookmarks` and as a comma-separated string. So convert them to the
 * new system gracefully.
 */

var OLD_KEY = 'socrates.bookmarks';

if (store(OLD_KEY)) {
  each(store(OLD_KEY).split(','), add);
  store(OLD_KEY, null);
}