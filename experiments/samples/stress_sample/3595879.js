/**
 * User: pieter
 * Date: 2012/12/24
 */

(function ($) {

    // register namespace
    $.extend(true, window, {
        Tuml:{
            Query:Query
        }
    });

    function Query(id, name, description, queryString, type, data, queryType) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.queryString = queryString;
        this.type = type;
        this.data = data;
        this.queryType = queryType;
    }

    Query.prototype = new Query;

    Query.prototype.getDivName = function () {
        if (this.id !== undefined || this.id !== null || this.id !== -1) {
            return 'queryDivName' + this.id;
        } else {
            return "newQueryDivName";
        }

    }
})(jQuery);


