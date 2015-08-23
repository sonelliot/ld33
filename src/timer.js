
export class Timer {
  constructor(game, amount, expired) {
    this.game = game;
    this.group = game.add.group();
    this.group.position.set(game.width-50, 10);
    this.label = game.add.text(0, 0, '', {
      font: '14px Pixel', fill: 'white' }, this.group);
    this.remaining = amount;
    this.expired = expired;
  }

  update() {
    this.remaining -= this.game.time.physicsElapsed;
    this.remaining  = Math.max(0, this.remaining);
    this.label.text = Math.floor(this.remaining) + ' s';

    if (this.remaining === 0)
      this.expired();
  }
};
