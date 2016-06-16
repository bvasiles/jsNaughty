
$(document).ready(function() {
console.log( "BigCtx.js ready!" );  
Global.Problems.bigctx = {



  onLoadedProblemData : function( data ){ },


  onGo : function(){
    
    $('#special').html( 
      '<b>Each number</b> (=fitness) <b>link represents one best-of-generation individual. Click it and see!</b>'+
      '<div id="bigctx-links"></div><br>' +
      '<div id="graphssr-div" class="graph"></div>' );

    this.solutions     = [] ;
    this.i             = 0  ;

  },


  fenotyp : function( solution , ffVal ){

    ffVal = Math.round(ffVal*100)/100 ;

    this.plotIt(solution);

    this.solutions[this.i] = solution ;
    $('#bigctx-links').append( '<a href="#" title="'+ solution +'" '+
      'onclick="Global.Problems.bigctx.link('+this.i+')">' +ffVal + '</a> ' );

    this.i ++ ;

  },

  plotIt : function( solution ){

    //TODO !

  },


  link : function( i ){
    
    this.plotIt( this.solutions[i] );

  },



};});
