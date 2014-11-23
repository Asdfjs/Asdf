module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                separator: ';'
            },
            client: {
                src: ['src/client/*.js',
                    'src/common/core/*.js',
                    'src/common/datatype/Object.js',
                    'src/common/datatype/Regexp.js',
                    'src/common/datatype/Function.js',
                    'src/common/datatype/Array.js',
                    'src/common/datatype/String.js',
                    'src/common/datatype/Argument.js',
                    'src/common/datatype/Number.js',
                    'src/common/datatype/Prototype.js',
                    'src/client/datatype/*.js',
                    'src/client/bom/*.js',
                    'src/client/event/*.js',
                    'src/client/dom/*.js',
                    'src/common/util/*.js',
                    'src/client/util/*.js',
                    'src/common/base/base.js',
                    'src/common/base/Callbacks.js',
                    'src/common/base/Events.js',
                    'src/common/base/Store.js',
                    'src/common/base/Chain.js',
                    'src/client/async/*.js',
                    'src/client/ajax/*.js',
                    'src/client/cookie/*.js',
                    'src/client/history/*.js'
                ],
                dest: 'build/<%= pkg.name %>.client.js'
            },
            server: {
                src: ['src/server/*.js',
                    'src/common/core/*.js',
                    'src/common/datatype/Object.js',
                    'src/common/datatype/Function.js',
                    'src/common/datatype/Array.js',
                    'src/common/datatype/String.js',
                    'src/common/datatype/Argument.js',
                    'src/common/datatype/Number.js',
                    'src/common/datatype/Prototype.js',
                    'src/common/util/*.js',
                    'src/common/base/base.js',
                    'src/common/base/Callbacks.js',
                    'src/common/base/Events.js',
                    'src/common/base/Store.js',
                    'src/common/base/Chain.js',
                ],
                dest: 'build/<%= pkg.name %>.server.js'
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
            },
            client: {
                files: {
                    'build/<%= pkg.name %>.client-min.js': ['<%= concat.client.dest %>']
                }
            },
            server: {
                files: {
                    'build/<%= pkg.name %>.server-min.js': ['<%= concat.server.dest %>']
                }
            }
        },
        qunit: {
            qunit: ['test/test.html']
        },
        jshint: {
            files: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js', '!test/speed/**/*.js'],
            options: {
                // options here to override JSHint defaults
                globals: {
                    Asdf: true,
                    console: true,
                    module: true,
                    document: true
                },
                eqnull:true,
                sub:true,
                lastsemic:true,
                laxcomma:true,
                supernew:true,
                laxbreak:true,
                asi:true,
                boss:true,
                expr:true
            }
        },
        watch: {
            files: ['<%= jshint.files %>'],
            tasks: ['jshint', 'qunit']
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.registerTask('test', ['jshint', 'qunit']);

    grunt.registerTask('default', ['jshint', 'qunit', 'concat:client', 'uglify:client', 'concat:server', 'uglify:server']);
    grunt.registerTask('client', ['jshint', 'qunit', 'concat:client', 'uglify:client']);
    grunt.registerTask('server', ['jshint', 'qunit', 'concat:server', 'uglify:server']);
};
