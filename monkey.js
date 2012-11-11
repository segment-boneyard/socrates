

var monkey = function (markdown) {

    if (markdown) {

        $(markdown).find('a').each(function (index, el) {
            console.log(el.href);
        });

    }

    return markdown;
};