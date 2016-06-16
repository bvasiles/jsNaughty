// Copyright 2006 Aaron Whyte
// All Rights Reserved.

this.plex = this.plex || {};
plex.window = {};
  
/**
 * Figures out the window's inner height and width.
 * @param {Window} opt_win  Option window.  If not provided, uses global
 *   context.
 * @return {Object} an obj like {width:321, height:123}, or null if the
 *   situation is hopeless.
 */
plex.window.getSize = function(opt_win) {
  var win = opt_win || window;
  var size = null;
  if (win.innerHeight) {
    // non-IE
    size = {width: win.innerWidth,
            height: win.innerHeight};
  } else {
    // IE messing with our heads
    var de = win.document.documentElement;
    if (de && de.clientHeight) {
      // IE 6 strict, yay!
      size = {width: de.clientWidth,
              height: de.clientHeight};
    } else {
      size = {width: document.body.clientWidth,
              height: document.body.clientHeight};
    }
  }
  return size;
};

plex.window.getRect = function(opt_win) {
  var size = plex.window.getSize(opt_win);
  return plex.rect.createXywh(0, 0, size.width, size.height);
};
