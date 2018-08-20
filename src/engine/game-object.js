'use strict';

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
GameObject.prototype.setComponent = function (componentType, value) {
    if (!this.mComponents[componentType])
        this.addComponent(value);
    else {
        this.mComponents[componentType] = value;
        if (this.mComponents[componentType].setParent)
            this.mComponents[componentType].setParent(this);
    }
};


function Physics(options) {
    this.mBody = null;
    this.mParent = null;
    this.mOptions = options;
};

Physics.prototype.setParent = function (p) {
    this.mParent = p;

    let transform = this.mParent.transform;    
    //this.mBody = Matter.Bodies.rectangle(0, 0, 1, 1, this.mOptions);
    this.mBody = Matter.Bodies.fromVertices(transform.getPositionX(),transform.getPositionY(),[{x:0.5,y:0.5},{x:0.5,y:-0.5},{x:-0.5,y:-0.5},{x:-0.5,y:0.5}], this.mOptions);
    Matter.Body.setPosition(this.mBody,{x:transform.getPositionX(),y:transform.getPositionY()});
    Matter.Body.setAngle(this.mBody,transform.getRotation());
    Matter.Body.scale(this.mBody,transform.getScaleX(),transform.getScaleY());
    Matter.World.add(gEngine.Physics.getWorld(), this.mBody);
};

Physics.prototype.update = function (delta) {
    this.mParent.transform.setPositionX(this.mBody.position.x);
    this.mParent.transform.setPositionY(this.mBody.position.y);
    this.mParent.transform.setRotation(this.mBody.angle);
    //console.log(this.mBody.angle);
};