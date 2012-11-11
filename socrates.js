/*global Socrates Backbone */

window.Socrates = {
    firebaseUrl : 'https://socrates.firebaseIO.com/'
};

$(function () {
    var view = new Socrates.View({
        model : new Socrates.Model(),
        el    : $('html')
    }).render();

    Backbone.history.start();
});