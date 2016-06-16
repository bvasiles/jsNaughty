/**
* @class Oskari.liikennevirasto.bundle.lakapa.LaKaPaShowFAQBundleInstance
*
* Registers and starts the
* Oskari.liikennevirasto.bundle.lakapa.TransportSelectorBundleInstance plugin for main map.
*/
Oskari.clazz.define("Oskari.liikennevirasto.bundle.lakapa.LaKaPaShowFAQBundleInstance",

	/**
	* @method create called automatically on construction
	* @static
	*/
	function() {
	this.sandbox = null;
	this.started = false;
	this._localization = null;
	this.requestHandlers = {};
	}, {
		/**
		* @static
		* @property __name
		*/
		__name : 'LaKaPaShowFAQBundle',

		/**
		* @method getName
		* @return {String} the name for the component
		*/
		getName : function() {
			return this.__name;
		},
		/**
		* @method getLocalization
		* Returns JSON presentation of bundles localization data for
		* current language.
		* If key-parameter is not given, returns the whole localization
		* data.
		*
		* @param {String} key (optional) if given, returns the value for
		*	key
		* @return {String/Object} returns single localization string or
		*	JSON object for complete data depending on localization
		*	structure and if parameter key is given
		*/
		getLocalization : function(key) {
			if(!this._localization) {
				this._localization = Oskari.getLocalization(this.getName());
			}
			if(key) {
				return this._localization[key];
			}
			return this._localization;
		},
		/**
		* @method setSandbox
		* @param {Oskari.mapframework.sandbox.Sandbox} sandbox
		* Sets the sandbox reference to this component
		*/
		setSandbox : function(sbx) {
			this.sandbox = sbx;
		},
		/**
		* @method getSandbox
		* @return {Oskari.mapframework.sandbox.Sandbox}
		*/
		getSandbox : function() {
			return this.sandbox;
		},
		/**
		* @method start
		* BundleInstance protocol method
		*/
		start : function() {
			var me = this;
			if(me.started){
				return;
			}
			var conf = me.conf;

			me.started = true;

			var conf = this.conf;
			var sandboxName = ( conf ? conf.sandbox : null ) || 'sandbox' ;
			var sandbox = Oskari.getSandbox(sandboxName);
			me.sandbox = sandbox;

			sandbox.register(me);
			var mapModule = sandbox.findRegisteredModuleInstance('MainMapModule');
			var locale = this.getLocalization('display');

			var reqBuilder = sandbox.getRequestBuilder('Toolbar.AddToolButtonRequest');
	        if(reqBuilder) {
	            // got builder -> toolbar is loaded
	            sandbox.request(me, reqBuilder('lakapa-faq', 'lakapahelptools', {
	                iconCls : 'tool-lakapa-faq-icon',
	                tooltip: locale.tooltips.faqtool,
	                sticky: false,
	                callback : function() {
	                    me.showFAQ();
	                }
	            }));
	        }
		},
		/**
		 * @method show FAQ
		 * @public
		 */
		showFAQ: function(){
		    var me = this;
		    if(me.conf.link !== null && me.conf.link != ''){
		        window.open(me.conf.link);
		    }
		},
		/**
		* @method stop
		* BundleInstance protocol method
		*/
		stop : function() {
			var sandbox = this.sandbox();
			for(p in this.eventHandlers) {
				sandbox.unregisterFromEventByName(this, p);
			}

			this.sandbox.unregister(this);
			this.started = false;
		},
		/**
		* @method init
		* implements Module protocol init method - initializes request handlers
		*/
		init : function() {

		},
		/**
		* @method update
		* BundleInstance protocol method
		*/
		update : function() {
		}
	}, {
	/**
	* @property {String[]} protocol
	* @static
	*/
	protocol : ['Oskari.bundle.BundleInstance', 'Oskari.mapframework.module.Module', 'Oskari.userinterface.Extension']
});