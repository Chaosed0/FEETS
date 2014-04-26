
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

function Game() {
	this.world = null;
	this.renderer = null;
	this.lfoot = null;
	this.rfoot = null;
    this.curfoot = null;
	this.actors = [];
	this.bodies = [];

	this.time = Util.getTimestamp();
	this.accumulator = 0;

	this.physStep = 1/40.0;
	this.floor = {};

    this.mousetime = null;
    this.mousepos = null;
}

Game.prototype.Run = function() {
	this.world = new b2World(new b2Vec2(0,9.8), false);
	this.initIvanK();
	//this.initDebugDraw();
	this.initWorld();
}

Game.prototype.initIvanK = function() {
	this.renderer = new Renderer("c");

	var self = this;
	this.renderer.stage.addEventListener(Event.ENTER_FRAME, function() { self.onEF(); }, false);
	this.renderer.stage.addEventListener(MouseEvent.MOUSE_DOWN, function() { self.onMouseDown(); }, false);
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

Game.prototype.randomBox = function() {
	var body = null;
	var sprite = null;
	var width = Math.random() * 2.0;
	var height = width;

	var bodyDef = new b2BodyDef();
	bodyDef.type = b2Body.b2_dynamicBody;
	bodyDef.position.Set(Math.random() * this.renderer.stage.stageWidth / Util.meterToPixel,
			Math.random() * this.renderer.stage.stageHeight / Util.meterToPixel);
	body = this.world.CreateBody(bodyDef);

	var shape = new b2PolygonShape();
	shape.SetAsBox(width / 2.0, height / 2.0);
    var fixtureDef = new b2FixtureDef();
    fixtureDef.shape = shape;
    fixtureDef.density = 1.0;
    fixtureDef.filter.categoryBits = 0x0002;
    fixtureDef.filter.maskBits = 0xFFFF^0x0002;
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

	this.actors.push(drawable);
	this.bodies.push(body);
}

Game.prototype.initWorld = function() {
	
	for(var i = 0; i < 20; i++) {
		this.randomBox();
	}

	var fWidth = this.renderer.stage.stageWidth;
	var fHeight = 100;
	var fX = this.renderer.stage.stageWidth - fWidth / 2.0;
	var fY = this.renderer.stage.stageHeight - fHeight / 2.0;

	var floorDef = new b2BodyDef();
	floorDef.position.Set(fX / Util.meterToPixel, fY / Util.meterToPixel);
	this.floor.body = this.world.CreateBody(floorDef);

	var shape = new b2PolygonShape();
	shape.SetAsBox(fWidth / 2.0 / Util.meterToPixel, fHeight / 2.0 / Util.meterToPixel);
    var fixtureDef = new b2FixtureDef();
    fixtureDef.shape = shape;
    fixtureDef.friction = 0.8;
    fixtureDef.density = 1.0;
	this.floor.body.CreateFixture(fixtureDef);

	var floorSprite = new Sprite();
	floorSprite.graphics.beginFill(0x77DD77);
	floorSprite.graphics.drawRect(-fWidth / 2.0, -fHeight / 2.0, fWidth, fHeight);
	floorSprite.graphics.endFill();

	this.floor.drawable = new Drawable(floorSprite);
	this.floor.drawable.syncWithPhys(this.floor.body);
	this.renderer.add(this.floor.drawable);

	this.lfoot = new Foot(this.world, this.renderer, {x:100/Util.meterToPixel, y:500/Util.meterToPixel});
	this.rfoot = new Foot(this.world, this.renderer, {x:120/Util.meterToPixel, y:500/Util.meterToPixel});
    this.curfoot = this.lfoot;

	//this.renderer.followActor = this.foot.drawable;
	//this.renderer.followAngle = true;
}

Game.prototype.onKD = function(e) {
}

Game.prototype.onKU = function(e) {
}

Game.prototype.onMouseDown = function(e) {
    if(this.mousetime == null) {
        this.mousetime = Util.getTimestamp();
        this.mousepos = {x: this.renderer.stage.mouseX,
            y: this.renderer.stage.mouseY};
    }
}

Game.prototype.onEF = function() {
	var curtime = Util.getTimestamp();
	var delta = curtime - this.time;
	this.time = curtime;
	this.accumulator += delta;

	this.floor.body.SetPosition(new b2Vec2(this.renderer.view.x / Util.meterToPixel,
                (this.renderer.stage.stageHeight - 50) / Util.meterToPixel));
    this.floor.drawable.syncWithPhys(this.floor.body);

    if(this.mousetime != null && Util.getTimestamp() - this.mousetime > 100 &&
            this.mousepos.y > this.renderer.stage.mouseY && 
            this.mousepos.x < this.renderer.stage.mouseX) {
        this.mousetime = null;
        var forceVec = new b2Vec2((this.renderer.stage.mouseX - this.mousepos.x) * 10,
                (this.renderer.stage.mouseY - this.mousepos.y) * 10);
        this.curfoot.body.ApplyForce(forceVec, this.curfoot.body.GetWorldCenter());
        this.curfoot = (this.curfoot == this.lfoot? this.rfoot: this.lfoot);
    }

	if (this.accumulator >= this.physStep*1000) {
		//console.log(curtime + " " + this.time + " " + delta + " " + this.accumulator + " " + this.physStep*1000);
		this.world.Step(this.physStep, 3, 3);
		this.accumulator -= this.physStep*1000;
	}

	//this.world.DrawDebugData();
	this.world.ClearForces();
	this.lfoot.update();
	this.rfoot.update();

	for(var i = 0; i < this.actors.length; i++) {
		var drawable = this.actors[i];
		var body = this.bodies[i];

		drawable.syncWithPhys(body);
	}

    this.renderer.view.x += 50 * delta/1000.0;
	this.renderer.update();
}

game = new Game();
