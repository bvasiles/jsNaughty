// Gmail Manager
// By Todd Long <longfocus@gmail.com>
// http://www.longfocus.com/firefox/gmanager/

Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");
const Ci = Components.interfaces;
const Cc = Components.classes;

function gmLogger()
{
  // Load the console service
  this._console = Cc["@mozilla.org/consoleservice;1"].getService(Ci.nsIConsoleService);
  
  // Load the preference branch observer
  var prefService = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService);
  this._branch = prefService.getBranch("longfocus.gmanager.").QueryInterface(Ci.nsIPrefBranchInternal);
  this._branch.addObserver("", this, false);
  
  // Get the current debug preference value (silent)
  this._debug = this._branch.getBoolPref("debug");
}
gmLogger.prototype = {
  _console: null,
  _branch: null,
  _debug: false,
  
  log: function(aMsg)
  {
    // Check if debug is enabled
    if (this._debug)
    {
      // Log the message to the console
      this._console.logStringMessage("gmanager: " + aMsg);
    }
  },
  
  _toggle: function()
  {
    // Get the current debug preference value
    this._debug = this._branch.getBoolPref("debug");
    
    // Display the logging status
    this._console.logStringMessage("gmanager: " + "Logging has been " + (this._debug ? "enabled" : "disabled"));
  },
  
  observe: function(aSubject, aTopic, aData)
  {
    if (aTopic == "nsPref:changed")
    {
      switch (aData)
      {
        case "debug":
          // Toggle the logging status
          this._toggle();
          break;
      }
    }
  },
  
  QueryInterface: XPCOMUtils.generateQI([Ci.gmILogger,
                                         Ci.nsIObserver]),
  classID: Components.ID("{07d9b512-8e83-418a-a540-0ec804b82195}"),
  classDescription: "Debug Logger Service",
  contractID: "@longfocus.com/gmanager/logger;1"
}

if (XPCOMUtils.generateNSGetFactory) {
  var NSGetFactory = XPCOMUtils.generateNSGetFactory([gmLogger]);
} else {
  var NSGetModule = XPCOMUtils.generateNSGetModule([gmLogger]);
}
