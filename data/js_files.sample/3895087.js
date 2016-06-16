/*global FM*/
/**
 * Top level object shared by every components.
 * You need to add the created component to the game object owner.
 * @class FM.Component
 * @param {string} pComponentType Type of the component to add.
 * @param {FM.GameObject} pComponentOwner Game object that owns the component.
 * @constructor
 * @author Simon Chauvin
 */
FM.Component = function (pComponentType, pComponentOwner) {
    "use strict";
    if (pComponentOwner) {
        if (pComponentOwner.components) {
            /**
             * Component's name.
             * @type FM.ComponentTypes
             * @public
             */
            this.name = pComponentType;
            /**
             * Component's owner.
             * @type FM.GameObject
             * @public
             */
            this.owner = pComponentOwner;
        } else {
            if (FM.Parameters.debug) {
                console.log("ERROR: the owner of the " + pComponentType
                        + " component must be a gameObject.");
            }
        }
    } else {
        if (FM.Parameters.debug) {
            console.log("ERROR: a owner game object must be specified.");
        }
    }
};
FM.Component.prototype.constructor = FM.Component;
/**
 * Destroy the component and its objects.
 * @method FM.Component#destroy
 * @memberOf FM.Component
 */
FM.Component.prototype.destroy = function () {
    "use strict";
    this.name = null;
    this.owner = null;
};
