/**
 * OpenEyes
 *
 * (C) Moorfields Eye Hospital NHS Foundation Trust, 2008-2011
 * (C) OpenEyes Foundation, 2011-2013
 * This file is part of OpenEyes.
 * OpenEyes is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * OpenEyes is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with OpenEyes in a file titled COPYING. If not, see <http://www.gnu.org/licenses/>.
 *
 * @package OpenEyes
 * @link http://www.openeyes.org.uk
 * @author OpenEyes <info@openeyes.org.uk>
 * @copyright Copyright (c) 2008-2011, Moorfields Eye Hospital NHS Foundation Trust
 * @copyright Copyright (c) 2011-2013, OpenEyes Foundation
 * @license http://www.gnu.org/licenses/gpl-3.0.html The GNU General Public License V3.0
 */

/**
 * Family Member
 *
 * @class MemberConnector
 * @property {String} className Name of doodle subclass
 * @param {Drawing} _drawing
 * @param {Object} _parameterJSON
 */
ED.MemberConnector = function(_drawing, _parameterJSON) {
	// Set classname
	this.className = "MemberConnector";

	// Special parameters (passed from Pedigree Object)
	this.node = null;

	// Derived parameters
	this.length = 0;
	this.type = "Pair";

	// Saved parameters
	//this.savedParameterArray = ['rotation', 'gender'];

	// Parameters in doodle control bar (parameter name: parameter label)
	//this.controlParameterArray = {'gender':'Gender'};

	// Call superclass constructor
	ED.Doodle.call(this, _drawing, _parameterJSON);
}

/**
 * Sets superclass and constructor
 */
ED.MemberConnector.prototype = new ED.Doodle;
ED.MemberConnector.prototype.constructor = ED.MemberConnector;
ED.MemberConnector.superclass = ED.Doodle.prototype;

/**
 * Sets default properties
 */
ED.MemberConnector.prototype.setPropertyDefaults = function() {
	//this.gridSpacing = 120;
	//this.snapToGrid = true;

	// Add complete validation arrays for derived parameters
	this.parameterValidationArray['length'] = {
		kind: 'derived',
		type: 'int',
		range: new ED.Range(0, 1000),
		animate: true
	};
	this.parameterValidationArray['type'] = {
		kind: 'derived',
		type: 'string',
		list: ['Pair', 'Sibling'],
		animate: true
	};
}

/**
 * Sets default parameters
 */
ED.MemberConnector.prototype.setParameterDefaults = function() {
}

/**
 * Draws doodle or performs a hit test if a Point parameter is passed
 *
 * @param {Point} _point Optional point in canvas plane, passed if performing hit test
 */
ED.MemberConnector.prototype.draw = function(_point) {
	// Get context
	var ctx = this.drawing.context;

	// Call draw method in superclass
	ED.MemberConnector.superclass.draw.call(this, _point);

	// Boundary path
	ctx.beginPath();
	switch (this.type) {
		case 'Pair':
			ctx.moveTo(-this.length/2, 0);
			ctx.lineTo(this.length/2, 0);
			ctx.moveTo(0,0);
			ctx.lineTo(0, this.length);
			break;
		case 'Sibling':
			ctx.moveTo(-this.length/2, 0);
			ctx.lineTo(this.length/2, 0);
			break;
	}

	// Set line attributes
	ctx.lineWidth = 4;

	// Colour of outer line is dark gray
	ctx.strokeStyle = "rgba(120,120,120,0.75)";

	// Draw boundary path (also hit testing)
	this.drawBoundary(_point);

	// Return value indicating successful hittest
	return this.isClicked;
}
