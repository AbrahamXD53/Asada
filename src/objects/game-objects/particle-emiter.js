function ParticleEmiter(options = {}) { //New component
    this.mParticles = [];
    this.mStartSize = 1;
    this.mMaxParticles = 50;
    this.mNextParticle = Math.random();
    Component.call(this);
}
gEngine.Core.inheritPrototype(ParticleEmiter,Component);

ParticleEmiter.prototype.setParent = function (p) {
	this.mParent = p;
	this.mTransform = this.mParent.transform;
};
ParticleEmiter.prototype.emit = function (position) {
    this.mParticles.push(
        new Particle({
            lifeSpan: Random(14, 18), position: [
				this.mTransform.getPosition()[0] + (-1 + 2 * Math.random()),
				this.mTransform.getPosition()[1] + (-1 + 2 * Math.random()), 0
            ],
            velocity: [
                (-1 + 2 * Math.random()) / 10,
                (-1 + 2 * Math.random()) / 10, 0
            ],
            deltaScale: [-0.005, -0.005, 0],
            deltaColor: [-0.01, 0, 0, -0.01],
            startColor: [1, 1, 0, 1.0],
            scale: [1, 1, 1, 1]
        }));
};

ParticleEmiter.prototype.update = function (delta) {
    this.mNextParticle -= delta;
	if (this.mNextParticle < 0 && this.mMaxParticles > this.mParticles.length) {
		this.mNextParticle = Math.random()*0.5;
        //this.mNextParticle = 0;//Math.random();
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
			//this.mParticles[index].draw(camera);
		}
	}
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
};