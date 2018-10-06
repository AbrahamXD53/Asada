function Interpolate(value, cycles, rate) {
    this.mCurrentValue = value;
    this.mFinalValue = value;
    this.mCycles = cycles;
    this.mRate = rate;

    this.mCyclesLeft = 0;
}

Interpolate.prototype.interpolateValue = function () {
    this.mCurrentValue = this.mCurrentValue + this.mRate * (this.mFinalValue - this.mCurrentValue);
};

Interpolate.prototype.getValue = function () { return this.mCurrentValue; };

Interpolate.prototype.configInterpolation = function (stiffness, duration) {
    this.mRate = stiffness;
    this.mCycles = duration;
};

Interpolate.prototype.setFinalValue = function (v) {
    this.mFinalValue = v;
    this.mCyclesLeft = this.mCycles; 
};

Interpolate.prototype.updateInterpolation = function () {
    if (this.mCyclesLeft <= 0)
        return;
    this.mCyclesLeft--;
    if (this.mCyclesLeft === 0)
        this.mCurrentValue = this.mFinalValue;
    else
        this.interpolateValue();
};

function InterpolateVec2(value,cycle,rate){
    Interpolate.call(this,value,cycle,rate);
}

gEngine.Core.inheritPrototype(InterpolateVec2,Interpolate);

InterpolateVec2.prototype.interpolateValue = function () {
	twgl.v3.lerp(this.mCurrentValue, this.mFinalValue, this.mRate, this.mCurrentValue);
};

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
        fx = Math.random()>0.5?-v:v;
        fy = Math.random()>0.5?-v:v;
    }
    c[0]= this.mXMag*fx;
    c[1]= this.mYMag*fy;
    return c;
};

function Random(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}