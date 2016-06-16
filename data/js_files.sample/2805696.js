var ws_host = window.location.href.replace(/(http|https)(:\/\/[^\/]*)(\/.*)/, 'ws$2');
var http_host = window.location.href.replace(/(http|https)(:\/\/[^\/]*)(\/.*)/, 'http$2');
var number = /^[1-9][0-3]?$/;


/**************************
 * Model
 **************************/
var GameModel = function() {
		this.player = null;
		this.rPlayers = null;
		this.uPlayers = null;
		this.pPlayers = null;		
		this.round=0;
		this.playerCount=0;
		this.socket=null;			
		this.statusMessage = "";
		this.wonTricks=null;
		this.playerJoined = new Event(this);
		this.playerCouldnotJoin = new Event(this);
		this.chatMessageReceived=new Event(this);
		this.newGameStarted=new Event(this);
		this.cardDrawn=new Event(this);		
		this.lastCardDrawn=new Event(this);
		this.positionChanged=new Event(this);
		this.cardsDealt=new Event(this);
		this.bidPointUpdated=new Event(this);
		this.biddingCompleted=new Event(this);
		this.trickPlayed=new Event(this);
		this.lastTrickPlayed=new Event(this);
		this.nextHandStarted=new Event(this);
		this.roundCompleted=new Event(this);
		this.lastHandPlayed=new Event(this);
		this.nextRoundStarted=new Event(this);
		this.redealRequested=new Event(this);
	}

GameModel.prototype = {
	getPlayer:function(){
		return this.player;
	},
	getRotatedPlayersList: function() {
		return this.rPlayers;
	},
	getUnrotatedPlayersList: function() {
		return this.uPlayers;
	},
	getPositionedPlayersList: function() {
		return this.pPlayers;
	},
	getRound:function(){
		return this.round;
	},
	getWonTricks:function(){
		return this.wonTricks;
	},
	getPermission:function(permission){		
		switch(permission){
			case 'start':
				return this.player.canStart;
			break;
			case 'shuffle':
				return this.player.canShuffle;
			break;
			case 'deal':
				return this.player.canDeal;
			break;
			case 'draw':
				return this.player.canDraw;
			break;
		}
	},
	getStatusMessage:function(){		
		return this.statusMessage;
	},	
	sendMessage:function(message){
		this.socket.send(Message.createMessage('chat', User.getUserid() + ':' + message));
	},
	startGame:function(){
		this.socket.emit('newgame', User.getUserid() + ' started a new game.');
	},
	proceedGame:function(arg){
		this.socket.emit(arg,'');
	},
	drawCard:function(index){
		this.socket.emit('drawcard', index, User.getUserid() + ' drew card: ');
	},
	shuffleCard:function(){
		this.socket.emit('shuffle', User.getUserid() + ' shuffled cards.');
	},
	dealCard:function(){
		this.socket.emit('deal', User.getUserid() + ' dealt cards.');
	},
	requestRedeal:function(){
		this.socket.emit('redeal', User.getUserid() + ' requested redeal.');
	},
	updateBid:function(data){
		this.socket.emit('bidtrick', data, User.getUserid() + ' bid: ');
	},
	playTrick:function(data){
		this.socket.emit('playtrick', data, User.getUserid() + ' played card: ');
	},
	joinPlayer: function(userid) {
		var _this = this;
		_this.socket = io.connect(ws_host, {
			reconnect: false
		});
		// in case of socket.io error redirect to top page
		_this.socket.on('error', function(reason) {
			console.error('Unable to connect Socket.IO', reason);
			window.location = http_host + '/quotaover';
		});
		_this.socket.on('connect', function() {
			_this.socket.emit('newuser', userid);
			User.setUserid(userid);
			_this.socket.on('message', function(message) {
				var parsed = Message.parseMessage(message);
				
				_this.statusMessage=parsed.message.status;
				_this.round=parsed.message.round;
				// Assign Current Player
				if(parsed.message.player!=undefined){
					for (var i = 0; i < parsed.message.player.length; i++) {
						if (parsed.message.player[i].id == User.getUserid()) {
							_this.player=parsed.message.player[i];					
							break;
						}
					}
				}

				switch (parsed.type) {

					case 'userupdate':					
						_this.rPlayers = ['Player1', 'Player2', 'Player3', 'Player4'];
						_this.uPlayers = ['Player1', 'Player2', 'Player3', 'Player4'];
						_this.playerCount=parsed.message.player.length;

						for (var i = 0; i < parsed.message.player.length; i++) {
							_this.rPlayers[i] = parsed.message.player[i].id;
							_this.uPlayers[i] = parsed.message.player[i].id;						
						}

						/* Rotate Players List */
						for (var i = 0; i < parsed.message.player.length; i++) {
							if (parsed.message.player[i].id == User.getUserid()) {							
								_this.rPlayers.rotate(i);
								break;
							}
						}
						_this.playerJoined.notify(this);
					break;
					case 'chat':
						_this.chatMessageReceived.notify(parsed.message);
					break;
					case 'error':
						_this.playerCouldnotJoin.notify("Opps! player already exists;");
					break;
					case 'newgame':
						_this.newGameStarted.notify(this);
					break;
					case 'drawcard':
						_this.cardDrawn.notify(parsed.message.draw);
						if(parsed.message.draw.length==4){
							_this.lastCardDrawn.notify(this);
						}
					break;
					case 'reposition':
						// re-position players 
						_this.pPlayers=new Array(4);
						for (var x in parsed.message.player){
							_this.pPlayers[parsed.message.player[x].position] = parsed.message.player[x].id;
							_this.uPlayers[parsed.message.player[x].position] = parsed.message.player[x].id;;
						}

						/* rotate players List */
						for (var i = 0; i < _this.pPlayers.length; i++) {
							if (_this.pPlayers[i] == User.getUserid()) {							
								_this.pPlayers.rotate(i);
								break;
							}
						}
						_this.positionChanged.notify(this);						
					break;	
					case 'deal':
						
						_this.cardsDealt.notify(this);
					break;
					case 'bidtrick':					
						_this.bidPointUpdated.notify(parsed.message.bids);
						if(parsed.message.bids.length==4){
							_this.biddingCompleted.notify(this);
						}
					break;										
					case 'playtrick':
						
						_this.wonTricks=new Array(4);
						for(var x in parsed.message.player){
							_this.wonTricks[parsed.message.player[x].position] = parsed.message.player[x].wonTricks;
						}
						if(parsed.message.tricks==13){
							_this.lastHandPlayed.notify(this);
						} else {
							if(parsed.message.hand.length==4){
								_this.lastTrickPlayed.notify(parsed.message.hand);
							} else {
								_this.trickPlayed.notify(parsed.message.hand);		
							}
						}						
					break;
					case 'nexthand':
						_this.nextHandStarted.notify(this);							
					break;
					case 'nextround':
						_this.nextRoundStarted.notify(this);						
					break;
					case 'redeal':
						_this.redealRequested.notify(parsed.message.shownCard);						
					break;								
				}								
			});
		});		
	}
};

/**************************
 * Event
 **************************/
var Event = function(sender) {
		this.sender = sender;
		this.listeners = [];
	};

Event.prototype = {
	attach: function(listener) {
		this.listeners.push(listener);
	},
	notify: function(args) {
		for (var x in this.listeners) {
			this.listeners[x](this.sender, args);
		}
	}

};
/**************************
 *  Login View
 **************************/
var LoginView = function(model, controller, elements) {
		this.model = model;
		this.controller = controller;
		this.elements = elements;

		var _this = this;
		this.model.playerJoined.attach(function() {
			_this.rebuild();
		});
		this.model.playerCouldnotJoin.attach(function(sender, args) {
			_this.showError(args);
		});

	};

LoginView.prototype = {
	show: function() {
		var e = this.elements;
		var _this = this;
		e.enterElement.keypress(function(event) {
			if (event.which == 13) {
				_this.controller.joinPlayer($(e.enterElement).val());
			}
		});
	},
	rebuild: function() {
		Popup.hide();
	},
	showError: function(message) {
		$(this.elements.errorLabel).html(message);
	}
};

/**************************
 * Login Controller
 **************************/
var LoginController = function(model) {
	this.model = model;
};

LoginController.prototype = {
	joinPlayer: function(userid) {
		if (userid) {
			this.model.joinPlayer(userid);
		}
	},
};

/**************************
 * Player View
 **************************/
var PlayerView = function(model, controller, elements) {
	this.model = model;
	this.controller = controller;
	this.elements = elements;

	var _this = this;
	this.model.playerJoined.attach(function() {
		_this.rebuild();
	});	
};

PlayerView.prototype = {
	rebuild: function() {
		var e = this.elements;
		// update point table header
		var args=this.model.getUnrotatedPlayersList();
		for (var i = 0; i < args.length; i++) {
			e.tableHeader.eq(i+1).text(args[i]);
		}

		var args=this.model.getRotatedPlayersList();
		// update player name
		e.player1.text(args[0]);
		e.player2.text(args[1]);
		e.player3.text(args[2]);
		e.player4.text(args[3]);			
	},	
};

/**************************
 * Player Controller
 **************************/
var PlayerController = function(model) {
	this.model = model;
};

PlayerController.prototype = {	
	
};

/**************************
 *  Chat View
 **************************/
var ChatView = function(model, controller, elements) {
	this.model = model;
	this.controller = controller;
	this.elements = elements;

	var _this = this;
	this.model.chatMessageReceived.attach(function(sender,args) {
		_this.appendConversation(args);
	});		

};

ChatView.prototype = {
	show: function() {
		var e = this.elements;
		var _this = this;
		e.messageInput.keypress(function(event) {
			if (event.which == 13) {
				_this.controller.sendMessage(e.messageInput.val());
			}
		});
	},	
	appendConversation: function(message) {
		$(this.elements.messageBox).prepend(message);
        $(this.elements.messageBox).prepend("<hr>");
	},
};

/**************************
 * Chat Controller
 **************************/
var ChatController = function(model) {
	this.model = model;
};

ChatController.prototype = {
	sendMessage: function(message) {
		if (message) {
			this.model.sendMessage(message);
		}
	},

};

/**************************
 *  Game View
 **************************/
var GameView = function(model, controller, elements) {
	this.model = model;
	this.controller = controller;
	this.elements = elements;

	var _this = this;
	this.model.playerJoined.attach(function() {
		_this.updatePermissions();
		_this.showStatusMessage();
	});
	this.model.newGameStarted.attach(function() {
		_this.initCards();
		_this.updatePermissions();
		_this.showStatusMessage();
	});	
	this.model.cardDrawn.attach(function(sender,args){
		_this.showDrawnCard(args);
		_this.showStatusMessage();				
	});
	this.model.lastCardDrawn.attach(function(){
		_this.proceedGame('reposition');
		_this.showStatusMessage();		
	});	
	this.model.positionChanged.attach(function(){
		_this.repositionPlayers();
		_this.updatePermissions();
		_this.showStatusMessage();
	});
	this.model.cardsDealt.attach(function(){
		_this.distributeCards();
		_this.updatePermissions();
		_this.showStatusMessage();
	});
	this.model.bidPointUpdated.attach(function(){
		_this.updatePermissions();
		_this.showStatusMessage();
	});
	this.model.biddingCompleted.attach(function(){
		_this.enableTrickPlay();
	});	
	this.model.trickPlayed.attach(function(sender,args){
		_this.updateTrick(args);
		_this.enableTrickPlay();
		_this.updatePermissions();
		_this.showStatusMessage();
	});
	this.model.lastTrickPlayed.attach(function(sender,args){
		_this.updateTrick(args);		
		_this.proceedGame('nexthand');
		_this.showStatusMessage();
	});
	this.model.nextHandStarted.attach(function(){
		_this.enableNextHand();
		_this.showStatusMessage();		
	});
	this.model.lastHandPlayed.attach(function(){
		_this.proceedGame('nextround');
		_this.showStatusMessage();
	});
	this.model.nextRoundStarted.attach(function(){
		_this.completeRound();
		_this.updatePermissions();
		_this.showStatusMessage();		
	});

	this.model.redealRequested.attach(function(sender,args){
		_this.requestRedeal(args);
		_this.updatePermissions();
		_this.showStatusMessage();			
	});


};

GameView.prototype = {
	init: function() {
		var e = this.elements;
		var _this = this;
		e.startButton.click(function() {
			_this.controller.startGame();			
		});
		e.shuffleButton.click(function() {
			_this.controller.shuffleCard();			
		});
		e.dealButton.click(function() {
			_this.controller.dealCard();			
		});
		
	},
	updatePermissions: function() {
		var e = this.elements;

		// update button permission
		e.startButton.toggle(this.model.getPermission('start'));
		e.shuffleButton.toggle(this.model.getPermission('shuffle'));
		e.dealButton.toggle(this.model.getPermission('deal'));		
	},
	showStatusMessage:function(){
		var e=this.elements;
		//update Status message
		e.statusMessage.html('# ' + this.model.getStatusMessage());	
	},
	initCards:function(){
		var e=this.elements;
		var _this=this;		
		e.deck.children().click(function(){
			_this.controller.drawCard($(this).index());			
		});
	},
	showDrawnCard:function(args){

		var e=this.elements;			
		
		// disable click 
		if(!this.model.getPermission('draw')){
			e.deck.children().unbind('click');			
		}

		// decrease card count by 1
		e.deck.children().eq(0).remove(); 

		// Show Card
		var arg=args[args.length-1];			
		for(var i=0;i<e.players.length;i++){
			if(arg.player === e.playersId[i].html()){
				e.players[i].children('ul.hand').append('<li ><a class="card ' + arg.card.css + '" href="#" ><span class="rank">' + arg.card.rank + '</span><span class="suit">' + arg.card.suitc + '</span></a></li>');				
				break;
			}
		}
		// padding adjustment TODO:move this manual adjustment to CSS
		e.players[1].css('padding-top', '12%');
        e.players[3].css('padding-top', '12%');                

	},
	repositionPlayers:function(){
		var e = this.elements;
		// update point table header
		var args=this.model.getUnrotatedPlayersList();
		for (var i = 0; i < args.length; i++) {
			e.tableHeader.eq(i+1).text(args[i]);			
		}

		// update player name
		args=this.model.getPositionedPlayersList();
		for (var i = 0; i < args.length; i++) {			
			e.playersId[i].html(args[i]);
		}

		// remove cards
		for(var i=0;i<e.players.length;i++){
			e.players[i].children('ul.hand').children('li').remove();			
		}
		// hide proceed button
		e.proceedButton.hide();		
	},
	distributeCards:function(){
		var e=this.elements;
		var _this=this;

		// clear deck
		e.deck.remove();
		this.completeRound();

		// distribute cards
		var player=this.model.getPlayer();
		for(var i=0; i<player.cards.length;i++){
			for(var j=1;j<4;j++){
				e.players[j].children('ul.hand').append('<li><div class="card back">*</div></li>');
			}
			e.players[0].children('ul.hand').append('<li ><a class="card ' + player.cards[i].css + '" href="#" ><span class="rank">' + player.cards[i].rank + '</span><span class="suit">' + player.cards[i].suitc + '</span></a></li>');
        }

        // secret link to show card to request for redeal
        e.players[0].children('ul.hand').children('li:nth-child(1)').children('a').bind('click', function() {
        	var r=confirm("Do you really want to request for redaeal?? Cards will be visible to other players!")	            
            if(r){
            	_this.controller.requestRedeal();
            	e.players[0].children('ul.hand').children('li:nth-child(1)').children('a').unbind('click');
            }
	    });
                
	    e.round.append('<div id="roundtable"><div class="player3"><div class="card"><span class="rank"></span><span class="suit"></span></div></div>\
	    <div><div class="player4"><div class="card"><span class="rank"></span><span class="suit"></span></div></div>\
	    <div class="player2"><div class="card"><span class="rank"></span><span class="suit"></span></div></div></div>\
	    <div class="player1"><div class="card"><span class="rank"></span><span class="suit"></span></div></div></div>'); 
	},
	requestRedeal:function(args){
		var e=this.elements;					
		for(var i=0;i<e.players.length;i++){
			if(args.player === e.playersId[i].html()){
				e.players[i].children('ul.hand').children('li').remove();
				for(var j=0;j<args.cards.length;j++){
					e.players[i].children('ul.hand').append('<li ><a class="card ' + args.cards[j].css + '" href="#" ><span class="rank">' + args.cards[j].rank + '</span><span class="suit">' + args.cards[j].suitc + '</span></a></li>');
				}				
				break;
			}
		}
	},	
	enableTrickPlay:function(){
		var e=this.elements;
		var _this=this;		
		if(_this.model.getPlayer().canTrick){
			e.players[0].children('ul.hand').children('li').children('a').unbind('click');
			e.players[0].children('ul.hand').children('li').children('a').bind('click', function() {	            
	            _this.controller.playTrick($(this).prop('class'));
	            e.players[0].children('ul.hand').children('li').children('a').unbind('click');
          	});
		}
	},
	updateTrick:function(args){
		var e=this.elements;
		var _this=this;
		var arg=args[args.length-1];		
		var player = $('.name:contains(' + arg.user + ')').parent();
		var id=player.prop('id');
        var cardOnTable = $('div.' + id).children('div');
        cardOnTable.removeClass();
        cardOnTable.addClass('card '+ arg.card.css);        
        cardOnTable.children('span.rank').html(arg.card.rank);
        cardOnTable.children('span.suit').html(arg.card.suitc);
        
	    // hide played card
	    player.children('ul').children('li').children('a.' + arg.card.css.replace(/ /g, '.')).hide();
	    player.children('ul').children('li').eq(0).children('div').remove();

	},
	enableNextHand:function(){		
		var target = $('div[class^="player"]').children('div');		
        target.removeClass();
        target.addClass('card');
        target.children('span.rank').html('');
        target.children('span.suit').html('');

        // hide proceed button
		this.elements.proceedButton.hide();	
		this.enableTrickPlay();
	},
	proceedGame:function(args){
		var e=this.elements;
		var _this=this;
		e.proceedButton.show();
		e.proceedButton.unbind('click');				
		e.proceedButton.bind('click',function() {
			_this.controller.proceedGame(args);						
		});
	},
	completeRound:function(){
		var e=this.elements;		

		// remove cards
		for(var i=0;i<e.players.length;i++){
			e.players[i].children('ul.hand').children('li').remove();			
		}
		e.round.children("#roundtable").remove();
		e.proceedButton.hide();	
	},
};

/**************************
 * Game Controller
 **************************/
var GameController = function(model) {
	this.model = model;
};

GameController.prototype = {
	startGame:function(){
		this.model.startGame();
	},
	drawCard:function(index){
		this.model.drawCard(index);
	},
	shuffleCard:function(){
		this.model.shuffleCard();
	},
	dealCard:function(){
		this.model.dealCard();
	},
	requestRedeal:function(){
		this.model.requestRedeal();
	},	
	playTrick:function(message){
		this.model.playTrick(message);
	},
	proceedGame:function(args){
		this.model.proceedGame(args);
	}

};

/**************************
 *  PointTable View
 **************************/
var PointTableView = function(model, controller, elements) {
	this.model = model;
	this.controller = controller;
	this.elements = elements;

	var _this = this;
	this.model.cardsDealt.attach(function(){
		_this.enableBidding();
	});
	this.model.bidPointUpdated.attach(function(sender,args){
		_this.enableBidding();
		_this.updateBidPoint(args);
	});
	this.model.lastTrickPlayed.attach(function(sender,args){
		_this.showRoundStatus();
	});
	this.model.lastHandPlayed.attach(function(sender,args){
		_this.showRoundStatus();
	});		
	this.model.nextRoundStarted.attach(function(sender,args){
		_this.completeRound();
	});	

};

PointTableView.prototype = {
	enableBidding:function(){
		var e=this.elements;
		var _this=this;
		
		if(_this.model.getPlayer().canBid){
			var td= e.table.children().eq(this.model.getRound()+1).children().eq(this.model.getPlayer().position+1);
			td.attr('contenteditable', 'true');
			var cellHighlight=setInterval(function(){
				td.toggleClass("cell-background")},1000);
			td.keydown(function(event) {
    			var esc = event.which == 27,
      			nl = event.which == 13,
      			el = event.target,
      			data = {};

			    if (el) {
			      if (esc) {
			        // restore state
			        document.execCommand('undo');
			        el.blur();

			      } else if (nl) {
				      	if(number.test($(this).html())){

					        _this.controller.updateBid($(this).html());					        
					        
					        td.removeAttr('contenteditable');
					        td.removeClass("cell-background");
					        clearInterval(cellHighlight);
					    }
					    el.blur();
					    event.preventDefault();
			      }
			    }
			  });
		} 
	},
	updateBidPoint:function(args){		
		var e=this.elements;
		var arg=args[args.length-1];
        e.table.children().eq(this.model.getRound()+1).children().eq(arg.position+1).html(arg.point);
	},
	showRoundStatus:function(args){
		var e= this.elements;
		var wonTricks=this.model.getWonTricks();
		for(var i=0;i<wonTricks.length;i++){			
			e.table.children().eq(this.model.getRound()+2).children().eq(i+1).html(wonTricks[i]);
		}		
	},
	completeRound:function(args){
		var e=this.elements;

		var pr = e.table.children().eq(this.model.getRound());		
		var cr = e.table.children().eq(this.model.getRound()+1);
		for(var i=0;i<pr.children.size();i++){

			var a=parseInt(pr.children.eq(i).html());
			var b=parseInt(cr.children.eq(i).html());
			
			if(a < b ) {
				pr.children.eq(i).html(a +'.' + (b-a));
			} else if (a > b){
				pr.children.eq(i).html(a * -1);
			} 
			cr.children.eq(i).html('0');

		}

		e.table.children().eq(this.model.getRound()+2).after(cr);

	}
};

/**************************
 * PointTable Controller
 **************************/
var PointTableController = function(model) {
	this.model = model;
};

PointTableController.prototype = {
	updateBid:function(data){
		this.model.updateBid(data);
	}
};

/**************************
 * Utils
 **************************/
var Message = {
	createMessage: function(type, message) {
		var msg = {
			type: type,
			message: message
		};
		return JSON.stringify(msg);
	},
	parseMessage: function(message) {
		return JSON.parse(message);
	},
};

var User = new function() {
		this.userid = '';
		this.getUserid = function() {
			return this.userid;
		}
		this.setUserid = function(userid) {
			this.userid = userid;
		}
};