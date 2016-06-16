var Db = require('mongodb').Db,
	Connection = require('mongodb').Connection,
	Server = require('mongodb').Server,
	ObjectID = require('mongodb').ObjectID,
	ReplSetServers = require('mongodb').ReplSetServers;

module.exports = {};



module.exports.TransportFactory = function(options) {

	var logsCollection = null,
		isConnecting = false,
		callbacksInWaiting = [],
		db,
		dbHostParts,
		dbName = 'configurine',
		dbHosts = options.db.hosts || ['127.0.0.1:27017'],
		dbUser = options.db.userName || '',
		dbPass = options.db.password || '',
		fs = require('fs');

	if (dbHosts.length === 1) {
		dbHostParts = dbHosts[0].split(':');
		if (dbHostParts.length < 2) {
			dbHostParts.push(27017);
		}
		db = options.db.instance || new Db(dbName, new Server(dbHostParts[0], parseInt(dbHostParts[1], 10), { auto_reconnect: true }, { w: 1, native_parser: true }));
	}
	else {
		var servers = [];
		for(var i =0; i< dbHosts.length; i++) {
			dbHostParts = dbHosts[i].split(':');
			if (dbHostParts.length < 2) {
				dbHostParts.push(27017);
			}
			servers.push(new Server(dbHostParts[0], parseInt(dbHostParts[1], 10), { auto_reconnect: true } ));
		}
		var replSet = new ReplSetServers(servers);
		db = options.db.instance || new Db(dbName, replSet, { w: 1, native_parser: true });
	}

	var getLogsCollection = function (callback) {
		if (!logsCollection) {
			db.collection('logs', function getLogsCollectionHandler(err, collection) {
				logsCollection = collection;
				callback(err || null, collection);
			});
			return;
		}
		callback(null, logsCollection);
	};

	var disconnect = function() {
		if (!db.serverConfig.isConnected()) {
			db.close();
		}
	};

	var connect = function(callback) {
		if (db._state === 'connected') {
			return callback();
		}
		else if (db._state === 'disconnected') {
			logsCollection = null;
			db.open(function(err, db) {
				if(err) {
					callbacksInWaiting.forEach(function(cb) {
						cb(err);
					});
					callbacksInWaiting = [];
					callback(err);
					isConnecting = false;
					return;
				}
				db.authenticate(dbUser, dbPass, function(err, result) {
					if(err || !result) {
						callbacksInWaiting.forEach(function(cb) {
							cb(err);
						});
						callbacksInWaiting = [];
						callback(err);
						isConnecting = false;
						return;
					}

					callbacksInWaiting.forEach(function(cb) {
						cb(null);
					});
					callbacksInWaiting = [];
					callback(null);
					isConnecting = false;
					
				});
			});
		}
		else if (db._state === 'connecting') {
			callbacksInWaiting.push(callback);
		}
	};

	var consoleTransport = function(data) {
		console.log(data.output);
	};

	var fileTransport = function(data) {
		
		fs.createWriteStream('/var/log/configurine/configurine.log', {
			flags: 'a',
			encoding: 'utf8',
			mode: 666
		}).write(data.output + '\n');
	};

	var mongoTransport = function(data) {
		connect(function(error) {
			getLogsCollection(function(error, logsCollection) {
				if (error) {
					console.log('Error retrieving the log collection:', error);
					return;
				}
				logsCollection.insert({message: data.output}, function(error, count) {
					if (error) {
						console.log('Error inserting log to DB:', error);
						return;
					}
				});
			});
		});
	};

	this.getTransportFunction = function(type) {

		var wrapper = function(func) {
			return function(data) {
					process.nextTick(function() {
						func(data);
					});
				};
		};
		if (type === 'file') {
			return wrapper(fileTransport);
		}
		else if (type === 'mongo') {
			return wrapper(mongoTransport);
		}
		else if (type === 'console') {
			return wrapper(consoleTransport);
		}
		else {
			return function(){};
		}
	};
};

