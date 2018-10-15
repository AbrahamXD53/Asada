function ParallaxGameObject(camera, scale, texture, normal = null) {
    this.mRefCamera = camera;
    this.mCameraCenterRef = this.mRefCamera.getCenter();
    this.mParallaxScale = 1;
	this.setParallaxScale(scale);
	if (normal)
		TiledGameObject.call(this, texture, normal);
	else
		TiledGameObject.call(this, texture);

}
gEngine.Core.inheritPrototype(ParallaxGameObject, TiledGameObject);
ParallaxGameObject.prototype.getParallaxScale = function () { return this.mParallaxScale; };
ParallaxGameObject.prototype.setParallaxScale = function (s) {
    if (s <= 0) {
        this.mParallaxScale = 1;
    } else {
        this.mParallaxScale = 1 / s;
    }
};

ParallaxGameObject.prototype.refPosUpdate = function () {
    let deltaT = twgl.v3.subtract(this.mCameraCenterRef, this.mRefCamera.getCenter());
    this.setTranslationBy(deltaT);
    this.mCameraCenterRef = twgl.v3.subtract(this.mCameraCenterRef, deltaT);
    return deltaT;
};
ParallaxGameObject.prototype.setTranslationBy = function (delta) {
    let f = 1 - this.mParallaxScale;
    this.transform.translate([-delta[0] * f, -delta[1] * f, 0]);
};
ParallaxGameObject.prototype.update = function () {
    let delta = this.refPosUpdate();
    this.transform.translate([this.mParallaxScale * delta[0], this.mParallaxScale * delta[1], 0]);
};