/*
 * grunt-teamcity-deploy
 * https://github.com/tomsoir/teamcity-deploy
 *
 * Copyright (c) 2014 Artem Tkachenko
 * Licensed under the MIT license.
 *
 * Man
 * -----------------------------------
 * There are 3 parts for auto-deploying:
 *
 * We have 2 TeamCity projects:
 * 1) Development/Web/Client — just for run tests
 * grunt taskes for it:
 *     Task-1. Copy to ENV from TeamCity 
 *         command:
 *             $ grunt deploy:development:[env]  
 *             where [env] is: dev, stb, nxt, cli, * 
 *             ([env] getting from TeamCity build-params)
 *         example command:
 *             $ grunt deploy:development:nxt
 *         targets:
 *             — remove old pack dir and zip file inside
 *             — make new pack dir
 *             — compress project to new zip pack
 *             — copy zip pack to auto-deploy server path (like so: /u03/deploy/dev/hoothoot/)
 *
 *     Task-2. Start for run tests on TeamCity 
 *         command:
 *              $ grunt deploy:development:tests
 *         targets:
 *             — change host of nodejs-server from 'localhost' to 'hs-ws-tkachenko.local' (by uname -n)
 *             — start server
 *             — run jasmin/sencha unit-tests throw phantomjs 
 *         
 * 2) Environment/Deployment/Client — for shows in browser
 *     Task-1. Run on ENV
 *         command:
 *             $ grunt deploy:development
 * 
 *         targets:
 *              — change host of nodejs-server from 'localhost' to 'hs-ws-tkachenko.local' (by uname -n)
 *              — start server
 *
 *
 * Grunt task configuration:
 * -----------------------------------
 * grunt.initConfig
 *     deploy:                                                          // deploy task
 *          development:                                                // deploy:development configeration (it is just a task, and could be more then one) 
 *              options:        
 *                  compress:                                           // compressing pack option
 *                      dir: "packer"                                   // creating dir for copy zip pack
 *                      archive: "packer.zip"                           // compressing pack name
 *                      includes: '.'                                   // path witch files/dirs include to zip pack
 *                      excludes: '.git/**\\*  node_modules/**\\*'      // path witch files/dirs NOT include to zip pack
 *
 *                  copyTo: # full path will be: /u03/deploy/[env]/hoothoot/        // where to copy for auto-deploy
 *                      server: "/u03/deploy/"                                      // part of path to copy (part1: server)
 *                      env: "*" # dev, stb, nxt, cli, *                            // part of path to copy (part2: environment. It gets from run task, like so: grunt deploy:development:nxt )  
 *                      dir: "/hoothoot/"                                           // part of path to copy (part3: dir or project)  
 *
 *                  startServerTasks: ['connect:server']                // run server tasks 
 */


'use strict';

module.exports = function(grunt) {

    var taskName = 'deploy';
    var path = require('path');
    var fs = require('fs');

    grunt.registerMultiTask(taskName, 'Custom grunt plugin for teamCity and autodeploy source', function(teamCitiEnv) {
        var self = this;
        if(teamCitiEnv){
            if(teamCitiEnv == 'tests'){                                             // 1) start for run tests on TeamCity (without copying to ENV)
                forEachConfigs(function(config){
                    grunt.log.ok("Start for tests");
                    // 1) run server
                    runServerTask(config.options.startServerTasks, self);
                    // 2) run task for checking unit-tests 
                    grunt.log.ok("Begin check unit-tests here");
                    // ...
                })
            }else{                                                                  // 2) copy to ENV from TeamCity (send ZIP-pack of project to mount ENV dir)
                forEachConfigs(function(config){
                    grunt.log.ok("Сopy to ENV from TeamCity");
                    copyToEnvFromTeamCity(config.options, teamCitiEnv, self);
                });
            }
        }else{                                                                      // 3) run on ENV (start web-server on ENV without testing)
            forEachConfigs(function(config){
                grunt.log.ok("Run on ENV");
                runServerTask(config.options.startServerTasks, self);
            });
        }

    });

    var forEachConfigs = function(callback){
        var configName;
        for(configName in grunt.config.get(taskName))
            callback(grunt.config.get(taskName)[configName]);
    }
    var runServerTask = function(startServerTasks, context){
        var done = context.async();
        var exec = require("child_process").exec;
        var spawn = require("child_process").spawn;
        var uname = spawn("uname", ["-n"]);
        uname.stdout.on("data", function(data){
            var configVars = grunt.config.get("vars");
            configVars.serverHostname = String(data).replace(/^\s+|\s+$/g, "");         // triming string
            grunt.config.set("vars", configVars);                                       // changing localhost host
            grunt.log.ok("config set to: " + grunt.config.get("vars").serverHostname);
            done();

            grunt.task.run(startServerTasks);                                           // run server task
        });
    }
    var runForTests = function(){
        runServerTask(options.startServerTasks, context);
    }
    var copyToEnvFromTeamCity = function(options, teamCitiEnv, context){
        var compressConfig = options.compress,
            copyConfig =  options.copyTo;

        var dir = compressConfig.dir,
            archive = compressConfig.archive,
            pathToProject = compressConfig.includes,
            excludesFiles = compressConfig.excludes, 
            copyEnv = ((copyConfig.env != '*')? copyConfig.env : teamCitiEnv),
            copyPath = copyConfig.server+copyEnv+copyConfig.dir;

        if(typeof(compressConfig) == 'undefined')
            return grunt.log.error("Deploy! No compressConfig in Grunt-config.file");
        var done = context.async();
        var exec = require("child_process").exec;

        var bashRm = "rm -rf "+dir,                                                     // clear old dir
            bashMk = "mkdir "+dir,                                                      // create new dir
            bashZip= "zip -r "+dir+"/"+archive+" "+pathToProject+" -x "+excludesFiles,  // zip project
            bashCp = "cp "+dir+"/*.* "+copyPath                                         // copy to /u03/deploy/[env]/hoothoot/ for deploying on test-server by env

        exec(bashRm+" && "+bashMk+" && "+bashZip+" && "+bashCp, function(e){
            if(e){ grunt.log.error(e) }
            else {
                grunt.log.ok("Compress '"+archive+"' to "+copyPath);
                done();
            }
        });
    }

};

