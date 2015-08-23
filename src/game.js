// Main entry point of the game.

let game = new Phaser.Game(800, 600, Phaser.AUTO, null, {
  preload, create, update });

import {Level} from './level.js';
import {Guard} from './guard.js';
import {Intruder} from './intruder.js';
import {CameraMan} from './cameraman.js';

function preload(game) {
  function sprite(name) {
    game.load.image(name, name + '.png');
  }
  function tilemap(name) {
    game.load.tilemap(name, name + '.json', null, Phaser.Tilemap.TILED_JSON);
  }

  const images = [
    , 'box_tile'
    , 'cone'
    , 'disk'
    , 'floor_tile'
    , 'guard'
    , 'intruder'
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

function create(game) {
  game.stage.backgroundColor = 0x363636;
  game.physics.startSystem(Phaser.Physics.ARCADE);
  game.zoom = 2;

  game.guards = [];
  game.characters = [];
  game.level = new Level(game, 'test2', [
    'floor_tile', 'box_tile', 'tileset_wall'
  ]);
  game.level.spawn();
  game.cameraman = new CameraMan(game);
}

function update(game) {
  for (let character of game.characters) {
    character.update();
    game.physics.arcade.collide(character.sprite.main, game.level.blocked);
  }
  game.cameraman.update();
}

window.game = game;
