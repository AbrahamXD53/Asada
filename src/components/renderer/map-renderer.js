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
	this.mOffset = 0.0005;

}
Tileset.prototype.getCoords = function (id) {
	if (id > 0) {
		if (id < this.mTileCount) {
			let x = (id - 1) % this.mWidth;
			let y = Math.floor((id - 1) / this.mWidth);
			return [
				x * this.mInverseWidth + this.mOffset,
				(x + 1) * this.mInverseWidth - this.mOffset,
				y * this.mInverseHeight + this.mOffset,
				(y + 1) * this.mInverseHeight - this.mOffset
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
	let initialX = -(this.mData.width * .5);
	//initialX = 0;
	let initialY = this.mData.height * 0.5;
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
}

MapLayer.prototype.setShader = function (s) {
	this.mShader = s;
};

MapLayer.prototype.draw = function (transform, vpMatrix, lights) {
	let gl = gEngine.Core.getGL();
	if (this.mShader.setLights)
		this.mShader.setLights(lights);
	gEngine.Textures.activateTexture(this.mTilesets[0].mTexture);
	this.mShader.activateShader(this.mTint, transform, vpMatrix);
	twgl.setBuffersAndAttributes(gl, this.mShader.getShader(), this.mBufferInfo);
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
MapRenderer.prototype.createBody = function (data) {
	let world = gEngine.Physics.getWorld();
	let initialX = -this.mData.width * 0.5;
	let initialY = this.mData.height * 0.5;
	let composite = Matter.Composite.create();
	for (let i in data.objects) {
		let body = null;
		if (!data.objects[i].polyline) {
			let w = data.objects[i].width / this.mData.tilewidth, h = data.objects[i].height / this.mData.tileheight,
				x = data.objects[i].x / this.mData.tilewidth + w * 0.5,
				y = this.mData.height - data.objects[i].y / this.mData.tileheight - h * 0.5;
			console.log(x, y);
			body = Matter.Bodies.rectangle(x, y, w, h, { friction: 0.5, frictionDynamic: 0, isStatic: true, properties: data.objects[i].properties || {} });
			body.collisionFilter.group = 0;
			body.collisionFilter.category = 0b00000001;
		} else {
			let x = data.objects[i].x / this.mData.tilewidth,
				y = this.mData.height -data.objects[i].y / this.mData.tileheight;
			let vertex = [];
			for (var j = 0; j < data.objects[i].polyline.length; j++) {
				vertex[j] = {
					x: data.objects[i].polyline[j].x / this.mData.tilewidth,
					y: this.mData.height -data.objects[i].polyline[j].y / this.mData.tileheight
				};

			}
			body = Matter.Bodies.fromVertices(x,y, vertex, { friction: 0.5, frictionDynamic: 0, isStatic: true, properties: data.objects[i].properties || {} });
		}

		Matter.Composite.add(composite, body);
	}
	Matter.Composite.translate(composite, { x: initialX, y: -initialY });
	Matter.World.add(world, composite);
	this.mComposites.push(composite);
};
MapRenderer.prototype.initialize = function () {
	if (this.mData) {
		for (let i in this.mData.layers) {
			if (this.mData.layers[i].data) {
				let layer = new MapLayer(this.mData.layers[i], this.mTilesets, this.mShader);
				this.mLayers.push(layer);
			}
			else {
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

MapRenderer.prototype.cleanUp = function () {
	//TODO: clear buffers
};

MapRenderer.prototype.setCollision = function (playerPos) {
	for (let p in this.mComposites) {
		let bodies = Matter.Composite.allBodies(this.mComposites[p]);
		for (let b in bodies) {
			if (bodies[b].properties)
				if (bodies[b].properties.hasOwnProperty('oneSide'))
					if (bodies[b].position.y + 1 > playerPos[1]) {
						bodies[b].collisionFilter.mask = 0;
					}
					else {
						bodies[b].collisionFilter.mask = -1;
					}
		}
	}
};