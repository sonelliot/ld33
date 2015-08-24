import {Level} from './level.js';
import {Guard} from './guard.js';
import {Intruder} from './intruder.js';
import {CameraMan} from './cameraman.js';
import {Timer} from './timer.js';
import {Sym} from './symbol.js';

const DURATION = 60;

export class PlayState {
  constructor(game) {
    this.name = 'play';
    this.game = game;
    this.paused = false;
  }

  preload(game) {
    function sprite(name) {
      game.load.image(name, name + '.png');
    }
    function tilemap(name) {
      game.load.tilemap(name, name + '.json', null, Phaser.Tilemap.TILED_JSON);
    }
    function sound(name) {
      game.load.audio(name, name + '.wav');
    }

    const images = [
      'box_tile'
      , 'bang'
      , 'button'
      , 'blank'
      , 'blood1'
      , 'blood2'
      , 'blood3'
      , 'cone'
      , 'lkp'
      , 'crate_open'
      , 'crate_closed'
      , 'disk'
      , 'floor_tile'
      , 'pushover'
      , 'capable'
      , 'badass'
      , 'intruder'
      , 'menu'
      , 'shotgun'
      , 'bullet'
      , 'question'
      , 'tileset_wall'
      , 'tileset_roof'
      , 'tilemap_ground'
      , 'tilemap_crate'
    ];
    const sounds = [
        'seen'
      , 'shotgun1'
      , 'music'
    ];
    const tilemaps = [
        'map1'
      , 'map2'
    ];

    for (let img of images)
      sprite(img);
    for (let tm of tilemaps)
      tilemap(tm);
    for (let snd of sounds)
      sound(snd);
  }

  init (level) {
  }

  create(game) {
    game.levelMax = 1;

    game.stage.backgroundColor = 0x363636;
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.zoom = 2;

    game.actions = {};
    game.actions.win = _ => {
      if (game.levelId === game.levelMax)
        game.state.start('paused', true, false, 'complete');
      else
        game.state.start('paused', true, false, 'win');
    };
    game.actions.lose = _ => {
      game.state.start('paused', true, false, 'lose');
    };

    game.bullets = [];

    game.question = new Sym(game, 'question', new Phaser.Point(0,0));
    game.bang = new Sym(game, 'bang', new Phaser.Point(0,0));
    game.lkp = new Sym(game, 'lkp', new Phaser.Point(0,0));

    game.timer = new Timer(game, 5.0, _ => game.actions.lose());
    game.levelName = game.add.text(15, 10, 'level: ', {
      font: '14px Pixel', fill: 'white' });
    game.levelName.fixedToCamera = true;

    game.collidable = game.add.group();

    this.loadLevel(game, 'map' + game.levelId);

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

    this.bgm = game.add.audio('music', 1, true);
    // this.bgm.play();
  }

  update(game) {
    if (this.paused === true)
      return;

    for (let character of game.characters) {
      character.update();
      game.physics.arcade.collide(character.sprite.main, game.level.blocked);
    }

    for (let bullet of game.bullets) {
      bullet.update();
    }

    game.level.light(game.guards);
    game.cameraman.update();
    game.timer.update();
  }

  loadLevel(game, name) {
    console.log("loading level '" + name + "'");
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

    game.world.bringToTop(game.timer.group);
    game.world.bringToTop(game.levelName);

    game.timer.remaining = DURATION;
    game.timer.update();

    this.paused = false;
  }

  clear(game) {
    if (game.characters && game.characters.length > 0)
      game.characters.forEach(c => c.group.destroy());
    game.characters = null; game.guards = null;

    if (game.level) {
      game.level.tilemap.destroy();
      game.level = null;
    }
  }
};
