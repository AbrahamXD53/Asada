function GameObjectSet() {
    this.mSet = [];
}

GameObjectSet.prototype.size = function () { return this.mSet.length; };

GameObjectSet.prototype.getObjectAt = function (index) {
    return this.mSet[index];
};

GameObjectSet.prototype.addToSet = function (obj) {
    this.mSet.push(obj);
};

GameObjectSet.prototype.removeFromSet = function (obj,forceRemove=false) {
    var index = this.mSet.indexOf(obj);
    if (index > -1){
        if(forceRemove){
            if(this.mSet[index].destroy)
                this.mSet[index].destroy;
        }
        this.mSet.splice(index, 1);
    }
};

GameObjectSet.prototype.moveToLast = function (obj) {
    this.removeFromSet(obj);
    this.addToSet(obj);
};

GameObjectSet.prototype.update = function (delta) {
    for (let i = 0; i < this.mSet.length; i++) 
    {
        if(this.mSet[i].update)
            this.mSet[i].update();
    }
};

GameObjectSet.prototype.draw = function (aCamera) {
    for (let i = 0; i < this.mSet.length; i++) {
        if(this.mSet[i].draw)
            this.mSet[i].draw(aCamera);
    }
};

GameObjectSet.prototype.cleanUp = function(){
    for (let i = 0; i < this.mSet.length; i++) {
        if(this.mSet[index].destroy)
            this.mSet[index].destroy;
    }
    delete this.mSet;
};