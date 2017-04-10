(function() {
	var doc = document, win = window;
	$.sequence = {
		//checks row length
		checkEachRowLength : function() {
			var arr = $.phylo.origin;
			$.phylo.eachRowLength = [];
			for(var i=0, ll = arr.length; i < ll;i++) {
				var counter = 0;
				for(var j=0, len = arr[i].length; j < len; j++) {
					if(arr[i][j] != "x")
						counter+=1; 
				}
				$.phylo.eachRowLength.push(counter);
			}
		},
		//retrives repsective nucleotide
		nuc : function(x) {
			if (x == "x") {
				return "x";
			}
			return this.nucleotide[x];
		}, 
		//retrives an array of nucleotide
		nucArray : function(arr) {
			var reArr = [];
			for(var i in arr) {
				if(arr[i] == "x") {
					reArr.push("x");
				} else {
					reArr.push(this.nuc(arr[i]));
				}
			}	
			return reArr;
		},
		//creates a dom cache of the grids but only contains style
		createCache : function() {
			var arr = [];		
			for(var i=0, y=$.phylo.rows, x = $.phylo.seqLen; i<y*x;i++) {
				arr.push(0);
			}

			$(".sequence").each(function() {
				var id = $(this).attr("id");
				arr[id] = document.getElementById(id).style;
			});
			return arr;
		},
		//creates a dom cache of the grid but includes parent
		createCache2 : function() {
			var arr = [];		
			for(var i=0, y=$.phylo.rows, x = $.phylo.seqLen; i<y*x;i++) {
				arr.push(0);
			}

			$(".sequence").each(function() {
				var id = $(this).attr("id");
				arr[id] = document.getElementById(id);
			});
			return arr;
		},
		//calculates the cell position
		calcPos : function(pos) {
			//console.log(pos);
			//return 32*pos;
			return 32*pos+(pos);
		},
		//builds the sequence
		build : function(seq) {
			var str = "";
			var self = this;
			this.posList = [];
			this.posListReverse = [];
			this.nucleotide = [];

			for(var i=0, y=$.phylo.rows, x = $.phylo.seqLen;i<y*x;i++) {
				this.posList.push(0);
				this.posListReverse.push(0);
				this.nucleotide.push(0);
			}

			for(var i=0;i<seq.length;i++) {
				str+="<div class='boardRow hidden' id='row"+i+"'>";
				var counter = 0;
				for(var j=0;j<seq[i].length;j++) {
					var c = seq[i].charAt(j);
					if(c !=  "_") {
						this.posList[i*$.phylo.seqLen+counter] = counter;	
						this.nucleotide[i*$.phylo.seqLen+counter] = seq[i].charAt(j);
						str+="<div class='sequence "+ this.colorTag(this.translate(c))+"' id='"+(i*$.phylo.seqLen+counter)+"' style='left:"+(this.calcPos(j))+"px;'></div>";
						counter++;
					}
				}	
				for(var k=0;k<counter;k++) {
					this.posListReverse[i*$.phylo.seqLen+k] = counter-k;
				}
				
				str+="<div class='red-line' id='red"+i+"'></div>";
				str+="</div>";
			} 
			$("#gameBoard").append("<div id='movingParts'>"+str+"<div>");
			$(".boardRow").css("height",self.calcPos(1));
		},
		//gets the color tag of respected nucletide 
		colorTag : function(x) {	
			if(x == 1) 
				return "nuc-A";
			if(x == 2)
				return "nuc-G";
			if(x == 3)
				return "nuc-C";
			if(x == 4)
				return "nuc-T";
		},		
		//gets the 
		//sets the color for the nucletide
		color : function(x) {
			return colorTag(x);
		},
		//determines the color for the nucletide
		translate : function(x) {
			if(x == "A") 
				return 1;
			if(x == "G")
				return 2;
			if(x == "C")
				return 3;
			if(x == "T")
				return 4;
			return null;
		},
		buildRootAncester : function() {

		},
		//initialize tranking array
		track : [],
		//prepares the grid for tracking the sequence position in real time
		prepareTracking : function(seq) {
			this.track = [];
			for(var i=0;i<seq.length;i++) {
				var arr = [];
				var counter = 0;
				for(var j=0;j<$.phylo.seqLen;j++) {
					if(i < seq.length && j<seq[i].length) {
						if(seq[i].charAt(j) != "_") {
							arr.push(i*$.phylo.seqLen+counter);
							counter+=1;
						} else
							arr.push("x");
					} else
						arr.push("x");
				}
				this.track.push(arr);
			}
		},
		//converts to number
		intify : function(numstring) {
			if (numstring == 'x')
				return numstring;
			else
				return parseInt(0);
		},
		//randomize the location of the sequence
		randomize : function(seq) {
			var arr = [];
			var tmp;
			if(DEBUG) {
				console.log(">> in random 1");
				console.log(seq);
			}	
			//sequence = arr
			for(var i=0;i<seq.length;i++) {
				tmp = [];
				for(var j=0;j<$.phylo.seqLen;j++) {
					if(seq[i][j] == "_")
						tmp.push("x");
					else {
						if(seq[i][j].toString() == "") {
							tmp.push("x");
						} else {
							tmp.push(seq[i][j]);
						}
					}
				}		
				arr.push(tmp);
			}
			
			if(DEBUG) {
				console.log(">> in random 2");
				console.log(arr);
			}

			//randomize arr
			for(var i=0;i<arr.length;i++) {
				tmp = arr[i].toString().split('x,').join('').split(',');
				while( (a=tmp.length)<$.phylo.seqLen)
					tmp.splice(Math.floor(Math.random()*a),0,'x');
				tmp = tmp.map($.sequence.intify);
				arr[i] = tmp.slice(0);
			}	

			//sequence <- arr;
			var seq = [];
			for(var i=0;i<arr.length;i++) {
				tmp = "";
				for(var j =0;j<arr[i].length;j++) {
					if(arr[i][j] == "x")
						tmp+="_";
					else
						tmp+=arr[i][j];
				}
				seq.push(tmp);
			}		
			return seq;
		}
	}
})();
