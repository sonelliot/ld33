import {Character} from './character.js';

export class Intruder extends Character {
  constructor(game, position={x:0, y:0}) {
    super(game, 'intruder', position);
    this.speed = 50;
    this.locations = {};
    this.alive = true;

    const speed = 80;

    this.hidingSpot = null;

    this.bloodspurt = game.add.emitter(0, 0, 50);
    this.bloodspurt.makeParticles(['blood1', 'blood2', 'blood3']);
    this.bloodspurt.setAll('smoothed', false);
    this.bloodspurt.setRotation(0,0);
    this.bloodspurt.setXSpeed(-speed, speed);
    this.bloodspurt.setYSpeed(-speed, speed);
    this.bloodspurt.setScale(1, 4, 1, 4, 100, Phaser.Easing.Cubic.In);
    this.bloodspurt.gravity = 0;
    this.bloodspurt.particleDrag.set(60, 60);
  }

  hiding() {
    return this.hidingSpot !== null && this.hidingSpot.occupied();
  }

  update() {

    this.updateVisible();
    this.updateLose();

    if (!this.alive || this.hiding())
      return;

    let spot = this.findHidingSpot();
    if (spot) {
      this.hidingSpot = spot;
      this.updatePath(spot.position);
    }

    this.updateHiding();
    this.updateSpeed();

    super.update();
  }

  updateSpeed() {
    let position = this.sprite.main.position;
    let closest = this.closest(position, this.game.guards.map(
      g => g.sprite.main.position));
    let dist = Phaser.Point.distance(position, closest);
    if (dist < 150) {
      this.speed = 120.0;
    }
    else {
      this.speed = 50.0;
    }
  }

  die() {
    if (!this.alive)
      return;

    this.alive = false;
    this.bloodspurt.position.set(
      this.position.x, this.position.y - 20);
    this.bloodspurt.start(true, 0, null, 50);
    
    let timer = this.game.time.create(true);
    timer.add(1000, _ => this.game.actions.win());
    timer.start();
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

  updateHiding() {
    if (this.hidingSpot && !this.hidingSpot.occupied()) {
      let dist = Phaser.Point.distance(this.position, this.hidingSpot.position);
      if (dist < 50) {
        this.hidingSpot.occupy(this);
        this.group.visible = false;
        this.stop();
      }
    }
  }

  updatePath(dest) {
    let {level} = this.game;
    level.path(this.position, dest, path => {
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
    this.hidingSpot = this.findHidingSpot();
    if (!this.hidingSpot) return null;
    return this.hidingSpot.position;
    // let dest = this.closestExit();
    // if (dest === null)
    //   dest = this.findHidingSpot();
    // return dest;
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
    let {level, guards} = this.game;
    let position = this.sprite.main.position;
    let open = level.hidingSpots().filter(h => {
      return guards.filter(g => {
        let d = Phaser.Point.distance(h.position, g.position);
        return d < 100;
      }).length === 0;
    });
    let closest = open.reduce((a, b) => {
      let d1 = Phaser.Point.distance(a, this.position);
      let d2 = Phaser.Point.distance(b, this.position);
      if (d1 < d2) return a;
      else return b;
    }, open[0]);
    return closest;
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
