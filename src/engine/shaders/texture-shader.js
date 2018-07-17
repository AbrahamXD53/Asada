'use strict';

function TextureShader(vertexPath,fragmentPath){
    SimpleShader.call(this,vertexPath,fragmentPath);
}

gEngine.Core.inheritPrototype(TextureShader,SimpleShader);

TextureShader.prototype.activateShader=function(color,transform,vpMatrix)
{
	SimpleShader.prototype.activateShader.call(this,color,transform,vpMatrix);
	twgl.setUniforms(this.mCompiledShader, { u_color: color, u_transform: transform, u_viewTransform: vpMatrix });
};