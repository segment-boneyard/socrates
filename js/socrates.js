/*global Socrates Backbone */

window.Socrates = {
    Document   : { Menu : { Item : {} } },
    firebase   : {
        base: 'https://socrates.firebaseIO.com/'
    }
};

// Apply the Backbone GetSet mixin to all views.
window.Backbone.mixin.getset.apply(window.Backbone.View);

$(function () {
    var view = new Socrates.View({
        model: new Socrates.Model()
    }).render();

    Backbone.history.start();
});