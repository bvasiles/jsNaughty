/*
* audiofile.cc JavaScript Library v0.1.19
* https://audiofile.cc/
* 
* Copyright 2011, Carlos Cardona 
* Released under the MIT License.
* http://www.opensource.org/licenses/mit-license.php
* 
* Date: Sun. June 26 2011 
*_______________________________________________________________________________
*    __                                     _                                   
*    / |                 /    ,           /  `    ,    /                        
*---/__|-------------__-/----------__---_/__----------/-----__--------__-----__-
*  /   |   /   /   /   /    /    /   )  /       /    /    /___)     /   '  /   '
*_/____|__(___(___(___/____/____(___/__/_______/____/____(___ __o__(___ __(___ _
* ASCII art by http://patorjk.com/software/taag/
*/
(function( $ ){
  var methods = {
    init : function( options ) {  
      // Options go here in the form of an object literal.
      var settings = {
      'tonic'         : '3',
      'bpmeasure'     : '4',
      'count'         : '4',
      'creator'       : 'Unknown',
      'title'         : 'Unknown'
      };
      return this.each(function() { 
        if ( options ) { 
        $.extend( settings, options );
        }
        //console.log(settings.tonic);
        // code goes here to maintain chainability.
        var canvasWidth = this.getAttribute("width");
        drawClefs();
        //drawTrebleClef();
        //drawBassClef();
        clefTip();
        setTheKey(settings.tonic);
        setTheTimeSignature(settings.bpmeasure, settings.count, settings.title, settings.creator);
        drawNotes(settings.tonic, settings.bpmeasure, settings.count);
      });
    },
    stepUp : function(placeholder, note, distance) {
      return stepHelper(this, note, (+distance));
    },
    stepDown : function(placeholder, note, distance) {
      return stepHelper(this, note, -parseInt(distance,10));
    },
    stepUpWhole : function(placeholder, note) {
      return stepHelper(this, note, 2);
    },
    stepDownWhole : function(placeholder, note) {
      return stepHelper(this, note, -2);
    },
    stepUpHalf : function(placeholder, note) {
      return stepHelper(this, note, 1);
    },
    stepDownHalf : function(placeholder, note) {
      return stepHelper(this, note, -1);
    },
    stepUpMaj : function(placeholder, note, distance) {
      var steps = [0,2,4,5,7,9,11];
      return stepHelper(this, note, steps[distance]);
    },
    stepDownMaj : function(placeholder, note, distance) {
      var steps = [0,-2,-4,-5,-7,-9,-11];
      return stepHelper(this, note, steps[distance]);
    },
    stepUpMin : function(placeholder, note, distance) {
      var steps = [0,2,3,5,7,8,10];
      return stepHelper(this, note, steps[distance]);
    },
    stepDownMin : function(placeholder, note, distance) {
      var steps = [0,-2,-3,-5,-7,-8,-10];
      return stepHelper(this, note, steps[distance]);
    }
  };
  $.fn.audiofile = function(options, method) {
    if ( methods[method] ) {
    return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'object' || ! method ) {
    return methods.init.apply( this, arguments );
    } else {
    $.error( 'Method ' +  method + ' does not exist on jQuery.audiofile' );
    }   
    return true;
  };
})( jQuery );

// Start of "CONSTANTS"
var POSITION_OF_F5_STAFF_LINE = 140,
    POSITION_OF_E4_STAFF_LINE = (+POSITION_OF_F5_STAFF_LINE) + 80,
    POSITION_OF_A3_STAFF_LINE = (+POSITION_OF_F5_STAFF_LINE) + 120,
    POSITION_OF_G2_STAFF_LINE = (+POSITION_OF_F5_STAFF_LINE) + 200,
    INTERMEDIATE_LINE_DISTANCE = 20,
    X_AXIS_START_OF_STAFF_LINES = 30;
// End of "CONSTANTS"

function getContext() {
  var canvas = document.getElementById("example");
  var ctx = canvas.getContext("2d");
  return ctx;
}

function stepHelper(that, note, step) {
  return that.each(function() {
    var beforePitch = (+$(note).attr('data-pitch'));
    $(note).attr('data-pitch', beforePitch + step);
  });
}

function drawStaffLines(width, xaxis, loop) {
  var ctx = getContext();
    for (var y = POSITION_OF_F5_STAFF_LINE; y <= POSITION_OF_E4_STAFF_LINE; y += INTERMEDIATE_LINE_DISTANCE) {
      ctx.moveTo(X_AXIS_START_OF_STAFF_LINES, y);
      ctx.lineTo(width, y);
    }
    for (var y = POSITION_OF_A3_STAFF_LINE; y <= POSITION_OF_G2_STAFF_LINE; y += INTERMEDIATE_LINE_DISTANCE) {
      ctx.moveTo(X_AXIS_START_OF_STAFF_LINES, y);
      ctx.lineTo(width, y);
    }
    var moveOnDown = loop * 300;
  // draw staff lines
  for (var g = 0; g < loop; g += 1) {
    for (var y = POSITION_OF_F5_STAFF_LINE + moveOnDown; y <= POSITION_OF_E4_STAFF_LINE + moveOnDown; y += INTERMEDIATE_LINE_DISTANCE) {
      ctx.moveTo(X_AXIS_START_OF_STAFF_LINES, y);
      ctx.lineTo(width, y);
    }
    for (var y = POSITION_OF_A3_STAFF_LINE + moveOnDown; y <= POSITION_OF_G2_STAFF_LINE + moveOnDown; y += INTERMEDIATE_LINE_DISTANCE) {
      ctx.moveTo(X_AXIS_START_OF_STAFF_LINES, y);
      ctx.lineTo(width, y);
    }
  }
  styleNStroke();
}

function drawClefs() {
// I am mixing the code for the bass and treble clefs because when the circles
// for the function that was called second were drawn they were overwritting the
// .lineTo()s of the previous function. TODO: Figure out why that is happening
// and separate this out into two functions called bassClef() and trebleClef()
// 3 circles for bass clef

  var tempClef = {};
  var ctx = getContext();
  tempClef.x = (+X_AXIS_START_OF_STAFF_LINES);
  tempClef.y = (+POSITION_OF_F5_STAFF_LINE);

  tempClef.centerXAxis = tempClef.x + 10;
  tempClef.centerYAxis = tempClef.y + 140;
  tempClef.radius = 5;
  ctx.beginPath();
  ctx.arc(tempClef.centerXAxis, tempClef.centerYAxis, tempClef.radius, 0, Math.PI*2, true); 
  ctx.closePath();
  ctx.fill();

  tempClef.centerXAxis = tempClef.x + 50;
  tempClef.centerYAxis = tempClef.y + 133;
  tempClef.radius = 3;
  ctx.beginPath();
  ctx.arc(tempClef.centerXAxis, tempClef.centerYAxis, tempClef.radius, 0, Math.PI*2, true); 
  ctx.closePath();
  ctx.fill();

  tempClef.centerXAxis = tempClef.x + 50;
  tempClef.centerYAxis = tempClef.y + 147;
  tempClef.radius = 3;
  ctx.beginPath();
  ctx.arc(tempClef.centerXAxis, tempClef.centerYAxis, tempClef.radius, 0, Math.PI*2, true); 
  ctx.closePath();
  ctx.fill();

  // circle for treble clef
  var ctx = getContext();
  tempClef.centerXAxis = tempClef.x + 20;
  tempClef.centerYAxis = tempClef.y + 100;
  tempClef.radius = 3;
  ctx.beginPath();
  ctx.arc(tempClef.centerXAxis, tempClef.centerYAxis, tempClef.radius, 0, Math.PI*2, true); 
  ctx.closePath();
  ctx.fill();
  
  // 2 curves for bass clef
  tempClef.tempXAxis = tempClef.x + 10;
  tempClef.tempYAxis = tempClef.y + 140;
  ctx.moveTo(tempClef.tempXAxis, tempClef.tempYAxis);
  tempClef.controlX = tempClef.x + 15;
  tempClef.controlY = tempClef.y + 120;
  tempClef.endX = tempClef.x + 25;
  tempClef.endY = tempClef.y + 120;
  ctx.quadraticCurveTo(tempClef.controlX, tempClef.controlY, tempClef.endX, tempClef.endY);

  tempClef.tempXAxis = tempClef.x + 40;
  tempClef.tempYAxis = tempClef.y + 140;
  ctx.moveTo(tempClef.tempXAxis, tempClef.tempYAxis);
  tempClef.controlX = tempClef.x + 35;
  tempClef.controlY = tempClef.y + 120;
  tempClef.endX = tempClef.x + 25;
  tempClef.endY = tempClef.y + 120;
  ctx.quadraticCurveTo(tempClef.controlX, tempClef.controlY, tempClef.endX, tempClef.endY);

  tempClef.tempXAxis = tempClef.x + 10;
  tempClef.tempYAxis = tempClef.y + 180;
  ctx.moveTo(tempClef.tempXAxis, tempClef.tempYAxis);
  tempClef.controlX = tempClef.x + 45;
  tempClef.controlY = tempClef.y + 160;
  tempClef.endX = tempClef.x + 40;
  tempClef.endY = tempClef.y + 140;
  ctx.quadraticCurveTo(tempClef.controlX, tempClef.controlY, tempClef.endX, tempClef.endY);

  // 11 curves for bass clef
  tempClef.tempXAxis = tempClef.x + 30;
  tempClef.tempYAxis = tempClef.y + 70;
  ctx.moveTo(tempClef.tempXAxis, tempClef.tempYAxis);
  tempClef.controlX = tempClef.x + 20;
  tempClef.controlY = tempClef.y + 70;
  tempClef.endX = tempClef.x + 20;
  tempClef.endY = tempClef.y + 60;
  ctx.quadraticCurveTo(tempClef.controlX, tempClef.controlY, tempClef.endX, tempClef.endY);

  tempClef.tempXAxis = tempClef.x + 20;
  tempClef.tempYAxis = tempClef.y + 60;
  ctx.moveTo(tempClef.tempXAxis, tempClef.tempYAxis);
  tempClef.controlX = tempClef.x + 20;
  tempClef.controlY = tempClef.y + 40;
  tempClef.endX = tempClef.x + 30;
  tempClef.endY = tempClef.y + 40;
  ctx.quadraticCurveTo(tempClef.controlX, tempClef.controlY, tempClef.endX, tempClef.endY);

  tempClef.tempXAxis = tempClef.x + 40;
  tempClef.tempYAxis = tempClef.y + 60;
  ctx.moveTo(tempClef.tempXAxis, tempClef.tempYAxis);
  tempClef.controlX = tempClef.x + 40;
  tempClef.controlY = tempClef.y + 40;
  tempClef.endX = tempClef.x + 30;
  tempClef.endY = tempClef.y + 40;
  ctx.quadraticCurveTo(tempClef.controlX, tempClef.controlY, tempClef.endX, tempClef.endY);

  tempClef.tempXAxis = tempClef.x + 30;
  tempClef.tempYAxis = tempClef.y + 80;
  ctx.moveTo(tempClef.tempXAxis, tempClef.tempYAxis);
  tempClef.controlX = tempClef.x + 40;
  tempClef.controlY = tempClef.y + 80;
  tempClef.endX = tempClef.x + 40;
  tempClef.endY = tempClef.y + 60;
  ctx.quadraticCurveTo(tempClef.controlX, tempClef.controlY, tempClef.endX, tempClef.endY);

  tempClef.tempXAxis = tempClef.x + 30;
  tempClef.tempYAxis = tempClef.y + 80;
  ctx.moveTo(tempClef.tempXAxis, tempClef.tempYAxis);
  tempClef.controlX = tempClef.x + 10;
  tempClef.controlY = tempClef.y + 80;
  tempClef.endX = tempClef.x + 10;
  tempClef.endY = tempClef.y + 60;
  ctx.quadraticCurveTo(tempClef.controlX, tempClef.controlY, tempClef.endX, tempClef.endY);

  tempClef.tempXAxis = tempClef.x + 10;
  tempClef.tempYAxis = tempClef.y + 60;
  ctx.moveTo(tempClef.tempXAxis, tempClef.tempYAxis);
  tempClef.controlX = tempClef.x + 13;
  tempClef.controlY = tempClef.y + 45;
  tempClef.endX = tempClef.x + 20;
  tempClef.endY = tempClef.y + 40;
  ctx.quadraticCurveTo(tempClef.controlX, tempClef.controlY, tempClef.endX, tempClef.endY);

  tempClef.tempXAxis = tempClef.x + 20;
  tempClef.tempYAxis = tempClef.y + 40;
  ctx.moveTo(tempClef.tempXAxis, tempClef.tempYAxis);
  tempClef.controlX = tempClef.x + 35;
  tempClef.controlY = tempClef.y + 20;
  tempClef.endX = tempClef.x + 35;
  tempClef.endY = tempClef.y + 20;
  ctx.quadraticCurveTo(tempClef.controlX, tempClef.controlY, tempClef.endX, tempClef.endY);

  tempClef.tempXAxis = tempClef.x + 35;
  tempClef.tempYAxis = tempClef.y + 20;
  ctx.moveTo(tempClef.tempXAxis, tempClef.tempYAxis);
  tempClef.controlX = tempClef.x + 40;
  tempClef.controlY = tempClef.y;
  tempClef.endX = tempClef.x + 35;
  tempClef.endY = tempClef.y;
  ctx.quadraticCurveTo(tempClef.controlX, tempClef.controlY, tempClef.endX, tempClef.endY);

  tempClef.tempXAxis = tempClef.x + 38;
  tempClef.tempYAxis = tempClef.y;
  ctx.moveTo(tempClef.tempXAxis, tempClef.tempYAxis);
  tempClef.controlX = tempClef.x + 35;
  tempClef.controlY = tempClef.y - 15;
  tempClef.endX = tempClef.x + 30;
  tempClef.endY = tempClef.y - 20;
  ctx.quadraticCurveTo(tempClef.controlX, tempClef.controlY, tempClef.endX, tempClef.endY);

  tempClef.tempXAxis = tempClef.x + 18;
  tempClef.tempYAxis = tempClef.y;
  ctx.moveTo(tempClef.tempXAxis, tempClef.tempYAxis);
  tempClef.controlX = tempClef.x + 23;
  tempClef.controlY = tempClef.y - 15;
  tempClef.endX = tempClef.x + 30;
  tempClef.endY = tempClef.y - 20;
  ctx.quadraticCurveTo(tempClef.controlX, tempClef.controlY, tempClef.endX, tempClef.endY);

  tempClef.tempXAxis = tempClef.x + 18;
  tempClef.tempYAxis = tempClef.y;
  ctx.moveTo(tempClef.tempXAxis, tempClef.tempYAxis);
  tempClef.controlX = tempClef.x + 40;
  tempClef.controlY = tempClef.y + 100;
  tempClef.endX = tempClef.x + 40;
  tempClef.endY = tempClef.y + 100;
  ctx.quadraticCurveTo(tempClef.controlX, tempClef.controlY, tempClef.endX, tempClef.endY);

  tempClef.tempXAxis = tempClef.x + 40;
  tempClef.tempYAxis = tempClef.y + 100;
  ctx.moveTo(tempClef.tempXAxis, tempClef.tempYAxis);
  tempClef.controlX = tempClef.x + 35;
  tempClef.controlY = tempClef.y + 110;
  tempClef.endX = tempClef.x + 30;
  tempClef.endY = tempClef.y + 110;
  ctx.quadraticCurveTo(tempClef.controlX, tempClef.controlY, tempClef.endX, tempClef.endY);

  tempClef.tempXAxis = tempClef.x + 20;
  tempClef.tempYAxis = tempClef.y + 100;
  ctx.moveTo(tempClef.tempXAxis, tempClef.tempYAxis);
  tempClef.controlX = tempClef.x + 25;
  tempClef.controlY = tempClef.y + 110;
  tempClef.endX = tempClef.x + 30;
  tempClef.endY = tempClef.y + 110;
  ctx.quadraticCurveTo(tempClef.controlX, tempClef.controlY, tempClef.endX, tempClef.endY);

}

function drawTrebleClef() {
  var ctx = getContext();
  ctx.font = "8.5em Helvetica-Light";
  var tempXAxis = (+X_AXIS_START_OF_STAFF_LINES) + 10;
  var tempYAxis = (+POSITION_OF_F5_STAFF_LINE) + 90;
  ctx.fillText("𝄞" , tempXAxis, tempYAxis);
}

function drawBassClef() {
  var ctx = getContext();
  ctx.font = "5.5em Helvetica-Light";
  var tempXAxis = (+X_AXIS_START_OF_STAFF_LINES) + 10;
  var tempYAxis = (+POSITION_OF_F5_STAFF_LINE) + 180;
  ctx.fillText("𝄢" , tempXAxis, tempYAxis);
}

function clefTip() {
  var ctx = getContext();
  var tempClefTip = {};
  tempClefTip.x = (+X_AXIS_START_OF_STAFF_LINES);
  tempClefTip.y = (+POSITION_OF_F5_STAFF_LINE);

  tempClefTip.tempXAxis = tempClefTip.x - 30;
  tempClefTip.tempYAxis = tempClefTip.y + 100;
  ctx.moveTo(tempClefTip.tempXAxis, tempClefTip.tempYAxis);
  tempClefTip.controlX = tempClefTip.x - 5;
  tempClefTip.controlY = tempClefTip.y + 60;
  tempClefTip.endX = tempClefTip.x - 20;
  tempClefTip.endY = tempClefTip.y + 30;
  ctx.quadraticCurveTo(tempClefTip.controlX, tempClefTip.controlY, tempClefTip.endX, tempClefTip.endY);

  tempClefTip.tempXAxis = tempClefTip.x - 20;
  tempClefTip.tempYAxis = tempClefTip.y + 30;
  ctx.moveTo(tempClefTip.tempXAxis, tempClefTip.tempYAxis);
  tempClefTip.controlX = tempClefTip.x - 35;
  tempClefTip.controlY = tempClefTip.y;
  tempClefTip.endX = tempClefTip.x;
  tempClefTip.endY = tempClefTip.y;
  ctx.quadraticCurveTo(tempClefTip.controlX, tempClefTip.controlY, tempClefTip.endX, tempClefTip.endY);

  tempClefTip.tempXAxis = tempClefTip.x - 30;
  tempClefTip.tempYAxis = tempClefTip.y + 100;
  ctx.moveTo(tempClefTip.tempXAxis, tempClefTip.tempYAxis);
  tempClefTip.controlX = tempClefTip.x - 5;
  tempClefTip.controlY = tempClefTip.y + 130;
  tempClefTip.endX = tempClefTip.x - 20;
  tempClefTip.endY = tempClefTip.y + 170;
  ctx.quadraticCurveTo(tempClefTip.controlX, tempClefTip.controlY, tempClefTip.endX, tempClefTip.endY);

  tempClefTip.tempXAxis = tempClefTip.x - 20;
  tempClefTip.tempYAxis = tempClefTip.y + 170;
  ctx.moveTo(tempClefTip.tempXAxis, tempClefTip.tempYAxis);
  tempClefTip.controlX = tempClefTip.x - 35;
  tempClefTip.controlY = tempClefTip.y + 200;
  tempClefTip.endX = tempClefTip.x;
  tempClefTip.endY = tempClefTip.y + 200;
  ctx.quadraticCurveTo(tempClefTip.controlX, tempClefTip.controlY, tempClefTip.endX, tempClefTip.endY);

  tempClefTip.tempXAxis = tempClefTip.x;
  tempClefTip.tempYAxis = tempClefTip.y;
  ctx.moveTo(tempClefTip.tempXAxis, tempClefTip.tempYAxis);
  tempClefTip.tempXAxis = tempClefTip.x;
  tempClefTip.tempYAxis = tempClefTip.y + 200;
  ctx.lineTo(tempClefTip.tempXAxis, tempClefTip.tempYAxis);
}

// First level is tonic, second level is octave.
var scales = {
  "0": {
    "2":        [  380,  380,  370,  370,  360,  350,  350,  340,  340,  330,  330,  320],
    "3":        [  310,  310,  300,  300,  290,  280,  280,  270,  270,  260,  260,  250],
    "4":        [  240,  240,  230,  230,  220,  210,  210,  200,  200,  190,  190,  180],
    "5":        [  170,  170,  160,  160,  150,  140,  140,  130,  130,  120,  120,  110],
    "sharps":   [false, true,false, true,false,false, true,false, true,false, true,false],
    "flats":    [false,false,false,false,false,false,false,false,false,false,false,false],
    "naturals": [false,false,false,false,false,false,false,false,false,false,false,false]
  },
  "1": {
    "2":        [  340,  340,  330,  330,  320,  310,  310,  300,  300,  290,  280,  280],
    "3":        [  270,  270,  260,  260,  250,  240,  240,  230,  230,  220,  210,  210],
    "4":        [  200,  200,  190,  190,  180,  170,  170,  160,  160,  150,  140,  140],
    "5":        [  130,  130,  120,  120,  110,  100,  100,   90,   90,   80,   70,  70],
    "sharps":   [false, true,false, true,false,false, true,false, true,false,false,false],
    "flats":    [false,false,false,false,false,false,false,false,false,false,false,false],
    "naturals": [false,false,false,false,false,false,false,false,false,false, true,false]
  },
  "2": {
    "2":        [  370,  370,  360,  350,  350,  340,  340,  330,  330,  320,  310,  310],
    "3":        [  300,  300,  290,  280,  280,  270,  270,  260,  260,  250,  240,  240],
    "4":        [  230,  230,  220,  210,  210,  200,  200,  190,  190,  180,  170,  170],
    "5":        [  160,  160,  150,  140,  140,  130,  130,  120,  120,  110,  100,  100],
    "sharps":   [false, true,false,false,false,false, true,false, true,false,false,false],
    "flats":    [false,false,false,false,false,false,false,false,false,false,false,false],
    "naturals": [false,false,false, true,false,false,false,false,false,false, true,false]
  },
  "3": {
    "2":        [  330,  330,  320,  310,  310,  300,  300,  290,  280,  280,  270,  270],
    "3":        [  260,  260,  250,  240,  240,  230,  230,  220,  210,  210,  200,  200],
    "4":        [  190,  190,  180,  170,  170,  160,  160,  150,  140,  140,  130,  130],
    "5":        [  120,  120,  110,  100,  100,   90,   90,   80,   70,   70,   60,   60],
    "sharps":   [false, true,false,false,false,false, true,false,false,false,false,false],
    "flats":    [false,false,false,false,false,false,false,false,false,false,false,false],
    "naturals": [false,false,false, true,false,false,false,false, true,false, true,false]
  },
  "4": {
    "2":        [  360,  350,  350,  340,  340,  330,  330,  320,  310,  310,  300,  300],
    "3":        [  290,  280,  280,  270,  270,  260,  260,  250,  240,  240,  230,  230],
    "4":        [  220,  210,  210,  200,  200,  190,  190,  180,  170,  170,  160,  160],
    "5":        [  150,  140,  140,  130,  130,  120,  120,  110,  100,  100,   90,   90],
    "sharps":   [false,false,false,false,false,false, true,false,false,false,false,false],
    "flats":    [false,false,false,false,false,false,false,false,false,false,false,false],
    "naturals": [false,true,false,true,false,false,false,false,true,false,true,false]
  },
  "5": {
    "2":        [  320,  310,  310,  300,  300,  290,  280,  280,  270,  270,  260,  260],
    "3":        [  250,  240,  240,  230,  230,  220,  210,  210,  200,  200,  190,  190],
    "4":        [  180,  170,  170,  160,  160,  150,  140,  140,  130,  130,  120,  120],
    "5":        [  110,  100,  100,   90,   90,   80,   70,   70,   60,   60,   50,   50],
    "sharps":   [false,false,false,false,false,false,false,false,false,false,false,false],
    "flats":    [false,false,false,false,false,false,false,false,false,false,false,false],
    "naturals": [false, true,false, true,false,false, true,false, true,false, true,false]
  },
  "6": {
    "2":        [  350,  340,  340,  330,  330,  320,  310,  310,  300,  300,  290,  280],
    "3":        [  280,  270,  270,  260,  260,  250,  240,  240,  230,  230,  220,  210],
    "4":        [  210,  200,  200,  190,  190,  180,  170,  170,  160,  160,  150,  140],
    "5":        [  140,  130,  130,  120,  120,  110,  100,  100,   90,   90,   80,   70],
    "sharps":   [false,false,false,false,false,false,false,false,false,false,false,false],
    "flats":    [false,false,false,false,false,false,false,false,false,false,false,false],
    "naturals": [false, true,false, true,false,false, true,false, true,false,false, true]
  },
  "7": {
    "2":        [  380,  370,  370,  360,  350,  350,  340,  340,  330,  330,  320,  310],
    "3":        [  310,  300,  300,  290,  280,  280,  270,  270,  260,  260,  250,  240],
    "4":        [  240,  230,  230,  220,  210,  210,  200,  200,  190,  190,  180,  170],
    "5":        [  170,  160,  160,  150,  140,  140,  130,  130,  120,  120,  110,  100],
    "sharps":   [false,false,false,false,false,false,false,false,false,false,false,false],
    "flats":    [false,false,false,false,false,false,false,false,false,false,false,false],
    "naturals": [false, true,false,false, true,false, true,false, true,false,false, true]
  },
  "-7": {
    "2":        [  380,  380,  370,  370,  360,  360,  350,  340,  340,  330,  330,  320],
    "3":        [  310,  310,  300,  300,  290,  290,  280,  270,  270,  260,  260,  250],
    "4":        [  240,  240,  230,  230,  220,  220,  210,  200,  200,  190,  190,  180],
    "5":        [  170,  170,  160,  160,  150,  150,  140,  130,  130,  120,  120,  110],
    "sharps":   [false,false,false,false,false,false,false,false,false,false,false,false],
    "flats":    [false,false,false,false,false,false,false,false,false,false,false,false],
    "naturals": [false, true,false, true,false, true,false,false, true,false, true,false]
  },
  "-6": {
    "2":        [  340,  340,  330,  330,  320,  320,  310,  300,  300,  290,  290,  280],
    "3":        [  270,  270,  260,  260,  250,  250,  240,  230,  230,  220,  220,  210],
    "4":        [  200,  200,  190,  190,  180,  180,  170,  160,  160,  150,  150,  140],
    "5":        [  130,  130,  120,  120,  110,  110,  100,   90,   90,   80,   80,   70],
    "sharps":   [false,false,false,false,false,false,false,false,false,false,false,false],
    "flats":    [false,false,false,false,false,false,false,false,false,false,false,false],
    "naturals": [false, true,false, true,false, true,false,false, true,false, true,false]
  },
  "-5": {
    "2":        [  370,  370,  360,  360,  350,  340,  340,  330,  330,  320,  320,  310],
    "3":        [  300,  300,  290,  290,  280,  270,  270,  260,  260,  250,  250,  240],
    "4":        [  230,  230,  220,  220,  210,  200,  200,  190,  190,  180,  180,  170],
    "5":        [  160,  160,  150,  150,  140,  130,  130,  120,  120,  110,  110,  100],
    "sharps":   [false,false,false,false,false,false,false,false,false,false,false,false],
    "flats":    [false,false,false,false,false,false,false,false,false,false,false,false],
    "naturals": [false, true,false, true,false,false, true,false, true,false, true,false]
  },
  "-4": {
    "2":        [  330,  330,  320,  320,  310,  300,  300,  290,  290,  280,  270,  270],
    "3":        [  260,  260,  250,  250,  240,  230,  230,  220,  220,  210,  200,  200],
    "4":        [  190,  190,  180,  180,  170,  160,  160,  150,  150,  140,  130,  130],
    "5":        [  120,  120,  110,  110,  100,   90,   90,   80,   80,   70,   60,   60],
    "sharps":   [false,false,false,false,false,false,false,false,false,false, false,false],
    "flats":    [false,false,false,false,false,false,false,false,false,false, true,false],
    "naturals": [false, true,false, true,false,false, true,false, true,false, false,false]
  },
  "-3": {
    "2":        [  360,  360,  350,  340,  340,  330,  330,  320,  320,  310,  300,  300],
    "3":        [  290,  290,  280,  270,  270,  260,  260,  250,  250,  240,  230,  230],
    "4":        [  220,  220,  210,  200,  200,  190,  190,  180,  180,  170,  160,  160],
    "5":        [  150,  150,  140,  130,  130,  120,  120,  110,  110,  100,   90,   90],
    "sharps":   [false,false,false, false,false,false,false,false,false,false,false,false],
    "flats":    [false,false,false, true,false,false,false,false,false,false, true,false],
    "naturals": [false, true,false, false,false,false, true,false, true,false, false,false]
  },
  "-2": {
    "2":        [  390,  390,  380,  370,  370,  360,  360,  350,  340,  340,  330,  330],
    "3":        [  320,  320,  310,  300,  300,  290,  290,  280,  270,  270,  260,  260],
    "4":        [  250,  250,  240,  230,  230,  220,  220,  210,  200,  200,  190,  190],
    "5":        [  180,  180,  170,  160,  160,  150,  150,  140,  130,  130,  120,  120],
    "sharps":   [false,false,false, false,false,false,false,false, ,false, false,false],
    "flats":    [false,false,false, true,false,false,false,false,true ,false,true ,false],
    "naturals": [false,true,false,false,false,false,true,false,false,false,false,false]
  },
  "-1": {
    "2":        [  350,  340,  340,  330,  330,  320,  320,  310,  300,  300,  290,  290],
    "3":        [  280,  270,  270,  260,  260,  250,  250,  240,  230,  230,  220,  220],
    "4":        [  210,  200,  200,  190,  190,  180,  180,  170,  160,  160,  150,  150],
    "5":        [  140,  130,  130,  120,  120,  110,  110,  100,   90,   90,   80,   80],
    "sharps":   [false, false,false, false,false,false,false,false, false,false, false,false],
    "flats":    [false, true,false, true,false,true,false,false, true,false, true,false],
    "naturals": [false, false,false, false,false,false, true,false, false,false, false,false]
  }
};


function drawNotes(tonic, bpmeasure, count, songtitle, creator) {
  var ctx = getContext();
  var xaxis = (+X_AXIS_START_OF_STAFF_LINES) + 200;
  $("div[data-measure]").each(function(index) {
    // console.log("measure: " + index);

    $(this).find("div[data-note]").each(function(index) {
    // take all the draw note code that comes before the if/elses that call the
    // note drawing functions and create a new function that I call right here
    // that gets the note's yaxis from it's pitch and octave and returns that
    // value to be assigned to the note object.
    //
      var tempNote = {
        'noteLength': $(this).attr("data-note"), 
        'pitch'     : $(this).attr("data-pitch"),
        'octave'    : $(this).attr("data-octave")
      };

    // Also need to create the note drawing methods on the object that will be
    // called right here I think.  ex: tempNote.drawQuarterNote();
      var lstnt = $(this).attr("data-lastnote");
      // console.log(tempNote);
      var canvasWidth = $("canvas").attr("width");
      var scale = scales[tonic];
      var ctx = getContext();
      var noteDrawingFunc =
      tempNote.noteLength == "wholerest"        ? drawWholeRest           :
      tempNote.noteLength == "halfrest"         ? drawHalfRest            :
      tempNote.noteLength == "quarterrest"      ? drawQuarterRest         :
      tempNote.noteLength == "eighthrest"       ? drawEighthRest          :
      tempNote.noteLength == "sixteenthrest"    ? drawSixteenthRest       :
      tempNote.noteLength == "thirtysecondrest" ? drawThirtySecondRest    :
      tempNote.noteLength == "whole"            ? drawWholeNote           :
      tempNote.noteLength == "half"             ? drawHalfNote            :
      tempNote.noteLength == "quarter"          ? drawQuarterNote         :
      tempNote.noteLength == "eighth"           ? drawEighthNote          :
      tempNote.noteLength == "sixteenth"        ? drawSixteenthNote       : drawThirtySecondNote;
      // If the xaxis is wider than the canvas width it means it's time to wrap the notes
      if (xaxis > canvasWidth) {
        xaxis = (xaxis - canvasWidth) + 5;
        // Loop through each note in all 4 octaves and add 300 pixels to the y axis
        for (var h = 2; h < 5; h += 1) {
          for (var i = 0; i < 12; i += 1) {
            // I couldn't resist myself. How often do you get to use [h][i] in a project?
            scale[h][i]  = scale[h][i]  + 300;
          }
        }
      }
      var theHeight = scale[tempNote.octave][tempNote.pitch] / 300;
      loop = Math.round(theHeight);
      noteDrawingFunc(xaxis, scale[tempNote.octave][tempNote.pitch]);
      drawStaffLines(canvasWidth, xaxis, loop);
      var accidentalsDrawingFunc =
      /* "Accidentals" is the generic term for the sharp/flat/natural sign */
      scale.sharps[tempNote.pitch]   ? sharpNote   :
      scale.naturals[tempNote.pitch] ? naturalNote :
      scale.flats[tempNote.pitch]    ? flatNote    : function(){/* Do nothing */};

      if (tempNote.noteLength == "wholerest" || tempNote.noteLength == "halfrest" || tempNote.noteLength == "quarterrest" || tempNote.noteLength == "eighthrest" || tempNote.noteLength == "sixteenthrest" || tempNote.noteLength == "thirtysecondrest") {
        // Don't paint an accidental
      } else {
        accidentalsDrawingFunc(xaxis, scale[tempNote.octave][tempNote.pitch]);
      }
      // console.log("pitch: " + pitch);
      // console.log("length: " + noteLength); 
      // console.log("octave: " + octave); 
      styleNStroke();
      // This if/else statement figures out if this is the last note of a chord
      // or note. There must be a more elegant way to do this
      if ($(this).parent("div[data-chord]").length && !lstnt) {
      } else if ($(this).parent("div[data-chord]").length && lstnt == "true") {
        xaxis += 50;
      } else {
        xaxis += 50;
      }
    });
    var measureLine = (+xaxis) - 25;
    var moveOnTheY = (loop - 1) * 300;
    ctx.moveTo(measureLine, (+POSITION_OF_F5_STAFF_LINE) + moveOnTheY);
    var tempYAxis = ((+POSITION_OF_F5_STAFF_LINE) + 80) + moveOnTheY;
    ctx.lineTo(measureLine, tempYAxis);
    var tempYAxis = ((+POSITION_OF_F5_STAFF_LINE) + 120) + moveOnTheY;
    ctx.moveTo(measureLine, tempYAxis);
    ctx.lineTo(measureLine, (+POSITION_OF_G2_STAFF_LINE) + moveOnTheY);
    styleNStroke();
  });
}

  // Not using this. I just liked the selector and didn't want to toss it just yet :P
  // var firstNote = $("div[data-measure^='0'] div:nth-child(1)").attr("data-pitch");

function drawWholeRest(xaxis, position) {
  var ctx = getContext();
  ctx.fillRect(xaxis - 8,POSITION_OF_F5_STAFF_LINE + 40,15,5);
  ctx.fillRect(xaxis - 8,POSITION_OF_F5_STAFF_LINE + 160,15,5);
}

function drawHalfRest(xaxis, position) {
  var ctx = getContext();
  ctx.fillRect(xaxis - 8,POSITION_OF_F5_STAFF_LINE + 35,15,5);
  ctx.fillRect(xaxis - 8,POSITION_OF_F5_STAFF_LINE + 155,15,5);
}

function drawQuarterRest(xaxis, position) {
  var ctx = getContext();
  var tempQuart = {};
  ctx.moveTo(xaxis -2, position - 8);
  tempQuart.controlX = (+xaxis) + 2;
  tempQuart.controlY = (+position) - 2;
  tempQuart.endX = (+xaxis) + 5;
  tempQuart.endY = (+position) - 2;
  ctx.quadraticCurveTo(tempQuart.controlX, tempQuart.controlY, tempQuart.endX, tempQuart.endY);

  ctx.moveTo(tempQuart.endX, tempQuart.endY);
  tempQuart.controlX = (+tempQuart.endX);
  tempQuart.controlY = (+position);
  tempQuart.endX = (+xaxis) - 5;
  tempQuart.endY = (+position) + 1;
  ctx.quadraticCurveTo(tempQuart.controlX, tempQuart.controlY, tempQuart.endX, tempQuart.endY);

  ctx.moveTo(tempQuart.endX, tempQuart.endY);
  tempQuart.controlX = (+tempQuart.endX);
  tempQuart.controlY = (+position) + 2;
  tempQuart.endX = (+xaxis) + 5;
  tempQuart.endY = (+position) + 5;
  ctx.quadraticCurveTo(tempQuart.controlX, tempQuart.controlY, tempQuart.endX, tempQuart.endY);

  ctx.moveTo(tempQuart.endX, tempQuart.endY);
  tempQuart.controlX = (+tempQuart.endX) - 15;
  tempQuart.controlY = (+position) + 10;
  tempQuart.endX = (+xaxis) + 5;
  tempQuart.endY = (+tempQuart.endY) + 7;
  ctx.quadraticCurveTo(tempQuart.controlX, tempQuart.controlY, tempQuart.endX, tempQuart.endY);
  styleNStroke();
}

function restStaff(xaxis, position) {
  var ctx = getContext();
  var tempRestStaff = {};
  tempRestStaff.overX = (+xaxis) + 3;
  tempRestStaff.underY = (+position) - 15;
  tempRestStaff.overX2 = (+xaxis) - 1;
  ctx.moveTo(tempRestStaff.overX, tempRestStaff.underY);
  ctx.lineTo(tempRestStaff.overX2, position + 10);
}

function drawEighthRest(xaxis, position) {
  var ctx = getContext();
  var tempEighthRest = {};
  ctx.beginPath();
  ctx.arc(xaxis - 3, position - 13, 3, 0, Math.PI*2, true); 
  ctx.closePath();
  ctx.fill();
  ctx.moveTo(xaxis - 5, position - 10);
  tempEighthRest.controlX = (+xaxis) - 5;
  tempEighthRest.controlY = (+position) - 10;
  tempEighthRest.endX = (+xaxis) + 5;
  tempEighthRest.endY = (+position) - 15;
  ctx.quadraticCurveTo(tempEighthRest.controlX, tempEighthRest.controlY, tempEighthRest.endX, tempEighthRest.endY);
  styleNStroke();
  restStaff(xaxis, position);
}

function drawSixteenthRest(xaxis, position) {
  drawEighthRest(xaxis, position);
  var tempSixteenth ={};
  var ctx = getContext();
  ctx.beginPath();
  ctx.arc(xaxis - 4, position - 6, 3, 0, Math.PI*2, true); 
  ctx.closePath();
  ctx.fill();
  ctx.moveTo(xaxis - 5, position - 10);
  tempSixteenth.controlX = (+xaxis) - 5;
  tempSixteenth.controlY = (+position) - 10;
  tempSixteenth.endX = (+xaxis);
  tempSixteenth.endY = (+position) - 5;
  ctx.quadraticCurveTo(tempSixteenth.controlX, tempSixteenth.controlY, tempSixteenth.endX, tempSixteenth.endY);
  styleNStroke();
  restStaff(xaxis, position);
}

function drawThirtySecondRest(xaxis, position) {
  drawEighthRest(xaxis, position);
  drawSixteenthRest(xaxis, position);
  var tempThirtySecond = {};
  var ctx = getContext();
  ctx.beginPath();
  ctx.arc(xaxis - 5, position, 3, 0, Math.PI*2, true); 
  ctx.closePath();
  ctx.fill();
  ctx.moveTo(xaxis - 5, position - 10);
  tempThirtySecond.controlX = (+xaxis) - 5;
  tempThirtySecond.controlY = (+position) - 10;
  tempThirtySecond.endX = (+xaxis);
  tempThirtySecond.endY = (+position);
  ctx.quadraticCurveTo(tempThirtySecond.controlX, tempThirtySecond.controlY, tempThirtySecond.endX, tempThirtySecond.endY);
  styleNStroke();
  restStaff(xaxis, position);
}
function drawWholeNote(xaxis, position) {
  var ctx = getContext();
  ctx.beginPath();
  ctx.arc(xaxis, position, 8, 0, Math.PI*2, true); 
  ctx.closePath();
}

function drawHalfNote(xaxis, position) {
  drawWholeNote(xaxis, position);
  drawNoteStaff(xaxis, position);
}

function drawQuarterNote(xaxis, position) {
  //var ctx = getContext();
  //ctx.font = "3.5em Helvetica-Light";
  //var tempXAxis = parseInt(xaxis,10) - 25;
  //var tempYAxis = parseInt(position,10) + 3;
  //ctx.fillText("♩ " , tempXAxis, tempYAxis);

  var ctx = getContext();
  ctx.beginPath();
  ctx.arc(xaxis, position, 8, 0, Math.PI*2, true); 
  ctx.closePath();
  ctx.fill();
  drawNoteStaff(xaxis, position);
}

function drawEighthNote(xaxis, position) {
  //var ctx = getContext();
  //ctx.font = "3.5em Helvetica-Light";
  //var tempXAxis = parseInt(xaxis,10) - 25;
  //var tempYAxis = parseInt(position,10) + 3;
  //ctx.fillText("♪" , tempXAxis, tempYAxis);

  drawQuarterNote(xaxis, position);
  drawNoteStaff(xaxis, position);
  drawOneFlag(xaxis, position);
}

function drawSixteenthNote(xaxis, position) {
  drawQuarterNote(xaxis, position);
  drawNoteStaff(xaxis, position);
  drawOneFlag(xaxis, position);
  drawTwoFlag(xaxis, position);
}

function drawThirtySecondNote(xaxis, position) {
  drawQuarterNote(xaxis, position);
  drawNoteStaff(xaxis, position);
  drawOneFlag(xaxis, position);
  drawTwoFlag(xaxis, position);
  drawThreeFlag(xaxis, position);
}

function drawNoteStaff(xaxis, position) {
  var ctx = getContext();
  var overX = (+xaxis) + 8;
  var underY = (+position) - 25;
  ctx.moveTo(overX, underY);
  ctx.lineTo(overX, position);
}

function drawOneFlag(xaxis, position) {
  var ctx = getContext();
  var tempOneFlag = {};
  tempOneFlag.overX = (+xaxis) + 8;
  tempOneFlag.underY = (+position) - 25;
  tempOneFlag.secondOverX = (+tempOneFlag.overX) + 15;
  tempOneFlag.secondUnderY = (+tempOneFlag.underY) + 3;
  ctx.moveTo(tempOneFlag.overX, tempOneFlag.underY);
  ctx.lineTo(tempOneFlag.secondOverX, tempOneFlag.secondUnderY);
}

function drawTwoFlag(xaxis, position) {
  var ctx = getContext();
  var tempTwoFlag = {};
  tempTwoFlag.overX = (+xaxis) + 8;
  tempTwoFlag.underY = (+position) - 20;
  tempTwoFlag.secondOverX = (+tempTwoFlag.overX) + 15;
  tempTwoFlag.secondUnderY = (+tempTwoFlag.underY) + 3;
  ctx.moveTo(tempTwoFlag.overX, tempTwoFlag.underY);
  ctx.lineTo(tempTwoFlag.secondOverX, tempTwoFlag.secondUnderY);
}

function drawThreeFlag(xaxis, position) {
  var ctx = getContext();
  var tempThreeFlag = {};
  tempThreeFlag.overX = (+xaxis) + 8;
  tempThreeFlag.underY = (+position) - 15;
  tempThreeFlag.secondOverX = (+tempThreeFlag.overX) + 15;
  tempThreeFlag.secondUnderY = (+tempThreeFlag.underY) + 3;
  ctx.moveTo(tempThreeFlag.overX, tempThreeFlag.underY);
  ctx.lineTo(tempThreeFlag.secondOverX, tempThreeFlag.secondUnderY);
}

function styleNStroke() {
  var ctx = getContext();
  ctx.strokeStyle = "#000";
  ctx.stroke();
}

function sharpNote(xaxis, position) {
  var unicodeCharToTest = "\u266F";
  var ctx = getContext();
  if (!unicodeCharToTest) {
    var tempSharpNote = {};
    tempSharpNote.xCoord1a = (+xaxis) - 17;
    tempSharpNote.yCoord1a = (+position) - 8;
    tempSharpNote.yCoord2a = (+tempSharpNote.yCoord1a) + 15;
    ctx.moveTo(tempSharpNote.xCoord1a, tempSharpNote.yCoord1a);
    ctx.lineTo(tempSharpNote.xCoord1a, tempSharpNote.yCoord2a);

    tempSharpNote.xCoord1b = (+tempSharpNote.xCoord1a) + 5;
    tempSharpNote.yCoord1b = (+tempSharpNote.yCoord2a) - 18;
    tempSharpNote.yCoord2b = (+tempSharpNote.yCoord1b) + 15;
    ctx.moveTo(tempSharpNote.xCoord1b, tempSharpNote.yCoord1b);
    ctx.lineTo(tempSharpNote.xCoord1b, tempSharpNote.yCoord2b);

    tempSharpNote.xCoord1c = (+tempSharpNote.xCoord1b) - 10;
    tempSharpNote.yCoord1c = (+tempSharpNote.yCoord2b) - 7;
    tempSharpNote.xCoord2c = (+tempSharpNote.xCoord1c) + 15;
    tempSharpNote.yCoord2c = (+tempSharpNote.yCoord2b) - 10;
    ctx.moveTo(tempSharpNote.xCoord1c, tempSharpNote.yCoord1c);
    ctx.lineTo(tempSharpNote.xCoord2c, tempSharpNote.yCoord2c);

    tempSharpNote.xCoord1d = (+tempSharpNote.xCoord1c);
    tempSharpNote.yCoord1d = (+tempSharpNote.yCoord1c) + 6;
    tempSharpNote.xCoord2d = (+tempSharpNote.xCoord1d) + 15;
    tempSharpNote.yCoord2d = (+tempSharpNote.yCoord2c) + 6;
    ctx.moveTo(tempSharpNote.xCoord1d, tempSharpNote.yCoord1d);
    ctx.lineTo(tempSharpNote.xCoord2d, tempSharpNote.yCoord2d);
  } else if (unicodeCharToTest) {
    ctx.font = "1.5em Helvetica-Light";
    var tempXAxis = parseInt(xaxis,10) - 28;
    var tempYAxis = parseInt(position,10) + 8;
    ctx.fillText("\u266F" , tempXAxis, tempYAxis);
  }
  styleNStroke();
}

function naturalNote(xaxis, position) {
  var unicodeCharToTest = "\u266E";
  var ctx = getContext();
  if (!unicodeCharToTest) {
    var tempNatural = {};
    tempNatural.xCoord1a = (+xaxis) - 17;
    tempNatural.yCoord1a = (+position) - 8;
    tempNatural.yCoord2a = (+tempNatural.yCoord1a) + 15;
    ctx.moveTo(tempNatural.xCoord1a, tempNatural.yCoord1a);
    ctx.lineTo(tempNatural.xCoord1a, tempNatural.yCoord2a);

    tempNatural.xCoord1b = (+tempNatural.xCoord1a) + 5;
    tempNatural.yCoord1b = (+tempNatural.yCoord2a) - 12;
    tempNatural.yCoord2b = (+tempNatural.yCoord1b) + 15;
    ctx.moveTo(tempNatural.xCoord1b, tempNatural.yCoord1b);
    ctx.lineTo(tempNatural.xCoord1b, tempNatural.yCoord2b);

    tempNatural.xCoord1c = (+tempNatural.xCoord1b) - 6;
    tempNatural.yCoord1c = (+tempNatural.yCoord2b) - 12;
    tempNatural.xCoord2c = (+tempNatural.xCoord1c) + 5;
    tempNatural.yCoord2c = (+tempNatural.yCoord2b) - 14;
    ctx.moveTo(tempNatural.xCoord1c, tempNatural.yCoord1c);
    ctx.lineTo(tempNatural.xCoord2c, tempNatural.yCoord2c);

    tempNatural.xCoord1d = (+tempNatural.xCoord1c);
    tempNatural.yCoord1d = (+tempNatural.yCoord2c) + 12;
    tempNatural.xCoord2d = (+tempNatural.xCoord1c) + 5;
    tempNatural.yCoord2d = (+tempNatural.yCoord2c) + 8;
    ctx.moveTo(tempNatural.xCoord1d, tempNatural.yCoord1d);
    ctx.lineTo(tempNatural.xCoord2d, tempNatural.yCoord2d);
  } else if (unicodeCharToTest) {
    ctx.font = "1.5em Helvetica-Light";
    var tempXAxis = parseInt(xaxis,10) - 28;
    var tempYAxis = parseInt(position,10) + 8;
    ctx.fillText("\u266E", tempXAxis, tempYAxis);
  }
  styleNStroke();
}

function flatNote(xaxis, position) {
  var ctx = getContext();
  var unicodeCharToTest = "\u266E";
  if (!unicodeCharToTest) {
    var tempFlat = {};
    tempFlat.xCoord1a = (+xaxis) - 18;
    tempFlat.xCoord1b = (+xaxis) - 16;
    tempFlat.yCoord1a = (+position) - 8;
    tempFlat.yCoord2a = (+tempFlat.yCoord1a) + 15;
    ctx.moveTo(tempFlat.xCoord1a, tempFlat.yCoord1a);
    ctx.lineTo(tempFlat.xCoord1b, tempFlat.yCoord2a);

    tempFlat.tempXAxis = (+tempFlat.xCoord1b);
    tempFlat.tempYAxis = (+tempFlat.yCoord2a);
    ctx.moveTo(tempFlat.tempXAxis, tempFlat.tempYAxis);
    tempFlat.controlX = (+tempFlat.tempXAxis) + 10;
    tempFlat.controlY = (+tempFlat.yCoord1a) + 8;
    tempFlat.endX = (+tempFlat.tempXAxis);
    tempFlat.endY = (+tempFlat.yCoord1a) + 7;
    ctx.quadraticCurveTo(tempFlat.controlX, tempFlat.controlY, tempFlat.endX, tempFlat.endY);
  } else if (unicodeCharToTest) {
    ctx.font = "1.5em Helvetica-Light";
    var tempXAxis = parseInt(xaxis,10) - 28;
    var tempYAxis = parseInt(position,10) + 5;
    ctx.fillText("\u266D", tempXAxis, tempYAxis);
  }
  styleNStroke();
}

  //Start key signature drawing functions
  //setTheKey() gets the tonic and then draws the appropriate sharps on the staffs. 
function setTheKey(theKey, xaxis, position) {
  if (theKey == -7) {
  // if the key is C flat
    fNatural(xaxis, position);
    bFlat(xaxis, position);
    eFlat(xaxis, position);
    aFlat(xaxis, position);
    dFlat(xaxis, position);
    gFlat(xaxis, position);
    cFlat(xaxis, position);
  } else if (theKey == -6) {
  // if the key is G flat
    fNatural(xaxis, position);
    bFlat(xaxis, position);
    eFlat(xaxis, position);
    aFlat(xaxis, position);
    dFlat(xaxis, position);
    gFlat(xaxis, position);
  } else if (theKey == -5) {
  // if the key is D flat
    fNatural(xaxis, position);
    bFlat(xaxis, position);
    eFlat(xaxis, position);
    aFlat(xaxis, position);
    dFlat(xaxis, position);
  } else if (theKey == -4) {
  // if the key is A flat
    fNatural(xaxis, position);
    bFlat(xaxis, position);
    eFlat(xaxis, position);
    aFlat(xaxis, position);
  } else if (theKey == -3) {
  // if the key is E flat
    fNatural(xaxis, position);
    bFlat(xaxis, position);
    eFlat(xaxis, position);
  } else if (theKey == -2) {
  // if the key is B flat
    fNatural(xaxis, position);
    bFlat(xaxis, position);
  } else if (theKey == -1) {
  // if the key is F
    fNatural(xaxis, position);
  } else if (theKey === 0) {
  // if the key is C
    sharpNote(xaxis, position);
  } else if (theKey == 1) {
  // if the key is G
    fSharp(xaxis, position);
  } else if (theKey == 2) {
  // if the key is D
    fSharp(xaxis, position);
    cSharp(xaxis, position);
  } else if (theKey == 3) {
  // if the key is A
    fSharp(xaxis, position);
    cSharp(xaxis, position);
    gSharp(xaxis, position);
  } else if (theKey == 4) {
  // if the key is E
    fSharp(xaxis, position);
    cSharp(xaxis, position);
    gSharp(xaxis, position);
    dSharp(xaxis, position);
  } else if (theKey == 5) {
  // if the key is B
    fSharp(xaxis, position);
    cSharp(xaxis, position);
    gSharp(xaxis, position);
    dSharp(xaxis, position);
    aSharp(xaxis, position);
  } else if (theKey == 6) {
  // if the key is F#
    fSharp(xaxis, position);
    cSharp(xaxis, position);
    gSharp(xaxis, position);
    dSharp(xaxis, position);
    aSharp(xaxis, position);
    eSharp(xaxis, position);
  } else if (theKey == 7) {
  // if the key is C#
    fSharp(xaxis, position);
    cSharp(xaxis, position);
    gSharp(xaxis, position);
    dSharp(xaxis, position);
    aSharp(xaxis, position);
    eSharp(xaxis, position);
    bSharp(xaxis, position);
  } 

  function drawStaffFlatHelper(x1,y1,x2,y2) {
    var tempDrawStaffFlat = {};
    tempDrawStaffFlat.x = (+X_AXIS_START_OF_STAFF_LINES);
    tempDrawStaffFlat.y = (+POSITION_OF_F5_STAFF_LINE);
    flatNote(tempDrawStaffFlat.x+x1,tempDrawStaffFlat.y+y1);
    flatNote(tempDrawStaffFlat.x+x2,tempDrawStaffFlat.y+y2);
  }

  function drawStaffSharpHelper(x1,y1,x2,y2) {
    var tempDrawStaffSharp = {};
    tempDrawStaffSharp.x = (+X_AXIS_START_OF_STAFF_LINES);
    tempDrawStaffSharp.y = (+POSITION_OF_F5_STAFF_LINE);
    sharpNote(tempDrawStaffSharp.x+x1,tempDrawStaffSharp.y+y1);
    sharpNote(tempDrawStaffSharp.x+x2,tempDrawStaffSharp.y+y2);
  }

  // draws a bass note in the appropriate place in both octaves on the staff.
  function fNatural(tempXAxis, tempYAxis) {
    drawStaffFlatHelper(85,40,85,180);
  }

  // draws a bass note in the appropriate place in both octaves on the staff.
  function bFlat(tempXAxis, tempYAxis) {
    drawStaffFlatHelper(90,10,90,150);
  }

  // draws a bass note in the appropriate place in both octaves on the staff.
  function eFlat(tempXAxis, tempYAxis) {
    drawStaffFlatHelper(100,50,100,190);
  }

  // draws a bass note in the appropriate place in both octaves on the staff.
  function aFlat(tempXAxis, tempYAxis) {
    drawStaffFlatHelper(110,20,110,160);
  }

  // draws a bass note in the appropriate place in both octaves on the staff.
  function dFlat(tempXAxis, tempYAxis) {
    drawStaffFlatHelper(120,60,120,200);
  }

  // draws a bass note in the appropriate place in both octaves on the staff.
  function gFlat(tempXAxis, tempYAxis) {
    drawStaffFlatHelper(130,30,130,170);
  }
  
  // draws a bass note in the appropriate place in both octaves on the staff.
  function cFlat(tempXAxis, tempYAxis) {
    drawStaffFlatHelper(140,70,140,210);
  }

  // draws a sharp note in the appropriate place in both octaves on the staff.
  function fSharp(tempXAxis, tempYAxis) {
    drawStaffSharpHelper(85,0,85,140);
  }

  // draws a sharp note in the appropriate place in both octaves on the staff.
  function cSharp(tempXAxis, tempYAxis) {
    drawStaffSharpHelper(95,30,95,170);
  }

  // draws a sharp note in the appropriate place in both octaves on the staff.
  function gSharp(tempXAxis, tempYAxis) {
    drawStaffSharpHelper(100,-10,100,130);
  }

  // draws a sharp note in the appropriate place in both octaves on the staff.
  function dSharp(tempXAxis, tempYAxis) {
    drawStaffSharpHelper(115,20,115,160);
  }

  // draws a sharp note in the appropriate place in both octaves on the staff.
  function aSharp(tempXAxis, tempYAxis) {
    drawStaffSharpHelper(125,50,125,190);
  }

  // draws a sharp note in the appropriate place in both octaves on the staff.
  function eSharp(tempXAxis, tempYAxis) {
    drawStaffSharpHelper(135,10,135,150);
  }

  // draws a sharp note in the appropriate place in both octaves on the staff.
  function bSharp(tempXAxis, tempYAxis) {
    drawStaffSharpHelper(145,40,145,180);
  }
//End key signature drawing functions
}

function  setTheTimeSignature(bpmeasure, count, songtitle, creator) {
  var ctx = getContext();
  var tempSetTheTime = {};
  ctx.font = "30pt Helvetica-Light";
  tempSetTheTime.x = (+X_AXIS_START_OF_STAFF_LINES);
  tempSetTheTime.y = (+POSITION_OF_F5_STAFF_LINE);

  tempSetTheTime.tempXAxis = tempSetTheTime.x + 150;
  tempSetTheTime.tempYAxis = tempSetTheTime.y + 35;
  ctx.fillText(bpmeasure, tempSetTheTime.tempXAxis, tempSetTheTime.tempYAxis);
  
  tempSetTheTime.tempXAxis = tempSetTheTime.x + 150;
  tempSetTheTime.tempYAxis = tempSetTheTime.y + 155;
  ctx.fillText(bpmeasure, tempSetTheTime.tempXAxis, tempSetTheTime.tempYAxis);
  
  tempSetTheTime.tempXAxis = tempSetTheTime.x + 150;
  tempSetTheTime.tempYAxis = tempSetTheTime.y + 75;
  ctx.fillText(count, tempSetTheTime.tempXAxis, tempSetTheTime.tempYAxis);

  tempSetTheTime.tempXAxis = tempSetTheTime.x + 150;
  tempSetTheTime.tempYAxis = tempSetTheTime.y + 195;
  ctx.fillText(count, tempSetTheTime.tempXAxis, tempSetTheTime.tempYAxis);

  tempSetTheTime.tempXAxis = tempSetTheTime.x + 10;
  tempSetTheTime.tempYAxis = tempSetTheTime.y + 225;
  ctx.font = "15pt Helvetica-Light";
  ctx.fillText("Title: " + songtitle, tempSetTheTime.tempXAxis, tempSetTheTime.tempYAxis);

  tempSetTheTime.tempXAxis = tempSetTheTime.x + 10;
  tempSetTheTime.tempYAxis = tempSetTheTime.y + 245;
  ctx.fillText("By: " + creator, tempSetTheTime.tempXAxis, tempSetTheTime.tempYAxis);
}

//(function() {
//  var Note, my_note;
//  
//  Note = (function() {
//    function Note(note, pitch, octave) {
//    this.note = note;
//    this.pitch = pitch;
//    this.octave = octave;
//    }
//    Note.prototype.play = function() {
//      return document.write("do stuff");
//    };
//    return Note;
//  })();
//  
//  my_note = new Note("half", 0, 4);
//  
//  document.write(
//    "my note... note type: " + 
//    my_note.note + 
//    ", pitch: " + 
//    my_note.pitch + 
//    ", octave: " + 
//    my_note.octave
//  ); // you can also call my_note.play() to write "do stuff"
//}).call(this);
