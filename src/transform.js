function Transform() {
	this.mPosition = twgl.v3.create(0, 0, 0);
	this.mScale = twgl.v3.create(1, 1, 1);
	this.mRotation = 0;
}
Transform.prototype.setRotation = function (rad) { this.mRotation = rad; };
Transform.prototype.setRotationDeg = function (deg) { this.mRotation = deg * 0.01745329251; };
Transform.prototype.setPosition = function (pos) { this.mPosition = pos; };
Transform.prototype.setPositionX = function (pos) { this.mPosition[0] = pos; };
Transform.prototype.setPositionY = function (pos) { this.mPosition[1] = pos; };
Transform.prototype.setPositionZ = function (pos) { this.mPosition[2] = pos; };
Transform.prototype.setScale = function (pos) { this.mScale = pos; };
Transform.prototype.setScaleX = function (pos) { this.mScale[0] = pos; };
Transform.prototype.setScaleY = function (pos) { this.mScale[1] = pos; };
Transform.prototype.setScaleZ = function (pos) { this.mScale[2] = pos; };
Transform.prototype.translate = function (delta) {
	this.mPosition[0] += delta[0];
	this.mPosition[1] += delta[1];
	this.mPosition[2] += delta[2];
};
Transform.prototype.translateX = function (delta) { this.mPosition[0] += delta; };
Transform.prototype.translateY = function (delta) { this.mPosition[1] += delta; };
Transform.prototype.translateZ = function (delta) { this.mPosition[2] += delta; };
Transform.prototype.scale = function (delta) {
	if (Array.isArray(delta)) {
		this.mScale[0] += delta[0];
		this.mScale[1] += delta[1];
		this.mScale[2] += delta[2];
	}
	else {
		this.mScale[0] += delta;
		this.mScale[1] += delta;
		this.mScale[2] += delta;
	}
};
Transform.prototype.scaleX = function (delta) { this.mScale[0] += delta; };
Transform.prototype.scaleY = function (delta) { this.mScale[1] += delta; };
Transform.prototype.scaleZ = function (delta) { this.mScale[2] += delta; };
Transform.prototype.rotate = function (delta) { this.mRotation += delta; };
Transform.prototype.getRotation = function () { return this.mRotation; };
Transform.prototype.getRotationDeg = function () { return this.mRotation * 57.2957795131; };
Transform.prototype.getPosition = function () { return this.mPosition; };
Transform.prototype.getPositionX = function () { return this.mPosition[0]; };
Transform.prototype.getPositionY = function () { return this.mPosition[1]; };
Transform.prototype.getPositionZ = function () { return this.mPosition[2]; };
Transform.prototype.getScale = function () { return this.mScale; };
Transform.prototype.getScaleX = function () { return this.mScale[0]; };
Transform.prototype.getScaleY = function () { return this.mScale[1]; };
Transform.prototype.getScaleZ = function () { return this.mScale[2]; };
Transform.prototype.getMatrix = function () {
	var mat = twgl.m4.identity();
	twgl.m4.setTranslation(mat, this.mPosition, mat);
	twgl.m4.rotateZ(mat, this.mRotation, mat);
	twgl.m4.scale(mat, this.mScale, mat);
	return mat;
};