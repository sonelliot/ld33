
import {Button} from './button.js';

export class Menu {
  constructor(game, {title, button}, click) {
    this.game = game;
    this.group = game.add.group();
    this.group.position.set(game.width / 3.5, game.height / 3.5);
    this.group.z = 10000;
    this.menu = game.add.sprite(0, 0, 'menu', null, this.group);
    this.menu.scale.set(game.zoom, game.zoom);
    this.menu.smoothed = false;

    this.title = game.add.text(62, 45, title, {
      font: '20px Pixel', fill: '#fff' }, this.group);

    this.button = new Button(game, this.group, button, click);
    this.button.position.set(95, 100);

    this.group.visible = false;1
  }

  setVisible(visible) {
    this.group.visible = visible;
  }

  render() {
    if (this.group.visible === false)
      return;

    let rect = new Phaser.Rectangle(0, 0, this.game.width, this.game.height);
    this.game.debug.geom(rect, 'rgba(0, 0, 0, 0.2)');
  }
};
