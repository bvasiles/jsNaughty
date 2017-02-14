var geom2d = function() {
    var _abf3e4d7 = numeric.sum, _140bed17 = numeric.numberEquals;
    var _6d079a2d = 10;
    function _a0378db4(_b0ea43ca, _5fd2ed19) {
        this.x = _b0ea43ca;
        this.y = _5fd2ed19;
    }
    i(_a0378db4, {
        dotProduct: function _0fcbd5bc(_a99f7b5c) {
            return _abf3e4d7([ this.x * _a99f7b5c.x, this.y * _a99f7b5c.y ]);
        },
        equals: function _59445d91(_0b9f8e3d, _b1232d11) {
            return _140bed17(this.x, _0b9f8e3d.x, _b1232d11) && _140bed17(this.y, _0b9f8e3d.y, _b1232d11);
        }
    });
    function i(_b0ea43ca, _5fd2ed19) {
        for (var _3bbcb306 in _5fd2ed19) _b0ea43ca[_3bbcb306] = _5fd2ed19[_3bbcb306];
        return _b0ea43ca;
    }
    return {
        Vector2d: _a0378db4
    };
}();
