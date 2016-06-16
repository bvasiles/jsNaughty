var rconsole = function () {
    function makelog(level, w) {
	$.ajax('/rconsole/' + level, {
		data: {w: w},
		success: function () {}
	    });
    }

    return {
	log: function (w) { makelog('log', w); },
	info: function (w) { makelog('info', w); }
    }
}();

if(window.exports == undefined) {
    window.exports = {};
}

window.load_template = function(callback) {
    var ver = check_version();
    return $.ajax('/mobile/pub.' + ver + '/dashboard/template.html', {
	    cache: true,
	    success: function (resp) {
		if(typeof resp == 'string') {
		    document.body.innerHTML += resp;
		} else if(resp.status == 200) {
		    document.body.innerHTML += resp.responseText;
		}
		if(typeof callback == 'function') {
		    callback();
		}
	    },
	    error: function (err, resp) {
		rconsole.error(err, resp);
		//window.location = '/';
	    }
	});
}

function process_status_dom(dom) {
    $('a.former', dom).each(function () {
	    var userid = $(this).attr('href').replace(/.*\//g, '');
	    $(this).addClass('user')
		.attr('href', '#')
		.attr('rel', userid);
	});
    $('a', dom).each(function () {
	    var href = $(this).attr('href').replace('http://fanfou.com/', '#!/');
	    
	    if(/^\/q\/./.test(href)) {
		$(this).attr('href', '#!/q/' + encodeURIComponent(href.substr(3)));
	    }
	});
}

function parse_date(reprdate) {
    function tendigit(d) {
	if(d < 10) {
	    return '0' + d;
	} else {
	    return '' + d;
	}
    }
    var date = new Date(reprdate);
    var currDate = new Date();
    if(date.getFullYear() != currDate.getFullYear()) {
	return date.getFullYear() + '年';
    } else if (date.getMonth() != currDate.getMonth() ||
	       date.getDate() != currDate.getDate()){
	return (date.getMonth() + 1) + '月' + date.getDate() + '日';
    } else {
	// Same day
	return tendigit(date.getHours()) + ':' + tendigit(date.getMinutes());
    }
}

window.check_version = function() {
    var t = /^\/(\w+)\/p\/(\d+)/.exec(window.location.pathname);
    if(t) {
	var ver = t[2];
	var curr_ver = localStorage.getItem('version');
	if(ver != curr_ver) {
	    localStorage.setItem('version', ver);
	}
	return ver;
    }
}

function ModelCache(model, prefix) {
    var _cache = {};
    var _model = model;
    var _prefix = prefix + '_';

    function erase(key) {
	localStorage.removeItem(_prefix + key);
    }

    function get(key) {
       var json = localStorage.getItem(_prefix + key);
       if(json) {
	   //return JSON.parse(json);
	   return new _model(JSON.parse(json));
	} else {
	    return null;
	}
    }

    function set(key, obj) {
	localStorage.setItem(_prefix + key, JSON.stringify(obj.toJSON()));
    }

    function updateModel(key, obj, use_set) {
	var orig = get(key);
	if(orig &&
	   typeof orig == 'object' &&
	   typeof obj == 'object') {
	    orig.set(obj);
	    set(key, orig);
	} else if(use_set){
	    set(key, new _model(obj));
	}
    }

    function getModel(key, url, opts) {
        if(typeof opts == 'function') {
            opts = {'success': opts};
        }
        var u = get(key);
        if(u) {
            // Cache hit.
            opts.success(u);
            return;
        }
        
        // Request from server
        u = new _model();
        u.url = url;
        u.fetch({
		success: function (data) {
		    if(key == '*') {
			set(data.id, data);
		    }
		    set(key, data);

		    if(typeof opts.success == 'function') {
			opts.success(data);
		    } else {
			console.warn('opts.success is not a function');
		    }
		},
		error: function () {
		    if(typeof opts.error == 'function') {
			opts.error.apply(u, arguments);
		    } else {
			App.notifyTitle('找不着对象' + key);
		    }
		}
	    });
    }
    return {
        'get': get,
        'set': set,
	'erase': erase,
	'getModel': getModel,
	'updateModel': updateModel
	    };
}
