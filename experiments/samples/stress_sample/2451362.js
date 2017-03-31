/**
 * Copyright (c) 2012 Andreas Madsen
 * MIT License
 */

var fs = require('fs'),
    vows = require('vows'),
    assert = require('assert'),

    common = require('../common.js'),
    immortal = require(common.immortal);

common.reset();

var outputFile = common.temp('output.txt');
var pidFile = common.temp('daemon.txt');

if (common.existsSync(outputFile)) fs.unlinkSync(outputFile);
if (common.existsSync(pidFile)) fs.unlinkSync(pidFile);

// null pid object
var pidInfo = {
  daemon: null,
  monitor: null,
  process: null
};

vows.describe('testing default monitor with pidFile:null').addBatch({

  'when starting immortal': {
    topic: function () {
      var self = this;

      // open file watchers
      immortal.start(common.fixture('pingping.js'), {
        strategy: 'development',
        options: {
          output: outputFile,
          pidFile: null
        }
      }, function (error) {
        setTimeout(function () {
          self.callback(error, null);
        }, 500);
      });
    },

    'no errors should exist': function (error, dum) {
      assert.ifError(error);
      assert.isNull(dum);
    },

    'a output file should exist': function () {
      assert.isTrue(common.existsSync(outputFile));
    },

    'a pid file should not exist': function () {
      assert.isFalse(common.existsSync(pidFile));
    },
  }

}).addBatch({

  'the content of the output file': {
    topic: function () {
      var self = this;

      fs.readFile(outputFile, 'utf8', function (error, content) {
        if (error) return self.callback(error, null);

        // parse lines
        var lines = content.split('\n');
        var pids = lines
          .filter(function (line) {
            return (line.indexOf('#') !== -1);
          })
          .map(function (line) {
            return parseInt( (line).match(/#([0-9]+)/)[1], 10);
          });

        pidInfo.monitor = pids[0];
        pidInfo.process = pids[1];

        self.callback(null, lines);
      });
    },

    'output should contain monitor output': function (error, lines) {
      assert.ifError(error);

      // A better test exists in monitor-default.js
      assert.equal(lines[0].indexOf('==='), 0);
      assert.equal(lines[1].indexOf('==='), 0);
      assert.equal(lines[2].indexOf('==='), 0);
      assert.equal(lines[3].indexOf('==='), 0);
    }
  }

}).addBatch({

  'cleanup: when trying to kill all pids': {
    topic: function () {
      var self = this;

        // Seriouse attempt to kill the immortal group
        // Should you really want that in production, please do it by
        // the session id (posix), the process tree (windows) or use monitor.shoutdown()
        var pidCache = pidInfo;
        var i = 3;
        while(i--) {
          try { process.kill(pidCache.monitor); } catch (e) {}
          try { process.kill(pidCache.process); } catch (e) {}
        }

        // Assume that every thing is killed after 500 ms
        setTimeout(function () {
          self.callback(null, pidCache);
        }, 500);
    },

    'all processors should be dead': function (error, pidCache) {
      assert.ifError(error);

      assert.isNull(pidCache.daemon);

      assert.isNumber(pidCache.monitor);
      assert.isFalse(common.isAlive(pidCache.monitor));

      assert.isNumber(pidCache.process);
      assert.isFalse(common.isAlive(pidCache.process));
    }
  }

}).exportTo(module);
