﻿function SimpleShader(vertexId, fragmentId) {
	this.mCompiledShader = null;
	var gl = gEngine.Core.getGL();
	var vsShaderInfo = gEngine.ResourceMap.retrieveAsset(vertexId);
	var fsShaderInfo = gEngine.ResourceMap.retrieveAsset(fragmentId);
	this.mCompiledShader = twgl.createProgramInfo(gl, [vsShaderInfo, fsShaderInfo]);
	this.mUniforms = { u_color: null, u_transform: null, u_viewTransform: null,u_globalAmbientColor:null,u_globalAmbientIntensity:null };
	if (!this.mCompiledShader)
		console.log('shader compilation error');
	this.gl = gEngine.Core.getGL();
	this.screen = {};
}
SimpleShader.prototype.activateShader = function (color, transform, camera) {
	this.gl.useProgram(this.mCompiledShader.program);
	twgl.setBuffersAndAttributes(this.gl, this.mCompiledShader, gEngine.VertexBuffer.getVertexBuffer());
	this.screen = camera.getViewport();
    this.mUniforms = { u_globalAmbientColor:gEngine.DefaultResources.getGlobalAmbientColor(),
        u_globalAmbientIntensity:gEngine.DefaultResources.getGlobalAmbientIntensity(),
		u_color: color, u_screenSize: [this.screen[2],this.screen[3]],
        u_transform: transform,
        u_viewTransform: camera.getVPMatrix()
    };
	twgl.setUniforms(this.mCompiledShader, this.mUniforms);
};
SimpleShader.prototype.getShader = function () { return this.mCompiledShader; };

SimpleShader.prototype.cleanUp = function () {
	var gl = gEngine.Core.getGL();
	gl.deleteProgram(this.mCompiledShader.program);
};

function TextureShader(vertexPath,fragmentPath){
    SimpleShader.call(this,vertexPath,fragmentPath);
    this.mSamplerRef = gEngine.Core.getGL().getUniformLocation(this.mCompiledShader.program, "u_texture");
}

gEngine.Core.inheritPrototype(TextureShader,SimpleShader);

TextureShader.prototype.activateShader=function(color,transform,vpMatrix)
{
    SimpleShader.prototype.activateShader.call(this,color,transform,vpMatrix);
    //gEngine.Core.getGL().uniform1i(this.mSamplerRef, 0);
};

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
/**
 * 
 * @param {*} collection 
 * @param Camera camera 
 * @param {*} index 
 */
LightShader.prototype.getLightInfo = function (collection, camera, index) {
    if (this.mLights[index].getLightStatus()) {
        let p = camera.worldToPixel(this.mLights[index].getPosition());
        collection['u_lights[' + index + '].Color'] = this.mLights[index].getColor();
        collection['u_lights[' + index + '].Position'] = [p[0], p[1], p[2], 1.0];
        collection['u_lights[' + index + '].Near'] = camera.sizeToPixel(this.mLights[index].getNear());
        collection['u_lights[' + index + '].Far'] = camera.sizeToPixel(this.mLights[index].getFar());
        collection['u_lights[' + index + '].Intensity'] = this.mLights[index].getIntensity();
        collection['u_lights[' + index + '].LightType'] = this.mLights[index].getLightType();
        collection['u_lights[' + index + '].IsOn'] = true;

        if(this.mLights[index].getLightType()===Light.LightType.Point){
            collection['u_lights[' + index + '].Direction'] = [0,0,0,0];
        }else{
            let d =  camera.dirToPixel(this.mLights[index].getDirection());
            collection['u_lights[' + index + '].Direction'] = [d[0],d[1],d[2],0.0];
            if(this.mLights[index].getLightType()===Light.LightType.Spot){
                collection['u_lights[' + index + '].CosInner'] =  Math.cos(0.5 * this.mLights[index].getInner());
                collection['u_lights[' + index + '].CosOuter'] =  Math.cos(0.5 * this.mLights[index].getOuter());
                collection['u_lights[' + index + '].DropOff'] = this.mLights[index].getDropOff();
            }
        }
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

function IllumShader(vertex,fragment){
    LightShader.call(this,vertex,fragment);
    this.mNormalSamplerRef = gEngine.Core.getGL().getUniformLocation(this.mCompiledShader.program, "u_normal");
    
}
gEngine.Core.inheritPrototype(IllumShader,LightShader);

IllumShader.prototype.activateShader = function(color,transform,camera){
    LightShader.prototype.activateShader.call(this,color,transform,camera);
    this.gl.uniform1i(this.mNormalSamplerRef, 1);
};

function PhongShader(vertex,fragment){
    IllumShader.call(this,vertex,fragment);
    this.mMaterial = null;
    this.mMaterialLoader = new ShaderMaterial(this.mCompiledShader.program);

    this.mCameraPos = null; // points to a vec3
    this.mCameraPosRef = this.gl.getUniformLocation(this.mCompiledShader.program, "u_cameraPosition");
    console.log(this);
}

gEngine.Core.inheritPrototype(PhongShader,IllumShader);

PhongShader.prototype.activateShader = function (color, transform, vpMatrix) {
    IllumShader.prototype.activateShader.call(this, color, transform, vpMatrix);
    this.mMaterialLoader.loadToShader(this.mMaterial);
    this.gl.uniform3fv(this.mCameraPosRef, this.mCameraPos);
};

PhongShader.prototype.setMaterialAndCameraPos = function(m, p) {
    this.mMaterial = m;
    this.mCameraPos = p;
};