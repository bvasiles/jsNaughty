if (typeof define !== 'function') { var define = require('amdefine')(module) }

define(['uuid'], function(uuid) {
		
	/**
	 *
	 *
	 *
	 */
	function Collection() {
		this.id = uuid.generate();
	}

	/**
	 * Returns true if the collection can be modified, false
	 * otherwise.
	 *
	 */
	Collection.prototype.__defineGetter__('isMutable', function() {
		throw new UnimplementedError();
	})

	/**
	 * Returns the ElasticSearch query block necessary to fetch all the objects
	 * from this collection.
	 */
	Collection.prototype.__defineGetter__('query', function() {
		throw new UnimplementedError();	
	})

	Collection.prototype.__defineGetter__('icon', function() {
		
	})

	/**
	 *
	 *
	 */
	Collection.prototype.addItem = function() {

	}

	return Collection;
})


