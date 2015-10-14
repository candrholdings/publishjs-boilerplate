#!/usr/bin/env node

!function (path) {
    'use strict';

    if (module.parent) {
        module.exports = build;
    } else {
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

        build(program);
    }

    function build(options, callback) {
        require('publishjs')({
            basedir: path.dirname(module.filename),
            cacheKey: {
                md5: require('crypto').createHash('md5').update(require('fs').readFileSync(module.filename)).digest('base64'),
                nomin: !!options.nomin
            },
            clean: options.clean,
            output: 'publish/',
            mixins: [
                options.livereload && require('publishjs-livereload')()
            ],
            processors: {
                assemble: require('publishjs-assemble'),
                cssmin: options.nomin ? 'noop' : require('publishjs-cssmin'),
                less: require('publishjs-less'),
                jsx: require('publishjs-jsx'),
                pngout: options.nomin ? 'noop' : require('publishjs-pngout'),
                jshint: require('publishjs-jshint'),
                uglify: options.nomin ? 'noop' : require('publishjs-uglify')
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
                        .cssmin()
                        .uglify()
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
                    pipe.from(options.nomin ? 'js.lib/' : 'js.lib.min/')
                        .save('js/')
                        .run(callback);
                },
                json: function (pipe, callback) {
                    pipe.from('json/')
                        .save('json/')
                        .run(callback);
                }
            },
            watch: options.loop
        }).build(callback);
    }
}(
    require('path')
);