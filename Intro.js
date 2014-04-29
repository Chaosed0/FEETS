
function Intro() {
	const imgsize = {x:1000, y:400};
	var nextup = false;

	var sprite = new Sprite();
	
	var white1 = new Sprite();
	var white2 = new Sprite();
	var current = 0;

	var title = null;

	var storyboard = [
		{
			img: white1,
			time: 0,
			pan:0,
			scale:0,
			shake:0,
			delay:0,
			fadeout:2000
		},
		{
			img: new Bitmap(new BitmapData("img/desert.png")),
			time: 4000,
			pan:0.1,
			scale:0,
			shake:0,
			delay:0,
			fadeout:2000
		},
		{
			img: new Bitmap(new BitmapData("img/penta.png")),
			time: 4000,
			pan:0,
			scale:1.2,
			shake:0,
			delay:0,
			fadeout:2000
		},
		{
			img: new Bitmap(new BitmapData("img/hoodman.png")),
			time: 4000,
			pan:0,
			scale:0,
			shake:0.02,
			delay:1000,
			fadeout:0
		},
		{
			img: new Bitmap(new BitmapData("img/desert.png")),
			time:2000,
			pan:0,
			scale:0,
			shake:0.01,
			delay:0,
			fadeout: 0
		},
		{
			img: white2,
			time: 0,
			pan:0,
			scale:0,
			shake:0,
			delay:0,
			fadeout:3000
		},
		{
			img: new Bitmap(new BitmapData("img/deserthand.png")),
			time:1,
			pan:0,
			scale:0,
			shake:0,
			delay:0,
			fadeout: 0
		},
	];

	var timer = 0;
	var current = 0;

	var center = null;

	this.init = function(stage) {
		white1.graphics.beginFill(0xFFFFFF, 1.0);
		white1.graphics.drawRect(0, 0, stage.stageWidth, stage.stageHeight);
		white1.graphics.endFill();
		white2.graphics.beginFill(0xFFFFFF, 1.0);
		white2.graphics.drawRect(0, 0, stage.stageWidth, stage.stageHeight);
		white2.graphics.endFill();

		center = {x:stage.stageWidth/2.0,
			y:stage.stageHeight/2.0};

		var tf = new TextFormat();
		tf.size = 40;
		tf.bold = true;
		tf.color = 0x000000;
		title = new Sprite();
		var titleText = new TextField();
		titleText.text = "FEETS\n\nPress any key";
		titleText.setTextFormat(tf);
		titleText.width = 300;
		titleText.height = 150;
		titleText.x = -titleText.width/2.0;
		titleText.y = -titleText.height/2.0;
		title.addChild(titleText);

		for(var i = storyboard.length - 1; i >= 0; --i) {
			var board = storyboard[i];
			var bitmap = board.img;
			var scale = (stage.stageWidth + imgsize.x * board.pan)/imgsize.x;

			if(bitmap != white1 && bitmap != white2) {
				bitmap.scaleY = scale;
				bitmap.scaleX = scale;
			}
			bitmap.x = -imgsize.x * scale/2.0;
			bitmap.y = -imgsize.y * scale/2.0;
			bitmap.alpha = 0.0;

			board.shake = {x:board.shake * stage.stageWidth,
				y:board.shake * stage.stageHeight};
			board.initscale = scale;
			board.initpos = {x:bitmap.x, y:bitmap.y};
			sprite.addChild(board.img);
		}

		sprite.x = center.x;
		sprite.y = center.y;

		storyboard[0].img.alpha = 1.0;
		nextup = true;
		stage.addChild(sprite);
		timer = 0;
	}

	this.update = function(delta) {
		var board = storyboard[current];
		var totaltime = board.time + board.fadeout
		timer += delta;	

		//pan & scale
		var fraction = timer / totaltime;
		board.img.x -= imgsize.x*board.pan * delta/totaltime;
		if(board.scale != 0) {
			var scale = (board.scale-1) * fraction * board.initscale;
			board.img.scaleX = board.initscale + scale;
			board.img.scaleY = board.img.scaleX;
			board.img.x = -imgsize.x * (board.initscale + scale) / 2.0;
			board.img.y = -imgsize.y * (board.initscale + scale) / 2.0;
		}

		//shake
		if(timer > board.delay && board.shake.x != 0 && board.shake.y != 0) {
			board.img.x = board.initpos.x + Util.random(-board.shake.x, board.shake.x);
			board.img.y = board.initpos.y + Util.random(-board.shake.y, board.shake.y);
		}

		if(current < storyboard.length-1 && timer > board.time) {
			if(!nextup) {
				storyboard[current+1].img.alpha = 1.0;
				nextup = true;
			}

			if(timer > totaltime) {
				//next board
				nextup = false;
				sprite.removeChild(board.img);
				timer = 0;
				current++;
			} else {
				//fadeout
				var fadeouttime = timer - board.time;
				board.img.alpha = 1 - fadeouttime / board.fadeout;
			}
		} else if (current >= storyboard.length-1) {
			title.x = sprite.x*0.5;
			title.y = -sprite.y*0.4;
			sprite.addChild(title);
		}
	}

	this.remove = function(stage) {
		for(var i = storyboard.length - 1; i >= 0; --i) {
			var board = storyboard[i];
			sprite.removeChild(board.img);
			stage.removeChild(sprite);
		}

	}
}
