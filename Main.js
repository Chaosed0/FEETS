
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
	this.world = null;
	this.renderer = null;
	this.lfoot = null;
	this.rfoot = null;
    this.curfoot = null;
	this.lastfoot = null;
	this.entities = {};
	this.nextEntityId = 0;
	this.squashList = [];

	this.randomBoxMin = 1000;
	this.randomBoxMax = 5000;
	this.nextRandomBox = Util.random(this.randomBoxMin, this.randomBoxMax);
	this.lastRandomBox = Util.getTimestamp();

	this.time = Util.getTimestamp();
	this.accumulator = 0;

	this.physStep = 1/40.0;
	this.floor = {};

    this.mousetime = null;
    this.mousepos = null;

	this.scrollPixelsPerSecond = 50.0;

	this.contactListener = new b2ContactListener();
}

Game.prototype.Run = function() {
	this.world = new b2World(new b2Vec2(0,9.8), false);
	this.world.SetContactListener(this.contactListener);
	this.initIvanK();
	//this.initDebugDraw();
	this.initWorld();
}

Game.prototype.initIvanK = function() {
	this.renderer = new Renderer("c");

	var self = this;
	this.renderer.stage.addEventListener(Event.ENTER_FRAME, function() { self.onEF(); }, false);
	this.renderer.stage.addEventListener(MouseEvent.MOUSE_DOWN, function(e) { self.onMouseDown(e); }, false);
	this.renderer.stage.addEventListener(KeyboardEvent.KEY_DOWN, function(e) { self.onKD(e); }, false);
	this.renderer.stage.addEventListener(KeyboardEvent.KEY_UP, function(e) { self.onKU(e); }, false);
}

Game.prototype.initDebugDraw = function() {
	stage = null;

	var canvas = document.getElementById("c");
	var debugDraw = new b2DebugDraw();
	debugDraw.SetSprite(document.getElementById("c").getContext("2d"));
	debugDraw.SetDrawScale(Util.meterToPixel);
	debugDraw.SetFillAlpha(0.3);
	debugDraw.SetLineThickness(1.0);
	debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
	this.world.SetDebugDraw(debugDraw);
	
	var self = this;
	window.addEventListener('keydown', function(event) { self.onKD(event); }, false);
	window.addEventListener('keyup', function(event) { self.onKU(event); }, false);
	setInterval(function() { self.onEF() }, 1000.0/60.0);
}

Game.prototype.randomBox = function(left, bottom) {
	var body = null;
	var sprite = null;
	var width = Math.random() * 4.0;
	var height = width;

	var bodyDef = new b2BodyDef();
	bodyDef.type = b2Body.b2_dynamicBody;
	bodyDef.position.Set(left / Util.meterToPixel + width,
			bottom / Util.meterToPixel - height);
	body = this.world.CreateBody(bodyDef);

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
	this.renderer.add(drawable);

	var entity = {drawable:drawable,
		body:body,
		width:dWidth,
		height:dHeight};
	entity.body.SetUserData(entity);
	this.entities[this.nextEntityId] = entity;
	entity.id = this.nextEntityId++;;
}

Game.prototype.initWorld = function() {

	this.fWidth = this.renderer.stage.stageWidth * 1.5;
	this.fHeight = 100;
	var fX = this.renderer.stage.stageWidth - this.fWidth / 2.0;
	var fY = this.renderer.stage.stageHeight - this.fHeight / 2.0;

	var floorDef = new b2BodyDef();
	floorDef.position.Set(fX / Util.meterToPixel, fY / Util.meterToPixel);
	this.floor.body = this.world.CreateBody(floorDef);

	var shape = new b2PolygonShape();
	shape.SetAsBox(this.fWidth / 2.0 / Util.meterToPixel, this.fHeight / 2.0 / Util.meterToPixel);
    var fixtureDef = new b2FixtureDef();
    fixtureDef.shape = shape;
    fixtureDef.friction = 0.8;
    fixtureDef.density = 1.0;
	this.floor.body.CreateFixture(fixtureDef);

	var floorSprite = new Sprite();
	floorSprite.graphics.beginFill(0x77DD77);
	floorSprite.graphics.drawRect(-this.fWidth / 2.0, -this.fHeight / 2.0, this.fWidth, this.fHeight);
	floorSprite.graphics.endFill();

	this.floor.drawable = new Drawable(floorSprite);
	this.floor.drawable.syncWithPhys(this.floor.body);
	this.renderer.add(this.floor.drawable);

	this.lfoot = new Foot(this.world, this.renderer, {x:400/Util.meterToPixel, y:500/Util.meterToPixel});
	this.rfoot = new Foot(this.world, this.renderer, {x:420/Util.meterToPixel, y:500/Util.meterToPixel});
    this.curfoot = this.lfoot;
	this.lastfoot = this.rfoot;

	//this.renderer.followActor = this.foot.drawable;
	//this.renderer.followAngle = true;
}

Game.prototype.onKD = function(e) {
}

Game.prototype.onKU = function(e) {
}

Game.prototype.onMouseDown = function(e) {
	var lfootPos = {x:this.lfoot.drawable.sprite.x, y:this.lfoot.drawable.sprite.y};
	var rfootPos = {x:this.rfoot.drawable.sprite.x, y:this.rfoot.drawable.sprite.y};
	var lfootRect = {left:lfootPos.x - this.lfoot.width/2.0,
		right:lfootPos.x + this.lfoot.width/2.0,
		top:lfootPos.y - this.lfoot.height/2.0,
		bottom:lfootPos.y + this.lfoot.height/2.0};
	var rfootRect = {left:rfootPos.x - this.rfoot.width/2.0,
		right:rfootPos.x + this.rfoot.width/2.0,
		top:rfootPos.y - this.rfoot.height/2.0,
		bottom:rfootPos.y + this.rfoot.height/2.0};

	var clickleft = false;
	var clickright = false;

	if(this.renderer.stage.mouseX >= lfootRect.left &&
			this.renderer.stage.mouseX <= lfootRect.right &&
			this.renderer.stage.mouseY >= lfootRect.top &&
			this.renderer.stage.mouseY <= lfootRect.bottom) {
				clickleft = true;
	}
	if(this.renderer.stage.mouseX >= rfootRect.left &&
			this.renderer.stage.mouseX <= rfootRect.right &&
			this.renderer.stage.mouseY >= rfootRect.top &&
			this.renderer.stage.mouseY <= rfootRect.bottom) {
				clickright = true;
	}

	//If they're both clicked, prefer the one that was not clicked last
	// Need this.lastfoot in case this.curfoot is set to null here
	if(clickleft && clickright) {
		this.curfoot = (this.lastfoot == this.lfoot ? this.rfoot: this.lfoot);
	} else if(clickleft) {
		this.curfoot = this.lfoot;
	} else if(clickright) {
		this.curfoot = this.rfoot;
	} else {
		this.curfoot = null;
	}
	
	if(this.curfoot != null) {
		this.mousetime = Util.getTimestamp();
		this.mousepos = {x: this.renderer.stage.mouseX,
			y: this.renderer.stage.mouseY};
		this.lastfoot = this.curfoot;
	}
}

Game.prototype.updateFloor = function() {
	this.floor.body.SetPosition(new b2Vec2(this.renderer.view.x / Util.meterToPixel,
                (this.renderer.stage.stageHeight - this.fHeight/2.0) / Util.meterToPixel));
    this.floor.drawable.syncWithPhys(this.floor.body);
}

Game.prototype.stepPhysics = function(delta) {
	this.accumulator += delta;

    if(this.mousetime != null && this.curfoot != null &&
			Util.getTimestamp() - this.mousetime > 100 &&
			this.curfoot.Distance(this.renderer.stage.stageHeight - this.fHeight) < 0.5) {
		var mousedelta = Util.getTimestamp() - this.mousetime;
        var forceVec = new b2Vec2(
				(this.renderer.stage.mouseX - this.mousepos.x)/mousedelta * 1000
					* this.curfoot.scale * this.curfoot.scale,
                (this.renderer.stage.mouseY - this.mousepos.y)/mousedelta * 1000
					* this.curfoot.scale * this.curfoot.scale);
        this.curfoot.ApplyForce(forceVec, this.curfoot.body.GetWorldCenter());

        this.mousetime = null;
		this.curfoot = null;
    }

	if (this.accumulator >= this.physStep*1000) {
		this.world.Step(this.physStep, 3, 3);
		this.accumulator -= this.physStep*1000;
	}

	this.world.ClearForces();
}

Game.prototype.update = function(delta) {
	this.lfoot.update();
	this.rfoot.update();

	//Iterate in reverse to avoid problems when removing elements
	for(var i = this.squashList.length-1; i >= 0; --i) {
		var squashEntity = this.squashList[i];
		var entity = squashEntity.entity;
		var foot = squashEntity.foot;
		this.world.DestroyBody(entity.body);
		delete this.entities[entity.id];

		var distance = foot.Distance(this.renderer.stage.stageHeight - this.fHeight);
		var scale = distance / entity.height;
		console.log(scale);
		if(distance < 1) {
			var self = this;
			var squashid = i;
			setTimeout(function() {
				self.renderer.remove(entity.drawable);
			}, 2000);
			self.squashList.splice(squashid, 1);
		} else {
			entity.drawable.y = this.renderer.stage.stageHeight - this.fHeight - entity.height * scale / 2.0;
			entity.drawable.sprite.scaleY = scale;
		}
	}

	for(var i in this.entities) {
		var drawable = this.entities[i].drawable;
		var body = this.entities[i].body;

		drawable.syncWithPhys(body);
	}

    this.renderer.view.x += this.scrollPixelsPerSecond * delta/1000.0;
	this.renderer.update();
}

Game.prototype.onEF = function() {
	var curtime = Util.getTimestamp();
	var delta = curtime - this.time;
	this.time = curtime;

	if(curtime - this.lastRandomBox >= this.nextRandomBox) {
		this.lastRandomBox = curtime;
		this.nextRandomBox = Util.random(this.randomBoxMin, this.randomBoxMax);
		this.randomBox(this.renderer.view.x + this.renderer.stage.stageWidth / 2.0,
				this.renderer.stage.stageHeight - this.fHeight);
	}

	this.stepPhysics(delta);
	this.update(delta);
	this.updateFloor();
	//this.world.DrawDebugData();
	
}

game = new Game();

game.contactListener.BeginContact = function(contact) {
	var fixtureA = contact.GetFixtureA();
	var fixtureB = contact.GetFixtureB();
	var bodyA = fixtureA.GetBody();
	var bodyB = fixtureB.GetBody();

	if((bodyA == game.lfoot.body || bodyB == game.lfoot.body) &&
			(bodyA == game.floor.body || bodyB == game.floor.body)) {
		//lfoot-ground collision
		game.lfoot.onground = true;
	} else if((bodyA == game.rfoot.body || bodyB == game.rfoot.body) &&
			(bodyA == game.floor.body || bodyB == game.floor.body)) {
		//rfoot-ground collision
		game.rfoot.onground = true;
	} else if(bodyA == game.lfoot.body || bodyB == game.lfoot.body ||
			bodyA == game.rfoot.body || bodyB == game.rfoot.body) {
		//foot-something-else collision
		var footBody = null;
		var otherBody = null;
		if(bodyA == game.lfoot.body || bodyA == game.rfoot.body) {
			footBody = bodyA;
			otherBody = bodyB;
		} else if(bodyB == game.lfoot.body || bodyB == game.rfoot.body) {
			footBody = bodyB;
			otherBody = bodyA;
		}

		var alreadySquashed = false;
		for(var i = 0; i < game.squashList.length; i++) {
			if(game.squashList[i].entity.body == otherBody) {
				alreadySquashed = true;
			}
		}

		if(!alreadySquashed) {
			game.squashList.push({entity:otherBody.GetUserData(),
				foot:footBody.GetUserData(),
				squashed:false});
		}
	}
}

game.contactListener.EndContact = function(contact) {
	var fixtureA = contact.GetFixtureA();
	var fixtureB = contact.GetFixtureB();
	var bodyA = fixtureA.GetBody();
	var bodyB = fixtureB.GetBody();

	if(bodyA == game.lfoot.body || bodyB == game.lfoot.body &&
			(bodyA == game.floor.body || bodyB == game.floor.body)) {
		game.lfoot.onground = false;
	}
	if(bodyA == game.rfoot.body || bodyB == game.rfoot.body &&
			(bodyA == game.floor.body || bodyB == game.floor.body)) {
		game.rfoot.onground = false;
	}
}
