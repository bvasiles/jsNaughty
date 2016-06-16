(function($){
    $.ubox_photos = {};
    $.ubox_photos.options =
    {
        template: "#ubox-photo",
        delay: 0
    };
    var options = $.ubox_photos.options;
    var self = $.ubox_photos;
    $.extend($.ubox_photos,
    {
        $popup: null,
        current: {
            image: ''
        },
        set: function(custom_options)
        {
            $.extend($.ubox_photos.options, custom_options);
            return this;
        },
        _init: function()
        {
            $("a[rel~=ubox-photo]").live('click', function()
            {
                // Set the current state
                self.current.image = $(this).attr("href");

                // Duplicate the template and replace
                var $template = $(options.template).clone();
                self.$popup = $template;
				$.ubox.show(self.$popup, { 'on_popup': self._onPopup, 'on_resize': self._onResize });
				$(this).blur(); // Remove focus from the link
                return false;
            });
        },
        _onResize: function()
        {
            $("#ubox-photo").removeClass("resizing").addClass("done");
        },
        _onPopup: function($link)
        {
            var $photo = self.$popup.find("img._photo");
            var $popup = self.$popup;
            $photo.load(function() {
                window.setTimeout(function()
                {
                    // Measure the final dimensions
                    var $el = $('.ubox-content');
                    $popup.removeClass("loading");
                    var o = { 'width': $el.outerWidth(), 'height': $el.outerHeight() };
                    $popup.addClass("loading");

                    // Resize to it
                    $.ubox.resize(o.width, o.height);
                    $popup.removeClass("loading").addClass("resizing");
                }, self.options.delay );
            });
            $photo.attr("src", self.current.image);
        }
    });
    $(function() { $.ubox_photos._init(); });
})(jQuery);

