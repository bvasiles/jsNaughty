// creates the flipbook
(function makeFlipbook() {
  var flipbook = $('#flipbook');
  flipbook.turn({
    display: 'double',
    duration: 1000,
    acceleration: false,
    gradients: true,
    elevation: 50
  });
  // react on left/right arrows
  $(window).bind('keydown', function(e) {
    if (e.keyCode === 37) {
      flipbook.turn('previous');
    } else if (e.keyCode === 39) {
      flipbook.turn('next');
    }
  });
})();
