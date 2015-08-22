// Main entry point of the game.

import {Entity} from './entity.js';
import {System} from './system.js';

let game = new Phaser.Game(800, 600, Phaser.AUTO, null, {
  preload, create, update });

let map = null;

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

  let entities = [], systems = [];

  systems.push(System.display(game));
  systems.push(System.selected(game));
  systems.push(System.pulsate(game));

  entities.push(Entity.level(game, 'test', [
    'floor_tile', 'box_tile', 'tileset_wall' ]));
  entities.push(Entity.disk(game));
  entities.push(Entity.guard(game));

  game.entities = entities;
  game.systems = systems;
}

function update(game) {
  game.entities = game.entities.map(
    entity => game.systems.reduce((ent, sys) => sys.apply(ent), entity));
}

window.game = game;
