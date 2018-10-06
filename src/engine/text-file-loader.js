var gEngine = gEngine || {};
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