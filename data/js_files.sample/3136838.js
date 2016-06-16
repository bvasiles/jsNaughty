/*
 * All java script logic for the search suggestions.
 *
 * The code relies on the jQuery JS library to
 * be also loaded.
 *
 * The logic extends the JS namespace app.*
 */

(function(app){
	if (app) {
		// add searchsuggest to namespace
		app.searchsuggest = {
			// configuration parameters and required object instances
			acListTotal   :  0,
			acListCurrent : -1,
			acDelay       : 300,
			acURL         : null,
			acFormId      : null,
			acSearchId	  : null,
			acResultsId	  : null,
			acSearchField : null,
			acResultsDiv  : null,
			fieldDefault  : null,
			suggestionsJson: null,
			
			init : function(formId, fieldId, fieldDefault, resultsId, url) {
				// initialize vars
				app.searchsuggest.acFormId = "#" + formId;
				app.searchsuggest.acSearchId = "#" + fieldId;
				app.searchsuggest.acResultsId = "#" + resultsId;
				app.searchsuggest.acURL = url;
				app.searchsuggest.fieldDefault = fieldDefault;
				
				// disable browser auto comlete
				app.util.disableAutoComplete(fieldId);
				
				// create the results div
				jQuery("body").append("<div id=\"" + resultsId + "\"></div>");
			
				// register mostly used vars (jQuery object)
				app.searchsuggest.acSearchField = jQuery(app.searchsuggest.acSearchId);
				app.searchsuggest.acResultsDiv = jQuery(app.searchsuggest.acResultsId);
			
				// reposition div
				app.searchsuggest.repositionResultsDiv();
			
				// on blur listener
				app.searchsuggest.acSearchField.blur(function(){ setTimeout("app.searchsuggest.clear()", 200) });
			
				// on key up listener
				app.searchsuggest.acSearchField.keyup(function(e) {
					// get keyCode (window.event is for IE)
					var keyCode = e.keyCode || window.event.keyCode;
					var lastVal = app.searchsuggest.acSearchField.val();
					// check an treat up and down arrows
					if(app.searchsuggest.updownArrow(keyCode)){
						return;
					}
					// check for an ENTER or ESC
					if(keyCode == 13 || keyCode == 27) {
						app.searchsuggest.clear();
						return;
					}
					
					// if is text, call with delay
					setTimeout(function() { app.searchsuggest.suggest(lastVal) }, app.searchsuggest.acDelay);
				});
				
				// on focus listener (clear default value)
				app.searchsuggest.acSearchField.focus(function() {
					var val = app.searchsuggest.acSearchField.val();
					if(val == app.searchsuggest.fieldDefault)
					{
						app.searchsuggest.acSearchField.val("");
					}
				});
				
				// on submit we do not submit the form, but change the window location
				// in order to avoid https to http warnings in the browser
				// only if it's not the default value and it's not empty
				jQuery(app.searchsuggest.acFormId).submit(function() {
					var searchUrl = jQuery(app.searchsuggest.acFormId).attr("action");
					var searchTerm = app.searchsuggest.acSearchField.val();		
					if (searchTerm != app.searchsuggest.fieldDefault && searchTerm != '') {
						window.location = app.util.appendParamToURL(searchUrl, "q", searchTerm);
					}
					return false;					
				});
			},
			
			// trigger suggest action
			suggest : function(lastValue)
			{
				// get the field value
				var part = app.searchsuggest.acSearchField.val();
			
				// if it's empty clear the resuts box and return
				if(part == "") {
					app.searchsuggest.clear();
					return;
				}
			
				// if it's equal the value from the time of the call, allow
				if(lastValue != part) {
					return;
				}
				
				// build the request url
				var reqUrl = app.util.appendParamToURL(app.searchsuggest.acURL, "q", part);
				
				// get remote data as JSON
				jQuery.getJSON(reqUrl, function(json) {
					// get the total of results
					var ansLength = app.searchsuggest.acListTotal = json.suggestions.length;
			
					// if there are results populate the results div
					if(ansLength > 0) {
			
						var newData = "";
						// create a div for each result
						for(i=0; i < ansLength; i++) {
							newData += "<div class=\"unselected\"><div class=\"suggestionterm\">" + json.suggestions[i].suggestion + "</div>";
							newData += "<span class=\"hits\">" + json.suggestions[i].hits + "</span></div>";
						}
						
						app.searchsuggest.suggestionsJson = json.suggestions;
						
						// update the results div
						app.searchsuggest.acResultsDiv.html(newData);
						app.searchsuggest.acResultsDiv.css("display","block");
						// reposition in case user resizes browser between searches
						app.searchsuggest.repositionResultsDiv();
						
						// for all divs in results
						var divs = jQuery(app.searchsuggest.acResultsId + " > div");
						
						// on mouse over clean previous selected and set a new one
						divs.mouseover( function() {
							divs.each(function(){ this.className = "unselected"; });
							this.className = "selected";
						});
						
						// on click copy suggestion to search field, hide the list and submit the search
						divs.each(function(i){
							jQuery(this).click( function() {
								app.searchsuggest.acSearchField.val(app.searchsuggest.suggestionsJson[i].suggestion);
								app.searchsuggest.clear();
								jQuery(app.searchsuggest.acFormId).submit();
							})
						});
					} else {
						app.searchsuggest.clear();
					}
				});
			},
			
			// clear suggestions
			clear : function()
			{
				app.searchsuggest.acResultsDiv.html("");
				app.searchsuggest.acResultsDiv.css("display","none");
			},
			
			// reposition the results div accordingly to the search field
			repositionResultsDiv : function()
			{
				// get the input position
				var inPos = app.searchsuggest.acSearchField.offset();
				var inTop = inPos.top;
				var inLeft = inPos.left;
				
				// get the field size
				var inHeight = app.searchsuggest.acSearchField.height();
				var inWidth = app.searchsuggest.acSearchField.width();
				
				// apply the css styles
				app.searchsuggest.acResultsDiv.addClass("suggestions");
				app.searchsuggest.acResultsDiv.css("position","absolute");
				app.searchsuggest.acResultsDiv.css("left", inLeft + 7); // to tweak
				app.searchsuggest.acResultsDiv.css("top", inTop + inHeight + 3);
				app.searchsuggest.acResultsDiv.css("width", inWidth - 2); // to tweak
				app.searchsuggest.acResultsDiv.css("z-index", "7777");
			},
			
			// treat up and down key strokes defining the next selected element
			updownArrow : function(keyCode) {
				if(keyCode == 40 || keyCode == 38) {
					if(keyCode == 38) { // keyUp
						if(app.searchsuggest.acListCurrent == 0 || app.searchsuggest.acListCurrent == -1) {
							app.searchsuggest.acListCurrent = app.searchsuggest.acListTotal-1;
						} else {
							app.searchsuggest.acListCurrent--;
						}
					} else { // keyDown
						if(app.searchsuggest.acListCurrent == app.searchsuggest.acListTotal-1) {
							app.searchsuggest.acListCurrent = 0;
						} else {
							app.searchsuggest.acListCurrent++;
						}
					}
					
					// loop through each result div applying the correct style
					app.searchsuggest.acResultsDiv.children().each(function(i) {
						if(i == app.searchsuggest.acListCurrent) {
							app.searchsuggest.acSearchField.val(app.searchsuggest.suggestionsJson[i].suggestion);
							this.className = "selected";
						} else {
							this.className = "unselected";
						}
					});
					return true;
				} else {
					// reset
					app.searchsuggest.acListCurrent = -1;
					return false;
				}
			}
		} // end searchsuggest
	} else {
		// namespace has not been defined yet
		alert("app namespace is not loaded yet!");
	}
})(app);