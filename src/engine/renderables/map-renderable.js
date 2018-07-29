'use strict';

function Tileset(texture,data){
    this.mTexture=texture;
    this.mColumns = data.columns;
    this.mFirstId = data.firstgid;
    this.mImageHeight = data.imageheight;
    this.mImageWidth = data.imagewidth;
    this.mMargin = data.margin;
    this.mSpacing = data.spacing;
    this.mTileCount = data.tilecount;
    this.mTileHeight = data.tileheight;
    this.mTileWidth = data.tilewidth;
    this.mOffset = 0.002;
    this.mInverseWidth = 1.0/data.tilewidth;
    this.mInverseHeight = 1.0/data.tileheight;
}
Tileset.prototype.getCoords = function(id){
    if(id>0){
        if(id<this.mTileCount){
            let x = (id - 1)% this.mTileWidth;
            let y = Math.floor((id-1)/this.mTileWidth);
            return [
                (x * this.mInverseWidth) + this.mOffset,
                ((x + 1) * this.mInverseWidth) - this.mOffset,
                (y  * this.mInverseHeight) - this.mOffset,
                ((y + 1) * this.mInverseHeight) - this.mOffset
            ];
        }
    }
};

Tileset.prototype.getTexture = function(){
    return this.mTexture;
};

function MapLayer(data,tilesets)
{
    this.mTilesets = tilesets;
    this.mData = data;
    this.mTile = new Sprite(this.mTilesets[0].getTexture());
}

MapLayer.prototype.draw=function(parent,transform){
    this.mTile.getTransform().setPosition(parent.getPosition());
    
    let coords = this.mTilesets[0].getCoords((Math.random()*10)+1);
    this.mTile.setTextureCoordUV(coords[0],coords[1],coords[2],coords[3]);

    console.log(coords);
    this.mTile.draw(transform);
};

function MapRenderer(filePath){
    this.mLayers = [];
    this.mMapName = filePath;
    this.mData=[];
    this.mTilesets=[];
    this.mTransform= new Transform();
}
MapRenderer.prototype.load = function(){
    gEngine.TextFileLoader.loadTextFile(this.mMapName,gEngine.TextFileLoader.TextFileType.TextFile,function(asset){
        this.mData = JSON.parse(gEngine.ResourceMap.retrieveAsset(asset));
        if(this.mData){
            for(var key in this.mData.tilesets){
                let texture=this.mMapName.substr(0,this.mMapName.lastIndexOf('/')+1) + this.mData.tilesets[key].image;
                let tileset =  new Tileset(texture,this.mData.tilesets[key]);
                this.mTilesets.push(tileset);
            }
        }
    }.bind(this));
};

MapRenderer.prototype.initialize = function(){
    if(this.mData){
        for(let i in this.mData.layers){
            console.log(this.mTextures);
            let layer = new MapLayer(this.mData.layers[i],this.mTilesets);
            this.mLayers.push(layer);
        }
    }
};

MapRenderer.prototype.draw = function(vpMatrix){
    for (let index = 0; index < this.mLayers.length; index++) {
        this.mLayers[index].draw(this.mTransform,vpMatrix);
    }
};

MapRenderer.prototype.getTransform = function (){ return this.mTransform; };