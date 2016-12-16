var CSSLint = require ( TOKEN_LITERAL_STRING ) . CSSLint ;
exports . lint = function ( e , data ) {
var L = [ ] ;
var N = { } ;
for ( var i in data ) {
if ( data [ i ] === TOKEN_LITERAL_STRING ) {
N [ i ] = TOKEN_LITERAL_NUMBER ;
} else if ( data [ i ] ) {
N [ i ] = TOKEN_LITERAL_NUMBER ;
}
}
var ruleset = CSSLint . verify ( e , N ) ;
ruleset . messages . forEach ( function ( e ) {
if ( e ) {
if ( e . rollup !== true ) {
L . push ( {
TOKEN_LITERAL_STRING : e . line ,
TOKEN_LITERAL_STRING : e . col ,
TOKEN_LITERAL_STRING : e . type ,
TOKEN_LITERAL_STRING : e . message
} ) ;
}
}
} ) ;
return L ;
} ;
