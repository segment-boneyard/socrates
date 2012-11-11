
$(function() {

    var $list = $('ul');
    var listTemplate = _.template($('#write-menu-item-template').html());

    var hasStorage = supports_html5_storage();

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
            $list.slideToggle();
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

    chooseFirstDoc();
    bindTextArea();
    populateDocumentsDropdown();
    attachToListButtons();
    attachToOnlyButtons();
});