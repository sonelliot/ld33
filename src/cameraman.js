
export class CameraMan {
  constructor(game) {
    this.game = game;
    this.camera = game.camera;
    this.cursors = game.input.keyboard.createCursorKeys();

    this.cursors.up.onDown.add(_ => {
      this.camera.y -= 4;
    });
    this.cursors.down.onDown.add(_ => {
      this.camera.y += 4;
    });
    this.cursors.left.onDown.add(_ => {
      this.camera.x -= 4;
    });
    this.cursors.right.onDown.add(_ => {
      this.camera.x += 4;
    });
  }
};
