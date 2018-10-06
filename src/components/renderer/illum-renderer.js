function IllumRenderer(texture, normalMap) {
	LightRenderer.call(this, texture);
	Renderer.prototype.setShader.call(this, gEngine.DefaultResources.getIllumShader());
	this.mNormalMap = normalMap;
}
gEngine.Core.inheritPrototype(IllumRenderer, LightRenderer);
IllumRenderer.prototype.draw = function (camera) {
	gEngine.Textures.activateNormalMap(this.mNormalMap);
	LightRenderer.prototype.draw.call(this, camera);
};

function ParticleRenderer(texture) {
	TextureRenderer.call(this, texture);
	Renderer.prototype.setShader.call(this, gEngine.DefaultResources.getParticleShader());
}
gEngine.Core.inheritPrototype(ParticleRenderer, TextureRenderer);