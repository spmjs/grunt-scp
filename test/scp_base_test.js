/* jshint node: true */

'use strict';

var grunt = require('grunt');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

var data = {
  scp: {
    options: {
      username: process.env.USER,
      host: 'localhost',
    },
    assets: {
      files: [{
        src: 'test/fixtures/**',
        filter: 'isFile',
        dest: process.cwd() + '/test/tmp/'
      }]
    },
  }
};

grunt.util._.merge(data, grunt.config.data);
grunt.config.data = data;

var path = require('path');
grunt.loadTasks(path.join(__dirname, '../tasks'));

exports.scp = {
  setUp: function(done) {
    done();
  },
  default_options: function(test) {
    test.expect(2);

    var actual = grunt.file.read('test/tmp/data-sample-1.txt');
    var expected = grunt.file.read('test/fixtures/data-sample-1.txt');
    test.equal(actual, expected, 'data sample #1 sent over scp should equal input file');
    actual = grunt.file.read('test/tmp/data-sample-2.txt');
    expected = grunt.file.read('test/fixtures/data-sample-2.txt');
    test.equal(actual, expected, 'data sample #2 sent over scp should equal input file');

    test.done();
  },
  tearDown: function(done){
    grunt.file.delete('test/tmp');
    done();
  }
};
