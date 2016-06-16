var Rx = require('rx');
var _ = require('lodash');
var $ = require('jquery');
var epsilon = require('../geom/epsilon');
var end_somewhere  = require('../events/end_somewhere');

module.exports = function(end_time, distance) {
	
	if(end_time === undefined) end_time = 250;
	if(distance === undefined) distance = { x: 10, y: 10 }
	
	var target = $(this);
	var down = target.downAsObservable();
	var tap = down.selectMany(function(start) {
		
		var ended_within_radius = end_somewhere
			.where(function(end) {
				return false === epsilon(
					distance.x, distance.y,
					end.global.x - start.global.x,
					end.global.y - start.global.y
				);
			});
		
		var timeout_contingency = Rx.Observable
			.empty()
			.finallyAction(_.bind(target.removeClass, target, 'press'));
		
		var ended_within_time = ended_within_radius
			.select(function(){ return start; })
			.timeout(end_time)
			.catchException(timeout_contingency);
		
		return ended_within_time;
	});
	
	return tap;
}
