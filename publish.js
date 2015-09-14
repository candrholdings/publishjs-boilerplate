#!/usr/bin/env node

!function (path) {
    'use strict';

    var program = require('commander');

    program
        .version('0.0.1')
        .option('-f, --clean', 'Force a clean build, will also clean build on every watch loop')
        .option('-l, --loop', 'After build, watch for new changes and restart the build')
        .option('-n, --nomin', 'Do not minify CSS, JS and PNG')
        .option('-r, --livereload', 'Enable LiveReload server, implies --loop')
        .option('--nolint', 'Do not run JSHint')
        .parse(process.argv);

    program.loop = program.livereload || program.loop;

    require('publishjs')({
        basedir: path.dirname(module.filename),
        cacheKey: {
            md5: require('crypto').createHash('md5').update(require('fs').readFileSync(module.filename)).digest('base64'),
            nomin: !!program.nomin
        },
        clean: program.clean,
        output: 'publish/',
        mixins: [
            program.livereload && require('publishjs-livereload')()
        ],
        processors: {
            assemble: require('publishjs-assemble'),
            cssmin: program.nomin ? 'noop' : require('publishjs-cssmin'),
            less: require('publishjs-less'),
            jsx: require('publishjs-jsx'),
            pngout: program.nomin ? 'noop' : require('publishjs-pngout'),
            jshint: require('publishjs-jshint'),
            uglify: program.nomin ? 'noop' : require('publishjs-uglify')
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
                pipe.from(program.nomin ? 'js.lib/' : 'js.lib.min/')
                    .save('js/')
                    .run(callback);
            },
            json: function (pipe, callback) {
                pipe.from('json/')
                    .save('json/')
                    .run(callback);
            }
        },
        watch: program.loop
    }).build();
}(
    require('path')
);