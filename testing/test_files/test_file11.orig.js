qx.Class.define("qx.ui.core.queue.Visibility", {
    statics: {
        __queue: [],
        __data: {},
        remove: function(func) {
            delete this.__data[func.$$hash];
            qx.lang.Array.remove(this.__queue, func);
        },
        isVisible: function(elem) {
            return this.__data[elem.$$hash] || false;
        },
        __computeVisible: function(layer) {
            var data = this.__data;
            var name = layer.$$hash;
            var tmp;
            if (layer.isExcluded()) {
                tmp = false;
            } else {
                var parent = layer.$$parent;
                if (parent) {
                    tmp = this.__computeVisible(parent);
                } else {
                    tmp = layer.isRootWidget();
                }
            }
            return data[name] = tmp;
        },
        add: function(node) {
            var stack = this.__queue;
            if (qx.lang.Array.contains(stack, node)) {
                return;
            }
            stack.unshift(node);
            qx.ui.core.queue.Manager.scheduleFlush("visibility");
        },
        flush: function() {
            var args = this.__queue;
            var b = this.__data;
            for (var i = args.length - 1; i >= 0; i--) {
                var name = args[i].$$hash;
                if (b[name] != null) {
                    args[i].addChildrenToQueue(args);
                }
            }
            var a = {};
            for (var i = args.length - 1; i >= 0; i--) {
                var name = args[i].$$hash;
                a[name] = b[name];
                b[name] = null;
            }
            for (var i = args.length - 1; i >= 0; i--) {
                var arg = args[i];
                var name = arg.$$hash;
                args.splice(i, 1);
                if (b[name] == null) {
                    this.__computeVisible(arg);
                }
                if (b[name] && b[name] != a[name]) {
                    arg.checkAppearanceNeeds();
                }
            }
            this.__queue = [];
        }
    }
});
