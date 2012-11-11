
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

    var openDoc = function () {
        $textarea.val(doc.text);
        onTextAreaChange();
    };

    var bindTextArea = function () {
        $textarea.on('keyup', onTextAreaChange);
    };

    var populateDocumentsDropdown = function () {

        $list.empty();

        var otherDocs = _.filter(docs, function (d) {
            return d.id !== doc.id;
        });

        _.each(otherDocs, function (doc) {

            var template = _.template('<li data-id="<%=id%>"><%= title %></li>');
            var html = template({
                id: doc.id,
                title: doc.title
            });

            $list.append(html);
        });

        $('li').on('click', function (event) {
            var selectedId = $(event.target).attr('data-id');
            doc = _.find(docs, function (doc) {
                return doc.id == selectedId;
            });

            openDoc(doc);

            // re-populate drop down so that the current
            // one is not included
            populateDocumentsDropdown();
        });
    };


    openDoc(doc);
    bindTextArea();
    populateDocumentsDropdown();

});