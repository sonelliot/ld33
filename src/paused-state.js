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
      game.state.start('play', true, false, 'map2');
    });
    this.menu.win = new Menu(game, { title: 'YOU WIN', button: 'NEXT' }, _ => {
      game.state.start('play', true, false, 'map2');
    });

    let menu = this.menu[this.reason || 'win'];
    menu.setVisible(true);
  }
};