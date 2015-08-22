
export class Level {
  constructor(game, name, tilesets) {
    this.game = game;

    this.tilemap = game.add.tilemap(name);
    for (let tileset of tilesets)
      this.tilemap.addTilesetImage(tileset, tileset);

    this.ground = this.tilemap.createLayer('ground');
    this.ground.smoothed = false;
    this.ground.scale = { x: 3, y: 3 };
    this.ground.resizeWorld();

    this.blocked = this.tilemap.createLayer('blocked');
    this.blocked.smoothed = false;
    this.blocked.scale = { x: 3, y: 3 };
  }
};
