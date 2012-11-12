/*global Socrates Backbone _ marked Rainbow */

Socrates.DocumentMenuView = Backbone.View.extend({

    tagName : 'ul',

    events : {
        'click li' : 'onClickLi',
        'click .document-menu-item-delete-button': 'onDeleteButtonClick'
    },

    initialize : function () {
        _.bindAll(this);

        this.itemTemplate = _.template($('#document-menu-item-template').html());

        this.collection.on('add remove reset change', this.render);
    },

    render : function (document) {
        this.$el.empty();

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
        event.preventDefault();

        var id = $(event.currentTarget).attr('data-id');
        var document = this.collection.find(function (document) {
            return id === document.id;
        });

        if (document) this.trigger('select', this, document);
    },

    onDeleteButtonClick : function (event) {
        event.preventDefault();

        var id = $(event.currentTarget).closest('li').attr('data-id');
        var document = this.collection.find(function (document) {
            return id === document.id;
        });

        this.collection.remove(document);
    }

});