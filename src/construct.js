
function spritify(game, component, entity) {
  let {key, body, input, anchor} = component;
  let sprite = game.add.sprite(0, 0, key);
  sprite.type = component.type;
  sprite.smoothed = false;
  sprite.inputEnabled = input;
  sprite.anchor.set(anchor.x, anchor.y);
  sprite.offset = component.offset;
  if (body === true)
    game.physics.enable(sprite, Phaser.Physics.ARCADE);
  if (sprite.inputEnabled)
    sprite.events.onInputDown.add(_ => entity.controller.clicked(), entity.controller);
  return sprite;
}

function pointify(game, component, entity) {
  let point = new Phaser.Point(component.x, component.y);
  point.type = component.type;
  return point;
}

function mapify(game, component, entity) {
  let map = game.add.tilemap(component.name);
  for (let set of component.tilesets)
    map.addTilesetImage(set, set);
  let scale = entity.first('scale');
  let ground = map.createLayer('ground');
  ground.scale = scale;
  ground.smoothed = false;
  let blocked = map.createLayer('blocked');
  blocked.scale = scale;
  blocked.smoothed = false;
  ground.resizeWorld();
  // map.setCollisionBetween(0, Number.MAX_VALUE, true, 'blocked');
  return map;
}

function pulsify(game, component, entity) {
  // let scale = entity.first('scale');
  let sprite = entity.first('sprite');
  let pulsate = game.add.tween(sprite.scale);
  pulsate.to({ x: 3, y: 3 }, 800, Phaser.Easing.Linear.In, false, 0, -1, true);
  component.tween = pulsate;
  return component;
}

export function construct(game, component, entity) {
  const {type} = component;
  if (type === 'sprite')
    return spritify(game, component, entity);
  else if (type === 'scale' || type === 'position')
    return pointify(game, component, entity);
  else if (type === 'tilemap')
    return mapify(game, component, entity);
  else if (type === 'pulsate')
    return pulsify(game, component, entity);
  return component;
}
