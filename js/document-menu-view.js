/*global Socrates Backbone _ marked Rainbow */

Socrates.Document.Menu.View = Backbone.View.extend({

    tagName : 'ul',
    itemConstructor : Socrates.Document.Menu.Item.View,

    initialize : function () {
        this.initializeItems(this.collection);

        this.collection
            .on('add', this.onCollectionAdd)
            .on('remove', this.onCollectionRemove)
            .on('reset', this.onCollectionReset);
    },

    initializeItems : function (collection) {
        this.items = [];
        collection.each(function (model) {
            this.items.push(this.initializeItem(model));
        }, this);
    },

    initializeItem : function (model) {
        return new this.itemConstructor({
            model : model
        });
    },

    render : function () {
        this.renderItems();
        return this.trigger('render', this);
    },

    renderItems : function () {
        var itemEls = [];
        _.each(this.items, function (itemView) {
            itemEls.push(itemView.render().$el);
        }, this);
        this.$el.append.apply(this.$el, itemEls);
        return this;
    },

    renderItem : function (itemView) {
        this.append(itemView.render());
        return this;
    },


    // Event Handlers
    // --------------

    onCollectionAdd : function (model) {
        var itemView = this.initializeItem(model);
        this.renderItem(itemView);
    },

    onCollectionRemove : function (model) {
        var item = _.find(this.items, function (item) {
            return (item.model.cid === model.cid);
        });
        if (!item) return;

        this.items = _.filter(this.items, function (item) {
            return (item.model.cid !== model.cid);
        });
        item.dispose();
    },

    onCollectionReset : function (collection) {
        _.each(this.items, function (item) {
            item.dispose();
        }, this);
        this.initializeItems(collection);
        this.render();
    }

});
