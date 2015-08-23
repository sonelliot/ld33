import {Character} from './character.js';

export class Intruder extends Character {
  constructor(game, position={x:0, y:0}) {
    super(game, 'intruder', position);
    this.locations = {};

    this.sprite.target = game.add.sprite(0, 0, 'disk');
    this.sprite.target.anchor.set(0.5, 0.5);
    this.sprite.target.scale.set(game.zoom * 0.75, game.zoom * 0.75);
    this.sprite.target.tint = 0xff0000;
  }

  update() {
    super.update();

    let {level} = this.game;
    let position = this.sprite.main.position;
    let dest = this.selectDestination();
    this.sprite.target.position.copyFrom(dest);
    level.path(position, dest, path => {
      if (path === null)
        return;
      this.path = path.splice(1);
    });
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
