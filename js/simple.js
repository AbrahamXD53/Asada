'use strict';
function SimpleGame() {
    
    this.square = null;
    this.squareBlue = null;
    this.squareFloor = null;
    this.kBgClip = 'assets/sound/ZombiesAreComing.ogg';
    this.kCollector = 'assets/minion_collector.png';
    this.kMinion = 'assets/minion_sprite.png';
    this.mTextSysFont = null;
    this.mMapText = 'assets/map.json';
    this.mMapTexture = 'assets/sprites.png';
    this.mMap = new MapRenderer(this.mMapText);
    this.mTouchPos = document.getElementById('touch-position');

    this.mTheLight = null;
    
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
    this.camera = new Camera([0, 0], 40);
    this.camera2 = new Camera([0, 0], 10, [.5, 0, .5, 1]);

    this.mTheLight = new Light();
    this.mTheLight.setPositionZ(2);
    this.mTheLight.setPositionX(0);
    this.mTheLight.setPositionY(0);  // Position above LMinion
    this.mTheLight.setColor([0.6, 0.6, 0.6, 1]);

    this.square = new GameObject();

    this.square.transform.setRotation(Math.PI / 4);
    this.square.getComponent(ComponetType.transform).setScale([2,2,2]);
    this.square.getComponent(ComponetType.transform).setPosition(twgl.v3.create(0, 0));

    this.square.getComponent(ComponetType.renderer).setColor([1, 1, 0, 1]);

    this.squareBlue = new GameObject();
    this.squareBlue.transform.setRotation(Math.PI / 4);
    this.squareBlue.transform.setPosition(twgl.v3.create(0, 1));

    this.squareBlue.renderer.setColor([0, 0, 1, 1]);

    this.squareFloor = new GameObject();
    this.squareFloor.transform.setPosition(twgl.v3.create(0, 5, 0));
    this.squareFloor.transform.setScale([8, 1, 1]);
    this.squareFloor.renderer.setColor([1, 0, 0, 1]);

    this.mCollector = new GameObject();
    this.mCollector.setComponent('Renderer',new LightRenderer(this.kMinion));
    this.mCollector.addComponent(new Animator({
        frame: { width: 204, height: 160, count: 10 },
        animations: [
            new AnimationDescription({ frames: [0], time: 300, loops: -1 }),
            new AnimationDescription({ start:1,count:9, time: 100, loops: -1 })
        ],
        defaultAnimation: 1,
        params: { X: 0 },
        transitions: [
        ]
    }));
    this.mCollector.renderer.setColor([1, 1, 0, 1]);
    this.mCollector.transform.setPosition([9, 0, 0]);
    this.mCollector.transform.setScale([4, 4, 1]);

    this.mCollector.renderer.addLight(this.mTheLight);
   

    this.mCollector2 = new GameObject();
    this.mCollector2.setComponent(ComponetType.renderer,new LightRenderer(this.kMinion));
    this.mCollector2.addComponent(new Animator({
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
    }));
    this.mCollector2.renderer.setColor([1, 1, 1, 1]);
    this.mCollector2.transform.setPosition([5, 0, 0]);
    this.mCollector2.transform.setScale([8, 8, 1]);
    this.mCollector2.renderer.addLight(this.mTheLight);

    this.mTextSysFont = new FontRenderable("System Font: in Red");
    this.mTextSysFont.setColor([1, 0, 0, 1]);
    this.mTextSysFont.getTransform().setPosition([-10, 0, 0]);
    this.mTextSysFont.setTextHeight(1);

    gEngine.Audio.playBackgroundAudio(this.kBgClip);

    this.mMap.initialize();
    this.mMap.getTransform().setPosition([0, 0, 0]);
    this.mMap.getTransform().setScale([0.8, 0.8, 1]);
    this.mMap.setShader(gEngine.DefaultResources.getLightShader());
    this.mMap.addLight(this.mTheLight);
};
var aux = 0;
SimpleGame.prototype.update = function () 
{

    aux+=1;
    var touches = gEngine.Input.getTouches();
    if(gEngine.Input.getTouchCount()>0)
    {
        let coords= this.camera.screenToSpace([touches[0].clientX,touches[0].clientY]);
        coords[2]=0;
        this.mCollector.transform.setPosition(coords);
        this.mTouchPos.innerText = 'Touch Position: '+ [ Math.floor( touches[0].clientX),Math.floor(touches[0].clientY)];

    }
    var gamepads = gEngine.Input.getGamepads();
    
    if (gamepads[0]) {
        this.mTextSysFont.transform.translate([gamepads[0].axes[0] * .1, -gamepads[0].axes[1] * .1, 0])
        this.mTextSysFont.transform.setRotation(Math.atan2(-gamepads[0].axes[3], gamepads[0].axes[2]));
    }

    if (gEngine.Input.isKeyPressed(gEngine.Input.keyCodes.A)) {
        this.mCollector2.transform.translate([-0.2, 0, 0]);
        this.mCollector2.animator.setParamValue('X', 2);
        this.mCollector2.transform.setScale([8, 8, 1]);
    }
    else {
        if (gEngine.Input.isKeyPressed(gEngine.Input.keyCodes.D)) {
            this.squareFloor.renderer.setColor([1, 0, 1, 1]);
            this.mCollector2.transform.translate([0.2, 0, 0]);
            this.mCollector2.animator.setParamValue('X', 2);
            this.mCollector2.transform.setScale([-8, 8, 1]);
        } else {
            this.squareFloor.renderer.setColor([0, 0, 1, 1]);
        }
    }

    if (this.camera.isMouseInViewport()) {
        this.mCollector.transform.setPositionX(this.camera.mouseWCX());
        this.mCollector.transform.setPositionY(this.camera.mouseWCY());

        this.mTouchPos.innerText = 'Mouse Position: '+gEngine.Input.getMousePos();
    }

    if (gEngine.Input.isKeyClicked(gEngine.Input.keyCodes.F)) {
        this.camera.shake(-2, -2, 20, 30);
    }
    if (gEngine.Input.isKeyClicked(gEngine.Input.keyCodes.G)) {
        this.camera2.shake(-2, -2, 20, 30);
    }
    this.mCollector2.update(20);
    this.mCollector.update();
    //this.mMap.getTransform().scale([Math.cos(aux/200)*.01,Math.cos(aux/200)*.01,0]);
    this.camera.update();
    this.camera2.update();
};
SimpleGame.prototype.draw = function () 
{
    this.camera.refreshViewport();
    this.camera2.refreshViewport();
    this.camera.setupViewProjection();
    this.mMap.draw(this.camera);
    this.squareBlue.draw(this.camera);
    this.squareFloor.draw(this.camera);
    this.square.draw(this.camera);
    this.mCollector2.draw(this.camera);
    this.mCollector.draw(this.camera);
    this.mTextSysFont.draw(this.camera);
    this.camera2.setupViewProjection();
    this.mMap.draw(this.camera2);
    // this.squareBlue.draw(this.camera2);
    // this.squareFloor.draw(this.camera2);
    // this.square.draw(this.camera2);
    this.mCollector.draw(this.camera2);
    this.mCollector2.draw(this.camera2);
    // this.mTextSysFont.draw(this.camera2);
};

