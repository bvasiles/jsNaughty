/*! app/collections/activity_comments
* 	@requires: app,app/collection,app/model
* 	@extends: app.Collection
* 	@exports: app.collections.Activity_comments
*/
define("app/collections/activity_comments",function(require,app) {
	var Activity_commentModel = require("app/models/activity_comment");

	app.collections.Activity_comments = app.Collection.extend({
		url: '/activity_comments/',
		model: Activity_commentModel
	});

	exports.app = app;
});
