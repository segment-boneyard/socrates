Socrates.fixtures = {

    onboarding : [

        '#Backbone\n',
        'Backbone.js gives structure to web applications by providing models with key-value binding and custom events, collections with a rich API of enumerable functions, views with declarative event handling, and connects it all to your existing API over a RESTful JSON interface.\n',
        '### Backbone.Events\n',
        'Events is a module that can be mixed in to any object, giving the object the ability to bind and trigger custom named events. Events do not have to be declared before they are bound, and may take passed arguments. For example:',
        '```javascript',
        'var object = {};',
        '_.extend(object, Backbone.Events);',
        'object.on("alert", function(msg) {',
        'alert("Triggered " + msg);',
        '});',
        'object.trigger("alert", "an event");',
        '``\n',
        'For example, to make a handy event dispatcher that can coordinate events among different areas of your application:',
        '```javascript',
        'var dispatcher = _.clone(Backbone.Events)',
        '```'

    ].join('\n'),

    random: [

        [
            '# Dr. Steven Brule\n\n',
            '> I stare in the water at my own sweet reflection,',
            '>',
            '> And I feel a feeling of warm sweet affection.',
            '>',
            '> Why doesn\'t my body do the things that I want?',
            '>',
            '> For lack of exercise, it\'s surely the cause.\n',
            '– by **Beverly Dingus**, a poem.\n\n',
            '[On Health](http://www.youtube.com/watch?v=sYMYktsKmSk)'

        ].join('\n')
    ]
};