/*
 * makes divs with an h3 and a ul collapse. Not very useful for other things.
 * 
*/
(function($) {
	
	$.collapsibleMod = {
		cfg: {
			'collapsedClass': 'collapsibleMod-collapsed',
			'expandedClass': 'collapsibleMod-expanded',
			'$header': null,
			'expandedHeight': 0,
			'collapsedHeight': 0,
			'$content': null,
			'collapsed': false,
			'stateKey': '',
			'saveState': true // when set to true, and the container ele has an id, we'll attempt to save the state between requests
		},
		fn: {
			'init': function ( container, options ) {
				var $this = $( container );
				var context = $.extend({}, $.collapsibleMod.cfg, options );
				
				context.$container = $this;
				context.$header = $this.find( 'h3:first' );
				context.$content = $this.children().not( 'h3:first' );
				
				// save our height to expand to
				context.expandedHeight = context.$content.height();
				
				context.$header.bind( 'click', function( e ) {
					e.preventDefault();
					$.collapsibleMod.fn.toggle( context );
				} );
				
				// setup state saving
				if( context.saveState && context.$container.attr( 'id' ) != "" && typeof localStorage != 'undefined' ) {
					context.stateKey = 'collapsibleMod-state-' + context.$container.attr( 'id' );
					$.collapsibleMod.fn.restoreState( context );
				} else {
					context.saveState = false;
				}
				
				if ( context.collapsed ) {
					$.collapsibleMod.fn.collapse( context );
				} else {
					context.$container
						.addClass( context.expandedClass );
				}
				
				$this.data( 'collapsibleMod-context', context );
			},
			'collapse': function ( context ) {
				context.$container
					.addClass( context.collapsedClass )
					.removeClass( context.expandedClass );
				context.$content
					.animate( { 'height': context.collapsedHeight }, 'fast', function() {
						if ( context.collapsedHeight == 0 )
							context.$content.hide();
					} );
				context.collapsed = true;
				$.collapsibleMod.fn.saveState( context );
			},
			'expand': function ( context ) {
				context.$container
					.removeClass( context.collapsedClass )
					.addClass( context.expandedClass );
					context.$content
						.show()
						.animate( { 'height': context.expandedHeight }, 'fast' );
				context.collapsed = false;
				$.collapsibleMod.fn.saveState( context );
			},
			'saveState': function( context ) {
				if( context.saveState ) {
					try {
						localStorage.removeItem( context.stateKey );
						localStorage.setItem( context.stateKey, context.collapsed );
					} catch (e) {
					 	 if ( e == QUOTA_EXCEEDED_ERR ) { /* data wasn't successfully saved due to quota exceed */ }
					}
				}
			},
			'restoreState': function( context ) {
				if ( context.saveState && localStorage.getItem( context.stateKey ) ) {
					context.collapsed = ( localStorage.getItem( context.stateKey ) === 'true' ) ;
				}
			},
			'toggle': function ( context ) {
				context.collapsed ? $.collapsibleMod.fn.expand( context ) : $.collapsibleMod.fn.collapse( context );
			}
		}
	};
	
	$.fn.collapsibleMod = function ( options ) {
		return $( this ).each( function () {
			$.collapsibleMod.fn.init( this, options );
		} );
	};
	
})(jQuery);
