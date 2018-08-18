'use strict';

function Animator(options) {
    //let textureInfo = gEngine.Textures.getTextureInfo(texture);
    this.mAnimationController = null;
    this.mFrames = null;
    this.mFrameInfo = null;
    if (options) {
        this.mAnimationController = new AnimationController({
            params: options.params || {},
            animations: options.animations || [new AnimationDescription({ frames: [0], time: 300, loops: -1 })],
            defaultAnimation: options.defaultAnimation || 0,
            transitions: options.transitions,
        });
        if (options.frames || options.frame) {
            this.mFrameInfo = {
                frames: options.frames,
                width: options.frame.width,
                height: options.frame.height,
                numFrames: options.frame.count,
                //imageWidth: textureInfo.mWidth,
                //imageHeight: textureInfo.mHeight
            };
        }
    } else {
        this.mAnimationController = new AnimationController({
            params: {},
            animations: [new AnimationDescription({ frames: [0], time: 300, loops: -1 })],
            defaultAnimation: 0,
            transitions: [],
        });
    }
    this.mPrevFrame = -1;
    this.mParent = null;
}

Animator.prototype.setUpTexture = function () 
{
    let textureInfo = gEngine.Textures.getTextureInfo( this.mParent.renderer.getTexture());    
    if(this.mFrameInfo){
        this.mFrameInfo.imageWidth= textureInfo.mWidth;
        this.mFrameInfo.imageHeight= textureInfo.mHeight;
    }
    else{
        this.mFrameInfo  = {frames:[[0,0,textureInfo.mWidth,textureInfo.mHeight]]};
    }
    this.mFrames = new FrameDescriptor(this.mFrameInfo);

    let frame = this.mAnimationController.getFrame();
    if (frame != this.mPrevFrame) {
        let box = this.mFrames.getFrame(frame);
        this.mPrevFrame = frame;
        this.mParent.renderer.setTextureCoordPixels(box[0], box[2], box[3], box[1]);
    }
}

Animator.prototype.setParent = function (p) {
    this.mParent = p;

    this.setUpTexture();
}

Animator.prototype.update = function (delta = 10) {
    this.mAnimationController.update(delta);

    let animation = this.mAnimationController.getFrame();
    let frame = this.mFrames.getFrame(animation);
    if (frame != this.mPrevFrame) {
        this.mPrevFrame = frame;
        this.mParent.renderer.setTextureCoordPixels(frame[0], frame[2], frame[3], frame[1]);
    }
};

Animator.prototype.setParamValue = function (name, val) {
    this.mAnimationController.setParamValue(name, val);
};


function AnimatedSprite(texture, options = {}) {
    Sprite.call(this, texture);
    this.mAnimationController = new AnimationController({
        params: options.params,
        animations: options.animations || [new AnimationDescription({ frames: [0], time: 300, loops: -1 })],
        defaultAnimation: options.defaultAnimation,
        transitions: options.transitions,
    });
    let textureInfo = gEngine.Textures.getTextureInfo(texture);
    if (options.frames || options.frame) {
        this.mFrames = new FrameDescriptor({
            frames: options.frames,
            width: options.frame.width,
            height: options.frame.height,
            numFrames: options.frame.count,
            imageWidth: textureInfo.mWidth,
            imageHeight: textureInfo.mHeight
        });
    }
    else {
        this.mFrames = new FrameDescriptor({
            frames: { width: textureInfo.mWidth, height: textureInfo.mHeight, count: 1 }
        });
    }
    this.mPrevFrame = -1;
}
gEngine.Core.inheritPrototype(AnimatedSprite, Sprite);

AnimatedSprite.prototype.updateAnimation = function (delta) {
    this.mAnimationController.update(delta);

    let animation = this.mAnimationController.getFrame();
    let frame = this.mFrames.getFrame(animation);
    if (frame != this.mPrevFrame) {
        this.mPrevFrame = frame;
        this.setTextureCoordPixels(frame[0], frame[2], frame[3], frame[1]);
    }
};

AnimatedSprite.prototype.setParamValue = function (name, val) {
    this.mAnimationController.setParamValue(name, val);
};