function Particle(options = {}) {
    this.mColor = [1.0, 1.0, 1.0, 1.0];
    this.mLifeSpan = options.lifeSpan || 10;
	GameObject.call(this, gEngine.DefaultResources.getDefaultParticleTexture());
	this.mTransform = this.transform;
	this.mRenderer = this.renderer;
	this.mTransform.setPosition(options.position || [0, 0, 0]);
    this.mScale = options.scale || [1, 1, 1];
    if (!this.mScale[2])
        this.mScale[2] = 1;
	this.mTransform.setScale(this.mScale);
    if (!options.velocity)
        options.velocity = [0, 0, 0];
    this.mVelocity = options.velocity;
    this.usePhysics = options.physics || false;
    if (this.usePhysics) {
        this.addComponent(new Physics({ circle: true, friction: 0, isSensor: true, gravityScale: 0 }));
        Matter.Body.setVelocity(this.physics.getBody(), { x: this.mVelocity[0], y: this.mVelocity[1] });
    }
    this.mDeltaColor = options.deltaColor || [0, 0, 0, 0];
    this.mBaseColor = options.startColor || [1, 1, 1, 1];
	this.mDeltaScale = options.deltaScale || [0, 0, 0];
	this.mRenderer.setColor(this.mBaseColor);
}
gEngine.Core.inheritPrototype(Particle, GameObject);

Particle.prototype.update = function (delta) {
    this.mLifeSpan -= delta;
    this.mBaseColor[0] += this.mDeltaColor[0];
    this.mBaseColor[1] += this.mDeltaColor[1];
    this.mBaseColor[2] += this.mDeltaColor[2];
    this.mBaseColor[3] += this.mDeltaColor[3];
	if (!this.usePhysics) {
		this.mTransform.translate(this.mVelocity);
		this.mScale[0] += this.mDeltaScale[0];
		this.mScale[1] += this.mDeltaScale[1];
		this.mTransform.setScale(this.mScale);
	} else {
		GameObject.prototype.update.call(this, delta);
	}
	this.mRenderer.setColor(this.mBaseColor);
};
Particle.prototype.hasExpired = function () { return this.mLifeSpan < 0; };