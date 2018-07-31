'use strict';
function SimpleShader(vertexId, fragmentId) {
	this.mCompiledShader = null;
	var gl = gEngine.Core.getGL();
	var vsShaderInfo = gEngine.ResourceMap.retrieveAsset(vertexId);
	var fsShaderInfo = gEngine.ResourceMap.retrieveAsset(fragmentId);
	this.mCompiledShader = twgl.createProgramInfo(gl, [vsShaderInfo, fsShaderInfo]);
	this.mUniforms = { u_color: null, u_transform: null, u_viewTransform: null };
	if (!this.mCompiledShader)
		console.log('shader compilation error');
}
SimpleShader.prototype.activateShader = function (color, transform, vpMatrix) {
	var gl = gEngine.Core.getGL();
	gl.useProgram(this.mCompiledShader.program);
	twgl.setBuffersAndAttributes(gl, this.mCompiledShader, gEngine.VertexBuffer.getVertexBuffer());
	this.mUniforms = { u_color: color,u_screenSize:[gl.canvas.width, gl.canvas.height], u_transform: transform, u_viewTransform: vpMatrix };
	twgl.setUniforms(this.mCompiledShader, this.mUniforms);
};
SimpleShader.prototype.getShader = function () { return this.mCompiledShader; };

SimpleShader.prototype.cleanUp = function () {
	var gl = gEngine.Core.getGL();
	gl.deleteProgram(this.mCompiledShader.program);
};