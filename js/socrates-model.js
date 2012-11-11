/*global Backbone Socrates _ */

Socrates.Model = Backbone.Model.extend({

    defaults : {
        document  : null,
        documents : null
    },

    bookmarkKey : 'socrates.bookmarks',

    initialize : function (attributes, options) {
        _.bindAll(this);

        this.initializeRouter();
        this.initializeDocuments();

        this.on('change:document', this.onDocumentChange, this);
    },

    initializeRouter : function () {
        this.router = new Backbone.Router({
            routes : {
               ''    : 'home',
               ':id' : 'document'
            }
        })
            .on('route:home', this.onRouterHome, this)
            .on('route:document', this.onRouterDocument, this);
    },

    initializeDocuments : function () {
        var documents = new Socrates.DocumentCollection();
        this.set({ documents : documents });

        var bookmarks = this.readBookmarks();

        _.each(bookmarks, this.addDocument);

        documents.on('add remove', this.writeBookmarks, this);
        documents.on('remove', this.onDocumentRemove, this);
    },

    goToNewDocument: function () {
        var id = this.generateRandomDocumentId(7);
        this.goToDocument(id);
    },

    goToDocument: function (id) {
        this.router.navigate(id, {trigger: true});
    },

    addDocument : function (id) {
        var document = new Socrates.DocumentModel({id: id});
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

    writeBookmarks : function () {
        var ids = this.get('documents').map(function (document) {
            return document.id;
        });

        localStorage.setItem(this.bookmarkKey, ids.join(','));
    },


    // Route Handlers
    // --------------

    onRouterHome : function () {
        this.goToNewDocument();
    },

    onRouterDocument : function (id) {
        var documents = this.get('documents');

        var document = documents.find(function (document) {
            return id === document.id;
        });

        this.set('document', document || this.addDocument(id));
    },

    // Event Handlers

    onDocumentChange : function (model, document) {

        this.router.navigate(document.id);
    },

    onDocumentRemove : function (removed) {

        var selected = this.get('document');
        if (selected.id === removed.id) {
            // the current document got removed, go somewhere else
            var otherDocument = this.get('documents').last();
            if (otherDocument) this.goToDocument(otherDocument.id);
            else this.goToNewDocument();
        }
    },


    // Helpers
    // -------

    generateRandomDocumentId : function (length) {
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