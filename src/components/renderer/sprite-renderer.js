SpriteRenderer.TexCoord = Object.freeze({
	Left: 2,
	Right: 0,
	Top: 1,
	Bottom: 5
});
function SpriteRenderer(texture) {
	TextureRenderer.call(this, texture);
	Renderer.prototype.setShader.call(this, gEngine.DefaultResources.getSpriteShader());
	this.mTexLeft = 0.0;
	this.mTexRight = 1.0;
	this.mTexTop = 0.0;
	this.mTexBottom = 1.0;
}
gEngine.Core.inheritPrototype(SpriteRenderer, TextureRenderer);

SpriteRenderer.prototype.draw = function (vpMatrix) {
	this.setUVCoords();
	TextureRenderer.prototype.draw.call(this, vpMatrix);
};

SpriteRenderer.prototype.setTextureCoordUV = function (left, right, bottom, top) {
	this.mTexLeft = left;
	this.mTexRight = right;
	this.mTexBottom = bottom;
	this.mTexTop = top;
};

SpriteRenderer.prototype.setTextureCoordPixels = function (left, right, bottom, top) {
	var texInfo = gEngine.ResourceMap.retrieveAsset(this.mTexture);
	var imageW = texInfo.mWidth;
	var imageH = texInfo.mHeight;

	this.mTexLeft = left / imageW;
	this.mTexRight = right / imageW;
	this.mTexBottom = bottom / imageH;
	this.mTexTop = top / imageH;
};
SpriteRenderer.prototype.setUVCoords = function () {
	this.mShader.setTextureCoord([
		this.mTexRight, this.mTexTop,
		this.mTexLeft, this.mTexTop,
		this.mTexRight, this.mTexBottom,
		this.mTexLeft, this.mTexBottom
	]);
};