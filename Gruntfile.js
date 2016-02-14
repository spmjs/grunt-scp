/*
 * grunt-scp
 * https://github.com/spmjs/grunt-scp
 *
 * Copyright (c) 2013 Hsiaoming Yang
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['test/expected']
    },

    scp: {
      options: {
        username: process.env.USER,
        host: 'localhost',
      },
      assets: {
        files: [{
          cwd: 'test/fixtures/',
          src: '**',
          filter: 'isFile',
          dest: process.cwd() + '/test/tmp/'
        }]
      },
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js']
    }
  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');


  grunt.registerTask('test', ['clean', 'scp', 'nodeunit']);
  grunt.registerTask('default', ['jshint', 'test']);
};
