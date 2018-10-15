var gEngine = gEngine || {};


gEngine.LayerManager = (function () {

    var defaultLayers = {
        Background: 0,
        Foreground: 1,
        Actors: 2,
        Front: 3,
        HUD: 4
    };

    var mLayers = [];

    var initialize = function () {
        mLayers[defaultLayers.Background] = new GameObjectSet();
        mLayers[defaultLayers.Foreground] = new GameObjectSet();
        mLayers[defaultLayers.Actors] = new GameObjectSet();
        mLayers[defaultLayers.Front] = new GameObjectSet();
        mLayers[defaultLayers.HUD] = new GameObjectSet();
    };

    var addLayer = function (name, id) {
        defaultLayers[name] = id;
        mLayers[defaultLayers[name]] = new GameObjectSet();
    };

    var removeLayer = function (layer) {
        mLayers[layer].cleanUp();
        mLayers.splice(layer, 1);
    };

    var addToLayer = function (layer, obj) {
        mLayers[layer].addToSet(obj);
    };

    var removeFromLayer = function (layer, obj) {
        mLayers[layer].removeFromSet(obj);
    };

    var drawLayer = function (layer, aCamera) {
        mLayers[layer].draw(aCamera);
    };
    var drawAllLayers = function (aCamera) {
        for (let i in defaultLayers)
            mLayers[defaultLayers[i]].draw(aCamera);
    };

    var moveToLayerFront = function (layer, obj) {
        mLayers[layer].moveToLast(obj);
    };

    var updateLayer = function (layer, delta) {
        mLayers[layer].update(delta);
    };

    var updateAllLayers = function (delta) 
    {
        for (let i in defaultLayers)
            mLayers[defaultLayers[i]].update(delta);
    };

    var cleanUp = function(){
        for (let i in defaultLayers)
            mLayers[i].cleanUp();
        delete mLayers;
    };

    var getLayers = function(){
        return defaultLayers;
    };

    var mPublic = {
        initialize:initialize,
        addLayer:addLayer,
        removeLayer:removeLayer,
        addToLayer:addToLayer,
        removeFromLayer:removeFromLayer,
        moveToLayerFront:moveToLayerFront,
        drawLayer:drawLayer,
        drawAllLayers:drawAllLayers,
        updateLayer:updateLayer,
        updateAllLayers:updateAllLayers,
        getLayers:getLayers
    };

    return mPublic;
}());