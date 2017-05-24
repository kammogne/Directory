module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
        options: {
            jshintrc: '.jshintrc'
        },
        main: {
            src: ['Gruntfile.js', 'server.js', 'server/**/*.js', 'public/app/**/*.js']
        }
    },
    exec: {
      paint_server: 'codepaint xform -p idiomatic "server/**/*.js"',
      paint_app: 'codepaint xform -p idiomatic "public/app/**/*.js"',
      paint_testserver: 'codepaint xform -p idiomatic "test-server/**/*.js"',
      paint_testclient: 'codepaint xform -p idiomatic "test-client/**/*.js"'
    },
    karma: {
      unit: {
        configFile: 'karma.conf.js'
      }
    },
    nodemon: {
      dev: {
        script: 'server.js',
        options: {
          ignore: ['node_modules/**'],
          ext: 'js',
          watch: ['server']
        }
      }
    },
    mochaTest: {
      test: {
        options: {
          mocha: require('mocha'),
          grep: 'ldap',
          reporter: 'spec',
          growl: true,
          colors: true,
          require: ['test-server/support/common', 'test-server/support/node', 'test-server/support/mongoose']
        },
        src: ['test-server/**/*.js']
      }
    },
    watch: {
      clean: {
        files: ['**/*.js','!node_modules/**'],
        tasks: ['default']
      },
      server: {
        files: ['server/**/*.js', 'test-server/**/*.js'],
        tasks: ['test-server']
      },
      client: {
        files: ['test-public/**/*.js'],
        tasks: ['test-client']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-exec');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-karma');

  grunt.registerTask('default', ['jshint']);
  grunt.registerTask('paint', ['exec']);
  grunt.registerTask('run', ['default', 'nodemon']);
  grunt.registerTask('test-client', ['karma']);
  grunt.registerTask('test-server', ['mochaTest']);
};
