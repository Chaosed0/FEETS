
b2Vec2              = Box2D.Common.Math.b2Vec2,
b2BodyDef           = Box2D.Dynamics.b2BodyDef,
b2Body              = Box2D.Dynamics.b2Body,
b2FixtureDef        = Box2D.Dynamics.b2FixtureDef,
b2FilterData        = Box2D.Dynamics.b2FilterData,
b2World             = Box2D.Dynamics.b2World,
b2RevoluteJoint     = Box2D.Dynamics.Joints.b2RevoluteJoint,
b2RevoluteJointDef  = Box2D.Dynamics.Joints.b2RevoluteJointDef,
b2FrictionJoint     = Box2D.Dynamics.Joints.b2FrictionJoint,
b2FrictionJointDef  = Box2D.Dynamics.Joints.b2FrictionJointDef,
b2PolygonShape      = Box2D.Collision.Shapes.b2PolygonShape,
b2CircleShape       = Box2D.Collision.Shapes.b2CircleShape;
b2DebugDraw 		= Box2D.Dynamics.b2DebugDraw;
b2ContactListener	= Box2D.Dynamics.b2ContactListener;

function Game() {

	var GameState = {
		INTRO: 0,
		GAME: 1
	}

	var world = null;
	var renderer = null;

	var lfoot = null;
	var rfoot = null;
    var curfoot = null;
	var lastfoot = null;
	var entities = {};
	var nextEntityId = 0;
	var squashList = [];

	var fWidth = null;
	var fHeight = null;

	const randomBoxMin = 3;
	const randomBoxMax = 10;
	const scrollPixelsPerSecond = 50.0;
	var nextRandomBox = Util.random(randomBoxMin, randomBoxMax);
	var lastRandomBox = 0;

	var time = Util.getTimestamp();
	var distance = 0;
	var accumulator = 0;

	var physStep = 1/40.0;
	var floor = {};

    var mousetime = null;
    var mousepos = null;

	var contactListener = new b2ContactListener();

	var intro = new Intro();
	var state = GameState.INTRO;

	this.Run = function() {
		world = new b2World(new b2Vec2(0,9.8), false);
		world.SetContactListener(contactListener);

		initIvanK();
		//initDebugDraw();
		//initWorld();

		intro.init(renderer.stage);
	}

	var initIvanK = function() {
		renderer = new Renderer("c");

		renderer.stage.addEventListener(Event.ENTER_FRAME, function() { onEF(); }, false);
		//renderer.stage.addEventListener(MouseEvent.MOUSE_DOWN, function(e) { onMouseDown(e); }, false);
		renderer.stage.addEventListener(KeyboardEvent.KEY_DOWN, function(e) { onKD(e); }, false);
		renderer.stage.addEventListener(KeyboardEvent.KEY_UP, function(e) { onKU(e); }, false);
	}

	var initDebugDraw = function() {
		stage = null;

		var canvas = document.getElementById("c");
		var debugDraw = new b2DebugDraw();
		debugDraw.SetSprite(document.getElementById("c").getContext("2d"));
		debugDraw.SetDrawScale(Util.meterToPixel);
		debugDraw.SetFillAlpha(0.3);
		debugDraw.SetLineThickness(1.0);
		debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
		world.SetDebugDraw(debugDraw);
		
		window.addEventListener('keydown', function(event) { onKD(event); }, false);
		window.addEventListener('keyup', function(event) { onKU(event); }, false);
		setInterval(function() { onEF() }, 1000.0/60.0);
	}

	var randomBox = function(left, bottom) {
		var body = null;
		var sprite = null;
		var width = Math.random() * 4.0;
		var height = width;

		var bodyDef = new b2BodyDef();
		bodyDef.type = b2Body.b2_dynamicBody;
		bodyDef.position.Set(left / Util.meterToPixel + width,
				bottom / Util.meterToPixel - height);
		body = world.CreateBody(bodyDef);

		var shape = new b2PolygonShape();
		shape.SetAsBox(width / 2.0, height / 2.0);
		var fixtureDef = new b2FixtureDef();
		fixtureDef.shape = shape;
		fixtureDef.density = 1.0;
		fixtureDef.filter.categoryBits = 0x0002;
		fixtureDef.filter.maskBits = 0xFFFF^0x0002;
		body.CreateFixture(fixtureDef);

		fixtureDef = new b2FixtureDef();
		fixtureDef.shape = shape;
		fixtureDef.density = 1.0;
		fixtureDef.isSensor = true;
		body.CreateFixture(fixtureDef);

		var dWidth = width * Util.meterToPixel;
		var dHeight = height * Util.meterToPixel;
		var color = Math.random() * 0xFFFFFF;
		sprite = new Sprite();
		sprite.graphics.beginFill(color, 0.5);
		sprite.graphics.drawRect(-dWidth/2.0, -dHeight/2.0, dWidth, dHeight);
		sprite.graphics.endFill();

		var drawable = new Drawable(sprite);
		renderer.add(drawable);

		var entity = {drawable:drawable,
			body:body,
			width:dWidth,
			height:dHeight};
		entity.body.SetUserData(entity);
		entities[nextEntityId] = entity;
		entity.id = nextEntityId++;;
	}

	var initWorld = function() {

		fWidth = renderer.stage.stageWidth * 1.5;
		fHeight = 100;
		var fX = renderer.stage.stageWidth - fWidth / 2.0;
		var fY = renderer.stage.stageHeight - fHeight / 2.0;

		var floorDef = new b2BodyDef();
		floorDef.position.Set(fX / Util.meterToPixel, fY / Util.meterToPixel);
		floor.body = world.CreateBody(floorDef);

		var shape = new b2PolygonShape();
		shape.SetAsBox(fWidth / 2.0 / Util.meterToPixel, fHeight / 2.0 / Util.meterToPixel);
		var fixtureDef = new b2FixtureDef();
		fixtureDef.shape = shape;
		fixtureDef.friction = 0.8;
		fixtureDef.density = 1.0;
		floor.body.CreateFixture(fixtureDef);

		var floorSprite = new Sprite();
		floorSprite.graphics.beginFill(0x77DD77);
		floorSprite.graphics.drawRect(-fWidth / 2.0, -fHeight / 2.0, fWidth, fHeight);
		floorSprite.graphics.endFill();

		floor.drawable = new Drawable(floorSprite);
		floor.drawable.syncWithPhys(floor.body);
		renderer.add(floor.drawable);

		lfoot = new Foot(world, renderer, {x:400/Util.meterToPixel, y:-100/Util.meterToPixel});
		rfoot = new Foot(world, renderer, {x:420/Util.meterToPixel, y:-100/Util.meterToPixel});
		curfoot = lfoot;
		lastfoot = rfoot;

		//renderer.followActor = foot.drawable;
		//renderer.followAngle = true;
	}

	var onKD = function(e) {
	}

	var onKU = function(e) {
	}

	var onMouseDown = function(e) {
		var lfootPos = {x:lfoot.drawable.sprite.x, y:lfoot.drawable.sprite.y};
		var rfootPos = {x:rfoot.drawable.sprite.x, y:rfoot.drawable.sprite.y};
		var lfootRect = {left:lfootPos.x - lfoot.width/2.0,
			right:lfootPos.x + lfoot.width/2.0,
			top:lfootPos.y - lfoot.height/2.0,
			bottom:lfootPos.y + lfoot.height/2.0};
		var rfootRect = {left:rfootPos.x - rfoot.width/2.0,
			right:rfootPos.x + rfoot.width/2.0,
			top:rfootPos.y - rfoot.height/2.0,
			bottom:rfootPos.y + rfoot.height/2.0};

		var clickleft = false;
		var clickright = false;

		if(renderer.stage.mouseX >= lfootRect.left &&
				renderer.stage.mouseX <= lfootRect.right &&
				renderer.stage.mouseY >= lfootRect.top &&
				renderer.stage.mouseY <= lfootRect.bottom) {
					clickleft = true;
		}
		if(renderer.stage.mouseX >= rfootRect.left &&
				renderer.stage.mouseX <= rfootRect.right &&
				renderer.stage.mouseY >= rfootRect.top &&
				renderer.stage.mouseY <= rfootRect.bottom) {
					clickright = true;
		}

		//If they're both clicked, prefer the one that was not clicked last
		// Need lastfoot in case curfoot is set to null here
		if(clickleft && clickright) {
			curfoot = (lastfoot == lfoot ? rfoot: lfoot);
		} else if(clickleft) {
			curfoot = lfoot;
		} else if(clickright) {
			curfoot = rfoot;
		} else {
			curfoot = null;
		}
		
		if(curfoot != null) {
			mousetime = Util.getTimestamp();
			mousepos = {x: renderer.stage.mouseX,
				y: renderer.stage.mouseY};
			lastfoot = curfoot;
		}
	}

	var updateFloor = function() {
		floor.body.SetPosition(new b2Vec2(renderer.view.x / Util.meterToPixel,
					(renderer.stage.stageHeight - fHeight/2.0) / Util.meterToPixel));
		floor.drawable.syncWithPhys(floor.body);
	}

	var stepPhysics = function(delta) {
		accumulator += delta;

		if(mousetime != null && curfoot != null &&
				Util.getTimestamp() - mousetime > 100 &&
				curfoot.Distance(renderer.stage.stageHeight - fHeight) < 0.5) {
			var mousedelta = Util.getTimestamp() - mousetime;
			var forceVec = new b2Vec2(
					(renderer.stage.mouseX - mousepos.x)/mousedelta * 1000
						* curfoot.scale * curfoot.scale,
					(renderer.stage.mouseY - mousepos.y)/mousedelta * 1000
						* curfoot.scale * curfoot.scale);
			curfoot.ApplyForce(forceVec, curfoot.body.GetWorldCenter());

			mousetime = null;
			curfoot = null;
		}

		if (accumulator >= physStep*1000) {
			world.Step(physStep, 3, 3);
			accumulator -= physStep*1000;
		}

		world.ClearForces();
	}

	var update = function(delta) {
		lfoot.update();
		rfoot.update();

		//Iterate in reverse to avoid problems when removing elements
		for(var i = squashList.length-1; i >= 0; --i) {
			var squashEntity = squashList[i];
			var entity = squashEntity.entity;
			var foot = squashEntity.foot;
			world.DestroyBody(entity.body);
			delete entities[entity.id];

			var distance = foot.Distance(renderer.stage.stageHeight - fHeight);
			var scale = distance / entity.height;
			if(distance < 1) {
				var squashid = i;
				setTimeout(function() {
					renderer.remove(entity.drawable);
				}, 2000);
				squashList.splice(squashid, 1);
			} else {
				entity.drawable.y = renderer.stage.stageHeight - fHeight - entity.height * scale / 2.0;
				entity.drawable.sprite.scaleY = scale;
			}
		}

		for(var i in entities) {
			var drawable = entities[i].drawable;
			var body = entities[i].body;

			drawable.syncWithPhys(body);
		}

		//If one of the feet is past 3/4 of the screen, move the camera to it
		if(lfoot.drawable.x >= renderer.view.x + renderer.stage.stageWidth / 4.0) {
			renderer.view.x = lfoot.drawable.x - renderer.stage.stageWidth / 4.0;
		} else if(rfoot.drawable.x >= renderer.view.x + renderer.stage.stageWidth / 4.0) {
			renderer.view.x = rfoot.drawable.x - renderer.stage.stageWidth / 4.0;
		} else {
			renderer.view.x += scrollPixelsPerSecond * delta/1000.0;
		}
		renderer.update();
	}

	var onEF = function() {
		//Even if the game is paused, we still want to keep time so
		// there's not a huge jump after unpause
		var curtime = Util.getTimestamp();
		var delta = curtime - time;
		time = curtime;

		if(state == GameState.INTRO) {
			intro.update(delta);
		} else if(state == GameState.GAME) {

			distance += delta/1000.0 * scrollPixelsPerSecond / Util.meterToPixel;

			if(distance - lastRandomBox >= nextRandomBox) {
				lastRandomBox = distance;
				nextRandomBox = Util.random(randomBoxMin, randomBoxMax);
				randomBox(renderer.view.x + renderer.stage.stageWidth / 2.0,
						renderer.stage.stageHeight - fHeight);
			}

			stepPhysics(delta);
			update(delta);
			updateFloor();
			//world.DrawDebugData();
		} else {
			console.log("UHHHH: Unknown state " + state);
		}
	}

	contactListener.BeginContact = function(contact) {
		var fixtureA = contact.GetFixtureA();
		var fixtureB = contact.GetFixtureB();
		var bodyA = fixtureA.GetBody();
		var bodyB = fixtureB.GetBody();

		if((bodyA == lfoot.body || bodyB == lfoot.body ||
				bodyA == rfoot.body || bodyB == rfoot.body) &&
				(bodyA != floor.body && bodyB != floor.body)) {
			//foot colliding with something that isn't the floor
			var footBody = null;
			var otherBody = null;
			if(bodyA == lfoot.body || bodyA == rfoot.body) {
				footBody = bodyA;
				otherBody = bodyB;
			} else if(bodyB == lfoot.body || bodyB == rfoot.body) {
				footBody = bodyB;
				otherBody = bodyA;
			}

			var alreadySquashed = false;
			for(var i = 0; i < squashList.length; i++) {
				if(squashList[i].entity.body == otherBody) {
					alreadySquashed = true;
				}
			}

			if(!alreadySquashed) {
				squashList.push({entity:otherBody.GetUserData(),
					foot:footBody.GetUserData(),
					squashed:false});
			}
		}
	}

	contactListener.EndContact = function(contact) {
	}
}
