var net = require('net');

var client = net.connect(9001, function() {
});

client.on('data', function(data) {
    console.log(data.toString());
    client.end();
})
