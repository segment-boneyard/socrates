
window.Socrates.Model = window.Backbone.Model.extend({

    defaults : {
        document  : null,
        documents : null
    },

    initialize : function (attributes, options) {
        this.router = new window.Socrates.Router();
    }

});