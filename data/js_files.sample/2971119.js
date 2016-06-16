/******************************************************/
/******************************************************/
// application namespace

app = {

    webroot: '/', // override in _Layout for dynamic web root

    debug: function (message) {
        if (window.console && 'debug' in window.console)
            console.debug(message);
        else if (window.console && 'log' in window.console)
            console.log(message);
        else
            $('<div>').text(message).appendTo('body');
        return this;
    }

};
