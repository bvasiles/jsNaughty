exports.handler = (function() {
  var browseridVerify = require('browserid-verifier');
   
  function serve(req, res) {
     var dataStr = '';
     req.on('data', function(chunk) {
       dataStr += chunk;
     });
     req.on('end', function(chunk) {
       var obj = {
         assertion: dataStr,
         audience: "http://myfavouritecontact.org"
       }
       //console.log('obj start');
       //console.log(obj);
       //console.log('obj end');
       browseridVerify(obj, function (err, r) {
         if(err) {
           res.write('Njet robotet: '+JSON.stringify(err));
           res.end();
         } else {
           res.write(JSON.stringify(r));
           res.end();
         }
       });
     });
  }

  return {
    serve: serve
  };
})();
