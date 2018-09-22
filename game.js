'use strict';

// Vector class

class Vector {
  constructor (x = 0, y = 0) {
    this.x = x;
    this.y = y;
    this.plus = function(vector) {
      if (!(vector instanceof Vector)) {
        throw ("Можно прибавлять к вектору только вектор типа Vector");
      }
      try {
        return new Vector (this.x + vector.x, this.y + vector.y);
      }
      catch(err) {
        console.log(err)
      }
    }
    this.times = function(multiplier = 1) {
      return new Vector (this.x * multiplier, this.y * multiplier);
    }
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
      throw ("Можно использовать только вектор типа Vector");
    }
    try {
      this.pos = pos;
      this.size = size;
      this.speed = speed;
    }
    catch(err) {
      console.log(err);
    }

    Object.defineProperties(this, {
      "left": {
        value: this.pos.x,
        writable: false
      },
      "top": {
        value: this.pos.y,
        writable: false
      },
      "right": {
        value: this.pos.x + this.size.x,
        writable: false
      },
      "bottom": {
        value: this.pos.x + this.size.y,
        writable: false
      },
    })

    this.type = "actor";
    this.act = function () {};
    this.isIntersect = function(object = false) {
      if (!(object instanceof Actor) || (object === false)) {
        throw ("Для расчета пересечения можно использовать только класс Actor");
      }
      try {
        if (this === object) {
          return false;
        } else {
          return this.top === object.top && this.right === object.right &&
                 this.bottom === object.bottom && this.left === object.left;
        }
      }
      catch(err) {
        console.log(err);
      }
    }
  }
}


const items = new Map();
const player = new Actor();
items.set('Игрок', player);
items.set('Первая монета', new Actor(new Vector(10, 10)));
items.set('Вторая монета', new Actor(new Vector(15, 5)));

function position(item) {
  return ['left', 'top', 'right', 'bottom']
    .map(side => `${side}: ${item[side]}`)
    .join(', ');
}

function movePlayer(x, y) {
  player.pos = player.pos.plus(new Vector(x, y));
}

function status(item, title) {
  console.log(`${title}: ${position(item)}`);
  if (player.isIntersect(item)) {
    console.log(`Игрок подобрал ${title}`);
  }
}

items.forEach(status);
movePlayer(10, 10);
items.forEach(status);
movePlayer(5, -5);
items.forEach(status);
