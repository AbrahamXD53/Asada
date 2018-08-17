'use strict';
function SimpleShader(vertexId, fragmentId) {
	this.mCompiledShader = null;
	var gl = gEngine.Core.getGL();
	var vsShaderInfo = gEngine.ResourceMap.retrieveAsset(vertexId);
	var fsShaderInfo = gEngine.ResourceMap.retrieveAsset(fragmentId);
	this.mCompiledShader = twgl.createProgramInfo(gl, [vsShaderInfo, fsShaderInfo]);
	this.mUniforms = { u_color: null, u_transform: null, u_viewTransform: null,u_globalAmbientColor:null,u_globalAmbientIntensity:null };
	if (!this.mCompiledShader)
		console.log('shader compilation error');
}
SimpleShader.prototype.activateShader = function (color, transform, camera) {
	var gl = gEngine.Core.getGL();
	gl.useProgram(this.mCompiledShader.program);
	twgl.setBuffersAndAttributes(gl, this.mCompiledShader, gEngine.VertexBuffer.getVertexBuffer());
	let screen = camera.getViewport();
	this.mUniforms = { u_globalAmbientColor:gEngine.DefaultResources.getGlobalAmbientColor(),u_globalAmbientIntensity:gEngine.DefaultResources.getGlobalAmbientIntensity(),u_color: color,u_screenSize:[screen[2],screen[3]], u_transform: transform, u_viewTransform: camera.getVPMatrix() };
	twgl.setUniforms(this.mCompiledShader, this.mUniforms);
};
SimpleShader.prototype.getShader = function () { return this.mCompiledShader; };

SimpleShader.prototype.cleanUp = function () {
	var gl = gEngine.Core.getGL();
	gl.deleteProgram(this.mCompiledShader.program);
};