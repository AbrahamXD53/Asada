var gEngine = gEngine || {};
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
		gl.activeTexture(gl.TEXTURE0 + 1);
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
		activateNormalMap: activateNormalMap,
		deactivateTexture: deactivateTexture,
		getTextureInfo: getTextureInfo
	};
	return mPublic;
}());