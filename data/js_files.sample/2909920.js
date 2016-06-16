CALC.Camera = function (left, right, top, bottom, near, far, fov, aspect, focusDistance, perspective) {

    THREE.Camera.call( this );
	
	this.left = left || -1200;
	this.right = right || 1200;
	this.top = top || 300;
	this.bottom = bottom || -300;

	this.near = (near !== undefined) ? near : 0.1;
	this.far = (far !== undefined) ? far : 2000;

	this.fov = fov !== undefined ? fov : 53.14;
	this.aspect = aspect !== undefined ? aspect : 1;
	this.focusDistance = (focusDistance !== undefined) ? focusDistance : 20;
	
	this.perspectiveMatrix = new THREE.Matrix4();
	this.orthographicMatrix = new THREE.Matrix4();
	this.perspective = (perspective !== undefined) ? perspective : 1;

    this.updateProjectionMatrix();

};

CALC.Camera.prototype = new THREE.Camera();
CALC.Camera.prototype.constructor = CALC.Camera;

CALC.Camera.prototype.zoom = function(relativeZoom, absolute) {
    if (absolute) {
	this.fov = 45 - relativeZoom;
    }
    else {
	this.fov -= relativeZoom;
    }
    
    this.fov = this.fov < 5 ? 5 : (this.fov > 175 ? 175 : this.fov);
    this.updateProjectionMatrix();
	return this;
};

CALC.Camera.prototype.getZoom = function() {
    return -this.fov + 45;
}

CALC.Camera.prototype.updateProjectionMatrix = function () {

	this.perspectiveMatrix.makePerspective(this.fov, this.aspect, this.near, this.far);
	
	this.top = Math.tan(Math.PI / 360 * this.fov) * this.focusDistance;
	this.bottom = -this.top;
	this.left = this.aspect * this.bottom;
	this.right = this.aspect * this.top;

	this.orthographicMatrix.makeOrthographic(this.left, this.right, this.top, this.bottom, this.near, this.far);
	
	var scale = (this.perspective/(1.05 - this.perspective))/20; //Well...yeah
	this.perspectiveMatrix.multiplyScalar(scale);
	this.orthographicMatrix.multiplyScalar(1 - scale);
	
	te = this.projectionMatrix.elements;
	pe = this.perspectiveMatrix.elements;
	oe = this.orthographicMatrix.elements;
	
	for (var i = 0; i < 16; i++) {
		te[i] = pe[i] + oe[i];
	}

};



