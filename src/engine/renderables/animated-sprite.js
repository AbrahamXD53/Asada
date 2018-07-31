'use strict';
function AnimatedSprite(texture,options){
    Sprite.call(this,texture);
    this.mAnimationController = new AnimationController({
        params:options.params,
        animations:options.animations,
        defaultAnimation:options.defaultAnimation
    });
    let textureInfo =  gEngine.Textures.getTextureInfo(texture);
    this.mFrames = new FrameDescriptor({width:64,height:64,numFrames:16,imageWidth:textureInfo.mWidth,imageHeight:textureInfo.mHeight});
    this.mPrevFrame = -1;
}
gEngine.Core.inheritPrototype(AnimatedSprite,Sprite);

AnimatedSprite.prototype.updateAnimation=function(delta){
    this.mAnimationController.update(delta);

    let animation = this.mAnimationController.getFrame();
    let frame = this.mFrames.getFrame(animation);
    if(frame!=this.mPrevFrame){
        this.mPrevFrame= frame;
        this.setTextureCoordPixels(frame[0],frame[2],frame[1],frame[3]);
    }
};