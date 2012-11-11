
window.Socrates.Model = window.Backbone.Model.extend({

    defaults : {
        document  : null,
        documents : null
    },

    bookmarkKey: 'socrates.bookmarks',

    initialize : function (attributes, options) {
        this.initializeRouter();
        this.initializeDocuments();
    },

    initializeRouter: function () {
        this.router = new window.Socrates.Router();
    },

    initializeDocuments : function () {
        var documents = new window.Socrates.Document.Collection();
        var bookmarks = this.readBookmarks();

        _.each(bookmarks, function (id) {
            documents.add(new window.Socrates.Document.Model({id: id}));
        });

        this.set({ documents: documents });
    },

    readBookmarks : function () {
        var bookmarkStr = localStorage.getItem(this.bookmarkKey);
        if (bookmarkStr) {
            return bookmarkStr.split(',');
        } else {
            return [];
        }
    }

});