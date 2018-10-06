function Physics(options) {
    this.mBody = null;
    this.mParent = null;
    this.mOptions = options || { inertia: Infinity };
}

Physics.prototype.setParent = function (p) {
    this.mParent = p;
    let transform = this.mParent.transform;
    if (!this.mOptions.hasOwnProperty('circle'))
		this.mBody = Matter.Bodies.rectangle(
			0 + (this.mOptions.offsetX || 0) * 0.5,
			0 + (this.mOptions.offsetY || 0) * 0.5,
			1 - (this.mOptions.offsetX || 0),
			1 - (this.mOptions.offsetY || 0), this.mOptions);
    else
        this.mBody = Matter.Bodies.circle(0, 0, 0.5, this.mOptions);
    Matter.Body.scale(this.mBody, transform.getScaleX(), transform.getScaleY(), { x: 0, y: 0 });
    Matter.Body.rotate(this.mBody, transform.getRotation(), { x: 0.0, y: 0.0 });
    Matter.Body.setPosition(this.mBody, { x: transform.getPositionX(), y: transform.getPositionY() });
    this.mBody.render = this.mParent.renderer;
    this.mBody.onCollide(this.mParent.onCollisionStart.bind(this.mParent));
    this.mBody.onCollideEnd(this.mParent.onCollisionEnd.bind(this.mParent));
    Matter.World.add(gEngine.Physics.getWorld(), this.mBody);
};
Physics.prototype.getBody = function () { return this.mBody; };
Physics.prototype.update = function (delta) {
    this.mParent.transform.setPositionX(this.mBody.position.x);
    this.mParent.transform.setPositionY(this.mBody.position.y);
    this.mParent.transform.setRotation(this.mBody.angle);
};
Physics.prototype.applyForce = function (delta) {
    Matter.Body.applyForce(this.mBody, { x: this.mParent.transform.getPositionX(), y: this.mParent.transform.getPositionY() }, delta);
};
Physics.prototype.destroy=function(){
    Matter.World.remove(gEngine.Physics.getWorld(), this.mBody);    
};