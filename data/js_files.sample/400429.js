var extSettings = {};

// Message Event Listener
safari.self.addEventListener('message', function (e) {
    if ('returnSettings' == e.name) {
        extSettings = e.message;
    }
}, false);

// Message Event Dispatch
safari.self.tab.dispatchMessage('getSettings');