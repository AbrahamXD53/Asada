'use strict';
function SimpleGame() {
    this.camera = new Camera([20, 60], 40, [0, 0, 640, 480]);
    this.square = null;
    this.squareBlue = null;
    this.squareFloor = null;
    this.kBgClip = 'assets/sound/the_field_of_dreams.mp3';
    this.kCollector = 'assets/minion_collector.png';
    this.mTextSysFont=null;
    this.mMapText = 'assets/map.json';
    this.mMapTexture = 'assets/sprites.png';
    this.mMap = new MapRenderer(this.mMapText);
}
gEngine.Core.inheritPrototype(SimpleGame, Scene);

SimpleGame.prototype.loadScene = function() {
    gEngine.Audio.loadAudio(this.kBgClip);
    gEngine.Textures.loadTexture(this.kCollector);
    gEngine.Textures.loadTexture(this.mMapTexture);
    this.mMap.load();
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

    this.mCollector = new Sprite(this.kCollector);
    this.mCollector.setColor([1, 1, 0,1]);
    this.mCollector.getTransform().setPosition([19,60,0]);
    this.mCollector.getTransform().setScale([2,2,1]);

    this.mCollector2 = new AnimatedSprite(this.kCollector,{
        frame:{width:128,height:128,count:4},        
        animations:[
            new AnimationDescription({frames:[0,2],time:300,loops:-1}),
            new AnimationDescription({start:2, count:2,time:300,loops:-1})
        ],
        defaultAnimation:0,
        params:{X:25},
        transitions:[
            [
                new AnimationTransition(1,[
                    new AnimationCondition('X',AnimationOperator.MoreThan,31)
                ]),
                
            ],
            [
                new AnimationTransition(0,[
                    new AnimationCondition('X',AnimationOperator.LessThan,31)
                ])
            ]
        ]
    });
    this.mCollector2.setColor([1, 1, 1, 1]);
    this.mCollector2.getTransform().setPosition([25,60,0]);
    this.mCollector2.getTransform().setScale([8,8,1]);


    this.mTextSysFont = new FontRenderable("System Font: in Red");
    this.mTextSysFont.setColor([1,0,0,1]);
    this.mTextSysFont.getTransform().setPosition([10,60,0]);
    this.mTextSysFont.setTextHeight(1);

    this.mCollector.setTextureCoordUV(0,.5,0,.5);

    gEngine.Audio.playBackgroundAudio(this.kBgClip);

    this.mMap.initialize();
    this.mMap.getTransform().setPosition([20,60,0]);
    this.mMap.getTransform().setScale([.8,.8,1]);
};
SimpleGame.prototype.update = function () {
    var gamepads = gEngine.Input.getGamepads();
    if (gamepads[0]) {
        this.mTextSysFont.getTransform().translate([gamepads[0].axes[0] * .1, -gamepads[0].axes[1] * .1, 0])
        this.mTextSysFont.getTransform().setRotation(Math.atan2(-gamepads[0].axes[3], gamepads[0].axes[2]));
    }
    if (gEngine.Input.isKeyPressed(gEngine.Input.keyCodes.A)) {
        this.squareFloor.setColor([1, 0, 1, 1]);
        this.mCollector2.getTransform().translate([0.1,0,0]);
    } else {
        this.squareFloor.setColor([0, 0, 1, 1]);
    }
    if (gEngine.Input.isKeyPressed(gEngine.Input.keyCodes.D)) {
        this.mCollector2.getTransform().translate([-0.1,0,0]);
    }
    this.mCollector2.setParamValue('X',this.mCollector2.getTransform().getPositionX());
    
    this.mCollector2.updateAnimation(40);
    //this.mMap.getTransform().translate([-0.01,0.01,0]);
};
SimpleGame.prototype.draw = function () {
    this.camera.setupViewProjection();
    var vpMatrix = this.camera.getVPMatrix();
    this.mMap.draw(vpMatrix);
    this.squareBlue.draw(vpMatrix);
    this.squareFloor.draw(vpMatrix);
    this.square.draw(vpMatrix);
    this.mCollector.draw(vpMatrix);
    this.mCollector2.draw(vpMatrix);
    this.mTextSysFont.draw(vpMatrix);
};

