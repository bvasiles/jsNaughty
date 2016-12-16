var SECTION = TOKEN_LITERAL_STRING ;
var VERSION = TOKEN_LITERAL_STRING ;
var TITLE = TOKEN_LITERAL_STRING ;
startTest ( ) ;
writeHeaderToLog ( SECTION + TOKEN_LITERAL_STRING + TITLE ) ;
var tc = TOKEN_LITERAL_NUMBER ;
var testcases = new Array ( ) ;
var result = TOKEN_LITERAL_STRING ;
var exception = TOKEN_LITERAL_STRING ;
var expect = TOKEN_LITERAL_STRING ;
try {
eval ( TOKEN_LITERAL_STRING ) ;
} catch ( data ) {
result = expect ;
exception = data . toString ( ) ;
}
testcases [ tc ++ ] = new TestCase ( SECTION , TOKEN_LITERAL_STRING + TOKEN_LITERAL_STRING + exception + TOKEN_LITERAL_STRING , expect , result ) ;
test ( ) ;
