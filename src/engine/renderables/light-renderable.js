'use strict';

function LightRenderable(texture,options){
    AnimatedSprite.call(this,texture,options);

    Renderable.prototype.setShader.call(this,
        gEngine.DefaultResources.getLightShader());
    
    this.mLight = null;
}
gEngine.Core.inheritPrototype(LightRenderable,AnimatedSprite);

LightRenderable.prototype.draw = function(camera){
    this.mShader.setLight(this.mLight);
    AnimatedSprite.prototype.draw.call(this,camera);
};

LightRenderable.prototype.getLight = function(){ return this.mLight; };
LightRenderable.prototype.setLight = function(l){ this.mLight = l; };