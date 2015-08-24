const uuid = require('uuid').v4;

export class Character {
  constructor(game, key, position, group) {
    this.id = uuid();
    this.game = game;
    this.speed = 100.0;
    this.path = [];

    this.sprite = {};

    this.sprite.main = game.add.sprite(0, 0, key, null, group);
    this.sprite.main.position.set(position.x, position.y);
    this.sprite.main.scale.set(this.game.zoom,this.game.zoom);
    this.sprite.main.anchor.set(0.5, 1.0);
    this.sprite.main.smoothed = false;
    this.sprite.main.inputEnabled = true;

    this.position = this.sprite.main.position;
    this.scale = this.sprite.main.scale;

    game.physics.enable(this.sprite.main, Phaser.Physics.ARCADE);
    this.sprite.main.body.collideWorldBounds = true;
    // this.sprite.main.body.setSize(5,5,0,0);

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

  move(dest) {
    let sprite = this.sprite.main;
    let between = Phaser.Point.subtract(dest, sprite.position);
    let dirn = Phaser.Point.normalize(between);
    this.facing = dirn;
    sprite.body.velocity.set(this.speed * dirn.x, this.speed * dirn.y);
    if (between.getMagnitude() < 20.0)
      return true;
    return false;
  }

  stop() {
    this.sprite.main.body.velocity.set(0,0);
    this.path.length = 0;
  }

  update() {
    // this.game.debug.body(this.sprite.main);

    if (this.path.length > 0) {
      let next = this.path[0];
      if (this.move(next))
        this.path = this.path.splice(1);
    }
    else
      this.stop();
  }
};
