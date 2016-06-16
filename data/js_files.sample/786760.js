var Face = function(type) {
    
    this.type = type;
    this.vertices = [];
    
    this.normal = vec3.create();
    this.mid = null;

};

Face.TYPES = {
    
    FRONT : 0,
    RIGHT : 1,
    TOP : 2,
    BACK : 3,
    LEFT : 4,
    BOTTOM : 5
    
};

Face.vector = vec3.create();
Face.projVector = vec3.create();

Face.a = vec3.create();
Face.b = vec3.create();
Face.p = vec3.create();

Face.prototype = {
    
    calculateNormal : function() {
        
        vec3.subtract(this.vertices[1].position, this.vertices[0].position, this.normal);
        vec3.subtract(this.vertices[3].position, this.vertices[0].position, Face.vector);
        
        if (this.type < 3) {
            
            vec3.cross(this.normal, Face.vector);
            
        } else {
            
            vec3.cross(Face.vector, this.normal, this.normal);
            
        }
        
        return vec3.normalize(this.normal);
        
    },
    
    calculateMid : function() {
        
        this.mid = vec3.add(this.vertices[0].position, this.vertices[2].position, vec3.create());
        vec3.scale(this.mid, 0.5);
        
    },
    
    distanceToRay : function(origin, direction) {
        
        if (!this.mid) {
            
            this.calculateMid();
            
        }
        
        Face.vector = this.vectorToRay(this.mid, origin, direction);
        
        return vec3.dot(Face.vector, Face.vector);
        
    },
    
    vectorToRay : function(point, origin, direction) {
        
        vec3.subtract(point, origin, Face.vector);
        vec3.scale(direction, vec3.dot(direction, Face.vector), Face.projVector);
        
        return vec3.subtract(Face.vector, Face.projVector);
        
    },
    
    intersectsRay : function(origin, direction) {
        
        var nor = this.normal,
            vert = this.vertices,
            t = (vec3.dot(nor, vert[0].position) - vec3.dot(nor, origin)) / vec3.dot(nor, direction);
            
        if (t) {
            
            var p = Face.p,
                a = Face.a,
                b = Face.b;
            
            vec3.add(origin, vec3.scale(direction, t, Face.vector), p);
            
            vec3.subtract(p, vert[0].position);
            vec3.subtract(vert[1].position, vert[0].position, a);
            vec3.subtract(vert[3].position, vert[0].position, b);

            var dotaa = vec3.dot(a, a),
                dotab = vec3.dot(a, b),
                dotap = vec3.dot(a, p),
                dotbb = vec3.dot(b, b),
                dotbp = vec3.dot(b, p),
                
                invDenom = 1 / (dotaa * dotbb - dotab * dotab),
                
                u = (dotbb * dotap - dotab * dotbp) * invDenom,
                v = (dotaa * dotbp - dotab * dotap) * invDenom;
            
            return (u > 0) && (v > 0) && (u < 1) && (v < 1);
            
        }
        
        return false;
        
    },
    
};
