import * as EasyStar from 'easystarjs';

import {Guard} from './guard.js';
import {Intruder} from './intruder.js';

export class Level {
  constructor(game, name, tilesets, layers) {
    this.game = game;

    this.tilemap = game.add.tilemap(name);
    for (let tileset of tilesets)
      this.tilemap.addTilesetImage(tileset, tileset);

    for (let name of layers) {
      let layer = this.tilemap.createLayer(name);
      layer.smoothed = false;
      layer.setScale(this.game.zoom, this.game.zoom);
      this[name] = layer;
    }

    this.tilemap.setCollisionBetween(1, 100000, true, this.blocked, true);
    // this.ground.resizeWorld();

    this.fog = Level.createFog(game, this.tilemap);

    this.walkable = Level.walkable(this.tilemap, this.ground);
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

  path(start, end, then) {
    let zoom = this.game.zoom;
    let startIndex = Level.tileIndex(start, this.tilemap, zoom);
    let endIndex = Level.tileIndex(end, this.tilemap, zoom);
    this.pathfinder.findPath(startIndex.x, startIndex.y, endIndex.x, endIndex.y, path => {
      if (path === null) return then(path);
      return then(path.map(point => Level.tilePosition(
        point.x, point.y, this.tilemap, this.game.zoom)));
    });
    this.pathfinder.calculate();
  }

  light(positions, radius) {
    this.fog.forEach(r => r.forEach(t => t.alpha = 0.5));
    for (let pos of positions)
      this.lighten(pos, radius);
  }

  lighten(position, radius) {
    let center = Level.tileIndex(position, this.tilemap, this.game.zoom);
    let {width, height} = this.tilemap;

    let w = {
      start: Math.max(0, center.x - radius - 1),
      end: Math.min(width, center.x + radius) };
    let h = {
      start: Math.max(0, center.y - radius),
      end: Math.min(height, center.y + radius + 1) };

    for (let x = w.start; x < w.end; x++) {
      for (let y = h.start; y < h.end; y++) {
        let tile = this.fog[x][y];
        let d = Math.floor(
          new Phaser.Point(x - center.x, y - center.y).getMagnitude());
        if (d < radius - 1)
          tile.alpha = 0.0;
      }
    }
  }

  static tileIndex(point, tilemap, zoom) {
    const {tileWidth, tileHeight} = tilemap;
    return {
      x: Math.floor(point.x / (tileWidth * zoom)),
      y: Math.floor(point.y / (tileHeight * zoom))
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
    let {width, height} = tilemap;
    let limit = Math.max(width, height);
    for (let y = 0; y < limit; y++) {
      let row = [];
      for (let x = 0; x < limit; x++) {
        let tile = tilemap.getTile(x, y, layer);
        row.push((tile === null) ? 1 : 0);
      }
      tiles.push(row);
    }
    return tiles;
  }

  static createFog(game, tilemap) {
    let tiles = [];
    for (let x = 0; x < tilemap.width; x++) {
      let row = [];
      for (let y = 0; y < tilemap.height; y++) {
        let position = Level.tilePosition(x, y, tilemap, game.zoom);
        let sprite = game.add.sprite(position.x, position.y, 'blank');
        sprite.anchor.set(0.5, 0.5);
        sprite.scale.set(game.zoom, game.zoom);
        sprite.alpha = 0.5;
        row.push(sprite);
      }
      tiles.push(row);
    }
    return tiles;
  }
};
