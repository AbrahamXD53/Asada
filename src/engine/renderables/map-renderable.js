'use strict';

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
            let y = Math.floor((id - 1) / this.mWidth );
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

function MapLayer(data, tilesets) {
    this.mShader = gEngine.DefaultResources.getLightShader();
    this.mTilesets = tilesets;
    this.mData = data;
    this.mBufferInfo=null;
    this.mArrays = {
        position: { numComponents: 3, data: [] },
        indices: { numComponents: 3, data: [] },
        textureCoordinate: { numComponents: 2, data: [] }
    };
    var initialX=-this.mData.width/2;
    var initialY=this.mData.height/2;
    for (let y = 0,realIndex=0; y <this.mData.height; y++)
        for (let index = this.mData.width * y,x=0; x<this.mData.width; index++,x++) {
            if (this.mData.data[index] > 0) 
            {
                this.mArrays.position.data.push(
                    initialX + x, initialY - (y + 1), 0.0,
                    initialX + x, initialY - y, 0.0,
                    initialX + (x + 1), initialY - y, 0.0,
                    initialX + (x + 1), initialY - (y + 1), 0.0);
                
                this.mArrays.indices.data.push(realIndex + 3, realIndex + 2, realIndex + 1, realIndex + 3, realIndex + 1, realIndex);
                let coords = this.mTilesets[0].getCoords(this.mData.data[index]);
                this.mArrays.textureCoordinate.data.push(coords[0],coords[3],coords[0],coords[2],coords[1],coords[2],coords[1],coords[3]);
                realIndex += 4;
            }
        }
    var gl = gEngine.Core.getGL();
    this.mBufferInfo = twgl.createBufferInfoFromArrays(gl, this.mArrays);
};

MapLayer.prototype.draw = function (transform, vpMatrix,light) {
    var gl = gEngine.Core.getGL();
    this.mShader.setLight(light);
    
    this.mShader.activateShader([1,1,1,this.mData.opacity],transform,vpMatrix);
    //gl.useProgram(this.mShader.getShader().program);
    twgl.setBuffersAndAttributes(gl, this.mShader.getShader(), this.mBufferInfo);
    //let screen = vpMatrix.getViewport();
    gEngine.Textures.activateTexture(this.mTilesets[0].mTexture);    
    
	//var mUniforms = { u_color: [1,1,1,],u_screenSize:[screen[2],screen[3]], u_transform: transform, u_viewTransform: vpMatrix.getVPMatrix() };
	//twgl.setUniforms(this.mShader.getShader(), mUniforms);

    twgl.drawBufferInfo(gl, this.mBufferInfo);
};

function MapRenderer(filePath) {
    this.mLayers = [];
    this.mMapName = filePath;
    this.mData = [];
    this.mTilesets = [];
    this.mTransform = new Transform();
    this.mLight = null;
    
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

MapRenderer.prototype.initialize = function () {
    if (this.mData) {
        for (let i in this.mData.layers) {
            let layer = new MapLayer(this.mData.layers[i], this.mTilesets);
            this.mLayers.push(layer);
        }
    }
};

MapRenderer.prototype.draw = function (vpMatrix) {
    for (let index = 0; index < this.mLayers.length; index++) {
        this.mLayers[index].draw(this.mTransform.getMatrix(), vpMatrix,this.mLight);
    }
};

MapRenderer.prototype.getTransform = function () { return this.mTransform; };

MapRenderer.prototype.getLight = function(){ return this.mLight; };
MapRenderer.prototype.setLight = function(l){ this.mLight = l; };