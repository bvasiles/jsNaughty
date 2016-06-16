/****** BEGIN LICENSE BLOCK *****
  *   Version: MPL 1.1/GPL 2.0/LGPL 2.1
  *
  * The contents of this file are subject to the Mozilla Public License Version
  * 1.1 (the "License"); you may not use this file except in compliance with
  * the License. You may obtain a copy of the License at
  * http://www.mozilla.org/MPL/
  *
  * Software distributed under the License is distributed on an "AS IS" basis,
  * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
  * for the specific language governing rights and limitations under the
  * License.
  *
  * The Original Code is TBDialOut.
  *
  * The Initial Developer of the Original Code is
  * Chris Hastie http://www.oak-wood.co.uk
  * Portions created by the Initial Developer are Copyright (C) 2010
  * the Initial Developer. All Rights Reserved.
  *
  * TBDialOut was inspired by VOIP3 Dialer by MSelector, although the code
  * has largely been rewritten. http://www.mselector.com
  *
  * Contributor(s):
  *
  * Alternatively, the contents of this file may be used under the terms of
  * either the GNU General Public License Version 2 or later (the "GPL"), or
  * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
  * in which case the provisions of the GPL or the LGPL are applicable instead
  * of those above. If you wish to allow use of your version of this file only
  * under the terms of either the GPL or the LGPL, and not to allow others to
  * use your version of this file under the terms of the MPL, indicate your
  * decision by deleting the provisions above and replace them with the notice
  * and other provisions required by the GPL or the LGPL. If you do not delete
  * the provisions above, a recipient may use your version of this file under
  * the terms of any one of the MPL, the GPL or the LGPL.
  *
  * ***** END LICENSE BLOCK *****
  */
var tbdialout = {
  onLoad: function() {
    // initialization code
    this.initialized = true;
    this.strings = document.getElementById("tbdialout-strings");
    this.prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.tbdialout.");

    // listen for changes of selected cards
    document.getElementById("abResultsTree").addEventListener("select", this.onSelectNewRow, true);

    var tbbuttonadded = this.prefs.getBoolPref("tbbuttonadded");
    if (!tbbuttonadded) {
      window.setTimeout(function() {tbdialout.AddToolbarButton();}, 200);
    }

    var passmigrated = this.prefs.getBoolPref("passmigrated");
    if (!passmigrated) {
      tbdialoututils.migratePass();
    }

    // If TBDialOut has been upgraded since the last time we showed upgrade notes,
    // show the notes for the current version.
    var updateshown = this.prefs.getCharPref("updateshown");
    var showupdatenotes = this.prefs.getBoolPref("showupdatenotes");
    // a false default should override user prefs, as there probably 
    // are no notes to display
    if (showupdatenotes && this.prefs.prefHasUserValue("showupdatenotes")) {
      showupdatenotes = false;
    }

    try {
      Components.utils.import("resource://gre/modules/AddonManager.jsm");
      AddonManager.getAddonByID("tbdialout@oak-wood.co.uk", function(addon) {
        // This is an asynchronous callback function that might not be called immediately
        if (showupdatenotes && addon.version != updateshown) {
          window.setTimeout(function() {
            tbdialoututils.openInTab("http://www.oak-wood.co.uk/oss/tbdialout/updates/" + addon.version.replace(/\./g,'-'), "^http://www.oak-wood.co.uk", false);},
            500);
          var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.tbdialout.");
          prefs.setCharPref("updateshown", addon.version);
        }
      });
    }
    catch (ex) {
      // pre Thunderbird 3.3
      var em = Components.classes["@mozilla.org/extensions/manager;1"]
           .getService(Components.interfaces.nsIExtensionManager);
      var addon = em.getItemForID("tbdialout@oak-wood.co.uk");
      if (showupdatenotes && addon.version != updateshown) {
        window.setTimeout(function() {
          tbdialoututils.openInTab("http://www.oak-wood.co.uk/oss/tbdialout/updates/" + addon.version.replace(/\./g,'-'), "^http://www.oak-wood.co.uk", false);},
          500);
        this.prefs.setCharPref("updateshown", addon.version);
      }
    }

  },

  // Check whether or not there are phone numbers for the selected
  // contact and disable or enable buttons and menu as appropriate
  onSelectNewRow: function(e) {
    var numtypes = ["CellularNumber", "WorkPhone", "HomePhone"];
    var buttIDs = ["tbdialout-cell-toolbar-button", "tbdialout-work-toolbar-button", "tbdialout-home-toolbar-button"];
    var menuIDs= ["tbdialout-cell", "tbdialout-work", "tbdialout-home"];
    var buttMenuIDs = ["tbdialout-menu-toolbar-menu-cell", "tbdialout-menu-toolbar-menu-work", "tbdialout-menu-toolbar-menu-home"];

    var idx;

    var cards = GetSelectedAbCards();

    // disable the combined button until we know at least one suitable phone number exists
    try { document.getElementById("tbdialout-menu-toolbar-button").disabled = true; } catch (e) {}

    var pnumber;
    if (cards.length == 1) {
      for (idx in numtypes) {
        pnumber = cards[0].getProperty(numtypes[idx], "");
        pnumber = pnumber.replace(/[^0-9\*#]/g,'');
        if (pnumber.length > 0) {
          try { document.getElementById(buttIDs[idx]).disabled = false; } catch (e) {}
          try { document.getElementById(menuIDs[idx]).disabled = false; } catch (e) {}
          try { document.getElementById(buttMenuIDs[idx]).disabled = false; } catch (e) {}
          // we got at least one good number, so enable the combined button
          try { document.getElementById("tbdialout-menu-toolbar-button").disabled = false; } catch (e) {}
        } else {
          try { document.getElementById(buttIDs[idx]).disabled = true; } catch (e) {}
          try { document.getElementById(menuIDs[idx]).disabled = true; } catch (e) {}
          try { document.getElementById(buttMenuIDs[idx]).disabled = true; } catch (e) {}
        }
      }
    }
    // disable everything if not exactly one card is selected
    else {
      for (idx in numtypes) {
        try { document.getElementById(buttIDs[idx]).disabled = true; } catch (e) {}
        try { document.getElementById(menuIDs[idx]).disabled = true; } catch (e) {}
      }
    }
  },

  // Dial the number stored as num
  // num should be "CellularNumber", "WorkPhone" or "HomePhone"
  onMenuItemCommandDial: function(num) {

    var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                                  .getService(Components.interfaces.nsIPromptService);

    var OKArgs = ["CellularNumber", "WorkPhone", "HomePhone"];
    if ((OKArgs.join(",")+",").indexOf(num + ",") == -1) {
        promptService.alert(window, this.strings.getString("warningDefaultTitle"),
                               this.strings.getString("errorBadArgsMsg") );
        tbdialoututils.logger(2, "onMenuItemCommandDial called with invalid argument " + num);
        return;
    }

    var cards = GetSelectedAbCards();
    var proto, prefix, plus, customurl, customuser, custompass;
    var amihost, amiport, amiuser, amisecret, amichannel, amicontext;

    // dial for the selected card, if exactly one card is selected.
    if (cards.length == 1)
    {
      try {
        proto = this.prefs.getCharPref( "proto" );
        prefix = this.prefs.getCharPref( "prefix" );
        plus = this.prefs.getCharPref( "plus" );
        customurl = this.prefs.getCharPref( "customurl" );
        customuser = this.prefs.getCharPref( "customuser" );
        //custompass = this.prefs.getCharPref( "custompass" );
        custompass = tbdialoututils.getPass("custompass");
        custominbackground = this.prefs.getBoolPref( "custominbackground" );
      } catch (err) {
        promptService.alert(window, this.strings.getString("warningDefaultTitle"),
                               this.strings.getString("errorGettingPrefsMsg") + "\n\n" + err.message);
        tbdialoututils.logger(1, "Error retrieving preferences: " + err.message);
        return;
      }

      // some defaults
      if( proto === void(0) ) proto = "callto:";
      if( prefix === void(0) ) prefix = "";
      if( plus === void(0) ) plus = "";
      if( customurl === void(0) ) customurl = "";
      if( customuser === void(0) ) customuser = "";
      if( custompass === void(0) ) custompass = "";

      var pnumber;
      var leadingplus = false;
      pnumber = cards[0].getProperty(num, "");
      tbdialoututils.logger(5, "Starting to dial for number " + pnumber);

      // check for a leading +
      if (pnumber.charAt(0) == '+') {
        leadingplus = true;
      }
      // strip non-numeric characters (except * and # - valid dialing digits)
      pnumber = pnumber.replace(/[^0-9\*#]/g,'');

      // only dial if we actually have a number to dial
      if (pnumber.length > 0) {
        // do replacement of leading +
        if (leadingplus) {
          pnumber = plus+pnumber;
        }
        pnumber = prefix+pnumber;
        tbdialoututils.logger (5, "Will attempt to dial " + pnumber);
        if (proto == 'custom') {
          // prefix and plus may be special characters, so need to escape pnumber in URL
          var callurl = customurl.replace(/%NUM%/,encodeURIComponent(pnumber));
          tbdialoututils.logger(5, "Going to access URL " + callurl);
          if (callurl.search(/^http(s)?:/i) > -1) {
            if (custominbackground) {
              // do a background XMLHttpRequest
              tbdialoututils.logger(5, "Starting background call to " + callurl);
              var req = new XMLHttpRequest();
              req.open('GET', callurl, true, customuser, custompass);
              req.onreadystatechange = function (aEvt) {
                if (req.readyState == 4) {
                  if(req.status != 200) {
                    var errorStatus = [req.status, req.statusText];
                    // why isn't this.strings already available in this context??
                    var strings = document.getElementById("tbdialout-strings");
                    promptService.alert(window, strings.getString("warningDefaultTitle"),
                                      strings.getFormattedString("errorBadHTTPResponse", errorStatus));
                    tbdialoututils.logger(2, "Unexpected response from HTTP server: " + req.status + ": " + req.statusText);
                  }
                }
              };
              req.send(null);
            } else {
              // try to open the page in a new tab with Thunderbird
              tbdialoututils.logger(5, "Opening URL in new tab: " + callurl);
              // by very liberal about what the user can click to in the tab
              // they may need to click on to complete the call, and we don't know what
              // the URI is.
              var click_re = "^http";
              tbdialoututils.openInTab(callurl, click_re);
            }
          } else {
            // for none http(s) URIs we'll just use LaunchUrl
            tbdialoututils.logger(5, "Launching URL with LaunchURL: " + callurl);
            LaunchUrl(callurl);
          }
        } else if (proto == 'asteriskami') {
          tbdialout.AsteriskAMI.dial(pnumber);
        } else {
          tbdialoututils.logger(5, "Launching URL with LaunchURL: " + proto + pnumber);
          LaunchUrl(proto+pnumber);
        }
      }
      else {
        var phoneType = [this.strings.getString(num)];
        promptService.alert(window, this.strings.getString("warningDefaultTitle"),
                               this.strings.getFormattedString("noValidNumberMsg", phoneType));
        tbdialoututils.logger(2, "No valid " + phoneType + " found for contact");
      }
    }
    else {
      promptService.alert(window, this.strings.getString("warningDefaultTitle"),
                               this.strings.getString("selectExactlyOneMsg"));

      tbdialoututils.logger(2, "onMenuItemCommandDial called whilst too many cards selected");
    }
  },

  onToolbarButtonCommandDial: function(num) {
    // just reuse the function above.
    tbdialout.onMenuItemCommandDial(num);
  },

  onLinkClickDial: function(num) {
    // just reuse the function above.
    tbdialout.onMenuItemCommandDial(num);
  },

  // Add the combined button to the Address Book tool bar at first run.
  AddToolbarButton: function() {
    try {
      var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch).getBranch("extensions.tbdialout.");
      var ButtonId    = "tbdialout-menu-toolbar-button"; // ID of button to add
      var afterId = "button-newmessage";
      var ToolBar  = document.getElementById("ab-bar2");
      var curSetStr  = ToolBar.currentSet;

      if (curSetStr.indexOf(ButtonId) == -1) {

        var curSet = curSetStr.split(",")
        var pos = curSet.indexOf(afterId) + 1 || curSet.length;
        var set = curSet.slice(0, pos).concat(ButtonId).concat(curSet.slice(pos));

        ToolBar.setAttribute("currentset", set.join(","));
        ToolBar.currentSet = set.join(",");
        document.persist(ToolBar.id, "currentset");
        try {
          BrowserToolboxCustomizeDone(true);
        }
        catch (e) {}
      }
    }
    catch (e) {}
    // set this even if it fails - don't want to keep trying
    prefs.setBoolPref("tbbuttonadded", true);
    this.onSelectNewRow();
  },

  // #### Class for dealing with connections to Asterisk Manager Interface (AMI) ####
  AsteriskAMI: {

    // Current state. One of:
    // DISCONNECTED            We are not connected,
    // CONNECTING              We haven't yet got the AMI banner to confirm connection
    // INIT                    Connection confirmed by AMI banner but not yet logged in
    // AUTHSENT, AUTHRESPONSE  Login request sent / OK login response received
    // CMDSENT, CMDRESPONSE    Originate command sent / OK response received
    // LOGOFFSENT, LOGOFFRESPONSE  Logoff request sent / confirmed
    state: "DISCONNECTED",

    // ## CONNECTION HANDLING ##

    // set up connection to AMI and connect it to a pump for async reading
    connect: function(hostname, port) {
      this.state = "CONNECTING";
      tbdialoututils.logger(5, "Connecting to " + hostname + ":" + port);
      try {
        // at first, we need a nsISocketTransportService ....
        this.socket =
            Components.classes["@mozilla.org/network/socket-transport-service;1"]
              .getService(Components.interfaces.nsISocketTransportService)
              .createTransport(null,0,hostname,port,null);
      }
      catch (e) { tbdialoututils.logger(1, "Error creating transport service: " + e.message); return false; }

      try {
        this.inStream = this.socket.openInputStream(0,0,0);
      }
      catch (e) { tbdialoututils.logger(1, "Error creating input stream: " + e.message); return false; }

      try {
        this.outStream = this.socket.openOutputStream(0,0,0);
      }
      catch (e) { tbdialoututils.logger(1, "Error creating output stream: " + e.message); return false; }

      this.pump = Components.classes["@mozilla.org/network/input-stream-pump;1"]
              .createInstance(Components.interfaces.nsIInputStreamPump);

      this.pump.init(this.inStream, -1, -1, 0, 0, false);

      this.pump.asyncRead(this, this);

     },

    // disconnect and clean up
    disconnect: function() {
      tbdialoututils.logger(5, "Disconnecting");

      try {
        this.inStream.close();
        this.outStream.close();
        this.socket.close(null);
      } catch (e) {}
      this.connected = false;
      this.loggedin = false;
      this.state = "DISCONNECTED";
      tbdialoututils.logger(5, "Clearing timeout");
      window.clearTimeout(this.dialTimeOut);
    },

    // called when data is available on the pump. Gets the data and passes
    // it to parseResponse()
    onDataAvailable: function (request, context, inputStream, offset, count) {
        this.sInStream = Components.classes["@mozilla.org/scriptableinputstream;1"]
           .createInstance(Components.interfaces.nsIScriptableInputStream);
        this.sInStream.init(this.inStream);
        var str = this.sInStream.read(count);
        tbdialoututils.logger(4, "AMI > TBDialout:\n" + str);
        this.parseResponse(str);
    },

    // we have to define these in order to pass 'this' to pump.asyncRead()
    onStartRequest: function() {},
    onStopRequest: function() {},

    // process the response. This does most of the work of controlling the session,
    // parsing responses from the server and then calling appropriate actions.
    // It takes a simple view of the protocol, moving through a sequence of
    // connect > login > send originate > logoff > disconnect. It abandons and
    // disconnects if anything other than the expected positive response is
    // received at any stage.
    parseResponse: function(response) {

      tbdialoututils.logger(5, "in parseResponse - current state is " + this.state);

      // AMI responses are delimited by a blank line (eom = End of Message)
      var eom = "\r\n\r\n"

      // We haven't confirmed connection yet
      if (this.state == "CONNECTING") {
        // we got the AMI connection banner. Move on to logging in.
        if (response.indexOf("Asterisk Call Manager") > -1) {
          this.connected = true;
          this.state="INIT";
          tbdialoututils.logger(5, "State changed to " + this.state);
          this.login(this.user, this.secret);
          return;
        } else {  // unexpected response
          tbdialoututils.logger(2, "Unexpected response from server. Disconnecting:\n" + response);
          this.disconnect();
          return;
        }
      }

      // not a full response - stick it in the buffer and wait for more
      else if (response.indexOf(eom) == -1) {
        this.buffer += response;
        return;
      }

      // we have a complete response. Reset the buffer and
      // move on to processing it
      else {
        response = this.buffer + response;
        this.buffer = "";
      }

      tbdialoututils.logger(5, "Full response:\n" + response);

      // We may have multiple responses, especially if using astmanproxy.
      // Split them and look for the one we want
      // - it has our last action ID in (this.lastAID).
      ourResponse = "";
      if (this.lastAID.length > 0 || this.state == "LOGOFFSENT") {
        var aidre = new RegExp("^actionid:\\s*" + this.lastAID + "$", "im");

        // ugly work around the fact that Astmanproxy doesn't send Action IDs
        // in response to logoff
        if (this.state == "LOGOFFSENT") {
          var goodbyere = new RegExp(/(^goodbye:)/im);
        }

        var statements=response.split(eom);
        for (x in statements) {
          if (aidre.test(statements[x])) {
            ourResponse = statements[x];
            break;
          } else if (this.state == "LOGOFFSENT" && goodbyere.test(statements[x]) ) {
            ourResponse = statements[x];
            break;
          }
        }
      } else {
        // this should no longer happen - we always try to send an ActionID now
        ourResponse = response;
      }

      tbdialoututils.logger(5, "Relevant response:\n" + ourResponse);

      // if we don't have the response we're looking for, return and wait
      if (ourResponse.length < 1) return;

      // check if this was a good response (usually contains Response: Success)
      var okre = /^response:\s*success$/im;
      if (this.state == "LOGOFFSENT") {
        // Response to logoff is different, and different again from astmanproxy :(
        okre = /(^response:\s*goodbye$)||^goodbye:/im;
      }
      if (okre.test(ourResponse)) {
        tbdialoututils.logger(5, "Response looks good");
      } else {
        tbdialoututils.logger(2, "Got bad response in state " + this.state + ":\n" + ourResponse);
        // clean up and and give up
        this.bailout();
        return;
      }

      // If we're here we have a good response.
      // Take next action, depending on what state we're currently in.
      switch (this.state) {
        case "AUTHSENT":    // We've sent Action: login
          this.state = "AUTHRESPONSE";
          tbdialoututils.logger(5, "State changed to " + this.state);
          this.loggedin = true;
          this.originate(this.extension, this.channel, this.context, this.callerid);
          break;

        case "CMDSENT":    // We've sent Action: originate
          this.state = "CMDRESPONSE";
          tbdialoututils.logger(5, "State changed to " + this.state);
          this.logoff();
          break;

        case "LOGOFFSENT":    // We've sent Action: logoff
          this.state = "LOGOFFRESPONSE";
          tbdialoututils.logger(5, "State changed to " + this.state);
          this.disconnect();
          break;

        default:      // Some other state. Probably shouldn't be here
          tbdialoututils.logger(2, "Unexpected state: " + this.state);
      }

      return;
    },

    // ## ENTRY POINT ##

    // dial is the entry point, called from the main tbdialout.onMenuItemCommandDial()
    // most of the work is actually done in parseResponse
    dial: function(extension) {

      // If the state is not "DISCONNECTED" we're already processing a request.
      // Warn the user and abandon - processing two requests at a time might do
      // strange things.
      if (this.state != "DISCONNECTED") {
        tbdialoututils.logger(3, "AsteriskAMI is currently busy. Abandoning request (state: " + this.state + ")");
        var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
            .getService(Components.interfaces.nsIPromptService);
        promptService.alert(window, tbdialout.strings.getString("warningDefaultTitle"),
                               tbdialout.strings.getFormattedString("warnAmiBusy", [this.extension]) );
        return;
      }

      this.amiprefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.tbdialout.ami.");
      try {
        var host = this.amiprefs.getCharPref( "host" );
        var port = this.amiprefs.getIntPref( "port" );
        this.user = this.amiprefs.getCharPref( "user" );
        //this.secret = this.amiprefs.getCharPref( "secret" );
        this.secret = tbdialoututils.getPass("ami.secret");
        this.channel = this.amiprefs.getCharPref( "channel" );
        this.context = this.amiprefs.getCharPref( "context" );
        this.callerid = this.amiprefs.getCharPref( "callerid" );
        this.timeout = this.amiprefs.getIntPref( "timeout" );
      }
      catch (err) {
        tbdialoututils.logger(1, "Error retrieving AMI preferences: " + err.message);
        return;
      }

      this.loggedin = false;
      this.connected = false;
      this.buffer = "";
      this.lastAID = "";

      this.extension = extension;

      // set up the connection. This sets up a pump, read asynchroneously
      // with the data passed to parseResponse(), which does the rest of the work
      this.connect(host, port);

      // If we haven't completed after a while, give up.
      // It can take up to this.timeout to get
      // a response to this.originate() (if no one picks up the phone)
      // so allow a bit more than this for the other commands
      // to run.
      // 'this' is passed as an argument to the anonymous function
      // as it will be run in the global context.
      this.dialTimeOut = window.setTimeout(
        function (obj) {
          tbdialoututils.logger(5, "AsteriskAmi.dial timed out in state " + obj.state);
          obj.bailout();
        },
        10000 + this.timeout,
        this);
    },

    // ## COMMANDS ##

    // send a command to the AMI. Adds an ActionID and
    // records this in this.lastAID
    send: function(data, ignoreaid) {
      if (!this.connected) return;
      var useaid = ignoreaid || false;
      this.lastAID = "";
      if (!ignoreaid) {
        // add an ActionID header to the beginning of the data
        var aid="tbd-" + new Date().getTime() + "-" + Math.floor(Math.random()*10001);
        data = "ActionID: " + aid + "\r\n" + data;
        this.lastAID = aid;
      }
      try {
        this.outStream.write(data, data.length);
        tbdialoututils.logger(4, "TBDialout > AMI:\n" + data);
      }
      catch (e) {
        if (e.name == 'NS_BASE_STREAM_CLOSED') {
          tbdialoututils.logger(3, "Cannot write to socket. Connection closed.");
        } else {
          tbdialoututils.logger(1, "Error writing data to socket: " + e.message);
        }
        //clean up
        this.disconnect();
        return false;
      }
      return true;
    },

    // login to AMI
    login: function(username, secret) {
      tbdialoututils.logger(5, "Logging in");
      var cmdstring = "Action: Login\r\n"
      + "Username: " + username  + "\r\n"
      + "Secret: " + secret  + "\r\n"
      + "Events: off\r\n"
      + "\r\n";
      if (this.send(cmdstring)) this.state = "AUTHSENT";
    },

    // Set the call up - send the Originate action to AMI
    originate: function(extension, channel, context, callerid) {
      var cmdstring = "Action: Originate\r\n"
      + "Exten: " + extension + "\r\n"
      + "Context: " + context + "\r\n"
      + "Priority: 1\r\n"
      + "Channel: " + channel + "\r\n"
      + "Timeout: " + this.timeout + "\r\n";
      if (callerid.length > 0) {
        cmdstring += "Callerid: " + callerid + "\r\n";
      }
      cmdstring += "\r\n";
      if(this.send(cmdstring)) this.state = "CMDSENT";
    },

    // logoff from AMI
    logoff: function() {
      var cmdstring = "Action: Logoff\r\n\r\n";
      if(this.send(cmdstring)) {
        this.state="LOGOFFSENT";
        this.loggedin = false;
      }
    },

    // ## Other ##

    // Called when we time out or get a bad response. Politely
    // giveup - send logoff if we are logged in, then disconnect.
    bailout: function() {
      if (this.loggedin) this.logoff();
      this.disconnect();
    },
  },

};

window.addEventListener("load", function(e) { tbdialout.onLoad(e); }, false);

