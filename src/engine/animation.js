'use strict';

var AnimationState = Object.freeze({
    Paused: 0,
    Playing: 1,
    Ended: 0
});
var AnimationOperator = Object.freeze({
    Equals: 0,
    MoreThan: 1,
    LessThan: 2
});

function FrameDescriptor(description) {
    this.mFrames = undefined;
    if (description.frames) {
        this.mFrames = description.frames;
    } else {
        this.mFrames = [];
        for (let y = 0, frame = 0; y < description.imageHeight && frame < description.numFrames; y += description.height) {
            for (let x = 0; x < description.imageWidth - description.width  && frame < description.numFrames; x += description.width, frame++) {
                this.mFrames.push([x, y, x + description.width, y + description.height]);
            }
        }
    }
}
FrameDescriptor.prototype.getFrame = function (index) {
    return this.mFrames[index];
};


function AnimationDescription(description) {
    this.mDirection = description.direction || 1;
    if (description.frames) {
        this.mLimit = description.frames.length;
        this.mStart = 0;
        this.mFrameIndexes = description.frames
    }
    else {
        this.mStart = description.start;
        this.mLimit = description.start + description.count;
    }
    this.mTime = description.time;
    this.mCurrentTime = 0;
    this.mCurrentFrame = this.mStart;
    this.mLoops = description.loops || 1;
    this.mCurrentLoops = 0;

    this.mState = AnimationState.Playing;
    this.mSpeed = description.speed || 1;
}
AnimationDescription.prototype.reset = function () {
    this.mCurrentLoops = 0;
    this.mCurrentTime = 0;
    this.mCurrentAnimation = this.mStart;
    this.mState = AnimationState.Playing;
};

AnimationDescription.prototype.update = function (delta) {

    if (this.mCurrentLoops < this.mLoops || this.mLoops < 0) {
        this.mCurrentTime += delta * this.mSpeed;
        if (this.mCurrentTime >= this.mTime) {
            this.mCurrentTime = 0;
            this.mCurrentFrame += this.mDirection;
            if (this.mCurrentFrame >= this.mLimit) {
                if (this.mCurrentLoops < this.mLoops - 1 || this.mLoops < 0) {
                    this.mCurrentFrame = this.mStart;
                } else {
                    this.mCurrentFrame -= this.mDirection;
                    this.mState = AnimationState.Ended;
                }
                this.mCurrentLoops++;
            }
        }
    }
};

AnimationDescription.prototype.getFrame = function () {
    return this.mFrameIndexes ? this.mFrameIndexes[this.mCurrentFrame] : this.mCurrentFrame;
};

function AnimationParam(name, type) {
    this.mName = name;
    this.mType = type;
}


function Condition(name, operator, value) {
    this.mName = name;
    this.mOperador = operator;
    this.mValue = value;
}

Condition.prototype.test = function (val) 
{
    switch (this.mOperador) {
        case AnimationOperator.Equals:
            return this.mValue == val;
        case AnimationOperator.MoreThan:
            return val > this.mValue;
        case AnimationOperator.LessThan:
            return val < this.mValue;
    }
};

function Transition(dest, conditions) {
    this.mDest = dest;
    this.mConditions = conditions;
}

function AnimationController(description) {
    this.mParams = description.params || [];
    this.mAnimations = description.animations || [];
    this.mDefaultAnimation = description.defaultAnimation || 0;
    this.mCurrentAnimation = this.mDefaultAnimation;
    this.mTransitions = description.transitions || [];
}

AnimationController.prototype.update = function (delta) {
    if (this.mTransitions[this.mCurrentAnimation]) {
        let transitions = this.mTransitions[this.mCurrentAnimation];
        for (let or = 0,transLen=transitions.length, valid = true; or < transLen; or++) {
            if (!transitions[or].mConditions) {
                if (this.mAnimations[this.mCurrentAnimation].mState != AnimationState.Ended) {
                    valid = false;
                    break;
                }
            } else {
                for (let and = 0,condLen=transitions[or].mConditions.length; and < condLen; and++) 
                {
                    if(this.mParams[transitions[or].mConditions[and].mName]==undefined){
                        console.warn('No animation param called ' + transitions[or].mConditions[and].mName);
                    }else{
                        if (!transitions[or].mConditions[and].test(this.mParams[transitions[or].mConditions[and].mName])) {
                            valid = false;
                            break;
                        }
                    }
                }
            }
            if (valid) {
                this.mCurrentAnimation = transitions[or].mDest;
                this.mAnimations[this.mCurrentAnimation].reset();
                break;
            }
        }
    }
    if(this.mAnimations[this.mCurrentAnimation])
        this.mAnimations[this.mCurrentAnimation].update(delta);
};

AnimationController.prototype.getFrame = function () {
    return this.mAnimations[this.mCurrentAnimation].getFrame();
};

AnimationController.prototype.setParamValue = function(name,val){
    this.mParams[name]=val;
};

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
