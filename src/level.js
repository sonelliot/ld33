import * as EasyStar from 'easystarjs';

import {Guard} from './guard.js';
import {Intruder} from './intruder.js';
import {HidingSpot} from './hiding-spot.js';

export class Level {
  constructor(game, name, tilesets, layers) {
    this.game = game;

    this.group = this.game.sortable;

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

    this.walkable = Level.walkable(this.tilemap, this.ground);
    this.pathfinder = new EasyStar.js();
    this.pathfinder.setGrid(this.walkable);
    this.pathfinder.setAcceptableTiles([0]);
    this.pathfinder.enableDiagonals();
  }

  findLocations(type) {
    return this.tilemap.objects['locations']
      .filter(e => e.type === type);
  }

  findLocationPositions(type) {
    let {zoom} = this.game;
    return this.findLocations(type)
      .map(l => new Phaser.Point(l.x * zoom, l.y * zoom));
  }

  spawn() {
    let i = 0;
    this.findLocations('guard').forEach(l => {
      let type = l.properties.guard;
      let p = new Phaser.Point(
        l.x * this.game.zoom, l.y * this.game.zoom);
      let g = new Guard(this.game, type, p, i++, this.group);
      this.game.guards.push(g);
      this.game.characters.push(g);
    });
    let startingPoints = this.findLocationPositions('intruder');
    let start = this.game.rnd.integerInRange(0, startingPoints.length-1);
    this.game.intruder = new Intruder(this.game, startingPoints[start], this.group);
    this.game.characters.push(this.game.intruder);
    this.exits = this.findLocationPositions('exit');
    this.crates = this.findLocations('crate').reverse().map(l => {
      let closed = l.properties.closed === 'true';
      let position = new Phaser.Point(
        l.x * this.game.zoom, l.y * this.game.zoom);
      return new HidingSpot(this.game, 'crate', position, closed);
    });
    this.lockers = this.findLocations('locker').reverse().map(l => {
      let closed = l.properties.closed === 'true';
      let position = new Phaser.Point(
        l.x * this.game.zoom, l.y * this.game.zoom);
      return new HidingSpot(this.game, 'locker', position, closed);
    });
    this.fog = Level.createFog(game, this.tilemap);
  }

  hidingSpots() {
    let all = this.crates.concat(this.lockers);
    return all.filter(h => h.hidable());
  }

  path(start, end, then, grid=this.walkable) {
    this.pathfinder.setGrid(grid);

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

  mask(walkable, indices) {
    let limit = Math.max(walkable.length, walkable[0].length);
    let masked = [];

    for (let row of walkable)
      masked.push(row.slice());
    for (let {x, y} of indices)
      masked[x][y] = 1;

    return masked;
  }

  light(places) {
    this.fog.forEach(r => r.forEach(t => t.alpha = 0.5));
    
    let indices = [];
    for (let {position, visibility} of places)
      indices = indices.concat(this.litIndices(position, visibility));

    for (let {x, y} of indices) {
      let tile = this.fog[x][y];
      tile.alpha = 0.0;
    }

    this.masked = this.mask(this.walkable, indices);
  }

  litIndices(position, radius) {
    let center = Level.tileIndex(position, this.tilemap, this.game.zoom);
    let limit = Math.max(this.tilemap.width, this.tilemap.height);

    let w = {
      start: Math.max(0, center.x - radius - 1),
      end: Math.min(limit, center.x + radius) };
    let h = {
      start: Math.max(0, center.y - radius),
      end: Math.min(limit, center.y + radius + 1) };

    let indices = [];
    for (let x = w.start; x < w.end; x++) {
      for (let y = h.start; y < h.end; y++) {
        let d = Math.floor(
          new Phaser.Point(x - center.x, y - center.y).getMagnitude());
        if (d < radius)
          indices.push({x: x, y: y});
      }
    }
    return indices;
  }

  static tileIndex(point, tilemap, zoom) {
    const {width, height} = tilemap;
    const {tileWidth, tileHeight} = tilemap;
    return {
      x: Math.max(0, Math.min(width, Math.floor(point.x / (tileWidth * zoom)))),
      y: Math.max(0, Math.min(height, Math.floor(point.y / (tileHeight * zoom))))
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
    let limit = Math.max(tilemap.width, tilemap.height);
    for (let x = 0; x < limit; x++) {
      let row = [];
      for (let y = 0; y < limit; y++) {
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
