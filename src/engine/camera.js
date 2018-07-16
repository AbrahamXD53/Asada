'use strict';
function Camera(center,width,viewportArray) {
    this.mCenter = center;
    this.mWidth = width;
    this.mViewport = viewportArray;
    this.mFarPlane = 1000;
    this.mNearPlane = 0;
    this.mViewMatrix = twgl.m4.identity();
    this.mProjMatrix = twgl.m4.identity();
    this.mVPMatrix = twgl.m4.identity();
    this.mBgColor = [0.8, 0.8, 0.8, 1.0];
}
Camera.prototype.setCenter = function (xPos, yPos) {
    this.mCenter[0] = xPos;
    this.mCenter[1] = yPos;
};
Camera.prototype.setViewport = function (viewportArray) {
    this.mViewport = viewportArray;
};
Camera.prototype.setBackgroundColor = function (color) {
    this.mBgColor = color;
};
Camera.prototype.setWidth = function (width) {
    this.mWidth = width;
};
Camera.prototype.getBackgroundColor = function () { return this.mBgColor; };
Camera.prototype.getCenter = function () { return this.mCenter; };
Camera.prototype.getViewport = function () { return this.mViewport; };
Camera.prototype.getWidth = function () { return this.mWidth; };
Camera.prototype.getVPMatrix = function () { return this.mVPMatrix; };
Camera.prototype.setupViewProjection = function () {
    var gl = gEngine.Core.getGL();
    gl.viewport(this.mViewport[0], this.mViewport[1], this.mViewport[2], this.mViewport[3]);
    gl.scissor(this.mViewport[0], this.mViewport[1], this.mViewport[2], this.mViewport[3]);
    gl.clearColor(this.mBgColor[0], this.mBgColor[1], this.mBgColor[2], this.mBgColor[3]);
    gl.enable(gl.SCISSOR_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.disable(gl.SCISSOR_TEST);
    var halfWCWidth = 0.5 * this.mWidth;
    var halfWCHeight = halfWCWidth * this.mViewport[3] / this.mViewport[2];
    twgl.m4.lookAt([this.mCenter[0], this.mCenter[1], 10], [this.mCenter[0], this.mCenter[1], 0], [0, 1, 0], this.mViewMatrix);
    twgl.m4.ortho(-halfWCWidth, halfWCWidth, -halfWCHeight, halfWCHeight, this.mNearPlane, this.mFarPlane, this.mProjMatrix);
    twgl.m4.inverse(this.mViewMatrix, this.mViewMatrix);
    twgl.m4.multiply(this.mProjMatrix, this.mViewMatrix, this.mVPMatrix);
};




