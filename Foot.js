
function Foot(world, renderer, pos) {
	//Some arbitrary numbers I figured out in gimp
	const colWidth = 42.0 / Util.meterToPixel;
	const colHeight = 16.0 / Util.meterToPixel;
	const colOffset = new b2Vec2(10.0 / Util.meterToPixel, 80.0 / Util.meterToPixel);
	this.width = 128;
	this.height = 192;

	var bitmapData = new BitmapData("img/FOOT.png");
	var bitmap = new Bitmap(bitmapData);
	/* ???
	 * bitmap.x = -bitmapData.width/2.0;
	 * bitmap.y = -bitmapData.height/2.0; */
	bitmap.x = -this.width/2.0;
	bitmap.y = -this.height/2.0;

	var sprite = new Sprite();
	sprite.addChild(bitmap);
	this.drawable = new Drawable(sprite);

	renderer.add(this.drawable);

	var bodyDef = new b2BodyDef();
	bodyDef.type = b2Body.b2_dynamicBody;
	bodyDef.position.Set(pos.x, pos.y);
	bodyDef.allowSleep = false;
	bodyDef.active = true;
	this.body = world.CreateBody(bodyDef);

	var shape = new b2PolygonShape();
	shape.SetAsOrientedBox(colWidth, colHeight, colOffset, 0.0);
    var fixtureDef = new b2FixtureDef();
    fixtureDef.shape = shape;
    fixtureDef.density = 1.0;
    fixtureDef.friction = 5.0;
    fixtureDef.filter.categoryBits = 0x0002;
    fixtureDef.filter.maskBits = 0xFFFF^0x0002;
	this.body.CreateFixture(fixtureDef);
}

Foot.prototype.update = function() {
	this.drawable.syncWithPhys(this.body);
}

Foot.prototype.ApplyForce = function(forceVec, pos) {
	const minForceX = 600.0;
	const minForceY = -600.0;

	forceVec.x = Math.max(minForceX, forceVec.x);
	forceVec.y = Math.min(minForceY, forceVec.y);

	this.body.ApplyForce(forceVec, pos);
}
