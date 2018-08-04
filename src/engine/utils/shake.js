'use strict';
function Shake(xDelta,yDelta,frequency,duration){
    this.mXMag = xDelta;
    this.mYMag = yDelta;
    this.mCycles = duration;
    this.mOmega = frequency * 2 * Math.PI;
    this.mNumCyclesLeft = duration;
}

Shake.prototype.nextDampedHarmonic = function(){
    let frac = this.mNumCyclesLeft / this.mCycles;
    return frac * frac * Math.cos((1-frac)*this.mOmega);
};

Shake.prototype.shakeDone = function(){
    return this.mNumCyclesLeft <= 0;
};

Shake.prototype.getShakeResults = function(){
    this.mNumCyclesLeft--;
    let c=[];
    let fx = 0;
    let fy = 0;
    if(!this.shakeDone()){
        let v = this.nextDampedHarmonic();
        fx = (Math.random()>0.5)?-v:v;
        fy = (Math.random()>0.5)?-v:v;
    }
    c[0]= this.mXMag*fx;
    c[1]= this.mYMag*fy;
    return c;
};