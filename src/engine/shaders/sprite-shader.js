'use stric';
function SpriteShader(vertexPath, fragmentPath) {
    var gl = gEngine.Core.getGL();
    this.mTextureCoord = [
        1.0, 1.0,
        0.0, 1.0,
        1.0, 0.0,
        0.0, 0.0
    ];
    this.mTexCoordBuffer = twgl.createBufferInfoFromArrays(gl,{ textureCoordinate: { data: this.mTextureCoord, numComponents: 2, drawType: gl.DYNAMIC_DRAW } });
    TextureShader.call(this, vertexPath, fragmentPath);
}
gEngine.Core.inheritPrototype(SpriteShader, TextureShader);

SpriteShader.prototype.setTextureCoord = function (coord) {
    var gl = gEngine.Core.getGL();
    this.mTextureCoord = coord;
    twgl.setAttribInfoBufferFromArray(gl, this.mTexCoordBuffer.attribs.textureCoordinate, this.mTextureCoord);
};

SpriteShader.prototype.activateShader = function (color, transform, vpMatrix) {
    SimpleShader.prototype.activateShader.call(this, color, transform, vpMatrix);
    var gl = gEngine.Core.getGL();
    twgl.setBuffersAndAttributes(gl, this.mCompiledShader, this.mTexCoordBuffer);

};