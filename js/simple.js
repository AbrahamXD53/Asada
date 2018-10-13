'use strict';
function SimpleGame() {

    this.square = null;
    this.squareBlue = null;
    this.squareFloor = null;
    this.mBg = 'assets/bg.png';
    this.mBgUp = 'assets/bgLayer.png';
    this.mBgNormal = 'assets/bg_normal.png';
    this.mBgUpNormal = 'assets/bgLayer_normal.png';
    this.kBgClip = 'assets/sound/ZombiesAreComing.ogg';
    this.kCollector = 'assets/minion_collector.png';
    this.kMinion = 'assets/minion_sprite.png';
    this.kMinionNormal = 'assets/minion_sprite_normal.png';
    this.kDefaultParticle = 'defaultParticle';
    this.mTextSysFont = null;
    this.mMapText = 'assets/mario.json';
    this.mMapTexture = 'assets/smb3.png';
    this.mMap = new MapRenderer(this.mMapText);
    this.mTouchPos = document.getElementById('touch-position');

    this.mTheLight = null;

    this.mFullScreenBtn = document.getElementById('full-screen');
    this.mFullScreenBtn.addEventListener('click', this.fullScreen, false);
    this.mJumping=false;
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
    gEngine.Audio.loadAudio(this.kBgClip);
    gEngine.Textures.loadTexture(this.kCollector);
    gEngine.Textures.loadTexture(this.kMinion);
    gEngine.Textures.loadTexture(this.kMinionNormal);
    gEngine.Textures.loadTexture(this.mMapTexture);
    gEngine.Textures.loadTexture(this.mBg);
    gEngine.Textures.loadTexture(this.mBgUp);
    gEngine.Textures.loadTexture(this.mBgUpNormal);
    gEngine.Textures.loadTexture(this.mBgNormal);
    this.mMap.load();
};

SimpleGame.prototype.initialize = function () {
    this.camera = new Camera([0, 0,0], 30);
    this.camera2 = new Camera([0, 0,0], 10, [.5, 0, .5, 1]);

    this.mBackground = new ParallaxGameObject(this.camera,4,this.mBg,this.mBgNormal);
    this.mBackground.transform.scale([19,19,1]);
    this.mBackgroundUp = new ParallaxGameObject(this.camera,3,this.mBgUp,this.mBgUpNormal);
    this.mBackgroundUp.transform.scale([19,19,1]);
    //this.mBackground.setComponent(ComponetType.renderer,new SpriteRenderer(this.mBg));

    this.mTheLight = new Light();
    //this.mTheLight.setLightType(Light.LightType.Spot);
    this.mTheLight.setPositionZ(2);
    this.mTheLight.setPositionX(0);
    this.mTheLight.setNear(10);
    this.mTheLight.setFar(15);
    this.mTheLight.setPositionY(5);  // Position above LMinion
    this.mTheLight.setColor([0, 0,1, 1]);


    this.mTheLight2 = new Light();
    this.mTheLight2.setPositionZ(2);
    this.mTheLight2.setPositionX(-10);
    this.mTheLight2.setPositionY(-1);  // Position above LMinion
    this.mTheLight2.setNear(8);
    this.mTheLight2.setFar(9);
    this.mTheLight2.setColor([1.0, 0.0, 0.0, 1]);

    this.mTheLight3 = new Light();
    this.mTheLight3.setPositionZ(2);
    this.mTheLight3.setPositionX(0);
    this.mTheLight3.setPositionY(-5);  // Position above LMinion
    this.mTheLight3.setNear(8);
    this.mTheLight3.setFar(9);
    this.mTheLight3.setColor([0.0, 1.0, 0, 1]);

    this.square = new GameObject(this.kCollector,true);

    //this.particle= new ParticleGameObject(this.kDefaultParticle,0,0,1000);

    //this.square.transform.setRotation(Math.PI / 4);
    this.square.getComponent(ComponetType.transform).setScale([2, 2, 1]);
    this.square.getComponent(ComponetType.transform).setPosition(twgl.v3.create(0, -2.8));
    //this.square.setComponent('Renderer', new SpriteRenderer(this.kCollector));
    // this.square.transform.setRotationDeg(45);

    this.square.addComponent(new Physics({ density: 1,friction:0, frictionStatic: 0.0, frictionAir: 0.1, inertia: Infinity,offsetX:0.2 }));
    Matter.Body.setInertia(this.square.physics.getBody(), Infinity);
    this.squareBlue = new GameObject();
    this.squareBlue.getComponent(ComponetType.transform).setScale([1, 2, 2]);

    this.squareBlue.transform.setPosition(twgl.v3.create(-5.9, 25.5));
    this.squareBlue.transform.setRotationDeg(45);

    this.squareBlue.renderer.setColor([1, 1, 1, 1]);
    this.squareBlue.addComponent(new Physics({density:1}));
    this.squareBlue.getAllComponents();

    this.squareFloor = new GameObject();
    this.squareFloor.transform.setPosition(twgl.v3.create(-7, -5, 0));
    this.squareFloor.transform.setScale([8, 1, 1]);
    this.squareFloor.renderer.setColor([1, 0, 0, 1]);
    this.squareFloor.addComponent(new Physics({ isStatic: true }));

	this.mCollector = new GameObject(this.kMinion, this.kMinionNormal);
    //this.mCollector.setComponent('Renderer', new IllumRenderer(this.kMinion,this.kMinionNormal));
    this.mCollector.addComponent(new Animator({
        frame: { width: 204, height: 160, count: 10 },
        animations: [
            new AnimationDescription({ frames: [0], time: 300, loops: -1 }),
            new AnimationDescription({ start: 1, count: 9, time: 100, loops: -1 })
        ],
        defaultAnimation: 1,
        params: { X: 0 },
        transitions: [
        ]
    }));
    let material = this.mCollector.renderer.getMaterial();
    material.setShininess(100);
    material.setDiffuse([0.5,0.5,0.5,0]);
    material.setSpecular([0,0,0,0]);
    console.log(material);
    
    this.mCollector.transform.setPosition([0, 0, 0]);
    this.mCollector.transform.setScale([5, 5, 1]);

    this.square.renderer.addLight(this.mTheLight);
    this.square.renderer.addLight(this.mTheLight2);
    this.square.renderer.addLight(this.mTheLight3);

    this.mCollector.renderer.addLight(this.mTheLight);
    this.mCollector.renderer.addLight(this.mTheLight2);
    this.mCollector.renderer.addLight(this.mTheLight3);


    this.mCollector2 = new GameObject(this.kMinion,this.kMinionNormal);
    // this.mCollector2.setComponent(ComponetType.renderer, new IllumRenderer(this.kMinion,this.kMinionNormal));
    this.mCollector2.addComponent(new Animator({
        frame: { width: 204, height: 160, count: 10 },
        animations: [
            new AnimationDescription({ frames: [0], time: 300, loops: -1 }),
            new AnimationDescription({ start: 1, count: 9, time: 200, loops: -1 })
        ],
        defaultAnimation: 0,
        params: { X: 0 },
        transitions: [
            [
                new Transition(1, [
                    new Condition('X', AnimationOperator.MoreThan, 1)
                ])

            ],
            [
                new Transition(0, [
                    new Condition('X', AnimationOperator.LessThan, 1)
                ])
            ]
        ]
    }));
    this.mCollector.getAllComponents();
    this.mCollector2.renderer.setColor([1, 1, 1, 1]);
    this.mCollector2.transform.setPosition([2, 0, 0]);
    this.mCollector2.transform.setScale([1, 1, 1]);
    this.mCollector2.renderer.addLight(this.mTheLight);
    this.mCollector2.renderer.addLight(this.mTheLight2);
    this.mCollector2.renderer.addLight(this.mTheLight3);
    this.mBackground.renderer.addLight(this.mTheLight);
    this.mBackground.renderer.addLight(this.mTheLight2);
    this.mBackground.renderer.addLight(this.mTheLight3);
    this.mBackgroundUp.renderer.addLight(this.mTheLight);
    this.mBackgroundUp.renderer.addLight(this.mTheLight2);
    this.mBackgroundUp.renderer.addLight(this.mTheLight3);

    this.mTextSysFont = new FontRenderable("Asada Engine Fierro!");
    this.mTextSysFont.setColor([1, .8, .8, 1]);
    this.mTextSysFont.getTransform().setPosition([-10, 5, 0]);
    this.mTextSysFont.setTextHeight(1);

    gEngine.Audio.playBackgroundAudio(this.kBgClip);

    this.mMap.initialize();
    //this.mMap.getTransform().setPosition([0, 0, 0]);
    //this.mMap.getTransform().setScale([1, 1, 1]);
    this.mMap.setShader(gEngine.DefaultResources.getLightShader());
    this.mMap.addLight(this.mTheLight);
    this.mMap.addLight(this.mTheLight2);
    this.mMap.addLight(this.mTheLight3);

    this.particleEmiter = new GameObject(gEngine.DefaultResources.getDefaultParticleTexture());
    this.particleEmiter.transform.setPosition([6,-7,0]);
    this.particleEmiter.removeComponent(ComponetType.renderer);
    this.particleEmiter.addComponent(new ParticleEmiter({
        positionGenerator:function(){
            return [this.transform.getPosition()[0] + (-1 + 2 * Math.random()),
            this.transform.getPosition()[1] + (-1 + 2 * Math.random()), 0];
        }.bind(this.particleEmiter),
        velocityGenerator:function(){
            return [0,-0.1,0];
        }.bind(this.particleEmiter),
        startColor:[0,.2,1,0.6],
        startScale:[2,2,0],
        lifeTime:[10,15]
    }));
};
var localTime=0;
SimpleGame.prototype.update = function (delta = 1) {

    //this.particle.update();
    var touches = gEngine.Input.getTouches();
    if (gEngine.Input.getTouchCount() > 0) {
        let coords = this.camera.screenToSpace([touches[0].clientX, touches[0].clientY]);
        coords[2] = 0;
        this.mCollector.transform.setPosition(coords);
        this.mTouchPos.innerText = 'Touch Position: ' + [Math.floor(touches[0].clientX), Math.floor(touches[0].clientY)];

    }
    var gamepads = gEngine.Input.getGamepads();

    if (gamepads[0]) {
		this.mTextSysFont.getTransform().translate([gamepads[0].axes[0] * .1, -gamepads[0].axes[1] * .1, 0]);
        this.mTextSysFont.getTransform().setRotation(Math.atan2(-gamepads[0].axes[3], gamepads[0].axes[2]));
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

        this.mTouchPos.innerText = 'Mouse Position: ' + gEngine.Input.getMousePos();
    }

    if (gEngine.Input.isKeyClicked(gEngine.Input.keyCodes.F)) {
        this.camera.shake(-2, -2, 20, 30);
    }
    if (gEngine.Input.isKeyClicked(gEngine.Input.keyCodes.G)) {
        this.camera2.shake(-2, -2, 20, 30);
    }
    

    if (gEngine.Input.isKeyPressed(gEngine.Input.keyCodes.Z)) {
        this.square.physics.applyForce({ x: -2, y: 0 });
        this.square.transform.setScale([2, 2, 1]);
    }
    if (gEngine.Input.isKeyPressed(gEngine.Input.keyCodes.C)) {
        this.square.physics.applyForce({ x: 2, y: 0 });
        this.square.transform.setScale([-2, 2, 1]);
    }
    if (gEngine.Input.isKeyClicked(gEngine.Input.keyCodes.S))
    {
        this.mJumping=1;
        this.square.physics.applyForce({ x: 0, y: 60 });
    }
    
    if (gEngine.Input.isKeyPressed(gEngine.Input.keyCodes.S))
	{
		this.mJumping++;
		if (this.mJumping<26 && this.mJumping%5===0)
            this.square.physics.applyForce({ x: 0, y: 20 });
    }
    this.mCollector2.update(delta);
    this.mCollector.update(delta);

    this.squareFloor.update(delta);
    this.square.update(delta);
    this.squareBlue.update(delta);
    this.mMap.setCollision(this.square.transform.getPosition());
    this.camera.setCenter(this.square.transform.getPositionX(),3.5+this.square.transform.getPositionY());
    
    this.mBackground.update(delta);
    this.mBackgroundUp.update(delta);
    this.camera.update();
    this.camera2.update();
    localTime+=delta*.1;
    //this.particleEmiter.transform.translate([Math.cos(localTime),Math.sin(localTime),0]);
    this.particleEmiter.update(delta);
};
SimpleGame.prototype.draw = function () {
    this.camera.refreshViewport();
    //this.camera2.refreshViewport();
    this.camera.setupViewProjection();
    this.mBackground.draw(this.camera);
    this.mBackgroundUp.draw(this.camera);

    this.mMap.draw(this.camera);
    this.squareBlue.draw(this.camera);
    this.squareFloor.draw(this.camera);
    this.square.draw(this.camera);
    this.mCollector2.draw(this.camera);
    this.mCollector.draw(this.camera);
	this.mTextSysFont.draw(this.camera);

	this.particleEmiter.draw(this.camera);
    
    //this.camera2.setupViewProjection();
    //this.mMap.draw(this.camera2);
    // this.squareBlue.draw(this.camera2);
    // this.squareFloor.draw(this.camera2);
    // this.square.draw(this.camera2);
    //this.mCollector.draw(this.camera2);
    //this.mCollector2.draw(this.camera2);
    // this.mTextSysFont.draw(this.camera2);
};

