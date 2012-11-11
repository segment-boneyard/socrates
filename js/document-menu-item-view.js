/*global Socrates Backbone _ marked Rainbow */

Socrates.Document.Menu.Item.View = Backbone.View.extend({

    tagName   : 'li',
    className : 'document-menu-item',

    initialize : function () {
        this.template = _.template($('#document-menu-item-template').html());

        this.model.on('change:title', this.render);
    },

    render : function () {
        this.$el.attr('data-id', this.model.id);
        this.$el.html(this.template({
            document : this.model
        }));
    }

});