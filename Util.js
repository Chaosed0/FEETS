
var Util = {
	degToRad : Math.PI / 180.0,
	radToDeg : 180.0 / Math.PI,
	meterToPixel : 25
}

Util.sign = function(number) {
	return (number?number<0?-1:1:0); 
}

if (window.performance.now) {
	console.log("Using high performance timer");
	Util.getTimestamp = function() { return window.performance.now(); };
} else {
	if (window.performance.webkitNow) {
		console.log("Using webkit high performance timer");
		Util.getTimestamp = function() { return window.performance.webkitNow(); };
	} else {
		console.log("Using low performance timer");
		Util.getTimestamp = function() { return new Date().getTime(); };
	}
}

