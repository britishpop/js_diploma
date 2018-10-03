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
    // а зачем здесь try?
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
    // а зачем здесь try?
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
    // вторая часть проверки лишняя
    if (!(actor instanceof Actor) || actor === undefined) {
      throw new Error("Для расчета пересечения можно использовать только класс Actor");
    }
    // try?
    try {
      if (this === actor) {
        return false;
      // если if заканчивается на return, то else не нужен
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
    // напишите, пожалуйста, в личном кабиненте нетологии
    // зачем вы здесь использовали slice
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
    // ?
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
    // ?
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
      // обкруглённые значения лучше записать в переменные,
      // чтобы каждый раз не округлять
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
    // есть более простой метод поиска объекта в массиве
    // (без функции обратного вызова)
    const searched = this.actors.findIndex(elem => elem === actor);
    if (searched !== -1) {
      this.actors.splice(searched, 1);
    }
  }
  noMoreActors(actorType) {
    // тут можно использовать метод,
    // который проверяет наличие объекта удовлетворяющего условию
    // и возвращает true/false
    return !(this.actors.find(elem => elem.type === actorType));
  }
  // странное значение по-умолчанию для второго аргумента
  playerTouched(obstacleType, touchedItem = 0) {
    // тут можно обратить условие, написать в if return
    // и уменьшить тем самым вложенность кода
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


// LevelParser class

class LevelParser {
  // можно добавить значение по-умолчанию
  constructor(levelObjects) {
    // через спред запись короче
    this.levelObjects = Object.assign({}, levelObjects);
  }
  actorFromSymbol(symbol) {
    return this.levelObjects[symbol];
  }
  obstacleFromSymbol(symbol) {
    if (symbol === "x") {
      return "wall";
    // else тут не нужен
    } else if (symbol === "!") {
      return "lava";
    // лишняя ветка кода, фукнция и так вернёт undefined,
    // если не указано иное
    } else {
      return undefined;
    }
  }
  createGrid(gridArr) {
    return gridArr.map(row => row.split('').map(cell => this.obstacleFromSymbol(cell)));
  }
  createActors(actorArr) {
    // форматирование
  const actors = [];
    // высший пилотаж — это использовать тут reduce
  actorArr.forEach((row, rowIndex) => {
    row.split('').forEach((cell, cellIndex) => {
      const actorClass = this.actorFromSymbol(cell);
      if (typeof actorClass === 'function') {
        const actor = new actorClass(new Vector(cellIndex, rowIndex));
        if (actor instanceof Actor) {
          actors.push(actor);
        }
      }
    });
  });
  return actors;
  }
  parse(plan) {
    return new Level(this.createGrid(plan), this.createActors(plan));
  }
}


// Fireball class

class Fireball extends Actor {
  constructor(pos = new Vector(0,0), speed = new Vector(0,0)) {
    super(pos, new Vector(1,1), speed);
  }
  get type() {
    return 'fireball';
  }
  getNextPosition(time = 1) {
    return this.pos.plus(this.speed.times(time));
  }
  handleObstacle() {
    this.speed = this.speed.times(-1);
  }
  act(time, level) {
    const newPos = this.getNextPosition(time);
    if (level.obstacleAt(newPos, this.size)) {
        this.handleObstacle();
    } else {
        this.pos = newPos;
    }
  }
}


// HorizontalFireball class

class HorizontalFireball extends Fireball {
  constructor(pos = new Vector(0,0)) {
    super(pos, new Vector(2,0));
  }
}


// VerticalFireball class

class VerticalFireball extends Fireball {
  constructor(pos = new Vector(0,0)) {
    super(pos, new Vector(0,2));
  }
}


// FireRain class

class FireRain extends Fireball {
  constructor(pos = new Vector(0,0)) {
    super(pos, new Vector(0,3));
    this.startPosition = pos;
  }
  handleObstacle() {
    this.pos = this.startPosition;
  }
}


// Coin class

class Coin extends Actor{
  constructor(pos = new Vector(0,0)) {
    super(pos.plus(new Vector(0.2,0.1)), new Vector(0.6,0.6), new Vector(0,0));
    this.springSpeed = 8;
    this.springDist = 0.07;
    // Math.random принимает 1 аргумент
    this.spring = Math.random(Math.PI * 2, 0);
    this.startPosition = this.pos;
  }
  get type() {
    return 'coin';
  }
  updateSpring(time = 1) {
    this.spring = this.spring + this.springSpeed * time;
  }
  getSpringVector() {
    return new Vector(0, Math.sin(this.spring) * this.springDist);
  }
  getNextPosition(time = 1) {
    this.updateSpring(time);
    return this.startPosition.plus(this.getSpringVector());
  }
  act(time) {
    this.pos = this.getNextPosition(time);
  }
}


// Player class

class Player extends Actor{
  constructor(pos = new Vector(0,0)) {
    super(pos.plus(new Vector(0,-0.5)), new Vector(0.8,1.5), new Vector(0,0));
  }
  get type() {
    return 'player';
  }
}


// Game

const schemas = [
  [
    '         ',
    '         ',
    '    =    ',
    ' o     o ',
    '     !xxx',
    ' @ o     ',
    'xxx!     ',
    '         '
  ],
  [
    '      v  ',
    '         ',
    '  v      ',
    '        o',
    '        x',
    '@   x    ',
    'x        ',
    '         '
  ]
];
const actorDict = {
    '@': Player,
    'v': FireRain,
    'o': Coin,
    '=': HorizontalFireball,
    '|': VerticalFireball
} // точка с запятой :)
const parser = new LevelParser(actorDict);
runGame(schemas, parser, DOMDisplay)
  .then(() => console.log('Вы выиграли приз!'));
