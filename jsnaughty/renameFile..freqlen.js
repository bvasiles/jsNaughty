function chunkData ( e , t ) {
var n = [ ] ;
var r = e . length ;
var i = TOKEN_LITERAL_NUMBER ;
for ( ; i < r ; i += t ) {
if ( i + t < r ) {
n . push ( e . substring ( i , i + t ) ) ;
} else {
n . push ( e . substring ( i , r ) ) ;
}
}
return n ;
}
