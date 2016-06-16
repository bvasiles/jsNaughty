/*
 DESCRIPTION: These functions let you easily and quickly view the data
 structure of javascript objects and variables

 COMPATABILITY: Will work in any javascript-enabled browser

 USAGE:

 // Return the output as a string, and you can do with it whatever you want
 var out = Dumper(obj);

 // When starting to traverse through the object, only follow certain top-
 // level properties. Ignore the others
 var out = Dumper(obj,'value','text');

 // Sometimes the object you are dumping has a huge number of properties, like
 // form fields. If you are only interested in certain properties of certain
 // types of tags, you can restrict that like Below. Then if DataDumper finds
 // an object that is a tag of type "OPTION" it will only examine the properties
 // of that object that are specified.
 DumperTagProperties["OPTION"] = [ 'text','value','defaultSelected' ]

 // View the structure of an object in a window alert
 DumperAlert(obj);

 // Popup a new window and write the Dumper output to that window
 DumperPopup(obj);

 // Write the Dumper output to a document using document.write()
 DumperWrite(obj);
 // Optionall, give it a different document to write to
 DumperWrite(obj,documentObject);

 NOTES: Be Careful! Some objects hold references to their parent nodes, other
 objects, etc. Data Dumper will keep traversing these nodes as well, until you
 have a really, really huge tree built up. If the object you are passing in has
 references to other document objects, you should either:
 1) Set the maximum depth that Data Dumper will search (set DumperMaxDepth)
 or
 2) Pass in only certain object properties to traverse
 or
 3) Set the object properties to traverse for each type of tag

 */
var DumperIndent = 1;
var DumperIndentText = "    ";
var DumperNewline = "\n";
var DumperObject = null; // Keeps track of the root object passed in
var DumperMaxDepth = -1; // Max depth that Dumper will traverse in object
var DumperIgnoreStandardObjects = true; // Ignore top-level objects like window, document
var DumperProperties = null; // Holds properties of top-level object to traverse - others are igonred
var DumperTagProperties = new Object(); // Holds properties to traverse for certain HTML tags

function DumperPad(len) {
	var ret = "";
	for (var i=0; i<len; i++) {
		ret += DumperIndentText;
	}
	return ret;
}
function Dumper(o) {
	var level = 1;
	var indentLevel = DumperIndent;
	var ret = "";
	if (arguments.length>1 && typeof(arguments[1])=="number") {
		level = arguments[1];
		indentLevel = arguments[1];
		if (o == DumperObject) {
			return "[original object]";
		}
	}
	else {
		DumperObject = o;
		// If a list of properties are passed in
		if (arguments.length>1) {
			var list = arguments;
			var listIndex = 1;
			if (typeof(arguments[1])=="object") {
				list = arguments[1];
				listIndex = 0;
			}
			for (var i=listIndex; i<list.length; i++) {
				if (DumperProperties == null) { DumperProperties = new Object(); }
				DumperProperties[list[i]]=1;
			}
		}
	}
	if (DumperMaxDepth != -1 && level > DumperMaxDepth) {
		return "...";
	}
	if (DumperIgnoreStandardObjects) {
		if (o==window || o==window.document) {
			return "[Ignored Object]";
		}
	}
	if (o==null) {
		ret = "[null]";
		return ret;
	}
	switch (typeof(o)) {
		case "boolean": return (o)?"true":"false";
		case "string": return '"' + o + '"';
		case "number": return o;
		case "object":
			if (typeof(o.length)=="number" ) {
				// ARRAY OBJECT
				for (var i=0; i<o.length;i++) {
					if (i>0) {
						ret += "," + DumperNewline + DumperPad(indentLevel);
					}
					else {
						ret += DumperNewline + DumperPad(indentLevel);
					}
					ret += Dumper(o[i],level+1);
				}
				if (i > 0) {
					ret += DumperNewline + DumperPad(indentLevel-DumperIndent);
				}
				return "[" + ret + "]";
			}
			else {
				// OBJECT OBJECT
				var count = 0;
				for (i in o) {
					if (o==DumperObject && DumperProperties!=null && DumperProperties[i]!=1) {
						// do nothing with this node
					}
					else {
						if (typeof(o[i]) != "unknown") {
							var processAttribute = true;
							// Check if this is a tag object, and if so, if we have to limit properties to look at
							if (typeof(o.tagName)!="undefined") {
								if (typeof(DumperTagProperties[o.tagName])!="undefined") {
									processAttribute = false;
									for (var p=0; p<DumperTagProperties[o.tagName].length; p++) {
										if (DumperTagProperties[o.tagName][p]==i) {
											processAttribute = true;
											break;
										}
									}
								}
							}
							if (processAttribute) {
								if (count++>0) {
									ret += "," + DumperNewline + DumperPad(indentLevel);
								}
								else {
									ret += DumperNewline + DumperPad(indentLevel);
								}
								ret += '"' + i + '":' + Dumper(o[i],level+1);
							}
						}
					}
				}
				if (count > 0) {
					ret += DumperNewline + DumperPad(indentLevel-DumperIndent);
				}
				return "{" + ret + "}";
			}
	}
}
