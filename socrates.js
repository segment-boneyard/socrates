
$(function() {

    var $textarea = $('textarea');
    var $article = $('article');

    var $list = $('ul');

    var hasStorage = supports_html5_storage();

    var docs = loadDocuments();
    var doc = null;


    var onTextAreaChange = function () {
        var text = $textarea.val();
        var markdown = monkey(marked(text));
        $article.html(markdown);

        if (hasStorage) {
            doc.save(text, markdown);
        }
    };

    var openDoc = function () {
        $textarea.val(doc.text);
        onTextAreaChange();
    };

    var chooseFirstDoc = function () {
        if (_.size(docs) > 0) {
            doc = _.last(docs);
        } else {
            doc = new Document();
        }

        openDoc();
    };

    var bindTextArea = function () {
        $textarea.on('keyup', onTextAreaChange);
    };

    var populateDocumentsDropdown = function () {

        $list.empty();

        _.each(docs, function (doc) {

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

    var attachToListButtons = function () {

        $('.choose-add-button').on('click', function () {
            doc = new Document();
            openDoc();
        });

        $('.choose-menu-button').on('click', function () {
            var hidden = $list.state('hidden');
            $list.state('hidden', !hidden);
        });
    };


    var attachToOnlyButtons = function () {

        var $writeonly = $('.write-only-button');

        $writeonly.on('click', function () {
            $writeonly.toggleState('pressed');
            $('body').state('read-only', false);
            $('body').state('write-only', $writeonly.state('pressed'));
        });

        var $readonly = $('.read-only-button');

        $readonly.on('click', function () {
            $readonly.toggleState('pressed');
            $('body').state('write-only', false);
            $('body').state('read-only', $readonly.state('pressed'));
        });
    };

    chooseFirstDoc();
    bindTextArea();
    populateDocumentsDropdown();
    attachToListButtons();
    attachToOnlyButtons();
});