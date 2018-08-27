'use strict';
function SimpleShader(vertexId, fragmentId) {
	this.mCompiledShader = null;
	var gl = gEngine.Core.getGL();
	var vsShaderInfo = gEngine.ResourceMap.retrieveAsset(vertexId);
	var fsShaderInfo = gEngine.ResourceMap.retrieveAsset(fragmentId);
	this.mCompiledShader = twgl.createProgramInfo(gl, [vsShaderInfo, fsShaderInfo]);
	this.mUniforms = { u_color: null, u_transform: null, u_viewTransform: null,u_globalAmbientColor:null,u_globalAmbientIntensity:null };
	if (!this.mCompiledShader)
		console.log('shader compilation error');
}
SimpleShader.prototype.activateShader = function (color, transform, camera) {
	var gl = gEngine.Core.getGL();
	gl.useProgram(this.mCompiledShader.program);
	twgl.setBuffersAndAttributes(gl, this.mCompiledShader, gEngine.VertexBuffer.getVertexBuffer());
	let screen = camera.getViewport();
	this.mUniforms = { u_globalAmbientColor:gEngine.DefaultResources.getGlobalAmbientColor(),u_globalAmbientIntensity:gEngine.DefaultResources.getGlobalAmbientIntensity(),u_color: color,u_screenSize:[screen[2],screen[3]], u_transform: transform, u_viewTransform: camera.getVPMatrix() };
	twgl.setUniforms(this.mCompiledShader, this.mUniforms);
};
SimpleShader.prototype.getShader = function () { return this.mCompiledShader; };

SimpleShader.prototype.cleanUp = function () {
	var gl = gEngine.Core.getGL();
	gl.deleteProgram(this.mCompiledShader.program);
};

function TextureShader(vertexPath,fragmentPath){
    SimpleShader.call(this,vertexPath,fragmentPath);
}

gEngine.Core.inheritPrototype(TextureShader,SimpleShader);

TextureShader.prototype.activateShader=function(color,transform,vpMatrix)
{
	SimpleShader.prototype.activateShader.call(this,color,transform,vpMatrix);
};

function SpriteShader(vertexPath, fragmentPath) {
    var gl = gEngine.Core.getGL();
    this.mTextureCoord = [
        1.0, 0.0,
        0.0, 0.0,
        1.0, 1.0,
        0.0, 1.0
    ];
    this.mTexCoordBuffer = twgl.createBufferInfoFromArrays(gl, { textureCoordinate: { data: this.mTextureCoord, numComponents: 2, drawType: gl.DYNAMIC_DRAW } });
    TextureShader.call(this, vertexPath, fragmentPath);
}
gEngine.Core.inheritPrototype(SpriteShader, TextureShader);

SpriteShader.prototype.setTextureCoord = function (coord) {
    this.mTextureCoord = coord;
};
SpriteShader.prototype.cleanUp = function () {
    var gl = gEngine.Core.getGL();
    gl.deleteBuffer(this.mTexCoordBuffer.attribs.textureCoordinate.buffer);
    SimpleShader.prototype.cleanUp.call(this);
};
SpriteShader.prototype.activateShader = function (color, transform, vpMatrix) {
    SimpleShader.prototype.activateShader.call(this, color, transform, vpMatrix);
    var gl = gEngine.Core.getGL();
    twgl.setAttribInfoBufferFromArray(gl, this.mTexCoordBuffer.attribs.textureCoordinate, this.mTextureCoord);
    twgl.setBuffersAndAttributes(gl, this.mCompiledShader, this.mTexCoordBuffer);
};

function LightShader(vertex, fragment) {
    SpriteShader.call(this, vertex, fragment);

    this.mLights = null;
    this.kGLSLuLightArraySize = 4;
}
gEngine.Core.inheritPrototype(LightShader, SpriteShader);

LightShader.prototype.setLights = function (l) {
    this.mLights = l;
};

LightShader.prototype.getLightOff = function (collection, index) {
    collection['u_lights[' + index + '].' + 'IsOn'] = false;
};

LightShader.prototype.getLightInfo = function (collection, camera, index) {
    if (this.mLights[index].getLightStatus()) {
        let p = camera.worldToPixel(this.mLights[index].getPosition());
        collection['u_lights[' + index + '].Position'] = [p[0], p[1], p[2], 1.0];
        collection['u_lights[' + index + '].Color'] = this.mLights[index].getColor();
        collection['u_lights[' + index + '].Near'] = camera.sizeToPixel(this.mLights[index].getNear());
        collection['u_lights[' + index + '].Far'] = camera.sizeToPixel(this.mLights[index].getFar());
        collection['u_lights[' + index + '].Intensity'] = this.mLights[index].getIntensity();
        collection['u_lights[' + index + '].IsOn'] = true;
    }
    else {
        this.getLightOff(collection,index);
    }
};

LightShader.prototype.activateShader = function (color, transform, vpMatrix) {
    SpriteShader.prototype.activateShader.call(this, color, transform, vpMatrix);
    let lights = [];
    var numLight = 0;
    if (this.mLights !== null) {
        while (numLight < this.mLights.length) {
            this.getLightInfo(this.mUniforms, vpMatrix, numLight);
            numLight++;
        }
    }
    while (numLight < this.kGLSLuLightArraySize) {
        this.getLightOff(this.mUniforms, numLight);
        numLight++;
    }
    twgl.setUniforms(this.mCompiledShader, this.mUniforms);
};