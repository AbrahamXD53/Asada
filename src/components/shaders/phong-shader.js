function PhongShader(vertex,fragment){
    IllumShader.call(this,vertex,fragment);
    this.mMaterial = null;
    this.mMaterialLoader = new ShaderMaterial(this.mCompiledShader.program);

    this.mCameraPos = null; // points to a vec3
    this.mCameraPosRef = this.gl.getUniformLocation(this.mCompiledShader.program, "u_cameraPosition");
}

gEngine.Core.inheritPrototype(PhongShader,IllumShader);

PhongShader.prototype.activateShader = function (color, transform, vpMatrix) {
    IllumShader.prototype.activateShader.call(this, color, transform, vpMatrix);
    this.mMaterialLoader.loadToShader(this.mMaterial);
    this.gl.uniform3fv(this.mCameraPosRef, this.mCameraPos);
};

PhongShader.prototype.setMaterialAndCameraPos = function(m, p) {
    this.mMaterial = m;
    this.mCameraPos = p;
};