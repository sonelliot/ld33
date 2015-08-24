import {Character} from './character.js';
import {Bullet} from './bullet.js';

export class Guard extends Character {
  constructor(game, type, position={x: 0, y: 0}) {
    super(game, type, position);

    let params = this.params(type);

    this.active = true;

    this.speed = params.speed;
    this.visibility = params.visibility;

    this.fired = game.time.totalElapsedSeconds();
    this.hidingSpot = null;

    if (params.armed) {
      this.sprite.shotgun = game.add.sprite(0, 0, 'shotgun', null, this.group);
      this.sprite.shotgun.anchor.set(0.5, 0.5);
      this.sprite.shotgun.position.set(this.position.x, this.position.y);
      this.sprite.shotgun.smoothed = false;
      this.sprite.shotgun.scale.set(game.zoom, game.zoom);
      this.shot = game.add.audio('shotgun1');
    }

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
          // this.showPath(this.path);
        });
      }
    });
  }

  params(type) {
    if (type === 'pushover')
      return { speed: 60, armed: false, visibility: 4 };
    else if (type === 'capable')
      return { speed: 60, armed: false, visibility: 4 };
    else if (type === 'badass')
      return { speed: 60, armed: true, visibility: 4 };
    return null;
  }

  canSee(target) {
    const unit = 20;
    let dist = Phaser.Point.distance(target.position, this.position);
    if (dist < (this.visibility * unit))
      return 'clear';
    else if (dist < ((this.visibility + 2) * unit))
      return 'barely';
    else
      return 'no';
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

    if (!this.active) return;

    if (this.canSee(this.game.lkp) === 'clear')
      this.game.lkp.hide();

    if (this.sprite.shotgun) {
      this.sprite.shotgun.position.set(
        this.position.x, this.position.y - 8);
      this.sprite.shotgun.scale.copyFrom(this.scale);

      let vis = this.canSee(this.game.intruder);

      let {position, alive} = this.game.intruder;
      let hidden = this.game.intruder.hiding();
      if (!hidden && alive && vis === 'clear')
        this.fire(this.game.intruder.position);
    }
  }

  fire(target) {
    let now = this.game.time.totalElapsedSeconds();
    let since = now - this.fired;
    if (since > 2.0) {
      let dirn = Phaser.Point.subtract(target, this.position);
      dirn.normalize();
      
      this.shot.play();
      this.fired = this.game.time.totalElapsedSeconds();
      this.game.bullets.push(new Bullet(
        this.game, this.position, dirn, 300.0));
    }
  }

  stop() {
    super.stop();
    this.hidePath();
  }

  deactivate() {
    this.active = false;
    this.stop();
  }
};
