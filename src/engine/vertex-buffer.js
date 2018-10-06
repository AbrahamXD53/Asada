var gEngine = gEngine || {};
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