
$(function() {

    var $textarea = $('textarea');
    var $article = $('article');

    var $list = $('ul');

    var hasStorage = supports_html5_storage();

    var docs = loadDocuments();
    var doc = null;

    if (_.size(docs) > 0) {
        doc = _.last(docs);
    } else {
        doc = new Document();
    }

    var onTextAreaChange = function () {
        var text = $textarea.val();
        var markdown = marked(text);
        $article.html(markdown);

        if (hasStorage) {
            doc.save(text, markdown);
        }
    };

    var prepareDoc = function () {
        $textarea.val(doc.text);
        onTextAreaChange();
    };

    var bindTextArea = function () {
        $textarea.on('keyup', onTextAreaChange);
    };

    var populateDocumentsDropdown = function () {

        _.each(docs, function (doc) {

            var template = _.template('<li data-id="<%=id%>"><%= title %></li>');
            var html = template({
                id: doc.id,
                title: doc.title
            });

            $list.append(html);
        });
    };


    prepareDoc();
    bindTextArea();
    populateDocumentsDropdown();

});