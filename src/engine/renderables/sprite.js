'use strict';
function Sprite(texture){
    TextureRenderable.call(this,texture);
    Renderable.prototype.setShader.call(this,gEngine.DefaultResources.getSpriteShader());
};
gEngine.Core.inheritPrototype(Sprite,TextureRenderable);

Sprite.prototype.draw = function(vpMatrix){
    gEngine.Textures.activateTexture(this.mTexture);
    TextureRenderable.prototype.draw.call(this, vpMatrix);
};

Sprite.prototype.setTextureCoord = function(coord){
    this.mShader.setTextureCoord([
        0.5,0.5,
        0.0, 0.5,
        0.5, 0.0,
        0.0, 0.0
    ]);
};