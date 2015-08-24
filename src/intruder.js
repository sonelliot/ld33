import {Character} from './character.js';

export class Intruder extends Character {
  constructor(game, position={x:0, y:0}) {
    super(game, 'intruder', position);
    this.speed = 50;1
    this.locations = {};
  }

  update() {
    super.update();

    this.updateWin();
    this.updateLose();
    this.updatePath();
    this.updateVisible();
    this.updateSpeed();
  }

  updateSpeed() {
    let position = this.sprite.main.position;
    let closest = this.closest(position, this.game.guards.map(
      g => g.sprite.main.position));
    let dist = Phaser.Point.distance(position, closest);
    if (dist < 150) {
      this.speed = 120.0
    }
    else {
      this.speed = 50.0
    }
  }

  updateWin() {
    let position = this.sprite.main.position;
    let closest = this.closest(position, this.game.guards.map(
      g => g.sprite.main.position));
    let dist = Phaser.Point.distance(position, closest);
    if (dist < 50) {
      this.game.actions.win();
    }
  }

  updateLose() {
    let position = this.sprite.main.position;
    let {level: {exits}} = this.game;
    let exit = this.closest(position, exits);
    let dist = Phaser.Point.distance(position, exit);
    if (dist < 50) {
      this.game.actions.lose();
    }
  }

  updatePath() {
    let {level} = this.game;
    let position = this.sprite.main.position;
    let dest = this.selectDestination();
    level.path(position, dest, path => {
      if (path === null)
        return;
      this.path = path.splice(1);
    });
  }

  updateVisible() {
    let position = this.sprite.main.position;
    let closest = this.closest(position, this.game.guards.map(
      g => g.sprite.main.position));
    let dist = Phaser.Point.distance(position, closest);
    if (dist < 100) {
      this.sprite.main.alpha = 1.0;
    }
    else if (dist < 150) {
      this.sprite.main.alpha = 0.5;
    }
    else
      this.sprite.main.alpha = 0.0;
  }

  selectDestination() {
    let dest = this.closestExit();
    if (dest === null)
      dest = this.findHidingSpot();
    return dest;
  }

  closest(target, points) {
    return points.reduce((a, b) => {
      let d1 = Phaser.Point.distance(a, target);
      let d2 = Phaser.Point.distance(b, target);
      if (d1 < d2) return a;
      else return b;
    }, points[0]);
  }

  closestExit() {
    let {level: {exits}, guards} = this.game;
    let guardPositions = guards.map(g => g.sprite.main.position);
    let open = exits.filter(e => {
      let distances = guardPositions.map(p => Phaser.Point.distance(e, p));
      let closest = distances.reduce((a,b) => Math.min(a, b), Number.MAX_VALUE);
      return closest > 150;
    });
    if (open.length === 0) return null;
    let position = this.sprite.main.position;
    return this.closest(position, open);
  }

  findHidingSpot() {
    let {level: {hidingSpots}} = this.game;
    let position = this.sprite.main.position;
    return this.closest(position, hidingSpots);
  }

  updateLocations() {
    for (let id in this.locations) {
      let location = this.locations[id];
      location.visible = false;
    }

    this.visibleGuards().forEach(g => {
      if (this.locations[g.id] === undefined)
        this.locations[g.id] = { visible: false, target: g };
      this.locations[g.id].visible = true;
      this.locations.position = g.sprite.main.position.clone();
    });
  }

  visibleGuards() {
    let {guards} = this.game;
    return guards.filter(g => this.visible(g.sprite.main.position));
  }

  visible(target) {
    let {level: {blocked}} = this.game;
    let line = new Phaser.Line(
      this.sprite.main.position.x, this.sprite.main.position.y,
      target.x, target.y);
    let tiles = blocked.getRayCastTiles(line, null, true);
    return tiles.length === 0;
  }
};
