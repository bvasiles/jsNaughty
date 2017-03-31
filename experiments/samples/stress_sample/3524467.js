/*global require: false, provide: false */
/*jslint nomen: true*/
(function (context) {
	"use strict";
	
	var _        = require('underscore'),
	    $script  = require('scriptjs'),
	    jQuery,
	    install;
	
	$script('app/package/package', 'package');
	
	$script.ready(['jquery', 'bootstrap', 'package'], function () {
		jQuery  = require('jquery');
		
		jQuery("#installSpringMvc").click(function () {
			install = require('PackageInstall');
			jQuery('#installSpringMvc').button('loading');
			install('spring-mvc', function() {
				jQuery('#installSpringMvc').button('reset');				
			});
		});
		
		
	});
	
}());
