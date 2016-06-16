// --------------------------------------------------------------------------------------------------------------------
//
// winston-simpledb.js : transport for logging to Amazon SimpleDB
//
// Author           : Andrew Chilton
// Web              : http://www.chilts.org/blog/
// Email            : <chilts@appsattic.com>
//
// Copyright (c)    : 2011 AppsAttic Ltd
// Web              : http://www.appsattic.com/
// License          : http://opensource.org/licenses/MIT
//
// --------------------------------------------------------------------------------------------------------------------

var util = require('util');
var amazon = require('awssum/lib/amazon/amazon');
var simpledb = require('awssum/lib/amazon/simpledb');
var winston = require('winston');
var UUID = require('uuid-js');

// --------------------------------------------------------------------------------------------------------------------

//
// ### function SimpleDB (options)
// Constructor for the SimpleDB transport object.
//
var SimpleDB = exports.SimpleDB = function (options) {
    options = options || {};

    // need the accessKeyId
    if (!options.accessKeyId) {
        throw new Error("Required: accessKeyId for the Amazon account to log for.");
    }

    // need the secretAccessKey
    if (!options.secretAccessKey) {
        throw new Error("Required: secretAccessKey for the Amazon account being used.");
    }

    // need the awsAccountId
    if (!options.awsAccountId) {
        throw new Error("Required: awsAccountId for the Amazon account being used.");
    }

    // need the domainName
    if (!options.domainName) {
        throw new Error("Required: domainName (or domainName generator) to log to.");
    }

    // need the region
    if (!options.region) {
        throw new Error("Required: region the domain is in.");
    }

    // Winston Options
    this.name  = 'simpledb';
    this.level = options.level || 'info';

    // SimpleDB Options
    if (options.domainName) {
        this.domainName = options.domainName;
    }
    this.itemName = this.itemName || 'timestamp';
    if (options.itemName) {
        this.itemName = options.itemName;
    }

    // create the SimpleDB instance
    this.sdb = new simpledb.SimpleDB(
        options.accessKeyId,
        options.secretAccessKey,
        options.awsAccountId,
        options.region
    );
};

//
// Inherit from `winston.Transport` to take advantage of base functionality.
//
util.inherits(SimpleDB, winston.Transport);

//
// ### function log (level, msg, [meta], callback)
// #### @level {string} Level at which to log the message.
// #### @msg {string} Message to log
// #### @meta {Object} **Optional** Additional metadata to attach
// #### @callback {function} Continuation to respond to when complete.
// Core logging method exposed to Winston. Metadata is optional.
//
SimpleDB.prototype.log = function (level, msg, meta, callback) {
    var self = this;

    // console.log('RIGHT HERE - logging some stuff');

    // create the domainName
    var domainName;
    if ( typeof this.domainName === 'function' ) {
        domainName = this.domainName();
    }
    else {
        domainName = this.domainName;
    }
    // console.log('domainName=' + domainName);

    // create the itemName
    var itemName;
    if ( typeof this.itemName === 'function' ) {
        itemName = this.itemName();
    }
    else if ( this.itemName === 'uuid' ) {
        itemName = UUID.create().hex;
    }
    else if ( this.itemName === 'epoch' ) {
        itemName = Date.now();
    }
    else if ( this.itemName === 'timestamp' ) {
        itemName = (new Date()).toISOString();
    }
    // else, nothing (should never be here)

    // create the data to log
    var data = {
        level     : level,
        msg       : msg,
        inserted  : (new Date()).toISOString(),
    };

    // add the meta information if there is any
    if ( meta ) {
        data.meta = JSON.stringify(meta);
    }

    // store the message
    this.sdb.putAttributes({
        domainName : domainName,
        itemName   : itemName,
        data       : data,
    }, function(err, data) {
        // console.log('Error: ', util.inspect(err, true, null));
        // console.log('Data: ', util.inspect(data, true, null));
        if (err) {
            self.emit('error', err);
        }

        self.emit('logged');
    });

    // intially, tell the caller that everything was fine
    callback(null, true);
};

//
// Add SimpleDB to the transports defined by winston.
//
winston.transports.SimpleDB = SimpleDB;
