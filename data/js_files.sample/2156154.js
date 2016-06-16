http = require('http')
https = require('https')
url = require('url')

remoteDAV = function(params){
  // params are most likely
  // backendAddress
  // backendToken
  var dav = params;

  function keyToAddress(key) {
    var i = 0;
    while(i < key.length && key[i] =='u') {
      i++;
    }
    if((i < key.length) && (key[i] == '_')) {
      key = 'u'+key;
    }
    return dav.storageAddress + key;
  }

  function doCall(method, keyOrURL, value, deadLine, callback) {
    var httpObj;
    if (typeof(keyOrURL) === "object") {
      httpObj = keyOrURL;
    } else {
      httpObj = url.parse(keyToAddress(keyOrURL));
    }
    httpObj.method = method;
    httpObj.headers = { Authorization: 'Basic '+ dav.bearerToken };
    if(value) httpObj.headers["Content-Length"] = value.length;
    httpObj.fields={withCredentials: 'true'};
    var proto = (httpObj.protocol == 'https:') ? https : http;
    var req = proto.request(httpObj, function(res) {
      handleResponse(res, httpObj);
    });

    req.on('error', function(e) {
      if(e.status == 404) {
        callback(null, null)
      } else {
        callback(e, null)
      }
    });

    if(method!='GET') {
      req.write(value);
    }
    req.end();

    function handleResponse(res, httpObj) {
      console.log(method +' STATUS: ' + res.statusCode);
      if(res.statusCode == 404) {
        callback(null, null);
        return;
      }
      if(isRedirect(res)) {
        followRedirect(res, httpObj);
        return;
      }
      res.on('data', function (chunk) {
        console.log(method + 'DATA: ' + chunk);
        callback(null, chunk)
      });
      if(method=='PUT') {
        callback(null, null)
      }
    }

    function isRedirect(response) {
      return ([301, 302, 303].indexOf(response.statusCode) >= 0);
    }

    function followRedirect(response, httpObj) {
      try {
        var href = url.parse(url.resolve(httpObj.href, response.headers['location']));
        doCall(httpObj.method, href, value, deadLine, callback);

        // todo handle somehow infinite redirects
      } catch(err) {
        err.message = 'Failed to follow redirect: ' + err.message;
        callback(err, null);
      }
    }
  }

  dav.getUserAddress = function() {
    return dav.storageAddress
  }

  dav.get = function(key, callback) {
    doCall('GET', key, null, null, callback);
  }

  dav.set = function(key, value, callback) {
    doCall('PUT', key, value, null, callback);
  }

  dav.remove = function(key, callback) {
    doCall('DELETE', key, null, null,  callback);
  } 

  return dav
}

exports.remoteDAV = remoteDAV;
