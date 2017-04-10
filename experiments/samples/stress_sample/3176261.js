/* GAME VARIABLES */
var game;

$("#container").live("pageinit", function() {
	var players = convertToMooToolsPlayers();
	var pieces = convertToMooToolsPieces();
	var slots = convertToMooToolsBoard();
		
	game = new Game(null, {
		title: "Yutnori",
		players: new PlayerList(null, {players: players}),
		board: new Board(null, {slots: slots}),
		pieces: new PieceList(null, {pieces: pieces}),
		rollMax: 5
	});

	/* Game Events */
	game.onMoveStart = function(player, callback) {
		console.log("onMoveStartb");
		player.showPiecePicker(["isOffBoard","isOnBoard"], function() {
			callback();
			if (!game.current.pieceToMove.isOnBoard()) {
				game.current.pieceToMove.setPosition(5, 5);
				game.current.pieceToMove.addToBoard(5, 5);
				game.disableLeaveEvent(game.options.board.options.slots[5][5], 1);
			}
			
			if (game.current.moveCount == 4 || game.current.moveCount == 5) {
					game.turnSetAnother(player, 1);
			}
		});
	}
	
	/* Board and Slot Events */
	game.options.board.onLand = function(slot, piece, eventType, callback) {
		console.log("onLandb");
		var sPieces = slot.getPieces();
		if(sPieces.length > 1) {
			for (var i = 0; i < sPieces.length; i++) {
				var p = sPieces[i];
				if (p.options.player != game.current.player) {
					p.removeFromBoard();
					game.turnSetAnother(game.options.players.getPlayerByID(game.current.player), 1);
				} 
			}
		}
		callback();
	};
	
	game.options.board.onLeave = function(slot, piece, eventType, callback) {
		console.log("onLeaveb");
		var sPieces = slot.getPieces();
		if(sPieces.length > 1) {
			var allAllies = true;
			for (var i = 0; i < sPieces.length; i++) {
				var p = sPieces[i];
				if (p.options.player != piece.options.player) {
					allAllies = false;
				} 
			}
			if (allAllies) {
				// move all pieces together!
				game.current.pieceToMove = sPieces;
			}
		}
		callback();
	};
	
	game.options.board.options.slots[5][5].onLeave = function(piece, eventType, callback) {
		console.log("onLeave 5,5");
		if (!$.isArray(piece)) {
			piece = [piece];
		}
		for (var i = 0; i < piece.length; i++) {
			piece[i].removeFromBoard(true);
			game.current.moveCount = 0;
			// prevent onLand event from premature ending of move
			game.disableLandEvent(game.options.board.options.slots[5][5], 1);
		}
		var player = game.options.players.getPlayerByID(game.current.player);
		var playerPieces = player.getPieces();
		var permCount = 0;
		for (var i = 0; i < playerPieces.length; i++) {
			var p = playerPieces[i].options;
			if (p.state == "isPermOffBoard") {
				permCount++;
			}
		}
		if (permCount == 4) {
			player.win();
			game.end();
		}
		callback();
	};
	
	game.start(); // must not put in pageshow, otherwise gets called multiple times
});