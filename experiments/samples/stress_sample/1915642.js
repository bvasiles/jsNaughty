//> This file is part of DynarchLIB, an AJAX User Interface toolkit
//> http://www.dynarchlib.com/
//>
//> Copyright (c) 2004-2011, Mihai Bazon, Dynarch.com.  All rights reserved.
//>
//> Redistribution and use in source and binary forms, with or without
//> modification, are permitted provided that the following conditions are
//> met:
//>
//>     * Redistributions of source code must retain the above copyright
//>       notice, this list of conditions and the following disclaimer.
//>
//>     * Redistributions in binary form must reproduce the above copyright
//>       notice, this list of conditions and the following disclaimer in
//>       the documentation and/or other materials provided with the
//>       distribution.
//>
//>     * Neither the name of Dynarch.com nor the names of its contributors
//>       may be used to endorse or promote products derived from this
//>       software without specific prior written permission.
//>
//> THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDER “AS IS” AND ANY
//> EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
//> IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
//> PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER BE LIABLE
//> FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
//> CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
//> SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
//> INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
//> CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
//> ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF
//> THE POSSIBILITY OF SUCH DAMAGE.

// @require jslib.js

var DlElementCache = {
	get : function(tag) {
		return this[tag].cloneNode(true);
	}
};

(function(){

        var CE  = DynarchDomUtils.createElement,
            ID  = Dynarch.ID,
            C   = DlElementCache;

        // generic <tbody><tr><td>
        (function(){
	        var TBODY_RC = document.createDocumentFragment();
	        CE("td", null, null,
	           CE("tr", null, null,
	              CE("tbody", null, null, TBODY_RC)));
	        C.TBODY_RC = TBODY_RC;
        })();

        // calendar
        (function(){
	        var STATIC_ROW = CE("tr");
                var STATIC_CELL = CE("td", null, null, STATIC_ROW);
	        (6).times(function(){
		        STATIC_ROW.appendChild(STATIC_CELL.cloneNode(true));
	        });
	        C.CAL_HEAD = CE("thead");
	        C.CAL_HEAD.appendChild(STATIC_ROW.cloneNode(true));
	        var STATIC_BODY = C.CAL_BODY = CE("tbody");
	        (6).times(function(){
		        STATIC_BODY.appendChild(STATIC_ROW.cloneNode(true));
	        });
        })();

        // dragbar
        C.DRAGGING_LINE = CE("div", null, { className: "DlResizeBar-DraggingLine" });

        // UPDATE: the trash is no longer used, and this only slows
        // down decent browsers, while probably not doing anything
        // good for IE.
        //
        // DlEvent.atUnload(function(){
        //         // cleanup
        //         var trash = DynarchDomUtils.trash();
        //         for (var i in C) {
        //                 var el = C[i];
        //                 if (!(el instanceof Function)) {
        //                         trash.appendChild(C[i]);
        //                         delete C[i];
        //                         el = C[i] = null;
        //                 }
        //         }
        //         C = DynarchDomUtils.CE_CACHE; // cleanup the createElement cache as well.
        //         for (var i in C) {
        //                 var el = C[i];
        //                 if (el !== trash) {
        //                         trash.appendChild(C[i]);
        //                         delete C[i];
        //                         el = C[i] = null;
        //                 }
        //         }
        //         trash.innerHTML = "";
        //         if (is_ie)
        //                 trash.outerHTML = "";
        //         delete DynarchDomUtils.CE_CACHE["_trash"];
        //         DynarchDomUtils.CE_CACHE._trash = null;
        //         C = null;
        // });

})();
