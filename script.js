// jshint esversion:6
// jshint browser: true
var thecircle;
var objects = [];
var landscape = [];
var background = [];
var inAir = true;
var singlejump = false;
var doublejump = false;
var surface;
var isLanded;
var settings = {
	soundlevel: 0.2,
	movingspeed: 5,
	jumpspeed: 10,
	fallspeed: 0.3,
	scrollspeed: 1,
	backgroundscrollfactor: 0.5,
	fps: 120,
	crash: true,
	difficulty: 1,
	rate: {
		landscape: 275,
		background: 130,
		objects: 200
	}
};
const sound = {
	jump: new Audio("http://borussiamuenster.de/tweakimp/tloc/jump.wav"),
	doublejump: new Audio("http://borussiamuenster.de/tweakimp/tloc/doublejump.wav"),
	gameover: new Audio("http://borussiamuenster.de/tweakimp/tloc/gameover.wav"),
	music: new Audio("http://borussiamuenster.de/tweakimp/tloc/backgroundmusic.mp3")
};
const keys = {
	leftArrow: 37,
	upArrow: 38,
	rightArrow: 39,
	downArrow: 40
};

function startGame() {
	thecircle = new charConstructor(30, 30, 25, "blue");
	soundsettings();
	gameArea.start();
}
var gameArea = {
	width: 1300,
	height: 800,
	canvas: document.createElement("canvas"),
	start: function () {
		this.canvas.width = gameArea.width;
		this.canvas.height = gameArea.height;
		this.context = this.canvas.getContext("2d");
		document.body.insertBefore(this.canvas, document.body.childNodes[0]);
		this.framecounter = 0;
		this.interval = setInterval(updateGameArea, 1000 / settings.fps);
		window.addEventListener("keydown", function (e) {
			gameArea.keys = gameArea.keys || [];
			gameArea.keys[e.keyCode] = true;
		});
		window.addEventListener("keyup", function (e) {
			gameArea.keys[e.keyCode] = false;
		});
	},
	clear: function () {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	},
	stop: function () {
		clearInterval(this.interval);
	},
	time: function () {
		return Math.round(gameArea.framecounter / 25);
	}
};
function charConstructor(x, y, width, color) {
	this.width = width;
	this.radius = width / 2;
	this.speedY = 1;
	this.speedX = 0;
	this.x = x;
	this.y = y;
	this.health = 3;
	this.update = function () {
		var ctx = gameArea.context;
		var gradient = ctx.createRadialGradient(this.x + this.radius / 3, this.y - this.radius / 3, this.radius / 6, this.x, this.y, this.radius);
		gradient.addColorStop(0, "#51a4f6");
		gradient.addColorStop(0.9, "#053b76");
		gradient.addColorStop(1, "#030f1c");
		ctx.fillStyle = gradient;
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
		ctx.fill();
	};
	this.newPos = function () {
		this.x += this.speedX;
		this.y += this.speedY;
	};
	this.crashWith = function (otherobj) {
		var myleft = this.x - this.radius;
		var myright = this.x + this.radius;
		var mytop = this.y - this.radius;
		var mybottom = this.y + this.radius;
		var otherleft = otherobj.x;
		var otherright = otherobj.x + otherobj.width;
		var othertop = otherobj.y;
		var otherbottom = otherobj.y + otherobj.height;
		var crash = true;
		if (mybottom < othertop || mytop > otherbottom	/* drunter */ || myright < otherleft	/* links */ || myleft > otherright) {
			/* rechts */
			crash = false;
		}
		return crash;
	};
	this.landOn = function (otherobj) {
		var myleft = this.x - this.radius;
		var myright = this.x + this.radius;
		var mybottom = this.y + this.radius;
		var otherleft = otherobj.x;
		var otherright = otherobj.x + otherobj.width;
		var othertop = otherobj.y;
		// is over
		if (myright > otherleft && myleft < otherright && mybottom < othertop) {
			// passes in next frame
			if (mybottom + this.speedY >= othertop) {
				return true;
			}
		} else {
			return false;
		}
	};
}
function landConstructor() {
	this.width = 250;
	this.height = random(50, gameArea.height / 2);
	this.speedY = 0;
	this.speedX = -1 * settings.scrollspeed;
	this.x = gameArea.width;
	this.y = gameArea.height - this.height;
	this.update = function () {
		var ctx = gameArea.context;
		var gradient = ctx.createLinearGradient(150, 0, 150, 800);
		gradient.addColorStop(0, "rgba(0, 150, 0, 1)");
		gradient.addColorStop(1, "rgba(0, 120, 0, 1)");
		ctx.fillStyle = gradient;
		ctx.fillRect(this.x, this.y, this.width, this.height);	// this.speedX = -1 * settings.scrollspeed;
	};
	this.newPos = function () {
		this.x += this.speedX;
		this.y += this.speedY;
	};
}
function objConstructor() {
	this.width = 30;
	this.height = 30;
	this.speedY = 0;
	this.speedX = -1 * random(7, 10) / 10 * settings.scrollspeed;
	this.x = gameArea.width;
	this.y = random(50, gameArea.height - 50);
	var myArray = [
		1,
		1,
		1,
		1,
		1,
		2
	];
	var rand = myArray[Math.floor(Math.random() * myArray.length)];
	this.type = rand;
	// marians alternative
	// var myArray = [1,1,2];    
	// var rand = myArray[Math.floor(Math.random() * myArray.length)];
	this.update = function () {
		var ctx;
		ctx = gameArea.context;
		if (this.type === 1) {
			ctx.fillStyle = "black";
		}
		if (this.type === 2) {
			ctx.fillStyle = "red";
		}
		ctx.fillRect(this.x, this.y, this.width, this.height);	// this.speedX = -1 * (random(7, 10)) / 10 * settings.scrollspeed;
	};
	this.newPos = function () {
		this.x += this.speedX;
		this.y += this.speedY;
	};
}
function backgroundConstructor() {
	this.width = 75;
	this.height = random(50, gameArea.height - 50);
	this.speedY = 0;
	this.speedX = -1 * settings.backgroundscrollfactor * settings.scrollspeed;
	this.x = gameArea.width;
	this.y = gameArea.height - this.height;
	this.update = function () {
		var ctx = gameArea.context;
		var gradient = ctx.createLinearGradient(150, 0, 150, 800);
		gradient.addColorStop(0, "rgba(255, 199, 0, 0.700)");
		gradient.addColorStop(1, "rgba(255, 042, 0, 0.700)");
		ctx.fillStyle = gradient;
		ctx.fillRect(this.x, this.y, this.width, this.height);	//this.speedX = -1 * settings.backgroundscrollfactor * settings.scrollspeed;
	};
	this.newPos = function () {
		this.x += this.speedX;
		this.y += this.speedY;
	};
}
function move() {
	// move left
	if (gameArea.keys && gameArea.keys[keys.leftArrow]) {
		// left border
		if (thecircle.x <= thecircle.radius) {
			thecircle.speedX = 0;
			thecircle.x = thecircle.radius;
		} else {
			thecircle.speedX = -1 * settings.movingspeed;
		}
	}
	// move right
	if (gameArea.keys && gameArea.keys[keys.rightArrow]) {
		// right border
		if (thecircle.x >= gameArea.width - thecircle.radius) {
			thecircle.speedX = 0;
			thecircle.x = gameArea.width - thecircle.radius;
		} else {
			thecircle.speedX = settings.movingspeed;
		}
	}
	// in air
	if (inAir === true) {
		// apply gravity
		thecircle.speedY += settings.fallspeed;
		// land on ground
		if (thecircle.y + thecircle.radius > gameArea.height) {
			thecircle.y = gameArea.height - thecircle.radius;
			thecircle.speedY = 0;
			inAir = false;
			// reset jumps
			singlejump = false;
			doublejump = false;
		}
		// land on landscape
		if (thecircle.speedY > 0) {
			var land;
			for (land of landscape) {
				if (thecircle.landOn(land)) {
					thecircle.y = gameArea.height - thecircle.radius - land.height;
					thecircle.speedY = 0;
					inAir = false;
					isLanded = true;
					surface = land;
					// reset jumps
					singlejump = false;
					doublejump = false;
				}
			}
		}
	}
	// falling off landscape
	if (isLanded === true && (thecircle.x < surface.x || thecircle.x > surface.x + surface.width)) {
		thecircle.speedY = thecircle.speedY + settings.fallspeed;
		inAir = true;
		isLanded = false;
	}
	// single jump
	if (gameArea.keys && gameArea.keys[keys.upArrow]) {
		if (singlejump === false && inAir === false) {
			thecircle.speedY = -1 * settings.jumpspeed;
			inAir = true;
			singlejump = true;
			gameArea.keys[keys.upArrow] = false;
			sound.jump.play();
			updateDifficulty();
		}
	}
	// double jump
	if (gameArea.keys && gameArea.keys[keys.upArrow]) {
		if (singlejump === true && inAir === true && doublejump === false) {
			thecircle.speedY = -1 * settings.jumpspeed;
			doublejump = true;
			sound.doublejump.play();
		}
	}
}
function updateGameArea() {
	gameArea.clear();
	gameArea.framecounter++;
	updateBackground();
	updateLandscape();
	updateObjects();
	updateCharacter();
	updateCoordinates();
	updateCrash();
	updateInterface();	/*
    if(gameArea.time > 20){
        updateDifficulty();
        updateDifficulty();
        updateDifficulty();
        updateDifficulty();
    }
    */
}
function updateBackground() {
	if (gameArea.framecounter % settings.rate.background === 0) {
		background.push(new backgroundConstructor());
	}
	for (var i = 0; i < background.length; i++) {
		background[i].newPos();
		// delete background that is out of game area
		if (background[i].x + background[i].width < 0) {
			background.splice(i, 1);
		}
		background[i].update();
	}
}
function updateLandscape() {
	if (gameArea.framecounter % settings.rate.landscape === 0) {
		landscape.push(new landConstructor());
	}
	for (var i = 0; i < landscape.length; i++) {
		landscape[i].newPos();
		// delete landscape that is out of game area
		if (landscape[i].x + landscape[i].width < 0) {
			landscape.splice(i, 1);
		}
		landscape[i].update();
	}
}
function updateObjects() {
	if (gameArea.framecounter % settings.rate.objects === 0) {
		objects.push(new objConstructor());
	}
	for (var i = 0; i < objects.length; i++) {
		objects[i].newPos();
		// delete objects that are out of game area
		if (objects[i].x + objects[i].width < 0) {
			objects.splice(i, 1);
		}
		objects[i].update();
	}
}
function updateCharacter() {
	thecircle.speedX = 0;
	move();
	thecircle.newPos();
	thecircle.update();
}
function updateCoordinates() {
	var ctx = gameArea.context;
	ctx.font = "30px Arial";
	ctx.fillText(Math.round(thecircle.x) + ", " + Math.round(thecircle.y), 200, 50);
}
function updateCrash() {
	if (settings.crash) {
		for (var i = 0; i < objects.length; i++) {
			if (thecircle.crashWith(objects[i]) && objects[i].type === 1) {
				objects.splice(i, 1);
				thecircle.health--;
				if (thecircle.health === 0) {
					var ctx = gameArea.context;
					ctx.font = "normal 60px Impact";
					ctx.fillStyle = "black";
					ctx.textAlign = "center";
					ctx.fillText("Game over", gameArea.width / 2, gameArea.height / 2);
					sound.music.pause();
					sound.gameover.play();
					gameArea.stop();
				}
			}
			if (thecircle.crashWith(objects[i]) && objects[i].type === 2) {
				objects.splice(i, 1);
				thecircle.health++;
			}
		}
	}
}
function updateInterface() {
	var ctx = gameArea.context;
	ctx.font = "30px Tahoma";
	ctx.fillStyle = "black";
	ctx.textAlign = "center";
	ctx.fillText("Health: " + thecircle.health, gameArea.width / 2, 50);
	ctx.fillText("Time: " + gameArea.time(), gameArea.width / 2, 100);
}
function updateDifficulty() {
	settings.difficulty += 1;
	// settings.scrollspeed = settings.scrollspeed * settings.difficulty;
	// settings.rate.objects = settings.rate.objects - 20 * settings.difficulty);
}
// help functions
function random(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
function soundsettings(){
	sound.music.volume = settings.soundlevel;
	sound.music.loop = true;
	sound.music.play();
	sound.jump.volume = settings.soundlevel;
	sound.doublejump.volume = settings.soundlevel;
	sound.gameover.volume = settings.soundlevel;
}
// =============================================================================
// =============================================================================
// =============================================================================

  /*
=========
BAUSTELLE
=========
var objects =
[
//  [TypeNumber,    "Name",      ratio,    effect]
    [1,             "Obstacle",  25,       health--],
    [2,             "Health",    5,        health++],
    [3,             "PowerUp,    1,        jump speed bonus for some frames]
]

*/
  /*
==========
T0 D0 LIST
==========

KNOWN ISSUES
 - Man kann nicht unterhalb vom Landscape landen (?)
 - update Funktionen in Anzahl Objekte / Frame umschreiben


FEATURES
 - Hintergrund erzeugen, bevor das Spiel beginnt
 - Schwierigkeitsgrade erhöhen (Geschwindigkeit?)
    - Difficulty durch Geschwindigkeit
    - Difficulty durch mehr Objects
- restart button
- music function


ERLEDIGT
- Lebenspunkte einbauen
- Anzeige LP
- Bei Verlust von X LP GameOver
- LP einsammeln können
- obstacles in objects umbenennen
- Sounds 
- Ingame Zeit anzeigen

*/