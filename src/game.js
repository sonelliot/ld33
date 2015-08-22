// Main entry point of the game.

let game = new Phaser.Game(800, 600, Phaser.AUTO, null, {
  preload, create, update });

import {Level} from './level.js';
import {Guard} from './guard.js';

function preload(game) {
  function sprite(name) {
    game.load.image(name, name + '.png');
  }
  function tilemap(name) {
    game.load.tilemap(name, name + '.json', null, Phaser.Tilemap.TILED_JSON);
  }

  const images = [
    , 'box_tile'
    , 'disk'
    , 'floor_tile'
    , 'guard'
    , 'intruder'
    , 'tileset_wall'
  ];
  const tilemaps = [
    'test'
  ];

  for (let img of images)
    sprite(img);
  for (let tm of tilemaps)
    tilemap(tm);
}

function create(game) {
  game.stage.backgroundColor = 0x363636;
  game.physics.startSystem(Phaser.Physics.ARCADE);

  game.level = new Level(game, 'test', [
    'floor_tile', 'box_tile', 'tileset_wall'
  ]);
  game.guards = [
    new Guard(game, { x: 100, y: 100 })
  ];
}

function update(game) {
  for (let guard of game.guards)
    guard.update();
}

window.game = game;
