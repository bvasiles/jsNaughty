function toggleSlideyMenu(id) {
        $('#'+id+'-menu').toggle('slide', {'direction' : 'left'});
        $('#'+id+'-button').toggle('slide', {'direction' : 'left'});
}

function setupSlideyMenu(id, options) {
        $(document).ready(function() {
                options = options || {};
                var menu = '#'+id+'-menu';
                var button = '#'+id+'-button';

                $(menu).hide().mouseleave(function() {
                        toggleSlideyMenu(id)
                }).addClass('ui-widget')
                .addClass('ui-widget-content')
                .addClass('ui-corner-right')
                .addClass('slidey-menu-menu');

                $(menu).width(options['width'] || '200px');

                $(menu).children('h3')
                .addClass('slidey-menu-item')
                .addClass('ui-widget-header');

                $(button).button({
                        icons: {primary:'ui-icon-triangle-1-s'},
                }).click(function() {
                        toggleSlideyMenu(id)
                }).addClass('slidey-menu-button');

        });
}
