/*
 * grunt-scp
 * https://github.com/spmjs/grunt-scp
 *
 * Copyright (c) 2013 Hsiaoming Yang
 * Licensed under the MIT license.
 */

 /* jshint node: true */

var path = require('path');
var async = require('async');
var Client = require('scp2').Client;
var inquirer = require('inquirer');

module.exports = function(grunt) {

  grunt.registerMultiTask('scp', 'copy files to remote server.', function() {
    var options = this.options({
      host: 'localhost',
      tryKeyboard: true
    });

    var done = this.async();
    var filename, destfile;
    var client = new Client(options);
    var files = this.files;

    client.on('connect', function() {
      grunt.log.writeln('ssh connect ' + options.host);
    });
    client.on('keyboard-interactive', function(name, instructions, instructionsLang, prompts, finish) {
      finish([options.password]);
    });
    client.on('close', function() {
      grunt.log.writeln('ssh close ' + options.host);
      done();
    });
    client.on('mkdir', function(dir) {
      grunt.log.writeln('mkdir ' + dir);
    });
    client.on('write', function(o) {
      grunt.log.writeln('write ' + o.destination);
      if (options.log) {
        options.log(o);
      }
    });
    client.on('transfer', function(buf, up, total) {
      up = up + 1;
      if (up < total) {
        if ((Math.floor(up / 550)) === (up / 550)) {
          grunt.log.writeln('transfer ' + Math.floor(up / total * 100) + '% data');
        } else if (up === 1) {
          grunt.log.writeln('transfer 1% data');
        }
      } else {
        grunt.log.writeln('transfer ' + Math.floor(up / total * 100) + '% data');
      }
    });
    client.on('error', function(err) {
      if (err.message) {
        grunt.log.error('error ' + err.message);
      } else {
        grunt.log.error('error ' + err);
      }
      done(false);
      return false;
    });

    function execUploads() {
      async.eachSeries(files, function(fileObj, cb) {
        upload(fileObj, cb);
      }, function(err) {
        if (err) {
          grunt.log.error('Error ' + err);
        }
        client.close();
      });
    }

    function upload(fileObj, cb) {
      async.eachSeries(fileObj.src, function(filepath, cb) {
        if (fileObj.cwd) {
          filename = filepath;
          filepath = path.join(fileObj.cwd, filepath);
        } else {
          filename = path.relative(fileObj.orig.cwd || '', filepath);
        }
        destfile = path.join(fileObj.dest, filename);
        client.upload(filepath, destfile, cb);
      }, function(err) {
        cb(err);
      });
    }

    if (options.password || options.privateKey) {
      execUploads();
    } else {
      inquirer.prompt([{
        name: 'password',
        message: 'password: ',
        type: 'password'
      }], function(answers) {
        options.password = answers.password;
        client.defaults(options);
        execUploads();
      });
    }

  });
};
