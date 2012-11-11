
$(function() {

    var $textarea = $('textarea');
    var $article = $('article');

    var $list = $('ul');
    var listTemplate = _.template($('#write-menu-item-template').html());

    var hasStorage = supports_html5_storage();

    var docs = loadDocuments();
    var doc = null;


    highlightAny = function () {

        $article.find('code').each(function (index, el) {
            // jquery cant help you get class list http://stackoverflow.com/questions/1227286/get-class-list-for-element-with-jquery
            var classList = el.className.split(/\s+/);
            for (var i = 0; i < classList.length; i++) {
                var className = classList[i];
                if (className.indexOf('lang-') !== -1) {
                    var language = className.substring('lang-'.length);
                    $(el).attr('data-language', language);
                }
            }
        });

        try {
            Rainbow.color();
        } catch (e) {}

    };

    var onTextAreaChange = function () {
        var text = $textarea.val();
        var markdown = monkey(marked(text));
        $article.html(markdown);

        highlightAny();

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

            var html = listTemplate({
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

        $('.write-add-button').on('click', function () {
            doc = new Document();
            openDoc();
        });

        $('.write-menu-button').on('click', function () {
            var hidden = $list.state('hidden');
            $list.state('hidden', !hidden);
        });
    };


    var attachToOnlyButtons = function () {

        var $writeonly = $('.write-only-button');
        var $readonly = $('.read-only-button');

        $writeonly.on('click', function () {
            $writeonly.toggleState('pressed');
            $readonly.state('pressed', false);
            $('body').state('read-only', false);
            $('body').state('write-only', $writeonly.state('pressed'));
        });

        $readonly.on('click', function () {
            $readonly.toggleState('pressed');
            $writeonly.state('pressed', false);
            $('body').state('write-only', false);
            $('body').state('read-only', $readonly.state('pressed'));
        });
    };

    var allowTabsInTextarea = function () {

        $textarea.tabby({tabString:'    '});
    };

    allowTabsInTextarea();
    chooseFirstDoc();
    bindTextArea();
    populateDocumentsDropdown();
    attachToListButtons();
    attachToOnlyButtons();
});