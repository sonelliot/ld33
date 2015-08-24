import {Character} from './character.js';
import {Bullet} from './bullet.js';
import {Sym} from './symbol.js';

export class Guard extends Character {
  constructor(game, type, position={x: 0, y: 0}, index, group) {
    super(game, 'capable', position, group);

    let params = this.params(type);
    const nums = ['one', 'two', 'three'];

    this.number = game.add.sprite(0,0, nums[index]);
    this.number.smoothed = false;
    this.number.scale.set(game.zoom, game.zoom);

    this.active = true;

    this.speed = params.speed;
    this.visibility = params.visibility;

    this.fired = game.time.totalElapsedSeconds();
    this.hidingSpot = null;

    this.beep = game.add.audio('beep', 0.2);

    if (params.armed) {
      this.sprite.shotgun = game.add.sprite(0, 0, 'shotgun', null, group);
      this.sprite.shotgun.anchor.set(0.5, 0.5);
      this.sprite.shotgun.position.set(this.position.x, this.position.y);
      this.sprite.shotgun.smoothed = false;
      this.sprite.shotgun.scale.set(game.zoom, game.zoom);
      this.shot = game.add.audio('shotgun1', 0.2);

      let pointer = game.input.activePointer;
      let keyboard = game.input.keyboard;
      pointer.leftButton.onDown.add(_ => {
        if (!keyboard.isDown(Phaser.Keyboard.SHIFT))
          return;
        if (!this.selected)
          return;
        this.fire(new Phaser.Point(
          pointer.worldX, pointer.worldY));
      });
    }

    let pointer = game.input.activePointer;
    pointer.leftButton.onDown.add(_ => {
      if (this.selected === true) {
        if (game.input.keyboard.isDown(Phaser.Keyboard.SHIFT))
          return;
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
      return { speed: 80, armed: true, visibility: 4 };
    else if (type === 'capable')
      return { speed: 80, armed: true, visibility: 4 };
    else if (type === 'badass')
      return { speed: 80, armed: true, visibility: 4 };
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
      this.beep.play();
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
      // if (!hidden && alive /*&& vis === 'clear'*/)
      //   this.fire(this.game.intruder.position);
    }

    this.number.position.copyFrom(this.position);
  }

  fire(target) {
    let now = this.game.time.totalElapsedSeconds();
    let since = now - this.fired;
    if (since > 0.5) {
      let dirn = Phaser.Point.subtract(target, this.position);
      dirn.normalize();

      let start = new Phaser.Point(
        this.position.x + dirn.x * 50,
        this.position.y + dirn.y * 50);

      this.shot.play();
      this.fired = this.game.time.totalElapsedSeconds();
      this.game.bullets.push(new Bullet(
        this.game, start, dirn, 300.0));
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
