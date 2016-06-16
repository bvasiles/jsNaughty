$(function(){
	
	var inhMap1_0 = new Array();
	var inhMap1_1 = new Array();
	var inhMap1_2 = new Array();
	var inhMap1_3 = new Array();
	var inhMap1_4 = new Array();
	
	inhMap1_0[0] = "<div id='blank'></div>";
	inhMap1_0[1] = "<div id='blank'></div>";
	inhMap1_0[2] = "<div id='AM' class='objectCell'>Application<br>Manager</div>";
	inhMap1_0[3] = "<div id='dirRight' class='inhCell'><img src='images/directory/right.png'/></div>";
	inhMap1_0[4] = "<div id='Pl' class='objectCell'>Player</div>";
	inhMap1_0[5] = "<div id='dirRight' class='inhCell'><img src='images/directory/right.png'/></div>";
	inhMap1_0[6] = "<div id='AGO' class='objectCell'>Aminated<br>Game<br>Object</div>";
	inhMap1_1[0] = "<div id='blank'></div>";
	inhMap1_1[1] = "<div id='dirRightUp' class='inhCell'><img src='images/directory/right_up.png'/></div>";
	inhMap1_1[2] = "<div id='blank'></div>";
	inhMap1_1[3] = "<div id='dirRightDown' class='inhCell'><img src='images/directory/right_down.png'/></div>";
	inhMap1_1[4] = "<div id='blank'></div>";
	inhMap1_1[5] = "<div id='blank'></div>";
	inhMap1_1[6] = "<div id='blank'></div>";
	inhMap1_2[0] = "<div id='GOM' class='objectCell'>Game<br>Object<br>Manager</div>";
	inhMap1_2[1] = "<div id='blank'></div>";
	inhMap1_2[2] = "<div id='blank'></div>";
	inhMap1_2[3] = "<div id='blank'></div>";
	inhMap1_2[4] = "<div id='Lev' class='objectCell'>Level</div>";
	inhMap1_2[5] = "<div id='dirRight' class='inhCell'><img src='images/directory/right.png'/></div>";
	inhMap1_2[6] = "<div id='LEP' class='objectCell'>Level<br>End<br>Post</div>";
	inhMap1_3[0] = "<div id='blank'></div>";
	inhMap1_3[1] = "<div id='dirRightDown' class='inhCell'><img src='images/directory/right_down.png'/></div>";
	inhMap1_3[2] = "<div id='blank'></div>";
	inhMap1_3[3] = "<div id='blank'></div>";
	inhMap1_3[4] = "<div id='blank'></div>";
	inhMap1_3[5] = "<div id='dirRightDown' class='inhCell'><img src='images/directory/right_down.png'/></div>";
	inhMap1_3[6] = "<div id='blank'></div>";
	inhMap1_4[0] = "<div id='blank'></div>";
	inhMap1_4[1] = "<div id='blank'></div>";
	inhMap1_4[2] = "<div id='RM' class='objectCell'>Resources<br>Manager</div>";
	inhMap1_4[3] = "<div id='blank'></div>";
	inhMap1_4[4] = "<div id='blank'></div>";
	inhMap1_4[5] = "<div id='blank'></div>";
	inhMap1_4[6] = "<div id='Pow' class='objectCell'>Powerup</div>";
	
	var inhMap2_0 = new Array();
	var inhMap2_1 = new Array();
	var inhMap2_2 = new Array();
	var inhMap2_3 = new Array();
	var inhMap2_4 = new Array();
	inhMap2_0[0] = "<div id='blank'></div>";
	inhMap2_0[1] = "<div id='blank'></div>";
	inhMap2_0[2] = "<div id='blank'></div>";
	inhMap2_0[3] = "<div id='blank'></div>";
	inhMap2_0[4] = "<div id='GO' class='objectCell'>Game<br>Object</div>";
	inhMap2_1[0] = "<div id='blank'></div>";
	inhMap2_1[1] = "<div id='blank'></div>";
	inhMap2_1[2] = "<div id='blank'></div>";
	inhMap2_1[3] = "<div id='dirRightUp' class='inhCell'><img src='images/directory/right_up.png'/></div>";
	inhMap2_1[4] = "<div id='blank'></div>";
	inhMap2_2[0] = "<div id='MM' class='objectCell'>MainMenu</div>";
	inhMap2_2[1] = "<div id='dirRight' class='inhCell'><img src='images/directory/right.png'/></div>";
	inhMap2_2[2] = "<div id='VGO' class='objectCell'>Visual<br>Game<br>Object</div>";
	inhMap2_2[3] = "<div id='blank'></div>";
	inhMap2_2[4] = "<div id='blank'></div>";
	inhMap2_3[0] = "<div id='blank'></div>";
	inhMap2_3[1] = "<div id='blank'></div>";
	inhMap2_3[2] = "<div id='blank'></div>";
	inhMap2_3[3] = "<div id='dirRightDwon' class='inhCell'><img src='images/directory/right_down.png'/></div>";
	inhMap2_3[4] = "<div id='blank'></div>";
	inhMap2_4[0] = "<div id='blank'></div>";
	inhMap2_4[1] = "<div id='blank'></div>";
	inhMap2_4[2] = "<div id='blank'></div>";
	inhMap2_4[3] = "<div id='blank'></div>";
	inhMap2_4[4] = "<div id='Rec' class='objectCell'>Rectangle</div>";
	
	var map = 0;

///////////////////////////////////////////////////////////////////////////////// inhMap1
	// GameObjectManager
	$("#GameObjectManager").click(function(){
		for(var i = 0 ; i < 5 ; i++){
			for(var j = 0 ; j < 5 ; j++){
				if(j == 0) $("#inhPool_" + j + "_" +i).html(inhMap1_0[i]);
				else if(j == 1) $("#inhPool_" + j + "_" +i).html(inhMap1_1[i]);
				else if(j == 2) $("#inhPool_" + j + "_" +i).html(inhMap1_2[i]);
				else if(j == 3) $("#inhPool_" + j + "_" +i).html(inhMap1_3[i]);
				else if(j == 4) $("#inhPool_" + j + "_" +i).html(inhMap1_4[i]);
			}
		}
		map = 1;
	});
	// ApplicationManager
	$("#ApplicationManager").click(function(){
		for(var i = 0 ; i < 5 ; i++){
			for(var j = 0 ; j < 5 ; j++){
				if(j == 0) $("#inhPool_" + j + "_" +i).html(inhMap1_0[i]);
				else if(j == 1) $("#inhPool_" + j + "_" +i).html(inhMap1_1[i]);
				else if(j == 2) $("#inhPool_" + j + "_" +i).html(inhMap1_2[i]);
				else if(j == 3) $("#inhPool_" + j + "_" +i).html(inhMap1_3[i]);
				else if(j == 4) $("#inhPool_" + j + "_" +i).html(inhMap1_4[i]);
			}
		}
		map = 1;
	});
	// ResourcesManager
	$("#ResourceManager").click(function(){
		for(var i = 0 ; i < 5 ; i++){
			for(var j = 0 ; j < 5 ; j++){
				if(j == 0) $("#inhPool_" + j + "_" +i).html(inhMap1_0[i]);
				else if(j == 1) $("#inhPool_" + j + "_" +i).html(inhMap1_1[i]);
				else if(j == 2) $("#inhPool_" + j + "_" +i).html(inhMap1_2[i]);
				else if(j == 3) $("#inhPool_" + j + "_" +i).html(inhMap1_3[i]);
				else if(j == 4) $("#inhPool_" + j + "_" +i).html(inhMap1_4[i]);
			}
		}
		map = 1;
	});
	// Player
	$("#Player").click(function(){
		for(var i = 0 ; i < 5 ; i++){
			for(var j = 0 ; j < 5 ; j++){
				if(j == 0) $("#inhPool_" + j + "_" +i).html(inhMap1_0[i+2]);
				else if(j == 1) $("#inhPool_" + j + "_" +i).html(inhMap1_1[i+2]);
				else if(j == 2) $("#inhPool_" + j + "_" +i).html(inhMap1_2[i+2]);
				else if(j == 3) $("#inhPool_" + j + "_" +i).html(inhMap1_3[i+2]);
				else if(j == 4) $("#inhPool_" + j + "_" +i).html(inhMap1_4[i+2]);
			}
		}
		map = 1;
	});
	// Level
	$("#Level").click(function(){
		for(var i = 0 ; i < 5 ; i++){
			for(var j = 0 ; j < 5 ; j++){
				if(j == 0) $("#inhPool_" + j + "_" +i).html(inhMap1_0[i+2]);
				else if(j == 1) $("#inhPool_" + j + "_" +i).html(inhMap1_1[i+2]);
				else if(j == 2) $("#inhPool_" + j + "_" +i).html(inhMap1_2[i+2]);
				else if(j == 3) $("#inhPool_" + j + "_" +i).html(inhMap1_3[i+2]);
				else if(j == 4) $("#inhPool_" + j + "_" +i).html(inhMap1_4[i+2]);
			}
		}
		map = 1;
	});
	// AnimatedGameObject
	$("#AnimatedGameObject").click(function(){
		for(var i = 0 ; i < 5 ; i++){
			for(var j = 0 ; j < 5 ; j++){
				if(j == 0) $("#inhPool_" + j + "_" +i).html(inhMap1_0[i+2]);
				else if(j == 1) $("#inhPool_" + j + "_" +i).html(inhMap1_1[i+2]);
				else if(j == 2) $("#inhPool_" + j + "_" +i).html(inhMap1_2[i+2]);
				else if(j == 3) $("#inhPool_" + j + "_" +i).html(inhMap1_3[i+2]);
				else if(j == 4) $("#inhPool_" + j + "_" +i).html(inhMap1_4[i+2]);
			}
		}
		map = 1;
	});
	// LevelEndPost
	$("#LevelEndPost").click(function(){
		for(var i = 0 ; i < 5 ; i++){
			for(var j = 0 ; j < 5 ; j++){
				if(j == 0) $("#inhPool_" + j + "_" +i).html(inhMap1_0[i+2]);
				else if(j == 1) $("#inhPool_" + j + "_" +i).html(inhMap1_1[i+2]);
				else if(j == 2) $("#inhPool_" + j + "_" +i).html(inhMap1_2[i+2]);
				else if(j == 3) $("#inhPool_" + j + "_" +i).html(inhMap1_3[i+2]);
				else if(j == 4) $("#inhPool_" + j + "_" +i).html(inhMap1_4[i+2]);
			}
		}
		map = 1;
	});
	// Powerup
	$("#Powerup").click(function(){
		for(var i = 0 ; i < 5 ; i++){
			for(var j = 0 ; j < 5 ; j++){
				if(j == 0) $("#inhPool_" + j + "_" +i).html(inhMap1_0[i+2]);
				else if(j == 1) $("#inhPool_" + j + "_" +i).html(inhMap1_1[i+2]);
				else if(j == 2) $("#inhPool_" + j + "_" +i).html(inhMap1_2[i+2]);
				else if(j == 3) $("#inhPool_" + j + "_" +i).html(inhMap1_3[i+2]);
				else if(j == 4) $("#inhPool_" + j + "_" +i).html(inhMap1_4[i+2]);
			}
		}
		map = 1;
	});
/////////////////////////////////////////////////////////////////////////////////// inhMap1	
/////////////////////////////////////////////////////////////////////////////////// inhMap2
	// MainMenu
	$("#MainMenu").click(function(){
		for(var i = 0 ; i < 5 ; i++){
			for(var j = 0 ; j < 5 ; j++){
				if(j == 0) $("#inhPool_" + j + "_" +i).html(inhMap2_0[i]);
				else if(j == 1) $("#inhPool_" + j + "_" +i).html(inhMap2_1[i]);
				else if(j == 2) $("#inhPool_" + j + "_" +i).html(inhMap2_2[i]);
				else if(j == 3) $("#inhPool_" + j + "_" +i).html(inhMap2_3[i]);
				else if(j == 4) $("#inhPool_" + j + "_" +i).html(inhMap2_4[i]);
			}
		}
		map = 2;
	});
	// VisualGameObject
	$("#VisualGameObject").click(function(){
		for(var i = 0 ; i < 5 ; i++){
			for(var j = 0 ; j < 5 ; j++){
				if(j == 0) $("#inhPool_" + j + "_" +i).html(inhMap2_0[i]);
				else if(j == 1) $("#inhPool_" + j + "_" +i).html(inhMap2_1[i]);
				else if(j == 2) $("#inhPool_" + j + "_" +i).html(inhMap2_2[i]);
				else if(j == 3) $("#inhPool_" + j + "_" +i).html(inhMap2_3[i]);
				else if(j == 4) $("#inhPool_" + j + "_" +i).html(inhMap2_4[i]);
			}
		}
		map = 2;
	});
	// GameObject
	$("#GameObject").click(function(){
		for(var i = 0 ; i < 5 ; i++){
			for(var j = 0 ; j < 5 ; j++){
				if(j == 0) $("#inhPool_" + j + "_" +i).html(inhMap2_0[i]);
				else if(j == 1) $("#inhPool_" + j + "_" +i).html(inhMap2_1[i]);
				else if(j == 2) $("#inhPool_" + j + "_" +i).html(inhMap2_2[i]);
				else if(j == 3) $("#inhPool_" + j + "_" +i).html(inhMap2_3[i]);
				else if(j == 4) $("#inhPool_" + j + "_" +i).html(inhMap2_4[i]);
			}
		}
		map = 2;
	});
	// Rectangle
	$("#Rectangle").click(function(){
		for(var i = 0 ; i < 5 ; i++){
			for(var j = 0 ; j < 5 ; j++){
				if(j == 0) $("#inhPool_" + j + "_" +i).html(inhMap2_0[i]);
				else if(j == 1) $("#inhPool_" + j + "_" +i).html(inhMap2_1[i]);
				else if(j == 2) $("#inhPool_" + j + "_" +i).html(inhMap2_2[i]);
				else if(j == 3) $("#inhPool_" + j + "_" +i).html(inhMap2_3[i]);
				else if(j == 4) $("#inhPool_" + j + "_" +i).html(inhMap2_4[i]);
			}
		}
		map = 2;
	});
/////////////////////////////////////////////////////////////////////////////////// inhMap2
	$("#left").click(function(){
		if(map == 2){
			alert("There's no more inheritance in this diagram");
			return;
		}
		var checkHTML = $("#inhPool_0_4 div").attr("id");
		if(checkHTML == "Pl" || checkHTML == "dirRight"){
			for(var i = 0 ; i < 5 ; i++){
				for(var j = 0 ; j < 5 ; j++){
					if(j == 0) $("#inhPool_" + j + "_" +i).html(inhMap1_0[i]);
					else if(j == 1) $("#inhPool_" + j + "_" +i).html(inhMap1_1[i]);
					else if(j == 2) $("#inhPool_" + j + "_" +i).html(inhMap1_2[i]);
					else if(j == 3) $("#inhPool_" + j + "_" +i).html(inhMap1_3[i]);
					else if(j == 4) $("#inhPool_" + j + "_" +i).html(inhMap1_4[i]);
				}
			}
			alert("Here's already the toppest class");
		}
		else{
			for(var i = 0 ; i < 5 ; i++){
				for(var j = 0 ; j < 5 ; j++){
					if(j == 0) $("#inhPool_" + j + "_" +i).html(inhMap1_0[i+1]);
					else if(j == 1) $("#inhPool_" + j + "_" +i).html(inhMap1_1[i+1]);
					else if(j == 2) $("#inhPool_" + j + "_" +i).html(inhMap1_2[i+1]);
					else if(j == 3) $("#inhPool_" + j + "_" +i).html(inhMap1_3[i+1]);
					else if(j == 4) $("#inhPool_" + j + "_" +i).html(inhMap1_4[i+1]);
				}
			}
		}
		
	});
	$("#right").click(function(){
		if(map == 2){
			alert("There's no more inheritance in this diagram");
			return;
		}
		var checkHTML = $("#inhPool_0_4 div").attr("id");
		if(checkHTML == "AGO" || checkHTML == "dirRight"){
			for(var i = 0 ; i < 5 ; i++){
				for(var j = 0 ; j < 5 ; j++){
					if(j == 0) $("#inhPool_" + j + "_" +i).html(inhMap1_0[i+2]);
					else if(j == 1) $("#inhPool_" + j + "_" +i).html(inhMap1_1[i+2]);
					else if(j == 2) $("#inhPool_" + j + "_" +i).html(inhMap1_2[i+2]);
					else if(j == 3) $("#inhPool_" + j + "_" +i).html(inhMap1_3[i+2]);
					else if(j == 4) $("#inhPool_" + j + "_" +i).html(inhMap1_4[i+2]);
				}
			}
			alert("Here's already the lowest class")
		}
		else{
			for(var i = 0 ; i < 5 ; i++){
				for(var j = 0 ; j < 5 ; j++){
					if(j == 0) $("#inhPool_" + j + "_" +i).html(inhMap1_0[i+1]);
					else if(j == 1) $("#inhPool_" + j + "_" +i).html(inhMap1_1[i+1]);
					else if(j == 2) $("#inhPool_" + j + "_" +i).html(inhMap1_2[i+1]);
					else if(j == 3) $("#inhPool_" + j + "_" +i).html(inhMap1_3[i+1]);
					else if(j == 4) $("#inhPool_" + j + "_" +i).html(inhMap1_4[i+1]);
				}
			}
		}
	});
});
