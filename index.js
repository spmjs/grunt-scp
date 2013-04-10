/*
 * grunt-scp
 * https://github.com/spmjs/grunt-scp
 *
 * Copyright (c) 2013 Hsiaoming Yang
 * Licensed under the MIT license.
 */

exports.initConfig = function(grunt, options, deepMerge) {

  var data = {
    scp: {
      options: {
        username: options.username,
        password: options.password,
        host: options.host,
        log: options.log
      },
      assets: {
        files: [{
          cwd: options.src,
          src: '**/*',
          filter: 'isFile',
          dest: options.dest
        }]
      },
    }
  };

  if (deepMerge) {
    grunt.util._.merge(data, grunt.config.data);
    grunt.config.data = data;
  } else {
    grunt.util._.defaults(grunt.config.data, data);
  }

  var path = require('path');
  grunt.loadTasks(path.join(__dirname, 'tasks'));
};
