
export class Bullet {
  constructor(game, {x, y}, dirn, speed) {
    this.game = game;

    this.alive = 5.0;

    this.intruder = game.intruder;
    this.target = game.intruder.sprite.main;

    this.sprite = game.add.sprite(x, y, 'bullet');
    this.sprite.scale.set(game.zoom, game.zoom);
    game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
    this.sprite.body.collideWorldBounds = true;
    this.sprite.body.velocity.set(dirn.x * speed, dirn.y * speed);
    this.sprite.rotation = Phaser.Point.angle(
      dirn, new Phaser.Point(1, 0)) + (Math.PI / 2);
  }

  update() {
    let arcade = this.game.physics.arcade;
    arcade.overlap(this.sprite, this.target, _ => {
      this.hit();
    });

    this.alive -= this.game.time.physicsElapsed;
    if (this.alive <= 0.0)
      this.kill();
  }

  hit() {
    this.intruder.die();
    this.kill();
  }

  kill() {
    this.sprite.kill();
    this.game.bullets.splice(this.game.bullets.indexOf(this), 1);
  }
};
