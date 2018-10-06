var gEngine = gEngine || {};
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
		entries: mResourceMap
	};
	return mPublic;
}());