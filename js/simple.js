'use strict';
function SimpleGame() {
    
    this.square = null;
    this.squareBlue = null;
    this.squareFloor = null;
    this.kBgClip = 'assets/sound/the_field_of_dreams.mp3';
    this.kCollector = 'assets/minion_collector.png';
    this.kMinion = 'assets/minion_sprite.png';
    this.mTextSysFont = null;
    this.mMapText = 'assets/map.json';
    this.mMapTexture = 'assets/sprites.png';
    this.mMap = new MapRenderer(this.mMapText);
}
gEngine.Core.inheritPrototype(SimpleGame, Scene);

SimpleGame.prototype.loadScene = function () {
    gEngine.Audio.loadAudio(this.kBgClip);
    gEngine.Textures.loadTexture(this.kCollector);
    gEngine.Textures.loadTexture(this.kMinion);
    gEngine.Textures.loadTexture(this.mMapTexture);
    this.mMap.load();
};

SimpleGame.prototype.initialize = function () {
    this.camera = new Camera([20, 60], 40);
    this.camera2 = new Camera([20, 60], 20, [.5, 0, .5, 1]);
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

    this.mCollector = new Sprite(this.kCollector);
    this.mCollector.setColor([1, 1, 0, 1]);
    this.mCollector.getTransform().setPosition([19, 60, 0]);
    this.mCollector.getTransform().setScale([2, 2, 1]);

    this.mCollector2 = new AnimatedSprite(this.kMinion, {
        frame: { width: 204, height: 160, count: 10 },
        animations: [
            new AnimationDescription({ frames: [0], time: 300, loops: -1 }),
            new AnimationDescription({ start:1,count:9, time: 200, loops: -1 })
        ],
        defaultAnimation: 0,
        params: { X: 0 },
        transitions: [
            [
                new Transition(1, [
                    new Condition('X', AnimationOperator.MoreThan, 1)
                ]),

            ],
            [
                new Transition(0, [
                    new Condition('X', AnimationOperator.LessThan, 1)
                ])
            ]
        ]
    });
    this.mCollector2.setColor([1, 1, 1, 1]);
    this.mCollector2.getTransform().setPosition([25, 60, 0]);
    this.mCollector2.getTransform().setScale([8, 8, 1]);


    this.mTextSysFont = new FontRenderable("System Font: in Red");
    this.mTextSysFont.setColor([1, 0, 0, 1]);
    this.mTextSysFont.getTransform().setPosition([10, 60, 0]);
    this.mTextSysFont.setTextHeight(1);

    //this.mCollector.setTextureCoordUV(0, .5, 0, .5);

    gEngine.Audio.playBackgroundAudio(this.kBgClip);

    this.mMap.initialize();
    this.mMap.getTransform().setPosition([20, 60, 0]);
    this.mMap.getTransform().setScale([.8, .8, 1]);
};
SimpleGame.prototype.update = function () {
    var gamepads = gEngine.Input.getGamepads();
    if (gamepads[0]) {
        this.mTextSysFont.getTransform().translate([gamepads[0].axes[0] * .1, -gamepads[0].axes[1] * .1, 0])
        this.mTextSysFont.getTransform().setRotation(Math.atan2(-gamepads[0].axes[3], gamepads[0].axes[2]));
    }

    if (gEngine.Input.isKeyPressed(gEngine.Input.keyCodes.A)) {
        this.mCollector2.getTransform().translate([-0.2, 0, 0]);
        this.mCollector2.setParamValue('X', 2);
        this.mCollector2.getTransform().setScale([8, 8, 1]);
    }
    else {
        if (gEngine.Input.isKeyPressed(gEngine.Input.keyCodes.D)) {
            this.squareFloor.setColor([1, 0, 1, 1]);
            this.mCollector2.getTransform().translate([0.2, 0, 0]);
            this.mCollector2.setParamValue('X', 2);
            this.mCollector2.getTransform().setScale([-8, 8, 1]);
        } else {
            this.squareFloor.setColor([0, 0, 1, 1]);
            this.mCollector2.setParamValue('X', 0);
        }
    }

    if (this.camera.isMouseInViewport()) {
        this.mCollector.getTransform().setPositionX(this.camera.mouseWCX());
        this.mCollector.getTransform().setPositionY(this.camera.mouseWCY());
    }

    if (gEngine.Input.isKeyClicked(gEngine.Input.keyCodes.F)) {
        this.camera.shake(-2, -2, 20, 30);
    }
    if (gEngine.Input.isKeyClicked(gEngine.Input.keyCodes.G)) {
        this.camera2.shake(-2, -2, 20, 30);
    }
    this.mCollector2.updateAnimation(40);
    //this.mMap.getTransform().translate([-0.01,0.01,0]);
    this.camera.update();
    this.camera2.update();
};
SimpleGame.prototype.draw = function () 
{
    this.camera.refreshViewport();
    //this.camera2.refreshViewport();
    this.camera.setupViewProjection();
    this.mMap.draw(this.camera);
    this.squareBlue.draw(this.camera);
    this.squareFloor.draw(this.camera);
    this.square.draw(this.camera);
    this.mCollector.draw(this.camera);
    this.mCollector2.draw(this.camera);
    this.mTextSysFont.draw(this.camera);
    //this.camera2.setupViewProjection();
    //this.mMap.draw(this.camera2);
    //this.squareBlue.draw(this.camera2);
    //this.squareFloor.draw(this.camera2);
    //this.square.draw(this.camera2);
    //this.mCollector.draw(this.camera2);
    //this.mCollector2.draw(this.camera2);
    //this.mTextSysFont.draw(this.camera2);
};

