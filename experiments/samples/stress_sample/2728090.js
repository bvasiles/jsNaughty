/// <reference path="/Areas/Umbraco/Scripts/Umbraco.System/NamespaceManager.js" />
/// <reference path="/Areas/Umbraco/Modules/UmbracoTabs/UmbracoTabs.js" />

Umbraco.System.registerNamespace("Umbraco.Editors");

(function ($, Base) {

    Umbraco.Editors.LanguageEditor = Base.extend({

        _opts: null,

        _editorViewModel: null,

        constructor: function () {

            this._editorViewModel = $.extend({}, Umbraco.System.BaseViewModel, {
                parent: this, // Allways set
                selectedLanguageCode: ko.observable(""),
                installedLanguages: [],
                fallbackLanguageCodes: ko.observableArray([])
            });

            this._editorViewModel.fallbackLanguages = ko.dependentObservable(function() {
                return ko.utils.arrayMap(this.fallbackLanguageCodes(), function(item) {
                    return ko.utils.arrayFirst(this.installedLanguages, function(choice) {
                        return item === choice.value;
                    });
                }.bind(this));
            }, this._editorViewModel);
            
        },
        
        init: function (o) {

            $(".selected").sortable();
                
            this._opts = $.extend({
                //the hidden field to track the active tab index
                activeTabIndexField: true,
                //the active tab index to show on load
                activeTabIndex: ""
            }, o);
                
            //override the default index if it's zero and the query string exists
            if ($u.Sys.QueryStringHelper.getQueryStringValue("tabindex")) {
                this._opts.activeTabIndex = $u.Sys.QueryStringHelper.getQueryStringValue("tabindex");
            }
                
            //create the tabs			
            $("#tabs").umbracoTabs({
                content: "#editorContent",
                activeTabIndex: this._opts.activeTabIndex,
                activeTabIndexField: this._opts.activeTabIndexField
            });

            //create the toolbar UI Element panel
            $("#editorBar .container").UIPanel("Default");
                
            //populate the view model
            this._editorViewModel.installedLanguages = this._opts.installedLanguages;
            this._editorViewModel.fallbackLanguageCodes(this._opts.fallbackLanguageCodes);
            this._editorViewModel.selectedLanguageCode(this._opts.selectedLanguageCode);
                
            //apply knockout js bindings
            ko.applyBindings(this._editorViewModel);
        }
    }, {

        _instance: null,

        // Singleton accessor
        getInstance: function () {
            if (this._instance == null)
                this._instance = new Umbraco.Editors.LanguageEditor();
            return this._instance;
        }

    });

})(jQuery, base2.Base);