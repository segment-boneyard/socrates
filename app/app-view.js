/*global Socrates Backbone marked _ Rainbow */

var $window = $(window);
var MININUM_WIDTH = 1000;

Socrates.View = Backbone.View.extend({

    youtubeEmbedTemplate : _.template('<iframe width="560" height="315" src="http://www.youtube.com/embed/<%= id %>" frameborder="0" allowfullscreen></iframe>'),

    events : {
        'keyup .document-textarea' : 'onTextareaKeyup',
        'click .read-only-button'  : 'onReadOnlyButtonClick',
        'click .write-only-button' : 'onWriteOnlyButtonClick',
        'click .add-button'        : 'new',
        'click .menu-button'       : 'toggleMenu'
    },

    initialize : function (options) {
        _.bindAll(this);

        // Cache some jQuery selectors.
        this.$title           = this.$('title');
        this.$menu            = this.$('.document-menu');
        this.$textarea        = this.$('.document-textarea');
        this.$article         = this.$('.document-article');
        this.$menuButton      = this.$('.menu-button');
        this.$readOnlyButton  = this.$('.read-only-button');
        this.$writeOnlyButton = this.$('.write-only-button');

        // Allow tabs in the textarea using a jQuery plugin.
        this.$textarea.tabby({tabString:'    '});

        // Make a menu to select documents from.
        this.documentMenu = new Socrates.DocumentMenuView({
            collection : this.model.get('documents'),
            el         : this.$menu
        })
            .on('select', this.onDocumentMenuSelect);

        // Attach app event handlers.
        this.model
            .on('change:document', this.onAppDocumentChange)
            .on('change:state', this.renderState);
        // Attach document event handlers.
        if (this.model.has('document')) this.applyDocumentEventHandlers(this.model.get('document'));

        // Throttle saving to not hit firebase so much.
        this.save = _.debounce(this.save, 1000, true);
        // Debounce applying the youtube filter since it's kinda intensive.
        this.renderYoutubeFilter = _.debounce(this.renderYoutubeFilter, 1000);

        // Add a window resize handler to re-try state.
        $window.on('resize', this.onWindowResize);
    },

    applyDocumentEventHandlers : function (document, unbind) {
        var method = unbind ? 'off' : 'on';
        document
            [method]('change:body', this.onDocumentBodyChange)
            [method]('load', this.renderTextarea);
    },


    // Actions
    // -------

    render : function () {
        this.renderTitle()
            .renderMenu()
            .renderTextarea()
            .renderArticle()
            .renderState();

        // Keep rendering the title cursor.
        setInterval(this.renderTitle, 500);
    },

    renderTitle : function () {
        this._titleCursor || (this._titleCursor = 'on');

        var cursor = this._titleCursor === 'on' ? '|' : '';
        this.$title.html('Socrates' + cursor);

        // Swap the cursor for next time.
        this._titleCursor = this._titleCursor === 'on' ? 'off' : 'on';

        return this;
    },

    renderMenu : function () {
        this.documentMenu.render();
        return this;
    },

    renderTextarea : function () {
        if (!this.model.has('document')) return this;

        this.$textarea.val(this.model.get('document').get('body'));
        return this;
    },

    renderArticle : function () {
        if (!this.model.has('document')) return this;

        // Convert the model's markdown body into html.
        var markdown = marked(this.model.get('document').get('body'));
        this.$article.html(markdown);

        // Apply extra filters.
        this.renderYoutubeFilter();
        this.renderCodeHighlightingFilter();
    },

    renderState : function () {
        var state = this.model.get('state');

        var readonly  = state === 'read-only';
        var writeonly = state === 'write-only';

        if ($window.width() < MININUM_WIDTH && !state) return this.model.set('state', 'write-only');

        this.$readOnlyButton.state('pressed', readonly);
        this.$writeOnlyButton.state('pressed', writeonly);

        this.$el.state('write-only', writeonly);
        this.$el.state('read-only', readonly);
    },

    // Create embeds for any youtube links.
    renderYoutubeFilter : function () {
        var self = this;
        this.$article.find('a[href*="youtube.com/watch?v="]').each(function (i, el) {
            var youtubeId = el.href.match(/\?v=([\w-]+)/)[1];
            var embed     = self.youtubeEmbedTemplate({ id : youtubeId });
            $(el).replaceWith(embed);
        });
    },

    // Apply code highlighting. We have to convert the highlighting classes
    // that marked.js gives us into ones that Rainbow.js can read first.
    renderCodeHighlightingFilter : function () {
        this.$article.find('code').each(function (index, el) {
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

    new : function () {
        this.model.set('document', this.model.newDocument());
    },

    save : function () {
        this.model.get('document').save();
    },

    toggleMenu : function () {
        this.$menu.slideToggle();
        this.$menuButton.toggleState('pressed');
    },


    // Event Handlers
    // --------------

    // When the window resizes too small, if we're not in one of the two states,
    // force us into write-only mode.
    onWindowResize : function (event) {
        if (this.model.has('state')) return;

        if ($window.width() < MININUM_WIDTH) this.model.set('state', 'write-only');
    },

    onTextareaKeyup : function (event) {
        this.model.get('document').set('body', this.$textarea.val());
        this.save();
    },

    onReadOnlyButtonClick : function (event) {
        var state = this.$readOnlyButton.state('pressed') ? null : 'read-only';
        this.model.set('state', state);
    },

    onWriteOnlyButtonClick : function (event) {
        var state = this.$writeOnlyButton.state('pressed') ? null : 'write-only';
        this.model.set('state', state);
    },

    onAppDocumentChange : function (model, document) {
        var previousDocument = this.model.previous('document');
        if (previousDocument) this.applyDocumentEventHandlers(previousDocument, true);
        this.applyDocumentEventHandlers(document);

        this.renderTextarea()
            .renderArticle();
    },

    onDocumentBodyChange : function (document) {
        this.renderTextarea()
            .renderArticle();
    },

    onDocumentMenuSelect : function (menu, document) {
        this.model.set('document', document);
    }

});