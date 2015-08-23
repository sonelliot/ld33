import * as EasyStar from 'easystarjs';

import {Guard} from './guard.js';
import {Intruder} from './intruder.js';

export class Level {
  constructor(game, name, tilesets) {
    this.game = game;

    this.tilemap = game.add.tilemap(name);
    for (let tileset of tilesets)
      this.tilemap.addTilesetImage(tileset, tileset);

    for (let name of ['ground', 'blocked', 'walls']) {
      let layer = this.tilemap.createLayer(name);
      layer.smoothed = false;
      layer.setScale(this.game.zoom,this.game.zoom);
      this[name] = layer;
    }

    this.tilemap.setCollisionBetween(1, 100000, true, this.blocked, true);
    this.ground.resizeWorld();

    this.walkable = Level.walkable(this.tilemap, this.blocked);
    this.pathfinder = new EasyStar.js();
    this.pathfinder.setGrid(this.walkable);
    this.pathfinder.setAcceptableTiles([0]);
    this.pathfinder.enableDiagonals();
  }

  findLocations(type) {
    return this.tilemap.objects['locations'].filter(
      e => e.type === type);
  }

  spawn() {
    this.findLocations('guard').forEach(l => {
      let g = new Guard(this.game, {
        x: l.x * this.game.zoom, y: l.y * this.game.zoom });
      this.game.guards.push(g);
      this.game.characters.push(g);
    });
    this.findLocations('intruder').forEach(l => {
      let i = new Intruder(this.game, {
        x: l.x * this.game.zoom, y: l.y * this.game.zoom });
      this.game.intruder = i;
      this.game.characters.push(i);
    });
    this.exits = this.findLocations('exit').map(l => {
      return new Phaser.Point(
        l.x * this.game.zoom, l.y * this.game.zoom);
    });
    this.hidingSpots = this.findLocations('hide').map(l => {
      return new Phaser.Point(
        l.x * this.game.zoom, l.y * this.game.zoom);
    });
  }

  fogOfWar(lights) {
    const {width, height} = this.game;
    let tiles = [];
    for (let layer of this.tilemap.layers)
      tiles.concat(layer.getTiles(0, 0, width, height));
    for (let tile of tiles)
      tile.alpha = 0.5;
  }

  path(start, end, then) {
    let scale = { x: this.game.zoom, y: this.game.zoom };
    let startIndex = Level.tileIndex(start, this.tilemap, scale);
    let endIndex = Level.tileIndex(end, this.tilemap, scale);
    this.pathfinder.findPath(startIndex.x, startIndex.y, endIndex.x, endIndex.y, path => {
      if (path === null) return then(path);
      return then(path.map(point => Level.tilePosition(
        point.x, point.y, this.tilemap, this.game.zoom)));
    });
    this.pathfinder.calculate();
  }

  static tileIndex(point, tilemap, scale) {
    const {tileWidth, tileHeight} = tilemap;
    return {
      x: Math.floor(point.x / (tileWidth * scale.x)),
      y: Math.floor(point.y / (tileHeight * scale.y))
    };
  }

  static tilePosition(x, y, tilemap, zoom) {
    let {tileWidth, tileHeight} = tilemap;
    let width = tileWidth * zoom;
    let height = tileHeight * zoom;
    return new Phaser.Point(
      x * width + (width / 2),
      y * height + (height / 2));
  }

  static walkable(tilemap, layer) {
    let tiles = [];
    for (let y = 0; y < tilemap.width; y++) {
      let row = [];
      for (let x = 0; x < tilemap.height; x++) {
        let tile = tilemap.getTile(x, y, layer);
        row.push((tile === null) ? 0 : 1);
      }
      tiles.push(row);
    }
    return tiles;
  }
};
