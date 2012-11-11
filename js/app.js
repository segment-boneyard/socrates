

var App = Backbone.View.extend({

    initialize: function (options) {

    },

    render: function () {
        console.log('Rendering socrates ..');
    }

});

$(function() {

    var router = new Router();
    Backbone.history.start({pushState: true});

    var socrates = new App({router: router});
    socrates.render();

});