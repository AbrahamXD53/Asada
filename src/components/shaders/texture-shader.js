function TextureShader(vertexPath,fragmentPath){
    SimpleShader.call(this,vertexPath,fragmentPath);
    this.mSamplerRef = gEngine.Core.getGL().getUniformLocation(this.mCompiledShader.program, "u_texture");
}
gEngine.Core.inheritPrototype(TextureShader,SimpleShader);
TextureShader.prototype.activateShader=function(color,transform,vpMatrix)
{
    SimpleShader.prototype.activateShader.call(this,color,transform,vpMatrix);
};