var gEngine = gEngine || {};
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