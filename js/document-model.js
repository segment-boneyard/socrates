/*global Socrates Backbone Firebase */

Socrates.DocumentModel = Backbone.Model.extend({

    defaults : {
        title : 'Untitled',
        body  : ''
    },

    urlRoot : Socrates.firebase.base + '/documents/',

    initialize : function (attributes, options) {
        this.firebase = new Firebase(this.urlRoot + this.id);

        this.firebase.on('value', function (snapshot) {
            var val = snapshot.val();
            if (val) this.set(val);
        });
    },

    save : function () {
        this.firebase.set(this.toJSON());
    }

});