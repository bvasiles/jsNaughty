var MongoStore = require('connect-mongo');
var express = require('express');
var settings = require('./settings');
var dbMan = require('./dbManager');
var app = module.exports = express.createServer();
var bcrypt = require('bcrypt');  
var salt = bcrypt.gen_salt_sync(10);  
var io = require('socket.io').listen(app);

var dnode = require('dnode');

app.configure(function(){
    app.set('views', __dirname + '/views');
    app.use(express.static(__dirname + '/public'));
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.session({ store: MongoStore({url:settings.mongostore.server}), secret: settings.mongostore.secret }));
    app.use(express.methodOverride());
    app.dynamicHelpers({
        session: function (req, res) {
            return req.session;
        }
    });
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
    
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

var renderWatches = function(res,username){
    dbMan.scrapeWatchModel.find({'user.username':username},function(err,watches){
        res.render('watches', {
            title: 'watches',
            watches: watches
        });    
    });
};


app.get('/login', function(req, res){
    res.render('login', {
        title: 'Please login below'
    });
});


app.post('/login', function(req, res){
    if(req.body.username){
        dbMan.webUsersModel.findOne({'username':req.body.username},function(err,currentUser){
            if(err){
                console.log(err); 
                return;
            };
            req.session.authed = bcrypt.compare_sync(req.body.password, currentUser.password); 
            req.session.username = req.body.username; 
            res.redirect('/');    
            return;
        });
    }else{
        res.render('login', {
            title: 'Please login below'
        });
    };
});

app.get('/', function(req, res){
    if(req.session.authed){
        res.render('index', {
            title: 'Welcome to Pasty Lurker'
        });
    }else{
        res.redirect('/login'); 
    };
});

app.get('/watches', function(req, res){
    if(req.session.authed){
        dbMan.scrapeWatchModel.find({'user.username':req.session.username},function(err,watches){
            res.render('watches', {
                title: 'watches',
                watches: watches
            });    
        });
    }else{
        res.redirect('/login'); 
    };
});

app.get('/deleteWatch/:watchID', function(req, res){
    if(req.session.authed){
        dbMan.scrapeWatchModel.find({'user.username':req.session.username},function(err,watches){
            watches.forEach(function(watch){
                if(watch.id == req.params.watchID){
                    watch.remove(); 
                    renderWatches(res,req.session.username);
                };    
            }); 
        });
    }else{
        res.redirect('/login'); 
    };
});

app.get('/toggleWatch/:watchID', function(req, res){
    if(req.session.authed){
        dbMan.scrapeWatchModel.find({'user.username':req.session.username},function(err,watches){
            watches.forEach(function(watch){
                if(watch.id == req.params.watchID){
                    watch.active = !watch.active; 
                    watch.save(function(){
                        renderWatches(res,req.session.username);  
                    });
                };    
            }); 
        });
    }else{
        res.redirect('/login'); 
    };
});

app.get('/addWatch', function(req, res){
    if(req.session.authed){
        res.render('watches/newWatch', {
            title: 'watches'
        });
    }else{
        res.redirect('/login'); 
    };
});

app.post('/addWatch', function(req, res){
    if(req.session.authed){
        dbMan.webUsersModel.findOne({'username':req.session.username},function(err,user){
            var newWatch = new dbMan.scrapeWatchModel(); 
            newWatch.watchString = req.body.watchstring;
            newWatch.active = true;
            newWatch.user.push(user);
            newWatch.save();
            renderWatches(res,req.session.username);  
        });
    }else{
        res.redirect('/login'); 
    };
});

app.get('/admin', function(req, res){
    if(req.session.authed){
        res.render('index', {
            title: 'admin'
        });
    }else{
        res.redirect('/login'); 
    };
});

app.post('/', function(req, res){
    dbMan.scrapesModel.find({'fileData':new RegExp(req.body.searchdata,"gi")},[],{'limit':10},function(err,docs){
        if(err){
           return;
        }
        res.render('results', {
            title: 'Search Results',
            locals:{ list: docs}
        });
    });
    
});

app.get('/stats', function(req, res){
    dbMan.scrapesModel.find({}).count(function(err1,count){
        dbMan.scrapesModel.find({'checked':true}).count(function(err,countdeep){
            res.render('stats', {
                    title: 'Current App Stats',
                    scraped : countdeep ,
                    urls: count,
                    diff : count - countdeep 
            });        
        });        
    });
});

app.listen(3000,'127.0.0.1');
io.sockets.on('connection', function (socket) {
      console.log('client connected');
      socket.emit('news', { hello: 'world' });
      //socket.on('news', function (data) {
          //console.log(data);
      //});
});

// Callback expects the following param , url : this is the url to scrape 
var getNextURLToScrape = function(callback){
    dbMan.scrapesModel.findOne({'checked':false},function(err,scrape){
        if(scrape){
             callback(scrape.url);
        }else{
             callback(null);
        };
    });
};

var updateScrape = function(url,data,callback){
    dbMan.scrapesModel.findOne({'checked':false,'url':url},function(err,scrape){
        if(scrape){
            scrape.checked = true;
            scrape.fileData = data;
            scrape.save(function(err){
                if(err){
                    console.log(err);
                    callback(null);
                    return;
                };
                callback('Thanks for the update');
                //console.log('[-] Scraping complete ');
            });
        }else{
             callback(null);
        };
    });
};

var server = dnode({
        updateScrape : updateScrape,
        getNextURLToScrape : getNextURLToScrape,
        ping : function(){
        
        }
});
server.listen(5050);

console.log("Express server listening on port %d",app.address().port);
