import {Character} from './character.js';

export class Intruder extends Character {
  constructor(game, position={x:0, y:0}) {
    super(game, 'intruder', position);
    this.speed = 50;
    this.locations = {};
    this.alive = true;
    this.exit = null;

    const speed = 80;

    this.hidingSpot = null;
    this.spotted = false;

    this.bloodspurt = game.add.emitter(0, 0, 50);
    this.bloodspurt.makeParticles(['blood1', 'blood2', 'blood3']);
    this.bloodspurt.setAll('smoothed', false);
    this.bloodspurt.setRotation(0,0);
    this.bloodspurt.setXSpeed(-speed, speed);
    this.bloodspurt.setYSpeed(-speed, speed);
    this.bloodspurt.setScale(1, 4, 1, 4, 100, Phaser.Easing.Cubic.In);
    this.bloodspurt.gravity = 0;
    this.bloodspurt.particleDrag.set(60, 60);

    this.seen = game.add.audio('seen');
  }

  hiding() {
    return this.hidingSpot !== null && this.hidingSpot.occupied();
  }

  alert() {
    this.spotted = true;
    this.seen.play();
    this.game.bang.show(new Phaser.Point(
      this.position.x, this.position.y - 50
    ));
    this.hidingSpot = null;
  }

  update() {
    this.updateLose();

    if (!this.alive || this.hiding())
      return;

    let nearest = this.nearestGuard();
    let vis = nearest.canSee(this);

    if (vis === 'clear' && !this.spotted) {
      this.alert();
    }

    if (this.spotted) {
      this.flee(vis);
    }

    this.updateVisible(vis);
    this.updateSpeed(vis);

    if (!this.hidingSpot) {
      this.hidingSpot = this.findHidingSpot();
      this.updatePath(this.hidingSpot.position);
    }

    this.updateHiding();

    // this.showPath(this.path);

    super.update();
  }

  flee(vis) {
    let {bang, lkp} = this.game;
    bang.position.set(this.position.x, this.position.y - 50);

    if (vis === 'barely') {
      bang.hide();
    } else if (vis === 'no') {
      lkp.show(this.position);
      this.spotted = false;
    }
  }

  updateSpeed(vis) {
    if (vis === 'clear')
      this.speed = 160.0;
    else if (vis === 'barely')
      this.speed = 120.0;
    else
      this.speed = 60.0;
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
    if (!this.exit) return;
    let dist = Phaser.Point.distance(this.position, this.exit);
    if (dist < 50)
      this.game.actions.lose();
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

  nearestGuard() {
    let {guards} = this.game;
    return guards.reduce((a, b) => {
      let d1 = Phaser.Point.distance(this.position, a.position);
      let d2 = Phaser.Point.distance(this.position, b.position);
      if (d1 < d2) return a;
      else return b;
    }, guards[0]);
  }

  updateVisible(vis) {
    let nearest = this.nearestGuard();
    if (vis === 'clear')
      this.sprite.main.alpha = 1.0;
    else if (vis === 'barely')
      this.sprite.main.alpha = 0.5;
    else
      this.sprite.main.alpha = 0.0;
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
    let guardPositions = guards.map(g => g.position);
    let open = exits.filter(e => {
      let distances = guardPositions.map(p => Phaser.Point.distance(e, p));
      let closest = distances.reduce((a,b) => Math.min(a, b), Number.MAX_VALUE);
      return closest > 150;
    });
    if (open.length === 0) return null;
    return this.closest(this.position, open);
  }

  static furthestSpot(position, spots) {
    spots.sort((a, b) => {
      let d1 = Phaser.Point.distance(position, a.position);
      let d2 = Phaser.Point.distance(position, b.position);
      if (d1 < d2) return  1;
      if (d2 > d1) return -1;
      return 0;
    });
    return spots[0];
  }

  static nearestSpot(position, spots) {
    spots.sort((a, b) => {
      let d1 = Phaser.Point.distance(position, a.position);
      let d2 = Phaser.Point.distance(position, b.position);
      if (d1 < d2) return -1;
      if (d2 > d1) return  1;
      return 0;
    });
    return spots[0];
  }

  static centroid(points) {
    let center = new Phaser.Point(0,0);
    let f = 1 / points.length;
    for (let point of points)
      center.add(point.x, point.y);
    center.multiply(f, f);
    return center;
  }

  findHidingSpot() {
    let {level, guards} = this.game;
    let spots = level.hidingSpots();
    let from = Intruder.centroid(guards.map(g => g.position));
    if (this.spotted)
      from = this.nearestGuard().position;
    spots.sort((a, b) => {
      let d1 = Phaser.Point.distance(a.position, from);
      let d2 = Phaser.Point.distance(b.position, from);
      if (d1 < d2) return  1;
      if (d2 > d1) return -1;
      return 0;
    });
    let spot = spots[0];
    return spot;
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
