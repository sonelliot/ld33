// Main entry point of the game.

let game = new Phaser.Game(800, 600, Phaser.AUTO, null, {
  preload, create, update });
let paused = false;

const DURATION = 60;

import {Level} from './level.js';
import {Guard} from './guard.js';
import {Intruder} from './intruder.js';
import {CameraMan} from './cameraman.js';
import {Menu} from './menu.js';
import {Timer} from './timer.js';

function preload(game) {
  function sprite(name) {
    game.load.image(name, name + '.png');
  }
  function tilemap(name) {
    game.load.tilemap(name, name + '.json', null, Phaser.Tilemap.TILED_JSON);
  }

  const images = [
      'box_tile'
    , 'button'
    , 'blank'
    , 'blood1'
    , 'blood2'
    , 'blood3'
    , 'cone'
    , 'disk'
    , 'floor_tile'
    , 'guard'
    , 'intruder'
    , 'menu'
    , 'shotgun'
    , 'bullet'
    , 'tileset_wall'
    , 'tileset_roof'
    , 'tilemap_ground'
    , 'tilemap_crate'
  ];
  const tilemaps = [
    'map2'
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
}

function loadLevel(game, name) {
  clear(game);

  console.log('loading ' + name + ' ...');

  game.levelName.text = 'level: ' + name;

  game.guards = [];
  game.characters = [];
  
  let tilesets = [
      'tilemap_ground'
    , 'tilemap_crate'
    , 'tileset_wall'
    , 'tileset_roof'
  ];
  let layers = [
      'ground'
    , 'walls'
    , 'roof'
    , 'cables'
    , 'Shadows'
    , 'blocks'
  ];
  game.level = new Level(game, name, tilesets, layers);
  game.level.name = name;
  game.level.spawn();

  game.world.bringToTop(game.menu.win.group);
  game.world.bringToTop(game.menu.lose.group);
  game.world.bringToTop(game.timer.group);
  game.world.bringToTop(game.levelName);

  game.timer.remaining = DURATION;
  game.timer.update();

  paused = false;
}

function win() {
  paused = true;
  game.menu.win.setVisible(true);
}

function lose() {
  paused = true;
  game.menu.lose.setVisible(true);
}

function create(game) {
  game.stage.backgroundColor = 0x363636;
  game.physics.startSystem(Phaser.Physics.ARCADE);
  game.zoom = 2;

  game.actions = {};
  game.actions.win = win;
  game.actions.lose = lose;

  game.bullets = [];

  game.menu = {};
  game.menu.lose = new Menu(game, { title: 'YOU LOSE', button: 'RETRY' }, _ => {
    game.menu.lose.setVisible(false);
    loadLevel(game, 'map2');
  });

  game.menu.win = new Menu(game, { title: 'YOU WIN', button: 'NEXT' }, _ => {
    game.menu.win.setVisible(false);
    loadLevel(game, 'map2');
  });
  game.timer = new Timer(game, 5.0, _ => lose());
  game.levelName = game.add.text(15, 10, 'level: ', {
      font: '14px Pixel', fill: 'white' });

  game.collidable = game.add.group();

  loadLevel(game, 'map2');

  let numbers = ['ONE', 'TWO', 'THREE', 'FOUR'];
  for (let i = 0; i < game.guards.length; i++) {
    let number = numbers[i];
    let key = game.input.keyboard.addKey(Phaser.Keyboard[number]);
    key.onDown.add(_ => {
      game.guards[i].select();
    });
  }

  game.cameraman = new CameraMan(game);

  game.world.resize(2000, 2000);
}

function update(game) {
  if (paused === true)
    return;

  for (let character of game.characters) {
    character.update();
    game.physics.arcade.collide(character.sprite.main, game.level.blocked);
  }

  for (let bullet of game.bullets) {
    bullet.update();
  }

  game.level.light(game.guards.map(c => c.position), 5);
  game.cameraman.update();
  game.timer.update();
}

window.game = game;
