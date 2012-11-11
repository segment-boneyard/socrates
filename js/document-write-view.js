/*global Socrates Backbone */

Socrates.Document.Write.View = Backbone.View.extend({

    events : {
        'keyup' : 'onKeyup'
    },

    setElement : function () {
        Backbone.View.prototype.setElement.apply(this, arguments);
        this.$el.tabby({tabString:'    '});
    },

    onKeyup : function () {
        this.model.set('body', this.$el.val());
        this.model.save();
    }

});