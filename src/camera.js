function PerRenderCache() {
	this.mWorldToPixelRatio = 1;
	this.mCameraOriginX = 1;
	this.mCameraOriginY = 1;
}

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
};

function Camera(center, width, viewportArray, bound) {
	this.mCameraState = new CameraState(center, width);
	this.mCameraShake = null;
	this.mRenderCache = new PerRenderCache();
	this.mViewport = [];
	this.mViewportBound = 0;
	if (bound !== undefined) {
		this.mViewportBound = bound;
	}
	this.mScissorBound = [];
	this.setViewPort(viewportArray || [0, 0, 1, 1], this.mViewportBound);
	this.mFarPlane = 1000;
	this.mNearPlane = 0;
	this.mViewMatrix = twgl.m4.identity();
	this.mProjMatrix = twgl.m4.identity();
	this.mVPMatrix = twgl.m4.identity();
	this.mBgColor = [0, 0, 0, 1.0];
}

Camera.prototype.getBackgroundColor = function () { return this.mBgColor; };
Camera.prototype.getCenter = function () { return this.mCameraState.getCenter(); };
Camera.prototype.getWidth = function () { return this.mCameraState.getWidth(); };
Camera.prototype.getHeight = function () { return this.mCameraState.getWidth() * this.mViewport[3] / this.mViewport[2]; };
Camera.prototype.getVPMatrix = function () { return this.mVPMatrix; };
Camera.prototype.getViewport = function () {
	return [
		this.mViewport[0],
		this.mViewport[1],
		this.mViewport[2],
		this.mViewport[3]
	];
};
Camera.prototype.getViewportScale = function () {
	return [
		this.mScissorBound[0],
		this.mScissorBound[1],
		this.mScissorBound[2],
		this.mScissorBound[3]
	];
};

Camera.prototype.setBackgroundColor = function (color) { this.mBgColor = color; };
Camera.prototype.setWidth = function (width) { this.mCameraState.setWidth(width); };
Camera.prototype.setCenter = function (xPos, yPos) {
	this.mCameraState.setCenter([xPos, yPos, 0]);
};

Camera.prototype.setViewPort = function (viewportArray, bound) {
	let gl = gEngine.Core.getGL();
	if (bound === undefined) {
		bound = this.mViewportBound;
	}
	this.mViewPortFactor = viewportArray;
	this.mViewport[0] = gl.canvas.width * this.mViewPortFactor[0] + bound;
	this.mViewport[1] = gl.canvas.height * this.mViewPortFactor[1] + bound;
	this.mViewport[2] = gl.canvas.width * this.mViewPortFactor[2] - 2 * bound;
	this.mViewport[3] = gl.canvas.height * this.mViewPortFactor[3] - 2 * bound;
	this.mScissorBound[0] = gl.canvas.width * this.mViewPortFactor[0];
	this.mScissorBound[1] = gl.canvas.height * this.mViewPortFactor[1];
	this.mScissorBound[2] = gl.canvas.width * this.mViewPortFactor[2];
	this.mScissorBound[3] = gl.canvas.height * this.mViewPortFactor[3];
};

Camera.prototype.refreshViewport = function () {
	let gl = gEngine.Core.getGL();
	this.mViewport[0] = gl.canvas.width * this.mViewPortFactor[0] + this.mViewportBound;
	this.mViewport[1] = gl.canvas.height * this.mViewPortFactor[1] + this.mViewportBound;
	this.mViewport[2] = gl.canvas.width * this.mViewPortFactor[2] - 2 * this.mViewportBound;
	this.mViewport[3] = gl.canvas.height * this.mViewPortFactor[3] - 2 * this.mViewportBound;
	this.mScissorBound[0] = gl.canvas.width * this.mViewPortFactor[0];
	this.mScissorBound[1] = gl.canvas.height * this.mViewPortFactor[1];
	this.mScissorBound[2] = gl.canvas.width * this.mViewPortFactor[2];
	this.mScissorBound[3] = gl.canvas.height * this.mViewPortFactor[3];
};

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

Camera.prototype.mouseDCX = function () {
	return gEngine.Input.getMousePosX() - this.mViewport[0];
};
Camera.prototype.mouseDCY = function () {
	return gEngine.Input.getMousePosY() - this.mViewport[1];
};

Camera.prototype.mouseDC = function () {
	return [
		gEngine.Input.getMousePosX() - this.mViewport[0],
		gEngine.Input.getMousePosY() - this.mViewport[1]
	];
};

Camera.prototype.mouseWCX = function () {
	let minWCX = this.getCenter()[0] - this.getWidth() * 0.5;
	return minWCX + this.mouseDCX() * (this.getWidth() / this.mViewport[2]);
};

Camera.prototype.mouseWCY = function () {
	let minWCY = this.getCenter()[1] - this.getHeight() * 0.5;
	return minWCY + this.mouseDCY() * (this.getHeight() / this.mViewport[3]);
};
Camera.prototype.screenToSpace = function (screen) {
	let minWCY = this.getCenter()[1] - this.getHeight() * 0.5;
	let minWCX = this.getCenter()[0] - this.getWidth() * 0.5;
	return [
		minWCX + (screen[0] - this.mViewport[0]) * (this.getWidth() / this.mViewport[2]),
		minWCY + (this.mViewport[3] - screen[1] - this.mViewport[1]) * (this.getHeight() / this.mViewport[3])
	];
};
Camera.prototype.mouseWC = function () {
	let minWCY = this.getCenter()[1] - this.getHeight() * 0.5;
	let minWCX = this.getCenter()[0] - this.getWidth() * 0.5;
	return [
		minWCX + this.mouseDCX() * (this.getWidth() / this.mViewport[2]),
		minWCY + this.mouseDCY() * (this.getHeight() / this.mViewport[3])
	];
};

Camera.prototype.isMouseInViewport = function () {
	return this.isCoordInViewport(this.mouseDC);
};

Camera.prototype.isCoordInViewport = function (coord) {
	return coord[0] >= 0 && coord[0] < this.mViewport[2] &&
		coord[1] >= 0 && coord[1] < this.mViewport[3];
};

Camera.prototype.configInterpolation = function (stiffness, duration) {
	this.mCameraState.configInterpolation(stiffness, duration);
};

Camera.prototype.setupViewProjection = function () {
	var gl = gEngine.Core.getGL();
	this.mRenderCache.mWorldToPixelRatio = this.mViewport[2] / this.getWidth();
	this.mRenderCache.mCameraOriginX = this.getCenter()[0] - this.getWidth() *0.5;
	this.mRenderCache.mCameraOriginY = this.getCenter()[1] - this.getHeight() *0.5;

	gl.viewport(this.mViewport[0], this.mViewport[1], this.mViewport[2], this.mViewport[3]);
	gl.clearColor(0, 0, 0, 0);

	gl.scissor(this.mScissorBound[0], this.mScissorBound[1], this.mScissorBound[2], this.mScissorBound[3]);
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

Camera.prototype.fakeZInPixelSpace = function (z) {
	return z * this.mRenderCache.mWorldToPixelRatio;
};

Camera.prototype.worldToPixel = function (p) {
	let x = this.mViewport[0] + (p[0] - this.mRenderCache.mCameraOriginX) * this.mRenderCache.mWorldToPixelRatio + 0.5;
	let y = this.mViewport[1] + (p[1] - this.mRenderCache.mCameraOriginY) * this.mRenderCache.mWorldToPixelRatio + 0.5;
	let z = this.fakeZInPixelSpace(p[2]);
	return [x, y, z];
};

Camera.prototype.sizeToPixel = function (s) { return s * this.mRenderCache.mWorldToPixelRatio + 0.5; };

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