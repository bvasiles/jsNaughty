var geom2d = function ( ) {
var n = numeric . sum , r = numeric . numberEquals ;
var t = TOKEN_LITERAL_NUMBER ;
function u ( n , r ) {
this . x = n ;
this . y = r ;
}
i ( u , {
dotProduct : function r ( t ) {
return n ( [ this . x * t . x , this . y * t . y ] ) ;
} ,
equals : function n ( t , u ) {
return r ( this . x , t . x , u ) && r ( this . y , t . y , u ) ;
}
} ) ;
function i ( n , r ) {
for ( var t in r ) n [ t ] = r [ t ] ;
return n ;
}
return {
Vector2d : u
} ;
} ( ) ;
