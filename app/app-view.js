/*global Socrates Backbone marked _ Rainbow */

Socrates.View = Backbone.View.extend({

    youtubeEmbedTemplate : _.template('<iframe width="560" height="315" src="http://www.youtube.com/embed/<%= id %>" frameborder="0" allowfullscreen></iframe>'),

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
        this.$menu            = this.$('.write-menu');
        this.$textarea        = this.$('.write-textarea');
        this.$article         = this.$('.read-article');
        this.$readOnlyButton  = this.$('.read-only-button');
        this.$writeOnlyButton = this.$('.write-only-button');

        // Allow tabs in the textarea using a jQuery plugin.
        this.$el.tabby({tabString:'    '});

        // Make a menu to select documents from.
        this.documentMenu = new Socrates.DocumentMenuView({
            collection : this.model.get('documents'),
            el         : this.$menu
        })
            .on('select', this.onDocumentMenuSelect, this);


        // Attach document event handlers.
        this.model.on('change:document', this.onAppDocumentChange, this);
        var document = this.model.get('document');
        if (document) {
            document
                .on('change:body', this.onDocumentBodyChange, this)
                .on('load', this.onDocumentLoad, this);
        }

        // Debounce applying the youtube filter since it's kinda intensive.
        this.renderYoutubeFilter = _.debounce(this.renderYoutubeFilter, 1000);
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
        var markdown = marked(this.model.get('document').get('body'));
        this.$article.html(markdown);

        this.renderYoutubeFilter();

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

    renderYoutubeFilter : function () {
        var self = this;

        // Create embeds for any youtube links.
        this.$article.find('a[href*="youtube.com/watch?v="]').each(function (i, el) {
            var youtubeId = el.href.match(/\?v=([\w-]+)/)[1];
            var embed     = self.youtubeEmbedTemplate({ id : youtubeId });
            $(embed).insertBefore(el);
        });
    },


    // Event Handlers
    // --------------

    onWriteTextareaKeyup : function (event) {

        var document = this.model.get('document');

        document.set('body', this.$textarea.val());
        document.save();
    },

    onReadOnlyButtonClick : function (event) {
        this.$readOnlyButton.toggleState('pressed');
        this.$writeOnlyButton.state('pressed', false);
        this.$el.state('write-only', false);
        this.$el.state('read-only', this.$readOnlyButton.state('pressed'));
    },

    onWriteOnlyButtonClick : function (event) {
        this.$writeOnlyButton.toggleState('pressed');
        this.$readOnlyButton.state('pressed', false);
        this.$el.state('read-only', false);
        this.$el.state('write-only', this.$writeOnlyButton.state('pressed'));
    },

    onAddDocumentButtonClick : function (event) {
        this.model.goToNewDocument();
    },

    onMenuButtonClick: function (event) {
        this.$menu.slideToggle();
    },

    onAppDocumentChange : function (model, document) {
        var previousDocument = this.model.previous('document');
        if (previousDocument) previousDocument.off('change:body', this.onDocumentBodyChange);
        document.on('change:body', this.onDocumentBodyChange, this);
        document.on('load', this.onDocumentLoad, this);

        this.renderTextarea()
            .renderArticle();
    },


    onDocumentLoad : function (document) {
        this.renderTextarea();
    },

    onDocumentBodyChange : function (document) {
        this.renderTextarea()
            .renderArticle();
    },

    onDocumentMenuSelect : function (menu, document) {
        this.model.set('document', document);
    }

});