
window.Socrates.Router = window.Backbone.Router.extend({

    routes: {
       '':    'home',
       ':id':   'doc'
    },

    home: function () {
        this.navigate(randomId(7), {trigger: true});
    },

    doc: function (id) {
        this.trigger('open', id);
    }

});