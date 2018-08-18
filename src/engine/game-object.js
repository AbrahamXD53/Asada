'use strict';

function GameObject() {
    this.mComponents = {};
    this.addComponent(new Transform());
    this.addComponent(new Renderer());
    this.mParent = null;
    this.mChildren = null;
}

GameObject.prototype.update = function () {
    for (let c in this.mComponents) {
        if (this.mComponents[c].update)
            this.mComponents[c].update();
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
GameObject.prototype.setComponent = function (componentType, value) {
    if (!this.mComponents[componentType])
        this.addComponent(value);
    else {
        this.mComponents[componentType] = value;
        if (this.mComponents[componentType].setParent)
            this.mComponents[componentType].setParent(this);
    }
};