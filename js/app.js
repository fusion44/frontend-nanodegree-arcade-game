var SHOW_BOUNDING_RADIUS = false;
function handleDebugCheckBox (cb) {
  SHOW_BOUNDING_RADIUS = cb.checked;
}
var Vec2 = function (x, y) {
  this.x = x;
  this.y = y;
};

Vec2.prototype.dist = function (o) {
  var xd = this.x - o.x;
  var yd = this.y - o.y;
  return Math.sqrt(xd * xd + yd * yd);
};

/**
 * Updates the UI after certain events
 */
function updateUI () {
  var scoreElem = document.getElementById('score');
  scoreElem.textContent = player.score;
}

// Scenario vars
var ROW_BASE = 60;
var ROW_HEIGHT = 83;

// Where enemies start upon reset
var ENEMY_START_POS_X = -140;
// Where enemies are reset
var ENEMY_RESET_POS_X = 500;

var PLAYER_START_POSITION = function () {
  return new Vec2(202, ROW_BASE + ROW_HEIGHT * 4)
};

function getRandomInt (min, max) {
  // See MDN
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

var Actor = function (loc) {
  this.loc = loc;
  this.boundingRadius = 35;
};

// Draw the enemy on the screen, required method for game
Actor.prototype.render = function () {
  ctx.drawImage(Resources.get(this.sprite), this.loc.x, this.loc.y);

  if (SHOW_BOUNDING_RADIUS) {
    ctx.beginPath();
    ctx.arc(this.loc.x + 50.1, this.loc.y + 105.5, this.boundingRadius, 0, 360);
    ctx.strokeStyle = "#FF0000";
    ctx.stroke();
  }
};

Actor.prototype.checkCollision = function (otherActor) {
  var collisionDistance =
      this.boundingRadius + otherActor.boundingRadius;
  return this.loc.dist(otherActor.loc) < collisionDistance;
};

// Enemies our player must avoid
var Enemy = function (loc) {
  Actor.call(this, loc);
  this.sprite = 'images/enemy-bug.png';
  this.speed = getRandomInt(90, 500);
};
Enemy.prototype = Object.create(Actor.prototype);
Enemy.prototype.constructor = Enemy;

/**
 * Updates the objects state
 *
 * @param dt Delta time since last update
 */
Enemy.prototype.update = function (dt) {
  this.loc.x += this.speed * dt;
  if (this.loc.x > ENEMY_RESET_POS_X) {
    this.reset()
  }
};

/**
 * Reset position of this object
 */
Enemy.prototype.reset = function () {
  this.loc.x = ENEMY_START_POS_X;
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function (loc) {
  Actor.call(this, loc);
  this.sprite = 'images/char-boy.png';
  this.score = 0;
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

/**
 * Reset the player object and update the score
 */
Player.prototype.die = function () {
  this.loc = PLAYER_START_POSITION();
  this.score--;
  updateUI();
};

/**
 * Reset the player object and update the score
 */
Player.prototype.win = function () {
  this.loc = PLAYER_START_POSITION();
  this.score++;
  updateUI();
};

/**
 * Check for collisions and update
 * the player objects state
 */
Player.prototype.update = function () {
  allEnemies.forEach(function (p1) {
    if (this.checkCollision(p1)) {
      this.die();
    }
  }, this);
  if (this.loc.y < 0) {
    this.win();
  }
};

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var allEnemies = [
  new Enemy(new Vec2(0, ROW_BASE)),
  new Enemy(new Vec2(0, ROW_BASE + ROW_HEIGHT)),
  new Enemy(new Vec2(0, ROW_BASE + ROW_HEIGHT * 2))
];
var player = new Player(PLAYER_START_POSITION());

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
