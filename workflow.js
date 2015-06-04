!function (path) {
    'use strict';

    require('publishjs')({
        basedir: path.dirname(module.filename),
        // clean: true,
        output: 'publish/',
        mixins: [
            require('publishjs-livereload')()
        ],
        processors: {
            assemble: require('publishjs-assemble'),
            cssmin: require('publishjs-cssmin'),
            less: require('publishjs-less'),
            jsx: require('publishjs-jsx'),
            pngout: require('publishjs-pngout'),
            jshint: require('publishjs-jshint'),
            uglify: require('publishjs-uglify')
        },
        pipes: {
            less: function (pipe, callback) {
                pipe.from('less/')
                    .merge()
                    .less()
                    .cssmin()
                    .save('css/all.css')
                    .run(callback);
            },
            'css.lib': function (pipe, callback) {
                pipe.from('css.lib/')
                    .save('css/')
                    .run(callback);
            },
            html: function (pipe, callback) {
                pipe.from('html/')
                    .assemble()
                    .jsx()
                    .jshint({ expr: true })
                    .save('./')
                    .run(callback);
            },
            img: function (pipe, callback) {
                pipe.from('img/')
                    .pngout()
                    .save('img/')
                    .run(callback);
            },
            'img.min': function (pipe, callback) {
                pipe.from('img.min/')
                    .save('img/')
                    .run(callback);
            },
            js: function (pipe, callback) {
                pipe.from('js/')
                    .jsx()
                    .jshint({ expr: true })
                    .merge()
                    .uglify()
                    .save('js/all.js')
                    .run(callback);
            },
            'js.lib': function (pipe, callback) {
                pipe.from('js.lib/')
                    .save('js/')
                    .run(callback);
            },
            json: function (pipe, callback) {
                pipe.from('json/')
                    .save('json/')
                    .run(callback);
            }
        },
        watch: true
    }).build();
}(
    require('path')
);