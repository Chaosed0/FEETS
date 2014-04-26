
function Renderer(canvasId) {
    this.stage = new Stage(canvasId);
    this.view = {x: this.stage.stageWidth/2.0,
        y: this.stage.stageHeight/2.0,
        angle: 0};

	this.nextActorId = 0;
    this.actors = {};

    this.followActor = null;
	this.followAngle = false;
}

Renderer.prototype.add = function(drawable) {
    this.stage.addChild(drawable.sprite);
    this.actors[this.nextActorId] = drawable;
	drawable.id = this.nextActorId++;
}

Renderer.prototype.remove = function(drawable) {
    this.stage.removeChild(drawable.sprite);
    delete this.actors[drawable.id];
}

Renderer.prototype.setCenter = function(x, y) {
    this.view.x = x;
    this.view.y = y;
}

Renderer.prototype.setAngle = function(angle) {
    this.view.angle = angle;
}

Renderer.prototype.update = function() {
    if(this.followActor != null) {
        this.setCenter(this.followActor.x, this.followActor.y);
		if(this.followAngle == true) {
			this.view.angle = this.followActor.angle;
		}
    }

    for(var i in this.actors) {
		if(this.actors.hasOwnProperty(i)) {
			var actor = this.actors[i];
			var xpos = actor.x - this.view.x;
			var ypos = actor.y - this.view.y;
			var angle = actor.angle - this.view.angle;

			var r = Math.sqrt(xpos*xpos + ypos*ypos);
			var theta = Math.atan2(ypos, xpos) - this.view.angle * Util.degToRad;
			
			xpos = r * Math.cos(theta);
			ypos = r * Math.sin(theta);

			actor.sprite.x = xpos + this.stage.stageWidth/2.0;
			actor.sprite.y = ypos + this.stage.stageHeight/2.0;
			actor.sprite.rotation = angle;
		}
    }

    var a = 0;
}
