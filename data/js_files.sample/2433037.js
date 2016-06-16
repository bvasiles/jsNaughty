// example: window.loadingCursor = new CursorLoading( 16, 16 );
// uses _cursor-loading.css

var CursorLoading = function( offsetX, offsetY, className ){

  var _el = null,
      _showing = false,
      _offsetX = offsetX || 20,
      _offsetY = offsetY || 20,
      _className = className || 'cursorLoading',
      _x = 0,
      _y = 0,

  init = function() {
    if( document.attachEvent ) document.attachEvent( "onmousemove", mouseMoved ); else document.addEventListener( "mousemove", mouseMoved, false );
  },

  showCursor = function() {
    if( _el == null ) {
      _el = document.createElement('div');
      _el.className = _className;
    }
    document.getElementsByTagName("body")[0].appendChild( _el );
    _showing = true;
    updateCursorPosition();
  },

  hideCursor = function() {
    if( _el != null ) {
      // if( document.attachEvent ) document.detachEvent( "onmousemove", mouseMoved ); else document.removeEventListener( "mousemove", mouseMoved, false );
      document.getElementsByTagName("body")[0].removeChild( _el );
    }
    _showing = false;
  },

  mouseMoved = function(e) {
    var scrollX = window.pageXOffset ? window.pageXOffset : document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft;
    var scrollY = window.pageYOffset ? window.pageYOffset : document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop;
    _x = e.clientX + _offsetX + scrollX;
    _y = e.clientY + _offsetY + scrollY;
    updateCursorPosition();
  },

  updateCursorPosition = function() {
    if( _el != null ) {
      _el.style.left = _x+"px";
      _el.style.top = _y+"px";
    }
  };

  init();

  return {
    showCursor: showCursor,
    hideCursor: hideCursor
  }
};