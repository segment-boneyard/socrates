// Allow tabs in the textarea using a jQuery plugin.
this.$textarea.tabby({tabString:'    '});


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