export class Guard {
  constructor(game, position={x: 0, y: 0}) {
    this.game = game;
    this.selected = false;
    this.destination = null;
    this.speed = 100.0;

    this.sprite = {};
    this.group = game.add.group();

    this.sprite.guard = game.add.sprite(0, 0, 'guard', null, this.group);
    this.sprite.guard.position.set(position.x, position.y);
    this.sprite.guard.anchor.set(0.5, 0.5);
    this.sprite.guard.scale.set(3, 3);
    this.sprite.guard.smoothed = false;
    this.sprite.guard.inputEnabled = true;

    this.sprite.guard.events.onInputDown.add(_ => {
      this.select();
    });

    game.physics.enable(this.sprite.guard, Phaser.Physics.ARCADE);

    let pointer = game.input.activePointer;
    pointer.leftButton.onDown.add(_ => {
      if (this.selected === true) {
        this.destination =
          new Phaser.Point(pointer.worldX, pointer.worldY);
      }
    });
  }

  select() {
    this.destination = null;
    if (this.selected === true) {
      this.selected = false;
      this.sprite.guard.scale.set(3,3);
    }
    else {
      this.selected = true;
      this.sprite.guard.scale.set(4,4);
    }
  }

  update() {
    if (this.destination !== null) {
      let sprite = this.sprite.guard;
      let between = Phaser.Point.subtract(this.destination, sprite.position);
      let dirn = Phaser.Point.normalize(between);
      sprite.body.velocity.set(this.speed * dirn.x, this.speed * dirn.y);

      if (between.getMagnitude() < 1.0) {
        this.destination = null;
        sprite.body.velocity.set(0,0);
      }
    }
  }
};
