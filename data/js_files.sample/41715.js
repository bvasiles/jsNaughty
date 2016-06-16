if (typeof gadgets != 'undefined') {

var GadgetHandler = Douban.handler.gadget = {
    name: 'gadget',
    
    GET: function(url, params, headers, success, type) {
        url = Douban.util.buildUri(url, params); 
        gadgets.io.makeRequest(url, this.response(type, success),
            this.params('GET', type || 'JSON', headers));
    },

    POST: function(url, params, data, headers, success, type) {
        url = Douban.util.buildUri(url, params); 
        gadgets.io.makeRequest(url, this.response(type, success),
            this.params('POST', type || 'JSON', headers, data));
    },

    PUT: function(url, params, data, headers, success, type) {
        url = Douban.util.buildUri(url, params); 
        gadgets.io.makeRequest(url, this.response(type, success),
            this.params('PUT', type || 'JSON', headers, data));
    },

    DELETE: function(url, params, headers, success, type) {
        url = Douban.util.buildUri(url, params); 
        gadgets.io.makeRequest(url, this.response(type, success),
            this.params('DELETE', type || 'TEXT', headers));
    },

    params: function(type, contentType, headers, data) {
        var params = {};
        params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType[type];
        params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType[contentType.toUpperCase()];
        params[gadgets.io.RequestParameters.HEADERS] = headers || {};
        params[gadgets.io.RequestParameters.REFRESH_INTERVAL] = 60;
        if (data) params[gadgets.io.RequestParameters.POST_DATA] = data;
        return params;
    },

    response: function(type, success) {
        return function(response) {
            var data = type == 'text' ? response.text : response.data;
            success && success(data);
        }
    }
};

}
