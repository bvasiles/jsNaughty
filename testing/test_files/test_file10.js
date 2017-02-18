"use strict";

require("/js/settings/base_view.js");

suite("BaseView", function() {
    var options;
    setup(function() {
        var stubAddListener = this.sinon.stub(document, "getElementById");
        options = new BaseView();
        options.CONTAINER_ID = "test-id";
        options.start();
        assert.isTrue(stubAddListener.called);
    });
    teardown(function() {
        options.stop();
    });
    suite("Transition event hooks", function() {
        var stubReqWakeLock;
        setup(function() {
            options.childViews = {
                view1: {
                    beforeShow: this.sinon.stub().returns("beforeShow1"),
                    show: this.sinon.stub().returns("show1"),
                    beforeHide: this.sinon.stub().returns("beforeHide1"),
                    hide: this.sinon.stub().returns("hide1")
                },
                view2: {
                    beforeShow: this.sinon.stub().returns("beforeShow2"),
                    show: this.sinon.stub().returns("show2"),
                    beforeHide: this.sinon.stub().returns("beforeHide2"),
                    hide: this.sinon.stub().returns("hide2")
                },
                view3: {
                    beforeShow: this.sinon.stub().returns("beforeShow3"),
                    show: this.sinon.stub().returns("show3"),
                    beforeHide: this.sinon.stub().returns("beforeHide3"),
                    hide: this.sinon.stub().returns("hide3")
                }
            };
            stubReqWakeLock = this.sinon.stub(window.Promise, "all");
        });
        test("beforeShow", function() {
            var overflowCall = {};
            options.beforeShow(overflowCall);
            assert.isTrue(stubReqWakeLock.calledWith([ "beforeShow1", "beforeShow2", "beforeShow3" ]));
            assert.isTrue(options.childViews.view1.beforeShow.calledWith(overflowCall));
            assert.isTrue(options.childViews.view2.beforeShow.calledWith(overflowCall));
            assert.isTrue(options.childViews.view3.beforeShow.calledWith(overflowCall));
        });
        test("show", function() {
            options.show();
            assert.isTrue(stubReqWakeLock.calledWith([ "show1", "show2", "show3" ]));
        });
        test("beforeHide", function() {
            options.beforeHide();
            assert.isTrue(stubReqWakeLock.calledWith([ "beforeHide1", "beforeHide2", "beforeHide3" ]));
        });
        test("hide", function() {
            options.hide();
            assert.isTrue(stubReqWakeLock.calledWith([ "hide1", "hide2", "hide3" ]));
        });
    });
});
