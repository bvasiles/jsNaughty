(function () {

/**
 * URL参数串处理类
 * @author mytharcher
 * @update 2010-2-3
 * 
 * @param {Sting|Object} p 初始化的url串，如果不传入则作为空参数处理，只建立参数结构
 * 
 * @method initialize() 初始化参数对象
 * @method get() 获取参数对象集或某个对象
 * @method set() 设置参数(增加/删除/修改)
 * 
 * @method toString() 输出为url参数格式串
 */
function URLParameter() {
	this.initialize.apply(this, arguments);
}

/**
 * 将一个参数串转化成JSON类型
 * @static
 * 
 * @param {String} p
 * @param {Function} decoder 解码器函数，非必选
 */
URLParameter.parseJSON = function (p, decoder) {
	var param = {};
	
	if (p.indexOf('?') == 0) {
		p = p.substr(1);
	}
	p = p.split('&');
	
	var paramFlag = {};
	
	for (var i = 0, l = p.length; i < l; i++) {
		if (p[i]) {
			var pair = p[i].split('=');
			var key = pair[0], value = pair[1];
			value = typeof decoder == 'function' ? decoder(value) : value;
			if (!paramFlag[key]) {
				param[key] = [value];
				paramFlag[key] = 1;
			} else {
				param[key].push(value);
			}
		}
	}
	
	return param;
};

URLParameter.prototype = {
	/**
	 * @private
	 */
	//_param: {},
	
	/**
	 * 获取参数
	 * 
	 * @public
	 * 
	 * @param {null|String} key
	 * @return {Array|String|Object|null}
	 */
	get: function (key) {
		var param = this._param;
		return key ? (param[key] ? (param[key].length == 1 ? param[key][0] : param[key]) : null) : param;
	},
	
	/**
	 * 设置参数
	 * 
	 * @public
	 * 
	 * @param {Object} value key:value形式 当参数是object时，会遍历p中的键名，如果值不是一个数组，将被转化成一个数组
	 * @param {String} value 需要设置的参数名，或新的url参数串，如果不传入value，那么就按照url参数格式解析并对param扩展
	 * @param {String} value 需要设置的参数值，如果为null，则remove掉这个参数
	 * 
	 * @return URLParameter
	 */
	set: function (p, value) {
		if (typeof p != 'undefined') {
			var param = this._param;
			if (typeof value == 'undefined') {
				if (p instanceof URLParameter) {
					if (p == this) {
						return this;
					} else {
						return this.set(p.getParameter());
					}
				} else {
					if (typeof p != 'object') {
						p = URLParameter.parseJSON(p);
					}
					for (var i in p) {
						this.set(i, p[i]);
					}
				}
			} else 
				if (typeof p == 'string' && p != '') {
					if (value === null) {
						delete param[p];
					} else {
						param[p] = value && value instanceof Array ? value : [value];
					}
				}
		}
		return this;
	},
	
	/**
	 * 输出为字符串
	 * @public
	 * @param {Function} encoder 传入对所有参数值进行编码的函数，默认不编码
	 */
	toString: function (encoder) {
		var param = this._param;
		var ret = [];
		for(var i in param){
			if(i.toString().length && param[i] != undefined && param[i] != null){
				var p = param[i];
				
				if (typeof encoder == 'function') {
					for (var j = 0, len = p.length; j < len; j++) {
						ret.push('&', i, '=', encoder(p[j]));
					}
				} else {
					ret.push('&', i, '=', p.join('&' + i + '='));
				}
			}
		}
		ret.shift();
		return ret.join('');
	},
	
	/**
	 * 初始化，不同于setParameter函数，而是构造一个新的param
	 */
	initialize: function() {
		this._param = {};
		return this.set.apply(this, arguments);
	}
};

var baidu = window.baidu = window.baidu || {};
var more = baidu.more = baidu.more || {};

more.URLParameter = URLParameter;

})();
