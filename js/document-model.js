/*global Socrates Backbone Firebase */

Socrates.DocumentModel = Backbone.Model.extend({

    defaults : {
        title : 'Untitled',
        body  : ''
    },

    urlRoot : Socrates.firebase.base + 'documents/',

    initialize : function (attributes, options) {
        _.bindAll(this);

        this.generateTitle();
        this.initializeFirebase();

        this.on('change:body', this.generateTitle);
    },

    generateTitle: function () {
        var body = this.get('body');
        var title = 'Untitled - ' + this.id;

        var markdown = marked(body);
        var headings = $(markdown).filter('h1');
        if (headings.length > 0) title = $(headings[0]).text();

        this.set('title', title);
    },

    initializeFirebase: function () {
        var self = this;

        this.firebase = new Firebase(this.urlRoot + this.id);

        this.firebase.on('value', function (snapshot) {
            var val = snapshot.val();
            if (val) self.set(val);
            self.trigger('load', this);
        });
    },

    save : function () {
        this.firebase.set(this.toJSON());
    }

});