
export class Level {
  constructor(game, name, tilesets) {
    this.game = game;

    this.tilemap = game.add.tilemap(name);
    for (let tileset of tilesets)
      this.tilemap.addTilesetImage(tileset, tileset);

    this.ground = this.tilemap.createLayer('ground');
    this.ground.smoothed = false;
    this.ground.setScale(3,3);

    this.blocked = this.tilemap.createLayer('blocked');
    this.blocked.smoothed = false;
    this.blocked.setScale(3,3);

    this.tilemap.setCollisionBetween(1, 100000, true, this.blocked, true);
    this.ground.resizeWorld();
  }
};
