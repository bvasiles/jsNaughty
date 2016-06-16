"use strict";

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['jquery', 'exports'], factory);
    } else if (typeof exports === 'object') {
        // CommonJS
        factory(require('jquery'), exports);
    } else {
        // Browser globals
        factory(jQuery, window);
    }
}(function ($, exports) {
        
    //////////////////////////////////////////////////////////////////////
    // Creates the base GitHub object
    //  config.timeout = Optional timeout (in milliseconds) to use for
    //     remote connections (default 20000)
    //  config.beforeSend = Optional callback that will be called just
    //     before making a remote connection
    //  config.complete = Optional callback that will be called when a
    //     remote connection terminates
    //  config.rootUrl = Optional URL used for all remote connections
    //     (default "https://api.github.com/")
    //  config.userAgent = Optional user agent string to be used in the
    //     request headers for all remote communication
    //     (default "Ceylon-Web-Runner-1.2.0")
    //  config.authentication - Optional Authentication to use for all
    //     remote calls. Can be overridden in each specific function call.
    //     Set to `null` in a function call if you don't want authentication
    //     even if set on the base GitHub object
    //  config.pageSize - Optional default page size to use for List
    //  config.maxRequests - Optional default max requests to use for List
    //     (defaults to 5)
    //  config.debug = Optional boolean to turn on debugging mode that
    //     logs certain operations to the console
    //  config.monitor = Optional function that will be called for each
    //     successful Ajax call
    //////////////////////////////////////////////////////////////////////
    function GitHub(config) {
        if (config == null) {
            config = {};
        }
        this.config = config;
        
        if (config.timeout == null) {
            config.timeout = 20000;
        }
        if (config.beforeSend != null) {
            config.beforeSend = function() {};
        }
        if (config.complete != null) {
            config.complete = function() {};
        }
        if (config.rootUrl == null) {
            config.rootUrl = "https://api.github.com/";
        } else if (!config.rootUrl.endsWith("/")) {
            config.rootUrl = config.rootUrl + "/";
        }
        if (config.userAgent != null) {
            config.userAgent = "Ceylon-Web-Runner-1.2.0";
        }
        if (config.maxRequests == null) {
            config.maxRequests = 5;
        }
        
        this._etags = {};
        this._cache = {};
        this.rateLimitRemaining = null;
        this.rateLimitLimit = null;
    }
    
    // Private function that handles the actual remote calls
    //  args.url - The URL part that added to the `config.rootUrl`
    //     forms the actual URL to use for the remote call
    //  args.method - The HTML method to use (eg. "GET", "POST", etc)
    //  args.data - Optional data object to be passed as data for
    //     the remote call. If the method is "GET" the attributes
    //     will be passed as request parameters while for "POST"
    //     the object will be turned into a JSON string and passed
    //     in its entirety
    //  args.timeout = Optional timeout (in milliseconds) to use for
    //     remote connections (default 20000)
    //  args.success - Optional callback to be called on successful
    //     termination of the remote call
    //  args.error - Optional callback to be called on erroneous
    //     termination of the remote call
    //  args.authentication - Optional Authentication to use for the
    //     remote call
    //  args.headers - Optional map of headers to add to the request
    GitHub.prototype._call = function(args) {
        var that = this;
        if (args.url == null) {
            throw "Missing required `args.url`";
        }
        if (args.method == null) {
            throw "Missing required `args.method`";
        }
        
        var key = args.url + JSON.stringify(args.data);
        
        function stripEtag(tag) {
            if (tag != null) {
                if (tag.startsWith("W/")) {
                    tag = tag.substring(2);
                }
            }
            return tag;
        }
        function handleSuccess(json, status, xhr) {
            if (that.config.debug) { console.log("Status: " + xhr.status + "\n", xhr.getAllResponseHeaders(), json); }
            // Remember our rate limits
            var limit = xhr.getResponseHeader("X-RateLimit-Remaining");
            if (limit != null) {
                that.rateLimitRemaining = parseInt(limit);
            }
            limit = xhr.getResponseHeader("X-RateLimit-Limit");
            if (limit != null) {
                that.rateLimitLimit = parseInt(limit);
            }
            // Cache GET responses that have an ETag
            if (args.method == "GET") {
                var etag = stripEtag(xhr.getResponseHeader("ETag"));
                if (etag != null) {
                    if (xhr.status == 304) {
                        json = that._cache[etag];
                    } else if (xhr.status >= 200 && xhr.status <= 299) {
                        that._etags[key] = etag;
                        that._cache[etag] = json;
                    }
                }
            }
            if (that.config.monitor != null) {
                that.config.monitor(json, status, xhr);
            }
            if (args.success != null) {
                args.success(json, status, xhr);
            }
        }
        function handleError(xhr, status, err) {
            if (that.config.debug) { console.log("Error: " + err, "Status: " + xhr.status + "\n", xhr.getAllResponseHeaders()); }
            if (args.error != null) {
                args.error(xhr, status, err);
            } else {
                console.log("Error: " + err);
            }
        }
        
        var hdr = {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": that.config.userAgent
        };
        if (args.headers) {
            $.each(args.headers, function(name, value) {
                hdr[name] = value;
            })
        }
        var auth = args.authentication;
        if (typeof auth === "undefined") {
            auth = that.config.authentication;
        }
        var data = args.data || {};
        var jqargs = {
            "url": that.config.rootUrl + args.url,
            type: args.method,
            cache: false,
            timeout: that.config.timeout,
            beforeSend: that.config.beforeSend,
            complete: that.config.complete,
            dataType: 'json',
            headers: hdr,
            success: handleSuccess,
            error: handleError
        };
        if (auth != null) {
            auth.apply(jqargs, hdr, data);
        }
        if (args.method == "GET") {
            var etag = that._etags[key];
            if (etag != null) {
                hdr["If-None-Match"] = etag;
            }
            if (args.data != null) {
                jqargs.data = data;
            }
        } else if (args.method == "POST" || args.method == "PATCH") {
            jqargs.contentType = 'application/json; charset=utf-8';
            if (!$.isEmptyObject(data)) {
                jqargs.data = JSON.stringify(args.data);
            }
        } else if (args.method == "DELETE") {
            if (!$.isEmptyObject(data)) {
                jqargs.data = data;
            }
        } else {
            throw "Unsupported method " + args.method;
        }
        if (that.config.debug) { console.log(jqargs); }
        $.ajax(jqargs);
    }
    
    //****************************************************
    // ISSUE
    //****************************************************
    
    // Create a dummy Issue that can be used for an operation
    // like `edit()` that only needs an owner, repo and number
    //  owner - The repository's owner
    //  repo - The repository where the issue is stored
    //  number - The number of an Issue
    GitHub.prototype.issue = function(owner, repo, number) {
        var that = this;
        if (owner == null) {
            throw "Missing required `owner`";
        }
        if (repo == null) {
            throw "Missing required `repo`";
        }
        if (number == null) {
            throw "Missing required `number`";
        }
        var url = "repos/" + owner + "/" + repo + "/issues/" + number;
        return new Issue(that, { id: id, url: url, _state: "idonly" });
    }
    
    // Returns a List object that can be used to iterate over all the Issues
    // across all the authenticated user’s visible repositories including
    // owned repositories, member repositories, and organization repositories
    //  args.authentication - Authentication to use for the remote call
    //  args.parameters - Optional parameters to pass to the search
    //     query, see https://developer.github.com/v3/issues/#parameters
    //  args.pageSize - Optional page size to use for the list requests.
    //     NB: not all list queries support this parameter see GitHub API docs
    //  args.maxRequests - Optional number indicating the maximum number of
    //     remote calls the function `each()` will make (default 5)
    //  args.error - Optional callback to be called on erroneous
    //     termination of the remote call
    GitHub.prototype.issues = function(args) {
        var that = this;
        if (args == null) {
            args = {};
        }
        if (args.authentication == null && that.config.authentication == null) {
            throw "Authentication required";
        }
        return that._issues("issues", args);
    }
    
    // Returns a List object that can be used to iterate over all the Issues
    // across owned and member repositories for the authenticated user
    //  args.authentication - Authentication to use for the remote call
    //  args.parameters - Optional parameters to pass to the search
    //     query, see https://developer.github.com/v3/issues/#parameters
    //  args.pageSize - Optional page size to use for the list requests.
    //     NB: not all list queries support this parameter see GitHub API docs
    //  args.maxRequests - Optional number indicating the maximum number of
    //     remote calls the function `each()` will make (default 5)
    //  args.error - Optional callback to be called on erroneous
    //     termination of the remote call
    GitHub.prototype.userIssues = function(args) {
        var that = this;
        if (args == null) {
            args = {};
        }
        if (args.authentication == null && that.config.authentication == null) {
            throw "Authentication required";
        }
        return that._issues("user/issues", args);
    }
    
    // Returns a List object that can be used to iterate all the Issues
    // for a given organization for the authenticated user
    //  org - The name of one of the authenticated user's organizations
    //  args.authentication - Authentication to use for the remote call
    //  args.parameters - Optional parameters to pass to the search
    //     query, see https://developer.github.com/v3/issues/#parameters
    //  args.pageSize - Optional page size to use for the list requests.
    //     NB: not all list queries support this parameter see GitHub API docs
    //  args.maxRequests - Optional number indicating the maximum number of
    //     remote calls the function `each()` will make (default 5)
    //  args.error - Optional callback to be called on erroneous
    //     termination of the remote call
    GitHub.prototype.organizationIssues = function(org, args) {
        var that = this;
        if (args == null) {
            args = {};
        }
        if (org == null) {
            throw "Missing required `org`";
        }
        if (args.authentication == null && that.config.authentication == null) {
            throw "Authentication required";
        }
        return that._issues("orgs/" + org + "/issues", args);
    }
    
    // Returns a List object that can be used to iterate over a repository's Issues
    //  owner - The name of a repository's owner
    //  repo - The name of a repository
    //  args.parameters - Optional parameters to pass to the search
    //     query, see https://developer.github.com/v3/issues/#parameters-1
    //  args.pageSize - Optional page size to use for the list requests.
    //     NB: not all list queries support this parameter see GitHub API docs
    //  args.maxRequests - Optional number indicating the maximum number of
    //     remote calls the function `each()` will make (default 5)
    //  args.error - Optional callback to be called on erroneous
    //     termination of the remote call
    //  args.authentication - Optional Authentication to use for the
    //     remote call
    GitHub.prototype.repositoryIssues = function(owner, repo, args) {
        var that = this;
        if (owner == null) {
            throw "Missing required `owner`";
        }
        if (repo == null) {
            throw "Missing required `repo`";
        }
        return that._issues("repos/" + owner + "/" + repo + "/issues", args);
    }
    
    GitHub.prototype._issues = function(url, args) {
        var that = this;
        if (args == null) {
            args = {};
        }
        
        function decodeIssue(json) {
            json["_state"] = "summary";
            return new Issue(that, json);
        }
        
        return that._list({
            url: url,
            parameters: args.parameters,
            decode: decodeIssue,
            pageSize: args.pageSize,
            maxRequests: args.maxRequests,
            authentication: args.authentication,
            error: args.error
        });
    }
    
    //////////////////////////////////////////////////////////////////////
    // Object holding Issue data
    //  github - A `GitHub` object
    //  data - The information held by the Issue, see
    //     https://developer.github.com/v3/issues/#response
    //////////////////////////////////////////////////////////////////////
    function Issue(github, data) {
        this.github = github;
        this.data = data;
        var url = data.url;
        if (url == null) {
            throw "Missing required `data.url`";
        }
        var p = url.indexOf("/repos/");
        if (p >= 0) {
            url = url.substring(p + 1);
        }
        this.apiurl = url;
    }
    
    // Fetch the Issue
    //  args.success - Optional callback to be called on successful
    //     termination of the remote call
    //  args.error - Optional callback to be called on erroneous
    //     termination of the remote call
    //  args.authentication - Optional Authentication to use for the
    //     remote call
    Issue.prototype.fetch = function(args) {
        var that = this;
        if (args == null) {
            args = {};
        }
        
        function handleIssue(json, status, xhr) {
            that.data = json;
            delete that.data._state;
            if (args.success != null) {
                args.success(that);
            }
        }
        
        if (that.data._state) {
            that.github._call({
                url: that.apiurl,
                method: "GET",
                authentication: args.authentication,
                success: handleIssue,
                error: args.error
            });
        }
    }
    
    // Returns a List object that can be used to iterate over all the Labels
    // defined on the given issue
    //  args.pageSize - Optional page size to use for the list requests.
    //     NB: not all list queries support this parameter see GitHub API docs
    //  args.maxRequests - Optional number indicating the maximum number of
    //     remote calls the function `each()` will make (default 5)
    //  args.error - Optional callback to be called on erroneous
    //     termination of the remote call
    //  args.authentication - Optional Authentication to use for the
    //     remote call
    Issue.prototype.labels = function(args) {
        var that = this;
        return that.github._labels(that.apiurl + "/labels", args);
    }
    
    // Returns a List object that can be used to iterate over all the
    // comments of this Issue
    //  args.pageSize - Optional page size to use for the list requests.
    //     NB: not all list queries support this parameter see GitHub API docs
    //  args.maxRequests - Optional number indicating the maximum number of
    //     remote calls the function `each()` will make (default 5)
    //  args.error - Optional callback to be called on erroneous
    //     termination of the remote call
    //  args.authentication - Optional Authentication to use for the
    //     remote call
    Issue.prototype.comments = function(args) {
        var that = this;
        return that.github._comments(that.apiurl + "/comments", that, args);
    }

    // Create a Comment
    //  args.data - The data used to create the Comment,
    //     see https://developer.github.com/v3/issues/comments/#create-a-comment
    //  args.success - Optional callback to be called on successful
    //     termination of the remote call
    //  args.error - Optional callback to be called on erroneous
    //     termination of the remote call
    //  args.authentication - Optional Authentication to use for the
    //     remote call
    Issue.prototype.createComment = function(args) {
        var that = this;
        if (args == null) {
            args = {};
        }
        if (args.data == null) {
            throw "Missing required `args.data`";
        }
        
        function handleComment(json, status, xhr) {
            if (args.success != null) {
                var comment = new Comment(that.github, that, json);
                args.success(comment);
            }
        }
        
        that.github._call({
            url: that.apiurl + "/comments",
            method: "POST",
            data: args.data,
            authentication: args.authentication,
            success: handleComment,
            error: args.error
        });
    }
    
    //****************************************************
    // LABEL
    //****************************************************
    
    // Create a dummy Label that can be used for an operation
    // like `edit()` or `remove()` that only needs an owner,
    // repo and name
    //  owner - The repository's owner
    //  repo - The repository where the issue is stored
    //  name - The name of a Label
    GitHub.prototype.label = function(owner, repo, name) {
        var that = this;
        if (owner == null) {
            throw "Missing required `owner`";
        }
        if (repo == null) {
            throw "Missing required `repo`";
        }
        if (name == null) {
            throw "Missing required `name`";
        }
        var url = "repos/" + owner + "/" + repo + "/labels/" + name;
        return new Label(that, { name: name, url: url, _state: "idonly" });
    }
    
    // Create a Label
    //  owner - The repository's owner
    //  repo - The repository where the issue is stored
    //  args.data - The data used to create the Label, see
    //     https://developer.github.com/v3/issues/labels/#parameters
    //  args.success - Optional callback to be called on successful
    //     termination of the remote call
    //  args.error - Optional callback to be called on erroneous
    //     termination of the remote call
    //  args.authentication - Optional Authentication to use for the
    //     remote call
    GitHub.prototype.createLabel = function(owner, repo, args) {
        var that = this;
        if (args == null) {
            args = {};
        }
        if (owner == null) {
            throw "Missing required `owner`";
        }
        if (repo == null) {
            throw "Missing required `repo`";
        }
        if (args.data == null) {
            throw "Missing required `args.data`";
        }
        
        function handleLabel(json, status, xhr) {
            if (args.success != null) {
                var gist = new Label(that, json);
                args.success(gist);
            }
        }
        
        var url = "repos/" + owner + "/" + repo + "/labels";
        that._call({
            url: url,
            method: "POST",
            data: args.data,
            authentication: args.authentication,
            success: handleLabel,
            error: args.error
        });
    }
    
    // Returns a List object that can be used to iterate over all the Labels
    // defined for the given repository
    //  owner - The repository's owner
    //  repo - The repository where the issue is stored
    //  args.pageSize - Optional page size to use for the list requests.
    //     NB: not all list queries support this parameter see GitHub API docs
    //  args.maxRequests - Optional number indicating the maximum number of
    //     remote calls the function `each()` will make (default 5)
    //  args.error - Optional callback to be called on erroneous
    //     termination of the remote call
    //  args.authentication - Optional Authentication to use for the
    //     remote call
    GitHub.prototype.labels = function(owner, repo, args) {
        var that = this;
        if (owner == null) {
            throw "Missing required `owner`";
        }
        if (repo == null) {
            throw "Missing required `repo`";
        }
        return that._labels("repos/" + owner + "/" + repo + "/labels", args);
    }
    
    GitHub.prototype._labels = function(url, args) {
        var that = this;
        if (args == null) {
            args = {};
        }
        
        function decodeLabel(json) {
            json["_state"] = "summary";
            return new Label(that, json);
        }
        
        return that._list({
            url: url,
            parameters: args.parameters,
            decode: decodeLabel,
            pageSize: args.pageSize,
            maxRequests: args.maxRequests,
            authentication: args.authentication,
            error: args.error
        });
    }
    
    //////////////////////////////////////////////////////////////////////
    // Object holding Label data
    //  github - A `GitHub` object
    //  data - The information held by the Label, see
    //     https://developer.github.com/v3/issues/labels/#response
    //////////////////////////////////////////////////////////////////////
    function Label(github, data) {
        this.github = github;
        this.data = data;
        var url = data.url;
        if (url == null) {
            throw "Missing required `data.url`";
        }
        var p = url.indexOf("/repos/");
        if (p >= 0) {
            url = url.substring(p + 1);
        }
        this.apiurl = url;
    }
    
    // Fetch the Label
    //  args.success - Optional callback to be called on successful
    //     termination of the remote call
    //  args.error - Optional callback to be called on erroneous
    //     termination of the remote call
    //  args.authentication - Optional Authentication to use for the
    //     remote call
    Label.prototype.fetch = function(args) {
        var that = this;
        if (args == null) {
            args = {};
        }
        
        function handleLabel(json, status, xhr) {
            that.data = json;
            delete that.data._state;
            if (args.success != null) {
                args.success(that);
            }
        }
        
        if (that.data._state) {
            that.github._call({
                url: that.apiurl,
                method: "GET",
                authentication: args.authentication,
                success: handleLabel,
                error: args.error
            });
        }
    }
    
    // Edit a Label
    //  args.data - The data used to edit the Label, see
    //     https://developer.github.com/v3/issues/labels/#update-a-label
    //  args.success - Optional callback to be called on successful
    //     termination of the remote call
    //  args.error - Optional callback to be called on erroneous
    //     termination of the remote call
    //  args.authentication - Optional Authentication to use for the
    //     remote call
    Label.prototype.edit = function(args) {
        var that = this;
        if (args == null) {
            args = {};
        }
        if (args.data == null) {
            throw "Missing required `args.data`";
        }
        
        function handleLabel(json, status, xhr) {
            that.data = json;
            if (args.success != null) {
                args.success(that);
            }
        }
        
        that.github._call({
            url: that.apiurl,
            method: "PATCH",
            data: args.data,
            authentication: args.authentication,
            success: handleLabel,
            error: args.error
        });
    }
    
    // Remove a Label
    //  args.authentication - Authentication to use for the remote call
    //  args.success - Optional callback to be called on successful
    //     termination of the remote call
    //  args.error - Optional callback to be called on erroneous
    //     termination of the remote call
    Label.prototype.remove = function(args) {
        var that = this;
        if (args == null) {
            args = {};
        }
        if (args.authentication == null && that.github.config.authentication == null) {
            throw "Authentication required";
        }
        
        function handleRemove(json, status, xhr) {
            if (args.success != null) {
                args.success(that);
            }
        }
        
        that.github._call({
            url: that.apiurl,
            method: "DELETE",
            authentication: args.authentication,
            success: handleRemove,
            error: args.error
        });
    }
    
    //****************************************************
    // MILESTONE
    //****************************************************
    
    // Create a dummy Milestone that can be used for an operation
    // like `edit()` or `remove()` that only needs an owner,
    // repo and number
    //  owner - The repository's owner
    //  repo - The repository where the issue is stored
    //  number - The number of a Milestone
    GitHub.prototype.milestone = function(owner, repo, number) {
        var that = this;
        if (owner == null) {
            throw "Missing required `owner`";
        }
        if (repo == null) {
            throw "Missing required `repo`";
        }
        if (name == null) {
            throw "Missing required `number`";
        }
        var url = "repos/" + owner + "/" + repo + "/milestones/" + number;
        return new Milestone(that, { number: number, url: url, _state: "idonly" });
    }
    
    // Create a Milestone
    //  owner - The repository's owner
    //  repo - The repository where the issue is stored
    //  args.data - The data used to create the Milestone, see
    //     https://developer.github.com/v3/issues/milestones/#parameters
    //  args.success - Optional callback to be called on successful
    //     termination of the remote call
    //  args.error - Optional callback to be called on erroneous
    //     termination of the remote call
    //  args.authentication - Optional Authentication to use for the
    //     remote call
    GitHub.prototype.createMilestone = function(owner, repo, args) {
        var that = this;
        if (args == null) {
            args = {};
        }
        if (owner == null) {
            throw "Missing required `owner`";
        }
        if (repo == null) {
            throw "Missing required `repo`";
        }
        if (args.data == null) {
            throw "Missing required `args.data`";
        }
        
        function handleMilestone(json, status, xhr) {
            if (args.success != null) {
                var gist = new Milestone(that, json);
                args.success(gist);
            }
        }
        
        var url = "repos/" + owner + "/" + repo + "/milestones";
        that._call({
            url: url,
            method: "POST",
            data: args.data,
            authentication: args.authentication,
            success: handleMilestone,
            error: args.error
        });
    }
    
    // Returns a List object that can be used to iterate over all the Milestones
    // defined for the given repository
    //  owner - The repository's owner
    //  repo - The repository where the issue is stored
    //  args.parameters - Optional parameters to pass to the search
    //     query, see https://developer.github.com/v3/issues/milestones/#parameters
    //  args.pageSize - Optional page size to use for the list requests.
    //     NB: not all list queries support this parameter see GitHub API docs
    //  args.maxRequests - Optional number indicating the maximum number of
    //     remote calls the function `each()` will make (default 5)
    //  args.error - Optional callback to be called on erroneous
    //     termination of the remote call
    //  args.authentication - Optional Authentication to use for the
    //     remote call
    GitHub.prototype.milestones = function(owner, repo, args) {
        var that = this;
        if (owner == null) {
            throw "Missing required `owner`";
        }
        if (repo == null) {
            throw "Missing required `repo`";
        }
        return that._milestones("repos/" + owner + "/" + repo + "/milestones", args);
    }
    
    GitHub.prototype._milestones = function(url, args) {
        var that = this;
        if (args == null) {
            args = {};
        }
        
        function decodeMilestone(json) {
            json["_state"] = "summary";
            return new Milestone(that, json);
        }
        
        return that._list({
            url: url,
            parameters: args.parameters,
            decode: decodeMilestone,
            pageSize: args.pageSize,
            maxRequests: args.maxRequests,
            authentication: args.authentication,
            error: args.error
        });
    }
    
    //////////////////////////////////////////////////////////////////////
    // Object holding Milestone data
    //  github - A `GitHub` object
    //  data - The information held by the Milestone, see
    //     https://developer.github.com/v3/issues/milestones/#response
    //////////////////////////////////////////////////////////////////////
    function Milestone(github, data) {
        this.github = github;
        this.data = data;
        var url = data.url;
        if (url == null) {
            throw "Missing required `data.url`";
        }
        var p = url.indexOf("/repos/");
        if (p >= 0) {
            url = url.substring(p + 1);
        }
        this.apiurl = url;
    }
    
    // Fetch the Milestone
    //  args.success - Optional callback to be called on successful
    //     termination of the remote call
    //  args.error - Optional callback to be called on erroneous
    //     termination of the remote call
    //  args.authentication - Optional Authentication to use for the
    //     remote call
    Milestone.prototype.fetch = function(args) {
        var that = this;
        if (args == null) {
            args = {};
        }
        
        function handleMilestone(json, status, xhr) {
            that.data = json;
            delete that.data._state;
            if (args.success != null) {
                args.success(that);
            }
        }
        
        if (that.data._state) {
            that.github._call({
                url: that.apiurl,
                method: "GET",
                authentication: args.authentication,
                success: handleMilestone,
                error: args.error
            });
        }
    }
    
    // Edit a Milestone
    //  args.data - The data used to edit the Milestone, see
    //     https://developer.github.com/v3/issues/milestones/#update-a-milestone
    //  args.success - Optional callback to be called on successful
    //     termination of the remote call
    //  args.error - Optional callback to be called on erroneous
    //     termination of the remote call
    //  args.authentication - Optional Authentication to use for the
    //     remote call
    Milestone.prototype.edit = function(args) {
        var that = this;
        if (args == null) {
            args = {};
        }
        if (args.data == null) {
            throw "Missing required `args.data`";
        }
        
        function handleMilestone(json, status, xhr) {
            that.data = json;
            if (args.success != null) {
                args.success(that);
            }
        }
        
        that.github._call({
            url: that.apiurl,
            method: "PATCH",
            data: args.data,
            authentication: args.authentication,
            success: handleMilestone,
            error: args.error
        });
    }
    
    // Remove a Milestone
    //  args.authentication - Authentication to use for the remote call
    //  args.success - Optional callback to be called on successful
    //     termination of the remote call
    //  args.error - Optional callback to be called on erroneous
    //     termination of the remote call
    Milestone.prototype.remove = function(args) {
        var that = this;
        if (args == null) {
            args = {};
        }
        if (args.authentication == null && that.github.config.authentication == null) {
            throw "Authentication required";
        }
        
        function handleRemove(json, status, xhr) {
            if (args.success != null) {
                args.success(that);
            }
        }
        
        that.github._call({
            url: that.apiurl,
            method: "DELETE",
            authentication: args.authentication,
            success: handleRemove,
            error: args.error
        });
    }
    
    //****************************************************
    // GIST
    //****************************************************
    
    // Create a dummy Gist that can be used for operations
    // like `edit()` and `remove()` that only need an id
    //  id - The id of a Gist
    GitHub.prototype.gist = function(id) {
        var that = this;
        if (id == null) {
            throw "Missing required `id`";
        }
        return new Gist(that, { id: id, _state: "idonly" });
    }
    
    // Create a Gist
    //  args.data - The data used to create the Gist, see
    //     https://developer.github.com/v3/gists/#create-a-gist
    //  args.success - Optional callback to be called on successful
    //     termination of the remote call
    //  args.error - Optional callback to be called on erroneous
    //     termination of the remote call
    //  args.authentication - Optional Authentication to use for the
    //     remote call
    GitHub.prototype.createGist = function(args) {
        var that = this;
        if (args == null) {
            args = {};
        }
        if (args.data == null) {
            throw "Missing required `args.data`";
        }
        if (args.data.files == null) {
            throw "Missing required `args.data.files`";
        }
        
        function handleGist(json, status, xhr) {
            if (args.success != null) {
                var gist = new Gist(that, json);
                args.success(gist);
            }
        }
        
        that._call({
            url: "gists",
            method: "POST",
            data: args.data,
            authentication: args.authentication,
            success: handleGist,
            error: args.error
        });
    }
    
    // Returns a List object that can be used to iterate over an
    // authenticated user's Gists or over all public Gists if called
    // anonymously
    //  args.parameters - Optional parameters to pass to the search
    //     query, see https://developer.github.com/v3/gists/#parameters
    //  args.pageSize - Optional page size to use for the list requests.
    //     NB: not all list queries support this parameter see GitHub API docs
    //  args.maxRequests - Optional number indicating the maximum number of
    //     remote calls the function `each()` will make (default 5)
    //  args.error - Optional callback to be called on erroneous
    //     termination of the remote call
    //  args.authentication - Optional Authentication to use for the
    //     remote call
    GitHub.prototype.gists = function(args) {
        var that = this;
        return that._gists("gists", args);
    }
    
    // Returns a List object that can be used to iterate over all public Gists
    //  args.parameters - Optional parameters to pass to the search
    //     query, see https://developer.github.com/v3/gists/#parameters
    //  args.pageSize - Optional page size to use for the list requests.
    //     NB: not all list queries support this parameter see GitHub API docs
    //  args.maxRequests - Optional number indicating the maximum number of
    //     remote calls the function `each()` will make (default 5)
    //  args.error - Optional callback to be called on erroneous
    //     termination of the remote call
    //  args.authentication - Optional Authentication to use for the
    //     remote call
    GitHub.prototype.publicGists = function(args) {
        var that = this;
        return that._gists("gists/public", args);
    }
    
    // Returns a List object that can be used to iterate over all an
    // authenticated user's starred Gists
    //  args.parameters - Optional parameters to pass to the search
    //     query, see https://developer.github.com/v3/gists/#parameters
    //  args.pageSize - Optional page size to use for the list requests.
    //     NB: not all list queries support this parameter see GitHub API docs
    //  args.maxRequests - Optional number indicating the maximum number of
    //     remote calls the function `each()` will make (default 5)
    //  args.error - Optional callback to be called on erroneous
    //     termination of the remote call
    //  args.authentication - Optional Authentication to use for the
    //     remote call
    GitHub.prototype.starredGists = function(args) {
        var that = this;
        return that._gists("gists/starred", args);
    }

    GitHub.prototype._gists = function(url, args) {
        var that = this;
        if (args == null) {
            args = {};
        }
        
        function decodeGist(json) {
            json["_state"] = "summary";
            return new Gist(that, json);
        }
        
        return that._list({
            url: url,
            parameters: args.parameters,
            decode: decodeGist,
            pageSize: args.pageSize,
            maxRequests: args.maxRequests,
            authentication: args.authentication,
            error: args.error
        });
    }
    
    //////////////////////////////////////////////////////////////////////
    // Object holding Gist data
    //  github - A `GitHub` object
    //  data - The information held by the Gist, see
    //     https://developer.github.com/v3/gists/#response
    //////////////////////////////////////////////////////////////////////
    function Gist(github, data) {
        this.github = github;
        this.data = data;
        this.apiurl = "gists/" + data.id;
    }
    
    // Fetch the Gist
    //  args.revision - Optional SHA of the revision to retrieve
    //  args.success - Optional callback to be called on successful
    //     termination of the remote call
    //  args.error - Optional callback to be called on erroneous
    //     termination of the remote call
    //  args.authentication - Optional Authentication to use for the
    //     remote call
    Gist.prototype.fetch = function(args) {
        var that = this;
        if (args == null) {
            args = {};
        }
        
        function handleGist(json, status, xhr) {
            that.data = json;
            delete that.data._state;
            if (args.success != null) {
                args.success(that);
            }
        }
        
        if (that.data._state) {
            var url = that.apiurl;
            if (args.revision != null) {
                url = url + "/" + args.revision;
            }
            that.github._call({
                url: url,
                method: "GET",
                authentication: args.authentication,
                success: handleGist,
                error: args.error
            });
        }
    }
    
    // Edit a Gist
    //  args.data - The data used to edit the Gist, see
    //     https://developer.github.com/v3/gists/#edit-a-gist
    //  args.success - Optional callback to be called on successful
    //     termination of the remote call
    //  args.error - Optional callback to be called on erroneous
    //     termination of the remote call
    //  args.authentication - Optional Authentication to use for the
    //     remote call
    Gist.prototype.edit = function(args) {
        var that = this;
        if (args == null) {
            args = {};
        }
        if (args.data == null) {
            throw "Missing required `args.data`";
        }
        
        function handleGist(json, status, xhr) {
            that.data = json;
            if (args.success != null) {
                args.success(that);
            }
        }
        
        that.github._call({
            url: that.apiurl,
            method: "PATCH",
            data: args.data,
            authentication: args.authentication,
            success: handleGist,
            error: args.error
        });
    }
    
    // Remove a Gist
    //  args.success - Optional callback to be called on successful
    //     termination of the remote call
    //  args.error - Optional callback to be called on erroneous
    //     termination of the remote call
    //  args.authentication - Optional Authentication to use for the
    //     remote call
    Gist.prototype.remove = function(args) {
        var that = this;
        if (args == null) {
            args = {};
        }
        if (args.authentication == null && that.github.config.authentication == null) {
            throw "Authentication required";
        }
        
        function handleRemove(json, status, xhr) {
            if (args.success != null) {
                args.success(that);
            }
        }
        
        that.github._call({
            url: that.apiurl,
            method: "DELETE",
            authentication: args.authentication,
            success: handleRemove,
            error: args.error
        });
    }
    
    // Returns a List object that can be used to iterate over all the
    // comments of this Gist
    //  args.pageSize - Optional page size to use for the list requests.
    //     NB: not all list queries support this parameter see GitHub API docs
    //  args.maxRequests - Optional number indicating the maximum number of
    //     remote calls the function `each()` will make (default 5)
    //  args.error - Optional callback to be called on erroneous
    //     termination of the remote call
    //  args.authentication - Optional Authentication to use for the
    //     remote call
    Gist.prototype.comments = function(args) {
        var that = this;
        return that.github._comments(that.apiurl + "/comments", that, args);
    }

    // Create a Comment
    //  args.data - The data used to create the Comment, see https://developer.github.com/v3/gists/comments/#create-a-comment
    //  args.success - Optional callback to be called on successful
    //     termination of the remote call
    //  args.error - Optional callback to be called on erroneous
    //     termination of the remote call
    //  args.authentication - Optional Authentication to use for the
    //     remote call
    Gist.prototype.createComment = function(args) {
        var that = this;
        if (args == null) {
            args = {};
        }
        if (args.data == null) {
            throw "Missing required `args.data`";
        }
        
        function handleComment(json, status, xhr) {
            if (args.success != null) {
                var comment = new Comment(that.github, that, json);
                args.success(comment);
            }
        }
        
        that.github._call({
            url: that.apiurl + "/comments",
            method: "POST",
            data: args.data,
            authentication: args.authentication,
            success: handleComment,
            error: args.error
        });
    }
    
    //****************************************************
    // COMMENT
    //****************************************************
    
    // Returns a List object that can be used to iterate over a repository's Comments
    //  owner - The name of a repository's owner
    //  repo - The name of a repository
    //  args.parameters - Optional parameters to pass to the search
    //     query, https://developer.github.com/v3/issues/comments/#parameters-1
    //  args.pageSize - Optional page size to use for the list requests.
    //     NB: not all list queries support this parameter see GitHub API docs
    //  args.maxRequests - Optional number indicating the maximum number of
    //     remote calls the function `each()` will make (default 5)
    //  args.error - Optional callback to be called on erroneous
    //     termination of the remote call
    //  args.authentication - Optional Authentication to use for the
    //     remote call
    GitHub.prototype.repositoryComments = function(owner, repo, args) {
        var that = this;
        if (owner == null) {
            throw "Missing required `owner`";
        }
        if (repo == null) {
            throw "Missing required `repo`";
        }
        return that._comments("repos/" + owner + "/" + repo + "/issues/comments", null, args);
    }
    
    GitHub.prototype._comments = function(url, item, args) {
        var that = this;
        if (args == null) {
            args = {};
        }
        
        function decodeComment(json) {
            json["_state"] = "summary";
            return new Comment(that, item, json);
        }
        
        return that._list({
            url: url,
            parameters: args.parameters,
            decode: decodeComment,
            pageSize: args.pageSize,
            maxRequests: args.maxRequests,
            authentication: args.authentication,
            error: args.error
        });
    }
    
    //////////////////////////////////////////////////////////////////////
    // Object holding Comment data
    //  github - A `GitHub` object
    //  item - The GitHub object the comment is meant for, eg. a `Gist`
    //  data - The information held by the Comment, see
    //     https://developer.github.com/v3/gists/comments/#response
    //     https://developer.github.com/v3/issues/comments/#response
    //////////////////////////////////////////////////////////////////////
    function Comment(github, item, data) {
        this.github = github;
        this.item = item;
        this.data = data;
    }
    
    // Edit a Comment
    //  args.data - The data used to edit the Comment, see
    //     https://developer.github.com/v3/gists/comments/#edit-a-comment
    //     https://developer.github.com/v3/issues/comments/#edit-a-comment
    //  args.success - Optional callback to be called on successful
    //     termination of the remote call
    //  args.error - Optional callback to be called on erroneous
    //     termination of the remote call
    //  args.authentication - Optional Authentication to use for the
    //     remote call
    Comment.prototype.edit = function(args) {
        var that = this;
        if (args == null) {
            args = {};
        }
        if (args.data == null) {
            throw "Missing required `args.data`";
        }
        
        function handleCommit(json, status, xhr) {
            that.data = json;
            if (args.success != null) {
                args.success(that);
            }
        }
        
        that.github._call({
            url: that.apiurl,
            method: "PATCH",
            data: args.data,
            authentication: args.authentication,
            success: handleCommit,
            error: args.error
        });
    }
    
    // Remove a Comment
    //  args.success - Optional callback to be called on successful
    //     termination of the remote call
    //  args.error - Optional callback to be called on erroneous
    //     termination of the remote call
    //  args.authentication - Optional Authentication to use for the
    //     remote call
    Comment.prototype.remove = function(args) {
        var that = this;
        if (args == null) {
            args = {};
        }
        
        function handleRemove(json, status, xhr) {
            if (args.success != null) {
                args.success(that);
            }
        }
        
        if (item.apiurl == null) {
            throw "Removing comments not supported for " + item.constructor.name;
        }
        var url = item.apiurl + "/comments/" + that.data.id;
        that.github._call({
            url: url,
            method: "DELETE",
            authentication: args.authentication,
            success: handleComment,
            error: args.error
        });
    }
    
    //****************************************************
    // Lists
    //****************************************************
    
    // Private function that handles remote calls returning lists.
    // Returns an object that can be used to iterate over the items.
    //  args.url - The URL part that added to the `config.rootUrl`
    //     forms the actual URL to use for the remote list call
    //  args.parameters - Optional parameters to pass to the search query
    //  args.decode - Optional decoder function that takes a JSON object
    //     and returns a user-defined object
    //  args.pageSize - Optional page size to use for the list requests.
    //     NB: not all list queries support this parameter see GitHub API docs
    //  args.maxRequests - Optional number indicating the maximum number of
    //     remote calls the function `each()` will make (default 5)
    //  args.error - Optional callback to be called on erroneous
    //     termination of any remote calls
    //  args.authentication - Optional Authentication to use for the
    //     remote calls
    GitHub.prototype._list = function(args) {
        var that = this;
        return new List(that, args);
    }
    
    //////////////////////////////////////////////////////////////////////
    // Object for handling lists
    //  data.url - The URL part that added to the `config.rootUrl`
    //     forms the actual URL to use for the remote list call
    //  data.parameters - Optional parameters to pass to the search query
    //  data.decode - Optional decoder function that takes a JSON object
    //     and returns a user-defined object
    //  data.pageSize - Optional page size to use for the list requests.
    //     NB: not all list queries support this parameter see GitHub API docs
    //  data.maxRequests - Optional number indicating the maximum number of
    //     remote calls the function `each()` will make (default 5)
    //  data.error - Optional callback to be called on erroneous
    //     termination of any remote calls
    //  data.authentication - Optional Authentication to use for the
    //     remote calls
    //////////////////////////////////////////////////////////////////////
    function List(github, data) {
        this.github = github;
        this.data = data;
        if (data.url == null) {
            throw "Missing required `data.url`";
        }
        
        this.pages = [];
        this.pageCount = -1;
        this.size = 0;
    }

    List.prototype.hasMoreElements = function(args) {
        return this.pageCount < 0;
    }
    
    // Iterate over the elements in a remote list automatically fetching
    // pages of information one at a time by making remote remote calls.
    // Can also be called by just passing a function directly as its
    // first and only argument or by passing an object:
    //  args.func - The function to call for each element in the list
    //  args.page - Optional starting page (default 1)
    //  args.finish - Optional function to call at the end of the
    //     iteration
    List.prototype.each = function(args) {
        var that = this;

        var func, page, requestCount;
        if (typeof args === "function") {
            args = { func: args };
        }
        
        return that._each(args);
    }
    
    // Just like `each()` except that it doesn't start over from the
    // beginning on every call but starts where the previous call
    // left off. When there are no pages left to fetch this method
    // won't do anything and just return `null`
    List.prototype.next = function(args) {
        var that = this;

        var func, page, requestCount;
        if (typeof args === "function") {
            args = { func: args };
        }
        args.page = args.page || that.pages.length + 1;
        
        return that._each(args);
    }
    
    List.prototype._each = function(args) {
        var that = this;

        var func, page, requestCount;
        if (args.func == null) {
            throw "Missing required `args.func`";
        }
        func = args.func;
        page = args.page || 1;
        requestCount = args._requestCount || 0;
        
        var idx = 0;
        if (page != null && page > 0) {
            idx = page - 1;
        }
        var i;
        var items = that.pages[idx];
        while (items != null) {
            for (i = 0; i < items.length; i++) {
                if (func(items[i]) == false) {
                    return;
                }
            }
            idx++;
            items = that.pages[idx];
        }
        
        function continueEach(is) {
            that.size += is.length;
            that.each({
                func: func,
                finish: args.finish,
                page: idx + 1,
                _requestCount: requestCount + 1
            });
        }
        
        var maxRequests = that.data.maxRequests || that.github.config.maxRequests;
        if (requestCount < maxRequests && (that.pageCount < 0 || idx < that.pageCount)) {
            that._fetch({
                page: idx + 1,
                success: continueEach
            });
            args.page = idx + maxRequests + 1;
            return args;
        } else if (args.finish != null) {
            args.finish(that);
        }
        return null;
    }
    
    // Private function that fetches a page of data from a remote list
    //  args.success - Callback to be called on successful
    //     termination of the remote call
    //  args.page - Optional page number to fetch (default 1)
    List.prototype._fetch = function(args) {
        var that = this;
        if (args == null) {
            args = {};
        }
        if (args.success == null) {
            throw "Missing required `args.success`";
        }
        
        var idx = 0;
        if (args.page != null && args.page > 0) {
            idx = args.page - 1;
        }
        if (that.pages[idx] != null) {
            return;
        }
        
        function handleList(json, status, xhr) {
            var items = [];
            $.each(json, function(index, item) {
                item["_state"] = "summary";
                if (that.data.decode != null) {
                    // We have a decoder that turns JSON into Objects
                    item = that.data.decode(item);
                }
                items.push(item);
            });
            that.pages[idx] = items;
            var link = xhr.getResponseHeader("Link");
            if (link == null || link.indexOf('rel="next"') < 0) {
                that.pageCount = idx + 1;
            }
            that.lastPage = idx + 1;
            args.success(items);
        }
        
        var data = that.data.parameters || {};
        data.page = idx + 1;
        var pageSize = that.data.pageSize || that.github.config.pageSize;
        if (pageSize != null) {
            data.per_page = pageSize;
        }
        
        that.github._call({
            url: that.data.url,
            data: data,
            method: "GET",
            authentication: that.data.authentication,
            success: handleList,
            error: that.data.error
        });
    }
    
    //****************************************************
    // Authentication
    //****************************************************
    
    //////////////////////////////////////////////////////////////////////
    // Object used for authentication
    //  data.type - Either "basic" or "oauth"
    // For "basic":
    //  data.username - The username to authenticate with
    //  data.password - The password to use
    // For "oauth":
    //  data.token - The token to use for authentication, see
    //     https://developer.github.com/v3/oauth/
    //////////////////////////////////////////////////////////////////////
    function Authentication(data) {
        this.type = data.type;
        this.username = data.username;
        this.password = data.password;
        this.token = data.token;
    }
    
    Authentication.prototype.apply = function(jqargs, hdr, params) {
        var that = this;
        if (that.type == "oauth" && that.token != null) {
            hdr["Authorization"] = "token " + that.token;
        } else if (that.type == "basic") {
            var encuser = encodeURIComponent(escape(that.username));
            var encpwd = encodeURIComponent(escape(that.password));
            hdr["Authorization"] = "Basic " + btoa(encuser + ":" + encpwd);
        }
    }
    
    //****************************************************
    // Rates
    //****************************************************
    
    GitHub.prototype.rateLimit = function(args) {
        var that = this;
        if (args == null) {
            args = {};
        }
        
        that._call({
            url: "/rate_limit",
            method: "GET",
            data: args.data,
            authentication: args.authentication,
            success: args.success,
            error: args.error
        });
    }
    
    //****************************************************
    // Importing
    //****************************************************
    
    GitHub.prototype.importIssue = function(owner, repo, args) {
        var that = this;
        if (args == null) {
            args = {};
        }
        if (owner == null) {
            throw "Missing required `owner`";
        }
        if (repo == null) {
            throw "Missing required `repo`";
        }
        if (args.data == null) {
            throw "Missing required `args.data`";
        }
        
        var url = "repos/" + owner + "/" + repo + "/import/issues";
        that._call({
            url: url,
            method: "POST",
            headers: {
                "Accept": "application/vnd.github.golden-comet-preview"
            },
            data: args.data,
            authentication: args.authentication,
            success: args.success,
            error: args.error
        });
    }
    
    GitHub.prototype.importStatus = function(owner, repo, args) {
        var that = this;
        if (args == null) {
            args = {};
        }
        if (owner == null) {
            throw "Missing required `owner`";
        }
        if (repo == null) {
            throw "Missing required `repo`";
        }
        if (args.data == null) {
            throw "Missing required `args.data`";
        }
        
        var url = "repos/" + owner + "/" + repo + "/import/issues/" + args.data.id;
        that._call({
            url: url,
            method: "GET",
            headers: {
                "Accept": "application/vnd.github.golden-comet-preview"
            },
            authentication: args.authentication,
            success: args.success,
            error: args.error
        });
    }
    
    exports.GitHub = GitHub;
    exports.Authentication = Authentication;
}));
