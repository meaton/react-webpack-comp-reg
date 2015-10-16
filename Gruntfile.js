'use strict';

var serverPort = 9000;

var mountFolder = function (connect, dir) {
  return connect.static(require('path').resolve(dir));
};

var webpackDistConfig = require('./webpack.dist.config.js'),
    webpackDevConfig = require('./webpack.config.js');

module.exports = function (grunt) {
  // Let *load-grunt-tasks* require everything
  require('load-grunt-tasks')(grunt);

  // Read configuration from package.json
  var pkgConfig = grunt.file.readJSON('package.json');

  grunt.initConfig({
    pkg: pkgConfig,

    webpack: {
      options: webpackDistConfig,

      dist: {
        cache: false
      }
    },

    'webpack-dev-server': {
      options: {
        hot: true,
        port: serverPort,
        webpack: webpackDevConfig,
        publicPath: '/assets/',
        contentBase: './<%= pkg.src %>/',
      },

      start: {
        keepAlive: true,
      }
    },

    connect: {
      options: {
        port: serverPort
      },

      dist: {
        options: {
          keepalive: true,
          middleware: function (connect) {
            return [
              mountFolder(connect, pkgConfig.dist)
            ];
          }
        }
      }
    },

    open: {
      dev: {
        path: 'http://localhost:<%= connect.options.port %>/webpack-dev-server/',
        options: {
          delay: 500
        }
      },
      dist: {
        path: 'http://localhost:<%= connect.options.port %>/',
        options: {
          openOn: 'serverListening'
        }
      }
    },

    karma: {
      unit: {
        configFile: 'karma.conf.js'
      }
    },

    copy: {
      dist: {
        files: [
          // includes files within path
          {
            flatten: true,
            expand: true,
            src: ['<%= pkg.src %>/*'],
            dest: '<%= pkg.dist %>/',
            filter: 'isFile'
          },
          {
            flatten: true,
            expand: true,
            src: ['<%= pkg.src %>/images/*'],
            dest: '<%= pkg.dist %>/images/'
          },
        ]
      }
    },

    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '<%= pkg.dist %>'
          ]
        }]
      }
    },

    jsdoc: {
        dist: {
            src: ['src/**/*.jsx', 'src/**/*.js', 'test/spec/components/*.js'],
            jsdoc: '/usr/local/bin/jsdoc',
            options: {
                destination: 'docs',
                package: './package.json',
                template : "node_modules/grunt-jsdoc/node_modules/ink-docstrap/template",
                configure : "jsdoc.conf.json"
            }
        }
    }
  });

  grunt.loadNpmTasks('grunt-jsdoc');

  grunt.registerTask('serve', function (target) {
    if (target === 'dist') {
      grunt.event.once('connect.dist.listening', function(host, port) {
        grunt.event.emit('serverListening');
      });

      return grunt.task.run(['build', 'open:dist', 'connect:dist']);
    }

    grunt.task.run(['open:dev', 'webpack-dev-server']);
  });

  grunt.registerTask('test', ['karma']);

  grunt.registerTask('build', ['clean', 'copy', 'webpack']);

  grunt.registerTask('default', []);
};
