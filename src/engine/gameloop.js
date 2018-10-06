var gEngine = gEngine || {};

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