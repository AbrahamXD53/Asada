let ComponetType = Object.freeze({
    transform: 'Transform',
    renderer: 'Renderer',
    physics: 'Physics'
});
function GameObject() {
    this.mComponents = {};
    this.addComponent(new Transform());
    if (arguments.length > 0) {
        if (arguments.length > 1) {
            if (typeof arguments[1] === 'string' || arguments[1] instanceof String) {
                this.addComponent(new IllumRenderer(arguments[0], arguments[1]), ComponetType.renderer);
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
GameObject.prototype.getComponent = function (component) {
    return this.mComponents[component];
};
GameObject.prototype.getAllComponents = function () {
    console.log(this.mComponents);
};
GameObject.prototype.destroy = function () {
    if (this.getComponent(ComponetType.physics)) {
        Matter.World.remove(gEngine.Physics.getWorld(), this.getComponent(ComponetType.physics).getBody());
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

function Particle(cyclesToLive) {
    this.mColor = [1.0, 1.0, 1.0, 1.0];
    this.mCyclesToLive = cyclesToLive;
    GameObject.call(this, gEngine.DefaultResources.getDefaultParticleTexture());
    this.addComponent(new Physics({ circle: true, friction: 0,collisionFilter:{category:0} }));
    this.renderer.setColor([0.0,0.5,1,0.9]);
}
gEngine.Core.inheritPrototype(Particle, GameObject);

Particle.prototype.update = function (delta) {
    this.mCyclesToLive -= delta;
    GameObject.prototype.update.call(this, delta);
};
Particle.prototype.hasExpired = function () { return (this.mCyclesToLive < 0); };

function ParticleEmiter(options = {}) { //New component
    this.mParticles = [];
    this.mStartSize = 1;
    this.mMaxParticles = 100;
    this.mNextParticle = Random(2, 1);
}

ParticleEmiter.prototype.emit = function (position) {
    this.mParticles.push(
        new Particle(Random(5, 8))
    );
};

ParticleEmiter.prototype.update = function (delta) {
    this.mNextParticle -= delta;
    if (this.mNextParticle < 0 && this.mMaxParticles > this.mParticles.length) {
        this.mNextParticle = 0.2;//Random(2, 1);
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
    gl.blendFunc(gl.ONE, gl.ONE);
    for (let index = this.mParticles.length - 1; index >= 0; index--) {
        this.mParticles[index].draw(camera);
    }
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
};

/*function Particle(pos) {
    this.kPadding = 0.5; // for drawing particle bounds
    this.mPosition = pos; // this is likely to be a reference to xform.mPosition
    this.mDrag = 0.95;
}

function ParticleGameObject(texture, atX, atY, cyclesToLive) {

    GameObject.call(this);
    this.setComponent.call(this, 'Renderer', new ParticleRenderer(texture));
    this.transform.setPosition.call(this, [atX, atY, 0]);
    this.addComponent(new Physics({ circle: true }));
    this.mDeltaColor = [0, 0, 0, 0];
    this.mSizeDelta = 0;
    this.mCyclesToLive = cyclesToLive;
}
gEngine.Core.inheritPrototype(ParticleGameObject, GameObject);

ParticleGameObject.prototype.setFinalColor = function (f) {
    //vec4.sub(this.mDeltaColor, f, this.mRenderComponent.getColor());
    if (this.mCyclesToLive !== 0) {
        // vec4.scale(this.mDeltaColor, this.mDeltaColor, 1 / this.mCyclesToLive);
    }
};

ParticleGameObject.prototype.setSizeDelta = function (d) { this.mSizeDelta = d; };
ParticleGameObject.prototype.hasExpired = function () { return (this.mCyclesToLive < 0); };
ParticleGameObject.prototype.update = function () {
    GameObject.prototype.update.call(this);
    this.mCyclesToLive--;
    let c = this.renderer.getColor();
    this.renderer.setColor([c[0] + this.mDeltaColor[0], c[1] + this.mDeltaColor[1], c[2] + this.mDeltaColor[2], c[3] + this.mDeltaColor[3]]);
    this.transform.scale(this.mSizeDelta);
};
ParticleGameObject.prototype.draw = function (camera) {
    var gl = gEngine.Core.getGL();
    gl.blendFunc(gl.ONE, gl.ONE); // for additive blending!
    GameObject.prototype.draw.call(this, camera);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
}*/
var TiledType = Object.freeze({ All: 0, Vertical: 1, Horizontal: 2 });
function TiledGameObject(texture, normal) {
    GameObject.call(this, texture, normal);
    this.mShouldTile = true;
    this.mTiledType = TiledType.All;
}
gEngine.Core.inheritPrototype(TiledGameObject, GameObject);
TiledGameObject.prototype.setIsTiled = function (t) { this.mShouldTile = t; };
TiledGameObject.prototype.shouldTile = function () { return this.mShouldTile; };
/**
 * @param {Camera} camera Camera used to render
 */
TiledGameObject.prototype.drawTile = function (camera) {
    let transform = this.transform;
    let w = transform.getScaleX();
    let h = transform.getScaleY();
    let pos = transform.getPosition();
    let left = pos[0] - (w / 2);
    let right = left + w;
    let top = pos[1] + (h / 2);
    let bottom = top - h;

    let wcPos = camera.getCenter();
    let wcLeft = wcPos[0] - (camera.getWidth() / 2);
    let wcRight = wcLeft + camera.getWidth();
    let wcBottom = wcPos[1] - (camera.getHeight() / 2);
    let wcTop = wcBottom + camera.getHeight();

    let dx = 0, dy = 0;
    if (right < wcLeft) {
        dx = Math.ceil((wcLeft - right) / w) * w;
    } else {
        if (left > wcLeft) {
            dx = -Math.ceil((left - wcLeft) / w) * w;
        }
    }
    if (top < wcBottom) {
        dy = Math.ceil((wcBottom - top) / h) * h;
    } else {
        if (bottom > wcBottom) {
            dy = -Math.ceil((bottom - wcBottom) / h) * h;
        }
    }

    let sX = pos[0], sY = pos[1];

    transform.translate([dx, dy, 0]);
    right = pos[0] + (w / 2);
    top = pos[1] + (h / 2);

    let nx = 1, ny = 1;
    nx = Math.ceil((wcRight - right) / w);
    ny = Math.ceil((wcTop - top) / h);
    let cx = nx;
    let xPos = pos[0];
    while (ny >= 0) {
        cx = nx;
        pos[0] = xPos;
        while (cx >= 0) {
            this.renderer.draw(camera);
            transform.translateX(w);
            --cx;
        }

        transform.translateY(h);
        --ny;
    }
    pos[0] = sX;
    pos[1] = sY;
};
TiledGameObject.prototype.draw = function (camera) {
    if (this.mShouldTile) {
        this.drawTile(camera);
    }
    else {
        this.renderer.draw(camera);
    }
};
function ParallaxGameObject(camera, scale, texture, normal) {
    this.mRefCamera = camera;
    this.mCameraCenterRef = this.mRefCamera.getCenter();
    console.log(this.mRefCamera, this.mCameraCenterRef);
    this.mParallaxScale = 1;
    this.setParallaxScale(scale);
    TiledGameObject.call(this, texture, normal);
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
    let f = (1 - this.mParallaxScale);
    this.transform.translate([-delta[0] * f, -delta[1] * f, 0]);
};
ParallaxGameObject.prototype.update = function () {
    let delta = this.refPosUpdate();
    this.transform.translate([this.mParallaxScale * delta[0], this.mParallaxScale * delta[1], 0]);
};

function Physics(options) {
    this.mBody = null;
    this.mParent = null;
    this.mOptions = options || { inertia: Infinity };
};

Physics.prototype.setParent = function (p) {
    this.mParent = p;
    let transform = this.mParent.transform;
    if (!this.mOptions.hasOwnProperty('circle'))
        this.mBody = Matter.Bodies.rectangle(0, 0, 1, 1, this.mOptions);
    else
        this.mBody = Matter.Bodies.circle(0, 0, 0.6, this.mOptions);
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