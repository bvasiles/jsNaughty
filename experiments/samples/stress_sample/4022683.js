var util = require('util');
var nodemailer = require('nodemailer');

exports.home = function(req, res){
  	if(!req.session.auth){
   		res.render('home', { title: 'WeSmile Promoter'});
   		return;
  	}
	res.render('promoview', { title: 'WeSmile Promoter - Logged in' });
};

exports.home_post_handler = function(req, res){

	var pwstring = req.body.password || "";
	var d = require('crypto').createHash('sha1').update(pwstring).digest('hex');
	if(d != "8f79a9f2c09519ee951c6101d1c49c75ed0703d5"){
		req.session.destroy();
		res.redirect('/');
		return;	
	}
	req.session.auth = true;
	res.redirect('/');
};

exports.send_post_handler = function(req, res){
	var scid = req.body.scid;
	var emailList = req.body.address.split(",");
	var smtpTransport = nodemailer.createTransport("SMTP",{
	service: "Gmail",
	auth: {
		user: "wesmilepromoter@gmail.com",
		pass: "myfirstpassword"
	}
	});

	for(var ii = 0; ii<emailList.length;ii++){
		var mailOptions = {
			from: "WeSmile <wesmilepromoter@gmail.com>",
			to: emailList[ii],
			subject: req.body.subject,
			html: '<div>' + req.body.toptext + '</div><br><div>'+scid+'</div><br><div>' + req.body.floortext + '</div>'
		}
		smtpTransport.sendMail(mailOptions, function(error, response){
			if(error) {
			 	console.log(error);
				smtpTransport.close();
				res.render('embedview', { title: 'WeSmile Promoter - Logged in', id: scid, errormsg: error});
			}
		});
	}
	smtpTransport.close();
	res.render('embedview', { title: 'WeSmile Promoter - Logged in', id: scid, errormsg: "Looks like it worked"});
};

exports.embed_post_handler = function(req, res){
	var string = req.body.code || "no code";
	if(string == "no code"){
		res.redirect('/');
		return;	
	}
	//fix this.
	var src = string.substring(71,158);
	src += "&show_artwork=false";

	var sourcestring = "<iframe width=\"100%\" height=\"166\" scrolling=\"no\" frameborder=\"no\" src=\""+ src + "\"></iframe>"

        //var fs = require('fs');
	//fs.writeFile("test.html", sourcestring, function(err){
        //if (err) console.log(err);
        //});
	
	////working
        //res.writeHeader(200, {"Content-Type": "text/html"});  
        //res.write(sourcestring);  
        //res.end();

	res.render('embedview', { title: 'WeSmile Promoter - Logged in', id: src, raw: string, errormsg: ''});
};


