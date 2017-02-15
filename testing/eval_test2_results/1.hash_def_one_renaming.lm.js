var geom2d = function() {
    var n = numeric.sum, r = numeric.numberEquals;
    var e = 10;
    function u(i, l) {
        this.x = i;
        this.y = l;
    }
    i(u, {
        dotProduct: function i(v) {
            return n([ this.x * v.x, this.y * v.y ]);
        },
        equals: function equals(v, b) {
            return r(this.x, v.x, b) && r(this.y, v.y, b);
        }
    });
    function i(a, source) {
        for (var prop in source) a[prop] = source[prop];
        return a;
    }
    return {
        Vector2d: u
    };
}();
