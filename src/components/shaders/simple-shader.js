function SimpleShader(vertexId, fragmentId) {
	this.mCompiledShader = null;
	var gl = gEngine.Core.getGL();
	var vsShaderInfo = gEngine.ResourceMap.retrieveAsset(vertexId);
	var fsShaderInfo = gEngine.ResourceMap.retrieveAsset(fragmentId);
	this.mCompiledShader = twgl.createProgramInfo(gl, [vsShaderInfo, fsShaderInfo]);
	this.mUniforms = { u_color: null, u_transform: null, u_viewTransform: null,u_globalAmbientColor:null,u_globalAmbientIntensity:null };
	if (!this.mCompiledShader)
		console.log('shader compilation error');
	this.gl = gEngine.Core.getGL();
	this.screen = {};
}
SimpleShader.prototype.activateShader = function (color, transform, camera) {
	this.gl.useProgram(this.mCompiledShader.program);
	twgl.setBuffersAndAttributes(this.gl, this.mCompiledShader, gEngine.VertexBuffer.getVertexBuffer());
	this.screen = camera.getViewport();
    this.mUniforms = { u_globalAmbientColor:gEngine.DefaultResources.getGlobalAmbientColor(),
        u_globalAmbientIntensity:gEngine.DefaultResources.getGlobalAmbientIntensity(),
		u_color: color, u_screenSize: [this.screen[2],this.screen[3]],
        u_transform: transform,
        u_viewTransform: camera.getVPMatrix()
    };
	twgl.setUniforms(this.mCompiledShader, this.mUniforms);
};
SimpleShader.prototype.getShader = function () { return this.mCompiledShader; };

SimpleShader.prototype.cleanUp = function () {
	var gl = gEngine.Core.getGL();
	gl.deleteProgram(this.mCompiledShader.program);
};