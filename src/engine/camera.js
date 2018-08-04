'use strict';
function CameraState(center, width) {
    this.kCycles = 300;
    this.kRate = 1.0;
    this.mCenter = new InterpolateVec2(center, this.kCycles, this.kRate);
    this.mWidth = new Interpolate(width, this.kCycles, this.kRate);
}

CameraState.prototype.getCenter = function () { return this.mCenter.getValue(); };
CameraState.prototype.getWidth = function () { return this.mWidth.getValue(); };

CameraState.prototype.setWidth = function (w) { return this.mWidth.setFinalValue(w); };
CameraState.prototype.setCenter = function (c) { return this.mCenter.setFinalValue(c); };

CameraState.prototype.updateCameraState = function () {
    this.mCenter.updateInterpolation();
    this.mWidth.updateInterpolation();
};

CameraState.prototype.configInterpolation = function (stiffness, duration) {
    this.mCenter.configInterpolation(stiffness, duration);
    this.mWidth.configInterpolation(stiffness, duration);
}

function Camera(center, width, viewportArray) {
    this.mCameraState = new CameraState(center, width);
    this.mCameraShake = null;
    this.mViewport = viewportArray;
    this.mFarPlane = 1000;
    this.mNearPlane = 0;
    this.mViewMatrix = twgl.m4.identity();
    this.mProjMatrix = twgl.m4.identity();
    this.mVPMatrix = twgl.m4.identity();
    this.mBgColor = [0.6, 0.7, 0.9, 1.0];
}
Camera.prototype.shake = function (xDelta, yDelta, shakeFrequency, duration) {
    this.mCameraShake = new CameraShake(this.mCameraState, xDelta, yDelta, shakeFrequency, duration);
};
Camera.prototype.update = function () {
    if (this.mCameraShake !== null) {
        if (this.mCameraShake.shakeDone()) {
            this.mCameraShake = null;
        } else {
            this.mCameraShake.setRefCenter(this.getCenter());
            this.mCameraShake.updateShakeState();
        }
    }
    this.mCameraState.updateCameraState();
};

Camera.prototype.configInterpolation = function (stiffness, duration) {
    this.mCameraState.configInterpolation(stiffness, duration);
};

Camera.prototype.getBackgroundColor = function () { return this.mBgColor; };
Camera.prototype.getCenter = function () { return this.mCameraState.getCenter(); };
Camera.prototype.getViewport = function () { return this.mViewport; };
Camera.prototype.getWidth = function () { return this.mCameraState.getWidth(); };
Camera.prototype.getHeight = function () { return this.mCameraState.getWidth() * this.mViewport[3] / this.mViewport[2]; };

Camera.prototype.getVPMatrix = function () { return this.mVPMatrix; };

Camera.prototype.setViewport = function (viewportArray) { this.mViewport = viewportArray; };
Camera.prototype.setBackgroundColor = function (color) { this.mBgColor = color; };
Camera.prototype.setWidth = function (width) { this.mCameraState.setWidth(width); };
Camera.prototype.setCenter = function (xPos, yPos) {
    this.mCameraState.setCenter([xPos, yPos, 0]);
};
Camera.prototype.setupViewProjection = function () {
    var gl = gEngine.Core.getGL();

    gl.viewport(this.mViewport[0], this.mViewport[1], this.mViewport[2], this.mViewport[3]);
    gl.scissor(this.mViewport[0], this.mViewport[1], this.mViewport[2], this.mViewport[3]);
    gl.clearColor(this.mBgColor[0], this.mBgColor[1], this.mBgColor[2], this.mBgColor[3]);

    gl.enable(gl.SCISSOR_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.disable(gl.SCISSOR_TEST);

    let center = [];
    if (this.mCameraShake !== null) {
        center = this.mCameraShake.getCenter();
    } else {
        center = this.getCenter();
    }
    var halfWCWidth = 0.5 * this.getWidth();
    var halfWCHeight = 0.5 * this.getHeight();

    twgl.m4.lookAt([center[0], center[1], 10], [center[0], center[1], 0], [0, 1, 0], this.mViewMatrix);
    twgl.m4.ortho(-halfWCWidth, halfWCWidth, -halfWCHeight, halfWCHeight, this.mNearPlane, this.mFarPlane, this.mProjMatrix);
    twgl.m4.inverse(this.mViewMatrix, this.mViewMatrix);
    twgl.m4.multiply(this.mProjMatrix, this.mViewMatrix, this.mVPMatrix);
};

function CameraShake(state, xDelta, yDelta, shakeFrequency, shakeDuration) {
    this.mOrgCenter = twgl.v3.copy(state.getCenter());
    this.mShakeCenter = twgl.v3.copy(this.mOrgCenter);
    this.mShake = new Shake(xDelta, yDelta, shakeFrequency, shakeDuration);
}

CameraShake.prototype.updateShakeState = function () {
    var s = this.mShake.getShakeResults();
    twgl.v3.add(this.mOrgCenter, s, this.mShakeCenter);
};

CameraShake.prototype.shakeDone = function () {
    return this.mShake.shakeDone();
};

CameraShake.prototype.getCenter = function () { return this.mShakeCenter; };
CameraShake.prototype.setRefCenter = function (c) {
    this.mOrgCenter[0] = c[0];
    this.mOrgCenter[1] = c[1];
};