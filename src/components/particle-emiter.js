function ParticleEmiter(options = {}) { //New component
    this.mParticles = [];
    this.mMaxParticles = 50;
    this.mNextParticle = Math.random();
    this.mDeltaColor = options.deltaColor || [0, 0, 0, 0];
    this.mDeltaScale = options.deltaScale || [0, 0, 0];
    this.mStartColor = options.startColor || [1, 1, 1, 1];
    this.mStarScale = options.startScale || [1, 1, 1];
    this.mGravityScale = options.gravityScale || [0, 0];
    this.mLifeTime = options.lifeTime || [15, 20];
    this.mEmitTime = options.emitTime || [0, 1];
    this.mGeneratePosition = options.positionGenerator || this.positionGenerator;
    this.mGenerateVelocity = options.velocityGenerator || this.velocityGenerator;
    Component.call(this);
}
gEngine.Core.inheritPrototype(ParticleEmiter, Component);

ParticleEmiter.prototype.setParent = function (p) {
    this.mParent = p;
    this.mTransform = this.mParent.transform;
};
ParticleEmiter.prototype.positionGenerator = function () {
    return [
        this.mTransform.getPosition()[0] + (-1 + 2 * Math.random()),
        this.mTransform.getPosition()[1] + (-1 + 2 * Math.random()), 0
    ];
};
ParticleEmiter.prototype.velocityGenerator = function () {
    return [
        (-1 + 2 * Math.random()) / 10,
        (-1 + 2 * Math.random()) / 10,0
    ];
};
ParticleEmiter.prototype.emit = function (position) {
    this.mParticles.push(
        new Particle({
            lifeSpan: Random(this.mLifeTime[0], this.mLifeTime[1]), position: this.mGeneratePosition(),
            velocity: this.mGenerateVelocity(),
            deltaScale: JSON.parse(JSON.stringify(this.mDeltaScale)),
            deltaColor: JSON.parse(JSON.stringify(this.mDeltaColor)),
            startColor: JSON.parse(JSON.stringify(this.mStartColor)),
            scale: JSON.parse(JSON.stringify(this.mStarScale)),
            gravity:JSON.parse(JSON.stringify(this.mGravityScale))
        }));
};

ParticleEmiter.prototype.update = function (delta) {
    this.mNextParticle -= delta;
    if (this.mNextParticle <= 0 && this.mMaxParticles > this.mParticles.length) {
        this.mNextParticle = Random(this.mEmitTime[0], this.mEmitTime[1]);
        this.emit();
    }
    for (let index = this.mParticles.length - 1; index >= 0; index--) {
        if (this.mParticles[index].hasExpired()) {
            this.mParticles[index].destroy();
            this.mParticles.splice(index, 1);
        } else
            this.mParticles[index].update(delta);
    }
};

ParticleEmiter.prototype.draw = function (camera) {
    let gl = gEngine.Core.getGL();
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    for (let index = this.mParticles.length - 1; index >= 0; index--) {
        if (!this.mParticles[index].hasExpired()) {
            this.mParticles[index].draw(camera);
        }
    }
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
};