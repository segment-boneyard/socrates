/*global Socrates Backbone Firebase _ marked */

var days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
];

var months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
];

var nths = {
    1  : 'st',
    2  : 'nd',
    21 : 'st',
    22 : 'nd',
    31 : 'st'
};

Socrates.DocumentModel = Backbone.Model.extend({

    defaults : function () {
        return {
            created : new Date(),
            title   : 'Untitled',
            body    : ''
        };
    },

    urlRoot : Socrates.firebaseUrl + 'documents/',

    initialize : function (attributes, options) {
        _.bindAll(this);

        this.generateTitle();
        this.initializeFirebase();

        this.on('change:body', this.generateTitle);
    },

    generateTitle: function () {
        // Start with a default.
        var created = this.has('created') ? new Date(this.get('created')) : new Date();
        var day     = days[created.getDay()];
        var month   = months[created.getMonth()];
        var date    = created.getDate();
        var nth     = nths[date] || 'th';
        var year    = created.getFullYear();
        var title   = 'Untitled - '+day+', '+month+' '+date+nth+', '+year;

        var body     = this.get('body');
        var markdown = marked(body);
        var headings = $(markdown).filter('h1, h2, h3, h4, h5, h6');
        if (headings.length > 0) title = $(headings[0]).text();

        this.set('title', title);
    },

    initializeFirebase: function () {
        var self = this;

        this.firebase = new Firebase(this.urlRoot + this.id);
        this.firebase.on('value', function (snapshot) {
            var val = snapshot.val();
            if (val) self.set(val);
        });
    },

    save : function () {
        this.firebase.set(this.toJSON());

        window.analytics.track('Save a Document', {
            id : this.id
        });
    }

});