'use strict';


// Vector class

class Vector {
  constructor (x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  plus(vector) {
    if (!(vector instanceof Vector)) {
      throw new Error("Можно прибавлять к вектору только вектор типа Vector");
    }
    try {
      return new Vector (this.x + vector.x, this.y + vector.y);
    }
    catch(err) {
      console.log(err);
    }
  }
  times(multiplier = 1) {
    return new Vector (this.x * multiplier, this.y * multiplier);
  }
}


// Actor class

class Actor {
  constructor(pos = new Vector(0,0),
              size = new Vector (1,1),
              speed = new Vector (0,0)) {
    if (!(pos instanceof Vector) ||
        !(size instanceof Vector) ||
        !(speed instanceof Vector)) {
      throw new Error("Для создания Actor можно использовать только объект типа Vector");
    }
    try {
      this.pos = pos;
      this.size = size;
      this.speed = speed;
    }
    catch(err) {
      console.log(err);
    }
  }

  get type() {
    return 'actor';
  }

  get left() {
    return this.pos.x;
  }

  get top() {
    return this.pos.y;
  }

  get right() {
    return this.pos.x + this.size.x;
  }

  get bottom() {
    return this.pos.y + this.size.y;
  }

  act() {};

  isIntersect(actor) {
    if (!(actor instanceof Actor) || actor === undefined) {
      throw new Error("Для расчета пересечения можно использовать только класс Actor");
    }
    try {
      if (this === actor) {
        return false;
      } else {
        return this.right > actor.left && this.left < actor.right &&
               this.bottom > actor.top && this.top < actor.bottom;
      }
    }
    catch(err) {
      console.log(err);
    }
  }
}


// Level class

class Level {
  constructor(grid = [], actors = []) {
    this.grid = grid.slice();
    this.actors = actors.slice();
    this.height = this.grid.length;
    this.width = Math.max(0, ...this.grid.map(cell => cell.length));
    this.player = actors.find(elem => elem.type === 'player')
    this.status = null;
    this.finishDelay = 1;
  }

  isFinished() {
    return this.status !== null && this.finishDelay < 0;
  }
  actorAt(actor) {
    if (!(actor instanceof Actor) || actor === undefined) {
      throw new Error("Для расчета пересечения можно использовать только класс Actor");
    }
    try {
      return this.actors.find(elem => actor.isIntersect(elem));
    } catch (err) {
      console.log(err);
    }
  }
  obstacleAt(actorPosition, actorSize) {
    if (!(actorPosition instanceof Vector) || !(actorSize instanceof Vector)) {
      throw new Error("Для расчета препятствий можно использовать только класс Vector");
    }
    try {
      const topBorder = actorPosition.y;
      const rightBorder = actorPosition.x + actorSize.x;
      const bottomBorder = actorPosition.y + actorSize.y;
      const leftBorder = actorPosition.x;

      if (leftBorder < 0 || topBorder < 0 || rightBorder > this.width) {
        return 'wall'
      }
      if (bottomBorder > this.height) {
        return 'lava';
      }
      for (let y = Math.floor(topBorder); y < Math.ceil(bottomBorder); y++) {
        for (let x = Math.floor(leftBorder); x < Math.ceil(rightBorder); x++) {
          const fieldType = this.grid[y][x];
          if (fieldType) {
            return fieldType;
          }
        }
      }
    } catch(err) {
      console.log(err);
    }
  }
  removeActor(actor) {
    const searched = this.actors.findIndex(elem => elem === actor);
    if (searched !== -1) {
      this.actors.splice(searched, 1);
    }
  }
  noMoreActors(actorType) {
    return !(this.actors.find(elem => elem.type === actorType));
  }
  playerTouched(obstacleType, touchedItem = 0) {
    if (this.status === null) {
      if (obstacleType === "lava" || obstacleType === "fireball") {
        this.status = "lost";
      } else if (obstacleType === "coin" && touchedItem.type === "coin"){
        this.removeActor(touchedItem);
        if (this.noMoreActors("coin")) {
          this.status = "won";
        }
      }
    }
  }
}

const grid = [
  [undefined, undefined],
  ['wall', 'wall']
];

function MyCoin(title) {
  this.type = 'coin';
  this.title = title;
}
MyCoin.prototype = Object.create(Actor);
MyCoin.constructor = MyCoin;

const goldCoin = new MyCoin('Золото');
const bronzeCoin = new MyCoin('Бронза');
const player = new Actor();
const fireball = new Actor();

const level = new Level(grid, [ goldCoin, bronzeCoin, player, fireball ]);

level.playerTouched('coin', goldCoin);
level.playerTouched('coin', bronzeCoin);

if (level.noMoreActors('coin')) {
  console.log('Все монеты собраны');
  console.log(`Статус игры: ${level.status}`);
}

const obstacle = level.obstacleAt(new Vector(1, 1), player.size);
if (obstacle) {
  console.log(`На пути препятствие: ${obstacle}`);
}

const otherActor = level.actorAt(player);
if (otherActor === fireball) {
  console.log('Пользователь столкнулся с шаровой молнией');
}
