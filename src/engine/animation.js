'use strict';

var AnimationState = Object.freeze({
    Paused:0,
    Playing:1,
    Ended:0
});
var AnimationOperator = Object.freeze({
    Equals:0,
    MoreThan:1,
    LessThan:2    
});

function FrameDescriptor(description){
    this.mFrames = undefined;
    if(description.frames){
        this.mFrames = description.frames;
    }else{
        this.mFrames= [];
        for(let y=0,frame=0;y<description.imageHeight && frame<description.numFrames;y+=description.height){
            for(let x= 0;x<description.imageWidth && frame<description.numFrames;x+=description.width,frame++)
            {
                this.mFrames.push([x,y,x+description.width,y+description.height]);
            }
        }
    }
}
FrameDescriptor.prototype.getFrame =  function(index){
    return this.mFrames[index];
};


function AnimationDescription(description)
{
    this.mDirection = description.direction || 1;
    if(description.frames){
        this.mLimit = description.frames.length;
        this.mStart = 0;
        this.mFrameIndexes = description.frames
    }
    else{
        this.mStart = description.start;
        this.mLimit = description.start+ description.count;
    }
    this.mTime = description.time;
    this.mCurrentTime = 0;
    this.mCurrentFrame = this.mStart;
    this.mLoops =  description.loops || 1;
    this.mCurrentLoops=0;

    this.mState = AnimationState.Playing;
}

AnimationDescription.prototype.update=function(delta){
    
    if(this.mCurrentLoops<this.mLoops || this.mLoops<0)
    {
        this.mCurrentTime+=delta;
        if(this.mCurrentTime>= this.mTime){
            this.mCurrentTime = 0;
            this.mCurrentFrame+=this.mDirection;
            if(this.mCurrentFrame>=this.mLimit){
                if(this.mCurrentLoops<this.mLoops-1 || this.mLoops<0)
                {
                    this.mCurrentFrame = this.mStart;
                }else{
                    this.mCurrentFrame-=this.mDirection;
                    this.mState = AnimationState.Ended;
                }
                this.mCurrentLoops++;
            }
        }
    }
};

AnimationDescription.prototype.getFrame= function(){
    return this.mFrameIndexes?this.mFrameIndexes[this.mCurrentFrame]:this.mCurrentFrame;
};

function AnimationParam(name,type){
    this.mName = name;
    this.mType = type;
}


function AnimationCondition(name,operator,value){
    this.mName = name;
    this.mOperador = value;
    this.mValue = value;    
}

AnimationCondition.prototype.test = function (val){
    switch(this.mOperador){
        case AnimationOperator.Equals:
            return this.mValue == val;
        case AnimationOperator.MoreThan:
            return val > this.mValue;
        case AnimationOperator.LessThan:
            return val < this.mValue;
    }
};

function AnimationTransition(origin,dest,condition){

}

function AnimationController(description){
    this.mParams = description.params;
    this.mAnimations = description.animations;
    this.mDefaultAnimation = description.defaultAnimation;
    this.mCurrentAnimation = this.mDefaultAnimation;
    this.mTransitions = description.transitions;

    console.log(this.mAnimations);
}

AnimationController.prototype.update = function(delta)
{
    this.mAnimations[this.mCurrentAnimation].update(delta);
};

AnimationController.prototype.getFrame = function(){
    return this.mAnimations[this.mCurrentAnimation].getFrame();
};