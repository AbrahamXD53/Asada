var gEngine = gEngine || {};
gEngine.Physics = (function () {
	var engine = null;

	var initialize = function () {
		Matter.use('matter-collision-events');
		engine = Matter.Engine.create();
		engine.world.gravity.scale = -1;
	};

	var getEngine = function () {
		return engine;
	};
	var getWorld = function () {
		return engine.world;
	};

	var update = function (delta = 1) {
		Matter.Engine.update(engine, delta);
	};


	var cleanUp = function () {

	};

	var mPublic = {
		initialize: initialize,
		update: update,
		getEngine: getEngine,
		getWorld: getWorld,
		cleanUp: cleanUp
	};

	return mPublic;
}());