var EditImageOperation = AttributeItemOperation.extend({
    initialize: function() {
        this.set('property', 'src');
        AttributeItemOperation.prototype.initialize.apply(this);
    },
    complete: function() {
        var _this = this;
        //$.post('SERVER_API_URL', { imageUrl: this.get('changedState') }, function(data) {
        //    _this.apply(data);
            AttributeItemOperation.prototype.complete.apply(_this);
        //});
    }
})