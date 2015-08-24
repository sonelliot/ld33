import {Menu} from './menu.js';

export class PausedState {
  constructor() {
    this.name = 'paused';
    this.menu = {};
  }

  init(reason) {
    this.reason = reason;
  }

  create (game) {
    this.menu = {};
    this.menu.lose = new Menu(game, { title: 'YOU LOSE', button: 'RETRY' }, _ => {
      game.state.start('play');
    });
    this.menu.win = new Menu(game, { title: 'YOU WIN', button: 'NEXT' }, _ => {
      game.levelId++;
      game.state.start('play');
    });
    this.menu.complete = new Menu(game, { title: 'FINISHED', button: 'RESTART' }, _ => {
      game.levelId = 1;
      game.state.start('play');
    });

    let menu = this.menu[this.reason || 'win'];
    menu.setVisible(true);
  }
};
