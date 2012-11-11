/*global Socrates Backbone _ marked Rainbow */

Socrates.DocumentMenuView = Backbone.View.extend({

    tagName : 'ul',

    events : {
        'click li' : 'onClickLi'
    },

    initialize : function () {
        this.itemTemplate = _.template($('#document-menu-item-template').html());

        this.collection.on('add remove reset', this.render);
    },

    render : function (document) {
        var items = '';
        this.collection.each(function (document) {
            items += this.renderItem(document);
        }, this);

        this.$el.append(items);
        return this;
    },

    renderItem : function (document) {
        return this.itemTemplate({ document : document });
    },


    // Event Handlers
    // --------------

    onClickLi : function (event) {
        var $li = $(event.currentTarget);
        var id = $li.attr('data-id');

        var document = this.collection.find(function (document) {
            return id = document.id;
        });

        if (document) this.trigger('select', this, document);
    }

});