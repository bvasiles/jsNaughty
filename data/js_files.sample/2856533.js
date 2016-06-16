(function($, window, undefined) {
	
	function range(begin, end){
		var range = [];
	    for (var i = 0; i < end; ++i){
	        range[i]=i;
	    }
	    return range;
	}
	
	var Piece = function(color, shape, stack) {
		this.color = color;
		this.shape = shape;
		this.stack = stack;
	}
	
	$.extend(Piece.prototype, {
		matches: function(piece) { 
			return this.color == piece.color || this.shape == piece.shape;
		},
		findMatchingPieces: function(pieces) {
			var matching = [];
			for (var i = 0; i < pieces.length; i++) {
				if (this.matches(pieces[i])) {
					matching.push(i);
				}
			}
			return matching;
		}
	});

	var _PushPop = function() {
			this.stacks = [];
			this.guess = [];
			this.timer = null;
			this.timerRefresh = 0;
			this.id = null;
			this.solution = null;
			this.solutionTree = null;
			this.counter = 0;
			this.gotHint = false;
	}

	_PushPop.DIFFICULTIES = ["easy","medium","hard","harder","insane"];

	$.extend(_PushPop.prototype, {
		startOver: function() {
			while (this.popGuessStack());
		},
		popGuessStack: function() {
			var piece = this.guess.pop();
			if (piece) {
				this.stacks[piece.stack].push(piece);
				this.counter++;
			}
			return piece;
		},
		generateSolution: function() {
			var solution = [];
			var pieces = [];
			for (var i = 0; i < this.numStacks; i++)
				for (var j=0; j < this.depth; j++)
					pieces.push(new Piece(i, j));

			var tries = 0;
			while (true) {
				tries++;
				solution = [];
				var remainingPieces = pieces.slice();
				var canContinue = true;
				var lastPiece = null;
				
				while (canContinue) {
					var matchingIndexes = lastPiece == null ? range(0, remainingPieces.length-1) : lastPiece.findMatchingPieces(remainingPieces);
					if (matchingIndexes.length != 0) {
						var pieceIndex = matchingIndexes[Math.floor(Math.random()*matchingIndexes.length)];
						lastPiece = remainingPieces.splice(pieceIndex, 1)[0];
						solution.push(lastPiece);
					} else {
						canContinue = false;
					}
				}
				if (remainingPieces.length == 0) break;
			}
			return solution;
		},
		generateBoard: function(solution) {
			for (var i = 0; i < this.numStacks; i++) { this.stacks[i] = []; }
			for (var i = 0; i < solution.length; i++) {
				var index;
				while( this.stacks[(index = Math.floor(Math.random() * this.numStacks))].length >= this.depth);
				var piece = solution[i];
				piece.stack = index;
				this.stacks[index].push(piece);
				piece.id = "piece-"+index+"-"+this.stacks[index].length;
			}
			this.assignGameId();
		},
		assignGameId: function() {
			this.id = "";
			for (var i = 0; i < this.stacks.length; i++) {
				var bitId = 0;
				var stack = this.stacks[i];
				for (var j = 0; j < stack.length; j++) {
					var piece = stack[j];
					bitId <<= 2;
					bitId += piece.color;
					bitId <<= 2;
					bitId += piece.shape;
				}
				var chunk = bitId.toString(16);
				if (chunk.length < 4) chunk = "0"+chunk; 
				this.id += chunk;
			}
		},
		rebuildBoard: function(boardData) {
			var colors = ["R","Y","B","G"];
			var shapes = ["G","C","H","L"];
			this.stacks = [[],[],[],[]];
			var i = 0;
			while (i < boardData.length) {
				var stackNum = (i / 2) % 4;
				var piece = new Piece(colors.indexOf(boardData.charAt(i)), shapes.indexOf(boardData.charAt(i+1)), stackNum);
				this.stacks[stackNum].unshift(piece);
				piece.id = "piece-"+stackNum+"-"+this.stacks[stackNum].length;
				i += 2;
			}
			this.assignGameId();
		},
		rememberBoard: function(boardId) {
			this.stacks = [];
			for (var i = 0 ; i < boardId.length; i++) {
				if (i % 4 == 0) {
					this.stacks.push([]);
				}
				var pieceNum = parseInt(boardId.charAt(i), 16);
				var stackNum = this.stacks.length-1;
				var piece = new Piece((pieceNum >> 2 & 0x3), pieceNum & 0x3, stackNum);
				this.stacks[stackNum].push(piece);
				piece.id = "piece-"+stackNum+"-"+this.stacks[stackNum].length;
			}
			this.id = boardId;
		},
		init: function(numStacks, depth, difficulty, id) {
			this.numStacks = numStacks;
			this.depth = depth;
			if (PushPop.DIFFICULTIES.indexOf(difficulty) == -1) {
				difficulty = "easy";
			}

			this.solutionTree = null;
			if (id == null || id == "") {
				while (!this.matchesDifficulty(difficulty)) {
					this.solution = this.generateSolution();
					this.solutionTree = null;
					this.generateBoard( this.solution );
				}
			} else if (id.length==32){
				this.rebuildBoard(id);
			} else {
				this.rememberBoard(id);
			}
			this.getSolutionTree();
			return this;
		},
		getSolutionTree: function() {
			if (!this.solutionTree) {
				this.solutionTree = this.buildTree(null, this.stacks);
			}
			return this.solutionTree;
		},
		matchesDifficulty: function(level) {
			if (this.id == null) return false;
			var maxRatio, minRatio, maxBranches = 0;
			if (level == "easy") {
				minRatio = 0.3;
				maxRatio = 1;
				maxBranches = 20;
			} else if (level == "medium") {
				minRatio = 0.15;
				maxRatio = 0.3;
				maxBranches = 50;
			} else if (level == "hard") {
				minRatio = 0.06;
				maxRatio = 0.15;
			} else if (level == "harder") {
				minRatio = 0.02;
				maxRatio = 0.06;
			} else if (level == "insane") {
				minRatio = 0;
				maxRatio = 0.02;
			}

			var st = this.getSolutionTree();
			var gameScore = st.numSolutions/st.numBranches;
			var numBranches = st.numBranches;
			return (gameScore >= minRatio && gameScore <= maxRatio) || numBranches < maxBranches;
		},
		start: function(timerListener) {
			this.counter = 0;
			this.gotHint = false;
			this.timer = new Timer();
			this.timer.start();
			if (this.timerRefresh) {
				clearInterval(this.timerRefresh);
			}
			var timerObj = this.timer;
			this.timerRefresh = setInterval(function() { timerListener(timerObj); }, 500);
		},
		shutdown: function() {
			if (this.timerRefresh) {
				clearInterval(this.timerRefresh);
			}
			this.timer = null;
			this.stacks = [];
			this.guess = [];
			this.solution = null;
			this.solutionTree = null;
			this.counter = 0;
			this.gotHint = false;
		},
		puzzleFinished: function() {
			for (var i = 0; i < this.stacks.length; i++) {
				if (this.stacks[i].length != 0) return false;
			}
			return true;
		},
		popStack: function(stack) {
			var lastPiece = this.guess.length > 0 ? this.guess[this.guess.length-1] : null;
			var piece = this.stacks[stack].pop();
			if (piece) {
				if (lastPiece == null || lastPiece.matches(piece)) {
					this.guess.push(piece);
					this.counter++;
					return piece;
				} else {
					this.stacks[stack].push(piece);
				}
			}
			return false;
		},
		getHint: function() {
			var onTrack = true;
			var currentNode = this.getSolutionTree();
			for (var i = 0; i < this.guess.length && onTrack; i++) {
				var piece = this.guess[i];
				for (var j=0; j < currentNode.options.length && onTrack; j++) {
					if (currentNode.options[j].piece.id == piece.id) {
						if (currentNode.options[j].numSolutions > 0) {
							currentNode = currentNode.options[j];
						} else {
							onTrack = false;
						}
						break;
					}
				}
			}
			this.gotHint = true;
			if (!onTrack) {
				return -1;
			} else {
				var maxStack = -1;
				var maxSolutions = 0;
				for (var j=0; j < currentNode.options.length; j++) {
					if (currentNode.options[j].numSolutions > maxSolutions) {
						maxSolutions = currentNode.options[j].numSolutions;
						maxStack = currentNode.options[j].piece.stack; 
					}
				}
				return maxStack;
			}
		},
		buildTree: function(solutionTree, treeStacks) {
			solutionTree = solutionTree || { piece: null, options: []};
			solutionTree.numSolutions = 0;
			solutionTree.numBranches = 0;
			solutionTree.decisionPoint = false;
			for (var i = 0; i < treeStacks.length; i++) {
				var stackLength = treeStacks[i].length;
				if (solutionTree.piece == null || (stackLength > 0 && treeStacks[i][stackLength-1].matches(solutionTree.piece))) {
					var newStacks = treeStacks.slice();
					for (var j = 0; j < newStacks.length; j++) {
						newStacks[j] = newStacks[j].slice();
					}
					var newBranch = this.buildTree({ piece: newStacks[i].pop(), options: []}, newStacks);
					solutionTree.options.push(newBranch);
				}
			}

			if (solutionTree.options.length == 0) {
				var finished = true;
				for (var j = 0; j< treeStacks.length; j++) {
					finished = finished && treeStacks[j].length == 0;
				}
				solutionTree.solution = finished;
				solutionTree.numBranches = 1;
				solutionTree.numSolutions = finished ? 1 : 0;
			} else {
				solutionTree.solution = solutionTree.options[0].solution;
				for (var j = 0; j < solutionTree.options.length; j++) {
					solutionTree.numSolutions += solutionTree.options[j].numSolutions;
					solutionTree.numBranches += solutionTree.options[j].numBranches;
					if (solutionTree.solution != solutionTree.options[j].solution) {
						solutionTree.decisionPoint = solutionTree.solution != undefined &&
							solutionTree.options[j].solution != undefined;
						solutionTree.solution = undefined;
					}
				}
			}

			return solutionTree;
		}
	});

	window.PushPop = _PushPop;
})(jQuery, window);