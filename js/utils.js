
function randomId(length) {
    var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    var returnValue = '';
    var x;
    var i;

    for (x = 0; x < length; x += 1) {
        i = Math.floor(Math.random() * 62);
        returnValue += chars.charAt(i);
    }

    return returnValue;
}

function parseQueryString(uri) {
    var queryString = {};
    uri.replace(
        new RegExp("([^?=&]+)(=([^&]*))?", "g"),
        function($0, $1, $2, $3) { queryString[$1] = $3; }
    );

    return queryString;
}