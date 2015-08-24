
export class Sym {
  constructor(game, key, position) {
    this.game = game;
    this.position = position;
    this.group = game.add.group();

    this.sprite = game.add.sprite(
      position.x, position.y, key, null, this.group);
    this.sprite.anchor.set(0.5, 0.5);
    this.sprite.smoothed = false;
    this.sprite.scale.set(game.zoom, game.zoom);
    this.sprite.position = this.position;
    this.sprite.visible = false;

    const factor = game.zoom * 1.2;

    this.pulse = game.add.tween(this.sprite.scale);
    this.pulse.to({
      x: factor, y: factor }, 500, Phaser.Easing.Cubic.In, false, 0, -1, true);
    this.pulse.start();
    this.pulse.pause();

    this.fade = game.add.tween(this.sprite);
    this.fade.to({ alpha: 0 }, 500, Phaser.Easing.Cubic.Out);
  }

  show(position) {
    this.game.world.bringToTop(this.group);
    this.position.copyFrom(position);
    this.sprite.visible = true;
    this.sprite.alpha = 1;
    this.pulse.resume();
  }

  hide() {
    this.pulse.pause();
    this.fade.start();
  }
};
