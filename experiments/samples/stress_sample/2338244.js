var queryString = require("querystring"),
    fs = require("fs"),
    formidable = require("formidable"),
    http = require("http"),
    events = require("events");

function getTweets() {
    var request = twitterClient.request("GET", "/1/statuses/public_timeline.json", {"host": "api.twitter.com"});

    request.addListener("response", function(response) {
	var body = "";
	response.addListener("data", function(data) {
	    body += data;
	});
    });

    request.end();
}

function start(response, postData) {
  console.log("Request handler 'start' was called.");

  fs.readFile("./site/index.html", function(err, data) {
      if (err) throw err;
      response.writeHead(200, {"Content-Type": "text/html"});
      response.write(data);
      response.end();
  });
}

function upload(response, request) {
  console.log("Request handler 'upload' was called.");

  var form = new formidable.IncomingForm();

  form.parse(request, function(error, fields, files) {

    /* Possible error on Windows systems:
       tried to rename to an already existing file */
    fs.rename(files.upload.path, "/tmp/test.png", function(err) {
      if (err) {
        fs.unlink("/tmp/test.png");
        fs.rename(files.upload.path, "/tmp/test.png");
      }
    });
    response.writeHead(200, {"Content-Type": "text/html"});
    response.write("received image:<br/>");
    response.write("<img src='/show' />");
    response.end();
  });
}

function showImage(response) {
  console.log("Request handler 'show' was called.");
  fs.readFile("/tmp/test.png", "binary", function(error, file) {
    if(error) {
      response.writeHead(500, {"Content-Type": "text/plain"});
      response.write(error + "\n");
      response.end();
    } else {
      response.writeHead(200, {"Content-Type": "image/png"});
      response.write(file, "binary");
      response.end();
    }
  });
}

function show(response) {
    showImage(response);
}

exports.start = start;
exports.upload = upload;
exports.show = show;
