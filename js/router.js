

var Router = Backbone.Router.extend({

    routes: {
       '/': 'home',
       '/:id': 'doc'
    },

    initialize: function (options) {

    },

    home: function () {
        console.log('Hit home');
        var id = randomId(8);
        this.navigate('/' + id);
    },

    doc: function (id) {
        console.log('Opening document : ' + id);
    }

});