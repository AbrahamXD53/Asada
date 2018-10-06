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

		mGL = canvas.getContext('webgl', { alpha: false, antialias: true }) || canvas.getContext('experimental-webgl', { alpha: false });
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