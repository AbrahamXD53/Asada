var gEngine = gEngine || {};
gEngine.Input = (function () {

	var kKeyCodes = {
		// arrows
		Left: 37,
		Up: 38,
		Right: 39,
		Down: 40,

		// space bar
		Space: 32,

		// numbers 
		Zero: 48,
		One: 49,
		Two: 50,
		Three: 51,
		Four: 52,
		Five: 53,
		Six: 54,
		Seven: 55,
		Eight: 56,
		Nine: 57,

		// Alphabets
		A: 65,
		B: 66,
		C: 67,
		D: 68,
		E: 69,
		F: 70,
		G: 71,
		H: 72,
		I: 73,
		J: 74,
		K: 75,
		L: 76,
		M: 77,
		N: 78,
		O: 79,
		P: 80,
		Q: 81,
		R: 82,
		S: 83,
		T: 84,
		U: 85,
		V: 86,
		W: 87,
		X: 88,
		Y: 89,
		Z: 90,

		LastKeyCode: 222
	};

	var mKeyPreviousState = [];
	var mIsKeyPressed = [];
	var mIsKeyClicked = [];
	var mIsKeyUp = [];

	var kMouseButtons = {
		Left: 0,
		Middle: 1,
		Right: 2
	};

	var mCanvas = null;
	var mButtonPreviousState = [];
	var mIsButtonPressed = [];
	var mIsButtonClicked = [];
	var mMousePosX = -1;
	var mMousePosY = -1;

	var gamepads = [];

	var onKeyDown = function (event) {
		mIsKeyPressed[event.keyCode] = true;
		mIsKeyUp[event.keyCode] = false;
	};
	var onKeyUp = function (event) {
		mIsKeyPressed[event.keyCode] = false;
		mIsKeyUp[event.keyCode] = true;
	};

	var onMouseMove = function (event) {
		var inside = false;
		var bBox = mCanvas.getBoundingClientRect();
		var x = Math.round((event.clientX - bBox.left) * (mCanvas.width / bBox.width));
		var y = Math.round((event.clientY - bBox.top) * (mCanvas.width / bBox.width));
		if (x >= 0 && x < mCanvas.width && y >= 0 && y < mCanvas.height) {
			mMousePosX = x;
			mMousePosY = mCanvas.height - 1 - y;
			inside = true;
		}
		return inside;
	};

	var onMouseDown = function (event) {
		if (onMouseMove(event))
			mIsButtonPressed[event.button] = true;
	};

	var onMouseUp = function (event) {
		onMouseMove(event);
		mIsButtonPressed[event.button] = false;
	};

	var isButtonPressed = function (button) {
		return mIsButtonPressed[button];
	};

	var isButtonClicked = function (button) {
		return mIsButtonClicked[button];
	};

	var getMousePosX = function () { return mMousePosX; };
	var getMousePosY = function () { return mMousePosY; };

	var getMousePos = function () { return [mMousePosX, mMousePosY, 0]; };

	var mTouches = [];

	var activeTouches = 0;

	var onTouchStart = function (event) {
		event.preventDefault();

		var touches = event.changedTouches;

		for (var i = 0; i < touches.length; i++) {
			activeTouches += 1;
			mTouches[touches[i].identifier] = touches[i];
			mTouches[touches[i].identifier].phase = 'start';
		}
	};

	var onTouchEnd = function (event) {
		event.preventDefault();
		var touches = event.changedTouches;

		for (var i = 0; i < touches.length; i++) {
			activeTouches -= 1;
			mTouches[touches[i].identifier] = touches[i];
			mTouches[touches[i].identifier].phase = 'end';
		}
	};

	var onTouchCancel = function (event) {
		event.preventDefault();
		var touches = event.changedTouches;

		for (var i = 0; i < touches.length; i++) {
			activeTouches -= 1;
			mTouches[touches[i].identifier] = touches[i];
			mTouches[touches[i].identifier].phase = 'cancel';
		}
	};

	var onTouchMove = function (event) {
		event.preventDefault();
		var touches = event.changedTouches;

		for (var i = 0; i < touches.length; i++) {
			mTouches[touches[i].identifier] = touches[i];
			mTouches[touches[i].identifier].phase = 'move';
		}
	};

	var getTouches = function () {
		return mTouches;
	};
	var getTouchCount = function () {
		return activeTouches;
	};
	var getTouch = function (id) {
		return mTouches[id] || null;
	};

	var onGamepadConnected = function (event) {
	};

	var onGamepadDisconnected = function (event) {
	};

	var gpButtonPressed = function (id, button) {

	};

	var initialize = function () {
		for (let i in kKeyCodes) {
			mIsKeyPressed[kKeyCodes[i]] = false;
			mKeyPreviousState[kKeyCodes[i]] = false;
			mIsKeyClicked[kKeyCodes[i]] = false;
			mIsKeyUp[kKeyCodes[i]] = true;
		}

		for (let i = 0; i < 3; i++) {
			mButtonPreviousState[i] = false;
			mIsButtonPressed[i] = false;
			mIsButtonClicked[i] = false;
		}
		window.addEventListener('mousedown', onMouseDown);
		window.addEventListener('mouseup', onMouseUp);
		window.addEventListener('mousemove', onMouseMove);

		window.addEventListener('keyup', onKeyUp);
		window.addEventListener('keydown', onKeyDown);

		var gl = gEngine.Core.getGL();

		mCanvas = gl.canvas;
		gl.canvas.addEventListener('touchstart', onTouchStart, false);
		gl.canvas.addEventListener('touchend', onTouchEnd, false);
		gl.canvas.addEventListener('touchcancel', onTouchCancel, false);
		gl.canvas.addEventListener('touchmove', onTouchMove, false);

		window.addEventListener('gamepadconnected', onGamepadConnected, false);
		window.addEventListener('gamepaddisconnected', onGamepadDisconnected, false);

		gamepads = navigator.getGamepads ? navigator.getGamepads() : navigator.webkitGetGamepads ? navigator.webkitGetGamepads : [];

	};

	var update = function () {
		for (let i in kKeyCodes) {
			mIsKeyClicked[kKeyCodes[i]] = !mKeyPreviousState[kKeyCodes[i]] && mIsKeyPressed[kKeyCodes[i]];
			mKeyPreviousState[kKeyCodes[i]] = mIsKeyPressed[kKeyCodes[i]];
		}
		for (let i = 0; i < 3; i++) {
			mIsButtonClicked[i] = !mButtonPreviousState[i] && mIsButtonPressed[i];
			mButtonPreviousState[i] = mIsButtonPressed[i];
		}
		gamepads = navigator.getGamepads ? navigator.getGamepads() : navigator.webkitGetGamepads ? navigator.webkitGetGamepads : [];
	};

	var isKeyPressed = function (keyCode) {
		return mIsKeyPressed[keyCode];
	};

	var isKeyClicked = function (keyCode) {
		return mIsKeyClicked[keyCode];
	};

	var isKeyUp = function (keyCode) {
		return mIsKeyUp[keyCode];
	};

	var getGamepads = function (keyCode) {
		return gamepads;
	};

	var mPublic = {
		initialize: initialize,
		update: update,
		isKeyPressed: isKeyPressed,
		isKeyClicked: isKeyClicked,
		isKeyUp: isKeyUp,
		keyCodes: kKeyCodes,
		mouseButtons: kMouseButtons,
		isButtonClicked: isButtonClicked,
		isButtonPressed: isButtonPressed,
		getMousePos: getMousePos,
		getMousePosX: getMousePosX,
		getMousePosY: getMousePosY,
		getGamepads: getGamepads,
		getTouches: getTouches,
		getTouchCount: getTouchCount,
		getTouch: getTouch
	};
	return mPublic;
}());