// Main entry point of the game.

let game = new Phaser.Game(800, 600, Phaser.AUTO, null, {
  preload, create, update });

import {Level} from './level.js';
import {Guard} from './guard.js';
import {Intruder} from './intruder.js';
import {CameraMan} from './cameraman.js';
import {Menu} from './menu.js';

function preload(game) {
  function sprite(name) {
    game.load.image(name, name + '.png');
  }
  function tilemap(name) {
    game.load.tilemap(name, name + '.json', null, Phaser.Tilemap.TILED_JSON);
  }

  const images = [
    , 'box_tile'
    , 'button'
    , 'cone'
    , 'disk'
    , 'floor_tile'
    , 'guard'
    , 'intruder'
    , 'menu'
    , 'tileset_wall'
  ];
  const tilemaps = [
    'test', 'test2'
  ];

  for (let img of images)
    sprite(img);
  for (let tm of tilemaps)
    tilemap(tm);
}

function clear(game) {
  if (game.characters && game.characters.length > 0)
    game.characters.forEach(c => c.group.destroy());
  game.characters = null; game.guards = null;

  if (game.level) {
    game.level.tilemap.destroy();
    game.level = null;
  }

  if (game.menu && game.menu.lose) {
    game.menu.lose.group.destroy();
    game.menu.lose = null;
  }
}

function loadLevel(game, name) {
  clear(game);

  game.guards = [];
  game.characters = [];
  game.level = new Level(game, name, [
    'floor_tile', 'box_tile', 'tileset_wall'
  ]);
  game.level.spawn();

  let numbers = ['ONE', 'TWO', 'THREE', 'FOUR'];
  for (let i = 0; i < game.guards.length; i++) {
    let number = numbers[i];
    let key = game.input.keyboard.addKey(Phaser.Keyboard[number]);
    let guard = game.guards[i];
    key.onDown.add(_ => {
      guard.select();
    });
  }

  game.menu = {};
  game.menu.lose = new Menu(game, { title: 'YOU LOSE', button: 'RETRY' }, _ => {
    loadLevel(game, 'test2');
  });
  game.menu.win = new Menu(game, { title: 'YOU WIN', button: 'NEXT' }, _ => {
    loadLevel(game, 'test2');
  });

  game.paused = false;
}

function create(game) {
  game.stage.backgroundColor = 0x363636;
  game.physics.startSystem(Phaser.Physics.ARCADE);
  game.zoom = 2;

  loadLevel(game, 'test2');

  game.cameraman = new CameraMan(game);
}

function update(game) {
  if (game.paused)
    return;

  for (let character of game.characters) {
    character.update();
    game.physics.arcade.collide(character.sprite.main, game.level.blocked);
  }
  game.cameraman.update();
}

window.game = game;
