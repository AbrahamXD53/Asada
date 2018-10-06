function Light() {
    this.mColor = [1.0, 1.0, 1.0, 1.0];
    this.mPosition = [0, 0, 5];
    this.mNear = 5;
    this.mFar = 12;
    this.mIntensity = 1;
    this.mIsOn = true;
}

Light.prototype.setColor = function (c) {
    this.mColor = c;
};

Light.prototype.setPosition = function (p) {
    this.mPosition = [p[0], p[1], this.mPosition[2]];
};

Light.prototype.setPositionX = function (x) { this.mPosition[0] = x; };
Light.prototype.setPositionY = function (y) { this.mPosition[1] = y; };
Light.prototype.setPositionZ = function (z) { this.mPosition[2] = z; };
Light.prototype.setLightStatus = function (s) { this.mIsOn = s; };
Light.prototype.setNear = function (r) { this.mNear = r; };
Light.prototype.setFar = function (r) { this.mFar = r; };
Light.prototype.setIntensity = function (i) { this.mIntensity = i; };

Light.prototype.getIntensity = function () { return this.mIntensity; };
Light.prototype.getFar = function () { return this.mFar; };
Light.prototype.getNear = function () { return this.mNear; };
Light.prototype.getColor = function () { return this.mColor; };
Light.prototype.getPosition = function () { return this.mPosition; };
Light.prototype.getLightStatus = function () { return this.mIsOn; };


function LightSet() {
    this.mSet = [];
}
LightSet.prototype.getCount = function () { return this.mSet.length; };
LightSet.prototype.getLightAt = function (index) {
    return this.mSet[index];
};
LightSet.prototype.Add = function (light) {
    this.mSet.push(light);
};