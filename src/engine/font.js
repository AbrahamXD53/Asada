var gEngine = gEngine || {};
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
		if (!gEngine.ResourceMap.isAssetLoaded(fontName)) {
			//let parser = new DOMParser();
			//let fileContent = parser.parseFromString(map, 'text/xml');
			map.FontImage = fontName + '.png';
			gEngine.ResourceMap.preload(fontName, map);
			gEngine.Textures.loadTexture(map.FontImage, source);
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
		var fontInfo = gEngine.ResourceMap.retrieveAsset(fontName);

		var charInfo = fontInfo.chars.char.find(function (item) {
			return item.id == aChar;
		});
		if (!charInfo) {
			return null;
		}
		/*for (x in charInfo) {
			charInfo[x] = Number(charInfo[x]);
		}*/
		/*var charWidth = Number(charInfo.xadvance), charHeight = Number(fontInfo.common.base);
		charInfo.width = Number(charInfo.width) / charWidth;
		charInfo.height = Number(charInfo.height) / charHeight;
		charInfo.xoffset = Number(charInfo.xoffset) / Number(fontInfo.common.scaleW);
		charInfo.yoffset = Number(charInfo.yoffset) / Number(fontInfo.common.scaleH);
		charInfo.aspectRatio = charWidth / charHeight;
		charInfo.x = Number(charInfo.x) / Number(fontInfo.common.scaleW);
		charInfo.y = Number(charInfo.y) / Number(fontInfo.common.scaleH);*/
		//charInfo.width = Number(charInfo.width) / Number(fontInfo.common.scaleW);
		//charInfo.height = Number(charInfo.height) / Number(fontInfo.common.scaleH);

		/*var commonPath = "font/common";
		var commonInfo = fontInfo.evaluate(commonPath, fontInfo, null, XPathResult.ANY_TYPE, null);
		commonInfo = commonInfo.iterateNext();
		if (commonInfo === null) {
			return returnInfo;
		}*/
		var charHeight = Number(fontInfo.common.base);

		/*var charPath = "font/chars/char[@id=" + aChar + "]";
		var charInfo = fontInfo.evaluate(charPath, fontInfo, null, XPathResult.ANY_TYPE, null);
		charInfo = charInfo.iterateNext();

		if (charInfo === null) {
			return returnInfo;
		}*/

		returnInfo = new CharacterInfo();
		var leftPixel = Number(charInfo.x);
		var rightPixel = leftPixel + Number(charInfo.width);
		var topPixel = Number(charInfo.y);
		var bottomPixel = topPixel + Number(charInfo.height);

		returnInfo.mTexCoordLeft = leftPixel;
		returnInfo.mTexCoordTop = topPixel;
		returnInfo.mTexCoordRight = rightPixel;
		returnInfo.mTexCoordBottom = bottomPixel;

		var charWidth = charInfo.xadvance;
		returnInfo.mCharWidth = charInfo.width / charWidth;
		returnInfo.mCharHeight = charInfo.height / charHeight;
		returnInfo.mCharWidthOffset = charInfo.xoffset / charWidth;
		returnInfo.mCharHeightOffset = charInfo.yoffset / charHeight;
		returnInfo.mCharAspectRatio = charWidth / charHeight;
		
		return returnInfo;
	};
	var mPublic = {
		loadFont: loadFont,
		unloadFont: unloadFont,
		getCharInfo: getCharInfo,
		preloadFont: preloadFont
	};
	return mPublic;
}());