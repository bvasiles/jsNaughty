/**
 * We use the initCallback callback
 * to assign functionality to the controls
 */
function mycarousel_initCallback(carousel) {
    jQuery('.jcarousel-control a').bind('click', function() {
        carousel.scroll(jQuery.jcarousel.intval(jQuery(this).text()));
        return false;
    });

    jQuery('.jcarousel-scroll select').bind('change', function() {
        carousel.options.scroll = jQuery.jcarousel.intval(this.options[this.selectedIndex].value);
        return false;
    });

    jQuery('#mycarousel-next').bind('click', function() {
        carousel.next();
        return false;
    });

    jQuery('#mycarousel-prev').bind('click', function() {
        carousel.prev();
        return false;
    });
};

// Ride the carousel...
jQuery(document).ready(function() {
    jQuery("#mycarousel").jcarousel({
        scroll: 1,
        initCallback: mycarousel_initCallback,
        visible: 1,
        // This tells jCarousel NOT to autobuild prev/next buttons
        buttonNextHTML: null,
        buttonPrevHTML: null
    });
});

var index;
function select(i)
{
   var k;
   for(k=1;k<7;k++)
   {
              $("#select"+k).removeClass('b-number-active');
   }
    switch (i)
   {
        case 1:

            $("#select"+i).addClass('b-number-active');
        break;
        case 2:

            $("#select"+i).addClass('b-number-active');
        break;
        case 3:

            $("#select"+i).addClass('b-number-active');
        break;
        case 4:
            $("#select"+i).addClass('b-number-active');
        break;
        case 5:
            $("#select"+i).addClass('b-number-active');
        break;
        case 6:
            $("#select"+i).addClass('b-number-active');
        break;
   }
    index = i+1;
}