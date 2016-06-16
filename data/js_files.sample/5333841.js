// Schultz.js - wrapper for legacy or third-party apps that know nothing about the AppStore

/// <reference path='~/Scripts/AppStore.App.js' />
/// <reference path='~/Scripts/jquery-1.7.2-vsdoc.js' />


$(document).ready(function ()
{
    window.AppStore = window.AppStore || new Object();

    window.AppStore.SchultzContainer = window.AppStore.SchultzContainer ||
    {
        onInitComplete: function ()
        {
            var url = this.app.manifest.destURL;
            $("#ifContent").attr('src', url);
        },

        init: function ()
        {
            this.app = AppStore.App;
            this.app.ready(function () { AppStore.SchultzContainer.onInitComplete(); });
        }
    };

    window.AppStore.SchultzContainer.init();

}
);