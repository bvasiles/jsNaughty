/**
    HTTP Using XML (HUX) :At Inclusion
    Copyright (C) 2011-2012  Florent FAYOLLE
    
    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:
    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.
    
    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE.
**/
// atmgr.hux.js

/**
 * Namespace: AtInclusion
 * 
 * At Inclusions Manager
 */

HUX.AtInclusion = (function(){
	/** =================== INNER FUNCTIONS ================== **/ 
	var inner = {
		// the pairs manager :
		pairs: null,
		hash: null,
		asyncReq: true,
		// content synchronizer for nested targets and asynchronous requests : 
		contentManager: null,
		// stores the runnning XHR objects
		runningRequests: {},
		// forces at inclusion pairs to be in location.search
		// this is practical in order to avoid the use of .htaccess file
		forceAtInQuery: true,
		/**
		 * Callbacks per action (add, delete or replace a pair in @...).
		 */
		pairsCallbacks: {
			onAdd: function(added){
				inner.load(added.target, added.url);
				return true;
			},
			onReplace: function(replaced){
				inner.load(replaced.target, replaced.url);
				return true;
			},
			onDelete: function(deleted){
				inner.contentManager.removeContent(deleted.target);
				return true;
			}
		},
		// called when targets are not found : 
		onTargetsNotFound: function(targets){
			HUX.Compat.Array.forEach(targets, function(target){
				HUX.logError("target #"+target+" not found. Check the content of your link.");
			});
			// we remove each targets from at inclusions : 
			pub.changeAt( "@-"+targets.join(",-") , null, false /* addNewState */);
		},
		/**
		 * Function; createPairMgr
		 * creates an instance of HUX.PairManager for AtInclusion
		 * 
		 * Parameters:
		 * 	- *callbacks*: {Object} the callback object
		 * 
		 * Returns:
		 * 	- {HUX.PairManager} the instance
		 */
		createPairMgr: function(callbacks){
			return new HUX.PairManager(callbacks);
		},
		/**
		 * Function: findAnchors
		 * find the anchors that begin with '@'
		 * 
		 * Parameters:
		 * 	- *context*: the context node
		 * 	- *fnEach*: the function to execute for each found anchors
		 */
		findAnchors: function(context, fnEach){
			var msieVers = HUX.Browser.getMSIEVersion();
			if(msieVers && msieVers <= 7){
				var fnFilter = function(el){  
					// NOTE : el.getAttribute("href", 2) does not always work with IE 7, so we use this workaround to 
					// test if the href attribute begins with "#!"
					return el.href.indexOf( location.href.replace(/\?.*|@.*|#.*/g, "")+"@" ) === 0;  
				};
				HUX.Selector.filterIE("a", fnFilter, context, fnEach);
			}
			else{
				HUX.Selector.byAttribute( "a", "href^='@'", context, fnEach);
			}
		},
		
		/**
		 * Function: load
		 * does an xhr request and inject the content in the target element
		 * 
		 * Parameters:
		 * 	- *target*: {Element} the target element
		 * 	- *url*: {String} the location of the content
		 * 
		 * Returns:
		 * 	- {Boolean} true if the xhr request succeeded (xhr.status==200)
		 */
		load: function(target, url){
			var opt = {
				data:null,
				url:url,
				method:'get',
				async:inner.asyncReq,
				filling:"replace",
				target: document.getElementById(target)
			};
			// we abort any possible existing runningRequest for this target
			if(inner.runningRequests[target] instanceof XMLHttpRequest){
				inner.runningRequests[target].abort();
			}
			opt.onSuccess = function(xhr){
				// we delete the reference of inner.runningRequests[target]
				delete inner.runningRequests[target];
				// and we add the content for target
				inner.contentManager.addContent(target, xhr.responseText );
			};
			opt.onError = function(xhr){
				// we delete the reference of inner.runningRequests[target]
				delete inner.runningRequests[target];
				// and we put the error message in target
				inner.contentManager.addContent(target, HUX.XHR.inner.getDefaultErrorMessage(xhr));
			};
			opt.onTimeout = function(xhr){
				inner.contentManager.addContent(target, HUX.XHR.inner.ERROR_TIMEOUT);
			};
			// we run the request
			inner.runningRequests[target] = HUX.xhr(opt);
		},
		/**
		 * Function: onClick
		 * click event handler for links with atinclusions
		 */
		onClick: function(event){
			HUX.Compat.Event.preventDefault(event);
			var target = HUX.Compat.Event.getEventTarget(event),
			    hash = ( target.hash.length > 0 ? target.hash : null );
			
			pub.changeAt(target.href, hash);
		},
		
		/**
		 * Function: getNewUrl
		 * gets the new URL with atinclusions
		 * 
		 * Returns:
		 * 	-{String} the new URL
		 */
		getNewUrl: function(){
			var oldAtInclusions = pub.getAtInclusions(), newAtInclusions = inner.pairs.toString(),
			    href = location.href.replace(/#.*/,"");
			if( oldAtInclusions )
				href = href.replace(oldAtInclusions, newAtInclusions);
			else
				href = href + newAtInclusions;
			// we add the hash if set : 
			if(inner.hash)
				href += inner.hash;
			
			return href;
		},
		/**
		 * Function: pushState
		 * adds a new history state
		 */
		pushState: function(obj, title, newState){
			if(newState === undefined)
				newState = inner.getNewUrl();
			history.pushState(obj, title, newState);
		},
		/**
		 * Function: replaceState
		 * replace an history state
		 */
		replaceState: function(obj, title, newState){
			if(newState === undefined)
				newState = inner.getNewUrl();
			history.replaceState(obj, title, newState);
		},
		/**
		 * Function: onPopState
		 * popstate event handler
		 */
		onPopState: function(event){
			try{
				if( !pub.enabled )
					return;
				pub.changeAt(location.href, location.hash, false);
			}
			catch(ex){
				HUX.logError(ex);
			}
		},
		/**
		 * Function: applyHash
		 * scrolls to the element refered by the hash (like the default behaviour of the browsers)
		 */
		applyHash: function(){
			var anchorToView;
			if(inner.hash && pub.enabled ){
				// we scroll to the element whose ID matches the hash, or to the anchor whose name matches the hash
				anchorToView = document.querySelector(location.hash+", a[name=\""+location.hash.replace(/^#/,"")+"\"]");
				if(anchorToView !== null){
					anchorToView.scrollIntoView();
					inner.hash = null;
				}
			}
		}
	};
	
	
	/** =================== PUBLIC ================== **/ 
	var pub = {
		inner: inner,
		// by default, we enable At Inclusions if supported
		enabled: !!history.pushState,
		init: function(){
			if(! pub.enabled )
				return;
			inner.contentManager = new HUX.ContentManager( inner.onTargetsNotFound );
			inner.pairs = new HUX.PairManager(inner.pairsCallbacks);
			inner.pairs.toString = function(){
				return "@"+this.map(function(a){ return a.target+"="+a.url; }).join();
			};
			// we force at inclusions to be in query string
			// NOTE : location.search can return "" if there is nothing after "?", 
			//	  so we test using location.href.indexOf("?") instead
			if(inner.forceAtInQuery === true && location.href.indexOf("?") < 0) 
				inner.pushState({}, "", location.pathname.replace(pub.getAtInclusions(), "")
								+"?"+ (pub.getAtInclusions()||"") +location.hash);
			HUX.addLiveListener( pub.listen );
			HUX.HUXEvents.bindGlobal("afterInject", inner.applyHash);
			pub.changeAt( (pub.getAtInclusions() || "@"), location.hash );
		},
		listen: function(context){
			// this module works only with modern browsers which implements history.pushState
			// so we suppose that they implement evaluate as well...
			inner.findAnchors(context, function(el){ 
				HUX.Compat.Event.addEventListener(el, "click", inner.onClick); 
			});
			
		},
		/**
		 * Function: changeAt
		 * adds, replaces or removes atinclusions in the URL
		 * 
		 * Parameters:
		 * 	- *at*: {String} the atinclusion string. changeAt can also extract it from href strings.
		 * 	- *hash*: {String} the "normal" hash to apply when the contents are loaded (optional)
		 * 	- *addNewState*: {Boolean} indicates if a new state is added (optional; default=true)
		 */
		changeAt: function(at, hash, addNewState){
			if(!pub.enabled)
				return;
			var sPairs, keys, newurl; 
			// we store the hash string
			inner.hash = hash || null; // if undefined or "", we set inner.hash = null
			// we only keep at inclusions in *at*
			at = at.replace(/(.*@!?)|(#.*)/g, "");
			// we seperate the pairs : 
			sPairs = at.split(/,!?/);
			keys = sPairs.map(function(s){ 
					return (s.match(/^\+?([^=]+)/) || [null,null])[1];
				}).filter(function(s){ 
					return s !== null && s.charAt(0) !== '-';
				});
			inner.contentManager.setKeys( keys );
			inner.pairs.change(sPairs);
			if(addNewState !== false) // default is true
				inner.pushState({}, "");
			else
				inner.replaceState(history.state, "");
		},
		/**
		 * Function: addAt
		 * adds or replaces an atinclusion pair in the URL
		 * 
		 * Parameters:
		 * 	- *target*: {String} the target (key) of the atinclusion pair
		 * 	- *url*: {String} the url (value) of the atinclusion pair
		 * 	- *addNewState*: {Boolean} do we add a new history state ? (optional, default=true)
		 * 
		 */
		addAt: function(target, url, addNewState){
			inner.hash = null;
			var ret = inner.pairs.setPair(target, url);
			if(addNewState !== false) // default is true
				inner.pushState({}, "");
			else
				inner.replaceState(history.state, "");
			return ret;
		},
		/**
		 * Function: removeAt
		 * removes an atinclusion pair in the URL
		 * 
		 * Parameters:
		 * 	- *target*: the target (key) of the atinclusion pair to remove
		 * 	- *addNewState*: {Boolean} do we add a new history state ? (optional, default=true)
		 */
		removeAt: function(target, addNewState){
			inner.hash = null;
			var ret = inner.pairs.removePair(target);
			if(addNewState !== false) // default is true
				inner.pushState({}, "");
			else
				inner.replaceState(history.state, "");
			return ret;
		},
		/**
		 * Function: getAtInclusions
		 * gets the at inclusion string in the url
		 * 
		 * Returns:
		 * 	- {String} the at inclusion string or null if not found
		 */
		getAtInclusions: function(){
			return ( (location.pathname + location.search).match(/@.*/) || [null] )[0];
		},
	     
		/**
		 * Function: getAtInclusionValue
		 * gets the at inclusion value of a pair
		 * 
		 * Parameters:
		 * 	- *key*: the key of the pair to find
		 * Returns:
		 * 	- {String} the value or null if not found
		 */
		getAtInclusionValue: function(key){
			return inner.pairs.getPairValue(key) || null;
		}
	};
	
	
	return pub;
})();

HUX.Compat.Event.addEventListener( window, "popstate", HUX.AtInclusion.inner.onPopState );
HUX.addModule( HUX.AtInclusion );

