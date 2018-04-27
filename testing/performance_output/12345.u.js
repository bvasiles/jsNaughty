ace . define ( TOKEN_LITERAL_STRING , [ TOKEN_LITERAL_STRING , TOKEN_LITERAL_STRING , TOKEN_LITERAL_STRING , TOKEN_LITERAL_STRING ] , function ( r , o , e ) {
o . isDark = true ;
o . cssClass = TOKEN_LITERAL_STRING ;
o . cssText = TOKEN_LITERAL_STRING ;
var t = r ( TOKEN_LITERAL_STRING ) ;
t . importCssString ( o . cssText , o . cssClass ) ;
} ) ;