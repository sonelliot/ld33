import {Character} from './character.js';
import {Bullet} from './bullet.js';

export class Guard extends Character {
  constructor(game, position={x: 0, y: 0}) {
    super(game, 'guard', position);

    this.fired = game.time.totalElapsedSeconds();

    this.sprite.shotgun = game.add.sprite(0, 0, 'shotgun', null, this.group);
    this.sprite.shotgun.anchor.set(0.5, 0.5);
    this.sprite.shotgun.position.set(this.position.x, this.position.y);
    this.sprite.shotgun.smoothed = false;
    this.sprite.shotgun.scale.set(game.zoom, game.zoom);

    let pointer = game.input.activePointer;
    pointer.leftButton.onDown.add(_ => {
      if (this.selected === true) {
        let level = this.game.level;
        let sprite = this.sprite.main;
        let target = new Phaser.Point(pointer.worldX, pointer.worldY);
        level.path(sprite.position, target, path => {
          if (path === null || path.length === 0)
            return;
          this.path = path.splice(1);
          this.showPath(this.path);
        });
      }
    });

    this.disks = [];
    for (let i = 0; i < 100; i++) {
      let d = game.add.sprite(0, 0, 'disk');
      let f = game.zoom * 0.75;
      d.anchor.set(0.5, 0.5);
      d.scale.set(f,f);
      d.visible = false;
      this.disks.push(d);
    }
  }

  hidePath() {
    this.disks.forEach(d => d.visible = false);
  }

  showPath(path) {
    this.hidePath();
    for (let i =0; i < path.length; i++) {
      let point = path[i];
      let disk = this.disks[i];
      disk.position.set(point.x, point.y);
      disk.visible = true;
    }
  }

  select(enable) {
    enable = (enable !== undefined) ? enable : !this.selected;

    if (this.selected === enable)
      return;

    let active = this.game.guards.active;
    if (active !== this) {
      if (active !== undefined)
        this.game.guards.active.select(false);
      this.game.guards.active = this;
    }

    this.selected = enable;
    if (enable === true) {
      this.sprite.main.scale.set(this.game.zoom * 1.25, this.game.zoom * 1.25);

      let {x, y} = this.sprite.main.position;
      this.game.camera.follow(this.sprite.main);
    }
    else {
      this.sprite.main.scale.set(this.game.zoom,this.game.zoom);
    }
  }

  update() {
    super.update();

    this.sprite.shotgun.position.set(
      this.position.x, this.position.y - 8);
    this.sprite.shotgun.scale.copyFrom(this.scale);

    let {position, alive} = this.game.intruder;
    if (alive && Phaser.Point.distance(this.position, position) < 150)
      this.fire(this.game.intruder.position);
  }

  fire(target) {
    let now = this.game.time.totalElapsedSeconds();
    let since = now - this.fired;
    if (since > 1.0) {
      let dirn = Phaser.Point.subtract(target, this.position);
      dirn.normalize();

      this.fired = this.game.time.totalElapsedSeconds();
      this.game.bullets.push(new Bullet(
        this.game, this.position, dirn, 300.0));
    }
  }

  stop() {
    super.stop();
    this.hidePath();
  }
};
