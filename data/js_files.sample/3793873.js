var io = require('socket.io').listen(8080);

//creating namespace
var usa = io.of('/usa'); 
var india = io.of('/india');


usa.on('connection', function (socket){
	//here we are emitting on usa namespace which is created by using socket.io
	usa.emit('ustudyprocess', {'school': 'government', 'lms':'moodle', 'tablet':'apple'});
});


india.on('connection', function(socket){
	//instead of india we can use socket also
	socket.emit('istudyprocess', {'school': 'private', 'lms':'moodle', 'tablet':'aakash'});
});


