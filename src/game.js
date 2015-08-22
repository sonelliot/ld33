// Main entry point of the game.

import {Entity} from './entity.js';
import {System} from './system.js';

let game = new Phaser.Game(800, 600, Phaser.AUTO, null, {
  preload, create, update });

function preload(game) {
  function sprite(name) {
    game.load.image(name, name + '.png');
  }

  const images = [
    'guard',
    'intruder'
  ];

  for (let img of images)
    sprite(img);
}

function create(game) {
  game.stage.backgroundColor = 0x363636;
  game.physics.startSystem(Phaser.Physics.ARCADE);

  let entities = [], systems = [];

  systems.push(System.display(game));
  systems.push(System.selected(game));

  entities.push(Entity.guard(game));

  game.entities = entities;
  game.systems = systems;
}

function update(game) {
  game.entities = game.entities.map(
    entity => game.systems.reduce((ent, sys) => sys.apply(ent), entity));
}

window.game = game;
