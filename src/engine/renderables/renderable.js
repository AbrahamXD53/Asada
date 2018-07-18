'use strict';
function Renderable() {
	this.mShader = gEngine.DefaultResources.getColorShader();
	this.mColor = [1.0, 1.0, 1.0, 1.0];
	this.mTransform = new Transform();
}

Renderable.prototype.draw = function (vpMatrix) {
	var gl = gEngine.Core.getGL();
	this.mShader.activateShader(this.mColor, this.mTransform.getMatrix(), vpMatrix);
	twgl.drawBufferInfo(gl, gEngine.VertexBuffer.getVertexBuffer(), gl.TRIANGLE_STRIP);
};
Renderable.prototype.setShader = function (shader) { this.mShader = shader; };
Renderable.prototype.setColor = function (color) { this.mColor = color; };
Renderable.prototype.getColor = function () { return this.mColor; };
Renderable.prototype.getTransform = function () { return this.mTransform; };