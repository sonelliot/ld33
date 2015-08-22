export class System {
  constructor(game, name, types, tick) {
    this.game = game;
    this.name = name;
    this.types = types;
    this.tick = tick;
  }

  valid(entity) {
    let compTypes = entity.types();
    let matches = this.types.filter(t => compTypes.indexOf(t) !== -1);
    return matches.length > 0;
  }

  apply(entity) {
    let delta = this.game.time.physicsElapsed;
    if (!this.valid(entity))
      return entity;
    return this.tick(delta, entity);
  }

  static display(game) {
    return new System(game, 'display', ['sprite'], (delta, entity) => {
      let position = entity.first('position') || { x: 0, y: 0 };
      let scale = entity.first('scale') || { x: 1, y: 1 };
      let sprite = entity.first('sprite');
      sprite.position.set(position.x, position.y);
      sprite.scale.set(scale.x, scale.y);
      return entity;
    });
  }

  static selected(game) {
    return new System(game, 'selected', ['selected'], (delta, entity) => {
      let sprite = entity.first('sprite');
      if (sprite === undefined)
        return entity;

      let selected = entity.first('selected');
      let scale = entity.first('scale');
      if (selected.value === true)
        scale.set(3.5, 3.5);
      else
        scale.set(3.0, 3.0);

      return entity;
    });
  }

  static pulsate(game) {
    return new System(game, 'pulsate', ['pulsate'], (delta, entity) => {
      let pulsate = entity.first('pulsate');
      let {tween} = pulsate;
      if (pulsate.on === true) {
        if (tween.isPaused)
          tween.resume();
        else
          tween.start();
      }
      else {
        tween.pause();
      }
      return entity;
    });
  }
};
