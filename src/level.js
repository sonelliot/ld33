import * as EasyStar from 'easystarjs';

export class Level {
  constructor(game, name, tilesets) {
    this.game = game;

    this.tilemap = game.add.tilemap(name);
    for (let tileset of tilesets)
      this.tilemap.addTilesetImage(tileset, tileset);

    for (let name of ['ground', 'blocked', 'walls']) {
      let layer = this.tilemap.createLayer(name);
      layer.smoothed = false;
      layer.setScale(3,3);
      this[name] = layer;
    }

    this.tilemap.setCollisionBetween(1, 100000, true, this.blocked, true);
    this.ground.resizeWorld();

    this.walkable = Level.walkable(this.tilemap, this.blocked);
    this.pathfinder = new EasyStar.js();
    this.pathfinder.setGrid(this.walkable);
    this.pathfinder.setAcceptableTiles([0]);
    this.pathfinder.enableDiagonals();
    // this.pathfinder.enableCornerCutting();
  }

  path(start, end, then) {
    let scale = { x: 3, y: 3 };
    let startIndex = Level.tileIndex(start, this.tilemap, scale);
    let endIndex = Level.tileIndex(end, this.tilemap, scale);
    this.pathfinder.findPath(startIndex.x, startIndex.y, endIndex.x, endIndex.y, path => {
      if (path === null) return then(path);
      let width = this.tilemap.tileWidth * scale.x;
      let height = this.tilemap.tileHeight * scale.y;
      return then(path.map(point => new Phaser.Point(
        (point.x) * width + (width / 2),
        (point.y) * height + (height / 2))));
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
