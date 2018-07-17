'use strict';
function SimpleGame() {
    this.camera = new Camera([20, 60], 20, [0, 0, 640, 480]);
    this.square = null;
    this.squareBlue = null;
    this.squareFloor = null;
    this.kBgClip = 'assets/sound/the_field_of_dreams.mp3';
    this.kCollector = "assets/minion_collector.png";
}
gEngine.Core.inheritPrototype(SimpleGame, Scene);

SimpleGame.prototype.loadScene = function() {
    gEngine.Audio.loadAudio(this.kBgClip);
    gEngine.Textures.loadTexture(this.kCollector);

};

SimpleGame.prototype.initialize = function () {

    this.square = new Renderable();
    this.square.getTransform().setRotation(Math.PI / 4);
    this.square.getTransform().setPosition(twgl.v3.create(20, 60));

    this.square.setColor([1, 1, 0, 1]);

    this.squareBlue = new Renderable();
    this.squareBlue.getTransform().setRotation(Math.PI / 4);
    this.squareBlue.getTransform().setPosition(twgl.v3.create(20, 61));

    this.squareBlue.setColor([0, 0, 1, 1]);

    this.squareFloor = new Renderable();
    this.squareFloor.getTransform().setPosition(twgl.v3.create(20, 55, 0));
    this.squareFloor.getTransform().setScale([8, 1, 1]);
    this.squareFloor.setColor([1, 0, 0, 1]);

    this.mCollector = new TextureRenderable(this.kCollector);
    this.mCollector.setColor([1, 1, 1, 1]);
    this.mCollector.getTransform().setPosition([19,60,0]);

    gEngine.Audio.playBackgroundAudio(this.kBgClip);
};
SimpleGame.prototype.update = function () {
    var gamepads = gEngine.Input.getGamepads();
    if (gamepads[0]) {
        this.mCollector.getTransform().translate([gamepads[0].axes[0] * .1, -gamepads[0].axes[1] * .1, 0])
        this.mCollector.getTransform().setRotation(Math.atan2(gamepads[0].axes[3], gamepads[0].axes[2]));
    }
    if (gEngine.Input.isKeyPressed(gEngine.Input.keyCodes.A)) {
        this.squareFloor.setColor([1, 0, 1, 1]);
    } else {
        this.squareFloor.setColor([0, 0, 1, 1]);
    }
};
SimpleGame.prototype.draw = function () {
    this.camera.setupViewProjection();
    var vpMatrix = this.camera.getVPMatrix();
    this.squareBlue.draw(vpMatrix);
    this.squareFloor.draw(vpMatrix);
    this.square.draw(vpMatrix);
    this.mCollector.draw(vpMatrix);
};
