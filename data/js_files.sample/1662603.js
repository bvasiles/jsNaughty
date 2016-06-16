var PDF = require('pdf.js')
  , Pivotal = require('pivotal')
  , actions ={  
    index: function(req, res){
      if(!req.session.token){res.redirect('/')}
      Pivotal.useToken(req.session.token);
      Pivotal.getIterations(req.params.project,{group: '/current_backlog'}, function(err,results){
        var cards = new PDF();
        res.send('foo');
      });
    }
  , print: function(req, res){
      if(!req.session.token){res.redirect('/')}
      Pivotal.useToken(req.session.token);
      Pivotal.getStory(req.params.tracker, req.params.story, function(err,results){
        if(err){throw err};
        var pdf = new PDF({size: [(5*72),(3*72)]})
          , card = 'story-'+ req.params.story +'.pdf'
          , description = (typeof(results.description)=='string') ? results.description.replace(/\?/g, '') : 'no description';
        console.log(description);
        pdf.moveTo(10,10);
        pdf.image('public/img/burst.jpg', 0, 0, {width: (5*72), height: (3*72)});
        pdf.font('public/fonts/SourceCodePro-Regular.ttf').fillColor('#FFF').text(results.name, 40, 10,{width: ((72*5)-50)});
        pdf.rect(10, 50, ((5*72)-20), (3*72)-60).stroke('#eee');
        try{
        pdf.text(description, 15, 55, {width: (72*5)-20, height: (72*1.5)});
        }catch(err){
          console.log(err);
        }
        pdf.write('public/'+card, function(pdf){
          res.download('public/'+card)
        });
      });
    }
  };
module.exports = actions;
