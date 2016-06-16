// <![CDATA[
var jid = '';
XC.openWins = new Array(); // making the array for open windows
XC.srvUrl = JQ(document).getUrlParam('srvUrl');

/**
 * Set message information and then activate timeout to clear it
 * @param {String} msg The message to set
 * @param {Boolean} error Determine if error message {true = yes, false = no}
 * @action sets the message and calls the timeout to clear it
 */
function xcSetMsg(msg, error) {
  if (JQ('div#msg').children().size() > XC.LOGSIZE) {
    JQ('div#msg').children(':first-child').remove();
  }
  if (error === true) {
    JQ('#msg').show().addClass('xcError').append('<div>' + msg + '</div>');
  } else {
    JQ('#msg').show().removeClass('xcError').append('<div>' + msg + '</div>');
  };
};

/**
 * Open User Details window and push it onto the array of openWins
 * @param {String} jid The jid of the contact we are opening the user details for
 */
function xcUserInfo(jid) {
  if (typeof(jid) == 'undefined' || jid == '') { return false; };
  var w = xcWinOpen('userdetails', 'jid=' + jid, 'USERDETAILS', 'USERDETAILS');
};

/**
 * Send iq stanza to delete the contact from your roster group
 * @param {String} jid The jid of the contact to remove
 */
function xcDeleteContact(jid) {
  if (!jid) { return false; };
  try {
    var iq = new JSJaCIQ();
    iq.setType('set');
    iq.appendNode(iq.buildNode('query', {xmlns: NS_ROSTER},
                  [iq.buildNode('item', {jid: jid, subscription: 'remove'})]));
    con.send(iq);
  } catch (e) {
    xcSetMsg(e.message, true);
  };
};

/**
 * Based on the contact received it will go through the groups and
 * remove the contact from the groups that it should not be in to keep
 * the roster as fresh and up to date as possible based off data coming in
 */
function xcRemoveUserFromGroup(contact, jid) {
  if (!contact) { return false; };
  for (var x = 0; x < grouplist.length; x++) {
    var group = grouplist[x];
    if (!contact.searchGroup(group)) {
      JQ('#' + xcEnc(group + '_contacts')).children('.xcContact').each(function() {
        if (this.id == xcEnc(jid)) { JQ(this).remove(); }; // removes the DOM element from the page
      });
    };
  };
};

/**
 * @param jid
 *      JID for the window
 * @param lge
 *      Language for the window
 */
function xcUpdateWindowLanguage(jid, lge) {
  w = xcOpenUserChat(jid);
  w.xcSetTranslationLanguage(lge);
};

/**
 * Update Roster based off IQ Sets received by the system
 * @param {JSJaCIQ} iq IQ packet with query xmlns of NS_ROSTER
 */
function xcUpdateRoster(iq) {
  var jid = JQ(iq.getDoc()).find('item').attr('jid');
  // retrieve the necessary data from the item
  var subscription = JQ(iq.getDoc()).find('item').attr('subscription');
  // contact is being removed from the roster hence remove all instances from the system
  if (subscription == "remove") {
    xcRemoveContact(jid);
    JQ('.xcContact').each(function() { if (this.id == xcEnc(jid)) { JQ(this).remove(); }; });
    con.send(iq.reply()); // acknowledge the roster push by replying to the server
    xcToggleEmptyGroups(XC.xc_emptygroups);
    return true;
  };
  var ask = JQ(iq.getDoc()).find('item').attr('ask');
  var name = JQ(iq.getDoc()).find('item').attr('name');
  if (!name) { name = jid; }; // setting the name to the jid if nothing is there
  // if contact does not exist create the contact
  if (!(contact = xcContactExists(jid))) { contact = new xcContact(jid); };
  // update the contact with the relevant information
  if (name) { contact.setName(name); };
  if (subscription) { contact.setSubscription(subscription); };
  if (ask) { contact.setAsk(ask); };
  // clearing the existing groups in thin client
  contact.clearGroup();
  // incase there are multiple groups for the item which is possible
  JQ(iq.getDoc()).find('group').each(function() {
    var group = JQ(this).text();
    // create the group if it does not exist
    if (!xcGroupExists(group)) {
      xcAddGroup(group);
      JQ(xcBuildGroupHtml(group)).insertBefore(JQ('#Offline_contacts').parent()); // builds the html for showing the group
    };
    contact.setGroup(group); // set the group so the information is there, will be pushed onto the array if necessary
  });
  var check = 0;
  JQ('div#Offline_contacts.xcGroupContact .xcContact').each(function() {
    if (this.id == xcEnc(jid)) {
      check = 1; // already a group member so do not add to the group
      return false; // stops us looping through the remainder of the contacts
    };
  });
  // put the person in the offline group if check is 0
  if (check == 0) {
    var html = xcBuildContactHtml(jid, contact);
    xcAddContactToGroup('Offline', jid, name, html);
  } else {
    xcUpdateContactHtml(contact); // update the existing information in the group
  };

  // probe the users presence so we can determine status if we have a both or to subscription only
  if ((subscription) && (subscription == 'both' || subscription == 'to')) {
    xcSendPresenceType(jid, 'probe');
  };

  xcRemoveUserFromGroup(contact, jid); // makes sure the user is not in a group they no longer should be in
  xcToggleEmptyGroups(XC.xc_emptygroups); // if any of the groups are now empty make sure they are not being displayed
  JQ('.xcContact').show(); // make sure everyone is displayed especially the newest one
  xcSetRosterClick(); // sets all necessary click and right click operations for the roster
  con.send(iq.reply()); // acknowledge the roster push by replying to the server
  return true;
};

/**
 * @param {JSJaCIQ} iq IQ set packet with privacy list information in it
 */
function xcUpdatePrivacyList(iq) {
  if (iq.isError()) {
    xcSetMsg(xcErrorProcess(iq), true);
    return true;
  };
  con.send(iq.reply()); // reply with result saying we received the push
  return true;
};

/**
 * Updates / Adds a user to the roster for the client
 * @param {String} jid The jid of the user to add to our roster
 * @param {String} name Our name to display the user by (instead of the bare jid)
 * @param {Array} group This is an array of the groups the user is in
 */
function xcUpdateUser(jid, name, group) {
  if (!jid) { return false; };
  if (!name) { name = jid; };
  if (!group || !group.length) { group = new Array(xcT('General')); };
  // send the packet with roster namespace to update our roster
  try {
    var iq = new JSJaCIQ();
    iq.setType('set');
    iq.appendNode(iq.buildNode('query', {xmlns: NS_ROSTER},
                  [iq.buildNode('item', {jid: xcJID(jid, false), name: name})]));
    // appending each of the groups to the item node incase there is more than one
    for (var x = 0; x < group.length; x++) {
      var node = iq.buildNode('group', group[x]);
      JQ(node).appendTo(JQ(iq.getDoc()).find('item'));
    };
    con.send(iq);
  } catch (e) {};
};

/**
 * Called if you receive a message with MUC information in its xmlns
 * @param {JSJaCMessage} m Message that triggered calling this function
 */
function xcMUCInvite(m) {
  // user declined the offer to come into the MUC Chat Room
  if (JQ(m.getDoc()).find('decline').size() > 0) {
    var from = JQ(m.getDoc()).find('decline').attr('from');
    var reason = JQ(m.getDoc()).find('reason').text();
    var w = xcWinOpen('muc.decline', 'from=' + from + '&reason=' + escape(reason), 'MUCDECLINE', 'MUCINVITE');
  } else {
    var room = xcJID(m.getFrom(), false);
    if ((w = xcWinOpenGet(room))) { return true; }; // already in the group chat ignore the invite
    var from = JQ(m.getDoc()).find('invite').attr('from');
    var reason = JQ(m.getDoc()).find('reason').text();
    var w = xcWinOpen('muc.invite', 'from=' + from + '&room=' + room + '&reason=' + escape(reason), 'MUCINVITE', 'MUCINVITE');
  };
  return true;
};

/**
 * Launch the group chat window if we accepted it from the invite received by a person
 * @param {String} name The name of the group chat so we can send requests to it
 * @param {String} nick Lauch the group chat with a specific nickname for the user
 */
function xcMUCInviteLaunch(name, nick) {
  if (typeof(nick) == 'undefined' || typeof(name) == 'undefined' || name == '' || nick == '') {
    return false;
  };
  var w = xcWinOpen('muc', 'nick=' + nick, xcEnc(name), 'MUC');
};

/**
 * Handles any iq stanza packets that come into the server
 * @param {JSJaCIQ} iq The packet received from the server
 */
function xcIQ(iq) {
  if (iq.isError()) { xcSetMsg(xcErrorProcess(iq), true); };
  return true;
};

/**
 * PubSub i.e. Bookmarks etc that we have previously published on the server
 * @param {JSJaCMessage} m Message Stanza with the pertinent information
 */
function xcMsgPubSub(m) {
  return true;
};

/**
 * Headline messages, deliveries of broadcast content i.e. rss feed
 * do not expect a reply and should be displayed in that way on the screen
 */
function xcMsgHeadlines(m) {
  var w = xcWinOpen('headlinemsg', '', 'HEADLINEMSG', 'HEADLINEMSG');
  var s = JQ(m.getDoc()).find('subject').text();
  var b = JQ(m.getDoc()).find('body').text();
  xcMsgHeadlineProcess(w, s, b);
  return true;
};

/**
 * Specific handler to handle Group Chat Messages
 * @param {JSJaCMessage} m Message packet with type set to group chat in it
 */
function xcMsgGroupChat(m) {
  // Group Chat initialization messages, we can ignore these since they are not for display in the group chat window
  if (!(alias = xcJID(m.getFrom(), true)) && m.getSubject().htmlEnc() == '') { return true; };
  var jid = xcJID(m.getFrom(), false);
  if (!(w = xcWinOpenGet(jid))) {
    w = window.open('muc.html?&nick=' + escape(alias), xcEnc(jid), XC.WINOPTS['MUC']);
    XC.openWins.push(w);
  };
  xcMsgMUCProcess(w, m); // pass the message onto the message handler in the open window for the group chat
  w.focus();
  return true;
};

/**
 * Once Group Chat message window function is available the message packet is sent to the funciton for processing
 * @param {Object} w The window object that we are checking for function availablity
 * @param {JSJaCMessage} m The message packet to be passed to the appropriate function
 */
function xcMsgMUCProcess(w, m) {
  if (w.xcMsgGet) {
    w.xcMsgGet(m);
    return true;
  };
  setTimeout(function() { xcMsgMUCProcess(w, m); }, XC.MSGTIMEOUT);
};

/**
 * Handle all message packets with errors in them that are not handled by pre-defined functions
 * @param {JSJaCMessage} m The message packet with the error in it
 */
function xcMsgError(m) {
  var w = xcWinOpenGet(jid);
  if (w && w.xcError) {
    w.xcError(m);
  };
  return true;
};

/**
 * Normal messages i.e. not one on one, but should be responded too
 * no history should be kept about these messages
 */
function xcMsgNormal(m) {
  // for some reason some actually send them as type normal so we need to compensate for that
  if (JQ(m.getDoc()).find('invite').size() > 0 || JQ(m.getDoc()).find('decline').size() > 0) {
    xcMUCInvite(m);
    return true;
  }
  // FIXME: actually implement this portion
  return true;
};

/**
 * Default message handler for chat and system messages
 * @param {JSJaCMessage} m Message packet with pertinent information inside it
 */
function xcMsg(m) {
  if (m.getBody().htmlEnc() == '') { return true; };
  if (XC.roster_loaded == 0) {
    // If the roster is not loaded yet, put the message in a 1 second loop
    // This will allow the roster to load and we will receive the correct information
    setTimeout(function() { xcMsg(m); }, 1000);
    return true;
  };
  // Here we want to get the message window if it is available
  if (!(w = xcWinOpenGet('ONETOONEMESSAGE'))) {
    w = window.open(xcPath(window.location.href) + '/message.html?', 'ONETOONEMESSAGE', XC.WINOPTS['MSG']);
    XC.openWins.push(w);
  };
  w.focus();
  xcMsgProcess(w, m);
  return true;
};

/**
 * Once message window function is available the message packet is sent to the funciton for processing
 * @param {Object} w The window object that we are checking for function availablity
 * @param {JSJaCMessage} m The message packet to be passed to the appropriate function
 */
function xcMsgProcess(w, m) {
  if (w.xcMessage) {
    w.xcMessageReceive(m);
    return true;
  };
  setTimeout(function() { xcMsgProcess(w, m); }, XC.MSGTIMEOUT);
};

/**
 * Function sets the headline message by calling the function in the appropriate window
 *
 * @param {Object} w The window object we are checking for function availablity on
 * @param {String} s The subject that we are setting for the headline message
 * @param {String} b The body that we are setting for the headline message
 */
function xcMsgHeadlineProcess(w, s, b) {
  if (w.xcMessage) {
    w.xcMessage(s, b);
    return true;
  };
  setTimeout(function() { xcMsgHeadlineProcess(w, s, b); }, XC.MSGTIMEOUT);
};

/**
 * Subscription request has been received by the client
 * @param {JSJaCPresence} p Incoming presence packet with subscription request
 */
function xcPresenceSubscribe(p) {
  if (typeof(p.getFrom()) == 'undefined' || p.getFrom() == '') { return true; };
  // call this function again until we have the roster loaded
  if (XC.roster_loaded == 0) {
    setTimeout(function() { xcPresenceSubscribed(p); }, 1000);
    return true;
  };
  // do some checking here to determine if we should show the subscription window or not
  if ((contact =  xcContactExists(p.getFrom()))) {
    var subscription = contact.getSubscription();
    if (subscription == 'both' || subscription == 'from') {
      return true; // we are already subscribed hence do not redo this request
    } else if (subscription == 'to') {
      xcSubscribed(p.getFrom(), null, null, false); // send subscribed packet, do not re-open subscription window
      return true;
    };
  };
  // if everything is fine we can open the subscription window
  var w = xcWinOpen('subscription', 'from=' + p.getFrom(), xcEnc(p.getFrom()) + 'SUBSCRIPTION', 'SUBSCRIPTION');
  return true;
};

/**
 * Send subscribe packet to the server so it knows to no longer send the request to the client
 * @param {JSJaCPresence} p Incoming presence packet from xmpp server
 */
function xcPresenceSubscribed(p) {
  try {
    var rp = new JSJaCPresence();
    rp.setTo(xcJID(p.getFrom(), false));
    rp.setType('subscribe');
    con.send(rp);
  } catch (e) {};
  return true;
};

/**
 * Unsubscribe request has been received by the client
 * @param {JSJaCPresence} p Incoming presence packet with un-subscribe request
 */
function xcPresenceUnSubscribe(p) {
  if (typeof(p.getFrom()) == 'undefined' || p.getFrom() == '') { return true; };
  var w = xcWinOpen('unsubscribe', 'from=' + p,getFrom(), xcEnc(p.getFrom()) + 'UNSUBSCRIBE', 'UNSUBSCRIBE');
  return true;
};

/**
 * Send unsubscribe packet to the server so it knows to no longer send the request to the client
 * @param {JSJaCPresence} p Incoming presence packet from xmpp server
 */
function xcPresenceUnSubscribed(p) {
  try {
    var rp = new JSJaCPresence();
    rp.setTo(xcJID(p.getFrom(), false));
    rp.setType('unsubscribe');
    con.send(rp);
  } catch (e) {};
  return true;
};

/**
 * Default presence error handling function
 * @param {JSJaCPresence} p Presence packet with error information in it
 */
function xcPresenceError(p) {
  if (!p) { return true; };
  var jid = xcJID(p.getFrom(), false);
  if ((w = xcWinOpenGet(jid))) {   // handle if window is open
    if (w.xcError) { w.xcError(p); };
  } else {
    xcSetMsg(xcErrorProcess(p), true);
  };
  return true;
};

/**
 * Default presence handling function for the client
 * @param {JSJaCPresence} p Presence packet received by the xmpp server
 */
function xcPresence(p) {
  if (!p) { return true; };
  var jid = xcJID(p.getFrom(), false);
  // regular user presence packet arrived
  if((contact = xcContactExists(jid))) {
    var type = p.getType();
    var show = p.getShow();
    var status = p.getStatus();
    if (type == 'unavailable') {
      show = 'unavailable';
      if (!(xcInOfflineGroup(jid))) {
        // removing the contact from any groups they were in and then we can put them into the offline group
        JQ('.xcContact').each(function() {
          if (this.id == xcEnc(jid)) {
            JQ(this).remove();
          };
        });
        var html = xcBuildContactHtml(jid, contact); // rebuild the html for the contact
        xcAddContactToGroup('Offline', jid, contact.getName(), html);
      };
      JQ('.xcContact').each(function() {
        if (this.id == xcEnc(jid)) {
          xcSetContactPresence(JQ(this), show, status);
          JQ(this).slideDown();
        };
      });
    } else {
      if ((!type && show == '') || (type == '' && show == '')) { show = type = 'available'; }; // empty type and show portion so it is just available / online
      if ((xcInOfflineGroup(jid))) {
        // removing the contact from the offline group and putting them into another group
        JQ('.xcContact').each(function() {
          if (this.id == xcEnc(jid)) {
            JQ(this).remove();
          };
        });
        for (var x = 0; x < contact.group.length; x++) {
          var gn = contact.group[x];
          // create the group if it does not exist
          if (!xcGroupExists(gn)) {
            xcAddGroup(gn);
            JQ(xcBuildGroupHtml(gn)).insertBefore(JQ('#Offline_contacts').parent());
          };
          var html = xcBuildContactHtml(jid, contact); // rebuild the html for the contact
          xcAddContactToGroup(gn, jid, contact.getName(), html);
        };
      };
      JQ('.xcContact').each(function() {
        if (this.id == xcEnc(jid)) {
          JQ(this).slideDown('slow').parents('.xcGroupContainer').slideDown(); // display group
          xcSetContactPresence(JQ(this), show, status);
        };
      });
    };
    contact.setContact(null, type, show, p.getStatus().htmlEnc(), xcJID(p.getFrom(), true)); // update contact information
    xcUpdateContact(contact); // update array with the contacts
  };
  xcSetRosterClick(); // reset all click options in the server
  if ((w = xcWinOpenGet(jid))) {
    try {
      w.xcPresence(p);
    } catch (e) {}
  }; // call presence handler in any open windows
  return true;
};

/**
 * Updates the roster if required to do so and sends subscribed presence packet
 * @param {String} id JID of the entity the presence packet will be sent too
 * @param {String} name Used if you are updating the roster
 * @param {Array} group Array of groups the user is in
 * @param {Boolean} sendiq If true send roster update iq stanza, if false do not send roster update
 */
function xcSubscribed(id, name, group, sendiq) {
  if (typeof(id) == 'undefined' || id == '') { return false; };
  try {
    if (sendiq) {
      if (typeof(name) == 'undefined' || name == '') { name = xcJID(id, false); }; // default name to the jid if not received
      if (typeof(group) == 'undefined' || group == '') { group = new Array(xcT('General')); }; // default group to General if not received
      var iq = new JSJaCIQ();
      iq.setType('set');
      iq.appendNode(iq.buildNode('query', {xmlns: NS_ROSTER},
                   [iq.buildNode('item', {jid: xcJID(id, false), name: name})]));
      // appending each of the groups to the item node incase there is more than one
      for (var x = 0; x < group.length; x++) {
        var node = iq.buildNode('group', group[x]);
        JQ(node).appendTo(JQ(iq.getDoc()).find('item'));
      };
      con.send(iq);
    };
    // informs external client that subscription was successful
    var p = new JSJaCPresence();
    p.setTo(xcJID(id, false));
    p.setType('subscribed');
    con.send(p);
  } catch (e) {
    xcSetMsg(e.message, true);
  };
  return true;
};

/**
 * Sends unsubscribed presence packet back to the entity via the server
 * @param {String} id JID of the entity receiving the unsubscribed presence packet
 */
function xcUnsubscribed(id) {
  if (!id) { return true; };
  try {
    var p = new JSJaCPresence();
    p.setTo(xcJID(id, false));
    p.setType('unsubscribed');
    con.send(p);
  } catch (e) {
    xcSetMsg(e.message, true);
  };
  return true;
};

/**
 * Function
 * @param {Node} e Error Node from the return packet
 */
function xcError(e) {
  var code = JQ(e).attr('code');
  if (code == 401) {
    xcSetMsg(xcT('Wrong combination Username / Password. Please re-login to the site for synchronization'), true);
  };
  return true;
};

/**
 * Performs cleanup when the client is disconnected from the server
 */
function xcDisconnected() {
  // Send token presence unavailable, should never reach the server
  // Because at this point we should already be disconnected from it
  xcPresenceSend('unavailable', 'Unavailable');
  xcSetMsg(xcT('Disconnected from Server'), false);
  // Remove contacts if we are disconnected
  JQ('#xcCL').html('');
};

/**
 * Performs initialization once the client is actually connected to the XMPP server
 */
function xcConnected() {
  try {
    // Clear any contacts that were already there
    JQ('#xcCL').html('');
    xcPresenceSend('', 'Available'); // setting the presence icon and sending initial presence
    xcBookmarksGet(); // retrieving any bookmarks the user might utilize
    xcGetVCardNickName(); // retrieving the users nickname if stored in the vcard
    xcRetrievePrefs(); // determine if a configuration was stored on the server in private storage if so use that first
    setTimeout(function() {
      // if the locale was given through the url then we should utilize that for the client
      if (JQ(document).getUrlParam('locale')) {
        // On first connect we should call the locale first so that the
        // System will actually make the decision and retrieve the information
        xcGetLocale(JQ(document).getUrlParam('locale'));
      } else {
        xcGetLocale(XC.locale);
      }
      // retrieve any information stored in a cookie if the config is not already loaded
      if (XC.config_loaded == 0) {
        if ((cookie = xcReadCookie(xcEncodeHex(XC.ujid)))) {
          eval(xcDecodeHex(cookie).substitute('|', ';'));
          XC.config_loaded = 1;
        };
      };
      xcGetLocale(XC.locale);
      // putting the correct style sheet into the client
      JQ('link').attr('href', XC.xcfontsize);
      if (XC.xc_archive == 1) { xcArchiveConversation('true'); }; // turn on archive functionality if set
      // xcSetPrivacyRules(); // setting privacy rules incase the user wishes to use them at a later time
      // xcServiceDiscovery(); // discovering what the server actually supports
      xcRosterGet(); // retrieve the users roster
      // if user launched the client specifically to use the muc we should also launch the muc at this time
      if (JQ(document).getUrlParam('muc') && JQ(document).getUrlParam('nickname')) {
        xcMUCInviteLaunch(JQ(document).getUrlParam('muc'), JQ(document).getUrlParam('nickname'));
      };
      // checking if the one on one chat should be launched i.e. did the buddy parameter get sent during open
      if (JQ(document).getUrlParam('buddy')) {
        var w = xcOpenUserChat(JQ(document).getUrlParam('buddy'));
      };
    }, XC.CONFIG_WAIT);
  } catch (e) {
    xcSetMsg(e.message, true);
  };
};

/**
 * Pre-defaulted privacy rules to send to the server so we can activate them if required
 */
function xcSetPrivacyRules() {
  // create privacy rule so that presence will not be sent out if activated
  var iq = new JSJaCIQ();
  iq.setType('set');
  iq.appendNode(iq.buildNode('query', {xmlns: NS_PRIVACY},
               [iq.buildNode('list', {name: 'invisible'},
               [iq.buildNode('item', {action: 'deny', order: '1'},
               [iq.buildNode('presence-out')])])]));
  con.send(iq);
  // create privacy rule so that presence will be sent out if activated
  var iq = new JSJaCIQ();
  iq.setType('set');
  iq.appendNode(iq.buildNode('query', {xmlns: NS_PRIVACY},
               [iq.buildNode('list', {name: 'visible'},
               [iq.buildNode('item', {action: 'allow', order: '1'},
               [iq.buildNode('presence-out')])])]));
  con.send(iq);
};

/**
 * Activate privacy rule
 * @param {String} name The name of the privacy rule to activate
 */
function xcActivatePrivacyRule(name) {
  var iq = new JSJaCIQ();
  iq.setType('set');
  iq.appendNode(iq.buildNode('query', {xmlns: NS_PRIVACY},
               [iq.buildNode('active', {name: name})]));
  con.send(iq);
};


/**
 * Logs status changes in the connection
 * @param {String} status Human readable connection status
 */
function xcStatusChanged(status) {
  oDbg.log("status changed: "+status);
  return true;
};

/**
 * Sends the version information regarding the Client per XEP-0092
 * @param {JSJaCIQ} iq IQ packet looking for client version information
 */
function xcVersionSend(iq) {
  con.send(iq.reply([iq.buildNode('name', XC.name),
                     iq.buildNode('version', XC.version),
                     iq.buildNode('os', XC.os)]));
  return true;
};

/**
 * Sends the current timestamp for the Client
 * @param {JSJaCIQ} iq IQ Packet
 */
function xcTimeSend(iq) {
  var now = new Date();
  con.send(iq.reply([iq.buildNode('display', now.toLocaleString()),
                     iq.buildNode('utc', now.jabberDate()),
                     iq.buildNode('tz', now.toLocaleString().substring(now.toLocaleString().lastIndexOf(' ')+1))]));
  return true;
};

/**
 * XEP-0012 compatibility replying with the users last activity based off the internal counter
 * @param {JSJaCIQ} iq IQ packet with query set to the jabber:iq:last namespace
 */
function xcLastSend(iq) {
  var d = new Date();
  var seconds = 1000;
  con.send(iq.reply([iq.buildNode('query', {xmlns: NS_LAST, seconds: seconds})]));
  return true;
};

/**
 * XEP-0199 compatilble, reply to the ping request if you receive one
 * @param {JSJaCIQ} iq IQ packet with query xmlns of urn:xmpp:ping
 */
function xcPingReply(iq) {
  con.send(iq.reply());
};

function xcLogin() {
  try {
    // connection type was passed in as a query string parameter to the client
    if (JQ(document).getUrlParam('httpbase')) { XC.httpbase = JQ(document).getUrlParam('httpbase'); };
    if (JQ(document).getUrlParam('authtype')) { XC.authtype = JQ(document).getUrlParam('authtype'); };
    if (JQ(document).getUrlParam('MUC')) { XC.MUC = JQ(document).getUrlParam('MUC'); };
    if (JQ(document).getUrlParam('SEARCH')) { XC.SEARCH = JQ(document).getUrlParam('SEARCH'); };
    // setup args for contructor
    oArgs = new Object();
    oArgs.httpbase = XC.httpbase;
    oArgs.port = XC.port;
    oArgs.timerval = XC.timerval;
    if (typeof(oDbg) != 'undefined') { oArgs.oDbg = oDbg; };
    // based on whether http bind or polling connection
    if (XC.httpbase == '/http-bind/') {
      con = new JSJaCHttpBindingConnection(oArgs);
    } else {
      con = new JSJaCHttpPollingConnection(oArgs);
    };
    // generic con handlers
    con.registerHandler('onconnect', xcConnected);
    con.registerHandler('onerror', xcError);
    con.registerHandler('ondisconnect', xcDisconnected);
    con.registerHandler('status_changed', xcStatusChanged);
    // all Presence handlers
    con.registerHandler('presence', '*', '*', 'subscribe', xcPresenceSubscribe);
    con.registerHandler('presence', '*', '*', 'subscribed', xcPresenceSubscribed);
    con.registerHandler('presence', '*', '*', 'unsubscribe', xcPresenceUnSubscribe);
    con.registerHandler('presence', '*', '*', 'unsubscribed', xcPresenceUnSubscribed);
    con.registerHandler('presence', '*', '*', 'error', xcPresenceError);
    con.registerHandler('presence', xcPresence);
    // all IQ handlers
    con.registerIQGet('query', NS_VERSION, xcVersionSend);
    con.registerIQGet('query', NS_TIME, xcTimeSend);
    con.registerIQGet('query', NS_LAST, xcLastSend);
    con.registerIQGet('ping', NS_PING, xcPingReply); // NS_PING currently in config.js
    con.registerIQSet('query', NS_ROSTER, xcUpdateRoster);
    con.registerIQSet('query', NS_PRIVACY, xcUpdatePrivacyList); // XEP-0016
    con.registerHandler('iq', xcIQ);
    // all Message handlers
    con.registerHandler('message', 'event', NS_PUBSUB_EVENT, xcMsgPubSub); // publish subscribe information
    con.registerHandler('message', 'x', NS_MUC_USER, xcMUCInvite); //MUC invite and decline
    con.registerHandler('message', '', '', 'headline', xcMsgHeadlines); // headline messages
    con.registerHandler('message', '', '', 'groupchat', xcMsgGroupChat); // groupchat msgs
    con.registerHandler('message', '', '', 'error', xcMsgError); // error messages
    con.registerHandler('message', '', '', 'normal', xcMsgNormal); // handle normal type msgs
    con.registerHandler('message', xcMsg); // for chat and default messages
    // setup args for connect method
    oArgs = new Object();
    // retrieving the parameters passed through the url
    if(JQ(document).getUrlParam('username')) { oArgs.username = XC.ujid = JQ(document).getUrlParam('username'); };
    if(JQ(document).getUrlParam('resource')) { oArgs.resource = JQ(document).getUrlParam('resource'); };
    if(JQ(document).getUrlParam('domain')) { oArgs.domain = XC.domain = JQ(document).getUrlParam('domain'); };
    XC.fjid = oArgs.username + '@' + oArgs.domain;
    JQ('.xcUserJIDContainer').html(XC.fjid); // setting the hidden container with the full jid information
    if(JQ(document).getUrlParam('password')) {
      oArgs.pass = JQ(document).getUrlParam('password');
      XC.password = JQ(document).getUrlParam('password');
    } else {
      if (typeof window.opener.xcpass == 'string' && JQ.trim(window.opener.xcpass).length > 0) {
        oArgs.pass = window.opener.xcpass;
        XC.password = window.opener.xcpass;
      } else {
        if (JQ.trim(XC.password).length > 0) {
          oArgs.pass = XC.password;
        }
      };
    };
    oArgs.authtype = XC.authtype;
    con.connect(oArgs);
  } catch (e) {
    xcSetMsg(e.message, true);
  } finally {
    return false;
  };
};

/**
 * Send message packet to the server
 * @param {String} msg The text that we are going to send in the message (can be empty)
 * @param {String} jid The jabberid we are sending the message too (cannot be empty)
 * @param {String} subject The subject of the message used in Group Chat (can be empty)
 * @param {String} type The type of message used in Group Chat to set that type (can be empty)
 */
function xcMsgSend(msg, jid, subject, type) {
  try {
    var m = new JSJaCMessage();
    m.setTo(jid);
    if (msg) { m.setBody(msg.replace(/\r|\n|\r\n/g, " ")); }; // make sure no additional new lines or carriage returns are sent
    if (type) { m.setType(type); };
    if (subject) { m.setSubject(subject); };
    // adding checks for language type to determine if xml:lang needs to be appended
    if (XC.xc_translation) {
      // check for the subject
      if (JQ(m.getDoc()).find('subject').size() > 0) {
        JQ(m.getDoc()).find('subject').each(function() { JQ(this).attr('xml:lang', XC.xc_translation_lge); });
      };
      // check for the body
      if (JQ(m.getDoc()).find('body').size() > 0) {
        JQ(m.getDoc()).find('body').each(function() { JQ(this).attr('xml:lang', XC.xc_translation_lge); });
      };
    };
    con.send(m);
  } catch (e) {};
  return false;
};

/**
 * Send message packet to the server
 * @param {String} msg The text that we are going to send in the message (can be empty)
 * @param {String} jid The jabberid we are sending the message too (cannot be empty)
 * @param {String} type The type of message used in Group Chat to set that type (can be empty)
 * @param {String} from The jabber id the message is from
 */
function xcMsgSendChatHistory(msg, jid, type, from) {
  try {
    var date = new Date();
    var m = new JSJaCMessage();
    m.setTo(jid);
    if (msg) { m.setBody(msg.replace(/\r|\n|\r\n/g, " ")); }; // make sure no additional new lines or carriage returns are sent
    if (type) { m.setType(type); };
    // adding checks for language type to determine if xml:lang needs to be appended
    if (XC.xc_translation) {
      // check for the subject
      if (JQ(m.getDoc()).find('subject').size() > 0) {
        JQ(m.getDoc()).find('subject').each(function() { JQ(this).attr('xml:lang', XC.xc_translation_lge); });
      };
      // check for the body
      if (JQ(m.getDoc()).find('body').size() > 0) {
        JQ(m.getDoc()).find('body').each(function() { JQ(this).attr('xml:lang', XC.xc_translation_lge); });
      };
    };
    // Verify if we have to do delayed delivery on it for historical purposes
    if (from) {
      var delay;
      // IE does not support createElementNS
      if (JQ.browser.msie === true) {
        delay = m.getDoc().createElement('delay');
        delay.setAttribute('xmlns', 'urn:xmpp:delay');
      } else {
        // Firefox no longer allows createElement and setting an xmlns
        // Since Firefox 3, so we need to createElementNs instead MSIE
        // Does not understand createElementNS so we use the old version above
        delay = m.getDoc().createElementNS('urn:xmpp:delay', 'delay');
      }
      delay.setAttribute('from', from);
      delay.setAttribute('stamp', date.jabberDate());
      m.appendNode(delay);
    }
    con.send(m);
  } catch (e) {};
  return false;
};


/**
 * Builds and sends a presence packet to the xmpp server based on presence updates
 * @param {String} show The actual presence of the client i.e. xa, available, chat, dnd etc
 */
function xcPresenceSend(show, status) {
  switch (show) {
    case 'invisible':
      try {
        var p = new JSJaCPresence();
        p.setType('unavailable');
        con.send(p); // make it look as though we have went offline
        xcActivatePrivacyRule('invisible'); // setting the invisible portion
        con.send(new JSJaCPresence()); // no one should see this one, but lets the server know we are here
        XC.invisible = 1;
      } catch (e) {
        xcSetMsg(e.message, true);
      }
      break;
    default:
      try {
        if (XC.invisible == 1) { xcActivatePrivacyRule('visible'); }; // only change the rule if invisible is currently active
        // determine if the connection is there, if not then try re-connecting the user
        if (con.connected() === false && status != 'Unavailable') {
          xcLogin();
          return;
        } else if (con.connected() === true) {
          // only do this if we are actually connected to the server
          var p = new JSJaCPresence();
          if (show) { p.setShow(show); };
          if (status) { p.setStatus(status); };
          con.send(p);
          XC.invisible = 0;
        }
      } catch (e) {
        xcSetMsg(e.message, true);
      }
  };
  setTimeout("JQ('.xcSpinner').hide()", XC.SPINNERHIDE);
  if (!show) { show = 'available'; };
  xcSetUserPresence(show, status);
};

/**
 * Sends presence packet based of jabberid and type
 * @param {String} jid JID of the person to send the subscribe request too
 * @param {String} type Type of presence packet i.e. probe, subscription etc
 */
function xcSendPresenceType(jid, type) {
  if (!jid) { return false; };
  try {
    var p = new JSJaCPresence();
    p.setTo(xcJID(jid, false));
    if (type) { p.setType(type); };
    con.send(p);
  } catch (e) {
    xcSetMsg(e.message, true);
  };
};

/**
 * Send request to retrieve the users roster from the xmpp server
 */
function xcRosterGet() {
  try {
    var iq = new JSJaCIQ();
    iq.setType('get');
    iq.setID('roster1');
    iq.setQuery(NS_ROSTER);
    con.send(iq, window.xcRosterBuild);
  } catch (e) {
    xcSetMsg(e.message, true);
  };
  return false;
};

/**
 * Build the roster based off the information received from the xmpp server
 * @param {JSJaCIQ} iq IQ stanza with roster information inside it
 */
function xcRosterBuild(iq) {
  if (!iq) { return true; };
  if (iq.isError()) {
    xcSetMsg(xcErrorProcess(iq), true);
    return true;
  };
  // loop through each child item to
  JQ(iq.getQuery()).children().each(function() {
    var jid = JQ(this).attr('jid');
    var subscription = JQ(this).attr('subscription');
    var ask = JQ(this).attr('ask');
    var name = JQ(this).attr('name');
    // if the contact does not exist yet, create the contact
    if (!(contact = xcContactExists(jid))) { contact = new xcContact(jid); };
    if (name) { contact.setName(name); } else { contact.setName(jid); }; // if no name set then use the jid of the person
    if (subscription) { contact.setSubscription(subscription); };
    if (ask) { contact.setAsk(ask); };
    // handle multiple group elements that might occur in the roster
    if (JQ(this).find('group').size() > 0) {
      JQ(this).find('group').each(function() {
        var group = JQ(this).text();
        xcAddGroup(group); // add group to global group list, function takes care to make sure of no duplication
        contact.setGroup(group);
      });
    } else {
      // user does not belong to a group hence add to default group
      xcAddGroup(XC.DEFGROUP); // default group set in config.js
      contact.setGroup(XC.DEFGROUP); // default group set in config.js
    };
  });
  XC.roster_loaded = 1; // the initial roster has been loaded into the client
  xcRosterDisplay();
  return true;
};

/**
 * Builds the roster to be displayed in the thin client
 * @action parses the groups and for each group retrieves the contacts
 * then adds them dynamically to the DOM and displays the information
 */
function xcRosterDisplay() {
  for (var x = 0; x < grouplist.length; x++) {
    // adding extra checks incase the function is called more than once
    var check = 'div.xcGroupContainer div#' + xcEnc(grouplist[x]);
    if (JQ(check).size() == 0) {
      JQ('#xcCL').append(xcBuildGroupHtml(grouplist[x])).show();
    };
  };
  // adding extra checks incase the function is called more than once
  var check = 'div.xcGroupContainer div#' + xcEnc('Offline');
  if (JQ(check).size() == 0) {
    JQ('#xcCL').append(xcBuildGroupHtml('Offline')).show();
  };

  // building the html for the contacts in the list
  for (var x = 0; x < contactlist.length; x++) {
    var jid = contactlist[x].getJID();
    var check = 'div#' + xcEnc(jid) + '.xcContact';
    // adding extra check incase this function is called more than once
    if (JQ(check).size() == 0) {
      var subscription = contactlist[x].getSubscription();
      var html = xcBuildContactHtml(jid, contactlist[x]);
      var name = contactlist[x].getName(); // need the name so we can order the contents by
      xcAddContactToGroup('Offline', jid, name, html); // takes care of alphabetically sorting the group also
      if (subscription == 'both' || subscription == 'to') {
        xcSendPresenceType(jid, 'probe'); // send a presence probe packet to retrieve the users online presence
      };
    };
  };
  JQ('.xcContact').show(); // make sure all contacts are displayed even offline

  if (XC.xc_emptygroups == 1) {
    JQ('.xcGroupContainer').show(); // shows all groups including empty ones if set in config
  };

  if (XC.xc_showoffline == 0) {
    JQ('div#Offline.xcGroup').parent().slideUp(); // hides the offline group if configured
  };
  xcSetRosterClick();
  return false;
};

/**
 * Opens the user archive window for seeing chat transcripts
 * @param {String} jid JID of the user we wish to view chat transcripts for
 */
function xcViewUserLog(jid) {
  if (!jid) { return false; };
  if ((w = xcWinOpenGet(jid + '_archive'))) {
    w.focus();
    return false;
  };
  var w = xcWinOpen('archive', 'jid=' + escape(jid), xcEnc(jid), 'ARCHIVE');
};

/**
 * Determine if automatic archiving of conversations is required
 * @param {String} save Turn on and off save archiving (true = archive, false = do not archive)
 */
function xcArchiveConversation(save) {
  try {
    var iq = new JSJaCIQ();
    iq.setType('set');
    iq.appendNode(iq.buildNode('auto', {xmlns: NS_XEP0136NS, save: save}));
    con.send(iq);
  } catch (e) {
    xcSetMsg(e.message, true);
  };
};

/**
 * XEP-0199 function to send xmpp ping to the server to make sure it is there
 */
function xcPingSend() {
  if (xmppclient_ping == 1) {
    try {
      var iq = new JSJaCIQ();
      iq.setType('get');
      iq.appendNode(iq.buildNode('ping', {xmlns: NS_PING}));
      con.send(iq, function(iq) {
                     if (iq.isError()) { xcSetMsg(xcErrorProcess(iq), true); };
                     return true;
                   });
    } catch (e) {
      xcSetMsg(e.message, true);
    };
  } else {
    xcSetMsg(xcT('Server does not support XEP-0199 XMPP Ping functionality'), false);
  };
};

/**
 * function opens the update user information page for the system
 * @param {String} jid The jid for the user we wish to open the window for
 */
function xcWinUpdateUserOpen(jid) {
  if ((w = xcWinOpenGet('UPDATEUSER'))) {
    w.focus();
    return false;
  };
  var w = xcWinOpen('updateuser', 'jid=' + jid, 'UPDATEUSER', 'UPDATEUSER');
};

/**
 * function opens the set presence for a specific user window
 * @param {String} jid The jid for the user we wish to open the window for
 */
function xcWinUpdatePresenceOpen(jid) {
  if ((w = xcWinOpenGet('PRESENCE'))) {
    w.focus();
    return false;
  };
  var w = xcWinOpen('presence.other', 'jid=' + jid, 'PRESENCEOTHER', 'PRESENCEOTHER');
};

/**
 *
 */
function xcTranslateWinOpen(jid) {
  if ((w = xcWinOpenGet('TRANSLATE'))) {
    w.focus();
    return false;
  };
  var w = xcWinOpen('translate', 'jid=' + jid, 'TRANSLATE', 'TRANSLATE');
};

/**
 * Opens windows for the client and makes sure they are tracked
 * @param {String} pname The page you wish to actually retrieve
 * @param {String} params Any parameters needing to be passed to the page
 * @param {String} name The name that the window will have
 * @param {String} winopts The winopts being used to open the window
 */
function xcWinOpen(pname, params, name, winopts) {
  if (!(w = xcWinOpenGet(name))) {
    w = window.open(xcPath(window.location.href) + '/' + pname + '.html?' + params, name, XC.WINOPTS[winopts]);
    XC.openWins.push(w);
  };
  w.focus();
  return w;
};

/**
 * returns a window handler if the window is actually open
 * @param {String} name Name of the window we are checking for
 */
function xcWinOpenGet(name) {
  // check if the window already exists
  for (var x = 0; x < XC.openWins.length; x++) {
    if (XC.openWins[x].name == xcEnc(name)) {
      return XC.openWins[x];
    };
  };
  return null;
}

/**
 * Update an existing contact with new information
 * @param {Object} contact. Contact with which to update
 * @type xcContact
 */
function xcWinOpenUpdate(w) {
  for (var x = 0; x < XC.openWins.length; x++) {
    if (XC.openWins[x].name = w.name) { XC.openWins[x] = w };
  };
};

/**
 * removes the window from the array of open windows
 * @param {String} name Name of the window we are checking for
 */
function xcWinClose(name) {
  for (var x = 0; x < XC.openWins.length; x++) {
    if (XC.openWins[x].name == xcEnc(name)) {
      XC.openWins.splice(x,1);
    };
  };
};

/**
 * If preferences are stored on the server retrieve them from the XC.srvUrl if available
 */
function xcGetUserPreferences() {
  if (XC.srvUrl) {
    JQ.get(unescape(XC.srvUrl) + unescape(XC.srvUrls['getconfig']), function(result) { eval(result); });
  };
};

/**
 * Request the users VCard so we can get the nickname from it
 */
function xcGetVCardNickName() {
  try {
    var iq = new JSJaCIQ();
    iq.setType('get');
    iq.appendNode(iq.buildNode('vCard', {xmlns: NS_VCARD}));
    con.send(iq, function(iq) {
                   if (JQ(iq.getDoc()).find('NICKNAME').size() > 0) {
                     XC.nickname = JQ(iq.getDoc()).find('NICKNAME').text();
                   } else {
                     XC.nickname = XC.ujid; // making the nickname the users login name
                   };
                 });
  } catch (e) {
    xcSetMsg(e.message, true);
  };
};

/**
 * Once the DOM is ready we can start the manipulation
 */
JQ(document).ready(function(){
  if (typeof(Debugger) == 'function') {
    oDbg = new Debugger(2,'simpleclient');
    oDbg.start();
  } else {
    oDbg = new JSJaCConsoleLogger(2); // firefox / safari debugging
  };
  // retrieve the users stored preferences for the client
  xcGetUserPreferences();
  xcLogin(); // logs in the client
  JQ('#xcUserName').text(XC.ujid); // adds the logged in persons name
  // Setting the click option on the message element so it will disappear
  JQ('div#msg').click(function() {
    JQ(this).html('').hide().removeClass('xcError');
  });
});

/**
 * Client is shut down we send unavailable presence to the server and disconnect
 * Making sure we close all open windows also
 */
JQ(window).unload(function(){
  try {
    var p = new JSJaCPresence();
    p.setType('unavailable');
    con.send(p);
    if (con && con.connected()) {
      con.disconnect();
    };
    xcWinsClose();
  } catch (e) {}
});


function xcSetUserPresence(status, message) {
  JQ.each(XC.pIcon, function(k, v) {
    JQ('#xcUser').removeClass(k);
  })
  // Also remove the invisible class
  JQ('#xcUser').removeClass('invisible');
  JQ('#xcUser').addClass(status);
  JQ('#xcUserPresenceDisplay').html(message);
}

function xcSetContactPresence(contact, show, status) {
  var contactElement = contact.children('.presence');
  JQ.each(XC.pIcon, function(k, v) {
    contactElement.removeClass(k);
  })
  contact.children('.xcContactStatus').html(status);
  contactElement.addClass(show);
}

// ]]>
