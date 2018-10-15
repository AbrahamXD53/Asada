function IllumShader(vertex,fragment){
    LightShader.call(this,vertex,fragment);
    this.mNormalSamplerRef = gEngine.Core.getGL().getUniformLocation(this.mCompiledShader.program, "u_normal");
    
}
gEngine.Core.inheritPrototype(IllumShader,LightShader);

IllumShader.prototype.activateShader = function(color,transform,camera){
    LightShader.prototype.activateShader.call(this,color,transform,camera);
    this.gl.uniform1i(this.mNormalSamplerRef, 1);
};