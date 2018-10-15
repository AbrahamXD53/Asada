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