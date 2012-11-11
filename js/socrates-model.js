/*global Backbone Socrates _ */

window.Socrates.Model = window.Backbone.Model.extend({

    defaults : {
        document  : null,
        documents : null
    },

    bookmarkKey : 'socrates.bookmarks',

    initialize : function (attributes, options) {
        this.initializeRouter();
        this.initializeDocuments();
    },

    initializeRouter : function () {
        this.router = new Backbone.Router({
            routes : {
               ''    : 'home',
               ':id' : 'document'
            }
        })
            .on('home', this.onRouterHome)
            .on('doc', this.onRouterDocument);
    },

    initializeDocuments : function () {
        var documents = new window.Socrates.Document.Collection();
        var bookmarks = this.readBookmarks();

        _.each(bookmarks, this.addDocument);

        this.set({ documents : documents });
    },

    addDocument : function (id) {
        var document = new window.Socrates.Document.Model({id: id});
        this.get('documents').add(document);
        return document;
    },

    readBookmarks : function () {
        var bookmarkStr = localStorage.getItem(this.bookmarkKey);
        if (bookmarkStr) {
            return bookmarkStr.split(',');
        } else {
            return [];
        }
    },


    // Route Handlers
    // --------------

    onRouterHome : function () {
        this.router.navigate(this.generateRandomDocId(7), {trigger: true});
    },

    onRouterDocument : function (id) {
        var documents = this.get('documents');

        var document = documents.find(function (document) {
            return id === document.id;
        });

        this.set('document', document || this.addDocument(id));
    },


    // Helpers
    // -------

    generateRandomDocId : function (length) {
        var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
        var id = '';
        var x;
        var i;

        for (x = 0; x < length; x += 1) {
            i = Math.floor(Math.random() * 62);
            id += chars.charAt(i);
        }

        return id;
    }

});