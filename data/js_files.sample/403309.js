/*
 * RaphUML.js
 *
 *
 * The MIT License
 *
 * Copyright (c) 2010 John Krasnay
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

var RaphUML = function () {



    var parsedAttributes = [];
    var parsedClassDiagram;
    var parsedConstant;
    var parsedEndPoints = [];
    var parsedMulti;
    var parsedOperations = [];
    var parsedProperties = { };


/*
	Default template driver for JS/CC generated parsers running as
	browser-based JavaScript/ECMAScript applications.
	
	WARNING: 	This parser template will not run as console and has lesser
				features for debugging than the console derivates for the
				various JavaScript platforms.
	
	Features:
	- Parser trace messages
	- Integrated panic-mode error recovery
	
	Written 2007, 2008 by Jan Max Meyer, J.M.K S.F. Software Technologies
	
	This is in the public domain.
*/

var ClassDiagram__dbg_withtrace		= false;
var ClassDiagram__dbg_string			= new String();

function __ClassDiagram_dbg_print( text )
{
	ClassDiagram__dbg_string += text + "\n";
}

function __ClassDiagram_lex( info )
{
	var state		= 0;
	var match		= -1;
	var match_pos	= 0;
	var start		= 0;
	var pos			= info.offset + 1;

	do
	{
		pos--;
		state = 0;
		match = -2;
		start = pos;

		if( info.src.length <= start )
			return 38;

		do
		{

switch( state )
{
	case 0:
		if( info.src.charCodeAt( pos ) == 9 || info.src.charCodeAt( pos ) == 13 || info.src.charCodeAt( pos ) == 32 ) state = 1;
		else if( info.src.charCodeAt( pos ) == 10 ) state = 2;
		else if( info.src.charCodeAt( pos ) == 35 || info.src.charCodeAt( pos ) == 43 ) state = 3;
		else if( info.src.charCodeAt( pos ) == 40 ) state = 4;
		else if( info.src.charCodeAt( pos ) == 41 ) state = 5;
		else if( info.src.charCodeAt( pos ) == 42 ) state = 6;
		else if( info.src.charCodeAt( pos ) == 44 ) state = 7;
		else if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) ) state = 8;
		else if( info.src.charCodeAt( pos ) == 61 ) state = 9;
		else if( ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || info.src.charCodeAt( pos ) == 98 || info.src.charCodeAt( pos ) == 100 || ( info.src.charCodeAt( pos ) >= 102 && info.src.charCodeAt( pos ) <= 103 ) || ( info.src.charCodeAt( pos ) >= 106 && info.src.charCodeAt( pos ) <= 109 ) || ( info.src.charCodeAt( pos ) >= 112 && info.src.charCodeAt( pos ) <= 115 ) || ( info.src.charCodeAt( pos ) >= 118 && info.src.charCodeAt( pos ) <= 122 ) ) state = 10;
		else if( info.src.charCodeAt( pos ) == 46 ) state = 22;
		else if( info.src.charCodeAt( pos ) == 45 ) state = 23;
		else if( info.src.charCodeAt( pos ) == 116 ) state = 24;
		else if( info.src.charCodeAt( pos ) == 104 ) state = 35;
		else if( info.src.charCodeAt( pos ) == 110 ) state = 43;
		else if( info.src.charCodeAt( pos ) == 111 ) state = 44;
		else if( info.src.charCodeAt( pos ) == 117 ) state = 45;
		else if( info.src.charCodeAt( pos ) == 97 ) state = 50;
		else if( info.src.charCodeAt( pos ) == 99 ) state = 51;
		else if( info.src.charCodeAt( pos ) == 101 ) state = 56;
		else if( info.src.charCodeAt( pos ) == 105 ) state = 60;
		else state = -1;
		break;

	case 1:
		state = -1;
		match = 1;
		match_pos = pos;
		break;

	case 2:
		state = -1;
		match = 14;
		match_pos = pos;
		break;

	case 3:
		if( ( info.src.charCodeAt( pos ) >= 0 && info.src.charCodeAt( pos ) <= 9 ) || ( info.src.charCodeAt( pos ) >= 11 && info.src.charCodeAt( pos ) <= 254 ) ) state = 3;
		else state = -1;
		match = 21;
		match_pos = pos;
		break;

	case 4:
		state = -1;
		match = 11;
		match_pos = pos;
		break;

	case 5:
		state = -1;
		match = 12;
		match_pos = pos;
		break;

	case 6:
		state = -1;
		match = 18;
		match_pos = pos;
		break;

	case 7:
		state = -1;
		match = 13;
		match_pos = pos;
		break;

	case 8:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) ) state = 8;
		else state = -1;
		match = 19;
		match_pos = pos;
		break;

	case 9:
		state = -1;
		match = 16;
		match_pos = pos;
		break;

	case 10:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 10;
		else state = -1;
		match = 20;
		match_pos = pos;
		break;

	case 11:
		if( ( info.src.charCodeAt( pos ) >= 0 && info.src.charCodeAt( pos ) <= 9 ) || ( info.src.charCodeAt( pos ) >= 11 && info.src.charCodeAt( pos ) <= 254 ) ) state = 3;
		else state = -1;
		match = 15;
		match_pos = pos;
		break;

	case 12:
		state = -1;
		match = 17;
		match_pos = pos;
		break;

	case 13:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 10;
		else state = -1;
		match = 9;
		match_pos = pos;
		break;

	case 14:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 10;
		else state = -1;
		match = 5;
		match_pos = pos;
		break;

	case 15:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 10;
		else state = -1;
		match = 8;
		match_pos = pos;
		break;

	case 16:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 10;
		else state = -1;
		match = 10;
		match_pos = pos;
		break;

	case 17:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 10;
		else state = -1;
		match = 2;
		match_pos = pos;
		break;

	case 18:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 10;
		else state = -1;
		match = 3;
		match_pos = pos;
		break;

	case 19:
		state = -1;
		match = 7;
		match_pos = pos;
		break;

	case 20:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 10;
		else state = -1;
		match = 4;
		match_pos = pos;
		break;

	case 21:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 10;
		else state = -1;
		match = 6;
		match_pos = pos;
		break;

	case 22:
		if( info.src.charCodeAt( pos ) == 46 ) state = 12;
		else state = -1;
		break;

	case 23:
		if( ( info.src.charCodeAt( pos ) >= 0 && info.src.charCodeAt( pos ) <= 9 ) || ( info.src.charCodeAt( pos ) >= 11 && info.src.charCodeAt( pos ) <= 44 ) || ( info.src.charCodeAt( pos ) >= 46 && info.src.charCodeAt( pos ) <= 254 ) ) state = 3;
		else if( info.src.charCodeAt( pos ) == 45 ) state = 11;
		else state = -1;
		match = 21;
		match_pos = pos;
		break;

	case 24:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 110 ) || ( info.src.charCodeAt( pos ) >= 112 && info.src.charCodeAt( pos ) <= 122 ) ) state = 10;
		else if( info.src.charCodeAt( pos ) == 111 ) state = 13;
		else state = -1;
		match = 20;
		match_pos = pos;
		break;

	case 25:
		if( info.src.charCodeAt( pos ) == 116 ) state = 27;
		else state = -1;
		break;

	case 26:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 114 ) || ( info.src.charCodeAt( pos ) >= 116 && info.src.charCodeAt( pos ) <= 122 ) ) state = 10;
		else if( info.src.charCodeAt( pos ) == 115 ) state = 14;
		else state = -1;
		match = 20;
		match_pos = pos;
		break;

	case 27:
		if( info.src.charCodeAt( pos ) == 111 ) state = 19;
		else state = -1;
		break;

	case 28:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 122 ) ) state = 10;
		else if( info.src.charCodeAt( pos ) == 45 ) state = 25;
		else state = -1;
		match = 20;
		match_pos = pos;
		break;

	case 29:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 114 ) || ( info.src.charCodeAt( pos ) >= 116 && info.src.charCodeAt( pos ) <= 122 ) ) state = 10;
		else if( info.src.charCodeAt( pos ) == 115 ) state = 15;
		else state = -1;
		match = 20;
		match_pos = pos;
		break;

	case 30:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 114 ) || ( info.src.charCodeAt( pos ) >= 116 && info.src.charCodeAt( pos ) <= 122 ) ) state = 10;
		else if( info.src.charCodeAt( pos ) == 115 ) state = 16;
		else state = -1;
		match = 20;
		match_pos = pos;
		break;

	case 31:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 98 ) || ( info.src.charCodeAt( pos ) >= 100 && info.src.charCodeAt( pos ) <= 122 ) ) state = 10;
		else if( info.src.charCodeAt( pos ) == 99 ) state = 17;
		else state = -1;
		match = 20;
		match_pos = pos;
		break;

	case 32:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 114 ) || ( info.src.charCodeAt( pos ) >= 116 && info.src.charCodeAt( pos ) <= 122 ) ) state = 10;
		else if( info.src.charCodeAt( pos ) == 115 ) state = 18;
		else state = -1;
		match = 20;
		match_pos = pos;
		break;

	case 33:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 114 ) || ( info.src.charCodeAt( pos ) >= 116 && info.src.charCodeAt( pos ) <= 122 ) ) state = 10;
		else if( info.src.charCodeAt( pos ) == 115 ) state = 20;
		else state = -1;
		match = 20;
		match_pos = pos;
		break;

	case 34:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 114 ) || ( info.src.charCodeAt( pos ) >= 116 && info.src.charCodeAt( pos ) <= 122 ) ) state = 10;
		else if( info.src.charCodeAt( pos ) == 115 ) state = 21;
		else state = -1;
		match = 20;
		match_pos = pos;
		break;

	case 35:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 98 && info.src.charCodeAt( pos ) <= 122 ) ) state = 10;
		else if( info.src.charCodeAt( pos ) == 97 ) state = 26;
		else state = -1;
		match = 20;
		match_pos = pos;
		break;

	case 36:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 117 ) || ( info.src.charCodeAt( pos ) >= 119 && info.src.charCodeAt( pos ) <= 122 ) ) state = 10;
		else if( info.src.charCodeAt( pos ) == 118 ) state = 28;
		else state = -1;
		match = 20;
		match_pos = pos;
		break;

	case 37:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 109 ) || ( info.src.charCodeAt( pos ) >= 111 && info.src.charCodeAt( pos ) <= 122 ) ) state = 10;
		else if( info.src.charCodeAt( pos ) == 110 ) state = 29;
		else state = -1;
		match = 20;
		match_pos = pos;
		break;

	case 38:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 100 ) || ( info.src.charCodeAt( pos ) >= 102 && info.src.charCodeAt( pos ) <= 122 ) ) state = 10;
		else if( info.src.charCodeAt( pos ) == 101 ) state = 30;
		else state = -1;
		match = 20;
		match_pos = pos;
		break;

	case 39:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 110 ) || ( info.src.charCodeAt( pos ) >= 112 && info.src.charCodeAt( pos ) <= 122 ) ) state = 10;
		else if( info.src.charCodeAt( pos ) == 111 ) state = 31;
		else state = -1;
		match = 20;
		match_pos = pos;
		break;

	case 40:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 114 ) || ( info.src.charCodeAt( pos ) >= 116 && info.src.charCodeAt( pos ) <= 122 ) ) state = 10;
		else if( info.src.charCodeAt( pos ) == 115 ) state = 32;
		else state = -1;
		match = 20;
		match_pos = pos;
		break;

	case 41:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 99 ) || ( info.src.charCodeAt( pos ) >= 101 && info.src.charCodeAt( pos ) <= 122 ) ) state = 10;
		else if( info.src.charCodeAt( pos ) == 100 ) state = 33;
		else state = -1;
		match = 20;
		match_pos = pos;
		break;

	case 42:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 115 ) || ( info.src.charCodeAt( pos ) >= 117 && info.src.charCodeAt( pos ) <= 122 ) ) state = 10;
		else if( info.src.charCodeAt( pos ) == 116 ) state = 34;
		else state = -1;
		match = 20;
		match_pos = pos;
		break;

	case 43:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 98 && info.src.charCodeAt( pos ) <= 122 ) ) state = 10;
		else if( info.src.charCodeAt( pos ) == 97 ) state = 36;
		else state = -1;
		match = 20;
		match_pos = pos;
		break;

	case 44:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 118 ) || ( info.src.charCodeAt( pos ) >= 120 && info.src.charCodeAt( pos ) <= 122 ) ) state = 10;
		else if( info.src.charCodeAt( pos ) == 119 ) state = 37;
		else state = -1;
		match = 20;
		match_pos = pos;
		break;

	case 45:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 114 ) || ( info.src.charCodeAt( pos ) >= 116 && info.src.charCodeAt( pos ) <= 122 ) ) state = 10;
		else if( info.src.charCodeAt( pos ) == 115 ) state = 38;
		else state = -1;
		match = 20;
		match_pos = pos;
		break;

	case 46:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 114 ) || ( info.src.charCodeAt( pos ) >= 116 && info.src.charCodeAt( pos ) <= 122 ) ) state = 10;
		else if( info.src.charCodeAt( pos ) == 115 ) state = 39;
		else state = -1;
		match = 20;
		match_pos = pos;
		break;

	case 47:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 98 && info.src.charCodeAt( pos ) <= 122 ) ) state = 10;
		else if( info.src.charCodeAt( pos ) == 97 ) state = 40;
		else state = -1;
		match = 20;
		match_pos = pos;
		break;

	case 48:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 109 ) || ( info.src.charCodeAt( pos ) >= 111 && info.src.charCodeAt( pos ) <= 122 ) ) state = 10;
		else if( info.src.charCodeAt( pos ) == 110 ) state = 41;
		else state = -1;
		match = 20;
		match_pos = pos;
		break;

	case 49:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 109 ) || ( info.src.charCodeAt( pos ) >= 111 && info.src.charCodeAt( pos ) <= 122 ) ) state = 10;
		else if( info.src.charCodeAt( pos ) == 110 ) state = 42;
		else state = -1;
		match = 20;
		match_pos = pos;
		break;

	case 50:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 114 ) || ( info.src.charCodeAt( pos ) >= 116 && info.src.charCodeAt( pos ) <= 122 ) ) state = 10;
		else if( info.src.charCodeAt( pos ) == 115 ) state = 46;
		else state = -1;
		match = 20;
		match_pos = pos;
		break;

	case 51:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 107 ) || ( info.src.charCodeAt( pos ) >= 109 && info.src.charCodeAt( pos ) <= 122 ) ) state = 10;
		else if( info.src.charCodeAt( pos ) == 108 ) state = 47;
		else state = -1;
		match = 20;
		match_pos = pos;
		break;

	case 52:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 100 ) || ( info.src.charCodeAt( pos ) >= 102 && info.src.charCodeAt( pos ) <= 122 ) ) state = 10;
		else if( info.src.charCodeAt( pos ) == 101 ) state = 48;
		else state = -1;
		match = 20;
		match_pos = pos;
		break;

	case 53:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 100 ) || ( info.src.charCodeAt( pos ) >= 102 && info.src.charCodeAt( pos ) <= 122 ) ) state = 10;
		else if( info.src.charCodeAt( pos ) == 101 ) state = 49;
		else state = -1;
		match = 20;
		match_pos = pos;
		break;

	case 54:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 115 ) || ( info.src.charCodeAt( pos ) >= 117 && info.src.charCodeAt( pos ) <= 122 ) ) state = 10;
		else if( info.src.charCodeAt( pos ) == 116 ) state = 52;
		else state = -1;
		match = 20;
		match_pos = pos;
		break;

	case 55:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 108 ) || ( info.src.charCodeAt( pos ) >= 110 && info.src.charCodeAt( pos ) <= 122 ) ) state = 10;
		else if( info.src.charCodeAt( pos ) == 109 ) state = 53;
		else state = -1;
		match = 20;
		match_pos = pos;
		break;

	case 56:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 119 ) || ( info.src.charCodeAt( pos ) >= 121 && info.src.charCodeAt( pos ) <= 122 ) ) state = 10;
		else if( info.src.charCodeAt( pos ) == 120 ) state = 54;
		else state = -1;
		match = 20;
		match_pos = pos;
		break;

	case 57:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 100 ) || ( info.src.charCodeAt( pos ) >= 102 && info.src.charCodeAt( pos ) <= 122 ) ) state = 10;
		else if( info.src.charCodeAt( pos ) == 101 ) state = 55;
		else state = -1;
		match = 20;
		match_pos = pos;
		break;

	case 58:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 107 ) || ( info.src.charCodeAt( pos ) >= 109 && info.src.charCodeAt( pos ) <= 122 ) ) state = 10;
		else if( info.src.charCodeAt( pos ) == 108 ) state = 57;
		else state = -1;
		match = 20;
		match_pos = pos;
		break;

	case 59:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 111 ) || ( info.src.charCodeAt( pos ) >= 113 && info.src.charCodeAt( pos ) <= 122 ) ) state = 10;
		else if( info.src.charCodeAt( pos ) == 112 ) state = 58;
		else state = -1;
		match = 20;
		match_pos = pos;
		break;

	case 60:
		if( ( info.src.charCodeAt( pos ) >= 48 && info.src.charCodeAt( pos ) <= 57 ) || ( info.src.charCodeAt( pos ) >= 65 && info.src.charCodeAt( pos ) <= 90 ) || info.src.charCodeAt( pos ) == 95 || ( info.src.charCodeAt( pos ) >= 97 && info.src.charCodeAt( pos ) <= 108 ) || ( info.src.charCodeAt( pos ) >= 110 && info.src.charCodeAt( pos ) <= 122 ) ) state = 10;
		else if( info.src.charCodeAt( pos ) == 109 ) state = 59;
		else state = -1;
		match = 20;
		match_pos = pos;
		break;

}


			pos++;

		}
		while( state > -1 );

	}
	while( 1 > -1 && match == 1 );

	if( match > -1 )
	{
		info.att = info.src.substr( start, match_pos - start );
		info.offset = match_pos;
		

	}
	else
	{
		info.att = new String();
		match = -1;
	}

	return match;
}


function __ClassDiagram_parse( src, err_off, err_la )
{
	var		sstack			= new Array();
	var		vstack			= new Array();
	var 	err_cnt			= 0;
	var		act;
	var		go;
	var		la;
	var		rval;
	var 	parseinfo		= new Function( "", "var offset; var src; var att;" );
	var		info			= new parseinfo();
	
/* Pop-Table */
var pop_tab = new Array(
	new Array( 0/* stmt-list' */, 1 ),
	new Array( 22/* stmt-list */, 2 ),
	new Array( 22/* stmt-list */, 0 ),
	new Array( 23/* stmt */, 1 ),
	new Array( 23/* stmt */, 1 ),
	new Array( 23/* stmt */, 1 ),
	new Array( 24/* class-def */, 5 ),
	new Array( 26/* properties */, 4 ),
	new Array( 26/* properties */, 0 ),
	new Array( 28/* property-list */, 3 ),
	new Array( 28/* property-list */, 1 ),
	new Array( 29/* property */, 3 ),
	new Array( 30/* constant */, 1 ),
	new Array( 27/* attrs-ops */, 3 ),
	new Array( 27/* attrs-ops */, 6 ),
	new Array( 27/* attrs-ops */, 0 ),
	new Array( 31/* attr-list */, 2 ),
	new Array( 31/* attr-list */, 0 ),
	new Array( 33/* attr */, 2 ),
	new Array( 32/* op-list */, 2 ),
	new Array( 32/* op-list */, 0 ),
	new Array( 34/* op */, 2 ),
	new Array( 25/* assoc-def */, 5 ),
	new Array( 35/* end-point */, 2 ),
	new Array( 35/* end-point */, 1 ),
	new Array( 37/* multi */, 3 ),
	new Array( 37/* multi */, 5 ),
	new Array( 37/* multi */, 5 ),
	new Array( 36/* assoc-type */, 1 ),
	new Array( 36/* assoc-type */, 1 ),
	new Array( 36/* assoc-type */, 1 ),
	new Array( 36/* assoc-type */, 1 ),
	new Array( 36/* assoc-type */, 1 ),
	new Array( 36/* assoc-type */, 1 ),
	new Array( 36/* assoc-type */, 1 )
);

/* Action-Table */
var act_tab = new Array(
	/* State 0 */ new Array( 38/* "$" */,-2 , 14/* "n" */,-2 , 3/* "class" */,-2 , 2/* "assoc" */,-2 ),
	/* State 1 */ new Array( 14/* "n" */,5 , 3/* "class" */,6 , 2/* "assoc" */,7 , 38/* "$" */,0 ),
	/* State 2 */ new Array( 38/* "$" */,-1 , 14/* "n" */,-1 , 3/* "class" */,-1 , 2/* "assoc" */,-1 ),
	/* State 3 */ new Array( 38/* "$" */,-3 , 14/* "n" */,-3 , 3/* "class" */,-3 , 2/* "assoc" */,-3 ),
	/* State 4 */ new Array( 38/* "$" */,-4 , 14/* "n" */,-4 , 3/* "class" */,-4 , 2/* "assoc" */,-4 ),
	/* State 5 */ new Array( 38/* "$" */,-5 , 14/* "n" */,-5 , 3/* "class" */,-5 , 2/* "assoc" */,-5 ),
	/* State 6 */ new Array( 20/* "IDENT" */,8 ),
	/* State 7 */ new Array( 20/* "IDENT" */,10 ),
	/* State 8 */ new Array( 14/* "n" */,11 ),
	/* State 9 */ new Array( 4/* "extends" */,13 , 5/* "has" */,14 , 6/* "implements" */,15 , 7/* "nav-to" */,16 , 8/* "owns" */,17 , 9/* "to" */,18 , 10/* "uses" */,19 ),
	/* State 10 */ new Array( 11/* "(" */,21 , 4/* "extends" */,-24 , 5/* "has" */,-24 , 6/* "implements" */,-24 , 7/* "nav-to" */,-24 , 8/* "owns" */,-24 , 9/* "to" */,-24 , 10/* "uses" */,-24 , 14/* "n" */,-24 ),
	/* State 11 */ new Array( 11/* "(" */,23 , 15/* "--" */,-8 , 38/* "$" */,-8 , 14/* "n" */,-8 , 3/* "class" */,-8 , 2/* "assoc" */,-8 ),
	/* State 12 */ new Array( 20/* "IDENT" */,10 ),
	/* State 13 */ new Array( 20/* "IDENT" */,-28 ),
	/* State 14 */ new Array( 20/* "IDENT" */,-29 ),
	/* State 15 */ new Array( 20/* "IDENT" */,-30 ),
	/* State 16 */ new Array( 20/* "IDENT" */,-31 ),
	/* State 17 */ new Array( 20/* "IDENT" */,-32 ),
	/* State 18 */ new Array( 20/* "IDENT" */,-33 ),
	/* State 19 */ new Array( 20/* "IDENT" */,-34 ),
	/* State 20 */ new Array( 4/* "extends" */,-23 , 5/* "has" */,-23 , 6/* "implements" */,-23 , 7/* "nav-to" */,-23 , 8/* "owns" */,-23 , 9/* "to" */,-23 , 10/* "uses" */,-23 , 14/* "n" */,-23 ),
	/* State 21 */ new Array( 19/* "DIGITS" */,25 ),
	/* State 22 */ new Array( 15/* "--" */,27 , 38/* "$" */,-15 , 14/* "n" */,-15 , 3/* "class" */,-15 , 2/* "assoc" */,-15 ),
	/* State 23 */ new Array( 20/* "IDENT" */,30 ),
	/* State 24 */ new Array( 14/* "n" */,31 ),
	/* State 25 */ new Array( 12/* ")" */,32 , 17/* ".." */,33 ),
	/* State 26 */ new Array( 38/* "$" */,-6 , 14/* "n" */,-6 , 3/* "class" */,-6 , 2/* "assoc" */,-6 ),
	/* State 27 */ new Array( 14/* "n" */,34 ),
	/* State 28 */ new Array( 13/* "," */,35 , 12/* ")" */,36 ),
	/* State 29 */ new Array( 12/* ")" */,-10 , 13/* "," */,-10 ),
	/* State 30 */ new Array( 16/* "=" */,37 ),
	/* State 31 */ new Array( 38/* "$" */,-22 , 14/* "n" */,-22 , 3/* "class" */,-22 , 2/* "assoc" */,-22 ),
	/* State 32 */ new Array( 4/* "extends" */,-25 , 5/* "has" */,-25 , 6/* "implements" */,-25 , 7/* "nav-to" */,-25 , 8/* "owns" */,-25 , 9/* "to" */,-25 , 10/* "uses" */,-25 , 14/* "n" */,-25 ),
	/* State 33 */ new Array( 18/* "*" */,38 , 19/* "DIGITS" */,39 ),
	/* State 34 */ new Array( 15/* "--" */,-17 , 38/* "$" */,-17 , 14/* "n" */,-17 , 3/* "class" */,-17 , 2/* "assoc" */,-17 , 21/* "MEMBER" */,-17 ),
	/* State 35 */ new Array( 20/* "IDENT" */,30 ),
	/* State 36 */ new Array( 14/* "n" */,42 ),
	/* State 37 */ new Array( 19/* "DIGITS" */,44 ),
	/* State 38 */ new Array( 12/* ")" */,45 ),
	/* State 39 */ new Array( 12/* ")" */,46 ),
	/* State 40 */ new Array( 15/* "--" */,48 , 21/* "MEMBER" */,49 , 38/* "$" */,-13 , 14/* "n" */,-13 , 3/* "class" */,-13 , 2/* "assoc" */,-13 ),
	/* State 41 */ new Array( 12/* ")" */,-9 , 13/* "," */,-9 ),
	/* State 42 */ new Array( 15/* "--" */,-7 , 38/* "$" */,-7 , 14/* "n" */,-7 , 3/* "class" */,-7 , 2/* "assoc" */,-7 ),
	/* State 43 */ new Array( 12/* ")" */,-11 , 13/* "," */,-11 ),
	/* State 44 */ new Array( 12/* ")" */,-12 , 13/* "," */,-12 ),
	/* State 45 */ new Array( 4/* "extends" */,-27 , 5/* "has" */,-27 , 6/* "implements" */,-27 , 7/* "nav-to" */,-27 , 8/* "owns" */,-27 , 9/* "to" */,-27 , 10/* "uses" */,-27 , 14/* "n" */,-27 ),
	/* State 46 */ new Array( 4/* "extends" */,-26 , 5/* "has" */,-26 , 6/* "implements" */,-26 , 7/* "nav-to" */,-26 , 8/* "owns" */,-26 , 9/* "to" */,-26 , 10/* "uses" */,-26 , 14/* "n" */,-26 ),
	/* State 47 */ new Array( 15/* "--" */,-16 , 38/* "$" */,-16 , 14/* "n" */,-16 , 3/* "class" */,-16 , 2/* "assoc" */,-16 , 21/* "MEMBER" */,-16 ),
	/* State 48 */ new Array( 14/* "n" */,50 ),
	/* State 49 */ new Array( 14/* "n" */,51 ),
	/* State 50 */ new Array( 38/* "$" */,-20 , 14/* "n" */,-20 , 3/* "class" */,-20 , 2/* "assoc" */,-20 , 21/* "MEMBER" */,-20 ),
	/* State 51 */ new Array( 15/* "--" */,-18 , 38/* "$" */,-18 , 14/* "n" */,-18 , 3/* "class" */,-18 , 2/* "assoc" */,-18 , 21/* "MEMBER" */,-18 ),
	/* State 52 */ new Array( 21/* "MEMBER" */,54 , 38/* "$" */,-14 , 14/* "n" */,-14 , 3/* "class" */,-14 , 2/* "assoc" */,-14 ),
	/* State 53 */ new Array( 38/* "$" */,-19 , 14/* "n" */,-19 , 3/* "class" */,-19 , 2/* "assoc" */,-19 , 21/* "MEMBER" */,-19 ),
	/* State 54 */ new Array( 14/* "n" */,55 ),
	/* State 55 */ new Array( 38/* "$" */,-21 , 14/* "n" */,-21 , 3/* "class" */,-21 , 2/* "assoc" */,-21 , 21/* "MEMBER" */,-21 )
);

/* Goto-Table */
var goto_tab = new Array(
	/* State 0 */ new Array( 22/* stmt-list */,1 ),
	/* State 1 */ new Array( 23/* stmt */,2 , 24/* class-def */,3 , 25/* assoc-def */,4 ),
	/* State 2 */ new Array(  ),
	/* State 3 */ new Array(  ),
	/* State 4 */ new Array(  ),
	/* State 5 */ new Array(  ),
	/* State 6 */ new Array(  ),
	/* State 7 */ new Array( 35/* end-point */,9 ),
	/* State 8 */ new Array(  ),
	/* State 9 */ new Array( 36/* assoc-type */,12 ),
	/* State 10 */ new Array( 37/* multi */,20 ),
	/* State 11 */ new Array( 26/* properties */,22 ),
	/* State 12 */ new Array( 35/* end-point */,24 ),
	/* State 13 */ new Array(  ),
	/* State 14 */ new Array(  ),
	/* State 15 */ new Array(  ),
	/* State 16 */ new Array(  ),
	/* State 17 */ new Array(  ),
	/* State 18 */ new Array(  ),
	/* State 19 */ new Array(  ),
	/* State 20 */ new Array(  ),
	/* State 21 */ new Array(  ),
	/* State 22 */ new Array( 27/* attrs-ops */,26 ),
	/* State 23 */ new Array( 28/* property-list */,28 , 29/* property */,29 ),
	/* State 24 */ new Array(  ),
	/* State 25 */ new Array(  ),
	/* State 26 */ new Array(  ),
	/* State 27 */ new Array(  ),
	/* State 28 */ new Array(  ),
	/* State 29 */ new Array(  ),
	/* State 30 */ new Array(  ),
	/* State 31 */ new Array(  ),
	/* State 32 */ new Array(  ),
	/* State 33 */ new Array(  ),
	/* State 34 */ new Array( 31/* attr-list */,40 ),
	/* State 35 */ new Array( 29/* property */,41 ),
	/* State 36 */ new Array(  ),
	/* State 37 */ new Array( 30/* constant */,43 ),
	/* State 38 */ new Array(  ),
	/* State 39 */ new Array(  ),
	/* State 40 */ new Array( 33/* attr */,47 ),
	/* State 41 */ new Array(  ),
	/* State 42 */ new Array(  ),
	/* State 43 */ new Array(  ),
	/* State 44 */ new Array(  ),
	/* State 45 */ new Array(  ),
	/* State 46 */ new Array(  ),
	/* State 47 */ new Array(  ),
	/* State 48 */ new Array(  ),
	/* State 49 */ new Array(  ),
	/* State 50 */ new Array( 32/* op-list */,52 ),
	/* State 51 */ new Array(  ),
	/* State 52 */ new Array( 34/* op */,53 ),
	/* State 53 */ new Array(  ),
	/* State 54 */ new Array(  ),
	/* State 55 */ new Array(  )
);



/* Symbol labels */
var labels = new Array(
	"stmt-list'" /* Non-terminal symbol */,
	"WHITESPACE" /* Terminal symbol */,
	"assoc" /* Terminal symbol */,
	"class" /* Terminal symbol */,
	"extends" /* Terminal symbol */,
	"has" /* Terminal symbol */,
	"implements" /* Terminal symbol */,
	"nav-to" /* Terminal symbol */,
	"owns" /* Terminal symbol */,
	"to" /* Terminal symbol */,
	"uses" /* Terminal symbol */,
	"(" /* Terminal symbol */,
	")" /* Terminal symbol */,
	"," /* Terminal symbol */,
	"n" /* Terminal symbol */,
	"--" /* Terminal symbol */,
	"=" /* Terminal symbol */,
	".." /* Terminal symbol */,
	"*" /* Terminal symbol */,
	"DIGITS" /* Terminal symbol */,
	"IDENT" /* Terminal symbol */,
	"MEMBER" /* Terminal symbol */,
	"stmt-list" /* Non-terminal symbol */,
	"stmt" /* Non-terminal symbol */,
	"class-def" /* Non-terminal symbol */,
	"assoc-def" /* Non-terminal symbol */,
	"properties" /* Non-terminal symbol */,
	"attrs-ops" /* Non-terminal symbol */,
	"property-list" /* Non-terminal symbol */,
	"property" /* Non-terminal symbol */,
	"constant" /* Non-terminal symbol */,
	"attr-list" /* Non-terminal symbol */,
	"op-list" /* Non-terminal symbol */,
	"attr" /* Non-terminal symbol */,
	"op" /* Non-terminal symbol */,
	"end-point" /* Non-terminal symbol */,
	"assoc-type" /* Non-terminal symbol */,
	"multi" /* Non-terminal symbol */,
	"$" /* Terminal symbol */
);


	
	info.offset = 0;
	info.src = src;
	info.att = new String();
	
	if( !err_off )
		err_off	= new Array();
	if( !err_la )
	err_la = new Array();
	
	sstack.push( 0 );
	vstack.push( 0 );
	
	la = __ClassDiagram_lex( info );

	while( true )
	{
		act = 57;
		for( var i = 0; i < act_tab[sstack[sstack.length-1]].length; i+=2 )
		{
			if( act_tab[sstack[sstack.length-1]][i] == la )
			{
				act = act_tab[sstack[sstack.length-1]][i+1];
				break;
			}
		}

		if( ClassDiagram__dbg_withtrace && sstack.length > 0 )
		{
			__ClassDiagram_dbg_print( "\nState " + sstack[sstack.length-1] + "\n" +
							"\tLookahead: " + labels[la] + " (\"" + info.att + "\")\n" +
							"\tAction: " + act + "\n" + 
							"\tSource: \"" + info.src.substr( info.offset, 30 ) + ( ( info.offset + 30 < info.src.length ) ?
									"..." : "" ) + "\"\n" +
							"\tStack: " + sstack.join() + "\n" +
							"\tValue stack: " + vstack.join() + "\n" );
		}
		
			
		//Panic-mode: Try recovery when parse-error occurs!
		if( act == 57 )
		{
			if( ClassDiagram__dbg_withtrace )
				__ClassDiagram_dbg_print( "Error detected: There is no reduce or shift on the symbol " + labels[la] );
			
			err_cnt++;
			err_off.push( info.offset - info.att.length );			
			err_la.push( new Array() );
			for( var i = 0; i < act_tab[sstack[sstack.length-1]].length; i+=2 )
				err_la[err_la.length-1].push( labels[act_tab[sstack[sstack.length-1]][i]] );
			
			//Remember the original stack!
			var rsstack = new Array();
			var rvstack = new Array();
			for( var i = 0; i < sstack.length; i++ )
			{
				rsstack[i] = sstack[i];
				rvstack[i] = vstack[i];
			}
			
			while( act == 57 && la != 38 )
			{
				if( ClassDiagram__dbg_withtrace )
					__ClassDiagram_dbg_print( "\tError recovery\n" +
									"Current lookahead: " + labels[la] + " (" + info.att + ")\n" +
									"Action: " + act + "\n\n" );
				if( la == -1 )
					info.offset++;
					
				while( act == 57 && sstack.length > 0 )
				{
					sstack.pop();
					vstack.pop();
					
					if( sstack.length == 0 )
						break;
						
					act = 57;
					for( var i = 0; i < act_tab[sstack[sstack.length-1]].length; i+=2 )
					{
						if( act_tab[sstack[sstack.length-1]][i] == la )
						{
							act = act_tab[sstack[sstack.length-1]][i+1];
							break;
						}
					}
				}
				
				if( act != 57 )
					break;
				
				for( var i = 0; i < rsstack.length; i++ )
				{
					sstack.push( rsstack[i] );
					vstack.push( rvstack[i] );
				}
				
				la = __ClassDiagram_lex( info );
			}
			
			if( act == 57 )
			{
				if( ClassDiagram__dbg_withtrace )
					__ClassDiagram_dbg_print( "\tError recovery failed, terminating parse process..." );
				break;
			}


			if( ClassDiagram__dbg_withtrace )
				__ClassDiagram_dbg_print( "\tError recovery succeeded, continuing" );
		}
		
		/*
		if( act == 57 )
			break;
		*/
		
		
		//Shift
		if( act > 0 )
		{			
			if( ClassDiagram__dbg_withtrace )
				__ClassDiagram_dbg_print( "Shifting symbol: " + labels[la] + " (" + info.att + ")" );
		
			sstack.push( act );
			vstack.push( info.att );
			
			la = __ClassDiagram_lex( info );
			
			if( ClassDiagram__dbg_withtrace )
				__ClassDiagram_dbg_print( "\tNew lookahead symbol: " + labels[la] + " (" + info.att + ")" );
		}
		//Reduce
		else
		{		
			act *= -1;
			
			if( ClassDiagram__dbg_withtrace )
				__ClassDiagram_dbg_print( "Reducing by producution: " + act );
			
			rval = void(0);
			
			if( ClassDiagram__dbg_withtrace )
				__ClassDiagram_dbg_print( "\tPerforming semantic action..." );
			
switch( act )
{
	case 0:
	{
		rval = vstack[ vstack.length - 1 ];
	}
	break;
	case 1:
	{
		rval = vstack[ vstack.length - 2 ];
	}
	break;
	case 2:
	{
		rval = vstack[ vstack.length - 0 ];
	}
	break;
	case 3:
	{
		rval = vstack[ vstack.length - 1 ];
	}
	break;
	case 4:
	{
		rval = vstack[ vstack.length - 1 ];
	}
	break;
	case 5:
	{
		rval = vstack[ vstack.length - 1 ];
	}
	break;
	case 6:
	{
		
    var currentClass = parsedClassDiagram.class(vstack[ vstack.length - 4 ], 0, 0);

    for (var i = 0; i < parsedAttributes.length; i++) {
        currentClass.attribute(parsedAttributes[i]);
    }

    for (var i = 0; i < parsedOperations.length; i++) {
        currentClass.operation(parsedOperations[i]);
    }

    for (var key in parsedProperties) {
        currentClass[key] = parsedProperties[key];
    }

    parsedAttributes = [];
    parsedOperations = [];
    parsedProperties = [];

	}
	break;
	case 7:
	{
		rval = vstack[ vstack.length - 4 ];
	}
	break;
	case 8:
	{
		rval = vstack[ vstack.length - 0 ];
	}
	break;
	case 9:
	{
		rval = vstack[ vstack.length - 3 ];
	}
	break;
	case 10:
	{
		rval = vstack[ vstack.length - 1 ];
	}
	break;
	case 11:
	{
		 parsedProperties[vstack[ vstack.length - 3 ]] = parsedConstant; 
	}
	break;
	case 12:
	{
		 parsedConstant = Number(vstack[ vstack.length - 1 ]); 
	}
	break;
	case 13:
	{
		rval = vstack[ vstack.length - 3 ];
	}
	break;
	case 14:
	{
		rval = vstack[ vstack.length - 6 ];
	}
	break;
	case 15:
	{
		rval = vstack[ vstack.length - 0 ];
	}
	break;
	case 16:
	{
		rval = vstack[ vstack.length - 2 ];
	}
	break;
	case 17:
	{
		rval = vstack[ vstack.length - 0 ];
	}
	break;
	case 18:
	{
		 parsedAttributes.push(vstack[ vstack.length - 2 ]); 
	}
	break;
	case 19:
	{
		rval = vstack[ vstack.length - 2 ];
	}
	break;
	case 20:
	{
		rval = vstack[ vstack.length - 0 ];
	}
	break;
	case 21:
	{
		 parsedOperations.push(vstack[ vstack.length - 2 ]); 
	}
	break;
	case 22:
	{
		
    var ep1 = parsedEndPoints.shift();
    var fromClass = parsedClassDiagram.findClass(ep1[0]);
    var ep2 = parsedEndPoints.shift();
    var toClass = parsedClassDiagram.findClass(ep2[0]);
    parsedClassDiagram.associationFrom(fromClass, ep1[1]).to(toClass, ep2[1], vstack[ vstack.length - 3 ]);

	}
	break;
	case 23:
	{
		 parsedEndPoints.push([ vstack[ vstack.length - 2 ], parsedMulti ]); 
	}
	break;
	case 24:
	{
		 parsedEndPoints.push([ vstack[ vstack.length - 1 ], '' ]); 
	}
	break;
	case 25:
	{
		 parsedMulti = vstack[ vstack.length - 2 ]; 
	}
	break;
	case 26:
	{
		 parsedMulti = vstack[ vstack.length - 4 ] + vstack[ vstack.length - 3 ] + vstack[ vstack.length - 2 ]; 
	}
	break;
	case 27:
	{
		 parsedMulti = vstack[ vstack.length - 4 ] + vstack[ vstack.length - 3 ] + vstack[ vstack.length - 2 ]; 
	}
	break;
	case 28:
	{
		rval = vstack[ vstack.length - 1 ];
	}
	break;
	case 29:
	{
		rval = vstack[ vstack.length - 1 ];
	}
	break;
	case 30:
	{
		rval = vstack[ vstack.length - 1 ];
	}
	break;
	case 31:
	{
		rval = vstack[ vstack.length - 1 ];
	}
	break;
	case 32:
	{
		rval = vstack[ vstack.length - 1 ];
	}
	break;
	case 33:
	{
		rval = vstack[ vstack.length - 1 ];
	}
	break;
	case 34:
	{
		rval = vstack[ vstack.length - 1 ];
	}
	break;
}



			if( ClassDiagram__dbg_withtrace )
				__ClassDiagram_dbg_print( "\tPopping " + pop_tab[act][1] + " off the stack..." );
				
			for( var i = 0; i < pop_tab[act][1]; i++ )
			{
				sstack.pop();
				vstack.pop();
			}
									
			go = -1;
			for( var i = 0; i < goto_tab[sstack[sstack.length-1]].length; i+=2 )
			{
				if( goto_tab[sstack[sstack.length-1]][i] == pop_tab[act][0] )
				{
					go = goto_tab[sstack[sstack.length-1]][i+1];
					break;
				}
			}
			
			if( act == 0 )
				break;
				
			if( ClassDiagram__dbg_withtrace )
				__ClassDiagram_dbg_print( "\tPushing non-terminal " + labels[ pop_tab[act][0] ] );
				
			sstack.push( go );
			vstack.push( rval );			
		}
		
		if( ClassDiagram__dbg_withtrace )
		{		
			alert( ClassDiagram__dbg_string );
			ClassDiagram__dbg_string = new String();
		}
	}

	if( ClassDiagram__dbg_withtrace )
	{
		__ClassDiagram_dbg_print( "\nParse complete." );
		alert( ClassDiagram__dbg_string );
	}
	
	return err_cnt;
}




/*
 * ClassDiagram.js
 *
 *
 * The MIT License
 *
 * Copyright (c) 2010 John Krasnay
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/* straightLineRouter
 *
 * The default router function for class diagrams. The router
 * function is responsible for drawing paths representing all
 * assocations on a diagram.
 */
var straightLineRouter = function(paper, classDiagram) {

    var boxIntersection = function (thisClass, otherClass) {

        var seg = [ thisClass.cx(), thisClass.cy(), otherClass.cx(), otherClass.cy() ];

        var c = thisClass;
        var sides = {
            top: [ c.x, c.y, c.x + c.width, c.y ],
            right: [ c.x + c.width, c.y, c.x + c.width, c.y + c.height],
            bottom: [ c.x, c.y + c.height, c.x + c.width, c.y + c.height],
            left: [ c.x, c.y, c.x, c.y + c.height ]
        };

        for (var side in sides) {
            var intersect = seg_intersect(seg, sides[side]);
            if (intersect) {
                console.log('found intersection at ' + side);
                return { side: side, point: intersect }
            }
        }

        console.error('Found no side');

        return null;
    }


    var drawMulti = function (paper, multi, thisInt, otherInt) {
        var anchor;
        if (thisInt.side == 'top') {
            anchor = 7;
        } else if (thisInt.side == 'right') {
            anchor = 1;
        } else if (thisInt.side == 'bottom') {
            anchor = 1;
        } else {
            anchor = 3;
        }

        paper.text(0, 0, multi).anchor(anchor, thisInt.point[0], thisInt.point[1]);

    }

    for (var i = 0; i < classDiagram.associations.length; i++) {

        var a = classDiagram.associations[i];

        var int1 = boxIntersection(a.fromClass, a.toClass);
        var int2 = boxIntersection(a.toClass, a.fromClass);

        if (int1 && int2) {

            var path = paper.path('M' + int1.point[0] + ' ' + int1.point[1] +
                    'L' + int2.point[0] + ' ' + int2.point[1]);

            if (a.type == 'implements' || a.type == 'uses') {
                path.attr({ 'stroke-dasharray': '-' });
            }

            if (a.type == 'implements' || a.type == 'extends') {
                paper.arrow(int2.point[0], int2.point[1], int1.point[0], int1.point[1], 20, 20, true).attr({ fill: 'white' });
            } else if (a.type == 'nav-to' || a.type == 'uses') {
                paper.arrow(int2.point[0], int2.point[1], int1.point[0], int1.point[1], 16, 12);
            } else if (a.type == 'has') {
                paper.diamond(int1.point[0], int1.point[1], int2.point[0], int2.point[1], 24, 10).attr({ fill: 'white' });
            } else if (a.type == 'owns') {
                paper.diamond(int1.point[0], int1.point[1], int2.point[0], int2.point[1], 24, 10).attr({ fill: 'black' });
            }

            drawMulti(paper, a.fromCardinality, int1, int2);
            drawMulti(paper, a.toCardinality, int2, int1);

            var mx = (a.fromClass.cx() + a.toClass.cx()) / 2;
            var my = (a.fromClass.cy() + a.toClass.cy()) / 2;

            if (a.name) {
                paper.text(0, 0, a.name).anchor(8, mx, my);
            }
        }
    }
}



/* ClassDiagram
 *
 * Instances of ClassDiagram are responsible for drawing a class diagram.
 * They keep track of lists of Class and Association objects, and parameters
 * to control the drawing operation.
 *
 * The `router` member points to a function that
 */
var ClassDiagram = function() {

    this.associations = [];
    this.classes = [];

    this.bodyFontSize = 12;
    this.bodyHPad = 4;
    this.bodyVPad = 4;
    this.defaultWidth = 120;
    this.headingFontSize = 12;
    this.headingVPad = 4;
    this.router = straightLineRouter;
}

ClassDiagram.prototype.associationFrom = function (class, cardinality) {
    var assoc = new Association();
    assoc.fromClass = class;
    assoc.fromCardinality = cardinality;
    this.associations.push(assoc);
    return assoc;
}

ClassDiagram.prototype.class = function (name, x, y) {
    var class = new Class(this, name, x, y);
    this.classes.push(class);
    return class;
}

ClassDiagram.prototype.draw = function(paper) {
    this.router(paper, this);
    for (var i = 0; i < this.classes.length; i++) {
        this.classes[i].draw(paper);
    }

}

ClassDiagram.prototype.findClass = function (name) {
    for (var i = 0; i < this.classes.length; i++) {
        if (this.classes[i].name == name) {
            return this.classes[i];
        }
    }
    throw 'Class not found: ' + name;
}



/* Parses and returns a class diagram, using our class diagram DSL.
 * If there's a syntax error, throws an object with the attributes
 * 'message' containing the error message and 'offset' containing
 * the character offset at which the error occurred.
 *
 * s - String representing the class diagram to parse, in our class
 *     diagram DSL.
 */
ClassDiagram.parse = function (s) {

    var err_off = [];
    var err_la = [];

    parsedClassDiagram = RaphUML.classDiagram();

    var err_cnt = __ClassDiagram_parse(s, err_off, err_la);

    if (err_cnt > 0) {
        throw { offset: err_off[0], message: 'Expected one of: ' + err_la[0] };
    } else {
        return parsedClassDiagram;
    }
}




/* Association
 *
 * Instances of this class represent associations between two
 * classes. Associations do not draw themselves; instead, the class
 * diagram is fitted with a router function that draws all the
 * associations on the diagram with a particular algorithm.
 */
var Association = function() {
    this.name = ''; // else we see the function from the prototype
}

Association.prototype.name = function (name) {
    this.name = name;
    return this;
}

/*
 * type is one of 'extends', 'has', 'implements', 'owns', 'nav-to', 'to', 'uses'
 */
Association.prototype.to = function (class, cardinality, type) {
    this.toClass = class;
    this.toCardinality = cardinality;
    this.type = type;
    return this;
}



/* Class
 *
 * Instances of this class represent classes in the subject domain.
 * Each instance draws itself via the draw method.
 */
var Class = function(classDiagram, name, x, y) {
    this.classDiagram = classDiagram;
    this.name = name;
    this.x = x || 0;
    this.y = y || 0;
    this.width = classDiagram.defaultWidth;
    this.height = classDiagram.headingFontSize + 2 * classDiagram.headingVPad;

    this.attributes = [];
    this.operations = [];
}

Class.prototype.attribute = function (attributeString) {

    this.attributes.push(new Attribute(this, attributeString));

    if (this.attributes.length == 1) {
        this.height += this.classDiagram.bodyVPad;
    }

    this.height += this.classDiagram.bodyFontSize + this.classDiagram.bodyVPad;

    return this;
}

Class.prototype.cx = function() {
    return this.x + this.width / 2;
}

Class.prototype.cy = function() {
    return this.y + this.height / 2;
}

Class.prototype.draw = function(paper) {

    paper.rect(this.x, this.y, this.width, this.height).attr({ fill: 'white' });

    var text = paper.text(0, 0, this.name).attr({
        'font-weight': 'bold',
        'font-size': this.classDiagram.headingFontSize,
        x: this.x + this.width/2,
        y: this.y + this.classDiagram.headingVPad + this.classDiagram.headingFontSize/2
    });

    var x = this.x + this.classDiagram.bodyHPad;
    var y = this.y + this.classDiagram.headingFontSize + 2 * this.classDiagram.headingVPad;

    if (this.attributes.length > 0) {

        paper.path('M' + this.x + ' ' + y + 'L' + (this.x + this.width) + ' ' + y);

        y += this.classDiagram.bodyVPad;
        for (var i = 0; i < this.attributes.length; i++) {
            var text = paper.text(0, 0, this.attributes[i].attributeString).anchor(1, x, y, 0, 0);
            y += this.classDiagram.bodyFontSize + this.classDiagram.bodyVPad;
        }
    }

    if (this.operations.length > 0) {

        paper.path('M' + this.x + ' ' + y + 'L' + (this.x + this.width) + ' ' + y);

        y += this.classDiagram.bodyVPad;
        for (var i = 0; i < this.operations.length; i++) {
            var text = paper.text(0, 0, this.operations[i].operationString).anchor(1, x, y, 0, 0);
            y += this.classDiagram.bodyFontSize + this.classDiagram.bodyVPad;
        }
    }

}

Class.prototype.operation = function (operationString) {

    this.operations.push(new Operation(this, operationString));

    if (this.operations.length == 1) {
        this.height += this.classDiagram.bodyVPad;
    }

    this.height += this.classDiagram.bodyFontSize + this.classDiagram.bodyVPad;

    return this;
}


var Attribute = function(class, attributeString) {
    this.class = class;
    this.attributeString = attributeString;
}

var Operation = function(class, operationString) {
    this.class = class;
    this.operationString = operationString;
}



/* seg_intersect
 *
 * Find the intersection between two line segments.
 *
 * Each arg is a line segment, represented as an array of four numbers:
 * [ x1, y1, x2, y2 ].
 *
 * If the lines intersect, returns a two-element array representing the
 * intersection point. If not, returns null.
 *
 * Algorithm from http://www.topcoder.com/tc?module=Static&d1=tutorials&d2=geometry2
 *
 */
var seg_intersect = function(seg1, seg2) {

  console.log("Testing " + seg1 + " to " + seg2);

  var a1 = seg1[3] - seg1[1];
  var b1 = seg1[0] - seg1[2];
  var c1 = a1 * seg1[0] + b1 * seg1[1];

  var a2 = seg2[3] - seg2[1];
  var b2 = seg2[0] - seg2[2];
  var c2 = a2 * seg2[0] + b2 * seg2[1];

  var det = a1 * b2 - a2 * b1;

  console.log("det is " + det);
  if (det == 0) {
    console.log("Lines are parallel");
    return null;
  } else {
    var x = (b2 * c1 - b1 * c2) / det;
    var y = (a1 * c2 - a2 * c1) / det;
    var point = [ x, y ];
    console.log("Lines meet at " + point[0] + ", " + point[1]);
    if (seg_contains(seg1, point) && seg_contains(seg2, point)) {
        console.log("...and it's inside the segment");
        return point;
    } else {
        console.log("...but it's outside the segment");
        return null;
    }

  }

};

/* seg_contains
 *
 * Returns true if the given segment contains the given point.
 *
 * seg - Line segment represented by an array of four numbers: [ x1, y1, x2, y2 ]
 * point - Point to be tested: [ x, y ]
 *
 */
var seg_contains = function(seg, point) {
  return Math.min(seg[0], seg[2]) <= point[0]
  && point[0] <= Math.max(seg[0], seg[2])
  && Math.min(seg[1], seg[3]) <= point[1]
  && point[1] <= Math.max(seg[1], seg[3]);
}

seg_intersect([ 0, 0, 4, 4 ], [ 2, 1, 3, 2 ]);
seg_intersect([ 0, 0, 4, 4 ], [ 2, 1, 1, 2 ]);
seg_intersect([ 0, 0, 4, 4 ], [ 2, 1, 3, 2.1 ]);


    return {

        classDiagram: function () {
            return new ClassDiagram();
        },

        parseClassDiagram: function (s) {
            return ClassDiagram.parse(s);
        }

    };

}();


/* anchor (Raphael element plug-in)
 *
 * Positions the object relative to a given anchor point. There are nine
 * anchor points, as follows:
 *
 *   1   2   3
 *   4   5   6
 *   7   8   9
 *
 * For example, for anchor point 1, the top-left corner of the element
 * is positioned at the given anchor point coordinates.
 *
 * anchor - which anchor point to use
 * x - x-coordinate of the anchor point
 * y - y-coordinate of the anchor point
 * xPad - amount of x padding, optional, defaults to 3
 * yPad - amount of y padding, optional, defaults to the same value as the x padding
 */
Raphael.el.anchor = function (anchor, x, y, xPad, yPad) {

    if (xPad == null) { xPad = 3; }
    if (yPad == null) { yPad = xPad; }

    var box = this.getBBox();

    switch (anchor) {
        case 1:
            var cx = x + xPad + box.width / 2;
            var cy = y + yPad + box.height / 2;
            break;
        case 2:
            var cx = x;
            var cy = y + yPad + box.height / 2;
            break;
        case 3:
            var cx = x - xPad - box.width / 2;
            var cy = y + yPad + box.height / 2;
            break;
        case 4:
            var cx = x + xPad + box.width / 2;
            var cy = y;
            break;
        case 5:
            var cx = x;
            var cy = y;
            break;
        case 6:
            var cx = x - xPad - box.width / 2;
            var cy = y;
            break;
        case 7:
            var cx = x + xPad + box.width / 2;
            var cy = y - yPad - box.height / 2;
            break;
        case 8:
            var cx = x;
            var cy = y - yPad - box.height / 2;
            break;
        case 9:
            var cx = x - xPad - box.width / 2;
            var cy = y - yPad - box.height / 2;
            break;
    }

    this.attr({ x: cx, y: cy });
};


/* arrow (Raphael canvas plug-in)
 *
 * Creates an arrow object.
 *
 * x, y - Tip of the arrow.
 * x2, y2 - Other end of the line segment on which the arrow is drawn.
 *          This establishes the angle of the arrow.
 * length - Length of the arrow.
 * width - Width of the arrow.
 * closed - If true, the arrow is rendered as a closed path.
 */
Raphael.fn.arrow = function (x, y, x2, y2, length, width, closed) {

    var a = length;
    var b = width/2;

    var pathString = 'M' + x + ' ' + y + 'm' + a + ' ' + b + 'L' + x + ' ' + y + 'l' + a + ' ' + (-b);

    if (closed) {
        pathString += ' z';
    }

    var path = this.path(pathString);

    var angle = Math.atan2(y2 - y, x2 - x) * 180 / Math.PI;

    if (angle < 0) {
        angle += 360;
    }

    path.rotate(angle, x, y);

    return path;
}

/* diamond (Raphael canvas plug-in)
 *
 * Creates a diamond object positioned at the end of a line segment.
 *
 * x, y - Tip of the line segment where the arrow is to be drawn.
 * x2, y2 - Other end of the line segment on which the diamond is drawn.
 * length - Length of the diamond.
 * width - Width of the diamond.
 */
Raphael.fn.diamond = function (x, y, x2, y2, length, width) {

    var a = length/2;
    var b = width/2;

    var pathString = 'M' + x + ' ' + y + 'l' + a + ' ' + b + 'l' + a + ' ' + (-b) + 'l' + (-a) + ' ' + (-b) + 'z';

    var path = this.path(pathString);

    var angle = Math.atan2(y2 - y, x2 - x) * 180 / Math.PI;

    if (angle < 0) {
        angle += 360;
    }

    path.rotate(angle, x, y);

    return path;
}


if (jQuery) {
    (function ($) {

        /* Replaces an element containing a textual class diagram
         * with a graphical one.
         */
        jQuery.fn.classDiagram = function () {

            return this.each(function () {

                var script = $(this);
                var offset = script.offset();

                var diagram = $('<div></div>')
                    .css('position', 'absolute')
                    .css('left', offset.left)
                    .css('top', offset.top)
                    .css('width', script.innerWidth())
                    .css('height', script.innerHeight());

                script.after(diagram);

                var paper = Raphael(diagram.get(0), script.innerWidth(), script.innerHeight());

                try {
                    var diagram = RaphUML.parseClassDiagram(script.text());
                    diagram.draw(paper);
                    script.css('visibility', 'hidden');
                } catch (e) {
                    if (e.offset) {
                        diagram.text('Error at offset ' + e.offset + ': ' + e.message);
                    } else {
                        diagram.text(e);
                    }
                }


            });

        }

    })(jQuery);
}

