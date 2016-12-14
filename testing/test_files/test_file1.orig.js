var geom2d = function() {
    var sum = numeric.sum, numberEquals = numeric.numberEquals;
    var a = 10;
    function Vector2d(x, y) {
        this.x = x;
        this.y = y;
    }
    mix(Vector2d, {
        dotProduct: function dotProduct(vector) {
            return sum([ this.x * vector.x, this.y * vector.y ]);
        },
        equals: function equals(vector, epsilon) {
            return numberEquals(this.x, vector.x, epsilon) && numberEquals(this.y, vector.y, epsilon);
        }
    });
    function mix(dest, src) {
        for (var k in src) dest[k] = src[k];
        return dest;
    }
    return {
        Vector2d: Vector2d
    };
}();