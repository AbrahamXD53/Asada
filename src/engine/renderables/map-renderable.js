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
    this.mOffset = 0.001;

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
    this.mTilesets = tilesets;
    this.mData = data;
    this.mTile = new Sprite(this.mTilesets[0].getTexture());
    this.mTile.setColor([1,1,1,this.mData.opacity]);
}

MapLayer.prototype.draw = function (parent, transform) {
    let parentPos = parent.getPosition();
    let parentScale = parent.getScale();

    let offsets = [
        this.mData.width * parentScale[0] * 0.5,
        this.mData.height * parentScale[1] * 0.5
    ];
    this.mTile.getTransform().setScale(parentScale);
    for (let indey = this.mData.height-1; indey >= 0; indey--)
        for (let index = this.mData.width * indey; index < (this.mData.width * indey) + this.mData.width; index++) {
            if (this.mData.data[index] > 0) {
                this.mTile.getTransform().setPosition([
                    parentPos[0]+(parentScale[0]*(index%this.mData.width))-offsets[0],
                    parentPos[1]-(parentScale[1]*indey)+offsets[1],0
                ]);

                let coords = this.mTilesets[0].getCoords(this.mData.data[index]);
                this.mTile.setTextureCoordUV(coords[0], coords[1], coords[3], coords[2]);

                this.mTile.draw(transform);
            }
        }
};

function MapRenderer(filePath) {
    this.mLayers = [];
    this.mMapName = filePath;
    this.mData = [];
    this.mTilesets = [];
    this.mTransform = new Transform();
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
        this.mLayers[index].draw(this.mTransform, vpMatrix);
    }
};

MapRenderer.prototype.getTransform = function () { return this.mTransform; };