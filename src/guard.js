import {Character} from './character.js';

export class Guard extends Character {
  constructor(game, position={x: 0, y: 0}) {
    super(game, 'guard', position);

    this.facing = new Phaser.Point();

    this.sprite.main.events.onInputDown.add(_ => {
      this.select();
    });

    this.sprite.cone = game.add.sprite(0, 0, 'cone', null, this.group);
    this.sprite.cone.alpha = 0.5;
    this.sprite.cone.anchor.set(0.525, 0.0);
    this.sprite.cone.smoothed = false;
    this.sprite.cone.scale.set(this.game.zoom,this.game.zoom);

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

  select() {
    this.stop();
    if (this.selected === true) {
      this.selected = false;
      this.sprite.main.scale.set(this.game.zoom,this.game.zoom);
    }
    else {
      this.selected = true;
      this.sprite.main.scale.set(this.game.zoom * 1.25, this.game.zoom * 1.25);
    }
  }

  update() {
    super.update();
    this.updateCone();
  }

  updateCone() {
    let velocity = this.sprite.main.body.velocity;
    if (velocity.getMagnitudeSq() > 0) {
      let rotation = velocity.angle(new Phaser.Point(0,1)) + (Math.PI / 2);
      this.sprite.cone.rotation = rotation;
    }
    this.sprite.cone.position.copyFrom(this.sprite.main.position);
    this.sprite.cone.position.add(this.facing.x * 10, this.facing.y * 10);
  }

  stop() {
    super.stop();
    this.hidePath();
  }
};
