/*global Socrates Backbone marked _ Rainbow */

var $window = $(window);
var MININUM_WIDTH = 1000;

Socrates.View = Backbone.View.extend({

    youtubeEmbedTemplate : _.template('<iframe width="100%" height="400" src="http://www.youtube.com/embed/<%= id %>" frameborder="0" allowfullscreen></iframe>'),

    events : {
        'keyup .document-textarea' : 'onTextareaKeyup',
        'click .read-only-button'  : 'onReadOnlyButtonClick',
        'click .write-only-button' : 'onWriteOnlyButtonClick',
        'click .add-button'        : 'onAddButtonClick',
        'click .menu-button'       : 'onMenuButtonClick'
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
        this.save = _.debounce(this.save, 500);
        // Debounce applying the youtube filter since it's kinda intensive.
        this.renderYoutubeFilter = _.debounce(this.renderYoutubeFilter, 1000);

        // Add a window resize handler to re-try state.
        $window.on('resize', this.onWindowResize);
    },

    applyDocumentEventHandlers : function (document, unbind) {
        var method = unbind ? 'off' : 'on';
        document[method]('change:body', this.onDocumentBodyChange);
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
        var body     = this.model.get('document').get('body');
        var markdown = marked(body);
        var quoted   = this.renderSmartQuoteFilter(markdown);
        this.$article.html(quoted);

        // Apply extra filters.
        this.renderYoutubeFilter();
        this.renderCodeHighlightingFilter();
    },

    renderState : function () {
        var state = this.model.get('state');

        var readonly  = state === 'read';
        var writeonly = state === 'write';

        if ($window.width() < MININUM_WIDTH && !state) return this.model.set('state', 'write');

        this.$readOnlyButton.state('pressed', readonly);
        this.$writeOnlyButton.state('pressed', writeonly);

        this.$el.state('write-only', writeonly);
        this.$el.state('read-only', readonly);
    },

    // Turn dumb quotes into smart quotes.
    renderSmartQuoteFilter : function (markdown) {
        // Left quotes are either next to a space or code stuff.
        var leftSingleQuote = /([^\w])&#39;/g;
        var leftDoubleQuote = /([^\w])&quot;/g;
        // Right quotes are everything else...
        var singleQuote = /&#39;/g;
        var doubleQuote = /&quot;/g;

        markdown = markdown
            .replace(leftSingleQuote, '$1&lsquo;')
            .replace(leftDoubleQuote, '$1&ldquo;')
            .replace(singleQuote, '&rsquo;')
            .replace(doubleQuote, '&rdquo;');

        return markdown;
    },

    // Create embeds for any youtube links.
    renderYoutubeFilter : function () {
        var self = this;
        this.$article.find('a[href*="youtube.com/watch?v="]').each(function (i, el) {
            var youtubeId = el.href.match(/\?v=([\w-]+)/)[1];
            var embed     = self.youtubeEmbedTemplate({ id : youtubeId });
            $(el).replaceWith(embed);

            window.analytics.track('Render Youtube Video', {
                video : youtubeId
            });
        });
    },

    // Apply code highlighting. We have to convert the highlighting classes
    // that marked.js gives us into ones that Rainbow.js can read first.
    renderCodeHighlightingFilter : function () {
        this.$article.find('code').each(function (index, el) {
            var $el = $(el);

            // Convert any smart quotes into dumb quotes. This is janky.
            var html = $el.html();
            var leftSingleQuote = /‘/g;
            var leftDoubleQuote = /“/g;
            var singleQuote     = /’/g;
            var doubleQuote     = /”/g;

            html = html
                .replace(leftSingleQuote, '\'')
                .replace(leftDoubleQuote, '\"')
                .replace(singleQuote, '\'')
                .replace(doubleQuote, '\"');

            $el.html(html);

            var classes = el.className.split(/\s+/);
            _.each(classes, function (className, i) {
                if (className.indexOf('lang-') !== -1) {
                    var language = className.substring('lang-'.length);
                    $el.attr('data-language', language);

                    window.analytics.track('Render Code Highlighting', {
                        language : language
                    });
                }
            });
        });
        try { Rainbow.color(); } catch (e) {}
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

        if ($window.width() < MININUM_WIDTH) this.model.set('state', 'write');
    },

    onTextareaKeyup : function (event) {
        this.model.get('document').set('body', this.$textarea.val());
        this.save();
    },

    onMenuButtonClick : function (event) {
        event.preventDefault();

        this.toggleMenu();
    },

    onAddButtonClick : function (event) {
        this.model.set('document', this.model.createDocument());
    },

    onReadOnlyButtonClick : function (event) {
        event.preventDefault();

        var state = this.$readOnlyButton.state('pressed') ? null : 'read';
        this.model.set('state', state);

        window.analytics.track('Press Read-only Button');
    },

    onWriteOnlyButtonClick : function (event) {
        event.preventDefault();

        var state = this.$writeOnlyButton.state('pressed') ? null : 'write';
        this.model.set('state', state);

        window.analytics.track('Press Write-only Button');
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

        window.analytics.track('Select a Document', {
            id : document.id
        });
    }

});