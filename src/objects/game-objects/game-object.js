function GameObject() {
    this.mComponents = {};
    this.addComponent(new Transform());
    if (arguments.length > 0) {
        if (arguments.length > 1) {
            if (typeof arguments[1] === 'string' || arguments[1] instanceof String) {
                this.addComponent(new PhongRenderer(arguments[0], arguments[1]), ComponetType.renderer);
            }
            else {
                this.addComponent(new LightRenderer(arguments[0]), ComponetType.renderer);
                
            }
        }
        else {
            this.addComponent(new SpriteRenderer(arguments[0]), ComponetType.renderer);
        }
    } else {
        this.addComponent(new Renderer());
    }
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

GameObject.prototype.addComponent = function (component, componentType) {
    let componentName = componentType || component.constructor.name;
    this.mComponents[componentName] = component;
    if (this.mComponents[componentName].setParent)
        this.mComponents[componentName].setParent(this);
    Object.defineProperty(this, componentName.replace(/^\w/, c => c.toLowerCase()), { get: function () { return this.mComponents[componentName]; } });
};
GameObject.prototype.removeComponent = function (component) 
{
    if(this.mComponents[component]){
        if(this.mComponents[component].destroy)
            this.mComponents[component].destroy();
    }
    delete this.mComponents[component];
};
GameObject.prototype.getComponent = function (component) {
    return this.mComponents[component];
};
GameObject.prototype.getAllComponents = function () {
    console.log(this.mComponents);
};
GameObject.prototype.destroy = function () {
    for (let c in this.mComponents) {
        if (this.mComponents[c].destroy)
            this.mComponents[c].destroy();
    }
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

GameObject.prototype.onCollisionStart = function (event) {
    // this.renderer.setColor([1,0,0,1]);
};
GameObject.prototype.onCollisionEnd = function (event) {
    // this.renderer.setColor([1,1,1,1]);
};