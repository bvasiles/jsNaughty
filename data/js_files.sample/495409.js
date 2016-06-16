/***
|''Name:''|ForEachTiddlerPlugin|
|''Version:''|1.0.6 (2006-09-16)|
|''Source:''|http://tiddlywiki.abego-software.de/#ForEachTiddlerPlugin|
|''Author:''|UdoBorkowski (ub [at] abego-software [dot] de)|
|''Licence:''|[[BSD open source license (abego Software)|http://www.abego-software.de/legal/apl-v10.html]]|
|''Copyright:''|&copy; 2005-2006 [[abego Software|http://www.abego-software.de]]|
|''TiddlyWiki:''|1.2.38+, 2.0|
|''Browser:''|Firefox 1.0.4+; Firefox 1.5; InternetExplorer 6.0|
!Description

Create customizable lists, tables etc. for your selections of tiddlers. Specify the tiddlers to include and their order through a powerful language.

''Syntax:'' 
|>|{{{<<}}}''forEachTiddler'' [''in'' //tiddlyWikiPath//] [''where'' //whereCondition//] [''sortBy'' //sortExpression// [''ascending'' //or// ''descending'']] [''script'' //scriptText//] [//action// [//actionParameters//]]{{{>>}}}|
|//tiddlyWikiPath//|The filepath to the TiddlyWiki the macro should work on. When missing the current TiddlyWiki is used.|
|//whereCondition//|(quoted) JavaScript boolean expression. May refer to the build-in variables {{{tiddler}}} and  {{{context}}}.|
|//sortExpression//|(quoted) JavaScript expression returning "comparable" objects (using '{{{<}}}','{{{>}}}','{{{==}}}'. May refer to the build-in variables {{{tiddler}}} and  {{{context}}}.|
|//scriptText//|(quoted) JavaScript text. Typically defines JavaScript functions that are called by the various JavaScript expressions (whereClause, sortClause, action arguments,...)|
|//action//|The action that should be performed on every selected tiddler, in the given order. By default the actions [[addToList|AddToListAction]] and [[write|WriteAction]] are supported. When no action is specified [[addToList|AddToListAction]]  is used.|
|//actionParameters//|(action specific) parameters the action may refer while processing the tiddlers (see action descriptions for details). <<tiddler [[JavaScript in actionParameters]]>>|
|>|~~Syntax formatting: Keywords in ''bold'', optional parts in [...]. 'or' means that exactly one of the two alternatives must exist.~~|

See details see [[ForEachTiddlerMacro]] and [[ForEachTiddlerExamples]].

!Revision history
* v1.0.6 (2006-09-16)
** Context provides "viewerTiddler", i.e. the tiddler used to view the macro. Most times this is equal to the "inTiddler", but when using the "tiddler" macro both may be different.
** Support "begin", "end" and "none" expressions in "write" action
* v1.0.5 (2006-02-05)
** Pass tiddler containing the macro with wikify, context object also holds reference to tiddler containing the macro ("inTiddler"). Thanks to SimonBaird.
** Support Firefox 1.5.0.1
** Internal
*** Make "JSLint" conform
*** "Only install once"
* v1.0.4 (2006-01-06)
** Support TiddlyWiki 2.0
* v1.0.3 (2005-12-22)
** Features: 
*** Write output to a file supports multi-byte environments (Thanks to Bram Chen) 
*** Provide API to access the forEachTiddler functionality directly through JavaScript (see getTiddlers and performMacro)
** Enhancements:
*** Improved error messages on InternetExplorer.
* v1.0.2 (2005-12-10)
** Features: 
*** context object also holds reference to store (TiddlyWiki)
** Fixed Bugs: 
*** ForEachTiddler 1.0.1 has broken support on win32 Opera 8.51 (Thanks to BrunoSabin for reporting)
* v1.0.1 (2005-12-08)
** Features: 
*** Access tiddlers stored in separated TiddlyWikis through the "in" option. I.e. you are no longer limited to only work on the "current TiddlyWiki".
*** Write output to an external file using the "toFile" option of the "write" action. With this option you may write your customized tiddler exports.
*** Use the "script" section to define "helper" JavaScript functions etc. to be used in the various JavaScript expressions (whereClause, sortClause, action arguments,...).
*** Access and store context information for the current forEachTiddler invocation (through the build-in "context" object) .
*** Improved script evaluation (for where/sort clause and write scripts).
* v1.0.0 (2005-11-20)
** initial version

!Code
***/
//{{{

	
//============================================================================
//============================================================================
//		   ForEachTiddlerPlugin
//============================================================================
//============================================================================

// Only install once
if (!version.extensions.ForEachTiddlerPlugin) {

if (!window.abego) window.abego = {};

version.extensions.ForEachTiddlerPlugin = {
	major: 1, minor: 0, revision: 6, 
	date: new Date(2006,8,16), 
	source: "http://tiddlywiki.abego-software.de/#ForEachTiddlerPlugin",
	licence: "[[BSD open source license (abego Software)|http://www.abego-software.de/legal/apl-v10.html]]",
	copyright: "Copyright (c) abego Software GmbH, 2005-2006 (www.abego-software.de)"
};

// For backward compatibility with TW 1.2.x
//
if (!TiddlyWiki.prototype.forEachTiddler) {
	TiddlyWiki.prototype.forEachTiddler = function(callback) {
		for(var t in this.tiddlers) {
			callback.call(this,t,this.tiddlers[t]);
		}
	};
}

//============================================================================
// forEachTiddler Macro
//============================================================================

version.extensions.forEachTiddler = {
	major: 1, minor: 0, revision: 5, date: new Date(2006,2,5), provider: "http://tiddlywiki.abego-software.de"};

// ---------------------------------------------------------------------------
// Configurations and constants 
// ---------------------------------------------------------------------------

config.macros.forEachTiddler = {
	 // Standard Properties
	 label: "forEachTiddler",
	 prompt: "Perform actions on a (sorted) selection of tiddlers",

	 // actions
	 actions: {
		 addToList: {},
		 write: {}
	 }
};

// ---------------------------------------------------------------------------
//  The forEachTiddler Macro Handler 
// ---------------------------------------------------------------------------

config.macros.forEachTiddler.getContainingTiddler = function(e) {
	while(e && !hasClass(e,"tiddler"))
		e = e.parentNode;
	var title = e ? e.getAttribute("tiddler") : null; 
	return title ? store.getTiddler(title) : null;
};

config.macros.forEachTiddler.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	// config.macros.forEachTiddler.traceMacroCall(place,macroName,params,wikifier,paramString,tiddler);

	if (!tiddler) tiddler = config.macros.forEachTiddler.getContainingTiddler(place);
	// --- Parsing ------------------------------------------

	var i = 0; // index running over the params
	// Parse the "in" clause
	var tiddlyWikiPath = undefined;
	if ((i < params.length) && params[i] == "in") {
		i++;
		if (i >= params.length) {
			this.handleError(place, "TiddlyWiki path expected behind 'in'.");
			return;
		}
		tiddlyWikiPath = this.paramEncode((i < params.length) ? params[i] : "");
		i++;
	}

	// Parse the where clause
	var whereClause ="true";
	if ((i < params.length) && params[i] == "where") {
		i++;
		whereClause = this.paramEncode((i < params.length) ? params[i] : "");
		i++;
	}

	// Parse the sort stuff
	var sortClause = null;
	var sortAscending = true; 
	if ((i < params.length) && params[i] == "sortBy") {
		i++;
		if (i >= params.length) {
			this.handleError(place, "sortClause missing behind 'sortBy'.");
			return;
		}
		sortClause = this.paramEncode(params[i]);
		i++;

		if ((i < params.length) && (params[i] == "ascending" || params[i] == "descending")) {
			 sortAscending = params[i] == "ascending";
			 i++;
		}
	}

	// Parse the script
	var scriptText = null;
	if ((i < params.length) && params[i] == "script") {
		i++;
		scriptText = this.paramEncode((i < params.length) ? params[i] : "");
		i++;
	}

	// Parse the action. 
	// When we are already at the end use the default action
	var actionName = "addToList";
	if (i < params.length) {
	   if (!config.macros.forEachTiddler.actions[params[i]]) {
			this.handleError(place, "Unknown action '"+params[i]+"'.");
			return;
		} else {
			actionName = params[i]; 
			i++;
		}
	} 
	
	// Get the action parameter
	// (the parsing is done inside the individual action implementation.)
	var actionParameter = params.slice(i);


	// --- Processing ------------------------------------------
	try {
		this.performMacro({
				place: place, 
				inTiddler: tiddler,
				whereClause: whereClause, 
				sortClause: sortClause, 
				sortAscending: sortAscending, 
				actionName: actionName, 
				actionParameter: actionParameter, 
				scriptText: scriptText, 
				tiddlyWikiPath: tiddlyWikiPath});

	} catch (e) {
		this.handleError(place, e);
	}
};

// Returns an object with properties "tiddlers" and "context".
// tiddlers holds the (sorted) tiddlers selected by the parameter,
// context the context of the execution of the macro.
//
// The action is not yet performed.
//
// @parameter see performMacro
//
config.macros.forEachTiddler.getTiddlersAndContext = function(parameter) {

	var context = config.macros.forEachTiddler.createContext(parameter.place, parameter.whereClause, parameter.sortClause, parameter.sortAscending, parameter.actionName, parameter.actionParameter, parameter.scriptText, parameter.tiddlyWikiPath, parameter.inTiddler);

	var tiddlyWiki = parameter.tiddlyWikiPath ? this.loadTiddlyWiki(parameter.tiddlyWikiPath) : store;
	context["tiddlyWiki"] = tiddlyWiki;
	
	// Get the tiddlers, as defined by the whereClause
	var tiddlers = this.findTiddlers(parameter.whereClause, context, tiddlyWiki);
	context["tiddlers"] = tiddlers;

	// Sort the tiddlers, when sorting is required.
	if (parameter.sortClause) {
		this.sortTiddlers(tiddlers, parameter.sortClause, parameter.sortAscending, context);
	}

	return {tiddlers: tiddlers, context: context};
};

// Returns the (sorted) tiddlers selected by the parameter.
//
// The action is not yet performed.
//
// @parameter see performMacro
//
config.macros.forEachTiddler.getTiddlers = function(parameter) {
	return this.getTiddlersAndContext(parameter).tiddlers;
};

// Performs the macros with the given parameter.
//
// @param parameter holds the parameter of the macro as separate properties.
//				  The following properties are supported:
//
//						place
//						whereClause
//						sortClause
//						sortAscending
//						actionName
//						actionParameter
//						scriptText
//						tiddlyWikiPath
//
//					All properties are optional. 
//					For most actions the place property must be defined.
//
config.macros.forEachTiddler.performMacro = function(parameter) {
	var tiddlersAndContext = this.getTiddlersAndContext(parameter);

	// Perform the action
	var actionName = parameter.actionName ? parameter.actionName : "addToList";
	var action = config.macros.forEachTiddler.actions[actionName];
	if (!action) {
		this.handleError(parameter.place, "Unknown action '"+actionName+"'.");
		return;
	}

	var actionHandler = action.handler;
	actionHandler(parameter.place, tiddlersAndContext.tiddlers, parameter.actionParameter, tiddlersAndContext.context);
};

// ---------------------------------------------------------------------------
//  The actions 
// ---------------------------------------------------------------------------

// Internal.
//
// --- The addToList Action -----------------------------------------------
//
config.macros.forEachTiddler.actions.addToList.handler = function(place, tiddlers, parameter, context) {
	// Parse the parameter
	var p = 0;

	// Check for extra parameters
	if (parameter.length > p) {
		config.macros.forEachTiddler.createExtraParameterErrorElement(place, "addToList", parameter, p);
		return;
	}

	// Perform the action.
	var list = document.createElement("ul");
	place.appendChild(list);
	for (var i = 0; i < tiddlers.length; i++) {
		var tiddler = tiddlers[i];
		var listItem = document.createElement("li");
		list.appendChild(listItem);
		createTiddlyLink(listItem, tiddler.title, true);
	}
};

abego.parseNamedParameter = function(name, parameter, i) {
	var beginExpression = null;
	if ((i < parameter.length) && parameter[i] == name) {
		i++;
		if (i >= parameter.length) {
			throw "Missing text behind '%0'".format([name]);
		}
		
		return config.macros.forEachTiddler.paramEncode(parameter[i]);
	}
	return null;
}

// Internal.
//
// --- The write Action ---------------------------------------------------
//
config.macros.forEachTiddler.actions.write.handler = function(place, tiddlers, parameter, context) {
	// Parse the parameter
	var p = 0;
	if (p >= parameter.length) {
		this.handleError(place, "Missing expression behind 'write'.");
		return;
	}

	var textExpression = config.macros.forEachTiddler.paramEncode(parameter[p]);
	p++;

	// Parse the "begin" option
	var beginExpression = abego.parseNamedParameter("begin", parameter, p);
	if (beginExpression !== null) 
		p += 2;
	var endExpression = abego.parseNamedParameter("end", parameter, p);
	if (endExpression !== null) 
		p += 2;
	var noneExpression = abego.parseNamedParameter("none", parameter, p);
	if (noneExpression !== null) 
		p += 2;

	// Parse the "toFile" option
	var filename = null;
	var lineSeparator = undefined;
	if ((p < parameter.length) && parameter[p] == "toFile") {
		p++;
		if (p >= parameter.length) {
			this.handleError(place, "Filename expected behind 'toFile' of 'write' action.");
			return;
		}
		
		filename = config.macros.forEachTiddler.getLocalPath(config.macros.forEachTiddler.paramEncode(parameter[p]));
		p++;
		if ((p < parameter.length) && parameter[p] == "withLineSeparator") {
			p++;
			if (p >= parameter.length) {
				this.handleError(place, "Line separator text expected behind 'withLineSeparator' of 'write' action.");
				return;
			}
			lineSeparator = config.macros.forEachTiddler.paramEncode(parameter[p]);
			p++;
		}
	}
	
	// Check for extra parameters
	if (parameter.length > p) {
		config.macros.forEachTiddler.createExtraParameterErrorElement(place, "write", parameter, p);
		return;
	}

	// Perform the action.
	var func = config.macros.forEachTiddler.getEvalTiddlerFunction(textExpression, context);
	var count = tiddlers.length;
	var text = "";
	if (count > 0 && beginExpression)
		text += config.macros.forEachTiddler.getEvalTiddlerFunction(beginExpression, context)(undefined, context, count, undefined);
	
	for (var i = 0; i < count; i++) {
		var tiddler = tiddlers[i];
		text += func(tiddler, context, count, i);
	}
	
	if (count > 0 && endExpression)
		text += config.macros.forEachTiddler.getEvalTiddlerFunction(endExpression, context)(undefined, context, count, undefined);

	if (count == 0 && noneExpression) 
		text += config.macros.forEachTiddler.getEvalTiddlerFunction(noneExpression, context)(undefined, context, count, undefined);
		

	if (filename) {
		if (lineSeparator !== undefined) {
			lineSeparator = lineSeparator.replace(/\\n/mg, "\n").replace(/\\r/mg, "\r");
			text = text.replace(/\n/mg,lineSeparator);
		}
		saveFile(filename, convertUnicodeToUTF8(text));
	} else {
		var wrapper = createTiddlyElement(place, "span");
		wikify(text, wrapper, null/* highlightRegExp */, context.inTiddler);
	}
};


// ---------------------------------------------------------------------------
//  Helpers
// ---------------------------------------------------------------------------

// Internal.
//
config.macros.forEachTiddler.createContext = function(placeParam, whereClauseParam, sortClauseParam, sortAscendingParam, actionNameParam, actionParameterParam, scriptText, tiddlyWikiPathParam, inTiddlerParam) {
	return {
		place : placeParam, 
		whereClause : whereClauseParam, 
		sortClause : sortClauseParam, 
		sortAscending : sortAscendingParam, 
		script : scriptText,
		actionName : actionNameParam, 
		actionParameter : actionParameterParam,
		tiddlyWikiPath : tiddlyWikiPathParam,
		inTiddler : inTiddlerParam, // the tiddler containing the <<forEachTiddler ...>> macro call.
		viewerTiddler : config.macros.forEachTiddler.getContainingTiddler(placeParam) // the tiddler showing the forEachTiddler result
	};
};

// Internal.
//
// Returns a TiddlyWiki with the tiddlers loaded from the TiddlyWiki of 
// the given path.
//
config.macros.forEachTiddler.loadTiddlyWiki = function(path, idPrefix) {
	if (!idPrefix) {
		idPrefix = "store";
	}
	var lenPrefix = idPrefix.length;
	
	// Read the content of the given file
	var content = loadFile(this.getLocalPath(path));
	if(content === null) {
		throw "TiddlyWiki '"+path+"' not found.";
	}
	
	// Locate the storeArea div's
	var posOpeningDiv = content.indexOf(startSaveArea);
	var posClosingDiv = content.lastIndexOf(endSaveArea);
	if((posOpeningDiv == -1) || (posClosingDiv == -1)) {
		throw "File '"+path+"' is not a TiddlyWiki.";
	}
	var storageText = content.substr(posOpeningDiv + startSaveArea.length, posClosingDiv);
	
	// Create a "div" element that contains the storage text
	var myStorageDiv = document.createElement("div");
	myStorageDiv.innerHTML = storageText;
	myStorageDiv.normalize();
	
	// Create all tiddlers in a new TiddlyWiki
	// (following code is modified copy of TiddlyWiki.prototype.loadFromDiv)
	var tiddlyWiki = new TiddlyWiki();
	var store = myStorageDiv.childNodes;
	for(var t = 0; t < store.length; t++) {
		var e = store[t];
		var title = null;
		if(e.getAttribute)
			title = e.getAttribute("tiddler");
		if(!title && e.id && e.id.substr(0,lenPrefix) == idPrefix)
			title = e.id.substr(lenPrefix);
		if(title && title !== "") {
			var tiddler = tiddlyWiki.createTiddler(title);
			tiddler.loadFromDiv(e,title);
		}
	}
	tiddlyWiki.dirty = false;

	return tiddlyWiki;
};


	
// Internal.
//
// Returns a function that has a function body returning the given javaScriptExpression.
// The function has the parameters:
// 
//	 (tiddler, context, count, index)
//
config.macros.forEachTiddler.getEvalTiddlerFunction = function (javaScriptExpression, context) {
	var script = context["script"];
	var functionText = "var theFunction = function(tiddler, context, count, index) { return "+javaScriptExpression+"}";
	var fullText = (script ? script+";" : "")+functionText+";theFunction;";
	return eval(fullText);
};

// Internal.
//
config.macros.forEachTiddler.findTiddlers = function(whereClause, context, tiddlyWiki) {
	var result = [];
	var func = config.macros.forEachTiddler.getEvalTiddlerFunction(whereClause, context);
	tiddlyWiki.forEachTiddler(function(title,tiddler) {
		if (func(tiddler, context, undefined, undefined)) {
			result.push(tiddler);
		}
	});
	return result;
};

// Internal.
//
config.macros.forEachTiddler.createExtraParameterErrorElement = function(place, actionName, parameter, firstUnusedIndex) {
	var message = "Extra parameter behind '"+actionName+"':";
	for (var i = firstUnusedIndex; i < parameter.length; i++) {
		message += " "+parameter[i];
	}
	this.handleError(place, message);
};

// Internal.
//
config.macros.forEachTiddler.sortAscending = function(tiddlerA, tiddlerB) {
	var result = 
		(tiddlerA.forEachTiddlerSortValue == tiddlerB.forEachTiddlerSortValue) 
			? 0
			: (tiddlerA.forEachTiddlerSortValue < tiddlerB.forEachTiddlerSortValue)
			   ? -1 
			   : +1; 
	return result;
};

// Internal.
//
config.macros.forEachTiddler.sortDescending = function(tiddlerA, tiddlerB) {
	var result = 
		(tiddlerA.forEachTiddlerSortValue == tiddlerB.forEachTiddlerSortValue) 
			? 0
			: (tiddlerA.forEachTiddlerSortValue < tiddlerB.forEachTiddlerSortValue)
			   ? +1 
			   : -1; 
	return result;
};

// Internal.
//
config.macros.forEachTiddler.sortTiddlers = function(tiddlers, sortClause, ascending, context) {
	// To avoid evaluating the sortClause whenever two items are compared 
	// we pre-calculate the sortValue for every item in the array and store it in a 
	// temporary property ("forEachTiddlerSortValue") of the tiddlers.
	var func = config.macros.forEachTiddler.getEvalTiddlerFunction(sortClause, context);
	var count = tiddlers.length;
	var i;
	for (i = 0; i < count; i++) {
		var tiddler = tiddlers[i];
		tiddler.forEachTiddlerSortValue = func(tiddler,context, undefined, undefined);
	}

	// Do the sorting
	tiddlers.sort(ascending ? this.sortAscending : this.sortDescending);

	// Delete the temporary property that holds the sortValue.	
	for (i = 0; i < tiddlers.length; i++) {
		delete tiddlers[i].forEachTiddlerSortValue;
	}
};


// Internal.
//
config.macros.forEachTiddler.trace = function(message) {
	displayMessage(message);
};

// Internal.
//
config.macros.forEachTiddler.traceMacroCall = function(place,macroName,params) {
	var message ="<<"+macroName;
	for (var i = 0; i < params.length; i++) {
		message += " "+params[i];
	}
	message += ">>";
	displayMessage(message);
};


// Internal.
//
// Creates an element that holds an error message
// 
config.macros.forEachTiddler.createErrorElement = function(place, exception) {
	var message = (exception.description) ? exception.description : exception.toString();
	return createTiddlyElement(place,"span",null,"forEachTiddlerError","<<forEachTiddler ...>>: "+message);
};

// Internal.
//
// @param place [may be null]
//
config.macros.forEachTiddler.handleError = function(place, exception) {
	if (place) {
		this.createErrorElement(place, exception);
	} else {
		throw exception;
	}
};

// Internal.
//
// Encodes the given string.
//
// Replaces 
//	 "$))" to ">>"
//	 "$)" to ">"
//
config.macros.forEachTiddler.paramEncode = function(s) {
	var reGTGT = new RegExp("\\$\\)\\)","mg");
	var reGT = new RegExp("\\$\\)","mg");
	return s.replace(reGTGT, ">>").replace(reGT, ">");
};

// Internal.
//
// Returns the given original path (that is a file path, starting with "file:")
// as a path to a local file, in the systems native file format.
//
// Location information in the originalPath (i.e. the "#" and stuff following)
// is stripped.
// 
config.macros.forEachTiddler.getLocalPath = function(originalPath) {
	// Remove any location part of the URL
	var hashPos = originalPath.indexOf("#");
	if(hashPos != -1)
		originalPath = originalPath.substr(0,hashPos);
	// Convert to a native file format assuming
	// "file:///x:/path/path/path..." - pc local file --> "x:\path\path\path..."
	// "file://///server/share/path/path/path..." - FireFox pc network file --> "\\server\share\path\path\path..."
	// "file:///path/path/path..." - mac/unix local file --> "/path/path/path..."
	// "file://server/share/path/path/path..." - pc network file --> "\\server\share\path\path\path..."
	var localPath;
	if(originalPath.charAt(9) == ":") // pc local file
		localPath = unescape(originalPath.substr(8)).replace(new RegExp("/","g"),"\\");
	else if(originalPath.indexOf("file://///") === 0) // FireFox pc network file
		localPath = "\\\\" + unescape(originalPath.substr(10)).replace(new RegExp("/","g"),"\\");
	else if(originalPath.indexOf("file:///") === 0) // mac/unix local file
		localPath = unescape(originalPath.substr(7));
	else if(originalPath.indexOf("file:/") === 0) // mac/unix local file
		localPath = unescape(originalPath.substr(5));
	else // pc network file
		localPath = "\\\\" + unescape(originalPath.substr(7)).replace(new RegExp("/","g"),"\\");	
	return localPath;
};

// ---------------------------------------------------------------------------
// Stylesheet Extensions (may be overridden by local StyleSheet)
// ---------------------------------------------------------------------------
//
setStylesheet(
	".forEachTiddlerError{color: #ffffff;background-color: #880000;}",
	"forEachTiddler");

//============================================================================
// End of forEachTiddler Macro
//============================================================================


//============================================================================
// String.startsWith Function
//============================================================================
//
// Returns true if the string starts with the given prefix, false otherwise.
//
version.extensions["String.startsWith"] = {major: 1, minor: 0, revision: 0, date: new Date(2005,11,20), provider: "http://tiddlywiki.abego-software.de"};
//
String.prototype.startsWith = function(prefix) {
	var n =  prefix.length;
	return (this.length >= n) && (this.slice(0, n) == prefix);
};



//============================================================================
// String.endsWith Function
//============================================================================
//
// Returns true if the string ends with the given suffix, false otherwise.
//
version.extensions["String.endsWith"] = {major: 1, minor: 0, revision: 0, date: new Date(2005,11,20), provider: "http://tiddlywiki.abego-software.de"};
//
String.prototype.endsWith = function(suffix) {
	var n = suffix.length;
	return (this.length >= n) && (this.right(n) == suffix);
};


//============================================================================
// String.contains Function
//============================================================================
//
// Returns true when the string contains the given substring, false otherwise.
//
version.extensions["String.contains"] = {major: 1, minor: 0, revision: 0, date: new Date(2005,11,20), provider: "http://tiddlywiki.abego-software.de"};
//
String.prototype.contains = function(substring) {
	return this.indexOf(substring) >= 0;
};

//============================================================================
// Array.indexOf Function
//============================================================================
//
// Returns the index of the first occurance of the given item in the array or 
// -1 when no such item exists.
//
// @param item [may be null]
//
version.extensions["Array.indexOf"] = {major: 1, minor: 0, revision: 0, date: new Date(2005,11,20), provider: "http://tiddlywiki.abego-software.de"};
//
Array.prototype.indexOf = function(item) {
	for (var i = 0; i < this.length; i++) {
		if (this[i] == item) {
			return i;
		}
	}
	return -1;
};

//============================================================================
// Array.contains Function
//============================================================================
//
// Returns true when the array contains the given item, otherwise false. 
//
// @param item [may be null]
//
version.extensions["Array.contains"] = {major: 1, minor: 0, revision: 0, date: new Date(2005,11,20), provider: "http://tiddlywiki.abego-software.de"};
//
Array.prototype.contains = function(item) {
	return (this.indexOf(item) >= 0);
};

//============================================================================
// Array.containsAny Function
//============================================================================
//
// Returns true when the array contains at least one of the elements 
// of the item. Otherwise (or when items contains no elements) false is returned.
//
version.extensions["Array.containsAny"] = {major: 1, minor: 0, revision: 0, date: new Date(2005,11,20), provider: "http://tiddlywiki.abego-software.de"};
//
Array.prototype.containsAny = function(items) {
	for(var i = 0; i < items.length; i++) {
		if (this.contains(items[i])) {
			return true;
		}
	}
	return false;
};


//============================================================================
// Array.containsAll Function
//============================================================================
//
// Returns true when the array contains all the items, otherwise false.
// 
// When items is null false is returned (even if the array contains a null).
//
// @param items [may be null] 
//
version.extensions["Array.containsAll"] = {major: 1, minor: 0, revision: 0, date: new Date(2005,11,20), provider: "http://tiddlywiki.abego-software.de"};
//
Array.prototype.containsAll = function(items) {
	for(var i = 0; i < items.length; i++) {
		if (!this.contains(items[i])) {
			return false;
		}
	}
	return true;
};


} // of "install only once"

// Used Globals (for JSLint) ==============
// ... DOM
/*global 	document */
// ... TiddlyWiki Core
/*global 	convertUnicodeToUTF8, createTiddlyElement, createTiddlyLink, 
			displayMessage, endSaveArea, hasClass, loadFile, saveFile, 
			startSaveArea, store, wikify */
//}}}


/***
!Licence and Copyright
Copyright (c) abego Software ~GmbH, 2005 ([[www.abego-software.de|http://www.abego-software.de]])

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

Redistributions of source code must retain the above copyright notice, this
list of conditions and the following disclaimer.

Redistributions in binary form must reproduce the above copyright notice, this
list of conditions and the following disclaimer in the documentation and/or other
materials provided with the distribution.

Neither the name of abego Software nor the names of its contributors may be
used to endorse or promote products derived from this software without specific
prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT
SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR
BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH
DAMAGE.
***/

