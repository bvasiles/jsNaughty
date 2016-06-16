$(document).ready(function() {

var Item = Backbone.Model.extend({
  defaults: {
    image_url:'http://g-ecx.images-amazon.com/images/G/01/x-site/icons/no-img-sm._V192198896_.gif'
  }
})
var Result = Backbone.Collection.extend({model: Item});


var ItemView = Backbone.View.extend({
    tagName: 'div', 
	className: "book",			
   	initialize: function(){
     	_.bindAll(this, 'render','createQRCodeURL'); 
    },
	createQRCodeURL: function(size,url){
		return "http://chart.apis.google.com/chart?cht=qr&chs="+size+"x"+size+"&chl="+escape(url);
	},
   	render: function(){
		var self=this;		
	    $(this.el).html(ich.books(this.model.toJSON()));
	
		this.request=$.getJSON('php/shorten.php?url='+escape(this.model.get('detail_url')), function(data) {	

			var shortUrl=self.createQRCodeURL(180,data.shortUrl);
			$('.qr_code',self.el).append(ich.qr_code({shortUrl:shortUrl}));
			$('.details',self.el).append('<div class="list"><b>Download Sizes</b><br/></div>');
			_.each([100,200,300,400,500], function(num){ 		
					$('.list',self.el).append(ich.qr_code_downloads({shortUrl:self.createQRCodeURL(num,data.shortUrl),num:num}));
			})
		});
		
	    return this; 
   	}
 });


 var FormView = Backbone.View.extend({
   el: $('#form'),
   events: {"submit form": "search","reset form": "reset","webkitAnimationEnd form":"endShake","animationend form":"endShake"},
	initialize: function(options){
		_.bindAll(this, 'render', 'search','reset');
	 	this.eventAggregator=options.eventAggregator;	  
	},
	reset: function(){	
		this.eventAggregator.trigger('clear_result');
	},	
	search: function(){	
		if($('#term').val()!==''){
			this.eventAggregator.trigger('search_request',{term:$('#term').val(),affiliate_id:$('#affiliate_id').val()});
		}
		else{
			$("form",self.el).addClass("shake");
		}				  	
		return false;
	},	
	endShake: function(){	
		$("form",self.el).removeClass("shake");
	},	
	render: function(term,affiliate_id){
	  $(this.el).html(ich.form);
	  if(term!==null){
		$('#term').val(term);
	  }
	  if(affiliate_id!==null){
		$('#affiliate_id').val(affiliate_id);
	  }	
	}
	
  })


 var ResultView = Backbone.View.extend({
   el: $('#result'),
   events: {"click .alert-message":"hideMessage"},
   request: null,	
	initialize: function(options){
	  _.bindAll(this, 'render', 'search', 'appendItem','hideMessage','clearResult'); 
	  this.collection = new Result().bind('add', this.appendItem);     	  		
	  options.eventAggregator.bind("search_request", this.search);
	  options.eventAggregator.bind("clear_result", this.clearResult);
	  $.ajaxSetup({error:function(e) { 
				console.log(e); 
				$('#loader').hide();
				$('ul', self.el).html(ich.error(e));
	   }});	
	},
	render: function(){
	  _(this.collection.models).each(function(item){ 
	    this.appendItem(item);
	  }, this);
	},
	clearResult: function()
	{
		if(this.request!==null)
		{
			this.request.abort();
		}		
		$(this.el).html(ich.result_header());
		app.navigate("/", false);
	},	
	hideMessage: function()
	{
		$(".alert-message").hide();
	},
   search: function(params){
	
		if(this.request!==null)
		{
			this.request.abort();
		}	
		var term=params.term;
		var affiliate_id=params.affiliate_id;	
		app.navigate("search/"+term+"/"+affiliate_id, false);
		$( this.el).html(ich.result_header());
		$('#loader').show();
		var self=this;		

		if(affiliate_id==""||affiliate_id==null)
		{
			affiliate_id='EMPTY';
		}			
		
		this.request=$.getJSON('php/search.php?term='+escape(term)+"&affiliate_id="+escape(affiliate_id), function(data) {
			if(data!=null && !_.isArray(data)){
				data=[data];
			}
			$('#loader').hide();
			if(data===null || data.length===0)
			{
				$( self.el).append(ich.nothing_found());				
			}
			else
			{
		 		$.each(data, function(key, val) {		
					
						try{
							
							var item=new Item().set({title: val.ItemAttributes.Title,detail_url:val.DetailPageURL});
								
							if(val.MediumImage!=null){
								item.set({image_url:val.MediumImage.URL});
							}

							if(val.ItemAttributes.Author!=null)
							{
								item.set({author: val.ItemAttributes.Author});
							}	
							else if(val.ItemAttributes.Creator!=null)
							{
								item.set({author: val.ItemAttributes.Creator._+" ( "+val.ItemAttributes.Creator.Role+" )"});
							}
							else
							{
								item.set({author:""});
							}
							self.collection.add(item);								
						}
						catch(err)
						{
							$(self.el).append(ich.error(err));							
							console.log(err);								
							console.log(val);
						}
				})
			}

	  });
   },
   appendItem: function(item){
	  $(this.el).append(new ItemView({model: item}).render().el);
   }
 });




var BuyItLater = Backbone.Router.extend({
	initialize : function(){
		eventAggregator = _.extend({}, Backbone.Events);		
		formView = new FormView({eventAggregator:eventAggregator});
		resultView = new ResultView({eventAggregator:eventAggregator});
	},
	routes : {
		"search/:term": "search",
		"search/:term/:affiliate_id": "search",		
		".*" : "index",
		"/" : "index"
	},
	index : function(){
		formView.render();
		resultView.render();		
	},
	search : function(term,affiliate_id){
		formView.render(term,affiliate_id);
		resultView.render();
		eventAggregator.trigger('search_request',{term:term,affiliate_id:affiliate_id});
	}
});	


	
	
var app = new BuyItLater();
Backbone.history.start();
   
});


