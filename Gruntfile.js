module.exports = function(grunt) {

  var express = require('express'),
      expressApp = express(),
      chalk = require('chalk');

  grunt.registerTask('serveStaticFiles', 'Uses Express to serve static files for development', function() {
    // serve static files
    expressApp.use(express.static('_app'));

    // start server
    expressApp.listen(3000);
    console.log(chalk.cyan('Server started at localhost:3000'));
  });

  grunt.registerMultiTask('simple_log', function () {
    var logText = this.options().logText;

    grunt.log.ok(logText);
  });

  // task timer
  require('time-grunt')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    simple_log: {
      coverage_complete: {
        options: {
          logText: 'Coverage report available at coverage/reports/icov-report/index.html'
        }
      }
    },

    open: {
      localhost: {
        path: 'http://localhost:3000',
        app: 'Firefox'
      }
    },

    jshint: {
      app: {
        src: ['src/js/**/*.js', '!src/js/vendor/*']
      },
      test: {
        options: {
          expr: true // so that jshint doesn't complain about chai assertions that look like expressions
        },
        src: ['test/**/*.js', '!test/coverage/**/*.js']
      },
      gruntfile: {
        src: ['Gruntfile.js']
      }
    },

    mochaTest: {
      dev: {
        options: {
          reporter: 'spec',
          clearRequireCache: true // Optionally clear the require cache before running tests (defaults to false) 
        },
        src: ['test/node-mocha/*.spec.js']
      }
    },

    karma: {
      options: {
        basePath: '',
        frameworks: ['browserify', 'mocha', 'chai'],
        plugins: [
          'karma-phantomjs-launcher',
          // 'karma-chrome-launcher',
          'karma-mocha',
          'karma-chai',
          'karma-browserify',
          'karma-mocha-reporter'
        ],
        files: [
          // tests
          'test/karma-mocha/*.spec.js',
          // source JS
          {
            pattern: 'src/js/*.js',
            watched: true,
            included: false,
            served: false
          },
          // vendor dependencies
          {
            pattern: 'src/js/vendor/*.js',
            watched: false,
            included: false,
            served: true
          }
        ],
        preprocessors: {
          'test/karma-mocha/*.spec.js': ['browserify']
        },
        reporters: ['mocha'],
        // browsers: ['Chrome'],
        browsers: ['PhantomJS'],
        port: 9876,
        colors: true,
      },
      watch: {
        options: {
          autoWatch: true,
          singleRun: false
        }
      },
      once: {
        options: {
          autoWatch: false,
          singleRun: true
        }
      }
    },

    clean: {
      app: ['_app/']
    },

    copy: {
      vendorJs: {
        expand: true,
        cwd: 'src/js/vendor/',
        src: ['**/*.js'],
        dest: '_app/js/vendor/'
      },
      css: {
        expand: true,
        cwd: 'src/css/',
        src: ['**/*.css'],
        dest: '_app/css/'
      },
      html: {
        expand: true,
        cwd: 'src/html/',
        src: ['**/*.html'],
        dest: '_app/'
      }
    },

    browserify: {
      app: {
        files: {
          '_app/js/main.js': ['src/js/main.js']
        }
      }
    },

    sass: {
      options: {
        sourceMap: true
      },
      app: {
        expand: true,
        cwd: 'src/scss/',
        src: ['**/*.scss'],
        dest: '_app/css/',
        rename: function (destDir, srcFile) {
          return destDir + srcFile.replace('.scss', '.css');
        }
      }
    },

    env: {
      dist: {
        LIB_DIR: '../../src/js/'
      },
      coverage: {
        LIB_DIR: '../../test/coverage/instrument/src/js/'
      }
    },

    instrument: {
      files: ['src/js/**/*.js', '!src/js/vendor/**/*.js'],
      options: {
        lazy: true,
        basePath: 'test/coverage/instrument/'
      }
    },

    storeCoverage: {
      options: {
        dir: 'test/coverage/reports'
      }
    },

    makeReport: {
      src: 'test/coverage/reports/**/*.json',
      options: {
        type: 'lcov',
        dir: 'test/coverage/reports',
        print: 'detail'
      }
    },

    coveralls: {
      coverage: {
        src: 'test/coverage/reports/**/*.info',
      }
    },

    watch: {
      appTestJs: {
        files: ['src/js/**/*.js', '!src/js/vendor/*'],
        tasks: ['jshint:app'/*, 'mochaTest'*/]
      },
      appBrowserifyJs: {
        files: ['src/js/**/*.js', '!src/js/vendor/*'],
        tasks: ['browserify']
      },
      gruntfileJs: {
        files: ['Gruntfile.js'],
        tasks: ['jshint:gruntfile']
      },
      testJs: {
        files: ['test/**/*.js'],
        tasks: ['jshint:test', 'mochaTest']
      },
      vendorJs: {
        files: ['src/js/vendor/**/*.js'],
        tasks: ['copy:vendorJs']
      },
      html: {
        files: ['src/html/**/*.html'],
        tasks: ['copy:html']
      },
      css: {
        files: ['src/css/**/*.css'],
        tasks: ['copy:css']
      },
      scss: {
        files: ['src/scss/**/*.scss'],
        tasks: ['sass']
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-istanbul');
  grunt.loadNpmTasks('grunt-coveralls');
  grunt.loadNpmTasks('grunt-env');
  grunt.loadNpmTasks('grunt-open');

  grunt.registerTask('coverage', [
    'env:coverage',
    'instrument',
    'mochaTest',
    'storeCoverage',
    'makeReport',
    'simple_log:coverage_complete'
  ]);

  grunt.registerTask('dist', [
    // 'env:dist',
    'clean',
    'sass',
    'jshint',
    'browserify',
    // 'mochaTest',
    // 'karma:once',
    'copy',
    // 'coverage',
    // 'env:dist'
  ]);

  grunt.registerTask('default', [
    'dist',
    'serveStaticFiles',
    'open:localhost',
    'watch'
  ]);

};