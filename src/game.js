// Main entry point of the game.

import {PlayState} from './play-state.js';
import {PausedState} from './paused-state.js';

// let game = new Phaser.Game(800, 600, Phaser.AUTO, null, {
//   preload, create, update });
let paused = false;

let game = new Phaser.Game(800, 600, Phaser.AUTO, "game");
game.levelId = 1;
game.levelMax = 3;
game.state.add('play', new PlayState());
game.state.add('paused', new PausedState());
game.state.start('play');

window.game = game;
