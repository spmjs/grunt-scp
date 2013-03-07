/*
 * grunt-scp
 * https://github.com/spmjs/grunt-scp
 *
 * Copyright (c) 2013 Hsiaoming Yang
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    scp: {
      tasks: {
        options: {
          username: 'admin',
          password: 'alipay',
          host: 'arale.alipay.im'
        },
        files: [{
          cwd: 'tasks',
          src: '**/*',
          dest: '/home/admin/static/<%= pkg.name %>/<%= pkg.version %>'
        }]
      },
    }
  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  grunt.registerTask('default', ['scp']);
};
