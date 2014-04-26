
function Foot(world, renderer, pos) {
	var bitmap = new Bitmap(new BitmapData("img/FOOT.png"));
	//INCREDIBLY ARBITRARY NUMBERS
	bitmap.x = -64;
	bitmap.y = -96;
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
	//INCREDIBLY ARBITRARY NUMBERS
	shape.SetAsOrientedBox(42.0 / Util.meterToPixel, 16.0 / Util.meterToPixel,
			new b2Vec2(10.0 / Util.meterToPixel, 80.0 / Util.meterToPixel), 0.0);
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
