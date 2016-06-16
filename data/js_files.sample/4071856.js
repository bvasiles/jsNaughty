// Third party dependencies
var _ = require('underscore');
var natural = require('natural');
var Bot = require('ttapi');
var fs = require('fs');
var async = require('async');
var cache = require('memory-cache');

// Local dependencies
var fn = require('../lib/fn').fn;
var models = require('../lib/models').models;
var TemplateStore = require('../lib/templates');
var TTAdapter = require('../lib/ttadapter');
var logging = require('../lib/logging');
var ControllerBot = require('../lib/controller').ControllerBot;
var CommandStore = require('../lib/commands');
var MixinLoader = require('../lib/mixinloader');
var httpclient = require('../lib/http-client');

var templates = new TemplateStore({
        logger : logging.fileLogger('templates'),
        random : Math.random
    });

var commands = new CommandStore({
        wordnet : new natural.WordNet(),
        spellchecker : natural.JaroWinklerDistance,
        logger : logging.fileLogger('commands')
    });

var echonest = require('../lib/echonest');

var args = process.argv.splice(2);

var files = [args[0], './data/aliases.json', './data/templateText.json'];

var AdminServer = require('./server');

async.map(files, fs.readFile, function (error, results) {
    console.log('Configuration loaded');
    
    
    var parsedResults = _.chain(results).invoke('toString', 'ascii').map(JSON.parse).value();
    var CONFIG = parsedResults[0];
    var aliases = parsedResults[1];
    var templateDefinitions = parsedResults[2];
    
    var http = require('http');
    var httpClient = new httpclient.HttpClient({
            http : http,
            cache : require('memory-cache')
        });
    
    var LyricsWikiaClient = require('../lib/lyricswikia');
    
    templates.load(templateDefinitions);
    
    var ttBot = new Bot(CONFIG.AUTH, CONFIG.USER_ID);
    
    var bot = new ControllerBot({
            room : CONFIG.ROOM_ID,
            templates : templates,
            bot : new TTAdapter(ttBot, false),
            commands : commands,
            userInfo : {
                shortName : CONFIG.BOT_SHORT_NAME,
                name : CONFIG.BOT_USERNAME,
                userId : CONFIG.USER_ID
            },
            echonest : new echonest.Client({
                http : httpClient,
                cache : cache,
                api_key : CONFIG.ECHONEST_API_KEY,
                logger : logging.fileLogger('echonest')
            }),
            lyricsClient : new LyricsWikiaClient({
                http : http,
                logger : logging.fileLogger('lyricswiki')
            }),
            adminUser : {
                name : CONFIG.ADMIN_USER_NAME,
                id : CONFIG.ADMIN_USER_ID
            },
            logger : logging.fileLogger('controller')
        });
    
    var express = require('express');
    require('express-resource');
    
    var server = new AdminServer({
            bot : bot,
            logging : logging,
            express : express,
            config : CONFIG.adminServer
        }).start();
    
    var mixinLoader = new MixinLoader({
            mixinConfig : CONFIG.mixins || {},
            require : require,
            logging : logging,
            models : models.initialize(CONFIG.mongo.credentials)
        });
    
    function loadCommands(callback) {
        return fs.readdir('./lib/commands/', function (error, files) {
            if (error) {
                callback(error, commands);
            }
            _.chain(files).map(fn.replace('.js', '')).map(commands.load, commands);
            console.log('Commands loaded');
            callback(null, commands);
        });
    }
    
    async.parallel([mixinLoader.load, loadCommands], function (error, results) {
        if (error) {
            throw error;
        }
        _.map(results[0], bot.loadMixin, bot);
        results[1].loadAliases(aliases);
    });
});
