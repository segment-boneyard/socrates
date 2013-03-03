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

        _.each(this.readBookmarks(), this.fetchDocument);
    },


    // Actions
    // -------

    fetchDocument : function (id, body) {
        if (!_.isString(body)) body = '';

        var document = new Socrates.DocumentModel({
            id   : id,
            body : body
        });

        this.get('documents').add(document);

        window.analytics.track('Fetch Document', {
            id    : id,
            title : document.get('title')
        });

        return document;
    },

    createDocument : function (body) {
        window.analytics.track('Create New Document');

        return this.fetchDocument(this.generateDocumentId(), body);
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
        var body = ''; // blank slate for an experienced user
        if (!localStorage.getItem(this.bookmarkKey))
            body = onboarding; // onboarding text for a new user 

        this.set('document', this.createDocument(body));

        window.analytics.track('Visit Home Page');
    },

    onDocumentRoute : function (id, state) {
        var document = this.get('documents').find(function (document) {
            return id === document.id;
        });
        document || (document = this.fetchDocument(id));

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

        this.router.navigate(fragment, {replace:true});
    },

    onDocumentRemove : function (removedDocument) {
        var openDocument = this.get('document');

        // If the open document wasn't removed, don't do anything fancy.
        if (openDocument.id !== removedDocument.id) return;

        // Otherwise, we need to promote another document. Try to take the last
        // of the documents, otherwise make a fresh one.
        var document = this.get('documents').last() || this.createDocument();
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

var onboarding = [
    '# What the _heck_ is this?',
    'Socrates lets you write Markdown with whoever you want. Write words on the left, read _real_ similar words on the right, and send out the link!',
    '',
    'It\'s a weekend project by [@ivolo][1] and [@ianstormtaylor][2]. We we\'re always sending around Stypis and Etherpads while working on [Segment.io][3], but we really wanted to just write and read in Markdown instead. So that\'s what we built. Thanks to [Firebase][4], it was incredibly easy and it\'s all realtime! You can see all the code [on Github][5].',
    '',
    'Socrates updates for everyone in real time, but is best when edited by a single person at a time.',
    '',
    'More importantly though, erase this junk and start writing your own stuff...',
    '',
    '[1]: https://twitter.com/ivolo',
    '[2]: https://twitter.com/ianstormtaylor',
    '[3]: https://segment.io',
    '[4]: https://firebase.com',
    '[5]: https://github.com/segmentio/socrates',
    '',
    '---',
    '',
    'Oh, and you can embed Youtube videos too, so...',
    '',
    'http://www.youtube.com/watch?v=sdRm4hhb8wY'
].join('\n');

var random = [
    [
        '> I stare in the water at my own sweet reflection,',
        '>',
        '> And I feel a feeling of warm sweet affection.',
        '>',
        '> Why doesn\'t my body do the things that I want?',
        '>',
        '> For lack of exercise, it\'s surely the cause.\n',
        '– by **Beverly Dingus**, a poem.\n\n',
        '[On Health](http://www.youtube.com/watch?v=sYMYktsKmSk)'
    ].join('\n')
];

onboarding = [
    '# Socrates now supports LaTeX Math!\n',
    'If you haven\'t used it before, Socrates is a real-time [markdown](http://daringfireball.net/projects/markdown/) editor in your browser. And **today we added support for beautiful math**, using [MathJax](http://mathjax.com/)!\n',

    'Let\'s derive the quadratic formula. Starting with:',
    '$$ ax^2 + bx + c = 0 $$\n',

    'We\'ll move around the constant terms and coefficients:',
    '$$ ax^2 + bx = -c $$',
    '$$ x^2 + \\frac{b}{a} x = -\\frac{c}{a} $$\n',

    'Then we add a new mystery constant so that things will simplify later:',
    '$$ x^2 + \\frac{b}{a} x + \\frac{b^2}{4a^2} = -\\frac{c}{a}  + \\frac{b^2}{4a^2} $$\n',

    'Then it\'s a simple matter of boiling this down to the final solution:',
    '$$ x^2 + \\frac{b}{a} x + \\frac{b^2}{4a^2} = \\frac{b^2 - 4ac}{4a^2} $$',
    '$$ \\left( x + \\frac{b}{2a} \\right)^2 = \\frac{b^2 - 4ac}{4a^2} $$',
    '$$ x + \\frac{b}{2a} = \\pm \\sqrt{ \\frac{b^2 - 4ac}{4a^2} } $$',
    '$$ x = - \\frac{b \\pm \\sqrt{ b^2 - 4ac } }{2a} $$\n',

    '$$ \\Box $$\n',

    'Keeping all of the LaTeX math syntax in your head is no easy feat, but you\'ll find the [Art of Problem Solving Wiki](http://www.artofproblemsolving.com/Wiki/index.php/LaTeX:Symbols) is an invaluable reference.\n',

    'Happy mathing!'
].join('\n');
random = [onboarding];