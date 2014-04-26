
function Foot(world, renderer, pos) {
	this.scale = 3.0;
	//Some arbitrary numbers I figured out in gimp
	this.colWidth = 42.0 / Util.meterToPixel * this.scale;
	this.colHeight = 16.0 / Util.meterToPixel * this.scale;
	this.colOffset = new b2Vec2(10.0 / Util.meterToPixel * this.scale, 78.0 / Util.meterToPixel * this.scale);
	this.width = 128;
	this.height = 192;

	var bitmapData = new BitmapData("img/FOOT.png");
	var bitmap = new Bitmap(bitmapData);
	bitmap.x = -this.width/2.0;
	bitmap.y = -this.height/2.0;

	var sprite = new Sprite();
	sprite.addChild(bitmap);
	sprite.scaleX = this.scale;
	sprite.scaleY = this.scale;
	this.drawable = new Drawable(sprite);

	renderer.add(this.drawable);

	var bodyDef = new b2BodyDef();
	bodyDef.type = b2Body.b2_dynamicBody;
	bodyDef.position.Set(pos.x, pos.y);
	bodyDef.allowSleep = false;
	bodyDef.active = true;
	this.body = world.CreateBody(bodyDef);

	var shape = new b2PolygonShape();
	shape.SetAsOrientedBox(this.colWidth, this.colHeight, this.colOffset, 0.0);
    var fixtureDef = new b2FixtureDef();
    fixtureDef.shape = shape;
    fixtureDef.density = 1.0;
    fixtureDef.friction = 5.0;
    fixtureDef.filter.categoryBits = 0x0002;
    fixtureDef.filter.maskBits = 0xFFFF^0x0002;
	this.body.CreateFixture(fixtureDef);

	this.body.SetUserData(this);

	this.width *= this.scale;
	this.height *= this.scale;
}

Foot.prototype.update = function() {
	this.drawable.syncWithPhys(this.body);
}

Foot.prototype.ApplyForce = function(forceVec, pos) {
	const minForceX = 600.0;
	const minForceY = -600.0;
	const maxForceX = 20000.0;
	const maxForceY = -20000.0;

	forceVec.x = Math.min(Math.max(minForceX, forceVec.x), maxForceX);
	forceVec.y = Math.max(Math.min(minForceY, forceVec.y), maxForceY);

	this.body.ApplyForce(forceVec, pos);
}

Foot.prototype.Distance = function(ypos) {
	var sole = (this.body.GetPosition().y + this.colHeight + this.colOffset.y) * Util.meterToPixel;
	var ground = ypos;
	return ground - sole;
}
