function MultipleTweetsTimeline(e, t, i, r, s) {
    TweetsTimeline.call(this, e, t, i);
    this.timelineData = r;
    this.orderNumber = parseInt(s);
}

$.extend(MultipleTweetsTimeline.prototype, TweetsTimeline.prototype, {
    init: function() {
        if (this.timelineData) {
            this._changeData(this.timelineData);
        }
        this._baseInit();
    },
    remove: function() {
        var e = this.template.getUserData();
        if (!e) {
            e = [];
        }
        e.splice(this.orderNumber, TOKEN_LITERAL_NUMBER);
        this.template.setUserData(e);
        if (e.length == TOKEN_LITERAL_NUMBER) {
            this.template.setVisible(false);
        } else {
            var t = this;
            this.manager.eachTimeline(function(e) {
                if (e.template.id == t.template.id) {
                    if (e.orderNumber > t.orderNumber) {
                        e.orderNumber -= TOKEN_LITERAL_NUMBER;
                    }
                }
            }, true);
        }
        this.killTimeline();
        return true;
    }
});
