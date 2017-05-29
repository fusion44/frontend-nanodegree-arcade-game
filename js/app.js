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
  scoreElem.textContent = 'Score: ' + player.score;
  var starElem = document.getElementById('stars');
  starElem.textContent = 'Stars: ' + player.stars;
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

/**
 * Resets all actors that are not the player class
 * e.g.: Enemies and Collectibles
 */
function resetNonPlayerActors () {
  allEnemies.forEach(function (enemy) {
    enemy.reset();
  });

  allCollectibles.forEach(function (collectible) {
    collectible.reset();
  });
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

/**
 * Enum to hold all available collectible types.
 *
 * @type {{STAR: number}}
 */
var COLLECTIBLES = {
  STAR: 1
};
/**
 * Collectible class. Represents actors that can be collected
 * by the player.
 * @param loc Locations of the collectible
 * @param type @type of the collectible
 * @constructor
 */
var Collectible = function (loc, type) {
  Actor.call(this, loc);
  this.type = type;
  this.collected = false;
  switch (type) {
    case COLLECTIBLES.STAR:
      this.sprite = 'images/Star.png';
      break;
    default:
      console.log("No collectible type given");
  }
};
Collectible.prototype = Object.create(Actor.prototype);
Collectible.prototype.constructor = Collectible;
/**
 * Handles all things that should happen when this item is collected
 */
Collectible.prototype.collect = function () {
  this.collected = true;
};

/**
 * Render only if not already collected
 */
Collectible.prototype.render = function () {
  if (!this.collected) {
    Actor.prototype.render.call(this);
  }
};

/**
 * Reset state of this enemy
 */
Collectible.prototype.reset = function () {
  this.collected = false;
  this.loc.x = getRandomInt(0, 5) * 101;
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
 * Reset state of this instance
 */
Enemy.prototype.reset = function () {
  this.loc.x = ENEMY_START_POS_X;
  this.speed = getRandomInt(90, 500);
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function (loc) {
  Actor.call(this, loc);
  this.sprite = 'images/char-boy.png';
  this.score = 0;
  this.stars = 0;
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
  this.stars -= 3; // Challenge++ remove 3 stars upon death
  resetNonPlayerActors();
  updateUI();
};

/**
 * Reset the player object and update the score
 */
Player.prototype.win = function () {
  this.loc = PLAYER_START_POSITION();
  this.score++;
  // this.stars = 0; Do not reset stars here. Player should be able to collect as much as he wants. At least until next reload ...
  resetNonPlayerActors();
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
  allCollectibles.forEach(function (collectible) {
    if (!collectible.collected && this.checkCollision(collectible)) {
      collectible.collect();
      this.stars++;
      updateUI();
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

var allCollectibles = [
  new Collectible(new Vec2(getRandomInt(0, 5) * 101, ROW_BASE), COLLECTIBLES.STAR),
  new Collectible(new Vec2(getRandomInt(0, 5) * 101, ROW_BASE + ROW_HEIGHT), COLLECTIBLES.STAR),
  new Collectible(new Vec2(getRandomInt(0, 5) * 101, ROW_BASE + ROW_HEIGHT * 2), COLLECTIBLES.STAR)
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
