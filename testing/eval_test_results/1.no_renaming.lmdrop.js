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
        equals: function i(e, u) {
            return r(this.x, e.x, u) && r(this.y, e.y, u);
        }
    });
    function i(c, source) {
        for (var prop in source) c[prop] = source[prop];
        return c;
    }
    return {
        Vector2d: u
    };
}();
