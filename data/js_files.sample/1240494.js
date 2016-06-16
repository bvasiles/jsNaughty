// The main nodemoo script.
var net = require('net');
var world = require('./lib/World.js');

// Let's make "world" available everywhere:
global.world = world;

// Load the game config.
world.load('./game.json');

// Okay, let's create and run a server, letting the world handle the rest.
var server = net.createServer(function (socket) { world.login(socket); });
server.listen(1337, "127.0.0.1");

// End of script.
