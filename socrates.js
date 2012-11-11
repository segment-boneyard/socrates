/*global Socrates Backbone marked */

marked.setOptions({
    gfm      : true,
    sanitize : true
});

window.Socrates = {
    firebaseUrl : 'https://socrates.firebaseIO.com/'
};


// Start the app.
$(function () {
    var view = new Socrates.View({
        model : new Socrates.Model(),
        el    : $('html')
    })
        .render();

    Backbone.history.start();
});


// Analytics
// ---------

var dev = window.location.hostname === 'localhost';
window.analytics.initialize({
    'Segment.io'       : dev ? 'r12y067n' : 'r3gxgjte',
    'Google Analytics' : dev ? ''         : 'UA-36265018-1',
    'Mixpanel'         : dev ? ''         : '78d583c1ec60a099cf3496506f73d29c',
    'KISSmetrics'      : dev ? ''         : '9ce3ea2509ea5f60b82718508c77a16298e92d2a'
});