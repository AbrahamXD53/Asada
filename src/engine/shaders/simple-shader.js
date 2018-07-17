'use strict';
function SimpleShader(vertexId, fragmentId) {
	this.mCompiledShader = null;
	var gl = gEngine.Core.getGL();
	var vsShaderInfo = gEngine.ResourceMap.retrieveAsset(vertexId);
	var fsShaderInfo = gEngine.ResourceMap.retrieveAsset(fragmentId);
	this.mCompiledShader = twgl.createProgramInfo(gl, [vsShaderInfo, fsShaderInfo]);
	if (!this.mCompiledShader)
		console.log('shader compilation error');
}
SimpleShader.prototype.activateShader = function (color, transform, vpMatrix) {
	var gl = gEngine.Core.getGL();
	gl.useProgram(this.mCompiledShader.program);
	twgl.setBuffersAndAttributes(gl, this.mCompiledShader, gEngine.VertexBuffer.getVertexBuffer());
	twgl.setUniforms(this.mCompiledShader, { u_color: color, u_transform: transform, u_viewTransform: vpMatrix });
};
SimpleShader.prototype.getShader = function () { return this.mCompiledShader; };

