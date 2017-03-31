(function ($) {
  $.fn.extend ({
    truncate: function (options) {
      var settings = $.extend ({}, $.fn.truncate.defaults, options);

      return this.each (function () {
        var text = $(this).text ();
        var box_height = settings.lines_visible * settings.line_height_px + 2;


        var toggle_link = c.cr ('a').add_text (settings.more_text).
                                     add_attr ({href: 'javascript:void(0);'}).
                                     set_class ('toggle-link');

        $(toggle_link).toggle (function () {$(this).text (settings.less_text);

                                            // This is a hack to find out how tall the div is on line-height:'auto'.
                                            box.inner.style.height = 'auto';
                                            var auto_height = $(box.inner).height ();
                                            box.inner.style.height = box_height + 'px';

                                            // We just had to do that because animate only works on numerical properties.
                                            $(box.inner).animate ({height:auto_height + 10 + 'px'}, 'slow');
                               },
                               function () {$(this).text (settings.more_text);
                                            $(box.inner).animate ({height:box_height + 'px'});
                               });


        var box = c.cr ('div');
        box.add_css   ({padding: '10px'}).
            set_class ('truncate').
            append    (box.inner = c.cr ('div').add_text (text).
                                                add_css  ({lineHeight: settings.line_height_px + 'px',
                                                           height: box_height + 'px',
                                                           overflow: 'hidden'})).
            append    (toggle_link);


        if (settings.new_box === false) this.parentNode.removeChild (this);
        $('body').prepend (box);
      });
    }
  });

  $.fn.truncate.defaults = {
    new_box        : true,
    lines_visible  : 3,
    line_height_px : 20,
    more_text      : 'more',
    less_text      : 'less',
  };

}) (jQuery);

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Utilities
//
var c = {};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// DOM Maniuplation
//

// New (nw)
//   A shortcut for document.createElement:
// c.nw = function (type) { return document.createElement (type); };
c.nw = function (type) { var result = document.createElement (type);
                         result.fancy = function () { return c.cr (result); };
                         return result; };

// Create (cr)
//   The first argument is either 
//     a string specifying a type (in which case it creates a new DOM element) or
//     an existing dom element    (in which case it simply uses the existing element).
//
//   It also takes any number of the following: 
//     object containing attributes:        { name:'name', type:'text' }
//     string:                              'Hello World'
//     array specifying a child element     ['div', { id:'foo', class:'bar' }, 'Hello World']
//     DOM node to be appended              my_div
//     initializer functions:               function () { this.add_text ('Hello World');
//                                                        var my_div = this.cr ('div');
//                                                        this.append (my_div);         }
//  
//   It adds several useful methods:
//     attributes                           add_attr
//     classes                              add_class, set_class
//     css                                  clear_css, add_css, set_css
//     text                                 add_text
//     adding children                      append, prepend, cr
//     misc                                 empty, html

c.cr = function (arg) {
  // If it's an existing dom element, make it "fancy". If not, create it as usual.
  var result = arg instanceof HTMLElement ? arg : c.nw (arg);
  if (! result) { throw new Error ('Error!!'); };

  // METHODS:
  //
  // Attributes
  result.add_attr  = function (arg) {      if (arg.constructor === Object) for (var k in arg) result[k] = arg[k];
                                      else if (arg.constructor === String) result.setAttribute (arg, arguments[1]);
                                      return result; };

  // Classes
  result.set_class = function () { result.className = Array.prototype.slice.call (arguments).join (' '); return result; };
  result.add_class = function () { result.className += ' ' + Array.prototype.slice.call (arguments).join (' '); return result; };

  // CSS
  result.clear_css = function ()    { result.setAttribute ('style', ''); return result; };
  result.add_css   = function (arg) {      if (arg.constructor === Object) for (var k in arg) result.style[k] = arg[k];
                                      else if (arg.constructor === String) result.setAttribute ('style', result.getAttribute ('style') + ';' + arg);
                                      return result; };
  result.set_css   = function (arg) { result.clear_css (); 
                                           if (arg.constructor === Object) result.add_css (arg);
                                      else if (arg.constructor === String) result.setAttribute ('style', arg);
                                      return result; };

  // Text
  result.add_text  = function (str) { result.append (document.createTextNode (str)); return result; };

  // Adding children
  result.cr        = function () { return result.append (c.cr.apply (result, arguments)); };
  result.append    = function () { for (var i = 0, len = arguments.length; i < len; i++) {
                                          if (arguments[i].constructor === Array) result.append.apply (result, arguments[i])
                                     else if (arguments[i] instanceof Node)       result.appendChild (arguments[i]); }
                                   return result; };
  result.prepend   = function () { for (var i = 0, len = arguments.length; i < len; i++) {
                                          if (arguments[i].constructor === Array) result.prepend.apply (result, arguments[i])
                                     else if (arguments[i] instanceof Node)       result.insertBefore (arguments[i], result.firstChild); }
                                   return result; };

  // Miscellaneous
  result.empty     = function ()    { result.innerHTML = ''; return result; };
  result.html      = function (str) { result.innerHTML = str; return result; };


  // Process command line arguments.
  for (var i = 1, len = arguments.length; i < len; i++) {
    var arg = arguments[i];
         if (arg.constructor === Object)   result.add_attr (arg);
    else if (arg.constructor === String)   result.add_text (arg);
    else if (arg.constructor === Array)    result.cr.apply (result, arg);
    else if (arg instanceof Node)          result.append (arg);
    else if (arg.constructor === Function) arg.call (result);
  }

  return result;
};
