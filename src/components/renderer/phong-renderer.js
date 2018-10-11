function PhongRenderer(texture, normalMap) {
	IllumRenderer.call(this, texture,normalMap);
	Renderer.prototype.setShader.call(this, gEngine.DefaultResources.getPhongShader());
	this.mMaterial = new Material();
}
gEngine.Core.inheritPrototype(PhongRenderer,IllumRenderer);
PhongRenderer.prototype.draw = function (camera) {
    this.mShader.setMaterialAndCameraPos(this.mMaterial, camera.getPosInPixelSpace());
	IllumRenderer.prototype.draw.call(this, camera);
};
PhongRenderer.prototype.getMaterial = function() { return this.mMaterial; };