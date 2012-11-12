/*global Backbone Socrates _ */

var ID_CHARACTERS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
var ID_LENGTH     = 7;

Socrates.Model = Backbone.Model.extend({

    defaults : {
        document  : null,
        documents : null,
        state     : null
    },

    bookmarkKey : 'socrates.bookmarks',

    initialize : function (attributes, options) {
        _.bindAll(this);

        this.initializeRouter();
        this.initializeDocuments();

        this.on('change:document', this.onDocumentOrStateChange)
            .on('change:state', this.onDocumentOrStateChange);
    },

    initializeRouter : function () {
        this.router = new Backbone.Router({
            routes : {
               ''             : 'home',
               ':id(/:state)' : 'document'
            }
        })
            .on('route:home', this.onHomeRoute)
            .on('route:document', this.onDocumentRoute);
    },

    initializeDocuments : function () {
        var documents = new Socrates.DocumentCollection()
            .on('add remove', this.writeBookmarks)
            .on('remove', this.onDocumentRemove);

        this.set('documents', documents, {silent:true});

        _.each(this.readBookmarks(), this.addDocument);
    },

    // Fixtures
    // --------

    randomFixture: function () {
        var index = _.random(0, _.size(Socrates.fixtures.random)-1);
        return Socrates.fixtures.random[index];
    },

    pickFixture: function () {
        if (localStorage.getItem(this.bookmarkKey)) {
            return this.randomFixture();
        } else {
            return Socrates.fixtures.onboarding;
        }
    },


    // Actions
    // -------

    addDocument : function (id, body) {
        if (!_.isString(body)) body = '';

        var document = new Socrates.DocumentModel({
            id : id,
            body: body
        });

        this.get('documents').add(document);

        window.analytics.track('Add Document', {
            id : id
        });

        return document;
    },

    newDocument : function (body) {
        window.analytics.track('Create New Document');

        return this.addDocument(this.generateDocumentId(), body);
    },

    readBookmarks : function () {
        var bookmarkString = localStorage.getItem(this.bookmarkKey);
        return bookmarkString ? bookmarkString.split(',') : [];
    },

    writeBookmarks : function () {
        var ids = this.get('documents').map(function (document) {
            return document.id;
        });
        localStorage.setItem(this.bookmarkKey, ids.join(','));
    },


    // Route Handlers
    // --------------

    onHomeRoute : function () {
        this.set('document', this.newDocument(this.pickFixture()));

        window.analytics.track('Visit Home Page');
    },

    onDocumentRoute : function (id, state) {
        var document = this.get('documents').find(function (document) {
            return id === document.id;
        });
        document || (document = this.addDocument(id));

        this.set('document', document);
        if (state === 'read' || state ==='write') this.set('state', state);

        window.analytics.track('Visit Document Page', {
            id    : id,
            state : state
        });
    },

    // Event Handlers
    // --------------

    onDocumentOrStateChange : function (model) {
        if (!this.has('document')) return;

        var document = this.get('document');
        var state = this.get('state');

        var fragment = document.id;
        if (state) fragment += '/'+state;

        this.router.navigate(fragment);
    },

    onDocumentRemove : function (removedDocument) {
        var openDocument = this.get('document');

        // If the open document wasn't removed, don't do anything fancy.
        if (openDocument.id !== removedDocument.id) return;

        // Otherwise, we need to promote another document. Try to take the last
        // of the documents, otherwise make a fresh one.
        var document = this.get('documents').last() || this.newDocument();
        this.set('document', document);
    },


    // Helpers
    // -------

    // Generates a random new document id.
    generateDocumentId : function () {
        var id = '';
        for (var x = 0; x < ID_LENGTH; x++) {
            id += ID_CHARACTERS.charAt(Math.floor(Math.random() * 62));
        }

        return id;
    }

});