/*global Socrates Backbone */

Socrates.View = Backbone.View.extend({

    events : {

    },

    initialize : function (options) {
        this.initializeDocumentListView();
        this.initializeDocumentReadView();
        this.initializeDocumentWriteView();

        this.model.on('change:document', this.onModelDocumentChange);
    },

    initializeDocumentListView : function () {
        this.documentList = new Socrates.Document.List.View({
            collection : this.model.get('documents')
        });
    },

    initializeDocumentReadView : function () {
        this.documentWrite = new Socrates.Document.Write.View({
            model : this.model.get('document')
        });
    },

    initializeDocumentWriteView : function () {
        this.documentRead = new Socrates.Document.Read.View({
            model : this.model.get('document')
        });
    },

    render : function () {
        this.documentList.setElement(this.$('.write-menu')).render();
        this.documentWrite.setElement(this.$('.read-article')).render();
        this.documentRead.setElement(this.$('.write-textarea')).render();
    },

    onModelDocumentChange : function (model, document) {
        this.documentWriteView.model = document;
        this.documentReadView.model = document;

        this.documentWriteView.render();
        this.documentReadView.render();
    }

});