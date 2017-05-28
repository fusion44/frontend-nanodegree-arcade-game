var Vec2 = function (x, y) {
  this.x = x;
  this.y = y;
};

function getRandomInt (min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}


var Actor = function (loc) {
  this.loc = loc;
};

// Draw the enemy on the screen, required method for game
Actor.prototype.render = function () {
  ctx.drawImage(Resources.get(this.sprite), this.loc.x, this.loc.y);
};

// Enemies our player must avoid
var Enemy = function (loc) {
  Actor.call(this, loc);
  this.sprite = 'images/enemy-bug.png';
  this.speed = getRandomInt(90, 500);
};
Enemy.prototype = Object.create(Actor.prototype);
Enemy.prototype.constructor = Enemy;

Enemy.prototype.update = function (dt) {
  this.loc.x += this.speed * dt;
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function (loc) {
  Actor.call(this, loc);
  this.sprite = 'images/char-boy.png';
};
Player.prototype = Object.create(Actor.prototype);
Player.prototype.constructor = Player;
Player.prototype.handleInput = function (key) {
  switch (key) {
    case 'up':
      if (this.loc.y > -23)
        this.loc.y -= 83;
      break;
    case 'down':
      if (this.loc.y < 392)
        this.loc.y += 83;
      break;
    case 'right':
      if (this.loc.x < 404)
        this.loc.x += 101;
      break;
    case 'left':
      if (this.loc.x > 0)
        this.loc.x -= 101;
      break;
  }
};
Player.prototype.update = function (dt) {

};
// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var rowBase = 60;
var rowHeight = 83;
var allEnemies = [
  new Enemy(new Vec2(0, rowBase)),
  new Enemy(new Vec2(0, rowBase + rowHeight)),
  new Enemy(new Vec2(0, rowBase + rowHeight * 2))
];
var player = new Player(new Vec2(202, rowBase + rowHeight * 4));

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function (e) {
  var allowedKeys = {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down'
  };

  player.handleInput(allowedKeys[e.keyCode]);
});
