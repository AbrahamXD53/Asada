var TiledType = Object.freeze({ All: 0, Vertical: 1, Horizontal: 2 });
function TiledGameObject(texture, normal = null) {
	if (normal)
		GameObject.call(this, texture, normal);
	else
		GameObject.call(this, texture);
    this.mShouldTile = true;
    this.mTiledType = TiledType.All;
}

gEngine.Core.inheritPrototype(TiledGameObject, GameObject);
TiledGameObject.prototype.setIsTiled = function (t) { this.mShouldTile = t; };
TiledGameObject.prototype.shouldTile = function () { return this.mShouldTile; };

/**
 * @param {Camera} camera Camera used to render
 */
TiledGameObject.prototype.drawTile = function (camera) {
    let transform = this.transform;
    let w = transform.getScaleX();
    let h = transform.getScaleY();
    let pos = transform.getPosition();
    let left = pos[0] - w * 0.5;
    let right = left + w;
    let top = pos[1] + h * 0.5;
    let bottom = top - h;

    let wcPos = camera.getCenter();
    let wcLeft = wcPos[0] - camera.getWidth() * 0.5;
    let wcRight = wcLeft + camera.getWidth();
	let wcBottom = wcPos[1] - camera.getHeight() * 0.5;
    let wcTop = wcBottom + camera.getHeight();

    let dx = 0, dy = 0;
    if (right < wcLeft) {
        dx = Math.ceil((wcLeft - right) / w) * w;
    } else {
        if (left > wcLeft) {
            dx = -Math.ceil((left - wcLeft) / w) * w;
        }
    }
    if (top < wcBottom) {
        dy = Math.ceil((wcBottom - top) / h) * h;
    } else {
        if (bottom > wcBottom) {
            dy = -Math.ceil((bottom - wcBottom) / h) * h;
        }
    }

    let sX = pos[0], sY = pos[1];

    transform.translate([dx, dy, 0]);
	right = pos[0] + w * 0.5;
	top = pos[1] + h * 0.5;

    let nx = 1, ny = 1;
    nx = Math.ceil((wcRight - right) / w);
    ny = Math.ceil((wcTop - top) / h);
    let cx = nx;
    let xPos = pos[0];
    while (ny >= 0) {
        cx = nx;
        pos[0] = xPos;
        while (cx >= 0) {
            this.renderer.draw(camera);
            transform.translateX(w);
            --cx;
        }

        transform.translateY(h);
        --ny;
    }
    pos[0] = sX;
    pos[1] = sY;
};
TiledGameObject.prototype.draw = function (camera) {
    if (this.mShouldTile) {
        this.drawTile(camera);
    }
    else {
        this.renderer.draw(camera);
    }
};