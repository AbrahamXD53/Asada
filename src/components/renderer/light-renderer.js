function LightRenderer(texture) {
	SpriteRenderer.call(this, texture);
	Renderer.prototype.setShader.call(this,
		gEngine.DefaultResources.getLightShader()
	);
	this.mLights = [];
}
gEngine.Core.inheritPrototype(LightRenderer, SpriteRenderer);

LightRenderer.prototype.draw = function (camera) {
	this.mShader.setLights(this.mLights);
	SpriteRenderer.prototype.draw.call(this, camera);
};
LightRenderer.prototype.getLightAt = function (index) {
	return this.mLights[index];
};
LightRenderer.prototype.addLight = function (l) {
	this.mLights.push(l);
};