'use strict';

var gEngine = gEngine || {};

gEngine.Core = (function () {
	var mGL = null;

	var getGL = function () {
		return mGL;
	};


	var initializeWebGL = function (canvasId) {
		var canvas = document.getElementById(canvasId);

		mGL = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

		if (mGL === null) {
			document.write('<br><b>Error: Webgl is not supported</b>');
			return;
		}
		gEngine.Core.clearCanvas([0, 0, 0, 1.0]);
	};

	var initializeEngineCore = function (canvasId, myGame) {
		initializeWebGL(canvasId);
		gEngine.VertexBuffer.initialize();
		gEngine.Input.initialize();
		gEngine.Audio.initialize();

		gEngine.DefaultResources.initialize(function () { startScene(myGame); });
	};

	var startScene = function (myGame) {
		myGame.loadScene.call(myGame); // Called in this way to keep correct context
		gEngine.GameLoop.start(myGame); // start the game loop after initialization
	};

	var clearCanvas = function (color) {
		mGL.clearColor(color[0], color[1], color[2], color[3]);
		mGL.clear(mGL.COLOR_BUFFER_BIT);
	};

	var inheritPrototype = function (subClass, superClass) {
		var prototype = Object.create(superClass.prototype);
		prototype.constructor = subClass;
		subClass.prototype = prototype;
	};

	var mPublic = {
		getGL: getGL,
		initialize: initializeEngineCore,
		clearCanvas: clearCanvas,
		inheritPrototype:inheritPrototype
	};


	return mPublic;
}());

gEngine.VertexBuffer = (function () {
	var vertexInfo = {
		position: [
			0.5, 0.5, 0.0,
			-0.5, 0.5, 0.0,
			0.5, -0.5, 0.0,
			-0.5, -0.5, 0.0
		]
	};
	var mVertexBuffer = null;

	var getVertexBuffer = function () {
		return mVertexBuffer;
	};

	var initialize = function () {
		var gl = gEngine.Core.getGL();
		mVertexBuffer = twgl.createBufferInfoFromArrays(gl, vertexInfo);
	};

	var mPublic = {
		initialize: initialize,
		getVertexBuffer: getVertexBuffer
	};

	return mPublic;
}());

gEngine.GameLoop = (function () {
	var kFPS = 60;
	var kMPF = 1000 / kFPS;

	var mPreviousTime;
	var mLagTime;
	var mCurrentTime;
	var mElapsedTime;

	var mIsLoopRunning = true;
	var mIsFocused = true;

	var mCurrentScene = null;

	var runLoop = function () {
		if (mIsLoopRunning) {
			requestAnimationFrame(function () { runLoop.call(mCurrentScene); });
			mCurrentTime = Date.now();
			mElapsedTime = mCurrentTime - mPreviousTime;
			mPreviousTime = mCurrentTime;
			mLagTime += mElapsedTime;

			while ((mLagTime >= kMPF) && mIsLoopRunning) {
				if (mIsFocused) {

					gEngine.Input.update();
					this.update();
				}
				mLagTime -= kMPF;
			}
			this.draw();
		} else {
			mCurrentScene.unloadScene();
		}
	};
	var startLoop = function () {
		mPreviousTime = Date.now();
		mLagTime = 0.0;
		mIsLoopRunning = true;
		requestAnimationFrame(function () { runLoop.call(mCurrentScene); });
	};

	var onBlur = function () {
		mIsFocused = false;
		gEngine.Audio.pause();
	};

	var onFocus = function () {
		mIsFocused = true;
		gEngine.Audio.resume();
	};

	var start = function (scene) {
		mCurrentScene = scene;

		gEngine.ResourceMap.setLoadCompleteCallback(function () {
			mCurrentScene.initialize();
			startLoop();

			window.addEventListener('focus', onFocus);
			window.addEventListener('blur', onBlur);
		});


	};

	var stop = function () {
		mIsLoopRunning = false;

		window.removeEventListener('focus');
		window.removeEventListener('blur');
	}

	var mPublic = {
		start: start,
		stop: stop,
		onBlur:onBlur,
		onFocus:onFocus
	};

	return mPublic;
}());
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
		D: 68,
		E: 69,
		F: 70,
		G: 71,
		I: 73,
		J: 74,
		K: 75,
		L: 76,
		R: 82,
		S: 83,
		W: 87,

		LastKeyCode: 222
	};

	var mLastPool = 0;
	var kUpdateTime = 1000;
	var gamepads = [];

	var mKeyPreviousState = [];
	var mIsKeyPressed = [];
	var mIsKeyClicked = [];
	var mIsKeyUp = [];

	var onKeyDown = function (event) {
		mIsKeyPressed[event.keyCode] = true;
		mIsKeyUp[event.keyCode] = false;
	};
	var onKeyUp = function (event) {
		mIsKeyPressed[event.keyCode] = false;
		mIsKeyUp[event.keyCode] = true;
	};

	var onTouchStart = function (event) {

	};

	var onTouchEnd = function (event) {

	};

	var onTouchCancel = function (event) {

	};

	var onTouchMove = function (event) {

	};

	var onGamepadConnected = function (event) {
	};

	var onGamepadDisconnected = function (event) {
	};

	var gpButtonPressed = function (id, button) {

	};

	var initialize = function () {
		for (var i = 0; i < kKeyCodes.LastKeyCode; i++) {
			mIsKeyPressed[kKeyCodes[i]] = false;
			mKeyPreviousState[kKeyCodes[i]] = false;
			mIsKeyClicked[kKeyCodes[i]] = false;
			mIsKeyUp[kKeyCodes[i]] = true;
		}
		window.addEventListener('keyup', onKeyUp);
		window.addEventListener('keydown', onKeyDown);

		var gl = gEngine.Core.getGL();
		gl.canvas.addEventListener('touchstart', onTouchStart, false);
		gl.canvas.addEventListener('touchend', onTouchEnd, false);
		gl.canvas.addEventListener('touchcancel', onTouchCancel, false);
		gl.canvas.addEventListener('touchmove', onTouchMove, false);

		window.addEventListener('gamepadconnected', onGamepadConnected, false);
		window.addEventListener('gamepaddisconnected', onGamepadDisconnected, false);

		gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);
		mLastPool = Date.now();
	};

	var update = function () {
		for (var i = 0; i < kKeyCodes.LastKeyCode; i++) {
			mIsKeyClicked[kKeyCodes[i]] = (!mKeyPreviousState[kKeyCodes[i]]) && mIsKeyPressed[kKeyCodes[i]];
			mKeyPreviousState[kKeyCodes[i]] = mIsKeyPressed[kKeyCodes[i]];
		}
		gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);
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
		getGamepads: getGamepads
	};
	return mPublic;
}());

gEngine.ResourceMap = (function () {

	var MapEntry = function (rName) {
		this.mAsset = rName;
		this.mRefCount = 1;
	};

	var mResourceMap = {};
	var mNumOutstandingLoads = 0;
	var mLoadCompleteCallback = null;

	var checkForAllLoadCompleted = function () {
		if ((mNumOutstandingLoads === 0) && (mLoadCompleteCallback !== null)) {
			var funcToCall = mLoadCompleteCallback;
			mLoadCompleteCallback = null;
			funcToCall();
		}
	};

	var setLoadCompleteCallback = function (funct) {
		mLoadCompleteCallback = funct;
		checkForAllLoadCompleted();
	};

	var asyncLoadRequested = function (rName) {
		mResourceMap[rName] = new MapEntry(rName);
		++mNumOutstandingLoads;
	};

	var asyncLoadCompleted = function (rName, loadedAsset) {
		if (!isAssetLoaded(rName))
			console.log(rName + ': not in map!');
		mResourceMap[rName].mAsset = loadedAsset;
		--mNumOutstandingLoads;
		checkForAllLoadCompleted();
	};

	var isAssetLoaded = function (rName) {
		return (rName in mResourceMap);
	};

	var retrieveAsset = function (rName) {
		if (rName in mResourceMap)
			return mResourceMap[rName].mAsset;
		return null;
	};

	var incAssetRefCount = function (rName) {
		mResourceMap[rName].mRefCount += 1;
	}

	var unloadAsset = function (rName) {
		if (rName in mResourceMap) {
			mResourceMap[rName].mRefCount -= 1;
			if (mResourceMap[rName].mRefCount <= 0)
				delete mResourceMap[rName];
			return mResourceMap[rName].mRefCount;
		}
		return 0;
	};

	var mPublic = {
		asyncLoadRequested: asyncLoadRequested,
		asyncLoadCompleted: asyncLoadCompleted,
		setLoadCompleteCallback: setLoadCompleteCallback,

		retrieveAsset: retrieveAsset,
		unloadAsset: unloadAsset,
		isAssetLoaded: isAssetLoaded
	};
	return mPublic;
}());

gEngine.TextFileLoader = (function () {
	var TextFileType = Object.freeze({
		XMLFile: 0,
		TextFile: 1
	});

	var loadTextFile = function (fileName, fileType, callbackFunction) {
		if (!gEngine.ResourceMap.isAssetLoaded(fileName)) {
			gEngine.ResourceMap.asyncLoadRequested(fileName);

			var req = new XMLHttpRequest();

			req.onreadystatechange = function () {
				if ((req.readyState === 4) && (req.status !== 200)) {
					console.log(fileName + ': must be served by a web-server');
				}
			}
			req.open("GET", fileName, true);
            req.setRequestHeader("Content-Type", "text/xml");

			req.onload = function () {
				var fileContent = null;

				if (fileType === TextFileType.XMLFile) {
					var parser = new DOMParser();
					fileContent = parser.parseFromString(req.responseText, 'text/xml');
				} else {
					fileContent = req.responseText;
				}

				gEngine.ResourceMap.asyncLoadCompleted(fileName, fileContent);

				if (callbackFunction !== null && callbackFunction !== undefined)
					callbackFunction(fileName);
			};

			req.send();
		}
		else {
			gEngine.ResourceMap.incAssetRefCount(fileName);
			if (callbackFunction !== null && callbackFunction !== undefined)
				callbackFunction(fileName);
		}
	};

	var unloadTextFile = function (fileName) {
		gEngine.ResourceMap.unloadAsset(fileName);
	};

	var mPublic = {
		loadTextFile: loadTextFile,
		unloadTextFile: unloadTextFile,
		TextFileType: TextFileType
	};

	return mPublic;
}());

gEngine.DefaultResources = (function () {
	var kSimpleVS = 'src/shaders/simpleVS.glsl',
		kSimpleFS = 'src/shaders/simpleFS.glsl';
	var mColorShader = null;
	var getColorShader = function () { return mColorShader; };
	var createShaders = function (callbackFunction) {
		mColorShader = new SimpleShader(kSimpleVS, kSimpleFS);
		callbackFunction();
	};
	var initialize = function (callbackFunction) {
		gEngine.TextFileLoader.loadTextFile(kSimpleVS, gEngine.TextFileLoader.TextFileType.TextFile);
		gEngine.TextFileLoader.loadTextFile(kSimpleFS, gEngine.TextFileLoader.TextFileType.TextFile);

		gEngine.ResourceMap.setLoadCompleteCallback(function () {
			createShaders(callbackFunction);
		});
	};
	var mPublic = {
		initialize: initialize,
		getColorShader: getColorShader
	};
	return mPublic;
}());

gEngine.Audio = (function () {
	var mAudioContext = null;
	var mBgAudioNode = null;

	var initialize = function () {
		try {
			var audioContext = window.AudioContext || window.webkitAudioContext;
			mAudioContext = new AudioContext();
		}
		catch (e) { console.log("Web Audio is not supported"); }
	};

	var loadAudio = function (clipName) {
		console.log(clipName);
		if (!gEngine.ResourceMap.isAssetLoaded(clipName)) {
			gEngine.ResourceMap.asyncLoadRequested(clipName);

			var req = new XMLHttpRequest();

			req.onreadystatechange = function () {
				if ((req.readyState === 4) && (req.status !== 200)) {
					console.log(clipName + ': must be served by a web-server');
				}
			}
			req.open('GET', clipName, true);
			req.responseType = 'arraybuffer';

			req.onload = function () {
				console.log(req);
				mAudioContext.decodeAudioData(req.response,
					function (buffer) {
						gEngine.ResourceMap.asyncLoadCompleted(clipName, buffer);
					}
				);
			};

			req.send();
		} else {
			gEngine.ResourceMap.incAssetRefCount(clipName);
		}
	};

	var pause = function () {
		mAudioContext.suspend();
	};

	var resume = function () {
		mAudioContext.resume();
	};

	var unloadAudio = function (clipName) {
		gEngine.ResourceMap.unloadAsset(clipName);
	};

	var oneShot = function (clipName) {
		var clipInfo = gEngine.ResourceMap.retrieveAsset(clipName);
		if (clipInfo !== null) {
			var sourceNode = mAudioContext.createBufferSource();
			sourceNode.buffer = clipInfo;
			sourceNode.connect(mAudioContext.destination);
			sourceNode.start(0);
		}
	};

	var playBackgroundAudio = function (clipName) {
		var clipInfo = gEngine.ResourceMap.retrieveAsset(clipName);
		if (clipInfo !== null) {
			stopBackgroundAudio();
			mBgAudioNode = mAudioContext.createBufferSource();
			mBgAudioNode.buffer = clipInfo;
			mBgAudioNode.connect(mAudioContext.destination);
			mBgAudioNode.loop = true;
			mBgAudioNode.start(0);
		}
	};
	var stopBackgroundAudio = function () {
		if (mBgAudioNode !== null) {
			mBgAudioNode.stop(0);
			mBgAudioNode = null;
		}
	};
	var isBackgroundAudioPlaying = function () {
		return (mBgAudioNode !== null);
	};
	var mPublic = {
		initialize: initialize,
		loadAudio: loadAudio,
		unloadAudio: unloadAudio,
		onShot: oneShot,
		playBackgroundAudio: playBackgroundAudio,
		stopBackgroundAudio: stopBackgroundAudio,
		isBackgroundAudioPlaying: isBackgroundAudioPlaying,
		pause: pause,
		resume: resume
	};
	return mPublic;
}());