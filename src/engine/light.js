'use strict';

function Light(){
    this.mColor = [1.0,1.0,1.0,1.0];
    this.mPosition = [0,0,5];
    this.mRadius = 10;
    this.mIsOn=true;
}

Light.prototype.setColor = function(c){
    this.mColor=c;
};

Light.prototype.setPosition = function(p) {
    this.mPosition = [p[0], p[1], this.mPosition[2]];
};

Light.prototype.setPositionX = function(x) { this.mPosition[0] = x; };
Light.prototype.setPositionY = function(y) { this.mPosition[1] = y; };
Light.prototype.setPositionZ = function(z) { this.mPosition[2] = z; };
Light.prototype.setRadius = function(r){ this.mRadius=r; };
Light.prototype.setLightStatus = function(s){ this.mIsOn=s; };

Light.prototype.getColor = function(){ return this.mColor; };
Light.prototype.getPosition = function(){ return this.mPosition; };
Light.prototype.getRadius = function(){ return this.mRadius; };
Light.prototype.getLightStatus = function(){ return this.mIsOn; };