


$(function() {

    var $textarea = $('textarea');
    var $article = $('article');

    var hasStorage = supports_html5_storage();
    var doc = new Document();

    $textarea.on('keyup', function () {
        var text = $textarea.val();
        var markdown = marked(text);
        $article.html(markdown);

        if (hasStorage) {
            doc.save(text, markdown);
        }
    });

});