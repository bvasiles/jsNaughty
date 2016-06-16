/*global define: true, metaproject: true */
define(function() {
    "use strict";

    var models = {};

    // Example ModelName

    models.Product = metaproject.Model({
        id: null,
        description: null
    }).bind('../objectiveweb/product');

    return models;
});
