export class Guard {
  constructor(game, position={x: 0, y: 0}) {
    this.game = game;
    this.selected = false;
    this.destination = null;
    this.speed = 100.0;
    this.path = [];

    this.sprite = {};
    this.group = game.add.group();

    this.sprite.guard = game.add.sprite(0, 0, 'guard', null, this.group);
    this.sprite.guard.position.set(position.x, position.y);
    this.sprite.guard.scale.set(3,3);
    this.sprite.guard.anchor.set(0.5, 1.0);
    this.sprite.guard.smoothed = false;
    this.sprite.guard.inputEnabled = true;

    this.sprite.guard.events.onInputDown.add(_ => {
      this.select();
    });

    game.physics.enable(this.sprite.guard, Phaser.Physics.ARCADE);
    this.sprite.guard.body.collideWorldBounds = true;
    this.sprite.guard.body.setSize(5,5,0,0);

    let pointer = game.input.activePointer;
    pointer.leftButton.onDown.add(_ => {
      if (this.selected === true) {
        let level = this.game.level;
        let sprite = this.sprite.guard;
        let target = new Phaser.Point(pointer.worldX, pointer.worldY);
        level.path(sprite.position, target, path => {
          this.path = path.splice(1);
          this.showPath(this.path);
        });
      }
    });

    this.disks = [];
    for (let i = 0; i < 100; i++) {
      let d = game.add.sprite(0, 0, 'disk');
      d.anchor.set(0.5, 0.5);
      d.scale.set(2,2);
      d.visible = false;
      this.disks.push(d);
    }
  }

  showPath(path) {
    this.disks.forEach(d => d.visible = false);
    for (let i =0; i < path.length; i++) {
      let point = path[i];
      let disk = this.disks[i];
      disk.position.set(point.x, point.y);
      disk.visible = true;
    }
  }

  select(target) {
    this.stop();
    if (this.selected === true) {
      this.selected = false;
      this.sprite.guard.scale.set(3,3);
    }
    else {
      this.selected = true;
      this.sprite.guard.scale.set(4,4);
    }
  }

  move(dest) {
    let sprite = this.sprite.guard;
    let between = Phaser.Point.subtract(dest, sprite.position);
    let dirn = Phaser.Point.normalize(between);
    sprite.body.velocity.set(this.speed * dirn.x, this.speed * dirn.y);
    if (between.getMagnitude() < 1.0)
      return true;
    return false;
  }

  update() {
    this.game.debug.body(this.sprite.guard);

    if (this.path.length > 0) {
      let next = this.path[0];
      if (this.move(next))
        this.path = this.path.splice(1);
    }
    else
      this.stop();
  }

  stop() {
    this.sprite.guard.body.velocity.set(0,0);
  }
};
