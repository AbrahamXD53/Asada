let ComponetType = Object.freeze({
    transform: 'Transform',
    renderer: 'Renderer',
    physics:'Physics'
});
function GameObject() {
    this.mComponents = {};
    this.addComponent(new Transform());
    this.addComponent(new Renderer());
    this.mParent = null;
    this.mChildren = null;
}

GameObject.prototype.update = function (delta = 1) {
    for (let c in this.mComponents) {
        if (this.mComponents[c].update)
            this.mComponents[c].update(delta);
    }
};

GameObject.prototype.draw = function (camera) {
    for (let c in this.mComponents) {
        if (this.mComponents[c].draw)
            this.mComponents[c].draw(camera);
    }
};

GameObject.prototype.addComponent = function (component) {
    this.mComponents[component.constructor.name] = component;
    if (this.mComponents[component.constructor.name].setParent)
        this.mComponents[component.constructor.name].setParent(this);
    Object.defineProperty(this, component.constructor.name.replace(/^\w/, c => c.toLowerCase()), { get: function () { return this.mComponents[component.constructor.name]; } });
};
GameObject.prototype.getComponent = function (component) {
    return this.mComponents[component];
};
GameObject.prototype.getAllComponents = function () {
    console.log(this.mComponents);
};
GameObject.prototype.destroy=function(){

};
GameObject.prototype.setComponent = function (componentType, value) {
    if (!this.mComponents[componentType])
        this.addComponent(value);
    else {
        this.mComponents[componentType] = value;
        if (this.mComponents[componentType].setParent)
            this.mComponents[componentType].setParent(this);
    }
};

GameObject.prototype.onCollisionStart=function(event){
    // this.renderer.setColor([1,0,0,1]);
};
GameObject.prototype.onCollisionEnd=function(event){
    // this.renderer.setColor([1,1,1,1]);
};


function Physics(options) {
    this.mBody = null;
    this.mParent = null;
    this.mOptions = options || {inertia:Infinity};
};

Physics.prototype.setParent = function (p) {
    this.mParent = p;
    let transform = this.mParent.transform;    
    this.mBody = Matter.Bodies.rectangle(0, 0, 0.95,0.95, this.mOptions);
    Matter.Body.scale(this.mBody,transform.getScaleX(),transform.getScaleY(),{x:0,y:0});
    Matter.Body.rotate(this.mBody,transform.getRotation(),{x:0.0,y:0.0});
    Matter.Body.setPosition(this.mBody,{x:transform.getPositionX(),y:transform.getPositionY()});
    this.mBody.render=this.mParent.renderer;
    this.mBody.onCollide(this.mParent.onCollisionStart.bind(this.mParent));
    this.mBody.onCollideEnd(this.mParent.onCollisionEnd.bind(this.mParent));
    Matter.World.add(gEngine.Physics.getWorld(), this.mBody);
};
Physics.prototype.getBody=function(){ return this.mBody; };
Physics.prototype.update = function (delta) {
    this.mParent.transform.setPositionX(this.mBody.position.x);
    this.mParent.transform.setPositionY(this.mBody.position.y);
    this.mParent.transform.setRotation(this.mBody.angle);
};
Physics.prototype.applyForce=function(delta)
{
    Matter.Body.applyForce(this.mBody,{x:this.mParent.transform.getPositionX(),y:this.mParent.transform.getPositionY()},delta);        
};