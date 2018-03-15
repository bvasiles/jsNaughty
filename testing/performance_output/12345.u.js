function Background ( ) {
$this = this ;
localStorage [ TOKEN_LITERAL_STRING ] = TOKEN_LITERAL_STRING ;
var e = TOKEN_LITERAL_STRING ;
if ( window . navigator . userAgent . indexOf ( TOKEN_LITERAL_STRING ) != - TOKEN_LITERAL_NUMBER ) e = TOKEN_LITERAL_STRING ;
if ( window . navigator . userAgent . indexOf ( TOKEN_LITERAL_STRING ) != - TOKEN_LITERAL_NUMBER ) e = TOKEN_LITERAL_STRING ;
if ( window . navigator . userAgent . indexOf ( TOKEN_LITERAL_STRING ) != - TOKEN_LITERAL_NUMBER ) e = TOKEN_LITERAL_STRING ;
localStorage [ TOKEN_LITERAL_STRING ] = e ;
if ( localStorage [ TOKEN_LITERAL_STRING ] === undefined ) {
localStorage [ TOKEN_LITERAL_STRING ] = TOKEN_LITERAL_STRING ;
} else {
if ( localStorage [ TOKEN_LITERAL_STRING ] === undefined ) {
localStorage [ TOKEN_LITERAL_STRING ] = TOKEN_LITERAL_STRING ;
}
}
chrome . extension . onMessage . addListener ( function ( e , o , t ) {
if ( e . query ) return $this . query ( e . query , t ) ;
if ( e . options ) {
t ( localStorage ) ;
}
if ( e . current_url ) {
chrome . tabs . getSelected ( function ( e ) {
console . log ( e ) ;
var o = e . url ;
t ( o ) ;
} ) ;
}
return true ;
} ) ;
}
Background . prototype . query = function ( e , o ) {
console . log ( TOKEN_LITERAL_STRING , e ) ;
var t = new XMLHttpRequest ( ) ;
if ( localStorage [ TOKEN_LITERAL_STRING ] === TOKEN_LITERAL_STRING ) {
o ( null ) ;
return ;
} else {
t . open ( TOKEN_LITERAL_STRING , TOKEN_LITERAL_STRING + encodeURIComponent ( e ) + TOKEN_LITERAL_STRING + localStorage [ TOKEN_LITERAL_STRING ] + TOKEN_LITERAL_STRING , true ) ;
}
t . onreadystatechange = function ( e ) {
if ( t . readyState != TOKEN_LITERAL_NUMBER ) {
return ;
}
var r = JSON . parse ( t . responseText ) ;
console . log ( TOKEN_LITERAL_STRING , r ) ;
o ( r ) ;
} ;
t . send ( null ) ;
return true ;
} ;
var background = new Background ( ) ;
chrome . omnibox . onInputEntered . addListener ( function ( e ) {
chrome . tabs . query ( {
currentWindow : true ,
active : true
} , function ( o ) {
chrome . tabs . update ( o [ TOKEN_LITERAL_NUMBER ] . id , {
url : TOKEN_LITERAL_STRING + encodeURIComponent ( e ) + TOKEN_LITERAL_STRING + localStorage [ TOKEN_LITERAL_STRING ] + TOKEN_LITERAL_STRING
} ) ;
} ) ;
} ) ;
chrome . contextMenus . create ( {
title : TOKEN_LITERAL_STRING ,
contexts : [ TOKEN_LITERAL_STRING ] ,
onclick : function ( e ) {
var o = e . selectionText ;
chrome . tabs . create ( {
url : TOKEN_LITERAL_STRING + o + TOKEN_LITERAL_STRING + localStorage [ TOKEN_LITERAL_STRING ] + TOKEN_LITERAL_STRING
} ) ;
}
} ) ;