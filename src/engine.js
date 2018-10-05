var gEngine = gEngine || {};
gEngine.Core = (function () {
	var mGL = null;

	var getGL = function () {
		return mGL;
	};

	var onResize = function () {
		var width = mGL.canvas.clientWidth;
		var height = mGL.canvas.clientHeight;

		mGL.canvas.width = width;
		mGL.canvas.height = height;
	};

	var initializeWebGL = function (canvasId) {
		var canvas = document.getElementById(canvasId);

		mGL = canvas.getContext('webgl2', { alpha: false }) || canvas.getContext('experimental-webgl2', { alpha: false });
		var width = mGL.canvas.clientWidth;
		var height = mGL.canvas.clientHeight;

		mGL.canvas.width = width;
		mGL.canvas.height = height;
		mGL.blendFunc(mGL.SRC_ALPHA, mGL.ONE_MINUS_SRC_ALPHA);
		mGL.enable(mGL.BLEND);

		//mGL.pixelStorei(mGL.UNPACK_FLIP_Y_WEBGL, true);

		if (mGL === null) {
			document.write('<br><b>Error: Webgl is not supported</b>');
			return;
		}

		window.addEventListener('resize', onResize);
		gEngine.Core.clearCanvas([0, 0, 0, 1.0]);
	};

	var initializeEngineCore = function (canvasId, myGame) {
		initializeWebGL(canvasId);
		gEngine.VertexBuffer.initialize();
		gEngine.Input.initialize();
		gEngine.Audio.initialize();
		gEngine.Physics.initialize();

		myGame.loadScene.call(myGame);

		gEngine.DefaultResources.initialize(function () {
			startScene(myGame);
		});
	};

	var startScene = function (myGame) {
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

	var cleanUp = function () {
		gEngine.VertexBuffer.cleanUp();
		gEngine.DefaultResources.cleanUp();
	};

	var mPublic = {
		getGL: getGL,
		initialize: initializeEngineCore,
		clearCanvas: clearCanvas,
		inheritPrototype: inheritPrototype,
		cleanUp: cleanUp
	};

	return mPublic;
}());

gEngine.VertexBuffer = (function () {
	var gl = gEngine.Core.getGL();
	var vertexInfo = {
		position: [
			0.5, 0.5, 0.0,
			-0.5, 0.5, 0.0,
			0.5, -0.5, 0.0,
			-0.5, -0.5, 0.0
		],
		textureCoordinate: {
			data: [
				1.0, 0.0,
				0.0, 0.0,
				1.0, 1.0,
				0.0, 1.0
			], drawType: 35048
		}
	};
	var mVertexBuffer = null;

	var getVertexBuffer = function () {
		return mVertexBuffer;
	};

	var initialize = function () {
		var gl = gEngine.Core.getGL();
		mVertexBuffer = twgl.createBufferInfoFromArrays(gl, vertexInfo);
	};
	var cleanUp = function () {
		var gl = gEngine.Core.getGL();
		gl.deleteBuffer(mVertexBuffer.attribs.position.buffer);
		gl.deleteBuffer(mVertexBuffer.attribs.textureCoordinate.buffer);
	};

	var mPublic = {
		initialize: initialize,
		getVertexBuffer: getVertexBuffer,
		cleanUp: cleanUp
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

	var stats = window.Stats ? new Stats() : null;
	if (stats) {
		stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
		document.body.appendChild(stats.dom);
	}

	var runLoop = function () {
		if (mIsLoopRunning) {
			requestAnimationFrame(function () { runLoop.call(mCurrentScene); });
			mCurrentTime = Date.now();
			mElapsedTime = mCurrentTime - mPreviousTime;
			mPreviousTime = mCurrentTime;
			mLagTime += mElapsedTime;

			if (stats)
				stats.begin();
			while (mLagTime >= kMPF && mIsLoopRunning) {
				if (mIsFocused) {
					gEngine.Physics.update(kMPF / 100);
					gEngine.Input.update();
					this.update(kMPF / 100);
				}
				mLagTime -= kMPF;
			}
			if (mIsLoopRunning)
				this.draw();
			if (stats)
				stats.end();
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

			window.addEventListener('focus', onFocus);
			window.addEventListener('blur', onBlur);
			startLoop();
		});


	};

	var stop = function () {
		mIsLoopRunning = false;

		window.removeEventListener('focus');
		window.removeEventListener('blur');
	};

	var mPublic = {
		start: start,
		stop: stop,
		onBlur: onBlur,
		onFocus: onFocus
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

gEngine.ResourceMap = (function () {

	var MapEntry = function (rName) {
		this.mAsset = rName;
		this.mRefCount = 1;
	};

	var mResourceMap = {};
	var mNumOutstandingLoads = 0;
	var mLoadCompleteCallback = null;
	var mLoadedResources = 0;
	var mRequestedResources = 0;

	var mCallbackLoader = null;

	var registerLoader = function (callbackLoader) {
		mCallbackLoader = callbackLoader;
	};


	var checkForAllLoadCompleted = function () {
		let progress = Math.floor(mLoadedResources / mRequestedResources * 100);
		if (mCallbackLoader !== null)
			mCallbackLoader(progress);
		if (mLoadedResources === mRequestedResources && mLoadCompleteCallback !== null) {
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
		++mRequestedResources;

	};

	var asyncLoadCompleted = function (rName, loadedAsset) {
		if (!isAssetLoaded(rName))
			console.log(rName + ': not in map!');
		mResourceMap[rName].mAsset = loadedAsset;
		mLoadedResources++;
		checkForAllLoadCompleted();
	};

	var isAssetLoaded = function (rName) {
		return rName in mResourceMap;
	};

	var retrieveAsset = function (rName) {
		if (rName in mResourceMap)
			return mResourceMap[rName].mAsset;
		return null;
	};

	var incAssetRefCount = function (rName) {
		mResourceMap[rName].mRefCount += 1;
	};

	var unloadAsset = function (rName) {
		if (rName in mResourceMap) {
			mResourceMap[rName].mRefCount -= 1;
			if (mResourceMap[rName].mRefCount <= 0)
				delete mResourceMap[rName];
			else
				return mResourceMap[rName].mRefCount;
		}
		return 0;
	};
	var preload = function (rName, loadedAsset) {
		mResourceMap[rName] = new MapEntry(rName);
		mResourceMap[rName].mAsset = loadedAsset;
	};

	var mPublic = {
		asyncLoadRequested: asyncLoadRequested,
		asyncLoadCompleted: asyncLoadCompleted,
		setLoadCompleteCallback: setLoadCompleteCallback,

		retrieveAsset: retrieveAsset,
		unloadAsset: unloadAsset,
		isAssetLoaded: isAssetLoaded,
		incAssetRefCount: incAssetRefCount,
		registerLoader: registerLoader,
		preload: preload,
		entries:mResourceMap
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
				if (req.readyState === 4 && req.status !== 200) {
					console.log(fileName + ': must be served by a web-server');
				}
			};
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

gEngine.Audio = (function () {
	var mAudioContext = null;
	var mBgAudioNode = null;

	var initialize = function () {
		try {
			var audioContext = window.AudioContext || window.webkitAudioContext;
			mAudioContext = new AudioContext();
		}
		catch (e) {
			console.log("Web Audio is not supported");
		}
	};

	var loadAudio = function (clipName) {
		if (!gEngine.ResourceMap.isAssetLoaded(clipName)) {
			gEngine.ResourceMap.asyncLoadRequested(clipName);

			var req = new XMLHttpRequest();

			req.onreadystatechange = function () {
				if (req.readyState === 4 && req.status !== 200) {
					console.log(clipName + ': must be served by a web-server');
				}
			};
			req.open('GET', clipName, true);
			req.responseType = 'arraybuffer';

			req.onload = function () {
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
		return mBgAudioNode !== null;
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

gEngine.Textures = (function () {
	function TextureInfo(name, w, h, id) {
		this.mName = name;
		this.mWidth = w;
		this.mHeight = h;
		this.mGLTexID = id;
	}
	var loadTexture = function (textureName, url) {
		if (!gEngine.ResourceMap.isAssetLoaded(textureName)) {
			var img = new Image();

			gEngine.ResourceMap.asyncLoadRequested(textureName);

			img.onload = function () {
				processLoadedImage(textureName, img);
			};

			img.src = url || textureName;
		} else {
			gEngine.ResourceMap.incAssetRefCount(textureName);
		}
	};
	var unloadTexture = function (textureName) {
		var gl = gEngine.Core.getGL();
		var texInfo = gEngine.ResourceMap.retrieveAsset(textureName);
		gl.deleteTexture(texInfo.mGLTexID);
		gEngine.ResourceMap.unloadAsset(textureName);
	};

	var processLoadedImage = function (textureName, image) {
		var gl = gEngine.Core.getGL();

		var textureID = gl.createTexture();

		gl.bindTexture(gl.TEXTURE_2D, textureID);

		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
		gl.generateMipmap(gl.TEXTURE_2D);
		gl.bindTexture(gl.TEXTURE_2D, null);
		var texInfo = new TextureInfo(textureName, image.naturalWidth, image.naturalHeight, textureID);
		gEngine.ResourceMap.asyncLoadCompleted(textureName, texInfo);
	};

	var activateTexture = function (textureName) {
		var gl = gEngine.Core.getGL();
		var texInfo = gEngine.ResourceMap.retrieveAsset(textureName);
		gl.activeTexture(gl.TEXTURE0);
		
		gl.bindTexture(gl.TEXTURE_2D, texInfo.mGLTexID);

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

		//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	};

	var activateNormalMap = function (textureName) {
		var gl = gEngine.Core.getGL();
		var texInfo = gEngine.ResourceMap.retrieveAsset(textureName);
		gl.activeTexture(gl.TEXTURE0+1);
		gl.bindTexture(gl.TEXTURE_2D, texInfo.mGLTexID);

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

		//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	};

	var deactivateTexture = function () {
		var gl = gEngine.Core.getGL();
		gl.bindTexture(gl.TEXTURE_2D, null);
	};

	var getTextureInfo = function (textureName) {
		return gEngine.ResourceMap.retrieveAsset(textureName);
	};

	var mPublic = {
		loadTexture: loadTexture,
		unloadTexture: unloadTexture,
		activateTexture: activateTexture,
		activateNormalMap:activateNormalMap,
		deactivateTexture: deactivateTexture,
		getTextureInfo: getTextureInfo
	};
	return mPublic;
}());

gEngine.Fonts = (function () {
	function CharacterInfo() {
		this.mTexCoordLeft = 0;
		this.mTexCoordRight = 1;
		this.mTexCoordBottom = 0;
		this.mTexCoordTop = 0;

		this.mCharWidth = 1;
		this.mCharHeight = 1;
		this.mCharWidthOffset = 0;
		this.mCharHeightOffset = 0;

		this.mCharAspectRatio = 1;
	}
	var preloadFont = function (fontName, source, map) {
		if (!gEngine.ResourceMap.isAssetLoaded(fontName)) 
		{
			let parser = new DOMParser();
			let fileContent = parser.parseFromString(map, 'text/xml');
			fileContent.FontImage = fontName + '.png';
			gEngine.ResourceMap.preload(fontName,fileContent);
			gEngine.Textures.loadTexture(fileContent.FontImage,source);
		} else {
			gEngine.ResourceMap.incAssetRefCount(fontName);
		}
	};
	var loadFont = function (fontName) {
		if (!gEngine.ResourceMap.isAssetLoaded(fontName)) {
			var fontInfoSourceString = fontName + '.fnt';
			var textureSourceString = fontName + '.png';

			gEngine.ResourceMap.asyncLoadRequested(fontName);
			gEngine.Textures.loadTexture(textureSourceString);
			gEngine.TextFileLoader.loadTextFile(fontInfoSourceString, gEngine.TextFileLoader.TextFileType.XMLFile, storeLoadedFont);
		} else {
			gEngine.ResourceMap.incAssetRefCount(fontName);
		}
	};
	var storeLoadedFont = function (fontInfoSourceString) {
		var fontName = fontInfoSourceString.slice(0, -4);
		var fontInfo = gEngine.ResourceMap.retrieveAsset(fontInfoSourceString);
		fontInfo.FontImage = fontName + '.png';
		gEngine.ResourceMap.asyncLoadCompleted(fontName, fontInfo);
	};
	var unloadFont = function (fontName) {
		gEngine.ResourceMap.unloadAsset(fontName);
		if (!gEngine.ResourceMap.isAssetLoaded(fontName)) {
			var fontInfoSourceString = fontName + ".fnt";
			var textureSourceString = fontName + ".png";
			gEngine.Textures.unloadTexture(textureSourceString);
			gEngine.TextFileLoader.unloadTextFile(fontInfoSourceString);
		}
	};
	var getCharInfo = function (fontName, aChar) {
		var returnInfo = null;
		var fontInfo = gEngine.ResourceMap.retrieveAsset(fontName);
		var commonPath = "font/common";
		var commonInfo = fontInfo.evaluate(commonPath, fontInfo, null, XPathResult.ANY_TYPE, null);
		commonInfo = commonInfo.iterateNext();
		if (commonInfo === null) {
			return returnInfo;
		}
		var charHeight = commonInfo.getAttribute("base");

		var charPath = "font/chars/char[@id=" + aChar + "]";
		var charInfo = fontInfo.evaluate(charPath, fontInfo, null, XPathResult.ANY_TYPE, null);
		charInfo = charInfo.iterateNext();

		if (charInfo === null) {
			return returnInfo;
		}

		returnInfo = new CharacterInfo();
		var texInfo = gEngine.Textures.getTextureInfo(fontInfo.FontImage);
		var leftPixel = Number(charInfo.getAttribute("x"));
		var rightPixel = leftPixel + Number(charInfo.getAttribute("width")) - 1;
		var topPixel = Number(charInfo.getAttribute("y"));
		var bottomPixel = topPixel + Number(charInfo.getAttribute("height"));

		returnInfo.mTexCoordLeft = leftPixel / (texInfo.mWidth - 1);
		returnInfo.mTexCoordTop = topPixel / (texInfo.mHeight - 1);
		returnInfo.mTexCoordRight = rightPixel / (texInfo.mWidth - 1);
		returnInfo.mTexCoordBottom = bottomPixel / (texInfo.mHeight - 1);

		var charWidth = charInfo.getAttribute("xadvance");
		returnInfo.mCharWidth = charInfo.getAttribute("width") / charWidth;
		returnInfo.mCharHeight = charInfo.getAttribute("height") / charHeight;
		returnInfo.mCharWidthOffset = charInfo.getAttribute("xoffset") / charWidth;
		returnInfo.mCharHeightOffset = charInfo.getAttribute("yoffset") / charHeight;
		returnInfo.mCharAspectRatio = charWidth / charHeight;

		return returnInfo;
	};
	var mPublic = {
		loadFont: loadFont,
		unloadFont: unloadFont,
		getCharInfo: getCharInfo,
		preloadFont:preloadFont
	};
	return mPublic;
}());

gEngine.Physics = (function () {
	var engine = null;

	var initialize = function () {
		Matter.use('matter-collision-events');
		engine = Matter.Engine.create();
		engine.world.gravity.scale = -1;
	};

	var getEngine = function () {
		return engine;
	};
	var getWorld = function () {
		return engine.world;
	};

	var update = function (delta = 1) {
		Matter.Engine.update(engine, delta);
	};


	var cleanUp = function () {

	};

	var mPublic = {
		initialize: initialize,
		update: update,
		getEngine: getEngine,
		getWorld: getWorld,
		cleanUp: cleanUp
	};

	return mPublic;
}());