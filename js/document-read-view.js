/*global Socrates Backbone _ marked Rainbow */

Socrates.Document.Read.View = Backbone.View.extend({

    initialize : function () {
        this.model.on('change', this.render);
    },

    render : function () {
        var markdown = marked(this.model.get('body'));
        // monkey
        this.$el.html(markdown);
        this.highlight();
    },

    highlight : function () {
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
    }

});