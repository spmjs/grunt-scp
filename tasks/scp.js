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
var chalk = require('chalk');
var fs = require('fs');

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
    var uploadedFiles = 0;
    var skippedFiles = 0;

    var cacheDir = path.join(__dirname, '..', '.cache');
    var cacheFile = path.join(cacheDir, this.nameArgs.replace(/:/g, '.') + '.json');
    var cache = initCache();


    client.on('connect', function() {
      grunt.verbose.writeln('ssh connect ' + options.host);
    });
    client.on('keyboard-interactive', function(name, instructions, instructionsLang, prompts, finish) {
      finish([options.password]);
    });
    client.on('close', function() {
      grunt.verbose.writeln('ssh close ' + options.host);
      done();
    });
    client.on('mkdir', function(dir) {
      grunt.verbose.writeln('mkdir ' + dir);
    });
    client.on('write', function(o) {
      grunt.verbose.writeln('write ' + o.destination).or.write('.');
      if (options.log) {
        options.log(o);
      }
    });
    client.on('transfer', function(buf, up, total) {
      up = up + 1;
      if (up < total) {
        if ((Math.floor(up / 550)) === (up / 550)) {
          grunt.verbose.writeln('transfer ' + Math.floor(up / total * 100) + '% data');
        } else if (up === 1) {
          grunt.verbose.writeln('transfer 1% data');
        }
      } else {
        grunt.verbose.writeln('transfer ' + Math.floor(up / total * 100) + '% data');
        uploadedFiles++;
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

    function initCache () {
      if (!options.newer) {
        return false;
      }
      if (!grunt.file.exists(cacheDir)) {
        fs.mkdir(cacheDir);
      }
      return grunt.file.exists(cacheFile) ? grunt.file.readJSON(cacheFile) : {};
    }
    function shouldUpload (filepath) {
      if (!options.newer) {
        return true;
      }
      stats = fs.statSync(filepath);
      if (cache.hasOwnProperty(filepath) && cache[filepath] === stats.ctime.toJSON()) {
        return false;
      }
      cache[filepath] = stats.ctime;
      return true;
    }
    function storeCache () {
      if (!options.newer) {
        return;
      }
      grunt.file.write(cacheFile, JSON.stringify(cache));
    }

    function execUploads() {
      initCache();
      async.eachSeries(files, function(fileObj, cb) {
        upload(fileObj, cb);
      }, function(err) {
        if (err) {
          grunt.log.error('Error ' + err);
        }
        grunt.log.writeln((uploadedFiles > 0 ? "\n" : "")
            + "Uploaded " + chalk.cyan(uploadedFiles) + " " + (uploadedFiles !== 1 ? "files" : "file")
            + " skipped " + chalk.cyan(skippedFiles) + " " + (skippedFiles !== 1 ? "files" : "file"));
        storeCache();
        client.close();
      });
    }

    function upload(fileObj, cb) {
      async.eachSeries(fileObj.src, function(filepath, cb) {
        if (fileObj.cwd) {
          filename = filepath;
          filepath = path.join(fileObj.cwd, filepath);
        } else {
          filename = path.relative(fileObj.orig.cwd, filepath);
        }
        if (shouldUpload(filepath)) {     
          destfile = path.join(fileObj.dest, filename);
          client.upload(filepath, destfile, cb);
        } else {
          grunt.verbose.writeln(filepath + "...skipped");
          skippedFiles++;
          cb.call(null);
        }
      }, function(err) {
        cb(err);
      });
    }

    if (options.password || options.privateKey || options.agent) {
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
