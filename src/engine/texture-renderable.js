'use strict';
function TextureRenderable(texture) {
    Renderable.call(this);
    Renderable.prototype.setColor.call(this, [1, 1, 1, 1]);

    Renderable.prototype.setShader.call(this, gEngine.DefaultResources.getTextureShader());

    this.mTexture = texture;
}

gEngine.Core.inheritPrototype(TextureRenderable, Renderable);

TextureRenderable.prototype.draw = function (vpMatrix) {
    gEngine.Textures.activateTexture(this.mTexture);
    Renderable.prototype.draw.call(this, vpMatrix);
};

TextureRenderable.prototype.getTexture = function () { return this.mTexture; };
TextureRenderable.prototype.setTexture = function (texture) { this.mTexture = texture; };