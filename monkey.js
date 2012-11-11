

jQuery.fn.outerHTML = function(s) {
    return s
        ? this.before(s).remove()
        : jQuery("<p>").append(this.eq(0).clone()).html();
};

var ytEmbedTemplate = _.template('<iframe width="560" height="315" src="http://www.youtube.com/embed/<%= id %>" frameborder="0" allowfullscreen></iframe>');

var monkey = function (markdown) {

    if (markdown) {

        var youtubeLinks = [];

        var markdownTree = $(markdown);

        markdownTree.find('a').each(function (i, el) {
            var index = el.href.indexOf('youtube.com/watch?v=');
            if (index !== -1) {
                queryString = parseQueryString(el.href);
                if ('v' in queryString) {
                    youtubeLinks.push({
                        el: el,
                        id: queryString['v']
                    });
                }
            }
        });

        _.each(youtubeLinks, function (link) {
            var toEmbed = ytEmbedTemplate({ id: link.id });
            var linkHtml = $(link.el).outerHTML();
            var index = markdown.indexOf(linkHtml);
            if (index !== -1) {
                var split = index + linkHtml.length;
                markdown = markdown.substring(0, split) +
                           toEmbed +
                           markdown.substring(split);
            }

        });
    }

    return markdown;
};