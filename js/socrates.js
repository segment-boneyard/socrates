
window.Socrates = {
    Document   : {},
    firebase   : {
        base: 'https://socrates.firebaseIO.com/'
    }
};

$(function () {

    var model = new Socrates.Model();

    var view = new Socrates.View({
        model: model
    });

    view.render();

    Backbone.history.start();
});