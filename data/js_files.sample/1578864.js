//
// VnStat in a Node.js
//
// Nicolas Hennion (aka) Nicolargo
//
// GPL v3.0
//

var http = require('http');
var url = require('url');
var spawn = require ('child_process').spawn;

//**********
// Variables
//**********

var listenport = 1337;

//**********
// Functions
//**********

// Chomp function (delete the \n)
String.prototype.chomp = function () {
	return this.replace(/(\n|\r)+$/, '');
};

// Create the HTTP server instance
function start(route, handle) {

	function onRequest(req, res) {
		var path = url.parse(req.url).pathname;

		console.log("New request: "+path);

		var body = route(handle, path, res);
	};

	// Run the HTTP server
	http.createServer(onRequest).listen(listenport);

	// Get the hostname (FQDN)
	var listenaddress = spawn('hostname', ['-f']);
	listenaddress.stdout.on('data', function (data) {
		var fqdn = new String(data);
		console.log('Server running listenning http://'+fqdn.chomp()+':'+listenport+'/');
	});
}

//**********
// Functions
//**********

exports.start = start;
