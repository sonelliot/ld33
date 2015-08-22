
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
  }
};
