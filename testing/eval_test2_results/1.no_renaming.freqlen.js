var geom2d = function() {
    var n = numeric.sum, r = numeric.numberEquals;
    var e = 10;
    function u(blobInfos, uploadBlobInfo) {
        this.x = blobInfos;
        this.y = uploadBlobInfo;
    }
    i(u, {
        dotProduct: function i(o) {
            return n([ this.x * o.x, this.y * o.y ]);
        },
        equals: function i(b, GRID_STEP) {
            return r(this.x, b.x, GRID_STEP) && r(this.y, b.y, GRID_STEP);
        }
    });
    function i(obj, source) {
        for (var prop in source) obj[prop] = source[prop];
        return obj;
    }
    return {
        Vector2d: u
    };
}();
