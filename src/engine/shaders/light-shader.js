'use strict';

function LightShader(vertex, fragment) {
    SpriteShader.call(this, vertex, fragment);

    this.mLights = null;
    this.kGLSLuLightArraySize = 4;
}
gEngine.Core.inheritPrototype(LightShader, SpriteShader);

LightShader.prototype.setLights = function (l) {
    this.mLights = l;
};

LightShader.prototype.getLightOff = function () {
    return { IsOn: false };
}
LightShader.prototype.activateShader = function (color, transform, vpMatrix) {
    SpriteShader.prototype.activateShader.call(this, color, transform, vpMatrix);
    let lights = [];
    var numLight = 0;
    if (this.mLights !== null) {
        while (numLight < this.mLights.length) {
            lights[numLight] = this.mLights[numLight].getShaderInfo(vpMatrix);
            numLight++;
        }
    }
    while (numLight < this.kGLSLuLightArraySize) {
        lights[numLight] = this.getLightOff();
        numLight++;
    }
    this.mUniforms.u_lights = lights;
    twgl.setUniforms(this.mCompiledShader, this.mUniforms);
}