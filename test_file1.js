var geom2d = function() {
    var t = numeric.sum, n = numeric.numberEquals;
    var i = 10;
    function r(n, r) {
        this.x = n;
        this.y = r;
    }
    u(r, {
        dotProduct: function e(n) {
            return t([ this.x * n.x, this.y * n.y ]);
        },
        equals: function o(r, t) {
            return n(this.x, r.x, t) && n(this.y, r.y, t);
        }
    });
    function u(n, r) {
        for (var t in r) n[t] = r[t];
        return n;
    }
    return {
        Vector2d: r
    };
}();
//# sourceMappingURL=test_file.map