function chunkData ( <<functionchunkData(#,){>> , <<functionchunkData(,#){>> ) {
var <<var#=[];>> = [ ] ;
var <<var#=.length;>> = <<functionchunkData(#,){>> . length ;
var <<var#=TOKEN_LITERAL_NUMBER;>> = TOKEN_LITERAL_NUMBER ;
for ( ; <<var#=TOKEN_LITERAL_NUMBER;>> < <<var#=.length;>> ; <<var#=TOKEN_LITERAL_NUMBER;>> += <<functionchunkData(,#){>> ) {
if ( <<var#=TOKEN_LITERAL_NUMBER;>> + <<functionchunkData(,#){>> < <<var#=.length;>> ) {
<<var#=[];>> . push ( <<functionchunkData(#,){>> . substring ( <<var#=TOKEN_LITERAL_NUMBER;>> , <<var#=TOKEN_LITERAL_NUMBER;>> + <<functionchunkData(,#){>> ) ) ;
} else {
<<var#=[];>> . push ( <<functionchunkData(#,){>> . substring ( <<var#=TOKEN_LITERAL_NUMBER;>> , <<var#=.length;>> ) ) ;
}
}
return <<var#=[];>> ;
}
