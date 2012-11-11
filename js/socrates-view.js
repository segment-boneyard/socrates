/*global Socrates Backbone marked _ Rainbow */

Socrates.View = Backbone.View.extend({

    events : {
        'keyup .write-textarea'    : 'onWriteTextareaKeyup',
        'click .read-only-button'  : 'onReadOnlyButtonClick',
        'click .write-only-button' : 'onWriteOnlyButtonClick',
        'click .write-add-button'  : 'onAddDocumentButtonClick',
        'click .write-menu-button' : 'onMenuButtonClick'
    },

    initialize : function (options) {
        _.bindAll(this);

        // Cache some jQuery selectors.
        this.$menu     = this.$('.write-menu');
        this.$textarea = this.$('.write-textarea');
        this.$article  = this.$('.read-article');

        this.$readonly = this.$('.read-only-button');
        this.$writeonly = this.$('.write-only-button');

        // Allow tabs in the textarea using a jQuery plugin.
        this.$el.tabby({tabString:'    '});

        // Make a menu to select documents from.
        this.documentMenu = new Socrates.DocumentMenuView({
            collection : this.model.get('documents'),
            el         : this.$menu
        })
            .on('select', this.onDocumentMenuSelect, this);


        this.model.on('change:document', this.onAppDocumentChange, this);

        var document = this.model.get('document');
        if (document) {
            document
                .on('change:body', this.onDocumentBodyChange, this)
                .on('load', this.onDocumentLoad, this);
        }

    },


    // Actions
    // -------

    render : function () {
        this.renderMenu()
            .renderTextarea()
            .renderArticle();
    },

    renderMenu : function () {
        this.documentMenu.render();
        return this;
    },

    renderTextarea : function () {
        var document = this.model.get('document');

        if (!document) return this;

        this.$textarea.val(document.get('body'));
        return this;
    },

    renderArticle : function () {
        if (!this.model.has('document')) return this;

        // Convert the model's markdown body into html.
        var body = this.model.get('document').get('body');
        var markdown = marked(body);
        var patched = monkey(markdown);
        this.$article.html(patched);

        // Apply code highlighting. We have to convert the highlighting classes
        // that marked.js gives us into ones that Rainbow.js can read first.
        this.$el.find('code').each(function (index, el) {
            var classes = el.className.split(/\s+/);
            _.each(classes, function (className, i) {
                if (className.indexOf('lang-') !== -1) {
                    var language = className.substring('lang-'.length);
                    $(el).attr('data-language', language);
                }
            });
        });
        try { Rainbow.color(); } catch (e) {}
    },


    // Event Handlers
    // --------------

    onWriteTextareaKeyup : function (event) {

        var document = this.model.get('document');

        document.set('body', this.$textarea.val(), {silent: true});
        document.save();
    },

    onAppDocumentChange : function (model, document) {
        var previousDocument = this.model.previous('document');
        if (previousDocument) previousDocument.off('change:body', this.onDocumentBodyChange);
        document.on('change:body', this.onDocumentBodyChange, this);
        document.on('load', this.onDocumentLoad, this);

        this.renderTextarea()
            .renderArticle();
    },


    onDocumentLoad: function () {

        this.renderTextarea();
    },

    onDocumentBodyChange : function (document) {

        this.renderTextarea()
            .renderArticle();
    },

    onDocumentMenuSelect : function (menu, document) {
        this.model.set('document', document);
    },





    onReadOnlyButtonClick : function (event) {
        this.$readonly.toggleState('pressed');
        this.$writeonly.state('pressed', false);
        this.$el.state('write-only', false);
        this.$el.state('read-only', this.$readonly.state('pressed'));
    },

    onWriteOnlyButtonClick : function (event) {
        this.$writeonly.toggleState('pressed');
        this.$readonly.state('pressed', false);
        this.$el.state('read-only', false);
        this.$el.state('write-only', this.$writeonly.state('pressed'));
    },

    onAddDocumentButtonClick : function (event) {
        this.model.goToNewDocument();
    },

    onMenuButtonClick: function (event) {
        this.$menu.slideToggle();
    }

});