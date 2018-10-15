function SpriteShader(vertexPath, fragmentPath) {
    this.gl = gEngine.Core.getGL();
    this.mTextureCoord = [
        1.0, 0.0,
        0.0, 0.0,
        1.0, 1.0,
        0.0, 1.0
    ];
	this.mTexCoordBuffer = twgl.createBufferInfoFromArrays(this.gl, { textureCoordinate: { data: this.mTextureCoord, numComponents: 2, drawType: this.gl.DYNAMIC_DRAW } });
    TextureShader.call(this, vertexPath, fragmentPath);
}
gEngine.Core.inheritPrototype(SpriteShader, TextureShader);

SpriteShader.prototype.setTextureCoord = function (coord) {
    this.mTextureCoord = coord;
};
SpriteShader.prototype.cleanUp = function () {
	this.gl.deleteBuffer(this.mTexCoordBuffer.attribs.textureCoordinate.buffer);
    SimpleShader.prototype.cleanUp.call(this);
};
SpriteShader.prototype.activateShader = function (color, transform, vpMatrix) {
    SimpleShader.prototype.activateShader.call(this, color, transform, vpMatrix);
	twgl.setAttribInfoBufferFromArray(this.gl, this.mTexCoordBuffer.attribs.textureCoordinate, this.mTextureCoord);
	twgl.setBuffersAndAttributes(this.gl, this.mCompiledShader, this.mTexCoordBuffer);
};