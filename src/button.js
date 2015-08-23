
export class Button {
  constructor(game, parent, text, clicked) {
    this.game = game;
    this.group = game.add.group(parent);
    this.position = this.group.position;
    this.sprite = game.add.sprite(0, 0, 'button', null, this.group);
    this.sprite.smoothed = false;
    this.sprite.scale.set(2,2);
    this.sprite.inputEnabled = true;
    this.sprite.events.onInputDown.add(clicked);
    this.label = game.add.text(8, 5, text, {
      font: '14px Pixel', fill: 'white' }, this.group);
    this.label.smoothed = false;
  }
};
