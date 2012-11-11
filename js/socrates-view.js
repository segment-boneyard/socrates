/*global Socrates Backbone marked _ Rainbow */

Socrates.View = Backbone.View.extend({

    events : {
        'keyup .write-textarea' : 'onWriteTextareaKeyup'
    },

    initialize : function (options) {
        this.model.on('change:document', this.onDocumentChange);
        var document = this.model.get('document');
        if (document) document.on('change:body', this.onDocumentBodyChange);

        // Cache some jQuery selectors.
        this.$menu     = this.$('.write-menu');
        this.$textarea = this.$('.write-textarea');
        this.$article  = this.$('.read-article');

        // Allow tabs in the textarea using a jQuery plugin.
        this.$el.tabby({tabString:'    '});

        // Make a menu to select documents from.
        this.documentMenu = new Socrates.DocumentMenuView({
            collection : this.model.get('documents'),
            el         : this.$menu
        })
            .on('select', this.onDocumentMenuSelect, this);
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
        if (!this.model.has('document')) return this;

        this.$textarea.html(this.model.get('document').get('body'));
        return this;
    },

    renderArticle : function () {
        if (!this.model.has('document')) return this;

        // Convert the model's markdown body into html.
        var markdown = marked(this.model.get('document').get('body'));
        this.$article.html(markdown);

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
        this.model.set('body', this.$('.write-textarea').val());
        this.model.save();
    },

    onDocumentChange : function (model, document) {
        var previousDocument = this.model.previous('document');
        if (previousDocument) previousDocument.off('change:body', this.onDocumentBodyChange);
        document.on('change:body', this.onDocumentBodyChange);

        this.renderTextarea()
            .renderArticle();
    },

    onDocumentBodyChange : function (document) {
        this.renderArticle();
    },

    onDocumentMenuSelect : function (menu, document) {
        this.model.set('document', document);
    }

});