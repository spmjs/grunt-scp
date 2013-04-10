/*
 * grunt-scp
 * https://github.com/spmjs/grunt-scp
 *
 * Copyright (c) 2013 Hsiaoming Yang
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {
  var self = require('./');

  self.initConfig(grunt, {
    username: 'admin',
    password: 'alipay',
    host: 'arale.alipay.im',
    src: 'tasks',
    dest: '/home/admin/tmp/'
  }, true);

  grunt.registerTask('default', ['scp']);
};
