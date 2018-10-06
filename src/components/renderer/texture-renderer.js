function TextureRenderer(texture) {
	Renderer.call(this);
	Renderer.prototype.setShader.call(this, gEngine.DefaultResources.getTextureShader());
	this.mTexture = texture;
}
gEngine.Core.inheritPrototype(TextureRenderer, Renderer);

TextureRenderer.prototype.draw = function (vpMatrix) {
	gEngine.Textures.activateTexture(this.mTexture);
	Renderer.prototype.draw.call(this, vpMatrix);
};
TextureRenderer.prototype.getTexture = function () { return this.mTexture; };
TextureRenderer.prototype.setTexture = function (texture) { this.mTexture = texture; };