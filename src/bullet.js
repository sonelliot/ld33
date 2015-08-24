
export class Bullet {
  constructor(game, {x, y}, dirn, speed) {
    this.game = game;

    this.sprite = game.add.sprite(x, y, 'bullet');
    this.sprite.scale.set(game.zoom, game.zoom);
    game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
    this.sprite.body.collideWorldBounds = true;
    this.sprite.body.velocity.set(dirn.x * speed, dirn.y * speed);
    this.sprite.rotation = Phaser.Point.angle(
      dirn, new Phaser.Point(1, 0)) + (Math.PI / 2);
  }

  update() {
    
  }
};
