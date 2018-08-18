'use strict';

function LightShader(vertex,fragment){
    SpriteShader.call(this,vertex,fragment);

    this.mLight = null;
}
gEngine.Core.inheritPrototype(LightShader,SpriteShader);

LightShader.prototype.setLight = function(l){ this.mLight=l; };

LightShader.prototype.activateShader = function(color,transform,vpMatrix){
    SpriteShader.prototype.activateShader.call(this,color,transform,vpMatrix);
    if(this.mLight==null){
        this.mUniforms.u_lightOn = false;
    }else{
        this.mUniforms.u_lightOn = this.mLight.getLightStatus();
        if(this.mUniforms.u_lightOn){
            let p = vpMatrix.worldToPixel(this.mLight.getPosition());
            this.mUniforms.u_lightPosition = [p[0],p[1],p[2],1];
            this.mUniforms.u_lightRadius =  vpMatrix.sizeToPixel(this.mLight.getRadius());
            this.mUniforms.u_lightColor =  this.mLight.getColor();
        }
    }
    twgl.setUniforms(this.mCompiledShader, this.mUniforms);    
}