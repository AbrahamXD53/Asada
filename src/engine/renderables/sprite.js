'use strict';
function Sprite(texture) {
    TextureRenderable.call(this, texture);
    Renderable.prototype.setShader.call(this, gEngine.DefaultResources.getSpriteShader());

    this.mTexLeft = 0.0; 
    this.mTexRight = 1.0;
    this.mTexTop = 1.0;
    this.mTexBottom = 0.0;
};
gEngine.Core.inheritPrototype(Sprite, TextureRenderable);

Sprite.prototype.draw = function (vpMatrix) {
    this.setUVCoords();
    gEngine.Textures.activateTexture(this.mTexture);
    TextureRenderable.prototype.draw.call(this, vpMatrix);
};

Sprite.prototype.setTextureCoordUV = function (left, right, bottom, top) {
    this.mTexLeft = left;
    this.mTexRight = right;
    this.mTexBottom = bottom;
    this.mTexTop = top;
};

Sprite.prototype.setTextureCoordPixels = function (left, right, bottom, top) {
    var texInfo = gEngine.ResourceMap.retrieveAsset(this.mTexture);
    var imageW = texInfo.mWidth;
    var imageH = texInfo.mHeight;

    this.mTexLeft = left / imageW;
    this.mTexRight = right / imageW;
    this.mTexBottom = bottom / imageH;
    this.mTexTop = top / imageH;
};
Sprite.prototype.setUVCoords = function () {
    this.mShader.setTextureCoord([
        this.mTexRight, this.mTexTop, // x,y of top-right
        this.mTexLeft, this.mTexTop,
        this.mTexRight, this.mTexBottom,
        this.mTexLeft, this.mTexBottom
    ]);
};

Sprite.TexCoordArray = Object.freeze({
    Left: 2,
    Right: 0,
    Top: 1,
    Bottom: 5
});