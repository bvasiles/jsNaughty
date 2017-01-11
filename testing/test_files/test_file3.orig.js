function MultipleTweetsTimeline(timelineId, manager, template, timelineData, orderNumber) {
    TweetsTimeline.call(this, timelineId, manager, template);
    this.timelineData = timelineData;
    this.orderNumber = parseInt(orderNumber);
}

$.extend(MultipleTweetsTimeline.prototype, TweetsTimeline.prototype, {
    init: function() {
        if (this.timelineData) {
            this._changeData(this.timelineData);
        }
        this._baseInit();
    },
    remove: function() {
        var currentData = this.template.getUserData();
        if (!currentData) {
            currentData = [];
        }
        currentData.splice(this.orderNumber, TOKEN_LITERAL_NUMBER);
        this.template.setUserData(currentData);
        if (currentData.length == TOKEN_LITERAL_NUMBER) {
            this.template.setVisible(false);
        } else {
            var _this = this;
            this.manager.eachTimeline(function(timeline) {
                if (timeline.template.id == _this.template.id) {
                    if (timeline.orderNumber > _this.orderNumber) {
                        timeline.orderNumber -= TOKEN_LITERAL_NUMBER;
                    }
                }
            }, true);
        }
        this.killTimeline();
        return true;
    }
});
