/*global module:false*/
var fs = require('fs');

module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-contrib-requirejs');

  // Project configuration.
  grunt.initConfig({
    meta: {
      version: '0.1.0'
    },
    lint: {
      files: ['grunt.js', 'source/**/*.js']
    },
    concat: {
      dist: {
        src: ['sidera/source/**/*.js'],
        dest: 'sidera/release.js'
      }
    },
    requirejs: {
      compile: {
        options: {
          useSourceUrl: true,
          dir: 'build',
          appDir: 'source',
          baseUrl: 'scripts',
          useStrict: true,
          optimize: 'none',
          modules: [{
            name: 'main',
            insertRequire: ['main']
          }]
        }
      }
    },
    watch: {
      files: '<config:lint.files>',
      tasks: 'requirejs almond'
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        browser: true
      },
      globals: {}
    },
    uglify: {}
  });

  grunt.registerTask('almond', 'copy almond.js from the node module', function() {
    var done = this.async();

    var from = 'node_modules/almond/almond.js';
    var to = 'build/almond.js';

    fs.readFile(from, function(err, data) {
      if(err) throw err;
      fs.writeFile(to, data, function(err) {
        if(err) throw err;
        grunt.log.write('copied almond.js to ' + to);
        done();
      });
    });
  });

  // Default task.
  grunt.registerTask('default', 'requirejs almond');

};