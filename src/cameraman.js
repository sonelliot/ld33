
export class CameraMan {
  constructor(game) {
    this.game = game;
    this.camera = game.camera;
    this.cursors = game.input.keyboard.createCursorKeys();
  }

  update() {
    if (this.cursors.up.isDown)
      this.camera.y -= 4;
    else if (this.cursors.down.isDown)
      this.camera.y += 4;
    else if (this.cursors.left.isDown)
      this.camera.x -= 4;
    else if (this.cursors.right.isDown)
      this.camera.x += 4;

    let pointer = this.game.input.activePointer;
    if (pointer.middleButton.isDown) {
      let {width, height} = this.game;
      let center = new Phaser.Point(width / 2, height / 2);
      let direction = Phaser.Point.subtract(pointer.position, center);
      direction.normalize();
      this.camera.x += direction.x * 4;
      this.camera.y += direction.y * 4;
    }
  }
};
