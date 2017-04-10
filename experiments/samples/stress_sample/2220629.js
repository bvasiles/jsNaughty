/*
Copyright 2009-2010 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0. 
ou may not use this file except in compliance with this License.

You may obtain a copy of the ECL 2.0 License at
https://source.collectionspace.org/collection-space/LICENSE.txt
*/

/*global jQuery, fluid, cspace:true*/
"use strict";

cspace = cspace || {};

(function ($, fluid) {
    fluid.log("PasswordValidator.js loaded");

    // Password validator component that validates password strings and
    // their lengths.
    fluid.defaults("cspace.passwordValidator", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        preInitFunction: "cspace.passwordValidator.preInit",
        finalInitFunction: "cspace.passwordValidator.finalInit",
        selectors: {
            passwordField: ".csc-passwordValidator-password"
        },
        // Parent bundle component that contains all message strings.
        parentBundle: "{globalBundle}",
        invokers: {
            lookupMessage: {
                funcName: "cspace.util.lookupMessage",
                args: ["{passwordValidator}.options.parentBundle.messageBase", "{arguments}.0"]
            }
        },
        strings: {},
        minLength: 8,
        maxLength: 24,
        components: {
            messageBar: "{messageBar}"
        }
    });

    cspace.passwordValidator.preInit = function (that) {
        // Validate based on min and max length.
        that.validateLength = function (password) {
            var passwordLength = password.length;
            if (passwordLength < that.options.minLength || passwordLength > that.options.maxLength) {
                var msg = fluid.stringTemplate(that.lookupMessage("passwordLengthError"), {min: that.options.minLength, max: that.options.maxLength});
                that.messageBar.show(msg, null, true);
                return false;
            }
            that.messageBar.hide();
            return true;
        };
        // TODO: In general, we shouldn't make a component's event binding public.
        // Password validation should probably be more of a decorator-type function.
        // This is captured in CSPACE-1829
        that.bindEvents = function () {
            var pwField = that.locate("passwordField");
            pwField.change(function (event) {
                that.validateLength(pwField.val());
            });
        };
    };

    cspace.passwordValidator.finalInit = function (that) {
        that.messageBar.hide();
    };
})(jQuery, fluid);
