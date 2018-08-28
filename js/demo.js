'use strict';
function SimpleGame() {

    this.square = null;
    this.squareBlue = null;
    this.squareFloor = null;
    this.mTextSysFont = null;
    this.mTouchPos = document.getElementById('touch-position');
    this.mFullScreenBtn = document.getElementById('full-screen');
    this.mFullScreenBtn.addEventListener('click', this.fullScreen, false);
}
gEngine.Core.inheritPrototype(SimpleGame, Scene);

SimpleGame.prototype.fullScreen = function () {
    var elem = document.getElementById('full-screen-container');
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) { /* Firefox */
        elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE/Edge */
        elem.msRequestFullscreen();
    }
};
SimpleGame.prototype.loadScene = function () {
};

SimpleGame.prototype.initialize = function () {
    this.camera = new Camera([0, 0], 40);

    this.square = new GameObject();

    this.square.getComponent(ComponetType.transform).setScale([2, 2, 1]);
    this.square.getComponent(ComponetType.transform).setPosition(twgl.v3.create(2.3, 16));
    this.square.addComponent(new Physics({ density: 1, frictionStatic: 0.1, frictionAir: 0.1, inertia: Infinity }));

    Matter.Body.setInertia(this.square.physics.getBody(), Infinity);

    this.squareBlue = new GameObject();
    this.squareBlue.getComponent(ComponetType.transform).setScale([1, 2, 2]);
    this.squareBlue.transform.setPosition(twgl.v3.create(-5.9, 25.5));
    this.squareBlue.transform.setRotationDeg(45);

    this.squareBlue.renderer.setColor([1, 1, 1, 1]);
    this.squareBlue.addComponent(new Physics({density:1}));

    this.squareFloor = new GameObject();
    this.squareFloor.transform.setPosition(twgl.v3.create(0, -5, 0));
    this.squareFloor.transform.setScale([18, 1, 1]);
    this.squareFloor.renderer.setColor([1, 0, 0, 1]);
    this.squareFloor.addComponent(new Physics({ isStatic: true }));

    this.mTextSysFont = new FontRenderable("Asada Engine Fierro!");
    this.mTextSysFont.setColor([1, .8, .8, 1]);
    this.mTextSysFont.getTransform().setPosition([-10, 5, 0]);
    this.mTextSysFont.setTextHeight(1);

};
SimpleGame.prototype.update = function (delta = 1) {

    this.camera.update();
    this.squareFloor.update(delta);
    this.square.update(delta);
    this.squareBlue.update(delta);

    if (gEngine.Input.isKeyPressed(gEngine.Input.keyCodes.Z)) {
        this.square.physics.applyForce({ x: -5, y: 0 });
        this.square.transform.setScale([2, 2, 1]);
    }
    if (gEngine.Input.isKeyPressed(gEngine.Input.keyCodes.C)) {
        this.square.physics.applyForce({ x: 5, y: 0 });
        this.square.transform.setScale([-2, 2, 1]);
    }
    if (gEngine.Input.isKeyClicked(gEngine.Input.keyCodes.S))
        this.square.physics.applyForce({ x: 0, y: 90 });
};
SimpleGame.prototype.draw = function () {

    this.camera.refreshViewport();
    this.camera.setupViewProjection();
    this.squareBlue.draw(this.camera);
    this.squareFloor.draw(this.camera);
    this.square.draw(this.camera);
    this.mTextSysFont.draw(this.camera);
};

