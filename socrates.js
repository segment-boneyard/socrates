
$(function() {

    var $textarea = $('textarea');
    var $article = $('article');

    $textarea.on('keyup', function () {
        var text = $textarea.val();
        var markdown = marked(text);
        $article.html(markdown);
    });

});