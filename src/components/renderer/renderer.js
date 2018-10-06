function Renderer() {
	this.mShader = gEngine.DefaultResources.getColorShader();
	this.mColor = [1.0, 1.0, 1.0, 1.0];
	this.mParent = null;
}
Renderer.prototype.setParent = function (parent) { this.mParent = parent; this.mTransform = this.mParent.transform; };
Renderer.prototype.draw = function (vpMatrix) {
	var gl = gEngine.Core.getGL();
	this.mShader.activateShader(this.mColor, this.mTransform.getMatrix(), vpMatrix);
	twgl.drawBufferInfo(gl, gEngine.VertexBuffer.getVertexBuffer(), gl.TRIANGLE_STRIP);
};
Renderer.prototype.setShader = function (shader) { this.mShader = shader; };
Renderer.prototype.getLightAt = function () { };
Renderer.prototype.addLight = function () { };
Renderer.prototype.setColor = function (color) { this.mColor = color; };
Renderer.prototype.getColor = function () { return this.mColor; };