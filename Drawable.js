
function Drawable(sprite) {
    this.x = 0;
    this.y = 0;
    this.angle = 0;
    this.sprite = sprite;
}

Drawable.prototype.syncWithPhys = function(body) {
    var pos = body.GetPosition();
    var angle = body.GetAngle();
    this.x = pos.x * Util.meterToPixel;
    this.y = pos.y * Util.meterToPixel;
    this.angle = angle * Util.radToDeg;
}
