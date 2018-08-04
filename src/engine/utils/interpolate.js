'use strict';
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
    this.mCyclesLeft - this.mCycles;
};

Interpolate.prototype.updateInterpolation = function () {
    if (this.mCyclesLeft <= 0)
        return;
    this.mCycles--;
    if (this.mCyclesLeft === 0)
        this.mCurrentValue = this.mFinalValue;
    else
        this.interpolateValue();
};

function InterpolateVec2(value,cycle,rate){
    Interpolate.call(this,value,cycle,rate);
}

gEngine.Core.inheritPrototype(InterpolateVec2,Interpolate);

InterpolateVec2.prototype.interpolateValue = function(){
    twgl.v3.lerp(this.mCurrentValue,this.mFinalValue,this.mRate,this.mCurrentValue);
}