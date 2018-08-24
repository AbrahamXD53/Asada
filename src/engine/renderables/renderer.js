'use strict';
function Renderer() {
    this.mShader = gEngine.DefaultResources.getColorShader();
    this.mColor = [1.0, 1.0, 1.0, 1.0];
    this.mParent = null;
}
Renderer.prototype.setParent = function (parent) { this.mParent = parent };
Renderer.prototype.draw = function (vpMatrix) {
    var gl = gEngine.Core.getGL();
    this.mShader.activateShader(this.mColor, this.mParent.transform.getMatrix(), vpMatrix);
    twgl.drawBufferInfo(gl, gEngine.VertexBuffer.getVertexBuffer(), gl.TRIANGLE_STRIP);
};
Renderer.prototype.setShader = function (shader) { this.mShader = shader; };
Renderer.prototype.getLightAt = function () { };
Renderer.prototype.addLight = function () { };
Renderer.prototype.setColor = function (color) { this.mColor = color; };
Renderer.prototype.getColor = function () { return this.mColor; };

function TextureRenderer(texture) {
    Renderer.call(this);
    Renderer.prototype.setShader.call(this, gEngine.DefaultResources.getTextureShader());
    this.mTexture = texture;
}
gEngine.Core.inheritPrototype(TextureRenderer, Renderer);

TextureRenderer.prototype.draw = function (vpMatrix) {
    gEngine.Textures.activateTexture(this.mTexture);
    Renderer.prototype.draw.call(this, vpMatrix);
};
TextureRenderer.prototype.getTexture = function () { return this.mTexture; };
TextureRenderer.prototype.setTexture = function (texture) { this.mTexture = texture; };
function SpriteRenderer(texture) {
    TextureRenderer.call(this, texture);
    Renderer.prototype.setShader.call(this, gEngine.DefaultResources.getSpriteShader());
    this.mTexLeft = 0.0;
    this.mTexRight = 1.0;
    this.mTexTop = 0.0;
    this.mTexBottom = 1.0;
};
gEngine.Core.inheritPrototype(SpriteRenderer, TextureRenderer);

SpriteRenderer.prototype.draw = function (vpMatrix) {
    this.setUVCoords();
    TextureRenderer.prototype.draw.call(this, vpMatrix);
};

SpriteRenderer.prototype.setTextureCoordUV = function (left, right, bottom, top) {
    this.mTexLeft = left;
    this.mTexRight = right;
    this.mTexBottom = bottom;
    this.mTexTop = top;
};

SpriteRenderer.prototype.setTextureCoordPixels = function (left, right, bottom, top) {
    var texInfo = gEngine.ResourceMap.retrieveAsset(this.mTexture);
    var imageW = texInfo.mWidth;
    var imageH = texInfo.mHeight;

    this.mTexLeft = left / imageW;
    this.mTexRight = right / imageW;
    this.mTexBottom = bottom / imageH;
    this.mTexTop = top / imageH;
};
SpriteRenderer.prototype.setUVCoords = function () {
    this.mShader.setTextureCoord([
        this.mTexRight, this.mTexTop,
        this.mTexLeft, this.mTexTop,
        this.mTexRight, this.mTexBottom,
        this.mTexLeft, this.mTexBottom
    ]);
};

SpriteRenderer.TexCoord = Object.freeze({
    Left: 2,
    Right: 0,
    Top: 1,
    Bottom: 5
});

function LightRenderer(texture) {
    SpriteRenderer.call(this, texture);
    Renderer.prototype.setShader.call(this,
        gEngine.DefaultResources.getLightShader()
    );
    this.mLights = [];
}
gEngine.Core.inheritPrototype(LightRenderer, SpriteRenderer);

LightRenderer.prototype.draw = function (camera) {
    this.mShader.setLights(this.mLights);
    SpriteRenderer.prototype.draw.call(this, camera);
};
LightRenderer.prototype.getLightAt = function (index) {
    return this.mLights[index];
};
LightRenderer.prototype.addLight = function (l) {
    this.mLights.push(l);
};

function Tileset(texture, data) {
    this.mTexture = texture;
    this.mColumns = data.columns;
    this.mFirstId = data.firstgid;
    this.mImageHeight = data.imageheight;
    this.mImageWidth = data.imagewidth;
    this.mMargin = data.margin;
    this.mSpacing = data.spacing;
    this.mTileCount = data.tilecount;
    this.mTileHeight = data.tileheight;
    this.mTileWidth = data.tilewidth;
    this.mHeight = data.imageheight / data.tileheight;
    this.mWidth = data.imagewidth / data.tilewidth;
    this.mInverseWidth = 1.0 / data.tilewidth;
    this.mInverseHeight = 1.0 / data.tileheight;
    this.mOffset = 0.003;

}
Tileset.prototype.getCoords = function (id) {
    if (id > 0) {
        if (id < this.mTileCount) {
            let x = (id - 1) % this.mWidth;
            let y = Math.floor((id - 1) / this.mWidth);
            return [
                (x * this.mInverseWidth) + this.mOffset,
                ((x + 1) * this.mInverseWidth) - this.mOffset,
                (y * this.mInverseHeight) + this.mOffset,
                ((y + 1) * this.mInverseHeight) - this.mOffset
            ];
        }
    }
};

Tileset.prototype.getTexture = function () {
    return this.mTexture;
};

function MapLayer(data, tilesets, shader) {
    this.mShader = shader || gEngine.DefaultResources.getSpriteShader();
    this.mTilesets = tilesets;
    this.mData = data;
    this.mBufferInfo = null;
    this.mTint = [1, 1, 1, this.mData.opacity];
    this.mArrays = {
        position: { numComponents: 3, data: [] },
        indices: { numComponents: 3, data: [] },
        textureCoordinate: { numComponents: 2, data: [] }
    };
    var initialX = 0.5-this.mData.width / 2;
    initialX = -0.5;
    var initialY = this.mData.height-0.5;
    //initialY = 0;
    for (let y = 0, realIndex = 0; y < this.mData.height; y++)
        for (let index = this.mData.width * y, x = 0; x < this.mData.width; index++ , x++) {
            if (this.mData.data[index] > 0) {
                this.mArrays.position.data.push(
                    initialX + x, initialY - (y + 1), 0.0,
                    initialX + x, initialY - y, 0.0,
                    initialX + (x + 1), initialY - y, 0.0,
                    initialX + (x + 1), initialY - (y + 1), 0.0);

                this.mArrays.indices.data.push(realIndex + 3, realIndex + 2, realIndex + 1, realIndex + 3, realIndex + 1, realIndex);
                let coords = this.mTilesets[0].getCoords(this.mData.data[index]);
                this.mArrays.textureCoordinate.data.push(coords[0], coords[3], coords[0], coords[2], coords[1], coords[2], coords[1], coords[3]);
                realIndex += 4;
            }
        }
    var gl = gEngine.Core.getGL();
    this.mBufferInfo = twgl.createBufferInfoFromArrays(gl, this.mArrays);
};

MapLayer.prototype.setShader = function (s) {
    this.mShader = s;
};

MapLayer.prototype.draw = function (transform, vpMatrix, lights) {
    let gl = gEngine.Core.getGL();
    if (this.mShader.setLights)
        this.mShader.setLights(lights);
    this.mShader.activateShader(this.mTint, transform, vpMatrix);
    twgl.setBuffersAndAttributes(gl, this.mShader.getShader(), this.mBufferInfo);
    gEngine.Textures.activateTexture(this.mTilesets[0].mTexture);
    twgl.drawBufferInfo(gl, this.mBufferInfo);
};

function MapRenderer(filePath) {
    this.mLayers = [];
    this.mMapName = filePath;
    this.mData = [];
    this.mTilesets = [];
    this.mTransform = new Transform();
    this.mLights = [];
    this.mShader = gEngine.DefaultResources.getSpriteShader();
    this.mComposites = [];

}
MapRenderer.prototype.load = function () {
    gEngine.TextFileLoader.loadTextFile(this.mMapName, gEngine.TextFileLoader.TextFileType.TextFile, function (asset) {
        this.mData = JSON.parse(gEngine.ResourceMap.retrieveAsset(asset));
        if (this.mData) {
            for (var key in this.mData.tilesets) {
                let texture = this.mMapName.substr(0, this.mMapName.lastIndexOf('/') + 1) + this.mData.tilesets[key].image;
                let tileset = new Tileset(texture, this.mData.tilesets[key]);
                this.mTilesets.push(tileset);
            }
        }
    }.bind(this));
};
MapRenderer.prototype.createBody=function(data){
    let world=gEngine.Physics.getWorld();
    for(let i in data.objects){
        let body = Matter.Bodies.rectangle(7,12.5,10,1,{isStatic:true});
        console.log(body);
        Matter.World.add(world,body);
    }
};
MapRenderer.prototype.initialize = function () {
    if (this.mData) {
        for (let i in this.mData.layers) {
            if(this.mData.layers[i].data){
                let layer = new MapLayer(this.mData.layers[i], this.mTilesets, this.mShader);
                this.mLayers.push(layer);
            }
            else{
                this.createBody(this.mData.layers[i]);
            }
        }
    }
};

MapRenderer.prototype.draw = function (vpMatrix) {
    for (let index = 0; index < this.mLayers.length; index++) {
        this.mLayers[index].draw(this.mTransform.getMatrix(), vpMatrix, this.mLights);
    }
};

MapRenderer.prototype.setShader = function (s) {
    for (let index = 0; index < this.mLayers.length; index++) {
        this.mLayers[index].setShader(s);
    }
};

MapRenderer.prototype.getLayer = function (l) {
    return this.mLayers[l];
};

MapRenderer.prototype.getTransform = function () { return this.mTransform; };

MapRenderer.prototype.getLightAt = function (index) {
    return this.mLights[index];
};
MapRenderer.prototype.addLight = function (l) {
    this.mLights.push(l);
};

MapRenderer.prototype.cleanUp= function(){
    //TODO: clear buffers
};

function FontRenderable(aString) {
    this.mFont = gEngine.DefaultResources.getDefaultFont();
    this.mOneChar = new GameObject();
    this.mOneChar.setComponent(ComponetType.renderer, new SpriteRenderer(this.mFont + '.png'));
    this.mOneChar.renderer.setShader(gEngine.DefaultResources.getFontShader());
    this.mTransform = new Transform();
    this.mText = aString;
}
FontRenderable.prototype.draw = function (vpMatrix) {
    var charWidth = this.mTransform.getScaleX() / this.mText.length;
    var charHeight = this.mTransform.getScaleY();
    var yPos = this.mTransform.getPositionY();
    var xPos = this.mTransform.getPositionX() - (charWidth / 2) + (charWidth * 0.5);

    var aChar, charInfo, xSize, ySize, xOffset, yOffset;
    var rotation = this.mTransform.getRotation();
    this.mOneChar.transform.setRotation(rotation);
    for (var charIndex = 0, limit = this.mText.length; charIndex < limit; charIndex++) {
        aChar = this.mText.charCodeAt(charIndex);
        charInfo = gEngine.Fonts.getCharInfo(this.mFont, aChar);

        this.mOneChar.renderer.setTextureCoordUV(charInfo.mTexCoordLeft, charInfo.mTexCoordRight, charInfo.mTexCoordBottom, charInfo.mTexCoordTop);
        xSize = charWidth * charInfo.mCharWidth;
        ySize = charHeight * charInfo.mCharHeight;
        this.mOneChar.transform.setScale([xSize, ySize, 1]);

        xOffset = charWidth * charInfo.mCharWidthOffset * 0.5;
        yOffset = Math.cos(rotation) * charHeight * charInfo.mCharHeightOffset * 0.5;
        this.mOneChar.transform.setPosition([xPos - xOffset, yPos - yOffset, 0]);
        this.mOneChar.draw(vpMatrix);
        xPos += charWidth * Math.cos(rotation);
        yPos += charWidth * Math.sin(rotation);
    }
};
FontRenderable.prototype.setText = function (text) {
    this.mText = text;
    this.setTextHeight(this.mTransform.getScaleY());
};
FontRenderable.prototype.setFont = function (font) {
    this.mFont = font;
    this.mOneChar.renderer.setTexture(this.mFont + ".png");
};
FontRenderable.prototype.setTextHeight = function (height) {
    var charInfo = gEngine.Fonts.getCharInfo(this.mFont, "A".charCodeAt(0));
    var w = height * charInfo.mCharAspectRatio;
    this.mTransform.setScale([w * this.mText.length, height, 1]);
};
FontRenderable.prototype.setColor = function (color) { this.mOneChar.renderer.setColor(color); };

FontRenderable.prototype.getColor = function () { return this.mOneChar.renderer.getColor(); };
FontRenderable.prototype.getTransform = function () { return this.mTransform; };
FontRenderable.prototype.getFont = function () { return this.mFont; };
FontRenderable.prototype.getText = function () { return this.mText; };